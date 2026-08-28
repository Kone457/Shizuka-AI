let handler = async (m, { conn, text, isOwner }) => {
  if (!isOwner)
    return m.reply('Este comando solo puede ser usado por mi Creador.');

  let who =
    m.mentionedJid?.[0] ||
    (m.quoted ? m.quoted.sender : null);

  if (!who && text) {
    let number = text.replace(/[^0-9]/g, '');

    if (number) {
      who = `${number}@s.whatsapp.net`;
    }
  }

  if (!who)
    return m.reply(
      `⚠️ Debes mencionar a un usuario.`
    );

  who = who.replace(/:\d+@/, '@');

  if (who === conn.user.jid)
    return m.reply('No puedes banearme a mí.');

  const owners = global.owner || [];

  const isTargetOwner = owners.some(owner => {
    const number = Array.isArray(owner)
      ? owner[0]
      : owner;

    if (!number) return false;

    return `${String(number).replace(/[^0-9]/g, '')}@s.whatsapp.net` === who;
  });

  if (isTargetOwner)
    return m.reply('No puedes banear a mi Creador.');

  global.db.data.users ||= {};
  global.db.data.users[who] ||= {};

  global.db.data.users[who].banned = true;

  let name = await conn.getName(who).catch(() => who.split('@')[0]);

  await m.reply(`
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼🚫 𝐔𝐒𝐔𝐀𝐑𝐈𝐎 𝐁𝐀𝐍𝐄𝐀𝐃𝐎 🚫╮
┃֪࣪
├ׁ̟̇❍✎ 👤 Usuario: ${name}
├ׁ̟̇❍✎ 📱 Número: @${who.split('@')[0]}
├ׁ̟̇❍✎ 🚫 Estado: Baneado
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯
`.trim(), {
    mentions: [who]
  });
};

handler.help = ['banuser'];
handler.tags = ['owner'];
handler.command = ['banuser'];
handler.owner = true;

export default handler;