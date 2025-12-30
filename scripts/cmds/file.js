const fs = require("fs");
const path = require("path");

const nix = {
  name: "file",
  aliases: ["files"],
  version: "1.0",
  author: "Mahir Tahsan",
  prefix: true,
  category: "owner",
  type: "anyone",
  cooldown: 5,
  description: "Send bot script",
  guide: "file <filename> — Ex: file filename"
};

async function onStart({ message, args, msg, api }) {
  const permission = ["8286999004",""];
  const senderID = msg.senderID;

  if (!permission.includes(senderID)) {
    return message.reply(
      "❌ Tu n'as pas l'autorisation pour utiliser cette commande."
    );
  }

  const fileName = args[0];
  if (!fileName) {
    return message.reply("❌ Veuillez fournir le nom du fichier.");
  }

  const filePath = path.join(__dirname, `${fileName}.js`);
  if (!fs.existsSync(filePath)) {
    return message.reply(`❌ Fichier introuvable : ${fileName}.js`);
  }

  const fileContent = fs.readFileSync(filePath, "utf8");
  message.reply({ body: fileContent });
}

module.exports = { nix, onStart };
