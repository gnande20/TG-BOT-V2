const axios = require("axios");
const fs = require("fs");
const path = require("path");

const nix = {
  name: "edit2",
  version: "1.1",
  aliases: [],
  description: "Edit or generate images using Gemini-Edit",
  author: "Romeo",
  prefix: true,
  category: "AI",
  type: "anyone",
  cooldown: 30,
  guide: "{pn}edit2 <text> (reply to image optional)"
};

async function onStart({ bot, args = [], message, event }) {
  // Fallback pour message.reply
  if (!message) message = { reply: (...text) => console.log(...text) };

  const prompt = args.join(" ");
  if (!prompt) return message.reply("⚠️ | Please provide text to edit or generate.");

  try {
    const params = { prompt };

    // Gestion sécurisée des images attachées
    if (event?.messageReply?.attachments?.[0]?.url) {
      params.imgurl = event.messageReply.attachments[0].url;
    }

    const res = await axios.get("https://gemini-edit-omega.vercel.app/edit", { params });
    const imageBase64 = res.data?.images?.[0];

    if (!imageBase64) return message.reply("❌ | Failed to get image.");

    // Conversion base64 → buffer
    const buffer = Buffer.from(imageBase64.replace(/^data:image\/\w+;base64,/, ""), "base64");

    // Gestion cache
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
    const imgPath = path.join(cacheDir, `${Date.now()}.png`);
    fs.writeFileSync(imgPath, buffer);

    // Envoi de l'image
    await message.reply({ attachment: fs.createReadStream(imgPath) });

    // Suppression sécurisée
    fs.unlinkSync(imgPath);

  } catch (err) {
    console.error("❌ Edit2 API error:", err.response?.data || err.message || err);
    return message.reply("❌ | Error generating/editing image.");
  }
}

module.exports = { nix, onStart };
