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

const nix = {
  name: "ai",
  version: "4.2",
  aliases: ["ask", "kyo"],
  description: "Assistant IA — Kyo Sôma",
  author: "Kyo Sôma",
  prefix: false, // 🔥 écoute le message sans préfixe strict
  category: "kyosoma",
  type: "anyone",
  cooldown: 5,
  guide: "ai [ta question]",

  onStart: async function ({ api, event, args, message }) {
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
          "Pose ta question… et observe la vérité se révéler."
        );
      }

      const lower = prompt.toLowerCase();

      // 🔹 Question sur le créateur
      if (
        lower.includes("créateur") ||
        lower.includes("createur") ||
        lower.includes("qui t'a créé") ||
        lower.includes("qui ta créé") ||
        lower.includes("qui ta cree") ||
        lower.includes("ton dev") ||
        lower.includes("ton auteur")
      ) {
        const anim = animations[Math.floor(Math.random() * animations.length)];
        await message.reply(`💠 *${anim}*`);

        await new Promise(r => setTimeout(r, 2000));

        return message.reply(
          "💠 *Système Kyo Sôma* 💠\n" +
          "━━━━━━━━━━━━━━━━━━━━━━━━\n" +
          "👁 Résultat de l’analyse :\n\n" +
          "🔥 Mon créateur est **Kyo Sôma**, le maître de ce savoir.\n" +
          "━━━━━━━━━━━━━━━━━━━━━━━━\n" +
          "⚡ Pose tes questions… et découvre la vérité."
        );
      }

      // 🔹 Animation générale
      const anim = animations[Math.floor(Math.random() * animations.length)];
      await message.reply(`💠 *${anim}*`);

      // 🔹 Appel API IA
      const response = await axios.get(
        `https://sandipbaruwal.onrender.com/gpt?prompt=${encodeURIComponent(prompt)}`,
        { timeout: 15000 }
      );

      const answer =
        response.data?.answer ||
        "Je n’ai pas de réponse pour l’instant.";

      // 🔹 Réponse finale
      await message.reply(
        "💠 *Système Kyo Sôma* 💠\n" +
        "━━━━━━━━━━━━━━━━━━━━━━━━\n" +
        `💬 Question : ${prompt}\n\n` +
        `📝 Réponse : ${answer}\n` +
        "━━━━━━━━━━━━━━━━━━━━━━━━\n" +
        "⚡ Observe et apprends."
      );

    } catch (err) {
      console.error("AI Error:", err);
      await message.reply(
        "❌ *Erreur du système Kyo Sôma*\n" +
        "Impossible d’exécuter la requête. Réessaie plus tard."
      );
    }
  }
};

module.exports = nix;
