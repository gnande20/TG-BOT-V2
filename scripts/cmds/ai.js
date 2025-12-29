const axios = require("axios");

const nix = {
  name: "ai",
  version: "1.0.0",
  aliases: ["ask", "kyo"],
  description: "Assistant IA — Kyo Soma",
  author: "Kyo Soma",
  prefix: true,
  category: "ai",
  type: "anyone",
  cooldown: 5,
  guide: "ai <question>"
};

async function onStart({ args, message }) {
  try {
    const prompt = args.join(" ");

    if (!prompt) {
      return message.reply(
`╭───〔 🔥 𝗞𝗬𝗢 𝗦𝗢𝗠𝗔 • 𝗔𝗜 〕───╮
│
│ ❓ Pose-moi une question
│ ✍️ Exemple :
│    ai C’est quoi une IA ?
│
╰────────────────────╯`
      );
    }

    const response = await axios.get(
      `https://sandipbaruwal.onrender.com/gpt?prompt=${encodeURIComponent(prompt)}`
    );

    const answer = response.data.answer;

    return message.reply(
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
    return message.reply("❌ Kyo Soma est indisponible pour le moment.");
  }
}

module.exports = { nix, onStart };
