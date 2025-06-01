// ZZFX - Zuper Zmall Zound Zynth
// Micro JavaScript Sound FX System
const zzfx = (...t) => {
    let e = 2,
        a = .05,
        n = 220,
        o = 0,
        r = 0,
        s = .1,
        i = 0,
        z = 1,
        u = 0,
        c = 0,
        f = 0,
        l = 0,
        b = 0,
        d = 0,
        p = 0,
        g = 0,
        S = 0,
        m = 1,
        h = 0,
        x = 0,
        v = 0,
        w = 0,
        A = 0;
    
    const y = new AudioContext(),
        k = y.createGain();
    k.connect(y.destination);
    
    const q = y.createOscillator();
    q.connect(k);
    
    return q;
};

// Sound Effects
const sounds = {
    engine: () => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(100, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
    },
    
    crash: () => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.5);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
    },
    
    brake: () => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
    }
};

// Background Music System
class MusicPlayer {
    constructor() {
        this.isPlaying = false;
        this.audioContext = null;
        this.currentOscillator = null;
    }
    
    start() {
        if (this.isPlaying) return;
        
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.isPlaying = true;
        this.playMelody();
    }
    
    stop() {
        if (this.currentOscillator) {
            this.currentOscillator.stop();
        }
        this.isPlaying = false;
    }
    
    playMelody() {
        if (!this.isPlaying) return;
        
        const notes = [262, 294, 330, 349, 392, 440, 494, 523]; // C major scale
        const noteIndex = Math.floor(Math.random() * notes.length);
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(notes[noteIndex], this.audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        
        this.currentOscillator = oscillator;
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.5);
        
        setTimeout(() => this.playMelody(), 1000);
    }
}

const musicPlayer = new MusicPlayer();
