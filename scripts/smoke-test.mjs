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
  assert(isSupportedAudio(buffer), `Audio asset should use WAV or MP3 format: ${fileName}`);
}

function isSupportedAudio(buffer) {
  const isWave = buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WAVE";
  const isId3Mp3 = buffer.toString("ascii", 0, 3) === "ID3";
  const isMpegFrame = buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0;
  return isWave || isId3Mp3 || isMpegFrame;
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

function findCombatCardWhere(state, predicate, message) {
  for (const pile of ["hand", "drawPile", "discardPile"]) {
    const card = state[pile].find((entry) => predicate(core.effectiveCard(entry), entry));
    if (card) {
      state[pile] = state[pile].filter((entry) => entry.uid !== card.uid);
      state.hand.push(card);
      return card;
    }
  }
  throw new Error(message);
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

function assertCharacterEnergy(ids, expected, message) {
  ids.forEach((id) => assert(core.charactersById[id]?.energyContribution === expected, `${message}: ${id}`));
}

function createCreatedPlayerState({
  name = "測試者",
  gender = "male",
  professionId = "emergency-medic",
  personalityId = "calm"
} = {}) {
  let next = core.createInitialState();
  next = core.answerMainGodInvite(next, "yes");
  next = core.setPlayerName(next, name);
  next = core.setPlayerGender(next, gender);
  next = core.setPlayerProfession(next, professionId);
  next = core.setPlayerPersonality(next, personalityId);
  return core.confirmPlayerCreation(next);
}

function createTutorialReadyState(options = {}) {
  return createCreatedPlayerState(options);
}

function createCombatTestState(options = {}) {
  const next = createTutorialReadyState(options);
  data.starterDeck.forEach((cardId) => core.grantOrUpgradeCard(next, cardId, null));
  return next;
}

function createCompletedTutorialState(options = {}) {
  const next = createCreatedPlayerState(options);
  next.screen = "hub";
  next.pending = null;
  next.campaign.tutorialComplete = true;
  next.campaign.unlockedScenarios = ["alien"];
  next.party = next.party.filter((member) => member.id !== "zhang-jie");
  return next;
}

function fillOwnedRoster(state, activeIds = ["zheng-zha", "zhan-lan", "zero"]) {
  const activeSet = new Set(activeIds);
  data.characters
    .filter((character) => !character.tutorialOnly && !character.playerOnly)
    .forEach((character) => {
      if (state.party.some((member) => member.id === character.id)) return;
      const base = structuredClone(core.charactersById[character.id]);
      state.party.push({ ...base, hp: base.maxHp, block: 0, active: activeSet.has(character.id) });
    });
  state.party = state.party.map((member) => member.id === "player-avatar" ? member : { ...member, active: activeSet.has(member.id) });
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
    else if (next.screen === "event") {
      for (let eventStep = 0; eventStep < 3 && next.screen === "event"; eventStep += 1) {
        const choice = next.pending?.choices?.[0];
        if (!choice) throw new Error("Event flow should expose three-stage choices.");
        next = core.resolveEvent(next, choice.id);
      }
    }
    else if (next.screen === "event-result") next = core.continueEventResult(next);
    else if (next.screen === "camp") next = core.campAction(next, "heal");
    else throw new Error(`Unhandled scenario screen: ${next.screen}`);
  }
  return next;
}

// New campaigns begin with the Main God invitation and then enter custom character creation.
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
Object.values(audioManifest.music).forEach((entry) => {
  const playlist = Array.isArray(entry.playlist) ? entry.playlist : [];
  assert(playlist.length === 6, "Every BGM event should use the six-track shared playlist.");
  playlist.forEach((src) => assertAudioAsset(String(src).split("/").pop()));
});
assert(state.version === 7 && state.screen === "onboarding" && state.onboarding.stage === "invite", "New saves must start at the Windows 98 invitation popup.");
assert(state.campaign.dynamicDifficulty.failureRelief === 0 && Array.isArray(state.campaign.dynamicDifficulty.randomHistory), "New saves should initialize transparent dynamic difficulty state.");
const noInviteState = core.answerMainGodInvite(state, "no");
assert(noInviteState.onboarding.stage === "ordinary-ending", "Choosing No should enter the ordinary person ending.");
assert(core.restartOnboarding(noInviteState).onboarding.stage === "invite", "The ordinary ending should restart back to the invitation popup.");
const createdState = createCreatedPlayerState({ name: "林測試", gender: "female", professionId: "systems-engineer", personalityId: "curious" });
assert(createdState.screen === "story" && createdState.pending.kind === "tutorial-intro", "Confirming character creation should enter the tutorial story.");
assert(createdState.party.map((member) => member.id).join(",") === "player-avatar,zhang-jie", "Tutorial party must be the custom protagonist and Zhang Jie.");
assert(createdState.party[0].name === "林測試" && createdState.party[0].signatureCardId === "player-personality-curious", "The custom protagonist should keep the chosen name and personality card.");
assert(core.getActiveParty(createdState).map((member) => member.id).join(",") === "zhang-jie", "The custom protagonist should stay off the battlefield as the seventh support member.");
assert(createdState.deck.map((entry) => entry.cardId).join(",") === [...data.playerProfessions.find((profession) => profession.id === "systems-engineer").cardIds, "player-personality-curious"].join(","), "Profession and personality cards should form the custom protagonist's team deck.");
assert(createdState.deck.every((entry) => !entry.ownerId), "Custom protagonist cards should become team cards with no battlefield owner.");
assert(core.calculateEnergy(createdState) === 3, "Zhang Jie should still contribute three tutorial energy while the custom protagonist stays in support.");
assertCharacterEnergy(["player-avatar"], 0, "The custom protagonist should not contribute battlefield energy directly");
assertCharacterEnergy(["zhang-jie", "zhan-lan", "cheng-xiao", "liu-yu", "qi-tengyi", "elena", "arot", "shinpachi-shimura", "capable", "bsaa-agent", "sherry-birkin", "melina-kindling-maiden", "yuta-okkotsu", "toge-inumaki"], 3, "Pure support characters should contribute three energy");
assertCharacterEnergy(["chu-xuan", "xiao-honglu", "clone-chu-xuan", "adam", "nios", "sarah", "edward-elric", "armin-arlert", "v-dmc5", "kotaro-katsura", "tony-stark", "bruce-wayne-batman", "mako-mori", "stacker-pentecost", "ranni-dark-moon", "megumi-fushiguro", "higuruma-hiromi"], 2, "Strategists and planners should contribute two energy");
assertCharacterEnergy(["zheng-zha", "zero", "ba-wang", "zhang-heng", "wang-xia", "tanjiro-kamado", "yuji-itadori", "panda-jjk"], 0, "High-combat characters should contribute zero energy");
assertCharacterEnergy(["clone-zheng-zha", "naruto-uzumaki", "luffy-nika", "son-goku", "ichigo-kurosaki", "levi-ackerman", "dante-dmc5", "thor-odinson", "bruce-banner-hulk", "clark-kent-superman", "satoru-gojo"], -1, "Combat ceiling characters should reduce team energy");
let negativeEnergyState = createCompletedTutorialState();
["clone-zheng-zha", "naruto-uzumaki", "son-goku"].forEach((id) => addCharacter(negativeEnergyState, id));
assert(core.calculateEnergy(negativeEnergyState) === 1, "A living team with negative total contribution should keep one minimum energy.");
negativeEnergyState.party.forEach((member) => { if (member.id !== "player-avatar") member.hp = 0; });
assert(core.calculateEnergy(negativeEnergyState) === 0, "The minimum energy floor should not apply when no deployed member is alive.");
assert(core.cardsById["mentor-demo"].cost === 0 && core.cardsById["mentor-demo"].damage === 24, "Mentor signature must be exceptionally strong.");
assert(data.playerProfessions.length === 10 && data.playerPersonalities.length === 10, "Character creation should define ten professions and ten personalities.");
assert(["文員", "平面設計師", "便利店收銀員", "地盤工人", "外賣速遞員", "黑客", "殺手"].every((name) => data.playerProfessions.some((profession) => profession.name === name)), "Character creation should include grounded Hong Kong jobs plus high-risk genre jobs.");
const professionCardIds = data.playerProfessions.flatMap((profession) => profession.cardIds);
const personalityCardIds = data.playerPersonalities.map((personality) => personality.cardId);
assert(data.playerProfessions.every((profession) => profession.cardIds.length === 3 && ["智慧", "力量", "技巧"].includes(profession.archetype)), "Every profession should provide three cards and one archetype.");
assert(new Set([...professionCardIds, ...personalityCardIds]).size === 40, "Character creation should add thirty profession cards and ten personality cards.");
assert(data.playerProfessions.every((profession) => ["male", "female"].every((gender) => existsSync(assetUrl(`character-player-${profession.id}-${gender}.png`)))), "Every profession should have male and female IMAGE2 portraits.");
assert(existsSync(assetUrl("character-player-avatar.png")), "The custom protagonist should have a base portrait asset.");
assert([...professionCardIds, ...personalityCardIds].every((cardId) => existsSync(assetUrl(`skill-${cardId}.png`))), "Every custom protagonist card should have skill art.");
assert(data.customStats.length === 6 && data.customStats.every((stat) => createdState.playerGrowth.stats[stat.id] >= 0), "The custom protagonist should carry six RPG growth stats.");
assert(createdState.playerGrowth.activeMutationId === null && Array.isArray(createdState.playerGrowth.activeTagIds) && Array.isArray(createdState.playerGrowth.supportEquipmentIds), "Custom growth should initialize seventh-support mutation, bloodline, and equipment slots.");
assert(data.customTags.length >= 40 && data.customMutations.length >= 20, "The roguelike custom growth pool should include a deep set of tags and mutation recipes.");
let growthState = createCompletedTutorialState({ professionId: "systems-engineer" });
addCharacter(growthState, "zheng-zha");
addCharacter(growthState, "li-xiaoyi");
growthState.rewardPoints = 90000;
const baseEnergy = core.calculateEnergy(growthState);
growthState = core.buyCustomStat(growthState, "intelligence", 5);
assert(core.calculateEnergy(growthState) === baseEnergy + 1, "Crossing an intelligence 100-point breakpoint should add one combat energy.");
const baseTeamHp = growthState.party.find((member) => member.id === "zheng-zha").maxHp;
growthState = core.buyCustomStat(growthState, "stamina", 55);
assert(growthState.party.find((member) => member.id === "zheng-zha").maxHp === baseTeamHp + 10, "Crossing a stamina 100-point breakpoint should add ten max HP to combat members.");
assert(core.normalizeState(structuredClone(growthState)).party.find((member) => member.id === "zheng-zha").maxHp === baseTeamHp + 10, "Reloading should not double-apply custom max HP support buffs.");
growthState.playerGrowth.tagOffers = ["vampire-seed", "t-virus-adaptation", "spider-sense", "inner-qi-breath", "black-flame-seed", "toxin-craft"];
growthState = core.buyCustomTag(growthState, "vampire-seed");
growthState = core.buyCustomTag(growthState, "t-virus-adaptation");
assert(growthState.playerGrowth.purchasedTags.includes("vampire-seed") && growthState.playerGrowth.mutations.includes("blood-virus-core"), "Buying matching custom tags should automatically unlock their mutation.");
assert(growthState.playerGrowth.activeMutationId === "blood-virus-core" && growthState.playerGrowth.activeTagIds.length === 2, "Unlocked custom bloodlines should auto-fill the one mutation and two normal support slots.");
assert(core.customEffectTotal(growthState, "statusExploitBonus") >= 8, "Custom mutation effects should be visible to the combat rules.");
growthState.playerGrowth.tagOffers = ["gamma-rage-cell"];
growthState.sideStories = 3;
growthState = core.buyCustomTag(growthState, "gamma-rage-cell");
assert(growthState.playerGrowth.purchasedTags.includes("gamma-rage-cell") && !growthState.playerGrowth.activeTagIds.includes("gamma-rage-cell") && core.customEffectTotal(growthState, "attackBonus") === 0, "Purchased but unequipped custom bloodlines should not affect combat.");
assert(core.customTagCost(core.customTagsById["vampire-count"]).sideStoryCost > core.customTagCost(core.customTagsById["vampire-seed"]).sideStoryCost, "Higher-tier custom bloodlines should require more side stories than basic bloodlines.");
growthState.playerGrowth.tagOffers = ["vampire-count"];
growthState.sideStories = 0;
const highBloodlinePoints = growthState.rewardPoints;
growthState = core.buyCustomTag(growthState, "vampire-count");
assert(!growthState.playerGrowth.purchasedTags.includes("vampire-count") && growthState.rewardPoints === highBloodlinePoints, "High-tier bloodlines should not be purchasable without side stories.");
growthState.sideStories = 3;
growthState = core.buyCustomTag(growthState, "vampire-count");
assert(growthState.playerGrowth.purchasedTags.includes("vampire-count") && growthState.sideStories === 2, "Buying an A-tier bloodline should spend one side story.");
const legacySupportState = structuredClone(growthState);
legacySupportState.version = 5;
legacySupportState.playerGrowth.activeMutationId = null;
legacySupportState.playerGrowth.activeTagIds = [];
legacySupportState.playerGrowth.supportEquipmentIds = [];
legacySupportState.equipmentInventory.push({ instanceId: "legacy-support-equip", equipmentId: "gauss-pistol", upgraded: false, acquiredRunId: null });
legacySupportState.equipped["player-avatar"] = "legacy-support-equip";
legacySupportState.party.find((member) => member.id === "player-avatar").active = true;
const migratedSupportState = core.normalizeState(legacySupportState);
assert(migratedSupportState.version === 7 && !core.getActiveParty(migratedSupportState).some((member) => member.id === "player-avatar"), "Version 5 saves should migrate to seventh-support version 7 without activating the custom protagonist.");
assert(migratedSupportState.playerGrowth.activeMutationId === "blood-virus-core" && migratedSupportState.playerGrowth.activeTagIds.length === 2, "Migrated saves should choose the latest unlocked mutation and two normal bloodlines.");
assert(migratedSupportState.playerGrowth.supportEquipmentIds.includes("legacy-support-equip") && !migratedSupportState.equipped["player-avatar"], "Equipment formerly held by the custom protagonist should migrate into support equipment slots.");
state = createCreatedPlayerState();
assert(data.characters.length === 118, "The roster should include the custom protagonist plus the existing DMC5 cast, fourteen legendary final-battle characters, the Gintama group, the movie battle casts, the Resident Evil 6 taskforce, the Elden Ring hell roster, the Jujutsu Kaisen cast, and the Fullmetal Alchemist final-battle team.");
const signatureIds = data.characters.map((character) => character.signatureCardId);
assert(new Set(signatureIds).size === data.characters.length, "Every character must own one unique signature card.");
assert(signatureIds.every((cardId) => core.cardsById[cardId]?.category === "signature"), "Every character signature must resolve to a signature card.");
assert(data.characters.every((character) => existsSync(new URL(`../src/assets/generated/character-${character.id}.png`, import.meta.url))), "Every character must have portrait art.");
assert(signatureIds.every((cardId) => existsSync(new URL(`../src/assets/generated/skill-${cardId}.png`, import.meta.url))), "Every signature card must have skill art.");
assert(data.enemies.every((enemy) => existsSync(new URL(`../src/assets/generated/enemy-${enemy.id}.png`, import.meta.url))), "Every enemy should have direct IMAGE2 scene art.");
assert(data.characters.filter((character) => character.factionId && character.factionId !== "main").length === 97, "Ninety-seven characters should carry rival or crossover faction identities.");
assert(["shiva-gangtian", "lamia", "arot", "richard", "elena", "kevin", "amon", "naya", "victor", "sarah"].every((id) => data.characters.some((character) => character.id === id)), "The ten new rival and other-team characters should be registered.");
assert(["tanjiro-kamado", "naruto-uzumaki", "luffy-nika", "son-goku", "xiao-yan"].every((id) => data.characters.some((character) => character.id === id)), "The five legendary anime and novel protagonists should be registered.");
assert(["ichigo-kurosaki", "edward-elric", "eren-yeager", "gon-freecss", "kirito-kazuto"].every((id) => data.characters.some((character) => character.id === id)), "The second wave of five legendary anime protagonists should be registered.");
assert(["mikasa-ackerman", "armin-arlert", "levi-ackerman", "giyu-tomioka"].every((id) => data.characters.some((character) => character.id === id)), "The original final-battle cast additions should be registered.");
assert(["gintoki-sakata", "shinpachi-shimura", "kagura-yato", "tsukuyo-hyakka", "toshirou-hijikata", "sougo-okita", "kotaro-katsura", "shinsuke-takasugi"].every((id) => data.characters.some((character) => character.id === id)), "The Gintama character group should be registered.");
assert(["tony-stark", "steve-rogers", "thor-odinson", "bruce-banner-hulk", "natasha-romanoff", "clint-barton"].every((id) => data.characters.some((character) => character.id === id)), "The Avengers movie character group should be registered.");
assert(["clark-kent-superman", "bruce-wayne-batman", "diana-prince-wonder-woman"].every((id) => data.characters.some((character) => character.id === id)), "The Justice Dawn movie character group should be registered.");
assert(["raleigh-becket", "mako-mori", "stacker-pentecost", "herc-hansen"].every((id) => data.characters.some((character) => character.id === id)), "The Pacific Rim movie character group should be registered.");
assert(["max-rockatansky", "imperator-furiosa", "nux-war-boy", "capable"].every((id) => data.characters.some((character) => character.id === id)), "The Fury Road movie character group should be registered.");
assert(["leon-kennedy", "helena-harper", "chris-redfield", "piers-nivans", "jake-muller", "sherry-birkin", "ada-wong", "bsaa-agent"].every((id) => data.characters.some((character) => character.id === id)), "The Resident Evil 6 game character group should be registered.");
assert(["tarnished-elden-lord", "melina-kindling-maiden", "ranni-dark-moon", "blaidd-half-wolf", "millicent-valkyrie", "alexander-warrior-jar", "black-knife-tiche", "nepheli-loux"].every((id) => data.characters.some((character) => character.id === id)), "The Elden Ring hell character group should be registered.");
const jujutsuKaisenCharacterIds = ["yuji-itadori", "megumi-fushiguro", "nobara-kugisaki", "yuta-okkotsu", "maki-zenin", "toge-inumaki", "panda-jjk", "nanami-kento", "aoi-todo", "choso", "hakari-kinji", "higuruma-hiromi", "satoru-gojo"];
assert(jujutsuKaisenCharacterIds.every((id) => data.characters.some((character) => character.id === id)), "The Jujutsu Kaisen character group should be registered.");
const fullmetalAlchemistCharacterIds = ["alphonse-elric", "roy-mustang", "riza-hawkeye", "scar-ishvalan", "izumi-curtis", "van-hohenheim"];
assert(fullmetalAlchemistCharacterIds.every((id) => data.characters.some((character) => character.id === id)), "The Fullmetal Alchemist final-battle character group should be registered.");
const gojo = core.charactersById["satoru-gojo"];
const jujutsuScenario = core.scenariosById["jujutsu-kaisen-shibuya"];
const fullmetalAlchemistScenario = core.scenariosById["fullmetal-alchemist-finale"];
assert(gojo.hidden && gojo.unlock === "hidden-prison-realm", "Satoru Gojo should be flagged as a hidden Prison Realm unlock.");
assert(jujutsuScenario.hiddenProtagonistId === "satoru-gojo" && !jujutsuScenario.recruitmentPool.includes("satoru-gojo"), "Gojo should only be obtainable through the Prison Realm hidden event, not the normal recruitment pool.");
assert(fullmetalAlchemistScenario.hiddenProtagonistId === "edward-elric" && !fullmetalAlchemistScenario.recruitmentPool.includes("edward-elric"), "Edward should only be obtainable through the Fullmetal Alchemist equivalent-exchange event, not the normal recruitment pool.");
assert(data.legendaryRecruitmentPool.length === 14 && data.legendaryRecruitmentPool.every((id) => data.characters.some((character) => character.id === id)), "Legendary protagonists should be listed in a dedicated hard-to-obtain pool.");
assert(data.scenarios.every((scenario) => !scenario.recruitmentPool.some((id) => data.legendaryRecruitmentPool.includes(id))), "Legendary protagonists should not appear in normal scenario recruitment pools.");
const formalScenarios = data.scenarios.filter((scenario) => scenario.id !== "tutorial");
assert(formalScenarios.every((scenario) => scenario.opening?.dialogue?.length >= 3 && scenario.opening?.panels?.length >= 3), "Every formal scenario should have a story opening with dialogue and illustration beats.");
const formalScenarioAssetNames = formalScenarios.map((scenario) => `scenario-${scenario.id}.png`);
assert(formalScenarioAssetNames.every((fileName) => existsSync(assetUrl(fileName))), "Every formal scenario should have dedicated IMAGE2 hero art.");
assertUniqueAssets(formalScenarioAssetNames, "Every formal scenario IMAGE2 hero art should be unique.");
const openingPanelAssetNames = [...new Set(formalScenarios.flatMap((scenario) => scenario.opening.panels.map((panel) => `enemy-${panel.enemyId}.png`)))];
assert(openingPanelAssetNames.every((fileName) => existsSync(assetUrl(fileName))), "Every formal scenario opening illustration beat should have direct enemy scene art instead of a borrowed alias.");
const animeFinalScenarioIds = ["rumbling-finale", "infinity-castle", "naruto-final-valley", "bleach-false-karakura", "gintama-yoshiwara", "gintama-final-war", "fullmetal-alchemist-finale"];
assert(animeFinalScenarioIds.every((id) => data.scenarios.some((scenario) => scenario.id === id)), "The expanded anime final and climax scenarios should be registered.");
const movieScenarioIds = ["avengers-new-york", "batman-v-superman", "pacific-rim-breach", "fury-road-war-rig"];
assert(movieScenarioIds.every((id) => data.scenarios.some((scenario) => scenario.id === id)), "The movie crossover scenarios should be registered.");
const newScenarioIds = ["final-destination", "jinyong-heroic-peak"];
assert(newScenarioIds.every((id) => data.scenarios.some((scenario) => scenario.id === id)), "The two newest playable scenarios should be registered.");
const gameScenarioIds = ["devil-may-cry-5", "resident-evil-6-c-virus", "elden-ring-hell-run", "jujutsu-kaisen-shibuya"];
assert(gameScenarioIds.every((id) => data.scenarios.some((scenario) => scenario.id === id)), "The game crossover scenarios should be registered.");
assert(core.enemiesById["colossal-titan"].maxHp >= 400, "The Colossal Titan should be a notably high-HP enemy.");
assert(core.enemiesById["muzan-kibutsuji"].regen > 0 && core.enemiesById["muzan-kibutsuji"].phaseTwo?.maxHp > 0, "Muzan should regenerate and carry a second phase.");
assert(core.enemiesById["final-valley-sasuke"].phaseTwo?.maxHp > 0, "Final Valley Sasuke should carry a second phase.");
assert(core.enemiesById["transcendent-aizen"].regen > 0 && core.enemiesById["transcendent-aizen"].phaseTwo?.maxHp > 0, "Transcendent Aizen should regenerate and carry a second phase.");
assert(core.enemiesById["hosen-night-king"].regen > 0 && core.enemiesById["hosen-night-king"].phaseTwo?.maxHp > 0, "Night King Hosen should regenerate and carry a second phase.");
assert(core.enemiesById["utsuro-final"].regen > 0 && core.enemiesById["utsuro-final"].phaseTwo?.maxHp > 0, "Final Utsuro should regenerate and carry a second phase.");
assert(core.enemiesById["tesseract-portal-core"].regen > 0 && core.enemiesById["tesseract-portal-core"].phaseTwo?.maxHp > 0, "The Tesseract portal core should regenerate and carry a second phase.");
assert(core.enemiesById["doomsday-abomination"].regen > 0 && core.enemiesById["doomsday-abomination"].phaseTwo?.maxHp > 0, "Doomsday should regenerate and carry a second phase.");
assert(core.enemiesById["pr-slattern"].regen > 0 && core.enemiesById["pr-slattern"].phaseTwo?.maxHp > 0, "The Pacific breach kaiju boss should regenerate and carry a second phase.");
assert(core.enemiesById["fr-immortan-joe-war-party"].regen > 0 && core.enemiesById["fr-immortan-joe-war-party"].phaseTwo?.maxHp > 0, "The Fury Road convoy boss should regenerate and carry a second phase.");
assert(core.enemiesById["re6-haos-final-core"].regen > 0 && core.enemiesById["re6-haos-final-core"].phaseTwo?.maxHp > 0, "The Resident Evil 6 Haos boss should regenerate and carry a second phase.");
assert(core.enemiesById["er-malenia-blade-miquella"].regen > 0 && core.enemiesById["er-malenia-blade-miquella"].phaseTwo?.maxHp > 0, "Malenia should regenerate and carry a second phase.");
assert(core.enemiesById["er-radagon-elden-beast"].regen > 0 && core.enemiesById["er-radagon-elden-beast"].phaseTwo?.maxHp > 0, "Radagon and the Elden Beast should regenerate and carry a second phase.");
assert(core.enemiesById["jjk-sukuna-shinjuku"].regen > 0 && core.enemiesById["jjk-sukuna-shinjuku"].phaseTwo?.maxHp > 0, "Shinjuku Sukuna should regenerate and carry a second phase.");
assert(core.enemiesById["fma-father-eclipse"].regen > 0 && core.enemiesById["fma-father-eclipse"].phaseTwo?.maxHp > 0, "Father should regenerate and carry a second phase.");
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
const newMovieBattleAssetNames = [
  "scenario-pacific-rim-breach.png",
  "scenario-fury-road-war-rig.png",
  "enemy-pr-kaiju-spawn.png",
  "enemy-pr-knifehead.png",
  "enemy-pr-leatherback.png",
  "enemy-pr-otachi.png",
  "enemy-pr-slattern.png",
  "enemy-fr-war-boy-raiders.png",
  "enemy-fr-buzzard-spike-cars.png",
  "enemy-fr-polecat-boarders.png",
  "enemy-fr-bullet-farmer.png",
  "enemy-fr-immortan-joe-war-party.png"
];
assert(newMovieBattleAssetNames.every((fileName) => existsSync(assetUrl(fileName))), "The two new movie battle scenarios should have dedicated IMAGE2 scenario and enemy art.");
assertUniqueAssets(newMovieBattleAssetNames, "The two new movie battle IMAGE2 assets should be unique.");
const residentEvil6AssetNames = [
  "scenario-resident-evil-6-c-virus.png",
  "enemy-re6-zombie-horde.png",
  "enemy-re6-javo-rifle-squad.png",
  "enemy-re6-bloodshot-pack.png",
  "enemy-re6-napad-brute.png",
  "enemy-re6-strelats-screecher.png",
  "enemy-re6-ustanak-capture.png",
  "enemy-re6-haos-chrysalis.png",
  "enemy-re6-iluzija-serpent.png",
  "enemy-re6-simmons-dinosaur.png",
  "enemy-re6-haos-final-core.png"
];
assert(residentEvil6AssetNames.every((fileName) => existsSync(assetUrl(fileName))), "Resident Evil 6 should have dedicated IMAGE2 scenario and enemy art.");
assertUniqueAssets(residentEvil6AssetNames, "Resident Evil 6 IMAGE2 scenario and enemy art should be unique.");
const eldenRingAssetNames = [
  "scenario-elden-ring-hell-run.png",
  "enemy-er-starscourge-radahn.png",
  "enemy-er-morgott-omen-king.png",
  "enemy-er-fire-giant.png",
  "enemy-er-godskin-duo.png",
  "enemy-er-mohg-lord-of-blood.png",
  "enemy-er-dragonlord-placidusax.png",
  "enemy-er-maliketh-black-blade.png",
  "enemy-er-malenia-blade-miquella.png",
  "enemy-er-godfrey-hoarah-loux.png",
  "enemy-er-radagon-elden-beast.png"
];
assert(eldenRingAssetNames.every((fileName) => existsSync(assetUrl(fileName))), "Elden Ring hell mode should have dedicated IMAGE2 scenario and ten boss enemy art assets.");
assertUniqueAssets(eldenRingAssetNames, "Elden Ring hell IMAGE2 scenario and boss art should be unique.");
const jujutsuKaisenAssetNames = [
  "scenario-jujutsu-kaisen-shibuya.png",
  "enemy-jjk-cursed-spirit-swarm.png",
  "enemy-jjk-finger-bearer.png",
  "enemy-jjk-mahito-idle-transfiguration.png",
  "enemy-jjk-hanami-cursed-root.png",
  "enemy-jjk-toji-inventory-curse.png",
  "enemy-jjk-jogo-volcano.png",
  "enemy-jjk-dagon-domain.png",
  "enemy-jjk-kenjaku-barrier-master.png",
  "enemy-jjk-culling-game-player.png",
  "enemy-jjk-mahoraga-adaptation.png",
  "enemy-jjk-sukuna-shinjuku.png"
];
assert(jujutsuKaisenAssetNames.every((fileName) => existsSync(assetUrl(fileName))), "Jujutsu Kaisen should have dedicated IMAGE2 scenario and enemy art assets.");
assertUniqueAssets(jujutsuKaisenAssetNames, "Jujutsu Kaisen IMAGE2 scenario and enemy art should be unique.");
const fullmetalAlchemistAssetNames = [
  "scenario-fullmetal-alchemist-finale.png",
  "enemy-fma-mannequin-soldier.png",
  "enemy-fma-gold-toothed-doctor.png",
  "enemy-fma-pride-shadow.png",
  "enemy-fma-king-bradley.png",
  "enemy-fma-father-eclipse.png"
];
assert(fullmetalAlchemistAssetNames.every((fileName) => existsSync(assetUrl(fileName))), "Fullmetal Alchemist should have dedicated IMAGE2 scenario and enemy art assets.");
assertUniqueAssets(fullmetalAlchemistAssetNames, "Fullmetal Alchemist IMAGE2 scenario and enemy art should be unique.");
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
const pacificRimOpeningText = JSON.stringify(data.scenarios.find((scenario) => scenario.id === "pacific-rim-breach").opening);
const furyRoadOpeningText = JSON.stringify(data.scenarios.find((scenario) => scenario.id === "fury-road-war-rig").opening);
const residentEvil6OpeningText = JSON.stringify(data.scenarios.find((scenario) => scenario.id === "resident-evil-6-c-virus").opening);
const eldenRingOpeningText = JSON.stringify(data.scenarios.find((scenario) => scenario.id === "elden-ring-hell-run").opening);
const jujutsuKaisenOpeningText = JSON.stringify(data.scenarios.find((scenario) => scenario.id === "jujutsu-kaisen-shibuya").opening);
const fullmetalAlchemistOpeningText = JSON.stringify(data.scenarios.find((scenario) => scenario.id === "fullmetal-alchemist-finale").opening);
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
assert(["羅利·貝克特", "森真子", "潘特考斯特", "裂隙"].every((name) => pacificRimOpeningText.includes(name)), "The Pacific Rim opening should use Jaeger pilots, drift, and breach battle beats.");
assert(["芙莉歐莎", "麥斯", "納克斯", "戰爭車"].every((name) => furyRoadOpeningText.includes(name)), "The Fury Road opening should use convoy, war rig, and wasteland chase beats.");
assert(["里昂·S·甘迺迪", "克里斯·雷德菲爾", "傑克·穆勒", "C病毒", "Haos"].every((name) => residentEvil6OpeningText.includes(name)), "The Resident Evil 6 opening should use C-virus, BSAA, antibody, and Haos battle beats.");
assert(["褪色者", "梅琳娜", "菈妮", "瑪蓮妮亞", "艾爾登獸"].every((name) => eldenRingOpeningText.includes(name)), "The Elden Ring hell opening should use Tarnished, guidance, moon, rot goddess, and Elden Beast beats.");
assert(["虎杖悠仁", "伏黑惠", "乙骨憂太", "獄門疆", "宿儺"].every((name) => jujutsuKaisenOpeningText.includes(name)), "The Jujutsu Kaisen opening should use Shibuya, Prison Realm, and Shinjuku battle beats.");
assert(["愛德華", "阿爾馮斯", "馬斯坦古", "瓶中小人", "國土鍊成陣"].every((name) => fullmetalAlchemistOpeningText.includes(name)), "The Fullmetal Alchemist opening should use Edward, Alphonse, Mustang, Father, and nationwide transmutation beats.");
assert(data.economy.legendaryRecruitmentMinInfiniteTier === 3, "Legendary protagonists should require deep infinite-mode progress before appearing.");
assert(core.cardsById["kamehameha-limit"].damage === 48 && core.cardsById["buddha-lotus-flame"].damageAll === 32 && core.cardsById["jajanken-covenant"].damage === 46, "Legendary protagonist signatures should be especially strong.");
assert(data.equipment.length === 84, "The equipment pool should include the existing DMC5 gear, final-battle weapon expansion, Gintama tools, Avengers equipment, Justice Dawn equipment, the two new movie weapon sets, Resident Evil 6 weapons, Elden Ring relics, Jujutsu cursed tools, and Fullmetal Alchemist gear.");
const allCardAssetNames = data.cards.map((card) => `skill-${card.id}.png`);
const allEquipmentAssetNames = data.equipment.map((item) => `equipment-${item.id}.png`);
const sourceCoverAssetNames = data.cardSources.map((source) => `source-cover-${source.id}.png`);
const rosterHeroAssetNames = data.characterSources.map((source) => source.heroFileName);
assert(allCardAssetNames.every((fileName) => existsSync(assetUrl(fileName))), "Every card should have dedicated skill art.");
assert(allEquipmentAssetNames.every((fileName) => existsSync(assetUrl(fileName))), "Every equipment item should have dedicated equipment art.");
assert(sourceCoverAssetNames.length === 16, "The card shop should define sixteen source cover categories.");
assert(sourceCoverAssetNames.every((fileName) => existsSync(assetUrl(fileName))), "Every card source should have a dedicated IMAGE2 cover.");
assert(data.characterSources.length === 27, "Roster preparation should define twenty-seven team/source hero categories.");
assert(rosterHeroAssetNames.every((fileName) => existsSync(assetUrl(fileName))), "Every roster source should have a dedicated IMAGE2 hero shot.");
assertUniqueAssets([...allCardAssetNames, ...allEquipmentAssetNames], "Every card and equipment art file should be unique.");
assertUniqueAssets(readdirSync(assetUrl(".")).filter((fileName) => /^(skill|equipment)-.+\.png$/.test(fileName)), "No generated skill or equipment image file should be a duplicate.");
assertUniqueAssets(sourceCoverAssetNames, "Source cover IMAGE2 files should not be duplicated.");
assertUniqueAssets(rosterHeroAssetNames, "Roster hero IMAGE2 files should not be duplicated.");
assert(data.bloodlines.length === data.characters.length, "Every character should have an individual bloodline definition.");
const rosterSourceMembership = new Map();
data.characterSources.forEach((source) => {
  assert(source.id && source.name && source.heroFileName && Array.isArray(source.memberIds), "Every roster source should define id, name, heroFileName, and memberIds.");
  source.memberIds.forEach((id) => {
    assert(data.characters.some((character) => character.id === id), `Roster source references a valid character: ${id}`);
    assert(!rosterSourceMembership.has(id), `Roster source membership should be unique for ${id}.`);
    rosterSourceMembership.set(id, source.id);
  });
});
const rosterCharacterIds = data.characters.filter((character) => !character.tutorialOnly).map((character) => character.id);
assert(rosterCharacterIds.every((id) => rosterSourceMembership.has(id)), "Roster sources should cover every non-tutorial character.");
assert(data.legendaryRecruitmentPool.every((id) => rosterSourceMembership.get(id) !== "protagonist"), "Legendary protagonists should be split into their own anime/game/movie roster sources.");
assert(["demon-slayer", "naruto", "one-piece", "dragon-ball", "battle-through-heavens", "bleach", "fullmetal-alchemist", "attack-on-titan", "hunter", "sword-art-online"].every((id) => data.characterSources.some((source) => source.id === id)), "Roster sources should split legendary protagonists by original source.");
assert(data.bonds.length === 130, "The roster should include one hundred and thirty deployable bond combinations.");
const characterIds = new Set(data.characters.map((character) => character.id));
assert(data.bonds.every((bond) => (bond.members || []).every((id) => characterIds.has(id)) && (bond.anyMembers || []).every((id) => characterIds.has(id))), "Every bond must reference valid characters.");
assert(["zhongzhou-frontline", "field-medic-link", "demon-assault-cell", "legendary-sun-flame", "scout-final-flight", "water-hashira-line", "yorozuya-three", "joy4-last-stand", "avengers-assemble-core", "trinity-dawn", "jaeger-drift-team", "war-rig-convoy", "bsaa-c-virus-taskforce", "elden-ring-tarnished-oath", "jjk-prison-realm-break", "fma-elric-brothers", "fma-eastern-command", "fma-truth-countercircle"].every((id) => data.bonds.some((bond) => bond.id === id)), "The expanded bond set should include Zhongzhou, support, demon, legendary, scout, Water Hashira, Gintama, Avengers, Justice Dawn, Pacific Rim, Fury Road, Resident Evil 6, Elden Ring, Jujutsu, and Fullmetal Alchemist combinations.");
const crossWorldBonds = data.bonds.filter((bond) => bond.crossWorld);
const crossWorldCoveredCharacters = new Set(crossWorldBonds.flatMap((bond) => bond.members || []));
const deployableCharacterIds = data.characters.filter((character) => !character.tutorialOnly && !character.playerOnly).map((character) => character.id);
assert(crossWorldBonds.length === 69, "The expanded bond set should include sixty-nine explicit crossover bonds.");
assert(deployableCharacterIds.every((id) => crossWorldCoveredCharacters.has(id)), "Every deployable character should appear in at least one explicit crossover bond.");
assert(crossWorldBonds.every((bond) => new Set((bond.members || []).map((id) => core.charactersById[id].factionId || "main")).size >= 2), "Every explicit crossover bond should span multiple factions or worlds.");
assert(["cross-blood-sun-frontline", "cross-genius-forge", "cross-dark-mirror-sun", "cross-freedom-breakers", "cross-jaeger-mecha-line", "cross-war-rig-shield-wall", "cross-redemption-signal", "cross-kennedy-protocol", "cross-antibody-rescue", "cross-great-rune-calculation", "cross-black-knife-shadow", "cross-limitless-sun-break", "cross-equivalent-forge", "cross-flame-sniper-grid", "cross-reconstruction-martial-law", "cross-philosopher-sage-circle"].every((id) => data.bonds.some((bond) => bond.id === id)), "Crossover bonds should include Zhongzhou, legendary, movie, game, anime, Jaeger, wasteland, C-virus, Elden Ring, Jujutsu, and Fullmetal Alchemist mixes.");
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
  "bvs-batarang-flurry", "bvs-heat-vision-sweep", "bvs-amazon-sword-break", "bvs-batmobile-ram",
  "pacrim-rocket-elbow", "pacrim-plasma-caster", "pacrim-chain-sword",
  "fury-war-rig-ram", "fury-thunderpoon-salvo", "fury-polecat-boarding",
  "re6-wing-shooter-burst", "re6-hydra-shotgun-sweep", "re6-bsaa-assault-fireline", "re6-anti-materiel-shot", "re6-elephant-killer", "re6-remote-bomb-breach",
  "er-transient-moonlight", "er-corpse-piler-bloodflame", "er-blasphemous-flame", "er-lion-claw-crush", "er-black-knife-wave", "er-ancient-dragon-lightning", "er-scarlet-aeonia", "er-starscourge-arrow-rain", "er-flame-redmanes", "er-godslayer-blackflame",
  "fma-ground-spike", "fma-flame-burst", "fma-deconstruction-touch"
];
assert(crossoverAttackIds.length === 64, "The crossover common pool should add sixty-four attack cards.");
assert(crossoverAttackIds.every((id) => core.cardsById[id]?.category === "general" && core.cardsById[id].type === "attack"), "Every crossover card should be a purchasable general attack card.");
assert(crossoverAttackIds.every((id) => data.shop.some((entry) => entry.kind === "card" && entry.itemId === id)), "Every crossover attack card should have a shop entry.");
assert(crossoverAttackIds.every((id) => existsSync(new URL(`../src/assets/generated/skill-${id}.png`, import.meta.url))), "Every crossover attack card should have shop art.");
assert(["water-breathing-dead-calm", "survey-smoke-signal"].every((id) => core.cardsById[id]?.category === "general" && data.shop.some((entry) => entry.kind === "card" && entry.itemId === id)), "Final-battle support and guard cards should be purchasable.");
assert(["gintama-odd-jobs-retort", "gintama-joy4-rally"].every((id) => core.cardsById[id]?.category === "general" && data.shop.some((entry) => entry.kind === "card" && entry.itemId === id)), "Gintama support and tactic cards should be purchasable.");
assert(["avengers-widow-bite", "avengers-assemble"].every((id) => core.cardsById[id]?.category === "general" && data.shop.some((entry) => entry.kind === "card" && entry.itemId === id)), "Avengers tactic and support cards should be purchasable.");
assert(["bvs-kryptonite-gas-grenade", "bvs-justice-dawn-stand"].every((id) => core.cardsById[id]?.category === "general" && data.shop.some((entry) => entry.kind === "card" && entry.itemId === id)), "Justice Dawn tactic and support cards should be purchasable.");
assert(["pacrim-drift-protocol", "fury-green-place-oath"].every((id) => core.cardsById[id]?.category === "general" && data.shop.some((entry) => entry.kind === "card" && entry.itemId === id)), "Pacific Rim and Fury Road tactic/support cards should be purchasable.");
assert(["re6-antiviral-serum", "re6-coop-quick-shot"].every((id) => core.cardsById[id]?.category === "general" && data.shop.some((entry) => entry.kind === "card" && entry.itemId === id)), "Resident Evil 6 support and tactic cards should be purchasable.");
assert(["er-golden-vow", "er-bloodhound-step"].every((id) => core.cardsById[id]?.category === "general" && data.shop.some((entry) => entry.kind === "card" && entry.itemId === id)), "Elden Ring support and tactic cards should be purchasable.");
assert(["jjk-simple-domain-guard", "jjk-reverse-cursed-technique", "jjk-domain-clash"].every((id) => core.cardsById[id]?.category === "general" && data.shop.some((entry) => entry.kind === "card" && entry.itemId === id)), "Jujutsu Kaisen guard, support, and domain cards should be purchasable.");
assert(["fma-transmutation-wall", "fma-alkahestry-rebuild"].every((id) => core.cardsById[id]?.category === "general" && data.shop.some((entry) => entry.kind === "card" && entry.itemId === id)), "Fullmetal Alchemist guard and support cards should be purchasable.");
assert(["demon-slayer", "attack-on-titan", "ff7", "yanyun", "jinyong", "gintama", "avengers", "dc-movie", "pacific-rim", "fury-road", "re6", "elden-ring", "jujutsu-kaisen", "fullmetal-alchemist"].every((sourceId) => data.cardSources.some((source) => source.id === sourceId)), "Card shop sources should include the requested anime, game, wuxia, movie, Elden Ring, Jujutsu Kaisen, and Fullmetal Alchemist categories.");
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
const pacificRimEquipmentIds = ["neural-drift-rig", "jaeger-plasma-cannon", "jaeger-chain-sword", "striker-reactor-core"];
assert(pacificRimEquipmentIds.every((id) => core.equipmentById[id]?.sourceId === "pacific-rim-equipment"), "Every Pacific Rim equipment item should have the Pacific Rim equipment source.");
assert(pacificRimEquipmentIds.every((id) => data.shop.some((entry) => entry.kind === "equipment" && entry.itemId === id)), "Every Pacific Rim equipment item should have a shop entry.");
const furyRoadEquipmentIds = ["max-double-barrel", "war-rig-armored-cab", "thunderpoon-rack", "green-place-seed-bag"];
assert(furyRoadEquipmentIds.every((id) => core.equipmentById[id]?.sourceId === "fury-road-equipment"), "Every Fury Road equipment item should have the Fury Road equipment source.");
assert(furyRoadEquipmentIds.every((id) => data.shop.some((entry) => entry.kind === "equipment" && entry.itemId === id)), "Every Fury Road equipment item should have a shop entry.");
const residentEvil6EquipmentIds = ["wing-shooter-pistols", "hydra-shotgun", "bsaa-assault-kit", "anti-materiel-rifle", "elephant-killer-magnum", "ada-tactical-crossbow", "c-virus-antibody-serum", "quad-tower-command-key"];
assert(residentEvil6EquipmentIds.every((id) => core.equipmentById[id]?.sourceId === "re6-equipment"), "Every Resident Evil 6 equipment item should have the C-virus equipment source.");
assert(residentEvil6EquipmentIds.every((id) => data.shop.some((entry) => entry.kind === "equipment" && entry.itemId === id)), "Every Resident Evil 6 equipment item should have a shop entry.");
const eldenRingEquipmentIds = ["rivers-of-blood-katana", "moonveil-katana", "blasphemous-blade", "dark-moon-greatsword", "maliketh-black-blade", "hand-of-malenia", "starscourge-greatbow", "grafted-blade-greatsword", "azur-glintstone-staff", "dragon-communion-seal", "mimic-tear-ashes", "flask-wondrous-physick"];
assert(eldenRingEquipmentIds.every((id) => core.equipmentById[id]?.sourceId === "elden-ring-equipment"), "Every Elden Ring equipment item should have the Lands Between equipment source.");
assert(eldenRingEquipmentIds.every((id) => data.shop.some((entry) => entry.kind === "equipment" && entry.itemId === id)), "Every Elden Ring equipment item should have a shop entry.");
const jujutsuToolIds = ["slaughter-demon-dagger", "playful-cloud-staff", "inverted-spear-fragment", "prison-realm-shard"];
assert(jujutsuToolIds.every((id) => core.equipmentById[id]?.sourceId === "jujutsu-tools"), "Every Jujutsu Kaisen cursed tool should have the cursed-tool equipment source.");
assert(jujutsuToolIds.every((id) => data.shop.some((entry) => entry.kind === "equipment" && entry.itemId === id)), "Every Jujutsu Kaisen cursed tool should have a shop entry.");
const fullmetalAlchemistEquipmentIds = ["automail-right-arm", "flame-alchemy-gloves", "philosopher-stone-shard", "scar-brother-notes"];
assert(fullmetalAlchemistEquipmentIds.every((id) => core.equipmentById[id]?.sourceId === "fma-equipment"), "Every Fullmetal Alchemist equipment item should have the alchemy equipment source.");
assert(fullmetalAlchemistEquipmentIds.every((id) => data.shop.some((entry) => entry.kind === "equipment" && entry.itemId === id)), "Every Fullmetal Alchemist equipment item should have a shop entry.");
assert(["anime-artifacts", "final-battle-weapons", "novel-artifacts", "wuxia-artifacts", "gintama-equipment", "avengers-equipment", "dc-equipment", "pacific-rim-equipment", "fury-road-equipment", "re6-equipment", "elden-ring-equipment", "jujutsu-tools", "fma-equipment"].every((sourceId) => data.equipmentSources.some((source) => source.id === sourceId)), "Equipment shop sources should include anime, final-battle, novel, wuxia, Gintama, Avengers, Justice Dawn, Pacific Rim, Fury Road, Resident Evil 6, Elden Ring, Jujutsu cursed-tool, and Fullmetal Alchemist gear categories.");

