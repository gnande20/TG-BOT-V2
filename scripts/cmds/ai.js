const axios = require("axios");
const fs = require("fs");
const path = require("path");

// ================= MÉMOIRE =================
const memoryFile = path.join(__dirname, "../../data/kyosoma_memory.json");

function loadMemory() {
  if (!fs.existsSync(memoryFile)) return {};
  return JSON.parse(fs.readFileSync(memoryFile, "utf8"));
}

function saveMemory(memory) {
  fs.writeFileSync(memoryFile, JSON.stringify(memory, null, 2));
}

// ================= API =================
async function getAIResponse(prompt, userName, history) {
  try {
    const res = await axios.get(
      "https://arychauhann.onrender.com/api/gemini-proxy2",
      {
        params: {
          prompt: `Tu es Kyo Soma (Fruits Basket).
Tu es calme, respectueux et honnête.
Tu respectes toujours les utilisateurs.
Tu te souviens des messages précédents.
Ton créateur est Kyo Soma.

Historique :
${history}

Utilisateur (${userName}) : ${prompt}`
        },
        timeout: 20000
      }
    );

    return (
      res.data?.result ||
      res.data?.reply ||
      "Je n’ai rien à dire pour l’instant."
    );
  } catch {
    return "Je rencontre un problème technique.";
  }
}

// ================= REGEX =================
const creatorRegex =
  /(qui\s+(t'?a|t’a)\s+cr(é|e)é|ton\s+cr(é|e)ateur|qui\s+ta\s+fait|qui\s+est\s+ton\s+createur)/i;

// ================= CMD NIX =================
module.exports = {
  nix: {
    name: "ai", // ✅ VRAIE CMD
    version: "6.0",
    author: "Kyo Soma",
    description: "Parler avec Kyo Soma (IA avec mémoire)",
    category: "ai",
    guide: "ai <question>",
    prefix: true, // ✅ OBLIGATOIRE
    cooldown: 5,
    type: "anyone",

    onStart: async function ({ api, event, args, message }) {
      const input = args.join(" ").trim();
      const userId = event.senderID;

      if (!input) {
        return message.reply(
          "😾 Kyo Soma :\n\n" +
          "Utilisation :\n" +
          "👉 ai <ta question>"
        );
      }

      let memory = loadMemory();

      if (!memory[userId]) {
        memory[userId] = {
          name: "ami",
          history: []
        };
      }

      if (creatorRegex.test(input)) {
        return message.reply(
          "😾 Kyo Soma :\n\nMon créateur est **Kyo Soma**."
        );
      }

      api.getUserInfo(userId, async (err, data) => {
        if (!err && data[userId]?.name) {
          memory[userId].name = data[userId].name;
        }

        memory[userId].history.push(`Utilisateur : ${input}`);
        if (memory[userId].history.length > 5)
          memory[userId].history.shift();

        saveMemory(memory);

        const reply = await getAIResponse(
          input,
          memory[userId].name,
          memory[userId].history.join("\n")
        );

        message.reply(`😾 Kyo Soma :\n\n${reply}`);
      });
    }
  }
};
