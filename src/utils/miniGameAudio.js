/**
 * HỆ THỐNG NHẠC NỀN RIÊNG CHO TỪNG MINI-GAME KAWAII
 * - Ưu tiên phát file MP3 tùy chỉnh đặt trong `public/audio/minigames/bgm-{gameId}.mp3`.
 * - Nếu chưa có file MP3, tự động phát nhạc nền Web Audio API dịu nhẹ, phù hợp nhịp điệu từng game.
 */

const MUTE_STORAGE_KEY = 'TTSB_MINIGAME_BGM_MUTED';

export const MINI_GAME_BGM_FILES = {
  caro: '/audio/minigames/bgm-caro.mp3',
  baking: '/audio/minigames/bgm-baking.mp3',
  puzzle: '/audio/minigames/bgm-puzzle.mp3',
  racing: '/audio/minigames/bgm-racing.mp3',
  duel: '/audio/minigames/bgm-duel.mp3',
  flappy: '/audio/minigames/bgm-flappy.mp3',
  memory: '/audio/minigames/bgm-memory.mp3',
  star2048: '/audio/minigames/bgm-star2048.mp3',
  snowcone: '/audio/minigames/bgm-snowcone.mp3',
  firefly: '/audio/minigames/bgm-firefly.mp3',
};

// Giai điệu Web Audio dự phòng riêng theo không khí từng mini-game (Hz, thời lượng ms)
const SYNTH_PATTERNS = {
  caro: {
    tempoMs: 420,
    wave: 'sine',
    gain: 0.05,
    notes: [523.25, 659.25, 783.99, 659.25, 587.33, 659.25, 523.25, 0, 440, 523.25, 659.25, 523.25, 493.88, 587.33, 523.25, 0],
  },
  baking: {
    tempoMs: 260,
    wave: 'triangle',
    gain: 0.055,
    notes: [523.25, 659.25, 783.99, 880, 783.99, 659.25, 587.33, 659.25, 698.46, 880, 783.99, 659.25, 587.33, 493.88, 523.25, 0],
  },
  puzzle: {
    tempoMs: 480,
    wave: 'sine',
    gain: 0.045,
    notes: [392, 523.25, 659.25, 783.99, 659.25, 523.25, 440, 523.25, 392, 493.88, 587.33, 783.99, 659.25, 587.33, 523.25, 0],
  },
  racing: {
    tempoMs: 185,
    wave: 'triangle',
    gain: 0.06,
    notes: [523.25, 523.25, 659.25, 783.99, 880, 783.99, 659.25, 783.99, 587.33, 659.25, 783.99, 1046.5, 880, 783.99, 659.25, 587.33],
  },
  duel: {
    tempoMs: 240,
    wave: 'triangle',
    gain: 0.055,
    notes: [440, 523.25, 659.25, 523.25, 587.33, 659.25, 783.99, 659.25, 523.25, 659.25, 587.33, 493.88, 440, 523.25, 440, 0],
  },
  flappy: {
    tempoMs: 205,
    wave: 'sine',
    gain: 0.055,
    notes: [659.25, 783.99, 1046.5, 783.99, 880, 1046.5, 783.99, 659.25, 587.33, 659.25, 783.99, 659.25, 523.25, 587.33, 659.25, 0],
  },
  memory: {
    tempoMs: 390,
    wave: 'sine',
    gain: 0.048,
    notes: [523.25, 587.33, 659.25, 783.99, 659.25, 587.33, 523.25, 440, 493.88, 587.33, 659.25, 587.33, 523.25, 0, 392, 0],
  },
  star2048: {
    tempoMs: 320,
    wave: 'triangle',
    gain: 0.048,
    notes: [440, 523.25, 659.25, 783.99, 659.25, 523.25, 587.33, 659.25, 440, 523.25, 587.33, 659.25, 523.25, 493.88, 440, 0],
  },
  snowcone: {
    tempoMs: 215,
    wave: 'triangle',
    gain: 0.055,
    notes: [659.25, 783.99, 880, 783.99, 1046.5, 880, 783.99, 659.25, 587.33, 659.25, 783.99, 659.25, 523.25, 659.25, 587.33, 0],
  },
  firefly: {
    tempoMs: 270,
    wave: 'sine',
    gain: 0.05,
    notes: [783.99, 659.25, 880, 783.99, 1046.5, 880, 783.99, 659.25, 587.33, 783.99, 659.25, 523.25, 587.33, 659.25, 523.25, 0],
  },
};

