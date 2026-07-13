(function (global) {
  const data = global.MainGodData;
  if (!data) return;

  const packs = [
    {
      id: "dandadan-evil-eye",
      name: "DAN DA DAN",
      sourceId: "dandadan",
      subtitle: "邪視與怪異高速戰",
      intro: "白光落在廢棄溫泉街，幽浮燈影和惡靈低語同時壓下來。桃的念力還沒收束，厄卡倫已經聽見邪視在牆後奔跑。",
      eventTitle: "邪視封印與怪異共振",
      eventText: "邪視把整條街拖進惡意視線裡。若中洲隊能讓厄卡倫守住身體主導權，怪異力量就會變成可控的高速爆發。",
      scenarioPowerName: "怪異高速共振",
      scenarioPowerText: "啟動後第一回合抽 1 張牌，第一張攻擊牌穿甲並追加 6 傷害。",
      scenarioPower: { id: "dandadan-occult-overdrive", effect: "openingDraw", amount: 1 },
      hiddenProtagonistId: "okarun-turbo",
      hiddenUnlock: "hidden-dandadan-evil-eye",
      roster: [
        ["okarun-turbo", "厄卡倫", "高速怪異附身者", 94, 18, 0, "opening-overdrive", "隱藏人物。第一回合額外獲得 2 能量，但自身壓力 +8；高速怪異會把恐懼踩成加速。", "okarun-turbo-full-throttle", true],
        ["momo-ayase", "綾瀨桃", "念力怪異獵手", 86, 10, 1, "first-tactic-discount", "每回合第一張戰術牌費用 -1，念力會先把敵人的角度扭歪。", "momo-psychokinesis-crush"],
        ["jiji-evil-eye", "圓城寺仁", "邪視宿主", 102, 20, 0, "status-exploit", "攻擊帶有負面狀態的敵人時，傷害 +6；邪視的惡意會盯住破綻。", "jiji-evil-eye-break"]
      ],
      recruitmentPool: ["momo-ayase", "jiji-evil-eye", "zhao-yingkong", "cheng-xiao", "zero", "lucy-kushinada", "shin-asakura", "chu-xuan", "zhan-lan", "xiao-honglu"],
      enemies: [
        ["dandadan-serpo-squad", "塞伯星人小隊", 360, 17, "念波捕獲"],
        ["dandadan-turbo-granny-echo", "高速婆婆殘影", 560, 24, "百公里追魂"],
        ["dandadan-evil-eye-core", "邪視核心", 760, 30, "惡意凝視"],
        ["dandadan-alien-ghost-fusion", "外星怪異融合體", 1120, 42, "怪異融合轟擊"]
      ],
      encounterPrefix: "dandadan",
      openingNames: ["厄卡倫", "綾瀨桃", "邪視", "塞伯星人"],
      tagFamily: "怪異念力",
      sourceDescription: "念力、怪異附身、幽浮與邪視共振，偏抽牌、穿甲、虛弱與高速爆發。",
      equipment: [["turbo-granny-charm", "高速婆婆護符", "openingEnergy", 1], ["momo-spirit-phone", "桃的靈感手機", "openingDraw", 2]],
      generalCards: [["dandadan-occult-sprint", "怪異高速突入", "attack"], ["dandadan-psychic-bind", "念力封鎖", "tactic"]]
    },
    {
      id: "solo-leveling-jeju-raid",
      name: "Solo Leveling",
      sourceId: "solo-leveling",
      subtitle: "濟州島蟻王突襲",
      intro: "傳送門把濟州島夜色染成紫黑，蟻群像潮水一樣越過獵人防線。成振宇的影子兵還沒全部站起，蟻王已經在雷達上消失。",
      eventTitle: "影子君主與蟻王王座",
      eventText: "蟻王的進化速度超過作戰模型。只有讓成振宇完成影子召喚，濟州島突襲才不會變成獵人全滅線。",
      scenarioPowerName: "影子軍團召喚",
      scenarioPowerText: "啟動後全隊獲得 14 護甲，並使第一張攻擊牌追加 8 穿甲傷害。",
      scenarioPower: { id: "shadow-army-command", effect: "attackBonus", amount: 4 },
      hiddenProtagonistId: "sung-jinwoo",
      hiddenUnlock: "hidden-solo-leveling-shadow",
      roster: [
        ["sung-jinwoo", "成振宇", "影子君主", 116, 14, 0, "second-card-strike", "隱藏人物。每回合打出第二張牌時追加 5 傷害；影子會替他補上下一刀。", "jinwoo-shadow-extraction", true],
        ["cha-hae-in", "車海印", "S級劍士獵人", 92, 9, 1, "first-attack-pierce", "每回合第一張攻擊牌穿透護甲，劍氣會先切開魔力外殼。", "cha-haein-sword-dance"],
        ["igris-shadow", "伊格利特", "影子騎士", 108, 8, -1, "front-guard", "回合開始前排與生命最低隊員獲得 4 護甲。影子騎士永遠站在最危險的位置。", "igris-knight-charge"]
      ],
      recruitmentPool: ["cha-hae-in", "igris-shadow", "leon-kennedy", "clark-kent-superman", "mou-gang", "ba-wang", "mina-ashiro", "chu-xuan", "zhan-lan", "zero"],
      enemies: [
        ["solo-magic-beast-swarm", "魔獸蟻群", 390, 18, "群體啃咬"],
        ["solo-jeju-elite-ant", "濟州精英蟻", 620, 25, "甲殼突刺"],
        ["solo-ant-queen-guard", "蟻后近衛", 800, 32, "護巢撕裂"],
        ["solo-ant-king-beru", "蟻王貝魯", 1200, 44, "王級吞噬"]
      ],
      encounterPrefix: "solo",
      openingNames: ["成振宇", "車海印", "伊格利特", "蟻王"],
      tagFamily: "影子君主",
      sourceDescription: "影子召喚、獵人突襲與蟻王進化，偏護甲、穿甲、召喚式連擊與高壓斬殺。",
      equipment: [["shadow-monarch-core", "影子君主核心", "attackBonus", 5], ["hunter-rank-detector", "獵人等級檢測器", "openingDraw", 2]],
      generalCards: [["solo-shadow-soldier-rush", "影子士兵突襲", "attack"], ["solo-hunter-raid-command", "獵人突襲指令", "guard"]]
    },
    {
      id: "my-hero-final-war",
      name: "我的英雄學院",
      sourceId: "my-hero-academia",
      subtitle: "最終決戰個性全面戰",
      intro: "天空堡壘裂成數段，英雄與敵聯盟在城市上空同時墜落。綠谷出久握緊 One For All，爆豪勝己的爆破聲從煙塵裡回來。",
      eventTitle: "One For All與死柄木核心",
      eventText: "All For One 正在吞沒死柄木的意志。若中洲隊能保住綠谷的救援判定，最終戰就不會只剩下殺死敵人一條路。",
      scenarioPowerName: "One For All全覆蓋",
      scenarioPowerText: "啟動後攻擊牌傷害 +4，第一張防護牌使全隊獲得 12 護甲。",
      scenarioPower: { id: "ofa-full-cowl-front", effect: "attackBonus", amount: 4 },
      hiddenProtagonistId: "izuku-midoriya",
      hiddenUnlock: "hidden-mha-ofa",
      roster: [
        ["izuku-midoriya", "綠谷出久", "One For All繼承者", 106, 16, 0, "first-attack-pierce", "隱藏人物。每回合第一張攻擊牌穿透護甲；救援意志會把破壞力壓成可控路線。", "deku-gearshift-smash", true],
        ["katsuki-bakugo", "爆豪勝己", "爆破英雄", 96, 14, 0, "second-card-strike", "每回合打出第二張牌時追加 5 傷害。爆破不是衝動，是高速計算。", "bakugo-howitzer-impact"],
        ["shoto-todoroki", "轟焦凍", "半冷半燃英雄", 100, 10, 1, "first-guard-weak", "每回合第一張防護牌使所有敵人虛弱 3 點。冰火會把戰線重新分割。", "shoto-phosphor-wall"]
      ],
      recruitmentPool: ["katsuki-bakugo", "shoto-todoroki", "tony-stark", "steve-rogers", "riza-hawkeye", "kikoru-shinomiya", "shin-asakura", "chu-xuan", "cheng-xiao", "zhan-lan"],
      enemies: [
        ["mha-nomu-swarm", "腦無群", 420, 20, "再生突擊"],
        ["mha-villain-front", "超常解放戰線", 640, 26, "個性壓制"],
        ["mha-all-for-one-echo", "All For One殘響", 860, 34, "個性掠奪"],
        ["mha-shigaraki-core", "死柄木核心", 1250, 46, "崩壞王座"]
      ],
      encounterPrefix: "mha",
      openingNames: ["綠谷出久", "爆豪勝己", "轟焦凍", "死柄木"],
      tagFamily: "英雄個性",
      sourceDescription: "One For All、爆破、冰火與最終戰救援線，偏穿甲、護甲、燃燒與高爆發。",
      equipment: [["one-for-all-ember", "One For All餘火", "openingEnergy", 1], ["ua-hero-comms", "雄英英雄通訊", "turnBlock", 6]],
      generalCards: [["mha-hero-combo-rush", "英雄連攜突擊", "attack"], ["mha-rescue-line-hold", "救援線維持", "guard"]]
    },
    {
      id: "fire-force-final-pillar",
      name: "炎炎消防隊",
      sourceId: "fire-force",
      subtitle: "柱與大災害火線",
      intro: "東京的夜空被天照照成白晝，傳教者的火焰像預言一樣從地底升起。森羅日下部踏進火場，亞瑟的電漿劍已經亮起。",
      eventTitle: "大災害與英雄惡魔",
      eventText: "傳教者要讓火焰把世界變成下一個太陽。若森羅能守住英雄意志，第八特殊消防隊就能把大災害拖回人間尺度。",
      scenarioPowerName: "亞多拉爆裂救火線",
      scenarioPowerText: "啟動後所有敵人燃燒 8 點，全隊壓力 -4。",
      scenarioPower: { id: "adolla-burst-rescue", effect: "attackBonus", amount: 3 },
      hiddenProtagonistId: "shinra-kusakabe",
      hiddenUnlock: "hidden-fire-force-adolla",
      roster: [
        ["shinra-kusakabe", "森羅日下部", "第三世代英雄消防官", 104, 15, 0, "opening-overdrive", "隱藏人物。第一回合額外獲得 2 能量但壓力 +8；惡魔腳印會踩出救援路線。", "shinra-devil-footprint", true],
        ["arthur-boyle", "亞瑟·波義耳", "騎士王電漿劍士", 96, 11, 0, "first-attack-pierce", "每回合第一張攻擊牌穿透護甲。越相信自己是騎士，劍越接近真實。", "arthur-excalibur-plasma"],
        ["maki-oze", "茉希尾瀨", "第二世代火焰操控者", 98, 8, 1, "front-guard", "回合開始前排與生命最低隊員獲得 4 護甲。火焰會被她收成防線。", "maki-fireball-control"]
      ],
      recruitmentPool: ["arthur-boyle", "maki-oze", "rengoku-kyojuro", "roy-mustang", "beidou", "yoimiya", "riza-hawkeye", "chu-xuan", "cheng-xiao", "zero"],
      enemies: [
        ["fire-infernal-pack", "焰人群", 370, 18, "人體自燃"],
        ["fire-white-clad-raider", "白衣人襲擊隊", 600, 25, "傳教者火線"],
        ["fire-demon-infernal", "鬼級焰人", 820, 33, "地獄火拳"],
        ["fire-evangelist-cataclysm", "傳教者大災害核心", 1180, 45, "亞多拉崩壞"]
      ],
      encounterPrefix: "fire",
      openingNames: ["森羅日下部", "亞瑟", "茉希", "大災害"],
      tagFamily: "亞多拉火焰",
      sourceDescription: "特殊消防隊、亞多拉爆裂與大災害火線，偏燃燒、護甲、壓力控制與穿甲斬擊。",
      equipment: [["adolla-link-fragment", "亞多拉連結碎片", "firstAttackPierce", 8], ["special-fire-coat", "特殊消防防火外套", "turnStressRelief", 4]],
      generalCards: [["fire-force-flame-rescue", "火場救援突擊", "attack"], ["fire-force-company-eight-line", "第八隊防火線", "guard"]]
    },
    {
      id: "hells-paradise-shinsenkyo",
      name: "地獄樂",
      sourceId: "hells-paradise",
      subtitle: "神仙鄉丹田死戰",
      intro: "白光散去後，島上的花香像毒一樣甜。畫眉丸的忍術火焰貼著皮膚燃起，佐切的刀卻先指向那座會開花的屍山。",
      eventTitle: "不死仙藥與天仙試煉",
      eventText: "神仙鄉會把求生願望變成處刑。若畫眉丸能記起妻子的約定，丹田修行就不會被天仙吞成怪物化。",
      scenarioPowerName: "丹田歸心",
      scenarioPowerText: "啟動後回合開始全隊恢復 2 生命，攻擊帶狀態敵人傷害 +5。",
      scenarioPower: { id: "tanden-life-thread", effect: "attackBonus", amount: 3 },
      hiddenProtagonistId: "gabimaru-hollow",
      hiddenUnlock: "hidden-hells-paradise-tanden",
      roster: [
        ["gabimaru-hollow", "畫眉丸", "空之忍者", 102, 17, 0, "status-exploit", "隱藏人物。攻擊帶有負面狀態的敵人時傷害 +6；空心只是假象，活下去才是真意。", "gabimaru-ninpo-blaze", true],
        ["yamada-asaemon-sagiri", "山田淺右衛門佐切", "試一刀流監察人", 92, 9, 1, "first-attack-pierce", "每回合第一張攻擊牌穿透護甲。刀線會把迷惘和殺意分開。", "sagiri-execution-draw"],
        ["yuzuriha-kunoichi", "杠", "甲賀女忍", 82, 12, 1, "intent-draw", "敵人準備防禦或施壓時，回合開始額外抽 1 張牌。活下來的人最會讀風向。", "yuzuriha-poison-thread"]
      ],
      recruitmentPool: ["yamada-asaemon-sagiri", "yuzuriha-kunoichi", "okatsu-nioh", "millicent-valkyrie", "scar-ishvalan", "zhao-yingkong", "hattori-hanzo-nioh", "chu-xuan", "zhan-lan", "cheng-xiao"],
      enemies: [
        ["hells-island-convicts", "島上死囚群", 360, 18, "求生互殺"],
        ["hells-soshin-monster", "竈神怪物", 610, 25, "花化撲擊"],
        ["hells-tensen-disciple", "天仙門徒", 820, 34, "丹田剝奪"],
        ["hells-rien-flower-core", "蓮花天仙核心", 1200, 46, "不死花海"]
      ],
      encounterPrefix: "hells",
      openingNames: ["畫眉丸", "佐切", "杠", "天仙"],
      tagFamily: "丹田忍法",
      sourceDescription: "忍法、處刑人刀線、丹田與神仙鄉毒花，偏中毒、恢復、穿甲與狀態增傷。",
      equipment: [["tanden-elixir-vial", "丹田仙藥瓶", "turnHeal", 3], ["asaemon-execution-blade", "淺右衛門處刑刀", "firstAttackPierce", 8]],
      generalCards: [["hells-ninpo-fireline", "忍法火線", "attack"], ["hells-tanden-breath", "丹田調息", "support"]]
    },
    {
      id: "wind-breaker-keel-brawl",
      name: "WIND BREAKER",
      sourceId: "wind-breaker",
      subtitle: "防風鈴街區亂戰",
      intro: "商店街鐵門一扇扇拉下，KEEL 的腳步聲從巷口逼近。櫻遙把外套往肩上一甩，梅宮一的笑聲反而讓整條街安靜下來。",
      eventTitle: "防風鈴與街區守護線",
      eventText: "這不是地下鬥毆，而是誰有資格守住街區的判定。若櫻遙能理解防風鈴的守護規則，勝負就不會只剩拳頭。",
      scenarioPowerName: "防風鈴守街號令",
      scenarioPowerText: "啟動後全隊獲得 12 護甲，第一張攻擊牌使敵人虛弱 5 點。",
      scenarioPower: { id: "bofurin-street-command", effect: "turnBlock", amount: 5 },
      hiddenProtagonistId: "haruka-sakura",
      hiddenUnlock: "hidden-wind-breaker-bofurin",
      roster: [
        ["haruka-sakura", "櫻遙", "防風鈴一年級拳手", 98, 13, 0, "second-card-strike", "隱藏人物。每回合打出第二張牌時追加 5 傷害；他的拳頭正在學會保護。", "sakura-street-counter", true],
        ["hajime-umemiya", "梅宮一", "防風鈴總代", 108, 6, 1, "front-guard", "回合開始前排與生命最低隊員獲得 4 護甲。總代站著，街就不會退。", "umemiya-rooftop-command"],
        ["hayato-suo", "蘇枋隼飛", "柔術眼罩智將", 88, 8, 1, "first-tactic-discount", "每回合第一張戰術牌費用 -1。笑意背後是精準的拆招。", "suo-gentle-feint"]
      ],
      recruitmentPool: ["hajime-umemiya", "hayato-suo", "shin-asakura", "lu-shaotang", "zhao-yingkong", "cheng-xiao", "ba-wang", "mou-gang", "chu-xuan", "zero"],
      enemies: [
        ["wind-keel-grunts", "KEEL雜兵群", 340, 15, "鐵管圍毆"],
        ["wind-keel-captain", "KEEL隊長", 560, 22, "街角壓制"],
        ["wind-shishitoren-vanguard", "獅子頭連前鋒", 720, 29, "強者挑釁"],
        ["wind-street-war-boss", "街區亂戰頭目", 1040, 38, "地盤崩線"]
      ],
      encounterPrefix: "wind",
      openingNames: ["櫻遙", "梅宮一", "蘇枋隼飛", "防風鈴"],
      tagFamily: "街區格鬥",
      sourceDescription: "防風鈴守街、拳腳亂戰與街區義氣，偏護甲、虛弱、反擊與低成本連段。",
      equipment: [["bofurin-jacket", "防風鈴外套", "turnBlock", 6], ["suo-eye-patch", "蘇枋眼罩", "openingDraw", 2]],
      generalCards: [["wind-breaker-brawl-rush", "街區連拳突入", "attack"], ["wind-breaker-protect-line", "守街防線", "guard"]]
    }
  ];

  const scenarios = [];
  const openings = {};
  const characters = [];
  const customTags = [];
  const customMutations = [];
  const cards = [];
  const equipment = [];
  const bloodlines = [];
  const enemies = [];
  const encounters = [];
  const characterSources = [];
  const cardSources = [];
  const equipmentSources = [];
  const bonds = [];

  for (const pack of packs) {
    const enemyIds = pack.enemies.map((enemy) => enemy[0]);
    const normal = [`${pack.encounterPrefix}-normal-1`, `${pack.encounterPrefix}-normal-2`];
    const elite = [`${pack.encounterPrefix}-elite`];
    const miniboss = `${pack.encounterPrefix}-miniboss`;
    const boss = `${pack.encounterPrefix}-boss`;

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
      eventTitle: pack.eventTitle,
      eventText: pack.eventText,
      scenarioPowerName: pack.scenarioPowerName,
      scenarioPowerText: pack.scenarioPowerText,
      scenarioPower: pack.scenarioPower,
      hiddenProtagonistId: pack.hiddenProtagonistId
    });

    openings[pack.id] = {
      title: pack.subtitle,
      premise: pack.intro,
      dialogue: [
        { speaker: "主神", line: `主線：完成${pack.subtitle}並擊破${pack.enemies[3][1]}。隱藏判定：讓${pack.roster[0][1]}守住自己的核心選擇。` },
        { speaker: pack.roster[0][1], line: `我不是來照劇本輸掉的。這次把${pack.enemies[3][1]}拖到我能打中的距離。` },
        { speaker: pack.roster[1][1], line: `我負責正面壓制。中洲隊，別讓敵人的第二波切進來。` },
        { speaker: pack.roster[2][1], line: `戰場的節奏變了。先拆${pack.enemies[1][1]}，再處理真正的核心。` },
        { speaker: "楚軒", line: `${pack.name}的勝負點不是單純擊殺，而是讓${pack.roster[0][1]}的主角線偏離最壞收束。` }
      ],
      panels: [
        { enemyId: enemyIds[0], title: `${pack.enemies[0][1]}壓境`, text: `${pack.enemies[0][1]}沿著場景邊界湧出，第一波攻勢逼迫隊伍立刻分線。` },
        { enemyId: enemyIds[1], title: `${pack.enemies[1][1]}突破`, text: `${pack.enemies[1][1]}撞開中段防線，讓${pack.roster[1][1]}不得不提前出手。` },
        { enemyId: enemyIds[2], title: `${pack.enemies[2][1]}試煉`, text: `${pack.enemies[2][1]}開始針對${pack.roster[0][1]}，隱藏路線判定在這一刻浮現。` },
        { enemyId: enemyIds[3], title: `${pack.enemies[3][1]}終局`, text: `${pack.enemies[3][1]}把整個劇本推向崩壞，只有改寫命運線才能帶回真正獎勵。` }
      ]
    };

    for (const row of pack.roster) {
      const [id, name, role, maxHp, stress, energyContribution, passiveId, passiveText, signatureCardId, hidden] = row;
      characters.push({ id, name, role, faction: pack.name, factionId: pack.sourceId, maxHp, stress, energyContribution, passiveId, passiveText, signatureCardId, unlock: hidden ? pack.hiddenUnlock : pack.id, hidden: Boolean(hidden) });
      bloodlines.push({
        characterId: id,
        name: `${name}核心血統`,
        text: `${name}的招牌技能額外造成 10 傷害，並把${pack.subtitle}的壓力轉成可控戰術資源。`,
        sideStoryCost: { rewardPointCost: hidden ? 12600 : 9800, sideStoryCost: hidden ? 5 : 4 },
        effect: hidden ? { extraDamage: 12, pierce: true } : { extraDamage: 10, draw: 1 }
      });
    }

    cards.push(
      { id: pack.roster[0][8], name: `${pack.roster[0][1]}·命運線爆發`, category: "signature", type: "attack", rarity: "signature", cost: 3, damage: 56, pierce: true, damageAll: 18, gainEnergy: 1, text: `${pack.roster[0][1]}把${pack.subtitle}的壓力壓成一擊，穿透護甲造成 56 傷害與 18 群體傷害，獲得 1 能量。`, upgrade: { damage: 78, damageAll: 28 }, tags: [pack.roster[0][1], pack.name] },
      { id: pack.roster[1][8], name: `${pack.roster[1][1]}·主戰線壓制`, category: "signature", type: "attack", rarity: "signature", cost: 2, damageAll: 28, pierce: true, weakAll: 5, text: `${pack.roster[1][1]}正面壓制，穿透護甲對所有敵人造成 28 傷害並虛弱 5 點。`, upgrade: { damageAll: 42, weakAll: 8 }, tags: [pack.roster[1][1], pack.name] },
      { id: pack.roster[2][8], name: `${pack.roster[2][1]}·節奏拆解`, category: "signature", type: "tactic", rarity: "signature", cost: 1, draw: 2, blockAll: 12, weakAll: 3, text: `${pack.roster[2][1]}拆開敵方節奏，抽 2 張牌，全隊獲得 12 護甲，敵人虛弱 3 點。`, upgrade: { draw: 3, blockAll: 20, weakAll: 5 }, tags: [pack.roster[2][1], pack.name] },
      { id: pack.generalCards[0][0], name: pack.generalCards[0][1], category: "general", type: pack.generalCards[0][2], rarity: "rare", cost: 2, damageAll: 24, pierce: true, weakAll: 4, text: `${pack.name}來源牌。穿透護甲對所有敵人造成 24 傷害並虛弱 4 點。`, upgrade: { damageAll: 36, weakAll: 7 }, tags: [pack.name, "突擊"], sourceId: pack.sourceId, sourceName: pack.name },
      { id: pack.generalCards[1][0], name: pack.generalCards[1][1], category: "general", type: pack.generalCards[1][2], rarity: "uncommon", cost: 1, blockAll: 18, draw: 1, reduceStress: 4, text: `${pack.name}來源牌。全隊獲得 18 護甲，抽 1 張牌，壓力 -4。`, upgrade: { blockAll: 28, draw: 2, reduceStress: 6 }, tags: [pack.name, "戰術"], sourceId: pack.sourceId, sourceName: pack.name }
    );

    equipment.push(
      { id: pack.equipment[0][0], name: pack.equipment[0][1], rarity: "legendary", effect: pack.equipment[0][2], amount: pack.equipment[0][3], upgradedAmount: pack.equipment[0][3] + 3, text: `${pack.equipment[0][1]}支援${pack.subtitle}的核心爆發。`, sourceId: `${pack.sourceId}-equipment`, sourceName: `${pack.name}裝備` },
      { id: pack.equipment[1][0], name: pack.equipment[1][1], rarity: "rare", effect: pack.equipment[1][2], amount: pack.equipment[1][3], upgradedAmount: pack.equipment[1][3] + 2, text: `${pack.equipment[1][1]}讓隊伍在${pack.subtitle}中維持節奏。`, sourceId: `${pack.sourceId}-equipment`, sourceName: `${pack.name}裝備` }
    );

    customTags.push(
      { id: `${pack.sourceId}-core-tag`, name: `${pack.name}核心適性`, family: pack.tagFamily, tier: "A", cost: 8200, art: `./src/assets/generated/skill-${pack.roster[0][8]}.png`, text: `${pack.subtitle}適性。攻擊牌傷害 +3，第一回合抽 1 張牌。`, effects: { attackBonus: 3, openingDraw: 1 } },
      { id: `${pack.sourceId}-support-tag`, name: `${pack.name}支援節奏`, family: pack.tagFamily, tier: "B", cost: 3600, art: `./src/assets/generated/skill-${pack.roster[2][8]}.png`, text: "開場護甲 +8，第一張戰術牌抽 1 張。", effects: { openingBlockAll: 8, firstTacticDraw: 1 } }
    );
    customMutations.push({ id: `${pack.sourceId}-main-god-mutation`, name: `${pack.name}主神複合適性`, requiredTags: [`${pack.sourceId}-core-tag`, "inner-qi-breath"], art: `./src/assets/generated/skill-${pack.roster[0][8]}.png`, text: "攻擊帶狀態敵人傷害 +6；回合開始全隊獲得 3 護甲。", effects: { statusExploitBonus: 6, turnBlockAll: 3 } });

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
      { id: elite[0], name: `${pack.name}菁英試煉`, tier: "elite", enemies: [enemyIds[2], enemyIds[1]], rewardPoints: 11000 },
      { id: miniboss, name: `${pack.name}隱藏線危機`, tier: "miniboss", enemies: [enemyIds[2]], rewardPoints: 15600 },
      { id: boss, name: `${pack.name}終局王戰`, tier: "boss", enemies: [enemyIds[3]], rewardPoints: 26000 }
    );

    characterSources.push({ id: pack.sourceId, name: pack.name, description: `${pack.roster[0][1]}、${pack.roster[1][1]}與${pack.roster[2][1]}接入主神空間，守住${pack.subtitle}的核心命運線。`, heroFileName: `roster-hero-${pack.sourceId}.png`, memberIds: pack.roster.map((row) => row[0]) });
    cardSources.push({ id: pack.sourceId, name: pack.name, description: pack.sourceDescription });
    equipmentSources.push({ id: `${pack.sourceId}-equipment`, name: `${pack.name}裝備`, description: `${pack.name}劇本裝備，支援${pack.subtitle}的開場、護甲與攻擊節奏。` });

    bonds.push(
      { id: `${pack.sourceId}-core-trio`, name: `${pack.name}核心三人線`, members: pack.roster.map((row) => row[0]), text: `${pack.roster.map((row) => row[1]).join("、")}同時上陣。開場全隊獲得 10 護甲；第一張攻擊牌傷害 +6。`, effects: { openingBlockAll: 10, firstAttackBonus: 6 } },
      { id: `cross-${pack.sourceId}-zhongzhou`, name: `${pack.name}中洲戰術接入`, members: [...pack.roster.map((row) => row[0]), "chu-xuan"], text: `${pack.roster.map((row) => row[1]).join("、")}與楚軒同時上陣。開場抽 1 張牌；第一張戰術牌使敵人虛弱 4 點。`, effects: { openingDraw: 1, firstTacticWeakAll: 4 }, crossWorld: true }
    );
  }

  const shop = [
    ...cards.filter((card) => card.category === "general").map((card, index) => ({ id: `shop-${card.id}`, kind: "card", itemId: card.id, rewardPointCost: 1900 + index * 170, stock: card.rarity === "rare" ? 1 : 2 })),
    ...equipment.map((item, index) => ({ id: `shop-${item.id}`, kind: "equipment", itemId: item.id, rewardPointCost: 5200 + index * 300, sideStoryCost: item.rarity === "legendary" ? 3 : 2, stock: 1 }))
  ];

  data.scenarios.push(...scenarios);
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
  data.legendaryRecruitmentPool.push(...packs.map((pack) => pack.hiddenProtagonistId));

  for (const scenario of scenarios) {
    scenario.opening = openings[scenario.id];
    data.economy.scenarioSideStoryRewards[scenario.id] = 18;
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
        stage2: { id: `${scenario.id}-fixed-commit`, title: `守住${scenario.subtitle}`, text: `放棄安全收益，集中所有資源改寫${scenario.name}的核心崩壞節點。` },
        final: { id: `${scenario.id}-fixed-good-end`, title: `帶回${hiddenName}`, text: `${hiddenName}跨過最危險的瞬間，代表性力量被主神記錄。` },
        outcome: {
          title: `${scenario.name}命運線改寫`,
          text: `${hiddenName}的主角線被中洲隊拉回可控方向。`,
          effects: [{ type: "recruit-hidden" }, { type: "scenario-power" }, { type: "side-story", amount: 1 }],
          rewards: [`隱藏角色：${hiddenName}`, scenario.scenarioPowerName, "支線劇情 +1"],
          costs: ["主神記錄到你們對最新戰鬥劇本的高強度干涉。"],
          storyImpact: `${hiddenName}避開原本最壞的節點，劇本主線獲得明確改善。`,
          worldState: `${scenario.name}的終局被推向可重玩路線。`
        }
      },
      {
        id: `${scenario.id}-fixed-risk-route`,
        routeType: "高壓支線",
        priority: "fixed",
        stage1: { id: `${scenario.id}-fixed-pressure`, title: "強行搶攻敵方核心", text: "隊伍用最短路線逼近 Boss，但戰鬥壓力會提前堆高。" },
        stage2: { id: `${scenario.id}-fixed-cost`, title: "承受劇本反噬", text: "主神把敵方精英提前投放，所有人必須帶著壓力前進。" },
        final: { id: `${scenario.id}-fixed-risk-end`, title: "以代價換情報", text: "未能完全改寫主角線，但拿到下一輪關鍵情報。" },
        outcome: {
          title: `${scenario.name}高壓情報`,
          text: "隊伍帶回敵方核心情報，但隱藏主角線仍需要重玩修正。",
          effects: [{ type: "reward-points", amount: 3600 }, { type: "side-story", amount: 1 }],
          rewards: ["獎勵點 +3600", "支線劇情 +1"],
          costs: ["全隊壓力在下一場戰鬥提高。"],
          storyImpact: "敵方核心機制被解析，但最壞命運尚未徹底扭轉。",
          worldState: `${scenario.name}留下可供重玩追擊的情報節點。`
        }
      },
      {
        id: `${scenario.id}-fixed-resource-route`,
        routeType: "資源回收線",
        priority: "fixed",
        stage1: { id: `${scenario.id}-fixed-supply`, title: "回收劇本裝備", text: "隊伍避開最危險主線，先取得可帶回主神空間的裝備樣本。" },
        stage2: { id: `${scenario.id}-fixed-cache`, title: "拆解敵方素材", text: "支援人員把敵方素材轉換成可購買裝備與卡牌來源。" },
        final: { id: `${scenario.id}-fixed-supply-end`, title: "完成資源撤離", text: "隊伍撤出前保留足夠素材，讓下一輪攻略更穩。" },
        outcome: {
          title: `${scenario.name}資源回收`,
          text: "隊伍回收了劇本裝備樣本與來源情報。",
          effects: [{ type: "reward-points", amount: 2600 }, { type: "shop-discount", amount: 1 }],
          rewards: ["獎勵點 +2600", "劇本商店折扣"],
          costs: ["隱藏主角線沒有被推進。"],
          storyImpact: "中洲隊獲得更好的下輪準備，但核心命運仍維持原狀。",
          worldState: `${scenario.name}的資源點被標記。`
        }
      }
    ];
  }
})(globalThis);
