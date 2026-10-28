import { fetchQuestionsByCategory, validateQuestions, normalizeAnswer, getPracticeQuestions } from "./firebase-config.js";
import { renderCelebration } from "./celebration.js";
import { sfx } from "./audio.js";

// Complete 8-Category Theme Worlds: Icons, Floating Background Stickers, Colors & Volt Mascot Costumes
const CATEGORIES = [
    {
        name: "Tech & Computer",
        hostTag: "VOLT // CYBER HOST",
        kicker: "CYBER STAGE",
        quip: "Binary brains at the ready! Watch out for syntax traps and logic puzzles.",
        accent: "#38BDF8",
        glow1: "rgba(56, 189, 248, 0.22)",
        glow2: "rgba(255, 212, 71, 0.14)",
        floaterColor: "rgba(56, 189, 248, 0.14)",
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/><polyline points="9 8 6 10.5 9 13"/><polyline points="15 8 18 10.5 15 13"/></svg>`,
        mascotProp: `
            <rect x="28" y="51" width="64" height="16" rx="5" fill="#38BDF8" stroke="#100D12" stroke-width="3"/>
            <line x1="34" y1="56" x2="54" y2="56" stroke="#FFF8EC" stroke-width="3" stroke-linecap="round"/>
            <line x1="68" y1="56" x2="84" y2="56" stroke="#FFF8EC" stroke-width="3" stroke-linecap="round"/>
        `,
        stickers: [
            `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 14 6 24 16 34"/><polyline points="32 14 42 24 32 34"/><line x1="28" y1="10" x2="20" y2="38"/></svg>`,
            `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3"><rect x="12" y="12" width="24" height="24" rx="4"/><rect x="18" y="18" width="12" height="12" rx="2"/><line x1="24" y1="4" x2="24" y2="12"/><line x1="24" y1="36" x2="24" y2="44"/><line x1="4" y1="24" x2="12" y2="24"/><line x1="36" y1="24" x2="44" y2="24"/></svg>`,
            `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"><path d="M12 8L38 22L25 26L21 39L12 8Z"/></svg>`
        ]
    },
    {
        name: "Science",
        hostTag: "VOLT // LAB CHIEF",
        kicker: "LAB STAGE",
        quip: "Lab goggles strapped! Expect high-voltage chemistry, physics, and biology.",
        accent: "#66E3A4",
        glow1: "rgba(102, 227, 164, 0.22)",
        glow2: "rgba(56, 189, 248, 0.14)",
        floaterColor: "rgba(102, 227, 164, 0.14)",
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v7.31L4.72 18.55A2 2 0 0 0 6.46 21.5h11.08a2 2 0 0 0 1.74-2.95L14 9.31V2"/><line x1="8.5" y1="2" x2="15.5" y2="2"/><line x1="7" y1="15" x2="17" y2="15"/></svg>`,
        mascotProp: `
            <circle cx="43" cy="59" r="11" fill="#123326" stroke="#66E3A4" stroke-width="3.5"/>
            <circle cx="77" cy="59" r="11" fill="#123326" stroke="#66E3A4" stroke-width="3.5"/>
            <line x1="54" y1="59" x2="66" y2="59" stroke="#66E3A4" stroke-width="3.5"/>
            <circle cx="40" cy="56" r="3" fill="#FFF8EC"/>
            <circle cx="74" cy="56" r="3" fill="#FFF8EC"/>
        `,
        stickers: [
            `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3"><circle cx="24" cy="24" r="5"/><ellipse cx="24" cy="24" rx="20" ry="8" transform="rotate(30 24 24)"/><ellipse cx="24" cy="24" rx="20" ry="8" transform="rotate(-30 24 24)"/></svg>`,
            `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6h12M20 6v11L10 36a4 4 0 0 0 3.5 6h21a4 4 0 0 0 3.5-6L28 17V6"/><path d="M14 29h20"/></svg>`,
            `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M14 8c8 8 12 24 20 32M34 8C26 16 22 32 14 40"/><line x1="17" y1="14" x2="31" y2="14"/><line x1="19" y1="24" x2="29" y2="24"/><line x1="17" y1="34" x2="31" y2="34"/></svg>`
        ]
    },
    {
        name: "Animals",
        hostTag: "VOLT // BEAST MODE",
        kicker: "WILD HABITAT",
        quip: "Fastest reflexes in the animal kingdom take the crown on this safari!",
        accent: "#F59E0B",
        glow1: "rgba(245, 158, 11, 0.24)",
        glow2: "rgba(102, 227, 164, 0.16)",
        floaterColor: "rgba(255, 212, 71, 0.15)",
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"/></svg>`,
        mascotProp: `
            <polygon points="20,34 26,8 44,32" fill="#F59E0B" stroke="#100D12" stroke-width="3.5" stroke-linejoin="round"/>
            <polygon points="25,31 28,15 39,30" fill="#FF4D4D"/>
            <polygon points="100,34 94,8 76,32" fill="#F59E0B" stroke="#100D12" stroke-width="3.5" stroke-linejoin="round"/>
            <polygon points="95,31 92,15 81,30" fill="#FF4D4D"/>
        `,
        stickers: [
            `<svg viewBox="0 0 48 48" fill="currentColor"><circle cx="14" cy="16" r="4.5"/><circle cx="24" cy="12" r="4.5"/><circle cx="34" cy="16" r="4.5"/><path d="M24 20c-7 0-12 5-12 10 0 3.5 3 6 6.5 6 2 0 3.8-.8 5.5-.8s3.5.8 5.5.8c3.5 0 6.5-2.5 6.5-6 0-5-5-10-12-10z"/></svg>`,
            `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M38 10C22 10 10 22 10 38c16 0 28-12 28-28Z"/><path d="M10 38L28 20"/></svg>`,
            `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"><path d="M14 18a5 5 0 1 1-4-8 5 5 0 0 1 8 4l12 12a5 5 0 1 1 8 4 5 5 0 0 1-4 8L22 26Z"/></svg>`
        ]
    },
    {
        name: "Movies & TV",
        hostTag: "VOLT // DIRECTOR CUT",
        kicker: "CINEMA STAGE",
        quip: "Lights, camera, BUZZ! Grab your popcorn and flex your cinema knowledge.",
        accent: "#FF4D4D",
        glow1: "rgba(255, 77, 77, 0.24)",
        glow2: "rgba(179, 136, 255, 0.16)",
        floaterColor: "rgba(255, 77, 77, 0.15)",
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="15" rx="2"/><polyline points="17 2 12 7 7 2"/><line x1="2" y1="12" x2="22" y2="12"/></svg>`,
        mascotProp: `
            <rect x="28" y="51" width="28" height="16" rx="3" fill="#FF4D4D" stroke="#100D12" stroke-width="3"/>
            <rect x="64" y="51" width="28" height="16" rx="3" fill="#38BDF8" stroke="#100D12" stroke-width="3"/>
            <line x1="56" y1="58" x2="64" y2="58" stroke="#FFF8EC" stroke-width="3.5"/>
        `,
        stickers: [
            `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"><rect x="6" y="16" width="36" height="24" rx="3"/><path d="M6 16l34-8 2 8-36 0z"/><line x1="16" y1="14" x2="20" y2="22"/><line x1="28" y1="11" x2="32" y2="20"/></svg>`,
            `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3"><circle cx="24" cy="24" r="16"/><circle cx="24" cy="24" r="4"/><circle cx="24" cy="14" r="2.5"/><circle cx="24" cy="34" r="2.5"/><circle cx="14" cy="24" r="2.5"/><circle cx="34" cy="24" r="2.5"/></svg>`,
            `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"><polygon points="24,6 29,17 42,19 33,28 35,40 24,34 13,40 15,28 6,19 19,17"/></svg>`
        ]
    },
    {
        name: "Sports",
        hostTag: "VOLT // VARSITY CAPTAIN",
        kicker: "STADIUM ARENA",
        quip: "Photo-finish buzzer action! Keep your head in the game and beat the clock.",
        accent: "#FFD447",
        glow1: "rgba(255, 212, 71, 0.22)",
        glow2: "rgba(255, 77, 77, 0.16)",
        floaterColor: "rgba(255, 212, 71, 0.15)",
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M4.93 4.93c4.5 4.5 9.64 4.5 14.14 0"/><path d="M4.93 19.07c4.5-4.5 9.64-4.5 14.14 0"/><line x1="2" y1="12" x2="22" y2="12"/></svg>`,
        mascotProp: `
            <rect x="18" y="34" width="84" height="12" rx="4" fill="#FFF8EC" stroke="#100D12" stroke-width="3"/>
            <rect x="18" y="38" width="84" height="4" fill="#FF4D4D"/>
            <circle cx="60" cy="40" r="5" fill="#FFD447" stroke="#100D12" stroke-width="2"/>
        `,
        stickers: [
            `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3"><circle cx="24" cy="24" r="16"/><path d="M12 12c6 6 18 6 24 0"/><path d="M12 36c6-6 18-6 24 0"/><line x1="8" y1="24" x2="40" y2="24"/></svg>`,
            `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"><path d="M14 8h20v12c0 6-4.5 11-10 11s-10-5-10-11V8z"/><path d="M20 31h8v7h-8z"/><path d="M14 38h20"/></svg>`,
            `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M26 6L12 26h12l-4 16 18-20H26l4-16z"/></svg>`
        ]
    },
    {
        name: "Food & Drinks",
        hostTag: "VOLT // HEAD CHEF",
        kicker: "ARCADE DINER",
        quip: "Serving up spicy clues! Buzz in fast before somebody steals your plate.",
        accent: "#FB923C",
        glow1: "rgba(251, 146, 60, 0.24)",
        glow2: "rgba(255, 77, 77, 0.15)",
        floaterColor: "rgba(251, 146, 60, 0.16)",
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>`,
        mascotProp: `
            <path d="M36 32V20C30 20 28 10 38 8C42 2 56 2 60 6C66 2 78 2 82 8C92 10 90 20 84 20V32Z" fill="#FFF8EC" stroke="#100D12" stroke-width="3.5" stroke-linejoin="round"/>
            <rect x="36" y="27" width="48" height="6" fill="#FF4D4D" stroke="#100D12" stroke-width="2.5"/>
        `,
        stickers: [
            `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"><path d="M24 6L8 38c10 4 22 4 32 0L24 6z"/><circle cx="24" cy="24" r="2.5"/><circle cx="20" cy="32" r="2.5"/><circle cx="29" cy="31" r="2.5"/></svg>`,
            `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M14 16h20l-2 24H16L14 16z"/><path d="M12 16h24"/><path d="M24 16V6l6-2"/></svg>`,
            `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M16 8v12c0 3 2 5 5 5v15"/><path d="M12 8v8h8V8"/><path d="M32 8c-4 0-6 4-6 9v6h6v17"/></svg>`
        ]
    },
    {
        name: "Geography",
        hostTag: "VOLT // WORLD EXPLORER",
        kicker: "WORLD TOUR",
        quip: "World tour mode! Capitals, landmarks, and flags across the globe.",
        accent: "#2DD4BF",
        glow1: "rgba(45, 212, 191, 0.22)",
        glow2: "rgba(56, 189, 248, 0.16)",
        floaterColor: "rgba(45, 212, 191, 0.15)",
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
        mascotProp: `
            <ellipse cx="60" cy="32" rx="44" ry="7" fill="#EAB308" stroke="#100D12" stroke-width="3.5"/>
            <path d="M34 32C34 14 86 14 86 32Z" fill="#FACC15" stroke="#100D12" stroke-width="3.5"/>
            <rect x="36" y="25" width="48" height="6" fill="#4B1737" stroke="#100D12" stroke-width="2"/>
        `,
        stickers: [
            `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3"><circle cx="24" cy="24" r="16"/><ellipse cx="24" cy="24" rx="7" ry="16"/><line x1="8" y1="24" x2="40" y2="24"/></svg>`,
            `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"><path d="M24 6c-7.7 0-14 6.3-14 14 0 10.5 14 22 14 22s14-11.5 14-22c0-7.7-6.3-14-14-14z"/><circle cx="24" cy="20" r="4.5"/></svg>`,
            `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"><circle cx="24" cy="24" r="16"/><polygon points="20,20 32,16 28,28 16,32"/></svg>`
        ]
    },
    {
        name: "General Knowledge",
        hostTag: "VOLT // GRANDMASTER",
        kicker: "WILDCARD ARENA",
        quip: "Anything goes! Expect wild trivia, brainteasers, and 4-Pics-1-Word curveballs.",
        accent: "#B388FF",
        glow1: "rgba(179, 136, 255, 0.24)",
        glow2: "rgba(255, 212, 71, 0.16)",
        floaterColor: "rgba(179, 136, 255, 0.16)",
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
        mascotProp: `
            <polygon points="32,32 28,10 46,22 60,6 74,22 92,10 88,32" fill="#FFD447" stroke="#100D12" stroke-width="3.5" stroke-linejoin="round"/>
            <circle cx="60" cy="22" r="3.5" fill="#FF4D4D"/>
            <circle cx="42" cy="25" r="2.5" fill="#38BDF8"/>
            <circle cx="78" cy="25" r="2.5" fill="#66E3A4"/>
        `,
        stickers: [
            `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"><polygon points="24,6 29,17 42,19 33,28 35,40 24,34 13,40 15,28 6,19 19,17"/></svg>`,
            `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M18 34h12M20 40h8M24 8a11 11 0 0 0-7 19.5c1.5 1.3 2 3 2 4.5h10c0-1.5.5-3.2 2-4.5A11 11 0 0 0 24 8z"/></svg>`,
            `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"><polygon points="10,36 6,16 18,24 24,12 30,24 42,16 38,36"/></svg>`
        ]
    }
];

