# 新劇本創作記憶紀錄

這份文件是新增劇本時的專案內記憶。之後創作任何新劇本，先讀這份文件，再修改資料與資產。

## 核心原則

- 新劇本不能只新增入口卡。它必須是可玩的完整劇本包：角色、敵人、技能、裝備、羈絆、血統、奇遇、台詞、插畫都要一起補齊。
- 每個劇本都要把該作品的主角或核心人物放進隱藏奇遇線，透過好路線招募或轉成等價補償。
- 劇本內容要和現有角色池互相作用，不要變成孤立資料。新角色要有羈絆，新血統要能和既有血統產生變異血統。
- 自創主角維持第 7 人支援定位，不改成前排戰鬥角色。新增劇本的「隱藏主角」是劇本核心人物，不是取代玩家自創主角。
- 私人原型中的 image2 插畫要盡量貼近原著角色辨識度、服裝、髮型、武器、氣質與代表場景。若未來公開發布，需先處理授權或改成原創替代。

## 新劇本必備內容

新增劇本時，至少補齊以下內容：

- 劇本資料：`scenarios` 內新增劇本 id、名稱、副標、intro、敵人池、Boss、`eventTitle`、`eventText`、`scenarioPowerName`、`scenarioPowerText`、`scenarioPower`。
- 隱藏主角：設定 `hiddenProtagonistId`，並確保該角色存在於 `characters`，帶有 `hidden: true` 或清楚的解鎖說明。
- 招募池：`recruitmentPool` 要混合該劇本原作角色與現有隊伍角色，讓隊伍構築有交集。
- 角色：新增該劇本代表角色，包含 role、faction、factionId、生命、能量、被動、專屬牌。
- 敵人：新增普通、精英、小王、Boss，敵人意圖要能體現劇本特色，而不是只改名字。
- 技能：新增角色專屬牌、可購買技能、劇本代表招式或戰術牌。
- 裝備：新增劇本代表道具或武器，並歸類到對應商店來源。
- 羈絆：至少補 2-4 條羈絆，包含新角色彼此之間，以及新角色和現有角色池之間的跨劇本羈絆。
- 劇本台詞：補投放前討論、劇本角色互動語氣、奇遇分支文字、結果頁文字。
- 奇遇角色線：至少一條固定好路線，其他路線可提供風險、代價、詛咒、裝備、支線或劇本 Buff。

## 血統與變異血統

每個新劇本都要新增該作品世界觀獨有的特性、能力體系或血統，並接入自創主角強化系統。

- 一般血統或特性要放入現有血統資料結構，能進入自創主角的 2 個一般血統槽。
- 如果劇本世界觀更適合「特性」而不是生物血統，也仍以血統系統表現，例如咒力、查克拉、斬魄刀、巨人化、惡魔之力、機甲同步、替身、念能力、魔術迴路等。
- 每個新劇本至少新增 1 個劇本獨有血統，重要劇本可新增 2-3 個。
- 每個新血統至少和 1 個既有血統產生新的變異血統，重要劇本建議 2 個以上。
- 變異血統沿用 `requiredTags` 組合邏輯，效果要有明確玩法差異，不要只做單純數值堆疊。
- 維持現有上限：啟用 1 個變異血統、2 個一般血統、2 件支援裝備。除非使用者明確要求重平衡，不要改這些限制。
- 自創主角 portrait 要繼續跟隨啟用中的變異血統狀態。

變異血統設計範例方向：

- 劇本能力 + 戰鬥體質：例如查克拉 + 超級士兵，形成開場能量與攻擊節奏。
- 劇本能力 + 感知系：例如咒力 + 寫輪眼，形成戰術牌弱化、封鎖或抽牌。
- 劇本能力 + 恢復系：例如巨人化 + 病毒適應，形成生命上限、回合恢復與壓力代價。
- 劇本能力 + 武器系：例如斬魄刀 + 內力，形成穿甲、暴擊或第二張牌追加傷害。

## 奇遇與結果頁規則

