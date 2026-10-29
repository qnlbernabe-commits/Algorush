# Algorush

A shared-keyboard trivia party game for two to four players.

## Start locally

Open a terminal in this folder and run:

```powershell
python -m http.server 8080 --bind 127.0.0.1
```

Open [Algorush](http://127.0.0.1:8080/) in your browser. Serve the folder over HTTP; opening index.html directly does not support its JavaScript modules reliably.

Online play uses the existing Firebase question bank. If it cannot connect, the lobby remains usable and shows Retry and Local Practice. Practice is explicitly labelled and has six questions per category. Select five rounds for a short practice game, or accept the offered shorter match when requesting more questions than the bank contains. No fallback silently changes categories or match length.

## Modes

- **Normal:** everyone races for the buzzer. No items or random events. Correct answers are worth 300, 200, 100, then 100 points according to the attempt. A wrong answer or answer timeout locks out that player and gives the others a quick chance to steal.
- **Chaos:** the same quiz with power-ups and surprise rounds. Every player starts with a 2x item and one tactical item. Spotlight gives one player an exclusive +450/-450 question. It never happens on consecutive rounds, and exclusive turns are shared among eligible players. Double Points doubles the current question's rewards for everyone; Lucky Drop gives an item to each player with inventory space.

Each question normally has five seconds to read, followed by up to ten seconds to buzz. After a player wins the buzzer, typing stays locked until the character cut-in finishes. Then a **fresh ten-second answer clock** starts. Keys held across the cut-in stay ignored until released, so buzzer spam cannot spill into the answer box. Holding a key before GO does not count: release it and press again. Read locks after a missed answer are shortened to one second.

Picture rounds use a compact question/answer layout with uncropped images, a timer inside the question card and compact player cards. The game positions the board automatically at round start and when answering opens, adapting to the viewport without changing browser zoom. On very small screens or with the software keyboard open, normal scrolling remains available.

## Controls and items

Default buzzer keys are A, L, S and K. Click a lobby keycap to rebind; keys are reserved across all four slots. Escape cancels rebinding. Names and match options are locked while loading.

In Chaos, each player first gets an untimed READY / SHOW ITEMS / GOT IT handoff. Escape or Back to Lobby cancels safely.

While answering, click an item or use its shortcut, including while typing:

| Shortcut | Item | Effect |
| --- | --- | --- |
| Alt+1 | Shield | Prevents a Spotlight loss. Returned if unused; disabled when no penalty is possible. |
| Alt+2 | 2x Points | Doubles this answer's reward. Used up on a wrong answer or timeout. Stacks with Double Points. |
| Alt+3 | Block | Choose an opponent by their buzzer key or click. Blocks their next question only. Escape cancels without consuming it. Disabled on the final question. |
| Alt+4 | Skip | Ends this question with no reward or penalty. An unused Shield returns; an armed 2x is spent. |

Inventory holds at most four items. Correct Chaos answers have a 25% chance to find another item. Item secrecy on a shared screen is an optional look-away rule.

Enter submits an answer. Blank input does not stop the clock. Answers ignore case, surrounding/repeated whitespace and equivalent Unicode forms; configured accepted aliases also count. Meaningful punctuation is preserved, so C and C++ remain different answers.

All tied champions appear and dance together in the final celebration. Reduced-motion settings stop dancing/confetti and score-flight animation. SFX can be muted immediately.

## Question administration

The Question Bank link opens the existing admin portal. It now validates questions, supports accepted-answer aliases, previews/checks picture URLs, reports invalid records and connection failures, and protects list rendering against stale category responses. Picture questions need exactly four working HTTP(S) image URLs.

Saves use a transaction-protected canonical document ID for duplicate prevention; failed duplicate reads do not permit unchecked saves. This client change does not configure Firebase authentication or deployed rules. The project owner should verify the intended read policy and authenticated administrator-only write/schema permissions in Firebase. No deployment rules or live question records were changed by the implementation/testing work.

## Optional Java question-bank checker

The admin page now has **EXPORT QUESTIONS**, which downloads a read-only snapshot of all categories, including invalid records for auditing. Run the offline Java validator in `java-tools/` on that file to check duplicates, schema problems, aliases and category coverage, and generate an HTML report plus a separate validated JSON copy.

See [the Java tool guide](java-tools/README.md) for the exact commands and [DSA walkthrough](java-tools/DSA.md) for its `HashMap`, `HashSet`, FIFO queue and sorting logic. The checker needs a JDK 17 or newer only on the computer running it. The website, Firebase question entry and GitHub Pages hosting do not require Java. Running it never writes back to the live question bank.

## Implementation notes

Local `questions.js` holds validation, normalization and the practice bank. `celebration.js` renders the winning lineup. Firebase SDK loading is deferred until an online operation is requested, with bounded connection/read timeouts. Lightweight SVG item icons replace multi-megabyte PNG downloads; the original artwork is preserved in `items/`.

Loading, cancellation, delayed effects and image preparation belong to one match session. Failed question images are skipped without penalties; a match with no usable rounds returns to a recoverable load error instead of awarding a false winner.
