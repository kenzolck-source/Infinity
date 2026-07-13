(function (global) {
  const data = global.MainGodData;
  if (!data) return;

  const profiles = {
    alien: {
      axis: "深空獵殺",
      place: "諾斯特羅莫殘骸",
      hidden: "鄭吒",
      threat: "皇后巢穴",
      core: "酸血樣本",
      boon: "深空求生本能",
      world: "異形巢穴的獵殺節奏被中洲隊提前拆開。",
      power: { id: "alien-fate-pressure-map", effect: "openingBlock", amount: 10 }
    },
    juon: {
      axis: "怨念宅邸",
      place: "佐伯家二樓",
      hidden: "楚軒",
      threat: "伽椰子的咒怨迴圈",
      core: "怨念錨點",
      boon: "詛咒逆讀",
      world: "宅邸不再只重演死亡，怨念路線被留下可追蹤的縫隙。",
      power: { id: "juon-fate-curse-map", effect: "turnBlock", amount: 4 }
    },
    "mummy-curse": {
      axis: "亡者都城",
      place: "哈姆納塔祭壇",
      hidden: "伊莫頓",
      threat: "亡者黑經反噬",
      core: "太陽金經殘頁",
      boon: "真經護符",
      world: "復活與詛咒不再只由古書決定，隊伍保留了改寫亡者線的證據。",
      power: { id: "mummy-fate-sun-script", effect: "openingDraw", amount: 1 }
    },
    "jurassic-island": {
      axis: "失控樂園",
      place: "高壓電網控制室",
      hidden: "趙櫻空",
      threat: "迅猛龍圍獵",
      core: "園區控制權限",
      boon: "電網伏擊窗口",
      world: "島上的獵食鏈被重新標記，人類不再只是被追逐的獵物。",
      power: { id: "jurassic-fate-grid-window", effect: "attackBonus", amount: 4 }
    }
  };

  const scenarioById = Object.fromEntries((data.scenarios || []).map((scenario) => [scenario.id, scenario]));

  function choice(id, title, text) {
    return { id, title, text };
  }

  function buildStage2(scenarioId, profile) {
    return {
      [`${scenarioId}-fate-rescue`]: [
        choice(`${scenarioId}-rescue-lock-signal`, `鎖定${profile.hidden}訊號`, `把${profile.place}裡最微弱的生還訊號固定下來，不讓${profile.threat}先找到他。`),
        choice(`${scenarioId}-rescue-split-team`, "分隊切入死亡節點", `讓一隊牽制${profile.threat}，另一隊沿${profile.axis}核心路線接近${profile.hidden}。`),
        choice(`${scenarioId}-rescue-force-window`, "硬開主角窗口", `不等劇情自然推進，直接把主神標記的犧牲瞬間撕開。`)
      ],
      [`${scenarioId}-fate-core`]: [
        choice(`${scenarioId}-core-stabilize`, `穩定${profile.core}`, `把${profile.core}從災難源頭壓成隊伍能利用的短期優勢。`),
        choice(`${scenarioId}-core-copy`, "複寫劇本樣本", `不強行奪走核心，只複製一份能被主神承認的戰術樣本。`),
        choice(`${scenarioId}-core-seal`, "封存反噬源", `花更多時間封存${profile.threat}的反噬，換取較乾淨的獎勵。`)
      ],
      [`${scenarioId}-fate-risk`]: [
        choice(`${scenarioId}-risk-overdraw`, "透支主神判定", "故意讓任務評分短暫失衡，提前截取高價值獎勵。"),
        choice(`${scenarioId}-risk-curse-ticket`, "拿詛咒當門票", `接受${profile.axis}的負面標記，換取一條原本不會開的獎勵門。`),
        choice(`${scenarioId}-risk-blood-price`, "用傷勢買時間", `讓隊伍用生命和壓力硬扛${profile.threat}，把危機拖到獎勵露出來。`)
      ]
    };
  }

  function finalTemplates(scenarioId, profile, secondId) {
    const base = secondId.replace(`${scenarioId}-`, "");
    if (base.startsWith("rescue")) {
      return [
        {
          id: `${secondId}-save-hidden`,
          title: `${profile.hidden}跨過死亡線`,
          text: `${profile.hidden}被隊伍從${profile.threat}前拉回來，命運線正式偏離原本的犧牲節點。`,
          fateType: "hidden-rescue",
          rank: 5,
          effects: [{ type: "recruit-hidden" }, { type: "side-story", amount: 1 }]
        },
        {
          id: `${secondId}-support-route`,
          title: `${profile.boon}接入`,
          text: `救援沒有立刻完成，但${profile.boon}被壓成本次遠征可用的支援節奏。`,
          fateType: "rescue-support",
          rank: 3,
          effects: [{ type: "run-power", ...profile.power }, { type: "heal", amount: 0.12, stressRelief: 8 }]
        },
        {
          id: `${secondId}-costly-save`,
          title: `帶著代價救回${profile.hidden}`,
          text: `${profile.hidden}活下來了，但隊伍為了打穿${profile.axis}付出一輪真實壓力。`,
          fateType: "costly-hidden-rescue",
          rank: 4,
          effects: [{ type: "recruit-hidden" }, { type: "stress", amount: 22 }]
        }
      ];
    }
    if (base.startsWith("core")) {
      return [
        {
          id: `${secondId}-scenario-power`,
          title: `${profile.boon}成形`,
          text: `${profile.core}被轉成穩定增益，隊伍不用犧牲救援窗口也能取得劇本優勢。`,
          fateType: "core-power",
          rank: 3,
          effects: [{ type: "scenario-power" }, { type: "side-story", amount: 1 }]
        },
        {
          id: `${secondId}-rare-pattern`,
          title: "戰術樣本收錄",
          text: `主神承認${profile.axis}裡的戰術樣本，將它轉為可加入牌組的高價值選項。`,
          fateType: "core-skill",
          rank: 2,
          effects: [{ type: "rare-card" }, { type: "reward-points", amount: 500 }]
        },
        {
          id: `${secondId}-sealed-reward`,
          title: "封存獎勵成立",
          text: `${profile.threat}被短暫封住，留下比普通通關更乾淨的一份核心獎勵。`,
          fateType: "core-sealed",
          rank: 3,
          effects: [{ type: "legendary-equipment" }, { type: "heal", amount: 0.1, stressRelief: 10 }]
        }
      ];
    }
    return [
      {
        id: `${secondId}-high-score`,
        title: "主神高分截獎",
        text: `隊伍從${profile.axis}裡偷出一段額外評分，但壓力也立刻回灌。`,
        fateType: "risk-score",
        rank: 2,
        effects: [{ type: "reward-points", amount: 1600 }, { type: "stress", amount: 28 }]
      },
      {
        id: `${secondId}-curse-prize`,
        title: "詛咒獎勵門",
        text: `${profile.threat}在牌組裡留下污點，同時把稀有獎勵門推到眼前。`,
        fateType: "risk-curse",
        rank: 2,
        effects: [{ type: "curse" }, { type: "rare-card" }, { type: "reward-points", amount: 700 }]
      },
      {
        id: `${secondId}-blood-bargain`,
        title: "半血換窗口",
        text: `所有人都被${profile.axis}咬下一口，但換來本劇本最暴力的一段短期優勢。`,
        fateType: "risk-blood",
        rank: 2,
        effects: [{ type: "damage-fraction", amount: 0.34 }, { type: "run-power", ...profile.power }, { type: "side-story", amount: 1 }]
      }
    ];
  }

  function buildOpeningFateTree(scenarioId, profile) {
    const scenario = scenarioById[scenarioId];
    if (!scenario) return;
    scenario.eventTitle = scenario.eventTitle || `${profile.axis}改命訊號`;
    scenario.eventText = scenario.eventText || `${profile.place}裡出現主神沒有標出的岔路。救人、奪取核心或冒險截獎，會把這場劇本推向完全不同的結局。`;
    const stage1 = [
      choice(`${scenarioId}-fate-rescue`, `改寫${profile.hidden}命運線`, `放棄最穩收益，優先追上${profile.hidden}在${profile.axis}裡的死亡節點。`),
      choice(`${scenarioId}-fate-core`, `奪取${profile.core}`, `不急著救人，先把${profile.axis}最危險的核心力量壓進主神規則。`),
      choice(`${scenarioId}-fate-risk`, "高代價截獎", `故意踩進${profile.threat}的邊界，用傷勢、壓力或詛咒換更高回報。`)
    ];
    const stage2 = buildStage2(scenarioId, profile);
    const stage3 = {};
    const eventOutcomes = {};
    Object.values(stage2).flat().forEach((second) => {
      const finals = finalTemplates(scenarioId, profile, second.id);
      stage3[second.id] = finals.map((final) => choice(final.id, final.title, final.text));
      finals.forEach((final) => {
        eventOutcomes[final.id] = {
          title: final.title,
          text: final.text,
          effects: [
            ...final.effects,
            { type: "record-fate", fateType: final.fateType, endingRank: final.rank }
          ],
          rewards: final.effects.some((effect) => effect.type === "recruit-hidden") ? [`隱藏人物命運線：${profile.hidden}`] : [`${profile.boon}路線記錄`],
          costs: final.fateType.startsWith("risk") || final.fateType.includes("costly") ? ["隊伍承受了額外傷勢、壓力或詛咒。"] : ["沒有額外長期代價。"],
          storyImpact: `${profile.hidden}、${profile.core}與${profile.threat}之間的關係被重新寫入輪迴檔案。`,
          worldState: profile.world
        };
      });
    });
    scenario.eventChoices = { stage1, stage2, stage3 };
    scenario.eventOutcomes = { ...(scenario.eventOutcomes || {}), ...eventOutcomes };
    scenario.fateRouteSummary = { stage1: 3, stage2: 9, stage3: 27 };
  }

  Object.entries(profiles).forEach(([scenarioId, profile]) => buildOpeningFateTree(scenarioId, profile));
  data.openingFateScenarioIds = Object.keys(profiles);
})(globalThis);
