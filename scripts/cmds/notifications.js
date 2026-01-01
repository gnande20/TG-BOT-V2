const { getStreamsFromAttachment } = global.utils;

const nix = {
  name: "notification",
  aliases: ["notify", "noti"],
  version: "2026 Edition",
  author: "Testsuya Kuroko",
  prefix: true,
  category: "OWNER",
  type: "admin",
  cooldown: 5,
  description: "Send notification from admin to all groups",
  guide: "notification <message>",
  envConfig: {
    delayPerGroup: 250
  }
};

async function onStart({ message, api, event, args, commandName, envCommands, threadsData, getLang, msg }) {
  const senderID = event?.senderID || message?.senderID || msg?.senderID;
  const { delayPerGroup } = envCommands[commandName];

  // ⚠️ Vérification permission admin
  const botAdmins = [/* ajoute ici les IDs admin */];
  if (!botAdmins.includes(senderID)) {
    return message.reply("🎇✨ Erreur : vous n'avez pas la permission d'envoyer une notification ✨🎇");
  }

  if (!args[0]) return message.reply(getLang("missingMessage"));

  const formSend = {
    body: `🎉 Nouvel An 2026 🎉\n────────────────\n${args.join(" ")}`,
    attachment: await getStreamsFromAttachment(
      [
        ...(event?.attachments || []),
        ...(event?.messageReply?.attachments || [])
      ].filter(item => ["photo", "png", "animated_image", "video", "audio"].includes(item.type))
    )
  };

  // Récupérer tous les groupes où le bot est présent
  const allThreadID = (await threadsData.getAll())
    .filter(t => t.isGroup && t.members.find(m => m.userID == api.getCurrentUserID())?.inGroup);

  message.reply(`🎆 ${getLang("sendingNotification", allThreadID.length)} 🎆`);

  let sendSuccess = 0;
  const sendError = [];
  const waitingSend = [];

  for (const thread of allThreadID) {
    const tid = thread.threadID;
    try {
      waitingSend.push({
        threadID: tid,
        pending: api.sendMessage(formSend, tid)
      });
      await new Promise(resolve => setTimeout(resolve, delayPerGroup));
    } catch (e) {
      sendError.push(tid);
    }
  }

  for (const sended of waitingSend) {
    try {
      await sended.pending;
      sendSuccess++;
    } catch (e) {
      const { errorDescription } = e;
      if (!sendError.some(item => item.errorDescription == errorDescription)) {
        sendError.push({
          threadIDs: [sended.threadID],
          errorDescription
        });
      } else {
        sendError.find(item => item.errorDescription == errorDescription).threadIDs.push(sended.threadID);
      }
    }
  }

  let msgReport = "";
  if (sendSuccess > 0) msgReport += `✅ Notification envoyée à ${sendSuccess} groupes 🎉\n`;
  if (sendError.length > 0) {
    msgReport += `❌ Erreurs lors de l'envoi à ${sendError.reduce((a,b) => a + b.threadIDs.length,0)} groupes :\n`;
    msgReport += sendError.reduce((a,b) => a + `\n - ${b.errorDescription}\n   + ${b.threadIDs.join("\n   + ")}`, "");
  }

  message.reply(msgReport);
}

module.exports = { nix, onStart };
