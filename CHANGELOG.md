# Changes — 29 October 2026

## Java question-bank companion

- Added a read-only Export Questions button for all categories, retaining malformed records so they can be audited.
- Added a standalone Java 17+ validator using category hash maps, duplicate/alias hash sets, FIFO record processing and sorted reports.
- Java produces an HTML report, JSON report and separate validated question copy without database credentials or network calls.
- Included examples, runnable tests, Windows launchers and a DSA walkthrough. Java remains optional for the hosted game and normal question entry.

## Picture layout and buzzer-input follow-up

- Picture rounds use a responsive compact board with uncropped clue images, an in-card timer and automatic positioning to keep question/player cards visible at normal browser zoom.
- Answer entry, submission and items remain locked during the buzzer cut-in. The full answer clock starts only after it finishes.
- Keys held across that transition are ignored until released; canceled cut-ins cannot reopen stale answer forms.

## Normal and Chaos update

- Added separate Normal and Chaos modes with mode-specific rules and status labels.
- Kept power-ups and random events in Chaos; added Double Points and Lucky Drop.
- Bounded Spotlight to nonconsecutive rounds and balanced exclusive turns among eligible players.
- Added visible feedback for setup, loading, early/blocked buzzes, item actions, misses, steals, errors and results.
- Gave each answerer a fresh clock; shortened retry locks; let other players steal after an answer timeout.
- Prevented repeated/held buzzes and key collisions across standby slots.
- Replaced timed item reveals with cancellable, untimed player handoffs and a keyboard focus trap.
- Added item keyboard shortcuts and stable Block target controls; prevented final-round Block waste.
- Rendered every tied champion as a distinct dancing character; supported reduced motion and immediate mute.
- Validated/quarantined question data, accepted explicit aliases, prepared picture clues before timing and recovered from unusable questions.
- Made online errors, local practice and shorter available matches explicit.
- Locked startup options, invalidated obsolete responses/offers, and cleaned up timers/listeners/animations on navigation.
- Fixed negative-score leaders and answer-time urgency warnings.
- Hardened admin validation, duplicates, list races, previews, errors and pending states.
- Switched item rendering to lightweight SVGs while preserving original PNGs.

Regression coverage and results are saved alongside the development workspace in `DSA_FINAL/implementation`. Live Firestore writes and deployed access rules were not exercised by tests.
