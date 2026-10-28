export const QUESTION_CATEGORIES = [
    "Tech & Computer", "Science", "Animals", "Movies & TV",
    "Sports", "Food & Drinks", "Geography", "General Knowledge"
];

// Keep punctuation: C and C++ must remain different answers.
export function normalizeAnswer(value) {
    return typeof value === "string"
        ? value.normalize("NFKC").trim().replace(/\s+/gu, " ").toLocaleLowerCase("en-US")
        : "";
}

function cleanText(value, maximum) {
    return typeof value === "string" ? value.normalize("NFKC").trim().slice(0, maximum) : "";
}

export function validateQuestion(input, category = null) {
    if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("A question must be an object.");
    const questionCategory = cleanText(input.category, 80);
    if (!QUESTION_CATEGORIES.includes(questionCategory) || (category && questionCategory !== category)) {
        throw new Error("Choose a supported category for this question.");
    }
    if (input.type !== "text" && input.type !== "4pics") throw new Error("Choose a supported question format.");
    const answer = cleanText(input.answer, 120), clue = cleanText(input.clue, 600);
    if (!answer || !clue) throw new Error("The answer and clue must contain text, not just spaces.");
    if (input.answer.trim().length > 120) throw new Error("Keep the answer within 120 characters.");
    if (input.clue.trim().length > 600) throw new Error("Keep the clue within 600 characters.");
    const aliasInput = Array.isArray(input.acceptedAnswers) ? input.acceptedAnswers : [];
    const aliases = aliasInput.filter(value => typeof value === "string" && value.trim() && value.trim().length <= 120).slice(0, 12);
    const acceptedAnswers = [...new Set([answer, ...aliases].map(normalizeAnswer).filter(Boolean))];
    const question = { category: questionCategory, type: input.type, clue, answer, acceptedAnswers };
    if (typeof input.id === "string" && input.id && !input.id.includes("/")) question.id = input.id;
    if (input.type === "4pics") {
        if (!Array.isArray(input.images) || input.images.length !== 4) throw new Error("A picture puzzle needs exactly four image URLs.");
        question.images = input.images.map(value => {
            if (typeof value !== "string" || value.length > 2048) throw new Error("Use a valid HTTP or HTTPS URL for every picture.");
            const url = new URL(value.trim());
            if (!/^https?:$/.test(url.protocol) || url.username || url.password) throw new Error("Use a valid HTTP or HTTPS URL for every picture.");
            return url.href;
        });
    }
    return question;
}

export function validateQuestions(input, category = null) {
    const questions = [], issues = [];
    if (!Array.isArray(input)) input = [];
    input.forEach((question, index) => {
        try { questions.push(validateQuestion(question, category)); }
        catch (error) { issues.push({ index, id: typeof question?.id === "string" ? question.id : null, message: error.message }); }
    });
    Object.defineProperties(questions, {
        skippedCount: { value: issues.length, enumerable: false },
        issues: { value: issues, enumerable: false }
    });
    return questions;
}

// A small local practice bank. Never substituted for live questions silently.
const PRACTICE = {
    "Tech & Computer": [
        ["A step-by-step procedure for solving a problem.", "Algorithm"],
        ["A data structure in which the last item added is the first removed.", "Stack"],
        ["A data structure in which the first item added is the first removed.", "Queue"],
        ["The two-digit number system used by computers.", "Binary"],
        ["A program that translates source code into another language before execution.", "Compiler"],
        ["A collection of connected nodes and edges.", "Graph"]
    ],
    Science: [
        ["The force that attracts objects with mass toward one another.", "Gravity"],
        ["The process plants use to turn light into chemical energy.", "Photosynthesis"],
        ["The chemical element with the symbol O.", "Oxygen"],
        ["The smallest unit of an element that retains that element's identity.", "Atom"],
        ["The change of a liquid into gas at its surface.", "Evaporation"],
        ["The planet known as the Red Planet.", "Mars"]
    ],
    Animals: [
        ["The largest living land animal.", "African elephant", "Elephant"],
        ["A flightless bird native to Antarctica that is an excellent swimmer.", "Penguin"],
        ["A mammal that can fly using its own powered flight.", "Bat"],
        ["The animal known for a long neck and a spotted coat.", "Giraffe"],
        ["An eight-armed marine animal with a soft body.", "Octopus"],
        ["The black-and-white bear that mainly eats bamboo.", "Giant panda", "Panda"]
    ],
    "Movies & TV": [
        ["The cowboy toy voiced by Tom Hanks in Toy Story.", "Woody"],
        ["The young lion who becomes king in The Lion King.", "Simba"],
        ["The school of witchcraft and wizardry attended by Harry Potter.", "Hogwarts"],
        ["The green ogre whose best friend is Donkey.", "Shrek"],
        ["The snowman who dreams of summer in Frozen.", "Olaf"],
        ["The yellow sea sponge who lives in a pineapple under the sea.", "SpongeBob SquarePants", "SpongeBob"]
    ],
    Sports: [
        ["The sport played with a racket, a shuttlecock, and a net.", "Badminton"],
        ["The sport in which a team has five players on court and scores through a hoop.", "Basketball"],
        ["The sport played at Wimbledon.", "Tennis"],
        ["The sport whose long-course races use a 50-meter pool.", "Swimming"],
        ["The board game whose goal is to checkmate the opposing king.", "Chess"],
        ["The sport played with a bat, bases, and nine fielders per team.", "Baseball"]
    ],
    "Food & Drinks": [
        ["The main grain used to make traditional sushi.", "Rice"],
        ["A hot drink brewed from roasted beans.", "Coffee"],
        ["The sweet substance made by honeybees.", "Honey"],
        ["The yellow tropical fruit with a peel, often associated with monkeys.", "Banana"],
        ["The Italian dish of dough topped with sauce and cheese, baked in an oven.", "Pizza"],
        ["The cocoa-based sweet commonly sold in bars.", "Chocolate"]
    ],
    Geography: [
        ["The capital city of Japan.", "Tokyo"],
        ["The largest ocean on Earth.", "Pacific Ocean", "Pacific"],
        ["The continent on which Egypt is located.", "Africa"],
        ["The country whose capital is Canberra.", "Australia"],
        ["The mountain range containing Mount Everest.", "Himalayas", "The Himalayas"],
        ["The capital city of the Philippines.", "Manila"]
    ],
    "General Knowledge": [
        ["How many sides does a hexagon have?", "Six", "6"],
        ["The instrument used to measure temperature.", "Thermometer"],
        ["The number of days in a leap year.", "366", "Three hundred sixty-six", "Three hundred and sixty-six"],
        ["The primary language spoken in Brazil.", "Portuguese"],
        ["The shape of a standard stop sign.", "Octagon"],
        ["The month immediately after September.", "October"]
    ]
};

export function getPracticeQuestions(category, count = 10) {
    if (!QUESTION_CATEGORIES.includes(category)) throw new Error("Choose a supported practice category.");
    const questions = PRACTICE[category].map(([clue, answer, ...acceptedAnswers], index) => ({
        id: `practice-${QUESTION_CATEGORIES.indexOf(category)}-${index}`,
        category, type: "text", clue, answer, acceptedAnswers
    }));
    const valid = validateQuestions(questions, category);
    for (let index = valid.length - 1; index > 0; index--) {
        const other = Math.floor(Math.random() * (index + 1));
        [valid[index], valid[other]] = [valid[other], valid[index]];
    }
    return valid.slice(0, Number.isInteger(count) && count > 0 ? count : 10);
}
