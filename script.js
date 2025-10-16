let currentIndex = 0;
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');
const totalSlides = slides.length;
let autoPlayInterval;

function createSparkles() {
    const sparklesContainer = document.getElementById('sparkles');
    const sparkleEmojis = ['✨', '⭐', '💫', '🌟'];

    for (let i = 0; i < 30; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.textContent = sparkleEmojis[Math.floor(Math.random() * sparkleEmojis.length)];
        sparkle.style.left = Math.random() * 100 + '%';
        sparkle.style.top = Math.random() * 100 + '%';
        sparkle.style.animationDelay = Math.random() * 5 + 's';
        sparkle.style.animationDuration = (5 + Math.random() * 10) + 's';
        sparklesContainer.appendChild(sparkle);
    }
}

function showSlide(index) {
    slides.forEach((slide, i) => {
        if (i === index) {
            slide.classList.add('active');
        } else {
            slide.classList.remove('active');
        }
    });

    dots.forEach((dot, i) => {
        if (i === index) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });

    currentIndex = index;
}

function nextSlide() {
    const nextIndex = (currentIndex + 1) % totalSlides;
    showSlide(nextIndex);
}

function startAutoPlay() {
    autoPlayInterval = setInterval(nextSlide, 4000);
}

function stopAutoPlay() {
    clearInterval(autoPlayInterval);
}

dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        stopAutoPlay();
        showSlide(index);
        startAutoPlay();
    });
});

createSparkles();
startAutoPlay();


let audioCtx;
let isPlaying = false;
let scheduledOscillators = [];
let loopTimer = null;

const HB_NOTES = [
    392, 392, 440, 392, 523, 494,
    392, 392, 440, 392, 587, 523,
    392, 392, 784, 659, 523, 494, 440,
    698, 698, 659, 523, 587, 523
];
const HB_DURATIONS = [
    0.4,0.4,0.8,0.8,0.8,1.2,
    0.4,0.4,0.8,0.8,0.8,1.2,
    0.4,0.4,0.8,0.4,0.4,0.8,1.2,
    0.4,0.4,0.8,0.8,0.8,1.6
];

function playSequence() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioCtx.currentTime;
    let t = now + 0.05;
    for (let i = 0; i < HB_NOTES.length; i++) {
        const freq = HB_NOTES[i];
        const dur = HB_DURATIONS[i] || 0.5;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.12, t + 0.02);
        gain.gain.linearRampToValueAtTime(0, t + dur - 0.02);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start(t);
        osc.stop(t + dur);
        scheduledOscillators.push(osc);
        t += dur;
    }
    return t - now;
}

function playHappyBirthday() {
    if (isPlaying) return;
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    isPlaying = true;
    updatePlayButton();

    const duration = playSequence();
    loopTimer = setTimeout(function repeater() {
        if (!isPlaying) return;
        const d = playSequence();
        loopTimer = setTimeout(repeater, d * 1000);
    }, duration * 1000);
}

function stopHappyBirthday() {
    if (loopTimer) {
        clearTimeout(loopTimer);
        loopTimer = null;
    }

    try {
        scheduledOscillators.forEach(osc => {
            try { osc.disconnect(); } catch (e) {}
        });
    } catch (e) {}
    scheduledOscillators = [];


    if (audioCtx) {
        try { audioCtx.close(); } catch (e) {}
        audioCtx = null;
    }

    isPlaying = false;
    updatePlayButton();
}

function updatePlayButton() {
    const btn = document.getElementById('playMusicBtn');
    if (!btn) return;
    btn.textContent = isPlaying ? '⏹️ Detener música' : '▶️ Reproducir música';
}

document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('playMusicBtn');
    if (!btn) return;
    btn.addEventListener('click', () => {
        if (!isPlaying) {
            playHappyBirthday();
        } else {
            stopHappyBirthday();
        }
    });
});

function attemptAutoPlayMusic() {
    if (isPlaying) return;

    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') {
            const startOnGesture = () => {
                document.removeEventListener('click', startOnGesture, true);
                document.removeEventListener('touchstart', startOnGesture, true);
                document.removeEventListener('keydown', startOnGesture, true);
                audioCtx.resume().then(() => {
                    playHappyBirthday();
                }).catch(() => {
                });
            };

            document.addEventListener('click', startOnGesture, { passive: true, capture: true });
            document.addEventListener('touchstart', startOnGesture, { passive: true, capture: true });
            document.addEventListener('keydown', startOnGesture, { capture: true });
        } else {
            playHappyBirthday();
        }
    } catch (e) {
        console.warn('Autoplay no disponible:', e);
    }
}

attemptAutoPlayMusic();
