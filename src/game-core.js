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
  const playerProfessionsById = indexById(data.playerProfessions || []);
  const playerPersonalitiesById = indexById(data.playerPersonalities || []);
  const customStats = data.customStats || [];
  const customStatIds = customStats.map((stat) => stat.id);
  const customTagsById = indexById(data.customTags || []);
  const customMutationsById = indexById(data.customMutations || []);
  const economy = data.economy || {};
  const maxLog = 12;
  const dmc5FeaturedRecruitIds = ["nero-dmc5", "v-dmc5", "dante-dmc5"];
  const repeatableCardIds = new Set(["combat-knife", "guard-stance", "adrenaline-rush"]);
  const eventApproachChoices = [
    { id: "protagonist-line", title: "追蹤真正主角", text: "放棄最安全路線，追著劇本核心人物留下的痕跡前進。" },
    { id: "artifact-line", title: "奪取劇本核心", text: "把注意力放在本劇本最危險的道具、血統、武器或封印上。" },
    { id: "main-god-line", title: "逆讀主神提示", text: "不照任務文字走，嘗試從扣分規則與白光漏洞裡找捷徑。" }
  ];
  const eventSecondChoicesByApproach = {
    "protagonist-line": [
      { id: "protagonist-rescue", title: "先救人", text: "把隊伍資源用在救出關鍵人物，代價是戰線會被拉長。" },
      { id: "protagonist-test", title: "試探立場", text: "不急著結盟，先用一次危險接觸確認對方是否可信。" },
      { id: "protagonist-trade", title: "提出交易", text: "用主神情報換取對方出手，成功會很賺，失敗會被反利用。" }
    ],
    "artifact-line": [
      { id: "artifact-infiltrate", title: "潛入取物", text: "避開主戰場摸向核心資源，但撤退路線會變得很窄。" },
      { id: "artifact-assault", title: "正面強奪", text: "用火力和爆發硬搶，成功最快，代價也最重。" },
      { id: "artifact-seal", title: "先封印再取", text: "花時間壓住反噬，獎勵較穩，但容易錯過最佳窗口。" }
    ],
    "main-god-line": [
      { id: "main-god-decode", title: "解碼倒數", text: "把任務限制當成密碼讀，找出主神沒有明說的隱藏判定。" },
      { id: "main-god-sacrifice", title: "承擔代價", text: "主動吃下一部分懲罰，換取劇本規則短暫鬆動。" },
      { id: "main-god-feint", title: "偽裝失敗", text: "讓主神和劇本敵人以為隊伍走錯，反向引出隱藏路線。" }
    ]
  };
  const eventFinalChoicesBySecond = {
    "protagonist-rescue": [
      { id: "rescue-break", title: "破門救援", text: "直接衝進最危險的房間，把人從死亡節點裡拖出來。" },
      { id: "rescue-decoy", title: "分隊牽制", text: "讓一組人引開劇本殺機，另一組人接走關鍵人物。" },
      { id: "rescue-wait", title: "等待他出手", text: "相信真正主角會自己突破，只在最後一秒補上缺口。" }
    ],
    "protagonist-test": [
      { id: "test-duel", title: "一招試膽", text: "用一次短促交手確認對方的底線與戰意。" },
      { id: "test-truth", title: "交出真相", text: "坦白輪迴者身份，賭對方能承受世界觀崩塌。" },
      { id: "test-shadow", title: "跟蹤影子", text: "不正面接觸，只追蹤對方最想隱藏的行動。" }
    ],
    "protagonist-trade": [
      { id: "trade-intel", title: "交換情報", text: "給出 Boss 弱點，要求對方加入一次關鍵行動。" },
      { id: "trade-relic", title: "交出資源", text: "用主神道具或補給換取信任，隊伍會先吃虧。" },
      { id: "trade-oath", title: "立下共戰誓約", text: "把利益換成承諾，讓雙方在本劇本內強行綁定。" }
    ],
    "artifact-infiltrate": [
      { id: "infiltrate-steal", title: "無聲盜取", text: "只拿核心，不驚動守衛，失敗時會被包圍。" },
      { id: "infiltrate-copy", title: "複製樣本", text: "不拿走原物，只複製可被主神承認的樣本。" },
      { id: "infiltrate-leave-mark", title: "留下定位", text: "先不取物，留下標記讓之後的戰鬥導向該位置。" }
    ],
    "artifact-assault": [
      { id: "assault-burst", title: "爆發突破", text: "用最大輸出撕開守衛線，所有風險集中在一瞬間。" },
      { id: "assault-shield", title: "硬扛反噬", text: "讓前排吃下核心反擊，換後排完成奪取。" },
      { id: "assault-overload", title: "引爆核心", text: "不完整奪取，直接把核心能量炸進隊伍武裝。" }
    ],
    "artifact-seal": [
      { id: "seal-ritual", title: "完成封印", text: "穩定核心，讓它以裝備或技能形式被主神收錄。" },
      { id: "seal-crack", title: "保留裂縫", text: "故意不封死，留下能在本劇本反覆利用的漏洞。" },
      { id: "seal-reverse", title: "反轉咒式", text: "把詛咒導回劇本本身，但反噬可能先打在隊伍身上。" }
    ],
    "main-god-decode": [
      { id: "decode-timer", title: "改寫倒數", text: "把任務倒數往後撥一格，換取更多探索空間。" },
      { id: "decode-reward", title: "偷取獎勵判定", text: "在完成前提前截取一段主神獎勵。" },
      { id: "decode-hidden", title: "打開隱藏判定", text: "專門尋找只有重玩時才會出現的隱藏取得條件。" }
    ],
    "main-god-sacrifice": [
      { id: "sacrifice-blood", title: "用生命抵扣", text: "全隊承受真實傷害，換取劇本規則短暫讓步。" },
      { id: "sacrifice-mind", title: "用精神抵扣", text: "讓精神壓力爆升，換一次突破不可能條件的機會。" },
      { id: "sacrifice-curse", title: "接受負面咒詛", text: "主動收下一個詛咒，把它變成通往高獎勵的門票。" }
    ],
    "main-god-feint": [
      { id: "feint-retreat", title: "假裝撤退", text: "讓劇本敵人追錯方向，再從死角切回主線。" },
      { id: "feint-failure", title: "偽造失敗", text: "故意觸發低級懲罰，掩蓋真正目的。" },
      { id: "feint-loop", title: "重演舊路線", text: "按上次通關的路線走，等待本次輪迴出現偏差。" }
    ]
  };
  const eventOutcomeByFinalChoice = {
    "rescue-break": { title: "真正主角現身", text: "你們把死亡節點打穿，劇本核心人物承認這次輪迴值得押上性命。", effects: [{ type: "recruit-hidden" }, { type: "stress", amount: 18 }] },
    "rescue-decoy": { title: "牽制成功", text: "誘餌路線幾乎崩潰，但真正主角從另一側殺出，留下了可被主神承認的戰術。", effects: [{ type: "rare-card" }, { type: "damage-fraction", amount: 0.25 }] },
    "rescue-wait": { title: "錯過三秒", text: "主角確實出手了，但隊伍等得太久，所有人都被拖入劇本殺機。", effects: [{ type: "stress", amount: 45 }, { type: "reward-points", amount: 500 }] },
    "test-duel": { title: "短兵相認", text: "一招之後雙方都知道彼此不是雜兵，主角沒有加入，但留下了專屬戰鬥節奏。", effects: [{ type: "run-power", id: "event-duel-tempo", effect: "attackBonus", amount: 3 }, { type: "stress", amount: 12 }] },
    "test-truth": { title: "世界觀崩裂", text: "真相讓對方停手，也讓隊伍承受劇本本身的排斥。", effects: [{ type: "side-story", amount: 1 }, { type: "curse" }] },
    "test-shadow": { title: "影子反咬", text: "跟蹤路線把你們帶到真正弱點前，也暴露了隊伍的位置。", effects: [{ type: "legendary-equipment" }, { type: "stress", amount: 30 }] },
    "trade-intel": { title: "情報成交", text: "Boss 弱點被交換出去，主角沒有立即入隊，但整個劇本的輸出窗口被打開。", effects: [{ type: "scenario-power" }] },
    "trade-relic": { title: "被反向標價", text: "對方接受資源，卻要求你們先付出更多代價證明誠意。", effects: [{ type: "reward-points", amount: -700 }, { type: "recruit-candidate" }] },
    "trade-oath": { title: "共戰誓約", text: "誓約成立後，劇本人物與隊伍短暫同步，直到本劇本完結前都能互相補位。", effects: [{ type: "run-power", id: "event-oath-guard", effect: "turnBlock", amount: 4 }, { type: "heal", amount: 0.15, stressRelief: 8 }] },
    "infiltrate-steal": { title: "核心到手", text: "你們無聲取走核心，但撤退時每一步都踩在警報邊緣。", effects: [{ type: "legendary-equipment" }, { type: "damage-fraction", amount: 0.2 }] },
    "infiltrate-copy": { title: "樣本被收錄", text: "主神承認複製樣本有效，將它轉成可加入牌組的劇本技能。", effects: [{ type: "rare-card" }, { type: "reward-points", amount: 400 }] },
    "infiltrate-leave-mark": { title: "伏線標記", text: "標記暫時沒有獎勵，卻讓之後所有戰鬥都多一層準備。", effects: [{ type: "run-power", id: "event-marked-route", effect: "openingBlock", amount: 8 }] },
    "assault-burst": { title: "爆發過熱", text: "核心被硬搶下來，代價是所有人像被劇本本身反擊。", effects: [{ type: "rare-card" }, { type: "damage-fraction", amount: 0.5 }] },
    "assault-shield": { title: "前排扛住了", text: "盾線幾乎粉碎，但核心反擊被導入防護矩陣。", effects: [{ type: "run-power", id: "event-shield-matrix", effect: "turnBlock", amount: 6 }, { type: "stress", amount: 22 }] },
    "assault-overload": { title: "核心超載", text: "你們沒有帶走原物，而是把它炸成一場只能維持到劇本完結的暴力增幅。", effects: [{ type: "run-power", id: "event-core-overload", effect: "attackBonus", amount: 6 }, { type: "curse" }] },
    "seal-ritual": { title: "封印完成", text: "核心被穩定封裝，成為這次遠征最乾淨的一次大獎。", effects: [{ type: "legendary-equipment" }, { type: "side-story", amount: 1 }] },
    "seal-crack": { title: "裂縫可控", text: "裂縫沒有閉合，卻被你們固定成一條持續增益線。", effects: [{ type: "scenario-power" }, { type: "run-power", id: "event-crack-guard", effect: "openingBlock", amount: 6 }] },
    "seal-reverse": { title: "反咒成功一半", text: "咒式倒灌進劇本敵人身上，也在隊伍牌組裡留下污點。", effects: [{ type: "reward-points", amount: 1000 }, { type: "curse" }] },
    "decode-timer": { title: "倒數延後", text: "主神倒數被往後撥動，本劇本的每場戰鬥都多出一口氣。", effects: [{ type: "run-power", id: "event-timer-buffer", effect: "turnBlock", amount: 3 }, { type: "heal", amount: 0.12, stressRelief: 6 }] },
    "decode-reward": { title: "提前截獎", text: "獎勵判定被提前截取，主神立刻用壓力懲罰校正異常。", effects: [{ type: "reward-points", amount: 1500 }, { type: "stress", amount: 28 }] },
    "decode-hidden": { title: "隱藏判定開啟", text: "這就是重玩舊劇本才會看到的縫隙，真正主角的取得條件短暫浮現。", effects: [{ type: "recruit-hidden" }, { type: "side-story", amount: 1 }] },
    "sacrifice-blood": { title: "半血通行", text: "全隊生命被扣到危險線，但主神承認這是等價交換。", effects: [{ type: "damage-fraction", amount: 0.5 }, { type: "scenario-power" }, { type: "reward-points", amount: 800 }] },
    "sacrifice-mind": { title: "壓力爆表", text: "精神抵扣打開了不可能路線，也幾乎把全隊推到崩潰邊緣。", effects: [{ type: "stress", amount: 60 }, { type: "legendary-equipment" }] },
    "sacrifice-curse": { title: "咒詛成門", text: "詛咒進入牌組的一刻，另一扇本來不存在的獎勵門也開了。", effects: [{ type: "curse" }, { type: "rare-card" }, { type: "reward-points", amount: 700 }] },
    "feint-retreat": { title: "退路是假", text: "敵人追向假的撤離線，你們從死角奪回主動。", effects: [{ type: "heal", amount: 0.2, stressRelief: 18 }, { type: "run-power", id: "event-ambush-line", effect: "attackBonus", amount: 2 }] },
    "feint-failure": { title: "低級懲罰遮蔽", text: "一次小失敗騙過主神監測，但懲罰仍然落在隊伍身上。", effects: [{ type: "reward-points", amount: 1200 }, { type: "damage-fraction", amount: 0.3 }, { type: "stress", amount: 18 }] },
    "feint-loop": { title: "舊路線偏差", text: "重演舊通關路線時，劇本在相同位置裂開了全新的結尾。", effects: [{ type: "recruit-hidden" }, { type: "curse" }, { type: "run-power", id: "event-loop-instinct", effect: "attackBonus", amount: 4 }] }
  };

  function indexById(items) {
    return Object.fromEntries(items.map((item) => [item.id, item]));
  }

  function clone(value) {
    return typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value));
  }

  function createPlayerGrowth(profile) {
    const stats = baseStatsForProfile(profile);
    return {
      stats,
      purchasedTags: [],
      tagOffers: [],
      mutations: [],
      rerolls: 0,
      art: null
    };
  }

  function baseStatsForProfile(profile) {
    const professionId = profile?.professionId || data.playerProfessions?.[0]?.id;
    const base = data.playerProfessionStats?.[professionId] || {};
    return Object.fromEntries(customStatIds.map((id) => [id, Number(base[id] || 50)]));
  }

  function normalizePlayerGrowth(growth, profile) {
    const base = createPlayerGrowth(profile);
    const next = { ...base, ...(growth && typeof growth === "object" ? clone(growth) : {}) };
    const baseStats = baseStatsForProfile(profile);
    next.stats = { ...baseStats, ...(next.stats || {}) };
    customStatIds.forEach((id) => {
      next.stats[id] = Math.max(0, Math.floor(Number(next.stats[id] ?? baseStats[id] ?? 50)));
    });
    next.purchasedTags = Array.isArray(next.purchasedTags) ? next.purchasedTags.filter((id) => customTagsById[id]) : [];
    next.purchasedTags = [...new Set(next.purchasedTags)];
    next.tagOffers = Array.isArray(next.tagOffers) ? next.tagOffers.filter((id) => customTagsById[id] && !next.purchasedTags.includes(id)) : [];
    next.mutations = Array.isArray(next.mutations) ? next.mutations.filter((id) => customMutationsById[id]) : [];
    next.rerolls = Math.max(0, Math.floor(Number(next.rerolls || 0)));
    next.art = typeof next.art === "string" ? next.art : null;
    return next;
  }

  function createInitialState() {
    return {
      version: 5,
      nextId: 1,
      randomSeed: 173205,
      screen: "onboarding",
      hubTab: "deployment",
      pending: null,
      onboarding: { stage: "invite", completed: false, draft: {} },
      playerProfile: null,
      playerGrowth: createPlayerGrowth(null),
      teamName: "中洲隊",
      party: [],
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
      log: ["螢幕上彈出一個不屬於這台電腦的視窗。"]
    };
  }

  function normalizeState(saved) {
    if (!saved || typeof saved !== "object") return createInitialState();
    if (saved.version === 5) return normalizeModernState(saved);
    if (saved.version === 4) return normalizeModernState({ ...clone(saved), version: 5 });
    if (saved.version === 3) {
      return normalizeModernState({
        ...clone(saved),
        version: 5,
        teamName: sanitizeTeamName(saved.teamName || "中洲隊", "中洲隊"),
        playerProfile: saved.playerProfile || null,
        onboarding: saved.onboarding || { stage: "complete", completed: true, draft: {} }
      });
    }
    return normalizeModernState(migrateLegacyState(saved));
  }

  function normalizeModernState(saved) {
    const base = createInitialState();
    const next = { ...base, ...clone(saved) };
    next.version = 5;
    next.teamName = sanitizeTeamName(next.teamName || "中洲隊", "中洲隊");
    next.playerProfile = normalizePlayerProfile(next.playerProfile);
    next.playerGrowth = normalizePlayerGrowth(next.playerGrowth, next.playerProfile);
    next.onboarding = normalizeOnboarding(next.onboarding, next.playerProfile);
    next.campaign = { ...base.campaign, ...(saved.campaign || {}) };
    reconcileCampaignUnlocks(next.campaign);
    next.permanentUpgrades = { ...base.permanentUpgrades, ...(saved.permanentUpgrades || {}) };
    next.permanentUpgrades.team = Array.isArray(next.permanentUpgrades.team) ? next.permanentUpgrades.team : [];
    next.permanentUpgrades.characters = next.permanentUpgrades.characters || {};
    next.permanentUpgrades.signatures = Array.isArray(next.permanentUpgrades.signatures) ? next.permanentUpgrades.signatures : [];
    next.permanentUpgrades.bloodlines = Array.isArray(next.permanentUpgrades.bloodlines) ? next.permanentUpgrades.bloodlines : [];
    next.party = (Array.isArray(saved.party) ? saved.party : base.party)
      .filter((member) => charactersById[member.id] && !(member.id === "zhang-jie" && next.campaign.tutorialComplete))
      .map((member) => normalizePartyMember(member, next.playerProfile, next.playerGrowth));
    next.deck = (Array.isArray(saved.deck) ? saved.deck : base.deck)
      .map((entry) => typeof entry === "string" ? makeDeckEntry(next, entry, null) : entry)
      .filter((entry) => entry && cardsById[entry.cardId]);
    normalizeUniqueDeck(next);
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
    syncCustomMutations(next);
    refreshCustomTagOffers(next, { free: true, onlyIfEmpty: true });
    applyPlayerGrowthToParty(next);
    ensureFormation(next);
    return next;
  }

  function normalizeOnboarding(onboarding, playerProfile) {
    if (playerProfile) return { stage: "complete", completed: true, draft: {} };
    const validStages = new Set(["invite", "name", "gender", "profession", "personality", "confirm", "ordinary-ending", "complete"]);
    const stage = validStages.has(onboarding?.stage) ? onboarding.stage : "invite";
    return {
      stage,
      completed: Boolean(onboarding?.completed && stage === "complete"),
      draft: normalizePlayerDraft(onboarding?.draft || {})
    };
  }

  function normalizePlayerDraft(draft) {
    const next = { ...clone(draft || {}) };
    if (next.name) next.name = sanitizePlayerName(next.name, "");
    if (!["male", "female"].includes(next.gender)) delete next.gender;
    if (!playerProfessionsById[next.professionId]) delete next.professionId;
    if (!playerPersonalitiesById[next.personalityId]) delete next.personalityId;
    return next;
  }

  function normalizePlayerProfile(profile) {
    if (!profile || typeof profile !== "object") return null;
    const profession = playerProfessionsById[profile.professionId];
    const personality = playerPersonalitiesById[profile.personalityId];
    const gender = ["male", "female"].includes(profile.gender) ? profile.gender : null;
    if (!profession || !personality || !gender) return null;
    return {
      name: sanitizePlayerName(profile.name, "無名者"),
      gender,
      professionId: profession.id,
      personalityId: personality.id,
      cardIds: [...profession.cardIds, personality.cardId]
    };
  }

  function sanitizePlayerName(value, fallback = "無名者") {
    const cleaned = String(value || "").replace(/\s+/g, " ").trim().slice(0, 12);
    return cleaned || fallback;
  }

  function sanitizeTeamName(value, fallback = "中洲隊") {
    const cleaned = String(value || "").replace(/\s+/g, " ").trim().slice(0, 16);
    return cleaned || fallback;
  }

  function migrateLegacyState(saved) {
    const next = createInitialState();
    next.version = 5;
    next.teamName = "中洲隊";
    next.playerProfile = null;
    next.onboarding = { stage: "complete", completed: true, draft: {} };
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
    normalizeUniqueDeck(next);
    ensureFormation(next);
    next.log = ["舊存檔已轉換：生化危機視為完成，原有資源與牌組均已保留。"];
    return next;
  }

  function normalizeUniqueDeck(state) {
    const kept = [];
    const uniqueByCardId = new Map();
    state.deck.forEach((entry) => {
      const card = cardsById[entry.cardId];
      if (!card || card.category !== "general" || isRepeatableCard(entry.cardId)) {
        kept.push(entry);
        return;
      }
      const existing = uniqueByCardId.get(entry.cardId);
      if (!existing) {
        uniqueByCardId.set(entry.cardId, entry);
        kept.push(entry);
        return;
      }
      existing.upgraded = Boolean(existing.upgraded || entry.upgraded || card.upgrade);
    });
    state.deck = kept;
    state.curses = state.deck.filter((entry) => cardsById[entry.cardId]?.category === "curse").map((entry) => entry.instanceId);
    if (state.run?.acquiredDeckIds) {
      const keptIds = new Set(state.deck.map((entry) => entry.instanceId));
      state.run.acquiredDeckIds = state.run.acquiredDeckIds.filter((id) => keptIds.has(id));
    }
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

  function normalizePartyMember(member, playerProfile, playerGrowth) {
    const normalized = normalizeCharacter(member);
    if (member.id !== "player-avatar" || !playerProfile) return normalized;
    const player = makePlayerCharacter(playerProfile, normalized.active, playerGrowth);
    return {
      ...normalized,
      name: player.name,
      role: player.role,
      maxHp: player.maxHp,
      hp: clamp(Number(member.hp ?? player.maxHp), 0, player.maxHp),
      stress: clamp(Number(member.stress ?? player.stress), 0, 100),
      energyContribution: player.energyContribution,
      passiveText: player.passiveText,
      signatureCardId: player.signatureCardId,
      playerProfile: clone(playerProfile)
    };
  }

  function makeCharacter(id, active) {
    const base = charactersById[id];
    return { ...clone(base), hp: base.maxHp, block: 0, evade: 0, active: Boolean(active) };
  }

  function makePlayerCharacter(profile, active, playerGrowth = null) {
    const profession = playerProfessionsById[profile.professionId] || data.playerProfessions[0];
    const personality = playerPersonalitiesById[profile.personalityId] || data.playerPersonalities[0];
    const base = makeCharacter("player-avatar", active);
    const staminaBonus = customStatTier({ playerGrowth: playerGrowth || createPlayerGrowth(profile) }, "stamina") * 10 + customEffectTotal({ playerGrowth: playerGrowth || createPlayerGrowth(profile) }, "maxHp");
    const maxHp = profession.maxHp + staminaBonus;
    return {
      ...base,
      name: profile.name,
      role: profession.role,
      maxHp,
      hp: maxHp,
      stress: profession.stress,
      energyContribution: profession.energyContribution,
      passiveText: `${profession.name} · ${personality.name}：${profession.passiveText}`,
      signatureCardId: personality.cardId,
      playerProfile: clone(profile)
    };
  }

  function answerMainGodInvite(state, answer) {
    const next = clone(state);
    if (next.screen !== "onboarding" || next.onboarding?.stage !== "invite") return next;
    next.onboarding.stage = answer === "yes" ? "name" : "ordinary-ending";
    next.onboarding.draft = next.onboarding.draft || {};
    next.log = appendLog(next.log, answer === "yes" ? "你按下了 Yes。" : "你按下了 No，螢幕恢復寂靜。");
    return next;
  }

  function restartOnboarding(state) {
    const next = clone(state);
    if (next.screen !== "onboarding") return next;
    next.onboarding = { stage: "invite", completed: false, draft: {} };
    next.log = appendLog(next.log, "那個視窗又一次彈了出來。");
    return next;
  }

  function setPlayerName(state, name) {
    const next = clone(state);
    if (next.screen !== "onboarding" || next.onboarding?.stage !== "name") return next;
    next.onboarding.draft = { ...(next.onboarding.draft || {}), name: sanitizePlayerName(name, "無名者") };
    next.onboarding.stage = "gender";
    return next;
  }

  function setPlayerGender(state, gender) {
    const next = clone(state);
    if (next.screen !== "onboarding" || next.onboarding?.stage !== "gender" || !["male", "female"].includes(gender)) return next;
    next.onboarding.draft = { ...(next.onboarding.draft || {}), gender };
    next.onboarding.stage = "profession";
    return next;
  }

  function setPlayerProfession(state, professionId) {
    const next = clone(state);
    if (next.screen !== "onboarding" || next.onboarding?.stage !== "profession" || !playerProfessionsById[professionId]) return next;
    next.onboarding.draft = { ...(next.onboarding.draft || {}), professionId };
    next.onboarding.stage = "personality";
    return next;
  }

  function setPlayerPersonality(state, personalityId) {
    const next = clone(state);
    if (next.screen !== "onboarding" || next.onboarding?.stage !== "personality" || !playerPersonalitiesById[personalityId]) return next;
    next.onboarding.draft = { ...(next.onboarding.draft || {}), personalityId };
    next.onboarding.stage = "confirm";
    return next;
  }

  function goToOnboardingStage(state, stage) {
    const next = clone(state);
    const allowed = ["name", "gender", "profession", "personality", "confirm"];
    if (next.screen !== "onboarding" || !allowed.includes(stage)) return next;
    next.onboarding.stage = stage;
    return next;
  }

  function confirmPlayerCreation(state) {
    const next = clone(state);
    if (next.screen !== "onboarding" || next.onboarding?.stage !== "confirm") return next;
    const draft = normalizePlayerDraft(next.onboarding.draft);
    const profile = normalizePlayerProfile({
      name: draft.name,
      gender: draft.gender,
      professionId: draft.professionId,
      personalityId: draft.personalityId
    });
    if (!profile) return next;
    const profession = playerProfessionsById[profile.professionId];
    next.playerProfile = profile;
    next.playerGrowth = createPlayerGrowth(profile);
    refreshCustomTagOffers(next, { free: true, force: true });
    syncCustomMutations(next);
    next.onboarding = { stage: "complete", completed: true, draft: {} };
    next.screen = "story";
    next.pending = { kind: "tutorial-intro" };
    next.party = [makePlayerCharacter(profile, true, next.playerGrowth), makeCharacter("zhang-jie", true)];
    next.deck = profession.cardIds.map((cardId) => makeDeckEntry(next, cardId, null, false, "player-avatar"));
    next.equipped = {};
    next.hand = [];
    next.drawPile = [];
    next.discardPile = [];
    next.exhaustedPile = [];
    next.rewardChoices = [];
    next.log = [`${profile.name}在白光中醒來。張杰站在車廂另一端，像早就知道你會出現。`];
    return next;
  }

  function renameTeam(state, name) {
    const next = clone(state);
    if (next.screen !== "hub") return next;
    const cleaned = sanitizeTeamName(name, "");
    if (!cleaned) {
      next.log = appendLog(next.log, "隊名沒有改變。");
      return next;
    }
    next.teamName = cleaned;
    next.log = appendLog(next.log, `隊伍名稱已改為「${cleaned}」。`);
    return next;
  }

  function makeDeckEntry(state, cardId, acquiredRunId, upgraded, ownerId) {
    return { instanceId: uid(state, "deck"), cardId, upgraded: Boolean(upgraded), acquiredRunId: acquiredRunId || null, ownerId: ownerId || null };
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
      pool = data.characters.filter((item) => !item.tutorialOnly && !item.playerOnly && !owned.has(item.id) && !legendaryIds.has(item.id)).map((item) => item.id);
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
    state.log = appendLog(state.log, `${charactersById[characterId].name}加入${teamLabel(state)}。`);
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
    const hellBossPool = Array.isArray(scenario.hellBossPool) && scenario.hellBossPool.length ? scenario.hellBossPool : null;
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
        if (hellBossPool && ["battle", "elite", "miniboss", "boss"].includes(type)) encounterId = randomChoice(state, hellBossPool);
        else if (type === "battle") encounterId = randomChoice(state, scenario.normal);
        else if (type === "elite") encounterId = randomChoice(state, scenario.elite);
        else if (type === "miniboss") encounterId = scenario.miniboss;
        else if (type === "boss") encounterId = scenario.boss;
        nodes.push({ id: `layer-${layer}-lane-${lane}`, layer, lane, type, encounterId, completed: false });
      }
      layers.push(nodes);
    }
    if (scenario.id !== "tutorial" && !layers.flat().some((node) => node.type === "event")) {
      const eventCandidates = layers.flat().filter((node) => [2, 3, 6, 7].includes(node.layer));
      const forcedEvent = randomChoice(state, eventCandidates);
      if (forcedEvent) {
        forcedEvent.type = "event";
        forcedEvent.encounterId = null;
      }
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
    const permanent = state.deck.map((entry) => makeCombatCard(state, entry.cardId, entry.ownerId || null, entry.upgraded, entry.instanceId));
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
    state.maxEnergy = calculateEnergy(state) + (state.turn === 1 ? equipmentEffectTotal(state, "openingEnergy") + customEffectTotal(state, "openingEnergy") : 0) + passiveOpeningEnergy + bondOpeningEnergy;
    state.energy = state.maxEnergy;
    let handSize = 5;
    if (state.turn === 1) {
      handSize += equipmentEffectTotal(state, "openingDraw");
      handSize += customStatTier(state, "technique") + customEffectTotal(state, "openingDraw");
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
    const usesCustomFreePlay = next.turn === 1 && getCardCostBeforeCustomFree(next, instance) > 0 && Number(next.turnStats.customFreePlaysUsed || 0) < customOpeningFreePlays(next);
    if (usesCustomFreePlay) next.turnStats.customFreePlaysUsed += 1;
    next.energy -= cost;
    next.hand.splice(handIndex, 1);

    let damage = Number(card.damage || 0);
    let damageAll = Number(card.damageAll || 0);
    const bloodline = card.category === "signature" && instance.ownerId ? getUnlockedBloodline(next, instance.ownerId) : null;
    let piercingAttack = Boolean(card.pierce || bloodline?.effect.pierce);
    let equipmentBurn = 0;
    let passiveBurn = 0;
    let customAttackBurn = 0;
    let customAttackPoison = 0;
    let customFirstAttackBurn = 0;
    let customFirstAttackPoison = 0;
    const executeApplies = Boolean(card.executeBelow && target && target.hp / target.maxHp <= card.executeBelow);
    if (card.type === "attack") {
      const applyAttackBonus = (bonus) => {
        if (card.damage) damage += bonus;
        if (card.damageAll) damageAll += bonus;
      };
      const sharedBonus = equipmentEffectTotal(next, "attackBonus") + temporaryPowerAmount(next, "attackBonus");
      applyAttackBonus(sharedBonus);
      applyAttackBonus(customStatTier(next, "strength") + customEffectTotal(next, "attackBonus"));
      if (instance.ownerId === "player-avatar") applyAttackBonus(customEffectTotal(next, "ownerAttackBonus"));
      applyAttackBonus(bondEffectTotal(next, "attackBonus"));
      if (card.damageAll) damageAll += bondEffectTotal(next, "damageAllBonus");
      if (card.damageAll) damageAll += customEffectTotal(next, "damageAllBonus");
      if (instance.ownerId) applyAttackBonus(bondOwnerAttackBonus(next, instance.ownerId));
      const player = next.party.find((member) => member.id === "player-avatar");
      if (player?.hp > 0 && player.hp <= player.maxHp / 2) applyAttackBonus(customEffectTotal(next, "lowHpAttackBonus"));
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
      if (card.damage && target && hasEnemyStatus(target)) damage += customEffectTotal(next, "statusExploitBonus");
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
      customAttackBurn = customEffectTotal(next, "attackBurn");
      customAttackPoison = customEffectTotal(next, "attackPoison");
      if (!next.turnStats.customFirstAttackUsed) {
        if (customEffectTotal(next, "firstAttackPierce") > 0) piercingAttack = true;
        customFirstAttackBurn = customEffectTotal(next, "firstAttackBurn");
        customFirstAttackPoison = customEffectTotal(next, "firstAttackPoison");
        next.turnStats.customFirstAttackUsed = true;
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
      const criticalMultiplier = Math.max(Number(bloodline?.effect.criticalMultiplier || 0), customEffectMax(next, "criticalMultiplier", 0));
      if (criticalMultiplier) {
        const finalCriticalMultiplier = criticalMultiplier + customLuckCritBonus(next);
        damage = Math.ceil(damage * finalCriticalMultiplier);
        damageAll = Math.ceil(damageAll * finalCriticalMultiplier);
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
    if (customAttackBurn || customFirstAttackBurn) {
      const burn = customAttackBurn + customFirstAttackBurn;
      if (card.damageAll) getLivingEnemies(next).forEach((enemy) => addEnemyStatus(next, enemy.uid, "burn", burn));
      else if (target) addEnemyStatus(next, target.uid, "burn", burn);
    }
    if (customAttackPoison || customFirstAttackPoison) {
      const poison = customAttackPoison + customFirstAttackPoison;
      if (card.damageAll) getLivingEnemies(next).forEach((enemy) => addEnemyStatus(next, enemy.uid, "poison", poison));
      else if (target) addEnemyStatus(next, target.uid, "poison", poison);
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
    applyCustomCardEffects(next, instance, card, target?.uid);
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
      next.log = appendLog(next.log, `${teamLabel(next)}全員失去戰鬥能力。`);
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
    state.rewardChoices = chooseCardRewards(state, encounter.tier === "elite" || encounter.tier === "miniboss" ? 4 : 3, encounter.tier || node.type);
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
    state.log = appendLog(state.log, "張杰完成引導後離開隊伍。異形劇本已開放，鄭吒也可能在後續集結中加入隊伍。");
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
        const leaderId = getLeaderId(next);
        if (leaderId) next.equipped[leaderId] = item.instanceId;
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
    const nextScenario = { alien: "juon", juon: "mummy-curse", "mummy-curse": "jurassic-island", "jurassic-island": "abyssal-ark", "abyssal-ark": "evernight-castle", "evernight-castle": "demon-frontier", "demon-frontier": "main-god-trial", "main-god-trial": "starship-troopers", "starship-troopers": "avp-pyramid", "avp-pyramid": "nightmare-elm", "nightmare-elm": "lotr-war", "lotr-war": "rumbling-finale", "rumbling-finale": "infinity-castle", "infinity-castle": "naruto-final-valley", "naruto-final-valley": "bleach-false-karakura", "bleach-false-karakura": "gintama-yoshiwara", "gintama-yoshiwara": "gintama-final-war", "gintama-final-war": "avengers-new-york", "avengers-new-york": "batman-v-superman", "batman-v-superman": "devil-may-cry-5", "devil-may-cry-5": "final-destination", "final-destination": "jinyong-heroic-peak", "jinyong-heroic-peak": "pacific-rim-breach", "pacific-rim-breach": "fury-road-war-rig", "fury-road-war-rig": "resident-evil-6-c-virus", "resident-evil-6-c-virus": "elden-ring-hell-run", "elden-ring-hell-run": "jujutsu-kaisen-shibuya" }[scenarioId];
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
    const scenarioId = state.run?.scenarioId || null;
    const scenario = scenariosById[scenarioId];
    const unlockedPool = new Set(
      data.scenarios
        .filter((item) => item.id !== "tutorial" && (state.campaign.unlockedScenarios.includes(item.id) || item.id === state.run?.scenarioId))
        .flatMap((item) => item.recruitmentPool)
    );
    const scenarioPool = new Set(
      data.scenarios
        .filter((item) => item.id === scenarioId)
        .flatMap((item) => item.recruitmentPool)
    );
    const unownedScenario = data.characters.filter((item) => scenarioPool.has(item.id) && !state.party.some((member) => member.id === item.id));
    const unownedUnlocked = data.characters.filter((item) => unlockedPool.has(item.id) && !state.party.some((member) => member.id === item.id));
    const hiddenId = scenario?.hiddenProtagonistId;
    const hiddenCandidate = hiddenId && !state.party.some((member) => member.id === hiddenId) ? hiddenId : null;
    const candidate = unownedScenario.length ? randomChoice(state, unownedScenario).id : unownedUnlocked.length ? randomChoice(state, unownedUnlocked).id : null;
    return {
      kind: "event",
      stage: 1,
      path: [],
      choices: eventChoicesFor(1, [], scenario),
      candidate,
      hiddenCandidate,
      hiddenProtagonistId: hiddenId || null,
      scenarioId
    };
  }

  function scenarioEventChoicesFor(scenario, stage, path) {
    if (!scenario?.eventChoices) return null;
    if (stage === 1) return (scenario.eventChoices.stage1 || []).map(clone);
    if (stage === 2) return (scenario.eventChoices.stage2?.[path[0]] || []).map(clone);
    if (stage === 3) return (scenario.eventChoices.stage3?.[path[1]] || []).map(clone);
    return null;
  }

  function eventChoicesFor(stage, path, scenario = null) {
    const scenarioChoices = scenarioEventChoicesFor(scenario, stage, path);
    if (scenarioChoices?.length) return scenarioChoices;
    if (stage === 1) return eventApproachChoices.map(clone);
    if (stage === 2) return (eventSecondChoicesByApproach[path[0]] || eventSecondChoicesByApproach["protagonist-line"]).map(clone);
    if (stage === 3) return (eventFinalChoicesBySecond[path[1]] || eventFinalChoicesBySecond["protagonist-rescue"]).map(clone);
    return [];
  }

  function resolveEvent(state, optionId) {
    const next = clone(state);
    if (next.screen !== "event" || !next.pending) return next;
    if (!next.pending.stage && isLegacyEventChoice(optionId)) {
      applyLegacyEventChoice(next, optionId);
      return completeCurrentNode(next);
    }
    if (!next.pending.stage) {
      next.pending.stage = 1;
      next.pending.path = [];
      const scenario = scenariosById[next.pending.scenarioId] || scenariosById[next.run?.scenarioId];
      next.pending.choices = eventChoicesFor(1, [], scenario);
    }
    const scenario = scenariosById[next.pending.scenarioId] || scenariosById[next.run?.scenarioId];
    const choices = next.pending.choices || eventChoicesFor(next.pending.stage, next.pending.path || [], scenario);
    const choice = choices.find((item) => item.id === optionId);
    if (!choice) return next;
    const path = [...(next.pending.path || []), optionId];
    if (next.pending.stage < 3) {
      next.pending.stage += 1;
      next.pending.path = path;
      next.pending.choices = eventChoicesFor(next.pending.stage, path, scenario);
      return next;
    }
    applyEventOutcome(next, next.pending, path);
    return completeCurrentNode(next);
  }

  function isLegacyEventChoice(optionId) {
    return ["curse-story", "temporary-power", "scenario-power", "recruit", "qi-insight"].includes(optionId);
  }

  function applyLegacyEventChoice(state, optionId) {
    if (optionId === "curse-story") {
      addRandomCurse(state);
      state.rewardPoints += Number(economy.curseStoryReward || 900);
    }
    if (optionId === "temporary-power") addTemporaryPower(state, { id: "battle-instinct", effect: "attackBonus", amount: 2 });
    if (optionId === "scenario-power") applyScenarioPower(state, scenariosById[state.pending.scenarioId]);
    if (optionId === "recruit" && state.pending.candidate) recruitCharacter(state, state.pending.candidate);
    if (optionId === "qi-insight" && hasPassive(state, "artifact-sense")) {
      state.sideStories += 1;
      addTemporaryPower(state, { id: "warded", effect: "openingBlock", amount: 4 });
    }
  }

  function applyEventOutcome(state, event, path) {
    const finalChoiceId = path[2];
    const scenario = scenariosById[event.scenarioId] || scenariosById[state.run?.scenarioId];
    const outcome = scenario?.eventOutcomes?.[finalChoiceId] || eventOutcomeByFinalChoice[finalChoiceId];
    if (!outcome) return;
    outcome.effects.forEach((effect) => applyEventEffect(state, event, scenario, effect));
    state.log = appendLog(state.log, `${scenario?.name || "輪迴"}奇遇：${outcome.title}。${outcome.text}`);
  }

  function applyEventEffect(state, event, scenario, effect) {
    if (effect.type === "recruit-hidden") {
      grantEventCharacter(state, event.hiddenCandidate || event.candidate);
      return;
    }
    if (effect.type === "recruit-candidate") {
      grantEventCharacter(state, event.candidate || event.hiddenCandidate);
      return;
    }
    if (effect.type === "rare-card") {
      const card = chooseCardRewards(state, 1, "elite")[0];
      if (card) addRunCard(state, card.id);
      else state.rewardPoints += 500;
      return;
    }
    if (effect.type === "legendary-equipment") {
      const equipment = chooseEquipmentRewardsByRarity(state, 1, ["legendary"])[0] || chooseEquipmentRewards(state, 1)[0];
      if (equipment) addRunEquipment(state, equipment.id);
      else state.rewardPoints += Number(economy.duplicateEquipmentReward || 600);
      return;
    }
    if (effect.type === "scenario-power") {
      applyScenarioPower(state, scenario);
      return;
    }
    if (effect.type === "run-power") {
      addTemporaryPower(state, effect);
      return;
    }
    if (effect.type === "reward-points") {
      state.rewardPoints = Math.max(0, state.rewardPoints + Number(effect.amount || 0));
      return;
    }
    if (effect.type === "side-story") {
      state.sideStories += Number(effect.amount || 1);
      return;
    }
    if (effect.type === "curse") {
      addRandomCurse(state);
      return;
    }
    if (effect.type === "stress") {
      const amount = Number(effect.amount || 0);
      affectAliveActive(state, (member) => ({ ...member, stress: clamp(member.stress + amount, 0, 100) }));
      return;
    }
    if (effect.type === "damage-fraction") {
      const amount = Number(effect.amount || 0);
      affectAliveActive(state, (member) => ({ ...member, hp: Math.max(1, Math.ceil(member.hp * (1 - amount))), stress: clamp(member.stress + Math.ceil(amount * 20), 0, 100) }));
      return;
    }
    if (effect.type === "heal") healActive(state, Number(effect.amount || 0.1), Number(effect.stressRelief || 0));
  }

  function grantEventCharacter(state, characterId) {
    if (characterId && charactersById[characterId] && !state.party.some((member) => member.id === characterId)) {
      recruitCharacter(state, characterId);
      return;
    }
    state.rewardPoints += 700;
  }

  function addRandomCurse(state) {
    const curseId = randomChoice(state, ["curse-panic", "curse-drain"]);
    const curse = makeDeckEntry(state, curseId, state.run?.id || null);
    state.deck.push(curse);
    state.curses.push(curse.instanceId);
  }

  function addTemporaryPower(state, power) {
    if (!state.run) return;
    if (state.run.temporaryPowers.some((item) => item.id === power.id)) {
      state.rewardPoints += 400;
      return;
    }
    const { type, ...storedPower } = power;
    state.run.temporaryPowers.push(storedPower);
  }

  function applyScenarioPower(state, scenario) {
    if (scenario?.scenarioPower) {
      addTemporaryPower(state, clone(scenario.scenarioPower));
      return;
    }
    addTemporaryPower(state, { id: "battle-instinct", effect: "attackBonus", amount: 2 });
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
    syncCustomMutations(state);
    refreshCustomTagOffers(state, { free: true, force: true });
    applyPlayerGrowthToParty(state);
    state.log = appendLog(state.log, `主神修復完成：${teamLabel(state)}支付 ${paid}/${fullCost} 點。`);
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
    if (next.screen !== "hub" || !["deployment", "roster", "growth", "shop"].includes(tabId)) return next;
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
    if (!item || next.rewardPoints < item.rewardPointCost || next.sideStories < Number(item.sideStoryCost || 0)) return next;
    const card = item.kind === "card" ? cardsById[item.itemId] : null;
    const repeatableCard = item.kind === "card" && isRepeatableCard(item.itemId);
    const ownedCard = item.kind === "card" ? findOwnedCardEntry(next, item.itemId) : null;
    const maxedUniqueCard = item.kind === "card" && card?.category === "general" && !repeatableCard && ownedCard && (ownedCard.upgraded || !card.upgrade);
    if ((item.kind !== "card" || repeatableCard) && bought >= item.stock) return next;
    if (maxedUniqueCard) return next;
    if (item.kind === "equipment" && next.equipmentInventory.some((entry) => entry.equipmentId === item.itemId)) return next;
    next.rewardPoints -= item.rewardPointCost;
    next.sideStories -= Number(item.sideStoryCost || 0);
    next.purchased[shopId] = bought + 1;
    if (item.kind === "card") grantOrUpgradeCard(next, item.itemId, null);
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

  function buyCustomStat(state, statId, amount = 1) {
    const next = clone(state);
    if (next.screen !== "hub" || !customStatIds.includes(statId)) return next;
    const count = Math.max(1, Math.floor(Number(amount || 1)));
    const cost = count * Number(economy.customStatPointCost || 1000);
    if (next.rewardPoints < cost) return next;
    next.rewardPoints -= cost;
    next.playerGrowth = normalizePlayerGrowth(next.playerGrowth, next.playerProfile);
    next.playerGrowth.stats[statId] = Number(next.playerGrowth.stats[statId] || 0) + count;
    syncCustomMutations(next);
    applyPlayerGrowthToParty(next);
    next.log = appendLog(next.log, `自創強化：${customStats.find((stat) => stat.id === statId)?.name || statId} +${count}。`);
    return next;
  }

  function buyCustomTag(state, tagId) {
    const next = clone(state);
    if (next.screen !== "hub") return next;
    next.playerGrowth = normalizePlayerGrowth(next.playerGrowth, next.playerProfile);
    const tag = customTagsById[tagId];
    if (!tag || next.playerGrowth.purchasedTags.includes(tagId) || !next.playerGrowth.tagOffers.includes(tagId)) return next;
    const cost = customTagCost(tag);
    if (next.rewardPoints < cost.rewardPointCost || next.sideStories < cost.sideStoryCost) return next;
    next.rewardPoints -= cost.rewardPointCost;
    next.sideStories -= cost.sideStoryCost;
    next.playerGrowth.purchasedTags.push(tagId);
    next.playerGrowth.tagOffers = next.playerGrowth.tagOffers.filter((id) => id !== tagId);
    syncCustomMutations(next);
    refreshCustomTagOffers(next, { free: true, onlyIfEmpty: true });
    applyPlayerGrowthToParty(next);
    next.log = appendLog(next.log, `主神標籤植入：「${tag.name}」。`);
    return next;
  }

  function customTagCost(tag) {
    const tier = String(tag?.tier || "B").toUpperCase();
    const tierSideStoryCosts = economy.customTagTierSideStoryCosts || {};
    return {
      rewardPointCost: Number(tag?.rewardPointCost ?? tag?.cost ?? 0),
      sideStoryCost: Number(tag?.sideStoryCost ?? tierSideStoryCosts[tier] ?? 0)
    };
  }

  function rerollCustomTagOffers(state) {
    const next = clone(state);
    if (next.screen !== "hub") return next;
    const cost = Number(economy.customTagRefreshCost || 300);
    if (next.rewardPoints < cost) return next;
    next.rewardPoints -= cost;
    next.playerGrowth = normalizePlayerGrowth(next.playerGrowth, next.playerProfile);
    next.playerGrowth.rerolls += 1;
    refreshCustomTagOffers(next, { free: true, force: true });
    next.log = appendLog(next.log, `主神刷新了本輪標籤候選。`);
    return next;
  }

  function refreshCustomTagOffers(state, options = {}) {
    state.playerGrowth = normalizePlayerGrowth(state.playerGrowth, state.playerProfile);
    if (options.onlyIfEmpty && state.playerGrowth.tagOffers.length) return state;
    const purchased = new Set(state.playerGrowth.purchasedTags);
    const candidates = (data.customTags || []).filter((tag) => !purchased.has(tag.id));
    const count = Number(economy.customTagOfferCount || 6);
    state.playerGrowth.tagOffers = takeRandom(state, candidates, count).map((tag) => tag.id);
    return state;
  }

  function syncCustomMutations(state) {
    state.playerGrowth = normalizePlayerGrowth(state.playerGrowth, state.playerProfile);
    const owned = new Set(state.playerGrowth.purchasedTags);
    state.playerGrowth.mutations = (data.customMutations || [])
      .filter((mutation) => (mutation.requiredTags || []).every((tagId) => owned.has(tagId)))
      .map((mutation) => mutation.id);
    const activeMutation = [...state.playerGrowth.mutations].reverse().map((id) => customMutationsById[id]).find(Boolean);
    const activeTag = [...state.playerGrowth.purchasedTags].reverse().map((id) => customTagsById[id]).find(Boolean);
    state.playerGrowth.art = activeMutation?.art || activeTag?.art || null;
    return state;
  }

  function applyPlayerGrowthToParty(state) {
    const member = state.party.find((item) => item.id === "player-avatar");
    if (!member || !state.playerProfile) return state;
    const desiredMaxHp = playerMaxHpFromGrowth(state.playerProfile, state.playerGrowth);
    const delta = desiredMaxHp - Number(member.maxHp || desiredMaxHp);
    member.maxHp = desiredMaxHp;
    member.hp = Math.max(1, Math.min(desiredMaxHp, Number(member.hp || desiredMaxHp) + Math.max(0, delta)));
    return state;
  }

  function playerMaxHpFromGrowth(profile, growth) {
    const profession = playerProfessionsById[profile?.professionId] || data.playerProfessions[0];
    const growthState = { playerGrowth: growth || createPlayerGrowth(profile) };
    return Number(profession?.maxHp || 60) + customStatTier(growthState, "stamina") * 10 + customEffectTotal(growthState, "maxHp");
  }

  function customStatTier(state, statId) {
    return Math.floor(Number(state.playerGrowth?.stats?.[statId] || 0) / 100);
  }

  function customLuckCritBonus(state) {
    return customStatTier(state, "luck") * 0.5;
  }

  function customSources(state) {
    const growth = state.playerGrowth || {};
    const tags = (growth.purchasedTags || []).map((id) => customTagsById[id]).filter(Boolean);
    const mutations = (growth.mutations || []).map((id) => customMutationsById[id]).filter(Boolean);
    return [...tags, ...mutations];
  }

  function customEffectTotal(state, effect) {
    return customSources(state).reduce((sum, source) => sum + Number(source.effects?.[effect] || 0), 0);
  }

  function customEffectMax(state, effect, fallback = 0) {
    return customSources(state).reduce((max, source) => Math.max(max, Number(source.effects?.[effect] || fallback)), fallback);
  }

  function customOpeningFreePlays(state) {
    return customStatTier(state, "speed") + customEffectTotal(state, "openingFreePlays");
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
    return grantOrUpgradeCard(state, cardId, state.run?.id || null);
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

  function isRepeatableCard(cardId) {
    return repeatableCardIds.has(cardId);
  }

  function findOwnedCardEntry(state, cardId) {
    return state.deck.find((entry) => entry.cardId === cardId);
  }

  function isUniqueCardMaxed(state, cardId) {
    const card = cardsById[cardId];
    if (!card || card.category !== "general" || isRepeatableCard(cardId)) return false;
    const owned = findOwnedCardEntry(state, cardId);
    return Boolean(owned && (owned.upgraded || !card.upgrade));
  }

  function isCardRewardAvailable(state, cardId) {
    const card = cardsById[cardId];
    if (!card || card.category !== "general") return false;
    if (isRepeatableCard(cardId)) return true;
    return !isUniqueCardMaxed(state, cardId);
  }

  function grantOrUpgradeCard(state, cardId, acquiredRunId) {
    const card = cardsById[cardId];
    if (!card) return null;
    if (card.category === "general" && !isRepeatableCard(cardId)) {
      const owned = findOwnedCardEntry(state, cardId);
      if (owned) {
        if (!owned.upgraded && card.upgrade) {
          owned.upgraded = true;
          return { action: "upgrade", entry: owned };
        }
        return { action: "max", entry: owned };
      }
    }
    const entry = makeDeckEntry(state, cardId, acquiredRunId);
    state.deck.push(entry);
    if (state.run && acquiredRunId === state.run.id) state.run.acquiredDeckIds.push(entry.instanceId);
    return { action: "add", entry };
  }

  function chooseCardRewards(state, count, tier = "battle") {
    const rareTier = tier === "elite" || tier === "miniboss";
    const allowedRarities = rareTier ? new Set(["common", "uncommon", "rare"]) : new Set(["common", "uncommon"]);
    const pool = data.cards.filter((card) => card.category === "general" && allowedRarities.has(card.rarity) && isCardRewardAvailable(state, card.id));
    if (!rareTier) return takeRandom(state, pool, count);
    const rareChoice = takeRandom(state, pool.filter((card) => card.rarity === "rare"), 1);
    const rareIds = new Set(rareChoice.map((card) => card.id));
    return [...rareChoice, ...takeRandom(state, pool.filter((card) => !rareIds.has(card.id)), Math.max(0, count - rareChoice.length))];
  }

  function chooseEquipmentRewards(state, count) {
    const owned = new Set(state.equipmentInventory.map((entry) => entry.equipmentId));
    return takeRandom(state, data.equipment.filter((item) => !owned.has(item.id)), count);
  }

  function chooseEquipmentRewardsByRarity(state, count, rarities) {
    const owned = new Set(state.equipmentInventory.map((entry) => entry.equipmentId));
    const raritySet = new Set(rarities);
    return takeRandom(state, data.equipment.filter((item) => !owned.has(item.id) && raritySet.has(item.rarity)), count);
  }

  function chooseBossRewards(state) {
    const rarePool = data.cards.filter((card) => card.category === "general" && card.rarity === "rare" && isCardRewardAvailable(state, card.id));
    const fallbackPool = data.cards.filter((card) => card.category === "general" && card.rarity !== "starter" && isCardRewardAvailable(state, card.id));
    const rare = takeRandom(state, rarePool.length ? rarePool : fallbackPool, 1)[0];
    const equipment = chooseEquipmentRewardsByRarity(state, 1, ["legendary"])[0] || chooseEquipmentRewards(state, 1)[0] || randomChoice(state, data.equipment);
    return [
      rare ? { id: `boss-card-${rare.id}`, kind: "card", itemId: rare.id, name: rare.name, text: rare.text } : null,
      { id: `boss-equipment-${equipment.id}`, kind: "equipment", itemId: equipment.id, name: equipment.name, text: equipment.text },
      { id: "boss-upgrade-token", kind: "upgrade", itemId: null, name: "永久強化券", text: "獲得 1 枚強化券，可在主神空間免費購買一次永久強化。" }
    ].filter(Boolean);
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
    const customTurnBlock = customEffectTotal(state, "turnBlockAll");
    const customTurnHeal = customEffectTotal(state, "turnHealAll");
    const customTurnStress = customEffectTotal(state, "turnStressAll");
    const customTurnReduceStress = customEffectTotal(state, "turnReduceStressAll");
    const customOwnerHeal = customEffectTotal(state, "turnHealOwner");
    const temporaryBlock = state.turn === 1 ? temporaryPowerAmount(state, "openingBlock") : 0;
    const customOpeningBlock = state.turn === 1 ? customEffectTotal(state, "openingBlockAll") : 0;
    if (turnBlock || temporaryBlock || customTurnBlock || customOpeningBlock) affectAliveActive(state, (member) => ({ ...member, block: member.block + turnBlock + temporaryBlock + customTurnBlock + customOpeningBlock }));
    if (stressRelief) affectAliveActive(state, (member) => ({ ...member, stress: Math.max(0, member.stress - stressRelief) }));
    if (customTurnStress) affectAliveActive(state, (member) => ({ ...member, stress: clamp(member.stress + customTurnStress, 0, 100) }));
    if (customTurnReduceStress) affectAliveActive(state, (member) => ({ ...member, stress: Math.max(0, member.stress - customTurnReduceStress) }));
    if (customTurnHeal) affectAliveActive(state, (member) => ({ ...member, hp: Math.min(member.maxHp, member.hp + customTurnHeal) }));
    if (customOwnerHeal) updateMember(state, "player-avatar", (member) => ({ ...member, hp: Math.min(member.maxHp, member.hp + customOwnerHeal) }));
    if (turnHealLowest) {
      const lowest = [...getAliveActiveParty(state)].sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
      if (lowest) updateMember(state, lowest.id, (member) => ({ ...member, hp: Math.min(member.maxHp, member.hp + turnHealLowest) }));
    }
    if (state.turn === 1) {
      const openingEvade = equipmentEffectTotal(state, "openingEvade") + customEffectTotal(state, "openingEvade");
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
    if (card.evadeOwner) {
      const evadeOwnerId = ownerId || getLeaderId(state);
      if (evadeOwnerId) updateMember(state, evadeOwnerId, (member) => ({ ...member, evade: Number(member.evade || 0) + card.evadeOwner }));
    }
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

  function applyCustomCardEffects(state, instance, card, targetEnemyUid) {
    const currentCardNumber = state.turnStats.cardsPlayed + 1;
    const target = state.activeEnemies.find((enemy) => enemy.uid === targetEnemyUid) || getLivingEnemies(state)[0];
    const ownerId = instance.ownerId || getLeaderId(state);
    if (card.type === "tactic" && !state.turnStats.customFirstTacticUsed) {
      const draw = customEffectTotal(state, "firstTacticDraw");
      const energy = customEffectTotal(state, "firstTacticEnergy");
      const weakAll = customEffectTotal(state, "firstTacticWeakAll");
      if (draw) drawCards(state, draw);
      if (energy) state.energy += energy;
      if (weakAll) getLivingEnemies(state).forEach((enemy) => addEnemyStatus(state, enemy.uid, "weak", weakAll));
      if (draw || energy || weakAll) {
        state.turnStats.customFirstTacticUsed = true;
        state.log = appendLog(state.log, "自創標籤戰術迴路啟動。");
      }
    }
    if (card.type === "support" && !state.turnStats.customFirstSupportUsed) {
      const draw = customEffectTotal(state, "firstSupportDraw");
      if (draw) {
        drawCards(state, draw);
        state.turnStats.customFirstSupportUsed = true;
      }
    }
    if (card.type === "guard" && !state.turnStats.customFirstGuardUsed) {
      const weakAll = customEffectTotal(state, "firstGuardWeakAll");
      if (weakAll) {
        getLivingEnemies(state).forEach((enemy) => addEnemyStatus(state, enemy.uid, "weak", weakAll));
        state.turnStats.customFirstGuardUsed = true;
      }
    }
    if (currentCardNumber === 2) {
      const damage = customEffectTotal(state, "secondCardDamage");
      if (damage && target) damageEnemy(state, target.uid, damage, "自創標籤追擊", { pierce: true });
    }
    if (currentCardNumber === 3) {
      const draw = customEffectTotal(state, "thirdCardDraw");
      const blockAll = customEffectTotal(state, "thirdCardBlockAll");
      const evadeOwner = customEffectTotal(state, "thirdCardEvadeOwner");
      if (draw) drawCards(state, draw);
      if (blockAll) affectAliveActive(state, (member) => ({ ...member, block: member.block + blockAll }));
      if (evadeOwner && ownerId) updateMember(state, ownerId, (member) => ({ ...member, evade: Number(member.evade || 0) + evadeOwner }));
    }
    if (currentCardNumber === 5) {
      const draw = customEffectTotal(state, "fifthCardDraw");
      const healAll = customEffectTotal(state, "fifthCardHealAll");
      const blockAll = customEffectTotal(state, "fifthCardBlockAll");
      const damageAll = customEffectTotal(state, "fifthCardDamageAll");
      if (draw) drawCards(state, draw);
      if (healAll) affectAliveActive(state, (member) => ({ ...member, hp: Math.min(member.maxHp, member.hp + healAll) }));
      if (blockAll) affectAliveActive(state, (member) => ({ ...member, block: member.block + blockAll }));
      if (damageAll) getLivingEnemies(state).forEach((enemy) => damageEnemy(state, enemy.uid, damageAll, "自創標籤連段", { pierce: true }));
    }
    if (card.type === "attack") {
      const heal = customEffectTotal(state, "healOwnerOnAttack");
      if (heal) updateMember(state, "player-avatar", (member) => ({ ...member, hp: Math.min(member.maxHp, member.hp + heal) }));
    }
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
    const deepen = enemy.burn > 0 && enemy.poison > 0 ? customEffectTotal(state, "poisonBurnDeepen") : 0;
    if (deepen > 0) damageEnemy(state, enemy.uid, deepen, "毒火變異", { pierce: true });
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
    const cost = getCardCostBeforeCustomFree(state, instance);
    if (state.turn === 1 && cost > 0 && Number(state.turnStats?.customFreePlaysUsed || 0) < customOpeningFreePlays(state)) return 0;
    return cost;
  }

  function getCardCostBeforeCustomFree(state, instance) {
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

  function getLeaderId(state) {
    return state.party.find((member) => member.id === "player-avatar")?.id
      || state.party.find((member) => member.id === "zheng-zha")?.id
      || getActiveParty(state)[0]?.id
      || state.party[0]?.id
      || null;
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
      const customEnergy = member.id === "player-avatar" ? customStatTier(state, "intelligence") : 0;
      return sum + member.energyContribution + crisisEnergy + customEnergy;
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
      equipmentFirstBurnUsed: false,
      customFirstAttackUsed: false,
      customFirstTacticUsed: false,
      customFirstSupportUsed: false,
      customFirstGuardUsed: false,
      customFreePlaysUsed: 0
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
    if (campaign.completedScenarios.includes("jinyong-heroic-peak")) unlock("pacific-rim-breach");
    if (campaign.completedScenarios.includes("pacific-rim-breach")) unlock("fury-road-war-rig");
    if (campaign.completedScenarios.includes("fury-road-war-rig")) unlock("resident-evil-6-c-virus");
    if (campaign.completedScenarios.includes("resident-evil-6-c-virus")) unlock("elden-ring-hell-run");
    if (campaign.completedScenarios.includes("elden-ring-hell-run")) unlock("jujutsu-kaisen-shibuya");
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

  function teamLabel(state) {
    return sanitizeTeamName(state?.teamName || "中洲隊", "中洲隊");
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  global.MainGodCore = {
    createInitialState,
    normalizeState,
    answerMainGodInvite,
    restartOnboarding,
    setPlayerName,
    setPlayerGender,
    setPlayerProfession,
    setPlayerPersonality,
    goToOnboardingStage,
    confirmPlayerCreation,
    renameTeam,
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
    eventOutcomeCount: Object.keys(eventOutcomeByFinalChoice).length,
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
    buyCustomStat,
    buyCustomTag,
    rerollCustomTagOffers,
    refreshCustomTagOffers,
    syncCustomMutations,
    customStatTier,
    customEffectTotal,
    customEffectMax,
    customTagCost,
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
    isRepeatableCard,
    findOwnedCardEntry,
    isUniqueCardMaxed,
    isCardRewardAvailable,
    grantOrUpgradeCard,
    chooseCardRewards,
    chooseEquipmentRewards,
    chooseBossRewards,
    cardsById,
    charactersById,
    equipmentById,
    enemiesById,
    encountersById,
    scenariosById,
    shopById,
    bloodlinesByCharacterId,
    bondsById,
    customTagsById,
    customMutationsById
  };
})(globalThis);
