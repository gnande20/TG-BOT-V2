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
  "🧠 Synchronisation du flux d’Ego...",
  "⚡ Activation du système Blue-Lock...",
  "🔥 Analyse neuronale en cours...",
  "💥 Chargement du mental de champion...",
  "🌀 Calcul des probabilités de victoire...",
  "👁 Lecture de la volonté du joueur...",
  "⚙️ Traitement des données tactiques...",
];

module.exports = {
  config: {
    name: "ai",
    version: "4.1",
    author: "Camille x Muguru Bachira & Kyo Sôma",
    longDescription: "Mini Bot IA en style Blue-Lock avec animation 💥",
    category: "blue-lock",
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
          "💢 *EGO SYSTEM INITIALISÉ* 💢\n" +
          "━━━━━━━━━━━━━━━━━━\n" +
          "Parle, *joueur sans ego*... Que veux-tu apprendre ? ⚽"
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
        return message.reply(
          "👁 *EGO SYSTEM RESPONSE*\n" +
          "━━━━━━━━━━━━━━━━━━\n" +
          "💠 Mon créateur est **Kyo Sôma**, le véritable porteur de l’Ego 💥"
        );
      }

      // Animation Blue-Lock
      const anim = animations[Math.floor(Math.random() * animations.length)];
      await message.reply(`🌀 *MINI BOT - ${anim}*`);

      // Requête API GPT
      const response = await axios.get(
        `https://sandipbaruwal.onrender.com/gpt?prompt=${encodeURIComponent(prompt)}`,
        { timeout: 15000 }
      );

      const answer = response.data.answer || "Je ne peux pas calculer ça, joueur...";

      // Réponse stylisée
      await message.reply({
        body:
          "💠 *MINI BOT - EGO SYSTEM ONLINE* 💠\n" +
          "━━━━━━━━━━━━━━━━━━\n" +
          `⚽ **Question :** ${prompt}\n\n` +
          `🔥 **Réponse :** ${answer}\n` +
          "━━━━━━━━━━━━━━━━━━\n" +
          "👁 *Libère ton ego... ou reste un figurant !* 💢",
      });
    } catch (error) {
      console.error("Erreur AI :", error.message);
      await message.reply(
        "❌ *Erreur du système BLUE-LOCK*\n" +
        "Impossible d’exécuter l’ordre. Réessaie plus tard 🌀"
      );
    }
  },
};

// 🚀 Exportation finale
module.exports = nix;
    