// Bloodline upgrades are purchased per character and only enhance that owner's signature.
let bloodlineState = createCombatTestState();
bloodlineState.party = [];
addCharacter(bloodlineState, "zheng-zha");
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

let statusState = createCombatTestState();
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
let equipmentState = createCombatTestState();
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

let piercingState = createCombatTestState();
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

let poisonState = createCombatTestState();
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

let stunState = createCombatTestState();
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

let ammunitionState = createCombatTestState();
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
let passiveState = createCombatTestState();
passiveState.party = [];
addCharacter(passiveState, "cheng-xiao");
addCharacter(passiveState, "luo-gandao");
addCharacter(passiveState, "imhotep");
passiveState.party.find((member) => member.id === "cheng-xiao").hp = 20;
passiveState.party.find((member) => member.id === "luo-gandao").hp = 30;
passiveState.party.find((member) => member.id === "imhotep").hp = 60;
passiveState = core.chooseStoryOption(passiveState, "start");
assert(passiveState.maxEnergy === 5, "Support energy tiers and Luo Gandao's low-health passive should both affect turn energy.");
assert(passiveState.party.find((member) => member.id === "cheng-xiao").hp === 23, "Cheng Xiao should heal the lowest-health ally at turn start.");
assert(passiveState.party.find((member) => member.id === "imhotep").hp === 63, "Imhotep should regenerate at turn start.");
assert(core.getAliveActiveParty(passiveState).every((member) => member.block === 1), "Imhotep should grant one block to the active party.");

