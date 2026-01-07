const fs = require("fs");
const path = require("path");

module.exports = {
  nix: {
    name: "file",
    aliases: ["files"],
    version: "2026 Edition",
    author: "Testsuya Kuroko",
    prefix: true,
    category: "𝗢𝗪𝗡𝗘𝗥",
    type: "anyone",
    cooldown: 5,
    description: "Envoie un fichier du bot",
    guide: "file <nom_du_fichier>"
  },

  async onStart({ event, args, message }) {
    const senderID = event.senderID;

    // 🔐 Autorisations
    const permission = [
      "8286999004",
      ""
    ];

    if (!permission.includes(senderID)) {
      return message.reply(
        "🎇✨ 𝐀𝐂𝐂𝐄̀𝐒 𝐑𝐄𝐅𝐔𝐒𝐄́ ✨🎇\n\n❌ Vous n’avez pas la permission.\n👑 Commande réservée au maître."
      );
    }

    // 📂 Nom du fichier
    const fileName = args[0];
    if (!fileName) {
      return message.reply(
        "⚠️ Utilisation incorrecte\n\n📌 Exemple : file help"
      );
    }

    // 🛡️ Sécurité
    if (fileName.includes("..") || fileName.includes("/")) {
      return message.reply("🚫 Nom de fichier invalide.");
    }

    const filePath = path.join(__dirname, `${fileName}.js`);

    if (!fs.existsSync(filePath)) {
      return message.reply(`❌ Fichier introuvable : ${fileName}.js`);
    }

    // 📤 Envoi du fichier en pièce jointe
    return message.reply({
      body: `📦 Fichier : ${fileName}.js`,
      attachment: fs.createReadStream(filePath)
    });
  }
};
