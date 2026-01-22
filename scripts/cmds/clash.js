const axios = require("axios");

const API_URL = "https://messie-flash-api-ia.vercel.app/chat?prompt=";
const API_KEY = "messie12356osango2025jinWoo";

const activeClashes = new Map();
const clashHistories = new Map();

async function getAIResponse(input, userId, adversaireNom) {
  const cleanInput = input.replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
  const history = clashHistories.get(userId) || [];
  const lastMessages = history.slice(-3).join(" | ");

  const fullPrompt = `
[SYSTEM] MODE CLASH SUPRÊME
Tu es un bot de clash brutal, verbalement destructeur.
Règles :
- Réponds uniquement par des attaques verbales
- Mentionne toujours ${adversaireNom}
- 20 à 50 mots
- Aucune question, aucune empathie
- Style unique à chaque réponse
- Pas de répétition

Historique : ${lastMessages}
[${adversaireNom}] : ${cleanInput}
`;

  try {
    const res = await axios.get(
      `${API_URL}${encodeURIComponent(fullPrompt)}&apiKey=${API_KEY}`,
      { timeout: 10000 }
    );

    const result = res.data?.parts?.[0]?.reponse || res.data?.response;
    if (!result) return "⚠️ Réponse IA vide.";

    const words = result.trim().split(/\s+/);
    if (words.length > 50) return words.slice(0, 50).join(" ");
    if (words.length < 20) return "⚠️ Clash trop faible, recommence.";

    history.push(cleanInput, result.trim());
    clashHistories.set(userId, history);

    return result.trim();
  } catch {
    return "❌ Erreur de connexion avec l’IA.";
  }
}

module.exports = {
  nix: {
    name: "clash",
    aliases: [],
    version: "3.1",
    author: "Messie Osango | NIX",
    role: 2,
    category: "fun",
    shortDescription: "Battle de clash IA",
    longDescription: "Duel verbal violent avec mémoire IA",
    guide: "!clash ouvert @user | !clash fermé @user"
  },

  async onStart({ api, event, args, message }) {
    const adminBot = global.GoatBot.config.adminBot;
    if (!adminBot.includes(event.senderID))
      return message.reply("❌ | Commande réservée aux admins.");

    const action = args[0]?.toLowerCase();
    const targetID =
      event.messageReply?.senderID || args[1] || event.senderID;

    if (action === "ouvert") {
      if (activeClashes.has(targetID))
        return message.reply("⚔️ | Clash déjà actif.");

      activeClashes.set(targetID, { threadID: event.threadID });
      clashHistories.set(targetID, []);

      try {
        const info = await api.getUserInfo(targetID);
        const name = info?.[targetID]?.name || "Inconnu";

        return api.sendMessage(
          `╭─━━━━━━━━━━━━─╮
⚔️ CLASH BATTLE ⚔️
╰─━━━━━━━━━━━━─╯
@${name}, entre dans l’arène.
╰─━━━━━━━━━━━━─╯`,
          event.threadID,
          null,
          [{ tag: `@${name}`, id: targetID }]
        );
      } catch {
        return message.reply("⚔️ Clash lancé.");
      }
    }

    if (action === "fermé") {
      if (!activeClashes.has(targetID))
        return message.reply("⚠️ Aucun clash en cours.");

      activeClashes.delete(targetID);
      clashHistories.delete(targetID);

      return message.reply("✅ | Clash terminé.");
    }

    return message.reply("Usage : !clash ouvert @user | !clash fermé @user");
  },

  async onChat({ api, event }) {
    if (!activeClashes.has(event.senderID)) return;
    if (!event.body) return;
    if (/^[!./]/.test(event.body)) return;

    try {
      const info = await api.getUserInfo(event.senderID);
      const name = info?.[event.senderID]?.name || "Inconnu";

      const reply = await getAIResponse(
        event.body,
        event.senderID,
        name
      );

      return api.sendMessage(
        {
          body: reply,
          mentions: [{ tag: `@${name}`, id: event.senderID }]
        },
        event.threadID,
        event.messageID
      );
    } catch {}
  }
};
