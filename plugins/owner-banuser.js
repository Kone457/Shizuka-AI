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
      '⚠️ Debes mencionar al usuario que deseas bloquear.'
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
      '⚠️ No fue posible obtener el número real de este usuario.\n\n' +
      'Responde directamente a uno de sus mensajes e inténtalo nuevamente.'
    );
  }

  if (!who.includes('@s.whatsapp.net')) {
    who = `${who.split('@')[0]}@s.whatsapp.net`;
  }

  const realJid = who;

  if (realJid === conn.user?.jid) {
    return m.reply('❌ No puedes bloquear el acceso del propio bot.');
  }

  global.db.data.users ||= {};
  global.db.data.users[realJid] ||= {};

  const user = global.db.data.users[realJid];

  if (user.banned === true) {
    return m.reply('ℹ️ Este usuario ya tiene el acceso restringido al bot.');
  }

  user.banned = true;
  user.bannedAt = Date.now();

  let name = 'Usuario';

  try {
    name = await conn.getName(realJid);
  } catch {}

  await conn.sendMessage(
    m.chat,
    {
      text: `
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼🚫 𝐀𝐂𝐂𝐄𝐒𝐎 𝐑𝐄𝐒𝐓𝐑𝐈𝐍𝐆𝐈𝐃𝐎 🚫╮
┃֪࣪
├ׁ̟̇❍✎ 👤 Usuario: ${name}
├ׁ̟̇❍✎ 📱 Número: +${realJid.split('@')[0]}
├ׁ̟̇❍✎ 🔒 Estado: Bloqueado
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

handler.help = ['banuser'];
handler.tags = ['owner'];
handler.command = ['banuser'];
handler.owner = true;

export default handler;