// New chain passives trigger on their intended card numbers.
let chainState = createCombatTestState();
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
let rivalState = createCombatTestState();
rivalState.party = [];
addCharacter(rivalState, "clone-chu-xuan");
addCharacter(rivalState, "clone-luo-gandao");
rivalState = core.chooseStoryOption(rivalState, "start");
assert(rivalState.maxEnergy === 4, "Clone Luo Gandao should grant two opening overdrive energy.");
assert(rivalState.hand.length === 7, "Clone Chu Xuan should draw two additional cards on the opening turn.");
assert(rivalState.party.find((member) => member.id === "clone-luo-gandao").stress === 32, "Opening overdrive should add eight stress to its pilot.");

let blackFlameState = createCombatTestState();
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

let rivalPassiveState = createCombatTestState();
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

let adamState = createCombatTestState();
adamState.party = [];
addCharacter(adamState, "adam");
adamState.party[0].hp = 40;
adamState = core.chooseStoryOption(adamState, "start");
adamState.energy = 99;
adamState.hand = Array.from({ length: 5 }, (_, index) => ({ uid: `adam-${index}`, cardId: "guard-stance", ownerId: null, upgraded: false }));
for (let index = 0; index < 5; index += 1) adamState = core.playCard(adamState, `adam-${index}`, adamState.activeEnemies[0].uid);
assert(adamState.party[0].hp === 43 && adamState.party[0].block === 35, "Adam's fifth-card aegis should heal and shield the party.");

