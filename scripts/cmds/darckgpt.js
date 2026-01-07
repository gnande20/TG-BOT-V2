const axios = require("axios");

const nix = {
  name: "darckgpt",
  version: "1.0",
  aliases: [],
  description: "Chat with a dark AI",
  author: "Aesther",
  prefix: true,
  category: "AI",
  type: "anyone",
  cooldown: 5,
  guide: "{pn}darckgpt <text>"
};

async function onStart({ bot, args = [], message, event }) {
  if (!message) message = { reply: (...text) => console.log(...text) };

  const prompt = args.join(" ");
  if (!prompt) return message.reply("⚠️ | Please enter a message for the dark AI.");

  try {
    const res = await axios.get(`https://api.nekorinn.my.id/ai/veniceai?text=${encodeURIComponent(prompt)}`);
    const answer = res.data.result;
    if (!answer) return message.reply("❌ | No response from AI.");

    const text = `🌑『 DARCKGPT 』🌑\n━━━━━━━━━━━━━━\n🧠 Question: ${prompt}\n💬 Answer:\n${answer}\n━━━━━━━━━━━━━━\n⚡ Powered by VeniceAI`;
    message.reply(text);
  } catch (err) {
    console.error(err);
    message.reply("❌ | Could not get AI response.");
  }
}

module.exports = { nix, onStart };
