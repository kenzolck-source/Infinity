import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import "../src/game-data.js";

const outPath = resolve(process.argv[2] || "tmp/playtest/asset-manifest.json");
mkdirSync(dirname(outPath), { recursive: true });

writeFileSync(
  outPath,
  JSON.stringify({
    cards: globalThis.MainGodData.cards,
    equipment: globalThis.MainGodData.equipment
  }, null, 2),
  "utf8"
);

console.log(outPath);
