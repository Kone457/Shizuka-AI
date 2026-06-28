import { getBotConfig } from '../lib/botconfig.js'

const handler = async (m, { conn, command }) => {
  try {
    const jid = (id) => id?.includes('@') ? id : `${id}@s.whatsapp.net`;
    let who = m.mentionedJid?.[0] || m.msg?.contextInfo?.mentionedJid?.[0] || m.quoted?.sender || null;

    if (!who) {
      return conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
    }

    who = jid(who);
    const groupMetadata = await conn.groupMetadata(m.chat);
    const participant = groupMetadata.participants.find(p => jid(p.id || p.jid) === who);
    const isPromote = command === 'promote';

    if (isPromote) {
      if (participant?.admin) {
        return conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
      }

      await conn.groupParticipantsUpdate(m.chat, [who], 'promote');
      return conn.sendMessage(m.chat, { react: { text: '👍', key: m.key } });
    }

    if (!participant?.admin) {
      return conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
    }

    if (who === groupMetadata.owner) {
      return conn.sendMessage(m.chat, { react: { text: '⛔', key: m.key } });
    }

    if (who === conn.user.jid) {
      return conn.sendMessage(m.chat, { react: { text: '⛔', key: m.key } });
    }

    await conn.groupParticipantsUpdate(m.chat, [who], 'demote');
    return conn.sendMessage(m.chat, { react: { text: '👍', key: m.key } });

  } catch (e) {
    conn.sendMessage(m.chat, { react: { text: '⛔', key: m.key } });
  }
};

handler.help = ['promote', 'demote'];
handler.tags = ['grupo'];
handler.command = ['promote', 'demote'];
handler.admin = true;
handler.botAdmin = true;

export default handler;
