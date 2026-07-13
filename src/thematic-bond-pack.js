(function (global) {
  const data = global.MainGodData;
  if (!data) return;

  const charactersById = Object.fromEntries((data.characters || []).map((character) => [character.id, character]));
  const existingIds = new Set((data.bonds || []).map((bond) => bond.id));
  const added = [];

  function validMembers(ids) {
    return [...new Set((ids || []).filter((id) => {
      const character = charactersById[id];
      return character && !character.tutorialOnly && !character.playerOnly;
    }))];
  }

  function addBond(definition) {
    const members = validMembers(definition.members);
    const sourceMembers = validMembers(definition.sourceMembers);
    if (definition.members && members.length !== definition.members.length) return;
    if (definition.sourceMembers && sourceMembers.length < Number(definition.count || 2)) return;
    if (!definition.id || existingIds.has(definition.id)) return;

    existingIds.add(definition.id);
    data.bonds.push({
      ...definition,
      ...(definition.members ? { members } : {}),
      ...(definition.sourceMembers ? { sourceMembers } : {})
    });
    added.push(definition.id);
  }

  const thematicBonds = [
    {
      id: "theme-white-hair-problem",
      themeGroup: "hair",
      name: "白髮到底誰最強",
      sourceMembers: ["satoru-gojo", "gintoki-sakata", "frieren-mage", "dante-dmc5", "ganyu", "kamisato-ayaka", "toge-inumaki", "zero"],
      count: 3,
      crossWorld: true,
      text: "任意 3 名白髮或銀髮系角色同時上陣。主神把髮色列為高危戰力標籤；開場抽 1 張牌，第一張戰術牌會使所有敵人虛弱 2 點。",
      effects: { openingDraw: 1, firstTacticWeakAll: 2 }
    },
    {
      id: "theme-silver-cold-blade",
      themeGroup: "hair",
      name: "銀髮冷面刀光",
      sourceMembers: ["gintoki-sakata", "dante-dmc5", "kamisato-ayaka", "ganyu", "satoru-gojo", "tachibana-ginchiyo", "kirito-kazuto"],
      count: 3,
      crossWorld: true,
      text: "任意 3 名銀髮、冷面或高速刀光角色同時上陣。第二張牌追加 5 點穿甲傷害，回合開始全隊壓力 -1。",
      effects: { secondCardDamage: 5, turnReduceStressAll: 1 }
    },
    {
      id: "theme-white-hair-deadpan",
      themeGroup: "hair",
      name: "白髮冷吐槽保護協會",
      sourceMembers: ["gintoki-sakata", "frieren-mage", "toge-inumaki", "shinpachi-shimura", "fern-apprentice", "zero"],
      count: 3,
      crossWorld: true,
      text: "任意 3 名冷吐槽、沉默或一句話能讓戰場降溫的角色同時上陣。回合開始全隊壓力 -2，第 5 張牌再抽 1 張。",
      effects: { turnReduceStressAll: 2, fifthCardDraw: 1 }
    },
    {
      id: "theme-silver-magic-eyes",
      themeGroup: "hair",
      name: "銀髮魔眼讀秒",
      sourceMembers: ["satoru-gojo", "frieren-mage", "ranni-dark-moon", "ningguang", "chu-xuan", "clone-chu-xuan", "arthur-pencilgon"],
      count: 3,
      crossWorld: true,
      text: "任意 3 名能看穿規則、法術或勝負倒數的角色同時上陣。第一張戰術牌費用 -1 並抽 1 張牌，回合開始敵人虛弱 1 點。",
      effects: { firstTacticCostReduction: 1, firstTacticDraw: 1, turnWeakAll: 1 }
    },
    {
      id: "theme-frost-white-hair-line",
      themeGroup: "hair",
      name: "霜華白髮線",
      sourceMembers: ["ganyu", "kamisato-ayaka", "gangnir", "shoto-todoroki", "ranni-dark-moon", "sangonomiya-kokomi", "frieren-mage"],
      count: 3,
      crossWorld: true,
      text: "任意 3 名霜雪、月光或冷系白髮角色同時上陣。回合開始全隊獲得 2 護甲，每回合第一張攻擊牌穿透護甲。",
      effects: { turnBlockAll: 2, firstAttackPierce: 1 }
    },
    {
      id: "theme-main-character-meeting",
      themeGroup: "protagonist",
      name: "主角互相認親",
      sourceMembers: ["zheng-zha", "tanjiro-kamado", "naruto-uzumaki", "luffy-nika", "son-goku", "ichigo-kurosaki", "edward-elric", "eren-yeager", "yuji-itadori", "izuku-midoriya", "shinra-kusakabe", "asta-anti-magic", "rimuru-tempest", "natsu-dragneel", "naofumi-shield", "bmw-destined-one", "bmw-true-great-sage"],
      count: 4,
      crossWorld: true,
      text: "任意 4 名主角系角色同時上陣。大家一看就知道誰要衝第一個；開場抽 1 張牌，所有攻擊牌傷害 +2。",
      effects: { openingDraw: 1, attackBonus: 2 }
    },
    {
      id: "theme-shonen-loudspeaker",
      themeGroup: "protagonist",
      name: "熱血大嗓門共鳴",
      sourceMembers: ["naruto-uzumaki", "luffy-nika", "son-goku", "natsu-dragneel", "asta-anti-magic", "shinra-kusakabe", "katsuki-bakugo", "arataki-itto", "arthur-boyle", "yuji-itadori"],
      count: 3,
      crossWorld: true,
      text: "任意 3 名熱血吶喊型角色同時上陣。喊聲本身就是戰術；所有攻擊牌傷害 +3，但回合開始全隊壓力 +1。",
      effects: { attackBonus: 3, turnStressAll: 1 }
    },
    {
      id: "theme-never-stay-down",
      themeGroup: "protagonist",
      name: "倒下也要再站起來",
      sourceMembers: ["zheng-zha", "luffy-nika", "hakari-kinji", "max-rockatansky", "li-shuaixi", "naofumi-shield", "percival-hope", "gabimaru-hollow", "kafka-hibino", "denji-chainsaw", "bmw-destined-one", "bmw-true-great-sage"],
      count: 3,
      crossWorld: true,
      text: "任意 3 名死線求生或越打越不肯倒的角色同時上陣。回合開始全隊恢復 2 生命並獲得 2 護甲。",
      effects: { turnHealAll: 2, turnBlockAll: 2 }
    },
    {
      id: "theme-black-cloak-main-characters",
      themeGroup: "protagonist",
      name: "黑衣主角默契",
      sourceMembers: ["kirito-kazuto", "ichigo-kurosaki", "sung-jinwoo", "gabimaru-hollow", "ainz-ooal-gown", "black-knife-tiche", "zhao-yingkong"],
      count: 3,
      crossWorld: true,
      text: "任意 3 名黑衣、暗影或寡言主角系角色同時上陣。開場抽 1 張牌，第二張牌追加 5 點穿甲傷害。",
      effects: { openingDraw: 1, secondCardDamage: 5 }
    },
    {
      id: "theme-monster-heart-protagonists",
      themeGroup: "protagonist",
      name: "體內有怪物俱樂部",
      sourceMembers: ["naruto-uzumaki", "yuji-itadori", "ichigo-kurosaki", "eren-yeager", "denji-chainsaw", "kafka-hibino", "rin-okumura", "asta-anti-magic", "rimuru-tempest", "shoto-todoroki", "bmw-destined-one", "bmw-true-great-sage"],
      count: 3,
      crossWorld: true,
      text: "任意 3 名體內寄宿怪物、惡魔、巨人或異質力量的主角同時上陣。第一回合能量 +1、攻擊牌傷害 +2，但回合開始全隊壓力 +1。",
      effects: { openingEnergy: 1, attackBonus: 2, turnStressAll: 1 }
    },
    {
      id: "theme-friendship-is-resource",
      themeGroup: "protagonist",
      name: "友情努力勝利也要計成本",
      sourceMembers: ["tanjiro-kamado", "izuku-midoriya", "natsu-dragneel", "percival-hope", "naofumi-shield", "momo-ayase", "lucy-heartfilia", "capable", "shiemi-moriyama"],
      count: 3,
      crossWorld: true,
      text: "任意 3 名真正會把同伴放在勝利前面的角色同時上陣。第 5 張牌為全隊恢復 3 生命，回合開始全隊壓力 -1。",
      effects: { fifthCardHealAll: 3, turnReduceStressAll: 1 }
    },
    {
      id: "theme-villain-round-table",
      themeGroup: "villain",
      name: "反派圓桌會議",
      sourceMembers: ["clone-zheng-zha", "clone-chu-xuan", "adam", "ainz-ooal-gown", "albedo-guardian", "shalltear-valkyrie", "shinsuke-takasugi", "imhotep", "tom", "zhao-zhuikong"],
      count: 3,
      crossWorld: true,
      text: "任意 3 名反派、魔王、複製體或危險陣營角色同時上陣。第一張戰術牌使所有敵人虛弱 3 點，但回合開始全隊壓力 +1。",
      effects: { firstTacticWeakAll: 3, turnStressAll: 1 }
    },
    {
      id: "theme-final-boss-aura",
      themeGroup: "villain",
      name: "最終 Boss 氣場",
      sourceMembers: ["clone-zheng-zha", "adam", "ainz-ooal-gown", "raiden-ei", "zhongli-morax", "satoru-gojo", "son-goku", "clark-kent-superman", "rimuru-tempest", "bmw-true-great-sage", "bmw-erlang-shen"],
      count: 3,
      crossWorld: true,
      text: "任意 3 名壓場級角色同時上陣。開場抽 1 張牌，攻擊牌傷害 +2，回合開始全隊獲得 2 護甲。",
      effects: { openingDraw: 1, attackBonus: 2, turnBlockAll: 2 }
    },
    {
      id: "theme-smiling-backstabbers",
      themeGroup: "villain",
      name: "笑著背刺的人",
      sourceMembers: ["kiwi-edgerunners", "shinsuke-takasugi", "ranni-dark-moon", "adam", "nios", "amon", "ada-wong", "reze-bomb-devil", "arthur-pencilgon"],
      count: 3,
      crossWorld: true,
      text: "任意 3 名會把交易、背刺或二手情報算進下一步的人同時上陣。第一張戰術牌費用 -1，攻擊帶狀態敵人時傷害 +3。",
      effects: { firstTacticCostReduction: 1, statusExploitBonus: 3 }
    },
    {
      id: "theme-beautiful-danger",
      themeGroup: "villain",
      name: "美麗但危險",
      sourceMembers: ["albedo-guardian", "shalltear-valkyrie", "ranni-dark-moon", "raiden-ei", "diana-prince-wonder-woman", "tsukuyo-hyakka", "yuzuriha-kunoichi", "ada-wong", "reze-bomb-devil"],
      count: 3,
      crossWorld: true,
      text: "任意 3 名外表優雅但出手很重的角色同時上陣。開場抽 1 張牌，第二張牌追加 4 點穿甲傷害。",
      effects: { openingDraw: 1, secondCardDamage: 4 }
    },
    {
      id: "theme-zheng-clone-black-flame",
      themeGroup: "villain",
      name: "鄭吒與黑炎倒影",
      members: ["zheng-zha", "clone-zheng-zha"],
      crossWorld: true,
      text: "鄭吒與複製體鄭吒同時上陣。正本與倒影互相逼近極限；攻擊牌傷害 +3，但回合開始全隊壓力 +2。",
      effects: { attackBonus: 3, turnStressAll: 2 }
    },
    {
      id: "theme-chu-xuan-mirror-calculation",
      themeGroup: "villain",
      name: "楚軒與因果率鏡像",
      members: ["chu-xuan", "clone-chu-xuan"],
      crossWorld: true,
      text: "楚軒與複製體楚軒同時上陣。兩張演算桌互相校準；第一張戰術牌費用 -1，並使所有敵人虛弱 2 點，但回合開始全隊壓力 +1。",
      effects: { firstTacticCostReduction: 1, firstTacticWeakAll: 2, turnStressAll: 1 }
    },
    {
      id: "theme-luo-gandao-eva-echo",
      themeGroup: "villain",
      name: "羅甘道與暴走機影",
      members: ["luo-gandao", "clone-luo-gandao"],
      crossWorld: true,
      text: "羅甘道與複製體羅甘道同時上陣。同步率衝上危險區；第一回合能量 +1、回合開始全隊護甲 +1，但壓力 +2。",
      effects: { openingEnergy: 1, turnBlockAll: 1, turnStressAll: 2 }
    },
    {
      id: "theme-fire-users-table",
      themeGroup: "attribute",
      name: "火焰全部都算物理",
      sourceMembers: ["roy-mustang", "shinra-kusakabe", "natsu-dragneel", "rin-okumura", "xiao-yan", "tanjiro-kamado", "xiangling", "yoimiya", "reze-bomb-devil", "shoto-todoroki", "shiva-gangtian", "luo-yinglong", "bmw-red-boy", "bmw-yaksha-king"],
      count: 3,
      crossWorld: true,
      text: "任意 3 名火焰、爆破或燃燒屬性角色同時上陣。攻擊牌傷害 +2，攻擊帶狀態敵人時傷害 +3，但回合開始全隊壓力 +1。",
      effects: { attackBonus: 2, statusExploitBonus: 3, turnStressAll: 1 }
    },
    {
      id: "theme-thunder-users",
      themeGroup: "attribute",
      name: "雷電依法不講武德",
      sourceMembers: ["thor-odinson", "raiden-ei", "keqing", "beidou", "tachibana-ginchiyo", "arthur-boyle", "piers-nivans", "kujou-sara", "bmw-kangjin-star"],
      count: 3,
      crossWorld: true,
      text: "任意 3 名雷電、電漿或高壓輸出角色同時上陣。第一回合能量 +1，第二張牌追加 4 點穿甲傷害。",
      effects: { openingEnergy: 1, secondCardDamage: 4 }
    },
    {
      id: "theme-ice-cold-users",
      themeGroup: "attribute",
      name: "冰系其實很暴力",
      sourceMembers: ["gangnir", "ganyu", "kamisato-ayaka", "shoto-todoroki", "ranni-dark-moon", "sangonomiya-kokomi", "frieren-mage"],
      count: 3,
      crossWorld: true,
      text: "任意 3 名冰、霜、月或冷靜控制系角色同時上陣。回合開始敵人虛弱 1 點，第一張戰術牌再使所有敵人虛弱 2 點。",
      effects: { turnWeakAll: 1, firstTacticWeakAll: 2 }
    },
    {
      id: "theme-sword-users",
      themeGroup: "attribute",
      name: "劍士都說只是普通斬擊",
      sourceMembers: ["ichigo-kurosaki", "giyu-tomioka", "levi-ackerman", "kirito-kazuto", "dante-dmc5", "gintoki-sakata", "song-tian", "tachibana-ginchiyo", "maki-zenin", "erza-scarlet", "raphtalia-katana", "yuta-okkotsu", "tanjiro-kamado", "asta-anti-magic", "bmw-destined-one", "bmw-true-great-sage", "bmw-erlang-shen"],
      count: 4,
      crossWorld: true,
      text: "任意 4 名劍士或近戰斬擊角色同時上陣。每回合第一張攻擊牌穿透護甲，第二張牌追加 3 點穿甲傷害。",
      effects: { firstAttackPierce: 1, secondCardDamage: 3 }
    },
    {
      id: "theme-fist-solves-problems",
      themeGroup: "attribute",
      name: "拳頭可以解決邏輯",
      sourceMembers: ["yuji-itadori", "aoi-todo", "gon-freecss", "mash-burnedead", "luffy-nika", "bruce-banner-hulk", "haruka-sakura", "izumi-curtis", "jake-muller", "gabimaru-hollow"],
      count: 3,
      crossWorld: true,
      text: "任意 3 名拳腳、怪力或近身壓制角色同時上陣。攻擊牌傷害 +2，第 5 張牌為全隊恢復 2 生命。",
      effects: { attackBonus: 2, fifthCardHealAll: 2 }
    },
    {
      id: "theme-gunline",
      themeGroup: "attribute",
      name: "槍線就是答案",
      sourceMembers: ["zero", "riza-hawkeye", "clint-barton", "leon-kennedy", "ada-wong", "yukio-okumura", "mina-ashiro", "rebecca-edgerunners", "piers-nivans", "ba-wang", "kevin", "natasha-romanoff"],
      count: 3,
      crossWorld: true,
      text: "任意 3 名槍械、狙擊或遠程火力角色同時上陣。槍械裝備效果提高 15%，開場抽 1 張牌。",
      effects: { firearmMultiplier: 1.15, openingDraw: 1 }
    },
    {
      id: "theme-shield-brothers",
      themeGroup: "attribute",
      name: "盾牌人互助會",
      sourceMembers: ["steve-rogers", "naofumi-shield", "alphonse-elric", "richard", "mou-gang", "chris-redfield", "alexander-warrior-jar", "panda-jjk", "noelle-valkyrie", "albedo-guardian", "psyger-zero"],
      count: 3,
      crossWorld: true,
      text: "任意 3 名盾牌、鎧甲或前排守護角色同時上陣。回合開始全隊獲得 3 護甲並恢復 1 生命。",
      effects: { turnBlockAll: 3, turnHealAll: 1 }
    },
    {
      id: "theme-summoners-bring-friends",
      themeGroup: "attribute",
      name: "召喚物算不算隊友",
      sourceMembers: ["sung-jinwoo", "megumi-fushiguro", "yuta-okkotsu", "v-dmc5", "lucy-heartfilia", "ainz-ooal-gown", "arot", "shiemi-moriyama", "naruto-uzumaki"],
      count: 3,
      crossWorld: true,
      text: "任意 3 名召喚、影子、式神或使魔型角色同時上陣。開場抽 1 張牌，第 5 張牌再抽 1 張。",
      effects: { openingDraw: 1, fifthCardDraw: 1 }
    },
    {
      id: "theme-healer-support-net",
      themeGroup: "attribute",
      name: "後勤保命網",
      sourceMembers: ["cheng-xiao", "elena", "sangonomiya-kokomi", "shiemi-moriyama", "capable", "melina-kindling-maiden", "sherry-birkin", "van-hohenheim", "zhan-lan", "liu-yu"],
      count: 3,
      crossWorld: true,
      text: "任意 3 名治療、精神安定或撤離支援角色同時上陣。回合開始全隊恢復 3 生命並降低 1 壓力。",
      effects: { turnHealAll: 3, turnReduceStressAll: 1 }
    },
    {
      id: "theme-shadow-assassins",
      themeGroup: "attribute",
      name: "暗殺者都不走正門",
      sourceMembers: ["zhao-yingkong", "zhao-zhuikong", "black-knife-tiche", "tsukuyo-hyakka", "sougo-okita", "okatsu-nioh", "yuzuriha-kunoichi", "ada-wong", "natasha-romanoff", "maki-zenin"],
      count: 3,
      crossWorld: true,
      text: "任意 3 名暗殺、忍者、特工或近身突入角色同時上陣。開場抽 1 張牌，第二張牌追加 5 點穿甲傷害。",
      effects: { openingDraw: 1, secondCardDamage: 5 }
    },
    {
      id: "theme-tactical-geniuses",
      themeGroup: "attribute",
      name: "軍師開會敵人先扣血壓",
      sourceMembers: ["chu-xuan", "clone-chu-xuan", "armin-arlert", "tony-stark", "bruce-wayne-batman", "mako-mori", "ningguang", "sangonomiya-kokomi", "xiao-honglu", "arthur-pencilgon", "higuruma-hiromi"],
      count: 3,
      crossWorld: true,
      text: "任意 3 名戰術家、推演者或情報型角色同時上陣。第一張戰術牌費用 -1 並抽 1 張牌。",
      effects: { firstTacticCostReduction: 1, firstTacticDraw: 1 }
    },
    {
      id: "theme-regeneration-undead",
      themeGroup: "attribute",
      name: "再生系很難收工",
      sourceMembers: ["imhotep", "sherry-birkin", "rimuru-tempest", "ainz-ooal-gown", "shalltear-valkyrie", "van-hohenheim", "denji-chainsaw", "kafka-hibino", "gabimaru-hollow"],
      count: 3,
      crossWorld: true,
      text: "任意 3 名再生、不死、容器或異質生命角色同時上陣。回合開始全隊恢復 2 生命並獲得 1 護甲，攻擊帶狀態敵人時傷害 +2。",
      effects: { turnHealAll: 2, turnBlockAll: 1, statusExploitBonus: 2 }
    }
  ];

  thematicBonds.forEach(addBond);

  data.thematicBondSummary = {
    addedCount: added.length,
    hairCount: added.filter((id) => thematicBonds.find((bond) => bond.id === id)?.themeGroup === "hair").length,
    protagonistCount: added.filter((id) => thematicBonds.find((bond) => bond.id === id)?.themeGroup === "protagonist").length,
    villainCount: added.filter((id) => thematicBonds.find((bond) => bond.id === id)?.themeGroup === "villain").length,
    attributeCount: added.filter((id) => thematicBonds.find((bond) => bond.id === id)?.themeGroup === "attribute").length,
    addedIds: added
  };
})(globalThis);
