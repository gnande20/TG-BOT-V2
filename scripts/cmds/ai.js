const axios = require("axios");

const Prefixes = [
  "/ai",
  "gear",
  "préscilia",
  "+ai",
  "shinmon",
  "ai",
  "ask",
];

const animations = [
  "🧠 Réflexion profonde...",
  "⚡ Activation du flux créatif...",
  "🔥 Analyse de la conscience...",
  "🌀 Traitement des données en cours...",
];

module.exports = {
  config: {
    name: "ai",
    version: "4.2",
    author: "Kyo Sôma",
    longDescription: "Mini Bot IA avec style Kyo Sôma et animations",
    category: "kyosoma",
    guide: {
      en: "{p}ai [ta question]",
    },
  },

  onStart: async function () {},

  onChat: async function ({ api, event, message }) {
    try {
      const prefix = Prefixes.find(
        (p) => event.body && event.body.toLowerCase().startsWith(p)
      );
      if (!prefix) return;

      const prompt = event.body.substring(prefix.length).trim();
      if (!prompt) {
        return message.reply(
          "💡 *Système Kyo Sôma initialisé*\n" +
          "━━━━━━━━━━━━━━━━━━\n" +
          "Pose ta question… et observe la vérité se révéler."
        );
      }

      // 🔹 Réponse spéciale si on parle du créateur
      const lower = prompt.toLowerCase();
      if (
        lower.includes("créateur") ||
        lower.includes("createur") ||
        lower.includes("qui t'a créé") ||
        lower.includes("qui ta cree") ||
        lower.includes("qui ta créé") ||
        lower.includes("qui est ton père") ||
        lower.includes("ton dev") ||
        lower.includes("ton auteur")
      ) {
        const anim = animations[Math.floor(Math.random() * animations.length)];
        await message.reply(`💠 *${anim}*`);

        await new Promise((r) => setTimeout(r, 2000));

        return message.reply(
          "💠 *Système Kyo Sôma* 💠\n" +
          "━━━━━━━━━━━━━━━━━━━━━━━━\n" +
          "👁 Résultat de l’analyse :\n\n" +
          "🔥 Mon créateur est **Kyo Sôma**, le maître de ce savoir.\n" +
          "━━━━━━━━━━━━━━━━━━━━━━━━\n" +
          "⚡ Pose tes questions… et découvre la vérité."
        );
      }

      // Animation générale
      const anim = animations[Math.floor(Math.random() * animations.length)];
      await message.reply(`💠 *${anim}*`);

      // Requête API GPT
      const response = await axios.get(
        `https://sandipbaruwal.onrender.com/gpt?prompt=${encodeURIComponent(prompt)}`,
        { timeout: 15000 }
      );

      const answer = response.data.answer || "Je n’ai pas de réponse à ça pour l’instant.";

      // Réponse stylisée Kyo Sôma
      await message.reply({
        body:
          "💠 *Système Kyo Sôma* 💠\n" +
          "━━━━━━━━━━━━━━━━━━━━━━━━\n" +
          `💬 Question : ${prompt}\n\n` +
          `📝 Réponse : ${answer}\n` +
          "━━━━━━━━━━━━━━━━━━━━━━━━\n" +
          "⚡ Observe et apprends."
      });

    } catch (error) {
      console.error("Erreur AI :", error.message);
      await message.reply(
        "❌ *Erreur du système Kyo Sôma*\n" +
        "Impossible d’exécuter la requête. Réessaie plus tard."
      );
    }
  },
};
