import ws from "ws";

let handler = async (m, { conn }) => {
  try {
    const chat = global.db?.data?.chats?.[m.chat];

    if (!chat) {
      return conn.reply(m.chat, "《✧》 مقدرتش أدخل على بيانات الجروب.", m);
    }

    if (!chat.primaryBot) {
      return conn.reply(m.chat, "《✧》 الجروب ده مفيش فيه بوت أساسي.", m);
    }

    const oldPrimary = chat.primaryBot;
    delete chat.primaryBot;

    conn.sendMessage(m.chat, {
      text: `《✧》 البوت الأساسي @${oldPrimary.split("@")[0]} اتشال من الجروب. دلوقتي كل البوتات ترد.`,
      mentions: [oldPrimary]
    }, { quoted: m });

  } catch (error) {
    console.error("❏ خطأ في .delprimary:", error);
    m.reply("❏ حصل خطأ وأنا بمسح البوت الأساسي. جرّب تاني.");
  }
};

handler.help = ["delprimary"];
handler.tags = ["jadibot"];
handler.command = ["delprimary"];
handler.group = true;
handler.admin = true;

handler.register = true;

export default handler;