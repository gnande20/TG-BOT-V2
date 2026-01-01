const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

const nix = {
  name: "help",
  version: "2026 Edition",
  aliases: ["menu", "cmds"],
  description: "Affiche la liste des commandes",
  author: "Testsuya Kuroko",
  prefix: true,
  category: "info",
  type: "anyone",
  cooldown: 5,
  guide: "help [commande]"
};

async function onStart({ bot, args, message }) {
  const prefix = await getPrefix(message.threadID);

  // 🎆 MENU PRINCIPAL DU NOUVEL AN
  if (!args[0]) {
    const categories = {};
    let count = 0;

    let msg = `
🎇✨━━━━━━━━━━━━━━━━━━✨🎇
       🎉 𝗡𝗢𝗨𝗩𝗘𝗟 𝗔𝗡 𝗠𝗘𝗡𝗨 🎉
🎇✨━━━━━━━━━━━━━━━━━━✨🎇

🎆 Prefix : ${prefix}
`;

    for (const [name, cmd] of commands) {
      if (!cmd?.nix) continue;

      const cat = cmd.nix.category || "other";
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(name);
      count++;
    }

    for (const cat of Object.keys(categories).sort()) {
      msg += `\n🎊 ${cat.toUpperCase()}\n`;
      for (const name of categories[cat].sort()) {
        msg += `▫️ ${name}\n`;
      }
    }

    msg += `
✨━━━━━━━━━━━━━━━━━━✨
🎆 ${count} commandes disponibles
🎉 ${prefix}help <commande>
🎇 Bonne année 2026 ! 🎇
✨━━━━━━━━━━━━━━━━━━✨
`;

    return bot.sendMessage(msg, message.threadID, message.messageID);
  }

  // 🎁 INFO COMMANDE
  const cmdName = args[0].toLowerCase();
  const command =
    commands.get(cmdName) ||
    (aliases.get(cmdName) && commands.get(aliases.get(cmdName)));

  if (!command || !command.nix) {
    return bot.sendMessage(
      "❌ Commande introuvable 🎆",
      message.threadID,
      message.messageID
    );
  }

  const cfg = command.nix;

  const resp = `
🎇✨━━━━━━━━━━━━━━━━━━✨🎇
       🎉 INFO COMMANDE 🎉
🎇✨━━━━━━━━━━━━━━━━━━✨🎇

🔹 Nom      : ${cfg.name}
🔹 Version  : ${cfg.version}
🔹 Auteur   : ${cfg.author}
🔹 Catégorie: ${cfg.category}
🔹 Accès    : ${cfg.type}
🔹 Cooldown : ${cfg.cooldown}s

📌 Utilisation
${prefix}${cfg.guide || cfg.name}
`;

  return bot.sendMessage(resp, message.threadID, message.messageID);
}

module.exports = { nix, onStart };
