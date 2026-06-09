(function (global) {
  const data = global.MainGodData;
  const charactersById = indexById(data.characters);
  const cardsById = indexById(data.cards);
  const equipmentById = indexById(data.equipment);
  const enemiesById = indexById(data.enemies);
  const encountersById = indexById(data.encounters);
  const scenariosById = indexById(data.scenarios);
  const shopById = indexById(data.shop);
  const permanentUpgradesById = indexById(data.permanentUpgrades);
  const bloodlinesByCharacterId = Object.fromEntries(data.bloodlines.map((item) => [item.characterId, item]));
  const bondsById = indexById(data.bonds || []);
  const economy = data.economy || {};
  const maxLog = 12;
  const dmc5FeaturedRecruitIds = ["nero-dmc5", "v-dmc5", "dante-dmc5"];

  function indexById(items) {
    return Object.fromEntries(items.map((item) => [item.id, item]));
  }

  function clone(value) {
    return typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value));
  }

  function createInitialState() {
    const state = {
      version: 3,
      nextId: 1,
      randomSeed: 173205,
      screen: "story",
      hubTab: "deployment",
      pending: { kind: "tutorial-intro" },
      party: [makeCharacter("zheng-zha", true), makeCharacter("zhang-jie", true)],
      deck: [],
      equipmentInventory: [],
      equipped: {},
      permanentUpgrades: { team: [], characters: {}, signatures: [], bloodlines: [] },
      curses: [],
      purchased: {},
      rewardPoints: 0,
      sideStories: 0,
      upgradeTokens: 0,
      campaign: {
        tutorialComplete: false,
        unlockedScenarios: ["tutorial"],
        completedScenarios: [],
        infiniteUnlocked: false,
        infiniteTier: 0,
        firstAlienRecruitBonus: true
      },
      run: null,
      activeEncounterId: null,
      activeEnemies: [],
      selectedTargetId: null,
      drawPile: [],
      hand: [],
      discardPile: [],
      exhaustedPile: [],
      energy: 4,
      maxEnergy: 4,
      turn: 0,
      turnStats: freshTurnStats(),
      combatFlags: { lastChanceUsed: [], bondTriggers: [] },
      rewardChoices: [],
      log: ["冰冷車廂正駛向蜂巢。"]
    };
    state.deck = data.starterDeck.map((cardId) => makeDeckEntry(state, cardId, null));
    return state;
  }

  function normalizeState(saved) {
    if (!saved || typeof saved !== "object") return createInitialState();
    if (saved.version !== 3) return migrateLegacyState(saved);
    const base = createInitialState();
    const next = { ...base, ...clone(saved) };
    next.campaign = { ...base.campaign, ...(saved.campaign || {}) };
    reconcileCampaignUnlocks(next.campaign);
    next.permanentUpgrades = { ...base.permanentUpgrades, ...(saved.permanentUpgrades || {}) };
    next.permanentUpgrades.team = Array.isArray(next.permanentUpgrades.team) ? next.permanentUpgrades.team : [];
    next.permanentUpgrades.characters = next.permanentUpgrades.characters || {};
    next.permanentUpgrades.signatures = Array.isArray(next.permanentUpgrades.signatures) ? next.permanentUpgrades.signatures : [];
    next.permanentUpgrades.bloodlines = Array.isArray(next.permanentUpgrades.bloodlines) ? next.permanentUpgrades.bloodlines : [];
    next.party = (Array.isArray(saved.party) ? saved.party : base.party)
      .filter((member) => charactersById[member.id] && !(member.id === "zhang-jie" && next.campaign.tutorialComplete))
      .map(normalizeCharacter);
    next.deck = (Array.isArray(saved.deck) ? saved.deck : base.deck)
      .map((entry) => typeof entry === "string" ? makeDeckEntry(next, entry, null) : entry)
      .filter((entry) => entry && cardsById[entry.cardId]);
    next.equipmentInventory = (saved.equipmentInventory || []).filter((entry) => equipmentById[entry.equipmentId]);
    next.curses = next.deck.filter((entry) => cardsById[entry.cardId].category === "curse").map((entry) => entry.instanceId);
    next.activeEnemies = (saved.activeEnemies || []).filter((enemy) => enemiesById[enemy.enemyId]).map((enemy) => ({
      ...enemy,
      burn: Number(enemy.burn || 0),
      poison: Number(enemy.poison || 0),
      stun: Number(enemy.stun || 0),
      weak: Number(enemy.weak || 0)
    }));
    next.drawPile = (saved.drawPile || []).filter((entry) => cardsById[entry.cardId]);
    next.hand = (saved.hand || []).filter((entry) => cardsById[entry.cardId]);
    next.discardPile = (saved.discardPile || []).filter((entry) => cardsById[entry.cardId]);
    next.exhaustedPile = (saved.exhaustedPile || []).filter((entry) => cardsById[entry.cardId]);
    ensureFormation(next);
    return next;
  }

  function migrateLegacyState(saved) {
    const next = createInitialState();
    const clears = Number(saved.clears || 0);
    next.screen = "hub";
    next.pending = null;
    next.campaign.tutorialComplete = true;
    next.campaign.unlockedScenarios = ["alien", ...(clears >= 1 ? ["juon"] : []), ...(clears >= 2 ? ["abyssal-ark"] : [])];
    next.campaign.completedScenarios = clears >= 1 ? ["alien", ...(clears >= 2 ? ["juon"] : [])] : [];
    next.campaign.infiniteUnlocked = clears >= 2;
    next.campaign.infiniteTier = Math.max(0, clears - 2);
    next.campaign.firstAlienRecruitBonus = false;
    next.rewardPoints = Number(saved.rewardPoints ?? 160);
    next.sideStories = Number(saved.sideStories ?? 1);
    next.purchased = clone(saved.purchased || {});
    next.party = (Array.isArray(saved.party) ? saved.party : [{ id: "zheng-zha" }, { id: "zhan-lan" }, { id: "zero" }])
      .filter((member) => charactersById[member.id] && member.id !== "zhang-jie")
      .map(normalizeCharacter);
    if (!next.party.some((member) => member.id === "zheng-zha")) next.party.unshift(makeCharacter("zheng-zha", true));
    next.deck = [];
    const signatureOwners = Object.fromEntries(data.characters.map((character) => [character.signatureCardId, character.id]));
    const converted = new Set();
    (Array.isArray(saved.deck) ? saved.deck : data.starterDeck).forEach((cardId) => {
      if (!cardsById[cardId]) return;
      if (signatureOwners[cardId]) {
        if (!converted.has(signatureOwners[cardId])) {
          converted.add(signatureOwners[cardId]);
          next.permanentUpgrades.signatures.push(signatureOwners[cardId]);
        } else {
          next.rewardPoints += Number(economy.duplicateLegacySignatureRefund || 300);
        }
      } else {
        next.deck.push(makeDeckEntry(next, cardId, null));
      }
    });
    ensureFormation(next);
    next.log = ["舊存檔已轉換：生化危機視為完成，原有資源與牌組均已保留。"];
    return next;
  }

  function normalizeCharacter(member) {
    const base = charactersById[member.id];
    return {
      ...clone(base),
      ...clone(member),
      maxHp: Math.max(base.maxHp, Number(member.maxHp || base.maxHp)),
      hp: clamp(Number(member.hp ?? base.maxHp), 0, Math.max(base.maxHp, Number(member.maxHp || base.maxHp))),
      stress: clamp(Number(member.stress ?? base.stress), 0, 100),
      block: Number(member.block || 0),
      evade: Number(member.evade || 0),
      active: Boolean(member.active)
    };
  }

  function makeCharacter(id, active) {
    const base = charactersById[id];
    return { ...clone(base), hp: base.maxHp, block: 0, evade: 0, active: Boolean(active) };
  }

  function makeDeckEntry(state, cardId, acquiredRunId, upgraded) {
    return { instanceId: uid(state, "deck"), cardId, upgraded: Boolean(upgraded), acquiredRunId: acquiredRunId || null };
  }

  function makeEquipmentEntry(state, equipmentId, acquiredRunId) {
    return { instanceId: uid(state, "equipment"), equipmentId, upgraded: false, acquiredRunId: acquiredRunId || null };
  }

  function uid(state, prefix) {
    const value = `${prefix}-${state.nextId || 1}`;
    state.nextId = (state.nextId || 1) + 1;
    return value;
  }

  function beginTutorial(state) {
    const next = clone(state);
    if (next.campaign.tutorialComplete) return next;
    next.run = {
      id: uid(next, "run"),
      scenarioId: "tutorial",
      sourceScenarioId: "tutorial",
      tutorialStage: 0,
      acquiredDeckIds: [],
      acquiredEquipmentIds: [],
      temporaryPowers: [],
      map: null
    };
    next.pending = null;
    return startEncounter(next, "bio-lab");
  }

  function beginScenario(state, requestedScenarioId) {
    const next = clone(state);
    if (next.screen !== "hub") return next;
    let scenarioId = requestedScenarioId;
    let infinite = false;
    if (scenarioId === "infinite") {
      if (!next.campaign.infiniteUnlocked) return next;
      infinite = true;
      const completedPool = next.campaign.completedScenarios.filter((id) => id !== "tutorial" && scenariosById[id]?.normal);
      const unlockedPool = next.campaign.unlockedScenarios.filter((id) => id !== "tutorial" && scenariosById[id]?.normal);
      scenarioId = randomChoice(next, completedPool.length ? completedPool : unlockedPool);
    }
    if (!next.campaign.unlockedScenarios.includes(scenarioId)) return next;
    const candidates = recruitmentCandidates(next, scenarioId, infinite);
    const activeCount = getActiveParty(next).length;
    const canUseOpeningBonus = scenarioId === "alien" && next.campaign.firstAlienRecruitBonus && candidates.length >= 2;
    if ((!canUseOpeningBonus && activeCount < 3) || activeCount > 6) {
      next.log = appendLog(next.log, "正式劇本需要配置 3 至 6 名出戰者。");
      return next;
    }
    if (candidates.length) {
      next.pending = { kind: "recruit", scenarioId, infinite, candidates };
      next.screen = "recruit";
      return next;
    }
    return launchRun(next, scenarioId, infinite);
  }

  function recruitmentCandidates(state, scenarioId, infinite = false) {
    const owned = new Set(state.party.map((member) => member.id));
    const scenario = scenariosById[scenarioId];
    const legendaryIds = new Set(data.legendaryRecruitmentPool || []);
    const legendaryEligible = Boolean(infinite && state.campaign.infiniteUnlocked && Number(state.campaign.infiniteTier || 0) >= Number(economy.legendaryRecruitmentMinInfiniteTier || 3));
    let pool = scenario.recruitmentPool.filter((id) => !owned.has(id) && !legendaryIds.has(id));
    if (scenarioId === "devil-may-cry-5") {
      const featured = dmc5FeaturedRecruitIds.filter((id) => pool.includes(id));
      if (featured.length) {
        const filler = takeRandom(state, pool.filter((id) => !featured.includes(id)), Math.max(0, 3 - featured.length));
        return [...featured, ...filler].slice(0, 3);
      }
    }
    if (state.campaign.infiniteUnlocked && pool.length < 3) {
      pool = data.characters.filter((item) => !item.tutorialOnly && !owned.has(item.id) && !legendaryIds.has(item.id)).map((item) => item.id);
    }
    if (legendaryEligible) {
      const legendaryPool = (data.legendaryRecruitmentPool || []).filter((id) => !owned.has(id));
      const legendaryCandidate = randomChoice(state, legendaryPool);
      if (legendaryCandidate && !pool.includes(legendaryCandidate)) pool = [...pool, legendaryCandidate];
    }
    return takeRandom(state, pool, 3);
  }

  function chooseRecruit(state, characterId) {
    const next = clone(state);
    if (next.screen !== "recruit" || !next.pending || !next.pending.candidates.includes(characterId)) return next;
    const scenarioId = next.pending.scenarioId;
    recruitCharacter(next, characterId);
    if (scenarioId === "devil-may-cry-5") {
      dmc5FeaturedRecruitIds.forEach((id) => recruitCharacter(next, id));
    }
    if (next.pending.scenarioId === "alien" && next.campaign.firstAlienRecruitBonus && next.party.length < 3) {
      const remaining = next.pending.candidates.filter((id) => id !== characterId);
      if (remaining.length) {
        const bonusId = randomChoice(next, remaining);
        recruitCharacter(next, bonusId);
        next.log = appendLog(next.log, `${charactersById[bonusId].name}也決定加入隊伍。`);
      }
      next.campaign.firstAlienRecruitBonus = false;
    }
    const infinite = next.pending.infinite;
    next.pending = null;
    ensureFormation(next);
    return launchRun(next, scenarioId, infinite);
  }

  function recruitCharacter(state, characterId) {
    if (!charactersById[characterId] || state.party.some((member) => member.id === characterId)) return;
    const active = getActiveParty(state).length < 3;
    state.party.push(makeCharacter(characterId, active));
    state.log = appendLog(state.log, `${charactersById[characterId].name}加入中洲隊。`);
  }

  function launchRun(state, scenarioId, infinite) {
    const scenario = scenariosById[scenarioId];
    state.run = {
      id: uid(state, "run"),
      scenarioId,
      sourceScenarioId: infinite ? "infinite" : scenarioId,
      seed: nextRandom(state),
      map: generateMap(state, scenario),
      currentNodeId: null,
      currentLayer: 0,
      currentLane: null,
      acquiredDeckIds: [],
      acquiredEquipmentIds: [],
      temporaryPowers: [],
      pendingRecruitUsed: false
    };
    state.screen = scenario.opening ? "scenario-intro" : "map";
    state.pending = null;
    state.log = appendLog(state.log, `${scenario.name}開始：${scenario.intro}`);
    return state;
  }

  function continueScenarioIntro(state) {
    const next = clone(state);
    if (next.screen !== "scenario-intro" || !next.run) return next;
    next.screen = "map";
    return next;
  }

  function generateMap(state, scenario) {
    const randomTypes = ["battle", "battle", "elite", "event", "treasure"];
    const layers = [];
    for (let layer = 1; layer <= 8; layer += 1) {
      const nodes = [];
      for (let lane = 0; lane < 3; lane += 1) {
        let type = "battle";
        if ([2, 3, 6, 7].includes(layer)) type = randomChoice(state, randomTypes);
        if (layer === 4) type = "miniboss";
        if (layer === 5) type = "camp";
        if (layer === 8) type = "boss";
        let encounterId = null;
        if (type === "battle") encounterId = randomChoice(state, scenario.normal);
        if (type === "elite") encounterId = randomChoice(state, scenario.elite);
        if (type === "miniboss") encounterId = scenario.miniboss;
        if (type === "boss") encounterId = scenario.boss;
        nodes.push({ id: `layer-${layer}-lane-${lane}`, layer, lane, type, encounterId, completed: false });
      }
      layers.push(nodes);
    }
    return { layers };
  }

  function chooseMapNode(state, nodeId) {
    const next = clone(state);
    if (next.screen !== "map" || !next.run) return next;
    const node = findMapNode(next.run.map, nodeId);
    if (!node || !isNodeAvailable(next, node)) return next;
    next.run.currentNodeId = node.id;
    if (["battle", "elite", "miniboss", "boss"].includes(node.type)) return startEncounter(next, node.encounterId);
    if (node.type === "camp") {
      next.screen = "camp";
      next.pending = { kind: "camp" };
      return next;
    }
    if (node.type === "treasure") {
      next.screen = "treasure";
      next.pending = { kind: "treasure", choices: chooseEquipmentRewards(next, hasPassive(next, "artifact-sense") ? 4 : 3) };
      return next;
    }
    next.screen = "event";
    next.pending = buildEvent(next);
    return next;
  }

  function findMapNode(map, nodeId) {
    for (const layer of map.layers) {
      const node = layer.find((item) => item.id === nodeId);
      if (node) return node;
    }
    return null;
  }

  function isNodeAvailable(state, node) {
    if (!state.run || node.completed || node.layer !== state.run.currentLayer + 1) return false;
    return state.run.currentLane === null || Math.abs(node.lane - state.run.currentLane) <= 1;
  }

  function startEncounter(state, encounterId) {
    const encounter = encountersById[encounterId];
    const infiniteScale = state.run && state.run.sourceScenarioId === "infinite" ? state.campaign.infiniteTier * 0.14 : 0;
    state.screen = "combat";
    state.activeEncounterId = encounterId;
    state.activeEnemies = encounter.enemies.map((enemyId) => {
      const base = clone(enemiesById[enemyId]);
      const maxHp = Math.ceil(base.maxHp * (1 + infiniteScale));
      if (base.phaseTwo?.maxHp) base.phaseTwo.maxHp = Math.ceil(base.phaseTwo.maxHp * (1 + infiniteScale));
      return { ...base, uid: uid(state, "enemy"), enemyId, maxHp, hp: maxHp, block: 0, intentIndex: 0, burn: 0, poison: 0, stun: 0, weak: 0, phaseTwoTriggered: false };
    });
    state.selectedTargetId = state.activeEnemies[0]?.uid || null;
    state.turn = 0;
    state.hand = [];
    state.discardPile = [];
    state.exhaustedPile = [];
    state.combatFlags = { lastChanceUsed: [], bondTriggers: [] };
    const permanent = state.deck.map((entry) => makeCombatCard(state, entry.cardId, null, entry.upgraded, entry.instanceId));
    const signatures = getAliveActiveParty(state).map((member) => makeCombatCard(
      state,
      member.signatureCardId,
      member.id,
      state.permanentUpgrades.signatures.includes(member.id),
      null
    ));
    state.drawPile = shuffleWithState(state, [...permanent, ...signatures]);
    state.party = state.party.map((member) => ({ ...member, block: 0, evade: 0 }));
    state.log = appendLog(state.log, `${encounter.name}：敵人出現。`);
    const activeBonds = getActiveBonds(state);
    if (activeBonds.length) state.log = appendLog(state.log, `羈絆啟用：${activeBonds.map((bond) => bond.name).join("、")}。`);
    return startPlayerTurn(state);
  }

  function makeCombatCard(state, cardId, ownerId, upgraded, sourceDeckInstanceId) {
    return { uid: uid(state, "card"), cardId, ownerId: ownerId || null, upgraded: Boolean(upgraded), sourceDeckInstanceId: sourceDeckInstanceId || null };
  }

  function startPlayerTurn(state) {
    purgeDownedSignatures(state);
    state.turn += 1;
    state.turnStats = freshTurnStats();
    state.party = state.party.map((member) => member.active ? { ...member, block: 0 } : member);
    applyTurnStartPassives(state);
    applyBondTurnStartEffects(state);
    const passiveOpeningEnergy = state.turn === 1 && hasPassive(state, "opening-overdrive") ? 2 : 0;
    const bondOpeningEnergy = state.turn === 1 ? bondEffectTotal(state, "openingEnergy") : 0;
    state.maxEnergy = calculateEnergy(state) + (state.turn === 1 ? equipmentEffectTotal(state, "openingEnergy") : 0) + passiveOpeningEnergy + bondOpeningEnergy;
    state.energy = state.maxEnergy;
    let handSize = 5;
    if (state.turn === 1) {
      handSize += equipmentEffectTotal(state, "openingDraw");
      handSize += bondEffectTotal(state, "openingDraw");
      if (state.permanentUpgrades.team.includes("team-opening-draw")) handSize += 1;
      if (hasPassive(state, "opening-forecast")) handSize += 2;
    }
    const reactiveIntent = getLivingEnemies(state).some((enemy) => ["guard", "stress"].includes(getEnemyIntent(enemy).kind));
    if (hasPassive(state, "intent-draw") && reactiveIntent) handSize += 1;
    drawCards(state, handSize);
    state.log = appendLog(state.log, `第 ${state.turn} 回合，存活隊員提供 ${state.maxEnergy} 能量。`);
    return state;
  }

  function playCard(state, cardUid, targetEnemyUid) {
    const next = clone(state);
    const handIndex = next.hand.findIndex((instance) => instance.uid === cardUid);
    if (next.screen !== "combat" || handIndex < 0) return next;
    const instance = next.hand[handIndex];
    const card = effectiveCard(instance);
    if (!card || card.unplayable || (instance.ownerId && !isCharacterAliveActive(next, instance.ownerId))) return next;
    const cost = getCardCost(next, instance);
    if (cost > next.energy) return next;
    const target = getLivingEnemy(next, targetEnemyUid || next.selectedTargetId) || getLivingEnemies(next)[0];
    if (card.damage && !target) return next;
    next.energy -= cost;
    next.hand.splice(handIndex, 1);

    let damage = Number(card.damage || 0);
    let damageAll = Number(card.damageAll || 0);
    const bloodline = card.category === "signature" && instance.ownerId ? getUnlockedBloodline(next, instance.ownerId) : null;
    let piercingAttack = Boolean(card.pierce || bloodline?.effect.pierce);
    let equipmentBurn = 0;
    let passiveBurn = 0;
    const executeApplies = Boolean(card.executeBelow && target && target.hp / target.maxHp <= card.executeBelow);
    if (card.type === "attack") {
      const applyAttackBonus = (bonus) => {
        if (card.damage) damage += bonus;
        if (card.damageAll) damageAll += bonus;
      };
      const sharedBonus = equipmentEffectTotal(next, "attackBonus") + temporaryPowerAmount(next, "attackBonus");
      applyAttackBonus(sharedBonus);
      applyAttackBonus(bondEffectTotal(next, "attackBonus"));
      if (card.damageAll) damageAll += bondEffectTotal(next, "damageAllBonus");
      if (instance.ownerId) applyAttackBonus(bondOwnerAttackBonus(next, instance.ownerId));
      if (hasPassive(next, "first-attack") && !next.turnStats.firstAttackUsed) {
        applyAttackBonus(5);
        next.turnStats.firstAttackUsed = true;
      }
      if (hasPassive(next, "first-ranged-pierce") && !next.turnStats.firstRangedUsed) {
        applyAttackBonus(4);
        next.turnStats.firstRangedUsed = true;
      }
      if (card.cost >= 2 && hasPassive(next, "first-heavy-attack") && !next.turnStats.firstHeavyAttackUsed) {
        applyAttackBonus(6);
        next.turnStats.firstHeavyAttackUsed = true;
      }
      const blackFlameUser = getAliveActiveParty(next).find((member) => member.passiveId === "black-flame-rage");
      if (blackFlameUser?.stress >= 50) applyAttackBonus(5);
      if (card.damage && target && hasPassive(next, "status-exploit") && hasEnemyStatus(target)) damage += 6;
      if (card.damage && target && hasEnemyStatus(target)) damage += bondEffectTotal(next, "statusExploitBonus");
      if (card.damage && target?.block > 0 && hasPassive(next, "armor-breaker")) {
        damage += 5;
        piercingAttack = true;
      }
      if (bondEffectTotal(next, "firstAttackPierce") > 0 && !next.turnStats.firstBondPierceUsed) {
        piercingAttack = true;
        next.turnStats.firstBondPierceUsed = true;
      }
      if (hasPassive(next, "first-attack-pierce") && !next.turnStats.firstPassivePierceUsed) {
        piercingAttack = true;
        next.turnStats.firstPassivePierceUsed = true;
      }
      if (hasPassive(next, "first-attack-burn") && !next.turnStats.firstPassiveBurnUsed) {
        passiveBurn = 4;
        next.turnStats.firstPassiveBurnUsed = true;
      }
      if (!next.turnStats.equipmentFirstAttackUsed) {
        const bonus = equipmentEffectTotal(next, "firstAttackBonus");
        applyAttackBonus(bonus);
        next.turnStats.equipmentFirstAttackUsed = true;
      }
      if (!next.turnStats.equipmentFirstPierceUsed) {
        const bonus = equipmentEffectTotal(next, "firstAttackPierce");
        if (bonus > 0) {
          applyAttackBonus(bonus);
          piercingAttack = true;
          next.turnStats.equipmentFirstPierceUsed = true;
        }
      }
      if (!next.turnStats.equipmentFirstBurnUsed) {
        equipmentBurn = equipmentEffectTotal(next, "firstAttackBurn");
        if (equipmentBurn > 0) next.turnStats.equipmentFirstBurnUsed = true;
      }
      if (bloodline?.effect.criticalMultiplier) {
        damage = Math.ceil(damage * bloodline.effect.criticalMultiplier);
        damageAll = Math.ceil(damageAll * bloodline.effect.criticalMultiplier);
      }
      if (card.ownerStressDamageRatio && instance.ownerId) {
        const owner = next.party.find((member) => member.id === instance.ownerId);
        damage += Math.min(Number(card.ownerStressDamageCap || Infinity), Math.floor(Number(owner?.stress || 0) * card.ownerStressDamageRatio));
      }
    }
    if (card.type === "tactic" && hasPassive(next, "first-tactic-discount") && !next.turnStats.firstTacticUsed) next.turnStats.firstTacticUsed = true;
    if (damage > 0 && target) damageEnemy(next, target.uid, damage, card.name, { pierce: piercingAttack });
    if (damageAll > 0) getLivingEnemies(next).forEach((enemy) => damageEnemy(next, enemy.uid, damageAll, card.name, { pierce: piercingAttack }));
    if (executeApplies && card.executeDamage && target) damageEnemy(next, target.uid, card.executeDamage, `${card.name}的處決`, { pierce: true });
    if (equipmentBurn > 0) {
      if (card.damageAll) getLivingEnemies(next).forEach((enemy) => addEnemyStatus(next, enemy.uid, "burn", equipmentBurn));
      else if (target) addEnemyStatus(next, target.uid, "burn", equipmentBurn);
    }
    if (passiveBurn > 0) {
      if (card.damageAll) getLivingEnemies(next).forEach((enemy) => addEnemyStatus(next, enemy.uid, "burn", passiveBurn));
      else if (target) addEnemyStatus(next, target.uid, "burn", passiveBurn);
    }
    if (card.type === "attack" && card.damage && hasPassive(next, "first-attack-splash") && !next.turnStats.firstSplashUsed) {
      getLivingEnemies(next).filter((enemy) => enemy.uid !== target?.uid).forEach((enemy) => damageEnemy(next, enemy.uid, 3, "王俠的定向爆破"));
      next.turnStats.firstSplashUsed = true;
    }
    if (hasPassive(next, "second-card-strike") && next.turnStats.cardsPlayed === 1) {
      const strikeTarget = getLivingEnemy(next, target?.uid) || getLivingEnemies(next)[0];
      if (strikeTarget) damageEnemy(next, strikeTarget.uid, 5, "趙櫻空的影襲");
    }
    if (hasPassive(next, "third-card-volley") && next.turnStats.cardsPlayed === 2) {
      getLivingEnemies(next).forEach((enemy) => damageEnemy(next, enemy.uid, 4, "銘煙薇的靈魂齊射"));
    }
    applyCardEffects(next, card, instance.ownerId, target?.uid);
    if (card.type === "guard" && hasPassive(next, "first-guard-weak") && !next.turnStats.firstGuardWeakUsed) {
      getLivingEnemies(next).forEach((enemy) => addEnemyStatus(next, enemy.uid, "weak", 3));
      next.turnStats.firstGuardWeakUsed = true;
    }
    if (bloodline) applyBloodlineEffect(next, instance.ownerId, bloodline, target?.uid);
    const bondResult = applyBondCardEffects(next, instance, card, target?.uid);
    if (bondResult === "combat-complete") return completeCombat(next);
    if (hasPassive(next, "first-card-draw") && next.turnStats.cardsPlayed === 0) drawCards(next, 1);
    if (card.type === "support" && hasPassive(next, "first-support-draw") && !next.turnStats.firstSupportUsed) {
      drawCards(next, 1);
      next.turnStats.firstSupportUsed = true;
    }
    if (hasPassive(next, "fourth-card-energy") && next.turnStats.cardsPlayed === 3) next.energy += 1;
    if (hasPassive(next, "fifth-card-aegis") && next.turnStats.cardsPlayed === 4) {
      affectAliveActive(next, (member) => ({ ...member, block: member.block + 5, hp: Math.min(member.maxHp, member.hp + 3) }));
    }
    next.turnStats.cardsPlayed += 1;
    if (card.exhaust) next.exhaustedPile.push(instance);
    else next.discardPile.push(instance);
    resolveStressBreaks(next);
    next.selectedTargetId = getLivingEnemy(next, next.selectedTargetId)?.uid || getLivingEnemies(next)[0]?.uid || null;
    if (getLivingEnemies(next).length === 0) return completeCombat(next);
    return next;
  }

  function endPlayerTurn(state) {
    const next = clone(state);
    if (next.screen !== "combat") return next;
    next.discardPile.push(...next.hand);
    next.hand = [];
    resolveEnemyTurn(next);
    if (getLivingEnemies(next).length === 0) return completeCombat(next);
    if (getAliveActiveParty(next).length === 0) {
      next.screen = "defeat";
      next.pending = { kind: "defeat" };
      next.log = appendLog(next.log, "中洲隊全員失去戰鬥能力。");
      return next;
    }
    return startPlayerTurn(next);
  }

  function selectTarget(state, enemyUid) {
    const next = clone(state);
    if (getLivingEnemy(next, enemyUid)) next.selectedTargetId = enemyUid;
    return next;
  }

  function completeCombat(state) {
    const encounter = encountersById[state.activeEncounterId];
    const multiplier = state.run?.sourceScenarioId === "infinite" ? 1 + state.campaign.infiniteTier * 0.12 : 1;
    state.rewardPoints += Math.ceil(encounter.rewardPoints * multiplier);
    state.log = appendLog(state.log, `${encounter.name}完成，獲得 ${Math.ceil(encounter.rewardPoints * multiplier)} 獎勵點。`);
    state.activeEnemies = [];
    state.selectedTargetId = null;
    if (state.run?.scenarioId === "tutorial") return completeTutorialCombat(state);
    const node = findMapNode(state.run.map, state.run.currentNodeId);
    if (node.type === "boss") {
      state.screen = "boss-reward";
      state.rewardChoices = chooseBossRewards(state);
      state.pending = { kind: "boss-reward" };
      return state;
    }
    state.screen = "reward";
    state.rewardChoices = chooseCardRewards(state, encounter.tier === "elite" || encounter.tier === "miniboss" ? 4 : 3);
    state.pending = { kind: "combat-reward" };
    return state;
  }

  function completeTutorialCombat(state) {
    state.run.tutorialStage += 1;
    if (state.run.tutorialStage === 1) {
      state.screen = "story";
      state.pending = { kind: "tutorial-choice-1" };
      return state;
    }
    if (state.run.tutorialStage === 2) {
      state.screen = "story";
      state.pending = { kind: "tutorial-choice-2" };
      return state;
    }
    state.campaign.tutorialComplete = true;
    state.campaign.unlockedScenarios = ["alien"];
    state.party = state.party.filter((member) => member.id !== "zhang-jie");
    state.rewardPoints += Number(economy.tutorialClearReward || 1000);
    if (!state.equipmentInventory.some((item) => item.equipmentId === "infinite-desert-eagle")) {
      state.equipmentInventory.push(makeEquipmentEntry(state, "infinite-desert-eagle", null));
    }
    state.log = appendLog(state.log, "張杰完成引導後離開隊伍。異形劇本已開放。");
    return returnToHubWithRepair(state);
  }

  function chooseStoryOption(state, optionId) {
    const next = clone(state);
    if (next.screen !== "story" || !next.pending) return next;
    if (next.pending.kind === "tutorial-intro") return beginTutorial(next);
    if (next.pending.kind === "tutorial-choice-1") {
      if (optionId === "search") addRunCard(next, "field-medicine");
      if (optionId === "rush") next.rewardPoints += Number(economy.tutorialRushReward || 300);
      next.pending = null;
      return startEncounter(next, "bio-stairs");
    }
    if (next.pending.kind === "tutorial-choice-2") {
      if (optionId === "armory" && !next.equipmentInventory.some((item) => item.equipmentId === "infinite-desert-eagle")) {
        const item = makeEquipmentEntry(next, "infinite-desert-eagle", next.run.id);
        next.equipmentInventory.push(item);
        next.run.acquiredEquipmentIds.push(item.instanceId);
        next.equipped["zheng-zha"] = item.instanceId;
      }
      if (optionId === "rest") healActive(next, 0.25, 12);
      next.pending = null;
      return startEncounter(next, "bio-crawler");
    }
    return next;
  }

  function claimCombatReward(state, rewardId) {
    const next = clone(state);
    if (next.screen !== "reward") return next;
    if (rewardId !== "skip") {
      const card = next.rewardChoices.find((item) => item.id === rewardId);
      if (card) addRunCard(next, card.id);
    } else {
      next.rewardPoints += Number(economy.skipCardReward || 150);
    }
    return completeCurrentNode(next);
  }

  function claimBossReward(state, rewardId) {
    const next = clone(state);
    if (next.screen !== "boss-reward") return next;
    const reward = next.rewardChoices.find((item) => item.id === rewardId);
    if (!reward) return next;
    if (reward.kind === "card") addRunCard(next, reward.itemId);
    if (reward.kind === "equipment") addRunEquipment(next, reward.itemId);
    if (reward.kind === "upgrade") next.upgradeTokens += 1;
    return completeScenario(next);
  }

  function completeScenario(state) {
    const scenarioId = state.run.scenarioId;
    state.deck.forEach((entry) => { if (entry.acquiredRunId === state.run.id) entry.acquiredRunId = null; });
    state.equipmentInventory.forEach((entry) => { if (entry.acquiredRunId === state.run.id) entry.acquiredRunId = null; });
    if (!state.campaign.completedScenarios.includes(scenarioId)) state.campaign.completedScenarios.push(scenarioId);
    const nextScenario = { alien: "juon", juon: "mummy-curse", "mummy-curse": "jurassic-island", "jurassic-island": "abyssal-ark", "abyssal-ark": "evernight-castle", "evernight-castle": "demon-frontier", "demon-frontier": "main-god-trial", "main-god-trial": "starship-troopers", "starship-troopers": "avp-pyramid", "avp-pyramid": "nightmare-elm", "nightmare-elm": "lotr-war", "lotr-war": "rumbling-finale", "rumbling-finale": "infinity-castle", "infinity-castle": "naruto-final-valley", "naruto-final-valley": "bleach-false-karakura", "bleach-false-karakura": "gintama-yoshiwara", "gintama-yoshiwara": "gintama-final-war", "gintama-final-war": "avengers-new-york", "avengers-new-york": "batman-v-superman", "batman-v-superman": "devil-may-cry-5", "devil-may-cry-5": "final-destination", "final-destination": "jinyong-heroic-peak" }[scenarioId];
    if (nextScenario && !state.campaign.unlockedScenarios.includes(nextScenario)) state.campaign.unlockedScenarios.push(nextScenario);
    if (scenarioId === "batman-v-superman") state.campaign.infiniteUnlocked = true;
    if (state.run.sourceScenarioId === "infinite") state.campaign.infiniteTier += 1;
    const sideStoryReward = Number(economy.scenarioSideStoryRewards?.[scenarioId] || 0);
    if (sideStoryReward) state.sideStories += sideStoryReward;
    state.log = appendLog(state.log, `${scenariosById[scenarioId].name}劇本完成。`);
    return returnToHubWithRepair(state);
  }

  function claimTreasure(state, rewardId) {
    const next = clone(state);
    if (next.screen !== "treasure" || !next.pending) return next;
    if (rewardId === "qi-secret" && hasPassive(next, "artifact-sense")) {
      next.sideStories += 1;
      next.rewardPoints += Number(economy.qiSecretReward || 500);
    } else if (rewardId === "salvage") {
      next.rewardPoints += Number(economy.treasureSalvageReward || 700);
    } else if (equipmentById[rewardId]) {
      addRunEquipment(next, rewardId);
    }
    return completeCurrentNode(next);
  }

  function buildEvent(state) {
    const unlockedPool = new Set(
      data.scenarios
        .filter((scenario) => scenario.id !== "tutorial" && (state.campaign.unlockedScenarios.includes(scenario.id) || scenario.id === state.run?.scenarioId))
        .flatMap((scenario) => scenario.recruitmentPool)
    );
    const unowned = data.characters.filter((item) => unlockedPool.has(item.id) && !state.party.some((member) => member.id === item.id));
    const candidate = unowned.length ? randomChoice(state, unowned).id : null;
    return { kind: "event", candidate, scenarioId: state.run?.scenarioId || null };
  }

  function resolveEvent(state, optionId) {
    const next = clone(state);
    if (next.screen !== "event" || !next.pending) return next;
    if (optionId === "curse-story") {
      const curseId = randomChoice(next, ["curse-panic", "curse-drain"]);
      const curse = makeDeckEntry(next, curseId, next.run.id);
      next.deck.push(curse);
      next.curses.push(curse.instanceId);
      next.rewardPoints += Number(economy.curseStoryReward || 900);
    }
    if (optionId === "temporary-power") next.run.temporaryPowers.push({ id: "battle-instinct", effect: "attackBonus", amount: 2 });
    if (optionId === "scenario-power") {
      const power = scenariosById[next.pending.scenarioId]?.scenarioPower;
      if (power && !next.run.temporaryPowers.some((item) => item.id === power.id)) next.run.temporaryPowers.push(clone(power));
    }
    if (optionId === "recruit" && next.pending.candidate) recruitCharacter(next, next.pending.candidate);
    if (optionId === "qi-insight" && hasPassive(next, "artifact-sense")) {
      next.sideStories += 1;
      next.run.temporaryPowers.push({ id: "warded", effect: "openingBlock", amount: 4 });
    }
    return completeCurrentNode(next);
  }

  function campAction(state, action, targetId) {
    const next = clone(state);
    if (next.screen !== "camp") return next;
    if (action === "heal") {
      healActive(next, 0.3, 15);
      return completeCurrentNode(next);
    }
    if (action === "upgrade-deck") {
      const entry = next.deck.find((item) => item.instanceId === targetId && cardsById[item.cardId].category === "general" && !item.upgraded);
      if (entry) entry.upgraded = true;
      return entry ? completeCurrentNode(next) : next;
    }
    if (action === "upgrade-signature") {
      if (!next.permanentUpgrades.signatures.includes(targetId) && next.party.some((member) => member.id === targetId)) {
        next.permanentUpgrades.signatures.push(targetId);
        return completeCurrentNode(next);
      }
    }
    if (action === "upgrade-equipment") {
      const entry = next.equipmentInventory.find((item) => item.instanceId === targetId && !item.upgraded);
      if (entry) {
        entry.upgraded = true;
        return completeCurrentNode(next);
      }
    }
    return next;
  }

  function completeCurrentNode(state) {
    const node = findMapNode(state.run.map, state.run.currentNodeId);
    if (node) {
      node.completed = true;
      state.run.currentLayer = node.layer;
      state.run.currentLane = node.lane;
    }
    state.screen = "map";
    state.pending = null;
    state.rewardChoices = [];
    state.activeEncounterId = null;
    clearCombatPiles(state);
    return state;
  }

  function returnAfterDefeat(state) {
    const next = clone(state);
    if (next.run) {
      next.deck = next.deck.filter((entry) => entry.acquiredRunId !== next.run.id || cardsById[entry.cardId].category === "curse");
      const lostEquipment = new Set(next.equipmentInventory.filter((entry) => entry.acquiredRunId === next.run.id).map((entry) => entry.instanceId));
      next.equipmentInventory = next.equipmentInventory.filter((entry) => entry.acquiredRunId !== next.run.id);
      Object.keys(next.equipped).forEach((characterId) => {
        if (lostEquipment.has(next.equipped[characterId])) delete next.equipped[characterId];
      });
    }
    next.rewardPoints = Math.floor(next.rewardPoints * 0.8);
    next.log = appendLog(next.log, "遠征失敗：本次普通卡牌、裝備與暫時強化已失去。");
    return returnToHubWithRepair(next);
  }

  function returnToHubWithRepair(state) {
    const missingHp = state.party.reduce((sum, member) => sum + Math.max(0, member.maxHp - member.hp), 0);
    const stress = state.party.reduce((sum, member) => sum + member.stress, 0);
    const downed = state.party.filter((member) => member.hp <= 0).length;
    const fullCost = Math.ceil(missingHp / 3 + stress / 5 + downed * 20);
    const paid = Math.min(state.rewardPoints, fullCost);
    const ratio = fullCost > 0 ? paid / fullCost : 1;
    state.rewardPoints -= paid;
    state.party = state.party.map((member) => ({
      ...member,
      hp: member.hp <= 0 ? Math.max(1, Math.round(member.maxHp * ratio)) : Math.min(member.maxHp, Math.round(member.hp + (member.maxHp - member.hp) * ratio)),
      stress: Math.max(0, Math.round(member.stress * (1 - ratio))),
      block: 0,
      evade: 0
    }));
    state.screen = "hub";
    state.pending = null;
    state.run = null;
    state.activeEncounterId = null;
    state.activeEnemies = [];
    clearCombatPiles(state);
    state.log = appendLog(state.log, `鄭吒：「主神全隊恢復，獎勵點數由我這裡扣除！」修復支付 ${paid}/${fullCost} 點。`);
    return state;
  }

  function toggleActive(state, characterId) {
    const next = clone(state);
    if (next.screen !== "hub") return next;
    const target = next.party.find((member) => member.id === characterId);
    if (!target) return next;
    const count = getActiveParty(next).length;
    if (target.active && count <= 3) return next;
    if (!target.active && count >= 6) return next;
    target.active = !target.active;
    return next;
  }

  function setHubTab(state, tabId) {
    const next = clone(state);
    if (next.screen !== "hub" || !["deployment", "roster", "shop"].includes(tabId)) return next;
    next.hubTab = tabId;
    return next;
  }

  function equipItem(state, characterId, equipmentInstanceId) {
    const next = clone(state);
    if (!["hub", "camp"].includes(next.screen) || !next.party.some((member) => member.id === characterId)) return next;
    if (!equipmentInstanceId) {
      delete next.equipped[characterId];
      return next;
    }
    if (!next.equipmentInventory.some((item) => item.instanceId === equipmentInstanceId)) return next;
    Object.keys(next.equipped).forEach((id) => {
      if (next.equipped[id] === equipmentInstanceId) delete next.equipped[id];
    });
    next.equipped[characterId] = equipmentInstanceId;
    return next;
  }

  function buyShopItem(state, shopId) {
    const next = clone(state);
    if (next.screen !== "hub") return next;
    const item = shopById[shopId];
    const bought = next.purchased[shopId] || 0;
    if (!item || bought >= item.stock || next.rewardPoints < item.rewardPointCost || next.sideStories < Number(item.sideStoryCost || 0)) return next;
    if (item.kind === "equipment" && next.equipmentInventory.some((entry) => entry.equipmentId === item.itemId)) return next;
    next.rewardPoints -= item.rewardPointCost;
    next.sideStories -= Number(item.sideStoryCost || 0);
    next.purchased[shopId] = bought + 1;
    if (item.kind === "card") next.deck.push(makeDeckEntry(next, item.itemId, null));
    if (item.kind === "equipment") next.equipmentInventory.push(makeEquipmentEntry(next, item.itemId, null));
    return next;
  }

  function buyPermanentUpgrade(state, upgradeId) {
    const next = clone(state);
    if (next.screen !== "hub") return next;
    const upgrade = permanentUpgradesById[upgradeId];
    if (!upgrade || next.permanentUpgrades.team.includes(upgradeId) || !spendPermanentUpgradeCost(next, upgrade)) return next;
    next.permanentUpgrades.team.push(upgradeId);
    return next;
  }

  function upgradeCharacter(state, characterId) {
    const next = clone(state);
    if (next.screen !== "hub") return next;
    const member = next.party.find((item) => item.id === characterId);
    if (!member) return next;
    const level = Number(next.permanentUpgrades.characters[characterId] || 0);
    if (level >= 3 || !spendPermanentUpgradeCost(next, economy.characterUpgradeCost || { rewardPointCost: 500, sideStoryCost: 1 })) return next;
    next.permanentUpgrades.characters[characterId] = level + 1;
    member.maxHp += 8;
    member.hp += 8;
    return next;
  }

  function upgradeSignature(state, characterId) {
    const next = clone(state);
    if (next.screen !== "hub" || next.permanentUpgrades.signatures.includes(characterId)) return next;
    if (!next.party.some((member) => member.id === characterId)) return next;
    if (!spendPermanentUpgradeCost(next, economy.signatureUpgradeCost || { rewardPointCost: 1000, sideStoryCost: 1 })) return next;
    next.permanentUpgrades.signatures.push(characterId);
    return next;
  }

  function upgradeBloodline(state, characterId) {
    const next = clone(state);
    const bloodline = bloodlinesByCharacterId[characterId];
    if (next.screen !== "hub" || !bloodline || bloodline.tutorialOnly || next.permanentUpgrades.bloodlines.includes(characterId)) return next;
    if (!next.party.some((member) => member.id === characterId)) return next;
    if (!spendPermanentUpgradeCost(next, bloodline)) return next;
    next.permanentUpgrades.bloodlines.push(characterId);
    next.log = appendLog(next.log, `${charactersById[characterId].name}完成「${bloodline.name}」強化。`);
    return next;
  }

  function normalizeUpgradeCost(cost) {
    if (typeof cost === "number") return { rewardPointCost: 0, sideStoryCost: cost };
    const sideStoryCost = Number(cost?.sideStoryCost || 0);
    const rewardPointCost = Number(cost?.rewardPointCost ?? (sideStoryCost ? sideStoryCost * Number(economy.defaultSideStoryPointCost || 1400) : 0));
    return { rewardPointCost, sideStoryCost };
  }

  function spendPermanentUpgradeCost(state, cost) {
    const { rewardPointCost, sideStoryCost } = normalizeUpgradeCost(cost);
    if (state.upgradeTokens > 0) {
      state.upgradeTokens -= 1;
      return true;
    }
    if (state.rewardPoints < rewardPointCost) return false;
    if (state.sideStories < sideStoryCost) return false;
    state.rewardPoints -= rewardPointCost;
    state.sideStories -= sideStoryCost;
    return true;
  }

  function removeCurse(state, deckInstanceId) {
    const next = clone(state);
    const cost = Number(economy.curseRemovalCost || 400);
    if (next.screen !== "hub" || next.rewardPoints < cost || !next.curses.includes(deckInstanceId)) return next;
    next.rewardPoints -= cost;
    next.deck = next.deck.filter((entry) => entry.instanceId !== deckInstanceId);
    next.curses = next.curses.filter((id) => id !== deckInstanceId);
    return next;
  }

  function removeDeckCard(state, deckInstanceId) {
    const next = clone(state);
    const cost = Number(economy.deckCardRemovalCost || 300);
    const minimumDeckSize = Number(economy.minimumDeckSize || 6);
    const entry = next.deck.find((item) => item.instanceId === deckInstanceId);
    const card = entry ? cardsById[entry.cardId] : null;
    if (next.screen !== "hub" || !entry || !card || card.category === "curse") return next;
    if (next.rewardPoints < cost || next.deck.length <= minimumDeckSize) return next;
    next.rewardPoints -= cost;
    next.deck = next.deck.filter((item) => item.instanceId !== deckInstanceId);
    return next;
  }

  function addRunCard(state, cardId) {
    const entry = makeDeckEntry(state, cardId, state.run?.id || null);
    state.deck.push(entry);
    if (state.run) state.run.acquiredDeckIds.push(entry.instanceId);
  }

  function addRunEquipment(state, equipmentId) {
    if (state.equipmentInventory.some((entry) => entry.equipmentId === equipmentId)) {
      state.rewardPoints += Number(economy.duplicateEquipmentReward || 600);
      return;
    }
    const entry = makeEquipmentEntry(state, equipmentId, state.run?.id || null);
    state.equipmentInventory.push(entry);
    if (state.run) state.run.acquiredEquipmentIds.push(entry.instanceId);
  }

  function chooseCardRewards(state, count) {
    const pool = data.cards.filter((card) => card.category === "general" && card.rarity !== "starter");
    return takeRandom(state, pool, count);
  }

  function chooseEquipmentRewards(state, count) {
    const owned = new Set(state.equipmentInventory.map((entry) => entry.equipmentId));
    return takeRandom(state, data.equipment.filter((item) => !owned.has(item.id)), count);
  }

  function chooseBossRewards(state) {
    const rare = takeRandom(state, data.cards.filter((card) => card.category === "general" && card.rarity === "rare"), 1)[0];
    const equipment = chooseEquipmentRewards(state, 1)[0] || randomChoice(state, data.equipment);
    return [
      { id: `boss-card-${rare.id}`, kind: "card", itemId: rare.id, name: rare.name, text: rare.text },
      { id: `boss-equipment-${equipment.id}`, kind: "equipment", itemId: equipment.id, name: equipment.name, text: equipment.text },
      { id: "boss-upgrade-token", kind: "upgrade", itemId: null, name: "永久強化券", text: "獲得 1 枚強化券，可在主神空間免費購買一次永久強化。" }
    ];
  }

  function applyTurnStartPassives(state) {
    const alive = getAliveActiveParty(state);
    if (state.turn === 1) {
      alive.filter((member) => member.passiveId === "opening-overdrive").forEach((pilot) => {
        updateMember(state, pilot.id, (member) => ({ ...member, stress: clamp(member.stress + 8, 0, 100) }));
      });
    }
    if (alive.some((member) => member.passiveId === "mentor-guard")) {
      affectAliveActive(state, (member) => ({ ...member, block: member.block + 8, stress: Math.max(0, member.stress - 2) }));
    }
    if (alive.some((member) => member.passiveId === "turn-stress-relief")) affectAliveActive(state, (member) => ({ ...member, stress: Math.max(0, member.stress - 2) }));
    if (alive.some((member) => member.passiveId === "turn-block")) affectAliveActive(state, (member) => ({ ...member, block: member.block + 3 }));
    if (alive.some((member) => member.passiveId === "turn-heal-lowest")) {
      const lowest = [...alive].sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
      if (lowest) updateMember(state, lowest.id, (member) => ({ ...member, hp: Math.min(member.maxHp, member.hp + 3) }));
    }
    alive.filter((member) => member.passiveId === "turn-self-heal").forEach((priest) => {
      updateMember(state, priest.id, (member) => ({ ...member, hp: Math.min(member.maxHp, member.hp + 3) }));
      affectAliveActive(state, (member) => ({ ...member, block: member.block + 1 }));
    });
    if (alive.some((member) => member.passiveId === "front-guard")) {
      const guard = alive.find((member) => member.passiveId === "front-guard");
      const lowest = [...alive].sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
      [guard?.id, lowest?.id].filter(Boolean).forEach((id) => updateMember(state, id, (member) => ({ ...member, block: member.block + 4 })));
    }
    const hostileIntent = getLivingEnemies(state).some((enemy) => ["attack", "cleave"].includes(getEnemyIntent(enemy).kind));
    if (alive.some((member) => member.passiveId === "intent-barrier") && hostileIntent) affectAliveActive(state, (member) => ({ ...member, block: member.block + 2 }));
    const turnBlock = equipmentEffectTotal(state, "turnBlock") + temporaryPowerAmount(state, "turnBlock");
    const stressRelief = equipmentEffectTotal(state, "turnStressRelief");
    const turnHealLowest = equipmentEffectTotal(state, "turnHealLowest");
    const temporaryBlock = state.turn === 1 ? temporaryPowerAmount(state, "openingBlock") : 0;
    if (turnBlock || temporaryBlock) affectAliveActive(state, (member) => ({ ...member, block: member.block + turnBlock + temporaryBlock }));
    if (stressRelief) affectAliveActive(state, (member) => ({ ...member, stress: Math.max(0, member.stress - stressRelief) }));
    if (turnHealLowest) {
      const lowest = [...getAliveActiveParty(state)].sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
      if (lowest) updateMember(state, lowest.id, (member) => ({ ...member, hp: Math.min(member.maxHp, member.hp + turnHealLowest) }));
    }
    if (state.turn === 1) {
      const openingEvade = equipmentEffectTotal(state, "openingEvade");
      if (openingEvade) affectAliveActive(state, (member) => ({ ...member, evade: Number(member.evade || 0) + openingEvade }));
    }
    if (state.turn === 1 && state.permanentUpgrades.team.includes("team-opening-block")) affectAliveActive(state, (member) => ({ ...member, block: member.block + 4 }));
  }

  function applyBondTurnStartEffects(state) {
    const bonds = getActiveBonds(state);
    bonds.forEach((bond) => {
      const effects = bond.effects || {};
      if (state.turn === 1 && effects.openingStress) {
        Object.entries(effects.openingStress).forEach(([characterId, amount]) => {
          updateMember(state, characterId, (member) => ({ ...member, stress: clamp(member.stress + Number(amount), 0, 100) }));
        });
      }
    });
    const blockAll = bondEffectTotal(state, "turnBlockAll");
    const stressAll = bondEffectTotal(state, "turnStressAll");
    const reduceStressAll = bondEffectTotal(state, "turnReduceStressAll");
    const healAll = bondEffectTotal(state, "turnHealAll");
    const weakAll = bondEffectTotal(state, "turnWeakAll");
    if (blockAll) affectAliveActive(state, (member) => ({ ...member, block: member.block + blockAll }));
    if (stressAll) affectAliveActive(state, (member) => ({ ...member, stress: clamp(member.stress + stressAll, 0, 100) }));
    if (reduceStressAll) affectAliveActive(state, (member) => ({ ...member, stress: Math.max(0, member.stress - reduceStressAll) }));
    if (healAll) affectAliveActive(state, (member) => ({ ...member, hp: Math.min(member.maxHp, member.hp + healAll) }));
    if (weakAll) getLivingEnemies(state).forEach((enemy) => addEnemyStatus(state, enemy.uid, "weak", weakAll));
  }

  function applyCardEffects(state, card, ownerId, targetEnemyUid) {
    const target = state.activeEnemies.find((enemy) => enemy.uid === targetEnemyUid) || getLivingEnemies(state)[0];
    if (card.blockAll) affectAliveActive(state, (member) => ({ ...member, block: member.block + card.blockAll }));
    if (card.healAll) affectAliveActive(state, (member) => ({ ...member, hp: Math.min(member.maxHp, member.hp + card.healAll) }));
    if (card.healLowest) {
      const target = [...getAliveActiveParty(state)].sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
      if (target) updateMember(state, target.id, (member) => ({ ...member, hp: Math.min(member.maxHp, member.hp + card.healLowest) }));
    }
    if (card.burnTarget && target) addEnemyStatus(state, target.uid, "burn", card.burnTarget);
    if (card.burnAll) getLivingEnemies(state).forEach((enemy) => addEnemyStatus(state, enemy.uid, "burn", card.burnAll));
    if (card.poisonTarget && target) addEnemyStatus(state, target.uid, "poison", card.poisonTarget);
    if (card.poisonAll) getLivingEnemies(state).forEach((enemy) => addEnemyStatus(state, enemy.uid, "poison", card.poisonAll));
    if (card.stunTarget && target) addEnemyStatus(state, target.uid, "stun", card.stunTarget);
    if (card.stunAll) getLivingEnemies(state).forEach((enemy) => addEnemyStatus(state, enemy.uid, "stun", card.stunAll));
    if (card.weakTarget && target) addEnemyStatus(state, target.uid, "weak", card.weakTarget);
    if (card.weakAll) getLivingEnemies(state).forEach((enemy) => addEnemyStatus(state, enemy.uid, "weak", card.weakAll));
    if (card.evadeOwner && ownerId) updateMember(state, ownerId, (member) => ({ ...member, evade: Number(member.evade || 0) + card.evadeOwner }));
    if (card.evadeAll) affectAliveActive(state, (member) => ({ ...member, evade: Number(member.evade || 0) + card.evadeAll }));
    if (card.reduceStress) affectAliveActive(state, (member) => ({ ...member, stress: Math.max(0, member.stress - card.reduceStress) }));
    if (card.addStress) affectAliveActive(state, (member) => ({ ...member, stress: clamp(member.stress + card.addStress, 0, 100) }));
    if (card.gainEnergy) state.energy += card.gainEnergy;
    if (card.draw) drawCards(state, card.draw);
  }

  function applyBondCardEffects(state, instance, card, targetEnemyUid) {
    const target = state.activeEnemies.find((enemy) => enemy.uid === targetEnemyUid) || getLivingEnemies(state)[0];
    const currentCardNumber = state.turnStats.cardsPlayed + 1;
    const bonds = getActiveBonds(state);

    for (const bond of bonds) {
      const chain = bond.effects?.chainWin;
      if (chain && currentCardNumber === chain.cardsPlayed && instance.ownerId === chain.ownerId) {
        state.log = appendLog(state.log, `羈絆「${bond.name}」完成終局佈局，戰鬥直接勝利。`);
        return "combat-complete";
      }
    }

    if (card.type === "tactic" && !state.turnStats.firstBondTacticUsed) {
      const draw = bondEffectTotal(state, "firstTacticDraw");
      const energy = bondEffectTotal(state, "firstTacticEnergy");
      const weakAll = bondEffectTotal(state, "firstTacticWeakAll");
      if (draw) drawCards(state, draw);
      if (energy) state.energy += energy;
      if (weakAll) getLivingEnemies(state).forEach((enemy) => addEnemyStatus(state, enemy.uid, "weak", weakAll));
      if (draw || energy || weakAll) {
        state.turnStats.firstBondTacticUsed = true;
        state.log = appendLog(state.log, "羈絆戰術連動啟動。");
      }
    }

    if (currentCardNumber === 2) {
      const damage = bondEffectTotal(state, "secondCardDamage");
      if (damage && target) damageEnemy(state, target.uid, damage, "羈絆追擊", { pierce: true });
      bonds.forEach((bond) => {
        (bond.effects?.secondCardEvade || []).forEach((characterId) => {
          updateMember(state, characterId, (member) => ({ ...member, evade: Number(member.evade || 0) + 1 }));
        });
      });
    }

    if (currentCardNumber === 5) {
      const blockAll = bondEffectTotal(state, "fifthCardBlockAll");
      const healAll = bondEffectTotal(state, "fifthCardHealAll");
      const draw = bondEffectTotal(state, "fifthCardDraw");
      if (blockAll) affectAliveActive(state, (member) => ({ ...member, block: member.block + blockAll }));
      if (healAll) affectAliveActive(state, (member) => ({ ...member, hp: Math.min(member.maxHp, member.hp + healAll) }));
      if (draw) drawCards(state, draw);
    }

    return null;
  }

  function getUnlockedBloodline(state, characterId) {
    const bloodline = bloodlinesByCharacterId[characterId];
    if (!bloodline) return null;
    if (bloodline.tutorialOnly && state.party.some((member) => member.id === characterId)) return bloodline;
    return state.permanentUpgrades.bloodlines.includes(characterId) ? bloodline : null;
  }

  function applyBloodlineEffect(state, ownerId, bloodline, targetEnemyUid) {
    const effect = bloodline.effect || {};
    const target = state.activeEnemies.find((enemy) => enemy.uid === targetEnemyUid) || getLivingEnemies(state)[0];
    if (effect.extraDamageTarget && target) damageEnemy(state, target.uid, effect.extraDamageTarget, bloodline.name, { pierce: true });
    if (effect.extraDamageAll) getLivingEnemies(state).forEach((enemy) => damageEnemy(state, enemy.uid, effect.extraDamageAll, bloodline.name, { pierce: true }));
    if (effect.burnTarget && target) addEnemyStatus(state, target.uid, "burn", effect.burnTarget);
    if (effect.burnAll) getLivingEnemies(state).forEach((enemy) => addEnemyStatus(state, enemy.uid, "burn", effect.burnAll));
    if (effect.poisonTarget && target) addEnemyStatus(state, target.uid, "poison", effect.poisonTarget);
    if (effect.poisonAll) getLivingEnemies(state).forEach((enemy) => addEnemyStatus(state, enemy.uid, "poison", effect.poisonAll));
    if (effect.stunTarget && target) addEnemyStatus(state, target.uid, "stun", effect.stunTarget);
    if (effect.stunAll) getLivingEnemies(state).forEach((enemy) => addEnemyStatus(state, enemy.uid, "stun", effect.stunAll));
    if (effect.weakTarget && target) addEnemyStatus(state, target.uid, "weak", effect.weakTarget);
    if (effect.weakAll) getLivingEnemies(state).forEach((enemy) => addEnemyStatus(state, enemy.uid, "weak", effect.weakAll));
    if (effect.evadeOwner) updateMember(state, ownerId, (member) => ({ ...member, evade: Number(member.evade || 0) + effect.evadeOwner }));
    if (effect.evadeAll) affectAliveActive(state, (member) => ({ ...member, evade: Number(member.evade || 0) + effect.evadeAll }));
    if (effect.blockAll) affectAliveActive(state, (member) => ({ ...member, block: member.block + effect.blockAll }));
    if (effect.healOwner) updateMember(state, ownerId, (member) => ({ ...member, hp: Math.min(member.maxHp, member.hp + effect.healOwner) }));
    if (effect.healAll) affectAliveActive(state, (member) => ({ ...member, hp: Math.min(member.maxHp, member.hp + effect.healAll) }));
    if (effect.reduceStress) affectAliveActive(state, (member) => ({ ...member, stress: Math.max(0, member.stress - effect.reduceStress) }));
    if (effect.gainEnergy) state.energy += effect.gainEnergy;
    if (effect.draw) drawCards(state, effect.draw);
    state.log = appendLog(state.log, `${charactersById[ownerId].name}觸發血統「${bloodline.name}」。`);
  }

  function addEnemyStatus(state, enemyUid, status, amount) {
    const enemy = state.activeEnemies.find((item) => item.uid === enemyUid && item.hp > 0);
    if (!enemy || !amount) return;
    enemy[status] = Number(enemy[status] || 0) + amount;
  }

  function hasEnemyStatus(enemy) {
    return ["burn", "poison", "stun", "weak"].some((status) => Number(enemy?.[status] || 0) > 0);
  }

  function resolveEnemyTurn(state) {
    getLivingEnemies(state).forEach((enemy) => {
      resolveEnemyDamageOverTime(state, enemy);
      if (enemy.hp <= 0) return;
      if (enemy.stun > 0) {
        enemy.stun -= 1;
        enemy.intentIndex = (enemy.intentIndex + 1) % enemy.intents.length;
        state.log = appendLog(state.log, `${enemy.name}的行動被封鎖。`);
        return;
      }
      const intent = getEnemyIntent(enemy);
      const weakenedAmount = ["attack", "cleave"].includes(intent.kind) ? Math.max(0, intent.amount - Number(enemy.weak || 0)) : intent.amount;
      enemy.block = 0;
      if (enemy.regen) healEnemy(state, enemy, enemy.regen, "自我修復");
      if (intent.kind === "attack") {
        const target = pickTarget(getAliveActiveParty(state), intent.targetMode);
        if (target) damageCharacter(state, target.id, weakenedAmount);
      }
      if (intent.kind === "cleave") getAliveActiveParty(state).forEach((member) => damageCharacter(state, member.id, weakenedAmount));
      if (intent.kind === "stress") affectAliveActive(state, (member) => ({ ...member, stress: clamp(member.stress + intent.amount, 0, 100) }));
      if (intent.kind === "guard") enemy.block += intent.amount;
      if (intent.kind === "regen") {
        healEnemy(state, enemy, intent.amount, intent.label);
        if (intent.block) enemy.block += intent.block;
      }
      if (["attack", "cleave"].includes(intent.kind)) enemy.weak = 0;
      affectAliveActive(state, (member) => ({ ...member, stress: clamp(member.stress + enemy.stressAura, 0, 100) }));
      enemy.intentIndex = (enemy.intentIndex + 1) % enemy.intents.length;
      state.log = appendLog(state.log, `${enemy.name}使用「${intent.label}」。`);
    });
    resolveStressBreaks(state);
  }

  function resolveEnemyDamageOverTime(state, enemy) {
    if (enemy.burn > 0) {
      damageEnemy(state, enemy.uid, enemy.burn, "燃燒", { pierce: true });
      enemy.burn = Math.max(0, enemy.burn - 2);
    }
    if (enemy.hp > 0 && enemy.poison > 0) {
      damageEnemy(state, enemy.uid, enemy.poison, "中毒", { pierce: true });
      enemy.poison = Math.max(0, enemy.poison - 1);
    }
  }

  function damageEnemy(state, enemyUid, amount, source, options = {}) {
    const enemy = state.activeEnemies.find((item) => item.uid === enemyUid);
    if (!enemy || enemy.hp <= 0) return;
    const absorbed = options.pierce ? 0 : Math.min(enemy.block, amount);
    const damage = amount - absorbed;
    enemy.block -= absorbed;
    enemy.hp = Math.max(0, enemy.hp - damage);
    state.log = appendLog(state.log, `${source}對${enemy.name}造成 ${damage} 傷害${options.pierce ? "（穿甲）" : ""}。`);
    triggerEnemyPhase(state, enemy);
  }

  function healEnemy(state, enemy, amount, source) {
    if (!enemy || enemy.hp <= 0 || !amount) return;
    const before = enemy.hp;
    enemy.hp = Math.min(enemy.maxHp, enemy.hp + Number(amount));
    const healed = enemy.hp - before;
    if (healed > 0) state.log = appendLog(state.log, `${enemy.name}以${source}恢復 ${healed} 生命。`);
  }

  function triggerEnemyPhase(state, enemy) {
    if (!enemy || enemy.hp > 0 || !enemy.phaseTwo || enemy.phaseTwoTriggered) return;
    const phase = clone(enemy.phaseTwo);
    enemy.name = phase.name || enemy.name;
    enemy.enemyId = phase.enemyId || enemy.enemyId;
    enemy.maxHp = Number(phase.maxHp || enemy.maxHp);
    enemy.hp = enemy.maxHp;
    enemy.block = Number(phase.block || 0);
    enemy.stressAura = Number(phase.stressAura ?? enemy.stressAura);
    enemy.intents = phase.intents || enemy.intents;
    enemy.intentIndex = 0;
    enemy.regen = Number(phase.regen || enemy.regen || 0);
    enemy.burn = 0;
    enemy.poison = 0;
    enemy.stun = 0;
    enemy.weak = 0;
    enemy.phaseTwoTriggered = true;
    enemy.phaseTwo = null;
    state.selectedTargetId = enemy.uid;
    state.log = appendLog(state.log, `${enemy.name}進入第二階段，血肉重新構成。`);
  }

  function damageCharacter(state, characterId, amount) {
    const member = state.party.find((item) => item.id === characterId);
    if (!member || member.hp <= 0) return;
    if (member.evade > 0) {
      member.evade -= 1;
      state.log = appendLog(state.log, `${member.name}閃避了這次攻擊。`);
      return;
    }
    const absorbed = Math.min(member.block, amount);
    const damage = amount - absorbed;
    let hp = Math.max(0, member.hp - damage);
    if (hp === 0 && member.passiveId === "last-chance" && !state.combatFlags.lastChanceUsed.includes(member.id)) {
      hp = 1;
      state.combatFlags.lastChanceUsed.push(member.id);
      state.log = appendLog(state.log, `${member.name}靠求生本能撐住致命傷。`);
    }
    member.block -= absorbed;
    member.hp = hp;
    member.stress = clamp(member.stress + Math.ceil(damage / 2), 0, 100);
  }

  function resolveStressBreaks(state) {
    state.party.forEach((member) => {
      if (!member.active || member.hp <= 0 || member.stress < 100) return;
      member.hp = Math.max(0, member.hp - 8);
      member.stress = 72;
      state.log = appendLog(state.log, `${member.name}精神崩潰，失去 8 生命。`);
    });
  }

  function drawCards(state, amount) {
    for (let index = 0; index < amount; index += 1) {
      if (!state.drawPile.length) {
        if (!state.discardPile.length) return;
        state.drawPile = shuffleWithState(state, state.discardPile);
        state.discardPile = [];
      }
      const instance = state.drawPile.shift();
      if (!instance) return;
      const card = effectiveCard(instance);
      if (card.onDrawStress) affectAliveActive(state, (member) => ({ ...member, stress: clamp(member.stress + card.onDrawStress, 0, 100) }));
      if (card.onDrawDamage) getAliveActiveParty(state).forEach((member) => damageCharacter(state, member.id, card.onDrawDamage));
      state.hand.push(instance);
    }
  }

  function purgeDownedSignatures(state) {
    const downed = new Set(getActiveParty(state).filter((member) => member.hp <= 0).map((member) => member.id));
    ["hand", "drawPile", "discardPile"].forEach((pile) => {
      state[pile] = state[pile].filter((instance) => !instance.ownerId || !downed.has(instance.ownerId));
    });
  }

  function effectiveCard(instance) {
    const base = cardsById[instance.cardId];
    return instance.upgraded && base.upgrade ? { ...base, ...base.upgrade, name: `${base.name}+` } : base;
  }

  function getCardCost(state, instance) {
    const card = effectiveCard(instance);
    if (!card) return 99;
    let cost = card.cost;
    if (card.type === "tactic" && hasPassive(state, "first-tactic-discount") && !state.turnStats.firstTacticUsed) cost -= 1;
    if (card.type === "tactic" && !state.turnStats.firstBondTacticUsed) cost -= bondEffectTotal(state, "firstTacticCostReduction");
    return Math.max(0, cost);
  }

  function getEnemyIntent(enemy) {
    return enemy.intents[enemy.intentIndex % enemy.intents.length];
  }

  function getLivingEnemies(state) {
    return state.activeEnemies.filter((enemy) => enemy.hp > 0);
  }

  function getLivingEnemy(state, uidValue) {
    return state.activeEnemies.find((enemy) => enemy.uid === uidValue && enemy.hp > 0);
  }

  function getActiveParty(state) {
    return state.party.filter((member) => member.active);
  }

  function getAliveActiveParty(state) {
    return getActiveParty(state).filter((member) => member.hp > 0);
  }

  function isAlive(member) {
    return member.hp > 0;
  }

  function isCharacterAliveActive(state, id) {
    const member = state.party.find((item) => item.id === id);
    return Boolean(member && member.active && member.hp > 0);
  }

  function calculateEnergy(state) {
    return getAliveActiveParty(state).reduce((sum, member) => {
      const crisisEnergy = member.passiveId === "low-health-energy" && member.hp <= member.maxHp / 2 ? 1 : 0;
      return sum + member.energyContribution + crisisEnergy;
    }, 0);
  }

  function hasPassive(state, passiveId) {
    return getAliveActiveParty(state).some((member) => member.passiveId === passiveId);
  }

  function getActiveBonds(state) {
    return (data.bonds || []).filter((bond) => isBondActive(state, bond));
  }

  function isBondActive(state, bond) {
    const active = getAliveActiveParty(state);
    const activeIds = new Set(active.map((member) => member.id));
    const membersOk = (bond.members || []).every((id) => activeIds.has(id));
    const anyMembersOk = !bond.anyMembers || bond.anyMembers.some((id) => activeIds.has(id));
    const factionOk = !bond.faction || active.filter((member) => member.factionId === bond.faction).length >= Number(bond.count || 1);
    return membersOk && anyMembersOk && factionOk;
  }

  function bondEffectTotal(state, effect) {
    return getActiveBonds(state).reduce((sum, bond) => sum + Number(bond.effects?.[effect] || 0), 0);
  }

  function bondEffectMax(state, effect, fallback = 0) {
    return getActiveBonds(state).reduce((max, bond) => Math.max(max, Number(bond.effects?.[effect] || fallback)), fallback);
  }

  function bondOwnerAttackBonus(state, ownerId) {
    return getActiveBonds(state).reduce((sum, bond) => sum + Number(bond.effects?.ownerAttackBonus?.[ownerId] || 0), 0);
  }

  function equipmentEffectTotal(state, effect) {
    return getAliveActiveParty(state).reduce((sum, member) => {
      const instance = state.equipmentInventory.find((item) => item.instanceId === state.equipped[member.id]);
      const definition = instance ? equipmentById[instance.equipmentId] : null;
      if (definition?.effect !== effect) return sum;
      let amount = Number(instance.upgraded ? definition.upgradedAmount : definition.amount);
      if (definition.weaponClass === "firearm") amount = Math.ceil(amount * bondEffectMax(state, "firearmMultiplier", 1));
      return sum + amount;
    }, 0);
  }

  function temporaryPowerAmount(state, effect) {
    return (state.run?.temporaryPowers || []).filter((power) => power.effect === effect).reduce((sum, power) => sum + power.amount, 0);
  }

  function healActive(state, percent, stressRelief) {
    state.party = state.party.map((member) => member.active ? {
      ...member,
      hp: Math.min(member.maxHp, member.hp + Math.ceil(member.maxHp * percent)),
      stress: Math.max(0, member.stress - stressRelief)
    } : member);
  }

  function affectAliveActive(state, transform) {
    state.party = state.party.map((member) => member.active && member.hp > 0 ? transform(member) : member);
  }

  function updateMember(state, id, transform) {
    state.party = state.party.map((member) => member.id === id ? transform(member) : member);
  }

  function pickTarget(alive, mode) {
    if (!alive.length) return null;
    if (mode === "random") return alive[Math.floor(Math.random() * alive.length)];
    return alive[0];
  }

  function freshTurnStats() {
    return {
      cardsPlayed: 0,
      firstAttackUsed: false,
      firstRangedUsed: false,
      firstHeavyAttackUsed: false,
      firstSplashUsed: false,
      firstSupportUsed: false,
      firstTacticUsed: false,
      firstBondTacticUsed: false,
      firstPassivePierceUsed: false,
      firstPassiveBurnUsed: false,
      firstBondPierceUsed: false,
      firstGuardWeakUsed: false,
      equipmentFirstAttackUsed: false,
      equipmentFirstPierceUsed: false,
      equipmentFirstBurnUsed: false
    };
  }

  function ensureFormation(state) {
    let active = getActiveParty(state);
    if (active.length > 6) active.slice(6).forEach((member) => { member.active = false; });
    const minimum = state.campaign?.tutorialComplete ? 3 : 2;
    active = getActiveParty(state);
    state.party.filter((member) => !member.active).slice(0, Math.max(0, minimum - active.length)).forEach((member) => { member.active = true; });
  }

  function reconcileCampaignUnlocks(campaign) {
    campaign.unlockedScenarios = Array.isArray(campaign.unlockedScenarios) ? campaign.unlockedScenarios : ["tutorial"];
    campaign.completedScenarios = Array.isArray(campaign.completedScenarios) ? campaign.completedScenarios : [];
    const unlock = (id) => {
      if (!campaign.unlockedScenarios.includes(id)) campaign.unlockedScenarios.push(id);
    };
    if (campaign.completedScenarios.includes("alien")) unlock("juon");
    if (campaign.completedScenarios.includes("juon")) unlock("mummy-curse");
    if (campaign.completedScenarios.includes("mummy-curse")) unlock("jurassic-island");
    if (campaign.completedScenarios.includes("jurassic-island")) unlock("abyssal-ark");
    if (campaign.completedScenarios.includes("abyssal-ark")) unlock("evernight-castle");
    if (campaign.completedScenarios.includes("evernight-castle")) unlock("demon-frontier");
    if (campaign.completedScenarios.includes("demon-frontier")) unlock("main-god-trial");
    if (campaign.completedScenarios.includes("main-god-trial")) unlock("starship-troopers");
    if (campaign.completedScenarios.includes("starship-troopers")) unlock("avp-pyramid");
    if (campaign.completedScenarios.includes("avp-pyramid")) unlock("nightmare-elm");
    if (campaign.completedScenarios.includes("nightmare-elm")) unlock("lotr-war");
    if (campaign.completedScenarios.includes("lotr-war")) unlock("rumbling-finale");
    if (campaign.completedScenarios.includes("rumbling-finale")) unlock("infinity-castle");
    if (campaign.completedScenarios.includes("infinity-castle")) unlock("naruto-final-valley");
    if (campaign.completedScenarios.includes("naruto-final-valley")) unlock("bleach-false-karakura");
    if (campaign.completedScenarios.includes("bleach-false-karakura")) unlock("gintama-yoshiwara");
    if (campaign.completedScenarios.includes("gintama-yoshiwara")) unlock("gintama-final-war");
    if (campaign.completedScenarios.includes("gintama-final-war")) unlock("avengers-new-york");
    if (campaign.completedScenarios.includes("avengers-new-york")) unlock("batman-v-superman");
    if (campaign.completedScenarios.includes("batman-v-superman")) unlock("devil-may-cry-5");
    if (campaign.completedScenarios.includes("devil-may-cry-5")) unlock("final-destination");
    if (campaign.completedScenarios.includes("final-destination")) unlock("jinyong-heroic-peak");
    if (campaign.completedScenarios.includes("batman-v-superman")) campaign.infiniteUnlocked = true;
  }

  function clearCombatPiles(state) {
    state.hand = [];
    state.drawPile = [];
    state.discardPile = [];
    state.exhaustedPile = [];
    state.turn = 0;
  }

  function nextRandom(state) {
    state.randomSeed = ((state.randomSeed || 1) * 1664525 + 1013904223) >>> 0;
    return state.randomSeed / 4294967296;
  }

  function randomChoice(state, items) {
    if (!items.length) return null;
    return items[Math.floor(nextRandom(state) * items.length)];
  }

  function takeRandom(state, items, count) {
    const copy = [...items];
    const output = [];
    while (copy.length && output.length < count) {
      output.push(copy.splice(Math.floor(nextRandom(state) * copy.length), 1)[0]);
    }
    return output;
  }

  function shuffleWithState(state, items) {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index -= 1) {
      const target = Math.floor(nextRandom(state) * (index + 1));
      [result[index], result[target]] = [result[target], result[index]];
    }
    return result;
  }

  function appendLog(log, message) {
    return [...(log || []), message].slice(-maxLog);
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  global.MainGodCore = {
    createInitialState,
    normalizeState,
    beginTutorial,
    beginScenario,
    chooseRecruit,
    continueScenarioIntro,
    chooseMapNode,
    chooseStoryOption,
    playCard,
    endPlayerTurn,
    selectTarget,
    claimCombatReward,
    claimBossReward,
    claimTreasure,
    resolveEvent,
    campAction,
    returnAfterDefeat,
    toggleActive,
    setHubTab,
    equipItem,
    buyShopItem,
    buyPermanentUpgrade,
    upgradeCharacter,
    upgradeSignature,
    upgradeBloodline,
    removeCurse,
    removeDeckCard,
    calculateEnergy,
    getCardCost,
    getActiveParty,
    getAliveActiveParty,
    getLivingEnemies,
    getEnemyIntent,
    getActiveBonds,
    isNodeAvailable,
    isAlive,
    effectiveCard,
    cardsById,
    charactersById,
    equipmentById,
    enemiesById,
    encountersById,
    scenariosById,
    shopById,
    bloodlinesByCharacterId,
    bondsById
  };
})(globalThis);
