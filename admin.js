import { fetchQuestionsByCategory, fetchQuestionBankForExport, addQuestionToFirestore, deleteQuestionFromFirestore } from "./firebase-config.js";
import { validateQuestion } from "./questions.js";
import { buildQuestionBankExport } from "./question-export.js";

let selectedType = "text";
let listRequest = 0;
let savePending = false;
let exportPending = false;
const pendingDeletes = new Set();
const categorySelect = document.getElementById("admin-category");
const form = document.getElementById("admin-question-form");
const fourPicsFields = document.getElementById("admin-4pics-fields");
const questionListEl = document.getElementById("admin-question-list");
const rowTemplate = document.getElementById("tpl-admin-question-row");
let previewRequest = 0;

function initAdmin() {
    document.getElementById("admin-type-group").addEventListener("click", event => {
        const button = event.target.closest(".pill-btn");
        if (!button || savePending) return;
        selectedType = button.dataset.type;
        document.querySelectorAll("#admin-type-group .pill-btn").forEach(item => {
            item.classList.toggle("is-selected", item === button);
            item.setAttribute("aria-pressed", String(item === button));
        });
        const is4Pics = selectedType === "4pics";
        fourPicsFields.classList.toggle("hidden", !is4Pics);
        document.getElementById("admin-image-preview").classList.toggle("hidden", !is4Pics);
        fourPicsFields.querySelectorAll("input").forEach(input => { input.required = is4Pics; });
        const clueInput = document.getElementById("admin-clue");
        if (is4Pics && !clueInput.value) clueInput.value = "4 Pics 1 Word: What single word connects these four images?";
        else if (!is4Pics && clueInput.value.startsWith("4 Pics 1 Word:")) clueInput.value = "";
    });
    categorySelect.addEventListener("change", loadCategoryQuestions);
    form.addEventListener("submit", handleAddQuestion);
    fourPicsFields.querySelectorAll("input").forEach(input => input.addEventListener("change", updateImagePreview));
    document.getElementById("btn-bank-retry").addEventListener("click", loadCategoryQuestions);
    document.getElementById("btn-export-questions").addEventListener("click", exportQuestionBank);
    loadCategoryQuestions();
}

async function exportQuestionBank() {
    if (exportPending) return;
    exportPending = true;
    const button = document.getElementById("btn-export-questions");
    const status = document.getElementById("bank-export-status");
    button.disabled = true;
    button.textContent = "EXPORTING…";
    status.textContent = "Reading a snapshot of every category. Your saved questions are not being changed.";
    let url;
    try {
        const rows = await fetchQuestionBankForExport();
        const bank = buildQuestionBankExport(rows);
        const filename = `algorush-question-bank-${bank.exportedAt.replace(/[:.]/g, "-")}.json`;
        const blob = new Blob([JSON.stringify(bank, null, 2) + "\n"], { type: "application/json;charset=utf-8" });
        url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        try { link.click(); } finally { link.remove(); }
        status.textContent = `Export ready: ${rows.length} question record${rows.length === 1 ? "" : "s"} from all categories. Open the downloaded JSON with the Java validator using the steps in java-tools/README.md.${rows.length === 0 ? " The bank is empty; the validator will report that." : ""}`;
    } catch (error) {
        status.textContent = `Export failed: ${error.message || "The snapshot could not be downloaded."} You can retry Export Questions. Adding questions and playing the game do not require the Java tool.`;
    } finally {
        if (url) setTimeout(() => URL.revokeObjectURL(url), 1000);
        button.disabled = false;
        button.textContent = "EXPORT QUESTIONS";
        exportPending = false;
    }
}

function setSavePending(pending) {
    savePending = pending;
    form.setAttribute("aria-busy", String(pending));
    form.querySelectorAll("input, select, button").forEach(control => { control.disabled = pending; });
    document.querySelectorAll("#admin-type-group button").forEach(control => { control.disabled = pending; });
    const saveButton = document.getElementById("btn-save-question");
    saveButton.textContent = pending ? "SAVING..." : "SAVE QUESTION";
}

async function handleAddQuestion(event) {
    event.preventDefault();
    if (savePending) return;
    const payload = {
        category: categorySelect.value,
        type: selectedType,
        clue: document.getElementById("admin-clue").value,
        answer: document.getElementById("admin-answer").value,
        acceptedAnswers: document.getElementById("admin-aliases").value.split("|").map(value => value.trim()).filter(Boolean)
    };
    if (selectedType === "4pics") payload.images = [1, 2, 3, 4].map(index => document.getElementById(`img-url-${index}`).value.trim());
    let question;
    try { question = validateQuestion(payload); }
    catch (error) {
        showStatus(false, "CHECK YOUR QUESTION", error.message);
        return;
    }
    setSavePending(true);
    showStatus(true, "SAVING QUESTION...", "Checking the bank and saving your question. Please wait.");
    try {
        if (question.type === "4pics") {
            showStatus(true, "CHECKING PICTURES...", "Checking that all four picture URLs can load before saving.");
            await checkPictureUrls(question.images);
        }
        await addQuestionToFirestore(question);
        document.getElementById("admin-answer").value = "";
        document.getElementById("admin-aliases").value = "";
        if (selectedType === "text") document.getElementById("admin-clue").value = "";
        else {
            fourPicsFields.querySelectorAll("input").forEach(input => { input.value = ""; });
            updateImagePreview();
        }
        showStatus(true, "QUESTION SAVED!", `Added "${question.answer}" to ${question.category}.`);
        await loadCategoryQuestions();
    } catch (error) {
        showStatus(false, "QUESTION WAS NOT CONFIRMED SAVED", error.message || "The question could not be saved. Please retry.");
    } finally { setSavePending(false); }
}

