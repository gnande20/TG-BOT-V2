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
  guide: "{pn}callad <message> (répondre à une image facultatif)"
};

async function onStart({ bot, args = [], message, event }) {
  if (!message) message = { reply: (...text) => console.log(...text) };

  const senderID = event?.senderID;
  const threadID = event?.threadID;
  const isGroup = event?.isGroup || false;

  // ⚠️ Ton UID comme admin
  const admins = ["8286999004","-1003528587573"];
  bot.config = bot.config || {};
  bot.config.adminBot = admins;

  // Vérifie le message
  if (!args[0] && !event?.attachments?.length && !event?.messageReply?.attachments?.length) {
    return message.reply("⚠️ | Veuillez entrer un message ou répondre à un média.");
  }

  // Récupère le nom de l'utilisateur si disponible
  const senderName = event?.senderName || "Unknown";
  const threadName = isGroup ? (event?.threadName || "Group") : "";

  // Prépare les attachments
  let attachments = [];
  if (event?.attachments?.length) {
    attachments = attachments.concat(
      event.attachments.filter(a => mediaTypes.includes(a.type)).map(a => a.url)
    );
  }
  if (event?.messageReply?.attachments?.length) {
    attachments = attachments.concat(
      event.messageReply.attachments.filter(a => mediaTypes.includes(a.type)).map(a => a.url)
    );
  }

  // Prépare le message à envoyer à l'admin
  const msgHeader = `==📨 CALL ADMIN 2026 📨==\n- User: ${senderName}\n- UserID: ${senderID}` +
    (isGroup ? `\n- Group: ${threadName}` : "");

  const formMessage = {
    body: msgHeader + `\nContent: ${args.join(" ")}`,
    mentions: [{ id: senderID, tag: senderName }],
    attachment: attachments.length ? attachments : undefined
  };

  // Envoie à l’admin
  try {
    for (const adminID of admins) {
      await bot.api.sendMessage(formMessage, adminID);
    }
    message.reply(`✅ Message envoyé à l'admin (${admins.join(", ")}).`);
  } catch (err) {
    console.error(err);
    message.reply("❌ | Échec de l'envoi au admin.");
  }
}

module.exports = { nix, onStart };
