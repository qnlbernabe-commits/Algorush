// Export is a read-only snapshot for the optional Java audit tool.
// Keep malformed values so the Java validator can report them instead of hiding them.
const QUESTION_FIELDS = ["id", "category", "type", "clue", "answer", "acceptedAnswers", "images"];

export function buildQuestionBankExport(rows, exportedAt = new Date().toISOString()) {
    if (!Array.isArray(rows)) throw new Error("The question bank did not return a list. Please retry the export.");
    return {
        schemaVersion: 1,
        source: "Algorush question bank",
        scope: "all-categories",
        exportedAt,
        questions: rows.map(row => {
            if (!row || typeof row !== "object" || Array.isArray(row)) return row;
            const question = {};
            QUESTION_FIELDS.forEach(field => {
                if (Object.hasOwn(row, field)) question[field] = row[field];
            });
            return question;
        })
    };
}
