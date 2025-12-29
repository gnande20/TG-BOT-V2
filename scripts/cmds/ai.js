ilconst axios = require("axios");

// 🍎 Configuration de l'identité de Kyo Sôma
const Prefixes = ["ai", "kyo", "soma", "imagine", "dessine"];
const RP = "Tu es Kyo Sôma IA, une intelligence artificielle créée par Kyo Sôma. Ton style est protecteur, un peu rebelle, utilise des emojis 🐱, 🔥, 💠. Tu peux aussi générer des images quand on te le demande.";

const fonts = {
  a: "𝗮", b: "𝗯", c: "𝗰", d: "𝗱", e: "𝗲", f: "𝗳", g: "𝗴", h: "𝗵", i: "𝗶",
  j: "𝗷", k: "𝗸", l: "𝗹", m: "𝗺", n: "𝗻", o: "𝗼", p: "𝗽", q: "𝗾", r: "𝗿",
  s: "𝘀", t: "𝘁", u: "𝘂", v: "𝘃", w: "𝘄", x: "𝘅", y: "𝘆", z: "𝘇",
  A: "𝗔", B: "𝗕", C: "𝗖", D: "𝗗", E: "𝗘", F: "𝗙", G: "𝗚", H: "𝗛", I: "𝗜",
  J: "𝗝", K: "𝗞", L: "𝗟", M: "𝗠", N: "𝗡", O: "𝗢", P: "𝗣", Q: "𝗤", R: "𝗥",
  S: "𝗦", T: "𝗧", U: "𝗨", V: "𝗩", W: "𝗪", X: "𝗫", Y: "𝗬", Z: "𝗭"
};

function applyFont(text) {
  return text.split('').map(char => fonts[char] || char).join('');
}

module.exports = {
  config: {
    name: "ai",
    aliases: ["kyo", "imagine"],
    version: "4.0",
    author: "Kyo Sôma",
    countDown: 5,
    role: 0,
    category: "ai",
    shortDescription: "IA + Générateur d'images",
    guide: "{pn} <votre message> ou {pn} imagine <description>"
  },

  onStart: async function ({ message, args, event, api }) {
    const prompt = args.join(" ").trim();
    if (!prompt) return message.reply(applyFont("💠 Que veux-tu que je fasse, joueur ? Pose une question ou demande une image. 🐱"));

    const lower = prompt.toLowerCase();

    // 🎨 SECTION GÉNÉRATION D'IMAGES
    if (lower.startsWith("imagine") || lower.startsWith("dessine") || lower.startsWith("draw")) {
      try {
        const textToImage = prompt.replace(/imagine|dessine|draw/i, "").trim();
        await message.reply("🎨 *Kyo Sôma prépare ses pinceaux...*");
        
        // Utilisation d'une API de génération d'image (Pollinations par exemple)
        const imgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(textToImage)}?width=1024&height=1024&seed=${Math.floor(Math.random() * 1000)}`;
        
        const stream = await global.utils.getStreamFromURL(imgUrl);
        return message.reply({
          body: applyFont(`💠 𝗜𝗺𝗮𝗴𝗲 𝗴𝗲́𝗻𝗲́𝗿𝗲́𝗲 𝗽𝗼𝘂𝗿 𝗞𝘆𝗼 𝗦𝗼̂𝗺𝗮\n🎨 𝗣𝗿𝗼𝗺𝗽𝘁: ${textToImage}`),
          attachment: stream
        });
      } catch (e) {
        return message.reply("❌ Erreur lors de la création de l'image.");
      }
    }

    // 🤖 SECTION INTELLIGENCE ARTIFICIELLE (TEXTE)
    try {
      const loading = await message.reply("🌀 *Analyse neuronale...*");
      
      const url = `https://haji-mix-api.gleeze.com/api/groq?ask=${encodeURIComponent(prompt)}&model=llama-3.3-70b-versatile&uid=${event.senderID}&RP=${encodeURIComponent(RP)}&stream=True`;
      const res = await axios.get(url, { timeout: 25000 });

      const raw = res.data?.answer || res.data?.result || "🤖 Vide intersidéral...";
      const styled = applyFont(`💠 𝗞𝗬𝗢 𝗦𝗢̂𝗠𝗔 𝗡𝗘𝗧𝗪𝗢𝗥𝗞\n━━━━━━━━━━━━━━\n${raw}\n━━━━━━━━━━━━━━\n🔥 𝗖𝗿𝗲́𝗲́ 𝗽𝗮𝗿 𝗞𝘆𝗼 𝗦𝗼̂𝗺𝗮`);

      api.unsendMessage(loading.messageID);
      return message.reply(styled);

    } catch (err) {
      return message.reply(applyFont("❌ Système instable. Réessaie plus tard."));
    }
  },

  onChat: async function ({ event, message, api }) {
    if (!event.body) return;
    const prefix = Prefixes.find(p => event.body.toLowerCase().startsWith(p.toLowerCase()));
    if (!prefix) return;
    const args = event.body.slice(prefix.length).trim().split(/\s+/);
    this.onStart({ message, args, event, api });
  },

  onReply: async function ({ event, message, Reply, api }) {
    if (event.senderID !== Reply.author) return;
    this.onStart({ message, args: event.body.trim().split(/\s+/), event, api });
  }
};
module.exports = nix;
