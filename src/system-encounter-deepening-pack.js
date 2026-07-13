(function (global) {
  const data = global.MainGodData;
  if (!data || data.systemEncounterDeepeningLoaded) return;
  data.systemEncounterDeepeningLoaded = true;

  const profiles = [
    {
      id: "jujutsu-kaisen-shibuya",
      slug: "jjk",
      name: "澀谷結界",
      hidden: "五條悟",
      core: "獄門疆",
      boss: "宿儺",
      world: "澀谷地下的帳被重新標定，獄門疆不再只有一個解法。"
    },
    {
      id: "fullmetal-alchemist-finale",
      slug: "fma",
      name: "約定之日",
      hidden: "愛德華",
      core: "真理之門",
      boss: "瓶中小人",
      world: "中央市地脈被中洲隊寫入反制節點，國土鍊成陣開始反向崩解。"
    },
    {
      id: "cyberpunk-edgerunners-night-city",
      slug: "cyberpunk",
      name: "夜城月線",
      hidden: "大衛",
      core: "月面資料鏈",
      boss: "亞當碎骨",
      world: "夜城的交易鏈被拆成可利用的情報節點，荒坂不再獨佔結局。"
    },
    {
      id: "black-myth-wukong-relics",
      slug: "bmw",
      name: "六根命盤",
      hidden: "天命人",
      core: "六根殘響",
      boss: "金箍命局",
      world: "六根不再只是收集品，而是能被中洲隊反向佈局的命盤。"
    },
    {
      id: "genshin-inazuma-vision-hunt",
      slug: "inazuma",
      name: "稻妻眼狩令",
      hidden: "雷電影",
      core: "一心淨土",
      boss: "無想一刀",
      world: "千手百眼神像裡的願望被重新放回人群，永恆不再只是停滯。"
    },
    {
      id: "chainsaw-man-reze-arc",
      slug: "chainsaw",
      name: "雨夜蕾塞篇",
      hidden: "淀治",
      core: "波奇塔心臟",
      boss: "炸彈惡魔與槍之惡魔回聲",
      world: "雨夜咖啡店、學校與公安封鎖線被寫成可重玩的惡魔契約岔路。"
    },
    {
      id: "solo-leveling-jeju-raid",
      slug: "solo",
      name: "濟州島蟻巢",
      hidden: "成振宇",
      core: "影子抽取",
      boss: "蟻王",
      world: "濟州島的獵人戰線不再只等待救援，蟻巢深處留下影子軍團坐標。"
    },
    {
      id: "elden-ring-hell-run",
      slug: "elden",
      name: "交界地十王",
      hidden: "褪色者",
      core: "大盧恩與命定之死",
      boss: "艾爾登獸",
      world: "賜福、黑刀、暗月與火種被中洲隊接成一條能反咬王座的地獄路線。"
    },
    {
      id: "rumbling-finale",
      slug: "rumbling",
      name: "地鳴終局",
      hidden: "艾連·葉卡",
      core: "始祖座標與道路",
      boss: "終尾始祖骨架",
      world: "飛艇、雷槍、道路與圍巾被接成改命線，地鳴不再只剩毀滅倒數。",
      plotBeats: {
        rescue: "飛艇追進始祖骨架，米卡莎的圍巾和阿爾敏的談判窗口同時亮起。",
        layout: "楚軒把道路、始祖座標、雷槍箱與超大型蒸汽牆拆成四個可控節點。",
        price: "隊伍踩入地鳴蒸汽最密集的位置，用高壓與傷亡風險換取始祖級獎勵。",
        world: "兵長的雷槍補給、米卡莎的決斷與阿爾敏的談判被保存成下次重進伏筆。"
      },
      crossTalk: [
        { speaker: "漩渦鳴人", line: "把全世界都推成敵人太亂來了。要談，就先把艾連從那副骨架裡拽出來。" },
        { speaker: "灶門炭治郎", line: "我聞得到很重的悲傷味道。這不是單純的怪物，是一個走到盡頭的人。" },
        { speaker: "黑崎一護", line: "那股壓迫感不像靈壓，但像整個世界都在哭。斬開它之前，先找到人在哪裡。" }
      ],
      easterEggs: [
        "米卡莎圍巾的纖維被主神標成紅色命線，救援路線會優先亮起。",
        "阿爾敏把海的另一側標記為談判終點，灰色路線下次會少一層蒸汽牆。",
        "兵長留下的最後一箱雷槍沒有進商店，而是藏在第三階段暗線選項裡。"
      ]
    },
    {
      id: "infinity-castle",
      slug: "infinity",
      name: "無限城決戰",
      hidden: "灶門炭治郎",
      core: "赫刀日輪與黎明倒數",
      boss: "鬼舞辻無慘",
      world: "無限城的樓層、琵琶聲、赫刀與黎明倒數被寫入可反覆推演的鬼殺改命局。",
      plotBeats: {
        rescue: "炭治郎的氣味線穿過翻轉樓層，禰豆子的太陽伏筆在遠處同步發亮。",
        layout: "楚軒用琵琶聲的節拍反推無限城空間規則，替柱們標出合流點。",
        price: "隊伍把赫刀溫度推到極限，用斑紋透支與鬼血污染換取高獎勵。",
        world: "黎明前的每一次合擊都被保存，下一次重進時柱的分割樓層會改變。"
      },
      crossTalk: [
        { speaker: "黑崎一護", line: "無慘的再生很像不肯承認死亡的靈壓。炭治郎，最後一刀我替你壓住空間。" },
        { speaker: "艾連·葉卡", line: "一直往前走不代表只能毀掉一切。那個孩子還在找把人帶回來的方法。" },
        { speaker: "漩渦鳴人", line: "分散的柱就像被切開的小隊。先把同伴接回來，再一起打穿城底。" }
      ],
      easterEggs: [
        "善逸的雷聲沒有出現在路線名裡，但第三階段會短暫劈開一條樓梯。",
        "禰豆子的陽光血伏筆會降低高代價路線的一次詛咒強度。",
        "伊之助把錯誤通道撞成捷徑，灰色路線會多一個商店折扣標記。"
      ]
    },
    {
      id: "naruto-final-valley",
      slug: "naruto",
      name: "終末之谷決戰",
      hidden: "漩渦鳴人",
      core: "九尾查克拉與六道陽之力",
      boss: "終末之谷佐助",
      world: "尾獸查克拉、神樹殘根、因陀羅之矢與和解之印被拆成可選的命運分支。",
      plotBeats: {
        rescue: "鳴人與佐助的終末谷對撞被主神拆成救援窗口，九喇嘛查克拉沿瀑布逆流。",
        layout: "楚軒把尾獸查克拉、神樹根系、須佐能乎與封印札接成忍界戰術沙盤。",
        price: "隊伍故意承受因陀羅之矢的前奏壓迫，用查克拉灼傷換高價獎勵。",
        world: "和解之印、聯軍忍具和九喇嘛的尾獸連結會改變後續 Boss 開場。"
      },
      crossTalk: [
        { speaker: "灶門炭治郎", line: "鳴人的氣味很吵，卻一直往同伴那邊跑。這不是愚蠢，是沒有放棄。" },
        { speaker: "艾連·葉卡", line: "如果他能在仇恨裡還想拉回朋友，也許道路不一定只通向毀滅。" },
        { speaker: "黑崎一護", line: "一個人背著力量很容易被力量拖走。鳴人，別讓佐助一個人沉下去。" }
      ],
      easterEggs: [
        "忍具箱底部藏著一張自來也的舊紙條，會讓救援路線多一次壓力恢復。",
        "卡卡西的鈴鐺聲只出現在楚軒布局局，代表錯判誘餌成功。",
        "佐助的護額裂痕被主神標成灰色路線伏筆，下次重進會提前顯示 Boss 弱點。"
      ]
    },
    {
      id: "bleach-false-karakura",
      slug: "bleach",
      name: "空座町終局",
      hidden: "黑崎一護",
      core: "斬月與崩玉封印",
      boss: "藍染惣右介",
      world: "空座町結界、浦原封印、崩玉進化與最後的月牙被改寫成可反咬棋局。",
      plotBeats: {
        rescue: "一護的最後月牙還沒完全成形，浦原封印術式在空座町結界外側閃爍。",
        layout: "楚軒把藍染的鏡花水月、崩玉進化與浦原封印視為同一盤多層棋。",
        price: "隊伍踏進崩玉靈壓最重的位置，以靈魂灼傷換取高階獎勵。",
        world: "斬月、店長封印和護廷十三隊支援會改寫後續商店與 Boss 節奏。"
      },
      crossTalk: [
        { speaker: "漩渦鳴人", line: "藍染那種把所有人當棋子的眼神我不喜歡。一護，這局我們一起掀桌。" },
        { speaker: "艾連·葉卡", line: "看穿別人的選擇不代表能支配結局。真正危險的是相信自己已經是神。" },
        { speaker: "灶門炭治郎", line: "一護身上的味道很孤獨，但不是絕望。那一刀是為了把大家帶回現實。" }
      ],
      easterEggs: [
        "浦原的木屐聲會在布局路線出現，代表封印術式提前完成一格。",
        "斬月的影子偶爾會站在選項插畫邊緣，提示最後一刀不是單純輸出。",
        "藍染椅子彩蛋被藏進高代價路線，成功後商店會多一次靈壓折扣。"
      ]
    },
    {
      id: "genshin-liyue-childe",
      slug: "liyue",
      name: "璃月請仙典儀",
      hidden: "鍾離",
      core: "璃月契約與岩王帝君身份",
      boss: "奧賽爾與黃金屋公子",
      world: "請仙典儀、黃金屋、群玉閣與岩王帝君退位被寫成可選的契約改命局。",
      plotBeats: {
        rescue: "假死的岩王帝君身份、仙人質疑與璃月七星的接手窗口被同時標亮。",
        layout: "楚軒把請仙典儀、黃金屋神之心交易、群玉閣墜落與奧賽爾封印拆成四層契約。",
        price: "隊伍故意踏入黃金屋與海港風暴的高壓交界，用岩元素反噬換取高階獎勵。",
        world: "送仙典儀、往生堂帳本與群玉閣重建資材會改變下次璃月商店與 Boss 節奏。"
      },
      crossTalk: [
        { speaker: "托尼·史塔克", line: "這座港口把神明退休做成了商業交接，說真的，董事會都沒這麼會演。" },
        { speaker: "坂田銀時", line: "送仙典儀聽起來很正式，但帳單誰付？先說好，萬事屋不接沒甜食的委託。" },
        { speaker: "威廉·亞當斯", line: "契約像守護靈一樣會選人。若鍾離已經決定放手，就要確認接住璃月的人不會倒下。" }
      ],
      easterEggs: [
        "往生堂帳本角落寫著第七十七代堂主的塗鴉，救援路線會多一次商店折扣。",
        "群玉閣碎片被主神標成金色落點，高代價路線可換一件傳說裝備。",
        "一枚摩拉在第三階段反覆翻面，暗示契約不是結束，而是下一次交易的開始。"
      ]
    },
    {
      id: "nioh-yokai-sengoku",
      slug: "nioh",
      name: "戰國妖禍",
      hidden: "威廉·亞當斯",
      core: "守護靈瑟夏與精華戰爭",
      boss: "安土城八岐大蛇",
      world: "倫敦塔、瑟夏、德川暗線、關原與安土城精華鍊成被接成守護靈救援局。",
      plotBeats: {
        rescue: "瑟夏被凱瑞帶走前的精華流向被固定，威廉不必孤身追進妖怪戰國。",
        layout: "楚軒把倫敦塔、九州、關原、安土城與守護靈坐標拆成一張跨海追蹤圖。",
        price: "隊伍踩入精華鍊成陣的反噬核心，以常世污染與重傷風險換取守護靈級獎勵。",
        world: "半藏的忍者網、阿勝的眼線與立花雷切會改寫下次常世裂縫分布。"
      },
      crossTalk: [
        { speaker: "鍾離", line: "精華戰爭與契約很像，真正危險的不是力量本身，而是借力者忘了代價。" },
        { speaker: "黑崎一護", line: "守護靈被奪走的感覺我懂。威廉，別讓刀替你決定你要成為什麼。" },
        { speaker: "托尼·史塔克", line: "十六世紀的妖怪能源戰爭？很好，這比我的反應爐還缺安全規範。" }
      ],
      easterEggs: [
        "半藏在地圖角落留下伊賀暗號，布局路線會額外顯示一個安全撤退點。",
        "瑟夏的蝴蝶光點若出現在選項圖邊緣，代表救援線下次優先刷新。",
        "安土城門旁的黑武士刀痕被主神保存，高代價路線會減少一次常世污染。"
      ]
    },
    {
      id: "gintama-final-war",
      slug: "gintama",
      name: "銀魂最終決戰",
      hidden: "高杉晉助",
      core: "松陽殘光與阿爾塔納",
      boss: "虛",
      world: "終端塔、阿爾塔納光流、松陽殘光與攘夷三人的最後斬線被寫成可重玩的救人局。",
      plotBeats: {
        rescue: "高杉的生命線、銀時的木刀、桂的爆破路線與松陽殘光在終端塔同時交錯。",
        layout: "楚軒把阿爾塔納供能、奈落伏兵、終端塔支柱與虛的再生週期拆成一盤怪異棋局。",
        price: "隊伍踩進阿爾塔納暴走核心，用壽命灼傷和精神壓力換取終局級獎勵。",
        world: "松下村塾的舊課本、萬事屋帳單與桂的爆破圖會改寫下次江戶支援線。"
      },
      crossTalk: [
        { speaker: "坂田銀時", line: "喂，楚軒，別把人命算得像糖分攝取量。救高杉這件事，我可不接受折扣方案。" },
        { speaker: "托尼·史塔克", line: "終端塔、永生能源、老朋友互砍，這劇本我熟。區別是你們的吐槽密度太高了。" },
        { speaker: "鍾離", line: "故人之約最難履行。若此戰能留下一人，便不是無用的契約。" }
      ],
      easterEggs: [
        "萬事屋欠費單被主神判定為詛咒牌，但銀時堅持那是劇情道具。",
        "伊麗莎白的牌子沒有文字，卻能讓布局路線多一次錯判誘餌。",
        "高杉的煙管火星在第三階段亮起，代表松陽殘光還沒完全熄滅。"
      ]
    },
    {
      id: "avengers-new-york",
      slug: "avengers",
      name: "紐約之戰",
      hidden: "托尼·史塔克",
      core: "宇宙魔方與復仇者集結",
      boss: "齊塔瑞傳送門核心",
      world: "史塔克大樓、神盾局封鎖線、核彈航道與宇宙魔方被中洲隊改寫成集結路線。",
      plotBeats: {
        rescue: "核彈飛向傳送門前，托尼的裝甲能源、魔方讀數與城市撤離線同時進入倒數。",
        layout: "楚軒把史塔克大樓、洛基權杖、魔方穩定器與核彈航道拆成三分鐘作戰模型。",
        price: "隊伍故意站進傳送門能量回流區，用輻射、壓力與裝甲損壞換取高階獎勵。",
        world: "披薩店、神盾局通訊與復仇者第一次合照會改寫下次紐約支援和商店。"
      },
      crossTalk: [
        { speaker: "楚軒", line: "凡人的智慧啊，真正的勝負不在核彈，而在誰能決定核彈進入哪一個坐標。" },
        { speaker: "坂田銀時", line: "外星人、爆炸、城市維修費。這種委託聽起來就不會準時付款。" },
        { speaker: "鍾離", line: "凡人以自身性命履行守城之約，這份契約足以讓神明沉默片刻。" }
      ],
      easterEggs: [
        "沙威瑪店坐標被藏在世界改寫局裡，通關後商店會短暫出現恢復折扣。",
        "史塔克大樓頂端的 A 字母沒有顯示成文字，但會在選項圖裡以剪影出現。",
        "洛基權杖的藍光若與主神白光重疊，高代價路線會額外給一張稀有牌。"
      ]
    }
  ];

  const openings = [
    {
      key: "rescue",
      routeType: "系統救援局",
      art: "rescue",
      fateType: "system-hidden-rescue",
      rank: 5,
      title: (p) => `救回${p.hidden}的核心命線`,
      text: (p) => `主神把${p.hidden}的死亡或封鎖節點拆成多個可介入窗口。`,
      reward: (p) => `隱藏人物線：${p.hidden}`,
      cost: "放棄一部分安全收益，優先搶救核心人物。"
    },
    {
      key: "layout",
      routeType: "楚軒布局局",
      art: "layout",
      fateType: "system-chu-layout",
      rank: 4,
      title: () => "讓楚軒反推劇本規則",
      text: (p) => `楚軒把${p.core}、Boss 行動和主神獎勵視為同一個模型。`,
      reward: () => "Boss 節奏與事件規則被重新標記",
      cost: "隊伍必須接受較冷酷的行動分配。"
    },
    {
      key: "price",
      routeType: "高代價截獎局",
      art: "price",
      fateType: "system-price-reward",
      rank: 3,
      title: () => "透支主神評分截取獎勵",
      text: (p) => `隊伍故意踩進${p.boss}的高壓窗口，用壓力與詛咒換更厚獎勵。`,
      reward: () => "高價值獎勵提前釋放",
      cost: "命運壓力、詛咒或傷勢會被寫入輪迴檔案。"
    },
    {
      key: "world",
      routeType: "世界改寫局",
      art: "layout",
      fateType: "system-world-rewrite",
      rank: 4,
      title: (p) => `改寫${p.name}後續規則`,
      text: (p) => `不只救人或拿獎勵，而是把${p.name}的世界狀態改成下次可利用的伏筆。`,
      reward: () => "後續 Boss、商店或救援線出現新變數",
      cost: "當下獎勵較少，但後續路線更深。"
    }
  ];

  const methods = [
    { key: "probe", title: "冷讀情報差", text: (p) => `先讓精神鏈路掃過${p.core}，找出主神沒有標註的縫隙。` },
    { key: "split", title: "分隊佯攻", text: (p) => `前排牽制${p.boss}，後排沿楚軒標出的低風險路線切入。` },
    { key: "bait", title: "誘導錯判", text: () => "故意露出一個可被敵人看見的破綻，把真正行動藏在第二層。" },
    { key: "lock", title: "主神窗口鎖定", text: () => "用第 7 人支援把白光坐標固定，避免事件在最後一秒逃走。" }
  ];

  const endings = [
    { key: "clean", title: "乾淨收束", effect: "clean" },
    { key: "costly", title: "帶著代價收束", effect: "costly" },
    { key: "secret", title: "暗線延伸", effect: "secret" }
  ];

  const restFallbackScenes = [
    {
      id: "starship",
      fileName: "system-rest-generic-starship.png",
      title: "星艦封鎖線戰術桌",
      text: "隊伍把艙段地圖、氣閘壓力、生命訊號與撤離窗口攤在桌面，先找出下一次能活著離開的路。"
    },
    {
      id: "haunted",
      fileName: "system-rest-generic-haunted.png",
      title: "靈異封印戰術桌",
      text: "符紙、錄音帶、咒物殘片與精神鏈路同時標紅，楚軒要求所有人先確認詛咒從哪裡開始。"
    },
    {
      id: "jungle",
      fileName: "system-rest-generic-jungle.png",
      title: "叢林獵場戰術桌",
      text: "濕透的地圖上壓著爪痕、彈殼與熱源讀數，後勤把補給線縮到下一個安全高地。"
    },
    {
      id: "wasteland",
      fileName: "system-rest-generic-wasteland.png",
      title: "末日車隊戰術桌",
      text: "燃油、路障、追兵和水源被排成一條粗暴但可執行的撤離線，沒有人再把休息當成真正安全。"
    }
  ];
  const restImageFiles = profiles.map((profile) => restImageFileFor(profile));

  function choice(id, title, text, imageFile = "") {
    return imageFile ? { id, title, text, imageFile } : { id, title, text };
  }

  function routeFor(profile, opening, method, ending) {
    const routeId = `system-${profile.slug}-${opening.key}-${method.key}-${ending.key}`;
    const finalId = `${routeId}-end`;
    const imageFile = imageFileFor(profile, opening, method, ending);
    return {
      id: routeId,
      routeType: opening.routeType,
      systemEncounter: true,
      imageFile,
      stage1: choice(
        `system-${profile.slug}-${opening.key}`,
        opening.title(profile),
        withPlotBeat(opening.text(profile), profile, opening),
        imageFile
      ),
      stage2: choice(
        `system-${profile.slug}-${opening.key}-${method.key}`,
        method.title,
        withPlotBeat(method.text(profile), profile, opening),
        imageFile
      ),
      final: choice(
        finalId,
        `${ending.title}：${opening.reward(profile)}`,
        finalText(profile, opening, method, ending),
        imageFile
      ),
      outcome: outcomeFor(profile, opening, method, ending, finalId, imageFile)
    };
  }

  function imageFileFor(profile, opening, method, ending) {
    if (opening.key === "layout" || opening.key === "world") {
      return restImageFileFor(profile);
    }
    return `system-encounter-${profile.slug}-${opening.art}.png`;
  }

  function restImageFileFor(profile) {
    return `system-rest-${profile.slug}.png`;
  }

  function restSceneFor(profile) {
    const briefing = profile.plotBeats?.layout || profile.world;
    return {
      scenarioId: profile.id,
      fileName: restImageFileFor(profile),
      title: `${profile.name}休整戰術桌`,
      text: `中洲隊把${profile.hidden}、${profile.core}與${profile.boss}的因果攤成戰術圖。${briefing}`
    };
  }

  function seedIndex(value, size) {
    return value.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) % size;
  }

  function finalText(profile, opening, method, ending) {
    if (ending.effect === "clean") return `${method.title}完成，${opening.reward(profile)}以最低代價寫進輪迴檔案。`;
    if (ending.effect === "costly") return `${method.title}成功，但${profile.boss}的反噬同步回灌，隊伍必須承受代價。`;
    return `${method.title}留下第二層暗線，${profile.name}下次重進時會出現不同判定。`;
  }

  function outcomeFor(profile, opening, method, ending, finalId, imageFile) {
    const effects = effectsFor(opening, ending);
    const endingLabel = ending.effect === "clean" ? "低代價" : ending.effect === "costly" ? "高代價" : "暗線";
    const title = `${opening.routeType} · ${endingLabel}`;
    return {
      id: finalId,
      title,
      text: `${profile.name}的系統奇遇被推向${endingLabel}結局。${chuLine(opening, ending)}`,
      imageFile,
      dialogue: dialogueFor(profile, opening, method, ending),
      effects,
      rewards: [
        opening.reward(profile),
        ending.effect === "secret" ? "後續暗線保存" : "輪迴檔案更新",
        ...easterReward(profile, opening, method, ending)
      ],
      costs: [opening.cost, ending.effect === "costly" ? "隊伍承受額外壓力或詛咒。" : "沒有額外長期代價。"],
      storyImpact: `${profile.hidden}、${profile.core}與${profile.boss}之間的因果被中洲隊切開，這條路線會影響後續結局。${plotImpact(profile, opening, method, ending)}`,
      worldState: ending.effect === "secret" ? `${profile.world} 暗線仍在延伸。` : profile.world
    };
  }

  function withPlotBeat(text, profile, opening) {
    const beat = profile.plotBeats?.[opening.key];
    return beat ? `${text} ${beat}` : text;
  }

  function plotImpact(profile, opening, method, ending) {
    const beat = profile.plotBeats?.[opening.key];
    const easter = pickProfileLine(profile.easterEggs, opening, method, ending);
    return `${beat ? ` 原作節點：${beat}` : ""}${easter ? ` 彩蛋伏筆：${easter}` : ""}`;
  }

  function easterReward(profile, opening, method, ending) {
    const easter = pickProfileLine(profile.easterEggs, opening, method, ending);
    return easter ? [`彩蛋：${easter}`] : [];
  }

  function effectsFor(opening, ending) {
    const record = { type: "record-fate", fateType: `${opening.fateType}-${ending.effect}`, endingRank: opening.rank };
    if (opening.key === "rescue" && ending.effect === "clean") return [{ type: "recruit-hidden" }, { type: "side-story", amount: 2 }, record];
    if (opening.key === "layout") return [{ type: "run-power", id: "system-chu-layout-window", effect: "openingDraw", amount: 1 }, { type: "reward-points", amount: 900 }, record];
    if (opening.key === "price") return ending.effect === "costly"
      ? [{ type: "curse" }, { type: "legendary-equipment" }, { type: "stress", amount: 24 }, record]
      : [{ type: "rare-card" }, { type: "reward-points", amount: 1200 }, { type: "stress", amount: 12 }, record];
    if (ending.effect === "costly") return [{ type: "damage-fraction", amount: 0.18 }, { type: "scenario-power" }, record];
    return [{ type: "scenario-power" }, { type: "side-story", amount: 1 }, record];
  }

  function chuLine(opening, ending) {
    if (opening.key === "layout") return "楚軒推了推眼鏡：凡人的智慧啊，真正的問題不是敵人有多強，而是你們一直把題目看成單選。";
    if (ending.effect === "costly") return "楚軒冷淡補充：凡人的智慧啊，代價不是失敗，無法計算的代價才是。";
    return "楚軒把最後一條線畫完：凡人的智慧啊，只要知道主神怎麼出題，結局就不是唯一答案。";
  }

  function dialogueFor(profile, opening, method, ending) {
    const costLine = ending.effect === "costly"
      ? { speaker: "鄭吒", line: "我同意冒險，但代價由我先扛。別把後排推到死路上。" }
      : { speaker: "詹嵐", line: "精神鏈接穩住了。這條路線不是幻覺，我能看到它正在變亮。" };
    const crossTalk = pickProfileLine(profile.crossTalk, opening, method, ending);
    const easter = pickProfileLine(profile.easterEggs, opening, method, ending);
    return [
      { speaker: "主神", line: `${profile.name}系統奇遇展開：${opening.routeType}。` },
      { speaker: "楚軒", line: chuLine(opening, ending) },
      costLine,
      { speaker: "主角", line: `我會留在第 7 人位置，把${method.title}需要的支援接上。這次不是旁觀，是改命。` },
      { speaker: profile.hidden, line: `${profile.core}的聲音變了。若你們能把路線走完，我就不必只照原本結局退場。` },
      ...(crossTalk ? [{ speaker: crossTalk.speaker, line: `跨宇宙通訊：${crossTalk.line}` }] : []),
      ...(easter ? [{ speaker: "主神", line: `彩蛋訊號：${easter}` }] : [])
    ];
  }

  function pickProfileLine(items, opening, method, ending) {
    if (!items?.length) return null;
    return items[seedIndex(`${opening.key}-${method.key}-${ending.key}`, items.length)];
  }

  const routesByScenario = {};
  profiles.forEach((profile) => {
    routesByScenario[profile.id] = openings.flatMap((opening) => (
      methods.flatMap((method) => endings.map((ending) => routeFor(profile, opening, method, ending)))
    ));
  });

  data.systemEncounterScenarioIds = profiles.map((profile) => profile.id);
  data.systemEncounterRestScenesByScenario = {
    ...(data.systemEncounterRestScenesByScenario || {}),
    ...Object.fromEntries(profiles.map((profile) => [profile.id, restSceneFor(profile)]))
  };
  data.systemEncounterRestFallbackScenes = restFallbackScenes;
  data.systemEncounterRestFallbackImageFiles = restFallbackScenes.map((scene) => scene.fileName);
  data.systemEncounterRestImageFiles = [...restImageFiles, ...data.systemEncounterRestFallbackImageFiles];
  data.systemEncounterRoutes = {
    ...(data.systemEncounterRoutes || {}),
    ...routesByScenario
  };
})(globalThis);