// Deployed bonds create special win conditions, equipment scaling, and tactical openings.
let bondState = createCombatTestState();
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

let firearmBondState = createCombatTestState();
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

let tacticsBondState = createCombatTestState();
tacticsBondState.party = [];
["zheng-zha", "chu-xuan"].forEach((id) => addCharacter(tacticsBondState, id));
tacticsBondState = core.chooseStoryOption(tacticsBondState, "start");
tacticsBondState.energy = 0;
tacticsBondState.hand = [{ uid: "force-tactic", cardId: "team-tactics", ownerId: null, upgraded: false }];
assert(core.getCardCost(tacticsBondState, tacticsBondState.hand[0]) === 0, "Force and guile should discount the first tactic together with Chu Xuan.");
tacticsBondState = core.playCard(tacticsBondState, "force-tactic", tacticsBondState.activeEnemies[0].uid);
assert(tacticsBondState.energy === 1 && tacticsBondState.turnStats.firstBondTacticUsed, "Force and guile should refund energy on the first tactic.");

let expandedBondState = createCombatTestState();
expandedBondState.party = [];
["zheng-zha", "zero", "ba-wang"].forEach((id) => addCharacter(expandedBondState, id));
assert(core.getActiveBonds(expandedBondState).some((bond) => bond.id === "zhongzhou-frontline"), "The expanded Zhongzhou frontline bond should activate from its three members.");
expandedBondState = core.chooseStoryOption(expandedBondState, "start");