- 正式劇本要提供 4-5 個可選路線，不要退回單調 3 選 1。
- 至少一條固定好路線，能救出、招募、解鎖或正面改寫該劇本核心人物。
- 其他路線可以隨機或風險化，但每條都要有清楚的收益與代價。
- 奇遇結束必須停在 `event-result`，結果頁要明確顯示：
  - 獎勵：角色、裝備、技能、血統、支線、獎勵點或劇本 Buff。
  - 代價：生命、壓力、詛咒、錯失招募、敵人強化或路線惡化。
  - 故事影響：角色命運如何改變，世界狀態如何變化。
- 隱藏主角好路線的獎勵優先順序：招募隱藏角色，其次才是補償裝備、血統或劇本 Buff。

## image2 插畫要求

所有會被 UI 顯示的新增內容都要有 image2 插畫，不要留下缺圖或重複占位圖。

必備檔名：

- 劇本卡與劇本 intro：`src/assets/generated/scenario-{scenarioId}.png`
- 角色：`src/assets/generated/character-{characterId}.png`
- 敵人：`src/assets/generated/enemy-{enemyId}.png`
- 技能與專屬牌：`src/assets/generated/skill-{cardId}.png`
- 裝備：`src/assets/generated/equipment-{equipmentId}.png`
- 商店來源封面：`src/assets/generated/source-cover-{sourceId}.png`
- 角色來源 hero shot：必要時新增 `src/assets/generated/roster-hero-{sourceId}.png`
- 血統或變異血統：優先使用專屬 `art`，避免長期借用不相干圖片。

image2 生成方向：

- 角色圖要正面可辨識，避免暗、糊、遠景、遮臉、純氣氛圖。
- 技能圖要呈現招式動作、武器、能量形態或技能後果。
- 裝備圖要讓物件本體清楚可見，不要只畫使用者。
- 敵人圖要呈現敵人的輪廓、威脅方式與劇本場景。
- 劇本圖要能一眼看出該作品或該章節的代表場景。
- 同一劇本的角色、敵人、技能、裝備要有一致的美術語言，但不要讓全部圖片變成同色系。

匯入 image2 產物時，優先使用現有腳本：

- 單張圖：`python scripts/import-image2-single.py {destination-file-name}`
- 2x2 批次圖：`python scripts/import-image2-sheet.py {batch-number}`

## 實作落點

主要資料落點維持在 `src/game-data.js`：

- `characters`
- 血統與變異血統資料
- `cards`
- `equipment`
- 敵人與 encounter panel
- `scenarios`
- `scenarioOpenings`
- `hiddenProtagonistsByScenario`
- `eventBranchPool` / `scenarioEventRoutes`
- `equipmentSources`
- `bonds`
- 經濟、支線或劇本獎勵設定

UI 圖片路徑大多由 `src/game-ui.js` 的命名函式自動推導。新增資料時要先確認檔名符合命名規則，再補 image2 圖片。

## 驗證清單

新增劇本後至少跑：

```powershell
node --check src/game-data.js
node --check src/game-ui.js
node --check src/game-core.js
npm run check
```

如果本機 PATH 沒有 Node/npm，改用 bundled Node：

```powershell
& "C:\Users\End User\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" scripts/smoke-test.mjs
```

人工檢查或腳本檢查：

- 劇本卡能顯示圖片並可進入劇本。
- 投放前 intro 有劇本代表圖與角色台詞。
- 招募池能抽到新角色，隱藏角色不會提前普通招募。
- 奇遇有 4-5 個路線選項，能正常進入三階段並停在 `event-result`。
- 好路線能招募隱藏主角或給等價補償。
- 新角色專屬牌能進戰鬥並顯示技能圖。
- 新裝備能出現在商店或獎勵中並顯示裝備圖。
- 新血統能在自創主角強化介面顯示與啟用。
- 新變異血統在滿足 `requiredTags` 後出現，效果能在戰鬥或隊伍狀態中生效。
- 羈絆 chips 能因新舊角色組合而觸發。
- 所有新增 image2 圖片存在、非空、互不重複，且不是明顯錯角或錯物件。
