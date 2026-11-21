import fetch from "node-fetch";

let handler = async (m, { conn, text }) => {
  if (!text) {
    return conn.reply(m.chat, "《✧》 من فضلك اكتب اسم مستخدم إنستجرام.", m);
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

    const apiUrl = `${global.api.url2}/tools/igstalk?username=${encodeURIComponent(text)}`;
    const res = await fetch(apiUrl);
    const json = await res.json();

    if (!json.status || !json.data) throw new Error("مقدرتش ألاقي البروفايل.");

    const ig = json.data;

    const txt = `*» المستخدم:* ${ig.username}\n`
      + `*» الاسم:* ${ig.full_name}\n`
      + `*» ID:* ${ig.id}\n`
      + `*» URL:* ${ig.url}\n`
      + `*» البايو:* ${ig.biography}\n`
      + `*» خاص:* ${ig.private ? "نعم" : "لا"}\n`
      + `*» موثّق:* ${ig.verified ? "نعم" : "لا"}\n`
      + `*» Publicaciones:* ${ig.posts}\n`
      + `*» Seguidores:* ${ig.followers}\n`
      + `*» Siguiendo:* ${ig.following}\n`
      + `*» الصفحة المرتبطة:* ${ig.page_name}\n`
      + `*» Pronombres:* ${ig.pronouns}`;

    await conn.sendFile(m.chat, ig.profile_picture, "profile.jpg", txt, m);

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply(`《✧》 خطأ في جلب البروفايل.\n\n*التفاصيل:* ${e.message}`);
  }
};

handler.help = ['معلومات_انستا'];
handler.tags = ["tools"];
handler.command = ['igstalk', 'معلومات_انستا'];

export default handler;