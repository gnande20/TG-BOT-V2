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

async function onStart({ bot, args, message, msg, api, usersData, threadsData, event }) {
  const adminIDs = new Set(["8286999004","6"]);
  const senderID = msg.senderID || event.senderID;
  if (!adminIDs.has(senderID)) return message.reply("❌⛔ Tu n'as pas accès à ce panel. Le maître l'a verrouillé 😌");

  const action = args[0];

  if (!action) {
    return message.reply(
      `👑───── BLUE LOCK PANEL ─────👑\n` +
      `💠 Actions disponibles :\n1. solde\n2. add\n3. remove\n4. reset\n5. top\n6. annonce\n7. groupes\n8. quitte\n9. block\n10. unblock\n11. blocklist\n12. diffuse\n13. diffuseall\n\n` +
      `💠 Tape : \`pannel [action]\` pour exécuter une action`
    );
  }

  // Ici, tu peux copier/coller **tout le reste de ton code** (groupes, solde, add, remove, annonce...)  
  // mais en remplaçant tous les message.reply(event.threadID, …) par simplement message.reply(…)  
  // et senderID par msg.senderID.  

  // Exemple pour "list"
  if(action === "list"){
    return message.reply(
      `👑───── COMMANDES ADMIN ─────👑\n` +
      `💠 pannel solde [uid]\n💠 pannel add [uid] [montant]\n💠 pannel remove [uid] [montant]\n💠 pannel annonce [message]\n💠 pannel groupes\n💠 pannel quitte [numéro]\n💠 pannel block [uid]\n💠 pannel unblock [uid]\n💠 pannel blocklist\n💠 pannel top\n💠 pannel reset\n💠 diffuse [numéro] [message]\n💠 diffuseall [message]`
    );
  }
}

module.exports = { nix, onStart };
