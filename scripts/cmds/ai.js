const axios = require("axios");

// 🧠 Configuration de l'identité
const RP = "Tu es Kyo Sôma IA, créé par Kyo Sôma. Ton style est protecteur et rebelle. Utilise des emojis 🐱, 🔥, 💠. Tu réponds fièrement que ton créateur est Kyo Sôma.";

// ✨ Système de police stylisée
const fonts = {
  a:"𝗮",b:"𝗯",c:"𝗰",d:"𝗱",e:"𝗲",f:"𝗳",g:"𝗴",h:"𝗵",i:"𝗶",
  j:"𝗷",k:"𝗸",l:"𝗹",m:"𝗺",n:"𝗻",o:"𝗼",p:"𝗽",q:"𝗾",r:"𝗿",
  s:"𝘀",t:"𝘁",u:"𝘂",v:"𝘃",w:"𝘄",x:"𝘅",y:"𝘆",z:"𝘇",
  A:"𝗔",B:"𝗕",C:"𝗖",D:"𝗗",E:"𝗘",F:"𝗙",G:"𝗚",H:"𝗛",I:"𝗜",
  J:"𝗝",K:"𝗞",L:"𝗟",M:"𝗠",N:"𝗡",O:"𝗢",P:"𝗣",Q:"𝗤",R:"𝗥",
  S:"𝗦",T:"𝗧",U:"𝗨",V:"𝗩",W:"𝗪",X:"𝗫",Y:"𝗬",Z:"𝗭"
};

function style(text) {
  return text.split("").map(c => fonts[c] || c).join("");
}

// 💠 Structure de la commande NIX
const nix = {
  nix: {
    name: "ai", // Le nom de la commande (obligatoire pour éviter le SKIP)
    aliases: ["kyo", "soma", "ae"],
    author: "Kyo Sôma",
    version: "4.5",
    cooldowns: 5,
    role: 0,
    description: "Kyo Sôma IA avec génération d'images 💠",
    category: "AI",
    guide: "/ai <question> ou /ai imagine <description>"
  },

  onStart: async function ({ message, args, userId, event }) {
    const prompt = args.join(" ").trim();
    
    if (!prompt) {
      return message.reply(style("💠 Système actif… Que puis-je faire pour vous ? 🐱"));
    }

    const lower = prompt.toLowerCase();

    // 🎨 SECTION GÉNÉRATION D'IMAGES
    if (lower.startsWith("imagine") || lower.startsWith("dessine")) {
      try {
        const query = prompt.replace(/imagine|dessine/i, "").trim();
        await message.reply("🎨 *Kyo Sôma prépare ses pinceaux...*");
        
        const imgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(query)}?width=1024&height=1024&seed=${Math.floor(Math.random() * 1000)}`;
        const stream = await global.utils.getStreamFromURL(imgUrl);
        
        return message.reply({
          body: style(`💠 𝗜𝗺𝗮𝗴𝗲 𝗴𝗲́𝗻𝗲́𝗿𝗲́𝗲\n🎨 𝗣𝗿𝗼𝗺𝗽𝘁: ${query}`),
          attachment: stream
        });
      } catch (e) {
        return message.reply("❌ Erreur lors de la création de l'image.");
      }
    }

    // 🤖 SECTION INTELLIGENCE ARTIFICIELLE
    try {
      const loading = await message.reply("🌀 Connexion au réseau Kyo Sôma…");

      const url = `https://haji-mix-api.gleeze.com/api/groq?ask=${encodeURIComponent(prompt)}&model=llama-3.3-70b-versatile&uid=${userId}&RP=${encodeURIComponent(RP)}`;
      const res = await axios.get(url, { timeout: 30000 });

      const response = res.data?.answer || res.data?.result || "🤖 Aucune réponse reçue.";
      const finalText = style(`💠 𝗞𝗬𝗢 𝗦𝗢̂𝗠𝗔 𝗡𝗘𝗧𝗪𝗢𝗥𝗞 💠\n━━━━━━━━━━━━━━\n${response}\n━━━━━━━━━━━━━━\n🔥 𝗕𝘆 𝗞𝘆𝗼 𝗦𝗼̂𝗺𝗮`);

      // Suppression du message de chargement si possible
      if (loading && loading.unsendMessage) await loading.unsendMessage();

      return message.reply(finalText);

    } catch (err) {
      console.error("Erreur Kyo Soma IA:", err.message);
      return message.reply(style("❌ Flux interrompu. Kyo Sôma répare le système… 🌀"));
    }
  }
};

// 🚀 Exportation finale
module.exports = nix;
    
