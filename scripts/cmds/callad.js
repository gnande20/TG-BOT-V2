const mediaTypes = ["photo", "png", "animated_image", "video", "audio"];

const nix = {
  name: "callad",
  version: "2026",
  aliases: ["calladmin", "contactadmin"],
  description: "Send reports or feedback to bot admin",
  author: "Testsuya Kuroko",
  prefix: true,
  category: "CONTACTS ADMIN",
  type: "anyone",
  cooldown: 5,
  guide: "{pn}callad <message>"
};

async function onStart({ bot, args = [], message, event, getLang, usersData, threadsData }) {
  if (!message) message = { reply: (...text) => console.log(...text) };

  const senderID = event?.senderID;
  const threadID = event?.threadID;
  const isGroup = event?.isGroup || false;
  const config = bot?.config || {};

  if (!args[0]) return message.reply(getLang("missingMessage"));
  if (!config.adminBot || config.adminBot.length === 0) return message.reply(getLang("noAdmin"));

  const senderName = await usersData.getName(senderID);
  const threadName = isGroup ? (await threadsData.get(threadID)).threadName : "";

  const msgHeader = `==📨 CALL ADMIN 2026 📨==\n- User: ${senderName}\n- UserID: ${senderID}` + (isGroup ? `\n- Group: ${threadName}` : "");
  const formMessage = {
    body: msgHeader + `\nContent: ${args.join(" ")}`,
    mentions: [{ id: senderID, tag: senderName }],
    attachment: [] // Simplifié: tu peux gérer les attachments si besoin
  };

  for (const adminID of config.adminBot) {
    try {
      await bot.api.sendMessage(formMessage, adminID);
    } catch (err) {
      console.error(`Failed to send to ${adminID}`, err);
    }
  }

  message.reply("✅ | Message sent to admin(s).");
}

module.exports = { nix, onStart };
