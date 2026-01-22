const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const cheerio = require("cheerio");
const { execSync } = require("child_process");

const { client } = global;
const { log, loading, removeHomeDir } = global.utils;
const { configCommands } = global.GoatBot;

/* ======================= UTILS ======================= */

function getDomain(url) {
  const regex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n]+)/im;
  const match = url.match(regex);
  return match ? match[1] : null;
}

function isURL(str) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

/* ======================= NIX ======================= */

const nix = {
  name: "cmd",
  version: "1.17",
  aliases: [],
  description: "Manage command files (load / unload / install)",
  author: "NTKhang",
  prefix: true,
  category: "owner",
  type: "admin",
  cooldown: 5,
  guide:
    "{pn}cmd load <file>\n" +
    "{pn}cmd loadAll\n" +
    "{pn}cmd unload <file>\n" +
    "{pn}cmd install <url|code> <file.js>"
};

/* ======================= MAIN ======================= */

async function onStart({
  args,
  message,
  api,
  event,
  commandName,
  getLang,
  threadModel,
  userModel,
  dashBoardModel,
  globalModel,
  threadsData,
  usersData,
  dashBoardData,
  globalData
}) {
  const { loadScripts, unloadScripts } = global.utils;

  /* ---------- LOAD ---------- */
  if (args[0] === "load" && args[1]) {
    const info = loadScripts(
      "cmds",
      args[1],
      log,
      configCommands,
      api,
      threadModel,
      userModel,
      dashBoardModel,
      globalModel,
      threadsData,
      usersData,
      dashBoardData,
      globalData,
      getLang
    );

    return info.status === "success"
      ? message.reply(`✅ | Command "${info.name}" loaded`)
      : message.reply(`❌ | Load failed\n${info.error.message}`);
  }

  /* ---------- LOAD ALL ---------- */
  if (args[0]?.toLowerCase() === "loadall") {
    const files = fs.readdirSync(__dirname)
      .filter(f => f.endsWith(".js"))
      .map(f => f.replace(".js", ""));

    let ok = 0, fail = 0;

    for (const file of files) {
      const info = loadScripts(
        "cmds",
        file,
        log,
        configCommands,
        api,
        threadModel,
        userModel,
        dashBoardModel,
        globalModel,
        threadsData,
        usersData,
        dashBoardData,
        globalData,
        getLang
      );
      info.status === "success" ? ok++ : fail++;
    }

    return message.reply(`✅ Loaded: ${ok}\n❌ Failed: ${fail}`);
  }

  /* ---------- UNLOAD ---------- */
  if (args[0] === "unload" && args[1]) {
    const info = unloadScripts("cmds", args[1], configCommands, getLang);
    return message.reply(`🗑️ | Command "${info.name}" unloaded`);
  }

  /* ---------- INSTALL ---------- */
  if (args[0] === "install") {
    let url = args[1];
    let fileName = args[2];
    let rawCode;

    if (!url || !fileName)
      return message.reply("⚠️ | install <url|code> <file.js>");

    if (isURL(url)) {
      const domain = getDomain(url);

      if (domain === "github.com")
        url = url.replace("github.com", "raw.githubusercontent.com").replace("/blob/", "/");

      rawCode = (await axios.get(url)).data;

      if (domain === "savetext.net") {
        const $ = cheerio.load(rawCode);
        rawCode = $("#content").text();
      }
    } else {
      rawCode = event.body.slice(event.body.indexOf("install") + 8);
    }

    if (!rawCode)
      return message.reply("❌ | Invalid url or code");

    const info = loadScripts(
      "cmds",
      fileName.replace(".js", ""),
      log,
      configCommands,
      api,
      threadModel,
      userModel,
      dashBoardModel,
      globalModel,
      threadsData,
      usersData,
      dashBoardData,
      globalData,
      getLang,
      rawCode
    );

    return info.status === "success"
      ? message.reply(`✅ Installed "${fileName}"`)
      : message.reply(`❌ Install failed\n${info.error.message}`);
  }

  return message.reply("❓ | Syntax error");
}

/* ======================= EXPORT ======================= */

module.exports = { nix, onStart };
