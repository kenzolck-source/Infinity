import "../src/game-data.js";
import "../src/game-core.js";
import "../src/audio-manifest.js";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";

const core = globalThis.MainGodCore;
const data = globalThis.MainGodData;
const audioManifest = globalThis.MainGodAudioManifest;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assetUrl(fileName) {
  return new URL(`../src/assets/generated/${fileName}`, import.meta.url);
}

function audioAssetUrl(fileName) {
  return new URL(`../src/assets/audio/${fileName}`, import.meta.url);
}

function hashAsset(fileName) {
  return createHash("sha256").update(readFileSync(assetUrl(fileName))).digest("hex");
}

function assertUniqueAssets(fileNames, message) {
  const hashes = fileNames.map((fileName) => hashAsset(fileName));
  assert(new Set(hashes).size === hashes.length, message);
}

function assertAudioAsset(fileName) {
  const url = audioAssetUrl(fileName);
  assert(existsSync(url), `Audio asset should exist: ${fileName}`);
  const buffer = readFileSync(url);
  assert(buffer.length > 2048, `Audio asset should not be empty: ${fileName}`);
  assert(buffer.toString("ascii", 0, 4) === "RIFF", `Audio asset should use RIFF header: ${fileName}`);
  assert(buffer.toString("ascii", 8, 12) === "WAVE", `Audio asset should use WAVE format: ${fileName}`);
}

function findCombatCard(state, cardId) {
  for (const pile of ["hand", "drawPile", "discardPile"]) {
    const card = state[pile].find((entry) => entry.cardId === cardId);
    if (card) {
      state[pile] = state[pile].filter((entry) => entry.uid !== card.uid);
      state.hand.push(card);
      return card;
    }
  }
  throw new Error(`Missing combat card: ${cardId}`);
}

function winCombat(state) {
  const attack = [...state.hand, ...state.drawPile, ...state.discardPile].find((entry) => {
    const card = core.effectiveCard(entry);
    return card.damage || card.damageAll;
  });
  if (!attack) throw new Error("Missing attack card for combat win helper.");
  for (const pile of ["hand", "drawPile", "discardPile"]) {
    state[pile] = state[pile].filter((entry) => entry.uid !== attack.uid);
  }
  state.hand.push(attack);
  state.energy = 99;
  state.activeEnemies.forEach((enemy, index) => { enemy.hp = index === 0 ? 1 : 0; });
  return core.playCard(state, attack.uid, state.activeEnemies[0].uid);
}

function addCharacter(state, id, active = true) {
  const base = structuredClone(core.charactersById[id]);
  state.party.push({ ...base, hp: base.maxHp, block: 0, active });
}

function makeActiveEnemy(enemyId, overrides = {}) {
  const base = structuredClone(core.enemiesById[enemyId]);
  return {
    ...base,
    uid: `test-${enemyId}`,
    enemyId,
    hp: base.maxHp,
    maxHp: base.maxHp,
    block: 0,
    intentIndex: 0,
    burn: 0,
    poison: 0,
    stun: 0,
    weak: 0,
    phaseTwoTriggered: false,
    ...overrides
  };
}

function finishScenario(state) {
  let next = structuredClone(state);
  for (let step = 0; step < 80 && next.screen !== "hub"; step += 1) {
    if (next.screen === "recruit") next = core.chooseRecruit(next, next.pending.candidates[0]);
    else if (next.screen === "scenario-intro") next = core.continueScenarioIntro(next);
    else if (next.screen === "map") {
      const available = next.run.map.layers.flat().find((node) => core.isNodeAvailable(next, node));
      if (!available) throw new Error("No available map node.");
      next = core.chooseMapNode(next, available.id);
    } else if (next.screen === "combat") next = winCombat(next);
    else if (next.screen === "reward") next = core.claimCombatReward(next, "skip");
    else if (next.screen === "boss-reward") next = core.claimBossReward(next, next.rewardChoices[0].id);
    else if (next.screen === "treasure") next = core.claimTreasure(next, next.pending.choices[0]?.id || "salvage");
    else if (next.screen === "event") next = core.resolveEvent(next, "temporary-power");
    else if (next.screen === "camp") next = core.campAction(next, "heal");
    else throw new Error(`Unhandled scenario screen: ${next.screen}`);
  }
  return next;
}

