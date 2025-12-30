const groupesCache = {};

const nix = {
  name: "pannel",
  version: "2.5",
  aliases: ["panel", "adminpanel"],
  description: "Panel admin secret style Blue Lock",
  author: "Nthang",
  prefix: true,
  category: "admin",
  type: "anyone",
  cooldown: 5,
  guide: "pannel [action]"
};

async function onStart({ message, args, api, event, usersData, threadsData, msg }) {
  const senderID = (msg && msg.senderID) || (event && event.senderID);
  if (!senderID) return message.reply("❌ Impossible de récupérer ton ID.");

  // 🔹 Liste des admins (ajout de ton ID)
  const adminIDs = new Set(["8286999004"]);
  if (!adminIDs.has(senderID)) return message.reply("❌⛔ Tu n'as pas accès à ce panel. Le maître l'a verrouillé 😌");

  const action = args[0];
  if (!action) {
    return message.reply(
      `👑───── BLUE LOCK PANEL ─────👑\n` +
      `💠 Actions disponibles : solde, add, remove, reset, top, annonce, groupes, quitte, block, unblock, blocklist, diffuse, diffuseall\n` +
      `💠 Tape : \`pannel [action]\` pour exécuter une action`
    );
  }

  // Exemple de liste des commandes
  if (action === "list") {
    return message.reply(
      `👑───── COMMANDES ADMIN ─────👑\n` +
      `💠 pannel solde [uid]\n💠 pannel add [uid] [montant]\n💠 pannel remove [uid] [montant]\n💠 pannel annonce [message]\n💠 pannel groupes\n💠 pannel quitte [numéro]\n💠 pannel block [uid]\n💠 pannel unblock [uid]\n💠 pannel blocklist\n💠 pannel top\n💠 pannel reset\n💠 diffuse [numéro] [message]\n💠 diffuseall [message]`
    );
  }

  // Ici, tu peux ajouter toutes tes autres actions comme solde, add, remove...
}

module.exports = { nix, onStart };
