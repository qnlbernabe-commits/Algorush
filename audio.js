// audio.js — Web Audio API Arcade Sound System for Algorush

class SoundManager {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
    }

    initContext() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === "suspended") {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        return this.isMuted;
    }

    playTone({ freq, endFreq = null, type = "square", duration = 0.12, delay = 0, volume = 0.12 }) {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        const startTime = this.ctx.currentTime + delay;
        const stopTime = startTime + duration;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, startTime);

        if (endFreq !== null) {
            osc.frequency.exponentialRampToValueAtTime(endFreq, stopTime);
        }

        gain.gain.setValueAtTime(volume, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, stopTime);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(stopTime);
    }

    // Soft UI Button Interaction Click
    playClick() {
        this.playTone({ freq: 520, endFreq: 680, type: "triangle", duration: 0.055, volume: 0.08 });
    }

    // Category Deck Selection Chime
    playCategorySelect() {
        this.playTone({ freq: 440, endFreq: 587.33, type: "triangle", duration: 0.09, delay: 0, volume: 0.12 });
        this.playTone({ freq: 659.25, endFreq: 880, type: "square", duration: 0.13, delay: 0.07, volume: 0.11 });
    }

    // Game Start ("LET'S ROLL!")
    playGameStart() {
        const notes = [392.00, 523.25, 659.25, 783.99];
        notes.forEach((freq, i) => {
            this.playTone({ freq, type: "square", duration: 0.11, delay: i * 0.065, volume: 0.12 });
        });
    }

    // Standard Countdown Tick
    playCountdownTick() {
        this.playTone({ freq: 440, type: "sine", duration: 0.08, volume: 0.1 });
    }

    // Final 3 Seconds Urgent Tick
    playFinalSecondsTick() {
        this.playTone({ freq: 660, endFreq: 580, type: "square", duration: 0.09, volume: 0.11 });
    }

    // Countdown Finished / Buzzer Unlocked ("GO!")
    playBuzzOpen() {
        this.playTone({ freq: 880, endFreq: 1046.5, type: "triangle", duration: 0.22, volume: 0.16 });
    }

    // Dramatic Ace Attorney-Style Buzzer Cut-In Impact
    playRaiseHand() {
        this.playTone({ freq: 220, endFreq: 880, type: "sawtooth", duration: 0.11, delay: 0, volume: 0.14 });
        this.playTone({ freq: 587.33, type: "square", duration: 0.22, delay: 0.09, volume: 0.13 });
        this.playTone({ freq: 880.00, type: "square", duration: 0.24, delay: 0.09, volume: 0.13 });
        this.playTone({ freq: 1174.66, type: "triangle", duration: 0.28, delay: 0.12, volume: 0.15 });
    }

    // Correct Answer Chime
    playCorrect() {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
            this.playTone({
                freq,
                type: "triangle",
                duration: idx === notes.length - 1 ? 0.35 : 0.1,
                delay: idx * 0.08,
                volume: 0.18
            });
        });
    }

    // Score Increase / Flying Orb Impact
    playScoreHit() {
        this.playTone({ freq: 987.77, type: "square", duration: 0.08, delay: 0, volume: 0.13 });
        this.playTone({ freq: 1318.51, type: "square", duration: 0.24, delay: 0.08, volume: 0.15 });
    }

    // Leader Overtake Power Chime
    playOvertake() {
        const notes = [587.33, 783.99, 1174.66];
        notes.forEach((freq, i) => {
            this.playTone({ freq, type: "triangle", duration: 0.14, delay: i * 0.07, volume: 0.15 });
        });
    }

    // Wrong Answer + Chain Lock
    playWrong() {
        this.playTone({ freq: 140, endFreq: 55, type: "triangle", duration: 0.18, delay: 0, volume: 0.18 });
        this.playTone({
            freq: 311.13,
            endFreq: 261.63,
            type: "sawtooth",
            duration: 0.26,
            delay: 0.08,
            volume: 0.13
        });
        this.playTone({
            freq: 246.94,
            endFreq: 164.81,
            type: "sawtooth",
            duration: 0.45,
            delay: 0.35,
            volume: 0.13
        });
    }

    // Victory Fanfare + Trophy Grab Sparkle
    playLeaderboardFanfare() {
        const sequence = [
            { freq: 523.25, duration: 0.12, delay: 0.00 },
            { freq: 523.25, duration: 0.12, delay: 0.14 },
            { freq: 523.25, duration: 0.12, delay: 0.28 },
            { freq: 659.25, duration: 0.28, delay: 0.42 },
            { freq: 587.33, duration: 0.18, delay: 0.72 },
            { freq: 783.99, duration: 0.55, delay: 0.92 },
            { freq: 1046.50, duration: 0.45, delay: 1.15 }
        ];

        sequence.forEach((note) => {
            this.playTone({
                freq: note.freq,
                type: "square",
                duration: note.duration,
                delay: note.delay,
                volume: 0.14
            });
        });
    }

    // Tie Game Riff
    playTie() {
        const sequence = [
            { freq: 440.00, duration: 0.14, delay: 0.00 },
            { freq: 523.25, duration: 0.14, delay: 0.16 },
            { freq: 493.88, duration: 0.38, delay: 0.32 }
        ];
        sequence.forEach((n) => {
            this.playTone({ freq: n.freq, type: "triangle", duration: n.duration, delay: n.delay, volume: 0.14 });
        });
    }
}

export const sfx = new SoundManager();