let crossWorldBondState = createCombatTestState();
crossWorldBondState.party = [];
["zheng-zha", "tanjiro-kamado", "steve-rogers"].forEach((id) => addCharacter(crossWorldBondState, id));
assert(core.getActiveBonds(crossWorldBondState).some((bond) => bond.id === "cross-blood-sun-frontline"), "The new explicit crossover bonds should activate from mixed-world parties.");
crossWorldBondState = core.chooseStoryOption(crossWorldBondState, "start");
assert(crossWorldBondState.hand.length >= 6 && crossWorldBondState.party.every((member) => member.block >= 2), "The blood-sun crossover bond should grant opening draw and turn-start armor.");
assert(expandedBondState.party.every((member) => member.block >= 5), "The Zhongzhou frontline bond should stack opening defense with Ba Wang's passive.");

let geniusBondState = createCombatTestState();
geniusBondState.party = [];
["chu-xuan", "adam"].forEach((id) => addCharacter(geniusBondState, id));
geniusBondState = core.chooseStoryOption(geniusBondState, "start");
geniusBondState.energy = 99;
geniusBondState.hand = [{ uid: "genius-tactic", cardId: "team-tactics", ownerId: null, upgraded: false }];
geniusBondState = core.playCard(geniusBondState, "genius-tactic", geniusBondState.activeEnemies[0].uid);
assert(geniusBondState.activeEnemies.every((enemy) => enemy.weak === 4) && geniusBondState.party.every((member) => member.stress >= core.charactersById[member.id].stress + 2), "Chu Xuan and Adam should trade tactical control for team stress.");

// The tutorial armory option should assign equipment to the custom protagonist.
let armoryTutorialState = createCreatedPlayerState();
armoryTutorialState = core.chooseStoryOption(armoryTutorialState, "start");
armoryTutorialState = winCombat(armoryTutorialState);
armoryTutorialState = core.chooseStoryOption(armoryTutorialState, "search");
armoryTutorialState = winCombat(armoryTutorialState);
armoryTutorialState = core.chooseStoryOption(armoryTutorialState, "armory");
const tutorialEagle = armoryTutorialState.equipmentInventory.find((entry) => entry.equipmentId === "infinite-desert-eagle");
assert(tutorialEagle && armoryTutorialState.playerGrowth.supportEquipmentIds.includes(tutorialEagle.instanceId), "The tutorial armory reward should equip the custom protagonist support slot.");

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
assert(state.party.some((member) => member.id === "player-avatar" && member.name === "測試者"), "The custom protagonist must remain after the tutorial.");
assert(!core.getActiveParty(state).some((member) => member.id === "player-avatar"), "The custom protagonist should remain as support after the tutorial.");
assert(state.campaign.unlockedScenarios.includes("alien"), "Alien should unlock after the tutorial.");
assert(core.scenariosById.alien.recruitmentPool.includes("zheng-zha"), "Zheng Zha should be available from later recruitment pools instead of starting in the party.");
const renamedState = core.renameTeam(state, "  輪迴小隊  ");
assert(renamedState.teamName === "輪迴小隊", "Team rename should trim and save a valid name after the tutorial.");
assert(core.renameTeam(renamedState, "   ").teamName === "輪迴小隊", "Blank team names should be rejected.");
const longNameState = core.renameTeam(renamedState, "超長輪迴者戰術實驗小隊名稱");
assert(longNameState.teamName.length <= 16, "Overlong team names should be truncated to the save limit.");
assert(core.normalizeState(JSON.parse(JSON.stringify(longNameState))).teamName === longNameState.teamName, "Team rename should persist after reload normalization.");
state = renamedState;

// Alien opening recruitment picks one and gives one bonus recruit.
state = core.beginScenario(state, "alien");
assert(state.screen === "recruit" && state.pending.candidates.length === 3, "Alien should open with three recruitment candidates.");
const selectedRecruit = state.pending.candidates[0];
state = core.chooseRecruit(state, selectedRecruit);
assert(state.screen === "scenario-intro" && state.party.length === 4, "First Alien recruitment should add three combat members plus the custom support member and show the scenario opening.");
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
assert(campaignRun.campaign.unlockedScenarios.includes("pacific-rim-breach"), "Jinyong completion should unlock the Pacific Rim breach battle.");
campaignRun = core.beginScenario(campaignRun, "pacific-rim-breach");
campaignRun = finishScenario(campaignRun);
assert(campaignRun.campaign.unlockedScenarios.includes("fury-road-war-rig"), "Pacific Rim completion should unlock the Fury Road war-rig chase.");
campaignRun = core.beginScenario(campaignRun, "fury-road-war-rig");
campaignRun = finishScenario(campaignRun);
assert(campaignRun.campaign.unlockedScenarios.includes("resident-evil-6-c-virus"), "Fury Road completion should unlock the Resident Evil 6 C-virus war scenario.");
campaignRun = core.beginScenario(campaignRun, "resident-evil-6-c-virus");
campaignRun = finishScenario(campaignRun);
assert(campaignRun.campaign.unlockedScenarios.includes("elden-ring-hell-run"), "Resident Evil 6 completion should unlock the Elden Ring hell scenario.");
campaignRun = core.beginScenario(campaignRun, "elden-ring-hell-run");
campaignRun = finishScenario(campaignRun);
assert(campaignRun.campaign.unlockedScenarios.includes("jujutsu-kaisen-shibuya"), "Elden Ring hell completion should unlock the Jujutsu Kaisen Shibuya scenario.");
campaignRun = core.beginScenario(campaignRun, "jujutsu-kaisen-shibuya");
campaignRun = finishScenario(campaignRun);
assert(campaignRun.campaign.unlockedScenarios.includes("fullmetal-alchemist-finale"), "Jujutsu Kaisen completion should unlock the Fullmetal Alchemist final battle scenario.");
campaignRun = core.beginScenario(campaignRun, "fullmetal-alchemist-finale");
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
  .filter((character) => !character.tutorialOnly && !character.playerOnly && !legendaryRecruitIds.has(character.id))
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
  "starship-troopers", "avp-pyramid", "nightmare-elm", "lotr-war", "rumbling-finale", "infinity-castle", "naruto-final-valley", "bleach-false-karakura", "gintama-yoshiwara", "gintama-final-war", "avengers-new-york", "batman-v-superman", "devil-may-cry-5", "final-destination", "jinyong-heroic-peak", "pacific-rim-breach", "fury-road-war-rig", "resident-evil-6-c-virus", "elden-ring-hell-run", "jujutsu-kaisen-shibuya", "fullmetal-alchemist-finale"
].includes(campaignRun.run.scenarioId), "Infinite mode should rotate through all completed scenarios.");

let randomScenarioState = createCompletedTutorialState();
fillOwnedRoster(randomScenarioState);
randomScenarioState.campaign.unlockedScenarios = data.scenarios.map((scenario) => scenario.id).filter((id) => id !== "tutorial");
randomScenarioState.campaign.dynamicDifficulty.randomHistory = ["alien", "juon"];
const randomPool = core.randomNormalScenarioPool(randomScenarioState);
assert(randomPool.length > 2 && randomPool.every((scenario) => scenario.id !== "elden-ring-hell-run" && scenario.id !== "tutorial" && !core.isSuperHardScenario(scenario)), "Random normal pool should exclude tutorial, infinite, and super-hard scenarios.");
randomScenarioState = core.beginScenario(randomScenarioState, "random-normal");
if (randomScenarioState.screen === "recruit") randomScenarioState = core.chooseRecruit(randomScenarioState, randomScenarioState.pending.candidates[0]);
assert(randomScenarioState.run && randomScenarioState.run.scenarioId !== "alien" && randomScenarioState.run.scenarioId !== "juon", "Random normal launch should avoid the last two scenarios when the pool is large enough.");
assert(randomScenarioState.run.dynamicDifficulty.mode === "normal" && randomScenarioState.run.openingDiscussion.length >= 4 && randomScenarioState.run.banterFeed.length >= 3, "Random normal launch should attach dynamic difficulty and opening discussion data.");

let dynamicState = createCompletedTutorialState();
fillOwnedRoster(dynamicState);
dynamicState.campaign.unlockedScenarios = ["alien", "juon", "mummy-curse"];
dynamicState.campaign.completedScenarios = ["alien", "juon", "mummy-curse", "jurassic-island", "abyssal-ark", "evernight-castle", "demon-frontier", "main-god-trial"];
dynamicState.campaign.dynamicDifficulty.successStreak = 2;
dynamicState = core.beginScenario(dynamicState, "alien");
const raisedMultiplier = dynamicState.run.dynamicDifficulty.multiplier;
assert(raisedMultiplier > 1, "Dynamic difficulty should rise with normal clears and success streaks.");
dynamicState = core.continueScenarioIntro(dynamicState);
const firstDynamicNode = dynamicState.run.map.layers[0][0];
const dynamicEncounterId = firstDynamicNode.encounterId;
dynamicState = core.chooseMapNode(dynamicState, firstDynamicNode.id);
const scaledEnemy = dynamicState.activeEnemies[0];
const baseEnemy = core.enemiesById[scaledEnemy.enemyId];
const baseIntent = baseEnemy.intents[0];
const scaledIntent = core.getEnemyIntent(scaledEnemy);
assert(scaledEnemy.maxHp > baseEnemy.maxHp, "Dynamic difficulty should scale enemy HP on combat start.");
assert(["attack", "cleave", "stress"].includes(baseIntent.kind) && scaledIntent.amount > baseIntent.amount, "Dynamic difficulty should scale visible enemy attack or stress intent values.");
assert(dynamicState.run.banterFeed.some((line) => line.line.includes("接觸")), "Combat start should add a short battle comm to the run feed.");
dynamicState.screen = "defeat";
dynamicState = core.returnAfterDefeat(dynamicState);
assert(dynamicState.campaign.dynamicDifficulty.failureRelief === 1 && dynamicState.campaign.dynamicDifficulty.successStreak === 0, "Defeat should add one relief stack and reset success streak.");
dynamicState = core.beginScenario(dynamicState, "alien");
assert(dynamicState.run.dynamicDifficulty.multiplier < raisedMultiplier, "Failure relief should slightly lower the next normal scenario multiplier.");
assert(dynamicEncounterId, "Dynamic test should start from a concrete encounter.");

