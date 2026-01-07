const { getStreamsFromAttachment, log } = global.utils;
const mediaTypes = ["photo", "png", "animated_image", "video", "audio"];

const nix = {
  name: "callad",
  aliases: ["calladmin", "contactadmin"],
  version: "2026 Edition",
  author: "Testsuya Kuroko",
  prefix: true,
  category: "CONTACTS ADMIN",
  role: 0,
  cooldown: 5,
  description: "Send reports, feedback, or bug reports to bot admin",
  guide: "callad <message>"
};

module.exports = {
  // 🔹 Utilisé par le HELP
  config: { ...nix },

  // 🔹 Ton style perso conservé
  nix,

  async onStart({ args, message, event, usersData, threadsData, api, commandName, getLang, msg }) {
    // ton code inchangé
  },

  async onReply({ args, event, api, message, Reply, usersData, commandName, getLang }) {
    // ton code inchangé
  }
};
