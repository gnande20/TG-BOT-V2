const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const nix = {
  name: "pinterest2",
  version: "1.0",
  aliases: ["pin2"],
  description: "Search and fetch images from Pinterest",
  author: "MarianCross",
  prefix: true,
  category: "image",
  type: "anyone",
  cooldown: 60,
  guide: "{pn}pinterest <keyword> -<number of images>"
};

async function onStart({ bot, args = [], message, event, getLang }) {
  if (!message) message = { reply: (...text) => console.log(...text) };
  try {
    const keySearch = args.join(" ");
    if (!keySearch) return message.reply("⚠️ | Please provide search keywords.");

    let numberSearch = parseInt(keySearch.split("-").pop().trim()) || 1;
    numberSearch = Math.min(Math.max(numberSearch, 1), 12);

    const query = keySearch.split("-")[0].trim();
    const res = await axios.get(`https://api-samirxyz.onrender.com/api/Pinterest?query=${encodeURIComponent(query)}&number=${numberSearch}&apikey=global`);

    if (!res.data || !Array.isArray(res.data) || res.data.length === 0)
      return message.reply("⚠️ | No images found.");

    const images = [];
    for (let i = 0; i < res.data.length; i++) {
      const url = res.data[i];
      const imgBuffer = (await axios.get(url, { responseType: "arraybuffer" })).data;
      const tmpPath = path.join(__dirname, "tmp", `${i}.jpg`);
      await fs.outputFile(tmpPath, imgBuffer);
      images.push(fs.createReadStream(tmpPath));
    }

    await message.reply({ attachment: images, body: `Here are ${images.length} images for "${query}"` });

    await fs.remove(path.join(__dirname, "tmp"));
  } catch (err) {
    console.error(err);
    message.reply(`❌ | Error fetching images: ${err.message}`);
  }
}

module.exports = { nix, onStart };
