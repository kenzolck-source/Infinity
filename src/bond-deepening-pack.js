(function (global) {
  const data = global.MainGodData;
  if (!data) return;

  const charactersById = Object.fromEntries((data.characters || []).map((character) => [character.id, character]));
  const existingIds = new Set((data.bonds || []).map((bond) => bond.id));
  const added = [];

  function validMembers(ids) {
    return [...new Set((ids || []).filter((id) => {
      const character = charactersById[id];
      return character && !character.tutorialOnly && !character.playerOnly;
    }))];
  }

  function addBond(definition) {
    const sourceMembers = validMembers(definition.sourceMembers);
    const members = validMembers(definition.members);
    const anyMembers = validMembers(definition.anyMembers);
    if (definition.sourceMembers && sourceMembers.length < Number(definition.count || 2)) return;
    if (definition.members && members.length !== definition.members.length) return;
    const id = definition.id;
    if (!id || existingIds.has(id)) return;
    existingIds.add(id);
    const bond = {
      ...definition,
      ...(definition.sourceMembers ? { sourceMembers } : {}),
      ...(definition.members ? { members } : {}),
      ...(definition.anyMembers ? { anyMembers } : {})
    };
    data.bonds.push(bond);
    added.push(id);
  }

  const formationEffects = [
    { openingDraw: 1, turnBlockAll: 1 },
    { openingEnergy: 1, turnReduceStressAll: 1 },
    { firstTacticDraw: 1, turnHealAll: 1 },
    { attackBonus: 1, fifthCardBlockAll: 2 },
    { firstAttackPierce: 1, turnBlockAll: 1 },
    { statusExploitBonus: 2, turnWeakAll: 1 }
  ];
  const resonanceEffects = [
    { secondCardDamage: 4, turnReduceStressAll: 1 },
    { openingDraw: 1, firstTacticWeakAll: 2 },
    { turnBlockAll: 2, fifthCardHealAll: 2 },
    { attackBonus: 2, turnStressAll: 1 },
    { firstTacticEnergy: 1, turnBlockAll: 1 },
    { fifthCardDraw: 1, turnHealAll: 1 }
  ];

  (data.characterSources || []).forEach((source, index) => {
    const sourceMembers = validMembers(source.memberIds);
    if (sourceMembers.length < 2) return;
    const formationCount = Math.min(3, sourceMembers.length);
    addBond({
      id: `deep-${source.id}-formation`,
      name: `${source.name}聯合作戰`,
      sourceMembers,
      count: formationCount,
      text: `${source.name}任意 ${formationCount} 名角色同時上陣。隊伍會啟動同源作戰節奏，提升開場與回合穩定度。`,
      effects: formationEffects[index % formationEffects.length]
    });
    addBond({
      id: `deep-${source.id}-resonance`,
      name: `${source.name}命運共鳴`,
      sourceMembers,
      count: 2,
      text: `${source.name}任意 2 名角色同時上陣。彼此的原作節奏互相補位，讓低人數混編也能觸發羈絆收益。`,
      effects: resonanceEffects[index % resonanceEffects.length]
    });
  });

  const roleBonds = [
    {
      id: "deep-role-opening-command",
      name: "先讀戰場指揮鏈",
      passiveIds: ["opening-draw", "opening-forecast"],
      count: 3,
      text: "任意 3 名開場偵察、預判或情報型角色同時上陣。開場抽 1 張牌，第一張戰術牌再抽 1 張。",
      effects: { openingDraw: 1, firstTacticDraw: 1 }
    },
    {
      id: "deep-role-energy-compression",
      name: "高壓能量壓縮",
      passiveIds: ["opening-energy", "opening-overdrive", "low-health-energy"],
      count: 3,
      text: "任意 3 名高爆發或能量壓縮型角色同時上陣。首回合能量 +1，但回合開始全隊壓力 +1。",
      effects: { openingEnergy: 1, turnStressAll: 1 }
    },
    {
      id: "deep-role-piercing-vanguard",
      name: "穿甲先鋒線",
      passiveIds: ["first-attack-pierce", "first-heavy-attack"],
      count: 3,
      text: "任意 3 名破甲、居合或重擊型角色同時上陣。第一張攻擊牌穿透護甲，所有攻擊牌傷害 +1。",
      effects: { firstAttackPierce: 1, attackBonus: 1 }
    },
    {
      id: "deep-role-medical-relay",
      name: "醫療中繼網",
      passiveIds: ["turn-heal", "turn-heal-lowest", "turn-stress-relief"],
      count: 3,
      text: "任意 3 名治療、精神安定或補給型角色同時上陣。回合開始全隊恢復 2 生命並降低 2 壓力。",
      effects: { turnHealAll: 2, turnReduceStressAll: 2 }
    },
    {
      id: "deep-role-shield-rotation",
      name: "輪換盾牆",
      passiveIds: ["front-guard", "turn-block", "mentor-guard", "intent-barrier"],
      count: 3,
      text: "任意 3 名前排、導師或防護型角色同時上陣。回合開始全隊獲得 3 護甲，第 5 張牌再補 3 護甲。",
      effects: { turnBlockAll: 3, fifthCardBlockAll: 3 }
    },
    {
      id: "deep-role-tactical-operators",
      name: "戰術操作室",
      passiveIds: ["first-tactic-discount", "first-tactic-weak", "first-tactic-draw"],
      count: 3,
      text: "任意 3 名戰術、符咒或分析型角色同時上陣。第一張戰術牌費用 -1，並使所有敵人虛弱 2 點。",
      effects: { firstTacticCostReduction: 1, firstTacticWeakAll: 2 }
    },
    {
      id: "deep-role-second-strikers",
      name: "二連追擊手",
      passiveIds: ["second-card-strike", "second-card-damage", "second-card-evade"],
      count: 3,
      text: "任意 3 名連段、刺殺或高速追擊型角色同時上陣。每回合第二張牌追加 6 點穿甲傷害。",
      effects: { secondCardDamage: 6 }
    },
    {
      id: "deep-role-status-breakers",
      name: "異常狀態破局",
      passiveIds: ["first-attack-burn", "first-guard-weak", "intent-weak"],
      count: 3,
      text: "任意 3 名燃燒、削弱或控制型角色同時上陣。回合開始敵人虛弱 1 點，攻擊帶狀態敵人時傷害 +3。",
      effects: { turnWeakAll: 1, statusExploitBonus: 3 }
    },
    {
      id: "deep-role-fifth-card-engine",
      name: "五拍引擎",
      passiveIds: ["fifth-card-damage", "fifth-card-aegis", "fifth-card-energy"],
      count: 3,
      text: "任意 3 名節奏堆疊型角色同時上陣。第 5 張牌抽 1 張，並為全隊恢復 3 生命。",
      effects: { fifthCardDraw: 1, fifthCardHealAll: 3 }
    },
    {
      id: "deep-role-firearm-network",
      name: "火器校準網",
      passiveIds: ["first-ranged-boost", "firearm-boost", "first-attack-pierce"],
      count: 3,
      text: "任意 3 名遠程、槍械或精準破甲型角色同時上陣。槍械類裝備效果提高 20%，第一張攻擊牌穿透護甲。",
      effects: { firearmMultiplier: 1.2, firstAttackPierce: 1 }
    }
  ];

  roleBonds.forEach((definition) => {
    const sourceMembers = validMembers((data.characters || [])
      .filter((character) => definition.passiveIds.includes(character.passiveId))
      .map((character) => character.id));
    addBond({
      id: definition.id,
      name: definition.name,
      sourceMembers,
      count: Math.min(definition.count, sourceMembers.length),
      crossWorld: true,
      text: definition.text,
      effects: definition.effects
    });
  });

  const hiddenMembers = validMembers((data.characters || []).filter((character) => character.hidden).map((character) => character.id));
  addBond({
    id: "deep-hidden-protagonist-relay",
    name: "隱藏主角接力",
    sourceMembers: hiddenMembers,
    count: 3,
    crossWorld: true,
    text: "任意 3 名隱藏主角同時上陣。開場抽 1 張牌，所有攻擊牌傷害 +2；第 5 張牌為全隊恢復 4 生命。",
    effects: { openingDraw: 1, attackBonus: 2, fifthCardHealAll: 4 }
  });

  const mainGodAnalysts = validMembers(["chu-xuan", "xiao-honglu", "adam", "clone-chu-xuan", "nios", "higuruma-hiromi", "ranni-dark-moon", "frieren-mage"]);
  addBond({
    id: "deep-analyst-grand-table",
    name: "大局演算桌",
    sourceMembers: mainGodAnalysts,
    count: 3,
    crossWorld: true,
    text: "任意 3 名演算、法則或審判型角色同時上陣。第一張戰術牌費用 -1、抽 1 張牌，並使所有敵人虛弱 3 點。",
    effects: { firstTacticCostReduction: 1, firstTacticDraw: 1, firstTacticWeakAll: 3 }
  });

  function coverageCounts() {
    const deployable = (data.characters || []).filter((character) => !character.tutorialOnly && !character.playerOnly);
    const counts = Object.fromEntries(deployable.map((character) => [character.id, 0]));
    (data.bonds || []).forEach((bond) => {
      const references = [...(bond.members || []), ...(bond.anyMembers || []), ...(bond.sourceMembers || [])];
      [...new Set(references)].forEach((id) => {
        if (counts[id] !== undefined) counts[id] += 1;
      });
      if (bond.faction) {
        deployable.forEach((character) => {
          if ((character.factionId || "main") === bond.faction) counts[character.id] += 1;
        });
      }
    });
    return counts;
  }

  const safetyAnchors = validMembers(["chu-xuan", "zheng-zha", "zhan-lan", "zero", "edward-elric", "tanjiro-kamado", "steve-rogers", "gintoki-sakata"]);
  let counts = coverageCounts();
  Object.entries(counts).forEach(([characterId, count]) => {
    let current = count;
    let pass = 0;
    while (current < 4 && pass < 3 && safetyAnchors.length) {
      const characterFaction = charactersById[characterId]?.factionId || "main";
      const crossWorldAnchors = safetyAnchors.filter((id) => id !== characterId && (charactersById[id]?.factionId || "main") !== characterFaction);
      const fallbackAnchors = safetyAnchors.filter((id) => id !== characterId);
      const anchorPool = crossWorldAnchors.length ? crossWorldAnchors : fallbackAnchors;
      const anchorId = anchorPool[(pass + characterId.length) % anchorPool.length];
      if (anchorId !== characterId) {
        addBond({
          id: `deep-safety-${characterId}-${pass + 1}`,
          name: `${charactersById[characterId]?.name || characterId}補位羈絆`,
          sourceMembers: [characterId, anchorId],
          count: 2,
          crossWorld: true,
          text: `${charactersById[characterId]?.name || "該角色"}與${charactersById[anchorId]?.name || "核心隊員"}同時上陣。補位羈絆會填補低覆蓋角色的混編路線，提供穩定防護與節奏。`,
          effects: pass % 2 === 0 ? { turnBlockAll: 2, fifthCardDraw: 1 } : { openingDraw: 1, turnReduceStressAll: 1 }
        });
        current += 1;
      }
      pass += 1;
    }
  });

  data.bondDeepeningSummary = {
    addedCount: added.length,
    sourceBondCount: added.filter((id) => id.includes("-formation") || id.includes("-resonance")).length,
    roleBondCount: added.filter((id) => id.startsWith("deep-role-")).length,
    safetyBondCount: added.filter((id) => id.startsWith("deep-safety-")).length,
    addedIds: added
  };
})(globalThis);
