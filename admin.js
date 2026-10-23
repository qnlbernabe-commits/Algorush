import {
    fetchQuestionsByCategory,
    addQuestionToFirestore,
    deleteQuestionFromFirestore
} from "./firebase-config.js";

let selectedType = "text";

const categorySelect = document.getElementById("admin-category");
const form = document.getElementById("admin-question-form");
const fourPicsFields = document.getElementById("admin-4pics-fields");
const questionListEl = document.getElementById("admin-question-list");
const rowTemplate = document.getElementById("tpl-admin-question-row");

function initAdmin() {
    document.getElementById("admin-type-group").addEventListener("click", (e) => {
        const btn = e.target.closest(".pill-btn");
        if (!btn) return;

        selectedType = btn.dataset.type;
        document.querySelectorAll("#admin-type-group .pill-btn").forEach((b) =>
            b.classList.toggle("is-selected", b === btn)
        );

        const is4Pics = selectedType === "4pics";
        fourPicsFields.classList.toggle("hidden", !is4Pics);

        fourPicsFields.querySelectorAll("input").forEach((inp) => {
            inp.required = is4Pics;
        });

        const clueInput = document.getElementById("admin-clue");
        if (is4Pics && !clueInput.value) {
            clueInput.value = "4 Pics 1 Word: What single word connects these four images?";
        } else if (!is4Pics && clueInput.value.startsWith("4 Pics 1 Word:")) {
            clueInput.value = "";
        }
    });

    categorySelect.addEventListener("change", loadCategoryQuestions);
    form.addEventListener("submit", handleAddQuestion);

    loadCategoryQuestions();
}

async function handleAddQuestion(e) {
    e.preventDefault();
    const saveBtn = document.getElementById("btn-save-question");
    saveBtn.disabled = true;
    saveBtn.textContent = "SAVING...";

    const category = categorySelect.value;
    const answer = document.getElementById("admin-answer").value.trim();
    const clue = document.getElementById("admin-clue").value.trim();

    const payload = {
        category,
        type: selectedType,
        clue,
        answer
    };

    if (selectedType === "4pics") {
        payload.images = [
            document.getElementById("img-url-1").value.trim(),
            document.getElementById("img-url-2").value.trim(),
            document.getElementById("img-url-3").value.trim(),
            document.getElementById("img-url-4").value.trim()
        ];
    }

    try {
        await addQuestionToFirestore(payload);
        showStatus(true, "QUESTION SAVED!", `Added "${answer}" to ${category}.`);

        document.getElementById("admin-answer").value = "";
        if (selectedType === "text") {
            document.getElementById("admin-clue").value = "";
        } else {
            fourPicsFields.querySelectorAll("input").forEach((inp) => (inp.value = ""));
        }

        await loadCategoryQuestions();
    } catch (err) {
        showStatus(false, "DUPLICATE OR ERROR", err.message);
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = "SAVE QUESTION";
    }
}

async function loadCategoryQuestions() {
    const category = categorySelect.value;
    document.getElementById("bank-list-title").textContent =
        `EXISTING QUESTIONS (${category.toUpperCase()})`;

    const questions = await fetchQuestionsByCategory(category, null);
    document.getElementById("bank-count-badge").textContent =
        `${questions.length} ${questions.length === 1 ? "QUESTION" : "QUESTIONS"}`;

    questionListEl.replaceChildren();

    questions.forEach((q) => {
        const clone = rowTemplate.content.cloneNode(true);
        clone.querySelector(".admin-q-type").textContent =
            q.type === "4pics" ? "4 PICS" : "TRIVIA";
        clone.querySelector(".admin-q-answer").textContent = q.answer;
        clone.querySelector(".admin-q-clue").textContent = q.clue;

        const delBtn = clone.querySelector(".btn-delete-q");
        delBtn.addEventListener("click", async () => {
            await deleteQuestionFromFirestore(q.id);
            await loadCategoryQuestions();
        });

        questionListEl.appendChild(clone);
    });
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