// New campaign starts with Zheng Zha and the tutorial-only mentor.
let state = core.createInitialState();
const requiredAudioEvents = [
  "card.draw",
  "card.reward",
  "card.play.attack",
  "card.play.guard",
  "card.play.support",
  "card.play.tactic",
  "combat.hit.light",
  "combat.hit.heavy",
  "combat.hit.aoe",
  "combat.enemy.break",
  "combat.victory",
  "combat.defeat",
  "music.hub",
  "music.map",
  "music.combat"
];
const availableAudioEvents = { ...audioManifest.events, ...audioManifest.music };
assert(requiredAudioEvents.every((eventName) => availableAudioEvents[eventName]?.src), "Audio manifest should define every required SFX and BGM event.");
requiredAudioEvents.forEach((eventName) => assertAudioAsset(availableAudioEvents[eventName].src.split("/").pop()));
assert(state.version === 3 && state.screen === "story", "New saves must start in the tutorial story.");
assert(state.party.map((member) => member.id).join(",") === "zheng-zha,zhang-jie", "Tutorial party must be Zheng Zha and Zhang Jie.");
assert(core.calculateEnergy(state) === 4, "Zhang Jie should contribute three energy.");
assert(core.cardsById["mentor-demo"].cost === 0 && core.cardsById["mentor-demo"].damage === 24, "Mentor signature must be exceptionally strong.");
assert(data.characters.length === 74, "The roster should include the existing DMC5 cast, fourteen legendary final-battle characters, the Gintama group, the Avengers movie group, and the Justice Dawn movie group.");
const signatureIds = data.characters.map((character) => character.signatureCardId);
assert(new Set(signatureIds).size === data.characters.length, "Every character must own one unique signature card.");
assert(signatureIds.every((cardId) => core.cardsById[cardId]?.category === "signature"), "Every character signature must resolve to a signature card.");
assert(data.characters.every((character) => existsSync(new URL(`../src/assets/generated/character-${character.id}.png`, import.meta.url))), "Every character must have portrait art.");
assert(signatureIds.every((cardId) => existsSync(new URL(`../src/assets/generated/skill-${cardId}.png`, import.meta.url))), "Every signature card must have skill art.");
assert(data.characters.filter((character) => character.factionId && character.factionId !== "main").length === 54, "Fifty-four characters should carry rival or crossover faction identities.");
assert(["shiva-gangtian", "lamia", "arot", "richard", "elena", "kevin", "amon", "naya", "victor", "sarah"].every((id) => data.characters.some((character) => character.id === id)), "The ten new rival and other-team characters should be registered.");
assert(["tanjiro-kamado", "naruto-uzumaki", "luffy-nika", "son-goku", "xiao-yan"].every((id) => data.characters.some((character) => character.id === id)), "The five legendary anime and novel protagonists should be registered.");
assert(["ichigo-kurosaki", "edward-elric", "eren-yeager", "gon-freecss", "kirito-kazuto"].every((id) => data.characters.some((character) => character.id === id)), "The second wave of five legendary anime protagonists should be registered.");
assert(["mikasa-ackerman", "armin-arlert", "levi-ackerman", "giyu-tomioka"].every((id) => data.characters.some((character) => character.id === id)), "The original final-battle cast additions should be registered.");
assert(["gintoki-sakata", "shinpachi-shimura", "kagura-yato", "tsukuyo-hyakka", "toshirou-hijikata", "sougo-okita", "kotaro-katsura", "shinsuke-takasugi"].every((id) => data.characters.some((character) => character.id === id)), "The Gintama character group should be registered.");
assert(["tony-stark", "steve-rogers", "thor-odinson", "bruce-banner-hulk", "natasha-romanoff", "clint-barton"].every((id) => data.characters.some((character) => character.id === id)), "The Avengers movie character group should be registered.");
assert(["clark-kent-superman", "bruce-wayne-batman", "diana-prince-wonder-woman"].every((id) => data.characters.some((character) => character.id === id)), "The Justice Dawn movie character group should be registered.");
assert(data.legendaryRecruitmentPool.length === 14 && data.legendaryRecruitmentPool.every((id) => data.characters.some((character) => character.id === id)), "Legendary protagonists should be listed in a dedicated hard-to-obtain pool.");
assert(data.scenarios.every((scenario) => !scenario.recruitmentPool.some((id) => data.legendaryRecruitmentPool.includes(id))), "Legendary protagonists should not appear in normal scenario recruitment pools.");
assert(data.scenarios.filter((scenario) => scenario.id !== "tutorial").every((scenario) => scenario.opening?.dialogue?.length >= 3 && scenario.opening?.panels?.length >= 3), "Every formal scenario should have a story opening with dialogue and illustration beats.");
const animeFinalScenarioIds = ["rumbling-finale", "infinity-castle", "naruto-final-valley", "bleach-false-karakura", "gintama-yoshiwara", "gintama-final-war"];
assert(animeFinalScenarioIds.every((id) => data.scenarios.some((scenario) => scenario.id === id)), "The expanded anime final and climax scenarios should be registered.");
const movieScenarioIds = ["avengers-new-york", "batman-v-superman"];
assert(movieScenarioIds.every((id) => data.scenarios.some((scenario) => scenario.id === id)), "The movie crossover scenarios should be registered.");
const newScenarioIds = ["final-destination", "jinyong-heroic-peak"];
assert(newScenarioIds.every((id) => data.scenarios.some((scenario) => scenario.id === id)), "The two newest playable scenarios should be registered.");
assert(core.enemiesById["colossal-titan"].maxHp >= 400, "The Colossal Titan should be a notably high-HP enemy.");
assert(core.enemiesById["muzan-kibutsuji"].regen > 0 && core.enemiesById["muzan-kibutsuji"].phaseTwo?.maxHp > 0, "Muzan should regenerate and carry a second phase.");
assert(core.enemiesById["final-valley-sasuke"].phaseTwo?.maxHp > 0, "Final Valley Sasuke should carry a second phase.");
assert(core.enemiesById["transcendent-aizen"].regen > 0 && core.enemiesById["transcendent-aizen"].phaseTwo?.maxHp > 0, "Transcendent Aizen should regenerate and carry a second phase.");
assert(core.enemiesById["hosen-night-king"].regen > 0 && core.enemiesById["hosen-night-king"].phaseTwo?.maxHp > 0, "Night King Hosen should regenerate and carry a second phase.");
assert(core.enemiesById["utsuro-final"].regen > 0 && core.enemiesById["utsuro-final"].phaseTwo?.maxHp > 0, "Final Utsuro should regenerate and carry a second phase.");
assert(core.enemiesById["tesseract-portal-core"].regen > 0 && core.enemiesById["tesseract-portal-core"].phaseTwo?.maxHp > 0, "The Tesseract portal core should regenerate and carry a second phase.");
assert(core.enemiesById["doomsday-abomination"].regen > 0 && core.enemiesById["doomsday-abomination"].phaseTwo?.maxHp > 0, "Doomsday should regenerate and carry a second phase.");
const animeFinalScenarioAssetNames = animeFinalScenarioIds.map((id) => `scenario-${id}.png`);
assert(animeFinalScenarioAssetNames.every((fileName) => existsSync(assetUrl(fileName))), "Anime climax scenarios should have dedicated hero art.");
assertUniqueAssets(animeFinalScenarioAssetNames, "Anime climax hero art should be unique.");
const movieScenarioAssetNames = movieScenarioIds.map((id) => `scenario-${id}.png`);
assert(movieScenarioAssetNames.every((fileName) => existsSync(assetUrl(fileName))), "Movie crossover scenarios should have dedicated hero art.");
assertUniqueAssets(movieScenarioAssetNames, "Movie crossover hero art should be unique.");
const finalDestinationAssetNames = ["scenario-final-destination.png", "enemy-fd-premonition-shard.png", "enemy-fd-chain-accident.png", "enemy-fd-design-core.png", "enemy-fd-death-shadow.png"];
assert(finalDestinationAssetNames.every((fileName) => existsSync(assetUrl(fileName))), "Final Destination should reuse the prepared dedicated scenario and enemy art.");
const jinyongAssetNames = [
  "scenario-jinyong-heroic-peak.png",
  "enemy-jy-mongol-vanguard.png",
  "enemy-jy-poison-cultist.png",
  "enemy-jy-beggar-staff-line.png",
  "enemy-jy-tomb-sword-shadow.png",
  "enemy-jy-five-absolute-avatar.png",
  "enemy-jy-mount-hua-master.png"
];
assert(jinyongAssetNames.every((fileName) => existsSync(assetUrl(fileName))), "Jinyong wuxia scenario should have dedicated IMAGE2 scenario and enemy art.");
assertUniqueAssets(jinyongAssetNames, "Jinyong wuxia IMAGE2 assets should be unique.");
const finalBattleEnemyAssetNames = [
  "rumbling-titan-line", "colossal-titan", "war-hammer-titan", "founding-eren",
  "infinity-castle-demon", "biwa-castle-demon", "upper-moon-demon", "kokushibo-moon-breath", "muzan-kibutsuji",
  "ten-tails-remnant", "final-valley-sasuke", "hollow-echo-swarm", "transcendent-aizen",
  "yoshiwara-ronin", "hyakka-turncoat", "yato-raider", "abuto-yato", "kamui-yato", "hosen-night-king",
  "naraku-assassin", "liberation-army", "altana-core-guard", "utsuro-shadow", "utsuro-final",
  "chitauri-scout", "chitauri-gunner", "chitauri-captain", "chitauri-leviathan", "loki-scepter", "tesseract-portal-core",
  "lexcorp-mercenary", "kryptonite-militia", "armored-batman-duel", "lex-luthor-genesis", "doomsday-abomination"
].map((id) => `enemy-${id}.png`);
assert(finalBattleEnemyAssetNames.every((fileName) => existsSync(assetUrl(fileName))), "Post-white-light final battles should have dedicated IMAGE2 enemy art.");
assertUniqueAssets(finalBattleEnemyAssetNames, "Post-white-light final battle IMAGE2 enemy art should not reuse placeholders.");
const rumblingOpeningText = JSON.stringify(data.scenarios.find((scenario) => scenario.id === "rumbling-finale").opening);
const infinityOpeningText = JSON.stringify(data.scenarios.find((scenario) => scenario.id === "infinity-castle").opening);
const narutoOpeningText = JSON.stringify(data.scenarios.find((scenario) => scenario.id === "naruto-final-valley").opening);
const bleachOpeningText = JSON.stringify(data.scenarios.find((scenario) => scenario.id === "bleach-false-karakura").opening);
const gintamaYoshiwaraOpeningText = JSON.stringify(data.scenarios.find((scenario) => scenario.id === "gintama-yoshiwara").opening);
const gintamaFinalOpeningText = JSON.stringify(data.scenarios.find((scenario) => scenario.id === "gintama-final-war").opening);
const avengersOpeningText = JSON.stringify(data.scenarios.find((scenario) => scenario.id === "avengers-new-york").opening);
const bvsOpeningText = JSON.stringify(data.scenarios.find((scenario) => scenario.id === "batman-v-superman").opening);
const finalDestinationOpeningText = JSON.stringify(data.scenarios.find((scenario) => scenario.id === "final-destination").opening);
const jinyongOpeningText = JSON.stringify(data.scenarios.find((scenario) => scenario.id === "jinyong-heroic-peak").opening);
assert(["米卡莎", "阿爾敏", "兵長", "艾連"].every((name) => rumblingOpeningText.includes(name)), "The Rumbling finale opening should use original final-battle cast beats.");
assert(["炭治郎", "富岡義勇", "黑死牟", "鬼舞辻無慘"].every((name) => infinityOpeningText.includes(name)), "The Infinity Castle opening should use original final-battle cast beats.");
assert(["鳴人", "佐助", "卡卡西", "終末之谷"].every((name) => narutoOpeningText.includes(name)), "The Final Valley opening should use original final-battle cast beats.");
assert(["黑崎一護", "藍染", "浦原喜助", "最後的月牙"].every((name) => bleachOpeningText.includes(name)), "The Fake Karakura opening should use original final-battle cast beats.");
assert(["坂田銀時", "神樂", "月詠", "鳳仙"].every((name) => gintamaYoshiwaraOpeningText.includes(name)), "The Yoshiwara opening should use Gintama climax cast beats.");
assert(["高杉晉助", "桂小太郎", "虛", "阿爾塔納"].every((name) => gintamaFinalOpeningText.includes(name)), "The Gintama final-war opening should use final-arc cast beats.");
assert(["托尼·史塔克", "史蒂夫·羅傑斯", "索爾", "宇宙魔方"].every((name) => avengersOpeningText.includes(name)), "The Avengers opening should use movie-climax cast and Tesseract beats.");
assert(["布魯斯·韋恩", "克拉克·肯特", "黛安娜·普林斯", "氪石", "毀滅日"].every((name) => bvsOpeningText.includes(name)), "The Batman v Superman opening should use movie-climax cast, Kryptonite, and Doomsday beats.");
assert(["詹嵐", "蕭宏律", "楚軒", "死亡設計"].every((name) => finalDestinationOpeningText.includes(name)), "The Final Destination opening should frame death as an active in-world design.");
assert(["襄陽", "華山", "羅應龍", "九陰"].every((name) => jinyongOpeningText.includes(name)), "The Jinyong opening should use wuxia siege, martial manual, and Mount Hua beats.");
assert(data.economy.legendaryRecruitmentMinInfiniteTier === 3, "Legendary protagonists should require deep infinite-mode progress before appearing.");
assert(core.cardsById["kamehameha-limit"].damage === 48 && core.cardsById["buddha-lotus-flame"].damageAll === 32 && core.cardsById["jajanken-covenant"].damage === 46, "Legendary protagonist signatures should be especially strong.");
assert(data.equipment.length === 48, "The equipment pool should include the existing DMC5 gear, final-battle weapon expansion, Gintama tools, Avengers equipment, and Justice Dawn equipment.");
const allCardAssetNames = data.cards.map((card) => `skill-${card.id}.png`);
const allEquipmentAssetNames = data.equipment.map((item) => `equipment-${item.id}.png`);
assert(allCardAssetNames.every((fileName) => existsSync(assetUrl(fileName))), "Every card should have dedicated skill art.");
assert(allEquipmentAssetNames.every((fileName) => existsSync(assetUrl(fileName))), "Every equipment item should have dedicated equipment art.");
assertUniqueAssets([...allCardAssetNames, ...allEquipmentAssetNames], "Every card and equipment art file should be unique.");
assertUniqueAssets(readdirSync(assetUrl(".")).filter((fileName) => /^(skill|equipment)-.+\.png$/.test(fileName)), "No generated skill or equipment image file should be a duplicate.");
assert(data.bloodlines.length === data.characters.length, "Every character should have an individual bloodline definition.");
assert(data.bonds.length === 48, "The roster should include forty-eight deployable bond combinations.");
const characterIds = new Set(data.characters.map((character) => character.id));
assert(data.bonds.every((bond) => (bond.members || []).every((id) => characterIds.has(id)) && (bond.anyMembers || []).every((id) => characterIds.has(id))), "Every bond must reference valid characters.");
assert(["zhongzhou-frontline", "field-medic-link", "demon-assault-cell", "legendary-sun-flame", "scout-final-flight", "water-hashira-line", "yorozuya-three", "joy4-last-stand", "avengers-assemble-core", "trinity-dawn"].every((id) => data.bonds.some((bond) => bond.id === id)), "The expanded bond set should include Zhongzhou, support, demon, legendary, scout, Water Hashira, Gintama, Avengers, and Justice Dawn combinations.");
assert(data.economy.skipCardReward === 150 && data.economy.deckCardRemovalCost === 300 && data.economy.curseRemovalCost === 400 && data.economy.minimumDeckSize === 6, "Economy constants should use the scaled original-novel-inspired point values.");
assert(core.encountersById["alien-queen"].rewardPoints === 2500, "Boss rewards should pay thousands of reward points.");
assert(core.shopById["shop-desert-eagle"].rewardPointCost === 1200 && core.shopById["shop-desert-eagle"].sideStoryCost === 1, "Infinite-ammo firearm purchases should require both points and side stories.");
assert(data.permanentUpgrades.every((upgrade) => upgrade.rewardPointCost > 0 && upgrade.sideStoryCost > 0), "Permanent upgrades should cost reward points and side stories.");
const crossoverAttackIds = [
  "water-breathing-surface-slash", "water-breathing-waterfall", "flame-breathing-unknown-fire", "thunder-breathing-thunderclap", "hinokami-clear-blue-sky", "red-blade-coordination",
  "odm-dual-blade-slash", "thunder-spear-salvo", "colossal-transformation-blast",
  "ff7-braver", "ff7-cross-slash", "ff7-blade-beam", "ff7-omnislash",
  "yanyun-nameless-spear", "yanyun-jiefu-blade", "yanyun-drunken-spring", "yanyun-millet-cloud",
  "jy-dragon-palms", "jy-dugu-nine-swords", "jy-six-meridian-sword", "jy-ecstasy-palms", "jy-dog-beating-staff", "jy-nine-yin-claw", "jy-yiyang-finger", "jy-taiji-sword",
  "gintama-wooden-sword-swing", "gintama-yato-umbrella-shot", "gintama-hyakka-kunai-net", "gintama-shinsengumi-breach", "gintama-altana-final-cut",
  "avengers-repulsor-burst", "avengers-shield-throw", "avengers-mjolnir-lightning", "avengers-hulk-ground-slam", "avengers-hawkeye-trick-arrow",
  "bvs-batarang-flurry", "bvs-heat-vision-sweep", "bvs-amazon-sword-break", "bvs-batmobile-ram"
];
assert(crossoverAttackIds.length === 39, "The crossover common pool should add thirty-nine attack cards.");
assert(crossoverAttackIds.every((id) => core.cardsById[id]?.category === "general" && core.cardsById[id].type === "attack"), "Every crossover card should be a purchasable general attack card.");
assert(crossoverAttackIds.every((id) => data.shop.some((entry) => entry.kind === "card" && entry.itemId === id)), "Every crossover attack card should have a shop entry.");
assert(crossoverAttackIds.every((id) => existsSync(new URL(`../src/assets/generated/skill-${id}.png`, import.meta.url))), "Every crossover attack card should have shop art.");
assert(["water-breathing-dead-calm", "survey-smoke-signal"].every((id) => core.cardsById[id]?.category === "general" && data.shop.some((entry) => entry.kind === "card" && entry.itemId === id)), "Final-battle support and guard cards should be purchasable.");
assert(["gintama-odd-jobs-retort", "gintama-joy4-rally"].every((id) => core.cardsById[id]?.category === "general" && data.shop.some((entry) => entry.kind === "card" && entry.itemId === id)), "Gintama support and tactic cards should be purchasable.");
assert(["avengers-widow-bite", "avengers-assemble"].every((id) => core.cardsById[id]?.category === "general" && data.shop.some((entry) => entry.kind === "card" && entry.itemId === id)), "Avengers tactic and support cards should be purchasable.");
assert(["bvs-kryptonite-gas-grenade", "bvs-justice-dawn-stand"].every((id) => core.cardsById[id]?.category === "general" && data.shop.some((entry) => entry.kind === "card" && entry.itemId === id)), "Justice Dawn tactic and support cards should be purchasable.");
assert(["demon-slayer", "attack-on-titan", "ff7", "yanyun", "jinyong", "gintama", "avengers", "dc-movie"].every((sourceId) => data.cardSources.some((source) => source.id === sourceId)), "Card shop sources should include the requested anime, game, wuxia, and movie categories.");
const artifactEquipmentIds = [
  "avalon-sheath", "ea-sword-rupture", "gates-of-babylon-key", "zangetsu-blade", "enma-blade",
  "odm-gear", "thunder-spear-pack", "survey-blades", "mikasa-red-scarf", "armin-seashell", "tanjiro-nichirin-blade", "water-hashira-nichirin",
  "pan-gu-axe", "xuan-yuan-sword", "donghuang-bell", "haotian-tower", "zhuxian-sword",
  "heaven-sword", "dragon-saber", "soft-hedgehog-armor", "black-iron-heavy-sword"
];
assert(artifactEquipmentIds.length === 21, "The artifact equipment expansion should add twenty-one items.");
assert(artifactEquipmentIds.every((id) => core.equipmentById[id]?.sourceId), "Every artifact equipment item should have a category source.");
assert(artifactEquipmentIds.every((id) => data.shop.some((entry) => entry.kind === "equipment" && entry.itemId === id)), "Every artifact equipment item should have a shop entry.");
assert(artifactEquipmentIds.every((id) => existsSync(new URL(`../src/assets/generated/equipment-${id}.png`, import.meta.url))), "Every artifact equipment item should have shop art.");
const gintamaEquipmentIds = ["toya-lake-bokuto", "yato-umbrella", "hyakka-kunai-belt", "shinsengumi-uniform", "shoyo-wooden-tag"];
assert(gintamaEquipmentIds.every((id) => core.equipmentById[id]?.sourceId === "gintama-equipment"), "Every Gintama equipment item should have the Gintama source.");
assert(gintamaEquipmentIds.every((id) => data.shop.some((entry) => entry.kind === "equipment" && entry.itemId === id)), "Every Gintama equipment item should have a shop entry.");
const avengersEquipmentIds = ["arc-reactor-core", "vibranium-shield", "mjolnir-fragment", "hawkeye-quiver", "widow-bite-gauntlets"];
assert(avengersEquipmentIds.every((id) => core.equipmentById[id]?.sourceId === "avengers-equipment"), "Every Avengers equipment item should have the Avengers equipment source.");
assert(avengersEquipmentIds.every((id) => data.shop.some((entry) => entry.kind === "equipment" && entry.itemId === id)), "Every Avengers equipment item should have a shop entry.");
const dcEquipmentIds = ["kryptonite-spear", "armored-batsuit", "amazonian-shield", "batwing-remote"];
assert(dcEquipmentIds.every((id) => core.equipmentById[id]?.sourceId === "dc-equipment"), "Every Justice Dawn equipment item should have the Justice Dawn equipment source.");
assert(dcEquipmentIds.every((id) => data.shop.some((entry) => entry.kind === "equipment" && entry.itemId === id)), "Every Justice Dawn equipment item should have a shop entry.");
assert(["anime-artifacts", "final-battle-weapons", "novel-artifacts", "wuxia-artifacts", "gintama-equipment", "avengers-equipment", "dc-equipment"].every((sourceId) => data.equipmentSources.some((source) => source.id === sourceId)), "Equipment shop sources should include anime, final-battle, novel, wuxia, Gintama, Avengers, and Justice Dawn artifact categories.");

