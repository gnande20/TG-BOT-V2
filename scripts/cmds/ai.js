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
async function getAIResponse(input, userName, history) {
  try {
    const res = await axios.get("https://arychauhann.onrender.com/api/gemini-proxy2", {
      params: {
        prompt: `Tu es une IA créé par Kyo soma et tu te souviens des messages précédents.

Historique :
${history}

Utilisateur (${userName}) : ${input}`
      },
      timeout: 20000
    });

    return res.data?.result || res.data?.reply || "Je ne peux pas répondre pour l’instant.";
  } catch {
    return "❌ Une erreur est survenue lors de la requête AI.";
  }
}

// ================= REGEX =================
const creatorRegex =
  /(qui\s+(t'?a|t’a)\s+cr(é|e)é|ton\s+cr(é|e)ateur|qui\s+ta\s+fait|qui\s+est\s+ton\s+createur)/i;

// ================= CMD NIX =================
module.exports = {
  nix: {
    name: "ai",
    aliases: ["kyo", "kyosoma", "kyo soma"],
    version: "1.0",
    author: "Kyo Soma",
    category: "ai",
    shortDescription: "Parler avec Kyo Soma (IA avec mémoire)",
    longDescription: "Pose des questions à Kyo Soma, il se souvient des messages précédents.",
    guide: "ai <question>",
    prefix: true,
    cooldown: 5,
    type: "anyone",

    onStart: async function ({ api, event, args, message }) {
      const input = args.join(" ").trim();
      const userId = event.senderID;

      if (!input) {
        return message.reply(
          "😾 Kyo Soma :\n\nUtilisation : ai <ta question>"
        );
      }

      let memory = loadMemory();
      if (!memory[userId]) {
        memory[userId] = {
          name: "ami",
          history: []
        };
      }

      // Réponse spéciale sur le créateur
      if (creatorRegex.test(input)) {
        return message.reply(
          "😾 Kyo Soma :\n\nJe n’oublierai jamais que mon créateur est **Kyo Soma**."
        );
      }

      // Mise à jour du nom utilisateur si disponible
      api.getUserInfo(userId, async (err, data) => {
        if (!err && data[userId]?.name) {
          memory[userId].name = data[userId].name;
        }

        // Ajout à l'historique
        memory[userId].history.push(`Utilisateur : ${input}`);
        if (memory[userId].history.length > 5) memory[userId].history.shift();
        saveMemory(memory);

        // Récupération de la réponse AI
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
