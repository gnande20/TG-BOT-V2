const groupesCache = {};

const nix = {
  name: "pannel",
  version: "2.6",
  aliases: ["panel", "adminpanel"],
  description: "Panel admin secret style Blue Lock",
  author: "Nthang",
  prefix: true,
  category: "admin",
  type: "anyone",
  cooldown: 5,
  guide: "pannel [action]"
};

async function onStart({ bot, args = [], message, event }) {
  if (!message) message = { reply: (...text) => console.log(...text) };

  // ✅ Récupération universelle du senderID
  const senderID =
    event?.senderID ||
    event?.author ||
    message?.senderID ||
    message?.author ||
    null;

  if (!senderID) {
    return message.reply("❌ Impossible de récupérer ton ID (framework incompatible).");
  }

  // 🔐 ADMIN
  const adminIDs = ["8286999004"];
  if (!adminIDs.includes(String(senderID))) {
    return message.reply("❌⛔ Accès refusé. Panel verrouillé 😌");
  }

  const action = args[0];

  // 📘 Menu principal
  if (!action) {
    return message.reply(
      `👑───── BLUE LOCK PANEL ─────👑
💠 Actions disponibles :
solde | add | remove | reset | top
annonce | groupes | quitte
block | unblock | blocklist
diffuse | diffuseall

📌 Utilisation :
pannel [action]`
    );
  }

  if (action === "list") {
    return message.reply(
      `👑───── COMMANDES ADMIN ─────👑
pannel solde [uid]
pannel add [uid] [montant]
pannel remove [uid] [montant]
pannel reset [uid]
pannel top
pannel annonce [message]
pannel groupes
pannel quitte [numéro]
pannel block [uid]
pannel unblock [uid]
pannel blocklist
pannel diffuse [numéro] [message]
pannel diffuseall [message]`
    );
  }

  return message.reply(`❌ Action inconnue : ${action}`);
}

module.exports = { nix, onStart };
