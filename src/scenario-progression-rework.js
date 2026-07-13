(function (global) {
  const data = global.MainGodData;
  if (!data) return;

  const fixedOpeningSequence = ["alien", "juon", "mummy-curse", "jurassic-island"];
  const bands = [
    {
      id: "opening",
      name: "原劇情前段",
      rank: 0,
      hint: "前四場固定體驗，保留無限恐怖原本的入門節奏。",
      ids: fixedOpeningSequence
    },
    {
      id: "standard",
      name: "中危亂序池",
      rank: 1,
      hint: "完成前段後開始被主神打亂投放，適合補角色與牌組厚度。",
      ids: [
        "abyssal-ark",
        "evernight-castle",
        "demon-frontier",
        "main-god-trial",
        "starship-troopers",
        "avp-pyramid",
        "nightmare-elm",
        "lotr-war",
        "rumbling-finale",
        "infinity-castle",
        "naruto-final-valley",
        "bleach-false-karakura",
        "gintama-yoshiwara",
        "gintama-final-war",
        "chainsaw-man-reze-arc",
        "wind-breaker-keel-brawl",
        "mashle-divine-visionary",
        "blue-exorcist-blue-night"
      ]
    },
    {
      id: "hard",
      name: "高危亂序池",
      rank: 2,
      hint: "敵方數值與事件壓力較高，會隨通關數逐步混入抽選池。",
      ids: [
        "avengers-new-york",
        "batman-v-superman",
        "devil-may-cry-5",
        "final-destination",
        "jinyong-heroic-peak",
        "pacific-rim-breach",
        "fury-road-war-rig",
        "resident-evil-6-c-virus",
        "jujutsu-kaisen-shibuya",
        "fullmetal-alchemist-finale",
        "genshin-liyue-childe",
        "genshin-inazuma-vision-hunt",
        "cyberpunk-edgerunners-night-city",
        "nioh-yokai-sengoku",
        "kaiju-no-8-defense-force",
        "dandadan-evil-eye",
        "sakamoto-days-assassin-order",
        "gachiakuta-pit-cleaners",
        "my-hero-final-war",
        "fire-force-final-pillar",
        "fairy-tail-100-years-quest",
        "four-knights-apocalypse-camelot"
      ]
    },
    {
      id: "nightmare",
      name: "惡夢亂序池",
      rank: 3,
      hint: "後期高回報劇本，建議隊伍永久強化與羈絆成形後再深入。",
      ids: [
        "black-myth-wukong-relics",
        "solo-leveling-jeju-raid",
        "hells-paradise-shinsenkyo",
        "black-clover-spade-raid",
        "shangri-la-frontier-lycagon",
        "slime-walpurgis-clash",
        "frieren-aura-exam",
        "overlord-holy-kingdom",
        "shield-hero-qten-lo"
      ]
    },
    {
      id: "super-hard",
      name: "超困難劇本",
      rank: 4,
      hint: "手動入口保留，數值不吃普通動態進度壓力。",
      ids: ["elden-ring-hell-run"]
    }
  ];

  const bandByScenarioId = Object.fromEntries(bands.flatMap((band) => band.ids.map((id) => [id, band])));
  const fallbackBand = bands.find((band) => band.id === "hard");

  data.scenarioProgression = {
    fixedOpeningSequence,
    shuffleSalt: "main-god-chaos-route-v2",
    infiniteUnlockClearCount: 12,
    unlockTiers: [
      { bandId: "standard", minClears: 4, baseCount: 6, perClear: 2 },
      { bandId: "hard", minClears: 7, baseCount: 5, perClear: 2 },
      { bandId: "nightmare", minClears: 12, baseCount: 3, perClear: 2 },
      { bandId: "super-hard", minClears: 16, baseCount: 1, perClear: 1 }
    ],
    bands: bands.map(({ id, name, rank, hint }) => ({ id, name, rank, hint }))
  };

  data.scenarios.forEach((scenario) => {
    if (scenario.id === "tutorial") {
      scenario.sequenceGroup = "tutorial";
      return;
    }
    const band = bandByScenarioId[scenario.id] || fallbackBand;
    scenario.sequenceGroup = band.id === "opening" ? "opening" : "shuffle";
    scenario.difficultyBand = band.id;
    scenario.difficultyRank = band.rank;
    scenario.entryLabel = band.name;
    scenario.entryHint = band.hint;
  });

  const upsertTeamUpgrade = (definition) => {
    const existing = data.permanentUpgrades.find((upgrade) => upgrade.id === definition.id);
    if (existing) Object.assign(existing, definition);
    else data.permanentUpgrades.push(definition);
  };

  [
    {
      id: "team-opening-block",
      name: "協同防護",
      text: "每場戰鬥開始時全隊獲得 4 護甲。",
      rewardPointCost: 700,
      sideStoryCost: 1,
      effects: { openingBlockAll: 4 }
    },
    {
      id: "team-opening-draw",
      name: "預先部署",
      text: "每場戰鬥第一回合額外抽 1 張牌。",
      rewardPointCost: 1800,
      sideStoryCost: 2,
      effects: { openingDraw: 1 }
    },
    {
      id: "team-opening-energy",
      name: "壓縮整備",
      text: "每場戰鬥第一回合能量 +1。",
      rewardPointCost: 2200,
      sideStoryCost: 2,
      effects: { openingEnergy: 1 }
    },
    {
      id: "team-field-aegis",
      name: "輪換盾線",
      text: "每回合開始時全隊獲得 1 護甲。",
      rewardPointCost: 1600,
      sideStoryCost: 2,
      effects: { turnBlockAll: 1 }
    },
    {
      id: "team-field-medic",
      name: "戰地醫療組",
      text: "每回合開始時全隊恢復 1 生命並降低 1 壓力。",
      rewardPointCost: 2400,
      sideStoryCost: 2,
      effects: { turnHealAll: 1, turnReduceStressAll: 1 }
    },
    {
      id: "team-focus-fire",
      name: "集中火線",
      text: "所有攻擊牌傷害 +1。",
      rewardPointCost: 2600,
      sideStoryCost: 2,
      effects: { attackBonus: 1 }
    },
    {
      id: "team-status-exploit",
      name: "弱點標記",
      text: "攻擊帶有負面狀態的敵人時傷害 +2。",
      rewardPointCost: 2800,
      sideStoryCost: 2,
      effects: { statusExploitBonus: 2 }
    },
    {
      id: "team-tactical-cycle",
      name: "戰術循環",
      text: "每回合第一張戰術牌額外抽 1 張牌。",
      rewardPointCost: 3200,
      sideStoryCost: 3,
      effects: { firstTacticDraw: 1 }
    },
    {
      id: "team-fifth-card-relay",
      name: "五拍接力",
      text: "每回合第 5 張牌讓全隊獲得 2 護甲。",
      rewardPointCost: 3000,
      sideStoryCost: 3,
      effects: { fifthCardBlockAll: 2 }
    },
    {
      id: "team-evasive-opening",
      name: "預判迴避",
      text: "每場戰鬥開始時全隊獲得 1 迴避。",
      rewardPointCost: 2600,
      sideStoryCost: 2,
      effects: { openingEvade: 1 }
    }
  ].forEach(upsertTeamUpgrade);
})(globalThis);
