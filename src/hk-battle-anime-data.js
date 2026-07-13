(function (global) {
  const data = global.MainGodData;
  if (!data) return;

  const packs = [
    {
      id: "black-clover-spade-raid",
      name: "黑色五葉草",
      sourceId: "black-clover",
      subtitle: "黑色暴牛突入黑桃王國",
      intro: "白光散去後，黑桃王國的魔力雲層壓在城塞上空。阿斯塔的斷魔之劍嗡鳴，尤諾的風精靈已經鎖定漆黑三極性。",
      eventText: "惡魔同化正在侵蝕戰場規則。若中洲隊能讓阿斯塔守住反魔法核心，黑色暴牛就能把惡魔門關回去。",
      powerName: "反魔法斷域",
      hidden: ["asta-anti-magic", "阿斯塔", "反魔法劍士", 108, 15, 0, "first-attack-pierce", "隱藏人物。每回合第一張攻擊牌穿透護甲；反魔法會把敵方護盾切成破綻。", "asta-demon-slasher", "hidden-black-clover-anti-magic"],
      allies: [
        ["yuno-spirit-dive", "尤諾", "風精靈魔導士", 94, 9, 1, "second-card-strike", "每回合打出第二張牌時追加 5 傷害。風精靈會把連段推到敵方後排。", "yuno-spirit-storm"],
        ["noelle-valkyrie", "諾艾兒", "海龍女武神", 100, 10, 0, "front-guard", "回合開始前排與生命最低隊員獲得 4 護甲。水銀鎧會先擋住最危險的衝鋒。", "noelle-sea-dragon"]
      ],
      recruitmentPool: ["yuno-spirit-dive", "noelle-valkyrie", "roy-mustang", "arthur-boyle", "maki-oze", "chu-xuan", "zhan-lan", "cheng-xiao", "zero", "lucy-kushinada"],
      enemies: [["clover-devil-minion", "下級惡魔群", 390, 18, "惡魔爪擊"], ["clover-dark-disciple", "黑桃魔導士", 620, 25, "咒域壓制"], ["clover-dark-triad-echo", "漆黑三極性殘影", 840, 34, "惡魔同化"], ["clover-lucifero-gate", "路西法羅魔門", 1220, 46, "重力惡魔王座"]],
      tagFamily: "反魔法",
      sourceDescription: "反魔法、風精靈與女武神水魔法，偏穿甲、護甲、連段與破盾。",
      equipment: [["anti-magic-grimoire", "五葉魔導書", "firstAttackPierce", 8], ["black-bull-robe", "黑色暴牛斗篷", "turnBlock", 6]],
      generalCards: [["clover-anti-magic-rush", "反魔法突入", "attack"], ["clover-mana-zone-guard", "魔力領域防線", "guard"]]
    },
    {
      id: "shangri-la-frontier-lycagon",
      name: "香格里拉・開拓異境",
      sourceId: "shangri-la-frontier",
      subtitle: "夜襲的狼王利卡翁",
      intro: "月色灑在虛擬荒野，利卡翁的咒印像黑色火花纏上桑樂。糞作獵人的直覺提醒他：這不是任務，是遊戲規則本身的狩獵。",
      eventText: "利卡翁的詛咒把逃跑路線全數封死。若桑樂能把破局直覺接上中洲隊戰術，這場 Boss 戰會變成可重玩的狩獵教材。",
      powerName: "糞作獵人破局",
      hidden: ["sunraku-lycagon-mark", "桑樂", "糞作獵人", 96, 12, 1, "intent-draw", "隱藏人物。敵人準備防禦或施壓時回合開始抽 1 張牌；破局直覺會先讀出爛系統漏洞。", "sunraku-critical-dodge", "hidden-shangri-la-frontier-lycagon"],
      allies: [
        ["psyger-zero", "齋賀玲", "重裝騎士", 108, 8, -1, "front-guard", "回合開始前排與生命最低隊員獲得 4 護甲。重甲會把 Boss 仇恨穩穩拉住。", "psyger-zero-heavy-cleave"],
        ["arthur-pencilgon", "亞瑟・潘希魯貢", "情報型玩家", 82, 9, 2, "first-tactic-discount", "每回合第一張戰術牌費用 -1。情報商會把漏洞賣成勝率。", "pencilgon-meta-trap"]
      ],
      recruitmentPool: ["psyger-zero", "arthur-pencilgon", "lucy-kushinada", "shin-asakura", "hayato-suo", "chu-xuan", "xiao-honglu", "qi-tengyi", "zero", "zhan-lan"],
      enemies: [["slf-trashmob-raptors", "荒野疾走獸", 360, 16, "群體撲擊"], ["slf-redcap-band", "紅帽玩家殺手", 560, 23, "背刺連段"], ["slf-unique-shadow", "唯一怪影子", 780, 31, "咒印追獵"], ["slf-lycagon-night", "夜襲的利卡翁", 1180, 44, "狼王夜襲"]],
      tagFamily: "遊戲破局",
      sourceDescription: "虛擬 Boss 戰、咒印、閃避與情報陷阱，偏抽牌、閃避、穿甲與弱化。",
      equipment: [["lycagon-mark", "利卡翁咒印", "openingEvade", 1], ["slf-vorpal-blades", "沃帕爾雙刀", "attackBonus", 4]],
      generalCards: [["slf-critical-route", "極限閃避路線", "attack"], ["slf-meta-map", "攻略情報地圖", "tactic"]]
    },
    {
      id: "slime-walpurgis-clash",
      name: "關於我轉生變成史萊姆這檔事",
      sourceId: "slime",
      subtitle: "魔王宴會與瓦爾普吉斯",
      intro: "主神把隊伍投放到魔王宴會前夜，魔素像濃霧一樣覆蓋朱拉森林。利姆路的捕食者感應到克雷曼的操控線正在收緊。",
      eventText: "瓦爾普吉斯的桌面其實是戰場。若利姆路能在開戰前保住同盟節奏，魔王線就會從處刑變成反擊。",
      powerName: "大賢者魔素演算",
      hidden: ["rimuru-tempest", "利姆路", "魔王史萊姆", 112, 10, 0, "first-tactic-discount", "隱藏人物。每回合第一張戰術牌費用 -1；大賢者會把魔素風向換成下一步答案。", "rimuru-predator-gluttony", "hidden-slime-walpurgis"],
      allies: [
        ["benimaru-kijin", "紅丸", "鬼人軍團長", 102, 9, 0, "second-card-strike", "每回合打出第二張牌時追加 5 傷害。黑炎會把敵方陣線切成兩段。", "benimaru-black-flame"],
        ["shion-ogre", "紫苑", "鬼人秘書", 104, 11, -1, "front-guard", "回合開始前排與生命最低隊員獲得 4 護甲。她的料理不保證安全，護衛倒是很可靠。", "shion-hyper-guard"]
      ],
      recruitmentPool: ["benimaru-kijin", "shion-ogre", "roy-mustang", "yoimiya", "beidou", "chu-xuan", "cheng-xiao", "zhan-lan", "xiao-honglu", "riza-hawkeye"],
      enemies: [["slime-clayman-doll", "克雷曼操偶兵", 380, 18, "操線圍攻"], ["slime-orc-remnant", "豬頭族殘軍", 600, 24, "飢餓衝撞"], ["slime-majin-officer", "魔人幹部", 820, 32, "魔素爆破"], ["slime-clayman-awakened", "覺醒克雷曼", 1160, 43, "魔王偽覺醒"]],
      tagFamily: "魔素捕食",
      sourceDescription: "魔素演算、捕食者、黑炎與同盟防線，偏抽牌、護甲、燃燒與狀態增傷。",
      equipment: [["great-sage-core", "大賢者核心", "openingDraw", 2], ["tempest-coat", "坦派斯特外套", "turnBlock", 6]],
      generalCards: [["slime-predator-devour", "捕食者吞噬", "attack"], ["slime-tempest-alliance", "坦派斯特同盟", "support"]]
    },
    {
      id: "mashle-divine-visionary",
      name: "肌肉魔法使-MASHLE-",
      sourceId: "mashle",
      subtitle: "神覺者試驗肌肉突破",
      intro: "白光散在魔法競技場，咒文聲剛響起，馬修已經用拳頭敲開了第一道魔法牆。蘭斯皺眉，檸檬在看台上尖叫支援。",
      eventText: "魔法社會把無魔力視為死罪。若馬修能用肌肉守住同伴，神覺者試驗會變成主神空間最荒謬也最穩的突破口。",
      powerName: "奶油泡芙肌肉論",
      hidden: ["mash-burnedead", "馬修・班地德", "無魔力肌肉怪物", 118, 8, -1, "first-attack-pierce", "隱藏人物。每回合第一張攻擊牌穿透護甲；沒有魔力，只有更硬的拳頭。", "mash-muscle-burst", "hidden-mashle-muscle"],
      allies: [
        ["lance-crown", "蘭斯・克勞恩", "重力魔法使", 92, 9, 1, "first-tactic-discount", "每回合第一張戰術牌費用 -1。重力會先把敵人的施法角度壓低。", "lance-gravity-lock"],
        ["dot-barrett", "多特・巴雷特", "爆裂魔法使", 96, 14, 0, "second-card-strike", "每回合打出第二張牌時追加 5 傷害。爆裂魔法越吵，命中越狠。", "dot-explosion-line"]
      ],
      recruitmentPool: ["lance-crown", "dot-barrett", "katsuki-bakugo", "arthur-boyle", "lu-shaotang", "mou-gang", "ba-wang", "cheng-xiao", "zero", "chu-xuan"],
      enemies: [["mashle-magic-police", "魔法警備隊", 350, 15, "拘束魔法"], ["mashle-orca-student", "奧爾卡學生", 560, 22, "決鬥咒文"], ["mashle-magia-lupus", "七魔牙殘黨", 760, 30, "魔力壓制"], ["mashle-innocent-zero-core", "無邪零核心", 1140, 42, "時間魔法"]],
      tagFamily: "肌肉突破",
      sourceDescription: "肌肉、重力、爆裂與反魔法社會壓迫，偏穿甲、暈眩、護甲與低費爆發。",
      equipment: [["cream-puff-box", "奶油泡芙盒", "turnStressRelief", 4], ["mashle-training-weights", "超重量訓練器", "attackBonus", 4]],
      generalCards: [["mashle-muscle-uppercut", "肌肉上勾拳", "attack"], ["mashle-gravity-feint", "重力佯攻", "tactic"]]
    },
    {
      id: "frieren-aura-exam",
      name: "葬送的芙莉蓮",
      sourceId: "frieren",
      subtitle: "斷頭台阿烏拉與一級魔法使試煉",
      intro: "薄雪覆蓋古老戰場，芙莉蓮看着魔族留下的魔力痕跡沉默不語。菲倫已經架好魔杖，修塔爾克的斧柄在手心冒汗。",
      eventText: "阿烏拉的服從魔法會把意志變成天秤。若芙莉蓮能保住解析時間，古老魔法會以最安靜的方式結束戰鬥。",
      powerName: "葬送魔力解析",
      hidden: ["frieren-mage", "芙莉蓮", "千年精靈魔法使", 92, 6, 2, "first-tactic-discount", "隱藏人物。每回合第一張戰術牌費用 -1；她會先看穿敵方魔法的壽命。", "frieren-zoltraak", "hidden-frieren-aura"],
      allies: [
        ["fern-apprentice", "菲倫", "高速射擊魔法使", 84, 8, 2, "intent-draw", "敵人準備防禦或施壓時回合開始抽 1 張牌。她的普通攻擊快得不像普通。", "fern-rapid-zoltraak"],
        ["stark-warrior", "修塔爾克", "前衛戰士", 112, 10, -1, "front-guard", "回合開始前排與生命最低隊員獲得 4 護甲。害怕不會阻止他站到最前。", "stark-axe-cleave"]
      ],
      recruitmentPool: ["fern-apprentice", "stark-warrior", "ganyu", "xiao-genshin", "roy-mustang", "riza-hawkeye", "chu-xuan", "zhan-lan", "cheng-xiao", "xiao-honglu"],
      enemies: [["frieren-demon-scout", "魔族斥候", 340, 14, "魔力刺擊"], ["frieren-undead-knight", "不死騎士", 580, 21, "腐朽斬擊"], ["frieren-exam-golem", "試煉魔像", 780, 29, "結界撞擊"], ["frieren-aura-scale", "斷頭台阿烏拉", 1120, 40, "服從天秤"]],
      tagFamily: "古代魔法",
      sourceDescription: "古代魔法、魔族解析、快速射擊與前衛護衛，偏抽牌、弱化、護甲與精準單點。",
      equipment: [["frieren-grimoire", "芙莉蓮魔導書", "openingDraw", 2], ["stark-axe", "修塔爾克戰斧", "firstAttackPierce", 8]],
      generalCards: [["frieren-mana-analysis", "魔力解析", "tactic"], ["frieren-ordinary-shot", "普通攻擊魔法", "attack"]]
    },
    {
      id: "blue-exorcist-blue-night",
      name: "青之驅魔師",
      sourceId: "blue-exorcist",
      subtitle: "青焰之夜撒旦門",
      intro: "修道院鐘聲在藍焰中扭曲，奧村燐拔出俱利伽羅，火光照出惡魔門後的影子。雪男的槍口沒有移開，他怕的是哥哥失控。",
      eventText: "青焰正在打開撒旦門。若奧村燐能把惡魔之力壓在驅魔術範圍內，這場夜戰就能由失控變成封印。",
      powerName: "俱利伽羅青焰封印",
      hidden: ["rin-okumura", "奧村燐", "撒旦之子驅魔師", 106, 16, 0, "first-attack-burn", "隱藏人物。每回合第一張攻擊牌使命中目標燃燒 4 點；青焰會燒掉偽裝，也會燒到自己。", "rin-blue-flame-draw", "hidden-blue-exorcist-flame"],
      allies: [
        ["yukio-okumura", "奧村雪男", "驅魔槍手", 88, 9, 2, "intent-draw", "敵人準備防禦或施壓時回合開始抽 1 張牌。觀察會比子彈先到。", "yukio-exorcist-shot"],
        ["shiemi-moriyama", "杜山詩惠美", "使魔治療師", 82, 7, 2, "front-guard", "回合開始前排與生命最低隊員獲得 4 護甲。尼醬會把治療線守住。", "shiemi-greenman-heal"]
      ],
      recruitmentPool: ["yukio-okumura", "shiemi-moriyama", "arthur-boyle", "roy-mustang", "maki-oze", "chu-xuan", "zhan-lan", "cheng-xiao", "zero", "riza-hawkeye"],
      enemies: [["blue-exorcist-imp-pack", "小惡魔群", 360, 17, "惡魔撲咬"], ["blue-exorcist-possessed-knight", "附身騎士", 600, 24, "憑依斬擊"], ["blue-exorcist-geister", "上級惡魔", 820, 32, "魔障壓迫"], ["blue-exorcist-satan-gate", "撒旦門核心", 1200, 45, "青焰暴走"]],
      tagFamily: "驅魔青焰",
      sourceDescription: "青焰、驅魔槍術、使魔治療與封印陣，偏燃燒、治療、抽牌與護甲。",
      equipment: [["kurikara-blade", "俱利伽羅", "firstAttackPierce", 8], ["true-cross-badge", "正十字徽章", "turnStressRelief", 4]],
      generalCards: [["blue-flame-slash", "青焰斬", "attack"], ["exorcist-seal-circle", "驅魔封印陣", "guard"]]
    },
    {
      id: "fairy-tail-100-years-quest",
      name: "FAIRY TAIL 100年任務",
      sourceId: "fairy-tail",
      subtitle: "五神龍百年任務",
      intro: "魔導士公會的紋章在白光中亮起，遠方神龍咆哮撕裂天幕。納茲笑着點燃拳頭，露西已經翻開星靈鑰匙串。",
      eventText: "五神龍的魔力足以改寫地圖。若納茲能把滅龍火焰壓成隊伍節奏，百年任務就不會變成無謀衝鋒。",
      powerName: "妖精尾巴同伴火",
      hidden: ["natsu-dragneel", "納茲・多拉格尼爾", "火之滅龍魔導士", 110, 13, 0, "first-attack-burn", "隱藏人物。每回合第一張攻擊牌使命中目標燃燒 4 點；同伴在場時火焰會更響。", "natsu-fire-dragon-king", "hidden-fairy-tail-dragon"],
      allies: [
        ["lucy-heartfilia", "露西・哈特菲利亞", "星靈魔導士", 84, 8, 2, "first-tactic-discount", "每回合第一張戰術牌費用 -1。星靈鑰匙會替隊伍打開下一條路。", "lucy-star-dress"],
        ["erza-scarlet", "艾爾莎・舒卡勒托", "換裝魔導士", 104, 9, 0, "front-guard", "回合開始前排與生命最低隊員獲得 4 護甲。換裝速度就是戰線厚度。", "erza-requip-cleave"]
      ],
      recruitmentPool: ["lucy-heartfilia", "erza-scarlet", "yoimiya", "beidou", "raiden-ei", "chu-xuan", "cheng-xiao", "zhan-lan", "zero", "mou-gang"],
      enemies: [["fairy-tail-dragon-spawn", "神龍眷屬", 390, 18, "龍息撲擊"], ["fairy-tail-white-mage-cult", "白魔導士教團", 610, 25, "白化封印"], ["fairy-tail-dragon-god-echo", "神龍殘響", 840, 34, "元素龍威"], ["fairy-tail-aldoron-core", "木神龍核心", 1220, 46, "大地吞城"]],
      tagFamily: "滅龍魔法",
      sourceDescription: "滅龍火焰、星靈換裝與公會連攜，偏燃燒、護甲、抽牌與群體攻擊。",
      equipment: [["dragon-slayer-scarf", "納茲圍巾", "turnStressRelief", 4], ["celestial-key-ring", "星靈鑰匙串", "openingDraw", 2]],
      generalCards: [["fairy-tail-guild-rush", "公會連攜突入", "attack"], ["fairy-tail-star-dress-line", "星靈衣戰線", "support"]]
    },
    {
      id: "four-knights-apocalypse-camelot",
      name: "默示錄的四騎士",
      sourceId: "four-knights",
      subtitle: "卡美洛混沌追擊",
      intro: "卡美洛的天空像裂開的玻璃，混沌騎士從光門中踏出。柏西瓦爾握緊劍柄，蘭斯洛特的視線已經落在敵方後排。",
      eventText: "混沌預言把少年們標成災厄。若柏西瓦爾能守住希望魔力，默示錄就會從滅世宣告變成反擊旗幟。",
      powerName: "希望魔力回響",
      hidden: ["percival-hope", "柏西瓦爾", "希望魔力騎士", 104, 11, 1, "front-guard", "隱藏人物。回合開始前排與生命最低隊員獲得 4 護甲；希望會把倒下的人拉回戰線。", "percival-hope-burst", "hidden-four-knights-hope"],
      allies: [
        ["lancelot-fairy", "蘭斯洛特", "妖精王子弓手", 96, 8, 1, "first-attack-pierce", "每回合第一張攻擊牌穿透護甲。箭矢會先穿過謊言。", "lancelot-fairy-shot"],
        ["tristan-holy-demon", "崔斯坦", "聖魔混血騎士", 102, 12, 0, "second-card-strike", "每回合打出第二張牌時追加 5 傷害。聖與魔的節奏在第二擊合流。", "tristan-dual-light"]
      ],
      recruitmentPool: ["lancelot-fairy", "tristan-holy-demon", "tachibana-ginchiyo", "clark-kent-superman", "hajime-umemiya", "chu-xuan", "zhan-lan", "cheng-xiao", "zero", "hayato-suo"],
      enemies: [["four-knights-chaos-soldier", "混沌士兵", 370, 17, "混沌斬擊"], ["four-knights-camelot-knight", "卡美洛騎士", 610, 24, "聖槍突刺"], ["four-knights-prophecy-hunter", "預言獵手", 820, 32, "命運鎖定"], ["four-knights-arthur-chaos", "混沌亞瑟殘影", 1200, 45, "王權吞噬"]],
      tagFamily: "希望魔力",
      sourceDescription: "希望魔力、妖精箭術、聖魔混血與混沌騎士戰，偏護甲、恢復、穿甲與連段。",
      equipment: [["hope-fragment", "希望碎片", "turnHeal", 3], ["camelot-map", "卡美洛裂界地圖", "openingDraw", 2]],
      generalCards: [["four-knights-hope-rush", "希望突擊", "attack"], ["four-knights-prophecy-guard", "預言防線", "guard"]]
    },
    {
      id: "overlord-holy-kingdom",
      name: "OVERLORD 不死者之王",
      sourceId: "overlord",
      subtitle: "聖王國魔皇戰線",
      intro: "聖王國城牆在惡魔軍的攻城聲中崩落，安茲的黑袍卻像夜色一樣安靜。雅兒貝德微笑行禮，夏提雅的血色長槍已經指向前方。",
      eventText: "納薩力克的戰力過於壓倒，主神空間必須把勝利條件改成控制代價。若安茲的恐懼統治被轉成戰術資源，隊伍才不會被反噬吞掉。",
      powerName: "超位魔法戰術封存",
      hidden: ["ainz-ooal-gown", "安茲・烏爾・恭", "不死者魔導王", 92, 18, 2, "first-tactic-discount", "隱藏人物。每回合第一張戰術牌費用 -1；超位魔法會被主神限制，但知識仍然致命。", "ainz-fallen-down", "hidden-overlord-nazarick"],
      allies: [
        ["albedo-guardian", "雅兒貝德", "守護者總管", 112, 8, -1, "front-guard", "回合開始前排與生命最低隊員獲得 4 護甲。她會把防線守到過分完美。", "albedo-impregnable-wall"],
        ["shalltear-valkyrie", "夏提雅", "吸血鬼真祖", 104, 16, 0, "status-exploit", "攻擊帶有負面狀態的敵人時傷害 +6；血槍會追上恐懼的氣味。", "shalltear-blood-lance"]
      ],
      recruitmentPool: ["albedo-guardian", "shalltear-valkyrie", "van-hohenheim", "ranni-dark-moon", "lucy-kushinada", "chu-xuan", "zhan-lan", "zero", "xiao-honglu", "riza-hawkeye"],
      enemies: [["overlord-demiurge-demon", "惡魔攻城兵", 390, 19, "惡魔投槍"], ["overlord-remedios-order", "聖騎士殘軍", 620, 25, "信仰衝鋒"], ["overlord-jaldabaoth-mask", "亞達巴沃面具", 860, 35, "恐懼統治"], ["overlord-wrath-demon", "憤怒魔將", 1240, 47, "地獄火審判"]],
      tagFamily: "不死魔導",
      sourceDescription: "納薩力克、超位魔法、守護者與恐懼統治，偏戰術折扣、護甲、狀態增傷與壓力控制。",
      equipment: [["staff-of-ainz", "安茲權杖", "openingDraw", 2], ["nazarick-ring", "納薩力克戒指", "turnBlock", 6]],
      generalCards: [["overlord-super-tier-seal", "超位魔法封存", "tactic"], ["overlord-guardian-command", "守護者號令", "guard"]]
    },
    {
      id: "shield-hero-qten-lo",
      name: "盾之勇者成名錄",
      sourceId: "shield-hero",
      subtitle: "絆世界與浪潮防衛戰",
      intro: "浪潮鐘聲在天空裂縫中響起，異界魔物像海水一樣湧入城門。岩谷尚文舉盾擋在最前，拉芙塔莉雅的刀光已經擦過盾緣。",
      eventText: "浪潮會把信任撕成資源。若尚文能守住隊伍核心，盾之勇者線就能從孤立防守變成反擊陣地。",
      powerName: "憤怒盾防衛轉換",
      hidden: ["naofumi-shield", "岩谷尚文", "盾之勇者", 122, 14, -1, "front-guard", "隱藏人物。回合開始前排與生命最低隊員獲得 4 護甲；盾牌會把仇恨全都收進防線。", "naofumi-wrath-shield", "hidden-shield-hero-defence"],
      allies: [
        ["raphtalia-katana", "拉芙塔莉雅", "刀之眷屬器勇者", 96, 8, 1, "first-attack-pierce", "每回合第一張攻擊牌穿透護甲。她的斬擊會沿著盾牌開出的路線前進。", "raphtalia-illusion-blade"],
        ["filo-queen", "菲洛", "菲洛鳥女王", 94, 10, 0, "second-card-strike", "每回合打出第二張牌時追加 5 傷害。衝撞和踢擊永遠比想像中快。", "filo-spiral-kick"]
      ],
      recruitmentPool: ["raphtalia-katana", "filo-queen", "bruce-wayne-batman", "steve-rogers", "hajime-umemiya", "mou-gang", "chu-xuan", "cheng-xiao", "zhan-lan", "zero"],
      enemies: [["shield-wave-beast", "浪潮魔獸", 380, 18, "浪潮撲擊"], ["shield-church-knight", "三勇教騎士", 590, 24, "信仰圍攻"], ["shield-spirit-tortoise-familiar", "靈龜使魔", 820, 32, "靈能重壓"], ["shield-wave-apostle", "浪潮使徒", 1180, 44, "次元裂擊"]],
      tagFamily: "勇者眷屬器",
      sourceDescription: "盾牌防線、浪潮、眷屬器與反擊陣地，偏護甲、穿甲、反擊與壓力管理。",
      equipment: [["wrath-shield-core", "憤怒盾核心", "turnBlock", 7], ["raphtalia-vassal-katana", "拉芙塔莉雅眷屬刀", "firstAttackPierce", 8]],
      generalCards: [["shield-hero-counter-wall", "勇者反擊牆", "guard"], ["shield-hero-wave-break", "浪潮破陣", "attack"]]
    }
  ];

  const scenarios = [];
  const characters = [];
  const cards = [];
  const equipment = [];
  const bloodlines = [];
  const enemies = [];
  const encounters = [];
  const characterSources = [];
  const cardSources = [];
  const equipmentSources = [];
  const customTags = [];
  const customMutations = [];
  const bonds = [];

  for (const pack of packs) {
    const roster = [pack.hidden, ...pack.allies];
    const enemyIds = pack.enemies.map((enemy) => enemy[0]);
    const normal = [`${pack.sourceId}-normal-1`, `${pack.sourceId}-normal-2`];
    const elite = [`${pack.sourceId}-elite`];
    const miniboss = `${pack.sourceId}-miniboss`;
    const boss = `${pack.sourceId}-boss`;

    scenarios.push({
      id: pack.id,
      name: pack.name,
      subtitle: pack.subtitle,
      intro: pack.intro,
      recruitmentPool: pack.recruitmentPool,
      normal,
      elite,
      miniboss,
      boss,
      eventTitle: pack.subtitle,
      eventText: pack.eventText,
      scenarioPowerName: pack.powerName,
      scenarioPowerText: `啟動後第一回合抽 1 張牌；第一張攻擊牌追加 5 傷害。`,
      scenarioPower: { id: `${pack.sourceId}-scenario-power`, effect: "openingDraw", amount: 1 },
      hiddenProtagonistId: pack.hidden[0]
    });

    for (const row of roster) {
      const [id, name, role, maxHp, stress, energyContribution, passiveId, passiveText, signatureCardId, hiddenUnlock] = row;
      characters.push({
        id,
        name,
        role,
        faction: pack.name,
        factionId: pack.sourceId,
        maxHp,
        stress,
        energyContribution,
        passiveId,
        passiveText,
        signatureCardId,
        unlock: hiddenUnlock || pack.id,
        hidden: Boolean(hiddenUnlock)
      });
      bloodlines.push({
        characterId: id,
        name: `${name}核心血統`,
        text: `${name}的專屬牌額外造成 10 傷害，並令${pack.subtitle}的戰鬥節奏更穩定。`,
        sideStoryCost: { rewardPointCost: hiddenUnlock ? 12600 : 9800, sideStoryCost: hiddenUnlock ? 5 : 4 },
        effect: hiddenUnlock ? { extraDamage: 12, pierce: true } : { extraDamage: 10, draw: 1 }
      });
    }

    cards.push(
      { id: pack.hidden[8], name: `${pack.hidden[1]}・主角線爆發`, category: "signature", type: "attack", rarity: "signature", cost: 3, damage: 54, pierce: true, damageAll: 18, gainEnergy: 1, text: `${pack.hidden[1]}把${pack.subtitle}壓成決勝一擊，穿透護甲造成 54 傷害與 18 群體傷害，獲得 1 能量。`, upgrade: { damage: 76, damageAll: 28 }, tags: [pack.hidden[1], pack.name] },
      { id: pack.allies[0][8], name: `${pack.allies[0][1]}・主戰線壓制`, category: "signature", type: "attack", rarity: "signature", cost: 2, damageAll: 28, pierce: true, weakAll: 5, text: `${pack.allies[0][1]}正面壓制，穿透護甲對所有敵人造成 28 傷害並虛弱 5 點。`, upgrade: { damageAll: 42, weakAll: 8 }, tags: [pack.allies[0][1], pack.name] },
      { id: pack.allies[1][8], name: `${pack.allies[1][1]}・節奏支援`, category: "signature", type: "tactic", rarity: "signature", cost: 1, draw: 2, blockAll: 12, weakAll: 3, text: `${pack.allies[1][1]}拆開敵方節奏，抽 2 張牌，全隊獲得 12 護甲，敵人虛弱 3 點。`, upgrade: { draw: 3, blockAll: 20, weakAll: 5 }, tags: [pack.allies[1][1], pack.name] },
      { id: pack.generalCards[0][0], name: pack.generalCards[0][1], category: "general", type: pack.generalCards[0][2], rarity: "rare", cost: 2, damageAll: 24, pierce: true, weakAll: 4, text: `${pack.name}來源牌。穿透護甲對所有敵人造成 24 傷害並虛弱 4 點。`, upgrade: { damageAll: 36, weakAll: 7 }, tags: [pack.name, "突擊"], sourceId: pack.sourceId, sourceName: pack.name },
      { id: pack.generalCards[1][0], name: pack.generalCards[1][1], category: "general", type: pack.generalCards[1][2], rarity: "uncommon", cost: 1, blockAll: 18, draw: 1, reduceStress: 4, text: `${pack.name}來源牌。全隊獲得 18 護甲，抽 1 張牌，壓力 -4。`, upgrade: { blockAll: 28, draw: 2, reduceStress: 6 }, tags: [pack.name, "防線"], sourceId: pack.sourceId, sourceName: pack.name }
    );

    equipment.push(
      { id: pack.equipment[0][0], name: pack.equipment[0][1], rarity: "legendary", effect: pack.equipment[0][2], amount: pack.equipment[0][3], upgradedAmount: pack.equipment[0][3] + 3, text: `${pack.equipment[0][1]}支援${pack.subtitle}的核心戰術。`, sourceId: `${pack.sourceId}-equipment`, sourceName: `${pack.name}裝備` },
      { id: pack.equipment[1][0], name: pack.equipment[1][1], rarity: "rare", effect: pack.equipment[1][2], amount: pack.equipment[1][3], upgradedAmount: pack.equipment[1][3] + 2, text: `${pack.equipment[1][1]}令隊伍在${pack.subtitle}中維持穩定節奏。`, sourceId: `${pack.sourceId}-equipment`, sourceName: `${pack.name}裝備` }
    );

    customTags.push(
      { id: `${pack.sourceId}-core-tag`, name: `${pack.name}核心適性`, family: pack.tagFamily, tier: "A", cost: 8200, art: `./src/assets/generated/skill-${pack.hidden[8]}.png`, text: `${pack.subtitle}適性。攻擊牌傷害 +3，第一回合抽 1 張牌。`, effects: { attackBonus: 3, openingDraw: 1 } },
      { id: `${pack.sourceId}-support-tag`, name: `${pack.name}支援節奏`, family: pack.tagFamily, tier: "B", cost: 3600, art: `./src/assets/generated/skill-${pack.allies[1][8]}.png`, text: "開場護甲 +8，第一張戰術牌抽 1 張。", effects: { openingBlockAll: 8, firstTacticDraw: 1 } }
    );
    customMutations.push({ id: `${pack.sourceId}-inner-qi-mutation`, name: `${pack.name}內力複合適性`, requiredTags: [`${pack.sourceId}-core-tag`, "inner-qi-breath"], art: `./src/assets/generated/skill-${pack.hidden[8]}.png`, text: "攻擊帶狀態敵人傷害 +6；回合開始全隊獲得 3 護甲。", effects: { statusExploitBonus: 6, turnBlockAll: 3 } });

    pack.enemies.forEach(([id, name, maxHp, stressAura, label], index) => {
      enemies.push({
        id,
        name,
        maxHp,
        stressAura,
        regen: index >= 2 ? 12 + index * 3 : undefined,
        intents: [
          { kind: index === 0 ? "attack" : "cleave", label, amount: 54 + index * 12, targetMode: index === 0 ? "random" : "all" },
          { kind: "stress", label: `${name}壓迫`, amount: 28 + index * 10, targetMode: "all" },
          { kind: index >= 2 ? "regen" : "guard", label: `${name}重整`, amount: 42 + index * 12, block: index >= 2 ? 24 + index * 6 : undefined }
        ]
      });
    });

    encounters.push(
      { id: normal[0], name: `${pack.name}第一波壓境`, tier: "normal", enemies: [enemyIds[0], enemyIds[0]], rewardPoints: 7200 },
      { id: normal[1], name: `${pack.name}中段突破`, tier: "normal", enemies: [enemyIds[1], enemyIds[0]], rewardPoints: 8200 },
      { id: elite[0], name: `${pack.name}精英試煉`, tier: "elite", enemies: [enemyIds[2], enemyIds[1]], rewardPoints: 11000 },
      { id: miniboss, name: `${pack.name}隱藏線危機`, tier: "miniboss", enemies: [enemyIds[2]], rewardPoints: 15600 },
      { id: boss, name: `${pack.name}終局王戰`, tier: "boss", enemies: [enemyIds[3]], rewardPoints: 25800 }
    );

    characterSources.push({ id: pack.sourceId, name: pack.name, description: `${roster.map((row) => row[1]).join("、")}接入主神空間，守住${pack.subtitle}的核心命運線。`, heroFileName: `roster-hero-${pack.sourceId}.png`, memberIds: roster.map((row) => row[0]) });
    cardSources.push({ id: pack.sourceId, name: pack.name, description: pack.sourceDescription });
    equipmentSources.push({ id: `${pack.sourceId}-equipment`, name: `${pack.name}裝備`, description: `${pack.name}劇本裝備，支援${pack.subtitle}的開場、護甲與攻擊節奏。` });

    bonds.push(
      { id: `${pack.sourceId}-core-trio`, name: `${pack.name}核心三人線`, members: roster.map((row) => row[0]), text: `${roster.map((row) => row[1]).join("、")}同時上陣。開場全隊獲得 10 護甲；第一張攻擊牌傷害 +6。`, effects: { openingBlockAll: 10, firstAttackBonus: 6 } },
      { id: `cross-${pack.sourceId}-zhongzhou`, name: `${pack.name}中洲戰術接入`, members: [...roster.map((row) => row[0]), "chu-xuan"], text: `${roster.map((row) => row[1]).join("、")}與楚軒同時上陣。開場抽 1 張牌；第一張戰術牌使敵人虛弱 4 點。`, effects: { openingDraw: 1, firstTacticWeakAll: 4 }, crossWorld: true }
    );
  }

  const shop = [
    ...cards.filter((card) => card.category === "general").map((card, index) => ({ id: `shop-${card.id}`, kind: "card", itemId: card.id, rewardPointCost: 1900 + index * 160, stock: card.rarity === "rare" ? 1 : 2 })),
    ...equipment.map((item, index) => ({ id: `shop-${item.id}`, kind: "equipment", itemId: item.id, rewardPointCost: 5200 + index * 280, sideStoryCost: item.rarity === "legendary" ? 3 : 2, stock: 1 }))
  ];

  data.scenarios.push(...scenarios);
  data.characters.push(...characters);
  data.cards.push(...cards);
  data.equipment.push(...equipment);
  data.bloodlines.push(...bloodlines);
  data.enemies.push(...enemies);
  data.encounters.push(...encounters);
  data.characterSources.push(...characterSources);
  data.cardSources.push(...cardSources);
  data.equipmentSources.push(...equipmentSources);
  data.customTags.push(...customTags);
  data.customMutations.push(...customMutations);
  data.shop.push(...shop);
  data.bonds.push(...bonds);
  data.legendaryRecruitmentPool.push(...packs.map((pack) => pack.hidden[0]));

  for (const scenario of scenarios) {
    const pack = packs.find((item) => item.id === scenario.id);
    scenario.opening = buildOpening(pack);
    data.economy.scenarioSideStoryRewards[scenario.id] = 18;
    data.scenarioEventRoutes[scenario.id] = buildRoutes(scenario, data.characters.find((character) => character.id === scenario.hiddenProtagonistId));
  }

  shuffleFormalScenarioOrder();

  function buildOpening(pack) {
    const roster = [pack.hidden, ...pack.allies];
    return {
      title: pack.subtitle,
      premise: pack.intro,
      dialogue: [
        { speaker: "主神", line: `主線：完成${pack.subtitle}並擊破${pack.enemies[3][1]}。隱藏判定：讓${pack.hidden[1]}守住自己的核心選擇。` },
        { speaker: pack.hidden[1], line: `我不會照着最壞劇本倒下。把${pack.enemies[3][1]}交給我，中洲隊負責守住戰線。` },
        { speaker: pack.allies[0][1], line: `正面壓制由我開始。敵人第二波靠近前，先把中段防線打穿。` },
        { speaker: pack.allies[1][1], line: `節奏已經變了。別追着敵人跑，逼它們踏進我們選好的位置。` },
        { speaker: "楚軒", line: `${pack.name}的勝負點不是單純擊殺，而是讓${pack.hidden[1]}的主角線偏離最壞收束。` }
      ],
      panels: pack.enemies.map((enemy, index) => ({
        enemyId: enemy[0],
        title: `${enemy[1]}${index === 3 ? "終局" : "壓境"}`,
        text: `${enemy[1]}把${pack.subtitle}推向第 ${index + 1} 層壓力，隊伍必須在崩線前重排站位。`
      }))
    };
  }

  function buildRoutes(scenario, hidden) {
    const hiddenName = hidden?.name || "核心人物";
    return [
      {
        id: `${scenario.id}-fixed-good-route`,
        routeType: "主角命運線",
        priority: "fixed",
        stage1: { id: `${scenario.id}-fixed-signal`, title: `追上${hiddenName}的命運線`, text: scenario.eventText },
        stage2: { id: `${scenario.id}-fixed-commit`, title: `守住${scenario.subtitle}`, text: `隊伍放棄安全收益，集中資源改寫${scenario.name}的核心崩壞節點。` },
        final: { id: `${scenario.id}-fixed-good-end`, title: `帶回${hiddenName}`, text: `${hiddenName}跨過最危險的瞬間，代表性力量被主神記錄。` },
        outcome: { title: `${scenario.name}命運線改寫`, text: `${hiddenName}的主角線被中洲隊拉回可控方向。`, effects: [{ type: "recruit-hidden" }, { type: "scenario-power" }, { type: "side-story", amount: 1 }], rewards: [`隱藏角色：${hiddenName}`, scenario.scenarioPowerName, "支線劇情 +1"], costs: ["主神記錄到你們對高危劇本的干涉。"], storyImpact: `${hiddenName}避開原本最壞的節點。`, worldState: `${scenario.name}的終局被推向可重玩路線。` }
      },
      {
        id: `${scenario.id}-fixed-risk-route`,
        routeType: "高壓支線",
        priority: "fixed",
        stage1: { id: `${scenario.id}-fixed-pressure`, title: "強行搶攻敵方核心", text: "隊伍用最短路線逼近 Boss，但戰鬥壓力會提前堆高。" },
        stage2: { id: `${scenario.id}-fixed-cost`, title: "承受劇本反噬", text: "主神把敵方精英提前投放，所有人必須帶着壓力前進。" },
        final: { id: `${scenario.id}-fixed-risk-end`, title: "以代價換情報", text: "未能完全改寫主角線，但拿到下一輪關鍵情報。" },
        outcome: { title: `${scenario.name}高壓情報`, text: "隊伍帶回敵方核心情報，但隱藏主角線仍需要重玩修正。", effects: [{ type: "reward-points", amount: 3600 }, { type: "side-story", amount: 1 }], rewards: ["獎勵點 +3600", "支線劇情 +1"], costs: ["全隊壓力在下一場戰鬥提高。"], storyImpact: "敵方核心機制被解析，但最壞命運尚未徹底扭轉。", worldState: `${scenario.name}留下可供重玩追擊的情報節點。` }
      },
      {
        id: `${scenario.id}-fixed-resource-route`,
        routeType: "資源回收線",
        priority: "fixed",
        stage1: { id: `${scenario.id}-fixed-supply`, title: "回收劇本裝備", text: "隊伍避開最危險主線，先取得可帶回主神空間的裝備樣本。" },
        stage2: { id: `${scenario.id}-fixed-cache`, title: "拆解敵方素材", text: "支援人員把敵方素材轉換成可購買裝備與卡牌來源。" },
        final: { id: `${scenario.id}-fixed-supply-end`, title: "完成資源撤離", text: "隊伍撤出前保留足夠素材，讓下一輪攻略更穩。" },
        outcome: { title: `${scenario.name}資源回收`, text: "隊伍回收了劇本裝備樣本與來源情報。", effects: [{ type: "reward-points", amount: 2600 }, { type: "shop-discount", amount: 1 }], rewards: ["獎勵點 +2600", "劇本商店折扣"], costs: ["隱藏主角線沒有被推進。"], storyImpact: "中洲隊獲得更好的下輪準備，但核心命運仍維持原狀。", worldState: `${scenario.name}的資源點被標記。` }
      },
      {
        id: `${scenario.id}-fixed-balance-route`,
        routeType: "平衡攻略線",
        priority: "fixed",
        stage1: { id: `${scenario.id}-fixed-balance`, title: "壓低 Boss 強度", text: "隊伍不搶速通，改為拆掉敵方增援、護盾與壓力源。" },
        stage2: { id: `${scenario.id}-fixed-stable`, title: "穩定三線推進", text: "前排守住傷害，中排處理狀態，後排保留終局爆發。" },
        final: { id: `${scenario.id}-fixed-balance-end`, title: "取得平衡勝利", text: "Boss 沒被弱化到失去威脅，但隊伍也沒有被數值壓垮。" },
        outcome: { title: `${scenario.name}平衡攻略`, text: "隊伍以較低代價通過劇本，取得穩定獎勵。", effects: [{ type: "reward-points", amount: 3000 }, { type: "heal-party", amount: 8 }], rewards: ["獎勵點 +3000", "全隊恢復 8 生命"], costs: ["沒有觸發隱藏招募。"], storyImpact: "隊伍保留戰力，但沒有深入改寫主角命運線。", worldState: `${scenario.name}進入穩定通關記錄。` }
      }
    ];
  }

  function shuffleFormalScenarioOrder() {
    const tutorial = data.scenarios.find((scenario) => scenario.id === "tutorial");
    const formal = data.scenarios.filter((scenario) => scenario.id !== "tutorial");
    formal.sort((a, b) => stableScore(a.id) - stableScore(b.id) || a.id.localeCompare(b.id));
    data.scenarios.splice(0, data.scenarios.length, ...(tutorial ? [tutorial] : []), ...formal);
  }

  function stableScore(id) {
    let hash = 2166136261;
    for (let index = 0; index < id.length; index += 1) {
      hash ^= id.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }
})(globalThis);
