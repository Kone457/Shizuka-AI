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
      `⚠️ Debes mencionar a un usuario`
    );

  who = who.replace(/:\d+@/, '@');

  global.db.data.users ||= {};
  global.db.data.users[who] ||= {};

  if (!global.db.data.users[who].banned)
    return m.reply('ℹ️ Ese usuario no está baneado.');

  global.db.data.users[who].banned = false;

  let name = await conn.getName(who).catch(() => who.split('@')[0]);

  await m.reply(`
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼✅ 𝐔𝐒𝐔𝐀𝐑𝐈𝐎 𝐃𝐄𝐒𝐁𝐀𝐍𝐄𝐀𝐃𝐎 ✅╮
┃֪࣪
├ׁ̟̇❍✎ 👤 Usuario: ${name}
├ׁ̟̇❍✎ 📱 Número: @${who.split('@')[0]}
├ׁ̟̇❍✎ ✅ Estado: Desbaneado
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯
`.trim(), {
    mentions: [who]
  });
};

handler.help = ['unbanuser'];
handler.tags = ['owner'];
handler.command = ['unbanuser'];
handler.owner = true;

export default handler;