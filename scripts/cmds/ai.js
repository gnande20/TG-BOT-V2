const axios = require("axios");

const RP = "Tu es Kyo Sôma IA, créé par Kyo Sôma. Style : protecteur, rebelle, 🐱🔥💠.";

const fonts = {
  a:"𝗮",b:"𝗯",c:"𝗰",d:"𝗱",e:"𝗲",f:"𝗳",g:"𝗴",h:"𝗵",i:"𝗶",
  j:"𝗷",k:"𝗸",l:"𝗹",m:"𝗺",n:"𝗻",o:"𝗼",p:"𝗽",q:"𝗾",r:"𝗿",
  s:"𝘀",t:"𝘁",u:"𝘂",v:"𝘃",w:"𝘄",x:"𝘅",y:"𝘆",z:"𝘇",
  A:"𝗔",B:"𝗕",C:"𝗖",D:"𝗗",E:"𝗘",F:"𝗙",G:"𝗚",H:"𝗛",I:"𝗜",
  J:"𝗝",K:"𝗞",L:"𝗟",M:"𝗠",N:"𝗡",O:"𝗢",P:"𝗣",Q:"𝗤",R:"𝗥",
  S:"𝗦",T:"𝗧",U:"𝗨",V:"𝗩",W:"𝗪",X:"𝗫",Y:"𝗬",Z:"𝗭"
};

function style(text) { return text.split("").map(c => fonts[c] || c).join(""); }

const nix = {
  // Cette partie est cruciale pour corriger l'erreur "Missing nix.name"
  name: "ai",
  description: "Kyo Sôma IA 💠",
  author: "Kyo Sôma",
  version: "4.0",
  category: "AI",
  role: 0,
  cooldowns: 5,
  aliases: ["kyo", "soma"],

  onStart: async function ({ message, args, event }) {
    const prompt = args.join(" ").trim();
    if (!prompt) return message.reply(style("💠 Posez votre question... 🐱"));

    try {
      const res = await axios.get(`https://haji-mix-api.gleeze.com/api/groq?ask=${encodeURIComponent(prompt)}&RP=${encodeURIComponent(RP)}`);
      const answer = res.data?.answer || "🤖 Pas de réponse.";
      return message.reply(style(`💠 KYO SÔMA\n━━━━━━━━━━━━━━\n${answer}\n━━━━━━━━━━━━━━\n🔥 By Kyo Sôma`));
    } catch (err) {
      return message.reply(style("❌ Erreur de connexion au flux."));
    }
  }
};

// Vérifiez que cette ligne est bien présente à la fin
module.exports = nix;

