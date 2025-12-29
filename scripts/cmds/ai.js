const axios = require("axios");

const Prefixes = [
  "/ai",
  "gear",
  "préscilia ",
  "+ai",
  "shinmon",
  "ai",
  "ask"
];

module.exports = {
  config: {
    name: "ai",
    version: "1.2",
    author: "OtinXSandip ✦ Decor by Kyo soma",
    longDescription: "Assistant IA — Kyo Soma",
    category: "ai",
    guide: {
      en: "{p} <question>",
    },
  },

  onStart: async function () {},

  onChat: async function ({ event, message }) {
    try {
      const prefix = Prefixes.find(
        (p) => event.body && event.body.toLowerCase().startsWith(p)
      );
      if (!prefix) return;

      const prompt = event.body.substring(prefix.length).trim();

      if (!prompt) {
        return message.reply(
`╭───〔 🔥 𝗞𝗬𝗢 𝗦𝗢𝗠𝗔 • 𝗔𝗜 〕───╮
│
│ ❓ Pose-moi une question
│ ✍️ Exemple :
│    ai Explique-moi l’IA
│
╰────────────────────╯`
        );
      }

      const response = await axios.get(
        `https://sandipbaruwal.onrender.com/gpt?prompt=${encodeURIComponent(prompt)}`
      );

      const answer = response.data.answer;

      await message.reply(
`╭───〔 🔥 𝗞𝗬𝗢 𝗦𝗢𝗠𝗔 • 𝗔𝗜 〕───╮
│
│ 🧠 Question :
│ ${prompt}
│
│ 💬 Réponse :
│ ${answer}
│
╰───〔 ⚡ 𝗞𝗬𝗢 𝗦𝗢𝗠𝗔 〕───╯`
      );

    } catch (error) {
      console.error("Kyo Soma AI Error:", error.message);
      message.reply("❌ Kyo Soma est momentanément indisponible.");
    }
  }
};
