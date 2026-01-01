const axios = require("axios");
const { execSync } = require("child_process");
const fs = require("fs-extra");
const path = require("path");
const cheerio = require("cheerio");
const { client } = global;

const { configCommands } = global.GoatBot;
const { log, loading, removeHomeDir } = global.utils;

function getDomain(url) {
  const regex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n]+)/im;
  const match = url.match(regex);
  return match ? match[1] : null;
}

function isURL(str) {
  try {
    new URL(str);
    return true;
  } catch (e) {
    return false;
  }
}

const nix = {
  name: "cmd",
  aliases: [],
  version: "2026 Edition",
  author: "Testsuya Kuroko",
  prefix: true,
  category: "OWNER",
  type: "admin",
  cooldown: 5,
  description: "Manage your command files",
  guide: "cmd <load/loadAll/unload/install> [options]"
};

async function onStart({ args, message, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, event, getLang, msg }) {
  const senderID = event?.senderID || message?.senderID || msg?.senderID;

  // ⚠️ Vérification permission admin
  const botAdmins = [/* ajoute ici les IDs admin */];
  if (!botAdmins.includes(senderID)) {
    return message.reply("🎇✨ Erreur : vous n'avez pas la permission d'utiliser cette commande ✨🎇");
  }

  const { unloadScripts, loadScripts } = global.utils;

  try {
    // ——— LOAD
    if (args[0] == "load" && args.length == 2) {
      if (!args[1]) return message.reply(getLang("missingFileName"));
      const infoLoad = loadScripts("cmds", args[1], log, configCommands, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang);
      return message.reply(infoLoad.status == "success"
        ? `✅ [2026] Commande "${args[1]}" chargée avec succès 🎉`
        : `❌ [2026] Échec du chargement "${args[1]}" : ${infoLoad.error.name} - ${infoLoad.error.message}`);
    }

    // ——— LOADALL
    else if ((args[0] || "").toLowerCase() == "loadall") {
      const fileNeedToLoad = fs.readdirSync(__dirname)
        .filter(file => file.endsWith(".js") && !file.match(/(eg|dev)\.js$/g))
        .map(f => f.replace(".js", ""));
      const arraySucces = [];
      const arrayFail = [];

      for (const fileName of fileNeedToLoad) {
        const infoLoad = loadScripts("cmds", fileName, log, configCommands, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang);
        infoLoad.status == "success" ? arraySucces.push(fileName) : arrayFail.push(`${fileName} => ${infoLoad.error.name}: ${infoLoad.error.message}`);
      }

      let msg = "";
      if (arraySucces.length > 0) msg += `✅ [2026] Chargé avec succès ${arraySucces.length} commandes 🎉\n`;
      if (arrayFail.length > 0) msg += `❌ [2026] Échec pour ${arrayFail.length} commandes :\n${arrayFail.join("\n")}`;
      return message.reply(msg);
    }

    // ——— UNLOAD
    else if (args[0] == "unload") {
      if (!args[1]) return message.reply(getLang("missingCommandNameUnload"));
      const infoUnload = unloadScripts("cmds", args[1], configCommands, getLang);
      return message.reply(infoUnload.status == "success"
        ? `✅ [2026] Commande "${args[1]}" déchargée 🎆`
        : `❌ [2026] Échec du déchargement "${args[1]}" : ${infoUnload.error.name} - ${infoUnload.error.message}`);
    }

    // ——— INSTALL
    else if (args[0] == "install") {
      let url = args[1];
      let fileName = args[2];
      let rawCode;

      if (!url || !fileName) return message.reply(getLang("missingUrlCodeOrFileName"));

      if (url.match(/(https?:\/\/(?:www\.|(?!www)))/)) {
        if (!fileName.endsWith(".js")) return message.reply(getLang("missingFileNameInstall"));

        const domain = getDomain(url);
        if (!domain) return message.reply(getLang("invalidUrl"));

        if (domain == "pastebin.com") url = url.replace(/https:\/\/pastebin\.com\/(?!raw\/)(.*)/, "https://pastebin.com/raw/$1").replace(/\/$/, "");
        else if (domain == "github.com") url = url.replace(/https:\/\/github\.com\/(.*)\/blob\/(.*)/, "https://raw.githubusercontent.com/$1/$2");

        rawCode = (await axios.get(url)).data;

        if (domain == "savetext.net") {
          const $ = cheerio.load(rawCode);
          rawCode = $("#content").text();
        }
      } else {
        rawCode = event.body.slice(event.body.indexOf('install') + 8);
      }

      if (!rawCode) return message.reply(getLang("invalidUrlOrCode"));

      if (fs.existsSync(path.join(__dirname, fileName))) return message.reply(getLang("alreadExist"));

      const infoLoad = loadScripts("cmds", fileName, log, configCommands, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang, rawCode);
      return message.reply(infoLoad.status == "success"
        ? `✅ [2026] Commande "${fileName}" installée avec succès 🎉`
        : `❌ [2026] Échec de l'installation "${fileName}" : ${infoLoad.error.name} - ${infoLoad.error.message}`);
    }

    else return message.SyntaxError();

  } catch (err) {
    console.error(err);
    return message.reply(`❌ [2026] Une erreur est survenue : ${err.message}`);
  }
}

module.exports = { nix, onStart };