export function loadBgmMuted() {
  try {
    return localStorage.getItem(MUTE_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function saveBgmMuted(muted) {
  try {
    localStorage.setItem(MUTE_STORAGE_KEY, muted ? '1' : '0');
  } catch {
    // ignore
  }
}

export function createMiniGameBgmController(gameId) {
  const fileUrl = MINI_GAME_BGM_FILES[gameId] || null;
  const pattern = SYNTH_PATTERNS[gameId] || SYNTH_PATTERNS.caro;

  let disposed = false;
  let muted = loadBgmMuted();
  let mode = 'idle'; // 'idle' | 'audio' | 'synth'
  let audioEl = null;
  let audioCtx = null;
  let synthTimer = null;
  let noteIndex = 0;

  const stopSynth = () => {
    if (synthTimer) {
      clearInterval(synthTimer);
      synthTimer = null;
    }
  };

  const startSynth = () => {
    if (disposed || muted) return;
    stopSynth();
    mode = 'synth';
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtx) audioCtx = new AudioCtx();
      if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
      }

      const playStep = () => {
        if (disposed || muted || !audioCtx || audioCtx.state !== 'running') return;
        const freq = pattern.notes[noteIndex % pattern.notes.length];
        noteIndex += 1;
        if (!freq) return;

        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.type = pattern.wave;
        osc.frequency.setValueAtTime(freq, now);

        const dur = (pattern.tempoMs / 1000) * 0.85;
        gainNode.gain.setValueAtTime(0.0001, now);
        gainNode.gain.exponentialRampToValueAtTime(pattern.gain, now + 0.03);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + dur);

        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + dur + 0.02);
      };

      playStep();
      synthTimer = setInterval(playStep, pattern.tempoMs);
    } catch {
      // ignore Web Audio errors
    }
  };

  const tryPlay = () => {
    if (disposed || muted) return;

    if (mode === 'audio' && audioEl) {
      audioEl.play().catch(() => {});
      return;
    }
    if (mode === 'synth') {
      startSynth();
      return;
    }

    // Lần đầu: kiểm tra file MP3 tùy chỉnh trước, nếu không có (404/lỗi) thì tự chuyển sang nhạc synth
    if (fileUrl) {
      const el = new Audio(fileUrl);
      el.loop = true;
      el.volume = 0.36;
      audioEl = el;

      const fallbackToSynth = () => {
        if (disposed) return;
        audioEl = null;
        startSynth();
      };

      el.addEventListener('error', fallbackToSynth, { once: true });
      el.play()
        .then(() => {
          if (disposed || muted) {
            el.pause();
            return;
          }
          mode = 'audio';
        })
        .catch(() => {
          // Có thể bị chặn autoplay hoặc file chưa tồn tại; nếu lỗi mạng sẽ vào event 'error'
          if (el.error) fallbackToSynth();
        });
    } else {
      startSynth();
    }
  };

  const setMuted = (nextMuted) => {
    muted = Boolean(nextMuted);
    saveBgmMuted(muted);
    if (muted) {
      if (audioEl) audioEl.pause();
      stopSynth();
    } else {
      tryPlay();
    }
  };

  const destroy = () => {
    disposed = true;
    stopSynth();
    if (audioEl) {
      audioEl.pause();
      audioEl.src = '';
      audioEl = null;
    }
    if (audioCtx) {
      audioCtx.close().catch(() => {});
      audioCtx = null;
    }
  };

  return {
    tryPlay,
    setMuted,
    isMuted: () => muted,
    destroy,
  };
}
