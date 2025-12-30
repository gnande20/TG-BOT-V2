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

// ================= NIX =================
const nix = {
  name: "ai",
  version: "1.0",
  aliases: ["kyo", "kyosoma", "kyo soma"],
  description: "Parler avec Kyo Soma (IA avec mémoire)",
  author: "Kyo Soma",
  prefix: true,
  category: "ai",
  type: "anyone",
  cooldown: 5,
  guide: "ai <question>"
};

async function onStart({ bot, args, message, msg, usages }) {
  const input = args.join(" ").trim();
  const userId = msg.senderID;

  if (!input) {
    return message.reply("😾 Kyo Soma :\n\nUtilisation : ai <ta question>");
  }

  let memory = loadMemory();
  if (!memory[userId]) {
    memory[userId] = { name: "ami", history: [] };
  }

  // Réponse spéciale si on parle du créateur
  if (creatorRegex.test(input)) {
    return message.reply("😾 Kyo Soma :\n\nJe n’oublierai jamais que mon créateur est **Kyo Soma**.");
  }

  // Mise à jour du nom utilisateur si disponible
  bot.getUserInfo(userId, async (err, data) => {
    if (!err && data[userId]?.name) {
      memory[userId].name = data[userId].name;
    }

    // Historique
    memory[userId].history.push(`Utilisateur : ${input}`);
    if (memory[userId].history.length > 5) memory[userId].history.shift();
    saveMemory(memory);

    // Récupération réponse AI
    const reply = await getAIResponse(
      input,
      memory[userId].name,
      memory[userId].history.join("\n")
    );

    message.reply(`😾 Kyo Soma :\n\n${reply}`);
  });
}

module.exports = { nix, onStart };
