const nix = {
  name: "notification",
  version: "1.7",
  aliases: ["notify", "noti"],
  description: "Envoyer une notification à tous les groupes",
  author: "Testsuya Kuroko",
  prefix: true,
  category: "owner",
  type: "anyone",
  cooldown: 5,
  guide: "{pn} <message> - Envoie un message à tous les groupes"
};

async function onStart({ message, args, event, api, threadsData, getLang, commandName }) {
  const utils = global.utils;
  if (!utils) return message.reply("⚠️ Erreur : utils non disponible.");
  const { getStreamsFromAttachment } = utils;

  if (!args[0]) return message.reply("⚠️ Veuillez entrer un message à envoyer.");

  const allThreads = (await threadsData.getAll()).filter(t => t.isGroup && t.members.some(m => m.userID === api.getCurrentUserID()));
  message.reply(`⏳ Envoi de la notification à ${allThreads.length} groupes...`);

  const attachments = await getStreamsFromAttachment(
    [...(event.attachments || []), ...(event.messageReply?.attachments || [])]
      .filter(a => ["photo", "png", "animated_image", "video", "audio"].includes(a.type))
  );

  const formMessage = {
    body: `📢 Notification :\n────────────────\n${args.join(" ")}`,
    attachment: attachments
  };

  let sent = 0;
  let failed = [];
  for (const thread of allThreads) {
    try {
      await api.sendMessage(formMessage, thread.threadID);
      sent++;
    } catch (e) {
      failed.push(thread.threadID);
    }
    await new Promise(r => setTimeout(r, 250)); // delay per group
  }

  let replyMsg = `✅ Envoyé avec succès à ${sent} groupes`;
  if (failed.length > 0) replyMsg += `\n❌ Échec pour ${failed.length} groupes : ${failed.join(", ")}`;
  return message.reply(replyMsg);
}

module.exports = { nix, onStart };
