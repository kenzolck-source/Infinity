(function (global) {
  const data = global.MainGodData;
  const core = global.MainGodCore;
  const audio = global.MainGodAudio;
  const app = document.querySelector("#app");
  let state = loadState();
  let lastRenderedScreen = null;

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
    const screenChanged = lastRenderedScreen !== state.screen;
    const header = state.screen === "onboarding" ? "" : renderHeader();
    app.innerHTML = `<main class="shell screen-${state.screen}">${header}${renderScreen()}</main>`;
    bindActions();
    audio?.syncMusic(state.screen);
    if (screenChanged && typeof global.scrollTo === "function") {
      const defer = typeof global.requestAnimationFrame === "function" ? global.requestAnimationFrame : (callback) => setTimeout(callback, 0);
      defer(() => global.scrollTo(0, 0));
    }
    lastRenderedScreen = state.screen;
  }

  function renderHeader() {
    const active = core.getActiveParty(state);
    const scenario = state.run ? core.scenariosById[state.run.scenarioId] : null;
    return `
      <header class="topbar">
        <div class="brand">
          <img src="./src/assets/main-god-space.svg" alt="" class="brand-mark" />
          <div><h1>主神空間</h1><p>${scenario ? scenario.name : state.campaign.tutorialComplete ? `${escapeHtml(state.teamName || "中洲隊")}整備區` : "生化危機 · 引導開始"}</p></div>
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
    if (state.screen === "onboarding") return renderOnboarding();
    if (state.screen === "story") return renderStory();
    if (state.screen === "recruit") return renderRecruit();
    if (state.screen === "scenario-intro") return renderScenarioIntro();
    if (state.screen === "map") return renderMap();
    if (state.screen === "combat") return renderCombat();
    if (state.screen === "reward") return renderCardReward();
    if (state.screen === "boss-reward") return renderBossReward();
    if (state.screen === "treasure") return renderTreasure();
    if (state.screen === "event") return renderEvent();
    if (state.screen === "event-result") return renderEventResult();
    if (state.screen === "camp") return renderCamp();
    if (state.screen === "defeat") return renderDefeat();
    return renderHub();
  }

  function renderOnboarding() {
    const stage = state.onboarding?.stage || "invite";
    if (stage === "ordinary-ending") return renderOrdinaryEnding();
    if (stage === "name") return renderOnboardingName();
    if (stage === "gender") return renderOnboardingGender();
    if (stage === "profession") return renderOnboardingProfession();
    if (stage === "personality") return renderOnboardingPersonality();
    if (stage === "confirm") return renderOnboardingConfirm();
    return renderMainGodInvite();
  }

  function renderMainGodInvite() {
    return `
      <section class="onboarding-screen win98-screen">
        <div class="desktop-noise"></div>
        <div class="win98-dialog">
          <div class="win98-titlebar"><span>MainGod.exe</span><button aria-label="關閉" disabled>×</button></div>
          <div class="win98-body">
            <div class="win98-icon">?</div>
            <p>想知道生存的意義嗎? 想要真正的活著嗎 ?</p>
          </div>
          <div class="win98-actions">
            <button data-action="main-god-invite" data-answer="yes">Yes</button>
            <button data-action="main-god-invite" data-answer="no">No</button>
          </div>
        </div>
      </section>
    `;
  }

  function renderOrdinaryEnding() {
    return `
      <section class="onboarding-screen ordinary-ending-screen">
        <div class="ordinary-ending-copy">
          <span class="eyebrow">普通人結局</span>
          <h2>視窗關閉了。</h2>
          <p>螢幕恢復原本的亮度，房間安靜得像什麼都沒發生。第二天照常到來，新聞照常播放，疲憊照常留在身上。你偶爾會想起那兩句話，但世界沒有回答。</p>
          <button class="primary-action" data-action="restart-onboarding">重新看向螢幕</button>
        </div>
      </section>
    `;
  }

  function renderOnboardingName() {
    const draftName = escapeHtml(state.onboarding?.draft?.name || "");
    return `
      <section class="onboarding-screen creator-screen">
        <div class="creator-window compact">
          <div class="creator-step"><span>Step 1</span><strong>輸入你的名字</strong></div>
          <h2>白光之前，你叫什麼？</h2>
          <label class="creator-field">
            <span>姓名</span>
            <input id="player-name-input" type="text" maxlength="12" value="${draftName}" placeholder="無名者" autocomplete="off" />
          </label>
          <div class="creator-actions">
            <button class="primary-action" data-action="player-name">下一步</button>
          </div>
        </div>
      </section>
    `;
  }

  function renderOnboardingGender() {
    return `
      <section class="onboarding-screen creator-screen">
        <div class="creator-window compact">
          <div class="creator-step"><span>Step 2</span><strong>選擇性別</strong></div>
          <h2>${escapeHtml(playerDraftName())}</h2>
          <div class="gender-choice-grid">
            <button class="choice-card" data-action="player-gender" data-gender="male"><strong>男</strong></button>
            <button class="choice-card" data-action="player-gender" data-gender="female"><strong>女</strong></button>
          </div>
          <div class="creator-actions"><button class="secondary-action" data-action="onboarding-back" data-stage="name">返回</button></div>
        </div>
      </section>
    `;
  }

  function renderOnboardingProfession() {
    const gender = state.onboarding?.draft?.gender || "male";
    return `
      <section class="onboarding-screen creator-screen">
        <div class="creator-window wide">
          <div class="creator-step"><span>Step 3</span><strong>選擇職業</strong></div>
          <div class="screen-title"><h2>主神正在翻閱你的人生。</h2></div>
          <div class="profession-grid">
            ${data.playerProfessions.map((profession) => renderProfessionChoice(profession, gender)).join("")}
          </div>
          <div class="creator-actions"><button class="secondary-action" data-action="onboarding-back" data-stage="gender">返回</button></div>
        </div>
      </section>
    `;
  }

  function renderProfessionChoice(profession, gender) {
    const cards = profession.cardIds.map((cardId) => core.cardsById[cardId]).filter(Boolean);
    return `
      <button class="profession-card archetype-${profession.archetype}" data-action="player-profession" data-profession-id="${profession.id}">
        ${image(professionArt(profession.id, gender), `${profession.name}插畫`, "profession-art")}
        <span class="eyebrow">${profession.archetype}型</span>
        <strong>${escapeHtml(profession.name)}</strong>
        <p>${escapeHtml(profession.passiveText)}</p>
        <small>${cards.map((card) => escapeHtml(card.name)).join(" · ")}</small>
      </button>
    `;
  }

  function renderOnboardingPersonality() {
    return `
      <section class="onboarding-screen creator-screen">
        <div class="creator-window wide">
          <div class="creator-step"><span>Step 4</span><strong>選擇性格</strong></div>
          <div class="screen-title"><h2>恐懼逼近時，你會變成什麼樣子？</h2></div>
          <div class="personality-grid">
            ${data.playerPersonalities.map((personality) => {
              const card = core.cardsById[personality.cardId];
              return `<button class="personality-card" data-action="player-personality" data-personality-id="${personality.id}">
                <strong>${escapeHtml(personality.name)}</strong>
                <p>${escapeHtml(personality.text)}</p>
                <small class="sealed-skill-name">${escapeHtml(card.name)}</small>
              </button>`;
            }).join("")}
          </div>
          <div class="creator-actions"><button class="secondary-action" data-action="onboarding-back" data-stage="profession">返回</button></div>
        </div>
      </section>
    `;
  }

  function renderOnboardingConfirm() {
    const draft = state.onboarding?.draft || {};
    const profession = data.playerProfessions.find((item) => item.id === draft.professionId) || data.playerProfessions[0];
    const personality = data.playerPersonalities.find((item) => item.id === draft.personalityId) || data.playerPersonalities[0];
    const gender = draft.gender || "male";
    const cardIds = [...profession.cardIds, personality.cardId];
    return `
      <section class="onboarding-screen creator-screen">
        <div class="creator-window wide confirm-window">
          <div class="creator-step"><span>Step 5</span><strong>確認投放資料</strong></div>
          <div class="confirm-layout">
            <article class="confirm-hero">
              ${image(professionArt(profession.id, gender), `${profession.name}插畫`, "confirm-portrait")}
              <div>
                <span class="eyebrow">${profession.archetype}型 · ${gender === "female" ? "女" : "男"}</span>
                <h2>${escapeHtml(playerDraftName())}</h2>
                <p>${escapeHtml(profession.name)} · ${escapeHtml(personality.name)}</p>
              </div>
            </article>
            <section class="confirm-cards">
              ${cardIds.map((cardId) => renderOnboardingCardPreview(cardId)).join("")}
            </section>
          </div>
          <div class="creator-actions">
            <button class="secondary-action" data-action="onboarding-back" data-stage="personality">返回</button>
            <button class="primary-action" data-action="confirm-player">確認，進入生化危機</button>
          </div>
        </div>
      </section>
    `;
  }

  function renderOnboardingCardPreview(cardId) {
    const card = core.cardsById[cardId];
    return `<article class="skill-card onboarding-skill-card ${card.type}">${renderCardArtFrame(card)}<strong>${escapeHtml(card.name)}</strong><p>${escapeHtml(card.text)}</p></article>`;
  }

  function playerDraftName() {
    return state.onboarding?.draft?.name || state.playerProfile?.name || "無名者";
  }

  function renderStory() {
    const kind = state.pending?.kind;
    const playerName = escapeHtml(state.playerProfile?.name || state.party.find((member) => member.id === "player-avatar")?.name || "你");
    if (kind === "tutorial-choice-1") {
      return renderChoiceScreen("蜂巢岔路", `警報聲越來越近。張杰停下腳步，讓${playerName}決定下一步。`, [
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
          <p>冰冷車廂駛向蜂巢。${playerName}身邊只有強得不可思議的引導者張杰。三場戰鬥之後，真正的輪迴才會開始。</p>
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
        <div class="screen-title"><span class="eyebrow">${scenario.name} · 投放前集結</span><h2>從三人中邀請一人加入</h2><p>被選中的角色會永久加入${escapeHtml(state.teamName || "中洲隊")}。首次進入異形時，另外一人也會跟隨加入。</p></div>
        <div class="recruit-grid">
          ${state.pending.candidates.map((id) => {
            const member = core.charactersById[id];
            return `<button class="recruit-card faction-${member.factionId || "main"}" data-action="recruit" data-character-id="${id}">
              ${image(characterArt(id), `${escapeHtml(member.name)}插畫`, "recruit-art")}
              <span class="faction-badge">${escapeHtml(memberFactionName(member))}</span>
              <span class="energy-badge">${formatEnergy(member.energyContribution)} 能量</span>
              <h3>${escapeHtml(member.name)}</h3><p>${escapeHtml(member.role)}</p><p class="trait">${escapeHtml(member.passiveText)}</p>
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
          ${renderOpeningHeroArt(opening, state.run.scenarioId)}
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
              ${(state.run.openingDiscussion || []).map((line) => `<article class="generated-discussion"><strong>${escapeHtml(line.speaker)}</strong><p>${escapeHtml(line.line)}</p></article>`).join("")}
            </div>
          </section>
          <section class="opening-brief">
            <span class="eyebrow">主神題要</span>
            <h3>生存目標</h3>
            <p>${scenario.intro}</p>
            ${renderDynamicDifficultyPanel()}
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
        ${renderBanterPanel("map")}
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
        <div class="combat-status-bar">
          <div class="combat-status-title">
            <span class="eyebrow">戰術座艙</span>
            <h2>${escapeHtml(encounter.name)}</h2>
            <p>第 ${state.turn} 回合 · ${state.selectedTargetId ? "目標已鎖定" : "等待目標"}</p>
          </div>
          <div class="combat-status-metrics" aria-label="戰鬥資源摘要">
            <div><span>能量</span><strong>${state.energy}<small>/ ${state.maxEnergy}</small></strong></div>
            <div><span>抽牌</span><strong>${state.drawPile.length}</strong></div>
            <div><span>棄牌</span><strong>${state.discardPile.length}</strong></div>
            <div><span>耗盡</span><strong>${state.exhaustedPile.length}</strong></div>
          </div>
          <div class="combat-intent-strip" aria-label="敵人意圖摘要">
            ${state.activeEnemies.map(renderEnemyIntentChip).join("")}
          </div>
        </div>
        <div class="combat-stage">
          <div class="encounter-title"><span class="eyebrow">上下雙排戰場</span><h2>${core.getActiveParty(state).length} 對 ${state.activeEnemies.filter((enemy) => enemy.hp > 0).length}</h2></div>
          <div class="combat-columns">
            <div class="enemy-line">${state.activeEnemies.map(renderEnemy).join("")}</div>
            <div class="party-combat">${core.getActiveParty(state).map(renderCombatCharacter).join("")}</div>
          </div>
        </div>
        ${renderCombatCommandRail()}
        <section class="hand-zone">
          <div class="hand-zone-head">
            <div><span class="eyebrow">戰術卡軌</span><h2>手牌 ${state.hand.length}</h2></div>
            <p>費用、持有人與加成來源會直接標在卡上。</p>
          </div>
          <div class="hand-card-grid">${state.hand.map(renderHandCard).join("")}</div>
        </section>
      </section>
    `;
  }

  function renderCombatCommandRail() {
    const selected = state.activeEnemies.find((enemy) => enemy.uid === state.selectedTargetId && enemy.hp > 0) || state.activeEnemies.find((enemy) => enemy.hp > 0);
    const intent = selected ? core.getEnemyIntent(selected) : null;
    return `
      <aside class="combat-side command-rail">
        <section class="turn-panel command-card">
          <span class="eyebrow">指揮短欄</span>
          <div class="energy-row"><strong>${state.energy}</strong><span>/ ${state.maxEnergy} 能量</span></div>
          <div class="pile-row"><span>抽牌 ${state.drawPile.length}</span><span>棄牌 ${state.discardPile.length}</span><span>耗盡 ${state.exhaustedPile.length}</span></div>
          ${renderDynamicDifficultyPanel("compact")}
          <button class="secondary-action" data-action="end-turn">結束回合</button>
        </section>
        <section class="command-card target-summary">
          <span class="eyebrow">選中敵人</span>
          ${selected ? `
            <strong>${escapeHtml(selected.name)}</strong>
            <div class="target-stats"><span>生命 ${selected.hp}/${selected.maxHp}</span>${selected.block ? `<span>護甲 ${selected.block}</span>` : ""}</div>
            ${renderEnemyStatuses(selected)}
            <div class="intent ${intent.kind}"><strong>${escapeHtml(intent.label)}</strong><span>${escapeHtml(intentText(intent))}</span></div>
          ` : `<p class="empty-state compact">沒有可選目標。</p>`}
        </section>
        ${renderBanterPanel("combat")}
        <details class="combat-detail-drawer">
          <summary>完整戰鬥資料</summary>
          ${renderEffectMatrix("combat")}
          ${renderBondPanel("combat")}
          ${renderLog()}
        </details>
      </aside>
    `;
  }

  function renderBanterPanel(mode = "map") {
    const lines = (state.run?.banterFeed || state.run?.openingDiscussion || []).slice(mode === "combat" ? -3 : -4);
    if (!lines.length) return "";
    return `
      <section class="panel banter-panel ${mode === "combat" ? "compact" : ""}">
        <div class="section-heading"><div><span class="eyebrow">${mode === "combat" ? "戰場通訊" : "隊內討論"}</span><h2>${mode === "combat" ? "最新反應" : "目前判斷"}</h2></div></div>
        <div class="banter-stack">
          ${lines.map((line) => `<article><strong>${escapeHtml(line.speaker)}</strong><p>${escapeHtml(line.line)}</p></article>`).join("")}
        </div>
      </section>
    `;
  }

  function renderDynamicDifficultyPanel(mode = "full") {
    const value = state.run?.dynamicDifficulty;
    if (!value) return "";
    const label = value.mode === "infinite" ? value.label : value.mode === "super-hard" ? value.label : `動態難度 ${formatMultiplier(value.multiplier)}x`;
    const parts = [];
    if (value.progressPressure) parts.push(`進度 +${formatPercent(value.progressPressure)}`);
    if (value.streakPressure) parts.push(`連勝 +${formatPercent(value.streakPressure)}`);
    if (value.relief) parts.push(`失敗補償 -${formatPercent(value.relief)}`);
    if (!parts.length && value.mode === "normal") parts.push("基準難度");
    if (mode === "compact") return `<div class="difficulty-chip"><strong>${escapeHtml(label)}</strong><span>${parts.join(" · ") || "倍率穩定"}</span></div>`;
    return `<div class="difficulty-panel"><span>難度</span><strong>${escapeHtml(label)}</strong><p>${parts.join(" · ") || "沒有額外修正。"}</p></div>`;
  }

  function renderCombatCharacter(member) {
    const signature = core.cardsById[member.signatureCardId];
    const loadout = getMemberLoadout(member);
    return `
      <article class="combat-character faction-${member.factionId || "main"} ${core.isAlive(member) ? "" : "down"}">
        ${image(characterArt(member.id), `${escapeHtml(member.name)}插畫`, "combat-character-art")}
        <div class="combat-character-copy">
          <div class="character-top"><div><span class="faction-inline faction-${member.factionId || "main"}">${escapeHtml(memberFactionName(member))}</span><h3>${escapeHtml(member.name)}</h3><p>${escapeHtml(member.role)} · ${formatEnergy(member.energyContribution)} 能量</p></div>${member.block ? `<span class="block-badge">${member.block}</span>` : ""}</div>
          ${renderMeter("生命", member.hp, member.maxHp, "hp")}
          ${renderMeter("壓力", member.stress, 100, "stress")}
          ${renderModifierChips("character", { member, loadout, signature })}
          ${renderCharacterStatuses(member)}
        </div>
      </article>
    `;
  }

  function renderEnemyIntentChip(enemy) {
    const intent = core.getEnemyIntent(enemy);
    const selected = state.selectedTargetId === enemy.uid;
    return `<button class="intent-chip ${intent.kind} ${selected ? "selected" : ""}" data-action="select-target" data-enemy-id="${enemy.uid}" ${enemy.hp <= 0 ? "disabled" : ""}>
      <span>${selected ? "目標鎖定" : "敵方意圖"}</span><strong>${escapeHtml(enemy.name)}</strong><em>${escapeHtml(intent.label)}</em>
    </button>`;
  }

  function renderEnemy(enemy) {
    const intent = core.getEnemyIntent(enemy);
    const selected = state.selectedTargetId === enemy.uid;
    return `
      <button class="enemy-unit ${selected ? "selected" : ""} ${enemy.hp <= 0 ? "down" : ""}" data-action="select-target" data-enemy-id="${enemy.uid}" ${enemy.hp <= 0 ? "disabled" : ""}>
        ${image(enemyArt(enemy.enemyId), `${enemy.name}插畫`, "enemy-art")}
        <div class="enemy-copy"><div class="enemy-headline"><h3>${escapeHtml(enemy.name)}</h3>${selected ? `<span class="target-lock">目標鎖定</span>` : ""}</div>${renderMeter("生命", enemy.hp, enemy.maxHp, "hp")}${enemy.block ? `<span class="stat-pill">護甲 ${enemy.block}</span>` : ""}${renderEnemyStatuses(enemy)}<div class="intent ${intent.kind}"><strong>${escapeHtml(intent.label)}</strong><span>${escapeHtml(intentText(intent))}</span></div></div>
      </button>
    `;
  }

  function renderHandCard(instance) {
    const card = core.effectiveCard(instance);
    const cost = core.getCardCost(state, instance);
    const disabledReason = getCardDisabledReason(instance, card, cost);
    const disabled = Boolean(disabledReason);
    const owner = instance.ownerId ? core.charactersById[instance.ownerId] : null;
    const bloodline = owner ? core.bloodlinesByCharacterId[owner.id] : null;
    const bloodlineUnlocked = Boolean(bloodline && (bloodline.tutorialOnly || state.permanentUpgrades.bloodlines.includes(owner.id)));
    return `
      <button class="skill-card ${card.type} ${card.rarity} rarity-${cardRarityTier(card)}" data-action="play-card" data-card-uid="${instance.uid}" ${disabled ? "disabled" : ""}>
        ${renderCardArtFrame(card)}
        <span class="cost">${card.unplayable ? "!" : cost}</span><strong>${card.name}</strong>
        <span class="card-type">${cardRarityLabel(card)} · ${cardTypeLabel(card)}${owner ? ` · ${owner.name}專屬` : ""}</span>
        ${renderModifierChips("card", { instance, card, cost, owner, bloodline, bloodlineUnlocked })}
        <p>${card.text}</p>${bloodlineUnlocked ? `<p class="card-bloodline">血統附加：${bloodline.text}</p>` : ""}${disabledReason ? `<span class="disabled-reason">${escapeHtml(disabledReason)}</span>` : ""}<span class="tags">${card.tags.join(" / ")}</span>
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
    const ownership = cardOwnershipState(card.id);
    return `
      <button class="skill-card reward-card ${card.type} ${card.rarity} rarity-${cardRarityTier(card)} ownership-${ownership.status}" data-action="combat-reward" data-reward-id="${card.id}">
        ${renderCardArtFrame(card)}<span class="cost">${card.cost}</span><strong>${card.name}</strong>
        <span class="card-type">${cardRarityLabel(card)} · ${cardTypeLabel(card)}</span>
        ${ownership.status === "upgrade" ? `<span class="ownership-chip upgrade-ready">選擇後強化+</span>` : ""}
        <p>${card.text}</p><span class="tags">${card.tags.join(" / ")}</span>
      </button>
    `;
  }

  function renderBossReward() {
    return `
      <section class="reward-layout">
        <div class="screen-title"><span class="eyebrow">Boss 戰利品</span><h2>從三項稀有戰利品中選擇一項</h2></div>
        <div class="choice-grid">${state.rewardChoices.map(renderBossRewardChoice).join("")}</div>
      </section>
    `;
  }

  function renderBossRewardChoice(reward) {
    if (reward.kind === "card") {
      const card = core.cardsById[reward.itemId];
      const ownership = cardOwnershipState(card.id);
      return `<button class="loot-card boss-card-reward rarity-${cardRarityTier(card)} ownership-${ownership.status}" data-action="boss-reward" data-reward-id="${reward.id}">${renderCardArtFrame(card, "loot-art")}<span class="eyebrow">${rewardKindLabel(reward.kind)} · ${cardRarityLabel(card)}</span><strong>${reward.name}</strong>${ownership.status === "upgrade" ? `<span class="ownership-chip upgrade-ready">領取後強化+</span>` : ""}<p>${reward.text}</p></button>`;
    }
    return `<button class="loot-card" data-action="boss-reward" data-reward-id="${reward.id}">${image(reward.kind === "equipment" ? equipmentArt(reward.itemId) : "./src/assets/generated/reward-upgrade-token.png", "", "loot-art")}<span class="eyebrow">${rewardKindLabel(reward.kind)}</span><strong>${reward.name}</strong><p>${reward.text}</p></button>`;
  }

  function renderTreasure() {
    const choices = state.pending?.choices || [];
    return `
      <section class="reward-layout">
        <div class="screen-title"><span class="eyebrow">寶箱</span><h2>封存物資</h2><p>選擇一件裝備。裝備不進牌組，每名角色只能攜帶一件。</p></div>
        <div class="choice-grid">
          ${choices.map((item) => renderEquipmentChoice(item, "treasure")).join("")}
          ${choices.length === 0 ? `<button class="loot-card" data-action="treasure" data-reward-id="salvage">${image("./src/assets/generated/reward-salvage-cache.png", "", "loot-art")}<span class="eyebrow">替代獎勵</span><strong>回收裝備殘件</strong><p>所有唯一裝備均已持有，改為獲得 ${data.economy?.treasureSalvageReward || 700} 獎勵點。</p></button>` : ""}
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
    const hidden = state.pending?.hiddenProtagonistId ? core.charactersById[state.pending.hiddenProtagonistId] : null;
    const scenario = state.pending?.scenarioId ? core.scenariosById[state.pending.scenarioId] : null;
    const stage = state.pending?.stage || 1;
    const choices = state.pending?.choices || [];
    const path = state.pending?.path || [];
    const stageTitle = { 1: "介入", 2: "深入", 3: "定局" }[stage] || "奇遇";
    return `
      <section class="choice-screen">
        <div class="screen-title">
          <span class="eyebrow">${scenario?.name || "輪迴"} · 奇遇 · ${stageTitle} ${stage}/3</span>
          <h2>${scenario?.eventTitle || "黑暗中的回應"}</h2>
          <p>${eventStageText(stage, scenario, candidate, hidden, path)}</p>
        </div>
        ${hidden ? `<div class="event-signal">${image(characterArt(hidden.id), `${escapeHtml(hidden.name)}插畫`, "event-signal-art")}<div><span class="eyebrow">劇本深層訊號</span><strong>${escapeHtml(hidden.name)}</strong><p>${escapeHtml(hidden.role)}的命運線正在附近偏移。</p></div></div>` : ""}
        <div class="choice-grid">
          ${choices.map((choice) => `<button class="choice-card" data-action="event" data-option-id="${choice.id}"><strong>${escapeHtml(choice.title)}</strong><p>${escapeHtml(choice.text)}</p></button>`).join("")}
        </div>
      </section>
    `;
  }

  function eventStageText(stage, scenario, candidate, hidden, path) {
    if (stage === 1) return scenario?.eventText || "訊號時有時無。每一個選擇都可能在之後索取代價。";
    if (stage === 2) return `${hidden ? hidden.name : candidate?.name || "某個劇本人物"}的命運線開始靠近隊伍。第一步已經不可撤回，下一步會決定你們要承擔哪一種代價。`;
    const prior = path.length ? "前兩步選擇已經把劇本推離原本軌道。" : "";
    return `${prior}最後一次行動會導向完全不同的結尾：可能是傳說加入、劇本強化、技能裝備，也可能是半血、壓力爆發或詛咒。`;
  }

  function renderEventResult() {
    const result = state.pending?.result || {};
    const rewards = result.rewards || [];
    const costs = result.costs || [];
    const storyImpact = result.storyImpact || "命運線已經偏移。";
    return `
      <section class="choice-screen event-result-screen">
        <div class="screen-title">
          <span class="eyebrow">奇遇結局</span>
          <h2>${escapeHtml(result.title || "劇本偏移完成")}</h2>
          <p>${escapeHtml(result.text || "主神記錄了這次選擇，遠征路線重新穩定。")}</p>
        </div>
        <div class="choice-grid">
          <article class="choice-card"><strong>獎勵</strong>${renderResultList(rewards)}</article>
          <article class="choice-card danger"><strong>代價</strong>${renderResultList(costs)}</article>
          <article class="choice-card"><strong>劇情影響</strong><p>${escapeHtml(storyImpact)}</p></article>
        </div>
        <button class="primary-action" data-action="continue-event-result">確認後果，返回路線圖</button>
      </section>
    `;
  }

  function renderResultList(items) {
    return items.length ? `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : "<p>無</p>";
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
        <section class="panel"><h3>升級專屬牌或裝備</h3><div class="compact-grid">${unupgradedSignatures.map((member) => `<button class="compact-choice" data-action="camp" data-camp-action="upgrade-signature" data-target-id="${member.id}">${escapeHtml(member.name)} · ${escapeHtml(core.cardsById[member.signatureCardId].name)}+</button>`).join("")}${unupgradedEquipment.map((entry) => `<button class="compact-choice" data-action="camp" data-camp-action="upgrade-equipment" data-target-id="${entry.instanceId}">${escapeHtml(core.equipmentById[entry.equipmentId].name)}+</button>`).join("")}</div></section>
        ${renderEquipmentManagement()}
      </section>
    `;
  }

  function renderHub() {
    const tab = state.hubTab || "deployment";
    const teamName = escapeHtml(state.teamName || "中洲隊");
    return `
      <section class="hub-layout">
        <section class="hub-command">
          <div class="hub-command-copy">
            <span class="eyebrow">輪迴者整備中樞</span>
            <h2>${teamName}</h2>
            <p>主神空間已開放改名權限，隊伍代號會顯示在部署與名冊中。</p>
            <div class="team-rename">
              <input id="team-name-input" type="text" maxlength="16" value="${teamName}" aria-label="隊伍名稱" />
              <button data-action="rename-team">改名</button>
            </div>
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
          ${renderHubTab("growth", "自創強化", "六維、標籤與變異", tab)}
          ${renderHubTab("shop", "強化商店", "永久強化與兌換", tab)}
        </nav>
        <section class="hub-workspace">${tab === "roster" ? renderRosterHub() : tab === "growth" ? renderGrowthHub() : tab === "shop" ? renderShopHub() : renderDeploymentHub()}</section>
        <details class="hub-detail-drawer">
          <summary>作戰中樞與加成來源</summary>
          ${renderEffectMatrix("hub")}
        </details>
      </section>
    `;
  }

  function renderHubTab(id, title, subtitle, activeTab) {
    return `<button class="hub-tab ${activeTab === id ? "active" : ""}" role="tab" aria-selected="${activeTab === id}" data-action="hub-tab" data-tab-id="${id}"><strong>${title}</strong><span>${subtitle}</span></button>`;
  }

  function renderGrowthHub() {
    const growth = state.playerGrowth || {};
    const player = state.party.find((member) => member.id === "player-avatar");
    const purchasedTags = (growth.purchasedTags || []).map((id) => core.customTagsById[id]).filter(Boolean);
    const offers = (growth.tagOffers || []).map((id) => core.customTagsById[id]).filter(Boolean);
    const mutations = (growth.mutations || []).map((id) => core.customMutationsById[id]).filter(Boolean);
    const activeMutation = core.customMutationsById[growth.activeMutationId] || null;
    const activeTagIds = Array.isArray(growth.activeTagIds) ? growth.activeTagIds : [];
    const activeTags = activeTagIds.map((id) => core.customTagsById[id]).filter(Boolean);
    const supportEquipmentIds = Array.isArray(growth.supportEquipmentIds) ? growth.supportEquipmentIds.filter(Boolean) : [];
    const branchName = activeMutation?.name || activeTags[0]?.name || mutations.at(-1)?.name || purchasedTags.at(-1)?.name || "未植入血統";
    return `
      <section class="growth-console">
        <aside class="growth-identity-panel">
          ${image(customGrowthArt(), `${escapeHtml(player?.name || "自創輪迴者")}強化形態`, "growth-portrait")}
          <div class="growth-identity-copy">
            <span class="eyebrow">自創輪迴者</span>
            <h2>${escapeHtml(player?.name || state.playerProfile?.name || "無名者")}</h2>
            <p>${escapeHtml(player?.role || "自創輪迴者")} · ${escapeHtml(branchName)}</p>
          </div>
          <div class="growth-summary-grid">
            <div><span>已購標籤</span><strong>${purchasedTags.length}</strong></div>
            <div><span>生效血統</span><strong>${activeTags.length}<small>/2</small></strong></div>
            <div><span>變異槽</span><strong>${activeMutation ? 1 : 0}<small>/1</small></strong></div>
            <div><span>支援裝備</span><strong>${supportEquipmentIds.length}<small>/2</small></strong></div>
          </div>
        </aside>
        <section class="growth-main-stack">
          ${renderGrowthSupportPanel(purchasedTags, mutations)}
          <section class="panel growth-stat-panel">
            <div class="section-heading"><div><span class="eyebrow">RPG 六維</span><h2>獎勵點數強化</h2></div><p>每 +1 消耗 ${data.economy?.customStatPointCost || 1000} 點；每 100 點解鎖一階被動。</p></div>
            <div class="growth-stat-grid">${data.customStats.map(renderGrowthStat).join("")}</div>
          </section>
          <section class="panel growth-offer-panel">
            <div class="section-heading"><div><span class="eyebrow">主神候選池</span><h2>本輪標籤</h2></div><p>${state.rewardPoints} 獎勵點 · ${state.sideStories} 支線 · ${data.customTags.length} 個標籤，${data.customMutations.length} 條變異配方</p></div>
            <div class="growth-tag-grid">${offers.map((tag) => renderCustomTagCard(tag, "offer")).join("") || "<p class=\"empty-state\">所有標籤都已植入。</p>"}</div>
            <button class="secondary-action growth-reroll" data-action="reroll-custom-tags" ${state.rewardPoints < Number(data.economy?.customTagRefreshCost || 300) ? "disabled" : ""}>刷新候選 · ${data.economy?.customTagRefreshCost || 300} 點</button>
          </section>
          <section class="growth-library-row">
            <section class="panel">
              <div class="section-heading"><div><span class="eyebrow">已植入</span><h2>標籤矩陣</h2></div></div>
              <div class="growth-owned-list">${purchasedTags.map((tag) => renderCustomTagCard(tag, "owned")).join("") || "<p class=\"empty-state\">尚未購買任何標籤。</p>"}</div>
            </section>
            <section class="panel">
              <div class="section-heading"><div><span class="eyebrow">自動變異</span><h2>組合效果</h2></div></div>
              <div class="growth-mutation-list">${mutations.map(renderCustomMutation).join("") || "<p class=\"empty-state\">湊齊指定標籤後，變異會自動啟動。</p>"}</div>
            </section>
          </section>
        </section>
      </section>
      ${renderLog()}
    `;
  }

  function renderGrowthStat(stat) {
    const value = Number(state.playerGrowth?.stats?.[stat.id] || 0);
    const tier = Math.floor(value / 100);
    const next = Math.ceil((value + 1) / 100) * 100;
    const progress = Math.min(100, value % 100);
    const pointCost = Number(data.economy?.customStatPointCost || 1000);
    const canBuyOne = state.rewardPoints >= pointCost;
    const canBuyTen = state.rewardPoints >= pointCost * 10;
    return `
      <article class="growth-stat-card">
        <div class="growth-stat-head"><span>${escapeHtml(stat.shortName)}</span><strong>${escapeHtml(stat.name)}</strong><em>${value}</em></div>
        <div class="growth-stat-track"><span style="width:${progress}%"></span></div>
        <p>${escapeHtml(stat.text)}</p>
        <small>目前 ${tier} 階 · 下一檻 ${next}</small>
        <div class="growth-stat-actions">
          <button data-action="buy-custom-stat" data-stat-id="${stat.id}" data-amount="1" ${canBuyOne ? "" : "disabled"}>+1</button>
          <button data-action="buy-custom-stat" data-stat-id="${stat.id}" data-amount="10" ${canBuyTen ? "" : "disabled"}>+10</button>
        </div>
      </article>
    `;
  }

  function renderGrowthSupportPanel(purchasedTags, mutations) {
    const growth = state.playerGrowth || {};
    const activeTagIds = Array.isArray(growth.activeTagIds) ? growth.activeTagIds : [];
    const activeTags = [0, 1].map((index) => core.customTagsById[activeTagIds[index]] || null);
    const supportEquipmentIds = Array.isArray(growth.supportEquipmentIds) ? [0, 1].map((index) => growth.supportEquipmentIds[index] || "") : ["", ""];
    const activeMutation = core.customMutationsById[growth.activeMutationId] || null;
    return `
      <section class="panel growth-support-panel">
        <div class="section-heading"><div><span class="eyebrow">第 7 人支援</span><h2>血統與裝備槽</h2></div><p>每場戰鬥只啟用 1 個變異、2 個一般血統與 2 件支援裝備。</p></div>
        ${renderGrowthActiveLoadout(activeMutation, activeTags, supportEquipmentIds)}
        <div class="growth-support-grid support-picker-grid">
          <article class="support-picker-panel">
            <div class="support-picker-head"><strong>變異血統</strong><span>1/1</span></div>
            ${renderMutationPicker(mutations, growth.activeMutationId)}
          </article>
          ${[0, 1].map((index) => `<article class="support-picker-panel">
            <div class="support-picker-head"><strong>一般血統 ${index + 1}</strong><span>${activeTagIds[index] ? "已啟用" : "空槽"}</span></div>
            ${renderTagSlotPicker(purchasedTags, index, activeTagIds)}
          </article>`).join("")}
          ${[0, 1].map((index) => `<article class="support-picker-panel">
            <div class="support-picker-head"><strong>支援裝備 ${index + 1}</strong><span>${supportEquipmentIds[index] ? "已裝備" : "空槽"}</span></div>
            ${renderSupportEquipmentPicker(index, supportEquipmentIds)}
          </article>`).join("")}
        </div>
      </section>
    `;
  }

  function renderGrowthActiveLoadout(activeMutation, activeTags, supportEquipmentIds) {
    const slots = [
      {
        type: "變異血統",
        title: activeMutation?.name || "未配置",
        text: activeMutation?.text || "尚未啟動變異血統；第 7 人維持基礎支援形態。",
        art: activeMutation?.art || customGrowthArt()
      },
      ...[0, 1].map((index) => {
        const tag = activeTags[index];
        return {
          type: `一般血統 ${index + 1}`,
          title: tag?.name || "未配置",
          text: tag?.text || "選擇已植入血統，讓隊伍得到更明確的成長方向。",
          art: tag?.art || "./src/assets/generated/source-cover-main-god.png"
        };
      }),
      ...[0, 1].map((index) => {
        const entry = state.equipmentInventory.find((item) => item.instanceId === supportEquipmentIds[index]);
        const item = entry ? core.equipmentById[entry.equipmentId] : null;
        return {
          type: `支援裝備 ${index + 1}`,
          title: item ? `${item.name}${entry.upgraded ? "+" : ""}` : "未配置",
          text: item ? equipmentEffectLabel(item, entry) : "支援裝備會掛在自創角色身上，提供隊伍效果但不佔前排。",
          art: item ? equipmentArt(item.id) : "./src/assets/generated/reward-salvage-cache.png"
        };
      })
    ];
    return `<div class="growth-active-loadout">
      ${slots.map((slot) => `<article class="support-slot-card ${slot.title === "未配置" ? "empty" : ""}">
        ${image(slot.art, `${escapeHtml(slot.type)}插畫`, "support-slot-art")}
        <div><span>${escapeHtml(slot.type)}</span><strong>${escapeHtml(slot.title)}</strong><p>${escapeHtml(slot.text)}</p></div>
      </article>`).join("")}
    </div>`;
  }

  function renderMutationPicker(mutations, activeMutationId) {
    return `<div class="support-pick-list">
      <button class="support-pick-card empty ${activeMutationId ? "" : "selected"}" data-action="set-custom-mutation" data-mutation-id="">
        <span class="support-pick-art placeholder">空</span><strong>未配置變異血統</strong><p>保留目前形態。</p>
      </button>
      ${mutations.map((mutation) => {
        const selected = mutation.id === activeMutationId;
        return `<button class="support-pick-card ${selected ? "selected" : ""}" data-action="set-custom-mutation" data-mutation-id="${selected ? "" : escapeHtml(mutation.id)}">
          ${image(mutation.art || customGrowthArt(), `${escapeHtml(mutation.name)}插畫`, "support-pick-art")}
          <strong>${escapeHtml(mutation.name)}</strong><p>${escapeHtml(mutation.text)}</p>
        </button>`;
      }).join("") || `<p class="empty-state compact">湊齊標籤後會出現變異選項。</p>`}
    </div>`;
  }

  function renderTagSlotPicker(purchasedTags, slotIndex, activeTagIds) {
    const activeTagId = activeTagIds[slotIndex] || "";
    return `<div class="support-pick-list">
      <button class="support-pick-card empty ${activeTagId ? "" : "selected"}" data-action="set-custom-tag-slot" data-slot-index="${slotIndex}" data-tag-id="">
        <span class="support-pick-art placeholder">空</span><strong>未配置一般血統</strong><p>留一個槽位等待下一輪成長。</p>
      </button>
      ${purchasedTags.map((tag) => {
        const selected = tag.id === activeTagId;
        const duplicate = activeTagIds.includes(tag.id) && !selected;
        return `<button class="support-pick-card ${selected ? "selected" : ""}" data-action="set-custom-tag-slot" data-slot-index="${slotIndex}" data-tag-id="${selected ? "" : escapeHtml(tag.id)}" ${duplicate ? "disabled" : ""}>
          ${image(tag.art || "./src/assets/generated/source-cover-main-god.png", `${escapeHtml(tag.name)}插畫`, "support-pick-art")}
          <strong>${escapeHtml(tag.name)}</strong><p>${escapeHtml(tag.text)}</p>
          <span>${duplicate ? "已在另一槽" : `${escapeHtml(tag.family)} · ${escapeHtml(tag.tier || "B")}級`}</span>
        </button>`;
      }).join("") || `<p class="empty-state compact">尚未植入一般血統。</p>`}
    </div>`;
  }

  function renderSupportEquipmentPicker(slotIndex, supportEquipmentIds) {
    const activeInstanceId = supportEquipmentIds[slotIndex] || "";
    return `<div class="support-pick-list">
      <button class="support-pick-card empty ${activeInstanceId ? "" : "selected"}" data-action="set-custom-support-equipment" data-slot-index="${slotIndex}" data-equipment-instance-id="">
        <span class="support-pick-art placeholder">空</span><strong>未配置支援裝備</strong><p>不掛載額外裝備。</p>
      </button>
      ${state.equipmentInventory.map((entry) => {
        const item = core.equipmentById[entry.equipmentId];
        const selected = entry.instanceId === activeInstanceId;
        const duplicate = supportEquipmentIds.includes(entry.instanceId) && !selected;
        const holder = getEquipmentHolder(entry.instanceId);
        const supportSlot = getSupportEquipmentSlot(entry.instanceId);
        const stateText = holder ? `${holder.name}持有中` : duplicate ? `已在支援槽 ${supportSlot + 1}` : equipmentEffectLabel(item, entry);
        return `<button class="support-pick-card ${selected ? "selected" : ""}" data-action="set-custom-support-equipment" data-slot-index="${slotIndex}" data-equipment-instance-id="${selected ? "" : escapeHtml(entry.instanceId)}" ${duplicate ? "disabled" : ""}>
          ${image(equipmentArt(item.id), `${escapeHtml(item.name)}插畫`, "support-pick-art")}
          <strong>${escapeHtml(item.name)}${entry.upgraded ? "+" : ""}</strong><p>${escapeHtml(item.text)}</p>
          <span>${escapeHtml(stateText)}</span>
        </button>`;
      }).join("") || `<p class="empty-state compact">目前沒有可用裝備。</p>`}
    </div>`;
  }

  function renderMutationOptions(mutations, activeMutationId) {
    return [
      `<option value="" ${activeMutationId ? "" : "selected"}>未配置變異血統</option>`,
      ...mutations.map((mutation) => `<option value="${escapeHtml(mutation.id)}" ${mutation.id === activeMutationId ? "selected" : ""}>${escapeHtml(mutation.name)}</option>`)
    ].join("");
  }

  function renderCustomTagOptions(purchasedTags, activeTagId, activeTagIds) {
    return [
      `<option value="" ${activeTagId ? "" : "selected"}>未配置一般血統</option>`,
      ...purchasedTags.map((tag) => {
        const selected = tag.id === activeTagId;
        const duplicate = activeTagIds.includes(tag.id) && !selected;
        return `<option value="${escapeHtml(tag.id)}" ${selected ? "selected" : ""} ${duplicate ? "disabled" : ""}>${escapeHtml(tag.name)}</option>`;
      })
    ].join("");
  }

  function renderSupportEquipmentOptions(activeInstanceId, supportEquipmentIds) {
    return [
      `<option value="" ${activeInstanceId ? "" : "selected"}>未配置支援裝備</option>`,
      ...state.equipmentInventory.map((entry) => {
        const item = core.equipmentById[entry.equipmentId];
        const selected = entry.instanceId === activeInstanceId;
        const duplicate = supportEquipmentIds.includes(entry.instanceId) && !selected;
        const holder = getEquipmentHolder(entry.instanceId);
        const supportSlot = getSupportEquipmentSlot(entry.instanceId);
        const suffix = holder ? ` · ${holder.name}持有` : supportSlot >= 0 && !selected ? ` · 支援槽${supportSlot + 1}` : "";
        return `<option value="${escapeHtml(entry.instanceId)}" ${selected ? "selected" : ""} ${duplicate ? "disabled" : ""}>${escapeHtml(item.name)}${entry.upgraded ? "+" : ""}${escapeHtml(suffix)}</option>`;
      })
    ].join("");
  }

  function renderCustomTagCard(tag, mode) {
    const owned = mode === "owned";
    const cost = core.customTagCost(tag);
    const costText = formatCustomTagCost(cost);
    const canBuy = state.rewardPoints >= cost.rewardPointCost && state.sideStories >= cost.sideStoryCost;
    return `
      <article class="growth-tag-card tier-${escapeHtml(String(tag.tier || "B").toLowerCase())}">
        ${image(tag.art || "./src/assets/generated/source-cover-main-god.png", `${tag.name}插畫`, "growth-tag-art")}
        <div>
          <span class="eyebrow">${escapeHtml(tag.family)} · ${escapeHtml(tag.tier || "B")}級</span>
          <h3>${escapeHtml(tag.name)}</h3>
          <p>${escapeHtml(tag.text)}</p>
          ${owned ? `<span class="ownership-chip max">已植入</span>` : `<button data-action="buy-custom-tag" data-tag-id="${tag.id}" ${canBuy ? "" : "disabled"}>植入 · ${costText}</button>`}
        </div>
      </article>
    `;
  }

  function formatCustomTagCost(cost) {
    return [
      cost.rewardPointCost ? `${cost.rewardPointCost} 點` : "",
      cost.sideStoryCost ? `${cost.sideStoryCost} 支線` : ""
    ].filter(Boolean).join(" / ") || "免費";
  }

  function renderCustomMutation(mutation) {
    const required = (mutation.requiredTags || []).map((id) => core.customTagsById[id]?.name || id).join(" + ");
    return `
      <article class="growth-mutation-card">
        ${image(mutation.art || "./src/assets/generated/source-cover-main-god.png", `${mutation.name}插畫`, "growth-mutation-art")}
        <div><span class="eyebrow">${escapeHtml(required)}</span><strong>${escapeHtml(mutation.name)}</strong><p>${escapeHtml(mutation.text)}</p></div>
      </article>
    `;
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
        ${renderCardShopSections(cardEntries)}
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
    return `<div class="shop-cover-grid">${sections}${unknownEntries.length ? renderCardShopSection({ id: "other", name: "其他來源", description: "尚未歸類的卡牌。" }, unknownEntries) : ""}</div>`;
  }

  function renderCardShopSection(source, entries) {
    if (!entries.length) return "";
    const status = sourceCardStatus(entries);
    return `
      <details class="shop-cover-section">
        <summary class="source-cover-card">
          ${image(sourceCoverArt(source.id), "", "source-cover-art")}
          <span class="source-cover-shade"></span>
          <span class="source-cover-copy"><span class="eyebrow">技能來源</span><strong>${source.name}</strong><small>${source.description || ""}</small><em>${status}</em></span>
        </summary>
        <div class="shop-drawer">
          <div class="subsection-heading"><strong>${source.name}</strong><span>${status}</span></div>
          <div class="shop-grid shop-section-grid">${entries.map(renderShopItem).join("")}</div>
        </div>
      </details>
    `;
  }

  function sourceCardStatus(entries) {
    const owned = entries.filter((entry) => cardOwnershipState(entry.itemId).status !== "new").length;
    const upgradable = entries.filter((entry) => cardOwnershipState(entry.itemId).status === "upgrade").length;
    const maxed = entries.filter((entry) => cardOwnershipState(entry.itemId).status === "max").length;
    return `${entries.length} 張 · 已有 ${owned} · 可強化 ${upgradable} · 最高級 ${maxed}`;
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
    const artSrc = scenarioArt(id) || (bossEnemyId ? enemyArt(bossEnemyId) : "");
    const superHard = core.isSuperHardScenario?.(scenario);
    return `<button class="scenario-card ${superHard ? "super-hard" : ""}" data-action="begin-scenario" data-scenario-id="${id}">${artSrc ? image(artSrc, "", "scenario-art") : ""}<span class="eyebrow">${superHard ? "超困難劇本" : complete ? "已通關 · 可重玩" : "主線劇本"}</span><strong>${scenario.name}</strong><p>${scenario.subtitle}</p></button>`;
  }

  function renderRandomScenarioButton() {
    const pool = core.randomNormalScenarioPool(state);
    const preview = core.dynamicDifficultyPreview(state);
    const recentNames = (preview.recent || []).map((id) => core.scenariosById[id]?.name).filter(Boolean);
    const sample = pool.slice(0, 4).map((scenario) => scenario.name).join(" / ");
    return `
      <button class="scenario-card random-normal" data-action="begin-scenario" data-scenario-id="random-normal" ${pool.length ? "" : "disabled"}>
        ${image("./src/assets/generated/ui-main-god-nexus.png", "", "scenario-art")}
        <span class="eyebrow">普通劇本 · 隨機抽取</span>
        <strong>下一場隨機劇本</strong>
        <p>${pool.length ? `抽選池 ${pool.length} 場${sample ? ` · ${sample}` : ""}` : "尚未開放普通劇本"}</p>
        <div class="scenario-meta-grid">
          <span>預估 ${formatMultiplier(preview.multiplier)}x</span>
          <span>${recentNames.length ? `避開 ${recentNames.join("、")}` : "無最近排除"}</span>
        </div>
      </button>
    `;
  }

  function renderDeploymentHub() {
    const active = core.getActiveParty(state);
    const reserve = combatMembers().filter((member) => !member.active);
    const superHardScenarios = state.campaign.unlockedScenarios.filter((id) => core.isSuperHardScenario?.(core.scenariosById[id]));
    return `
      <section class="scenario-panel deployment-scenarios">
        <div class="section-heading"><div><span class="eyebrow">劇本出擊</span><h2>整備後隨機投放</h2></div><p>普通劇本由主神抽取；超困難與無限遠征保留手動入口。</p></div>
        <div class="scenario-grid">
          ${renderRandomScenarioButton()}
          ${superHardScenarios.map((id) => renderScenarioButton(id)).join("")}
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
    const roster = combatMembers();
    return `
      <section class="roster-overview">
        <div><span>已招募</span><strong>${roster.length}</strong></div>
        <div><span>出戰中</span><strong>${core.getActiveParty(state).length}</strong></div>
        <div><span>角色強化</span><strong>${upgraded}</strong></div>
        <div><span>專屬牌升級</span><strong>${state.permanentUpgrades.signatures.length}</strong></div>
        <div><span>血統解放</span><strong>${state.permanentUpgrades.bloodlines.length}</strong></div>
      </section>
      <section class="main-god-console roster-console">
        <section class="panel browser-column">
          <div class="section-heading"><div><span class="eyebrow">角色名冊</span><h2>按隊伍與原作來源整備</h2></div><p>展開 hero shot 分類後即可升級角色、專屬牌與血統。</p></div>
          ${renderCharacterBrowser(roster, "roster")}
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
    if (mode === "roster") return renderRosterSourceBrowser(members);
    return `<div class="management-group-list">${groupMembersByFaction(members).map((group) => `
      <details class="management-group faction-${group.id}">
        <summary><span><strong>${group.name}</strong><small>${group.members.length} 名角色 · ${group.activeCount} 名出戰</small></span><em>${formatEnergy(group.energy)} 能量</em></summary>
        <div class="compact-character-list">${group.members.map((member) => renderManagementCharacter(member, mode)).join("")}</div>
      </details>
    `).join("")}</div>`;
  }

  function renderRosterSourceBrowser(members) {
    const groups = groupMembersByRosterSource(members);
    return `<div class="roster-source-grid">${groups.map((group) => `
      <details class="roster-source-section faction-${group.factionId || group.id}">
        <summary class="roster-source-hero">
          ${image(rosterHeroArt(group), "", "roster-source-art")}
          <span class="roster-source-shade"></span>
          <span class="roster-source-copy"><span class="eyebrow">角色整備</span><strong>${group.name}</strong><small>${group.description || ""}</small><em>${group.members.length} 名 · 出戰 ${group.activeCount} · 能量 ${formatEnergy(group.energy)}</em></span>
        </summary>
        <div class="roster-source-drawer">
          <div class="subsection-heading"><strong>${group.name}</strong><span>${group.members.length} 名角色 · ${group.activeCount} 名出戰</span></div>
          <div class="roster-character-grid">${group.members.map((member) => renderManagementCharacter(member, "roster", group)).join("")}</div>
        </div>
      </details>
    `).join("")}</div>`;
  }

  function renderManagementCharacter(member, mode, rosterSource = null) {
    const signature = core.cardsById[member.signatureCardId];
    const level = Number(state.permanentUpgrades.characters[member.id] || 0);
    const signatureUpgraded = state.permanentUpgrades.signatures.includes(member.id);
    const bloodline = core.bloodlinesByCharacterId[member.id];
    const bloodlineUnlocked = Boolean(bloodline && (bloodline.tutorialOnly || state.permanentUpgrades.bloodlines.includes(member.id)));
    const canUpgradeBloodline = bloodline && !bloodline.tutorialOnly && canAffordUpgradeCost(bloodline);
    const energy = member.energyContribution + (member.passiveId === "low-health-energy" && member.hp <= member.maxHp / 2 ? 1 : 0);
    const loadout = getMemberLoadout(member);
    const factionLabel = mode === "roster" && rosterSource ? rosterSource.name : memberFactionName(member);
    const sourceSuffix = mode === "roster" && rosterSource && member.faction && member.faction !== factionLabel && (member.factionId || "main") !== "main" ? ` · ${escapeHtml(member.faction)}` : "";
    return `
      <article class="mini-character-card faction-${member.factionId || "main"} ${member.active ? "active-member" : "reserve-member"}">
        ${image(characterArt(member.id), `${escapeHtml(member.name)}`, "mini-character-art")}
        <div class="mini-character-copy">
          <div class="mini-character-head">
            <div><span class="faction-inline faction-${member.factionId || "main"}">${escapeHtml(factionLabel)}</span><h3>${escapeHtml(member.name)}</h3><p>${escapeHtml(member.role)}${sourceSuffix}</p></div>
            <span class="energy-badge">${formatEnergy(energy)}</span>
          </div>
          <div class="mini-stat-row"><span>HP ${member.hp}/${member.maxHp}</span><span>壓力 ${member.stress}</span><span>Lv.${level}</span></div>
          <div class="loadout-chip">${loadout.item ? `${loadout.item.name}${loadout.entry.upgraded ? "+" : ""}` : "未裝備"}</div>
          ${renderModifierChips("character", { member, loadout, signature, bloodline, bloodlineUnlocked })}
          ${renderSignaturePreview(member, signatureUpgraded, bloodline, bloodlineUnlocked)}
          <details class="mini-details">
            <summary>能力詳情</summary>
            <p>${escapeHtml(member.passiveText)}</p>
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

  function renderSignaturePreview(member, signatureUpgraded, bloodline, bloodlineUnlocked) {
    const base = core.cardsById[member.signatureCardId];
    const current = core.effectiveCard({ cardId: member.signatureCardId, upgraded: signatureUpgraded });
    const upgraded = base?.upgrade ? core.effectiveCard({ cardId: member.signatureCardId, upgraded: true }) : null;
    if (!base || !current) return "";
    const upgradeText = !signatureUpgraded && upgraded ? cardUpgradePreview(base, upgraded) : "";
    return `
      <article class="signature-preview">
        <div class="signature-preview-head">
          <span class="cost">${current.unplayable ? "!" : current.cost}</span>
          <div><strong>${escapeHtml(current.name)}</strong><small>${cardRarityLabel(base)} · ${cardTypeLabel(current)} · 專屬卡片</small></div>
        </div>
        <p>${escapeHtml(current.text || base.text || "")}</p>
        ${upgradeText ? `<p class="signature-upgrade-preview">升級預覽：${escapeHtml(upgradeText)}</p>` : ""}
        ${signatureUpgraded ? `<span class="signature-state">已升級</span>` : ""}
        ${bloodlineUnlocked && bloodline ? `<span class="signature-state support">血統附加：${escapeHtml(bloodline.name)}</span>` : ""}
        <div class="signature-tags">${(base.tags || []).slice(0, 4).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>
      </article>
    `;
  }

  function cardUpgradePreview(base, upgraded) {
    const fields = [
      ["damage", "傷害"],
      ["damageAll", "全體傷害"],
      ["block", "護甲"],
      ["blockAll", "全隊護甲"],
      ["draw", "抽牌"],
      ["healLowest", "治療"],
      ["reduceStress", "壓力降低"],
      ["weakTarget", "虛弱"],
      ["weakAll", "全體虛弱"],
      ["stunTarget", "封鎖"],
      ["gainEnergy", "能量"]
    ];
    const changes = fields
      .filter(([field]) => Number(upgraded[field] || 0) !== Number(base[field] || 0))
      .map(([field, label]) => `${label} ${Number(base[field] || 0)}→${Number(upgraded[field] || 0)}`);
    return changes.slice(0, 3).join("，") || "數值與效果提升";
  }

  function renderSquadSlot(member) {
    const loadout = getMemberLoadout(member);
    return `
      <article class="squad-slot faction-${member.factionId || "main"}">
        ${image(characterArt(member.id), `${escapeHtml(member.name)}`, "squad-art")}
        <div>
          <div class="squad-head"><strong>${escapeHtml(member.name)}</strong><span>${formatEnergy(member.energyContribution)} 能量</span></div>
          <p>${escapeHtml(member.role)}</p>
          <div class="squad-equipment">${loadout.item ? `${loadout.item.name}${loadout.entry.upgraded ? "+" : ""}` : "未裝備"}</div>
        </div>
        <button data-action="toggle-active" data-character-id="${member.id}" ${core.getActiveParty(state).length <= 3 ? "disabled" : ""}>候補</button>
      </article>
    `;
  }

  function renderEquipmentManagement() {
    const entries = state.equipmentInventory;
    const roster = combatMembers();
    const supportCount = (state.playerGrowth?.supportEquipmentIds || []).length;
    const equippedCount = Object.keys(state.equipped || {}).filter((id) => roster.some((member) => member.id === id)).length + supportCount;
    return `
      <section class="panel equipment-panel equipment-console">
        <div class="section-heading"><div><span class="eyebrow">裝備管理</span><h2>角色裝備與兵器庫</h2></div><p>${entries.length} 件道具 · ${equippedCount} 件已裝備</p></div>
        <div class="equipment-layout">
          <section class="loadout-column">
            <div class="subsection-heading"><strong>角色目前裝備</strong><span>先看誰缺裝，再到右側兵器庫指派。</span></div>
            <div class="loadout-grid">${roster.map(renderLoadoutCard).join("")}</div>
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
    const effectText = loadout.item ? equipmentEffectLabel(loadout.item, loadout.entry) : "尚未建立裝備互動";
    return `
      <article class="loadout-card faction-${member.factionId || "main"} ${member.active ? "active-member" : "reserve-member"}">
        ${image(characterArt(member.id), `${escapeHtml(member.name)}`, "loadout-character-art")}
        <div>
          <span class="faction-inline faction-${member.factionId || "main"}">${escapeHtml(memberFactionName(member))}</span>
          <strong>${escapeHtml(member.name)}</strong>
          <p>${member.active ? "出戰中" : "候補"} · ${escapeHtml(member.role)}</p>
          <div class="equipped-preview">${loadout.item ? `${image(equipmentArt(loadout.item.id), "", "loadout-equipment-art")}<span>${escapeHtml(loadout.item.name)}${loadout.entry.upgraded ? "+" : ""}</span>` : "<span>未裝備</span>"}</div>
          <small class="loadout-effect-summary">${escapeHtml(effectText)}</small>
          ${renderModifierChips("loadout", { member, loadout })}
        </div>
      </article>
    `;
  }

  function renderEquipmentBrowser(entries) {
    if (!entries.length) return `<p class="empty-state">目前還沒有裝備。</p>`;
    return `<div class="management-group-list armory-group-list">${groupEquipmentBySource(entries).map((group) => `
      <details class="management-group equipment-group">
        <summary><span><strong>${group.name}</strong><small>${group.description || "可裝備道具"}</small></span><em>${group.entries.length} 件</em></summary>
        <div class="armory-list">${group.entries.map(renderArmoryItem).join("")}</div>
      </details>
    `).join("")}</div>`;
  }

  function renderArmoryItem(entry) {
    const item = core.equipmentById[entry.equipmentId];
    const holder = getEquipmentHolder(entry.instanceId);
    const supportSlot = getSupportEquipmentSlot(entry.instanceId);
    const holderText = holder ? holder.name : supportSlot >= 0 ? `第7人支援槽 ${supportSlot + 1}` : "未裝備";
    return `
      <article class="armory-item rarity-${item.rarity || "common"}">
        ${image(equipmentArt(item.id), "", "armory-art")}
        <div class="armory-copy">
          <div class="armory-head"><strong>${item.name}${entry.upgraded ? "+" : ""}</strong><span>${rarityLabel(item.rarity)}${item.weaponClass === "firearm" ? " · 槍械" : ""}${supportSlot >= 0 ? ` · 第7人支援${supportSlot + 1}` : ""}</span></div>
          <p>${item.text}</p>
          <div class="equipment-meta-line"><span>持有人</span><strong>${escapeHtml(holderText)}</strong><em>${escapeHtml(equipmentEffectLabel(item, entry))}</em></div>
          ${renderModifierChips("equipment", { item, entry, holder, supportSlot })}
          <label class="assign-row"><span>持有人</span><select data-action="assign-equipment" data-equipment-instance-id="${entry.instanceId}">${renderEquipmentHolderOptions(holder, supportSlot)}</select></label>
        </div>
      </article>
    `;
  }

  function renderEquipmentHolderOptions(holder, supportSlot = -1) {
    const active = core.getActiveParty(state);
    const reserve = combatMembers().filter((member) => !member.active);
    const optionFor = (member) => `<option value="${escapeHtml(member.id)}" ${holder?.id === member.id ? "selected" : ""}>${escapeHtml(member.name)}${member.active ? " · 出戰" : " · 候補"}</option>`;
    return `
      <option value="" ${holder || supportSlot >= 0 ? "" : "selected"}>${supportSlot >= 0 ? `第7人支援槽 ${supportSlot + 1}` : "未裝備"}</option>
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
    return holderId ? combatMembers().find((member) => member.id === holderId) : null;
  }

  function getSupportEquipmentSlot(instanceId) {
    return (state.playerGrowth?.supportEquipmentIds || []).findIndex((id) => id === instanceId);
  }

  function renderEffectMatrix(mode = "hub") {
    const bonds = core.getActiveBonds(state);
    const loadoutRows = getLoadoutEffectRows();
    const supportRows = getSupportEffectRows();
    const activeParty = core.getActiveParty(state);
    const currentTab = hubTabLabel(state.hubTab || "deployment");
    const title = mode === "combat" ? "戰鬥加成來源" : "作戰中樞";
    const subtitle = mode === "combat" ? "主要決策資訊前移到卡牌、敵人與狀態列。" : "羈絆、角色裝備與第 7 人支援集中顯示。";
    return `
      <section class="panel effect-matrix ${mode === "combat" ? "combat-effect-matrix compact" : ""}">
        <div class="section-heading"><div><span class="eyebrow">效果矩陣</span><h2>${title}</h2></div><p>${subtitle}</p></div>
        <div class="effect-matrix-grid">
          <article class="effect-cell">
            <span>${mode === "combat" ? "戰鬥狀態" : "目前分頁"}</span>
            <strong>${mode === "combat" ? `回合 ${state.turn}` : currentTab}</strong>
            <p>${mode === "combat" ? `出戰 ${activeParty.length} 人 · 能量 ${state.energy}/${state.maxEnergy}` : `獎勵點 ${state.rewardPoints} · 支線 ${state.sideStories}`}</p>
          </article>
          <article class="effect-cell">
            <span>羈絆 chips</span>
            <strong>${bonds.length ? `已啟用 ${bonds.length} 條` : "未啟用"}</strong>
            ${renderEffectRows(bonds.map((bond) => ({ label: "羈絆", name: bond.name, text: bond.text, tone: "bond" })).slice(0, mode === "combat" ? 2 : 4), "調整出戰角色可啟用羈絆。")}
          </article>
          <article class="effect-cell">
            <span>裝備持有人</span>
            <strong>${loadoutRows.length ? `${loadoutRows.length} 件可見` : "未裝備"}</strong>
            ${renderEffectRows(loadoutRows.slice(0, mode === "combat" ? 3 : 6), "角色與支援槽尚未配置裝備。")}
          </article>
          <article class="effect-cell">
            <span>第 7 人支援</span>
            <strong>${supportRows.length ? `${supportRows.length} 項啟用` : "空槽"}</strong>
            ${renderEffectRows(supportRows.slice(0, 5), "維持 1 變異血統 / 2 一般血統 / 2 支援裝備上限。")}
          </article>
        </div>
      </section>
    `;
  }

  function renderEffectRows(rows, emptyText) {
    if (!rows.length) return `<p class="empty-state compact">${escapeHtml(emptyText)}</p>`;
    return `<div class="effect-row-list">${rows.map((row) => `
      <div class="loadout-effect-row tone-${escapeHtml(row.tone || "neutral")}">
        <span>${escapeHtml(row.label)}</span>
        <strong>${escapeHtml(row.name)}</strong>
        <small>${escapeHtml(row.text)}</small>
      </div>
    `).join("")}</div>`;
  }

  function renderModifierChips(kind, context = {}) {
    const chips = buildModifierChips(kind, context).filter((chip) => chip && chip.value !== "");
    if (!chips.length) return "";
    return `<div class="modifier-chip-row ${kind}-chips">${chips.map((chip) => `
      <span class="modifier-chip tone-${escapeHtml(chip.tone || "neutral")}"><b>${escapeHtml(chip.label)}</b><em>${escapeHtml(chip.value)}</em></span>
    `).join("")}</div>`;
  }

  function buildModifierChips(kind, context) {
    if (kind === "card") return buildCardModifierChips(context);
    if (kind === "character") return buildCharacterModifierChips(context);
    if (kind === "loadout") return buildLoadoutModifierChips(context);
    if (kind === "equipment") return buildEquipmentModifierChips(context);
    if (kind === "bond") return summarizeEffectChips(context.bond?.effects, "羈絆");
    return [];
  }

  function buildCardModifierChips({ card, cost, owner, bloodline, bloodlineUnlocked }) {
    const bonds = core.getActiveBonds(state);
    const equipmentRows = getCardRelevantEffectRows(card);
    const supportRows = getSupportEffectRows();
    const chips = [
      { label: "費用", value: card.unplayable ? "不可打出" : String(cost), tone: cost > state.energy ? "danger" : "signal" },
      { label: "類型", value: cardTypeLabel(card), tone: card.type },
      owner ? { label: "擁有者", value: owner.name, tone: "owner" } : null,
      bloodlineUnlocked && bloodline ? { label: "血統", value: bloodline.name, tone: "support" } : null,
      bonds.length ? { label: "羈絆", value: `${bonds.length} 條`, tone: "bond" } : null,
      equipmentRows.length ? { label: "裝備", value: equipmentRows.slice(0, 2).map((row) => row.name).join(" / "), tone: "equipment" } : null,
      supportRows.length ? { label: "自創支援", value: `${supportRows.length} 項`, tone: "support" } : null
    ];
    return chips;
  }

  function buildCharacterModifierChips({ member, loadout, signature, bloodline, bloodlineUnlocked }) {
    const memberBonds = getCharacterBondRows(member);
    return [
      { label: "職能", value: member.role, tone: member.active ? "signal" : "neutral" },
      { label: "能量", value: formatEnergy(member.energyContribution), tone: "signal" },
      signature ? { label: "專屬牌", value: signature.name, tone: "owner" } : null,
      loadout?.item ? { label: "裝備", value: `${loadout.item.name}${loadout.entry?.upgraded ? "+" : ""}`, tone: "equipment" } : { label: "裝備", value: "未裝備", tone: "neutral" },
      bloodlineUnlocked && bloodline ? { label: "血統", value: bloodline.name, tone: "support" } : null,
      memberBonds.length ? { label: "羈絆", value: `${memberBonds.length} 條`, tone: "bond" } : null
    ];
  }

  function buildLoadoutModifierChips({ member, loadout }) {
    const chips = [
      { label: "狀態", value: member.active ? "出戰中" : "候補", tone: member.active ? "signal" : "neutral" },
      loadout?.item ? { label: "效果", value: equipmentEffectLabel(loadout.item, loadout.entry), tone: "equipment" } : null
    ];
    return chips;
  }

  function buildEquipmentModifierChips({ item, entry, holder, supportSlot }) {
    const firearmBoost = getFirearmMultiplier();
    return [
      { label: "效果類型", value: equipmentEffectTypeLabel(item.effect), tone: "equipment" },
      { label: "持有人", value: holder ? holder.name : supportSlot >= 0 ? `第7人支援槽 ${supportSlot + 1}` : "未裝備", tone: holder || supportSlot >= 0 ? "signal" : "neutral" },
      entry?.upgraded ? { label: "強化", value: "已升級", tone: "signal" } : null,
      item.weaponClass === "firearm" ? { label: "羈絆放大", value: firearmBoost > 1 ? `x${formatMultiplier(firearmBoost)}` : "未啟用", tone: firearmBoost > 1 ? "bond" : "neutral" } : null
    ];
  }

  function getCardDisabledReason(instance, card, cost) {
    if (card.unplayable) return "詛咒不可打出";
    if (cost > state.energy) return `能量不足：需要 ${cost}`;
    if (instance.ownerId && !state.party.some((member) => member.id === instance.ownerId && member.active && core.isAlive(member))) return "專屬角色未出戰或倒下";
    return "";
  }

  function getLoadoutEffectRows() {
    const characterRows = combatMembers().map((member) => {
      const loadout = getMemberLoadout(member);
      if (!loadout.item) return null;
      return {
        label: member.active ? "出戰裝備" : "候補裝備",
        name: `${member.name} · ${loadout.item.name}${loadout.entry.upgraded ? "+" : ""}`,
        text: equipmentEffectLabel(loadout.item, loadout.entry),
        tone: "equipment",
        effect: loadout.item.effect,
        item: loadout.item,
        entry: loadout.entry,
        member
      };
    }).filter(Boolean);
    const supportRows = getSupportEquipmentRows();
    return [...characterRows, ...supportRows];
  }

  function getSupportEffectRows() {
    const growth = state.playerGrowth || {};
    const activeMutation = core.customMutationsById[growth.activeMutationId] || null;
    const activeTags = (growth.activeTagIds || []).map((id) => core.customTagsById[id]).filter(Boolean);
    const mutationRows = activeMutation ? [{ label: "變異血統", name: activeMutation.name, text: activeMutation.text, tone: "support", effects: activeMutation.effects }] : [];
    const tagRows = activeTags.map((tag, index) => ({ label: `一般血統 ${index + 1}`, name: tag.name, text: tag.text, tone: "support", effects: tag.effects }));
    return [...mutationRows, ...tagRows, ...getSupportEquipmentRows()];
  }

  function getSupportEquipmentRows() {
    const ids = (state.playerGrowth?.supportEquipmentIds || []).filter(Boolean);
    return ids.map((instanceId, index) => {
      const entry = state.equipmentInventory.find((item) => item.instanceId === instanceId);
      const item = entry ? core.equipmentById[entry.equipmentId] : null;
      if (!item) return null;
      return {
        label: `支援槽 ${index + 1}`,
        name: `${item.name}${entry.upgraded ? "+" : ""}`,
        text: equipmentEffectLabel(item, entry),
        tone: "support",
        effect: item.effect,
        item,
        entry,
        scope: "support"
      };
    }).filter(Boolean);
  }

  function getCardRelevantEffectRows(card) {
    const rows = getLoadoutEffectRows();
    if (!card) return rows.slice(0, 3);
    const effectsByType = {
      attack: ["attackBonus", "firstAttackBonus", "firstAttackBurn", "firstAttackPierce"],
      guard: ["turnBlock", "openingEvade"],
      support: ["turnHealLowest", "turnStressRelief", "turnBlock"],
      tactic: ["openingDraw", "openingEnergy"]
    };
    const matching = rows.filter((row) => (effectsByType[card.type] || []).includes(row.effect));
    return matching.length ? matching : rows.slice(0, 2);
  }

  function getCharacterBondRows(member) {
    if (!member) return [];
    return core.getActiveBonds(state).filter((bond) => {
      if (Array.isArray(bond.members) && bond.members.includes(member.id)) return true;
      if (bond.faction && (bond.faction === member.factionId || bond.faction === member.faction)) return true;
      return false;
    });
  }

  function equipmentEffectLabel(item, entry) {
    if (!item) return "未裝備";
    const amount = Number(entry?.upgraded ? item.upgradedAmount ?? item.amount : item.amount);
    const base = {
      attackBonus: `攻擊牌傷害 +${amount}`,
      firstAttackBonus: `首張攻擊 +${amount}`,
      openingDraw: `開場抽牌 +${amount}`,
      turnBlock: `回合護甲 +${amount}`,
      turnStressRelief: `回合壓力 -${amount}`,
      firstAttackBurn: `首攻燃燒 +${amount}`,
      turnHealLowest: `最低生命治療 +${amount}`,
      openingEvade: `開場閃避 +${amount}`,
      firstAttackPierce: `首攻穿甲 +${amount}`,
      openingEnergy: `首回合能量 +${amount}`
    }[item.effect] || `${equipmentEffectTypeLabel(item.effect)} +${amount}`;
    const firearmBoost = item.weaponClass === "firearm" ? getFirearmMultiplier() : 1;
    return firearmBoost > 1 ? `${base} · 槍械羈絆 x${formatMultiplier(firearmBoost)}` : base;
  }

  function equipmentEffectTypeLabel(effect) {
    return {
      attackBonus: "攻擊加成",
      firstAttackBonus: "首攻加成",
      openingDraw: "開場抽牌",
      turnBlock: "回合護甲",
      turnStressRelief: "壓力修正",
      firstAttackBurn: "首攻燃燒",
      turnHealLowest: "生命支援",
      openingEvade: "開場閃避",
      firstAttackPierce: "首攻穿甲",
      openingEnergy: "開場能量"
    }[effect] || effect || "效果";
  }

  function summarizeEffectChips(effects, label) {
    return Object.entries(effects || {}).slice(0, 4).map(([effect, value]) => ({ label, value: `${effectLabel(effect)} ${formatEffectValue(value)}`, tone: "bond" }));
  }

  function effectLabel(effect) {
    return {
      attackBonus: "攻擊",
      statusExploitBonus: "狀態追擊",
      openingEnergy: "首回合能量",
      openingDraw: "開場抽牌",
      turnBlockAll: "全隊護甲",
      turnReduceStressAll: "壓力降低",
      turnStressAll: "壓力代價",
      turnHealAll: "全隊恢復",
      firearmMultiplier: "槍械放大",
      firstAttackPierce: "首攻穿甲",
      firstTacticDraw: "戰術抽牌",
      firstTacticCostReduction: "戰術降費",
      secondCardDamage: "二連追加"
    }[effect] || effect;
  }

  function formatEffectValue(value) {
    return typeof value === "number" && value > 0 ? `+${value}` : String(value);
  }

  function getFirearmMultiplier() {
    return core.getActiveBonds(state).reduce((max, bond) => Math.max(max, Number(bond.effects?.firearmMultiplier || 1)), 1);
  }

  function formatMultiplier(value) {
    return Number(value).toFixed(2).replace(/\.?0+$/, "");
  }

  function formatPercent(value) {
    return `${Math.round(Number(value || 0) * 100)}%`;
  }

  function hubTabLabel(tab) {
    return {
      deployment: "出戰部署",
      roster: "角色整備",
      growth: "自創強化",
      shop: "強化商店"
    }[tab] || "出戰部署";
  }

  function groupMembersByFaction(members) {
    const groups = new Map();
    members.forEach((member) => {
      const id = member.factionId || "main";
      if (!groups.has(id)) groups.set(id, { id, name: memberFactionName(member), members: [], activeCount: 0, energy: 0 });
      const group = groups.get(id);
      group.members.push(member);
      if (member.active) group.activeCount += 1;
      group.energy += Number(member.energyContribution || 0);
    });
    return [...groups.values()].sort((a, b) => Number(b.activeCount) - Number(a.activeCount) || a.name.localeCompare(b.name, "zh-Hant"));
  }

  function groupMembersByRosterSource(members) {
    const byId = new Map(members.map((member) => [member.id, member]));
    const used = new Set();
    const sources = data.characterSources || [];
    const groups = sources.map((source) => {
      const sourceMembers = (source.memberIds || []).map((id) => byId.get(id)).filter(Boolean);
      sourceMembers.forEach((member) => used.add(member.id));
      return makeRosterSourceGroup(source, sourceMembers);
    }).filter((group) => group.members.length);
    const missing = members.filter((member) => !used.has(member.id));
    if (missing.length) {
      groups.push(makeRosterSourceGroup({ id: "other", name: "其他角色", description: "尚未歸入來源分類的角色。", heroFileName: "roster-hero-main.png" }, missing));
    }
    return groups;
  }

  function makeRosterSourceGroup(source, members) {
    const activeCount = members.filter((member) => member.active).length;
    const energy = members.reduce((sum, member) => sum + Number(member.energyContribution || 0), 0);
    const factionId = members.find((member) => member.factionId)?.factionId || source.id;
    return { ...source, name: source.id === "main" ? state.teamName || "中洲隊" : source.name, members, activeCount, energy, factionId };
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
        <div class="bond-grid">${bonds.map((bond) => `<article class="bond-card"><strong>${bond.name}</strong><p>${bond.text}</p>${renderModifierChips("bond", { bond })}</article>`).join("") || "<p class=\"empty-state\">調整出戰角色可啟用羈絆效果。</p>"}</div>
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
    const canAfford = state.rewardPoints >= entry.rewardPointCost && state.sideStories >= Number(entry.sideStoryCost || 0);
    const label = entry.kind === "card" ? (item.sourceName || "主神基礎") : (item.sourceName || "主神裝備");
    const costText = `${entry.rewardPointCost} 點${entry.sideStoryCost ? ` / ${entry.sideStoryCost} 支線` : ""}`;
    if (entry.kind === "card") {
      const ownership = cardOwnershipState(item.id);
      const stockLocked = ownership.repeatable && bought >= entry.stock;
      const disabled = ownership.status === "max" || stockLocked || !canAfford;
      const buttonLabel = ownership.status === "max" ? "已擁有最高級技能" : ownership.status === "upgrade" ? `強化+ · ${costText}` : stockLocked ? "已達購買上限" : `購買 · ${costText}`;
      return `<article class="shop-item shop-card-item rarity-${cardRarityTier(item)} ownership-${ownership.status}">${renderCardArtFrame(item, "shop-art")}<span class="eyebrow">${label} · ${cardRarityLabel(item)}</span><h3>${item.name}${ownership.entry?.upgraded ? "+" : ""}</h3><div class="shop-status-row"><span class="ownership-chip ${ownership.status}">${ownership.label}</span><span>${costText}</span></div><p>${item.text}</p><button data-action="buy-shop" data-shop-id="${entry.id}" ${disabled ? "disabled" : ""}>${buttonLabel}</button></article>`;
    }
    const disabled = bought >= entry.stock || ownedEquipment || !canAfford;
    return `<article class="shop-item">${image(equipmentArt(item.id), "", "shop-art")}<span class="eyebrow">${label} · ${rarityLabel(item.rarity)}</span><h3>${item.name}</h3><div class="shop-status-row"><span class="ownership-chip ${ownedEquipment ? "max" : "new"}">${ownedEquipment ? "已擁有" : "未持有"}</span><span>${costText}</span></div><p>${item.text}</p><button data-action="buy-shop" data-shop-id="${entry.id}" ${disabled ? "disabled" : ""}>${ownedEquipment ? "已擁有" : `購買 · ${costText}`}</button></article>`;
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
    return `<section class="panel"><div class="section-heading"><div><span class="eyebrow">遠征隊伍</span><h2>目前狀態</h2></div></div><div class="run-party-grid">${core.getActiveParty(state).map((member) => `<article>${image(characterArt(member.id), "", "run-party-art")}<div><span class="faction-inline faction-${member.factionId || "main"}">${escapeHtml(memberFactionName(member))}</span><strong>${escapeHtml(member.name)}</strong></div>${renderMeter("生命", member.hp, member.maxHp, "hp")}${renderMeter("壓力", member.stress, 100, "stress")}</article>`).join("")}</div></section>`;
  }

  function renderPortraitCard(member) {
    return `<article class="portrait-card faction-${member.factionId || "main"}">${image(characterArt(member.id), `${escapeHtml(member.name)}插畫`, "portrait-art")}<span class="faction-badge">${escapeHtml(memberFactionName(member))}</span><span class="energy-badge">${formatEnergy(member.energyContribution)} 能量</span><h3>${escapeHtml(member.name)}</h3><p>${escapeHtml(member.passiveText)}</p></article>`;
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
      if (action === "set-custom-mutation") {
        const applyCustomMutation = () => {
          audio?.unlock?.();
          const mutationId = element.tagName === "SELECT" ? element.value : element.dataset.mutationId || "";
          dispatch(core.setCustomActiveMutation(state, mutationId), { action, mutationId });
        };
        element.addEventListener(element.tagName === "SELECT" ? "change" : "click", applyCustomMutation);
        return;
      }
      if (action === "set-custom-tag-slot") {
        const applyCustomTagSlot = () => {
          audio?.unlock?.();
          const tagId = element.tagName === "SELECT" ? element.value : element.dataset.tagId || "";
          dispatch(core.setCustomActiveTag(state, element.dataset.slotIndex, tagId), { action, slotIndex: element.dataset.slotIndex, tagId });
        };
        element.addEventListener(element.tagName === "SELECT" ? "change" : "click", applyCustomTagSlot);
        return;
      }
      if (action === "set-custom-support-equipment") {
        const applyCustomSupportEquipment = () => {
          audio?.unlock?.();
          const equipmentInstanceId = element.tagName === "SELECT" ? element.value : element.dataset.equipmentInstanceId || "";
          dispatch(core.setCustomSupportEquipment(state, element.dataset.slotIndex, equipmentInstanceId), { action, slotIndex: element.dataset.slotIndex, equipmentInstanceId });
        };
        element.addEventListener(element.tagName === "SELECT" ? "change" : "click", applyCustomSupportEquipment);
        return;
      }
      element.addEventListener("click", () => {
        audio?.unlock?.();
        if (action === "main-god-invite") dispatch(core.answerMainGodInvite(state, element.dataset.answer), { action, answer: element.dataset.answer });
        if (action === "restart-onboarding") dispatch(core.restartOnboarding(state), { action });
        if (action === "player-name") dispatch(core.setPlayerName(state, app.querySelector("#player-name-input")?.value || ""), { action });
        if (action === "player-gender") dispatch(core.setPlayerGender(state, element.dataset.gender), { action, gender: element.dataset.gender });
        if (action === "player-profession") dispatch(core.setPlayerProfession(state, element.dataset.professionId), { action, professionId: element.dataset.professionId });
        if (action === "player-personality") dispatch(core.setPlayerPersonality(state, element.dataset.personalityId), { action, personalityId: element.dataset.personalityId });
        if (action === "onboarding-back") dispatch(core.goToOnboardingStage(state, element.dataset.stage), { action, stage: element.dataset.stage });
        if (action === "confirm-player") dispatch(core.confirmPlayerCreation(state), { action });
        if (action === "rename-team") dispatch(core.renameTeam(state, app.querySelector("#team-name-input")?.value || ""), { action });
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
        if (action === "continue-event-result") dispatch(core.continueEventResult(state), { action });
        if (action === "camp") dispatch(core.campAction(state, element.dataset.campAction, element.dataset.targetId), { action, campAction: element.dataset.campAction, targetId: element.dataset.targetId });
        if (action === "return-after-defeat") dispatch(core.returnAfterDefeat(state), { action });
        if (action === "hub-tab") dispatch(core.setHubTab(state, element.dataset.tabId), { action, tabId: element.dataset.tabId });
        if (action === "toggle-active") dispatch(core.toggleActive(state, element.dataset.characterId), { action, characterId: element.dataset.characterId });
        if (action === "buy-shop") dispatch(core.buyShopItem(state, element.dataset.shopId), { action, shopId: element.dataset.shopId });
        if (action === "buy-permanent") dispatch(core.buyPermanentUpgrade(state, element.dataset.upgradeId), { action, upgradeId: element.dataset.upgradeId });
        if (action === "upgrade-character") dispatch(core.upgradeCharacter(state, element.dataset.characterId), { action, characterId: element.dataset.characterId });
        if (action === "upgrade-signature") dispatch(core.upgradeSignature(state, element.dataset.characterId), { action, characterId: element.dataset.characterId });
        if (action === "upgrade-bloodline") dispatch(core.upgradeBloodline(state, element.dataset.characterId), { action, characterId: element.dataset.characterId });
        if (action === "buy-custom-stat") dispatch(core.buyCustomStat(state, element.dataset.statId, element.dataset.amount), { action, statId: element.dataset.statId, amount: element.dataset.amount });
        if (action === "buy-custom-tag") dispatch(core.buyCustomTag(state, element.dataset.tagId), { action, tagId: element.dataset.tagId });
        if (action === "reroll-custom-tags") dispatch(core.rerollCustomTagOffers(state), { action });
        if (action === "remove-curse") dispatch(core.removeCurse(state, element.dataset.deckId), { action, deckId: element.dataset.deckId });
        if (action === "remove-deck-card") dispatch(core.removeDeckCard(state, element.dataset.deckId), { action, deckId: element.dataset.deckId });
      });
    });
  }

  function image(src, alt, className) {
    return `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" class="${escapeHtml(className)}" onerror="this.onerror=null;this.src='./src/assets/main-god-space.svg'" />`;
  }

  function combatMembers() {
    return state.party.filter((member) => member.id !== "player-avatar");
  }

  function formatEnergy(value) {
    const amount = Number(value || 0);
    return amount > 0 ? `+${amount}` : String(amount);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function memberFactionName(member) {
    if ((member.factionId || "main") === "main" || member.faction === "中洲隊") return state.teamName || "中洲隊";
    return member.faction || "中洲隊";
  }

  function renderOpeningHeroArt(opening, scenarioId) {
    const storyArt = scenarioArt(scenarioId);
    if (storyArt) return image(storyArt, "", "scenario-intro-art scenario-wide-art");
    const firstPanel = opening.panels?.[0];
    return image(firstPanel?.enemyId ? enemyArt(firstPanel.enemyId) : "./src/assets/generated/ui-main-god-nexus.png", "", "scenario-intro-art");
  }

  function scenarioArt(id) {
    const art = {
      "main-god-trial": "./src/assets/generated/scenario-main-god-trial.png",
      "alien": "./src/assets/generated/scenario-alien.png",
      "juon": "./src/assets/generated/scenario-juon.png",
      "mummy-curse": "./src/assets/generated/scenario-mummy-curse.png",
      "jurassic-island": "./src/assets/generated/scenario-jurassic-island.png",
      "abyssal-ark": "./src/assets/generated/scenario-abyssal-ark.png",
      "evernight-castle": "./src/assets/generated/scenario-evernight-castle.png",
      "demon-frontier": "./src/assets/generated/scenario-demon-frontier.png",
      "starship-troopers": "./src/assets/generated/scenario-starship-troopers.png",
      "avp-pyramid": "./src/assets/generated/scenario-avp-pyramid.png",
      "nightmare-elm": "./src/assets/generated/scenario-nightmare-elm.png",
      "lotr-war": "./src/assets/generated/scenario-lotr-war.png",
      "rumbling-finale": "./src/assets/generated/scenario-rumbling-finale.png",
      "infinity-castle": "./src/assets/generated/scenario-infinity-castle.png",
      "naruto-final-valley": "./src/assets/generated/scenario-naruto-final-valley.png",
      "bleach-false-karakura": "./src/assets/generated/scenario-bleach-false-karakura.png",
      "gintama-yoshiwara": "./src/assets/generated/scenario-gintama-yoshiwara.png",
      "gintama-final-war": "./src/assets/generated/scenario-gintama-final-war.png",
      "avengers-new-york": "./src/assets/generated/scenario-avengers-new-york.png",
      "batman-v-superman": "./src/assets/generated/scenario-batman-v-superman.png",
      "devil-may-cry-5": "./src/assets/generated/scenario-devil-may-cry-5.png",
      "final-destination": "./src/assets/generated/scenario-final-destination.png",
      "jinyong-heroic-peak": "./src/assets/generated/scenario-jinyong-heroic-peak.png",
      "pacific-rim-breach": "./src/assets/generated/scenario-pacific-rim-breach.png",
      "fury-road-war-rig": "./src/assets/generated/scenario-fury-road-war-rig.png",
      "resident-evil-6-c-virus": "./src/assets/generated/scenario-resident-evil-6-c-virus.png",
      "elden-ring-hell-run": "./src/assets/generated/scenario-elden-ring-hell-run.png",
      "jujutsu-kaisen-shibuya": "./src/assets/generated/scenario-jujutsu-kaisen-shibuya.png",
      "fullmetal-alchemist-finale": "./src/assets/generated/scenario-fullmetal-alchemist-finale.png"
    };
    return art[id] || "";
  }

  function characterArt(id) {
    if (id === "player-avatar") {
      const profile = state.playerProfile || state.party.find((member) => member.id === "player-avatar")?.playerProfile;
      const growthArt = state.playerGrowth?.art;
      if (growthArt) return growthArt;
      if (profile?.professionId && profile?.gender) return professionArt(profile.professionId, profile.gender);
    }
    return `./src/assets/generated/character-${id}.png`;
  }

  function customGrowthArt() {
    if (state.playerGrowth?.art) return state.playerGrowth.art;
    return characterArt("player-avatar");
  }

  function professionArt(professionId, gender) {
    return `./src/assets/generated/character-player-${professionId}-${gender === "female" ? "female" : "male"}.png`;
  }

  function rosterHeroArt(source) {
    return `./src/assets/generated/${source.heroFileName || `roster-hero-${source.id}.png`}`;
  }

  function skillArt(id) {
    return `./src/assets/generated/skill-${id}.png`;
  }

  function sourceCoverArt(id) {
    return `./src/assets/generated/source-cover-${id}.png`;
  }

  function equipmentArt(id) {
    return `./src/assets/generated/equipment-${id}.png`;
  }

  function enemyArt(id) {
    return `./src/assets/generated/enemy-${id}.png`;
  }

  function cardTypeLabel(card) {
    if (card.category === "curse") return "詛咒";
    return { attack: "攻擊", guard: "防護", support: "支援", tactic: "戰術" }[card.type] || card.type;
  }

  function renderCardArtFrame(card, imageClass = "skill-art") {
    return `<span class="card-frame rarity-${cardRarityTier(card)}">${image(skillArt(card.id), `${card.name}插畫`, imageClass)}<span class="rarity-mark">${cardRarityLabel(card)}</span></span>`;
  }

  function cardRarityTier(cardOrRarity) {
    const rarity = typeof cardOrRarity === "string" ? cardOrRarity : cardOrRarity.rarity;
    return { starter: "basic", common: "r", uncommon: "sr", rare: "ssr", signature: "ur", curse: "curse" }[rarity] || "basic";
  }

  function cardRarityLabel(cardOrRarity) {
    const rarity = typeof cardOrRarity === "string" ? cardOrRarity : cardOrRarity.rarity;
    return { starter: "基礎", common: "R", uncommon: "SR", rare: "SSR", signature: "UR", curse: "詛咒" }[rarity] || rarity;
  }

  function cardOwnershipState(cardId) {
    const card = core.cardsById[cardId];
    const entry = core.findOwnedCardEntry(state, cardId);
    const count = state.deck.filter((item) => item.cardId === cardId).length;
    const repeatable = core.isRepeatableCard(cardId);
    if (!entry) return { status: "new", label: "未持有", entry: null, repeatable, count };
    if (repeatable) return { status: "repeatable", label: `已持有 ${count} 張`, entry, repeatable, count };
    if (entry.upgraded || !card?.upgrade) return { status: "max", label: "已擁有最高級", entry, repeatable, count };
    return { status: "upgrade", label: "已持有 · 可強化+", entry, repeatable, count };
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
    return {
      "battle-instinct": "戰鬥本能：攻擊 +2",
      warded: "古物護佑：開場護甲 +4",
      "book-of-amun-ra": "復活真經殘頁：開場護甲 +6",
      "electric-fence": "高壓電網：每回合護甲 +2",
      "pressure-suit": "壓力密封服：每回合護甲 +2",
      "silvered-weapons": "鍍銀武裝：攻擊 +3",
      "black-flame-overclock": "黑炎超載：攻擊 +5",
      "main-god-calibration": "主神白光校準：每回合護甲 +4",
      "federal-fireline": "聯邦火力校準：攻擊 +4",
      "predator-hunt-mark": "獵人熱視標記：攻擊 +4",
      "lucid-anchor": "清醒錨點：每回合護甲 +3",
      "mithril-stand": "秘銀遠征誓約：開場護甲 +12",
      "thunder-spear-route": "雷槍與立體機動線：攻擊 +4",
      "nichirin-counteroffensive": "赫刀連攜：攻擊 +6",
      "kurama-chakra-link": "九尾查克拉連結：攻擊 +5",
      "mugetsu-final-window": "無月出刀窗口：攻擊 +6",
      "yorozuya-last-stand": "萬事屋逆境連攜：每回合護甲 +4",
      "joyo-final-blade-line": "攘夷終局斬線：攻擊 +5",
      "avengers-assemble-protocol": "復仇者集結：攻擊 +4",
      "justice-dawn-truce": "正義黎明停戰：攻擊 +4",
      "stylish-combo-rating": "Stylish連段評級：攻擊 +5",
      "premonition-loop": "死亡設計預判：每回合護甲 +3",
      "wulin-manual-focus": "武林盟誓：攻擊 +4",
      "jaeger-drift-sync": "獵人機甲同步：攻擊 +5",
      "war-rig-breakthrough": "狂怒公路衝刺：開場護甲 +12",
      "c-virus-antibody-window": "C病毒抗體窗口：攻擊 +5",
      "great-rune-overload": "大盧恩超載：攻擊 +7",
      "black-flash-chain-window": "黑閃連續校準：攻擊 +6",
      "prison-realm-break": "獄門疆破碎：攻擊 +6",
      "prison-realm-shard-route": "獄門疆殘片：開場護甲 +10",
      "boogie-woogie-feint": "不義遊戲佯攻：攻擊 +4",
      "mahoraga-adaptive-guard": "魔虛羅適應護牆：每回合護甲 +7",
      "event-duel-tempo": "短兵相認：攻擊 +3",
      "event-oath-guard": "共戰誓約：每回合護甲 +4",
      "event-marked-route": "伏線標記：開場護甲 +8",
      "event-shield-matrix": "核心盾矩陣：每回合護甲 +6",
      "event-core-overload": "核心超載：攻擊 +6",
      "event-crack-guard": "裂縫護佑：開場護甲 +6",
      "event-timer-buffer": "倒數延後：每回合護甲 +3",
      "event-ambush-line": "假退伏擊：攻擊 +2",
      "event-loop-instinct": "輪迴偏差：攻擊 +4"
    }[power.id] || power.id;
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
