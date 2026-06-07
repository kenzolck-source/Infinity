(function (global) {
  const manifest = global.MainGodAudioManifest || { events: {}, music: {} };
  const settingsKey = "main-god-audio-settings";
  const defaultSettings = { muted: false, volume: 0.72 };
  let settings = loadSettings();
  let unlocked = false;
  let pendingMusicName = null;
  let currentMusicName = null;
  let currentMusic = null;

  const sfx = Object.fromEntries(Object.entries(manifest.events).map(([name, entry]) => [name, makeAudio(entry.src)]));
  const music = Object.fromEntries(Object.entries(manifest.music).map(([name, entry]) => {
    const audio = makeAudio(entry.src);
    audio.loop = true;
    return [name, audio];
  }));

  function makeAudio(src) {
    const audio = new Audio(src);
    audio.preload = "auto";
    return audio;
  }

  function loadSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem(settingsKey) || "null");
      return {
        muted: Boolean(saved?.muted),
        volume: clamp(Number(saved?.volume ?? defaultSettings.volume), 0, 1)
      };
    } catch {
      return { ...defaultSettings };
    }
  }

  function saveSettings() {
    try {
      localStorage.setItem(settingsKey, JSON.stringify(settings));
    } catch {
      // file:// storage can be unavailable; audio still works for this session.
    }
  }

  function unlock() {
    if (unlocked) return;
    unlocked = true;
    if (pendingMusicName) startMusic(pendingMusicName);
  }

  function play(name, payload = {}) {
    if (settings.muted) return;
    if (!unlocked) unlock();
    const entry = manifest.events[name];
    const base = sfx[name];
    if (!entry || !base) return;
    const audio = base.cloneNode(true);
    const gain = clamp(Number(payload.gain ?? 1), 0, 2);
    const jitter = Number(entry.rateJitter || 0);
    audio.volume = clamp(settings.volume * Number(entry.volume || 1) * gain, 0, 1);
    audio.playbackRate = jitter ? 1 + (Math.random() * 2 - 1) * jitter : 1;
    audio.play().catch(() => {});
  }

  function syncMusic(screen) {
    const name = musicNameForScreen(screen);
    pendingMusicName = name;
    if (!unlocked || settings.muted) return;
    startMusic(name);
  }

  function musicNameForScreen(screen) {
    if (screen === "combat") return "music.combat";
    if (screen === "map" || screen === "scenario-intro") return "music.map";
    return "music.hub";
  }

  function startMusic(name) {
    if (!name || !music[name]) return;
    if (currentMusicName === name) {
      setMusicVolume(currentMusic, targetMusicVolume(name));
      if (currentMusic.paused && !settings.muted) currentMusic.play().catch(() => {});
      return;
    }
    const previous = currentMusic;
    currentMusicName = name;
    currentMusic = music[name];
    currentMusic.currentTime = currentMusic.currentTime || 0;
    currentMusic.volume = 0;
    currentMusic.play().catch(() => {});
    fadeTo(currentMusic, targetMusicVolume(name), 450);
    if (previous) {
      fadeTo(previous, 0, 360, () => {
        previous.pause();
        previous.currentTime = 0;
      });
    }
  }

  function targetMusicVolume(name) {
    return settings.muted ? 0 : clamp(settings.volume * Number(manifest.music[name]?.volume || 0.35), 0, 1);
  }

  function setMusicVolume(audio, volume) {
    if (!audio) return;
    audio.volume = clamp(volume, 0, 1);
  }

  function fadeTo(audio, target, duration, done) {
    if (!audio) return;
    if (audio.fadeTimer) clearInterval(audio.fadeTimer);
    const start = audio.volume;
    const startedAt = performance.now();
    audio.fadeTimer = setInterval(() => {
      const progress = clamp((performance.now() - startedAt) / duration, 0, 1);
      audio.volume = start + (target - start) * progress;
      if (progress >= 1) {
        clearInterval(audio.fadeTimer);
        audio.fadeTimer = null;
        if (done) done();
      }
    }, 32);
  }

  function setMuted(value) {
    settings.muted = Boolean(value);
    saveSettings();
    if (settings.muted) {
      Object.values(music).forEach((audio) => fadeTo(audio, 0, 180, () => audio.pause()));
      return;
    }
    unlock();
    if (pendingMusicName) startMusic(pendingMusicName);
  }

  function setVolume(value) {
    settings.volume = clamp(Number(value), 0, 1);
    saveSettings();
    if (currentMusicName && currentMusic) setMusicVolume(currentMusic, targetMusicVolume(currentMusicName));
  }

  function getState() {
    return { muted: settings.muted, volume: settings.volume, unlocked };
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
  }

  global.MainGodAudio = {
    manifest,
    getState,
    play,
    syncMusic,
    setMuted,
    setVolume,
    unlock
  };
})(globalThis);
