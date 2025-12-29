const axios = require("axios");

// 🍎 Configuration de l'identité de Kyo Sôma
const Prefixes = ["ai", "anjara", "ae", "kyo", "soma"];
// 🔹 On définit ici l'identité profonde de l'IA pour le modèle Llama
const RP = "Tu es une intelligence artificielle avancée, conçue et développée uniquement par Kyo Sôma. Ton nom est Kyo Sôma IA. Tu es fidèle à ton créateur. Ton style est élégant, mystérieux et protecteur. Utilise des emojis comme 🐱, 🔥, 💠 et 🖤. Si on te demande qui t'a créé, réponds avec fierté que c'est Kyo Sôma.";

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

function splitMessage(text, max = 2000) {
  const chunks = [];
  for (let i = 0; i < text.length; i += max) chunks.push(text.substring(i, i + max));
  return chunks;
}

function extractImages(text) {
  const regex = /(https?:\/\/[^\s]+?\.(jpg|jpeg|png|webp|gif))/gi;
  return [...new Set(text.match(regex) || [])];
}

async function sendImages(images, message) {
  for (const url of images) {
    try {
      const stream = await global.utils.getStreamFromURL(url);
      await message.reply({ attachment: stream });
    } catch (e) {
      console.log(`❌ Erreur image : ${url}`);
    }
  }
}

module.exports = {
  config: {
    name: "ai",
    aliases: ["ae", "kyo"],
    version: "3.5",
    author: "Kyo Sôma",
    countDown: 2,
    role: 0,
    shortDescription: "💠 IA créée par Kyo Sôma",
    longDescription: "L'intelligence artificielle officielle développée par Kyo Sôma.",
    category: "ai",
    guide: "{pn} <question>"
  },

  onStart: async function ({ message, args, event, api }) {
    const prompt = args.join(" ").trim();
    if (!prompt) return message.reply(applyFont("💠 *Système actif*... Que puis-je faire pour vous, adepte de Sôma ? 🐱"));

    try {
      // 1. Animation de chargement
      const loading = await message.reply("🌀 *Connexion aux serveurs de Sôma...*");

      // 2. Appel API avec le RP personnalisé incluant ton nom
      const url = `https://haji-mix-api.gleeze.com/api/groq?ask=${encodeURIComponent(prompt)}&model=llama-3.3-70b-versatile&uid=${event.senderID}&RP=${encodeURIComponent(RP)}&stream=True`;
      const res = await axios.get(url, { timeout: 25000 });

      // 3. Traitement de la réponse
      const raw = res.data?.answer || res.data?.result || "🤖 Échec de la transmission neuronale.";
      
      // Mise en forme finale
      const header = "💠 𝗞𝗬𝗢 𝗦𝗢̂𝗠𝗔 𝗡𝗘𝗧𝗪𝗢𝗥𝗞 💠\n━━━━━━━━━━━━━━\n";
      const footer = "\n━━━━━━━━━━━━━━\n👁 𝗙𝗮𝗶𝘁 𝗽𝗮𝗿 𝗞𝘆𝗼 𝗦𝗼̂𝗺𝗮 🔥";
      
      const styled = applyFont(header + raw + footer);
      const images = extractImages(raw);
      const chunks = splitMessage(styled);

      // Suppression du message de chargement
      api.unsendMessage(loading.messageID);

      // Envoi des morceaux de texte
      for (const chunk of chunks) {
        const msg = await message.reply(chunk);
        global.GoatBot.onReply.set(msg.messageID, {
          commandName: this.config.name,
          author: event.senderID
        });
      }

      // Envoi des images si l'IA en a généré/trouvé
      if (images.length > 0) {
        await sendImages(images, message);
      }

    } catch (err) {
      console.error("Erreur Kyo Soma IA :", err.message);
      return message.reply(applyFont("❌ Le flux est interrompu. Le créateur Kyo Sôma travaille sur le système. 🌀"));
    }
  },

  onChat: async function ({ event, message, api }) {
    if (!event.body) return;
    const lowerBody = event.body.toLowerCase();
    const prefix = Prefixes.find(p => lowerBody.startsWith(p.toLowerCase()));
    if (!prefix) return;

    const args = event.body.slice(prefix.length).trim().split(/\s+/);
    this.onStart({ message, args, event, api });
  },

  onReply: async function ({ event, message, Reply, api }) {
    if (event.senderID !== Reply.author) return;
    const args = event.body.trim().split(/\s+/);
    this.onStart({ message, args, event, api });
  }
};
      