function checkPictureUrls(urls) {
    return Promise.all(urls.map((url, index) => new Promise((resolve, reject) => {
        const image = new Image();
        const timer = setTimeout(() => finish(false), 5000);
        function finish(loaded) {
            clearTimeout(timer);
            image.onload = image.onerror = null;
            if (loaded) resolve();
            else reject(new Error(`Picture ${index + 1} could not load. Check its URL or choose another image before saving.`));
        }
        image.onload = () => finish(image.naturalWidth > 0);
        image.onerror = () => finish(false);
        image.src = url;
    })));
}

function updateImagePreview() {
    const request = ++previewRequest;
    const preview = document.getElementById("admin-image-preview");
    preview.replaceChildren();
    const urls = [1, 2, 3, 4].map(index => document.getElementById(`img-url-${index}`).value.trim());
    const message = document.createElement("p");
    message.className = "section-subtitle";
    message.textContent = "Add four direct HTTP(S) image URLs. Pictures are checked again before saving.";
    preview.appendChild(message);
    if (!urls.every(url => { try { return /^https?:$/.test(new URL(url).protocol); } catch { return false; } })) return;
    const grid = document.createElement("div");
    grid.className = "four-pics-grid";
    urls.forEach((url, index) => {
        const image = document.createElement("img");
        image.className = "pic-tile";
        image.alt = `Preview picture ${index + 1}`;
        image.onerror = () => { if (request === previewRequest) message.textContent = `Picture ${index + 1} could not load. Replace the URL before saving.`; };
        image.src = url;
        grid.appendChild(image);
    });
    preview.appendChild(grid);
}

function listMessage(text) {
    questionListEl.replaceChildren();
    const paragraph = document.createElement("p");
    paragraph.className = "section-subtitle";
    paragraph.textContent = text;
    questionListEl.appendChild(paragraph);
}

async function loadCategoryQuestions() {
    const request = ++listRequest;
    const category = categorySelect.value;
    const retryButton = document.getElementById("btn-bank-retry");
    document.getElementById("bank-list-title").textContent = `EXISTING QUESTIONS (${category.toUpperCase()})`;
    document.getElementById("bank-count-badge").textContent = "LOADING...";
    questionListEl.setAttribute("aria-busy", "true");
    retryButton.disabled = true;
    listMessage(`Loading ${category} questions...`);
    try {
        const questions = await fetchQuestionsByCategory(category, null);
        if (request !== listRequest) return;
        const skipped = questions.skippedCount || 0;
        document.getElementById("bank-count-badge").textContent = `${questions.length} PLAYABLE${skipped ? ` · ${skipped} INVALID` : ""}`;
        questionListEl.replaceChildren();
        questions.forEach(question => renderQuestionRow(question, category));
        (questions.issues || []).forEach(issue => {
            renderQuestionRow({ id: issue.id, answer: "INVALID QUESTION — NOT USED IN GAMES", clue: issue.message, type: "invalid" }, category);
        });
        if (!questions.length && !skipped) listMessage(`No questions in ${category} yet. Add one above, or choose a different category.`);
        if (skipped) showStatus(false, "QUESTION HEALTH CHECK", `${skipped} invalid question${skipped === 1 ? " is" : "s are"} excluded from games. Remove those entries and add corrected versions.`);
    } catch (error) {
        if (request !== listRequest) return;
        document.getElementById("bank-count-badge").textContent = "NOT LOADED";
        listMessage("The question list could not load. Use RETRY LIST to try again.");
        showStatus(false, "BANK NOT LOADED", error.message || "Check your connection and retry.");
    } finally {
        if (request === listRequest) {
            questionListEl.setAttribute("aria-busy", "false");
            retryButton.disabled = false;
        }
    }
}

function renderQuestionRow(question, category) {
    const clone = rowTemplate.content.cloneNode(true);
    clone.querySelector(".admin-q-type").textContent = question.type === "4pics" ? "4 PICS" : question.type === "invalid" ? "INVALID" : "TRIVIA";
    clone.querySelector(".admin-q-answer").textContent = question.answer;
    clone.querySelector(".admin-q-clue").textContent = question.clue;
    const deleteButton = clone.querySelector(".btn-delete-q");
    deleteButton.disabled = !question.id || pendingDeletes.has(question.id);
    deleteButton.setAttribute("aria-label", `Delete ${question.answer}`);
    deleteButton.addEventListener("click", async () => {
        if (!question.id || pendingDeletes.has(question.id)) return;
        pendingDeletes.add(question.id);
        deleteButton.disabled = true;
        deleteButton.textContent = "DELETING...";
        try {
            await deleteQuestionFromFirestore(question.id);
            pendingDeletes.delete(question.id);
            showStatus(true, "QUESTION DELETED", `Removed "${question.answer}" from ${category}.`);
            await loadCategoryQuestions();
        } catch (error) {
            showStatus(false, "DELETE NOT CONFIRMED", error.message || "The question could not be deleted. Retry after refreshing the list.");
        } finally {
            pendingDeletes.delete(question.id);
            deleteButton.disabled = false;
            deleteButton.textContent = "DELETE";
        }
    });
    questionListEl.appendChild(clone);
}

function showStatus(isSuccess, title, message) {
    const banner = document.getElementById("admin-status-banner");
    banner.classList.remove("hidden", "banner--correct", "banner--wrong");
    banner.classList.add(isSuccess ? "banner--correct" : "banner--wrong");
    document.getElementById("admin-status-icon").textContent = isSuccess ? "✓" : "✕";
    document.getElementById("admin-status-title").textContent = title;
    document.getElementById("admin-status-msg").textContent = message;
}

initAdmin();
