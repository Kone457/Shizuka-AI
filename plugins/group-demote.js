
const handler = async (m, { conn, command }) => {
  try {
    const jid = (id) => id?.includes('@') ? id : `${id}@s.whatsapp.net`;
    let who = m.mentionedJid?.[0] || m.msg?.contextInfo?.mentionedJid?.[0] || m.quoted?.sender || null;

    if (!who) {
      return m.reply(`
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼⚙️ 𝐀𝐂𝐂𝐈𝐎́𝐍 𝐃𝐄 𝐀𝐃𝐌𝐈𝐍 ⚙️╮
┃֪࣪
├ׁ̟̇❍✎ Debes mencionar o responder a un usuario
├ׁ̟̇❍✎ para ejecutar esta acción
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯
`.trim());
    }

    who = jid(who);
    const groupMetadata = await conn.groupMetadata(m.chat);
    const participant = groupMetadata.participants.find(p => jid(p.id || p.jid) === who);
    const isPromote = command === 'promote';

    const context = {
      mentionedJid: [who],
      isForwarded: true,
      externalAdReply: {
        title: `${botname}`,
        body: `${dev}`,
        thumbnailUrl: `${banner}`, 
        sourceUrl: '',
        mediaType: 1,
        renderLargerThumbnail: true
      }
    };

    if (isPromote) {
      if (participant?.admin) {
        return conn.sendMessage(m.chat, {
          text: `
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼👑 𝐘𝐀 𝐄𝐒 𝐀𝐃𝐌𝐈𝐍 👑╮
┃֪࣪
├ׁ̟̇❍✎ @${who.split('@')[0]} ya es administrador
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯`.trim(),
          contextInfo: context
        }, { quoted: m });
      }

      await conn.groupParticipantsUpdate(m.chat, [who], 'promote');
      return conn.sendMessage(m.chat, {
        text: `
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼👑 𝐍𝐔𝐄𝐕𝐎 𝐀𝐃𝐌𝐈𝐍 👑╮
┃֪࣪
├ׁ̟̇❍✎ @${who.split('@')[0]}
├ׁ̟̇❍✎ ahora es administrador
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯`.trim(),
        contextInfo: context
      }, { quoted: m });
    }

    if (!participant?.admin) {
      return conn.sendMessage(m.chat, {
        text: `
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼⚠️ 𝐍𝐎 𝐄𝐒 𝐀𝐃𝐌𝐈𝐍 ⚠️╮
┃֪࣪
├ׁ̟̇❍✎ @${who.split('@')[0]} no es administrador
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯`.trim(),
        contextInfo: context
      }, { quoted: m });
    }

    if (who === groupMetadata.owner) {
      return m.reply(`
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼⛔ 𝐏𝐑𝐎𝐓𝐄𝐂𝐂𝐈𝐎́𝐍 ⛔╮
┃֪࣪
├ׁ̟̇❍✎ No puedes degradar al creador
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯`.trim());
    }

    if (who === conn.user.jid) {
      return m.reply(`
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼🤖 𝐁𝐎𝐓 𝐏𝐑𝐎𝐓𝐄𝐆𝐈𝐃𝐎 🤖╮
┃֪࣪
├ׁ̟̇❍✎ No puedes degradar al bot
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯`.trim());
    }

    await conn.groupParticipantsUpdate(m.chat, [who], 'demote');
    return conn.sendMessage(m.chat, {
      text: `
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼⬇️ 𝐀𝐃𝐌𝐈𝐍 𝐑𝐄𝐌𝐎𝐕𝐈𝐃𝐎 ⬇️╮
┃֪࣪
├ׁ̟̇❍✎ @${who.split('@')[0]}
├ׁ̟̇❍✎ fue degradado a usuario
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯`.trim(),
      contextInfo: context
    }, { quoted: m });

  } catch (e) {
    m.reply(`
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼⛔ 𝐄𝐑𝐑𝐎𝐑 ⛔╮
┃֪࣪
├ׁ̟̇❍✎ ${e.message}
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯`.trim());
  }
};

handler.help = ['promote', 'demote'];
handler.tags = ['grupo'];
handler.command = ['promote', 'demote'];
handler.admin = true;
handler.botAdmin = true;

export default handler;