// Bloodline upgrades are purchased per character and only enhance that owner's signature.
let bloodlineState = core.createInitialState();
bloodlineState.screen = "hub";
bloodlineState.sideStories = 3;
bloodlineState.rewardPoints = 3000;
bloodlineState = core.upgradeBloodline(bloodlineState, "zheng-zha");
assert(bloodlineState.permanentUpgrades.bloodlines.includes("zheng-zha") && bloodlineState.sideStories === 1 && bloodlineState.rewardPoints === 200, "Zheng Zha's bloodline should cost side stories and reward points.");
bloodlineState.screen = "story";
bloodlineState.pending = { kind: "tutorial-intro" };
bloodlineState = core.chooseStoryOption(bloodlineState, "start");
const bloodAwakening = findCombatCard(bloodlineState, "blood-awakening");
 bloodlineState.activeEnemies[0].hp = 100;
 bloodlineState.activeEnemies[0].maxHp = 100;
const bloodTargetHp = bloodlineState.activeEnemies[0].hp;
bloodlineState.energy = 99;
bloodlineState = core.playCard(bloodlineState, bloodAwakening.uid, bloodlineState.activeEnemies[0].uid);
assert(bloodlineState.activeEnemies[0].hp === bloodTargetHp - 46, "Zheng Zha's bloodline should critically double his signature attack.");

