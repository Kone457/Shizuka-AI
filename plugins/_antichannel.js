export async function before(m, { conn, isAdmin, isBotAdmin, isOwner, isROwner, participants }) {
    if (!m.isGroup) return 
    if (isAdmin || isOwner || m.fromMe || isROwner) return

    let chat = global.db.data.chats[m.chat];
    if (!chat?.antichannel) return;

    const user = `@${m.sender.split`@`[0]}`;
    const groupAdmins = participants.filter(p => p.admin);

    const contextInfo = m.message?.[m.mtype]?.contextInfo || m.msg?.contextInfo || m.message?.imageMessage?.contextInfo || m.message?.videoMessage?.contextInfo || m.message?.documentMessage?.contextInfo || m.message?.audioMessage?.contextInfo;

    const isChannelForward = (contextInfo?.isForwarded || contextInfo?.forwardingScore > 0) && (!contextInfo?.participant || contextInfo?.remoteJid?.includes('@newsletter') || String(contextInfo?.stanzaId || '').length > 15);
    const isNewsletterJid = m.chat?.includes('@newsletter') || m.sender?.includes('@newsletter');

    if (isChannelForward || isNewsletterJid) {
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
