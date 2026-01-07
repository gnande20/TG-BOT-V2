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
  if (!message) message = { reply: (...text) => console.log(...text) };

  const prompt = args.join(" ");
  if (!prompt) return message.reply("⚠️ | Please provide text to edit or generate.");

  try {
    const params = { prompt };
    if (event?.messageReply?.attachments?.[0]) params.imgurl = event.messageReply.attachments[0].url;

    const res = await axios.get("https://gemini-edit-omega.vercel.app/edit", { params });
    if (!res.data?.images?.[0]) return message.reply("❌ | Failed to get image.");

    const base64 = res.data.images[0].replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64, "base64");
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
    const imgPath = path.join(cacheDir, `${Date.now()}.png`);
    fs.writeFileSync(imgPath, buffer);

    await message.reply({ attachment: fs.createReadStream(imgPath) });
    fs.unlinkSync(imgPath);
  } catch (err) {
    console.error(err);
    message.reply("❌ | Error generating/editing image.");
  }
}

module.exports = { nix, onStart };
