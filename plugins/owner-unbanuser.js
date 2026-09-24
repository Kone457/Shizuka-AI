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
      '⚠️ Debes mencionar al usuario que deseas desbloquear.'
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
      '⚠️ No fue posible obtener el número real de este usuario.'
    );
  }

  if (!who.includes('@s.whatsapp.net')) {
    who = `${who.split('@')[0]}@s.whatsapp.net`;
  }

  const realJid = who;

  global.db.data.users ||= {};
  global.db.data.users[realJid] ||= {};

  const user = global.db.data.users[realJid];

  if (user.banned !== true) {
    return m.reply('ℹ️ Este usuario no tiene el acceso restringido al bot.');
  }

  user.banned = false;
  delete user.bannedAt;

  let name = 'Usuario';

  try {
    name = await conn.getName(realJid);
  } catch {}

  await conn.sendMessage(
    m.chat,
    {
      text: `
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼✅ 𝐀𝐂𝐂𝐄𝐒𝐎 𝐑𝐄𝐒𝐓𝐀𝐔𝐑𝐀𝐃𝐎 ✅╮
┃֪࣪
├ׁ̟̇❍✎ 👤 Usuario: ${name}
├ׁ̟̇❍✎ 📱 Número: +${realJid.split('@')[0]}
├ׁ̟̇❍✎ 🔓 Estado: Desbloqueado
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

handler.help = ['unbanuser'];
handler.tags = ['owner'];
handler.command = ['unbanuser'];
handler.owner = true;

export default handler;