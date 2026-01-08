const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const cheerio = require("cheerio");

const nix = {
  name: "cmd",
  version: "1.17",
  aliases: [],
  description: "Manage command files: load, unload, install",
  author: "Chitron Bhattacharjee",
  prefix: true,
  category: "owner",
  type: "anyone",
  cooldown: 5,
  guide: "{pn} load <file>\n{pn} unload <file>\n{pn} install <url/code> <file>"
};

async function onStart({ bot, args = [], message, event, getLang }) {
  if (!message) message = { reply: (...text) => console.log(...text) };

  const subCommand = (args[0] || "").toLowerCase();

  // 🔹 Vérification utils exist
  const utils = global.utils || {};
  const GoatBot = global.GoatBot || {};
  const loadScripts = utils.loadScripts || (async () => ({ status: "failed", error: new Error("loadScripts missing") }));
  const unloadScripts = utils.unloadScripts || (async () => ({ status: "failed", error: new Error("unloadScripts missing") }));
  const log = utils.log || { dev: () => {} };

  try {
    // ——— LOAD ———
    if (subCommand === "load") {
      const fileName = args[1];
      if (!fileName) return message.reply(getLang ? getLang("missingFileName") : "⚠️ | Missing file name.");
      const infoLoad = await loadScripts("cmds", fileName, log, GoatBot.configCommands || {}, bot, null, null, null, null, null, null, getLang);
      return message.reply(infoLoad.status === "success"
        ? (getLang ? getLang("loaded", infoLoad.name) : `✅ Loaded ${infoLoad.name}`)
        : `❌ Failed to load ${infoLoad.name}: ${infoLoad.error?.message || infoLoad.error}`
      );
    }

    // ——— UNLOAD ———
    if (subCommand === "unload") {
      const fileName = args[1];
      if (!fileName) return message.reply(getLang ? getLang("missingCommandNameUnload") : "⚠️ | Missing command name.");
      const infoUnload = await unloadScripts("cmds", fileName, GoatBot.configCommands || {}, getLang);
      return message.reply(infoUnload.status === "success"
        ? (getLang ? getLang("unloaded", infoUnload.name) : `✅ Unloaded ${infoUnload.name}`)
        : `❌ Failed to unload ${infoUnload.name}: ${infoUnload.error?.message || infoUnload.error}`
      );
    }

    // ——— INSTALL ———
    if (subCommand === "install") {
      let urlOrCode = args[1];
      let fileName = args[2];
      if (!urlOrCode || !fileName) return message.reply(getLang ? getLang("missingUrlCodeOrFileName") : "⚠️ | Missing URL/code or file name.");

      let rawCode;
      if (urlOrCode.startsWith("http")) {
        const domain = new URL(urlOrCode).hostname;
        if (!fileName.endsWith(".js")) return message.reply(getLang ? getLang("missingFileNameInstall") : "⚠️ | File name must end with .js");

        if (domain === "pastebin.com") urlOrCode = urlOrCode.replace(/https:\/\/pastebin\.com\/(?!raw\/)(.*)/, "https://pastebin.com/raw/$1");
        if (domain === "github.com") urlOrCode = urlOrCode.replace(/https:\/\/github\.com\/(.*)\/blob\/(.*)/, "https://raw.githubusercontent.com/$1/$2");

        const res = await axios.get(urlOrCode);
        rawCode = res.data;

        if (domain === "savetext.net") {
          const $ = cheerio.load(rawCode);
          rawCode = $("#content").text();
        }
      } else {
        rawCode = event?.body?.slice(event.body.indexOf(fileName) + fileName.length + 1) || "";
      }

      if (!rawCode) return message.reply(getLang ? getLang("invalidUrlOrCode") : "⚠️ | Cannot get code.");

      const infoLoad = await loadScripts("cmds", fileName, log, GoatBot.configCommands || {}, bot, null, null, null, null, null, null, getLang, rawCode);
      return message.reply(infoLoad.status === "success"
        ? (getLang ? getLang("installed", infoLoad.name, path.join(__dirname, fileName)) : `✅ Installed ${infoLoad.name}`)
        : `❌ Failed to install ${infoLoad.name}: ${infoLoad.error?.message || infoLoad.error}`
      );
    }

    return message.reply("⚠️ | Unknown sub-command. Use load, unload, or install.");
  } catch (err) {
    console.error(err);
    return message.reply(`⚠️ | Error: ${err.message || err}`);
  }
}

module.exports = { nix, onStart };
