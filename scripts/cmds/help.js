const nix = {
  name: "help",
  version: "1.0",
  aliases: ["h", "commands"],
  description: "Affiche la liste des commandes disponibles",
  author: "Testsuya Kuroko",
  prefix: true,
  category: "info",
  type: "anyone",
  cooldown: 5,
  guide: "{pn} [nom_commande] - Affiche l'aide d'une commande spécifique ou la liste complète"
};

async function onStart({ message, args, api, commandName, threadsData, usersData }) {
  const utils = global.utils;
  if (!utils) return message.reply("⚠️ Erreur : utils non disponible.");

  const { getPrefix } = utils;
  const prefix = getPrefix ? await getPrefix() : ".";

  const allCommands = Array.from(global.GoatBot.commands.keys())
    .map(key => global.GoatBot.commands.get(key).config)
    .filter(cmd => cmd.category && cmd.type !== "hidden");

  if (!args[0]) {
    // Liste de toutes les commandes
    const cmdList = allCommands
      .map(cmd => `• ${prefix}${cmd.name} - ${cmd.description || "Pas de description"}`)
      .join("\n");
    return message.reply(`📜 Liste des commandes :\n────────────────\n${cmdList}`);
  }

  // Détails d'une commande spécifique
  const cmdName = args[0].toLowerCase();
  const cmd = allCommands.find(c => c.name === cmdName || (c.aliases && c.aliases.includes(cmdName)));
  if (!cmd) return message.reply(`❌ Commande "${cmdName}" introuvable.`);
  
  return message.reply(
    `📌 Détails de la commande : ${cmd.name}\n────────────────\n` +
    `Description : ${cmd.description || "Pas de description"}\n` +
    `Alias : ${cmd.aliases.length > 0 ? cmd.aliases.join(", ") : "Aucun"}\n` +
    `Catégorie : ${cmd.category}\n` +
    `Cooldown : ${cmd.cooldown || 0}s\n` +
    `Guide : ${cmd.guide || "Aucun"}`
  );
}

module.exports = { nix, onStart };
