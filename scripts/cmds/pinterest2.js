const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const nix = {
  name: "pinterest2",
  version: "1.0.0",
  aliases: ["pin2"],
  description: "Search and fetch images from Pinterest",
  author: "MarianCross",
  prefix: true,
  category: "image",
  type: "anyone",
  cooldown: 60,
  guide: "{pn}pinterest2 <mot-clé> -<nombre>"
};

async function onStart({ args, message }) {
  if (!message) return;

  try {
    const input = args.join(" ");
    if (!input) {
      return message.reply("⚠️ | Veuillez fournir des mots-clés.");
    }

    let number = parseInt(input.split("-").pop().trim());
    if (isNaN(number)) number = 1;
    number = Math.min(Math.max(number, 1), 12);

    const query = input.split("-")[0].trim();

    const res = await axios.get(
      `https://api-samirxyz.onrender.com/api/Pinterest?query=${encodeURIComponent(query)}&number=${number}&apikey=global`
    );

    if (!Array.isArray(res.data) || res.data.length === 0) {
      return message.reply("⚠️ | Aucune image trouvée.");
    }

    const tmpDir = path.join(__dirname, "tmp");
    await fs.ensureDir(tmpDir);

    const attachments = [];

    for (let i = 0; i < res.data.length; i++) {
      const img = await axios.get(res.data[i], { responseType: "arraybuffer" });
      const imgPath = path.join(tmpDir, `${i}.jpg`);
      await fs.writeFile(imgPath, img.data);
      attachments.push(fs.createReadStream(imgPath));
    }

    await message.reply({
      body: `📌 Résultat pour : "${query}"`,
      attachment: attachments
    });

    await fs.remove(tmpDir);

  } catch (error) {
    console.error(error);
    message.reply("❌ | Erreur lors de la récupération des images.");
  }
}

module.exports = { nix, onStart };