// Character Rig Specs matching Player 1-4 Avatars
const CHARACTER_SPECS = [
    {
        color: "#FF4D4D",
        darkColor: "#B82828",
        shouts: ["I GOT THIS!", "HOLD IT!", "WATCH THIS!"],
        faceMarkup: `
            <circle cx="-12" cy="-5" r="5.5" fill="#100D12"/>
            <circle cx="12" cy="-5" r="5.5" fill="#100D12"/>
            <path d="M-14 10Q0 21 14 10" stroke="#100D12" stroke-width="5" stroke-linecap="round" fill="none"/>
        `
    },
    {
        color: "#FFD447",
        darkColor: "#C89D16",
        shouts: ["STEP ASIDE!", "TOO EASY!", "MY TURN!"],
        faceMarkup: `
            <polygon points="-12,-12 -6,-1 -18,-1" fill="#100D12"/>
            <polygon points="12,-12 18,-1 6,-1" fill="#100D12"/>
            <rect x="-12" y="9" width="24" height="6" rx="3" fill="#100D12"/>
        `
    },
    {
        color: "#66E3A4",
        darkColor: "#2C9F67",
        shouts: ["EUREKA!", "OUTTA MY WAY!", "LOCKED IN!"],
        faceMarkup: `
            <circle cx="-12" cy="-5" r="5.5" fill="#100D12"/>
            <circle cx="12" cy="-5" r="5.5" fill="#100D12"/>
            <path d="M-14 13L-7 8L0 13L7 8L14 13" stroke="#100D12" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        `
    },
    {
        color: "#B388FF",
        darkColor: "#7849CC",
        shouts: ["OBJECTION!", "STAND BACK!", "BINGO!"],
        faceMarkup: `
            <rect x="-19" y="-10" width="12" height="8" rx="2" fill="#100D12"/>
            <rect x="7" y="-10" width="12" height="8" rx="2" fill="#100D12"/>
            <circle cx="0" cy="12" r="6" fill="#100D12"/>
        `
    }
];

const PLAYER_AVATARS = [
    `<svg viewBox="0 0 36 36" fill="none"><rect width="36" height="36" rx="8" fill="#FF4D4D"/><circle cx="13" cy="15" r="3" fill="#100D12"/><circle cx="23" cy="15" r="3" fill="#100D12"/><path d="M12 24Q18 29 24 24" stroke="#100D12" stroke-width="3" stroke-linecap="round"/></svg>`,
    `<svg viewBox="0 0 36 36" fill="none"><rect width="36" height="36" rx="8" fill="#FFD447"/><polygon points="13,12 16,17 10,17" fill="#100D12"/><polygon points="23,12 26,17 20,17" fill="#100D12"/><rect x="12" y="23" width="12" height="4" rx="2" fill="#100D12"/></svg>`,
    `<svg viewBox="0 0 36 36" fill="none"><rect width="36" height="36" rx="8" fill="#66E3A4"/><circle cx="13" cy="15" r="3" fill="#100D12"/><circle cx="23" cy="15" r="3" fill="#100D12"/><path d="M12 25L16 22L20 25L24 22" stroke="#100D12" stroke-width="2.8" stroke-linecap="round"/></svg>`,
    `<svg viewBox="0 0 36 36" fill="none"><rect width="36" height="36" rx="8" fill="#B388FF"/><rect x="9" y="12" width="7" height="5" rx="1" fill="#100D12"/><rect x="20" y="12" width="7" height="5" rx="1" fill="#100D12"/><circle cx="18" cy="24" r="3.5" fill="#100D12"/></svg>`
];

/* ==========================================
   TUNING: SCORING, SPOTLIGHT ROUNDS & ITEMS
   ========================================== */
// Base points are multiplied by this so that spotlight losses and item boosts feel meaningful.
// (Set to 1 to restore the original 3/2/1/1 scoring.)
const POINTS_SCALE = 100;
const ATTEMPT_POINTS = [3, 2, 1, 1].map((n) => n * POINTS_SCALE);

const SPOTLIGHT_CHANCE = 0.25;       // chance that any given round is a Spotlight round
const SPOTLIGHT_MULTIPLIER = 1.5;    // correct = gain x1.5, wrong/timeout = lose x1.5 of the stake

const MAX_ITEMS = 4;                 // inventory cap
const ITEM_DROP_CHANCE = 0.25;       // chance a correct answer also earns a random item (0 = off)
const POINTS_ITEM_MULTIPLIER = 2;
const POINTS_ITEM_CHANCE = 0.3;      // 30% of item rolls are the 2x item; the rest split evenly

const ITEM_ORDER = ["shield", "multiplier", "block", "skip"];
const ITEM_DEFS = {
    shield: { image: "items/shield.svg", name: "SHIELD", desc: "Stops a Spotlight loss; returns on a correct answer" },
    multiplier: { image: "items/2x.svg", name: `${POINTS_ITEM_MULTIPLIER}x POINTS`, desc: "Double this answer's reward; used up on a miss" },
    block: { image: "items/block.svg", name: "BLOCK", desc: "Stop one opponent buzzing next round only" },
    skip: { image: "items/skip.svg", name: "SKIP", desc: "Skip the current question with no penalty" }
};

function freshPlayerExtras() {
    return {
        items: [],
        blockedNextRound: false,
        blockedThisRound: false,
        multiplierArmed: false,
        shieldArmed: false
    };
}

// Builds an <img> for an item (used on player cards and in the item panel).
function createItemImage(itemId, className) {
    const def = ITEM_DEFS[itemId];
    const img = document.createElement("img");
    img.src = def.image;
    img.alt = def.name;
    img.className = className;
    img.draggable = false;
    return img;
}
const HAND_LOCK_SECONDS = 5;
const ANSWER_TIME_SECONDS = 10;      // time to type an answer once someone is on the mic
const RING_CIRCUMFERENCE = 144.5;

const state = {
    mode: "normal",
    matchConfig: null,
    loading: false,
    sessionToken: 0,
    roundToken: 0,
    pendingQuestions: null,
    pendingConfig: null,
    event: "none",
    previousEvent: "none",
    roundMultiplier: 1,
    spotlightTurns: {},
    completedRounds: 0,
    skippedRounds: 0,
    clockDeadline: 0,
    clockType: null,
    revealStage: null,
    revealPlayerIndex: 0,
    revealCleanup: null,
    imageCleanup: null,
    effectTimeouts: new Set(),
    effectFrames: new Set(),
    scoreAnimations: new Set(),
    heldKeys: new Set(),
    selectedCategory: "Tech & Computer",
    roundCount: 10,
    playerCount: 4,
    players: [
        { id: 1, name: "Player 1", key: "A", score: 0, lockedOut: false, justChained: false, justOvertook: false, ...freshPlayerExtras() },
        { id: 2, name: "Player 2", key: "L", score: 0, lockedOut: false, justChained: false, justOvertook: false, ...freshPlayerExtras() },
        { id: 3, name: "Player 3", key: "S", score: 0, lockedOut: false, justChained: false, justOvertook: false, ...freshPlayerExtras() },
        { id: 4, name: "Player 4", key: "K", score: 0, lockedOut: false, justChained: false, justOvertook: false, ...freshPlayerExtras() }
    ],
    rebindTargetPlayerId: null,

    questions: [],
    currentRoundIndex: 0,
    attemptIndex: 0,
    phase: "IDLE",
    activeBuzzerPlayerId: null,
    currentLeaderId: null,
    spotlightPlayerId: null,
    itemToastTimeout: null,
    blockPickerOpen: false,
    timerValue: 0,
    timerMax: HAND_LOCK_SECONDS,
    timerInterval: null,
    roundTransitionTimeout: null,
    cutinTimeout: null,
    confettiFrameId: null
};

const views = {
    prep: document.getElementById("view-prep"),
    game: document.getElementById("view-game"),
    leaderboard: document.getElementById("view-leaderboard")
};

const templates = {
    categoryCard: document.getElementById("tpl-category-card"),
    playerSetup: document.getElementById("tpl-player-setup"),
    playerGameCard: document.getElementById("tpl-player-game-card"),
    fourPicsGrid: document.getElementById("tpl-4pics-grid"),
    leaderboardRow: document.getElementById("tpl-leaderboard-row"),
    flyingPoints: document.getElementById("tpl-flying-points"),
    floatingSticker: document.getElementById("tpl-floating-sticker"),
    burstParticle: document.getElementById("tpl-burst-particle")
};

/* ==========================================
   GENRE THEME WORLD, BURST & MASCOT COSTUMES
   ========================================== */
function applyCategoryWorldTheme(categoryName, triggerCardEl = null) {
    const cat = CATEGORIES.find((c) => c.name === categoryName) || CATEGORIES[0];
    const root = document.documentElement;

    // 1. Shift Ambient Spotlight Colors & Accent Variables
    root.style.setProperty("--theme-glow-1", cat.glow1);
    root.style.setProperty("--theme-glow-2", cat.glow2);
    root.style.setProperty("--theme-floater-color", cat.floaterColor);
    root.style.setProperty("--theme-showcase-accent", cat.accent);

    // 2. Update Floating Background Vector Stickers (12 Staggered Tracks)
    const stage = document.getElementById("theme-floating-stage");
    if (stage && templates.floatingSticker) {
        stage.replaceChildren();
        for (let i = 0; i < 12; i++) {
            const clone = templates.floatingSticker.content.cloneNode(true);
            const floater = clone.querySelector(".theme-floater");
            floater.classList.add(`floater--${i}`);
            floater.innerHTML = cat.stickers[i % cat.stickers.length];
            stage.appendChild(clone);
        }
    }

    // 3. Equip Volt Mascot Hat / Costume Prop in Lobby & Gameplay
    const lobbyProp = document.getElementById("lobby-volt-prop");
    const gameProp = document.getElementById("game-volt-prop");
    if (lobbyProp) lobbyProp.innerHTML = cat.mascotProp;
    if (gameProp) gameProp.innerHTML = cat.mascotProp;

    const hatTag = document.getElementById("lobby-mascot-hat-tag");
    if (hatTag) hatTag.textContent = cat.hostTag;

    const worldPill = document.getElementById("active-world-pill");
    if (worldPill) worldPill.textContent = `WORLD // ${cat.name.toUpperCase()}`;

    // 4. Update Active Deck Showcase Card at Bottom of Category Panel
    const showcaseCard = document.getElementById("active-deck-showcase");
    const emblemBox = document.getElementById("showcase-emblem-box");
    const kickerEl = document.getElementById("showcase-deck-kicker");
    const titleEl = document.getElementById("showcase-deck-title");
    const descEl = document.getElementById("showcase-deck-desc");

    if (showcaseCard && emblemBox) {
        emblemBox.innerHTML = cat.svg;
        kickerEl.textContent = cat.kicker;
        titleEl.textContent = cat.name;
        descEl.textContent = cat.quip;

        showcaseCard.classList.remove("anim-pop-in");
        void showcaseCard.offsetWidth;
        showcaseCard.classList.add("anim-pop-in");
    }

    // 5. Spawn Click Particle Burst if triggered by clicking a card
    if (triggerCardEl) {
        spawnCategoryBurst(triggerCardEl, cat);
    }
}

