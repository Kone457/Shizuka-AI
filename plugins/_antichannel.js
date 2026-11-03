export async function before(m, { conn, isAdmin, isBotAdmin, isOwner, isROwner, participants }) {
    if (!m.isGroup) return 
    if (isAdmin || isOwner || m.fromMe || isROwner) return

    let chat = global.db.data.chats[m.chat];
    if (!chat?.antichannel) return;

    const user = `@${m.sender.split`@`[0]}`;
    const groupAdmins = participants.filter(p => p.admin);

    const isChannelForward = m.message?.extendedTextMessage?.contextInfo?.isForwarded && 
                             m.message?.extendedTextMessage?.contextInfo?.forwardingScore > 0 &&
                             !m.message?.extendedTextMessage?.contextInfo?.participant;
                             
    const isNewsletterMessage = m.mtype === 'reactionMessage' || m.msg?.contextInfo?.forwardingScore > 0 && m.msg?.contextInfo?.isForwarded;

    if (isChannelForward || isNewsletterMessage) {
        await conn.sendMessage(m.chat, { text: `*「 CANAL DETECTADO 」*\n\n《✧》${user} Está prohibido enviar mensajes de canales en este grupo, serás eliminado...`, mentions: [m.sender] }, { quoted: m });

        if (!isBotAdmin) {
            return conn.sendMessage(m.chat, { text: `《✧》 El antichannel está activo pero no puedo eliminarte porque no soy admin.`, mentions: groupAdmins.map(v => v.id) }, { quoted: m });
        }

        if (isBotAdmin) {
            await conn.sendMessage(m.chat, { delete: m.key });
            await conn.groupParticipantsUpdate(m.chat, [m.sender], "remove");
        }
    }
    return !0;
}
