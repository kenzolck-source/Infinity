(function (global) {
  const data = global.MainGodData;
  if (!data) return;

  const scenarios = [
    {
      id: "chainsaw-man-reze-arc",
      name: "鏈鋸人",
      subtitle: "蕾塞篇雨夜爆風",
      intro: "白光落在東京雨夜的咖啡店外。淀治還沒分清戀愛與陷阱，蕾塞的引信已經把街道、颱風惡魔與公安封鎖線推成同一場爆炸。",
      recruitmentPool: ["reze-bomb-devil", "aki-hayakawa", "zhao-yingkong", "zero", "ming-yanwei", "choso", "lucy-kushinada", "nero-dmc5", "chu-xuan", "zhan-lan"],
      normal: ["csm-cafe-rain-devils", "csm-school-bomb-run"],
      elite: ["csm-public-safety-crossfire"],
      miniboss: "csm-reze-station-duel",
      boss: "csm-gun-devil-echo",
      eventTitle: "雨夜咖啡店與爆炸引信",
      eventText: "蕾塞遞出的花像告白，也像倒數計時器。若中洲隊只把她當敵人，淀治會再次被推回惡魔獵人的孤獨路線。",
      scenarioPowerName: "鏈鋸拉繩",
      scenarioPowerText: "本次遠征第一回合額外獲得 1 能量，所有攻擊牌傷害 +3，但回合開始全隊壓力 +1。",
      scenarioPower: { id: "chainsaw-ripcord-overdrive", effect: "openingEnergy", amount: 1 },
      hiddenProtagonistId: "denji-chainsaw"
    },
    {
      id: "kaiju-no-8-defense-force",
      name: "怪獸8號",
      subtitle: "防衛隊核心暴露",
      intro: "白光散去，第三部隊警報響徹港區。卡夫卡的怪獸反應被主神提前標紅，米娜與琪歌露必須一邊打穿本獸，一邊阻止怪獸9號把他的身份變成處決命令。",
      recruitmentPool: ["mina-ashiro", "kikoru-shinomiya", "mou-gang", "ba-wang", "wang-xia", "chris-redfield", "raleigh-becket", "stacker-pentecost", "chu-xuan", "xiao-honglu"],
      normal: ["kaiju-harbor-yoju", "kaiju-third-division-raid"],
      elite: ["kaiju-no9-infiltration"],
      miniboss: "kaiju-no8-identity-lock",
      boss: "kaiju-no10-fortress-battle",
      eventTitle: "怪獸核心樣本與身份封鎖",
      eventText: "檢測器把卡夫卡標成敵性怪獸，防衛隊火控已經開始轉向自己人。真正的戰鬥不是變身，而是讓戰友相信他還在同一條防線上。",
      scenarioPowerName: "防衛隊核心齊射",
      scenarioPowerText: "本次遠征所有攻擊牌傷害 +4，第一回合全隊額外獲得 10 護甲。",
      scenarioPower: { id: "defense-force-core-volley", effect: "attackBonus", amount: 4 },
      hiddenProtagonistId: "kafka-hibino"
    },
    {
      id: "gachiakuta-pit-cleaners",
      name: "Gachiakuta",
      subtitle: "深淵清道夫",
      intro: "白光把隊伍丟進垃圾深淵。天空不再是天空，而是拋棄者的井口；路德的怒氣、人器的記憶與清道夫的傘刃都在告訴中洲隊：被丟掉的東西也會反咬世界。",
      recruitmentPool: ["enjin-gachiakuta", "riyoh-gachiakuta", "zhao-yingkong", "qi-tengyi", "naya", "tom", "hattori-hanzo-nioh", "okatsu-nioh", "chu-xuan", "cheng-xiao"],
      normal: ["gachiakuta-pit-trash-beasts", "gachiakuta-cleaner-ambush"],
      elite: ["gachiakuta-vital-hunter"],
      miniboss: "gachiakuta-vandal-core",
      boss: "gachiakuta-pit-apostle",
      eventTitle: "人器與被拋棄者的名字",
      eventText: "路德不是只想逃出深淵，他想把被丟棄的名字砸回天上。若能讓人器承認中洲隊，垃圾場就會變成武器庫。",
      scenarioPowerName: "人器垃圾魂",
      scenarioPowerText: "本次遠征攻擊帶狀態敵人時傷害 +5，每回合全隊額外獲得 3 護甲。",
      scenarioPower: { id: "jinki-trash-soul-route", effect: "attackBonus", amount: 3 },
      hiddenProtagonistId: "rudo-gachiakuta"
    },
    {
      id: "sakamoto-days-assassin-order",
      name: "坂本日常",
      subtitle: "殺手ORDER與X網路",
      intro: "白光落在便利店冷藏櫃前，收銀機還在找零，門外的懸賞殺手已經排成一條街。坂本不想回到殺手世界，但若家人被標上名單，日常本身就會變成最硬的戰場。",
      recruitmentPool: ["shin-asakura", "lu-shaotang", "zhao-yingkong", "kevin", "ada-wong", "black-knife-tiche", "hattori-hanzo-nioh", "lucy-kushinada", "chu-xuan", "li-xiaoyi"],
      normal: ["sakamoto-store-bounty", "sakamoto-lab-route"],
      elite: ["sakamoto-order-collision"],
      miniboss: "sakamoto-family-hostage-line",
      boss: "sakamoto-slur-network",
      eventTitle: "便利店規則與殺手名單",
      eventText: "坂本的規則很簡單：不殺人，保護家人，準時開店。主神卻把這三件事全部塞進同一張懸賞單。",
      scenarioPowerName: "日常反殺節奏",
      scenarioPowerText: "本次遠征第一張攻擊牌穿透護甲，每回合全隊壓力 -2。",
      scenarioPower: { id: "daily-life-counterkill", effect: "turnBlock", amount: 3 },
      hiddenProtagonistId: "taro-sakamoto"
    }
  ];

  const openings = {
    "chainsaw-man-reze-arc": {
      title: "雨夜把引信藏進告白",
      premise: "東京的雨像沒有盡頭。淀治在咖啡店門口回頭，蕾塞的花、颱風惡魔的風眼、公安的封鎖線與槍之惡魔的陰影同時靠近。",
      dialogue: [
        { speaker: "主神", line: "主線：阻止爆炸惡魔線收束成淀治死亡節點。隱藏判定：讓淀治自己選擇是否拉繩。" },
        { speaker: "淀治", line: "我只是想吃頓正常的飯、約個正常的會。為什麼每次都要變成惡魔追殺？" },
        { speaker: "蕾塞", line: "跟我逃走吧。或者，至少在爆炸前相信我一次。" },
        { speaker: "早川秋", line: "別被情緒帶走。契約告訴我，這場雨裡有不止一個惡魔。" },
        { speaker: "楚軒", line: "蕾塞不是單純敵方單位，她是誘餌、刺客與可改寫節點。先切斷颱風惡魔，再處理她和淀治的選擇。" }
      ],
      panels: [
        { enemyId: "csm-devil-hunter-zombie-pack", title: "雨夜屍偶巷", text: "惡魔獵人的屍偶在水坑裡站起來，街燈把牙齒照得像一排鋸片。" },
        { enemyId: "csm-typhoon-devil", title: "颱風惡魔風眼", text: "雨水倒著飛向天空，整條街被風眼揉成螺旋。" },
        { enemyId: "csm-bomb-devil-runaway", title: "車站爆風追擊", text: "蕾塞在煙塵裡回頭，腳下鐵軌一節節炸亮。" },
        { enemyId: "csm-gun-devil-echo", title: "槍之惡魔殘響", text: "遠方沒有身影，只有彈道像災害名單一樣穿過城市。" }
      ]
    },
    "kaiju-no-8-defense-force": {
      title: "怪獸反應被標紅",
      premise: "港區防線還在冒煙，第三部隊的偵測器卻把卡夫卡標成新的怪獸反應。米娜的重炮鎖定真正本獸，琪歌露的斧槍已經指向怪獸9號留下的細胞痕跡。",
      dialogue: [
        { speaker: "主神", line: "主線：守住第三部隊防線並擊破怪獸10號。隱藏判定：保住日比野卡夫卡的人類身份。" },
        { speaker: "日比野卡夫卡", line: "我不是來當怪獸的。我是來站在米娜旁邊，跟她一起打倒怪獸。" },
        { speaker: "亞白米娜", line: "火控交給我。中洲隊，替我把本獸核心逼出來。" },
        { speaker: "四之宮琪歌露", line: "別拖後腿。要是卡夫卡失控，我會先把他打醒。" },
        { speaker: "楚軒", line: "怪獸9號的目標是把盟友變成樣本。保護身份，比保護肉體更重要。" }
      ],
      panels: [
        { enemyId: "kaiju-yoju-swarm", title: "港區餘獸群", text: "餘獸從坍塌倉庫裡湧出，防衛隊彈道在夜色裡交叉成網。" },
        { enemyId: "kaiju-honju-raid", title: "本獸突襲", text: "巨大的怪獸核心在胸腔裡閃爍，每一步都把柏油震成碎片。" },
        { enemyId: "kaiju-no-9-cell", title: "9號細胞偽裝", text: "人形外殼裂開，怪獸細胞像墨水一樣爬過臉部。" },
        { enemyId: "kaiju-no-10-fortress", title: "10號要塞戰", text: "要塞級怪獸張開重甲，像一整座活著的攻城塔壓向第三部隊。" }
      ]
    },
    "gachiakuta-pit-cleaners": {
      title: "被丟棄之物開始反擊",
      premise: "白光散去時，腳下是無底垃圾海。清道夫的面罩擋不住腐臭，路德的人器手套卻在發熱，像是每一件被拋棄的東西都記得自己的名字。",
      dialogue: [
        { speaker: "主神", line: "主線：穿過深淵垃圾場並擊破深淵使徒。隱藏判定：讓路德的人器承認中洲隊。" },
        { speaker: "路德", line: "他們把我丟下來，以為這樣就能把我變成垃圾。那我就拿垃圾打回去。" },
        { speaker: "恩金", line: "清道夫不是救世主，只是負責把會咬人的東西先處理掉。" },
        { speaker: "莉尤", line: "別被外殼騙了。垃圾獸最硬的地方，通常就是最怕被剪開的地方。" },
        { speaker: "楚軒", line: "這裡的武器邏輯是記憶與執念。不要丟棄任何可用物，連廢料都是資源。" }
      ],
      panels: [
        { enemyId: "gachiakuta-trash-beast", title: "垃圾獸覓食", text: "腐爛外殼從垃圾海裡隆起，牙齒間卡著仍在發光的舊物。" },
        { enemyId: "gachiakuta-vandal-raider", title: "破壞者掠奪", text: "戴面罩的掠奪者從廢料山滑下，刀刃全是撿來又磨利的殘片。" },
        { enemyId: "gachiakuta-vital-instrument-hunter", title: "人器獵手", text: "獵手把別人的器物掛滿身上，每一件都在不情願地震動。" },
        { enemyId: "gachiakuta-pit-apostle", title: "深淵使徒", text: "垃圾海中央升起像王冠一樣的廢鐵，深淵把被丟棄的怨氣堆成形體。" }
      ]
    },
    "sakamoto-days-assassin-order": {
      title: "便利店門鈴響起暗殺令",
      premise: "坂本商店的門鈴叮噹一聲，第一個走進來的不是客人，而是懸賞殺手。貨架、冷藏櫃、收銀台與一張家庭照片，成了這場戰鬥的全部防線。",
      dialogue: [
        { speaker: "主神", line: "主線：擊破X網路核心並保住坂本家日常。隱藏判定：讓坂本不破壞自己的不殺規則。" },
        { speaker: "坂本太郎", line: "今天有特價便當。打架可以，別撞壞冷藏櫃。" },
        { speaker: "朝倉新", line: "我聽到他們的念頭了。不是一隊，是整條街都在等信號。" },
        { speaker: "陸少糖", line: "那就先把他們打到忘記暗號。放心，我醉得剛剛好。" },
        { speaker: "楚軒", line: "坂本的限制不是弱點，是戰術邊界。把所有火力導向非致命制伏，反而能讓敵方預測失效。" }
      ],
      panels: [
        { enemyId: "sakamoto-hitman-squad", title: "商店外懸賞小隊", text: "外送車、路人與自動門後都藏著槍口，殺意被包成普通街景。" },
        { enemyId: "sakamoto-lab-assassin", title: "實驗室刺客", text: "改造刺客貼著貨架滑行，刀光切過促銷標籤。" },
        { enemyId: "sakamoto-order-rogue", title: "ORDER叛離者", text: "黑衣殺手在便利店燈下停步，殺氣安靜得像結帳前的等待。" },
        { enemyId: "sakamoto-slur-network", title: "X網路核心", text: "城市地圖上每盞燈都變成暗殺坐標，家族照片被標成最高優先級。" }
      ]
    }
  };

  const characters = [
    { id: "denji-chainsaw", name: "淀治", role: "鏈鋸惡魔心臟者", faction: "鏈鋸人", factionId: "chainsaw-man", maxHp: 112, stress: 22, energyContribution: 0, passiveId: "opening-overdrive", passiveText: "隱藏人物。第一回合額外獲得 2 能量，但自身壓力 +8；拉繩聲會把恐懼變成鏈鋸轉速。", signatureCardId: "denji-chainsaw-ripcord", unlock: "hidden-chainsaw-reze", hidden: true },
    { id: "reze-bomb-devil", name: "蕾塞", role: "炸彈惡魔混血", faction: "鏈鋸人", factionId: "chainsaw-man", maxHp: 94, stress: 16, energyContribution: 0, passiveId: "first-attack-burn", passiveText: "每回合第一張攻擊牌使命中目標燃燒 4 點。爆風會先把敵人的陣形炸開。", signatureCardId: "reze-bomb-flower", unlock: "chainsaw-man-reze-arc" },
    { id: "aki-hayakawa", name: "早川秋", role: "公安惡魔獵人", faction: "鏈鋸人", factionId: "chainsaw-man", maxHp: 86, stress: 12, energyContribution: 1, passiveId: "first-tactic-discount", passiveText: "每回合第一張戰術牌費用 -1，最低為 0。契約會把最壞的下一秒提前攤開。", signatureCardId: "aki-fox-curse-contract", unlock: "chainsaw-man-reze-arc" },
    { id: "kafka-hibino", name: "日比野卡夫卡", role: "怪獸8號變身者", faction: "怪獸8號", factionId: "kaiju-no-8", maxHp: 126, stress: 18, energyContribution: -1, passiveId: "front-guard", passiveText: "隱藏人物。回合開始時前排與生命最低隊員獲得 4 護甲；怪獸核心會先替防線吃下最重的撞擊。", signatureCardId: "kafka-kaiju-core-smash", unlock: "hidden-kaiju-no-8-core", hidden: true },
    { id: "mina-ashiro", name: "亞白米娜", role: "防衛隊第三部隊隊長", faction: "怪獸8號", factionId: "kaiju-no-8", maxHp: 92, stress: 8, energyContribution: 1, passiveId: "first-heavy-attack", passiveText: "每回合第一張費用 2 以上的攻擊牌傷害 +6。重炮開火前，所有怪獸都會被迫露出核心。", signatureCardId: "mina-heavy-cannon-line", unlock: "kaiju-no-8-defense-force" },
    { id: "kikoru-shinomiya", name: "四之宮琪歌露", role: "怪獸兵器斧槍精英", faction: "怪獸8號", factionId: "kaiju-no-8", maxHp: 98, stress: 10, energyContribution: 0, passiveId: "second-card-strike", passiveText: "每回合打出第二張牌時，追加 5 點傷害。怪獸武器會把第二擊壓成破核斬。", signatureCardId: "kikoru-axe-weapon-release", unlock: "kaiju-no-8-defense-force" },
    { id: "rudo-gachiakuta", name: "路德", role: "淨化人器物使", faction: "Gachiakuta", factionId: "gachiakuta", maxHp: 104, stress: 20, energyContribution: 0, passiveId: "status-exploit", passiveText: "隱藏人物。攻擊帶有負面狀態的敵人時，傷害 +6。被丟棄之物會反過來咬住深淵。", signatureCardId: "rudo-jinki-trash-fury", unlock: "hidden-gachiakuta-jinki", hidden: true },
    { id: "enjin-gachiakuta", name: "恩金", role: "清道夫傘刃隊長", faction: "Gachiakuta", factionId: "gachiakuta", maxHp: 102, stress: 11, energyContribution: 1, passiveId: "first-guard-weak", passiveText: "每回合第一張防護牌使所有敵人虛弱 3 點。傘刃張開時，垃圾獸的撲擊會慢半拍。", signatureCardId: "enjin-umbrella-jinki", unlock: "gachiakuta-pit-cleaners" },
    { id: "riyoh-gachiakuta", name: "莉尤", role: "清道夫剪刃突擊手", faction: "Gachiakuta", factionId: "gachiakuta", maxHp: 84, stress: 9, energyContribution: 0, passiveId: "first-attack-pierce", passiveText: "每回合第一張攻擊牌穿透敵方護甲。剪刃會把垃圾獸外殼拆成下一次切入點。", signatureCardId: "riyoh-scissor-jinki", unlock: "gachiakuta-pit-cleaners" },
    { id: "taro-sakamoto", name: "坂本太郎", role: "退休傳說殺手", faction: "坂本日常", factionId: "sakamoto-days", maxHp: 108, stress: 7, energyContribution: 0, passiveId: "first-attack-pierce", passiveText: "隱藏人物。每回合第一張攻擊牌穿透護甲；便利店收銀台也能變成戰場中心。", signatureCardId: "sakamoto-shop-counter", unlock: "hidden-sakamoto-family", hidden: true },
    { id: "shin-asakura", name: "朝倉新", role: "讀心殺手助手", faction: "坂本日常", factionId: "sakamoto-days", maxHp: 78, stress: 8, energyContribution: 2, passiveId: "intent-draw", passiveText: "敵人準備防禦或施壓時，回合開始額外抽 1 張牌。讀心會先把敵人的殺意翻成路線圖。", signatureCardId: "shin-esp-counter", unlock: "sakamoto-days-assassin-order" },
    { id: "lu-shaotang", name: "陸少糖", role: "醉拳黑幫繼承人", faction: "坂本日常", factionId: "sakamoto-days", maxHp: 88, stress: 10, energyContribution: 0, passiveId: "second-card-strike", passiveText: "每回合打出第二張牌時，追加 5 點傷害。醉拳的第二拍才是真正的反擊。", signatureCardId: "lu-drunken-counter", unlock: "sakamoto-days-assassin-order" }
  ];

  const customTags = [
    { id: "devil-hybrid-heart", name: "惡魔混血心臟", family: "惡魔契約", tier: "A", cost: 8600, art: "./src/assets/generated/skill-denji-chainsaw-ripcord.png", text: "第一回合能量 +1；攻擊牌傷害 +2；回合開始全隊壓力 +1。", effects: { openingEnergy: 1, attackBonus: 2, turnStressAll: 1 } },
    { id: "bomb-devil-spark", name: "炸彈惡魔火花", family: "惡魔契約", tier: "A", cost: 8000, art: "./src/assets/generated/skill-reze-bomb-flower.png", text: "第一張攻擊牌燃燒 +8；攻擊燃燒敵人時傷害 +3。", effects: { firstAttackBurn: 8, statusExploitBonus: 3 } },
    { id: "kaiju-core-adaptation", name: "怪獸核心適應", family: "怪獸化", tier: "A", cost: 8800, art: "./src/assets/generated/skill-kafka-kaiju-core-smash.png", text: "最大生命 +18；每回合第 5 張牌造成 6 穿甲群體傷害。", effects: { maxHp: 18, fifthCardDamageAll: 6 } },
    { id: "defense-force-suit", name: "防衛隊解放戰鬥服", family: "怪獸兵器", tier: "B", cost: 3800, art: "./src/assets/generated/skill-mina-heavy-cannon-line.png", text: "開場抽 1 張牌；第一張攻擊牌穿甲。", effects: { openingDraw: 1, firstAttackPierce: 1 } },
    { id: "jinki-trash-soul", name: "人器·垃圾魂", family: "人器", tier: "A", cost: 7800, art: "./src/assets/generated/skill-rudo-jinki-trash-fury.png", text: "攻擊帶狀態敵人傷害 +6；每回合第 3 張牌抽 1 張。", effects: { statusExploitBonus: 6, thirdCardDraw: 1 } },
    { id: "cleaner-giver-arts", name: "清道夫給予者技藝", family: "人器", tier: "B", cost: 3400, art: "./src/assets/generated/skill-enjin-umbrella-jinki.png", text: "回合開始全隊獲得 3 護甲；第一張防護牌使敵人虛弱 3 點。", effects: { turnBlockAll: 3, firstGuardWeakAll: 3 } },
    { id: "assassin-flow-state", name: "殺手流心", family: "暗殺術", tier: "A", cost: 7600, art: "./src/assets/generated/skill-sakamoto-shop-counter.png", text: "第一張攻擊牌穿甲；每回合第 2 張牌追加 6 穿甲傷害。", effects: { firstAttackPierce: 1, secondCardDamage: 6 } },
    { id: "esp-mind-read", name: "讀心預判", family: "超能力", tier: "B", cost: 3600, art: "./src/assets/generated/skill-shin-esp-counter.png", text: "開場抽 1 張牌；第一張戰術牌抽 1 張並使敵人虛弱 3 點。", effects: { openingDraw: 1, firstTacticDraw: 1, firstTacticWeakAll: 3 } }
  ];

  const customMutations = [
    { id: "blackfire-devil-hybrid", name: "黑火惡魔混血", requiredTags: ["devil-hybrid-heart", "black-flame-seed"], art: "./src/assets/generated/skill-denji-chainsaw-ripcord.png", text: "第一回合能量 +1；第一張攻擊牌燃燒 +10；攻擊帶狀態敵人時傷害 +5。", effects: { openingEnergy: 1, firstAttackBurn: 10, statusExploitBonus: 5 } },
    { id: "kaiju-super-soldier-core", name: "超兵怪獸核心", requiredTags: ["kaiju-core-adaptation", "super-soldier-serum"], art: "./src/assets/generated/skill-kafka-kaiju-core-smash.png", text: "最大生命 +28；開場護甲 +12；攻擊牌傷害 +3。", effects: { maxHp: 28, openingBlockAll: 12, attackBonus: 3 } },
    { id: "jinki-inner-qi-repair", name: "人器內息修復", requiredTags: ["jinki-trash-soul", "inner-qi-breath"], art: "./src/assets/generated/skill-rudo-jinki-trash-fury.png", text: "攻擊帶狀態敵人傷害 +7；回合開始全隊恢復 2 生命並獲得 3 護甲。", effects: { statusExploitBonus: 7, turnHealAll: 2, turnBlockAll: 3 } },
    { id: "assassin-spider-read", name: "殺手蛛感預讀", requiredTags: ["assassin-flow-state", "spider-sense"], art: "./src/assets/generated/skill-sakamoto-shop-counter.png", text: "開場抽 2 張牌並獲得 1 次閃避；第 2 張牌追加 8 穿甲傷害。", effects: { openingDraw: 2, openingEvade: 1, secondCardDamage: 8 } }
  ];

  const cards = [
    { id: "denji-chainsaw-ripcord", name: "淀治·拉繩鏈鋸狂斬", category: "signature", type: "attack", rarity: "signature", cost: 3, damageAll: 36, pierce: true, gainEnergy: 1, addStress: 7, text: "拉繩聲爆開，穿透護甲對所有敵人造成 36 傷害，獲得 1 能量；全隊壓力 +7。", upgrade: { damageAll: 54, addStress: 3 }, tags: ["淀治", "鏈鋸"] },
    { id: "reze-bomb-flower", name: "蕾塞·炸彈花火", category: "signature", type: "attack", rarity: "signature", cost: 2, damageAll: 26, burnAll: 8, evadeOwner: 1, text: "爆風像花一樣開在雨夜，對所有敵人造成 26 傷害並燃燒 8 點，蕾塞獲得 1 次閃避。", upgrade: { damageAll: 38, burnAll: 12 }, tags: ["蕾塞", "炸彈惡魔"] },
    { id: "aki-fox-curse-contract", name: "早川秋·狐狸與詛咒契約", category: "signature", type: "tactic", rarity: "signature", cost: 2, draw: 2, weakAll: 5, stunTarget: 1, addStress: 3, text: "契約同時張口，抽 2 張牌，使所有敵人虛弱 5 點並封鎖目標下一次行動；壓力 +3。", upgrade: { draw: 3, weakAll: 8, addStress: 1 }, tags: ["早川秋", "契約"] },
    { id: "csm-chainsaw-blood-saw", name: "鏈鋸血鋸突入", category: "general", type: "attack", rarity: "rare", cost: 2, damage: 36, pierce: true, burnTarget: 5, addStress: 2, text: "穿透護甲造成 36 傷害並燃燒 5 點；全隊壓力 +2。惡魔恐懼會餵高鏈鋸轉速。", upgrade: { damage: 52, burnTarget: 8, addStress: 0 }, tags: ["鏈鋸人", "惡魔"], sourceId: "chainsaw-man", sourceName: "鏈鋸人" },
    { id: "csm-public-safety-contract", name: "公安契約封鎖", category: "general", type: "tactic", rarity: "rare", cost: 1, draw: 1, weakAll: 5, blockAll: 10, text: "抽 1 張牌，所有敵人虛弱 5 點，全隊獲得 10 護甲。契約不是希望，只是把死亡排隊。", upgrade: { draw: 2, weakAll: 8, blockAll: 16 }, tags: ["鏈鋸人", "公安"], sourceId: "chainsaw-man", sourceName: "鏈鋸人" },
    { id: "kafka-kaiju-core-smash", name: "卡夫卡·怪獸核心重拳", category: "signature", type: "attack", rarity: "signature", cost: 3, damage: 54, pierce: true, damageAll: 18, blockAll: 14, text: "怪獸核心爆發，穿透護甲造成 54 單體傷害與 18 群體傷害，全隊獲得 14 護甲。", upgrade: { damage: 76, damageAll: 28, blockAll: 22 }, tags: ["卡夫卡", "怪獸8號"] },
    { id: "mina-heavy-cannon-line", name: "米娜·重炮殲滅線", category: "signature", type: "attack", rarity: "signature", cost: 3, damageAll: 38, pierce: true, weakAll: 6, text: "防衛隊重炮校準，穿透護甲對所有敵人造成 38 傷害，所有敵人虛弱 6 點。", upgrade: { damageAll: 56, weakAll: 9 }, tags: ["米娜", "防衛隊"] },
    { id: "kikoru-axe-weapon-release", name: "琪歌露·怪獸兵器斧槍", category: "signature", type: "attack", rarity: "signature", cost: 2, damage: 40, pierce: true, draw: 1, evadeOwner: 1, text: "斧槍釋放怪獸兵器出力，穿透護甲造成 40 傷害，抽 1 張牌，琪歌露獲得 1 次閃避。", upgrade: { damage: 58, draw: 2 }, tags: ["琪歌露", "怪獸兵器"] },
    { id: "kaiju-defense-force-volley", name: "防衛隊集中齊射", category: "general", type: "attack", rarity: "rare", cost: 2, damageAll: 24, pierce: true, weakAll: 4, text: "穿透護甲對所有敵人造成 24 傷害並虛弱 4 點。彈道全都指向怪獸核心。", upgrade: { damageAll: 36, weakAll: 7 }, tags: ["怪獸8號", "防衛隊"], sourceId: "kaiju-no-8", sourceName: "怪獸8號" },
    { id: "kaiju-suit-release", name: "解放戰鬥服同步", category: "general", type: "guard", rarity: "uncommon", cost: 1, blockAll: 18, draw: 1, gainEnergy: 1, text: "全隊獲得 18 護甲，抽 1 張牌並獲得 1 能量。戰鬥服把恐懼壓進出力表。", upgrade: { blockAll: 28, draw: 2 }, tags: ["怪獸8號", "戰鬥服"], sourceId: "kaiju-no-8", sourceName: "怪獸8號" },
    { id: "rudo-jinki-trash-fury", name: "路德·人器垃圾怒潮", category: "signature", type: "attack", rarity: "signature", cost: 2, damageAll: 24, weakAll: 5, poisonAll: 4, draw: 1, text: "被拋棄之物翻湧成武器，對所有敵人造成 24 傷害，虛弱 5 點並中毒 4 點，抽 1 張牌。", upgrade: { damageAll: 36, weakAll: 8, poisonAll: 7 }, tags: ["路德", "人器"] },
    { id: "enjin-umbrella-jinki", name: "恩金·傘刃清掃", category: "signature", type: "guard", rarity: "signature", cost: 2, damageAll: 18, blockAll: 30, weakAll: 4, text: "傘刃張開清掃垃圾獸，對所有敵人造成 18 傷害，全隊獲得 30 護甲，敵人虛弱 4 點。", upgrade: { damageAll: 26, blockAll: 44, weakAll: 7 }, tags: ["恩金", "清道夫"] },
    { id: "riyoh-scissor-jinki", name: "莉尤·剪刃拆殼", category: "signature", type: "attack", rarity: "signature", cost: 1, damage: 28, pierce: true, draw: 1, weakTarget: 5, text: "剪刃拆開外殼，穿透護甲造成 28 傷害，使目標虛弱 5 點，抽 1 張牌。", upgrade: { damage: 42, weakTarget: 8, draw: 2 }, tags: ["莉尤", "剪刃"] },
    { id: "gachiakuta-cleaner-rush", name: "清道夫深淵突入", category: "general", type: "attack", rarity: "uncommon", cost: 2, damageAll: 18, poisonAll: 4, weakAll: 3, text: "對所有敵人造成 18 傷害，中毒 4 點並虛弱 3 點。垃圾場的每一步都會把敵人拖進泥裡。", upgrade: { damageAll: 28, poisonAll: 7, weakAll: 5 }, tags: ["Gachiakuta", "清道夫"], sourceId: "gachiakuta", sourceName: "Gachiakuta" },
    { id: "gachiakuta-jinki-repair", name: "人器修復節奏", category: "general", type: "support", rarity: "rare", cost: 1, healAll: 6, blockAll: 12, draw: 1, text: "全隊恢復 6 生命，獲得 12 護甲，抽 1 張牌。被丟棄的東西重新找到用途。", upgrade: { healAll: 10, blockAll: 18, draw: 2 }, tags: ["Gachiakuta", "人器"], sourceId: "gachiakuta", sourceName: "Gachiakuta" },
    { id: "sakamoto-shop-counter", name: "坂本·便利店反殺", category: "signature", type: "attack", rarity: "signature", cost: 2, damage: 42, pierce: true, blockAll: 10, draw: 1, text: "收銀台、罐頭與購物籃同時變成武器，穿透護甲造成 42 傷害，全隊獲得 10 護甲，抽 1 張牌。", upgrade: { damage: 60, blockAll: 18, draw: 2 }, tags: ["坂本", "殺手"] },
    { id: "shin-esp-counter", name: "新·讀心反制", category: "signature", type: "tactic", rarity: "signature", cost: 1, draw: 2, weakAll: 4, evadeAll: 1, text: "讀出下一秒殺意，抽 2 張牌，所有敵人虛弱 4 點，全隊獲得 1 次閃避。", upgrade: { draw: 3, weakAll: 7 }, tags: ["新", "讀心"] },
    { id: "lu-drunken-counter", name: "少糖·醉拳迴旋", category: "signature", type: "attack", rarity: "signature", cost: 2, damageAll: 22, stunTarget: 1, reduceStress: 5, text: "醉拳踩亂刺客節奏，對所有敵人造成 22 傷害，封鎖目標下一次行動，全隊壓力 -5。", upgrade: { damageAll: 34, reduceStress: 8 }, tags: ["少糖", "醉拳"] },
    { id: "sakamoto-order-feint", name: "ORDER佯攻拆招", category: "general", type: "tactic", rarity: "rare", cost: 1, draw: 2, weakAll: 4, gainEnergy: 1, text: "抽 2 張牌，所有敵人虛弱 4 點，獲得 1 能量。真正的殺招永遠在日常動作後面。", upgrade: { draw: 3, weakAll: 7 }, tags: ["坂本日常", "ORDER"], sourceId: "sakamoto-days", sourceName: "坂本日常" },
    { id: "sakamoto-family-rule", name: "家族規則不殺線", category: "general", type: "guard", rarity: "uncommon", cost: 1, blockAll: 16, reduceStress: 6, counterDamage: 6, text: "全隊獲得 16 護甲，壓力 -6，下一次反擊更重。守住日常比殺人更難。", upgrade: { blockAll: 26, reduceStress: 9, counterDamage: 10 }, tags: ["坂本日常", "家族"], sourceId: "sakamoto-days", sourceName: "坂本日常" }
  ];

  const equipment = [
    { id: "pochita-heart-core", name: "波奇塔心臟核心", rarity: "legendary", effect: "openingEnergy", amount: 1, upgradedAmount: 2, text: "第一回合額外獲得 1 能量。小小心臟會在最壞時刻開始轟鳴。", sourceId: "chainsaw-equipment", sourceName: "惡魔獵人裝備" },
    { id: "public-safety-devil-contract", name: "公安惡魔契約書", rarity: "rare", effect: "openingDraw", amount: 2, upgradedAmount: 3, text: "每場戰鬥第一回合額外抽 2 張牌。代價寫得越細，活路越早出現。", sourceId: "chainsaw-equipment", sourceName: "惡魔獵人裝備" },
    { id: "number-eight-core-sample", name: "怪獸8號核心樣本", rarity: "legendary", effect: "turnBlock", amount: 7, upgradedAmount: 11, text: "回合開始全隊獲得 7 護甲。核心樣本會把怪獸壓力轉成防線。", sourceId: "kaiju-equipment", sourceName: "防衛隊兵裝" },
    { id: "defense-force-battle-suit", name: "防衛隊解放戰鬥服", rarity: "rare", effect: "firstAttackPierce", amount: 8, upgradedAmount: 12, text: "每回合第一張攻擊牌穿透護甲，並額外造成 8 點傷害。出力上限決定第一擊能不能破核。", sourceId: "kaiju-equipment", sourceName: "防衛隊兵裝" },
    { id: "rudo-jinki-gloves", name: "路德的人器手套", rarity: "legendary", effect: "attackBonus", amount: 5, upgradedAmount: 8, text: "持有者存活時，所有攻擊牌傷害 +5。被丟棄的物件終於有了反擊重量。", sourceId: "gachiakuta-equipment", sourceName: "清道夫人器" },
    { id: "cleaner-mask-filter", name: "清道夫防塵面罩", rarity: "rare", effect: "turnStressRelief", amount: 4, upgradedAmount: 6, text: "回合開始全隊壓力 -4。深淵臭氣被濾掉後，殺意也清楚不少。", sourceId: "gachiakuta-equipment", sourceName: "清道夫人器" },
    { id: "sakamoto-apron-armor", name: "坂本便利店圍裙", rarity: "legendary", effect: "openingEvade", amount: 1, upgradedAmount: 2, text: "每場戰鬥第一回合，全隊獲得 1 次閃避。看似日常的圍裙藏著傳說殺手的節奏。", sourceId: "sakamoto-equipment", sourceName: "殺手日常裝備" },
    { id: "shin-esp-headset", name: "新讀心耳機", rarity: "rare", effect: "openingDraw", amount: 2, upgradedAmount: 3, text: "每場戰鬥第一回合額外抽 2 張牌。殺意在扣下扳機前就會變成雜音。", sourceId: "sakamoto-equipment", sourceName: "殺手日常裝備" }
  ];

  const bloodlines = [
    { characterId: "denji-chainsaw", name: "鏈鋸惡魔混血", text: "拉繩鏈鋸狂斬額外造成 12 群體穿甲傷害，並獲得 1 能量。", sideStoryCost: { rewardPointCost: 12800, sideStoryCost: 5 }, effect: { extraDamageAll: 12, gainEnergy: 1, pierce: true } },
    { characterId: "reze-bomb-devil", name: "炸彈惡魔引信", text: "炸彈花火額外燃燒所有敵人 8 點，並讓蕾塞獲得 1 次閃避。", sideStoryCost: { rewardPointCost: 10600, sideStoryCost: 4 }, effect: { burnAll: 8, evadeOwner: 1 } },
    { characterId: "aki-hayakawa", name: "未來惡魔視線", text: "狐狸與詛咒契約額外抽 1 張牌，並封鎖所有敵人下一次行動。", sideStoryCost: { rewardPointCost: 10400, sideStoryCost: 4 }, effect: { draw: 1, stunAll: 1 } },
    { characterId: "kafka-hibino", name: "怪獸8號核心", text: "怪獸核心重拳額外提供全隊 14 護甲，並對所有敵人追加 10 穿甲傷害。", sideStoryCost: { rewardPointCost: 13200, sideStoryCost: 5 }, effect: { blockAll: 14, extraDamageAll: 10, pierce: true } },
    { characterId: "mina-ashiro", name: "隊長級砲擊校準", text: "重炮殲滅線額外造成 12 群體傷害，並使所有敵人再虛弱 5 點。", sideStoryCost: { rewardPointCost: 11000, sideStoryCost: 4 }, effect: { extraDamageAll: 12, weakAll: 5 } },
    { characterId: "kikoru-shinomiya", name: "怪獸兵器適配", text: "怪獸兵器斧槍造成 1.7 倍暴擊傷害，琪歌露獲得 1 次閃避。", sideStoryCost: { rewardPointCost: 10800, sideStoryCost: 4 }, effect: { criticalMultiplier: 1.7, evadeOwner: 1 } },
    { characterId: "rudo-gachiakuta", name: "人器垃圾魂", text: "人器垃圾怒潮額外使所有敵人中毒 6 點，攻擊帶狀態敵人時傷害更高。", sideStoryCost: { rewardPointCost: 10800, sideStoryCost: 4 }, effect: { poisonAll: 6, statusExploitBonus: 5 } },
    { characterId: "enjin-gachiakuta", name: "清道夫傘刃節奏", text: "傘刃清掃額外提供全隊 12 護甲，並使所有敵人再虛弱 4 點。", sideStoryCost: { rewardPointCost: 9800, sideStoryCost: 4 }, effect: { blockAll: 12, weakAll: 4 } },
    { characterId: "riyoh-gachiakuta", name: "剪刃拆殼本能", text: "剪刃拆殼額外造成 12 傷害，並再抽 1 張牌。", sideStoryCost: { rewardPointCost: 9200, sideStoryCost: 3 }, effect: { extraDamage: 12, draw: 1 } },
    { characterId: "taro-sakamoto", name: "傳說殺手流心", text: "便利店反殺造成 1.7 倍暴擊傷害，並額外提供全隊 12 護甲。", sideStoryCost: { rewardPointCost: 12000, sideStoryCost: 5 }, effect: { criticalMultiplier: 1.7, blockAll: 12 } },
    { characterId: "shin-asakura", name: "讀心超能力", text: "讀心反制額外抽 1 張牌，全隊再獲得 1 次閃避。", sideStoryCost: { rewardPointCost: 9400, sideStoryCost: 4 }, effect: { draw: 1, evadeAll: 1 } },
    { characterId: "lu-shaotang", name: "醉拳黑幫血脈", text: "醉拳迴旋額外造成 10 群體傷害，並降低全隊 5 壓力。", sideStoryCost: { rewardPointCost: 9000, sideStoryCost: 3 }, effect: { extraDamageAll: 10, reduceStress: 5 } }
  ];

  const enemies = [
    { id: "csm-devil-hunter-zombie-pack", name: "惡魔獵人屍偶群", maxHp: 360, stressAura: 17, intents: [{ kind: "cleave", label: "屍偶亂咬", amount: 30, targetMode: "all" }, { kind: "attack", label: "惡魔爪擊", amount: 58, targetMode: "random" }, { kind: "guard", label: "肉牆推進", amount: 42 }] },
    { id: "csm-typhoon-devil", name: "颱風惡魔", maxHp: 560, stressAura: 24, regen: 10, intents: [{ kind: "cleave", label: "雨夜龍捲", amount: 44, targetMode: "all" }, { kind: "stress", label: "城市翻覆", amount: 38, targetMode: "all" }, { kind: "regen", label: "風眼重組", amount: 44, block: 26 }] },
    { id: "csm-bomb-devil-runaway", name: "炸彈惡魔追擊體", maxHp: 760, stressAura: 30, intents: [{ kind: "attack", label: "引信踢擊", amount: 98, targetMode: "front" }, { kind: "cleave", label: "爆風掃街", amount: 52, targetMode: "all" }, { kind: "stress", label: "雨中告別", amount: 46, targetMode: "all" }, { kind: "guard", label: "煙塵退場", amount: 62 }] },
    { id: "csm-gun-devil-echo", name: "槍之惡魔殘響", maxHp: 1120, stressAura: 40, intents: [{ kind: "cleave", label: "彈雨秒殺", amount: 68, targetMode: "all" }, { kind: "attack", label: "遠距點名", amount: 138, targetMode: "random" }, { kind: "stress", label: "恐懼名單", amount: 70, targetMode: "all" }, { kind: "guard", label: "災害殘影", amount: 80 }] },
    { id: "kaiju-yoju-swarm", name: "餘獸群", maxHp: 380, stressAura: 16, intents: [{ kind: "cleave", label: "群體衝撞", amount: 30, targetMode: "all" }, { kind: "attack", label: "爪牙撕裂", amount: 58, targetMode: "front" }, { kind: "guard", label: "甲殼伏低", amount: 42 }] },
    { id: "kaiju-honju-raid", name: "本獸突襲體", maxHp: 620, stressAura: 24, regen: 10, intents: [{ kind: "attack", label: "核心撞擊", amount: 92, targetMode: "front" }, { kind: "cleave", label: "巨尾掃城", amount: 46, targetMode: "all" }, { kind: "regen", label: "怪獸組織再生", amount: 44, block: 26 }] },
    { id: "kaiju-no-9-cell", name: "怪獸9號細胞分身", maxHp: 760, stressAura: 30, regen: 18, intents: [{ kind: "stress", label: "人形偽裝", amount: 48, targetMode: "all" }, { kind: "attack", label: "細胞穿刺", amount: 104, targetMode: "random" }, { kind: "regen", label: "吸收重構", amount: 62, block: 34 }, { kind: "guard", label: "樣本吞噬", amount: 58 }] },
    { id: "kaiju-no-10-fortress", name: "怪獸10號要塞體", maxHp: 1160, stressAura: 42, regen: 22, intents: [{ kind: "cleave", label: "要塞級衝鋒", amount: 70, targetMode: "all" }, { kind: "attack", label: "核心咬殺", amount: 146, targetMode: "front" }, { kind: "stress", label: "識別怪獸8號", amount: 68, targetMode: "all" }, { kind: "regen", label: "戰鬥進化", amount: 78, block: 46 }] },
    { id: "gachiakuta-trash-beast", name: "垃圾獸", maxHp: 350, stressAura: 17, intents: [{ kind: "attack", label: "腐爛撲咬", amount: 58, targetMode: "random" }, { kind: "stress", label: "惡臭壓迫", amount: 28, targetMode: "all" }, { kind: "guard", label: "廢料外殼", amount: 40 }] },
    { id: "gachiakuta-vandal-raider", name: "破壞者掠奪隊", maxHp: 480, stressAura: 20, intents: [{ kind: "cleave", label: "廢刃亂砍", amount: 36, targetMode: "all" }, { kind: "attack", label: "深淵伏擊", amount: 74, targetMode: "front" }, { kind: "guard", label: "垃圾掩體", amount: 50 }] },
    { id: "gachiakuta-vital-instrument-hunter", name: "人器獵手", maxHp: 680, stressAura: 26, intents: [{ kind: "attack", label: "奪器斬", amount: 96, targetMode: "random" }, { kind: "cleave", label: "器物破碎", amount: 48, targetMode: "all" }, { kind: "stress", label: "拋棄審判", amount: 44, targetMode: "all" }, { kind: "guard", label: "奪來的外殼", amount: 60 }] },
    { id: "gachiakuta-pit-apostle", name: "深淵使徒", maxHp: 1040, stressAura: 38, regen: 18, intents: [{ kind: "cleave", label: "深淵坍塌", amount: 64, targetMode: "all" }, { kind: "attack", label: "垃圾王冠處刑", amount: 132, targetMode: "front" }, { kind: "stress", label: "天界棄置", amount: 66, targetMode: "all" }, { kind: "regen", label: "廢棄物再構", amount: 70, block: 42 }] },
    { id: "sakamoto-hitman-squad", name: "懸賞殺手小隊", maxHp: 330, stressAura: 14, intents: [{ kind: "attack", label: "消音點射", amount: 54, targetMode: "random" }, { kind: "guard", label: "店外包圍", amount: 38 }, { kind: "stress", label: "懸賞廣播", amount: 26, targetMode: "all" }] },
    { id: "sakamoto-lab-assassin", name: "實驗室刺客", maxHp: 500, stressAura: 20, intents: [{ kind: "cleave", label: "改造刀線", amount: 38, targetMode: "all" }, { kind: "attack", label: "瞬步背刺", amount: 78, targetMode: "random" }, { kind: "guard", label: "藥物強化", amount: 50 }] },
    { id: "sakamoto-order-rogue", name: "ORDER叛離者", maxHp: 720, stressAura: 27, intents: [{ kind: "attack", label: "一擊處刑", amount: 102, targetMode: "front" }, { kind: "cleave", label: "暗器清場", amount: 50, targetMode: "all" }, { kind: "stress", label: "殺手威壓", amount: 44, targetMode: "all" }, { kind: "guard", label: "反制站位", amount: 62 }] },
    { id: "sakamoto-slur-network", name: "X網路核心", maxHp: 1080, stressAura: 40, intents: [{ kind: "stress", label: "殺手名單重排", amount: 68, targetMode: "all" }, { kind: "cleave", label: "同步暗殺令", amount: 64, targetMode: "all" }, { kind: "attack", label: "定點清除", amount: 136, targetMode: "random" }, { kind: "guard", label: "情報封鎖", amount: 76 }] }
  ];

  const encounters = [
    { id: "csm-cafe-rain-devils", name: "咖啡店雨夜惡魔", tier: "normal", enemies: ["csm-devil-hunter-zombie-pack", "csm-typhoon-devil"], rewardPoints: 7600 },
    { id: "csm-school-bomb-run", name: "學校夜路炸彈追擊", tier: "normal", enemies: ["csm-bomb-devil-runaway"], rewardPoints: 8200 },
    { id: "csm-public-safety-crossfire", name: "公安交叉火線", tier: "elite", enemies: ["csm-typhoon-devil", "csm-devil-hunter-zombie-pack"], rewardPoints: 10800 },
    { id: "csm-reze-station-duel", name: "車站爆風決鬥", tier: "miniboss", enemies: ["csm-bomb-devil-runaway"], rewardPoints: 15400 },
    { id: "csm-gun-devil-echo", name: "槍之惡魔殘響", tier: "boss", enemies: ["csm-gun-devil-echo"], rewardPoints: 25500 },
    { id: "kaiju-harbor-yoju", name: "港區餘獸清剿", tier: "normal", enemies: ["kaiju-yoju-swarm", "kaiju-yoju-swarm"], rewardPoints: 7400 },
    { id: "kaiju-third-division-raid", name: "第三部隊本獸突襲", tier: "normal", enemies: ["kaiju-honju-raid", "kaiju-yoju-swarm"], rewardPoints: 8200 },
    { id: "kaiju-no9-infiltration", name: "怪獸9號潛入", tier: "elite", enemies: ["kaiju-no-9-cell", "kaiju-honju-raid"], rewardPoints: 11200 },
    { id: "kaiju-no8-identity-lock", name: "怪獸8號身份封鎖", tier: "miniboss", enemies: ["kaiju-no-9-cell"], rewardPoints: 16000 },
    { id: "kaiju-no10-fortress-battle", name: "怪獸10號要塞戰", tier: "boss", enemies: ["kaiju-no-10-fortress"], rewardPoints: 26500 },
    { id: "gachiakuta-pit-trash-beasts", name: "深淵垃圾獸群", tier: "normal", enemies: ["gachiakuta-trash-beast", "gachiakuta-trash-beast"], rewardPoints: 7000 },
    { id: "gachiakuta-cleaner-ambush", name: "清道夫遭遇戰", tier: "normal", enemies: ["gachiakuta-vandal-raider", "gachiakuta-trash-beast"], rewardPoints: 7800 },
    { id: "gachiakuta-vital-hunter", name: "人器獵手拆殼", tier: "elite", enemies: ["gachiakuta-vital-instrument-hunter", "gachiakuta-vandal-raider"], rewardPoints: 10600 },
    { id: "gachiakuta-vandal-core", name: "破壞者核心戰", tier: "miniboss", enemies: ["gachiakuta-vital-instrument-hunter"], rewardPoints: 14800 },
    { id: "gachiakuta-pit-apostle", name: "深淵使徒終局", tier: "boss", enemies: ["gachiakuta-pit-apostle"], rewardPoints: 24200 },
    { id: "sakamoto-store-bounty", name: "坂本商店懸賞", tier: "normal", enemies: ["sakamoto-hitman-squad", "sakamoto-hitman-squad"], rewardPoints: 6800 },
    { id: "sakamoto-lab-route", name: "實驗室刺客路線", tier: "normal", enemies: ["sakamoto-lab-assassin", "sakamoto-hitman-squad"], rewardPoints: 7600 },
    { id: "sakamoto-order-collision", name: "ORDER撞線", tier: "elite", enemies: ["sakamoto-order-rogue", "sakamoto-lab-assassin"], rewardPoints: 10400 },
    { id: "sakamoto-family-hostage-line", name: "家族線危機", tier: "miniboss", enemies: ["sakamoto-order-rogue"], rewardPoints: 14600 },
    { id: "sakamoto-slur-network", name: "X網路核心", tier: "boss", enemies: ["sakamoto-slur-network"], rewardPoints: 23800 }
  ];

  const characterSources = [
    { id: "chainsaw-man", name: "鏈鋸人", description: "淀治、蕾塞與早川秋在雨夜爆風裡把惡魔契約推成可控戰線。", heroFileName: "roster-hero-chainsaw-man.png", memberIds: ["denji-chainsaw", "reze-bomb-devil", "aki-hayakawa"] },
    { id: "kaiju-no-8", name: "怪獸8號", description: "卡夫卡、米娜與琪歌露共同守住防衛隊核心與怪獸身份線。", heroFileName: "roster-hero-kaiju-no-8.png", memberIds: ["kafka-hibino", "mina-ashiro", "kikoru-shinomiya"] },
    { id: "gachiakuta", name: "Gachiakuta", description: "路德、恩金與莉尤把深淵垃圾場、人器與清道夫規則轉為反擊。", heroFileName: "roster-hero-gachiakuta.png", memberIds: ["rudo-gachiakuta", "enjin-gachiakuta", "riyoh-gachiakuta"] },
    { id: "sakamoto-days", name: "坂本日常", description: "坂本、新與少糖用不殺規則、讀心與醉拳守住殺手世界裡的日常。", heroFileName: "roster-hero-sakamoto-days.png", memberIds: ["taro-sakamoto", "shin-asakura", "lu-shaotang"] }
  ];
  const cardSources = [
    { id: "chainsaw-man", name: "鏈鋸人", description: "鏈鋸、爆風、惡魔契約與公安封鎖，偏穿甲、燃燒、抽牌與壓力代價。" },
    { id: "kaiju-no-8", name: "怪獸8號", description: "防衛隊火控、怪獸核心與戰鬥服同步，偏穿甲、護甲、能量與怪獸級爆發。" },
    { id: "gachiakuta", name: "Gachiakuta", description: "人器、清道夫與深淵垃圾場，偏中毒、虛弱、恢復與狀態增傷。" },
    { id: "sakamoto-days", name: "坂本日常", description: "殺手日常、ORDER佯攻與家族不殺線，偏穿甲、閃避、抽牌與非致命防線。" }
  ];
  const equipmentSources = [
    { id: "chainsaw-equipment", name: "惡魔獵人裝備", description: "波奇塔心臟核心與公安契約書，支援鏈鋸惡魔線的開場爆發與情報。" },
    { id: "kaiju-equipment", name: "防衛隊兵裝", description: "怪獸核心樣本與解放戰鬥服，強化防線與第一擊破核。" },
    { id: "gachiakuta-equipment", name: "清道夫人器", description: "人器手套與防塵面罩，讓深淵戰鬥更能利用狀態與抗壓。" },
    { id: "sakamoto-equipment", name: "殺手日常裝備", description: "便利店圍裙與讀心耳機，支援日常反殺、開場閃避與情報預判。" }
  ];

  const shop = [
    ...cards.filter((card) => card.category === "general").map((card, index) => ({ id: `shop-${card.id}`, kind: "card", itemId: card.id, rewardPointCost: 1800 + index * 180, stock: card.rarity === "rare" ? 1 : 2 })),
    ...equipment.map((item, index) => ({ id: `shop-${item.id}`, kind: "equipment", itemId: item.id, rewardPointCost: 5000 + index * 320, sideStoryCost: item.rarity === "legendary" ? 3 : 2, stock: 1 }))
  ];

  const bonds = [
    { id: "chainsaw-rain-contract", name: "雨夜契約三角", members: ["denji-chainsaw", "reze-bomb-devil", "aki-hayakawa"], text: "淀治、蕾塞與早川秋同時上陣。第一回合能量 +1；第一張攻擊牌燃燒 +6；回合開始壓力 +1。", effects: { openingEnergy: 1, firstAttackBurn: 6, turnStressAll: 1 } },
    { id: "kaiju-third-division-core", name: "第三部隊核心防線", members: ["kafka-hibino", "mina-ashiro", "kikoru-shinomiya"], text: "卡夫卡、米娜與琪歌露同時上陣。開場全隊獲得 14 護甲；所有攻擊牌傷害 +3。", effects: { openingBlockAll: 14, attackBonus: 3 } },
    { id: "gachiakuta-cleaner-jinki", name: "清道夫人器線", members: ["rudo-gachiakuta", "enjin-gachiakuta", "riyoh-gachiakuta"], text: "路德、恩金與莉尤同時上陣。攻擊帶狀態敵人時傷害 +6；回合開始全隊獲得 4 護甲。", effects: { statusExploitBonus: 6, turnBlockAll: 4 } },
    { id: "sakamoto-family-counter", name: "日常反殺規則", members: ["taro-sakamoto", "shin-asakura", "lu-shaotang"], text: "坂本、新與少糖同時上陣。開場抽 1 張牌並獲得 1 次閃避；每回合壓力 -2。", effects: { openingDraw: 1, openingEvade: 1, turnReduceStressAll: 2 } },
    { id: "cross-devil-black-flash-line", name: "鏈鋸黑閃血線", crossWorld: true, members: ["denji-chainsaw", "reze-bomb-devil", "aki-hayakawa", "yuji-itadori"], text: "鏈鋸人組與虎杖同時上陣。第一回合能量 +1；攻擊帶狀態敵人時傷害 +5。", effects: { openingEnergy: 1, statusExploitBonus: 5 } },
    { id: "cross-kaiju-jaeger-fireline", name: "怪獸機甲火線", crossWorld: true, members: ["kafka-hibino", "mina-ashiro", "kikoru-shinomiya", "mako-mori"], text: "怪獸8號組與森真子同時上陣。開場護甲 +16；第一張攻擊牌穿甲。", effects: { openingBlockAll: 16, firstAttackPierce: 1 } },
    { id: "cross-jinki-scavenger-route", name: "人器拾荒路線", crossWorld: true, members: ["rudo-gachiakuta", "enjin-gachiakuta", "riyoh-gachiakuta", "zhao-yingkong"], text: "Gachiakuta組與趙櫻空同時上陣。第二張牌追加 8 穿甲傷害；回合開始全隊護甲 +3。", effects: { secondCardDamage: 8, turnBlockAll: 3 } },
    { id: "cross-sakamoto-spy-counter", name: "便利店特工反制", crossWorld: true, members: ["taro-sakamoto", "shin-asakura", "lu-shaotang", "ada-wong"], text: "坂本日常組與艾達同時上陣。開場抽 2 張牌；第一張戰術牌使所有敵人虛弱 5 點。", effects: { openingDraw: 2, firstTacticWeakAll: 5 } }
  ];

  data.characters.push(...characters);
  data.customTags.push(...customTags);
  data.customMutations.push(...customMutations);
  data.cards.push(...cards);
  data.equipment.push(...equipment);
  data.bloodlines.push(...bloodlines);
  data.enemies.push(...enemies);
  data.encounters.push(...encounters);
  data.characterSources.push(...characterSources);
  data.cardSources.push(...cardSources);
  data.equipmentSources.push(...equipmentSources);
  data.shop.push(...shop);
  data.bonds.push(...bonds);
  data.legendaryRecruitmentPool.push("denji-chainsaw", "kafka-hibino", "rudo-gachiakuta", "taro-sakamoto");

  for (const scenario of scenarios) {
    scenario.opening = openings[scenario.id];
    data.scenarios.push(scenario);
    data.economy.scenarioSideStoryRewards[scenario.id] = 16;
    data.scenarioEventRoutes[scenario.id] = buildRoutes(scenario, data.characters.find((character) => character.id === scenario.hiddenProtagonistId));
  }

  function buildRoutes(scenario, hidden) {
    const hiddenName = hidden?.name || "核心人物";
    return [
      {
        id: `${scenario.id}-fixed-good-route`,
        routeType: "主角命運線",
        priority: "fixed",
        stage1: { id: `${scenario.id}-fixed-signal`, title: `追上${hiddenName}的命運線`, text: scenario.eventText },
        stage2: { id: `${scenario.id}-fixed-commit`, title: `把${scenario.subtitle}推向可控結局`, text: `放棄安全收益，集中所有資源改寫${scenario.name}的核心死亡節點。` },
        final: { id: `${scenario.id}-fixed-good-end`, title: `護住${hiddenName}關鍵線`, text: `讓${hiddenName}跨過最危險的瞬間，並把代表性力量帶回中洲隊。` },
        outcome: {
          title: `${scenario.name}命運線改寫`,
          text: `${hiddenName}的關鍵命運被改寫，${scenario.subtitle}不再照原本最壞的方向收束。`,
          effects: [{ type: "recruit-hidden" }, { type: "scenario-power" }, { type: "side-story", amount: 1 }],
          rewards: [`隱藏角色：${hiddenName}`, scenario.scenarioPowerName, "支線劇情 +1"],
          costs: ["主神記錄到你們對最新戰鬥劇本的高強度干涉。"],
          storyImpact: `${hiddenName}避開原本最壞的節點，主角線獲得明確改善。`,
          worldState: `${scenario.name}的核心事件被中洲隊推向可控方向。`
        }
      },
      {
        id: `${scenario.id}-power-route`,
        routeType: "劇本核心線",
        stage1: { id: `${scenario.id}-power-entry`, title: scenario.eventTitle, text: scenario.eventText },
        stage2: { id: `${scenario.id}-power-pressure`, title: `穩住${scenario.subtitle}`, text: scenario.scenarioPowerText },
        final: { id: `${scenario.id}-power-payoff`, title: scenario.scenarioPowerName, text: `不強行招募主角，改為把${scenario.name}的核心優勢變成本次遠征增益。` },
        outcome: {
          title: scenario.scenarioPowerName,
          text: scenario.scenarioPowerText,
          effects: [{ type: "scenario-power" }, { type: "reward-points", amount: 900 }],
          rewards: [`劇本增益：${scenario.scenarioPowerName}`, "獎勵點 +900"],
          costs: ["沒有直接取得隱藏主角。"],
          storyImpact: `${scenario.name}的核心危機被轉化成戰術優勢。`,
          worldState: `${scenario.subtitle}的危險資源被臨時納入中洲隊控制。`
        }
      },
      {
        id: `${scenario.id}-risk-route`,
        routeType: "風險支線",
        stage1: { id: `${scenario.id}-risk-entry`, title: "逆讀主神支線", text: "不走最穩的救援線，嘗試從劇情邊角取得額外資源。" },
        stage2: { id: `${scenario.id}-risk-deepen`, title: "讓危機多延燒一段", text: "放任危機多延燒一段，只為等更高價值的獎勵露出來。" },
        final: { id: `${scenario.id}-risk-payoff`, title: "在反噬前收手", text: "趁劇情完全崩壞前撤出，把代價和獎勵一起帶回主神空間。" },
        outcome: {
          title: "高風險支線回收",
          text: "你們搶在劇情反噬前回收一段危險資源，但隊伍承受額外壓力。",
          effects: [{ type: "rare-card" }, { type: "stress", amount: 18 }, { type: "reward-points", amount: 1200 }],
          rewards: ["稀有卡牌或等值補償", "獎勵點 +1200"],
          costs: ["出戰成員壓力 +18"],
          storyImpact: `${scenario.name}主線沒有完全改寫，但敵方少了一條支援路線。`,
          worldState: "主神承認這次高風險回收。"
        }
      }
    ];
  }
})(globalThis);
