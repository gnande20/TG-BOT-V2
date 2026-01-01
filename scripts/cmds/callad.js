const { getStreamsFromAttachment, log } = global.utils;
const mediaTypes = ["photo", "png", "animated_image", "video", "audio"];

const nix = {
  name: "callad",
  aliases: ["calladmin", "contactadmin"],
  version: "2026 Edition",
  author: "Testsuya Kuroko",
  prefix: true,
  category: "CONTACTS ADMIN",
  type: "anyone",
  cooldown: 5,
  description: "Send reports, feedback, or bug reports to bot admin",
  guide: "callad <message>"
};

async function onStart({ args, message, event, usersData, threadsData, api, commandName, getLang, msg }) {
  const senderID = event?.senderID || message?.senderID || msg?.senderID;
  const threadID = event?.threadID || message?.threadID || msg?.threadID;
  const isGroup = event?.isGroup || false;
  const { config } = global.GoatBot;

  if (!args[0]) return message.reply(getLang("missingMessage"));

  if (!config.adminBot || config.adminBot.length == 0) {
    return message.reply(getLang("noAdmin"));
  }

  const senderName = await usersData.getName(senderID);
  const threadName = isGroup ? (await threadsData.get(threadID)).threadName : "";

  const msgHeader = "==📨 CALL ADMIN 2026 📨=="
    + `\n- User Name: ${senderName}`
    + `\n- User ID: ${senderID}`
    + (isGroup ? getLang("sendByGroup", threadName, threadID) : getLang("sendByUser"));

  const formMessage = {
    body: msgHeader + getLang("content", args.join(" ")),
    mentions: [{ id: senderID, tag: senderName }],
    attachment: await getStreamsFromAttachment(
      [...(event?.attachments || []), ...(event?.messageReply?.attachments || [])]
      .filter(item => mediaTypes.includes(item.type))
    )
  };

  const successIDs = [];
  const failedIDs = [];

  const adminNames = await Promise.all(config.adminBot.map(async id => ({
    id,
    name: await usersData.getName(id)
  })));

  for (const uid of config.adminBot) {
    try {
      const messageSend = await api.sendMessage(formMessage, uid);
      successIDs.push(uid);
      global.GoatBot.onReply.set(messageSend.messageID, {
        commandName,
        messageID: messageSend.messageID,
        threadID,
        messageIDSender: event?.messageID || message?.messageID || msg?.messageID,
        type: "userCallAdmin"
      });
    } catch (err) {
      failedIDs.push({ adminID: uid, error: err });
    }
  }

  let msg2 = "";
  if (successIDs.length > 0)
    msg2 += getLang("success", successIDs.length,
      adminNames.filter(a => successIDs.includes(a.id)).map(a => ` <@${a.id}> (${a.name})`).join("\n")
    );
  if (failedIDs.length > 0) {
    msg2 += getLang("failed", failedIDs.length,
      failedIDs.map(a => ` <@${a.adminID}> (${adminNames.find(x => x.id == a.adminID)?.name || a.adminID})`).join("\n")
    );
    log.err("CALL ADMIN", failedIDs);
  }

  return message.reply({
    body: msg2,
    mentions: adminNames.map(a => ({ id: a.id, tag: a.name }))
  });
}

async function onReply({ args, event, api, message, Reply, usersData, commandName, getLang }) {
  const senderID = event?.senderID;
  const senderName = await usersData.getName(senderID);
  const isGroup = event?.isGroup || false;

  const { type, threadID, messageIDSender } = Reply;

  switch (type) {
    case "userCallAdmin": {
      const formMessage = {
        body: getLang("reply", senderName, args.join(" ")),
        mentions: [{ id: senderID, tag: senderName }],
        attachment: await getStreamsFromAttachment(
          (event?.attachments || []).filter(a => mediaTypes.includes(a.type))
        )
      };
      api.sendMessage(formMessage, threadID, (err, info) => {
        if (err) return message.err(err);
        message.reply(getLang("replyUserSuccess"));
        global.GoatBot.onReply.set(info.messageID, {
          commandName,
          messageID: info.messageID,
          messageIDSender: event?.messageID || messageIDSender,
          threadID,
          type: "adminReply"
        });
      }, messageIDSender);
      break;
    }

    case "adminReply": {
      let sendByGroup = "";
      if (isGroup) {
        const { threadName } = await api.getThreadInfo(event.threadID);
        sendByGroup = getLang("sendByGroup", threadName, event.threadID);
      }
      const formMessage = {
        body: getLang("feedback", senderName, event.senderID, sendByGroup, args.join(" ")),
        mentions: [{ id: event.senderID, tag: senderName }],
        attachment: await getStreamsFromAttachment(
          (event?.attachments || []).filter(a => mediaTypes.includes(a.type))
        )
      };
      api.sendMessage(formMessage, threadID, (err, info) => {
        if (err) return message.err(err);
        message.reply(getLang("replySuccess"));
        global.GoatBot.onReply.set(info.messageID, {
          commandName,
          messageID: info.messageID,
          messageIDSender: event?.messageID || messageIDSender,
          threadID,
          type: "userCallAdmin"
        });
      }, messageIDSender);
      break;
    }

    default:
      break;
  }
}

module.exports = { nix, onStart, onReply };
