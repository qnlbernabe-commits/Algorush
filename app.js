import { fetchQuestionsByCategory } from "./firebase-config.js";
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

const ATTEMPT_POINTS = [3, 2, 1, 1];
const HAND_LOCK_SECONDS = 5;
const ANSWER_TIME_SECONDS = 12;
const RING_CIRCUMFERENCE = 144.5;

const state = {
    selectedCategory: "Tech & Computer",
    roundCount: 10,
    playerCount: 4,
    players: [
        { id: 1, name: "Player 1", key: "A", score: 0, lockedOut: false, justChained: false, justOvertook: false },
        { id: 2, name: "Player 2", key: "L", score: 0, lockedOut: false, justChained: false, justOvertook: false },
        { id: 3, name: "Player 3", key: "S", score: 0, lockedOut: false, justChained: false, justOvertook: false },
        { id: 4, name: "Player 4", key: "K", score: 0, lockedOut: false, justChained: false, justOvertook: false }
    ],
    rebindTargetPlayerId: null,

    questions: [],
    currentRoundIndex: 0,
    attemptIndex: 0,
    phase: "IDLE",
    activeBuzzerPlayerId: null,
    currentLeaderId: null,
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

function buildTrophyGrabCutsceneSVG(winners) {
    const primaryWinner = winners[0];
    const spec = CHARACTER_SPECS[(primaryWinner.id - 1) % CHARACTER_SPECS.length];

    return `
        <svg class="trophy-scene-svg" viewBox="0 0 360 200" fill="none">
            <ellipse cx="180" cy="186" rx="115" ry="12" fill="#100D12" opacity="0.65"/>
            <rect x="110" y="168" width="140" height="24" rx="6" fill="#4B1737" stroke="#100D12" stroke-width="4"/>
            <rect x="122" y="173" width="116" height="6" rx="3" fill="#FFD447"/>

            <g class="trophy-sparkle">
                <path d="M68 48L74 62L88 68L74 74L68 88L62 74L48 68L62 62Z" fill="#FFD447"/>
                <path d="M298 38L286 58H298L292 74L312 52H299L298 38Z" fill="#FF4D4D" stroke="#100D12" stroke-width="2"/>
            </g>
            <g class="trophy-sparkle trophy-sparkle--delayed">
                <path d="M288 105L293 116L304 121L293 126L288 137L283 126L272 121L283 116Z" fill="#66E3A4"/>
                <path d="M72 115L60 135H72L66 151L86 129H73L72 115Z" fill="#FFD447" stroke="#100D12" stroke-width="2"/>
            </g>

            <g class="winner-rig-body">
                <rect x="156" y="148" width="14" height="24" rx="6" fill="#100D12"/>
                <rect x="190" y="148" width="14" height="24" rx="6" fill="#100D12"/>
                <rect x="146" y="116" width="68" height="40" rx="12" fill="${spec.darkColor}" stroke="#100D12" stroke-width="4.5"/>
                <rect x="142" y="76" width="76" height="58" rx="16" fill="${spec.color}" stroke="#100D12" stroke-width="5"/>
                <g transform="translate(180, 105) scale(0.85)">
                    ${spec.faceMarkup}
                </g>

                <g class="winner-rig-arm-left">
                    <path d="M148 126Q118 96 142 58" stroke="${spec.color}" stroke-width="14" stroke-linecap="round" fill="none"/>
                    <path d="M148 126Q118 96 142 58" stroke="#100D12" stroke-width="4.5" stroke-linecap="round" fill="none"/>
                    <circle cx="144" cy="56" r="10" fill="#FFF8EC" stroke="#100D12" stroke-width="4"/>
                </g>

                <g class="winner-rig-arm-right">
                    <path d="M212 126Q242 96 218 58" stroke="${spec.color}" stroke-width="14" stroke-linecap="round" fill="none"/>
                    <path d="M212 126Q242 96 218 58" stroke="#100D12" stroke-width="4.5" stroke-linecap="round" fill="none"/>
                    <circle cx="216" cy="56" r="10" fill="#FFF8EC" stroke="#100D12" stroke-width="4"/>
                </g>
            </g>

            <g class="hoisted-trophy-group">
                <path d="M154 26H138V44C138 53 145 58 154 58" stroke="#FFD447" stroke-width="6" stroke-linecap="round" fill="none"/>
                <path d="M206 26H222V44C222 53 215 58 206 58" stroke="#FFD447" stroke-width="6" stroke-linecap="round" fill="none"/>
                <path d="M152 16H208V42C208 60 195.5 72 180 72C164.5 72 152 60 152 42V16Z"
                    fill="#FFD447" stroke="#100D12" stroke-width="4.5"/>
                <rect x="173" y="72" width="14" height="12" fill="#FFD447" stroke="#100D12" stroke-width="4"/>
                <rect x="160" y="84" width="40" height="9" rx="3" fill="#FF4D4D" stroke="#100D12" stroke-width="4"/>
                <path d="M184 24L172 41H181L177 56L191 38H181L184 24Z" fill="#100D12"/>
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

    state.cutinTimeout = setTimeout(() => {
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
            sfx.playCategorySelect();
            state.selectedCategory = cat.name;
            renderCategories();
            updatePrepSummary();
            applyCategoryWorldTheme(cat.name, btn);
            setLobbyMascot("excited", cat.quip);
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
                player.name = e.target.value.trim() || `Player ${player.id}`;
            });

            keyBtn.addEventListener("click", () => {
                sfx.playClick();
                state.rebindTargetPlayerId = player.id;
                setLobbyMascot("excited", `Press any letter or number key for ${player.name}!`);
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
    const summaryEl = document.getElementById("prep-summary-text");
    summaryEl.textContent = `${state.selectedCategory} · ${state.playerCount} players · ${state.roundCount} rounds`;
}

function bindPrepEvents() {
    const soundBtn = document.getElementById("btn-sound-toggle");
    soundBtn.addEventListener("click", () => {
        const muted = sfx.toggleMute();
        soundBtn.setAttribute("aria-pressed", String(muted));
        document.getElementById("icon-sound-on").classList.toggle("hidden", muted);
        document.getElementById("icon-sound-off").classList.toggle("hidden", !muted);
        document.getElementById("sound-toggle-label").textContent = muted ? "MUTED" : "SFX ON";
        if (!muted) sfx.playClick();
    });

    document.getElementById("round-count-group").addEventListener("click", (e) => {
        const btn = e.target.closest(".pill-btn");
        if (!btn) return;
        sfx.playClick();
        state.roundCount = Number(btn.dataset.rounds);
        document.querySelectorAll("#round-count-group .pill-btn").forEach((b) =>
            b.classList.toggle("is-selected", b === btn)
        );
        updatePrepSummary();
        setLobbyMascot("idle", `${state.roundCount} rounds locked in!`);
    });

    document.getElementById("player-count-group").addEventListener("click", (e) => {
        const btn = e.target.closest(".pill-btn");
        if (!btn) return;
        sfx.playClick();
        state.playerCount = Number(btn.dataset.players);
        syncPlayerCountPills();
        renderPlayerSetupCards(true);
        updatePrepSummary();
        setLobbyMascot("excited", `${state.playerCount}-player party mode ready!`);
    });

    document.getElementById("btn-quit-game").addEventListener("click", () => {
        sfx.playClick();
        window.location.reload();
    });

    document.getElementById("btn-start-game").addEventListener("click", startGame);
    document.getElementById("answer-form").addEventListener("submit", handleAnswerSubmit);
    document.getElementById("btn-back-menu").addEventListener("click", returnToMenu);
    document.getElementById("btn-results-menu").addEventListener("click", returnToMenu);
    document.getElementById("btn-play-again").addEventListener("click", startGame);
}

/* ==========================================
   GAMEPLAY FLOW & SYNCHRONIZED TIMERS
   ========================================== */
async function startGame() {
    const startBtn = document.getElementById("btn-start-game");
    const labelEl = startBtn.querySelector(".btn-play-label");

    stopConfetti();
    clearAllTimers();

    startBtn.disabled = true;
    if (labelEl) labelEl.textContent = "LOADING...";

    state.players.slice(0, state.playerCount).forEach((p) => {
        p.score = 0;
        p.lockedOut = false;
        p.justChained = false;
        p.justOvertook = false;
    });
    state.currentLeaderId = null;

    sfx.playGameStart();
    state.questions = await fetchQuestionsByCategory(state.selectedCategory, state.roundCount);
    state.currentRoundIndex = 0;

    startBtn.disabled = false;
    if (labelEl) labelEl.textContent = "PLAY";

    switchView("game");
    setGameMascot("excited", "LET'S ROLL!");
    loadRound();
}

function loadRound() {
    clearAllTimers();
    const currentQ = state.questions[state.currentRoundIndex];

    if (!currentQ) {
        showLeaderboard();
        return;
    }

    state.attemptIndex = 0;
    state.activeBuzzerPlayerId = null;
    state.players.slice(0, state.playerCount).forEach((p) => {
        p.lockedOut = false;
        p.justChained = false;
        p.justOvertook = false;
    });

    const totalRounds = state.questions.length;
    const roundNumber = state.currentRoundIndex + 1;
    const isFinalQuestion = roundNumber === totalRounds;

    document.getElementById("game-category-label").textContent = state.selectedCategory;
    const currentNum = String(roundNumber).padStart(2, "0");
    const totalNum = String(totalRounds).padStart(2, "0");
    const roundLabel = document.getElementById("game-round-label");
    roundLabel.textContent = `ROUND ${currentNum} / ${totalNum}`;
    roundLabel.classList.remove("anim-pop-in");
    void roundLabel.offsetWidth;
    roundLabel.classList.add("anim-pop-in");

    const progressPct = Math.round((roundNumber / totalRounds) * 100);
    document.getElementById("round-progress-fill").style.width = `${progressPct}%`;

    if (isFinalQuestion && totalRounds > 1) {
        setGameMascot("excited", "MAKE IT COUNT!");
    } else if (roundNumber > 1) {
        setGameMascot("idle", "LOCK IN!");
    }

    const contentBox = document.getElementById("question-content-box");
    contentBox.classList.remove("anim-question-enter");
    void contentBox.offsetWidth;
    contentBox.classList.add("anim-question-enter");

    document.getElementById("question-type-tag").textContent =
        currentQ.type === "4pics" ? "4 PICS 1 WORD" : "TRIVIA CLUE";
    document.getElementById("question-text-clue").textContent = currentQ.clue;

    const mediaSlot = document.getElementById("question-media-slot");
    mediaSlot.replaceChildren();

    if (currentQ.type === "4pics" && Array.isArray(currentQ.images)) {
        const gridClone = templates.fourPicsGrid.content.cloneNode(true);
        const tiles = gridClone.querySelectorAll(".pic-tile");
        currentQ.images.slice(0, 4).forEach((url, idx) => {
            if (tiles[idx]) tiles[idx].src = url;
        });
        mediaSlot.appendChild(gridClone);
        mediaSlot.classList.remove("hidden");
    } else {
        mediaSlot.classList.add("hidden");
    }

    document.getElementById("answer-form").classList.add("hidden");
    document.getElementById("feedback-banner").classList.add("hidden");

    renderGamePlayerCards();
    startHandLockCountdown();
}

function startHandLockCountdown() {
    clearInterval(state.timerInterval);
    state.phase = "HAND_COUNTDOWN";
    state.activeBuzzerPlayerId = null;
    state.timerMax = HAND_LOCK_SECONDS;
    state.timerValue = HAND_LOCK_SECONDS;

    const stageCard = document.getElementById("question-stage-card");
    stageCard.classList.remove("is-buzz-open", "anim-shake");

    const phasePill = document.getElementById("phase-pill-tag");
    phasePill.textContent = "HANDS LOCKED";
    phasePill.classList.remove("is-open");

    const countdownBadge = document.getElementById("stage-countdown-badge");
    countdownBadge.classList.remove("hidden", "is-go", "anim-pop-in");
    void countdownBadge.offsetWidth;
    countdownBadge.classList.add("anim-pop-in");
    countdownBadge.textContent = state.timerValue;

    const instructionEl = document.getElementById("buzzer-instruction");
    instructionEl.textContent = `Read the clue! Hands unlock in ${state.timerValue}s...`;
    instructionEl.classList.remove("is-live");

    document.getElementById("question-hint-tag").textContent = "Get your finger on your key — wait for GO!";
    updateAttemptBadge();
    updateTimerDisplay();
    renderGamePlayerCards();

    sfx.playCountdownTick();

    state.timerInterval = setInterval(() => {
        state.timerValue -= 1;
        updateTimerDisplay();

        if (state.timerValue > 0) {
            sfx.playCountdownTick();
            countdownBadge.textContent = state.timerValue;
            countdownBadge.classList.remove("anim-pop-in");
            void countdownBadge.offsetWidth;
            countdownBadge.classList.add("anim-pop-in");
            instructionEl.textContent = `Read the clue! Hands unlock in ${state.timerValue}s...`;
        } else {
            clearInterval(state.timerInterval);
            sfx.playBuzzOpen();
            countdownBadge.textContent = "GO! BUZZ IN!";
            countdownBadge.classList.add("is-go", "anim-pop-in");
            openBuzzerWindow();
        }
    }, 1000);
}

function openBuzzerWindow() {
    state.phase = "BUZZ_OPEN";
    state.timerMax = ANSWER_TIME_SECONDS;
    state.timerValue = ANSWER_TIME_SECONDS;

    document.getElementById("question-stage-card").classList.add("is-buzz-open");

    const phasePill = document.getElementById("phase-pill-tag");
    phasePill.textContent = "BUZZERS LIVE";
    phasePill.classList.add("is-open");

    const instructionEl = document.getElementById("buzzer-instruction");
    instructionEl.textContent = "HANDS UNLOCKED! Hit your key to buzz in!";
    instructionEl.classList.add("is-live");

    document.getElementById("question-hint-tag").textContent = "First player to buzz in claims the mic!";
    updateTimerDisplay();

    state.timerInterval = setInterval(() => {
        state.timerValue -= 1;
        updateTimerDisplay();

        if (state.timerValue <= 3 && state.timerValue > 0) {
            sfx.playFinalSecondsTick();
            setGameMascot("nervous", "TIME'S RUNNING OUT!");
        }

        if (state.timerValue <= 0) {
            clearInterval(state.timerInterval);
            handleRoundTimeout();
        }
    }, 1000);
}

/* ==========================================
   KEYBOARD ("HAND") & ANSWER SUBMISSION
   ========================================== */
function handleGlobalKeydown(e) {
    if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT") return;

    const pressedKey = e.key.toUpperCase();

    if (state.rebindTargetPlayerId !== null) {
        if (/^[A-Z0-9]$/.test(pressedKey)) {
            const duplicate = state.players
                .slice(0, state.playerCount)
                .some((p) => p.key === pressedKey && p.id !== state.rebindTargetPlayerId);

            if (!duplicate) {
                const targetPlayer = state.players.find((p) => p.id === state.rebindTargetPlayerId);
                if (targetPlayer) {
                    targetPlayer.key = pressedKey;
                    setLobbyMascot("correct", `${targetPlayer.name} bound to [${pressedKey}]!`);
                }
                sfx.playRaiseHand();
            } else {
                sfx.playWrong();
                setLobbyMascot("wrong", `Key [${pressedKey}] is already taken!`);
            }
            state.rebindTargetPlayerId = null;
            renderPlayerSetupCards();
        }
        return;
    }

    if (state.phase === "IDLE" && !views.prep.classList.contains("hidden")) {
        const lobbyPlayer = state.players
            .slice(0, state.playerCount)
            .find((p) => p.key === pressedKey);

        if (lobbyPlayer) {
            sfx.playRaiseHand();
            triggerAceBuzzerCutIn(lobbyPlayer, "READY TO ROLL!");
            setLobbyMascot("excited", `${lobbyPlayer.name} triggered their Buzzer Cut-In!`);
            const setupCard = document.querySelector(`.player-setup-card[data-player-id="${lobbyPlayer.id}"]`);
            if (setupCard) {
                setupCard.classList.remove("is-testing-hand");
                void setupCard.offsetWidth;
                setupCard.classList.add("is-testing-hand");
                setTimeout(() => setupCard.classList.remove("is-testing-hand"), 750);
            }
        }
        return;
    }

    if (state.phase !== "BUZZ_OPEN") return;

    const activePlayers = state.players.slice(0, state.playerCount);
    const buzzingPlayer = activePlayers.find(
        (p) => p.key === pressedKey && !p.lockedOut
    );

    if (!buzzingPlayer) return;

    e.preventDefault();
    triggerPlayerBuzzIn(buzzingPlayer);
}

function triggerPlayerBuzzIn(player) {
    state.phase = "ANSWERING";
    state.activeBuzzerPlayerId = player.id;

    sfx.playRaiseHand();
    triggerAceBuzzerCutIn(player);

    setGameMascot("excited", `${player.name.toUpperCase()} ON THE MIC!`);
    document.getElementById("stage-countdown-badge").classList.add("hidden");
    renderGamePlayerCards();

    const answerForm = document.getElementById("answer-form");
    const answerInput = document.getElementById("answer-input");
    const promptLabel = document.getElementById("answer-prompt-label");

    promptLabel.textContent = `${player.name} [${player.key}] buzzed in first! Type your answer:`;
    answerInput.value = "";
    answerForm.classList.remove("hidden");
    answerInput.focus();
}

function handleAnswerSubmit(e) {
    e.preventDefault();
    if (state.phase !== "ANSWERING") return;

    clearInterval(state.timerInterval);
    const currentQ = state.questions[state.currentRoundIndex];
    const player = state.players.find((p) => p.id === state.activeBuzzerPlayerId);
    const submitted = document.getElementById("answer-input").value.trim();

    document.getElementById("answer-form").classList.add("hidden");

    const isCorrect = submitted.toLowerCase() === currentQ.answer.toLowerCase();

    if (isCorrect) {
        sfx.playCorrect();
        const earnedPoints = getCurrentAttemptPoints();
        const previousScore = player.score;
        const previousLeaderId = getSoleLeaderId();

        player.score += earnedPoints;
        const newLeaderId = getSoleLeaderId();
        const didOvertake = newLeaderId === player.id && previousLeaderId !== player.id && previousLeaderId !== null;

        if (didOvertake) {
            player.justOvertook = true;
            setGameMascot("overtake", "NEW TOP DOG!");
            setTimeout(() => sfx.playOvertake(), 280);
        } else {
            setGameMascot("correct", "CLEAN HIT!");
        }

        state.currentLeaderId = newLeaderId;
        renderGamePlayerCards(previousScore, player.id);

        showFeedbackBanner(
            true,
            didOvertake ? "CLEAN HIT! · NEW TOP DOG!" : "CLEAN HIT!",
            `${player.name} nailed "${currentQ.answer}"!`,
            `+${earnedPoints} ${earnedPoints === 1 ? "PT" : "PTS"}`,
            "Advancing to next round..."
        );

        animateScoreAward(player, previousScore, player.score, earnedPoints);

        state.roundTransitionTimeout = setTimeout(() => {
            player.justOvertook = false;
            state.currentRoundIndex += 1;
            loadRound();
        }, 2500);
    } else {
        sfx.playWrong();
        setGameMascot("wrong", "OOF. CLOSE ONE!");

        const stageCard = document.getElementById("question-stage-card");
        stageCard.classList.remove("anim-shake");
        void stageCard.offsetWidth;
        stageCard.classList.add("anim-shake");

        state.activeBuzzerPlayerId = null;
        player.lockedOut = true;
        player.justChained = true;
        state.attemptIndex += 1;
        renderGamePlayerCards();

        setTimeout(() => {
            player.justChained = false;
        }, 550);

        const remainingPlayers = state.players
            .slice(0, state.playerCount)
            .filter((p) => !p.lockedOut);

        if (remainingPlayers.length > 0) {
            const nextPoints = getCurrentAttemptPoints();
            showFeedbackBanner(
                false,
                "OOF. CLOSE ONE!",
                `${player.name} is chained for this question! Remaining players get a shot.`,
                "0 PTS",
                `Restarting 5s lock for +${nextPoints} PT${nextPoints > 1 ? "S" : ""}...`
            );

            state.roundTransitionTimeout = setTimeout(() => {
                document.getElementById("feedback-banner").classList.add("hidden");
                startHandLockCountdown();
            }, 2200);
        } else {
            setGameMascot("tie", "NOBODY GOT IT!");
            showFeedbackBanner(
                false,
                "ALL PLAYERS CHAINED!",
                `Nobody cracked it! The answer was "${currentQ.answer}".`,
                "0 PTS",
                "Moving to next question..."
            );

            state.roundTransitionTimeout = setTimeout(() => {
                state.currentRoundIndex += 1;
                loadRound();
            }, 2500);
        }
    }
}

function handleRoundTimeout() {
    sfx.playWrong();
    setGameMascot("wrong", "TIME'S UP!");
    const currentQ = state.questions[state.currentRoundIndex];
    document.getElementById("answer-form").classList.add("hidden");

    showFeedbackBanner(
        false,
        "TIME'S UP!",
        `The buzzer clock expired! The answer was "${currentQ.answer}".`,
        "0 PTS",
        "Next round starting soon..."
    );

    state.roundTransitionTimeout = setTimeout(() => {
        state.currentRoundIndex += 1;
        loadRound();
    }, 2400);
}

/* ==========================================
   SCORE ANIMATION & LEADER DETECTION
   ========================================== */
function getSoleLeaderId() {
    const active = state.players.slice(0, state.playerCount);
    const maxScore = Math.max(...active.map((p) => p.score));
    if (maxScore <= 0) return null;
    const leaders = active.filter((p) => p.score === maxScore);
    return leaders.length === 1 ? leaders[0].id : null;
}

function animateScoreAward(player, fromScore, toScore, earnedPoints) {
    const originEl = document.getElementById("feedback-points");
    const targetCard = document.querySelector(`.player-game-card[data-player-id="${player.id}"]`);
    if (!originEl || !targetCard) return;

    const targetScoreEl = targetCard.querySelector(".player-score-val");
    const startRect = originEl.getBoundingClientRect();
    const endRect = targetScoreEl.getBoundingClientRect();

    const clone = templates.flyingPoints.content.cloneNode(true);
    const orb = clone.querySelector(".flying-points-orb");
    orb.textContent = `+${earnedPoints} PTS`;
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

    flight.onfinish = () => {
        orb.remove();
        sfx.playScoreHit();
        targetCard.classList.add("is-score-hit");
        targetScoreEl.classList.add("anim-score-pop");
        animateNumberCount(targetScoreEl, fromScore, toScore, 320);

        setTimeout(() => {
            targetCard.classList.remove("is-score-hit");
            targetScoreEl.classList.remove("anim-score-pop");
        }, 550);
    };
}

function animateNumberCount(el, startVal, endVal, duration = 350) {
    const startTime = performance.now();
    function tick(now) {
        const progress = Math.min(1, (now - startTime) / duration);
        const current = Math.round(startVal + (endVal - startVal) * progress);
        el.textContent = current;
        if (progress < 1) {
            requestAnimationFrame(tick);
        } else {
            el.textContent = endVal;
        }
    }
    requestAnimationFrame(tick);
}

/* ==========================================
   UI RENDERING HELPERS
   ========================================== */
function renderGamePlayerCards(holdScoreForValue = null, holdScorePlayerId = null) {
    const grid = document.getElementById("game-players-grid");
    grid.replaceChildren();

    const activePlayers = state.players.slice(0, state.playerCount);
    const maxScore = Math.max(...activePlayers.map((p) => p.score));
    const topScorers = maxScore > 0 ? activePlayers.filter((p) => p.score === maxScore) : [];

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

        const isTopScorer = maxScore > 0 && player.score === maxScore;
        if (isTopScorer) {
            card.classList.add("is-leader");
            crownBadge.classList.remove("hidden");
            crownBadge.textContent = topScorers.length > 1 ? "⚡ TIED LEAD" : "👑 LEADER";
        }

        if (player.justOvertook) {
            card.classList.add("is-overtake-flash");
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
        } else {
            statusText.textContent = "READY";
        }

        grid.appendChild(clone);
    });
}

function showFeedbackBanner(isSuccess, title, message, pointsLabel, subnote) {
    state.phase = "FEEDBACK";
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
    return ATTEMPT_POINTS[Math.min(state.attemptIndex, ATTEMPT_POINTS.length - 1)];
}

function updateAttemptBadge() {
    const pts = getCurrentAttemptPoints();
    const attemptNum = state.attemptIndex + 1;
    const ordinal = attemptNum === 1 ? "1st" : attemptNum === 2 ? "2nd" : `${attemptNum}th`;
    document.getElementById("attempt-points-badge").textContent = `${ordinal} Try · +${pts} PTS`;
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
        if (state.phase === "BUZZ_OPEN" && clamped <= 3) {
            widget.dataset.urgency = "danger";
        } else if (state.phase === "BUZZ_OPEN" && clamped <= 6) {
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
    state.phase = "IDLE";

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
        cutsceneStage.innerHTML = buildTrophyGrabCutsceneSVG(winners);
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
        `${state.selectedCategory} · ${state.questions.length} Rounds Completed`;

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
}

function startConfetti() {
    const canvas = document.getElementById("confetti-canvas");
    if (!canvas) return;
    canvas.classList.remove("hidden");
    const ctx = canvas.getContext("2d");

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

    setTimeout(() => {
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
    if (state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
    }
    if (state.roundTransitionTimeout) {
        clearTimeout(state.roundTransitionTimeout);
        state.roundTransitionTimeout = null;
    }
}

function returnToMenu() {
    sfx.playClick();
    stopConfetti();
    clearAllTimers();
    state.phase = "IDLE";
    setLobbyMascot("idle", "Back in the lobby! Ready for another round?");
    switchView("prep");
}

function switchView(targetKey) {
    Object.entries(views).forEach(([key, el]) => {
        el.classList.toggle("hidden", key !== targetKey);
    });
}

init();