import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    addDoc,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAHRJ_RW-9MUDAh_lfMsPY9Khzavr25dJo",
    authDomain: "algo-rush.firebaseapp.com",
    projectId: "algo-rush",
    storageBucket: "algo-rush.firebasestorage.app",
    messagingSenderId: "676951459286",
    appId: "1:676951459286:web:e00442df2be8c9e0091077"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Emergency fallback question in case a category has 0 questions in Firestore yet
const FALLBACK_QUESTIONS = [
    {
        category: "Tech & Computer",
        type: "text",
        clue: "A step-by-step set of instructions used to solve a problem or complete a task.",
        answer: "Algorithm"
    }
];

/**
 * Fetches questions for a given category from Firestore.
 * Pass count = null in Admin Portal to fetch all without shuffling.
 */
export async function fetchQuestionsByCategory(category, count = 10) {
    try {
        const qRef = collection(db, "questions");
        const qSnap = await getDocs(query(qRef, where("category", "==", category)));
        const results = [];

        qSnap.forEach((docSnap) => {
            results.push({ id: docSnap.id, ...docSnap.data() });
        });

        if (count === null) {
            return results;
        }

        if (results.length === 0) {
            console.warn(`No questions found in Firestore for "${category}". Using fallback question.`);
            return FALLBACK_QUESTIONS;
        }

        return shuffleAndLimit(results, count);
    } catch (error) {
        console.error("Error fetching questions from Firestore:", error);
        return count === null ? [] : FALLBACK_QUESTIONS;
    }
}

/**
 * Adds a new question to Firestore after checking for duplicates in the same category
 */
export async function addQuestionToFirestore(questionData) {
    const existing = await fetchQuestionsByCategory(questionData.category, null);

    const isDuplicate = existing.some(
        (q) =>
            q.answer.trim().toLowerCase() === questionData.answer.trim().toLowerCase() &&
            q.type === questionData.type
    );

    if (isDuplicate) {
        throw new Error(
            `A "${questionData.type}" question with the answer "${questionData.answer}" already exists in ${questionData.category}.`
        );
    }

    const qRef = collection(db, "questions");
    const docRef = await addDoc(qRef, questionData);
    return docRef.id;
}

/**
 * Deletes a question document from Firestore by ID
 */
export async function deleteQuestionFromFirestore(questionId) {
    const docRef = doc(db, "questions", questionId);
    await deleteDoc(docRef);
}

function shuffleAndLimit(arr, limitCount) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, limitCount);
}