let statusState = core.createInitialState();
statusState.party = [];
addCharacter(statusState, "wang-xia");
statusState.permanentUpgrades.bloodlines.push("wang-xia");
statusState = core.chooseStoryOption(statusState, "start");
const demolition = findCombatCard(statusState, "demolition-charge");
statusState.energy = 99;
statusState = core.playCard(statusState, demolition.uid, statusState.activeEnemies[0].uid);
assert(statusState.activeEnemies.every((enemy) => enemy.burn === 7), "Wang Xia's bloodline should burn all living enemies.");
const burnedHp = statusState.activeEnemies.map((enemy) => enemy.hp);
statusState = core.endPlayerTurn(statusState);
assert(statusState.activeEnemies.every((enemy, index) => enemy.hp === burnedHp[index] - 7 && enemy.burn === 5), "Burn should deal damage before enemy actions and decay by two.");

// New equipment covers healing, evasion, energy, burning, and armor piercing.
let equipmentState = core.createInitialState();
equipmentState.party = [];
["cheng-xiao", "zero", "wang-xia"].forEach((id) => addCharacter(equipmentState, id));
equipmentState.party[0].hp = 20;
["medical-nanites", "phase-cloak", "tactical-battery"].forEach((equipmentId, index) => {
  const instanceId = `new-equipment-${index}`;
  equipmentState.equipmentInventory.push({ instanceId, equipmentId, upgraded: false, acquiredRunId: null });
  equipmentState.equipped[equipmentState.party[index].id] = instanceId;
});
equipmentState = core.chooseStoryOption(equipmentState, "start");
assert(equipmentState.maxEnergy === 4, "Tactical battery should add one opening energy.");
assert(equipmentState.party[0].hp === 26, "Cheng Xiao and medical nanites should both heal the lowest-health ally.");
assert(core.getAliveActiveParty(equipmentState).every((member) => member.evade === 1), "Phase cloak should grant one opening evade to the party.");

let piercingState = core.createInitialState();
piercingState.party = [];
addCharacter(piercingState, "zero");
piercingState.permanentUpgrades.bloodlines.push("zero");
piercingState = core.chooseStoryOption(piercingState, "start");
const sniper = findCombatCard(piercingState, "sniper-line");
piercingState.activeEnemies[0].hp = 100;
piercingState.activeEnemies[0].maxHp = 100;
piercingState.activeEnemies[0].block = 50;
piercingState.energy = 99;
piercingState = core.playCard(piercingState, sniper.uid, piercingState.activeEnemies[0].uid);
assert(piercingState.activeEnemies[0].hp === 64 && piercingState.activeEnemies[0].block === 50, "Zero's bloodline signature should pierce armor and deal its extra damage.");

let poisonState = core.createInitialState();
poisonState.party = [];
addCharacter(poisonState, "ming-yanwei");
poisonState.permanentUpgrades.bloodlines.push("ming-yanwei");
poisonState = core.chooseStoryOption(poisonState, "start");
const soulVolley = findCombatCard(poisonState, "soul-volley");
poisonState.energy = 99;
poisonState = core.playCard(poisonState, soulVolley.uid, poisonState.activeEnemies[0].uid);
assert(poisonState.activeEnemies.every((enemy) => enemy.poison === 5), "Ming Yanwei's bloodline should poison all enemies.");

let demonRegenState = core.createInitialState();
demonRegenState.screen = "combat";
demonRegenState.party = [];
["zheng-zha", "cheng-xiao", "zero"].forEach((id) => addCharacter(demonRegenState, id));
demonRegenState.activeEnemies = [makeActiveEnemy("infinity-castle-demon", { hp: 60, intentIndex: 1 })];
demonRegenState.activeEncounterId = "infinity-demon-halls";
demonRegenState.hand = [];
demonRegenState.drawPile = [];
demonRegenState.discardPile = [];
demonRegenState.combatFlags = { lastChanceUsed: [], bondTriggers: [] };
demonRegenState = core.endPlayerTurn(demonRegenState);
assert(demonRegenState.activeEnemies[0].hp === 86 && demonRegenState.activeEnemies[0].block === 8, "Demon enemies should regenerate passively and through self-repair intents.");

let muzanState = core.createInitialState();
muzanState.screen = "combat";
muzanState.party = [];
["zheng-zha", "cheng-xiao", "zero"].forEach((id) => addCharacter(muzanState, id));
muzanState.activeEnemies = [makeActiveEnemy("muzan-kibutsuji", { hp: 1 })];
muzanState.activeEncounterId = "infinity-muzan";
muzanState.selectedTargetId = muzanState.activeEnemies[0].uid;
muzanState.hand = [{ uid: "phase-knife", cardId: "combat-knife", ownerId: null, upgraded: false }];
muzanState.drawPile = [];
muzanState.discardPile = [];
muzanState.energy = 99;
muzanState.turnStats = core.createInitialState().turnStats;
muzanState.combatFlags = { lastChanceUsed: [], bondTriggers: [] };
muzanState = core.playCard(muzanState, "phase-knife", muzanState.activeEnemies[0].uid);
assert(muzanState.screen === "combat" && muzanState.activeEnemies[0].phaseTwoTriggered && muzanState.activeEnemies[0].name.includes("第二階段") && muzanState.activeEnemies[0].hp === 500, "Muzan should transform into a second phase instead of ending combat.");

let stunState = core.createInitialState();
stunState.party = [];
addCharacter(stunState, "liu-yu");
stunState.permanentUpgrades.bloodlines.push("liu-yu");
stunState = core.chooseStoryOption(stunState, "start");
const clearMind = findCombatCard(stunState, "clear-mind");
stunState.energy = 99;
const stunnedEnemy = stunState.activeEnemies[0];
stunState = core.playCard(stunState, clearMind.uid, stunnedEnemy.uid);
assert(stunState.activeEnemies[0].stun === 1, "Liu Yu's bloodline should block one enemy action.");
stunState = core.endPlayerTurn(stunState);
assert(stunState.log.some((line) => line.includes("行動被封鎖")), "A stunned enemy should skip its action.");

let ammunitionState = core.createInitialState();
ammunitionState.party = [];
addCharacter(ammunitionState, "cheng-xiao");
addCharacter(ammunitionState, "liu-yu");
["incendiary-magazine", "armor-piercing-core"].forEach((equipmentId, index) => {
  const instanceId = `ammunition-${index}`;
  ammunitionState.equipmentInventory.push({ instanceId, equipmentId, upgraded: false, acquiredRunId: null });
  ammunitionState.equipped[ammunitionState.party[index].id] = instanceId;
});
ammunitionState = core.chooseStoryOption(ammunitionState, "start");
const ammunitionKnife = findCombatCard(ammunitionState, "combat-knife");
ammunitionState.activeEnemies[0].hp = 100;
ammunitionState.activeEnemies[0].maxHp = 100;
ammunitionState.activeEnemies[0].block = 50;
ammunitionState.energy = 99;
ammunitionState = core.playCard(ammunitionState, ammunitionKnife.uid, ammunitionState.activeEnemies[0].uid);
assert(ammunitionState.activeEnemies[0].hp === 89 && ammunitionState.activeEnemies[0].block === 50 && ammunitionState.activeEnemies[0].burn === 4, "New ammunition equipment should pierce armor and apply burn.");

// New support passives change turn economy and recovery.
let passiveState = core.createInitialState();
passiveState.party = [];
addCharacter(passiveState, "cheng-xiao");
addCharacter(passiveState, "luo-gandao");
addCharacter(passiveState, "imhotep");
passiveState.party.find((member) => member.id === "cheng-xiao").hp = 20;
passiveState.party.find((member) => member.id === "luo-gandao").hp = 30;
passiveState.party.find((member) => member.id === "imhotep").hp = 60;
passiveState = core.chooseStoryOption(passiveState, "start");
assert(passiveState.maxEnergy === 4, "Luo Gandao should contribute one extra energy below half health.");
assert(passiveState.party.find((member) => member.id === "cheng-xiao").hp === 23, "Cheng Xiao should heal the lowest-health ally at turn start.");
assert(passiveState.party.find((member) => member.id === "imhotep").hp === 63, "Imhotep should regenerate at turn start.");
assert(core.getAliveActiveParty(passiveState).every((member) => member.block === 1), "Imhotep should grant one block to the active party.");