function spawnCategoryBurst(cardEl, cat) {
    if (!templates.burstParticle) return;
    const rect = cardEl.getBoundingClientRect();
    const originX = rect.left + rect.width / 2 - 14;
    const originY = rect.top + rect.height / 2 - 14;

    const count = 6;
    for (let i = 0; i < count; i++) {
        const clone = templates.burstParticle.content.cloneNode(true);
        const particle = clone.querySelector(".category-burst-particle");
        particle.innerHTML = cat.stickers[i % cat.stickers.length];
        document.body.appendChild(particle);

        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
        const distance = 58 + Math.random() * 38;
        const tx = originX + Math.cos(angle) * distance;
        const ty = originY + Math.sin(angle) * distance - 18;
        const rot = (Math.random() - 0.5) * 90;

        const anim = particle.animate(
            [
                { transform: `translate(${originX}px, ${originY}px) scale(0.3) rotate(0deg)`, opacity: 1 },
                { transform: `translate(${tx}px, ${ty}px) scale(1.1) rotate(${rot}deg)`, opacity: 1, offset: 0.6 },
                { transform: `translate(${tx}px, ${ty + 16}px) scale(0.4) rotate(${rot * 1.4}deg)`, opacity: 0 }
            ],
            {
                duration: 520,
                easing: "cubic-bezier(0.175, 0.885, 0.32, 1.275)"
            }
        );

        anim.onfinish = () => particle.remove();
    }
}

/* ==========================================
   PROCEDURAL RIGGED SVG CUTSCENE BUILDERS
   ========================================== */
function buildAceCutInSVG(playerId) {
    const spec = CHARACTER_SPECS[(playerId - 1) % CHARACTER_SPECS.length];
    return `
        <svg class="cutin-rig-svg" viewBox="0 0 180 180" fill="none">
            <polygon points="95,8 114,48 158,34 132,74 172,102 126,114 142,158 98,132 62,166 68,118 20,112 56,78 30,36 76,52"
                fill="#FFD447" stroke="#100D12" stroke-width="4" opacity="0.9"/>

            <path d="M58 122C58 108 132 108 132 122L142 178H48L58 122Z"
                fill="${spec.darkColor}" stroke="#100D12" stroke-width="5" stroke-linejoin="round"/>

            <g class="cutin-rig-head">
                <rect x="55" y="42" width="80" height="76" rx="18"
                    fill="${spec.color}" stroke="#100D12" stroke-width="5.5"/>
                <g transform="translate(95, 80)">
                    ${spec.faceMarkup}
                </g>
            </g>

            <g class="cutin-rig-arm-raise">
                <path d="M54 128L26 64" stroke="${spec.color}" stroke-width="20" stroke-linecap="round"/>
                <path d="M54 128L26 64" stroke="#100D12" stroke-width="5" stroke-linecap="round"/>
                <g transform="translate(22, 42)">
                    <rect x="-18" y="-16" width="36" height="34" rx="10" fill="#FFF8EC" stroke="#100D12" stroke-width="4.5"/>
                    <rect x="-16" y="-36" width="8" height="24" rx="4" fill="#FFF8EC" stroke="#100D12" stroke-width="3.5"/>
                    <rect x="-7" y="-42" width="8" height="28" rx="4" fill="#FFF8EC" stroke="#100D12" stroke-width="3.5"/>
                    <rect x="2" y="-39" width="8" height="26" rx="4" fill="#FFF8EC" stroke="#100D12" stroke-width="3.5"/>
                    <rect x="11" y="-32" width="8" height="20" rx="4" fill="#FFF8EC" stroke="#100D12" stroke-width="3.5"/>
                    <rect x="14" y="-8" width="15" height="9" rx="4.5" fill="#FFF8EC" stroke="#100D12" stroke-width="3.5"/>
                </g>
                <path d="M-4 22Q18 -2 48 12" stroke="#FFD447" stroke-width="4" stroke-linecap="round" fill="none"/>
            </g>
        </svg>
    `;
}

function triggerAceBuzzerCutIn(player, customShout = null) {
    const overlay = document.getElementById("buzzer-cutin-overlay");
    const stage = document.getElementById("cutin-character-stage");
    const shoutEl = document.getElementById("cutin-shout-text");
    const nameEl = document.getElementById("cutin-player-name");
    const keyEl = document.getElementById("cutin-player-key");

    if (!overlay || !stage) return;

    const spec = CHARACTER_SPECS[(player.id - 1) % CHARACTER_SPECS.length];
    const randomShout = customShout || spec.shouts[Math.floor(Math.random() * spec.shouts.length)];

    stage.innerHTML = buildAceCutInSVG(player.id);
    shoutEl.textContent = randomShout;
    nameEl.textContent = player.name.toUpperCase();
    keyEl.textContent = `KEY [${player.key}]`;

    if (state.cutinTimeout) clearTimeout(state.cutinTimeout);
    overlay.classList.add("hidden");
    void overlay.offsetWidth;
    overlay.classList.remove("hidden");

    state.cutinTimeout = scheduleEffect(() => {
        overlay.classList.add("hidden");
    }, 1050);
}

/* ==========================================
   INITIALIZATION & LOBBY SETUP
   ========================================== */
function init() {
    renderCategories();
    applyCategoryWorldTheme(state.selectedCategory);
    renderPlayerSetupCards();
    updatePrepSummary();
    bindPrepEvents();
    window.addEventListener("keydown", handleGlobalKeydown);
    window.addEventListener("keyup", (e) => state.heldKeys.delete(e.key.toUpperCase()));
    window.addEventListener("blur", () => state.heldKeys.clear());
    window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener?.("change", (e) => {
        if (e.matches) stopConfetti();
    });
}

function setLobbyMascot(mood, message) {
    const widget = document.getElementById("lobby-mascot-widget");
    const textEl = document.getElementById("lobby-mascot-text");
    if (widget) widget.dataset.mood = mood;
    if (textEl) textEl.textContent = message;
}

function setGameMascot(mood, callout) {
    const strip = document.getElementById("game-mascot-strip");
    const calloutEl = document.getElementById("game-mascot-callout");
    if (strip) strip.dataset.mood = mood;
    if (calloutEl) {
        calloutEl.textContent = callout;
        calloutEl.classList.remove("anim-pop-in");
        void calloutEl.offsetWidth;
        calloutEl.classList.add("anim-pop-in");
    }
}

function renderCategories() {
    const grid = document.getElementById("category-grid");
    grid.replaceChildren();

    CATEGORIES.forEach((cat) => {
        const clone = templates.categoryCard.content.cloneNode(true);
        const btn = clone.querySelector(".category-card");
        clone.querySelector(".category-icon").innerHTML = cat.svg;
        clone.querySelector(".category-name").textContent = cat.name;

        const isSelected = cat.name === state.selectedCategory;
        if (isSelected) {
            btn.classList.add("is-selected");
        }
        btn.setAttribute("aria-checked", String(isSelected));

        btn.addEventListener("click", () => {
            if (state.loading) return;
            invalidatePendingMatch();
            sfx.playCategorySelect();
            state.selectedCategory = cat.name;
            renderCategories();
            updatePrepSummary();
            applyCategoryWorldTheme(cat.name, btn);
            setLobbyMascot("excited", cat.quip);
            notify(`${cat.name} selected. ${cat.quip}`);
        });

        grid.appendChild(clone);
    });
}

function renderPlayerSetupCards(animateNewSlots = false) {
    const grid = document.getElementById("player-setup-grid");
    grid.replaceChildren();

    state.players.forEach((player, idx) => {
        const isConfigured = idx < state.playerCount;
        const clone = templates.playerSetup.content.cloneNode(true);
        const card = clone.querySelector(".player-setup-card");
        const avatarEl = clone.querySelector(".player-avatar-badge");
        const slotTag = clone.querySelector(".player-slot-tag");
        const nameInput = clone.querySelector(".player-name-input");
        const keyBtn = clone.querySelector(".keybind-btn");

        card.dataset.playerId = player.id;
        avatarEl.innerHTML = PLAYER_AVATARS[idx % PLAYER_AVATARS.length];

        if (animateNewSlots && isConfigured) {
            card.classList.add("anim-pop-in");
        }

        if (isConfigured) {
            slotTag.textContent = `PLAYER ${player.id} · ACTIVE`;
            nameInput.value = player.name;
            nameInput.disabled = false;
            keyBtn.disabled = false;
            keyBtn.textContent = state.rebindTargetPlayerId === player.id ? "..." : player.key;

            if (state.rebindTargetPlayerId === player.id) {
                keyBtn.classList.add("is-listening");
            }

            nameInput.addEventListener("input", (e) => {
                if (state.loading) return;
                invalidatePendingMatch();
                player.name = e.target.value.trim() || `Player ${player.id}`;
            });

            keyBtn.addEventListener("click", () => {
                if (state.loading) return;
                invalidatePendingMatch();
                sfx.playClick();
                state.rebindTargetPlayerId = player.id;
                setLobbyMascot("excited", `Press any letter or number key for ${player.name}!`);
                notify(`Rebinding ${player.name}: press a free letter/number, or Escape to cancel.`);
                renderPlayerSetupCards();
            });
        } else {
            card.classList.add("is-slot-empty");
            slotTag.textContent = `SLOT ${player.id} · STANDBY`;
            nameInput.value = "Click to join party";
            nameInput.disabled = true;
            keyBtn.textContent = "—";
            keyBtn.disabled = true;

            card.addEventListener("click", () => {
                if (state.loading) return;
                invalidatePendingMatch();
                sfx.playClick();
                state.playerCount = player.id;
                syncPlayerCountPills();
                renderPlayerSetupCards(true);
                updatePrepSummary();
                setLobbyMascot("excited", `Player ${player.id} joined the party!`);
            });
        }

        grid.appendChild(clone);
    });
}

function syncPlayerCountPills() {
    document.querySelectorAll("#player-count-group .pill-btn").forEach((b) => {
        b.classList.toggle("is-selected", Number(b.dataset.players) === state.playerCount);
    });
}

function updatePrepSummary() {
    document.getElementById("prep-summary-text").textContent =
        `${state.mode === "chaos" ? "CHAOS" : "NORMAL"} · ${state.selectedCategory} · ${state.playerCount} players · ${state.roundCount} rounds`;
}

function bindPrepEvents() {
    const soundBtn = document.getElementById("btn-sound-toggle");
    soundBtn.addEventListener("click", () => {
        const muted = sfx.toggleMute();
        soundBtn.setAttribute("aria-pressed", String(muted));
        document.getElementById("icon-sound-on").classList.toggle("hidden", muted);
        document.getElementById("icon-sound-off").classList.toggle("hidden", !muted);
        document.getElementById("sound-toggle-label").textContent = muted ? "MUTED" : "SFX ON";
        notify(muted ? "Sound muted." : "Sound on.", "info");
        if (!muted) sfx.playClick();
    });
    document.getElementById("mode-group").addEventListener("click", (e) => {
        const btn = e.target.closest("[data-mode]");
        if (!btn || state.loading) return;
        invalidatePendingMatch();
        state.mode = btn.dataset.mode === "chaos" ? "chaos" : "normal";
        document.querySelectorAll("#mode-group [data-mode]").forEach((b) => {
            b.classList.toggle("is-selected", b === btn);
            b.setAttribute("aria-pressed", String(b === btn));
        });
        const description = state.mode === "chaos"
            ? "Power-ups and surprise rounds. Spotlight never repeats back to back; everyone gets a chance."
            : "The classic buzzer quiz. No items or random events. Read, buzz, answer, and steal after a miss.";
        document.getElementById("mode-description").textContent = description;
        updatePrepSummary();
        notify(`${state.mode === "chaos" ? "Chaos" : "Normal"} selected. ${description}`);
        sfx.playClick();
    });
    document.getElementById("round-count-group").addEventListener("click", (e) => {
        const btn = e.target.closest(".pill-btn");
        if (!btn || state.loading) return;
        invalidatePendingMatch();
        state.roundCount = Number(btn.dataset.rounds);
        document.querySelectorAll("#round-count-group .pill-btn").forEach((b) => b.classList.toggle("is-selected", b === btn));
        updatePrepSummary();
        notify(`${state.roundCount} rounds selected.`);
        sfx.playClick();
    });
    document.getElementById("player-count-group").addEventListener("click", (e) => {
        const btn = e.target.closest(".pill-btn");
        if (!btn || state.loading) return;
        invalidatePendingMatch();
        state.playerCount = Number(btn.dataset.players);
        syncPlayerCountPills();
        renderPlayerSetupCards(true);
        updatePrepSummary();
        notify(`${state.playerCount} players ready. Each player has a unique buzzer key.`);
        sfx.playClick();
    });
    document.getElementById("btn-quit-game").addEventListener("click", () => {
        returnToMenu();
        state.players.forEach((p, i) => Object.assign(p, { name: `Player ${p.id}`, key: ["A", "L", "S", "K"][i], score: 0 }, freshPlayerExtras()));
        renderPlayerSetupCards();
        notify("Roster and scores reset. Choose your mode and players for a fresh game.", "success");
    });
    document.getElementById("btn-start-game").addEventListener("click", () => startGame());
    document.getElementById("btn-play-again").addEventListener("click", () => startGame({ practice: Boolean(state.matchConfig?.practice) }));
    document.getElementById("btn-retry-load").addEventListener("click", () => startGame());
    document.getElementById("btn-practice-mode").addEventListener("click", () => startGame({ practice: true }));
    document.getElementById("btn-short-match").addEventListener("click", () => {
        if (!state.pendingQuestions || !state.pendingConfig) return;
        const questions = state.pendingQuestions;
        const config = state.pendingConfig;
        state.pendingQuestions = null;
        state.pendingConfig = null;
        beginMatch(questions, config);
    });
    document.getElementById("answer-form").addEventListener("submit", handleAnswerSubmit);
    document.getElementById("btn-back-menu").addEventListener("click", returnToMenu);
    document.getElementById("btn-results-menu").addEventListener("click", returnToMenu);
}

