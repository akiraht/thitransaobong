/**
 * Audio Engine nhẹ & êm ái chạy 100% offline trên trình duyệt / PWA (iOS & Android):
 * 1. Lofi Ambient Music Box (Anh Tia Chớp): Hợp âm Rhodes/Pad ấm qua Lowpass Filter, không chói tai.
 * 2. White Noise / Ambient Ru Ngủ (Bé Đom Đóm): Mưa rơi êm dịu, Đêm hè gió nhẹ, Lửa trại tí tách.
 */

class TownAudioEngine {
  constructor() {
    this.ctx = null;
    this.lofiTimer = null;
    this.isLofiPlaying = false;

    this.ambientNodes = null;
    this.activeAmbientType = null; // null | 'rain' | 'night_breeze' | 'fireplace'
    this.ambientVolume = 0.45;
  }

  ensureContext() {
    if (typeof window === 'undefined') return null;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!this.ctx) {
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // ==================== 1. LOFI AMBIENT CHORDS (ANH TIA CHỚP) ====================
  startLofi() {
    const ctx = this.ensureContext();
    if (!ctx) return false;
    if (this.isLofiPlaying) return true;

    // Vòng hợp âm Lofi êm dịu: Fmaj7 -> Em7 -> Dm7 -> Cmaj7
    const chords = [
      [174.61, 220.0, 261.63, 329.63], // Fmaj7
      [164.81, 196.0, 246.94, 293.66], // Em7
      [146.83, 174.61, 220.0, 261.63], // Dm7
      [130.81, 164.81, 196.0, 246.94], // Cmaj7
    ];
    const melodyNotes = [523.25, 440.0, 392.0, 329.63, 349.23, 392.0, 440.0, 523.25];

    let step = 0;

    const playBar = () => {
      if (!this.ctx || !this.isLofiPlaying) return;
      const now = this.ctx.currentTime;
      const chord = chords[step % chords.length];

      // Master warm lowpass filter cho chất âm Lofi mềm mại
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(920, now);
      filter.Q.setValueAtTime(0.7, now);
      filter.connect(this.ctx.destination);

      chord.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0.0001, now + idx * 0.06);
        gain.gain.linearRampToValueAtTime(0.022, now + idx * 0.06 + 0.35);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.1);

        osc.connect(gain);
        gain.connect(filter);
        osc.start(now + idx * 0.06);
        osc.stop(now + 3.2);
      });

      // Điểm xuyết 1-2 nốt chuông hộp nhạc nhẹ
      const melFreq = melodyNotes[step % melodyNotes.length];
      const melOsc = this.ctx.createOscillator();
      const melGain = this.ctx.createGain();
      melOsc.type = 'sine';
      melOsc.frequency.setValueAtTime(melFreq, now + 0.9);
      melGain.gain.setValueAtTime(0.0001, now + 0.9);
      melGain.gain.linearRampToValueAtTime(0.018, now + 1.0);
      melGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.6);
      melOsc.connect(melGain);
      melGain.connect(filter);
      melOsc.start(now + 0.9);
      melOsc.stop(now + 2.7);

      step += 1;
    };

    this.isLofiPlaying = true;
    playBar();
    this.lofiTimer = setInterval(playBar, 3200);
    return true;
  }

  stopLofi() {
    this.isLofiPlaying = false;
    if (this.lofiTimer) {
      clearInterval(this.lofiTimer);
      this.lofiTimer = null;
    }
  }

  // ==================== 2. WHITE NOISE / AMBIENT RU NGỦ (BÉ ĐOM ĐÓM) ====================
  createNoiseBuffer(ctx, durationSec = 3) {
    const sampleRate = ctx.sampleRate;
    const length = sampleRate * durationSec;
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    // Brown/Pink hybrid noise mềm tai, không chói gắt
    let lastOut = 0.0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.04 * white) / 1.04;
      lastOut = data[i];
      data[i] *= 2.8;
    }
    return buffer;
  }

  startAmbient(type = 'rain', volume = this.ambientVolume) {
    const ctx = this.ensureContext();
    if (!ctx) return false;

    this.stopAmbient();
    this.ambientVolume = volume;
    this.activeAmbientType = type;

    const now = ctx.currentTime;
    const source = ctx.createBufferSource();
    source.buffer = this.createNoiseBuffer(ctx, 4);
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    let lfo = null;
    let crackleTimer = null;

    if (type === 'rain') {
      // Mưa rơi trên mái hiên: bandpass mượt 650Hz
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(680, now);
      filter.Q.setValueAtTime(0.45, now);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(volume * 0.22, now + 0.8);
    } else if (type === 'night_breeze') {
      // Đêm hè gió nhẹ: lowpass dịu lượn sóng theo LFO chậm
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(340, now);
      lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(0.16, now);
      lfoGain.gain.setValueAtTime(140, now);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start(now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(volume * 0.26, now + 0.8);
    } else {
      // Lửa trại tí tách: nền trầm ấm + tiếng tách củi ngẫu nhiên
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(220, now);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(volume * 0.28, now + 0.8);

      crackleTimer = setInterval(() => {
        if (!this.ctx || this.activeAmbientType !== 'fireplace') return;
        if (Math.random() > 0.55) return;
        const t = this.ctx.currentTime;
        const popOsc = this.ctx.createOscillator();
        const popGain = this.ctx.createGain();
        popOsc.type = 'triangle';
        popOsc.frequency.setValueAtTime(900 + Math.random() * 1400, t);
        popGain.gain.setValueAtTime(0.0001, t);
        popGain.gain.linearRampToValueAtTime(this.ambientVolume * 0.035, t + 0.004);
        popGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);
        popOsc.connect(popGain);
        popGain.connect(this.ctx.destination);
        popOsc.start(t);
        popOsc.stop(t + 0.04);
      }, 240);
    }

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start(now);

    this.ambientNodes = { source, filter, gain, lfo, crackleTimer };
    return true;
  }

  setAmbientVolume(volume) {
    this.ambientVolume = volume;
    if (this.ambientNodes?.gain && this.ctx) {
      const factor =
        this.activeAmbientType === 'rain'
          ? 0.22
          : this.activeAmbientType === 'night_breeze'
          ? 0.26
          : 0.28;
      this.ambientNodes.gain.gain.setTargetAtTime(volume * factor, this.ctx.currentTime, 0.1);
    }
  }

  stopAmbient() {
    if (this.ambientNodes) {
      try {
        this.ambientNodes.source?.stop();
        this.ambientNodes.lfo?.stop();
        if (this.ambientNodes.crackleTimer) clearInterval(this.ambientNodes.crackleTimer);
        this.ambientNodes.source?.disconnect();
        this.ambientNodes.gain?.disconnect();
      } catch {}
      this.ambientNodes = null;
    }
    this.activeAmbientType = null;
  }
}

export const townAudio = new TownAudioEngine();
