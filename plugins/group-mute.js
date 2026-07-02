let handler = async (m, { conn, text, isAdmin, isOwner, command }) => {
    if (!m.isGroup) return m.reply('✿ *Este comando solo se puede usar en grupos*');
    if (!isAdmin && !isOwner) return m.reply('✿ *Solo administradores pueden usar este comando*');

    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : false;
    if (!who) return m.reply('✿ *Etiqueta o responde al mensaje del usuario que deseas silenciar*');

    let chat = global.db.data.chats[m.chat];
    if (!chat.mutedUsers) chat.mutedUsers = [];

    if (command === 'mute' || command === 'silenciar') {
        if (chat.mutedUsers.includes(who)) return m.reply('✿ *Este usuario ya está silenciado en este grupo*');
        chat.mutedUsers.push(who);
        await conn.reply(m.chat, `✿ *@${who.split('@')[0]} ha sido silenciado.\n> Sus mensajes serán eliminados automáticamente.*`, m, { mentions: [who] });
    } else if (command === 'unmute' || command === 'desilenciar') {
        if (!chat.mutedUsers.includes(who)) return m.reply('✿ *Este usuario no está silenciado en este grupo*');
        chat.mutedUsers = chat.mutedUsers.filter(u => u !== who);
        await conn.reply(m.chat, `✿ *@${who.split('@')[0]} ha sido desilenciado.*`, m, { mentions: [who] });
    }
};

handler.before = async function (m, { conn, isBotAdmin, chat }) {
    if (!m.isGroup || m.fromMe) return false;
    
    if (m.text && m.text.startsWith('.')) return false;

    if (chat.mutedUsers && Array.isArray(chat.mutedUsers)) {
        if (chat.mutedUsers.includes(m.sender)) {
            if (isBotAdmin) {
                await conn.sendMessage(m.chat, { delete: m.key });
                return true;
            }
        }
    }
    return false; 
};

handler.help = ['mute @user', 'unmute @user'];
handler.tags = ['group'];
handler.command = /^(mute|silenciar|unmute|desilenciar)$/i;
handler.admin = true;
handler.group = true;

export default handler;