// New scenarios have complete encounter sets and unique scenario-event powers.
for (const scenarioId of [
  "mummy-curse", "jurassic-island", "abyssal-ark", "evernight-castle", "demon-frontier", "main-god-trial",
  "starship-troopers", "avp-pyramid", "nightmare-elm", "lotr-war", "rumbling-finale", "infinity-castle",
  "naruto-final-valley", "bleach-false-karakura", "gintama-yoshiwara", "gintama-final-war", "avengers-new-york", "batman-v-superman", "devil-may-cry-5", "final-destination", "jinyong-heroic-peak", "pacific-rim-breach", "fury-road-war-rig", "resident-evil-6-c-virus", "elden-ring-hell-run", "jujutsu-kaisen-shibuya", "fullmetal-alchemist-finale"
]) {
  const scenario = core.scenariosById[scenarioId];
  assert(scenario.normal.length >= 2 && scenario.elite.length >= 1 && scenario.miniboss && scenario.boss, `${scenarioId} should have a full encounter set.`);
  assert(scenario.scenarioPower && scenario.eventTitle && scenario.eventText, `${scenarioId} should have its own event and temporary power.`);
  assert(scenario.recruitmentPool.length >= 10, `${scenarioId} should recruit at least ten rival-faction characters.`);
}
for (const scenario of data.scenarios.filter((item) => item.id !== "tutorial")) {
  let mapState = structuredClone(campaignRun);
  mapState.screen = "hub";
  mapState.party = data.characters
    .filter((character) => !character.tutorialOnly && !character.playerOnly && !data.legendaryRecruitmentPool.includes(character.id))
    .map((character, index) => {
      const base = structuredClone(core.charactersById[character.id]);
      return { ...base, hp: base.maxHp, block: 0, active: index < 3 };
    });
  mapState = core.beginScenario(mapState, scenario.id);
  if (mapState.screen === "scenario-intro") mapState = core.continueScenarioIntro(mapState);
  assert(mapState.run.map.layers.flat().some((node) => node.type === "event"), `${scenario.id} should always include at least one scenario event node.`);
}
const eldenRingScenario = core.scenariosById["elden-ring-hell-run"];
assert(eldenRingScenario.hellBossPool.length === 10, "Elden Ring hell mode should define ten random boss challenge encounters.");
let eldenRingMapState = structuredClone(campaignRun);
eldenRingMapState.screen = "hub";
eldenRingMapState.party = data.characters
  .filter((character) => !character.tutorialOnly && !character.playerOnly && !data.legendaryRecruitmentPool.includes(character.id))
  .map((character, index) => {
    const base = structuredClone(core.charactersById[character.id]);
    return { ...base, hp: base.maxHp, block: 0, active: index < 3 };
  });
eldenRingMapState = core.beginScenario(eldenRingMapState, "elden-ring-hell-run");
const eldenRingLaunched = eldenRingMapState.screen === "scenario-intro" ? core.continueScenarioIntro(eldenRingMapState) : eldenRingMapState;
const eldenRingCombatNodes = eldenRingLaunched.run.map.layers.flat().filter((node) => ["battle", "elite", "miniboss", "boss"].includes(node.type));
assert(eldenRingCombatNodes.every((node) => eldenRingScenario.hellBossPool.includes(node.encounterId)), "Elden Ring hell combat nodes should all be drawn from the ten-boss challenge pool.");
let eventState = structuredClone(campaignRun);
eventState.screen = "event";
eventState.run.temporaryPowers = [];
eventState.run.currentNodeId = eventState.run.map.layers[0][0].id;

function createEventReadyHubState() {
  const next = structuredClone(campaignRun);
  next.screen = "hub";
  next.pending = null;
  next.campaign.tutorialComplete = true;
  next.campaign.unlockedScenarios = data.scenarios.map((scenario) => scenario.id).filter((id) => id !== "tutorial");
  next.party = data.characters
    .filter((character) => !character.tutorialOnly && !character.playerOnly && !character.hidden && !data.legendaryRecruitmentPool.includes(character.id))
    .map((character, index) => {
      const base = structuredClone(core.charactersById[character.id]);
      return { ...base, hp: base.maxHp, block: 0, active: index < 3 };
    });
  return next;
}

function launchEventForScenario(scenarioId) {
  let next = createEventReadyHubState();
  next = core.beginScenario(next, scenarioId);
  if (next.screen === "recruit") next = core.chooseRecruit(next, next.pending.candidates[0]);
  if (next.screen === "scenario-intro") next = core.continueScenarioIntro(next);
  const eventNode = next.run.map.layers.flat().find((node) => node.type === "event");
  assert(eventNode, `${scenarioId} should expose an event node.`);
  next.run.currentLayer = eventNode.layer - 1;
  next.run.currentLane = eventNode.lane;
  next = core.chooseMapNode(next, eventNode.id);
  assert(next.screen === "event" && next.pending.choices.length >= 4 && next.pending.choices.length <= 5, `${scenarioId} event stage one should expose four to five choices.`);
  assert(next.run.banterFeed.some((line) => line.line.includes("奇遇節點")), `${scenarioId} event node should add a short party comm.`);
  return next;
}

function chooseRouteStep(state, routeId, message) {
  const choice = state.pending.choices.find((item) => item.routeId === routeId) || state.pending.choices[0];
  assert(choice, message);
  return core.resolveEvent(state, choice.id);
}

function resolveScenarioThemeEvent(scenarioId) {
  let next = launchEventForScenario(scenarioId);
  const stage1 = next.pending.choices.find((choice) => choice.id === `${scenarioId}-theme-entry`);
  assert(stage1, `${scenarioId} should expose its scenario-specific event route.`);
  next = core.resolveEvent(next, stage1.id);
  assert(next.screen === "event" && next.pending.stage === 2 && next.pending.choices.length >= 4 && next.pending.choices.length <= 5, "Event stage two should expose four to five choices.");
  next = chooseRouteStep(next, stage1.routeId, `${scenarioId} should keep the scenario route available at stage two.`);
  assert(next.screen === "event" && next.pending.stage === 3 && next.pending.choices.length >= 4 && next.pending.choices.length <= 5, "Event stage three should expose four to five choices.");
  next = chooseRouteStep(next, stage1.routeId, `${scenarioId} should keep the scenario route available at stage three.`);
  assert(next.screen === "event-result" && next.pending.result, `${scenarioId} event should pause on a visible result screen.`);
  assert(next.pending.result.rewards.length && next.pending.result.costs.length && next.pending.result.storyImpact, `${scenarioId} result should explain rewards, costs, and story impact.`);
  return next;
}

const scenarioPowerExpectations = [
  ["mummy-curse", "book-of-amun-ra"],
  ["jurassic-island", "electric-fence"],
  ["abyssal-ark", "pressure-suit"],
  ["evernight-castle", "silvered-weapons"],
  ["demon-frontier", "black-flame-overclock"],
  ["main-god-trial", "main-god-calibration"],
  ["rumbling-finale", "thunder-spear-route"],
  ["infinity-castle", "nichirin-counteroffensive"],
  ["avengers-new-york", "avengers-assemble-protocol"],
  ["batman-v-superman", "justice-dawn-truce"],
  ["final-destination", "premonition-loop"],
  ["jinyong-heroic-peak", "wulin-manual-focus"],
  ["pacific-rim-breach", "jaeger-drift-sync"],
  ["fury-road-war-rig", "war-rig-breakthrough"],
  ["resident-evil-6-c-virus", "c-virus-antibody-window"],
  ["elden-ring-hell-run", "great-rune-overload"],
  ["fullmetal-alchemist-finale", "reverse-nationwide-circle"]
];
for (const [scenarioId, powerId] of scenarioPowerExpectations) {
  const resolved = resolveScenarioThemeEvent(scenarioId);
  assert(resolved.run.temporaryPowers.some((power) => power.id === powerId), `${scenarioId} event should grant its scenario power through a three-layer path.`);
  const afterResult = core.continueEventResult(resolved);
  assert(afterResult.screen === "map", `${scenarioId} event result should return to the map after confirmation.`);
}
assert(data.eventBranchPool.length >= 12, "Scenario events should expose a large branch pool.");
assert(core.eventBranchPoolCount >= 12, "Core should publish the expanded branch pool count.");
assert(data.eventBranchPool.every((route) => route.outcome?.rewards?.length && route.outcome?.costs?.length && route.outcome?.storyImpact), "Every branch-pool outcome should declare rewards, costs, and story impact.");
assert(data.scenarios.filter((scenario) => scenario.id !== "tutorial").every((scenario) => data.scenarioEventRoutes[scenario.id]?.some((route) => route.priority === "fixed")), "Every formal scenario should define a fixed good event route.");

let fixedRouteEvent = launchEventForScenario("mummy-curse");
const fixedRouteChoice = fixedRouteEvent.pending.choices.find((choice) => choice.fixedRoute);
assert(fixedRouteChoice, "Every event should surface the fixed good route in stage one.");
fixedRouteEvent = core.resolveEvent(fixedRouteEvent, fixedRouteChoice.id);
fixedRouteEvent = chooseRouteStep(fixedRouteEvent, fixedRouteChoice.routeId, "Fixed route should remain available in stage two.");
fixedRouteEvent = chooseRouteStep(fixedRouteEvent, fixedRouteChoice.routeId, "Fixed route should remain available in stage three.");
assert(fixedRouteEvent.screen === "event-result" && fixedRouteEvent.pending.result.rewards.some((item) => item.includes("劇本 Buff") || item.includes("加入") || item.includes("支線劇情")), "Fixed good route should produce explicit rewards.");
assert(fixedRouteEvent.pending.result.storyImpact.includes("改寫") || fixedRouteEvent.pending.result.storyImpact.includes("避開"), "Fixed good route should explain the story improvement.");

let prisonRealmEvent = launchEventForScenario("jujutsu-kaisen-shibuya");
prisonRealmEvent = core.resolveEvent(prisonRealmEvent, "jjk-prison-realm-sense");
assert(prisonRealmEvent.screen === "event" && prisonRealmEvent.pending.stage === 2 && prisonRealmEvent.pending.choices.length >= 4 && prisonRealmEvent.pending.choices.some((choice) => choice.id === "jjk-back-gate-resonance"), "The Jujutsu event should expose Prison Realm-specific stage two choices.");
prisonRealmEvent = core.resolveEvent(prisonRealmEvent, "jjk-back-gate-resonance");
assert(prisonRealmEvent.screen === "event" && prisonRealmEvent.pending.stage === 3 && prisonRealmEvent.pending.choices.length >= 4 && prisonRealmEvent.pending.choices.some((choice) => choice.id === "jjk-break-prison-realm"), "The Jujutsu event should expose the break-Prison-Realm final choice.");
prisonRealmEvent = core.resolveEvent(prisonRealmEvent, "jjk-break-prison-realm");
assert(prisonRealmEvent.screen === "event-result", "Breaking the Prison Realm should show a result screen before returning to the map.");
assert(prisonRealmEvent.party.some((member) => member.id === "satoru-gojo"), "Breaking the Prison Realm should recruit hidden Gojo.");
assert(prisonRealmEvent.run.temporaryPowers.some((power) => power.id === "prison-realm-break"), "Breaking the Prison Realm should grant a dedicated temporary power.");
assert(prisonRealmEvent.pending.result.rewards.length && prisonRealmEvent.pending.result.costs.length && prisonRealmEvent.pending.result.storyImpact, "The Prison Realm result should clearly show rewards, costs, and story impact.");

