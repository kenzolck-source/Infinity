import { readdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import "../src/game-data.js";

const data = globalThis.MainGodData;
const generatedDir = resolve("src/assets/generated");
const knownCardIds = new Set(data.cards.map((card) => card.id));

function titleFromId(id) {
  return id.split("-").map((part) => part ? part[0].toUpperCase() + part.slice(1) : part).join(" ");
}

const assets = [
  ...data.cards.map((card) => ({
    kind: "skill",
    id: card.id,
    fileName: `skill-${card.id}.png`,
    name: card.name,
    type: card.type,
    category: card.category,
    tags: card.tags || [],
    text: card.text,
    sourceName: card.sourceName || ""
  })),
  ...readdirSync(generatedDir)
    .filter((fileName) => fileName.startsWith("skill-") && fileName.endsWith(".png"))
    .map((fileName) => fileName.slice("skill-".length, -".png".length))
    .filter((id) => !knownCardIds.has(id))
    .sort()
    .map((id) => ({
      kind: "skill",
      id,
      fileName: `skill-${id}.png`,
      name: titleFromId(id),
      type: "tactic",
      category: "extra",
      tags: ["舊技能資產"],
      text: "既有技能素材，重製為專屬暗黑卡圖。",
      sourceName: ""
    })),
  ...data.equipment.map((item) => ({
    kind: "equipment",
    id: item.id,
    fileName: `equipment-${item.id}.png`,
    name: item.name,
    effect: item.effect,
    weaponClass: item.weaponClass || "",
    text: item.text,
    sourceName: item.sourceName || ""
  }))
];

const remaining = assets.filter((asset) => asset.id !== "combat-knife");
const batches = [];
for (let index = 0; index < remaining.length; index += 4) {
  batches.push({
    index: batches.length + 1,
    assets: remaining.slice(index, index + 4)
  });
}

writeFileSync(resolve("tmp/playtest/image2-all-assets.json"), JSON.stringify(assets, null, 2), "utf8");
writeFileSync(resolve("tmp/playtest/image2-batches.json"), JSON.stringify(batches, null, 2), "utf8");

console.log(JSON.stringify({
  totalAssets: assets.length,
  remaining: remaining.length,
  batches: batches.length,
  firstBatch: batches[0]
}, null, 2));
