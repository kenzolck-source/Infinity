(function (global) {
  const data = global.MainGodData;
  const core = global.MainGodCore;
  const audio = global.MainGodAudio;
  const app = document.querySelector("#app");
  let state = loadState();

  render();

  function loadState() {
    try {
      const saved = localStorage.getItem("main-god-card-mvp");
      return core.normalizeState(saved ? JSON.parse(saved) : null);
    } catch {
      return core.createInitialState();
    }
  }

  function dispatch(nextState, audioMeta = {}) {
    const previousState = state;
    state = nextState;
    try {
      localStorage.setItem("main-god-card-mvp", JSON.stringify(state));
    } catch {
      // file:// storage can be unavailable; the current session remains playable.
    }
    render();
    handleAudioTransition(previousState, state, audioMeta);
  }

  function render() {
    app.innerHTML = `<main class="shell screen-${state.screen}">${renderHeader()}${renderScreen()}</main>`;
    bindActions();
    audio?.syncMusic(state.screen);
  }

  function renderHeader() {
    const active = core.getActiveParty(state);
    const scenario = state.run ? core.scenariosById[state.run.scenarioId] : null;
    return `
      <header class="topbar">
        <div class="brand">
          <img src="./src/assets/main-god-space.svg" alt="" class="brand-mark" />
          <div><h1>主神空間</h1><p>${scenario ? scenario.name : state.campaign.tutorialComplete ? "中洲隊整備區" : "生化危機 · 引導開始"}</p></div>
        </div>
        <div class="topbar-status">
          <div class="resource-strip">
            <span>獎勵點 <strong>${state.rewardPoints}</strong></span>
            <span>支線劇情 <strong>${state.sideStories}</strong></span>
            ${state.upgradeTokens ? `<span>強化券 <strong>${state.upgradeTokens}</strong></span>` : ""}
            <span>出戰 <strong>${active.length}/6</strong></span>
            <span>能量 <strong>${core.calculateEnergy(state)}</strong></span>
            ${state.campaign.infiniteUnlocked ? `<span>輪迴階級 <strong>${state.campaign.infiniteTier}</strong></span>` : ""}
          </div>
          ${renderAudioControl()}
        </div>
      </header>
    `;
  }

  function renderAudioControl() {
    const audioState = audio?.getState?.() || { muted: true, volume: 0 };
    const volume = Math.round(Number(audioState.volume || 0) * 100);
    return `
      <div class="audio-control">
        <button class="audio-toggle" data-action="toggle-audio" aria-pressed="${audioState.muted ? "true" : "false"}">${audioState.muted ? "靜音" : "聲音"}</button>
        <label>
          <span class="audio-level">${volume}%</span>
          <input data-action="audio-volume" type="range" min="0" max="1" step="0.01" value="${Number(audioState.volume || 0).toFixed(2)}" aria-label="音量" />
        </label>
      </div>
    `;
  }

  function renderScreen() {
    if (state.screen === "story") return renderStory();
    if (state.screen === "recruit") return renderRecruit();
    if (state.screen === "scenario-intro") return renderScenarioIntro();
    if (state.screen === "map") return renderMap();
    if (state.screen === "combat") return renderCombat();
    if (state.screen === "reward") return renderCardReward();
    if (state.screen === "boss-reward") return renderBossReward();
    if (state.screen === "treasure") return renderTreasure();
    if (state.screen === "event") return renderEvent();
    if (state.screen === "camp") return renderCamp();
    if (state.screen === "defeat") return renderDefeat();
    return renderHub();
  }

  function renderStory() {
    const kind = state.pending?.kind;
    if (kind === "tutorial-choice-1") {
      return renderChoiceScreen("蜂巢岔路", "警報聲越來越近。張杰停下腳步，讓鄭吒決定下一步。", [
        { id: "search", title: "搜索醫療站", text: "獲得「戰地醫療」，但必須繞過黑暗實驗室。" },
        { id: "rush", title: "直衝封鎖門", text: "立刻獲得 50 獎勵點，繼續前進。" }
      ]);
    }
    if (kind === "tutorial-choice-2") {
      return renderChoiceScreen("月台前的整備", "爬行者正在接近。張杰只問了一句：要武器，還是要喘息？", [
        { id: "armory", title: "打開武器櫃", text: "獲得並裝備「無限子彈沙漠之鷹」。" },
        { id: "rest", title: "短暫休息", text: "出戰角色恢復 25% 生命並降低 12 壓力。" }
      ]);
    }
    return `
      <section class="story-screen tutorial-hero">
        <div class="story-backdrop"></div>
        <div class="story-copy">
          <span class="eyebrow">新手劇本 · 生化危機</span>
          <h2>活下去，然後再問問題。</h2>
          <p>冰冷車廂駛向蜂巢。鄭吒身邊只有強得不可思議的引導者張杰。三場戰鬥之後，真正的輪迴才會開始。</p>
          <button class="primary-action" data-action="story-option" data-option-id="start">進入蜂巢</button>
        </div>
        <div class="tutorial-duo">${state.party.map(renderPortraitCard).join("")}</div>
      </section>
    `;
  }

  function renderChoiceScreen(title, text, choices) {
    return `
      <section class="choice-screen">
        <div class="screen-title"><span class="eyebrow">劇情選擇</span><h2>${title}</h2><p>${text}</p></div>
        <div class="choice-grid">
          ${choices.map((choice) => `<button class="choice-card" data-action="story-option" data-option-id="${choice.id}"><strong>${choice.title}</strong><p>${choice.text}</p></button>`).join("")}
        </div>
        ${renderLog()}
      </section>
    `;
  }

  function renderRecruit() {
    const scenario = core.scenariosById[state.pending.scenarioId];
    return `
      <section class="choice-screen">
        <div class="screen-title"><span class="eyebrow">${scenario.name} · 投放前集結</span><h2>從三人中邀請一人加入</h2><p>被選中的角色會永久加入中洲隊。首次進入異形時，另外一人也會跟隨加入。</p></div>
        <div class="recruit-grid">
          ${state.pending.candidates.map((id) => {
            const member = core.charactersById[id];
            return `<button class="recruit-card faction-${member.factionId || "main"}" data-action="recruit" data-character-id="${id}">
              ${image(characterArt(id), `${member.name}插畫`, "recruit-art")}
              <span class="faction-badge">${member.faction || "中洲隊"}</span>
              <span class="energy-badge">+${member.energyContribution} 能量</span>
              <h3>${member.name}</h3><p>${member.role}</p><p class="trait">${member.passiveText}</p>
            </button>`;
          }).join("")}
        </div>
      </section>
    `;
  }

  function renderScenarioIntro() {
    const scenario = core.scenariosById[state.run.scenarioId];
    const opening = scenario.opening || {
      title: scenario.name,
      premise: scenario.intro,
      dialogue: [],
      panels: []
    };
    const firstLayer = state.run.map.layers[0] || [];
    return `
      <section class="scenario-intro-layout">
        <div class="scenario-intro-hero">
          ${renderOpeningHeroArt(opening)}
          <div class="scenario-intro-copy">
            <span class="eyebrow">${state.run.sourceScenarioId === "infinite" ? `無限輪迴 · 階級 ${state.campaign.infiniteTier}` : "主神投放"}</span>
            <h2>${scenario.name}</h2>
            <strong>${opening.title || scenario.subtitle}</strong>
            <p>${opening.premise || scenario.intro}</p>
          </div>
        </div>
        <div class="scenario-opening-grid">
          <section class="opening-dialogue">
            <span class="eyebrow">白光散去後</span>
            <h3>隊內通訊</h3>
            <div class="dialogue-stack">
              ${(opening.dialogue || []).map((line) => `<article><strong>${line.speaker}</strong><p>${line.line}</p></article>`).join("")}
            </div>
          </section>
          <section class="opening-brief">
            <span class="eyebrow">主神題要</span>
            <h3>生存目標</h3>
            <p>${scenario.intro}</p>
            <div class="route-preview">
              ${firstLayer.map((node, index) => {
                const encounter = core.encountersById[node.encounterId];
                return `<article><span>${["左線", "中線", "右線"][index] || `路線 ${index + 1}`}</span><strong>${encounter?.name || nodeTypeLabel(node.type)}</strong><p>${nodeTypeLabel(node.type)}遭遇</p></article>`;
              }).join("")}
            </div>
          </section>
        </div>
        <div class="opening-panel-grid">
          ${(opening.panels || []).map((panel) => `
            <article class="opening-panel">
              ${image(enemyArt(panel.enemyId), `${panel.title}插畫`, "opening-art")}
              <div><strong>${panel.title}</strong><p>${panel.text}</p></div>
            </article>
          `).join("")}
        </div>
        <button class="primary-action intro-action" data-action="continue-scenario-intro">確認投放，選擇路線</button>
      </section>
    `;
  }

  function renderMap() {
    const scenario = core.scenariosById[state.run.scenarioId];
    return `
      <section class="map-layout">
        <div class="map-head">
          <div><span class="eyebrow">${state.run.sourceScenarioId === "infinite" ? `無限輪迴 · 階級 ${state.campaign.infiniteTier}` : "劇本遠征"}</span><h2>${scenario.name}</h2><p>${scenario.intro}</p></div>
          <div class="run-power-strip">${(state.run.temporaryPowers || []).map((power) => `<span>${powerName(power)}</span>`).join("") || "<span>尚無暫時強化</span>"}</div>
        </div>
        <div class="fog-map">${state.run.map.layers.map(renderMapLayer).join("")}</div>
        ${renderRunParty()}
        ${renderLog()}
      </section>
    `;
  }

  function renderMapLayer(nodes) {
    const layer = nodes[0].layer;
    const visible = layer <= state.run.currentLayer + 1;
    const current = layer === state.run.currentLayer;
    return `
      <div class="map-layer ${visible ? "visible" : "fogged"} ${current ? "current" : ""}">
        <span class="layer-number">${layer}</span>
        <div class="map-node-row">${nodes.map((node) => renderMapNode(node, visible)).join("")}</div>
      </div>
    `;
  }

  function renderMapNode(node, visible) {
    const available = visible && core.isNodeAvailable(state, node);
    const label = visible ? nodeTypeLabel(node.type) : "未知";
    return `<button class="map-node type-${node.type} ${node.completed ? "completed" : ""}" data-action="map-node" data-node-id="${node.id}" ${available ? "" : "disabled"}>
      <span class="node-icon">${nodeIcon(visible ? node.type : "fog")}</span><strong>${label}</strong>
    </button>`;
  }

  function renderCombat() {
    const encounter = core.encountersById[state.activeEncounterId];
    return `
      <section class="combat-layout">
        <div class="combat-stage">
          <div class="encounter-title"><span class="eyebrow">${encounter.name}</span><h2>第 ${state.turn} 回合</h2></div>
          <div class="combat-columns">
            <div class="party-combat">${core.getActiveParty(state).map(renderCombatCharacter).join("")}</div>
            <div class="enemy-line">${state.activeEnemies.map(renderEnemy).join("")}</div>
          </div>
        </div>
        <aside class="combat-side">
          <div class="turn-panel">
            <span class="eyebrow">本回合能量</span>
            <div class="energy-row"><strong>${state.energy}</strong><span>/ ${state.maxEnergy}</span></div>
            <div class="pile-row"><span>抽牌 ${state.drawPile.length}</span><span>棄牌 ${state.discardPile.length}</span><span>耗盡 ${state.exhaustedPile.length}</span></div>
            <button class="secondary-action" data-action="end-turn">結束回合</button>
          </div>
          ${renderBondPanel("combat")}
          ${renderLog()}
        </aside>
        <section class="hand-zone">${state.hand.map(renderHandCard).join("")}</section>
      </section>
    `;
  }

  function renderCombatCharacter(member) {
    return `
      <article class="combat-character faction-${member.factionId || "main"} ${core.isAlive(member) ? "" : "down"}">
        ${image(characterArt(member.id), `${member.name}插畫`, "combat-character-art")}
        <div class="combat-character-copy">
          <div class="character-top"><div><span class="faction-inline faction-${member.factionId || "main"}">${member.faction || "中洲隊"}</span><h3>${member.name}</h3><p>${member.role} · +${member.energyContribution} 能量</p></div>${member.block ? `<span class="block-badge">${member.block}</span>` : ""}</div>
          ${renderMeter("生命", member.hp, member.maxHp, "hp")}
          ${renderMeter("壓力", member.stress, 100, "stress")}
          ${renderCharacterStatuses(member)}
        </div>
      </article>
    `;
  }

  function renderEnemy(enemy) {
    const intent = core.getEnemyIntent(enemy);
    const selected = state.selectedTargetId === enemy.uid;
    return `
      <button class="enemy-unit ${selected ? "selected" : ""} ${enemy.hp <= 0 ? "down" : ""}" data-action="select-target" data-enemy-id="${enemy.uid}" ${enemy.hp <= 0 ? "disabled" : ""}>
        ${image(enemyArt(enemy.enemyId), `${enemy.name}插畫`, "enemy-art")}
        <div class="enemy-copy"><h3>${enemy.name}</h3>${renderMeter("生命", enemy.hp, enemy.maxHp, "hp")}${enemy.block ? `<span class="stat-pill">護甲 ${enemy.block}</span>` : ""}${renderEnemyStatuses(enemy)}<div class="intent ${intent.kind}"><strong>${intent.label}</strong><span>${intentText(intent)}</span></div></div>
      </button>
    `;
  }

  function renderHandCard(instance) {
    const card = core.effectiveCard(instance);
    const cost = core.getCardCost(state, instance);
    const disabled = card.unplayable || cost > state.energy || (instance.ownerId && !state.party.some((member) => member.id === instance.ownerId && member.active && core.isAlive(member)));
    const owner = instance.ownerId ? core.charactersById[instance.ownerId] : null;
    const bloodline = owner ? core.bloodlinesByCharacterId[owner.id] : null;
    const bloodlineUnlocked = Boolean(bloodline && (bloodline.tutorialOnly || state.permanentUpgrades.bloodlines.includes(owner.id)));
    return `
      <button class="skill-card ${card.type} ${card.rarity}" data-action="play-card" data-card-uid="${instance.uid}" ${disabled ? "disabled" : ""}>
        ${image(skillArt(card.id), `${card.name}插畫`, "skill-art")}
        <span class="cost">${card.unplayable ? "!" : cost}</span><strong>${card.name}</strong>
        <span class="card-type">${cardTypeLabel(card)}${owner ? ` · ${owner.name}專屬` : ""}</span>
        <p>${card.text}</p>${bloodlineUnlocked ? `<p class="card-bloodline">血統附加：${bloodline.text}</p>` : ""}<span class="tags">${card.tags.join(" / ")}</span>
      </button>
    `;
  }

  function renderCardReward() {
    return `
      <section class="reward-layout">
        <div class="screen-title"><span class="eyebrow">戰鬥獎勵</span><h2>選擇一張牌加入本次遠征</h2></div>
        <div class="reward-grid">${state.rewardChoices.map((card) => renderRewardCard(card)).join("")}<button class="skip-reward" data-action="combat-reward" data-reward-id="skip"><strong>略過卡牌</strong><span>獲得 ${data.economy?.skipCardReward || 150} 獎勵點</span></button></div>
        ${renderLog()}
      </section>
    `;
  }

  function renderRewardCard(card) {
    return `
      <button class="skill-card reward-card ${card.type} ${card.rarity}" data-action="combat-reward" data-reward-id="${card.id}">
        ${image(skillArt(card.id), `${card.name}插畫`, "skill-art")}<span class="cost">${card.cost}</span><strong>${card.name}</strong>
        <span class="card-type">${cardTypeLabel(card)}</span><p>${card.text}</p><span class="tags">${card.tags.join(" / ")}</span>
      </button>
    `;
  }

  function renderBossReward() {
    return `
      <section class="reward-layout">
        <div class="screen-title"><span class="eyebrow">Boss 戰利品</span><h2>從三項稀有戰利品中選擇一項</h2></div>
        <div class="choice-grid">${state.rewardChoices.map((reward) => `<button class="loot-card" data-action="boss-reward" data-reward-id="${reward.id}">${image(reward.kind === "equipment" ? equipmentArt(reward.itemId) : reward.kind === "card" ? skillArt(reward.itemId) : "./src/assets/main-god-space.svg", "", "loot-art")}<span class="eyebrow">${rewardKindLabel(reward.kind)}</span><strong>${reward.name}</strong><p>${reward.text}</p></button>`).join("")}</div>
      </section>
    `;
  }

  function renderTreasure() {
    const choices = state.pending?.choices || [];
    return `
      <section class="reward-layout">
        <div class="screen-title"><span class="eyebrow">寶箱</span><h2>封存物資</h2><p>選擇一件裝備。裝備不進牌組，每名角色只能攜帶一件。</p></div>
        <div class="choice-grid">
          ${choices.map((item) => renderEquipmentChoice(item, "treasure")).join("")}
          ${choices.length === 0 ? `<button class="loot-card" data-action="treasure" data-reward-id="salvage">${image("./src/assets/main-god-space.svg", "", "loot-art")}<span class="eyebrow">替代獎勵</span><strong>回收裝備殘件</strong><p>所有唯一裝備均已持有，改為獲得 ${data.economy?.treasureSalvageReward || 700} 獎勵點。</p></button>` : ""}
          ${core.getAliveActiveParty(state).some((member) => member.passiveId === "artifact-sense") ? `<button class="loot-card" data-action="treasure" data-reward-id="qi-secret">${image(characterArt("qi-tengyi"), "", "loot-art")}<span class="eyebrow">齊騰一 · 鑑定</span><strong>辨認隱藏夾層</strong><p>獲得 1 支線劇情與 ${data.economy?.qiSecretReward || 500} 獎勵點。</p></button>` : ""}
        </div>
      </section>
    `;
  }

  function renderEquipmentChoice(item, action) {
    return `<button class="loot-card" data-action="${action}" data-reward-id="${item.id}">${image(equipmentArt(item.id), `${item.name}插畫`, "loot-art")}<span class="eyebrow">${rarityLabel(item.rarity)}裝備</span><strong>${item.name}</strong><p>${item.text}</p></button>`;
  }

  function renderEvent() {
    const candidate = state.pending?.candidate ? core.charactersById[state.pending.candidate] : null;
    const scenario = state.pending?.scenarioId ? core.scenariosById[state.pending.scenarioId] : null;
    return `
      <section class="choice-screen">
        <div class="screen-title"><span class="eyebrow">${scenario?.name || "輪迴"} · 奇遇</span><h2>${scenario?.eventTitle || "黑暗中的回應"}</h2><p>${scenario?.eventText || "訊號時有時無。每一個選擇都可能在之後索取代價。"}</p></div>
        <div class="choice-grid">
          <button class="choice-card danger" data-action="event" data-option-id="curse-story"><strong>觸碰支線線索</strong><p>獲得 ${data.economy?.curseStoryReward || 900} 獎勵點，但加入一張隨機詛咒。</p></button>
          <button class="choice-card" data-action="event" data-option-id="temporary-power"><strong>接受危險強化</strong><p>本次遠征所有攻擊牌傷害 +2。</p></button>
          ${scenario?.scenarioPower ? `<button class="choice-card scenario-choice" data-action="event" data-option-id="scenario-power"><strong>${scenario.scenarioPowerName}</strong><p>${scenario.scenarioPowerText}</p></button>` : ""}
          ${candidate ? `<button class="choice-card" data-action="event" data-option-id="recruit"><strong>救出 ${candidate.name}</strong><p>${candidate.role}將永久加入隊伍。</p></button>` : ""}
          ${core.getAliveActiveParty(state).some((member) => member.passiveId === "artifact-sense") ? `<button class="choice-card" data-action="event" data-option-id="qi-insight"><strong>齊騰一：解讀痕跡</strong><p>獲得 1 支線劇情，本次遠征開場全隊獲得 4 護甲。</p></button>` : ""}
        </div>
      </section>
    `;
  }

  function renderCamp() {
    const unupgradedCards = state.deck.filter((entry) => core.cardsById[entry.cardId].category === "general" && !entry.upgraded);
    const unupgradedSignatures = state.party.filter((member) => member.active && !state.permanentUpgrades.signatures.includes(member.id));
    const unupgradedEquipment = state.equipmentInventory.filter((entry) => !entry.upgraded);
    return `
      <section class="camp-layout">
        <div class="screen-title"><span class="eyebrow">整頓</span><h2>小王戰後的喘息</h2><p>可調整裝備，然後選擇恢復全隊或升級一項。</p></div>
        <button class="choice-card heal-choice" data-action="camp" data-camp-action="heal"><strong>主神急救</strong><p>全體出戰角色恢復 30% 最大生命並降低 15 壓力。</p></button>
        <section class="panel"><h3>升級一般牌</h3><div class="compact-grid">${unupgradedCards.map((entry) => `<button class="compact-choice" data-action="camp" data-camp-action="upgrade-deck" data-target-id="${entry.instanceId}">${core.cardsById[entry.cardId].name} → ${core.cardsById[entry.cardId].name}+</button>`).join("") || "<p>沒有可升級的一般牌。</p>"}</div></section>
        <section class="panel"><h3>升級專屬牌或裝備</h3><div class="compact-grid">${unupgradedSignatures.map((member) => `<button class="compact-choice" data-action="camp" data-camp-action="upgrade-signature" data-target-id="${member.id}">${member.name} · ${core.cardsById[member.signatureCardId].name}+</button>`).join("")}${unupgradedEquipment.map((entry) => `<button class="compact-choice" data-action="camp" data-camp-action="upgrade-equipment" data-target-id="${entry.instanceId}">${core.equipmentById[entry.equipmentId].name}+</button>`).join("")}</div></section>
        ${renderEquipmentManagement()}
      </section>
    `;
  }

  function renderHub() {
    const tab = state.hubTab || "deployment";
    return `
      <section class="hub-layout">
        <section class="hub-command">
          <div class="hub-command-copy">
            <span class="eyebrow">輪迴者整備中樞</span>
            <h2>主神空間</h2>
            <p>「主神全隊恢復，獎勵點數由我這裡扣除！」</p>
          </div>
          <div class="hub-command-metrics">
            <div><span>出戰隊員</span><strong>${core.getActiveParty(state).length}<small>/6</small></strong></div>
            <div><span>回合能量</span><strong>${core.calculateEnergy(state)}</strong></div>
            <div><span>已招募</span><strong>${state.party.length}<small>/${data.characters.filter((member) => !member.tutorialOnly).length}</small></strong></div>
            <div><span>永久牌組</span><strong>${state.deck.length}</strong></div>
          </div>
        </section>
        <nav class="hub-tabs" role="tablist" aria-label="主神空間功能">
          ${renderHubTab("deployment", "出戰部署", "選劇本與編隊", tab)}
          ${renderHubTab("roster", "角色整備", "人物、生命與裝備", tab)}
          ${renderHubTab("shop", "強化商店", "永久強化與兌換", tab)}
        </nav>
        <section class="hub-workspace">${tab === "roster" ? renderRosterHub() : tab === "shop" ? renderShopHub() : renderDeploymentHub()}</section>
      </section>
    `;
  }

  function renderHubTab(id, title, subtitle, activeTab) {
    return `<button class="hub-tab ${activeTab === id ? "active" : ""}" role="tab" aria-selected="${activeTab === id}" data-action="hub-tab" data-tab-id="${id}"><strong>${title}</strong><span>${subtitle}</span></button>`;
  }

  function renderShopHub() {
    const cardEntries = data.shop.filter((entry) => entry.kind === "card");
    const equipmentEntries = data.shop.filter((entry) => entry.kind === "equipment");
    return `
      <section class="panel">
        <div class="section-heading"><div><span class="eyebrow">支線劇情</span><h2>永久強化</h2></div><p>${state.sideStories} 支線 · ${state.upgradeTokens} 強化券</p></div>
        <div class="upgrade-grid">${data.permanentUpgrades.map(renderPermanentUpgrade).join("")}</div>
      </section>
      <section class="panel">
        <div class="section-heading"><div><span class="eyebrow">主神兌換</span><h2>共用攻擊卡牌</h2></div><p>${state.rewardPoints} 獎勵點 · 按分類展開</p></div>
        <div class="shop-source-list">${renderCardShopSections(cardEntries)}</div>
      </section>
      <section class="panel">
        <div class="section-heading"><div><span class="eyebrow">主神兌換</span><h2>裝備與神器</h2></div><p>${equipmentEntries.length} 件唯一裝備 · 按分類展開</p></div>
        <div class="shop-source-list">${renderEquipmentShopSections(equipmentEntries)}</div>
      </section>
      <section class="panel">
        <div class="section-heading"><div><span class="eyebrow">永久牌組</span><h2>一般牌與詛咒</h2></div><p>${state.deck.length} 張</p></div>
        <div class="deck-list">${state.deck.map(renderDeckEntry).join("")}</div>
      </section>
      ${renderLog()}
    `;
  }

  function renderCardShopSections(entries) {
    const sources = data.cardSources || [{ id: "main-god", name: "主神基礎", description: "通用卡牌。" }];
    const knownIds = new Set(sources.map((source) => source.id));
    const sections = sources.map((source) => renderCardShopSection(source, entries.filter((entry) => (core.cardsById[entry.itemId]?.sourceId || "main-god") === source.id))).join("");
    const unknownEntries = entries.filter((entry) => !knownIds.has(core.cardsById[entry.itemId]?.sourceId || "main-god"));
    return sections + (unknownEntries.length ? renderCardShopSection({ id: "other", name: "其他來源", description: "尚未歸類的卡牌。" }, unknownEntries) : "");
  }

  function renderCardShopSection(source, entries) {
    if (!entries.length) return "";
    return `
      <details class="shop-source-section">
        <summary><span><strong>${source.name}</strong><small>${source.description || ""}</small></span><em>${entries.length} 張</em></summary>
        <div class="shop-grid shop-section-grid">${entries.map(renderShopItem).join("")}</div>
      </details>
    `;
  }

  function renderEquipmentShopSections(entries) {
    const sources = data.equipmentSources || [{ id: "main-god-equipment", name: "主神裝備", description: "通用裝備。" }];
    const knownIds = new Set(sources.map((source) => source.id));
    const sections = sources.map((source) => renderEquipmentShopSection(source, entries.filter((entry) => (core.equipmentById[entry.itemId]?.sourceId || "main-god-equipment") === source.id))).join("");
    const unknownEntries = entries.filter((entry) => !knownIds.has(core.equipmentById[entry.itemId]?.sourceId || "main-god-equipment"));
    return sections + (unknownEntries.length ? renderEquipmentShopSection({ id: "other-equipment", name: "其他裝備", description: "尚未歸類的裝備。" }, unknownEntries) : "");
  }

  function renderEquipmentShopSection(source, entries) {
    if (!entries.length) return "";
    return `
      <details class="shop-source-section equipment-source-section">
        <summary><span><strong>${source.name}</strong><small>${source.description || ""}</small></span><em>${entries.length} 件</em></summary>
        <div class="shop-grid shop-section-grid">${entries.map(renderShopItem).join("")}</div>
      </details>
    `;
  }

  function renderScenarioButton(id) {
    const scenario = core.scenariosById[id];
    const complete = state.campaign.completedScenarios.includes(id);
    const bossEnemyId = scenario.boss ? core.encountersById[scenario.boss]?.enemies?.[0] : null;
    return `<button class="scenario-card" data-action="begin-scenario" data-scenario-id="${id}">${bossEnemyId ? image(enemyArt(bossEnemyId), "", "scenario-art") : ""}<span class="eyebrow">${complete ? "已通關 · 可重玩" : "主線劇本"}</span><strong>${scenario.name}</strong><p>${scenario.subtitle}</p></button>`;
  }

  function renderDeploymentHub() {
    const active = core.getActiveParty(state);
    const reserve = state.party.filter((member) => !member.active);
    return `
      <section class="scenario-panel deployment-scenarios">
        <div class="section-heading"><div><span class="eyebrow">劇本出擊</span><h2>選擇下一場恐怖片</h2></div><p>先定劇本，再用下方隊伍台調整出戰與羈絆。</p></div>
        <div class="scenario-grid">
          ${state.campaign.unlockedScenarios.map((id) => renderScenarioButton(id)).join("")}
          ${state.campaign.infiniteUnlocked ? `<button class="scenario-card infinite" data-action="begin-scenario" data-scenario-id="infinite"><span class="eyebrow">無限模式 · 第 ${state.campaign.infiniteTier} 層</span><strong>無限恐怖</strong><p>連續推進隨機劇本，獎勵與壓力同步提高。</p></button>` : ""}
        </div>
      </section>
      <section class="main-god-console deployment-console">
        <section class="panel squad-column">
          <div class="section-heading"><div><span class="eyebrow">出戰隊伍</span><h2>${active.length}/6 已部署</h2></div><p>最低 3 人，最多 6 人。能量 ${core.calculateEnergy(state)}。</p></div>
          <div class="squad-slot-list">${active.map(renderSquadSlot).join("")}</div>
        </section>
        <section class="panel browser-column">
          <div class="section-heading"><div><span class="eyebrow">候補名單</span><h2>按隊伍分組挑人</h2></div><p>${reserve.length} 名候補，可展開查看能力後加入。</p></div>
          ${renderCharacterBrowser(reserve, "deployment")}
        </section>
        <aside class="side-stack">
          ${renderBondPanel("deployment")}
          ${renderLog()}
        </aside>
      </section>
    `;
  }

  function renderRosterHub() {
    const upgraded = Object.keys(state.permanentUpgrades.characters).length;
    return `
      <section class="roster-overview">
        <div><span>已招募</span><strong>${state.party.length}</strong></div>
        <div><span>出戰中</span><strong>${core.getActiveParty(state).length}</strong></div>
        <div><span>角色強化</span><strong>${upgraded}</strong></div>
        <div><span>專屬牌升級</span><strong>${state.permanentUpgrades.signatures.length}</strong></div>
        <div><span>血統解放</span><strong>${state.permanentUpgrades.bloodlines.length}</strong></div>
      </section>
      <section class="main-god-console roster-console">
        <section class="panel browser-column">
          <div class="section-heading"><div><span class="eyebrow">角色名冊</span><h2>按陣營折疊管理</h2></div><p>展開隊伍分組即可升級角色、專屬牌與血統。</p></div>
          ${renderCharacterBrowser(state.party, "roster")}
        </section>
        <aside class="side-stack roster-side">
          ${renderBondPanel("deployment")}
          ${renderLog()}
        </aside>
      </section>
      ${renderEquipmentManagement()}
    `;
  }

  function renderCharacterBrowser(members, mode) {
    if (!members.length) return `<p class="empty-state">目前沒有可顯示的角色。</p>`;
    return `<div class="management-group-list">${groupMembersByFaction(members).map((group, index) => `
      <details class="management-group faction-${group.id}" ${index < 2 ? "open" : ""}>
        <summary><span><strong>${group.name}</strong><small>${group.members.length} 名角色 · ${group.activeCount} 名出戰</small></span><em>${group.energy} 能量</em></summary>
        <div class="compact-character-list">${group.members.map((member) => renderManagementCharacter(member, mode)).join("")}</div>
      </details>
    `).join("")}</div>`;
  }

  function renderManagementCharacter(member, mode) {
    const signature = core.cardsById[member.signatureCardId];
    const level = Number(state.permanentUpgrades.characters[member.id] || 0);
    const signatureUpgraded = state.permanentUpgrades.signatures.includes(member.id);
    const bloodline = core.bloodlinesByCharacterId[member.id];
    const bloodlineUnlocked = Boolean(bloodline && (bloodline.tutorialOnly || state.permanentUpgrades.bloodlines.includes(member.id)));
    const canUpgradeBloodline = bloodline && !bloodline.tutorialOnly && canAffordUpgradeCost(bloodline);
    const energy = member.energyContribution + (member.passiveId === "low-health-energy" && member.hp <= member.maxHp / 2 ? 1 : 0);
    const loadout = getMemberLoadout(member);
    return `
      <article class="mini-character-card faction-${member.factionId || "main"} ${member.active ? "active-member" : "reserve-member"}">
        ${image(characterArt(member.id), `${member.name}`, "mini-character-art")}
        <div class="mini-character-copy">
          <div class="mini-character-head">
            <div><span class="faction-inline faction-${member.factionId || "main"}">${member.faction || "中洲隊"}</span><h3>${member.name}</h3><p>${member.role}</p></div>
            <span class="energy-badge">+${energy}</span>
          </div>
          <div class="mini-stat-row"><span>HP ${member.hp}/${member.maxHp}</span><span>壓力 ${member.stress}</span><span>Lv.${level}</span></div>
          <div class="loadout-chip">${loadout.item ? `${loadout.item.name}${loadout.entry.upgraded ? "+" : ""}` : "未裝備"}</div>
          <details class="mini-details">
            <summary>能力詳情</summary>
            <p>${member.passiveText}</p>
            <p>專屬牌：${signature.name}${signatureUpgraded ? "+" : ""}</p>
            ${bloodline ? `<p class="${bloodlineUnlocked ? "unlocked" : ""}">血統：${bloodline.name} · ${bloodline.text}</p>` : ""}
          </details>
          ${mode === "roster" ? `<div class="inline-actions roster-actions">
            <button data-action="upgrade-character" data-character-id="${member.id}" ${level >= 3 || !canAffordUpgradeCost(data.economy?.characterUpgradeCost || { rewardPointCost: 500, sideStoryCost: 1 }) ? "disabled" : ""}>生命 +8</button>
            <button data-action="upgrade-signature" data-character-id="${member.id}" ${signatureUpgraded || !canAffordUpgradeCost(data.economy?.signatureUpgradeCost || { rewardPointCost: 1000, sideStoryCost: 1 }) ? "disabled" : ""}>專屬牌+</button>
            <button class="bloodline-action" data-action="upgrade-bloodline" data-character-id="${member.id}" ${bloodlineUnlocked || !canUpgradeBloodline ? "disabled" : ""}>${bloodlineUnlocked ? "血統已解放" : state.upgradeTokens > 0 ? "用免費強化解放血統" : `血統解放 · ${formatUpgradeCost(bloodline || { sideStoryCost: 2 })}`}</button>
          </div>` : `<div class="inline-actions deployment-actions"><button data-action="toggle-active" data-character-id="${member.id}" ${!member.active && core.getActiveParty(state).length >= 6 ? "disabled" : ""}>${member.active ? "移至候補" : "加入出戰"}</button></div>`}
        </div>
      </article>
    `;
  }

  function renderSquadSlot(member) {
    const loadout = getMemberLoadout(member);
    return `
      <article class="squad-slot faction-${member.factionId || "main"}">
        ${image(characterArt(member.id), `${member.name}`, "squad-art")}
        <div>
          <div class="squad-head"><strong>${member.name}</strong><span>+${member.energyContribution} 能量</span></div>
          <p>${member.role}</p>
          <div class="squad-equipment">${loadout.item ? `${loadout.item.name}${loadout.entry.upgraded ? "+" : ""}` : "未裝備"}</div>
        </div>
        <button data-action="toggle-active" data-character-id="${member.id}" ${core.getActiveParty(state).length <= 3 ? "disabled" : ""}>候補</button>
      </article>
    `;
  }

  function renderEquipmentManagement() {
    const entries = state.equipmentInventory;
    const equippedCount = Object.keys(state.equipped || {}).filter((id) => state.party.some((member) => member.id === id)).length;
    return `
      <section class="panel equipment-panel equipment-console">
        <div class="section-heading"><div><span class="eyebrow">裝備管理</span><h2>角色裝備與兵器庫</h2></div><p>${entries.length} 件道具 · ${equippedCount} 件已裝備</p></div>
        <div class="equipment-layout">
          <section class="loadout-column">
            <div class="subsection-heading"><strong>角色目前裝備</strong><span>先看誰缺裝，再到右側兵器庫指派。</span></div>
            <div class="loadout-grid">${state.party.map(renderLoadoutCard).join("")}</div>
          </section>
          <section class="armory-column">
            <div class="subsection-heading"><strong>兵器庫</strong><span>每件裝備只出現一次，直接指定持有人。</span></div>
            ${renderEquipmentBrowser(entries)}
          </section>
        </div>
      </section>
    `;
  }

  function renderLoadoutCard(member) {
    const loadout = getMemberLoadout(member);
    return `
      <article class="loadout-card faction-${member.factionId || "main"} ${member.active ? "active-member" : "reserve-member"}">
        ${image(characterArt(member.id), `${member.name}`, "loadout-character-art")}
        <div>
          <span class="faction-inline faction-${member.factionId || "main"}">${member.faction || "中洲隊"}</span>
          <strong>${member.name}</strong>
          <p>${member.active ? "出戰中" : "候補"} · ${member.role}</p>
          <div class="equipped-preview">${loadout.item ? `${image(equipmentArt(loadout.item.id), "", "loadout-equipment-art")}<span>${loadout.item.name}${loadout.entry.upgraded ? "+" : ""}</span>` : "<span>未裝備</span>"}</div>
        </div>
      </article>
    `;
  }

  function renderEquipmentBrowser(entries) {
    if (!entries.length) return `<p class="empty-state">目前還沒有裝備。</p>`;
    return `<div class="management-group-list armory-group-list">${groupEquipmentBySource(entries).map((group, index) => `
      <details class="management-group equipment-group" ${index < 2 ? "open" : ""}>
        <summary><span><strong>${group.name}</strong><small>${group.description || "可裝備道具"}</small></span><em>${group.entries.length} 件</em></summary>
        <div class="armory-list">${group.entries.map(renderArmoryItem).join("")}</div>
      </details>
    `).join("")}</div>`;
  }

  function renderArmoryItem(entry) {
    const item = core.equipmentById[entry.equipmentId];
    const holder = getEquipmentHolder(entry.instanceId);
    return `
      <article class="armory-item rarity-${item.rarity || "common"}">
        ${image(equipmentArt(item.id), "", "armory-art")}
        <div class="armory-copy">
          <div class="armory-head"><strong>${item.name}${entry.upgraded ? "+" : ""}</strong><span>${rarityLabel(item.rarity)}${item.weaponClass === "firearm" ? " · 槍械" : ""}</span></div>
          <p>${item.text}</p>
          <label class="assign-row"><span>持有人</span><select data-action="assign-equipment" data-equipment-instance-id="${entry.instanceId}">${renderEquipmentHolderOptions(holder)}</select></label>
        </div>
      </article>
    `;
  }

  function renderEquipmentHolderOptions(holder) {
    const active = core.getActiveParty(state);
    const reserve = state.party.filter((member) => !member.active);
    const optionFor = (member) => `<option value="${member.id}" ${holder?.id === member.id ? "selected" : ""}>${member.name}${member.active ? " · 出戰" : " · 候補"}</option>`;
    return `
      <option value="" ${holder ? "" : "selected"}>未裝備</option>
      <optgroup label="出戰隊伍">${active.map(optionFor).join("")}</optgroup>
      <optgroup label="候補隊員">${reserve.map(optionFor).join("")}</optgroup>
    `;
  }

  function getMemberLoadout(member) {
    const entry = state.equipmentInventory.find((item) => item.instanceId === state.equipped?.[member.id]);
    return { entry, item: entry ? core.equipmentById[entry.equipmentId] : null };
  }

  function getEquipmentHolder(instanceId) {
    const holderId = Object.entries(state.equipped || {}).find(([, value]) => value === instanceId)?.[0];
    return holderId ? state.party.find((member) => member.id === holderId) : null;
  }

  function groupMembersByFaction(members) {
    const groups = new Map();
    members.forEach((member) => {
      const id = member.factionId || "main";
      if (!groups.has(id)) groups.set(id, { id, name: member.faction || "中洲隊", members: [], activeCount: 0, energy: 0 });
      const group = groups.get(id);
      group.members.push(member);
      if (member.active) group.activeCount += 1;
      group.energy += Number(member.energyContribution || 0);
    });
    return [...groups.values()].sort((a, b) => Number(b.activeCount) - Number(a.activeCount) || a.name.localeCompare(b.name, "zh-Hant"));
  }

  function groupEquipmentBySource(entries) {
    const sources = new Map((data.equipmentSources || []).map((source) => [source.id, source]));
    const groups = new Map();
    entries.forEach((entry) => {
      const item = core.equipmentById[entry.equipmentId];
      const id = item.sourceId || "main-god-equipment";
      const source = sources.get(id) || { id, name: item.sourceName || "主神裝備", description: "" };
      if (!groups.has(id)) groups.set(id, { ...source, entries: [] });
      groups.get(id).entries.push(entry);
    });
    return [...groups.values()];
  }

  function renderBondPanel(mode) {
    const bonds = core.getActiveBonds(state);
    return `
      <section class="panel bond-panel ${mode === "combat" ? "compact" : ""}">
        <div class="section-heading"><div><span class="eyebrow">上陣羈絆</span><h2>${bonds.length ? `已啟用 ${bonds.length} 條` : "尚未啟用"}</h2></div></div>
        <div class="bond-grid">${bonds.map((bond) => `<article class="bond-card"><strong>${bond.name}</strong><p>${bond.text}</p></article>`).join("") || "<p class=\"empty-state\">調整出戰角色可啟用羈絆效果。</p>"}</div>
      </section>
    `;
  }

  function effectiveUpgradeCost(cost) {
    const sideStoryCost = Number(cost?.sideStoryCost || 0);
    const rewardPointCost = Number(cost?.rewardPointCost ?? (sideStoryCost ? sideStoryCost * Number(data.economy?.defaultSideStoryPointCost || 1400) : 0));
    return { rewardPointCost, sideStoryCost };
  }

  function canAffordUpgradeCost(cost) {
    const normalized = effectiveUpgradeCost(cost);
    return state.upgradeTokens > 0 || (state.rewardPoints >= normalized.rewardPointCost && state.sideStories >= normalized.sideStoryCost);
  }

  function formatUpgradeCost(cost) {
    const normalized = effectiveUpgradeCost(cost);
    return [
      normalized.rewardPointCost ? `${normalized.rewardPointCost} 點` : "",
      normalized.sideStoryCost ? `${normalized.sideStoryCost} 支線` : ""
    ].filter(Boolean).join(" / ") || "免費";
  }

  function renderPermanentUpgrade(upgrade) {
    const owned = state.permanentUpgrades.team.includes(upgrade.id);
    const canBuy = canAffordUpgradeCost(upgrade);
    return `<article class="upgrade-item"><strong>${upgrade.name}</strong><p>${upgrade.text}</p><button data-action="buy-permanent" data-upgrade-id="${upgrade.id}" ${owned || !canBuy ? "disabled" : ""}>${owned ? "已啟用" : state.upgradeTokens > 0 ? "使用永久強化券" : formatUpgradeCost(upgrade)}</button></article>`;
  }

  function renderShopItem(entry) {
    const item = entry.kind === "card" ? core.cardsById[entry.itemId] : core.equipmentById[entry.itemId];
    const bought = state.purchased[entry.id] || 0;
    const ownedEquipment = entry.kind === "equipment" && state.equipmentInventory.some((value) => value.equipmentId === entry.itemId);
    const disabled = bought >= entry.stock || ownedEquipment || state.rewardPoints < entry.rewardPointCost || state.sideStories < Number(entry.sideStoryCost || 0);
    const label = entry.kind === "card" ? (item.sourceName || "主神基礎") : (item.sourceName || "主神裝備");
    return `<article class="shop-item">${image(entry.kind === "card" ? skillArt(item.id) : equipmentArt(item.id), "", "shop-art")}<span class="eyebrow">${label}</span><h3>${item.name}</h3><p>${item.text}</p><button data-action="buy-shop" data-shop-id="${entry.id}" ${disabled ? "disabled" : ""}>${entry.rewardPointCost} 點${entry.sideStoryCost ? ` / ${entry.sideStoryCost} 支線` : ""}</button></article>`;
  }

  function renderDeckEntry(entry) {
    const card = core.cardsById[entry.cardId];
    const curse = card.category === "curse";
    const curseCost = Number(data.economy?.curseRemovalCost || 400);
    const removalCost = Number(data.economy?.deckCardRemovalCost || 300);
    const minimumDeckSize = Number(data.economy?.minimumDeckSize || 6);
    const canRemoveCard = !curse && state.rewardPoints >= removalCost && state.deck.length > minimumDeckSize;
    return `<div class="deck-row ${curse ? "curse-row" : ""}"><span>${card.name}${entry.upgraded ? "+" : ""}</span><strong>${cardTypeLabel(card)}</strong>${curse ? `<button data-action="remove-curse" data-deck-id="${entry.instanceId}" ${state.rewardPoints < curseCost ? "disabled" : ""}>${curseCost} 點移除</button>` : `<button data-action="remove-deck-card" data-deck-id="${entry.instanceId}" ${canRemoveCard ? "" : "disabled"}>${removalCost} 點移除</button>`}</div>`;
  }

  function renderRunParty() {
    return `<section class="panel"><div class="section-heading"><div><span class="eyebrow">遠征隊伍</span><h2>目前狀態</h2></div></div><div class="run-party-grid">${core.getActiveParty(state).map((member) => `<article>${image(characterArt(member.id), "", "run-party-art")}<div><span class="faction-inline faction-${member.factionId || "main"}">${member.faction || "中洲隊"}</span><strong>${member.name}</strong></div>${renderMeter("生命", member.hp, member.maxHp, "hp")}${renderMeter("壓力", member.stress, 100, "stress")}</article>`).join("")}</div></section>`;
  }

  function renderPortraitCard(member) {
    return `<article class="portrait-card faction-${member.factionId || "main"}">${image(characterArt(member.id), `${member.name}插畫`, "portrait-art")}<span class="faction-badge">${member.faction || "中洲隊"}</span><span class="energy-badge">+${member.energyContribution} 能量</span><h3>${member.name}</h3><p>${member.passiveText}</p></article>`;
  }

  function renderDefeat() {
    return `<section class="defeat-layout"><span class="eyebrow">遠征失敗</span><h2>全隊失去戰鬥能力</h2><p>本次取得的一般卡牌、裝備與暫時強化將失去；招募角色、詛咒與支線劇情會保留。</p><button class="primary-action" data-action="return-after-defeat">返回主神空間</button>${renderLog()}</section>`;
  }

  function renderLog() {
    return `<div class="log-panel">${state.log.map((line) => `<p>${line}</p>`).join("")}</div>`;
  }

  function renderMeter(label, value, max, type) {
    const ratio = Math.max(0, Math.min(100, (value / max) * 100));
    return `<div class="meter ${type}"><div class="meter-label"><span>${label}</span><strong>${value}/${max}</strong></div><span class="meter-track"><span style="width:${ratio}%"></span></span></div>`;
  }

  function handleAudioTransition(previous, next, meta) {
    if (!audio || previous === next) return;
    if (meta.action === "play-card") handleCardAudio(previous, next, meta);
    if (shouldPlayDraw(previous, next, meta)) audio.play("card.draw");
    if (shouldPlayReward(previous, next, meta)) window.setTimeout(() => audio.play("card.reward", { gain: 0.85 }), 180);
    if (previous.screen === "combat" && next.screen !== "combat") {
      if (next.screen === "defeat") audio.play("combat.defeat");
      else audio.play("combat.victory");
    }
    if (meta.action === "buy-shop" && core.shopById[meta.shopId]?.kind === "card" && stateChanged(previous, next)) {
      audio.play("card.reward", { gain: 0.7 });
    }
  }

  function handleCardAudio(previous, next, meta) {
    if (previous.screen !== "combat") return;
    const instance = previous.hand.find((entry) => entry.uid === meta.cardUid);
    const card = instance ? core.effectiveCard(instance) : null;
    if (!card || next.hand.some((entry) => entry.uid === meta.cardUid)) return;

    const type = ["attack", "guard", "support", "tactic"].includes(card.type) ? card.type : "tactic";
    audio.play(`card.play.${type}`);

    const result = summarizeEnemyDamage(previous, next, card);
    if (result.totalDamage > 0 || result.damagedEnemies > 0) {
      const hitEvent = result.damagedEnemies > 1 || card.damageAll ? "combat.hit.aoe" : result.totalDamage >= 24 ? "combat.hit.heavy" : "combat.hit.light";
      audio.play(hitEvent, { gain: Math.min(1.35, 0.85 + result.totalDamage / 80) });
    }
    if (result.breaks > 0) {
      window.setTimeout(() => audio.play("combat.enemy.break", { gain: Math.min(1.4, 0.95 + result.breaks * 0.12) }), 90);
    }
    if (next.screen === "combat" && next.hand.length > previous.hand.length - 1) {
      window.setTimeout(() => audio.play("card.draw", { gain: 0.72 }), 120);
    }
  }

  function summarizeEnemyDamage(previous, next, card) {
    const after = new Map((next.activeEnemies || []).map((enemy) => [enemy.uid, enemy]));
    return (previous.activeEnemies || []).reduce((summary, enemy) => {
      if (enemy.hp <= 0) return summary;
      const nextEnemy = after.get(enemy.uid);
      if (!nextEnemy) {
        if (card.type === "attack") {
          summary.damagedEnemies += 1;
          summary.totalDamage += Math.max(1, enemy.hp);
          summary.breaks += 1;
        }
        return summary;
      }
      const hpDelta = Math.max(0, enemy.hp - nextEnemy.hp);
      if (hpDelta > 0) {
        summary.damagedEnemies += 1;
        summary.totalDamage += hpDelta;
      }
      if ((nextEnemy.hp <= 0 && enemy.hp > 0) || (!enemy.phaseTwoTriggered && nextEnemy.phaseTwoTriggered)) summary.breaks += 1;
      return summary;
    }, { totalDamage: 0, damagedEnemies: 0, breaks: 0 });
  }

  function shouldPlayDraw(previous, next, meta) {
    if (next.screen !== "combat") return false;
    if (previous.screen !== "combat" && next.hand?.length) return true;
    if (meta.action === "end-turn" && next.hand?.length) return true;
    return meta.action !== "play-card" && previous.screen === "combat" && next.hand?.length > previous.hand?.length;
  }

  function shouldPlayReward(previous, next, meta) {
    if (["reward", "boss-reward", "treasure"].includes(next.screen) && previous.screen !== next.screen) return true;
    if (meta.action === "combat-reward" && meta.rewardId !== "skip" && stateChanged(previous, next)) return true;
    if (meta.action === "boss-reward" && stateChanged(previous, next)) return true;
    if (meta.action === "treasure" && stateChanged(previous, next)) return true;
    return false;
  }

  function stateChanged(previous, next) {
    return JSON.stringify(previous) !== JSON.stringify(next);
  }

  function bindActions() {
    app.querySelectorAll("[data-action]").forEach((element) => {
      const action = element.dataset.action;
      if (action === "audio-volume") {
        element.addEventListener("input", () => {
          audio?.unlock?.();
          audio?.setVolume(Number(element.value));
          const level = element.closest(".audio-control")?.querySelector(".audio-level");
          if (level) level.textContent = `${Math.round(Number(element.value) * 100)}%`;
        });
        return;
      }
      if (action === "toggle-audio") {
        element.addEventListener("click", () => {
          audio?.unlock?.();
          const audioState = audio?.getState?.();
          audio?.setMuted(!audioState || !audioState.muted ? true : false);
          render();
        });
        return;
      }
      if (action === "equip") {
        element.addEventListener("change", () => {
          audio?.unlock?.();
          dispatch(core.equipItem(state, element.dataset.characterId, element.value), { action });
        });
        return;
      }
      if (action === "assign-equipment") {
        element.addEventListener("change", () => {
          audio?.unlock?.();
          const holder = getEquipmentHolder(element.dataset.equipmentInstanceId);
          const nextHolderId = element.value;
          dispatch(core.equipItem(state, nextHolderId || holder?.id || "", nextHolderId ? element.dataset.equipmentInstanceId : ""), { action });
        });
        return;
      }
      element.addEventListener("click", () => {
        audio?.unlock?.();
        if (action === "story-option") dispatch(core.chooseStoryOption(state, element.dataset.optionId), { action, optionId: element.dataset.optionId });
        if (action === "recruit") dispatch(core.chooseRecruit(state, element.dataset.characterId), { action, characterId: element.dataset.characterId });
        if (action === "begin-scenario") dispatch(core.beginScenario(state, element.dataset.scenarioId), { action, scenarioId: element.dataset.scenarioId });
        if (action === "continue-scenario-intro") dispatch(core.continueScenarioIntro(state), { action });
        if (action === "map-node") dispatch(core.chooseMapNode(state, element.dataset.nodeId), { action, nodeId: element.dataset.nodeId });
        if (action === "select-target") dispatch(core.selectTarget(state, element.dataset.enemyId), { action, enemyId: element.dataset.enemyId });
        if (action === "play-card") dispatch(core.playCard(state, element.dataset.cardUid, state.selectedTargetId), { action, cardUid: element.dataset.cardUid, targetEnemyUid: state.selectedTargetId });
        if (action === "end-turn") dispatch(core.endPlayerTurn(state), { action });
        if (action === "combat-reward") dispatch(core.claimCombatReward(state, element.dataset.rewardId), { action, rewardId: element.dataset.rewardId });
        if (action === "boss-reward") dispatch(core.claimBossReward(state, element.dataset.rewardId), { action, rewardId: element.dataset.rewardId });
        if (action === "treasure") dispatch(core.claimTreasure(state, element.dataset.rewardId), { action, rewardId: element.dataset.rewardId });
        if (action === "event") dispatch(core.resolveEvent(state, element.dataset.optionId), { action, optionId: element.dataset.optionId });
        if (action === "camp") dispatch(core.campAction(state, element.dataset.campAction, element.dataset.targetId), { action, campAction: element.dataset.campAction, targetId: element.dataset.targetId });
        if (action === "return-after-defeat") dispatch(core.returnAfterDefeat(state), { action });
        if (action === "hub-tab") dispatch(core.setHubTab(state, element.dataset.tabId), { action, tabId: element.dataset.tabId });
        if (action === "toggle-active") dispatch(core.toggleActive(state, element.dataset.characterId), { action, characterId: element.dataset.characterId });
        if (action === "buy-shop") dispatch(core.buyShopItem(state, element.dataset.shopId), { action, shopId: element.dataset.shopId });
        if (action === "buy-permanent") dispatch(core.buyPermanentUpgrade(state, element.dataset.upgradeId), { action, upgradeId: element.dataset.upgradeId });
        if (action === "upgrade-character") dispatch(core.upgradeCharacter(state, element.dataset.characterId), { action, characterId: element.dataset.characterId });
        if (action === "upgrade-signature") dispatch(core.upgradeSignature(state, element.dataset.characterId), { action, characterId: element.dataset.characterId });
        if (action === "upgrade-bloodline") dispatch(core.upgradeBloodline(state, element.dataset.characterId), { action, characterId: element.dataset.characterId });
        if (action === "remove-curse") dispatch(core.removeCurse(state, element.dataset.deckId), { action, deckId: element.dataset.deckId });
        if (action === "remove-deck-card") dispatch(core.removeDeckCard(state, element.dataset.deckId), { action, deckId: element.dataset.deckId });
      });
    });
  }

  function image(src, alt, className) {
    return `<img src="${src}" alt="${alt}" class="${className}" onerror="this.onerror=null;this.src='./src/assets/main-god-space.svg'" />`;
  }

  function renderOpeningHeroArt(opening) {
    const firstPanel = opening.panels?.[0];
    return image(firstPanel?.enemyId ? enemyArt(firstPanel.enemyId) : "./src/assets/main-god-space.svg", "", "scenario-intro-art");
  }

  function characterArt(id) {
    return `./src/assets/generated/character-${id}.png`;
  }

  function skillArt(id) {
    return `./src/assets/generated/skill-${id}.png`;
  }

  function equipmentArt(id) {
    return `./src/assets/generated/equipment-${id}.png`;
  }

  function enemyArt(id) {
    const aliases = {
      "mummy-scarab": "abyss-larva",
      "mummy-guard": "blood-thrall",
      "desert-priest": "pressure-wraith",
      "anubis-guardian": "trench-warden",
      "immortal-priest": "curse-matriarch",
      "compy-pack": "crimson-hound",
      "raptor-stalker": "alien-warrior",
      "dilophosaurus": "facehugger",
      "triceratops-bull": "trench-warden",
      "tyrannosaurus-rex": "leviathan-core",
      "black-flame-shard": "blood-thrall",
      "causality-sniper": "gargoyle-sentry",
      "void-assassin": "grudge-shadow",
      "causality-commander": "night-sovereign",
      "devil-zheng-avatar": "night-sovereign",
      "white-light-oracle": "pressure-wraith",
      "erasure-guardian": "trench-warden",
      "cycle-arbiter": "leviathan-core",
      "main-god-avatar": "leviathan-core"
    };
    return `./src/assets/generated/enemy-${aliases[id] || id}.png`;
  }

  function cardTypeLabel(card) {
    if (card.category === "curse") return "詛咒";
    return { attack: "攻擊", guard: "防護", support: "支援", tactic: "戰術" }[card.type] || card.type;
  }

  function rarityLabel(rarity) {
    return { common: "普通", uncommon: "精良", rare: "稀有", legendary: "傳說" }[rarity] || rarity;
  }

  function rewardKindLabel(kind) {
    return { card: "稀有卡牌", equipment: "強力裝備", upgrade: "永久強化" }[kind];
  }

  function nodeTypeLabel(type) {
    return { battle: "戰鬥", elite: "精英", event: "奇遇", treasure: "寶箱", miniboss: "小王", camp: "整頓", boss: "Boss" }[type] || type;
  }

  function nodeIcon(type) {
    return { battle: "⚔", elite: "!", event: "?", treasure: "◇", miniboss: "◆", camp: "+", boss: "★", fog: "…" }[type];
  }

  function powerName(power) {
    return { "battle-instinct": "戰鬥本能：攻擊 +2", warded: "古物護佑：開場護甲 +4", "book-of-amun-ra": "復活真經殘頁：開場護甲 +6", "electric-fence": "高壓電網：每回合護甲 +2", "pressure-suit": "壓力密封服：每回合護甲 +2", "silvered-weapons": "鍍銀武裝：攻擊 +3", "black-flame-overclock": "黑炎超載：攻擊 +5", "main-god-calibration": "主神白光校準：每回合護甲 +4", "thunder-spear-route": "雷槍與立體機動線：攻擊 +4", "nichirin-counteroffensive": "赫刀連攜：攻擊 +6", "stylish-combo-rating": "Stylish連段評級：攻擊 +5" }[power.id] || power.id;
  }

  function intentText(intent) {
    if (intent.kind === "attack") return `單體傷害 ${intent.amount}`;
    if (intent.kind === "cleave") return `全隊傷害 ${intent.amount}`;
    if (intent.kind === "stress") return `全隊壓力 +${intent.amount}`;
    if (intent.kind === "regen") return `自我修復 ${intent.amount}${intent.block ? `，護甲 +${intent.block}` : ""}`;
    return `護甲 +${intent.amount}`;
  }

  function renderCharacterStatuses(member) {
    const statuses = [];
    if (member.evade > 0) statuses.push(`<span class="combat-status evade">閃避 ${member.evade}</span>`);
    return statuses.length ? `<div class="combat-status-row">${statuses.join("")}</div>` : "";
  }

  function renderEnemyStatuses(enemy) {
    const statuses = [];
    if (enemy.burn > 0) statuses.push(`<span class="combat-status burn">燃燒 ${enemy.burn}</span>`);
    if (enemy.poison > 0) statuses.push(`<span class="combat-status poison">中毒 ${enemy.poison}</span>`);
    if (enemy.stun > 0) statuses.push(`<span class="combat-status stun">封鎖 ${enemy.stun}</span>`);
    if (enemy.weak > 0) statuses.push(`<span class="combat-status weak">虛弱 ${enemy.weak}</span>`);
    if (enemy.regen > 0) statuses.push(`<span class="combat-status regen">再生 ${enemy.regen}</span>`);
    if (enemy.phaseTwo && !enemy.phaseTwoTriggered) statuses.push(`<span class="combat-status phase">二階段</span>`);
    if (enemy.phaseTwoTriggered) statuses.push(`<span class="combat-status phase">第二階段</span>`);
    return statuses.length ? `<div class="combat-status-row">${statuses.join("")}</div>` : "";
  }
})(globalThis);
