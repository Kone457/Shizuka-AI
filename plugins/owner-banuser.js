let handler = async (m, { conn, text }) => {
  let who =
    m.mentionedJid?.[0] ||
    m.quoted?.sender ||
    null;

  if (!who && text) {
    const number = text.replace(/[^0-9]/g, '');
    if (number) who = `${number}@s.whatsapp.net`;
  }

  if (!who) {
    return m.reply(
      '⚠️ لازم تعمل منشن للمستخدم اللي عايز تحظره.'
    );
  }

  try {
    if (who.endsWith('@lid')) {
      let pn = null;

      try {
        pn = await conn.signalRepository?.lidMapping?.getPNForLID?.(who);
      } catch {}

      if (!pn) {
        try {
          pn = await conn.getPNForLID?.(who);
        } catch {}
      }

      if (!pn) {
        try {
          pn = await conn.getPnForLid?.(who);
        } catch {}
      }

      if (pn) who = pn;
    }
  } catch {}

  if (who.endsWith('@lid')) {
    return m.reply(
      '⚠️ مقدرتش أجيب الرقم الحقيقي للمستخدم ده.\n\n' +
      'رد على واحدة من رسائله وجرّب تاني.'
    );
  }

  if (!who.includes('@s.whatsapp.net')) {
    who = `${who.split('@')[0]}@s.whatsapp.net`;
  }

  const realJid = who;

  if (realJid === conn.user?.jid) {
    return m.reply('❌ مش تقدر تحظر البوت نفسه.');
  }

  global.db.data.users ||= {};
  global.db.data.users[realJid] ||= {};

  const user = global.db.data.users[realJid];

  if (user.banned === true) {
    return m.reply('ℹ️ المستخدم ده متحظر من البوت بالفعل.');
  }

  user.banned = true;
  user.bannedAt = Date.now();

  let name = 'مستخدم';

  try {
    name = await conn.getName(realJid);
  } catch {}

  await conn.sendMessage(
    m.chat,
    {
      text: `
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼🚫 الوصول متوقف 🚫╮
┃֪࣪
├ׁ̟̇❍✎ 👤 المستخدم: ${name}
├ׁ̟̇❍✎ 📱 الرقم: +${realJid.split('@')[0]}
├ׁ̟̇❍✎ 🔒 الحالة: محظور
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯
`.trim(),
      contextInfo: {
        mentionedJid: [realJid],
        isForwarded: true
      }
    },
    { quoted: m }
  );
};

handler.help = ['حظر'];
handler.tags = ['owner'];
handler.command = ['banuser', 'حظر', 'تبنيد'];
handler.owner = true;

export default handler;