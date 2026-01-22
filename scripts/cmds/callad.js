const { getStreamsFromAttachment, log } = global.utils;

const mediaTypes = ["photo", "png", "animated_image", "video", "audio"];

const nix = {
  name: "callad",
  version: "1.7",
  aliases: [],
  description: "Send report / feedback / bug to bot admin",
  author: "NTKhang",
  prefix: true,
  category: "utility",
  type: "anyone",
  cooldown: 5,
  guide: "{pn}callad <message>"
};

const langs = {
  vi: {
    missingMessage: "Vui lòng nhập tin nhắn bạn muốn gửi về admin",
    sendByGroup: "\n- Được gửi từ nhóm: %1\n- Thread ID: %2",
    sendByUser: "\n- Được gửi từ người dùng",
    content: "\n\nNội dung:\n─────────────────\n%1\n─────────────────\nPhản hồi tin nhắn này để gửi tin nhắn về người dùng",
    success: "Đã gửi tin nhắn của bạn về %1 admin thành công!\n%2",
    failed: "Đã có lỗi xảy ra khi gửi tin nhắn của bạn về %1 admin\n%2\nKiểm tra console để biết thêm chi tiết",
    reply: "📍 Phản hồi từ admin %1:\n─────────────────\n%2\n─────────────────\nPhản hồi tin nhắn này để tiếp tục gửi tin nhắn về admin",
    replySuccess: "Đã gửi phản hồi của bạn về admin thành công!",
    feedback: "📝 Phản hồi từ người dùng %1:\n- User ID: %2%3\n\nNội dung:\n─────────────────\n%4\n─────────────────\nPhản hồi tin nhắn này để gửi tin nhắn về người dùng",
    replyUserSuccess: "Đã gửi phản hồi của bạn về người dùng thành công!",
    noAdmin: "Hiện tại bot chưa có admin nào"
  },
  en: {
    missingMessage: "Please enter the message you want to send to admin",
    sendByGroup: "\n- Sent from group: %1\n- Thread ID: %2",
    sendByUser: "\n- Sent from user",
    content: "\n\nContent:\n─────────────────\n%1\n─────────────────\nReply this message to send message to user",
    success: "Sent your message to %1 admin successfully!\n%2",
    failed: "An error occurred while sending your message to %1 admin\n%2\nCheck console for more details",
    reply: "📍 Reply from admin %1:\n─────────────────\n%2\n─────────────────\nReply this message to continue send message to admin",
    replySuccess: "Sent your reply to admin successfully!",
    feedback: "📝 Feedback from user %1:\n- User ID: %2%3\n\nContent:\n─────────────────\n%4\n─────────────────\nReply this message to send message to user",
    replyUserSuccess: "Sent your reply to user successfully!",
    noAdmin: "Bot has no admin at the moment"
  }
};

async function onStart({ args, message, event, usersData, threadsData, api, commandName, getLang }) {
  if (!args[0])
    return message.reply(getLang("missingMessage"));

  const { senderID, threadID, isGroup } = event;
  const { adminBot } = global.GoatBot.config;

  if (!adminBot || adminBot.length === 0)
    return message.reply(getLang("noAdmin"));

  const senderName = await usersData.getName(senderID);

  const header =
    "==📨️ CALL ADMIN 📨️==" +
    `\n- User Name: ${senderName}` +
    `\n- User ID: ${senderID}` +
    (isGroup
      ? getLang("sendByGroup", (await threadsData.get(threadID)).threadName, threadID)
      : getLang("sendByUser"));

  const formMessage = {
    body: header + getLang("content", args.join(" ")),
    mentions: [{ id: senderID, tag: senderName }],
    attachment: await getStreamsFromAttachment(
      [...event.attachments, ...(event.messageReply?.attachments || [])]
        .filter(item => mediaTypes.includes(item.type))
    )
  };

  const success = [];
  const failed = [];

  for (const adminID of adminBot) {
    try {
      const sent = await api.sendMessage(formMessage, adminID);
      success.push(adminID);

      global.GoatBot.onReply.set(sent.messageID, {
        commandName,
        messageID: sent.messageID,
        threadID,
        messageIDSender: event.messageID,
        type: "userCallAdmin"
      });
    } catch (err) {
      failed.push(adminID);
      log.err("CALL ADMIN", err);
    }
  }

  return message.reply(
    success.length > 0
      ? getLang("success", success.length, success.map(id => `<@${id}>`).join("\n"))
      : getLang("failed", failed.length, failed.map(id => `<@${id}>`).join("\n"))
  );
}

async function onReply({ args, event, api, message, Reply, usersData, commandName, getLang }) {
  const senderName = await usersData.getName(event.senderID);

  if (Reply.type === "userCallAdmin") {
    const form = {
      body: getLang("reply", senderName, args.join(" ")),
      mentions: [{ id: event.senderID, tag: senderName }],
      attachment: await getStreamsFromAttachment(
        event.attachments.filter(i => mediaTypes.includes(i.type))
      )
    };

    api.sendMessage(form, Reply.threadID, (err, info) => {
      if (err) return;
      message.reply(getLang("replyUserSuccess"));
      global.GoatBot.onReply.set(info.messageID, {
        commandName,
        messageID: info.messageID,
        threadID: event.threadID,
        type: "adminReply"
      });
    }, Reply.messageIDSender);
  }

  if (Reply.type === "adminReply") {
    const form = {
      body: getLang("feedback", senderName, event.senderID, "", args.join(" ")),
      mentions: [{ id: event.senderID, tag: senderName }],
      attachment: await getStreamsFromAttachment(
        event.attachments.filter(i => mediaTypes.includes(i.type))
      )
    };

    api.sendMessage(form, Reply.threadID, () => {
      message.reply(getLang("replySuccess"));
    }, Reply.messageIDSender);
  }
}

module.exports = { nix, langs, onStart, onReply };