let alchemyFinaleEvent = launchEventForScenario("fullmetal-alchemist-finale");
alchemyFinaleEvent = core.resolveEvent(alchemyFinaleEvent, "fma-counter-circle-entry");
assert(alchemyFinaleEvent.screen === "event" && alchemyFinaleEvent.pending.stage === 2 && alchemyFinaleEvent.pending.choices.some((choice) => choice.id === "fma-hohenheim-soul-grid"), "The Fullmetal Alchemist event should expose the counter-circle stage two route.");
alchemyFinaleEvent = core.resolveEvent(alchemyFinaleEvent, "fma-hohenheim-soul-grid");
assert(alchemyFinaleEvent.screen === "event" && alchemyFinaleEvent.pending.stage === 3 && alchemyFinaleEvent.pending.choices.some((choice) => choice.id === "fma-return-alphonse-body"), "The Fullmetal Alchemist event should expose the final equivalent-exchange choice.");
alchemyFinaleEvent = core.resolveEvent(alchemyFinaleEvent, "fma-return-alphonse-body");
assert(alchemyFinaleEvent.screen === "event-result", "Returning Alphonse's body should show a result screen before returning to the map.");
assert(alchemyFinaleEvent.party.some((member) => member.id === "edward-elric"), "Returning Alphonse's body should recruit hidden Edward.");
assert(alchemyFinaleEvent.run.temporaryPowers.some((power) => power.id === "equivalent-exchange-route"), "Returning Alphonse's body should grant a dedicated temporary power.");
assert(alchemyFinaleEvent.pending.result.rewards.length && alchemyFinaleEvent.pending.result.costs.length && alchemyFinaleEvent.pending.result.storyImpact.includes("阿爾"), "The Fullmetal Alchemist result should clearly show rewards, costs, and story impact.");
assert(core.eventOutcomeCount >= 27, "Scenario events should preserve at least the original twenty-seven generic endings.");
assert(data.scenarios.filter((scenario) => scenario.id !== "tutorial").every((scenario) => scenario.hiddenProtagonistId), "Every formal scenario should declare one hidden protagonist.");

// Multi-enemy combat, target selection, and upgraded card instances.
const firstNode = state.run.map.layers[0][0];
state = core.chooseMapNode(state, firstNode.id);
assert(state.screen === "combat" && state.activeEnemies.length >= 2, "Normal combat should support multiple enemies.");
const secondEnemy = state.activeEnemies[1];
state = core.selectTarget(state, secondEnemy.uid);
const knife = findCombatCardWhere(state, (card) => card.damage && !card.damageAll, "Missing single-target attack for target-selection test.");
const firstEnemyHp = state.activeEnemies[0].hp;
const targetHp = state.activeEnemies[1].hp;
state = core.playCard(state, knife.uid, secondEnemy.uid);
assert(state.activeEnemies[0].hp === firstEnemyHp && state.activeEnemies[1].hp < targetHp, "Single-target attacks must hit the selected enemy.");

// Downed party members stop contributing energy and lose their signature next turn.
const downed = core.getActiveParty(state)[1];
downed.hp = 0;
state = core.endPlayerTurn(state);
assert(state.maxEnergy === core.calculateEnergy(state) && !core.getAliveActiveParty(state).some((member) => member.id === downed.id), "Downed members must stop contributing energy.");
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
const equipmentHolderId = core.getActiveParty(state)[0]?.id || state.party.find((member) => member.id !== "player-avatar").id;
state = core.equipItem(state, equipmentHolderId, "test-equip");
assert(state.equipped[equipmentHolderId] === "test-equip", "Equipment should bind to a character.");
assert(!state.deck.some((entry) => entry.cardId === "gauss-pistol"), "Equipment must not enter the draw deck.");
state.equipmentInventory.push({ instanceId: "support-battery", equipmentId: "tactical-battery", upgraded: false, acquiredRunId: null });
state.equipmentInventory.push({ instanceId: "support-gauss", equipmentId: "gauss-pistol", upgraded: false, acquiredRunId: null });
state = core.setCustomSupportEquipment(state, 0, "support-battery");
state = core.setCustomSupportEquipment(state, 1, "support-gauss");
assert(state.playerGrowth.supportEquipmentIds.join(",") === "support-battery,support-gauss", "The custom protagonist should support exactly two equipment slots.");
const supportEnergyBefore = core.calculateEnergy(state);
state.screen = "story";
state.pending = { kind: "tutorial-choice-1" };
state.run = { id: "support-run", scenarioId: "tutorial", sourceScenarioId: "tutorial", acquiredDeckIds: [], acquiredEquipmentIds: [], temporaryPowers: [] };
state = core.chooseStoryOption(state, "rush");
assert(state.maxEnergy === supportEnergyBefore + 1, "Support equipment should contribute opening combat energy.");
state.screen = "hub";
state.run = null;
state = core.equipItem(state, equipmentHolderId, "support-battery");
assert(state.equipped[equipmentHolderId] === "support-battery" && !state.playerGrowth.supportEquipmentIds.includes("support-battery"), "Assigning support equipment to a combat member should remove it from seventh-support slots.");

// Main God deck trimming removes normal cards with reward points but leaves curses to curse removal.
while (state.deck.filter((entry) => core.cardsById[entry.cardId].category !== "curse").length <= data.economy.minimumDeckSize) {
  core.grantOrUpgradeCard(state, "combat-knife", null);
}
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

// Unique card ownership: only starter cards repeat; other cards upgrade instead of duplicating.
let uniqueCardState = core.createInitialState();
uniqueCardState.screen = "hub";
uniqueCardState.pending = null;
uniqueCardState.rewardPoints = 2000;
uniqueCardState.sideStories = 0;
uniqueCardState = core.buyShopItem(uniqueCardState, "shop-field-medicine");
const fieldMedicineCountAfterBuy = uniqueCardState.deck.filter((entry) => entry.cardId === "field-medicine").length;
uniqueCardState = core.buyShopItem(uniqueCardState, "shop-field-medicine");
const fieldMedicineEntries = uniqueCardState.deck.filter((entry) => entry.cardId === "field-medicine");
assert(fieldMedicineCountAfterBuy === 1 && fieldMedicineEntries.length === 1 && fieldMedicineEntries[0].upgraded, "Buying an owned unique card should upgrade it instead of adding a duplicate.");
const pointsBeforeMaxedBuy = uniqueCardState.rewardPoints;
uniqueCardState = core.buyShopItem(uniqueCardState, "shop-field-medicine");
assert(uniqueCardState.deck.filter((entry) => entry.cardId === "field-medicine").length === 1 && uniqueCardState.rewardPoints === pointsBeforeMaxedBuy, "A maxed unique card should not be purchasable again.");
const starterRepeatState = core.createInitialState();
const starterCount = starterRepeatState.deck.filter((entry) => entry.cardId === "combat-knife").length;
core.grantOrUpgradeCard(starterRepeatState, "combat-knife", null);
assert(starterRepeatState.deck.filter((entry) => entry.cardId === "combat-knife").length === starterCount + 1, "Starter cards should remain repeatable.");
const duplicateSave = core.createInitialState();
duplicateSave.deck.push(
  { instanceId: "dupe-field-a", cardId: "field-medicine", upgraded: false, acquiredRunId: null },
  { instanceId: "dupe-field-b", cardId: "field-medicine", upgraded: false, acquiredRunId: null }
);
const normalizedDuplicateSave = core.normalizeState({ ...duplicateSave, version: 3 });
const normalizedFieldMedicines = normalizedDuplicateSave.deck.filter((entry) => entry.cardId === "field-medicine");
assert(normalizedFieldMedicines.length === 1 && normalizedFieldMedicines[0].upgraded, "Save normalization should collapse old unique duplicates into one upgraded card.");
const normalRewards = core.chooseCardRewards(core.createInitialState(), 20, "battle");
assert(normalRewards.every((card) => ["common", "uncommon"].includes(card.rarity)), "Normal combat rewards should only offer R/SR cards.");
const eliteRewards = core.chooseCardRewards(core.createInitialState(), 20, "elite");
assert(eliteRewards.some((card) => card.rarity === "rare") && eliteRewards.every((card) => ["common", "uncommon", "rare"].includes(card.rarity)), "Elite and miniboss rewards should be able to offer SSR cards.");
const bossRewards = core.chooseBossRewards(core.createInitialState());
const bossCard = bossRewards.find((reward) => reward.kind === "card");
const bossEquipment = bossRewards.find((reward) => reward.kind === "equipment");
assert(core.cardsById[bossCard.itemId].rarity === "rare", "Boss rewards should include a high-rarity card.");
assert(core.equipmentById[bossEquipment.itemId].rarity === "legendary", "Boss equipment rewards should prioritize legendary equipment.");

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
const uiState = createCompletedTutorialState();
uiState.screen = "hub";
uiState.pending = null;
uiState.campaign.tutorialComplete = true;
uiState.hubTab = "roster";
uiState.party = [{ ...uiState.party[0], active: true }];
["zhan-lan", "zero", "zhang-heng", "ming-yanwei", "cheng-xiao", "wang-xia", "luo-gandao", "liu-yu", "lin-juntian", "imhotep", "clone-zheng-zha", "adam", "gangnir", "shiva-gangtian", "richard", "amon", "sarah", "tanjiro-kamado", "giyu-tomioka", "naruto-uzumaki", "luffy-nika", "son-goku", "xiao-yan", "ichigo-kurosaki", "edward-elric", "eren-yeager", "mikasa-ackerman", "armin-arlert", "levi-ackerman", "gon-freecss", "kirito-kazuto", "leon-kennedy", "helena-harper", "chris-redfield", "piers-nivans", "jake-muller", "sherry-birkin", "ada-wong", "bsaa-agent", "tarnished-elden-lord", "melina-kindling-maiden", "ranni-dark-moon", "blaidd-half-wolf", "millicent-valkyrie", "alexander-warrior-jar", "black-knife-tiche", "nepheli-loux"].forEach((id) => addCharacter(uiState, id, false));
globalThis.localStorage = { getItem: () => JSON.stringify(uiState), setItem: () => undefined };
globalThis.document = {
  querySelector: () => ({
    get innerHTML() { return renderedHtml; },
    set innerHTML(value) { renderedHtml = value; },
    querySelectorAll: () => []
  })
};
await import("../src/game-ui.js");
assert(["出戰部署", "角色整備", "自創強化", "強化商店"].every((label) => renderedHtml.includes(label)), "The hub should render all separated tabs.");
assert(renderedHtml.includes("張恆") && renderedHtml.includes("伊莫頓") && renderedHtml.includes("濕婆·甘天") && renderedHtml.includes("灶門炭治郎") && renderedHtml.includes("米卡莎") && renderedHtml.includes("富岡義勇") && renderedHtml.includes("里昂·S·甘迺迪") && renderedHtml.includes("艾達·王") && renderedHtml.includes("褪色者") && renderedHtml.includes("菈妮"), "The roster preparation tab should render the expanded roster.");
assert(["惡魔隊", "天神隊", "北冰洲隊", "印洲隊", "西海隊", "森洲隊", "傳說主角", "生化危機6", "艾爾登法環"].every((label) => renderedHtml.includes(label)), "Rival, legendary, and game crossover characters should display their faction labels.");
assert(renderedHtml.includes("roster-source-grid") && renderedHtml.includes("roster-source-section") && renderedHtml.includes("roster-source-hero") && renderedHtml.includes("roster-character-grid"), "Roster preparation should render source hero sections and a three-column character grid.");
assert(renderedHtml.includes("roster-hero-main.png") && renderedHtml.includes("roster-hero-demon-slayer.png") && renderedHtml.includes("roster-hero-attack-on-titan.png") && renderedHtml.includes("roster-hero-re6.png") && renderedHtml.includes("roster-hero-elden-ring.png"), "Roster preparation should use IMAGE2 hero shots for team and source categories.");
assert(renderedHtml.includes("effect-matrix") && renderedHtml.includes("效果矩陣") && renderedHtml.includes("裝備持有人") && renderedHtml.includes("羈絆 chips"), "The hub should render the tactical effect matrix.");
assert(renderedHtml.includes("modifier-chip-row") && renderedHtml.includes("專屬牌") && renderedHtml.includes("未裝備"), "Roster cards should render readable modifier chips and loadout state.");
assert(renderedHtml.includes("signature-preview") && renderedHtml.includes("專屬卡片") && renderedHtml.includes("精神鏈接") && renderedHtml.includes("全隊獲得 3 護甲"), "Roster cards should preview signature card effects and upgrade state.");
assert(["火影忍者", "海賊王", "龍珠", "鬥破蒼穹", "死神", "鋼之鍊金術師", "獵人", "刀劍神域"].every((label) => renderedHtml.includes(label)), "Legendary protagonists should render under split original-source categories.");
assert(renderedHtml.includes('class="energy-badge">+3') && renderedHtml.includes('class="energy-badge">0') && renderedHtml.includes('class="energy-badge">-1') && !renderedHtml.includes("+-1"), "Roster UI should format positive, zero, and negative energy correctly.");
assert(["生命 +8", "專屬牌+", "血統解放"].every((label) => renderedHtml.includes(label)), "Roster source sections should keep character upgrade actions.");
assert(core.setHubTab(uiState, "shop").hubTab === "shop", "Hub tabs should persist through core state.");
assert(core.setHubTab(uiState, "growth").hubTab === "growth", "The custom growth tab should persist through core state.");
uiState.hubTab = "deployment";
uiState.campaign.unlockedScenarios = data.scenarios.map((scenario) => scenario.id).filter((id) => id !== "tutorial");
renderedHtml = "";
await import("../src/game-ui.js?deployment-random");
assert(renderedHtml.includes("下一場隨機劇本") && renderedHtml.includes("抽選池") && renderedHtml.includes("預估") && renderedHtml.includes("超困難劇本") && renderedHtml.includes("艾爾登法環"), "Deployment should replace normal scenario picking with a random normal entry while keeping super-hard scenarios visible.");
uiState.hubTab = "growth";
uiState.rewardPoints = 20000;
uiState.playerGrowth.tagOffers = ["vampire-seed", "vampire-count", "t-virus-adaptation", "spider-sense", "inner-qi-breath", "black-flame-seed"];
uiState.playerGrowth.purchasedTags = ["vampire-seed", "t-virus-adaptation"];
uiState.playerGrowth.mutations = ["blood-virus-core"];
uiState.playerGrowth.activeTagIds = ["vampire-seed", "t-virus-adaptation"];
uiState.playerGrowth.activeMutationId = "blood-virus-core";
uiState.playerGrowth.art = core.customMutationsById["blood-virus-core"].art;
uiState.equipmentInventory.push({ instanceId: "ui-support-battery", equipmentId: "tactical-battery", upgraded: false, acquiredRunId: null });
uiState.playerGrowth.supportEquipmentIds = ["ui-support-battery"];
renderedHtml = "";
await import("../src/game-ui.js?custom-growth");
assert(renderedHtml.includes("第 7 人支援") && renderedHtml.includes("血統與裝備槽") && renderedHtml.includes("逆種血核") && renderedHtml.includes("支援裝備 1"), "The custom growth tab should render seventh-support loadout controls.");
assert(["變異血統", "一般血統 1", "一般血統 2", "支援裝備 1", "支援裝備 2"].every((label) => renderedHtml.includes(label)), "The seventh-support controls should preserve 1 mutation, 2 normal bloodlines, and 2 support equipment slots.");
assert(renderedHtml.includes("支援槽 1") && renderedHtml.includes("戰術能量電池") && renderedHtml.includes("第 7 人支援"), "The growth effect matrix should surface active support equipment and custom support effects.");
assert(renderedHtml.includes("RPG 六維") && renderedHtml.includes("主神候選池") && renderedHtml.includes("標籤矩陣") && renderedHtml.includes("初階血族") && renderedHtml.includes("伯爵血核") && renderedHtml.includes("6600 點 / 1 支線"), "The custom growth tab should render stats, offers, tag matrix UI, and dual-resource costs.");
uiState.hubTab = "shop";
uiState.rewardPoints = 10000;
uiState.sideStories = 5;
uiState.deck.push({ uid: "ui-max-field-medicine", instanceId: "ui-max-field-medicine", cardId: "field-medicine", upgraded: true, acquiredRunId: null });
renderedHtml = "";
await import("../src/game-ui.js?shop-categories");
assert(["鬼滅之刃", "進擊的巨人", "Final Fantasy VII", "燕雲十六聲", "金庸武俠", "環太平洋", "瘋狂麥斯", "生化危機6", "艾爾登法環", "鋼之鍊金術師"].every((label) => renderedHtml.includes(label)), "The shop should render collapsed source categories for crossover cards.");
assert(renderedHtml.includes("shop-cover-grid") && renderedHtml.includes("shop-cover-section") && renderedHtml.includes("source-cover-art") && renderedHtml.includes("source-cover-re6.png") && renderedHtml.includes("source-cover-elden-ring.png") && renderedHtml.includes("source-cover-fullmetal-alchemist.png"), "The skill shop should render a source cover grid with IMAGE2 cover art.");
assert(renderedHtml.includes("card-frame") && renderedHtml.includes("rarity-ssr") && renderedHtml.includes("已擁有最高級技能"), "The skill shop should render rarity frames and max-owned card state.");
assert(renderedHtml.includes("霹靂一閃") && renderedHtml.includes("雷槍齊射") && renderedHtml.includes("降龍十八掌") && renderedHtml.includes("火箭肘擊") && renderedHtml.includes("戰爭車衝撞") && renderedHtml.includes("Wing Shooter連射") && renderedHtml.includes("抗病毒血清") && renderedHtml.includes("名刀月隱") && renderedHtml.includes("黃金樹立誓") && renderedHtml.includes("焰之鍊金術") && renderedHtml.includes("地刺鍊成"), "Collapsed shop cover sections should contain their card lists.");
assert(["動漫神器", "原作決戰武器", "小說神器", "武俠神兵", "環太平洋武裝", "狂怒公路武裝", "C病毒武裝", "交界地神兵", "鍊金術裝備"].every((label) => renderedHtml.includes(label)), "The shop should render collapsed source categories for artifact equipment.");
assert(renderedHtml.includes("equipment-source-section") && renderedHtml.includes("乖離劍 Ea") && renderedHtml.includes("立體機動裝置") && renderedHtml.includes("軒轅劍") && renderedHtml.includes("獵人機甲電漿炮") && renderedHtml.includes("戰爭車裝甲駕駛艙") && renderedHtml.includes("Hydra三管霰彈槍") && renderedHtml.includes("C病毒抗體血清") && renderedHtml.includes("屍山血海") && renderedHtml.includes("仿身淚滴骨灰") && renderedHtml.includes("愛德華的機械鎧右臂") && renderedHtml.includes("火布手套"), "Collapsed equipment sections should contain their artifact lists.");

