let handler = async (m, { conn, usedPrefix, command }) => {
  if (!m.isGroup) return m.reply('❌ Este comando solo se puede usar en grupos.');

  let userJid = m.sender;
  let user = globalThis.db.data.users[userJid] ||= {};

  if (!user.marry) {
    return m.reply('⚠️ Actualmente no estás casado/a con nadie.');
  }

  let parejaJid = user.marry;
  let pareja = globalThis.db.data.users[parejaJid] || {};

  // Limpiar el matrimonio de ambos
  user.marry = '';
  if (pareja.marry === userJid) {
    pareja.marry = '';
  }

  await conn.sendMessage(m.chat, {
    text: `💔 ¡Se acabó el amor! @${userJid.split('@')[0]} y @${parejaJid.split('@')[0]} han decidido divorciarse oficialmente. 📜🥀`,
    contextInfo: {
      mentionedJid: [userJid, parejaJid],
      isForwarded: true
    }
  }, { quoted: m });
};

handler.command = ['divorcio', 'divorce', 'divorciar'];
export default handler;
