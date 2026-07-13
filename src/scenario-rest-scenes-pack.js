(function (global) {
  const data = global.MainGodData;
  if (!data || data.scenarioRestScenesPackLoaded) return;
  data.scenarioRestScenesPackLoaded = true;

  const details = {
    "alien": "艙段藍圖、生命訊號、通風管熱源與冷凍艙編號被攤在戰術桌上，楚軒把異形獵殺路線拆成可撤離的三個窗口。",
    "juon": "宅邸平面圖、錄音帶、符紙與詛咒殘響被壓在桌面，隊伍在低聲呼吸裡確認下一個不能踏錯的房間。",
    "mummy-curse": "沙漠遺跡拓片、聖甲蟲標本、亡靈經頁與墓室機關圖交錯發光，隊伍把復活詛咒拆成可逆推的儀式節點。",
    "jurassic-island": "暴雨打在臨時營帳外，恐龍熱源、圍欄電路、遊客撤離線與麻醉彈補給被重新標記。",
    "abyssal-ark": "深海艙壓表、聲納回波、破損潛航路線和未知生物樣本壓滿金屬桌面，休整像是在海底倒數。",
    "evernight-castle": "古堡平面、銀器、血族徽記與月相記錄鋪在長桌上，燭火把每條逃生路都照得像陷阱。",
    "demon-frontier": "邊境裂隙、惡魔爪印、黑火彈痕與補給牌堆攤在粗木桌上，隊伍只用短暫休息換下一輪反攻。",
    "main-god-trial": "白色主神光柱在桌心投下審判棋盤，隊伍把獎勵點、支線劇情、失敗代價與生還概率排成冰冷公式。",
    "starship-troopers": "前線沙盤、蟲潮坑道、軌道火力時間表與彈藥牌被釘在戰術桌上，所有休息都像下一波登陸前的倒數。",
    "avp-pyramid": "冰下金字塔剖面、獵手符號、酸血腐蝕痕與異形卵室熱源被放在同一張桌上，隊伍在兩種獵殺規則中找縫隙。",
    "nightmare-elm": "鍋爐房照片、夢境時間表、咖啡因補給與抓痕證據被攤開，所有人都在保持清醒和繼續推演之間拉扯。",
    "lotr-war": "中土戰線地圖、烽火台標記、魔戒路線與王者旗幟壓在木桌上，遠征隊在黎明前確認最後的盟友位置。",
    "batman-v-superman": "都市天際線模型、氪石樣本、裝甲藍圖與超人墜落軌跡被封在玻璃桌內，隊伍把誤判拆成可阻止的節點。",
    "devil-may-cry-5": "惡魔樹根圖、魔劍碎片、摩托零件與紅魂結晶混在桌上，休整更像一場帶笑的地獄委託復盤。",
    "final-destination": "事故剪報、座位圖、連鎖反應箭頭與破碎安全玻璃鋪滿桌面，隊伍試圖把看不見的死亡順序畫出來。",
    "jinyong-heroic-peak": "山巔武林地圖、竹簡心法、酒碗與劍譜殘頁擺在石桌上，隊伍用江湖規矩重新計算下一場比武。",
    "pacific-rim-breach": "機甲駕駛艙同步圖、破口深度讀數、怪獸骨片與城市防線投影占滿桌面，整頓就是下一次漂移前的校準。",
    "fury-road-war-rig": "車頭鐵皮被臨時當成桌面，燃油、水源、路障與追兵路線被粗暴標記，休息只有引擎冷卻那麼短。",
    "resident-evil-6-c-virus": "病毒樣本箱、城市感染熱區、BSAA 通訊和解毒血清路線排列在桌上，隊伍把感染爆發壓成可執行清單。",
    "kaiju-no-8-defense-force": "防衛隊作戰室裡，怪獸核心讀數、城市避難線、戰鬥服維修圖與破碎鱗片樣本同時亮起。",
    "gachiakuta-pit-cleaners": "深坑垃圾層剖面、斑獸爪痕、咒具零件與污染風向圖堆在清理隊桌上，隊伍在髒污裡找出真正的路。",
    "sakamoto-days-assassin-order": "便利店後房變成刺客戰術桌，貨架平面圖、消音器零件、購物小票和追殺名單混在一起，平凡感反而更危險。",
    "dandadan-evil-eye": "校舍靈異照片、外星儀器、咒眼塗鴉與青春亂七八糟的筆記攤在桌上，分析會差點變成吵架現場。",
    "my-hero-final-war": "英雄學校臨時指揮台上擺著城市戰線、個性相性表、救援路線與破損護具，隊伍把正面戰場拆成救人優先級。",
    "fire-force-final-pillar": "火災都市圖、聖陽教符號、柱的共鳴波形與消防裝備整齊鋪開，休整桌旁只聽見火焰還在牆外呼吸。",
    "hells-paradise-shinsenkyo": "仙境島藥草圖、處刑令、異形花粉樣本與刀痕地圖鋪滿竹桌，隊伍在美麗和致命之間標出退路。",
    "wind-breaker-keel-brawl": "街區路線、校徽貼紙、傷藥、對手站位和修好的自行車燈占據桌面，休息像放學後的戰前會議。",
    "black-clover-spade-raid": "魔法書、王國戰線、惡魔契約符與反魔法標記圍成沙盤，隊伍把突襲節奏壓到下一次魔力爆發前。",
    "shangri-la-frontier-lycagon": "遊戲 HUD 地圖、稀有怪路徑、裝備耐久與玩家手寫攻略疊在桌上，休整像高速副本攻略會。",
    "slime-walpurgis-clash": "魔王會議席位、結界水晶、魔素流向與盟友旗幟排成圓桌，隊伍把談判和戰鬥放在同一張圖上。",
    "mashle-divine-visionary": "魔法學院考場圖、奶油泡芙、破裂魔杖與肌力訓練表擠在桌上，嚴肅分析總被荒唐力量打斷。",
    "frieren-aura-exam": "古老魔法地圖、魔力探測紙、旅行手札與安靜茶具鋪在桌面，隊伍把漫長旅途拆成下一個溫柔但精準的選擇。",
    "overlord-holy-kingdom": "聖王國城防圖、亡靈軍勢棋子、神官徽記與黑色王座投影壓住桌面，休整氣氛像在敵人棋盤上偷時間。",
    "shield-hero-qten-lo": "異國宮廷地圖、盾牌紋章、式神符紙與追兵路線鋪開，隊伍把防守、逃亡和反擊排成一條硬路。",
    "four-knights-apocalypse-camelot": "卡美洛幻景、騎士紋章、預言碎片與魔力羅盤圍住桌面，少年騎士線被重新排成可守護的路。",
    "fairy-tail-100-years-quest": "魔導士公會桌上放著百年任務契約、龍神鱗片、魔法地圖與破損公會印章，休整也像一場熱鬧作戰會。",
    "blue-exorcist-blue-night": "驅魔塾地下室裡，魔劍封印、惡魔契約、藍色火焰痕跡與古書攤在桌上，隊伍先分清血脈與選擇。",
    "gintama-yoshiwara": "吉原屋頂下的矮桌堆著地下街路線、傘、甜食、煙管和刀，荒唐聊天裡藏著真正的突入計畫。"
  };

  const scenesByScenario = { ...(data.systemEncounterRestScenesByScenario || {}) };
  const fileNames = new Set(data.systemEncounterRestImageFiles || []);

  (data.scenarios || []).forEach((scenario) => {
    if (!scenario || scenario.id === "tutorial") return;
    if (!scenesByScenario[scenario.id]) {
      const fileName = `system-rest-${scenario.id}.png`;
      scenesByScenario[scenario.id] = {
        scenarioId: scenario.id,
        fileName,
        title: `${scenario.name}休整戰術桌`,
        text: details[scenario.id] || `中洲隊把${scenario.name}的敵人、補給、撤離口與主神提示攤在桌面，重新拆解下一步行動。`
      };
    }
    fileNames.add(scenesByScenario[scenario.id].fileName);
  });

  (data.systemEncounterRestFallbackImageFiles || []).forEach((fileName) => fileNames.add(fileName));
  data.systemEncounterRestScenesByScenario = scenesByScenario;
  data.systemEncounterRestImageFiles = [...fileNames];
})(globalThis);
