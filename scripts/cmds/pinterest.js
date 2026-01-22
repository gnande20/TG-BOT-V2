const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// Base API (4e fallback)
const baseApiUrl = async () => {
  const { data } = await axios.get(
    "https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json"
  );
  return data.api;
};

const nix = {
  name: "pinterest",
  version: "1.0.0",
  aliases: ["pin"],
  description: "Search images on Pinterest (multi API fallback)",
  author: "MarianCross",
  prefix: true,
  category: "image",
  type: "anyone",
  cooldown: 60,
  guide: "{pn}pinterest chat -5"
};

async function onStart({ args, message }) {
  if (!message) return;

  try {
    const input = args.join(" ");
    if (!input || !input.includes("-")) {
      return message.reply("⚠️ | Format : pinterest <mot-clé> -<nombre>");
    }

    const query = input.split("-")[0].trim();
    let limit = parseInt(input.split("-").pop().trim()) || 1;
    limit = Math.min(Math.max(limit, 1), 12);

    const tmpDir = path.join(__dirname, "tmp");
    await fs.ensureDir(tmpDir);

    const fetched = new Set();
    let images = [];

    // 🔹 Helper fetch
    const fetchImages = async (urls) => {
      for (let i = 0; i < urls.length && images.length < limit; i++) {
        const url = urls[i];
        if (fetched.has(url)) continue;
        fetched.add(url);

        try {
          const img = await axios.get(url, { responseType: "arraybuffer" });
          const imgPath = path.join(tmpDir, `${images.length + 1}.jpg`);
          await fs.writeFile(imgPath, img.data);
          images.push(fs.createReadStream(imgPath));
        } catch {}
      }
    };

    // 🟢 API 1
    try {
      const { data } = await axios.get(
        `https://api-samirxyz.onrender.com/api/Pinterest?query=${encodeURIComponent(query)}&number=${limit}&apikey=global`
      );
      if (Array.isArray(data)) await fetchImages(data);
    } catch {}

    // 🟡 API 2
    if (images.length === 0) {
      try {
        const { data } = await axios.get(
          `https://celestial-dainsleif-v2.onrender.com/pinterest?pinte=${encodeURIComponent(query)}`
        );
        if (Array.isArray(data)) {
          await fetchImages(data.map(i => i.image));
        }
      } catch {}
    }

    // 🔵 API 3
    if (images.length === 0) {
      try {
        const { data } = await axios.get(
          `https://itsaryan.onrender.com/api/pinterest?query=${encodeURIComponent(query)}&limits=${limit}`
        );
        if (Array.isArray(data)) await fetchImages(data);
      } catch {}
    }

    // 🔴 API 4
    if (images.length === 0) {
      try {
        const base = await baseApiUrl();
        const { data } = await axios.get(
          `${base}/pinterest?search=${encodeURIComponent(query)}&limit=${limit}`
        );
        if (Array.isArray(data?.data)) await fetchImages(data.data);
      } catch {}
    }

    if (images.length === 0) {
      return message.reply("(⁠ ⁠･ั⁠﹏⁠･ั⁠) API Pinterest indisponible.");
    }

    await message.reply({
      body: `📌 Résultats pour "${query}"`,
      attachment: images
    });

    await fs.remove(tmpDir);

  } catch (err) {
    console.error(err);
    message.reply("❌ | Erreur lors de la recherche Pinterest.");
  }
}

module.exports = { nix, onStart };
