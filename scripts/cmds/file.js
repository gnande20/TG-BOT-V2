const fs = require('fs');

const nix = {
  name: "file",
  aliases: ["files"],
  version: "2026 Edition",
  author: "Testsuya Kuroko",
  prefix: true,
  category: "𝗢𝗪𝗡𝗘𝗥",
  type: "anyone",
  cooldown: 5,
  description: "Send a specified bot file",
  guide: "file [filename]"
};

async function onStart({ bot, args, message, api, event, msg }) {
  // ✅ Corrige le senderID
  const senderID = event?.senderID || message?.senderID || msg?.senderID;

  const permission = ["61561648169981","61585610189468"];
  if (!permission.includes(senderID)) {
    return api.sendMessage(
      "🎇✨ 𝐸𝑟𝑟𝑒𝑢𝑟 𝐴𝑢𝑡ℎ𝑜𝑟𝑖𝑠𝑎𝑡𝑖𝑜𝑛 ✨🎇\n" +
      "❌ Vous n'avez pas la permission de faire cela !\n" +
      "🎉 Seul mon maître peut utiliser cette commande.",
      message.threadID,
      message.messageID
    );
  }

  const fileName = args[0];
  if (!fileName) {
    return api.sendMessage(
      "🎆 Veuillez fournir un nom de fichier. Ex: file filename",
      message.threadID,
      message.messageID
    );
  }

  const filePath = __dirname + `/${fileName}.js`;
  if (!fs.existsSync(filePath)) {
    return api.sendMessage(
      `❌ Fichier introuvable : ${fileName}.js`,
      message.threadID,
      message.messageID
    );
  }

  const fileContent = fs.readFileSync(filePath, 'utf8');
  return api.sendMessage(
    { body: `🎉 Voici le contenu du fichier ${fileName}.js :\n\n${fileContent}` },
    message.threadID
  );
}

module.exports = { nix, onStart };
