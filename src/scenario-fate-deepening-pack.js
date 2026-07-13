(function (global) {
  const data = global.MainGodData;
  if (!data || data.scenarioFateDeepeningLoaded) return;
  data.scenarioFateDeepeningLoaded = true;

  const scenarioEventRoutes = data.scenarioEventRoutes || {};
  const charactersById = Object.fromEntries((data.characters || []).map((character) => [character.id, character]));
  const deepenedScenarioIds = [];

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function choice(id, title, text) {
    return { id, title, text };
  }

  function slug(value) {
    return String(value || "route").replace(/[^a-zA-Z0-9\u4e00-\u9fff-]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase();
  }

  function isFullTree(scenario) {
    const stage1Count = scenario.eventChoices?.stage1?.length || 0;
    const stage2Count = Object.values(scenario.eventChoices?.stage2 || {}).flat().length;
    const stage3Count = Object.values(scenario.eventChoices?.stage3 || {}).flat().length;
    return stage1Count === 3 && stage2Count === 9 && stage3Count === 27;
  }

  function routeSeedsForScenario(scenario) {
    const scripted = [];
    (scenario.eventChoices?.stage1 || []).forEach((stage1, stage1Index) => {
      (scenario.eventChoices?.stage2?.[stage1.id] || []).forEach((stage2, stage2Index) => {
        (scenario.eventChoices?.stage3?.[stage2.id] || []).forEach((final, finalIndex) => {
          scripted.push({
            id: `${scenario.id}-scripted-${stage1Index}-${stage2Index}-${finalIndex}`,
            routeType: final.id.includes("rescue") || final.id.includes("return") || final.id.includes("break") ? "主角命運線" : "劇本專屬線",
            stage1,
            stage2,
            final,
            outcome: scenario.eventOutcomes?.[final.id] || null
          });
        });
      });
    });
    return scripted.length ? scripted : (scenarioEventRoutes[scenario.id] || []);
  }

  function baseStage1Choices(scenario, seeds, hiddenName) {
    const existing = (scenario.eventChoices?.stage1 || []).map(clone);
    const seeded = [];
    for (const route of seeds) {
      if (route.stage1 && !seeded.some((item) => item.id === route.stage1.id)) seeded.push(clone(route.stage1));
    }
    const defaults = [
      choice(`${scenario.id}-fate-save-hidden`, `救出${hiddenName}`, `優先改寫${hiddenName}的死亡或失控節點，放棄最穩定的普通收益。`),
      choice(`${scenario.id}-fate-gray-control`, "改寫劇本規則", `不急著救人，先拆開${scenario.name}的 Boss、道具或補給節奏。`),
      choice(`${scenario.id}-fate-risk-bargain`, "高代價截取獎勵", "接受傷勢、壓力或詛咒，提前拿走主神原本鎖在壞結局後面的獎勵。")
    ];
    return fillUnique([...existing, ...seeded], defaults, 3);
  }

  function baseStage2Choices(scenario, stage1, stage1Index, seeds, hiddenName) {
    const existing = (scenario.eventChoices?.stage2?.[stage1.id] || []).map(clone);
    const seeded = seeds.filter((route) => route.stage1?.id === stage1.id && route.stage2).map((route) => clone(route.stage2));
    const profiles = [
      [
        choice(`${stage1.id}-signal-lock`, `鎖定${hiddenName}訊號`, `把${hiddenName}的命運訊號從敵人、Boss 或劇本殺機之前固定下來。`),
        choice(`${stage1.id}-split-rescue`, "分隊牽制救援", "一隊拖住最危險的原作節點，另一隊切入死亡線接人。"),
        choice(`${stage1.id}-main-god-window`, "硬開主神窗口", "用主神白光與第 7 人支援把不可能的救援時刻撕開。")
      ],
      [
        choice(`${stage1.id}-boss-pattern`, "反推 Boss 行動", "先讀出 Boss 下一階段的意圖，把最危險的爆發改成可防守窗口。"),
        choice(`${stage1.id}-shop-cache`, "接管補給暗格", "把劇本道具、商店補給或戰術樣本轉成隊伍可用資源。"),
        choice(`${stage1.id}-world-anchor`, "保存世界狀態", "不貪直接獎勵，把本次選擇寫成後續能利用的世界改變。")
      ],
      [
        choice(`${stage1.id}-overdraw-score`, "透支評分截獎", "讓主神判定短暫失衡，用壓力換取高分獎勵。"),
        choice(`${stage1.id}-curse-ticket`, "拿詛咒當門票", "接受劇本負面標記，換取一扇正常路線不會開的獎勵門。"),
        choice(`${stage1.id}-blood-price`, "用半血買時間", "讓隊伍用真實傷勢硬扛最壞節點，拖到高價值獎勵露出來。")
      ]
    ];
    return fillUnique([...existing, ...seeded], profiles[stage1Index] || profiles[1], 3);
  }

  function baseFinalChoices(scenario, stage2, stage1Index, seeds, hiddenName) {
    const existing = (scenario.eventChoices?.stage3?.[stage2.id] || []).map(clone);
    const seeded = seeds.filter((route) => route.stage2?.id === stage2.id && route.final).map((route) => clone(route.final));
    const profiles = [
      [
        choice(`${stage2.id}-save-hidden`, `${hiddenName}跨過死亡線`, `${hiddenName}被隊伍從最糟的原作節點前拉回，命運線正式偏移。`),
        choice(`${stage2.id}-support-route`, "救援坐標保存", "沒有立刻完成招募，但救援坐標被保存成本次遠征增益。"),
        choice(`${stage2.id}-costly-save`, `帶著代價救回${hiddenName}`, `${hiddenName}活下來了，但隊伍承受了一輪壓力與傷勢。`)
      ],
      [
        choice(`${stage2.id}-boss-altered`, "Boss 節奏被改寫", "最危險的 Boss 爆發被提前讀出，後續戰鬥得到可利用窗口。"),
        choice(`${stage2.id}-shop-opened`, "商店補給暗格開放", "主神承認這條灰色路線，吐出一份可帶回整備的補給。"),
        choice(`${stage2.id}-world-state-saved`, "世界狀態保存", "這次沒有選最亮眼的獎勵，但劇本世界留下了可追蹤的改變。")
      ],
      [
        choice(`${stage2.id}-high-score-prize`, "高分截獎成功", "隊伍提前截走一份高價值獎勵，壓力也同步回灌。"),
        choice(`${stage2.id}-curse-prize`, "詛咒獎勵門打開", "負面標記寫進牌組，同時把稀有獎勵推到眼前。"),
        choice(`${stage2.id}-blood-bargain`, "半血換終局窗口", "所有人都被劇本咬下一口，但換來足以翻盤的短期優勢。")
      ]
    ];
    return fillUnique([...existing, ...seeded], profiles[stage1Index] || profiles[1], 3);
  }

  function fillUnique(primary, fallback, count) {
    const output = [];
    [...primary, ...fallback].forEach((item) => {
      if (!item?.id || output.some((existing) => existing.id === item.id)) return;
      output.push(clone(item));
    });
    while (output.length < count) {
      const base = fallback[output.length % fallback.length];
      output.push(choice(`${base.id}-${output.length}`, base.title, base.text));
    }
    return output.slice(0, count);
  }

  function outcomeForFinal(scenario, final, stage1Index, finalIndex, existingOutcome, hiddenName) {
    const outcome = existingOutcome ? clone(existingOutcome) : buildOutcome(scenario, final, stage1Index, finalIndex, hiddenName);
    outcome.title = outcome.title || final.title;
    outcome.text = outcome.text || final.text;
    outcome.effects = Array.isArray(outcome.effects) ? outcome.effects : [];
    if (!outcome.effects.some((effect) => effect.type === "record-fate")) {
      outcome.effects.push(recordEffectFor(stage1Index, finalIndex));
    }
    outcome.rewards = outcome.rewards || defaultRewards(stage1Index, hiddenName);
    outcome.costs = outcome.costs || defaultCosts(stage1Index, finalIndex);
    outcome.storyImpact = outcome.storyImpact || defaultStoryImpact(scenario, stage1Index, hiddenName);
    outcome.worldState = outcome.worldState || defaultWorldState(scenario, stage1Index, hiddenName);
    return outcome;
  }

  function buildOutcome(scenario, final, stage1Index, finalIndex, hiddenName) {
    const scenarioPower = scenario.scenarioPower
      ? { type: "run-power", ...scenario.scenarioPower, id: `${scenario.scenarioPower.id || scenario.id}-fate-${finalIndex}` }
      : { type: "run-power", id: `${scenario.id}-fate-window-${finalIndex}`, effect: finalIndex === 0 ? "attackBonus" : "openingBlock", amount: finalIndex === 0 ? 5 : 10 };
    const outcome = { title: final.title, text: final.text };
    if (stage1Index === 0) {
      outcome.effects = finalIndex === 0
        ? [{ type: "recruit-hidden" }, { type: "side-story", amount: 2 }]
        : finalIndex === 1
          ? [scenarioPower, { type: "heal", amount: 0.12, stressRelief: 10 }]
          : [{ type: "recruit-hidden" }, { type: "stress", amount: 24 }, { type: "damage-fraction", amount: 0.12 }];
    } else if (stage1Index === 1) {
      outcome.effects = finalIndex === 0
        ? [scenarioPower, { type: "reward-points", amount: 900 }]
        : finalIndex === 1
          ? [{ type: "rare-card" }, { type: "reward-points", amount: 900 }]
          : [{ type: "scenario-power" }, { type: "side-story", amount: 1 }];
    } else {
      outcome.effects = finalIndex === 0
        ? [{ type: "legendary-equipment" }, { type: "stress", amount: 28 }]
        : finalIndex === 1
          ? [{ type: "curse" }, { type: "rare-card" }, { type: "reward-points", amount: 1200 }]
          : [{ type: "damage-fraction", amount: 0.35 }, scenarioPower, { type: "side-story", amount: 1 }];
    }
    return outcome;
  }

  function recordEffectFor(stage1Index, finalIndex) {
    const fateTypes = [
      ["hidden-rescue", "hidden-coordinate", "costly-hidden-rescue"],
      ["gray-boss-altered", "gray-shop-opened", "gray-world-state"],
      ["risk-high-reward", "risk-curse-reward", "risk-blood-price"]
    ];
    const ranks = [
      [5, 3, 4],
      [3, 3, 3],
      [2, 2, 2]
    ];
    return { type: "record-fate", fateType: fateTypes[stage1Index]?.[finalIndex] || "scenario-fate", endingRank: ranks[stage1Index]?.[finalIndex] || 1 };
  }

  function defaultRewards(stage1Index, hiddenName) {
    if (stage1Index === 0) return [`隱藏人物線：${hiddenName}`, "輪迴檔案更新"];
    if (stage1Index === 1) return ["Boss、商店或世界狀態被改寫", "輪迴檔案更新"];
    return ["高價值獎勵", "輪迴檔案更新"];
  }

  function defaultCosts(stage1Index, finalIndex) {
    if (stage1Index === 0 && finalIndex === 0) return ["放棄其他奇遇收益。"];
    if (stage1Index === 1) return ["沒有直接救出隱藏人物。"];
    return ["隊伍承受額外傷勢、壓力或詛咒。"];
  }

  function defaultStoryImpact(scenario, stage1Index, hiddenName) {
    if (stage1Index === 0) return `${hiddenName}的原作命運被${scenario.name}奇遇線改寫。`;
    if (stage1Index === 1) return `${scenario.name}的 Boss 節奏、補給暗格或世界狀態被中洲隊留下新變數。`;
    return `${scenario.name}承認了一條高代價高回報的壞結局支線。`;
  }

  function defaultWorldState(scenario, stage1Index, hiddenName) {
    if (stage1Index === 0) return `${hiddenName}不再只是等待救援的隱藏判定，而是被寫入可重玩的改命路線。`;
    if (stage1Index === 1) return `${scenario.name}後續戰場出現可利用的 Boss 破綻與補給座標。`;
    return `${scenario.name}留下高壓殘響，獎勵更厚，但下一段路線會記住這筆代價。`;
  }

  function deepenScenario(scenario) {
    if (scenario.id === data.blackMythWukongSummary?.scenarioId) return;
    if (!scenario?.hiddenProtagonistId || scenario.id === "tutorial" || isFullTree(scenario)) return;
    const hiddenName = charactersById[scenario.hiddenProtagonistId]?.name || "隱藏主角";
    const seeds = routeSeedsForScenario(scenario).map(clone);
    const stage1 = baseStage1Choices(scenario, seeds, hiddenName);
    const stage2 = {};
    const stage3 = {};
    const eventOutcomes = { ...(scenario.eventOutcomes || {}) };
    const seedOutcomeByFinalId = new Map();
    seeds.forEach((route) => {
      if (route.final?.id && route.outcome && !seedOutcomeByFinalId.has(route.final.id)) seedOutcomeByFinalId.set(route.final.id, route.outcome);
    });
    const usedFinalIds = new Set();

    stage1.forEach((first, stage1Index) => {
      stage2[first.id] = baseStage2Choices(scenario, first, stage1Index, seeds, hiddenName);
      stage2[first.id].forEach((second) => {
        stage3[second.id] = baseFinalChoices(scenario, second, stage1Index, seeds, hiddenName).map((final, finalIndex) => {
          const existingOutcome = eventOutcomes[final.id] || seedOutcomeByFinalId.get(final.id);
          const uniqueFinal = uniqueFinalChoice(final, second, usedFinalIds);
          eventOutcomes[uniqueFinal.id] = outcomeForFinal(scenario, uniqueFinal, stage1Index, finalIndex, existingOutcome, hiddenName);
          return uniqueFinal;
        });
      });
    });

    scenario.eventChoices = { stage1, stage2, stage3 };
    scenario.eventOutcomes = eventOutcomes;
    scenario.fateRouteSummary = { stage1: 3, stage2: 9, stage3: 27 };
    deepenedScenarioIds.push(scenario.id);
  }

  function uniqueFinalChoice(final, stage2, usedFinalIds) {
    const next = clone(final);
    if (!usedFinalIds.has(next.id)) {
      usedFinalIds.add(next.id);
      return next;
    }
    const baseId = `${stage2.id}-${slug(next.id)}`;
    let candidate = baseId;
    let index = 2;
    while (usedFinalIds.has(candidate)) {
      candidate = `${baseId}-${index}`;
      index += 1;
    }
    next.id = candidate;
    usedFinalIds.add(next.id);
    return next;
  }

  (data.scenarios || []).forEach(deepenScenario);
  data.deepenedFateScenarioIds = [...new Set([...(data.deepenedFateScenarioIds || []), ...deepenedScenarioIds])];
})(globalThis);
