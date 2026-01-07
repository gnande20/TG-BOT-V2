const nix = {
  name: "notification",
  version: "1.8",
  aliases: ["notify", "noti"],
  description: "Envoyer une notification à tous les groupes",
  author: "Testsuya Kuroko",
  prefix: true,
  category: "owner",
  type: "anyone",
  cooldown: 5,
  guide: "{pn} <message> - Envoie un message à tous les groupes"
};

async function onStart({ message, args, event, threadsData }) {
  const api = global.client?.api;
  const botID = global.client?.userID;

  if (!api || !botID) {
    return message.reply("❌ API du bot indisponible.");
  }

  if (!args.length && !(event.attachments || event.messageReply?.attachments)) {
    return message.reply("⚠️ Entrez un message ou joignez un média.");
  }

  // 🔐 OWNER ONLY
  const permission = ["8286999004", ""];
  if (!permission.includes(event.senderID)) {
    return message.reply("🚫 Commande réservée au propriétaire.");
  }

  // 📌 Tous les groupes
  const allThreads = (await threadsData.getAll()).filter(
    t => t.isGroup && t.members?.some(m => m.userID === botID)
  );

  await message.reply(`⏳ Notification en cours (${allThreads.length} groupes)...`);

  // 📎 Pièces jointes (URL directes)
  const attachments = [
    ...(event.attachments || []),
    ...(event.messageReply?.attachments || [])
  ].filter(a =>
    ["photo", "animated_image", "video", "audio"].includes(a.type)
  ).map(a => a.url);

  const formMessage = {
    body: `📢 Notification\n━━━━━━━━━━━━━━\n${args.join(" ")}`,
    attachment: attachments.length ? attachments : undefined
  };

  let sent = 0;
  let failed = 0;

  for (const thread of allThreads) {
    try {
      await api.sendMessage(formMessage, thread.threadID);
      sent++;
    } catch {
      failed++;
    }
    await new Promise(r => setTimeout(r, 350));
  }

  let result = `✅ Envoyé à ${sent} groupes.`;
  if (failed) result += `\n❌ Échec : ${failed} groupes.`;

  return message.reply(result);
}

module.exports = { nix, onStart };
