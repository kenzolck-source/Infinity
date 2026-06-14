(function (global) {
  const mainGodMusicPool = [
    "./src/assets/audio/bgm-main-god-plaza-a.mp3",
    "./src/assets/audio/bgm-main-god-plaza-b.mp3",
    "./src/assets/audio/bgm-black-door-patrol-a.mp3",
    "./src/assets/audio/bgm-black-door-patrol-b.mp3",
    "./src/assets/audio/bgm-ashen-card-loop-a.mp3",
    "./src/assets/audio/bgm-ashen-card-loop-b.mp3"
  ];

  global.MainGodAudioManifest = {
    events: {
      "card.draw": { src: "./src/assets/audio/card-draw.wav", volume: 0.58, rateJitter: 0.04 },
      "card.reward": { src: "./src/assets/audio/card-reward.wav", volume: 0.62, rateJitter: 0.03 },
      "card.play.attack": { src: "./src/assets/audio/card-play-attack.wav", volume: 0.64, rateJitter: 0.05 },
      "card.play.guard": { src: "./src/assets/audio/card-play-guard.wav", volume: 0.5, rateJitter: 0.03 },
      "card.play.support": { src: "./src/assets/audio/card-play-support.wav", volume: 0.48, rateJitter: 0.03 },
      "card.play.tactic": { src: "./src/assets/audio/card-play-tactic.wav", volume: 0.46, rateJitter: 0.05 },
      "combat.hit.light": { src: "./src/assets/audio/combat-hit-light.wav", volume: 0.58, rateJitter: 0.07 },
      "combat.hit.heavy": { src: "./src/assets/audio/combat-hit-heavy.wav", volume: 0.7, rateJitter: 0.04 },
      "combat.hit.aoe": { src: "./src/assets/audio/combat-hit-aoe.wav", volume: 0.68, rateJitter: 0.04 },
      "combat.enemy.break": { src: "./src/assets/audio/combat-enemy-break.wav", volume: 0.7, rateJitter: 0.03 },
      "combat.victory": { src: "./src/assets/audio/combat-victory.wav", volume: 0.66, rateJitter: 0 },
      "combat.defeat": { src: "./src/assets/audio/combat-defeat.wav", volume: 0.62, rateJitter: 0 }
    },
    music: {
      "music.hub": { src: mainGodMusicPool[0], playlist: mainGodMusicPool, volume: 0.26 },
      "music.map": { src: mainGodMusicPool[0], playlist: mainGodMusicPool, volume: 0.26 },
      "music.combat": { src: mainGodMusicPool[0], playlist: mainGodMusicPool, volume: 0.3 }
    }
  };
})(globalThis);
