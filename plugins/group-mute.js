let handler = async (m, { conn, participants, isAdmin, isOwner, text }) => {
    if (!m.isGroup) return m.reply('*[❗] Este comando solo se puede usar en grupos*');
    if (!isAdmin && !isOwner) return m.reply('*[❗] Solo administradores pueden usar este comando*');
    
    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : false;
    if (!who) return m.reply('*[❗] Etiqueta o responde al mensaje del usuario que deseas silenciar*');

    let chat = global.db.data.chats[m.chat];
    if (!chat.mutedUsers) chat.mutedUsers = [];

    if (m.command === 'mute' || m.command === 'silenciar') {
        if (chat.mutedUsers.includes(who)) return m.reply('*[❗] Este usuario ya está silenciado en este grupo*');
        chat.mutedUsers.push(who);
        await m.reply(`*[✅] @${who.split('@')[0]} ha sido silenciado. Sus mensajes serán eliminados automáticamente.*`, null, { mentions: [who] });
    } else {
        if (!chat.mutedUsers.includes(who)) return m.reply('*[❗] Este usuario no está silenciado en este grupo*');
        chat.mutedUsers = chat.mutedUsers.filter(u => u !== who);
        await m.reply(`*[✅] @${who.split('@')[0]} ha sido desilenciado.*`, null, { mentions: [who] });
    }
};

handler.help = ['mute @user', 'unmute @user'];
handler.tags = ['group'];
handler.command = /^(mute|silenciar|unmute|desilenciar)$/i;
handler.admin = true;
handler.group = true;

export default handler;