async function startGame(options = {}) {
    if (state.loading) return;
    const activePlayers = state.players.slice(0, state.playerCount);
    const keys = activePlayers.map((p) => p.key);
    if (new Set(keys).size !== keys.length || keys.some((key) => !/^[A-Z0-9]$/.test(key))) {
        notify("Two players share a buzzer key. Rebind them before starting.", "error");
        switchView("prep");
        return;
    }
    const config = Object.freeze({ mode: state.mode, category: state.selectedCategory,
        roundCount: state.roundCount, playerCount: state.playerCount, practice: options.practice === true,
        players: activePlayers.map((p) => Object.freeze({ id: p.id, name: p.name, key: p.key })) });
    const session = ++state.sessionToken;
    stopConfetti();
    clearAllTimers();
    hideItemToast();
    state.loading = true;
    state.phase = "LOADING";
    state.pendingQuestions = null;
    state.pendingConfig = null;
    setLoadActions();
    setLoadingControls(true);
    notify(config.practice ? `Preparing ${config.category} practice questions…` : `Loading ${config.category} questions…`);
    try {
        const fetched = config.practice
            ? getPracticeQuestions(config.category, config.roundCount)
            : await fetchQuestionsByCategory(config.category, config.roundCount);
        if (session !== state.sessionToken) return;
        const questions = validateQuestions(fetched, config.category);
        if (!questions.length) throw new Error("No playable questions are available in this category. Try another category or the practice bank.");
        if (questions.length < config.roundCount) {
            state.pendingQuestions = questions;
            state.pendingConfig = config;
            state.phase = "SHORT_BANK";
            switchView("prep");
            notify(`Only ${questions.length} playable ${config.category} questions are available${config.practice ? " in the local practice bank" : ""}. Start a shorter match, retry, or choose another category.`, "warning");
            setLoadActions({ retry: !config.practice, practice: !config.practice, short: questions.length });
        } else {
            beginMatch(questions, config);
            if (fetched.skippedCount) notify(`${fetched.skippedCount} invalid question(s) were excluded. Your match is ready.`, "warning");
        }
    } catch (error) {
        if (session !== state.sessionToken) return;
        state.phase = "LOAD_ERROR";
        switchView("prep");
        notify(error.message || "Questions could not be loaded. Retry, choose another category, or use local practice.", "error");
        setLoadActions({ retry: true, practice: true });
    } finally {
        if (session === state.sessionToken) {
            state.loading = false;
            setLoadingControls(false);
        }
    }
}

async function loadRound() {
    clearAllTimers();
    const token = ++state.roundToken;
    const currentQ = state.questions[state.currentRoundIndex];
    if (!currentQ) {
        if (state.completedRounds === 0 && state.skippedRounds > 0) {
            returnToMenu();
            state.phase = "LOAD_ERROR";
            notify("No usable questions could be played. No winner or score was recorded. Retry the question bank, choose another category, or play local practice.", "error");
            setLoadActions({ retry: true, practice: true });
        } else showLeaderboard();
        return;
    }
    if (!validateQuestions([currentQ], state.matchConfig?.category || state.selectedCategory).length) {
        skipUnusableQuestion("This question has invalid or missing information.");
        return;
    }
    state.phase = "QUESTION_LOADING";
    state.attemptIndex = 0;
    state.activeBuzzerPlayerId = null;
    state.blockPickerOpen = false;
    hideItemPanel();
    const roundPlayers = state.players.slice(0, state.playerCount);
    roundPlayers.forEach((p) => {
        p.lockedOut = false; p.justChained = false; p.justOvertook = false;
        p.multiplierArmed = false; p.shieldArmed = false;
    });
    const roundNumber = state.currentRoundIndex + 1;
    const totalRounds = state.questions.length;
    document.getElementById("game-category-label").textContent = state.matchConfig?.category || state.selectedCategory;
    document.getElementById("game-round-label").textContent = `ROUND ${String(roundNumber).padStart(2, "0")} / ${String(totalRounds).padStart(2, "0")}`;
    document.getElementById("round-progress-fill").style.width = `${Math.round(roundNumber / totalRounds * 100)}%`;
    document.getElementById("question-type-tag").textContent = currentQ.type === "4pics" ? "4 PICS 1 WORD" : "TRIVIA CLUE";
    document.getElementById("question-text-clue").textContent = currentQ.clue;
    document.getElementById("answer-form").classList.add("hidden");
    document.getElementById("feedback-banner").classList.add("hidden");
    const contentBox = document.getElementById("question-content-box");
    contentBox.classList.remove("anim-question-enter");
    void contentBox.offsetWidth;
    contentBox.classList.add("anim-question-enter");
    const mediaSlot = document.getElementById("question-media-slot");
    mediaSlot.replaceChildren();
    mediaSlot.classList.toggle("hidden", currentQ.type !== "4pics");
    if (currentQ.type === "4pics") {
        notify(`Round ${roundNumber}: checking all four picture clues…`);
        const clone = templates.fourPicsGrid.content.cloneNode(true);
        const images = [...clone.querySelectorAll(".pic-tile")];
        mediaSlot.appendChild(clone);
        const ready = await preloadPictures(images, currentQ.images);
        if (token !== state.roundToken) return;
        if (!ready) { skipUnusableQuestion("A picture clue could not load. This question is skipped with no penalty."); return; }
    }
    if (token !== state.roundToken) return;
    // A broken picture question must not consume a pending Block.
    roundPlayers.forEach((p) => {
        p.blockedThisRound = isChaos() && p.blockedNextRound;
        p.blockedNextRound = false;
    });
    if (roundPlayers.every((p) => p.blockedThisRound)) roundPlayers.forEach((p) => { p.blockedThisRound = false; });
    chooseRoundEvent(roundPlayers);
    const spotlightPlayer = getSpotlightPlayer();
    const tag = document.getElementById("spotlight-tag");
    tag.classList.toggle("hidden", !spotlightPlayer);
    tag.textContent = spotlightPlayer ? `🎯 ${spotlightPlayer.name.toUpperCase()} · SPOTLIGHT · 1.5x STAKES` : "";
    document.getElementById("question-stage-card").classList.toggle("is-spotlight", Boolean(spotlightPlayer));
    const eventTag = document.getElementById("chaos-event-tag");
    eventTag.classList.toggle("hidden", state.event === "none" || state.event === "spotlight");
    eventTag.textContent = state.event === "double" ? "⚡ DOUBLE POINTS · everyone’s correct answers ×2" : state.event === "lucky" ? "🎁 LUCKY DROP · one item for everyone with room" : "";
    const blocked = roundPlayers.filter((p) => p.blockedThisRound).map((p) => p.name);
    const eventMessage = spotlightPlayer ? `${spotlightPlayer.name} is in the Spotlight: +450 for a correct answer, -450 for a miss. The next round returns to open buzzing.`
        : state.event === "double" ? "Double Points! Every correct answer this round earns twice its usual points."
        : state.event === "lucky" ? "Lucky Drop! Everyone with inventory space received an item. Open buzzers this round."
        : "Open buzzer round. Everyone who is eligible can answer.";
    notify(`Round ${roundNumber}/${totalRounds}. ${eventMessage}${blocked.length ? ` ${blocked.join(", ")} blocked for this round only.` : ""}`);
    setGameMascot(spotlightPlayer ? "nervous" : "excited", roundNumber === totalRounds ? "FINAL ROUND — MAKE IT COUNT!" : eventMessage);
    renderGamePlayerCards();
    startHandLockCountdown();
}

function getCountdownInstruction(seconds) {
    const player = getSpotlightPlayer();
    return player ? `🎯 ${player.name}: your exclusive answer opens in ${seconds}s. 1.5x stakes!`
        : `Read the clue. Release your buzzer key; GO in ${seconds}s…`;
}

function startHandLockCountdown(seconds = HAND_LOCK_SECONDS) {
    state.phase = "HAND_COUNTDOWN";
    state.activeBuzzerPlayerId = null;
    const spotlight = getSpotlightPlayer();
    document.getElementById("question-stage-card").classList.remove("is-buzz-open", "anim-shake");
    const pill = document.getElementById("phase-pill-tag");
    pill.textContent = spotlight ? "SPOTLIGHT READY" : "HANDS LOCKED";
    pill.classList.remove("is-open");
    const badge = document.getElementById("stage-countdown-badge");
    badge.classList.remove("hidden", "is-go");
    document.getElementById("buzzer-instruction").classList.remove("is-live");
    document.getElementById("question-hint-tag").textContent = spotlight
        ? "Only the Spotlight player answers. A Shield prevents the loss."
        : "Wait for GO, then make a fresh press. Holding your key does not count.";
    updateAttemptBadge();
    renderGamePlayerCards();
    if (spotlight) { sfx.playSpotlight(); triggerAceBuzzerCutIn(spotlight, "YOU'RE PICKED!"); }
    startClock(seconds, "read", (remaining) => {
        badge.textContent = remaining;
        document.getElementById("buzzer-instruction").textContent = getCountdownInstruction(remaining);
        if (remaining > 0) sfx.playCountdownTick();
    }, () => {
        sfx.playBuzzOpen();
        badge.textContent = spotlight ? "GO!" : "GO! BUZZ IN!";
        badge.classList.add("is-go");
        if (spotlight) openSpotlightWindow(spotlight); else openBuzzerWindow();
    });
}

function openBuzzerWindow() {
    state.phase = "BUZZ_OPEN";
    document.getElementById("question-stage-card").classList.add("is-buzz-open");
    const pill = document.getElementById("phase-pill-tag");
    pill.textContent = "BUZZERS LIVE";
    pill.classList.add("is-open");
    document.getElementById("buzzer-instruction").textContent = "GO! Make a fresh press on your buzzer key.";
    document.getElementById("buzzer-instruction").classList.add("is-live");
    document.getElementById("question-hint-tag").textContent = "First buzzer gets a fresh 10 seconds to answer.";
    startClock(10, "buzz", null, handleRoundTimeout);
}

function openSpotlightWindow(player) {
    state.phase = "BUZZ_OPEN";
    document.getElementById("question-stage-card").classList.add("is-buzz-open");
    document.getElementById("phase-pill-tag").textContent = "SPOTLIGHT LIVE";
    document.getElementById("phase-pill-tag").classList.add("is-open");
    document.getElementById("buzzer-instruction").textContent = `${player.name} is in the Spotlight!`;
    triggerPlayerBuzzIn(player, { spotlight: true });
}

function startAnswerClock() {
    startClock(ANSWER_TIME_SECONDS, "answer", (remaining) => {
        if (remaining <= 3 && remaining > 0) {
            sfx.playFinalSecondsTick();
            setGameMascot("nervous", `${remaining} SECONDS — LOCK YOUR ANSWER!`);
        }
    }, handleRoundTimeout);
}