// New chain passives trigger on their intended card numbers.
let chainState = core.createInitialState();
chainState.party = [];
["zhang-heng", "wang-xia", "ming-yanwei", "liu-yu", "lin-juntian"].forEach((id) => addCharacter(chainState, id));
chainState = core.chooseStoryOption(chainState, "start");
chainState.energy = 99;
chainState.hand = [
  { uid: "chain-1", cardId: "combat-knife", ownerId: null, upgraded: false },
  { uid: "chain-2", cardId: "field-medicine", ownerId: null, upgraded: false },
  { uid: "chain-3", cardId: "guard-stance", ownerId: null, upgraded: false },
  { uid: "chain-4", cardId: "guard-stance", ownerId: null, upgraded: false }
];
chainState.drawPile = [{ uid: "chain-draw", cardId: "combat-knife", ownerId: null, upgraded: false }];
chainState.discardPile = [];
const chainTarget = chainState.activeEnemies[0];
const chainOther = chainState.activeEnemies[1];
const chainTargetHp = chainTarget.hp;
const chainOtherHp = chainOther.hp;
chainState = core.playCard(chainState, "chain-1", chainTarget.uid);
assert(chainState.activeEnemies[0].hp === chainTargetHp - 12, "Zhang Heng should add four damage to the first attack.");
assert(chainState.activeEnemies[1].hp === chainOtherHp - 3, "Wang Xia should splash three damage to other enemies.");
chainState = core.playCard(chainState, "chain-2", chainTarget.uid);
assert(chainState.hand.some((entry) => entry.uid === "chain-draw"), "Liu Yu should draw after the first support card.");
chainState = core.playCard(chainState, "chain-3", chainTarget.uid);
assert(chainState.activeEnemies.every((enemy) => enemy.hp <= (enemy.uid === chainTarget.uid ? chainTargetHp - 16 : chainOtherHp - 7)), "Ming Yanwei should volley on the third card.");
chainState = core.playCard(chainState, "chain-4", chainTarget.uid);
assert(chainState.energy === 96, "Lin Juntian should refund one energy on the fourth card.");

// Rival characters bring distinct mechanics rather than reskinned signatures.
let rivalState = core.createInitialState();
rivalState.party = [];
addCharacter(rivalState, "clone-chu-xuan");
addCharacter(rivalState, "clone-luo-gandao");
rivalState = core.chooseStoryOption(rivalState, "start");
assert(rivalState.maxEnergy === 4, "Clone Luo Gandao should grant two opening overdrive energy.");
assert(rivalState.hand.length === 7, "Clone Chu Xuan should draw two additional cards on the opening turn.");
assert(rivalState.party.find((member) => member.id === "clone-luo-gandao").stress === 32, "Opening overdrive should add eight stress to its pilot.");

let blackFlameState = core.createInitialState();
blackFlameState.party = [];
addCharacter(blackFlameState, "clone-zheng-zha");
blackFlameState.party[0].stress = 80;
blackFlameState = core.chooseStoryOption(blackFlameState, "start");
const blackFlame = findCombatCard(blackFlameState, "black-flame-annihilation");
blackFlameState.activeEnemies[0].hp = 200;
blackFlameState.activeEnemies[0].maxHp = 200;
blackFlameState.energy = 99;
blackFlameState = core.playCard(blackFlameState, blackFlame.uid, blackFlameState.activeEnemies[0].uid);
assert(blackFlameState.activeEnemies[0].hp === 147 && blackFlameState.activeEnemies[0].burn === 6, "Black flame should scale with stress and apply its native burn.");

let rivalPassiveState = core.createInitialState();
rivalPassiveState.party = [];
["zhao-zhuikong", "tom", "luo-yinglong", "song-tian", "gangnir"].forEach((id) => addCharacter(rivalPassiveState, id));
rivalPassiveState = core.chooseStoryOption(rivalPassiveState, "start");
rivalPassiveState.energy = 99;
rivalPassiveState.hand = [
  { uid: "rival-pierce", cardId: "combat-knife", ownerId: null, upgraded: false },
  { uid: "rival-status", cardId: "combat-knife", ownerId: null, upgraded: false },
  { uid: "rival-guard", cardId: "guard-stance", ownerId: null, upgraded: false }
];
rivalPassiveState.activeEnemies[0].hp = 100;
rivalPassiveState.activeEnemies[0].maxHp = 100;
rivalPassiveState.activeEnemies[0].block = 50;
rivalPassiveState = core.playCard(rivalPassiveState, "rival-pierce", rivalPassiveState.activeEnemies[0].uid);
assert(rivalPassiveState.activeEnemies[0].hp === 77 && rivalPassiveState.activeEnemies[0].block === 50 && rivalPassiveState.activeEnemies[0].burn === 4 && rivalPassiveState.activeEnemies[0].weak === 2, "Rival first-attack passives and ice-fire bond should pierce armor, break armor, apply flame, and weaken enemies.");
rivalPassiveState.activeEnemies[0].poison = 1;
const statusTargetHp = rivalPassiveState.activeEnemies[0].hp;
rivalPassiveState = core.playCard(rivalPassiveState, "rival-status", rivalPassiveState.activeEnemies[0].uid);
assert(rivalPassiveState.activeEnemies[0].hp === statusTargetHp - 23, "Tom, Song Tian, and ice-fire bond should reward attacking a marked armored target.");
rivalPassiveState = core.playCard(rivalPassiveState, "rival-guard", rivalPassiveState.activeEnemies[0].uid);
assert(rivalPassiveState.activeEnemies.every((enemy) => enemy.weak === 5), "Gangnir and ice-fire bond should stack enemy weakness.");

let adamState = core.createInitialState();
adamState.party = [];
addCharacter(adamState, "adam");
adamState.party[0].hp = 40;
adamState = core.chooseStoryOption(adamState, "start");
adamState.energy = 99;
adamState.hand = Array.from({ length: 5 }, (_, index) => ({ uid: `adam-${index}`, cardId: "guard-stance", ownerId: null, upgraded: false }));
for (let index = 0; index < 5; index += 1) adamState = core.playCard(adamState, `adam-${index}`, adamState.activeEnemies[0].uid);
assert(adamState.party[0].hp === 43 && adamState.party[0].block === 35, "Adam's fifth-card aegis should heal and shield the party.");

// Deployed bonds create special win conditions, equipment scaling, and tactical openings.
let bondState = core.createInitialState();
bondState.party = [];
["chu-xuan", "xiao-honglu", "zheng-zha"].forEach((id) => addCharacter(bondState, id));
bondState = core.chooseStoryOption(bondState, "start");
const activeBondIds = core.getActiveBonds(bondState).map((bond) => bond.id);
assert(activeBondIds.includes("wise-men-layout") && activeBondIds.includes("force-and-guile"), "Chu Xuan should activate both wise-men and Zhongzhou force-guile bonds.");
bondState.energy = 99;
bondState.activeEnemies.forEach((enemy) => {
  enemy.hp = 999;
  enemy.maxHp = 999;
});
bondState.hand = [
  ...Array.from({ length: 9 }, (_, index) => ({ uid: `layout-${index}`, cardId: "guard-stance", ownerId: null, upgraded: false })),
  { uid: "layout-final", cardId: "strategist-calculation", ownerId: "chu-xuan", upgraded: false }
];
bondState.drawPile = [];
bondState.discardPile = [];
for (let index = 0; index < 9; index += 1) bondState = core.playCard(bondState, `layout-${index}`, bondState.activeEnemies[0].uid);
assert(bondState.screen === "combat" && bondState.turnStats.cardsPlayed === 9, "The wise-men bond should wait for exactly the tenth card.");
bondState = core.playCard(bondState, "layout-final", bondState.activeEnemies[0].uid);
assert(bondState.screen !== "combat" && bondState.log.some((line) => line.includes("智者們的佈局")), "The tenth Chu Xuan card should end combat through the wise-men layout.");

let firearmBondState = core.createInitialState();
firearmBondState.party = [];
["chu-xuan", "zero"].forEach((id) => addCharacter(firearmBondState, id));
firearmBondState.equipmentInventory.push({ instanceId: "bond-gauss", equipmentId: "gauss-pistol", upgraded: false, acquiredRunId: null });
firearmBondState.equipped.zero = "bond-gauss";
firearmBondState = core.chooseStoryOption(firearmBondState, "start");
firearmBondState.energy = 99;
firearmBondState.hand = [{ uid: "firearm-knife", cardId: "combat-knife", ownerId: null, upgraded: false }];
firearmBondState.activeEnemies[0].hp = 100;
firearmBondState.activeEnemies[0].maxHp = 100;
firearmBondState = core.playCard(firearmBondState, "firearm-knife", firearmBondState.activeEnemies[0].uid);
assert(firearmBondState.activeEnemies[0].hp === 81, "Chu Xuan's fire-control bond should boost firearm equipment by fifty percent.");

let tacticsBondState = core.createInitialState();
tacticsBondState.party = [];
["zheng-zha", "chu-xuan"].forEach((id) => addCharacter(tacticsBondState, id));
tacticsBondState = core.chooseStoryOption(tacticsBondState, "start");
tacticsBondState.energy = 0;
tacticsBondState.hand = [{ uid: "force-tactic", cardId: "team-tactics", ownerId: null, upgraded: false }];
assert(core.getCardCost(tacticsBondState, tacticsBondState.hand[0]) === 0, "Force and guile should discount the first tactic together with Chu Xuan.");
tacticsBondState = core.playCard(tacticsBondState, "force-tactic", tacticsBondState.activeEnemies[0].uid);
assert(tacticsBondState.energy === 1 && tacticsBondState.turnStats.firstBondTacticUsed, "Force and guile should refund energy on the first tactic.");

let expandedBondState = core.createInitialState();
expandedBondState.party = [];
["zheng-zha", "zero", "ba-wang"].forEach((id) => addCharacter(expandedBondState, id));
assert(core.getActiveBonds(expandedBondState).some((bond) => bond.id === "zhongzhou-frontline"), "The expanded Zhongzhou frontline bond should activate from its three members.");
expandedBondState = core.chooseStoryOption(expandedBondState, "start");
assert(expandedBondState.party.every((member) => member.block >= 5), "The Zhongzhou frontline bond should stack opening defense with Ba Wang's passive.");

