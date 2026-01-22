const { getStreamsFromAttachment, log } = global.utils;
const mediaTypes = ["photo", "png", "animated_image", "video", "audio"];

module.exports = {
  config: {
    name: "notification",
    aliases: ["noti"],
    version: "2.5",
    author: "Messie Osango"
    role: 2,
    category: "system",
    shortDescription: {
      en: "Global notification",
      fr: "Notification globale",
      vi: "Thông báo toàn bộ"
    },
    longDescription: {
      en: "Send a message to all groups",
      fr: "Envoyer un message à tous les groupes",
      vi: "Gửi tin nhắn đến tất cả nhóm"
    },
    guide: {
      en: "{pn} <message>",
      fr: "{pn} <message>",
      vi: "{pn} <nội dung>"
    }
  },

  langs: {
    en: {
      noPermission: "🚫 You are not allowed to use this command.",
      missingMessage: "Please enter the notification content.",
      noGroup: "No group found.",
      sending: "📢 Sending notification...",
      report:
        "📊 SEND REPORT\n─────────────────\n✅ Success: %1 groups\n❌ Failed: %2 groups\n─────────────────\nMessage:\n%3",
      error: "❌ System error occurred."
    },
    fr: {
      noPermission: "🚫 Accès refusé.",
      missingMessage: "Veuillez entrer le contenu de la notification.",
      noGroup: "Aucun groupe trouvé.",
      sending: "📢 Envoi de la notification...",
      report:
        "📊 RAPPORT D'ENVOI\n─────────────────\n✅ Succès : %1 groupes\n❌ Échecs : %2 groupes\n─────────────────\nMessage :\n%3",
      error: "❌ Une erreur système est survenue."
    },
    vi: {
      noPermission: "🚫 Bạn không có quyền sử dụng lệnh này.",
      missingMessage: "Vui lòng nhập nội dung thông báo.",
      noGroup: "Không tìm thấy nhóm nào.",
      sending: "📢 Đang gửi thông báo...",
      report:
        "📊 BÁO CÁO GỬI\n─────────────────\n✅ Thành công: %1 nhóm\n❌ Thất bại: %2 nhóm\n─────────────────\nNội dung:\n%3",
      error: "❌ Đã xảy ra lỗi hệ thống."
    }
  },

  onStart: async function ({ api, event, args, message, getLang }) {
    const adminBot = global.GoatBot.config.adminBot;

    if (!adminBot.includes(event.senderID))
      return message.reply(getLang("noPermission"));

    if (!args[0])
      return message.reply(getLang("missingMessage"));

    message.reply(getLang("sending"));

    try {
      const threadList = await api.getThreadList(200, null, ["INBOX"]);
      const groupThreads = threadList.filter(t => t.isGroup);

      if (groupThreads.length === 0)
        return message.reply(getLang("noGroup"));

      const content = args.join(" ");
      let success = 0;
      let failed = 0;

      const attachments = await getStreamsFromAttachment(
        event.attachments.filter(item => mediaTypes.includes(item.type))
      );

      for (const group of groupThreads) {
        try {
          await api.sendMessage(
            {
              body:
                "╭━━━━━━━━━━━━━━━━╮\n" +
                "┃ 📢 NOTIFICATION\n" +
                "├────────────────\n" +
                `┃ ${content}\n` +
                "╰━━━━━━━━━━━━━━━━╯",
              attachment: attachments
            },
            group.threadID
          );
          success++;
          await new Promise(r => setTimeout(r, 300));
        } catch (e) {
          failed++;
        }
      }

      return message.reply(
        getLang("report", success, failed, content)
      );

    } catch (err) {
      log.err("NOTIFICATION", err);
      return message.reply(getLang("error"));
    }
  }
};
