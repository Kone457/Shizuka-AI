let handler = async (m, { conn, text, participants }) => {
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
      '⚠️ Debes mencionar al usuario'
    );
  }

  try {
    if (conn.decodeJid) who = conn.decodeJid(who);
  } catch {}

  if (m.isGroup && participants?.length && who.endsWith('@lid')) {
    const found = participants.find(p => {
      const jid = p?.jid || p?.id;
      return jid === who || p?.lid === who;
    });

    if (found) {
      who = found.jid || found.id || who;
    }
  }

  try {
    if (who.endsWith('@lid') && conn.signalRepository?.lidMapping) {
      const mapped =
        await conn.signalRepository.lidMapping.getPNForLID(who);

      if (mapped) who = mapped;
    }
  } catch {}

  if (who.endsWith('@lid')) {
    return m.reply(
      '⚠️ No fue posible obtener el número real de este usuario.\n\n' +
      'Intenta responder directamente a uno de sus mensajes.'
    );
  }

  if (!who.includes('@s.whatsapp.net')) {
    who = `${who.split('@')[0]}@s.whatsapp.net`;
  }

  if (who === conn.user?.jid) {
    return m.reply('No puedes aplicar esta acción al propio bot.');
  }

  global.db.data.users ||= {};
  global.db.data.users[who] ||= {};

  if (global.db.data.users[who].banned === true) {
    return m.reply('ℹ️ Este usuario ya se encuentra bloqueado del bot.');
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
╭╼🚫 𝐀𝐂𝐂𝐄𝐒𝐎 𝐑𝐄𝐒𝐓𝐑𝐈𝐍𝐆𝐈𝐃𝐎 🚫╮
┃֪࣪
├ׁ̟̇❍✎ 👤 Usuario: ${name || 'Usuario'}
├ׁ̟̇❍✎ 📱 Número: @${who.split('@')[0]}
├ׁ̟̇❍✎ 🔒 Estado: Bloqueado
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
handler.owner = true;

export default handler;