function handleGlobalKeydown(e) {
    const key = e.key.toUpperCase();
    if (e.repeat || state.heldKeys.has(key)) return;
    state.heldKeys.add(key);
    if (state.phase === "ITEM_REVEAL" || state.loading || e.ctrlKey || e.metaKey) return;
    if (state.rebindTargetPlayerId !== null) {
        e.preventDefault();
        if (key === "ESCAPE") {
            state.rebindTargetPlayerId = null;
            renderPlayerSetupCards();
            notify("Rebinding canceled.");
        } else if (/^[A-Z0-9]$/.test(key)) {
            const duplicate = state.players.some((p) => p.key === key && p.id !== state.rebindTargetPlayerId);
            if (duplicate) {
                notify(`Key ${key} belongs to another player, including standby slots. Choose another key or press Escape.`, "warning");
                sfx.playWrong();
            } else {
                const player = state.players.find((p) => p.id === state.rebindTargetPlayerId);
                player.key = key;
                state.rebindTargetPlayerId = null;
                renderPlayerSetupCards();
                notify(`${player.name}'s buzzer is now [${key}].`, "success");
                sfx.playRaiseHand();
            }
        }
        return;
    }
    if (state.phase === "ANSWERING" && isChaos()) {
        const player = state.players.find((p) => p.id === state.activeBuzzerPlayerId);
        if (state.blockPickerOpen) {
            if (key === "ESCAPE") {
                e.preventDefault(); state.blockPickerOpen = false; renderItemPanel(player);
                document.getElementById("answer-input").focus(); notify("Block selection canceled. Your item was kept.");
            } else {
                const target = getBlockTargets(player).find((p) => p.key === key);
                if (target) { e.preventDefault(); useItem(player, "block", target.id); }
            }
            return;
        }
        if (e.altKey && /^[1-4]$/.test(key)) {
            e.preventDefault(); useItem(player, ITEM_ORDER[Number(key) - 1]); return;
        }
    }
    if (e.altKey || e.target.closest?.("input, select, textarea, [contenteditable='true']")) return;
    const player = state.players.slice(0, state.playerCount).find((p) => p.key === key);
    if (!player) return;
    if (["IDLE", "LOAD_ERROR", "SHORT_BANK"].includes(state.phase) && !views.prep.classList.contains("hidden")) {
        triggerAceBuzzerCutIn(player, "READY TO ROLL!");
        sfx.playRaiseHand(); notify(`${player.name}: [${key}] works!`, "success"); return;
    }
    if (state.phase === "HAND_COUNTDOWN") {
        notify(`${player.name}, too early! Release [${key}] and press again after GO.`, "warning"); return;
    }
    if (state.phase !== "BUZZ_OPEN") return;
    if (performance.now() >= state.clockDeadline) { handleRoundTimeout(); return; }
    if (player.blockedThisRound || player.lockedOut) {
        notify(`${player.name} is ${player.blockedThisRound ? "blocked this round" : "locked out after a miss"}. The next question resets this.`, "warning"); return;
    }
    e.preventDefault(); triggerPlayerBuzzIn(player);
}

function triggerPlayerBuzzIn(player, { spotlight = false } = {}) {
    if (state.phase !== "BUZZ_OPEN" || player.lockedOut || player.blockedThisRound) return;
    state.phase = "ANSWERING";
    state.activeBuzzerPlayerId = player.id;
    state.blockPickerOpen = false;
    sfx.playRaiseHand();
    triggerAceBuzzerCutIn(player, spotlight ? "SPOTLIGHT!" : null);
    setGameMascot("excited", `${player.name.toUpperCase()} ON THE MIC!`);
    document.getElementById("stage-countdown-badge").classList.add("hidden");
    document.getElementById("phase-pill-tag").textContent = spotlight ? "SPOTLIGHT ANSWER" : "ANSWERING";
    document.getElementById("buzzer-instruction").textContent = spotlight
        ? `${player.name} has 10 seconds. This Spotlight is exclusive; everyone returns next round.`
        : `${player.name} has 10 seconds. Other players: get ready to steal after a miss.`;
    const input = document.getElementById("answer-input");
    input.value = "";
    document.getElementById("answer-prompt-label").textContent = `${player.name} [${player.key}]: type your answer${spotlight ? " (1.5x stakes)" : ""}.`;
    document.getElementById("answer-form").classList.remove("hidden");
    renderGamePlayerCards(); updateAttemptBadge(); renderItemPanel(player);
    startAnswerClock();
    input.focus();
    notify(`${player.name} claimed the mic. A fresh 10 seconds to answer${isChaos() ? "; Alt+1 Shield, Alt+2 2x, Alt+3 Block, Alt+4 Skip" : ""}.`);
}

function handleAnswerSubmit(e) {
    e.preventDefault();
    if (state.phase !== "ANSWERING") return;
    if (performance.now() >= state.clockDeadline) { handleRoundTimeout(); return; }
    const currentQ = state.questions[state.currentRoundIndex];
    const player = state.players.find((p) => p.id === state.activeBuzzerPlayerId);
    if (!player || !validateQuestions([currentQ], state.matchConfig?.category || state.selectedCategory).length) {
        skipUnusableQuestion("This question could not be checked safely. No player loses points."); return;
    }
    const submitted = normalizeAnswer(document.getElementById("answer-input").value);
    if (!submitted) { notify("Type an answer before locking it in. Your clock is still running.", "warning"); return; }
    stopClock();
    hideItemPanel();
    document.getElementById("answer-form").classList.add("hidden");
    const accepted = [currentQ.answer, ...(currentQ.acceptedAnswers || []), ...(currentQ.aliases || [])].map(normalizeAnswer);
    const correct = accepted.includes(submitted);
    const spotlight = state.spotlightPlayerId === player.id;
    const multiplier = player.multiplierArmed;
    const shield = player.shieldArmed;
    player.multiplierArmed = false; player.shieldArmed = false;
    if (correct) {
        const previousScore = player.score;
        const previousLeader = getSoleLeaderId();
        const points = Math.round(getCurrentAttemptPoints() * (spotlight ? SPOTLIGHT_MULTIPLIER : 1) * (multiplier ? POINTS_ITEM_MULTIPLIER : 1));
        player.score += points;
        if (shield) refundShield(player);
        const dropped = maybeDropItem(player);
        const leader = getSoleLeaderId();
        player.justOvertook = leader === player.id && previousLeader !== null && previousLeader !== player.id;
        state.currentLeaderId = leader;
        sfx.playCorrect();
        if (player.justOvertook) scheduleEffect(() => sfx.playOvertake(), 250);
        setGameMascot("correct", player.justOvertook ? "NEW LEADER!" : "CLEAN HIT!");
        renderGamePlayerCards(previousScore, player.id);
        const details = [spotlight ? "Spotlight ×1.5" : "", state.event === "double" ? "Double Points event" : "", multiplier ? "2x item" : ""].filter(Boolean).join(" · ");
        showFeedbackBanner(true, player.justOvertook ? "CORRECT — NEW LEADER!" : "CORRECT!",
            `${player.name} got “${currentQ.answer}”${details ? ` (${details})` : ""}.`, `+${points} PTS`,
            `${shield ? "Unused Shield returned. " : ""}${dropped ? `Found ${ITEM_DEFS[dropped].name}! ` : ""}Next question in a moment.`);
        if (dropped) { sfx.playItemGain(); showItemToast(player, dropped); }
        animateScoreAward(player, previousScore, player.score, points);
        scheduleNextRound(1800, () => { player.justOvertook = false; });
    } else if (spotlight) {
        resolveSpotlightFailure(player, currentQ, { title: "SPOTLIGHT MISS!", message: `${player.name} missed. The answer was “${currentQ.answer}”.`, shielded: shield });
    } else {
        if (shield) refundShield(player);
        retryAfterMiss(player, `${player.name}'s answer was incorrect.${multiplier ? " The 2x item was used up." : ""}`);
    }
}

function handleRoundTimeout() {
    if (!["ANSWERING", "BUZZ_OPEN"].includes(state.phase)) return;
    stopClock();
    const question = state.questions[state.currentRoundIndex];
    if (!question || !validateQuestions([question], state.matchConfig?.category || state.selectedCategory).length) {
        skipUnusableQuestion("The question data is unavailable. No points are lost."); return;
    }
    document.getElementById("answer-form").classList.add("hidden"); hideItemPanel();
    const player = state.players.find((p) => p.id === state.activeBuzzerPlayerId);
    if (state.phase === "ANSWERING" && player) {
        const shield = player.shieldArmed;
        player.shieldArmed = false; player.multiplierArmed = false;
        if (state.spotlightPlayerId === player.id) {
            resolveSpotlightFailure(player, question, { title: "SPOTLIGHT TIMEOUT!", message: `${player.name} ran out of time. The answer was “${question.answer}”.`, shielded: shield });
        } else {
            if (shield) refundShield(player);
            retryAfterMiss(player, `${player.name} ran out of answer time. Other players can steal!`);
        }
        return;
    }
    sfx.playWrong();
    showFeedbackBanner(false, "NO BUZZ THIS TIME", `The answer was “${question.answer}”.`, "0 PTS", "Nobody loses points. Next question coming up.");
    scheduleNextRound(1800);
}

function getSpotlightPlayer() {
    if (state.spotlightPlayerId === null) return null;
    return state.players.find((p) => p.id === state.spotlightPlayerId) || null;
}

// Some rounds (random) pick a random, non-blocked player to answer alone.
function rollSpotlightPlayerId(activePlayers) {
    const eligible = activePlayers.filter((p) => !p.blockedThisRound);
    if (!eligible.length) return null;
    const minimum = Math.min(...eligible.map((p) => state.spotlightTurns[p.id] || 0));
    const fairPool = eligible.filter((p) => (state.spotlightTurns[p.id] || 0) === minimum);
    return fairPool[Math.floor(Math.random() * fairPool.length)].id;
}

function resolveSpotlightFailure(player, currentQ, { title, message, shielded = false }) {
    const loss = Math.round(getCurrentAttemptPoints() * SPOTLIGHT_MULTIPLIER);
    const penalty = shielded ? 0 : loss;
    const previousScore = player.score;
    player.score -= penalty;
    player.multiplierArmed = false; player.shieldArmed = false;
    state.activeBuzzerPlayerId = null;
    state.currentLeaderId = getSoleLeaderId();
    if (shielded) sfx.playShield(); else sfx.playWrong();
    renderGamePlayerCards(previousScore, player.id);
    showFeedbackBanner(false, shielded ? "SHIELD SAVED YOU!" : title,
        `${message}${shielded ? ` Shield absorbed the ${loss}-point loss.` : ""}`,
        shielded ? "0 PTS" : `-${penalty} PTS`, "Next round is open buzzing. Everyone gets back in!");
    if (penalty) animateScoreAward(player, previousScore, player.score, -penalty);
    scheduleNextRound(2000);
}

function rollRandomItem() {
    if (Math.random() < POINTS_ITEM_CHANCE) return "multiplier";
    const others = ["shield", "block", "skip"];
    return others[Math.floor(Math.random() * others.length)];
}

function giveRandomItem(player) {
    if (!isChaos() || player.items.length >= MAX_ITEMS) return null;
    const item = rollRandomItem();
    player.items.push(item);
    return item;
}

function refundShield(player) {
    player.shieldArmed = false;
    if (player.items.length < MAX_ITEMS) player.items.push("shield");
}

function maybeDropItem(player) {
    if (!isChaos() || Math.random() >= ITEM_DROP_CHANCE) return null;
    return giveRandomItem(player);
}

function getBlockTargets(player) {
    const active = state.players.slice(0, state.playerCount);
    return active.filter((target) => {
        if (target.id === player.id || target.blockedNextRound) return false;
        return active.some((p) => p.id !== target.id && !p.blockedNextRound);
    });
}

function hideItemPanel() {
    state.blockPickerOpen = false;
    const panel = document.getElementById("item-panel");
    if (!panel) return;
    panel.classList.add("hidden");
    panel.replaceChildren();
}

