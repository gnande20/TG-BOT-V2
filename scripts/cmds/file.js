const nix = {
  name: "file",
  version: "1.0",
  aliases: [],
  description: "Example command with safe senderID handling",
  author: "ArYAN",
  prefix: true,
  category: "utility",
  type: "anyone",
  cooldown: 5,
  guide: "{pn}file"
};

async function onStart({ bot, args = [], message, event }) {
  // Fallback pour message.reply si message non défini
  if (!message) message = { reply: (...text) => console.log(...text) };

  // Récupération universelle du senderID
  const senderID =
    event?.senderID ||
    event?.author ||
    message?.senderID ||
    message?.author ||
    null;

  if (!senderID) {
    return message.reply("❌ Impossible de récupérer ton ID.");
  }

  // Exemple d'action
  const threadID = event?.threadID || message?.threadID || "INCONNU";

  message.reply(`✅ Commande exécutée par ${senderID} dans le thread ${threadID}`);
}

module.exports = { nix, onStart };