let geniusBondState = core.createInitialState();
geniusBondState.party = [];
["chu-xuan", "adam"].forEach((id) => addCharacter(geniusBondState, id));
geniusBondState = core.chooseStoryOption(geniusBondState, "start");
geniusBondState.energy = 99;
geniusBondState.hand = [{ uid: "genius-tactic", cardId: "team-tactics", ownerId: null, upgraded: false }];
geniusBondState = core.playCard(geniusBondState, "genius-tactic", geniusBondState.activeEnemies[0].uid);
assert(geniusBondState.activeEnemies.every((enemy) => enemy.weak === 4) && geniusBondState.party.every((member) => member.stress >= core.charactersById[member.id].stress + 2), "Chu Xuan and Adam should trade tactical control for team stress.");

// Tutorial flow: three combats and two story choices.
state = core.chooseStoryOption(state, "start");
assert(state.screen === "combat" && state.activeEncounterId === "bio-lab", "Tutorial should begin at the laboratory.");
assert(core.getAliveActiveParty(state).every((member) => member.block === 8), "Zhang Jie should grant eight opening block.");
state = winCombat(state);
assert(state.screen === "story" && state.pending.kind === "tutorial-choice-1", "First tutorial combat should lead to a story choice.");
state = core.chooseStoryOption(state, "search");
assert(state.activeEncounterId === "bio-stairs" && state.deck.some((entry) => entry.cardId === "field-medicine"), "First tutorial choice should grant its reward.");
state = winCombat(state);
assert(state.pending.kind === "tutorial-choice-2", "Second tutorial combat should lead to a story choice.");
state = core.chooseStoryOption(state, "rest");
state = winCombat(state);
assert(state.screen === "hub" && state.campaign.tutorialComplete, "Tutorial boss should unlock the hub.");
assert(!state.party.some((member) => member.id === "zhang-jie"), "Zhang Jie must leave after the tutorial.");
assert(state.campaign.unlockedScenarios.includes("alien"), "Alien should unlock after the tutorial.");

// Alien opening recruitment picks one and gives one bonus recruit.
state = core.beginScenario(state, "alien");
assert(state.screen === "recruit" && state.pending.candidates.length === 3, "Alien should open with three recruitment candidates.");
const selectedRecruit = state.pending.candidates[0];
state = core.chooseRecruit(state, selectedRecruit);
assert(state.screen === "scenario-intro" && state.party.length === 3, "First Alien recruitment should add two permanent members and show the scenario opening.");
state = core.continueScenarioIntro(state);
assert(state.screen === "map", "Continuing the scenario opening should reveal the three-lane route map.");
assert(core.getActiveParty(state).length === 3, "The opening recruitment bonus should create a valid three-person formation.");

// The route map is deterministic, fogged, and has fixed gates.
assert(state.run.map.layers.length === 8 && state.run.map.layers.every((layer) => layer.length === 3), "Normal scenarios need an eight-layer, three-lane map.");
assert(state.run.map.layers[3].every((node) => node.type === "miniboss"), "Layer four must be the miniboss.");
assert(state.run.map.layers[4].every((node) => node.type === "camp"), "Layer five must be camp.");
assert(state.run.map.layers[7].every((node) => node.type === "boss"), "Layer eight must be the boss.");
const savedMap = JSON.stringify(state.run.map);
const normalized = core.normalizeState(JSON.parse(JSON.stringify(state)));
assert(JSON.stringify(normalized.run.map) === savedMap, "Reloading must preserve the generated map.");
let campaignRun = finishScenario(state);
assert(campaignRun.screen === "hub" && campaignRun.campaign.unlockedScenarios.includes("juon"), "Alien completion should return to hub and unlock Juon.");
campaignRun = core.beginScenario(campaignRun, "juon");
campaignRun = finishScenario(campaignRun);
assert(campaignRun.campaign.unlockedScenarios.includes("mummy-curse") && !campaignRun.campaign.infiniteUnlocked, "Juon completion should unlock The Mummy before infinite mode.");
campaignRun = core.beginScenario(campaignRun, "mummy-curse");
campaignRun = finishScenario(campaignRun);
assert(campaignRun.campaign.unlockedScenarios.includes("jurassic-island") && !campaignRun.campaign.infiniteUnlocked, "The Mummy completion should unlock Jurassic Park before infinite mode.");
campaignRun = core.beginScenario(campaignRun, "jurassic-island");
campaignRun = finishScenario(campaignRun);
assert(campaignRun.campaign.unlockedScenarios.includes("abyssal-ark") && !campaignRun.campaign.infiniteUnlocked, "Jurassic Park completion should unlock Abyssal Ark before infinite mode.");
campaignRun = core.beginScenario(campaignRun, "abyssal-ark");
campaignRun = finishScenario(campaignRun);
assert(campaignRun.campaign.unlockedScenarios.includes("evernight-castle"), "Abyssal Ark completion should unlock Evernight Castle.");
campaignRun = core.beginScenario(campaignRun, "evernight-castle");
campaignRun = finishScenario(campaignRun);
assert(campaignRun.campaign.unlockedScenarios.includes("demon-frontier") && !campaignRun.campaign.infiniteUnlocked, "Evernight Castle completion should unlock Demon Frontier before infinite mode.");
campaignRun = core.beginScenario(campaignRun, "demon-frontier");
campaignRun = finishScenario(campaignRun);
assert(campaignRun.campaign.unlockedScenarios.includes("main-god-trial") && !campaignRun.campaign.infiniteUnlocked, "Demon Frontier completion should unlock Main God Trial before infinite mode.");
campaignRun = core.beginScenario(campaignRun, "main-god-trial");
campaignRun = finishScenario(campaignRun);
assert(campaignRun.campaign.unlockedScenarios.includes("starship-troopers") && !campaignRun.campaign.infiniteUnlocked, "Main God Trial completion should unlock Starship Troopers before infinite mode.");
campaignRun = core.beginScenario(campaignRun, "starship-troopers");
campaignRun = finishScenario(campaignRun);
assert(campaignRun.campaign.unlockedScenarios.includes("avp-pyramid") && !campaignRun.campaign.infiniteUnlocked, "Starship Troopers completion should unlock AVP before infinite mode.");
campaignRun = core.beginScenario(campaignRun, "avp-pyramid");
campaignRun = finishScenario(campaignRun);
assert(campaignRun.campaign.unlockedScenarios.includes("nightmare-elm") && !campaignRun.campaign.infiniteUnlocked, "AVP completion should unlock Nightmare on Elm Street before infinite mode.");
campaignRun = core.beginScenario(campaignRun, "nightmare-elm");
campaignRun = finishScenario(campaignRun);
assert(campaignRun.campaign.unlockedScenarios.includes("lotr-war") && !campaignRun.campaign.infiniteUnlocked, "Nightmare on Elm Street completion should unlock LOTR before infinite mode.");
campaignRun = core.beginScenario(campaignRun, "lotr-war");
campaignRun = finishScenario(campaignRun);
assert(campaignRun.campaign.unlockedScenarios.includes("rumbling-finale") && !campaignRun.campaign.infiniteUnlocked, "LOTR completion should unlock the Rumbling finale before infinite mode.");
campaignRun = core.beginScenario(campaignRun, "rumbling-finale");
campaignRun = finishScenario(campaignRun);
assert(campaignRun.campaign.unlockedScenarios.includes("infinity-castle") && !campaignRun.campaign.infiniteUnlocked, "The Rumbling finale should unlock Infinity Castle before infinite mode.");
campaignRun = core.beginScenario(campaignRun, "infinity-castle");
campaignRun = finishScenario(campaignRun);
assert(campaignRun.campaign.unlockedScenarios.includes("naruto-final-valley") && !campaignRun.campaign.infiniteUnlocked, "Infinity Castle completion should unlock Final Valley before infinite mode.");
campaignRun = core.beginScenario(campaignRun, "naruto-final-valley");
campaignRun = finishScenario(campaignRun);
assert(campaignRun.campaign.unlockedScenarios.includes("bleach-false-karakura") && !campaignRun.campaign.infiniteUnlocked, "Final Valley completion should unlock Fake Karakura before infinite mode.");
campaignRun = core.beginScenario(campaignRun, "bleach-false-karakura");
campaignRun = finishScenario(campaignRun);
assert(campaignRun.campaign.unlockedScenarios.includes("gintama-yoshiwara") && !campaignRun.campaign.infiniteUnlocked, "Fake Karakura completion should unlock Yoshiwara before infinite mode.");
campaignRun = core.beginScenario(campaignRun, "gintama-yoshiwara");
campaignRun = finishScenario(campaignRun);
assert(campaignRun.campaign.unlockedScenarios.includes("gintama-final-war") && !campaignRun.campaign.infiniteUnlocked, "Yoshiwara completion should unlock Gintama final war before infinite mode.");
campaignRun = core.beginScenario(campaignRun, "gintama-final-war");
campaignRun = finishScenario(campaignRun);
assert(campaignRun.campaign.unlockedScenarios.includes("avengers-new-york") && !campaignRun.campaign.infiniteUnlocked, "Gintama final war completion should unlock Avengers before infinite mode.");
campaignRun = core.beginScenario(campaignRun, "avengers-new-york");
campaignRun = finishScenario(campaignRun);
assert(campaignRun.campaign.unlockedScenarios.includes("batman-v-superman") && !campaignRun.campaign.infiniteUnlocked, "Avengers completion should unlock Batman v Superman before infinite mode.");
campaignRun = core.beginScenario(campaignRun, "batman-v-superman");
campaignRun = finishScenario(campaignRun);
assert(campaignRun.campaign.infiniteUnlocked && campaignRun.campaign.unlockedScenarios.includes("devil-may-cry-5"), "Batman v Superman completion should unlock infinite mode and DMC5.");
campaignRun = core.beginScenario(campaignRun, "devil-may-cry-5");
campaignRun = finishScenario(campaignRun);
assert(campaignRun.campaign.unlockedScenarios.includes("final-destination"), "DMC5 completion should unlock Final Destination.");
campaignRun = core.beginScenario(campaignRun, "final-destination");
campaignRun = finishScenario(campaignRun);
assert(campaignRun.campaign.unlockedScenarios.includes("jinyong-heroic-peak"), "Final Destination completion should unlock the Jinyong wuxia scenario.");
campaignRun = core.beginScenario(campaignRun, "jinyong-heroic-peak");
campaignRun = finishScenario(campaignRun);
const legendaryRecruitIds = new Set(data.legendaryRecruitmentPool);
let lockedLegendaryState = structuredClone(campaignRun);
lockedLegendaryState.screen = "hub";
lockedLegendaryState.campaign.infiniteTier = data.economy.legendaryRecruitmentMinInfiniteTier - 1;
lockedLegendaryState = core.beginScenario(lockedLegendaryState, "infinite");
assert(!lockedLegendaryState.pending?.candidates?.some((id) => legendaryRecruitIds.has(id)), "Legendary protagonists should stay locked before the required infinite tier.");
let eligibleLegendaryState = structuredClone(campaignRun);
eligibleLegendaryState.screen = "hub";
eligibleLegendaryState.campaign.infiniteTier = data.economy.legendaryRecruitmentMinInfiniteTier;
eligibleLegendaryState.party = data.characters
  .filter((character) => !character.tutorialOnly && !legendaryRecruitIds.has(character.id))
  .map((character, index) => {
    const base = structuredClone(core.charactersById[character.id]);
    return { ...base, hp: base.maxHp, block: 0, active: index < 3 };
  });