function makeItemButton({ itemId = null, icon = "", name, desc, count = 0, disabled = false, onClick }) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "item-btn";
    btn.disabled = disabled;
    btn.title = `${name}${desc ? ` — ${desc}` : ""}`;

    const iconEl = document.createElement("span");
    iconEl.className = "item-btn__icon";
    if (itemId) {
        iconEl.appendChild(createItemImage(itemId, "item-img item-img--btn"));
    } else {
        iconEl.textContent = icon;
    }

    const textEl = document.createElement("span");
    textEl.className = "item-btn__text";
    const nameEl = document.createElement("span");
    nameEl.className = "item-btn__name";
    nameEl.textContent = name;
    textEl.appendChild(nameEl);
    if (desc) {
        const descEl = document.createElement("span");
        descEl.className = "item-btn__desc";
        descEl.textContent = desc;
        textEl.appendChild(descEl);
    }

    btn.append(iconEl, textEl);
    if (count > 1) {
        const countEl = document.createElement("span");
        countEl.className = "item-btn__count";
        countEl.textContent = `x${count}`;
        btn.appendChild(countEl);
    }
    btn.addEventListener("click", onClick);
    return btn;
}

// Items can only be used by the player who is currently answering.
function renderItemPanel(player) {
    const panel = document.getElementById("item-panel");
    if (!panel) return;
    panel.replaceChildren();

    if (!isChaos() || state.phase !== "ANSWERING" || state.activeBuzzerPlayerId !== player.id) {
        panel.classList.add("hidden");
        return;
    }
    panel.classList.remove("hidden");

    const title = document.createElement("span");
    title.className = "item-panel__title";
    title.textContent = state.blockPickerOpen
        ? "BLOCK WHO FOR NEXT ROUND?"
        : `${player.name.toUpperCase()}'S ITEMS`;
    if (!state.blockPickerOpen && (player.multiplierArmed || player.shieldArmed)) {
        const armedParts = [];
        if (player.shieldArmed) armedParts.push("SHIELD ARMED");
        if (player.multiplierArmed) armedParts.push(`${POINTS_ITEM_MULTIPLIER}x ARMED`);
        const armed = document.createElement("span");
        armed.className = "item-panel__armed";
        armed.textContent = `  ·  ${armedParts.join(" · ")}`;
        title.appendChild(armed);
    }
    panel.appendChild(title);

    const row = document.createElement("div");
    row.className = "item-panel__row";

    if (state.blockPickerOpen) {
        getBlockTargets(player).forEach((target) => {
            row.appendChild(makeItemButton({
                itemId: "block",
                name: target.name,
                desc: `Key [${target.key}]`,
                onClick: () => useItem(player, "block", target.id)
            }));
        });
        row.appendChild(makeItemButton({
            icon: "↩",
            name: "CANCEL",
            onClick: () => {
                state.blockPickerOpen = false;
                renderItemPanel(player);
                document.getElementById("answer-input").focus();
            }
        }));
        panel.appendChild(row);
        return;
    }

    ITEM_ORDER.forEach((itemId) => {
        const count = player.items.filter((i) => i === itemId).length;
        if (count === 0) return;
        const def = ITEM_DEFS[itemId];
        let disabled = false;
        if (itemId === "multiplier" && player.multiplierArmed) disabled = true;
        if (itemId === "shield" && (player.shieldArmed || state.spotlightPlayerId !== player.id)) disabled = true;
        if (itemId === "block" && (getBlockTargets(player).length === 0 || state.currentRoundIndex >= state.questions.length - 1)) disabled = true;
        const reason = itemId === "shield" && state.spotlightPlayerId !== player.id ? "Save for Spotlight — no penalty this round"
            : itemId === "block" && state.currentRoundIndex >= state.questions.length - 1 ? "Unavailable — this is the final question"
            : disabled && (itemId === "shield" || itemId === "multiplier") ? "Already armed for this answer"
            : disabled ? "No eligible targets" : def.desc;

        row.appendChild(makeItemButton({
            itemId,
            name: `${def.name} [Alt+${ITEM_ORDER.indexOf(itemId) + 1}]`,
            desc: reason,
            count,
            disabled,
            onClick: () => useItem(player, itemId)
        }));
    });

    if (player.items.length === 0) {
        const empty = document.createElement("span");
        empty.className = "item-panel__empty";
        empty.textContent = "No items left. Answer correctly for a chance to find more!";
        row.appendChild(empty);
    }
    panel.appendChild(row);
}

function useItem(player, itemId, targetId = null) {
    if (!isChaos() || state.phase !== "ANSWERING" || !player || state.activeBuzzerPlayerId !== player.id) return;
    if (performance.now() >= state.clockDeadline) { handleRoundTimeout(); return; }
    const index = player.items.indexOf(itemId);
    if (index < 0) { notify(`No ${ITEM_DEFS[itemId]?.name || "item"} in your inventory.`, "warning"); return; }
    if (itemId === "shield") {
        if (player.shieldArmed) { notify("Your Shield is already armed.", "warning"); return; }
        if (state.spotlightPlayerId !== player.id) { notify("No points are at risk in this round. Save your Shield for Spotlight.", "info"); return; }
        player.shieldArmed = true; sfx.playShield();
        notify("Shield armed. It prevents the Spotlight penalty and returns if you answer correctly.", "success");
    } else if (itemId === "multiplier") {
        if (player.multiplierArmed) { notify("Your 2x boost is already armed.", "warning"); return; }
        player.multiplierArmed = true; sfx.playItemUse();
        notify("2x armed for this answer. A wrong answer or timeout uses it up.", "success");
    } else if (itemId === "block") {
        if (state.currentRoundIndex >= state.questions.length - 1) { notify("Block affects the next round, so it cannot be used on the final question.", "warning"); return; }
        if (targetId === null) {
            if (!getBlockTargets(player).length) { notify("No eligible Block targets. Your item was kept.", "warning"); return; }
            state.blockPickerOpen = true; renderItemPanel(player);
            notify("Choose a Block target by their buzzer key or click. Escape cancels. The answer clock is still running.");
            document.querySelector("#item-panel button:not(:disabled)")?.focus(); return;
        }
        const target = getBlockTargets(player).find((p) => p.id === targetId);
        if (!target) { notify("That player cannot be blocked. Choose another target.", "warning"); return; }
        target.blockedNextRound = true; state.blockPickerOpen = false; sfx.playItemUse();
        notify(`${target.name} is blocked for the next question only.`, "success");
    } else if (itemId === "skip") {
        player.items.splice(index, 1); sfx.playItemUse(); skipCurrentQuestion(player); return;
    } else return;
    player.items.splice(index, 1);
    renderGamePlayerCards(); updateAttemptBadge(); renderItemPanel(player);
    document.getElementById("answer-input").focus();
}

function skipCurrentQuestion(player) {
    stopClock(); hideItemPanel();
    document.getElementById("answer-form").classList.add("hidden");
    const question = state.questions[state.currentRoundIndex];
    if (player.shieldArmed) refundShield(player);
    player.multiplierArmed = false;
    state.activeBuzzerPlayerId = null;
    renderGamePlayerCards();
    showFeedbackBanner(true, "QUESTION SKIPPED", `${player.name} used Skip. The answer was “${question?.answer || "unavailable"}”.`, "0 PTS", "No penalty. An armed 2x is used up; an unused Shield returns.");
    document.getElementById("feedback-icon").textContent = "⏭";
    scheduleNextRound(1600);
}

function scheduleNextRound(delayMs, beforeAdvance = null) {
    if (state.roundTransitionTimeout) clearTimeout(state.roundTransitionTimeout);
    state.roundTransitionTimeout = scheduleEffect(() => {
        if (beforeAdvance) beforeAdvance();
        state.completedRounds += 1;
        state.currentRoundIndex += 1;
        loadRound();
    }, delayMs);
}

function showStartingItemsReveal(onDone) {
    state.revealCleanup?.();
    state.phase = "ITEM_REVEAL";
    const overlay = document.getElementById("item-reveal-overlay");
    const title = document.getElementById("item-reveal-title");
    const list = document.getElementById("item-reveal-list");
    const button = document.getElementById("btn-item-reveal-continue");
    const hint = document.getElementById("item-reveal-hint");
    const queue = state.players.slice(0, state.playerCount);
    const session = state.sessionToken;
    const background = document.querySelector(".app-shell");
    const sound = document.querySelector(".utility-bar");
    const priorFocus = document.activeElement;
    let index = 0;
    let inspecting = false;
    let canceled = false;
    let cancel = document.getElementById("btn-cancel-reveal");
    if (!cancel) {
        cancel = document.createElement("button"); cancel.id = "btn-cancel-reveal"; cancel.type = "button";
        cancel.className = "btn btn-outline"; cancel.textContent = "BACK TO LOBBY"; button.after(cancel);
    }
    const render = () => {
        const player = queue[index];
        state.revealPlayerIndex = index; state.revealStage = inspecting ? "items" : "ready";
        title.textContent = inspecting ? `${player.name.toUpperCase()}: YOUR ITEMS` : `${player.name.toUpperCase()}, READY?`;
        hint.textContent = inspecting ? "Take your time. Alt+1 Shield · Alt+2 2x · Alt+3 Block · Alt+4 Skip while answering." : "Pass the keyboard. Everyone else can look away; press READY when this player is looking.";
        list.replaceChildren();
        if (inspecting) {
            const items = document.createElement("div"); items.className = "item-reveal-items item-reveal-items--solo";
            player.items.forEach((id) => {
                const cell = document.createElement("div"); cell.className = "item-reveal-item";
                const name = document.createElement("span"); name.className = "item-reveal-item__name"; name.textContent = ITEM_DEFS[id].name;
                const desc = document.createElement("span"); desc.className = "item-reveal-item__desc"; desc.textContent = ITEM_DEFS[id].desc;
                cell.append(createItemImage(id, "item-img item-img--reveal"), name, desc); items.appendChild(cell);
            });
            list.appendChild(items);
        }
        button.textContent = inspecting ? (index === queue.length - 1 ? "GOT IT — START GAME" : "GOT IT — NEXT PLAYER") : `READY — SHOW MY ITEMS (${index + 1}/${queue.length})`;
        button.focus();
    };
    const cleanup = () => {
        canceled = true;
        button.removeEventListener("click", next);
        cancel.removeEventListener("click", leave);
        overlay.removeEventListener("keydown", trap);
        overlay.classList.add("hidden");
        background.inert = false; if (sound) sound.inert = false;
        state.revealStage = null; state.revealCleanup = null;
        if (priorFocus?.isConnected && !priorFocus.disabled) priorFocus.focus();
    };
    function next() {
        if (canceled || session !== state.sessionToken) return;
        if (!inspecting) { inspecting = true; sfx.playItemGain(); render(); return; }
        index += 1; inspecting = false;
        if (index === queue.length) { cleanup(); onDone(); } else render();
    }
    function leave() { returnToMenu(); }
    function trap(e) {
        if (e.key === "Escape") { e.preventDefault(); leave(); }
        if (e.key === "Tab") {
            if (e.shiftKey && document.activeElement === button) { e.preventDefault(); cancel.focus(); }
            else if (!e.shiftKey && document.activeElement === cancel) { e.preventDefault(); button.focus(); }
        }
    }
    state.revealCleanup = cleanup;
    background.inert = true; if (sound) sound.inert = true;
    overlay.classList.remove("hidden");
    button.addEventListener("click", next); cancel.addEventListener("click", leave); overlay.addEventListener("keydown", trap);
    render();
}

function hideItemToast() {
    clearTimeout(state.itemToastTimeout);
    const toast = document.getElementById("item-toast");
    if (toast) {
        toast.classList.add("hidden");
        toast.replaceChildren();
    }
}

// Pop-up shown when a player finds an item after a correct answer.
function showItemToast(player, itemId) {
    const toast = document.getElementById("item-toast");
    if (!toast) return;
    const def = ITEM_DEFS[itemId];
    toast.replaceChildren();

    const text = document.createElement("div");
    text.className = "item-toast__text";
    const head = document.createElement("span");
    head.className = "item-toast__head";
    head.textContent = `${player.name.toUpperCase()} FOUND AN ITEM!`;
    const name = document.createElement("span");
    name.className = "item-toast__name";
    name.textContent = def.name;
    const desc = document.createElement("span");
    desc.className = "item-toast__desc";
    desc.textContent = def.desc;
    text.append(head, name, desc);

    toast.append(createItemImage(itemId, "item-img item-img--toast"), text);
    toast.classList.remove("hidden", "anim-pop-in");
    void toast.offsetWidth;
    toast.classList.add("anim-pop-in");

    clearTimeout(state.itemToastTimeout);
    state.itemToastTimeout = scheduleEffect(hideItemToast, 1800);
}

/* ==========================================
   SCORE ANIMATION & LEADER DETECTION
   ========================================== */