const combatUiState = createCombatTestState({ professionId: "systems-engineer" });
addCharacter(combatUiState, "zheng-zha", true);
combatUiState.screen = "combat";
combatUiState.pending = null;
combatUiState.run = {
  id: "ui-run",
  scenarioId: "tutorial",
  sourceScenarioId: "tutorial",
  acquiredDeckIds: [],
  acquiredEquipmentIds: [],
  temporaryPowers: [],
  dynamicDifficulty: { mode: "normal", multiplier: 1.15, hpMultiplier: 1.15, intentMultiplier: 1.075, progressPressure: 0.1, streakPressure: 0.05, relief: 0, label: "動態 1.15x" },
  banterFeed: [{ speaker: "楚軒", line: "目標已鎖定，先確認意圖再出牌。" }]
};
combatUiState.activeEncounterId = "bio-lab";
combatUiState.activeEnemies = [makeActiveEnemy(core.encountersById["bio-lab"].enemies[0])];
combatUiState.selectedTargetId = combatUiState.activeEnemies[0].uid;
combatUiState.hand = [
  { uid: "ui-focus-fire", instanceId: "ui-focus-fire", cardId: "focus-fire", upgraded: false, acquiredRunId: null },
  { uid: "ui-blood-awakening", instanceId: "ui-blood-awakening", cardId: "blood-awakening", ownerId: "zheng-zha", upgraded: false, acquiredRunId: null }
];
combatUiState.drawPile = [];
combatUiState.discardPile = [];
combatUiState.exhaustedPile = [];
combatUiState.energy = 0;
combatUiState.maxEnergy = 3;
combatUiState.turn = 2;
combatUiState.permanentUpgrades.bloodlines.push("zheng-zha");
combatUiState.equipmentInventory.push({ instanceId: "ui-gauss", equipmentId: "gauss-pistol", upgraded: false, acquiredRunId: null });
combatUiState.equipmentInventory.push({ instanceId: "ui-combat-support-battery", equipmentId: "tactical-battery", upgraded: false, acquiredRunId: null });
combatUiState.equipped["zheng-zha"] = "ui-gauss";
combatUiState.playerGrowth.purchasedTags = ["vampire-seed", "t-virus-adaptation"];
combatUiState.playerGrowth.mutations = ["blood-virus-core"];
combatUiState.playerGrowth.activeTagIds = ["vampire-seed", "t-virus-adaptation"];
combatUiState.playerGrowth.activeMutationId = "blood-virus-core";
combatUiState.playerGrowth.supportEquipmentIds = ["ui-combat-support-battery"];
globalThis.localStorage = { getItem: () => JSON.stringify(combatUiState), setItem: () => undefined };
renderedHtml = "";
await import("../src/game-ui.js?combat-frame");
assert(renderedHtml.includes("hand-zone") && renderedHtml.includes("card-frame") && renderedHtml.includes("rarity-sr"), "Combat hand cards should output the shared rarity frame class.");
assert(renderedHtml.includes("combat-status-bar") && renderedHtml.includes("combat-intent-strip") && renderedHtml.includes("抽牌") && renderedHtml.includes("耗盡"), "Combat should render a tactical status bar with energy and pile summaries.");
assert(renderedHtml.includes("target-lock") && renderedHtml.includes("目標鎖定") && renderedHtml.includes("intent-chip") && renderedHtml.includes("selected"), "Combat should surface the selected enemy and intent summary.");
assert(renderedHtml.includes("modifier-chip-row") && renderedHtml.includes("血統") && renderedHtml.includes("裝備") && renderedHtml.includes("自創支援") && renderedHtml.includes("能量不足：需要"), "Combat cards should render modifier chips and disabled reasons.");
assert(renderedHtml.includes("command-rail") && renderedHtml.includes("指揮短欄") && renderedHtml.includes("選中敵人") && renderedHtml.includes("戰場通訊") && renderedHtml.includes("完整戰鬥資料"), "Combat should render a compact command rail with selected target and latest comms before the collapsible details.");
assert(renderedHtml.includes("戰鬥加成來源") && renderedHtml.includes("高斯手槍") && renderedHtml.includes("戰術能量電池"), "Combat should keep loadout and seventh-support rows inside the collapsible effect matrix.");

const rewardUiState = core.createInitialState();
rewardUiState.screen = "reward";
rewardUiState.pending = { kind: "combat-reward" };
rewardUiState.rewardChoices = [core.cardsById["field-medicine"], core.cardsById["water-breathing-dead-calm"]];
core.grantOrUpgradeCard(rewardUiState, "field-medicine", null);
globalThis.localStorage = { getItem: () => JSON.stringify(rewardUiState), setItem: () => undefined };
renderedHtml = "";
await import("../src/game-ui.js?reward-frame");
assert(renderedHtml.includes("reward-card") && renderedHtml.includes("card-frame") && renderedHtml.includes("rarity-ssr") && renderedHtml.includes("選擇後強化+"), "Reward cards should output rarity frames and upgrade-owned state.");

let introUiState = core.createInitialState();
introUiState.screen = "hub";
introUiState.pending = null;
introUiState.campaign.tutorialComplete = true;
introUiState.campaign.unlockedScenarios = ["alien", "juon", "mummy-curse"];
introUiState.party = data.characters
  .filter((character) => !character.tutorialOnly && !character.playerOnly && !data.legendaryRecruitmentPool.includes(character.id))
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
assert(renderedHtml.includes("generated-discussion") && renderedHtml.includes("動態難度"), "The scenario opening should render generated party discussion and transparent dynamic difficulty.");

globalThis.localStorage = { getItem: () => JSON.stringify(prisonRealmEvent), setItem: () => undefined };
renderedHtml = "";
await import("../src/game-ui.js?event-result");
assert(renderedHtml.includes("奇遇結局") && renderedHtml.includes("獎勵") && renderedHtml.includes("代價") && renderedHtml.includes("劇情影響") && renderedHtml.includes("確認後果，返回路線圖"), "The event result screen should render rewards, costs, story impact, and a return action.");

console.log("Campaign, factions, rival mechanics, bloodlines, combat statuses, equipment, hub tabs, migration, and direct-HTML smoke tests passed.");
