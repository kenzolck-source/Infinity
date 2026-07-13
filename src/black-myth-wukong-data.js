(function (global) {
  const data = global.MainGodData;
  if (!data) return;

  const scenarioId = "black-myth-wukong-relics";
  const factionId = "black-myth-wukong";
  const sourceName = "黑神話：悟空";

  const characters = [
    { id: "bmw-destined-one", name: "天命人", role: "六根重收行者", faction: sourceName, factionId, maxHp: 124, stress: 16, energyContribution: 0, passiveId: "first-attack-pierce", passiveText: "隱藏人物。每回合第一張攻擊牌穿透護甲；棍勢會把妖王的外殼敲出破綻。", signatureCardId: "bmw-destined-staff-chain", unlock: "hidden-bmw-destined-one", hidden: true },
    { id: "bmw-true-great-sage", name: "真大聖", role: "齊天大聖真身", faction: sourceName, factionId, maxHp: 160, stress: 6, energyContribution: 2, passiveId: "opening-overdrive", passiveText: "超高難隱藏人物。第一回合額外獲得 2 能量但自身壓力 +8；真大聖棍勢會把開場直接推進終局。", signatureCardId: "bmw-true-sage-ruyi-strike", unlock: "hidden-bmw-true-great-sage", hidden: true },
    { id: "bmw-zhu-bajie", name: "豬八戒", role: "舊取經人與釘耙護衛", faction: sourceName, factionId, maxHp: 118, stress: 12, energyContribution: -1, passiveId: "front-guard", passiveText: "回合開始前排與生命最低隊員獲得 4 護甲；老豬嘴硬，但總會先擋在前面。", signatureCardId: "bmw-bajie-rake-charge", unlock: scenarioId },
    { id: "bmw-erlang-shen", name: "二郎神", role: "天庭真君與第三眼", faction: sourceName, factionId, maxHp: 118, stress: 8, energyContribution: 1, passiveId: "opening-forecast", passiveText: "第一回合額外抽 2 張牌；天眼會先看見天命人的下一個破綻。", signatureCardId: "bmw-erlang-heavenly-eye", unlock: scenarioId },
    { id: "bmw-bodhisattva-lingji", name: "靈吉菩薩", role: "定風珠守護者", faction: sourceName, factionId, maxHp: 86, stress: 7, energyContribution: 3, passiveId: "turn-stress-relief", passiveText: "回合開始全隊壓力 -2；定風珠能讓黃風中的恐懼慢下來。", signatureCardId: "bmw-lingji-wind-tamer", unlock: scenarioId },
    { id: "bmw-kangjin-star", name: "亢金星君", role: "雷龍星宿", faction: sourceName, factionId, maxHp: 96, stress: 11, energyContribution: 1, passiveId: "second-card-strike", passiveText: "每回合第二張牌追加 5 點傷害；雷龍轉身時，第二擊才真正落下。", signatureCardId: "bmw-kangjin-thunder-dragon", unlock: scenarioId },
    { id: "bmw-black-wind-king", name: "黑風大王", role: "黑風山妖王", faction: sourceName, factionId, maxHp: 108, stress: 14, energyContribution: 0, passiveId: "turn-block", passiveText: "回合開始全隊獲得 3 護甲；黑風裹住戰場時，敵人的第一輪衝擊會被吹偏。", signatureCardId: "bmw-black-wind-sweep", unlock: scenarioId },
    { id: "bmw-yellow-wind-sage", name: "黃風大聖", role: "黃風嶺妖聖", faction: sourceName, factionId, maxHp: 110, stress: 15, energyContribution: 0, passiveId: "first-guard-weak", passiveText: "每回合第一張防護牌使所有敵人虛弱 3 點；黃風能遮眼，也能逼敵人失準。", signatureCardId: "bmw-yellow-wind-gale", unlock: scenarioId },
    { id: "bmw-tiger-vanguard", name: "虎先鋒", role: "血池虎將", faction: sourceName, factionId, maxHp: 128, stress: 17, energyContribution: -1, passiveId: "first-heavy-attack", passiveText: "每回合第一張費用 2 以上攻擊牌傷害 +6；血池虎勢不講花招，只講壓制。", signatureCardId: "bmw-tiger-vanguard-pounce", unlock: scenarioId },
    { id: "bmw-fourth-sister", name: "四妹", role: "盤絲洞蜘蛛精", faction: sourceName, factionId, maxHp: 82, stress: 9, energyContribution: 2, passiveId: "intent-draw", passiveText: "敵人準備防禦或施壓時回合開始抽 1 張牌；蛛絲會先聽見危機靠近。", signatureCardId: "bmw-fourth-sister-spider-silk", unlock: scenarioId },
    { id: "bmw-red-boy", name: "紅孩兒", role: "三昧真火妖童", faction: sourceName, factionId, maxHp: 104, stress: 19, energyContribution: 0, passiveId: "first-attack-burn", passiveText: "每回合第一張攻擊牌使命中目標燃燒 4 點；三昧真火會把選擇燒成代價。", signatureCardId: "bmw-red-boy-samadhi-fire", unlock: scenarioId },
    { id: "bmw-yaksha-king", name: "夜叉王", role: "火焰山終局魔王", faction: sourceName, factionId, maxHp: 138, stress: 21, energyContribution: -1, passiveId: "status-exploit", passiveText: "攻擊帶有負面狀態的敵人時，傷害 +6；夜叉王只會向已經裂開的命運補上最後一刀。", signatureCardId: "bmw-yaksha-king-rampage", unlock: scenarioId }
  ];

  const cards = [
    { id: "bmw-destined-staff-chain", name: "天命連棍", category: "signature", type: "attack", rarity: "signature", cost: 2, damage: 38, pierce: true, blockAll: 5, text: "穿透護甲造成 38 傷害，全隊獲得 5 護甲。", upgrade: { damage: 56, blockAll: 9 }, tags: ["天命人", sourceName] },
    { id: "bmw-true-sage-ruyi-strike", name: "真大聖・如意終式", category: "signature", type: "attack", rarity: "signature", cost: 3, damage: 76, damageAll: 24, pierce: true, gainEnergy: 1, exhaust: true, text: "穿透護甲造成 76 傷害與 24 群體傷害，獲得 1 能量，耗盡。", upgrade: { damage: 108, damageAll: 36 }, tags: ["真大聖", sourceName] },
    { id: "bmw-bajie-rake-charge", name: "八戒釘耙衝陣", category: "signature", type: "attack", rarity: "signature", cost: 2, damage: 28, blockAll: 12, text: "造成 28 傷害，全隊獲得 12 護甲。", upgrade: { damage: 42, blockAll: 18 }, tags: ["豬八戒", sourceName] },
    { id: "bmw-erlang-heavenly-eye", name: "二郎天眼破妄", category: "signature", type: "tactic", rarity: "signature", cost: 1, weakAll: 6, draw: 2, text: "所有敵人虛弱 6 點，抽 2 張牌。", upgrade: { weakAll: 9, draw: 3 }, tags: ["二郎神", sourceName] },
    { id: "bmw-lingji-wind-tamer", name: "靈吉定風珠", category: "signature", type: "guard", rarity: "signature", cost: 1, blockAll: 16, reduceStress: 8, text: "全隊獲得 16 護甲並降低 8 壓力。", upgrade: { blockAll: 24, reduceStress: 12 }, tags: ["靈吉菩薩", sourceName] },
    { id: "bmw-kangjin-thunder-dragon", name: "亢金雷龍翻身", category: "signature", type: "attack", rarity: "signature", cost: 2, damageAll: 30, pierce: true, text: "穿透護甲，對所有敵人造成 30 傷害。", upgrade: { damageAll: 44 }, tags: ["亢金星君", sourceName] },
    { id: "bmw-black-wind-sweep", name: "黑風掃山", category: "signature", type: "guard", rarity: "signature", cost: 1, blockAll: 14, weakAll: 3, text: "全隊獲得 14 護甲，所有敵人虛弱 3 點。", upgrade: { blockAll: 22, weakAll: 5 }, tags: ["黑風大王", sourceName] },
    { id: "bmw-yellow-wind-gale", name: "黃風遮天", category: "signature", type: "tactic", rarity: "signature", cost: 1, weakAll: 5, evadeAll: 1, text: "所有敵人虛弱 5 點，全隊獲得 1 次閃避。", upgrade: { weakAll: 8 }, tags: ["黃風大聖", sourceName] },
    { id: "bmw-tiger-vanguard-pounce", name: "虎先鋒血池撲殺", category: "signature", type: "attack", rarity: "signature", cost: 2, damage: 48, addStress: 4, text: "造成 48 傷害，全隊壓力 +4。", upgrade: { damage: 72, addStress: 2 }, tags: ["虎先鋒", sourceName] },
    { id: "bmw-fourth-sister-spider-silk", name: "四妹蛛絲牽命", category: "signature", type: "tactic", rarity: "signature", cost: 1, weakAll: 4, draw: 1, text: "所有敵人虛弱 4 點，抽 1 張牌。", upgrade: { weakAll: 7, draw: 2 }, tags: ["四妹", sourceName] },
    { id: "bmw-red-boy-samadhi-fire", name: "紅孩兒三昧真火", category: "signature", type: "attack", rarity: "signature", cost: 2, damageAll: 24, burnAll: 10, addStress: 3, text: "對所有敵人造成 24 傷害並施加 10 燃燒，全隊壓力 +3。", upgrade: { damageAll: 36, burnAll: 15 }, tags: ["紅孩兒", sourceName] },
    { id: "bmw-yaksha-king-rampage", name: "夜叉王業火狂斬", category: "signature", type: "attack", rarity: "signature", cost: 3, damage: 60, damageAll: 16, pierce: true, text: "穿透護甲造成 60 傷害與 16 群體傷害。", upgrade: { damage: 88, damageAll: 24 }, tags: ["夜叉王", sourceName] },
    { id: "bmw-cloud-step-feint", name: "聚形散氣", category: "general", type: "tactic", rarity: "uncommon", cost: 1, draw: 1, evadeAll: 1, text: "抽 1 張牌，全隊獲得 1 次閃避。", upgrade: { draw: 2 }, tags: [sourceName, "身法"], sourceId: factionId, sourceName },
    { id: "bmw-immobilize-spell", name: "定身法", category: "general", type: "tactic", rarity: "uncommon", cost: 1, weakAll: 4, stunTarget: 1, text: "所有敵人虛弱 4 點，封鎖目標下一次行動。", upgrade: { weakAll: 7 }, tags: [sourceName, "法術"], sourceId: factionId, sourceName },
    { id: "bmw-pluck-of-many", name: "身外身法", category: "general", type: "support", rarity: "rare", cost: 2, draw: 3, blockAll: 8, text: "抽 3 張牌，全隊獲得 8 護甲。", upgrade: { draw: 4, blockAll: 12 }, tags: [sourceName, "分身"], sourceId: factionId, sourceName },
    { id: "bmw-rock-solid-parry", name: "銅頭鐵臂", category: "general", type: "guard", rarity: "common", cost: 1, blockAll: 14, text: "全隊獲得 14 護甲。", upgrade: { blockAll: 22 }, tags: [sourceName, "格擋"], sourceId: factionId, sourceName },
    { id: "bmw-red-tides-transformation", name: "赤潮變化", category: "general", type: "attack", rarity: "rare", cost: 2, damage: 34, burnTarget: 10, pierce: true, text: "穿透護甲造成 34 傷害並施加 10 燃燒。", upgrade: { damage: 50, burnTarget: 14 }, tags: [sourceName, "變化"], sourceId: factionId, sourceName },
    { id: "bmw-wind-tamer-vessel", name: "定風珠開路", category: "general", type: "tactic", rarity: "rare", cost: 1, weakAll: 6, reduceStress: 10, text: "所有敵人虛弱 6 點，全隊壓力 -10。", upgrade: { weakAll: 9, reduceStress: 14 }, tags: [sourceName, "法寶"], sourceId: factionId, sourceName },
    { id: "bmw-fireproof-mantle", name: "避火罩", category: "general", type: "guard", rarity: "uncommon", cost: 1, blockAll: 12, healAll: 4, text: "全隊獲得 12 護甲並恢復 4 生命。", upgrade: { blockAll: 18, healAll: 7 }, tags: [sourceName, "法寶"], sourceId: factionId, sourceName },
    { id: "bmw-golden-hoop-refusal", name: "拒戴金箍", category: "general", type: "attack", rarity: "rare", cost: 3, damage: 52, damageAll: 12, pierce: true, addStress: 6, text: "穿透護甲造成 52 傷害與 12 群體傷害，全隊壓力 +6。", upgrade: { damage: 74, damageAll: 20, addStress: 3 }, tags: [sourceName, "真結局"], sourceId: factionId, sourceName }
  ];

  const equipment = [
    { id: "bmw-ruyi-jingu-bang", name: "如意金箍棒殘響", rarity: "legendary", effect: "attackBonus", amount: 6, upgradedAmount: 10, text: "持有者存活時，所有攻擊牌傷害 +6。真大聖路線取得時威力更完整。", sourceId: "black-myth-equipment", sourceName: "黑神話法寶" },
    { id: "bmw-fireproof-mantle-relic", name: "避火罩", rarity: "rare", effect: "turnBlock", amount: 5, upgradedAmount: 8, text: "回合開始全隊獲得 5 護甲。", sourceId: "black-myth-equipment", sourceName: "黑神話法寶" },
    { id: "bmw-wind-tamer-pearl", name: "定風珠", rarity: "legendary", effect: "turnStressRelief", amount: 4, upgradedAmount: 7, text: "回合開始全隊壓力 -4。", sourceId: "black-myth-equipment", sourceName: "黑神話法寶" },
    { id: "bmw-weaver-needle", name: "繡花針", rarity: "legendary", effect: "firstAttackPierce", amount: 9, upgradedAmount: 14, text: "每回合第一張攻擊牌穿透護甲並額外造成 9 傷害。", sourceId: "black-myth-equipment", sourceName: "黑神話法寶" },
    { id: "bmw-gourd-immortal-brew", name: "仙釀葫蘆", rarity: "rare", effect: "turnHealLowest", amount: 5, upgradedAmount: 8, text: "回合開始治療生命比例最低隊員 5 點。", sourceId: "black-myth-equipment", sourceName: "黑神話法寶" },
    { id: "bmw-jade-lotus-pellet", name: "碧藕金丹", rarity: "rare", effect: "openingDraw", amount: 2, upgradedAmount: 3, text: "每場戰鬥第一回合額外抽 2 張牌。", sourceId: "black-myth-equipment", sourceName: "黑神話法寶" },
    { id: "bmw-thunder-flame-seal", name: "雷火印", rarity: "rare", effect: "firstAttackBurn", amount: 7, upgradedAmount: 11, text: "每回合第一張攻擊牌使命中目標燃燒 7 點。", sourceId: "black-myth-equipment", sourceName: "黑神話法寶" },
    { id: "bmw-celestial-tablet", name: "天庭封神牌", rarity: "legendary", effect: "openingEnergy", amount: 1, upgradedAmount: 2, text: "每場戰鬥第一回合額外獲得 1 能量。", sourceId: "black-myth-equipment", sourceName: "黑神話法寶" }
  ];

  const bloodlineEffects = {
    "bmw-destined-one": ["天命六根", "天命連棍額外抽 1 張牌並獲得 1 能量。", { draw: 1, gainEnergy: 1 }],
    "bmw-true-great-sage": ["真大聖歸位", "如意終式額外造成 24 傷害，並全隊降低 12 壓力。", { extraDamage: 24, reduceStress: 12 }],
    "bmw-zhu-bajie": ["淨壇護短", "八戒釘耙衝陣額外提供全隊 14 護甲。", { blockAll: 14 }],
    "bmw-erlang-shen": ["天眼破妄", "二郎天眼破妄額外封鎖所有敵人下一次行動。", { stunAll: 1 }],
    "bmw-bodhisattva-lingji": ["定風真言", "靈吉定風珠額外降低全隊 10 壓力。", { reduceStress: 10 }],
    "bmw-kangjin-star": ["星宿雷骨", "亢金雷龍翻身額外造成 12 群體傷害。", { extraDamageAll: 12 }],
    "bmw-black-wind-king": ["黑風護山", "黑風掃山額外提供全隊 10 護甲。", { blockAll: 10 }],
    "bmw-yellow-wind-sage": ["黃風迷眼", "黃風遮天額外使所有敵人虛弱 5 點。", { weakAll: 5 }],
    "bmw-tiger-vanguard": ["血池虎勢", "虎先鋒血池撲殺造成 1.4 倍傷害。", { criticalMultiplier: 1.4 }],
    "bmw-fourth-sister": ["蛛絲牽魂", "四妹蛛絲牽命額外抽 1 張牌並使敵人中毒 5 點。", { draw: 1, poisonAll: 5 }],
    "bmw-red-boy": ["三昧火種", "紅孩兒三昧真火額外施加 8 燃燒。", { burnAll: 8 }],
    "bmw-yaksha-king": ["夜叉業火", "夜叉王業火狂斬造成 1.5 倍傷害並恢復自身 10 生命。", { criticalMultiplier: 1.5, healOwner: 10 }]
  };
  const bloodlines = characters.map((character) => {
    const [name, text, effect] = bloodlineEffects[character.id];
    return { characterId: character.id, name, text, sideStoryCost: { rewardPointCost: character.id === "bmw-true-great-sage" ? 18000 : character.hidden ? 12600 : 9800, sideStoryCost: character.id === "bmw-true-great-sage" ? 8 : character.hidden ? 5 : 4 }, effect };
  });

  const customTags = [
    { id: "bmw-six-root-relic", name: "六根遺器", family: "天命", tier: "A", cost: 9200, art: "./src/assets/generated/skill-bmw-destined-staff-chain.png", text: "第一張攻擊牌穿甲；第 5 張牌抽 1 張牌。", effects: { firstAttackPierce: 1, fifthCardDraw: 1 } },
    { id: "bmw-great-sage-stone-heart", name: "大聖石心", family: "天命", tier: "S", cost: 16000, art: "./src/assets/generated/skill-bmw-true-sage-ruyi-strike.png", text: "第一回合能量 +1；攻擊牌傷害 +4；回合開始全隊壓力 +1。", effects: { openingEnergy: 1, attackBonus: 4, turnStressAll: 1 } },
    { id: "bmw-transformation-arts", name: "變化術", family: "法術", tier: "A", cost: 7600, art: "./src/assets/generated/skill-bmw-red-tides-transformation.png", text: "開場抽 1 張牌；攻擊帶狀態敵人時傷害 +5。", effects: { openingDraw: 1, statusExploitBonus: 5 } },
    { id: "bmw-vessel-mastery", name: "法寶熟稔", family: "法寶", tier: "B", cost: 5200, art: "./src/assets/generated/skill-bmw-wind-tamer-vessel.png", text: "回合開始全隊獲得 3 護甲並降低 1 壓力。", effects: { turnBlockAll: 3, turnReduceStressAll: 1 } }
  ];
  const customMutations = [
    { id: "bmw-inner-qi-monkey-king", name: "內力大聖複合", requiredTags: ["bmw-six-root-relic", "inner-qi-breath"], art: "./src/assets/generated/skill-bmw-destined-staff-chain.png", text: "第一張攻擊牌穿甲；第二張牌追加 8 穿甲傷害。", effects: { firstAttackPierce: 1, secondCardDamage: 8 } },
    { id: "bmw-black-flame-true-sage", name: "黑炎真大聖", requiredTags: ["bmw-great-sage-stone-heart", "black-flame-seed"], art: "./src/assets/generated/skill-bmw-true-sage-ruyi-strike.png", text: "攻擊牌傷害 +7；回合開始全隊壓力 +2；攻擊帶狀態敵人時傷害 +6。", effects: { attackBonus: 7, turnStressAll: 2, statusExploitBonus: 6 } },
    { id: "bmw-super-soldier-transformation", name: "超兵變化術", requiredTags: ["bmw-transformation-arts", "super-soldier-serum"], art: "./src/assets/generated/skill-bmw-red-tides-transformation.png", text: "最大生命 +20；開場抽 1 張牌；第一回合能量 +1。", effects: { maxHp: 20, openingDraw: 1, openingEnergy: 1 } },
    { id: "bmw-vessel-haki-guard", name: "霸氣法寶守勢", requiredTags: ["bmw-vessel-mastery", "observation-haki"], art: "./src/assets/generated/skill-bmw-wind-tamer-vessel.png", text: "回合開始全隊獲得 5 護甲；第一張戰術牌使敵人虛弱 4 點。", effects: { turnBlockAll: 5, firstTacticWeakAll: 4 } }
  ];

  const enemies = [
    { id: "bmw-wolf-scouts", name: "黑風山狼妖巡哨", maxHp: 420, stressAura: 18, intents: [{ kind: "cleave", label: "狼群撕咬", amount: 34, targetMode: "all" }, { kind: "attack", label: "山道伏擊", amount: 66, targetMode: "random" }, { kind: "guard", label: "妖霧護身", amount: 44 }] },
    { id: "bmw-black-wind-king-enemy", name: "黑風大王真身", maxHp: 720, stressAura: 28, regen: 12, intents: [{ kind: "cleave", label: "黑風捲山", amount: 52, targetMode: "all" }, { kind: "attack", label: "熊掌碎岩", amount: 104, targetMode: "front" }, { kind: "guard", label: "黑煙化形", amount: 70 }, { kind: "regen", label: "風中重聚", amount: 48, block: 30 }] },
    { id: "bmw-tiger-vanguard-enemy", name: "虎先鋒血池", maxHp: 820, stressAura: 30, intents: [{ kind: "attack", label: "虎撲斷骨", amount: 118, targetMode: "front" }, { kind: "cleave", label: "血池震地", amount: 54, targetMode: "all" }, { kind: "stress", label: "虎威咆哮", amount: 48, targetMode: "all" }] },
    { id: "bmw-stone-vanguard", name: "石先鋒", maxHp: 900, stressAura: 24, intents: [{ kind: "attack", label: "石拳崩山", amount: 108, targetMode: "front" }, { kind: "guard", label: "岩甲合攏", amount: 92 }, { kind: "cleave", label: "碎石雨", amount: 44, targetMode: "all" }] },
    { id: "bmw-yellow-wind-sage-enemy", name: "黃風大聖", maxHp: 1080, stressAura: 38, regen: 16, phaseTwo: { maxHp: 720 }, intents: [{ kind: "stress", label: "黃風遮眼", amount: 64, targetMode: "all" }, { kind: "attack", label: "三股鋼叉", amount: 132, targetMode: "random" }, { kind: "cleave", label: "沙海翻天", amount: 68, targetMode: "all" }, { kind: "guard", label: "風沙遁形", amount: 86 }] },
    { id: "bmw-kangjin-dragon-enemy", name: "亢金龍", maxHp: 760, stressAura: 26, intents: [{ kind: "cleave", label: "雷龍翻身", amount: 56, targetMode: "all" }, { kind: "attack", label: "龍角穿雲", amount: 110, targetMode: "random" }, { kind: "guard", label: "星宿雷鱗", amount: 66 }] },
    { id: "bmw-yellowbrow-false-buddha", name: "黃眉假佛", maxHp: 1120, stressAura: 40, regen: 20, phaseTwo: { maxHp: 760 }, intents: [{ kind: "stress", label: "小雷音迷障", amount: 70, targetMode: "all" }, { kind: "cleave", label: "金鐃鎮壓", amount: 64, targetMode: "all" }, { kind: "attack", label: "假佛掌印", amount: 138, targetMode: "front" }, { kind: "regen", label: "信眾幻影", amount: 78, block: 44 }] },
    { id: "bmw-violet-spider-enemy", name: "紫蛛兒", maxHp: 700, stressAura: 27, intents: [{ kind: "stress", label: "盤絲情債", amount: 46, targetMode: "all" }, { kind: "attack", label: "蛛絲絞殺", amount: 92, targetMode: "random" }, { kind: "guard", label: "蛛網封路", amount: 62 }] },
    { id: "bmw-hundred-eyed-daoist", name: "百眼魔君", maxHp: 1180, stressAura: 39, regen: 18, phaseTwo: { maxHp: 760 }, intents: [{ kind: "cleave", label: "百眼金光", amount: 70, targetMode: "all" }, { kind: "stress", label: "蜈蚣幻相", amount: 66, targetMode: "all" }, { kind: "attack", label: "毒鉤穿心", amount: 134, targetMode: "random" }, { kind: "guard", label: "多目護身", amount: 88 }] },
    { id: "bmw-red-boy-enemy", name: "紅孩兒", maxHp: 900, stressAura: 34, intents: [{ kind: "cleave", label: "三昧真火", amount: 62, targetMode: "all" }, { kind: "attack", label: "火尖槍突", amount: 122, targetMode: "front" }, { kind: "stress", label: "身世怒焰", amount: 54, targetMode: "all" }] },
    { id: "bmw-yaksha-king-enemy", name: "夜叉王", maxHp: 1260, stressAura: 44, regen: 22, phaseTwo: { maxHp: 840 }, intents: [{ kind: "attack", label: "夜叉狂斬", amount: 150, targetMode: "front" }, { kind: "cleave", label: "業火展翼", amount: 76, targetMode: "all" }, { kind: "stress", label: "火焰山終局", amount: 72, targetMode: "all" }, { kind: "regen", label: "血脈反燃", amount: 86, block: 50 }] },
    { id: "bmw-erlang-shen-enemy", name: "二郎神真君", maxHp: 1320, stressAura: 42, regen: 18, phaseTwo: { maxHp: 900 }, intents: [{ kind: "attack", label: "三尖兩刃", amount: 148, targetMode: "front" }, { kind: "stress", label: "天眼審命", amount: 70, targetMode: "all" }, { kind: "cleave", label: "梅山六聖圍獵", amount: 72, targetMode: "all" }, { kind: "guard", label: "法天象地", amount: 94 }] },
    { id: "bmw-stone-monkey-shell", name: "石猴殘殼", maxHp: 1180, stressAura: 38, regen: 20, phaseTwo: { maxHp: 780 }, intents: [{ kind: "cleave", label: "舊日棍影", amount: 68, targetMode: "all" }, { kind: "attack", label: "石心重擊", amount: 138, targetMode: "front" }, { kind: "guard", label: "六根回響", amount: 88 }] },
    { id: "bmw-great-sage-broken-shell", name: "大聖殘軀", maxHp: 1480, stressAura: 48, regen: 26, phaseTwo: { maxHp: 980 }, intents: [{ kind: "cleave", label: "如意棍雨", amount: 82, targetMode: "all" }, { kind: "attack", label: "齊天一擊", amount: 168, targetMode: "front" }, { kind: "stress", label: "金箍殘念", amount: 82, targetMode: "all" }, { kind: "regen", label: "不滅猴心", amount: 96, block: 60 }] }
  ];

  const encounters = [
    { id: "bmw-black-wind-mountain", name: "黑風山入局", tier: "normal", enemies: ["bmw-wolf-scouts", "bmw-black-wind-king-enemy"], rewardPoints: 9800 },
    { id: "bmw-yellow-wind-ridge", name: "黃風嶺沙海", tier: "normal", enemies: ["bmw-tiger-vanguard-enemy", "bmw-stone-vanguard"], rewardPoints: 11200 },
    { id: "bmw-little-west-temple", name: "小西天假佛境", tier: "normal", enemies: ["bmw-kangjin-dragon-enemy", "bmw-yellowbrow-false-buddha"], rewardPoints: 12800 },
    { id: "bmw-webbed-hollow", name: "盤絲洞情債", tier: "normal", enemies: ["bmw-violet-spider-enemy", "bmw-hundred-eyed-daoist"], rewardPoints: 12600 },
    { id: "bmw-flaming-mountain", name: "火焰山血脈", tier: "elite", enemies: ["bmw-red-boy-enemy", "bmw-yaksha-king-enemy"], rewardPoints: 16800 },
    { id: "bmw-meishan-trial", name: "梅山真君試煉", tier: "elite", enemies: ["bmw-erlang-shen-enemy"], rewardPoints: 18200 },
    { id: "bmw-six-root-gauntlet", name: "六根連戰", tier: "elite", enemies: ["bmw-yellow-wind-sage-enemy", "bmw-yellowbrow-false-buddha"], rewardPoints: 19600 },
    { id: "bmw-stone-monkey-duel", name: "石猴殘殼決鬥", tier: "miniboss", enemies: ["bmw-stone-monkey-shell"], rewardPoints: 23800 },
    { id: "bmw-erlang-hidden-duel", name: "二郎神隱藏決鬥", tier: "miniboss", enemies: ["bmw-erlang-shen-enemy", "bmw-stone-monkey-shell"], rewardPoints: 28000 },
    { id: "bmw-great-sage-broken-shell", name: "大聖殘軀終戰", tier: "boss", enemies: ["bmw-great-sage-broken-shell"], rewardPoints: 42000 }
  ];

  const scenario = {
    id: scenarioId,
    name: sourceName,
    subtitle: "六根重收與真大聖歸位",
    intro: "白光落在花果山殘霞之前，主神把黑風山、黃風嶺、小西天、盤絲洞、火焰山、梅山與花果山強行串成十二層長路。天命人追著六根遺器前進，豬八戒嘴上罵個不停，二郎神在更遠的天門後等他交出真正答案：是戴上金箍完成殘軀，還是把真大聖從命運裡打回來。",
    recruitmentPool: ["bmw-zhu-bajie", "bmw-erlang-shen", "bmw-bodhisattva-lingji", "bmw-kangjin-star", "bmw-black-wind-king", "bmw-yellow-wind-sage", "bmw-tiger-vanguard", "bmw-fourth-sister", "bmw-red-boy", "bmw-yaksha-king", "chu-xuan", "qi-tengyi", "zhan-lan", "luo-yinglong", "gintoki-sakata", "mou-gang"],
    normal: ["bmw-black-wind-mountain", "bmw-yellow-wind-ridge", "bmw-little-west-temple", "bmw-webbed-hollow"],
    elite: ["bmw-flaming-mountain", "bmw-meishan-trial", "bmw-six-root-gauntlet"],
    miniboss: "bmw-stone-monkey-duel",
    boss: "bmw-great-sage-broken-shell",
    eventTitle: "六根遺器與金箍選擇",
    eventText: "每收回一根，主神都會把天命人的棍勢推近大聖殘軀；但真正困難的路不是打贏殘軀，而是在二郎神的隱藏試煉後拒絕戴上金箍，讓真大聖歸位。",
    scenarioPowerName: "六根棍勢",
    scenarioPowerText: "本次遠征第一張攻擊牌穿透護甲，所有攻擊牌傷害 +5；回合開始全隊壓力 +1。",
    scenarioPower: { id: "bmw-six-root-staff-form", effect: "attackBonus", amount: 5 },
    hiddenProtagonistId: "bmw-destined-one",
    minLayerCount: 12,
    opening: {
      title: "花果山殘霞前的十二層長路",
      premise: "天命人站在花果山石階下，遠處大聖殘軀像一段仍未結束的神話。主神把六根遺器、二郎神隱藏試煉與真結局判定全部壓進同一場遠征。",
      dialogue: [
        { speaker: "主神", line: "主線：收回六根並擊破大聖殘軀。隱藏判定一：護住天命人。隱藏判定二：完成梅山真君試煉，拒戴金箍，取得真大聖。" },
        { speaker: "天命人", line: "棍還在手，路就未算完。" },
        { speaker: "豬八戒", line: "又是山，又是妖，又是天庭那些舊帳。俺老豬先講明，真要上梅山，別指望輕鬆。" },
        { speaker: "二郎神", line: "你若只想完成天命，到殘軀前便夠。你若要真大聖，便先過我這一關。" },
        { speaker: "真大聖", line: "金箍不是答案。要我回來，先把那個要你跪下的命數打碎。" },
        { speaker: "楚軒", line: "天命人是普通隱藏獎勵，真大聖是高風險終局。若隊伍未成形，不建議走梅山線。" },
        { speaker: "齊騰一", line: "六根不是普通收集物，每一根都像把舊神話的欠債刻進主神結算。" }
      ],
      panels: [
        { enemyId: "bmw-black-wind-king-enemy", title: "黑風山第一根", text: "黑煙纏住山門，狼妖巡哨把香火廢墟圍成第一個死局。" },
        { enemyId: "bmw-yellow-wind-sage-enemy", title: "黃風嶺沙海", text: "三股鋼叉劈開風沙，定風珠成為唯一能看見前路的光。" },
        { enemyId: "bmw-yellowbrow-false-buddha", title: "小西天假佛境", text: "金鐃聲像誦經，也像牢門，黃眉把信眾幻影排成佛國陷阱。" },
        { enemyId: "bmw-yaksha-king-enemy", title: "火焰山血脈", text: "紅孩兒與夜叉王的火焰互相吞咬，親情、仇恨與妖血全被燒亮。" },
        { enemyId: "bmw-great-sage-broken-shell", title: "大聖殘軀終戰", text: "殘軀握棍而立，像一個神話把自己的影子留在終點。" }
      ]
    }
  };

  const routes = [
    {
      id: "bmw-destined-one-route",
      routeType: "天命人主線",
      priority: "fixed",
      stage1: { id: "bmw-save-destined-one", title: "護住天命人", text: "沿六根遺器的順序推進，不急著挑戰梅山，把天命人的棍勢穩定帶到花果山。" },
      stage2: { id: "bmw-six-root-stable", title: "穩定六根回收", text: "黑風、黃風、小西天、盤絲洞與火焰山的壓力被分段處理，隊伍保留足夠補給。" },
      final: { id: "bmw-destined-one-good-end", title: "天命人接回棍勢", text: "天命人打穿大聖殘軀的外殼，主神承認他作為隱藏人物加入。" },
      outcome: { title: "天命人入隊", text: "你們沒有強行打開真大聖線，而是先保住天命人的完整路線。", effects: [{ type: "recruit-hidden" }, { type: "scenario-power" }, { type: "side-story", amount: 2 }], rewards: ["隱藏角色：天命人", "劇本增益：六根棍勢", "支線劇情 +2"], costs: ["真大聖線未開啟，本次只取得普通隱藏主角。"], storyImpact: "天命人避開最壞收束，六根遺器被中洲隊帶回主神空間。", worldState: "花果山殘局穩定，天命人仍有機會日後追向真大聖路線。" }
    },
    {
      id: "bmw-true-great-sage-route",
      routeType: "真大聖超難線",
      stage1: { id: "bmw-six-relics-all-in", title: "六根全收", text: "放棄安全撤退，強行把六根遺器全部推到同一條路線，讓梅山隱藏試煉浮現。" },
      stage2: { id: "bmw-meishan-erlang-duel", title: "梅山真君試煉", text: "二郎神不再放水。隊伍必須承受天眼審命、梅山圍獵與法天象地的三重壓力。" },
      final: { id: "bmw-refuse-golden-hoop", title: "拒戴金箍", text: "擊破大聖殘軀後拒絕金箍判定，把天命從收束線上硬扯回來，讓真大聖歸位。" },
      outcome: { title: "真大聖歸位", text: "梅山試煉與大聖殘軀都被打穿。天命人沒有戴上金箍，真大聖以超高難隱藏人物身份加入中洲隊。", effects: [{ type: "recruit-character", characterId: "bmw-true-great-sage", label: "超高難隱藏角色" }, { type: "run-power", id: "bmw-true-sage-return", effect: "attackBonus", amount: 10 }, { type: "side-story", amount: 3 }, { type: "stress", amount: 36 }, { type: "damage-fraction", amount: 0.22 }, { type: "curse" }], rewards: ["超高難隱藏角色：真大聖", "本次遠征攻擊 +10", "支線劇情 +3"], costs: ["出戰成員壓力 +36", "出戰成員生命下降 22%", "牌組加入詛咒"], storyImpact: "金箍判定被拒絕，真大聖不再只是殘軀與命數，而是完整回到隊伍。", worldState: "二郎神承認這條路線，花果山殘霞被重新點亮。" }
    },
    {
      id: "bmw-vessel-route",
      routeType: "法寶收集線",
      stage1: { id: "bmw-collect-vessels", title: "收齊法寶", text: "優先取得避火罩、定風珠、繡花針與葫蘆，不強行挑戰真大聖。" },
      stage2: { id: "bmw-stabilize-vessels", title: "穩定法寶節奏", text: "把法寶交給第七人支援系統校準，讓隊伍在十二層長路中撐住補給。" },
      final: { id: "bmw-vessel-cache", title: "法寶入庫", text: "主神把黑悟空法寶轉成可購買裝備與劇本增益。" },
      outcome: { title: "黑神話法寶入庫", text: "你們沒有追求最高隱藏角色，而是把法寶完整帶回主神空間。", effects: [{ type: "legendary-equipment" }, { type: "scenario-power" }, { type: "reward-points", amount: 1800 }], rewards: ["傳說裝備", "劇本增益：六根棍勢", "獎勵點 +1800"], costs: ["真大聖線本次關閉。"], storyImpact: "法寶成為隊伍長線強化，而不是一次性劇情道具。", worldState: "黑風、黃風與火焰山的支線資源被轉成主神商店來源。" }
    },
    {
      id: "bmw-allies-route",
      routeType: "妖王與舊友線",
      stage1: { id: "bmw-talk-to-yaoguai", title: "不只殺妖", text: "嘗試與豬八戒、四妹、紅孩兒、夜叉王等角色建立臨時同盟。" },
      stage2: { id: "bmw-break-old-debts", title: "拆解舊帳", text: "把盤絲洞情債、火焰山血脈與天庭舊令分開處理，避免所有人都被推進 Boss 位。" },
      final: { id: "bmw-ally-network", title: "留下同盟網", text: "不直接取得真大聖，但讓黑悟空劇本的人物網留下可重玩支線。" },
      outcome: { title: "妖王與舊友同盟", text: "你們讓部分敵對人物保留後路，主神承認這是一條長線支線網。", effects: [{ type: "recruit-candidate" }, { type: "heal", amount: 0.18, stressRelief: 18 }, { type: "side-story", amount: 2 }], rewards: ["劇情人物加入或等值補償", "全隊恢復與壓力下降", "支線劇情 +2"], costs: ["天命人取得延後。"], storyImpact: "黑悟空劇本不再只剩殺穿妖王，人物關係被打出新的存活分支。", worldState: "盤絲洞與火焰山保留後續重玩線索。" }
    },
    {
      id: "bmw-risk-route",
      routeType: "高風險捷徑",
      stage1: { id: "bmw-risk-shortcut", title: "跳過一段六根", text: "嘗試用主神漏洞跳過一段六根收集，直接逼出更高回報的戰利品。" },
      stage2: { id: "bmw-risk-backlash", title: "承受殘軀反噬", text: "大聖殘軀提前甦醒，隊伍必須用生命與壓力換取捷徑。" },
      final: { id: "bmw-risk-cache", title: "在命數合攏前撤出", text: "趕在金箍判定收束前撤回主神空間，帶走高價值資源。" },
      outcome: { title: "六根捷徑反噬", text: "你們拿到高價值資源，但命數反噬把詛咒也塞進牌組。", effects: [{ type: "rare-card" }, { type: "reward-points", amount: 2600 }, { type: "stress", amount: 24 }, { type: "curse" }], rewards: ["稀有牌獎勵", "獎勵點 +2600"], costs: ["出戰成員壓力 +24", "牌組加入詛咒"], storyImpact: "捷徑沒有改寫真結局，只是從殘軀手裡偷走一段力量。", worldState: "主神標記本次路線為高風險重玩資料。" }
    }
  ];

  const bonds = [
    { id: "bmw-westward-relic-hunters", name: "六根同行者", sourceMembers: characters.map((character) => character.id), count: 4, text: "任意 4 名黑神話：悟空角色同時上陣。開場抽 1 張牌，所有攻擊牌傷害 +2。", effects: { openingDraw: 1, attackBonus: 2 } },
    { id: "bmw-monkey-lineage", name: "天命與真大聖", members: ["bmw-destined-one", "bmw-true-great-sage", "bmw-erlang-shen"], text: "天命人、真大聖與二郎神同時上陣。第一回合能量 +1，攻擊牌傷害 +5，回合開始全隊壓力 +2。", effects: { openingEnergy: 1, attackBonus: 5, turnStressAll: 2 } },
    { id: "bmw-old-pilgrim-oath", name: "取經舊人護路", members: ["bmw-destined-one", "bmw-zhu-bajie", "bmw-bodhisattva-lingji"], text: "天命人、豬八戒與靈吉菩薩同時上陣。回合開始全隊恢復 3 生命並降低 2 壓力。", effects: { turnHealAll: 3, turnReduceStressAll: 2 } },
    { id: "bmw-yaoguai-kings-table", name: "妖王舊帳桌", sourceMembers: ["bmw-black-wind-king", "bmw-yellow-wind-sage", "bmw-tiger-vanguard", "bmw-fourth-sister", "bmw-red-boy", "bmw-yaksha-king"], count: 3, text: "任意 3 名妖王、妖將或盤絲洞角色同時上陣。攻擊帶狀態敵人時傷害 +5，回合開始敵人虛弱 1 點。", effects: { statusExploitBonus: 5, turnWeakAll: 1 } },
    { id: "bmw-celestial-board", name: "天庭棋局", members: ["bmw-erlang-shen", "bmw-bodhisattva-lingji", "bmw-kangjin-star", "bmw-true-great-sage"], text: "二郎神、靈吉菩薩、亢金星君與真大聖同時上陣。第一張戰術牌費用 -1 並抽 1 張牌，敵人虛弱 3 點。", effects: { firstTacticCostReduction: 1, firstTacticDraw: 1, firstTacticWeakAll: 3 } },
    { id: "cross-ruyi-sun-flame", name: "如意太陽棍", crossWorld: true, members: ["bmw-true-great-sage", "son-goku", "tanjiro-kamado"], text: "真大聖、孫悟空與炭治郎同時上陣。所有攻擊牌傷害 +5，第一張攻擊牌穿透護甲。", effects: { attackBonus: 5, firstAttackPierce: 1 } },
    { id: "cross-erlang-calculation", name: "天眼演算桌", crossWorld: true, members: ["bmw-erlang-shen", "chu-xuan", "satoru-gojo"], text: "二郎神、楚軒與五條悟同時上陣。開場抽 2 張牌，第一張戰術牌使所有敵人虛弱 4 點。", effects: { openingDraw: 2, firstTacticWeakAll: 4 } },
    { id: "cross-samadhi-fireline", name: "三昧火線", crossWorld: true, members: ["bmw-red-boy", "natsu-dragneel", "rin-okumura"], text: "紅孩兒、納茲與奧村燐同時上陣。攻擊牌傷害 +3，攻擊帶狀態敵人時傷害 +5。", effects: { attackBonus: 3, statusExploitBonus: 5 } },
    { id: "cross-spider-poison-thread", name: "盤絲毒線", crossWorld: true, members: ["bmw-fourth-sister", "naya", "yuzuriha-kunoichi"], text: "四妹、娜雅與杠同時上陣。回合開始敵人虛弱 1 點，第二張牌追加 7 穿甲傷害。", effects: { turnWeakAll: 1, secondCardDamage: 7 } },
    { id: "cross-staff-breakers", name: "棍棒破局者", crossWorld: true, members: ["bmw-destined-one", "gintoki-sakata", "asta-anti-magic"], text: "天命人、坂田銀時與阿斯塔同時上陣。第一張攻擊牌穿透護甲，第二張牌追加 6 穿甲傷害。", effects: { firstAttackPierce: 1, secondCardDamage: 6 } }
  ];

  const characterSource = { id: factionId, name: sourceName, description: "天命人、真大聖、豬八戒、二郎神、妖王與法寶線共同構成十二層長路，真大聖需要高風險隱藏終局取得。", heroFileName: "roster-hero-black-myth-wukong.png", memberIds: characters.map((character) => character.id) };
  const cardSource = { id: factionId, name: sourceName, description: "棍勢、法術、法寶、變化與真結局拒戴金箍，偏穿甲、抽牌、燃燒、護甲與壓力代價。" };
  const equipmentSource = { id: "black-myth-equipment", name: "黑神話法寶", description: "如意金箍棒、避火罩、定風珠、繡花針與仙釀葫蘆，支援六根長路與真大聖線。" };
  const shop = [
    ...cards.filter((card) => card.category === "general").map((card, index) => ({ id: `shop-${card.id}`, kind: "card", itemId: card.id, rewardPointCost: 2600 + index * 220, stock: card.rarity === "rare" ? 1 : 2 })),
    ...equipment.map((item, index) => ({ id: `shop-${item.id}`, kind: "equipment", itemId: item.id, rewardPointCost: 7600 + index * 520, sideStoryCost: item.rarity === "legendary" ? 4 : 2, stock: 1 }))
  ];

  data.characters.push(...characters);
  data.cards.push(...cards);
  data.equipment.push(...equipment);
  data.bloodlines.push(...bloodlines);
  data.customTags.push(...customTags);
  data.customMutations.push(...customMutations);
  data.enemies.push(...enemies);
  data.encounters.push(...encounters);
  data.characterSources.push(characterSource);
  data.cardSources.push(cardSource);
  data.equipmentSources.push(equipmentSource);
  data.shop.push(...shop);
  data.bonds.push(...bonds);
  data.legendaryRecruitmentPool.push("bmw-destined-one", "bmw-true-great-sage");
  data.scenarios.push(scenario);
  data.economy.scenarioSideStoryRewards[scenarioId] = 28;
  data.scenarioEventRoutes[scenarioId] = routes;
  data.blackMythWukongSummary = {
    scenarioId,
    characterCount: characters.length,
    cardCount: cards.length,
    equipmentCount: equipment.length,
    enemyCount: enemies.length,
    routeCount: routes.length,
    minLayerCount: scenario.minLayerCount,
    normalHiddenId: "bmw-destined-one",
    hardHiddenId: "bmw-true-great-sage"
  };
})(globalThis);
