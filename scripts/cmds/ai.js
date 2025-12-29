const axios = require("axios");
// 🧠 Identité RP
const RP =
"Tu es une intelligence artificielle avancée développée par Kyo Sôma. " +
"Ton nom est Kyo Sôma IA. Ton style est élégant, mystérieux et protecteur. " +
"Utilise 🐱🔥💠🖤. Si on te demande qui t'a créé, réponds fièrement : Kyo Sôma.";

// ✨ Police stylée
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

function split(text, max = 3500) {
  const arr = [];
  for (let i = 0; i < text.length; i += max) {
    arr.push(text.slice(i, i + max));
  }
  return arr;
}

// 💠 Structure de la commande
const nix = {
  config: { // Changé 'nix' en 'config' car la plupart des bots utilisent ce mot-clé
    name: "ai",
    aliases: ["kyo", "soma", "ae"],
    author: "Kyo Sôma",
    version: "3.5",
    cooldowns: 3,
    role: 0,
    description: "Kyo Sôma AI 💠",
    category: "AI",
    guide: "Use: /ai <question>"
  },

  onStart: async function ({ message, args, userId }) {
    const prompt = args.join(" ").trim();
    if (!prompt) {
      return message.reply(
        style("💠 Système actif… Que puis-je faire pour vous ? 🐱")
      );
    }

    try {
      // 🌀 Message de chargement
      const loading = await message.reply("🌀 Connexion au réseau Kyo Sôma…");

      const url =
        "https://haji-mix-api.gleeze.com/api/groq" +
        "?ask=" + encodeURIComponent(prompt) +
        "&model=llama-3.3-70b-versatile" +
        "&uid=" + userId +
        "&RP=" + encodeURIComponent(RP);

      const res = await axios.get(url, { timeout: 30000 });

      const raw =
        res.data?.answer ||
        res.data?.result ||
        "🤖 Aucune réponse reçue.";

      const finalText = style(
        "💠 KYO SÔMA NETWORK 💠\n━━━━━━━━━━━━━━\n" +
        raw +
        "\n━━━━━━━━━━━━━━\n🔥 By Kyo Sôma"
      );

      // 🗑 Suppression du message de chargement si supporté, sinon ignore
      if (loading && loading.unsendMessage) {
          await loading.unsendMessage();
      }

      const parts = split(finalText);
      for (const part of parts) {
        await message.reply(part);
      }

    } catch (err) {
      console.error("Kyo Soma AI error:", err.message);
      return message.reply(
        style("❌ Flux interrompu. Kyo Sôma répare le système… 🌀")
      );
    }
  }
};

// 🚀 Exportation finale
module.exports = nix;
    
