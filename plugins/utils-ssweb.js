import fetch from "node-fetch";

let handler = async (m, { conn, text }) => {
  if (!text) {
    return conn.reply(m.chat, "《✧》 من فضلك هات URL صحيح.", m);
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

    const apiUrl = `${global.api.url2}/tools/ssweb?url=${encodeURIComponent(text)}`;
    const res = await fetch(apiUrl);
    const json = await res.json();

    if (!json.status || !json.data?.download) {
      throw new Error("مقدرتش أعمل لقطة الشاشة.");
    }

    const txt = `*» URL:* ${text}`;

    await conn.sendFile(m.chat, json.data.download, "screenshot.png", txt, m);

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply(`《✧》 خطأ في المعالجة.\n\n*التفاصيل:* ${e.message}`);
  }
};

handler.help = ['لقطة'];
handler.tags = ["tools"];
handler.command = ["ssweb", "ss", 'لقطة'];

export default handler;