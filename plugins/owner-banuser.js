let handler = async (m, { conn, text, isOwner }) => {
  if (!isOwner) {
    return m.reply('Este comando solo puede ser usado por mi Creador.');
  }

  let who = null;

  if (m.mentionedJid && m.mentionedJid.length > 0) {
    who = m.mentionedJid[0];
  }

  if (!who && m.quoted?.sender) {
    who = m.quoted.sender;
  }

  if (!who && text) {
    const number = text.replace(/[^0-9]/g, '');

    if (number) {
      who = `${number}@s.whatsapp.net`;
    }
  }

  if (!who) {
    return m.reply(
      `⚠️ Debes mencionar al usuario que deseas banear.`
    );
  }

  try {
    who = conn.decodeJid
      ? conn.decodeJid(who)
      : who;
  } catch {}

  if (!who || !who.includes('@')) {
    return m.reply(' No pude identificar correctamente al usuario.');
  }

  const botJid = conn.user?.jid;

  if (who === botJid) {
    return m.reply(' No puedes banear al bot.');
  }

  const ownerJids = (global.owner || [])
    .map(owner => {
      const number = Array.isArray(owner)
        ? owner[0]
        : owner;

      if (!number) return null;

      const clean = String(number).replace(/[^0-9]/g, '');

      return clean
        ? `${clean}@s.whatsapp.net`
        : null;
    })
    .filter(Boolean);

  if (ownerJids.includes(who)) {
    return m.reply(' No puedes banear a mi Creador.');
  }

  global.db.data.users ||= {};
  global.db.data.users[who] ||= {};

  if (global.db.data.users[who].banned === true) {
    return m.reply('⚠️ Ese usuario ya está baneado del bot.');
  }

  global.db.data.users[who].banned = true;

  let name = who.split('@')[0];

  try {
    name = await conn.getName(who);
  } catch {}

  await conn.sendMessage(
    m.chat,
    {
      text: `
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼🚫 𝐔𝐒𝐔𝐀𝐑𝐈𝐎 𝐁𝐀𝐍𝐄𝐀𝐃𝐎 🚫╮
┃֪࣪
├ׁ̟̇❍✎ 👤 Usuario: ${name}
├ׁ̟̇❍✎ 📱 Número: @${who.split('@')[0]}
├ׁ̟̇❍✎ 🚫 Estado: Baneado
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯
`.trim(),
      mentions: [who]
    },
    { quoted: m }
  );
};

handler.help = ['banuser'];
handler.tags = ['owner'];
handler.command = ['banuser'];

export default handler;