eligibleLegendaryState = core.beginScenario(eligibleLegendaryState, "infinite");
assert(eligibleLegendaryState.screen === "recruit" && eligibleLegendaryState.pending.candidates.length === 1 && legendaryRecruitIds.has(eligibleLegendaryState.pending.candidates[0]), "Deep infinite mode should inject one unowned legendary protagonist candidate.");
campaignRun = core.beginScenario(campaignRun, "infinite");
if (campaignRun.screen === "recruit") campaignRun = core.chooseRecruit(campaignRun, campaignRun.pending.candidates[0]);
if (campaignRun.screen === "scenario-intro") campaignRun = core.continueScenarioIntro(campaignRun);
assert(campaignRun.screen === "map" && campaignRun.run.sourceScenarioId === "infinite", "Infinite mode should launch a random completed scenario.");
assert([
  "alien", "juon", "mummy-curse", "jurassic-island", "abyssal-ark", "evernight-castle", "demon-frontier", "main-god-trial",
  "starship-troopers", "avp-pyramid", "nightmare-elm", "lotr-war", "rumbling-finale", "infinity-castle", "naruto-final-valley", "bleach-false-karakura", "gintama-yoshiwara", "gintama-final-war", "avengers-new-york", "batman-v-superman", "devil-may-cry-5", "final-destination", "jinyong-heroic-peak"
].includes(campaignRun.run.scenarioId), "Infinite mode should rotate through all completed scenarios.");

// New scenarios have complete encounter sets and unique scenario-event powers.
for (const scenarioId of [
  "mummy-curse", "jurassic-island", "abyssal-ark", "evernight-castle", "demon-frontier", "main-god-trial",
  "starship-troopers", "avp-pyramid", "nightmare-elm", "lotr-war", "rumbling-finale", "infinity-castle",
  "naruto-final-valley", "bleach-false-karakura", "gintama-yoshiwara", "gintama-final-war", "avengers-new-york", "batman-v-superman", "devil-may-cry-5", "final-destination", "jinyong-heroic-peak"
]) {
  const scenario = core.scenariosById[scenarioId];
  assert(scenario.normal.length === 2 && scenario.elite.length === 1 && scenario.miniboss && scenario.boss, `${scenarioId} should have a full encounter set.`);
  assert(scenario.scenarioPower && scenario.eventTitle && scenario.eventText, `${scenarioId} should have its own event and temporary power.`);
  assert(scenario.recruitmentPool.length === 10, `${scenarioId} should recruit ten rival-faction characters.`);
}
let eventState = structuredClone(campaignRun);
eventState.screen = "event";
eventState.pending = { kind: "event", candidate: null, scenarioId: "mummy-curse" };
eventState.run.scenarioId = "mummy-curse";
eventState.run.temporaryPowers = [];
eventState.run.currentNodeId = eventState.run.map.layers[0][0].id;
eventState = core.resolveEvent(eventState, "scenario-power");
assert(eventState.run.temporaryPowers.some((power) => power.id === "book-of-amun-ra"), "The Mummy event should grant the resurrection scripture power.");
eventState.screen = "event";
eventState.pending = { kind: "event", candidate: null, scenarioId: "jurassic-island" };
eventState.run.scenarioId = "jurassic-island";
eventState = core.resolveEvent(eventState, "scenario-power");
assert(eventState.run.temporaryPowers.some((power) => power.id === "electric-fence"), "Jurassic Park event should grant the electric fence power.");
eventState.screen = "event";
eventState.pending = { kind: "event", candidate: null, scenarioId: "abyssal-ark" };
eventState.run.scenarioId = "abyssal-ark";
eventState = core.resolveEvent(eventState, "scenario-power");
assert(eventState.run.temporaryPowers.some((power) => power.id === "pressure-suit"), "Abyssal Ark event should grant the pressure suit power.");
eventState.screen = "event";
eventState.pending = { kind: "event", candidate: null, scenarioId: "evernight-castle" };
eventState.run.scenarioId = "evernight-castle";
eventState = core.resolveEvent(eventState, "scenario-power");
assert(eventState.run.temporaryPowers.some((power) => power.id === "silvered-weapons"), "Evernight Castle event should grant the silvered weapons power.");
eventState.screen = "event";
eventState.pending = { kind: "event", candidate: null, scenarioId: "demon-frontier" };
eventState.run.scenarioId = "demon-frontier";
eventState = core.resolveEvent(eventState, "scenario-power");
assert(eventState.run.temporaryPowers.some((power) => power.id === "black-flame-overclock"), "Demon Frontier event should grant the black-flame overclock power.");
eventState.screen = "event";
eventState.pending = { kind: "event", candidate: null, scenarioId: "main-god-trial" };
eventState.run.scenarioId = "main-god-trial";
eventState = core.resolveEvent(eventState, "scenario-power");
assert(eventState.run.temporaryPowers.some((power) => power.id === "main-god-calibration"), "Main God Trial event should grant the Main God calibration power.");
eventState.screen = "event";
eventState.pending = { kind: "event", candidate: null, scenarioId: "rumbling-finale" };
eventState.run.scenarioId = "rumbling-finale";
eventState = core.resolveEvent(eventState, "scenario-power");
assert(eventState.run.temporaryPowers.some((power) => power.id === "thunder-spear-route"), "The Rumbling finale event should grant the thunder spear attack route.");
eventState.screen = "event";
eventState.pending = { kind: "event", candidate: null, scenarioId: "infinity-castle" };
eventState.run.scenarioId = "infinity-castle";
eventState = core.resolveEvent(eventState, "scenario-power");
assert(eventState.run.temporaryPowers.some((power) => power.id === "nichirin-counteroffensive"), "Infinity Castle event should grant the Nichirin counteroffensive power.");
eventState.screen = "event";
eventState.pending = { kind: "event", candidate: null, scenarioId: "avengers-new-york" };
eventState.run.scenarioId = "avengers-new-york";
eventState = core.resolveEvent(eventState, "scenario-power");
assert(eventState.run.temporaryPowers.some((power) => power.id === "avengers-assemble-protocol"), "Avengers event should grant the assemble protocol power.");
eventState.screen = "event";
eventState.pending = { kind: "event", candidate: null, scenarioId: "batman-v-superman" };
eventState.run.scenarioId = "batman-v-superman";
eventState = core.resolveEvent(eventState, "scenario-power");
assert(eventState.run.temporaryPowers.some((power) => power.id === "justice-dawn-truce"), "Batman v Superman event should grant the Justice Dawn truce power.");
eventState.screen = "event";
eventState.pending = { kind: "event", candidate: null, scenarioId: "final-destination" };
eventState.run.scenarioId = "final-destination";
eventState = core.resolveEvent(eventState, "scenario-power");
assert(eventState.run.temporaryPowers.some((power) => power.id === "premonition-loop"), "Final Destination event should grant the premonition loop power.");
eventState.screen = "event";
eventState.pending = { kind: "event", candidate: null, scenarioId: "jinyong-heroic-peak" };
eventState.run.scenarioId = "jinyong-heroic-peak";
eventState = core.resolveEvent(eventState, "scenario-power");
assert(eventState.run.temporaryPowers.some((power) => power.id === "wulin-manual-focus"), "Jinyong event should grant the wuxia manual focus power.");

