import { QUESTION_CATEGORIES, validateQuestion, validateQuestions, normalizeAnswer, getPracticeQuestions } from "./questions.js";
export { validateQuestions, normalizeAnswer, getPracticeQuestions };

const firebaseConfig = {
    apiKey: "AIzaSyAHRJ_RW-9MUDAh_lfMsPY9Khzavr25dJo",
    authDomain: "algo-rush.firebaseapp.com",
    projectId: "algo-rush",
    storageBucket: "algo-rush.firebasestorage.app",
    messagingSenderId: "676951459286",
    appId: "1:676951459286:web:e00442df2be8c9e0091077"
};

const NETWORK_TIMEOUT_MS = 8000;
let sdkPromise = null;
export let db = null;

export class QuestionBankError extends Error {
    constructor(code, message, cause) {
        super(message, cause ? { cause } : undefined);
        this.name = "QuestionBankError";
        this.code = code;
    }
}

function withTimeout(promise, message) {
    let timer;
    return Promise.race([
        promise,
        new Promise((_, reject) => { timer = setTimeout(() => reject(new QuestionBankError("timeout", message)), NETWORK_TIMEOUT_MS); })
    ]).finally(() => clearTimeout(timer));
}

// The local shell and practice bank load even if the remote SDK cannot connect.
async function getSdk() {
    if (!sdkPromise) {
        sdkPromise = withTimeout(Promise.all([
            import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"),
            import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js")
        ]).then(([appSdk, firestore]) => {
            const app = appSdk.getApps().length ? appSdk.getApp() : appSdk.initializeApp(firebaseConfig);
            db = firestore.getFirestore(app);
            return firestore;
        }), "The question service took too long to connect. Retry, or choose local practice.")
            .catch(error => {
                sdkPromise = null;
                if (error instanceof QuestionBankError) throw error;
                throw new QuestionBankError("unavailable", "The online question bank could not connect. Check your connection, retry, or choose local practice.", error);
            });
    }
    return sdkPromise;
}

function requireCategory(category) {
    if (!QUESTION_CATEGORIES.includes(category)) throw new QuestionBankError("invalid-category", "Choose a supported question category.");
}

function bankError(error, operation) {
    if (error instanceof QuestionBankError) return error;
    const denied = /permission|unauthenticated/i.test(String(error?.code || ""));
    return new QuestionBankError(denied ? "permission-denied" : "unavailable", denied
        ? `The question bank did not allow this ${operation}. Ask the project owner to check the deployed access rules.`
        : `The question bank could not ${operation}. Check your connection and retry.`, error);
}

/** Gameplay rejects empty banks. Admin (count=null) may show a genuinely empty bank. */
export async function fetchQuestionsByCategory(category, count = 10) {
    requireCategory(category);
    if (count !== null && (!Number.isInteger(count) || count <= 0)) throw new QuestionBankError("invalid-count", "Choose a valid number of rounds.");
    try {
        const sdk = await getSdk();
        const snapshot = await withTimeout(sdk.getDocs(sdk.query(sdk.collection(db, "questions"), sdk.where("category", "==", category))),
            "Loading questions took too long. Retry, or choose local practice.");
        const rows = [];
        snapshot.forEach(document => { rows.push({ ...document.data(), id: document.id }); });
        const valid = validateQuestions(rows, category);
        if (count !== null && valid.length === 0) {
            throw new QuestionBankError("empty-bank", `No playable ${category} questions are available${valid.skippedCount ? ` (${valid.skippedCount} invalid question${valid.skippedCount === 1 ? " was" : "s were"} skipped)` : ""}. Choose another category or local practice.`);
        }
        if (count === null) return valid;
        const shuffled = [...valid];
        for (let index = shuffled.length - 1; index > 0; index--) {
            const other = Math.floor(Math.random() * (index + 1));
            [shuffled[index], shuffled[other]] = [shuffled[other], shuffled[index]];
        }
        const selected = shuffled.slice(0, count);
        Object.defineProperties(selected, {
            availableCount: { value: valid.length, enumerable: false },
            skippedCount: { value: valid.skippedCount, enumerable: false },
            issues: { value: valid.issues, enumerable: false }
        });
        return selected;
    } catch (error) { throw bankError(error, "load questions"); }
}

/** A read-only full snapshot. Raw invalid records are retained for the Java audit. */
export async function fetchQuestionBankForExport() {
    try {
        const sdk = await getSdk();
        const snapshot = await withTimeout(sdk.getDocs(sdk.collection(db, "questions")),
            "Export took too long. Your question bank was not changed; try Export Questions again.");
        const rows = [];
        snapshot.forEach(document => { rows.push({ ...document.data(), id: document.id }); });
        return rows;
    } catch (error) { throw bankError(error, "export questions"); }
}

/** This client uses a transaction-protected ID for category/type/canonical-answer uniqueness. */
export async function addQuestionToFirestore(input) {
    let question;
    try { question = validateQuestion(input); }
    catch (error) { throw new QuestionBankError("invalid-question", error.message, error); }
    delete question.id;
    try {
        // Fail closed on lookup errors; validateQuestions tolerates malformed legacy rows.
        const existing = await fetchQuestionsByCategory(question.category, null);
        const canonical = normalizeAnswer(question.answer);
        if (existing.some(row => row.type === question.type && normalizeAnswer(row.answer) === canonical)) {
            throw new QuestionBankError("duplicate", `A ${question.type === "4pics" ? "picture" : "trivia"} question answered "${question.answer}" already exists in ${question.category}.`);
        }
        if (!globalThis.crypto?.subtle) throw new QuestionBankError("unsupported", "Saving needs a secure browser context (HTTPS or localhost).");
        const uniqueKey = JSON.stringify([question.category, question.type, canonical]);
        const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(uniqueKey));
        const documentId = "q-" + [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, "0")).join("");
        const sdk = await getSdk();
        const reference = sdk.doc(db, "questions", documentId);
        // A timeout cannot cancel a server write. Retrying uses the same ID.
        await withTimeout(sdk.runTransaction(db, async transaction => {
            const snapshot = await transaction.get(reference);
            if (snapshot.exists()) throw new QuestionBankError("duplicate", "That question was already saved. Refresh the list before trying again.");
            transaction.set(reference, question);
        }), "Save is taking longer than expected. It may still complete; refresh the list before retrying.");
        return documentId;
    } catch (error) { throw bankError(error, "save this question"); }
}

export async function deleteQuestionFromFirestore(questionId) {
    if (typeof questionId !== "string" || !questionId || questionId.includes("/")) throw new QuestionBankError("invalid-id", "This question has no valid ID. Refresh the list.");
    try {
        const sdk = await getSdk();
        await withTimeout(sdk.deleteDoc(sdk.doc(db, "questions", questionId)),
            "Delete is taking longer than expected. Refresh the list to check whether it completed.");
    } catch (error) { throw bankError(error, "delete this question"); }
}
