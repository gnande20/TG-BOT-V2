const axios = require("axios");

const Prefixes = [
  "ai",
  "/ai",
  "+ai",
  "ask",
  "gear",
  "préscilia",
  "shinmon"
];

const animations = [
  "🧠 Réflexion profonde...",
  "⚡ Activation du flux créatif...",
  "🔥 Analyse de la conscience...",
  "🌀 Traitement des données en cours...",
];

module.exports = {
  nix: { // ✅ TG-BOT-V2 CHERCHE CET OBJET
    name: "ai", // ✅ OBLIGATOIRE
    version: "4.2",
    aliases: ["ask", "kyo"],
    description: "Assistant IA — Kyo Sôma",
    author: "Kyo Sôma",
    category: "kyosoma",
    prefix: false,
    type: "anyone",
    cooldown: 5,
    guide: "ai [ta question]",

    onStart: async function ({ api, event, message }) {
      try {
        if (!event.body) return;

        const body = event.body.toLowerCase();
        const prefix = Prefixes.find(p => body.startsWith(p));
        if (!prefix) return;

        const prompt = event.body.slice(prefix.length).trim();
        if (!prompt) {
          return message.reply(
            "💡 *Système Kyo Sôma initialisé*\n" +
            "━━━━━━━━━━━━━━━━━━\n" +
            "Pose ta question…"
          );
        }

        const anim = animations[Math.floor(Math.random() * animations.length)];
        await message.reply(`💠 *${anim}*`);

        const response = await axios.get(
          `https://sandipbaruwal.onrender.com/gpt?prompt=${encodeURIComponent(prompt)}`,
          { timeout: 15000 }
        );

        const answer = response.data?.answer || "Je n’ai pas de réponse.";

        await message.reply(
          "💠 *Système Kyo Sôma* 💠\n" +
          "━━━━━━━━━━━━━━━━━━━━━━━━\n" +
          `💬 Question : ${prompt}\n\n` +
          `📝 Réponse : ${answer}\n` +
          "━━━━━━━━━━━━━━━━━━━━━━━━\n" +
          "⚡ Observe et apprends."
        );

      } catch (e) {
        console.error("AI ERROR:", e);
        message.reply("❌ Erreur IA.");
      }
    }
  }
};
