let linkRegex = /chat.whatsapp.com\/([0-9A-Za-z]{20,24})/i;
let linkRegex1 = /whatsapp.com\/channel\/([0-9A-Za-z]{20,24})/i;

export async function before(m, { conn, isAdmin, isBotAdmin, isOwner, isROwner, participants }) {
    if (!m.isGroup) return 
    if (isAdmin || isOwner || m.fromMe || isROwner) return

    let chat = global.db.data.chats[m.chat];
    const user = `@${m.sender.split`@`[0]}`;
    const groupAdmins = participants.filter(p => p.admin);
    
    const isGroupLink = linkRegex.exec(m.text) || linkRegex1.exec(m.text);
    
    if (chat.antiLink && isGroupLink && !isAdmin) {
        if (isBotAdmin) {
            const linkThisGroup = `https://chat.whatsapp.com/${await this.groupInviteCode(m.chat).catch(() => "")}`;
            if (m.text.includes(linkThisGroup)) return !0;
        }
        
        await conn.sendMessage(m.chat, { text: `*「 ENLACE DETECTADO 」*\n\n《✧》${user} Rompiste las reglas del Grupo serás eliminado...`, mentions: [m.sender] }, { quoted: m });
        
        if (!isBotAdmin) {
            return conn.sendMessage(m.chat, { text: ` El antilink está activo pero no puedo eliminarte porque no soy admin.`, mentions: groupAdmins.map(v => v.id) }, { quoted: m });
        }
        
        if (isBotAdmin) {
            await conn.sendMessage(m.chat, { delete: m.key });
            await conn.groupParticipantsUpdate(m.chat, [m.sender], "remove");
        }
    }
    return !0;
}