// Multi-enemy combat, target selection, and upgraded card instances.
const firstNode = state.run.map.layers[0][0];
state = core.chooseMapNode(state, firstNode.id);
assert(state.screen === "combat" && state.activeEnemies.length >= 2, "Normal combat should support multiple enemies.");
const secondEnemy = state.activeEnemies[1];
state = core.selectTarget(state, secondEnemy.uid);
const knife = findCombatCard(state, "combat-knife");
const firstEnemyHp = state.activeEnemies[0].hp;
const targetHp = state.activeEnemies[1].hp;
state = core.playCard(state, knife.uid, secondEnemy.uid);
assert(state.activeEnemies[0].hp === firstEnemyHp && state.activeEnemies[1].hp < targetHp, "Single-target attacks must hit the selected enemy.");

// Downed party members stop contributing energy and lose their signature next turn.
const downed = core.getActiveParty(state)[1];
downed.hp = 0;
state = core.endPlayerTurn(state);
assert(state.maxEnergy === core.getAliveActiveParty(state).reduce((sum, member) => sum + member.energyContribution, 0), "Downed members must stop contributing energy.");
assert(![...state.hand, ...state.drawPile, ...state.discardPile].some((entry) => entry.ownerId === downed.id), "Downed signatures must be removed.");

// Camp can upgrade one permanent card instance.
state.screen = "camp";
state.run.currentNodeId = state.run.map.layers[4][0].id;
const upgradeTarget = state.deck.find((entry) => core.cardsById[entry.cardId].category === "general" && !entry.upgraded);
state = core.campAction(state, "upgrade-deck", upgradeTarget.instanceId);
assert(state.deck.find((entry) => entry.instanceId === upgradeTarget.instanceId).upgraded, "Camp must upgrade a specific card instance.");

// Equipment is outside the deck and can be assigned one per character.
state.screen = "hub";
state.run = null;
state.equipmentInventory.push({ instanceId: "test-equip", equipmentId: "gauss-pistol", upgraded: false, acquiredRunId: null });
state = core.equipItem(state, "zheng-zha", "test-equip");
assert(state.equipped["zheng-zha"] === "test-equip", "Equipment should bind to a character.");
assert(!state.deck.some((entry) => entry.cardId === "gauss-pistol"), "Equipment must not enter the draw deck.");

// Main God deck trimming removes normal cards with reward points but leaves curses to curse removal.
const removableCard = state.deck.find((entry) => core.cardsById[entry.cardId].category !== "curse");
const preRemovalDeckSize = state.deck.length;
state.rewardPoints = 350;
state = core.removeDeckCard(state, removableCard.instanceId);
assert(state.rewardPoints === 50 && state.deck.length === preRemovalDeckSize - 1 && !state.deck.some((entry) => entry.instanceId === removableCard.instanceId), "Main God deck trimming should spend reward points and remove one normal card.");

// Curse removal costs points; partial Main God repair never leaves downed characters at zero.
state.deck.push({ instanceId: "test-curse", cardId: "curse-panic", upgraded: false, acquiredRunId: null });
state.curses.push("test-curse");
state.rewardPoints = 500;
state = core.removeDeckCard(state, "test-curse");
assert(state.curses.includes("test-curse") && state.rewardPoints === 500, "Normal deck trimming must not remove curse cards.");
state = core.removeCurse(state, "test-curse");
assert(!state.curses.includes("test-curse") && state.rewardPoints === 100, "Curse removal should use the scaled point cost.");
state.upgradeTokens = 1;
state.sideStories = 0;
state = core.buyPermanentUpgrade(state, "team-opening-block");
assert(state.permanentUpgrades.team.includes("team-opening-block") && state.upgradeTokens === 0, "A boss upgrade token should buy one permanent upgrade for free.");
state.party[0].hp = 0;
state.party[0].stress = 100;
state.rewardPoints = 1;
state.screen = "defeat";
state = core.returnAfterDefeat(state);
assert(state.party[0].hp >= 1, "A downed member must return with at least one HP even when repair points are insufficient.");

// Legacy migration preserves progress and maps clear count to campaign unlocks.
const migrated = core.normalizeState({
  party: data.characters.filter((character) => ["zheng-zha", "zhan-lan", "zero"].includes(character.id)).map((character) => ({ id: character.id })),
  deck: ["combat-knife", "blood-awakening", "blood-awakening"],
  rewardPoints: 777,
  sideStories: 4,
  clears: 2,
  purchased: {}
});
assert(migrated.campaign.tutorialComplete && migrated.campaign.infiniteUnlocked, "Two legacy clears should unlock infinite mode.");
assert(migrated.rewardPoints === 1077, "Duplicate legacy signatures should refund scaled reward points.");
assert(migrated.permanentUpgrades.signatures.includes("zheng-zha"), "First legacy signature should become its upgrade.");

// Direct classic-script UI can render the separated hub tabs and expanded roster.
let renderedHtml = "";
const uiState = core.createInitialState();
uiState.screen = "hub";
uiState.pending = null;
uiState.campaign.tutorialComplete = true;
uiState.hubTab = "roster";
uiState.party = [{ ...uiState.party[0], active: true }];
["zhan-lan", "zero", "zhang-heng", "ming-yanwei", "cheng-xiao", "wang-xia", "luo-gandao", "liu-yu", "lin-juntian", "imhotep", "clone-zheng-zha", "adam", "gangnir", "shiva-gangtian", "richard", "amon", "sarah", "tanjiro-kamado", "giyu-tomioka", "naruto-uzumaki", "luffy-nika", "ichigo-kurosaki", "edward-elric", "eren-yeager", "mikasa-ackerman", "armin-arlert", "levi-ackerman", "kirito-kazuto"].forEach((id) => addCharacter(uiState, id, false));
globalThis.localStorage = { getItem: () => JSON.stringify(uiState), setItem: () => undefined };
globalThis.document = {
  querySelector: () => ({
    get innerHTML() { return renderedHtml; },
    set innerHTML(value) { renderedHtml = value; },
    querySelectorAll: () => []
  })
};
await import("../src/game-ui.js");
assert(["出戰部署", "角色整備", "強化商店"].every((label) => renderedHtml.includes(label)), "The hub should render all three separated tabs.");
assert(renderedHtml.includes("張恆") && renderedHtml.includes("伊莫頓") && renderedHtml.includes("濕婆·甘天") && renderedHtml.includes("灶門炭治郎") && renderedHtml.includes("米卡莎") && renderedHtml.includes("富岡義勇"), "The roster preparation tab should render the expanded roster.");
assert(["惡魔隊", "天神隊", "北冰洲隊", "印洲隊", "西海隊", "森洲隊", "傳說主角"].every((label) => renderedHtml.includes(label)), "Rival and legendary characters should display their faction labels.");
assert(core.setHubTab(uiState, "shop").hubTab === "shop", "Hub tabs should persist through core state.");
uiState.hubTab = "shop";
uiState.rewardPoints = 10000;
uiState.sideStories = 5;
renderedHtml = "";
await import("../src/game-ui.js?shop-categories");
assert(["鬼滅之刃", "進擊的巨人", "Final Fantasy VII", "燕雲十六聲", "金庸武俠"].every((label) => renderedHtml.includes(label)), "The shop should render collapsed source categories for crossover cards.");
assert(renderedHtml.includes("shop-source-section") && renderedHtml.includes("霹靂一閃") && renderedHtml.includes("雷槍齊射") && renderedHtml.includes("降龍十八掌"), "Collapsed shop sections should contain their card lists.");
assert(["動漫神器", "原作決戰武器", "小說神器", "武俠神兵"].every((label) => renderedHtml.includes(label)), "The shop should render collapsed source categories for artifact equipment.");
assert(renderedHtml.includes("equipment-source-section") && renderedHtml.includes("乖離劍 Ea") && renderedHtml.includes("立體機動裝置") && renderedHtml.includes("軒轅劍"), "Collapsed equipment sections should contain their artifact lists.");

let introUiState = core.createInitialState();
introUiState.screen = "hub";
introUiState.pending = null;
introUiState.campaign.tutorialComplete = true;
introUiState.campaign.unlockedScenarios = ["alien", "juon", "mummy-curse"];
introUiState.party = data.characters
  .filter((character) => !character.tutorialOnly && !data.legendaryRecruitmentPool.includes(character.id))
  .map((character, index) => {
    const base = structuredClone(core.charactersById[character.id]);
    return { ...base, hp: base.maxHp, block: 0, active: index < 3 };
  });
introUiState = core.beginScenario(introUiState, "mummy-curse");
assert(introUiState.screen === "scenario-intro", "Starting a formal scenario should show its opening screen before the map.");
globalThis.localStorage = { getItem: () => JSON.stringify(introUiState), setItem: () => undefined };
renderedHtml = "";
await import("../src/game-ui.js?scenario-intro");
assert(renderedHtml.includes("白光散去後") && renderedHtml.includes("主神題要") && renderedHtml.includes("確認投放，選擇路線"), "The scenario opening should render dialogue, premise, and the route entry action.");
assert(renderedHtml.includes("聖甲蟲潮") && (renderedHtml.includes("哈姆納塔入口") || renderedHtml.includes("亡者地下墓道")), "The scenario opening should render themed story beats and first-route encounter previews.");

console.log("Campaign, factions, rival mechanics, bloodlines, combat statuses, equipment, hub tabs, migration, and direct-HTML smoke tests passed.");
