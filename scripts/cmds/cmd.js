const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const cheerio = require("cheerio");
const { execSync } = require("child_process");

const { utils, GoatBot, client } = global;

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

async function onStart({ bot, args = [], message, msg, usages, getLang, event }) {
  if (!message) message = { reply: (...text) => console.log(...text) };

  const subCommand = (args[0] || "").toLowerCase();
  const { loadScripts, unloadScripts, log } = utils;

  try {
    // ——— LOAD ———
    if (subCommand === "load") {
      const fileName = args[1];
      if (!fileName) return message.reply(getLang("missingFileName"));
      const infoLoad = loadScripts("cmds", fileName, log, GoatBot.configCommands, bot, null, null, null, null, null, null, getLang);
      return message.reply(infoLoad.status === "success"
        ? getLang("loaded", infoLoad.name)
        : getLang("loadedError", infoLoad.name, infoLoad.error.name, infoLoad.error.message)
      );
    }

    // ——— UNLOAD ———
    if (subCommand === "unload") {
      const fileName = args[1];
      if (!fileName) return message.reply(getLang("missingCommandNameUnload"));
      const infoUnload = unloadScripts("cmds", fileName, GoatBot.configCommands, getLang);
      return message.reply(infoUnload.status === "success"
        ? getLang("unloaded", infoUnload.name)
        : getLang("unloadedError", infoUnload.name, infoUnload.error.name, infoUnload.error.message)
      );
    }

    // ——— INSTALL ———
    if (subCommand === "install") {
      let urlOrCode = args[1];
      let fileName = args[2];
      if (!urlOrCode || !fileName) return message.reply(getLang("missingUrlCodeOrFileName"));

      let rawCode;

      if (urlOrCode.startsWith("http")) {
        const domain = new URL(urlOrCode).hostname;
        if (!fileName.endsWith(".js")) return message.reply(getLang("missingFileNameInstall"));

        // Convert URLs for Pastebin / GitHub
        if (domain === "pastebin.com") urlOrCode = urlOrCode.replace(/https:\/\/pastebin\.com\/(?!raw\/)(.*)/, "https://pastebin.com/raw/$1");
        if (domain === "github.com") urlOrCode = urlOrCode.replace(/https:\/\/github\.com\/(.*)\/blob\/(.*)/, "https://raw.githubusercontent.com/$1/$2");

        rawCode = (await axios.get(urlOrCode)).data;
        if (domain === "savetext.net") {
          const $ = cheerio.load(rawCode);
          rawCode = $("#content").text();
        }
      } else {
        rawCode = event?.body.slice(event.body.indexOf(fileName) + fileName.length + 1);
      }

      if (!rawCode) return message.reply(getLang("invalidUrlOrCode"));

      const infoLoad = loadScripts("cmds", fileName, log, GoatBot.configCommands, bot, null, null, null, null, null, null, getLang, rawCode);
      return message.reply(infoLoad.status === "success"
        ? getLang("installed", infoLoad.name, path.join(__dirname, fileName))
        : getLang("installedError", infoLoad.name, infoLoad.error.name, infoLoad.error.message)
      );
    }

    // ——— UNKNOWN ———
    return message.reply("⚠️ | Unknown sub-command. Use load, unload, or install.");
  } catch (err) {
    console.error(err);
    return message.reply(`⚠️ | Error: ${err.message || err}`);
  }
}

module.exports = { nix, onStart };