function getSoleLeaderId() {
    const players = state.players.slice(0, state.playerCount);
    if (players.every((p) => p.score === 0)) return null;
    const highest = Math.max(...players.map((p) => p.score));
    const leaders = players.filter((p) => p.score === highest);
    return leaders.length === 1 ? leaders[0].id : null;
}

function animateScoreAward(player, fromScore, toScore, earnedPoints) {
    const session = state.sessionToken;
    const round = state.roundToken;
    const originEl = document.getElementById("feedback-points");
    const targetCard = document.querySelector(`.player-game-card[data-player-id="${player.id}"]`);
    if (!originEl || !targetCard) return;

    const targetScoreEl = targetCard.querySelector(".player-score-val");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || typeof Element.prototype.animate !== "function") {
        targetScoreEl.textContent = toScore;
        return;
    }
    const startRect = originEl.getBoundingClientRect();
    const endRect = targetScoreEl.getBoundingClientRect();

    const clone = templates.flyingPoints.content.cloneNode(true);
    const orb = clone.querySelector(".flying-points-orb");
    orb.textContent = `${earnedPoints > 0 ? "+" : ""}${earnedPoints} PTS`;
    if (earnedPoints < 0) orb.classList.add("flying-points-orb--loss");
    document.body.appendChild(orb);

    const startX = startRect.left + startRect.width / 2 - 40;
    const startY = startRect.top + startRect.height / 2 - 16;
    const endX = endRect.left + endRect.width / 2 - 40;
    const endY = endRect.top + endRect.height / 2 - 16;
    const midX = (startX + endX) / 2;
    const midY = Math.min(startY, endY) - 70;

    const flight = orb.animate(
        [
            { transform: `translate(${startX}px, ${startY}px) scale(0.6)`, opacity: 1 },
            { transform: `translate(${midX}px, ${midY}px) scale(1.2) rotate(-6deg)`, opacity: 1, offset: 0.45 },
            { transform: `translate(${endX}px, ${endY}px) scale(0.85) rotate(0deg)`, opacity: 1 }
        ],
        {
            duration: 440,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)"
        }
    );

    state.scoreAnimations.add(flight);
    flight.onfinish = () => {
        state.scoreAnimations.delete(flight);
        orb.remove();
        if (session !== state.sessionToken || round !== state.roundToken || !targetScoreEl.isConnected) return;
        sfx.playScoreHit();
        const hitClass = earnedPoints < 0 ? "is-score-loss" : "is-score-hit";
        targetCard.classList.add(hitClass);
        targetScoreEl.classList.add("anim-score-pop");
        animateNumberCount(targetScoreEl, fromScore, toScore, 320);

        scheduleEffect(() => {
            targetCard.classList.remove(hitClass);
            targetScoreEl.classList.remove("anim-score-pop");
        }, 550);
    };
}

function animateNumberCount(el, startVal, endVal, duration = 350) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { el.textContent = endVal; return; }
    const session = state.sessionToken;
    const round = state.roundToken;
    const startTime = performance.now();
    const frame = () => {
        const id = requestAnimationFrame((now) => { state.effectFrames.delete(id); tick(now); });
        state.effectFrames.add(id);
    };
    function tick(now) {
        if (session !== state.sessionToken || round !== state.roundToken || !el.isConnected) return;
        const progress = Math.min(1, (now - startTime) / duration);
        const current = Math.round(startVal + (endVal - startVal) * progress);
        el.textContent = current;
        if (progress < 1) {
            frame();
        } else {
            el.textContent = endVal;
        }
    }
    frame();
}

/* ==========================================
   UI RENDERING HELPERS
   ========================================== */
function renderGamePlayerCards(holdScoreForValue = null, holdScorePlayerId = null) {
    const grid = document.getElementById("game-players-grid");
    grid.replaceChildren();

    const activePlayers = state.players.slice(0, state.playerCount);
    const maxScore = Math.max(...activePlayers.map((p) => p.score));
    const hasScores = activePlayers.some((p) => p.score !== 0);
    const topScorers = hasScores ? activePlayers.filter((p) => p.score === maxScore) : [];

    activePlayers.forEach((player, idx) => {
        const clone = templates.playerGameCard.content.cloneNode(true);
        const card = clone.querySelector(".player-game-card");
        const statusText = clone.querySelector(".player-buzz-status");
        const crownBadge = clone.querySelector(".leader-crown-badge");
        const avatarBadge = clone.querySelector(".player-avatar-badge");

        card.dataset.playerId = player.id;
        avatarBadge.innerHTML = PLAYER_AVATARS[idx % PLAYER_AVATARS.length];
        clone.querySelector(".player-key-badge").textContent = player.key;
        clone.querySelector(".player-game-name").textContent = player.name;

        const displayedScore =
            holdScorePlayerId === player.id && holdScoreForValue !== null
                ? holdScoreForValue
                : player.score;
        clone.querySelector(".player-score-val").textContent = displayedScore;

        const isTopScorer = hasScores && player.score === maxScore;
        if (isTopScorer) {
            card.classList.add("is-leader");
            crownBadge.classList.remove("hidden");
            crownBadge.textContent = topScorers.length > 1 ? "⚡ TIED LEAD" : "👑 LEADER";
        }

        if (player.justOvertook) {
            card.classList.add("is-overtake-flash");
        }

        if (state.spotlightPlayerId === player.id) {
            card.classList.add("is-spotlight");
        }

        if (state.activeBuzzerPlayerId === player.id) {
            card.classList.add("is-first-buzzer");
            statusText.textContent = "ANSWERING!";
        } else if (player.lockedOut) {
            card.classList.add("is-locked");
            if (player.justChained) {
                card.classList.add("anim-shake");
            }
            statusText.textContent = "CHAINED OUT";
        } else if (player.blockedThisRound) {
            card.classList.add("is-locked", "is-blocked");
            statusText.textContent = "BLOCKED THIS ROUND";
        } else if (state.spotlightPlayerId !== null) {
            statusText.textContent = state.spotlightPlayerId === player.id ? "🎯 PICKED!" : "WATCHING";
        } else if (player.blockedNextRound) {
            statusText.textContent = "BLOCKED NEXT ROUND";
        } else {
            statusText.textContent = "READY";
        }

        if (player.shieldArmed && state.activeBuzzerPlayerId === player.id) {
            statusText.textContent = "ANSWERING · SHIELDED";
        }

        // Items are private: nobody else's item types are shown, just how many they hold.
        // (Only the player on the mic sees their own items, in the item panel.)
        const itemsRow = clone.querySelector(".player-items-row");
        if (isChaos() && player.items.length > 0) {
            const count = document.createElement("span");
            count.className = "item-count-tag";
            count.textContent = `🎒 ${player.items.length} ITEM${player.items.length === 1 ? "" : "S"}`;
            itemsRow.appendChild(count);
        }

        grid.appendChild(clone);
    });
}

function showFeedbackBanner(isSuccess, title, message, pointsLabel, subnote) {
    state.phase = "FEEDBACK";
    stopClock();
    notify(`${title} ${message} ${pointsLabel}. ${subnote}`, isSuccess ? "success" : "warning");
    hideItemPanel();
    const banner = document.getElementById("feedback-banner");
    banner.classList.remove("hidden", "banner--correct", "banner--wrong", "anim-pop-in");
    void banner.offsetWidth;
    banner.classList.add(isSuccess ? "banner--correct" : "banner--wrong", "anim-pop-in");

    document.getElementById("feedback-icon").textContent = isSuccess ? "✓" : "!";
    document.getElementById("feedback-title").textContent = title;
    document.getElementById("feedback-message").textContent = message;
    document.getElementById("feedback-points").textContent = pointsLabel;
    document.getElementById("feedback-next-note").textContent = subnote;
}

function getCurrentAttemptPoints() {
    return ATTEMPT_POINTS[Math.min(state.attemptIndex, ATTEMPT_POINTS.length - 1)] * state.roundMultiplier;
}

function updateAttemptBadge() {
    const base = getCurrentAttemptPoints();
    const answering = state.players.find((p) => p.id === state.activeBuzzerPlayerId) || null;
    const boosted = Boolean(answering && answering.multiplierArmed);
    const shielded = Boolean(answering && answering.shieldArmed);
    const itemMult = boosted ? POINTS_ITEM_MULTIPLIER : 1;

    let label;
    if (state.spotlightPlayerId !== null) {
        const gain = Math.round(base * SPOTLIGHT_MULTIPLIER * itemMult);
        const loss = shielded ? 0 : Math.round(base * SPOTLIGHT_MULTIPLIER);
        label = `🎯 +${gain} / -${loss} PTS`;
    } else {
        const attemptNum = state.attemptIndex + 1;
        const ordinal = attemptNum === 1 ? "1st" : attemptNum === 2 ? "2nd" : attemptNum === 3 ? "3rd" : `${attemptNum}th`;
        label = `${ordinal} Try · +${Math.round(base * itemMult)} PTS`;
    }
    if (boosted) label += ` · ${POINTS_ITEM_MULTIPLIER}x`;
    if (shielded) label += " · SHIELD";
    document.getElementById("attempt-points-badge").textContent = label;
}

function updateTimerDisplay() {
    const clamped = Math.max(0, state.timerValue);
    const padded = String(clamped).padStart(2, "0");
    document.getElementById("game-timer-display").textContent = `00:${padded}`;

    const ringEl = document.getElementById("timer-ring-progress");
    const widget = document.getElementById("timer-pill-box");
    const fraction = state.timerMax > 0 ? clamped / state.timerMax : 0;
    const offset = RING_CIRCUMFERENCE * (1 - fraction);
    if (ringEl) {
        ringEl.style.strokeDashoffset = `${offset}`;
    }

    if (widget) {
        if (["BUZZ_OPEN", "ANSWERING"].includes(state.phase) && clamped <= 3) {
            widget.dataset.urgency = "danger";
        } else if (["BUZZ_OPEN", "ANSWERING"].includes(state.phase) && clamped <= 6) {
            widget.dataset.urgency = "warning";
        } else {
            widget.dataset.urgency = "normal";
        }
    }
}

/* ==========================================
   RESULTS, TROPHY GRAB CUTSCENE & CONFETTI
   ========================================== */
function showLeaderboard() {
    clearAllTimers();
    state.phase = "RESULTS";

    const activePlayers = [...state.players.slice(0, state.playerCount)].sort(
        (a, b) => b.score - a.score
    );

    const topScore = activePlayers[0].score;
    const winners = activePlayers.filter((p) => p.score === topScore);
    const isTie = winners.length > 1;

    const kickerBadge = document.getElementById("results-kicker-badge");
    const winnerTitle = document.getElementById("winner-banner-text");
    const winnerCallout = document.getElementById("winner-score-callout");
    const cutsceneStage = document.getElementById("champion-cutscene-stage");

    if (cutsceneStage) {
        renderCelebration(cutsceneStage, winners);
    }

    if (isTie) {
        sfx.playTie();
        kickerBadge.textContent = "NOBODY'S BACKING DOWN.";
        const tiedNames = winners.map((w) => w.name.toUpperCase()).join(" & ");
        winnerTitle.textContent = `TIE GAME: ${tiedNames}!`;
        winnerCallout.textContent = `CO-CHAMPIONS AT ${topScore} PTS`;
    } else {
        sfx.playLeaderboardFanfare();
        kickerBadge.textContent = "ABSOLUTE LEGEND.";
        winnerTitle.textContent = `${winners[0].name.toUpperCase()} GRABS THE TROPHY!`;
        winnerCallout.textContent = `CHAMPION SCORE: ${topScore} PTS`;
    }

    startConfetti();

    document.getElementById("leaderboard-subtitle").textContent =
        `${state.matchConfig?.practice ? "PRACTICE · " : ""}${isChaos() ? "CHAOS" : "NORMAL"} · ${state.matchConfig?.category || state.selectedCategory} · ${state.completedRounds} rounds played${state.skippedRounds ? ` · ${state.skippedRounds} unusable skipped` : ""}`;

    const list = document.getElementById("leaderboard-list");
    list.replaceChildren();

    activePlayers.forEach((player, index) => {
        const clone = templates.leaderboardRow.content.cloneNode(true);
        const row = clone.querySelector(".leaderboard-row");
        const standingTag = clone.querySelector(".leaderboard-standing-tag");
        const pointsEl = clone.querySelector(".leaderboard-points");
        const avatarBadge = clone.querySelector(".player-avatar-badge");

        row.classList.add("anim-slide-up");
        row.style.animationDelay = `${index * 90}ms`;
        avatarBadge.innerHTML = PLAYER_AVATARS[(player.id - 1) % PLAYER_AVATARS.length];

        const isCoWinner = player.score === topScore;
        if (isCoWinner) {
            row.classList.add("is-winner");
            standingTag.textContent = isTie ? "CO-CHAMPION" : "CHAMPION";
        } else if (index === 1) {
            row.classList.add("is-runner-up");
            standingTag.textContent = "RUNNER-UP";
        } else if (index === 2) {
            standingTag.textContent = "3RD PLACE";
        } else {
            standingTag.textContent = "CONTENDER";
        }

        const displayRank = isCoWinner ? 1 : index + 1;
        clone.querySelector(".leaderboard-rank").textContent = String(displayRank).padStart(2, "0");
        clone.querySelector(".leaderboard-player-name").textContent = player.name;

        animateNumberCount(pointsEl, 0, player.score, 650);
        list.appendChild(clone);
    });

    switchView("leaderboard");
    notify(isTie ? `${winners.length}-way tie! ${winners.map((p) => p.name).join(", ")} share the win at ${topScore} points.` : `${winners[0].name} wins with ${topScore} points!`, "success");
}

