(function (global) {
  const data = global.MainGodData;
  if (!data) return;

  const defeatOutcomes = [
    {
      id: "death-confirmed",
      title: "死亡確認",
      subtitle: "主神沒有哀悼，只留下冰冷的扣分紀錄。",
      weight: 16,
      superHardWeight: 26,
      imageFiles: [
        "defeat-death-confirmed-01.png",
        "defeat-death-confirmed-02.png",
        "defeat-death-confirmed-03.png"
      ],
      fateWeights: { dead: 22, injured: 26, lost: 14, escaped: 38 },
      lines: [
        "主神沒有播報哀悼，只扣下了名字。",
        "不是所有人都能回到白色廣場。",
        "生命跡象歸零，修復權限不足。",
        "他的裝備還在，手卻已經鬆開了。",
        "死亡不是懲罰，是主神最便宜的結算。",
        "有人喊他的名字，但回音比回答更快。",
        "這一次，光柱沒有落在他身上。",
        "隊伍少了一個人，主神只多了一行記錄。",
        "復活需要代價，而代價從來不問你願不願意。",
        "如果還想見到他，就去下一個劇本裡把命搶回來。"
      ]
    },
    {
      id: "severe-injury",
      title: "重傷拖回",
      subtitle: "修復艙亮起紅燈，代表人還沒死，也代表錢不夠。",
      weight: 22,
      superHardWeight: 20,
      imageFiles: [
        "defeat-severe-injury-01.png",
        "defeat-severe-injury-02.png",
        "defeat-severe-injury-03.png"
      ],
      fateWeights: { dead: 8, injured: 48, lost: 12, escaped: 32 },
      lines: [
        "還有心跳，別讓主神把他判成屍體。",
        "骨頭碎了，但意識還在。",
        "他醒來第一句話，是問其他人有沒有回來。",
        "修復艙亮了紅燈，代表錢不夠，也代表人還沒死。",
        "這種傷放在現實已經完了，在這裡只是更貴。",
        "別叫他上場，至少等他能自己站起來。",
        "重傷比死亡仁慈，也比死亡拖得更久。",
        "隊伍需要休整，他更需要時間。",
        "主神給了活路，但沒有給免費。",
        "他活下來了，代價是下一場你們少一把刀。"
      ]
    },
    {
      id: "lost-in-transit",
      title: "失散輪迴者",
      subtitle: "傳送不是失敗，只是把人送去了主神地圖外。",
      weight: 18,
      superHardWeight: 22,
      imageFiles: [
        "defeat-lost-in-transit-01.png",
        "defeat-lost-in-transit-02.png",
        "defeat-lost-in-transit-03.png"
      ],
      fateWeights: { dead: 10, injured: 18, lost: 44, escaped: 28 },
      lines: [
        "傳送沒有失敗，只是把他送去了別的地方。",
        "精神鏈接斷了，不代表人死了。",
        "他最後的位置，在主神地圖外。",
        "下一次遇見他，未必還是同一個人。",
        "失散有時比死亡更折磨，因為你還會等。",
        "他留下了一段座標，像求救，也像陷阱。",
        "主神沒有顯示死亡，只顯示未歸隊。",
        "如果劇本還在運轉，他就可能還在裡面。",
        "別把他的裝備收起來，他可能會回來要。",
        "重逢不一定是救援，也可能是下一場試煉。"
      ]
    },
    {
      id: "narrow-escape",
      title: "成功逃脫",
      subtitle: "沒有勝利，也沒有戰利品，但至少有人活著回來。",
      weight: 24,
      superHardWeight: 12,
      imageFiles: [
        "defeat-narrow-escape-01.png",
        "defeat-narrow-escape-02.png",
        "defeat-narrow-escape-03.png"
      ],
      fateWeights: { dead: 4, injured: 18, lost: 8, escaped: 70 },
      lines: [
        "活著回來，就是這場失敗唯一的獎勵。",
        "他沒有贏，但至少沒有被劇本留下。",
        "逃跑很難看，可死亡更難看。",
        "主神扣走了戰利品，留下了命。",
        "有人跪在地上吐血，有人只是沉默。",
        "這不是撤退，是把下一次機會硬搶回來。",
        "光柱關閉前，他剛好跌了進來。",
        "隊伍沒有勝利，但隊伍還存在。",
        "這場失敗會記在身上，不只記在紀錄裡。",
        "還能呼吸，就還能報仇。"
      ]
    },
    {
      id: "sacrifice-exchange",
      title: "犧牲兌換",
      subtitle: "主神不講仁慈，但它接受交易。",
      weight: 10,
      superHardWeight: 12,
      imageFiles: [
        "defeat-sacrifice-exchange-01.png",
        "defeat-sacrifice-exchange-02.png",
        "defeat-sacrifice-exchange-03.png"
      ],
      fateWeights: { dead: 12, injured: 28, lost: 12, escaped: 48 },
      lineCost: { rewardPointCost: 900, sideStoryCost: 1 },
      lines: [
        "主神不講仁慈，但接受交易。",
        "你可以買回一條命，只是價格會讓人記很久。",
        "支線劇情燃盡時，他的心跳重新出現。",
        "這不是奇蹟，是明碼標價。",
        "救誰，放棄誰，主神把問題丟回你手上。",
        "光幕沒有催促，因為痛苦本身就是倒數。",
        "你付出的不是點數，是下一次變強的機會。",
        "有人被拉回來，有人永遠留在帳單背面。",
        "楚軒說這是最優解，沒人覺得舒服。",
        "主神收下代價，然後假裝這一切公平。"
      ]
    },
    {
      id: "near-death-awakening",
      title: "瀕死突破",
      subtitle: "基因鎖在死亡前一秒打開，但代價也跟著醒來。",
      weight: 10,
      superHardWeight: 8,
      imageFiles: [
        "defeat-near-death-awakening-01.png",
        "defeat-near-death-awakening-02.png",
        "defeat-near-death-awakening-03.png"
      ],
      fateWeights: { dead: 6, injured: 36, lost: 10, escaped: 48 },
      lines: [
        "他沒有死，是因為身體比理智先拒絕了死亡。",
        "基因鎖開啟的聲音，像骨頭裂開。",
        "主神判定異常，隊伍判定他還活著。",
        "這不是勝利，是把死亡往後推了一格。",
        "力量醒了，代價也醒了。",
        "他站起來時，敵人停了一秒，隊友也停了一秒。",
        "如果這叫突破，那人類真是殘忍的生物。",
        "他活下來了，但眼神不像剛才那個人。",
        "主神沒有獎勵，只標記了更高危險等級。",
        "下一次再逼到這一步，未必還能回來。"
      ]
    }
  ];

  data.defeatOutcomes = defeatOutcomes;
  data.defeatFates = {
    dead: { label: "永久死亡", text: "需要復活或在後續劇本重新遇見。", tone: "fatal" },
    injured: { label: "重傷", text: "暫時不能出戰，可在名冊消耗資源治療。", tone: "injury" },
    lost: { label: "失散", text: "暫時離隊，需要追蹤座標或後續重逢。", tone: "lost" },
    escaped: { label: "逃脫", text: "保住性命，但承受大量壓力。", tone: "escape" }
  };
  data.defeatRecoveryCosts = {
    dead: { rewardPointCost: 6000, sideStoryCost: 4 },
    lost: { rewardPointCost: 3200, sideStoryCost: 2 },
    injured: { rewardPointCost: 1400, sideStoryCost: 1 }
  };
})(globalThis);