function startConfetti() {
    const canvas = document.getElementById("confetti-canvas");
    if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    canvas.classList.remove("hidden");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#FFD447", "#FF4D4D", "#66E3A4", "#FFF8EC", "#B388FF"];
    const particles = Array.from({ length: 90 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height,
        w: 8 + Math.random() * 6,
        h: 10 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        vy: 2.5 + Math.random() * 3.2,
        vx: (Math.random() - 0.5) * 2.2,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.14
    }));

    function renderFrame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach((p) => {
            p.x += p.vx;
            p.y += p.vy;
            p.angle += p.spin;

            if (p.y > canvas.height + 20) {
                p.y = -20;
                p.x = Math.random() * canvas.width;
            }

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            ctx.restore();
        });

        state.confettiFrameId = requestAnimationFrame(renderFrame);
    }

    renderFrame();

    scheduleEffect(() => {
        stopConfetti();
    }, 4500);
}

function stopConfetti() {
    if (state.confettiFrameId) {
        cancelAnimationFrame(state.confettiFrameId);
        state.confettiFrameId = null;
    }
    const canvas = document.getElementById("confetti-canvas");
    if (canvas) {
        canvas.classList.add("hidden");
    }
}

function clearAllTimers() {
    stopClock();
    if (state.roundTransitionTimeout) clearTimeout(state.roundTransitionTimeout);
    state.roundTransitionTimeout = null;
    for (const id of state.effectTimeouts) clearTimeout(id);
    state.effectTimeouts.clear();
    for (const id of state.effectFrames) cancelAnimationFrame(id);
    state.effectFrames.clear();
    for (const animation of state.scoreAnimations) { animation.onfinish = null; animation.cancel(); }
    state.scoreAnimations.clear();
    document.querySelectorAll(".flying-points-orb").forEach((orb) => orb.remove());
    if (state.cutinTimeout) clearTimeout(state.cutinTimeout);
    state.cutinTimeout = null;
    document.getElementById("buzzer-cutin-overlay")?.classList.add("hidden");
    state.revealCleanup?.();
    state.imageCleanup?.();
    state.imageCleanup = null;
}

function returnToMenu() {
    ++state.sessionToken; ++state.roundToken;
    state.loading = false;
    state.pendingQuestions = null; state.pendingConfig = null;
    sfx.playClick(); stopConfetti(); clearAllTimers(); hideItemToast(); hideItemPanel();
    state.phase = "IDLE";
    state.rebindTargetPlayerId = null; state.heldKeys.clear();
    state.activeBuzzerPlayerId = null; state.spotlightPlayerId = null;
    setLoadingControls(false); setLoadActions();
    document.getElementById("answer-form").classList.add("hidden");
    document.getElementById("feedback-banner").classList.add("hidden");
    setLobbyMascot("idle", "Back in the lobby! Choose your next match.");
    switchView("prep");
    notify("Back in the lobby. The previous match is closed; Play starts fresh.");
}

function switchView(targetKey) {
    Object.entries(views).forEach(([key, el]) => {
        el.classList.toggle("hidden", key !== targetKey);
    });
}


function isChaos() { return (state.matchConfig?.mode || state.mode) === "chaos"; }

function notify(message, tone = "info") {
    const status = document.getElementById("match-status");
    if (!status) return;
    status.textContent = message;
    status.dataset.tone = tone;
    status.classList.remove("hidden");
}

function scheduleEffect(callback, milliseconds) {
    const session = state.sessionToken;
    const round = state.roundToken;
    const id = setTimeout(() => {
        state.effectTimeouts.delete(id);
        if (session === state.sessionToken && round === state.roundToken) callback();
    }, milliseconds);
    state.effectTimeouts.add(id);
    return id;
}

function setLoadingControls(loading) {
    document.querySelectorAll("#view-prep button, #view-prep input, #btn-play-again, #btn-results-menu, #match-load-actions button").forEach((el) => { el.disabled = loading; });
    const label = document.querySelector("#btn-start-game .btn-play-label");
    if (label) label.textContent = loading ? "LOADING…" : "PLAY";
    if (!loading) renderPlayerSetupCards();
}

function setLoadActions({ retry = false, practice = false, short = 0 } = {}) {
    document.getElementById("match-load-actions").classList.toggle("hidden", !retry && !practice && !short);
    document.getElementById("btn-retry-load").classList.toggle("hidden", !retry);
    document.getElementById("btn-practice-mode").classList.toggle("hidden", !practice);
    const startShort = document.getElementById("btn-short-match");
    startShort.classList.toggle("hidden", !short);
    startShort.textContent = `PLAY ${short} AVAILABLE QUESTIONS`;
}

function invalidatePendingMatch() {
    state.pendingQuestions = null;
    state.pendingConfig = null;
    if (state.phase === "SHORT_BANK") state.phase = "IDLE";
    setLoadActions();
}

function beginMatch(questions, config) {
    clearAllTimers();
    state.matchConfig = config;
    state.mode = config.mode; state.selectedCategory = config.category; state.playerCount = config.playerCount;
    state.questions = questions; state.currentRoundIndex = 0; state.attemptIndex = 0;
    state.completedRounds = 0; state.skippedRounds = 0;
    state.currentLeaderId = null; state.activeBuzzerPlayerId = null; state.spotlightPlayerId = null;
    state.event = "none"; state.previousEvent = "none"; state.roundMultiplier = 1; state.spotlightTurns = {};
    state.players.forEach((p) => Object.assign(p, { score: 0, lockedOut: false, justChained: false, justOvertook: false }, freshPlayerExtras()));
    config.players.forEach((saved) => Object.assign(state.players.find((p) => p.id === saved.id), saved));
    if (isChaos()) state.players.slice(0, state.playerCount).forEach((p) => {
        p.items = ["multiplier", ["shield", "block", "skip"][Math.floor(Math.random() * 3)]];
    });
    setLoadActions();
    state.heldKeys.clear(); state.rebindTargetPlayerId = null;
    document.getElementById("game-mode-label").textContent = `${config.practice ? "PRACTICE · " : ""}${isChaos() ? "CHAOS" : "NORMAL"}`;
    document.getElementById("game-mode-label").dataset.mode = config.mode;
    document.getElementById("game-rule-hint").textContent = isChaos()
        ? "Fresh 10s to answer · Alt+1 Shield · Alt+2 2x · Alt+3 Block · Alt+4 Skip · Spotlight never repeats"
        : "5s to read · Fresh 10s to answer · A miss or timeout lets others steal · No items or random events";
    sfx.playGameStart(); switchView("game"); renderGamePlayerCards();
    notify(`${config.practice ? "Local practice" : "Match"} ready: ${config.category}, ${config.playerCount} players, ${questions.length} questions, ${isChaos() ? "Chaos" : "Normal"} mode.`, "success");
    if (isChaos()) showStartingItemsReveal(() => loadRound()); else loadRound();
}

function chooseRoundEvent(players) {
    const last = state.event;
    state.previousEvent = last;
    state.event = "none"; state.spotlightPlayerId = null; state.roundMultiplier = 1;
    if (!isChaos()) return;
    const roll = Math.random();
    if (roll < SPOTLIGHT_CHANCE && last !== "spotlight") {
        state.spotlightPlayerId = rollSpotlightPlayerId(players);
        if (state.spotlightPlayerId !== null) {
            state.event = "spotlight";
            state.spotlightTurns[state.spotlightPlayerId] = (state.spotlightTurns[state.spotlightPlayerId] || 0) + 1;
        }
    } else if (roll >= SPOTLIGHT_CHANCE && roll < 0.45) {
        state.event = "double"; state.roundMultiplier = 2;
    } else if (roll >= 0.45 && roll < 0.60) {
        state.event = "lucky";
        players.forEach((p) => giveRandomItem(p));
        sfx.playItemGain();
    }
}

function stopClock() {
    if (state.timerInterval !== null) clearInterval(state.timerInterval);
    state.timerInterval = null;
    state.clockDeadline = 0;
}

function startClock(seconds, type, onTick, onEnd) {
    stopClock();
    const session = state.sessionToken;
    const round = state.roundToken;
    state.clockType = type; state.timerMax = seconds; state.timerValue = seconds;
    state.clockDeadline = performance.now() + seconds * 1000;
    let previous = seconds;
    updateTimerDisplay(); onTick?.(seconds);
    state.timerInterval = setInterval(() => {
        if (session !== state.sessionToken || round !== state.roundToken) { stopClock(); return; }
        const remaining = Math.max(0, Math.ceil((state.clockDeadline - performance.now()) / 1000));
        state.timerValue = remaining; updateTimerDisplay();
        if (remaining !== previous) { previous = remaining; onTick?.(remaining); }
        if (remaining === 0) { stopClock(); onEnd(); }
    }, 250);
}

function retryAfterMiss(player, message) {
    player.lockedOut = true; player.justChained = true;
    state.activeBuzzerPlayerId = null; state.attemptIndex += 1;
    const remaining = state.players.slice(0, state.playerCount).filter((p) => !p.lockedOut && !p.blockedThisRound);
    sfx.playWrong(); renderGamePlayerCards();
    if (remaining.length) {
        showFeedbackBanner(false, "STEAL OPPORTUNITY!", `${message} ${player.name} is out for this question.`, "0 PTS", `Remaining players: get ready for +${getCurrentAttemptPoints()} points. A short 1s lock follows.`);
        state.roundTransitionTimeout = scheduleEffect(() => {
            player.justChained = false;
            document.getElementById("feedback-banner").classList.add("hidden");
            startHandLockCountdown(1);
        }, 900);
    } else {
        showFeedbackBanner(false, "EVERYONE HAD A SHOT", `The answer was “${state.questions[state.currentRoundIndex].answer}”.`, "0 PTS", "All lockouts clear on the next question.");
        scheduleNextRound(1800);
    }
}

function skipUnusableQuestion(reason) {
    stopClock(); hideItemPanel();
    document.getElementById("answer-form").classList.add("hidden");
    state.players.forEach((p) => { if (p.shieldArmed) refundShield(p); p.multiplierArmed = false; p.shieldArmed = false; });
    state.skippedRounds += 1;
    showFeedbackBanner(false, "QUESTION UNAVAILABLE", reason, "NO PENALTY", "Skipping the unusable question. Scores are unchanged.");
    state.roundTransitionTimeout = scheduleEffect(() => { state.currentRoundIndex += 1; loadRound(); }, 1500);
}

function preloadPictures(images, urls) {
    return new Promise((resolve) => {
        let settled = false;
        let loaded = 0;
        const finish = (ok) => {
            if (settled) return;
            settled = true; clearTimeout(timeout);
            images.forEach((img) => { img.onload = null; img.onerror = null; });
            state.imageCleanup = null; resolve(ok);
        };
        const timeout = setTimeout(() => finish(false), 8000);
        state.imageCleanup = () => finish(false);
        images.forEach((img, i) => {
            img.onload = () => { if (++loaded === images.length) finish(true); };
            img.onerror = () => finish(false);
            img.src = urls[i];
            if (img.complete && img.naturalWidth > 0) { img.onload = null; if (++loaded === images.length) finish(true); }
        });
    });
}

init();
