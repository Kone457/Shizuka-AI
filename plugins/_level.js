import { canLevelUp, xpRange } from '../lib/levelling.js';

let handler = m => m;
handler.before = async function (m, { conn }) {
    if (!m.isGroup) return true;
    
    let chat = globalThis.db.data.chats[m.chat] ||= {};
    if (chat.level === false) return true;

    let user = globalThis.db.data.users[m.sender];
    if (!user) return true;

    user.level = user.level || 0;
    user.exp = user.exp || 0;

    let before = user.level;

    while (canLevelUp(user.level, user.exp, globalThis.multiplier || 1)) {
        user.level++;
    }

    if (before !== user.level) {
        let { min, xp, max } = xpRange(user.level, globalThis.multiplier || 1);
        let alertImage = 'https://files.evogb.win/ChAkmb.jpg';

        let txt = `
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼✨ 𝐍𝐔𝐄𝐕𝐎 𝐍𝐈𝐕𝐄𝐋 𝐀𝐋𝐂𝐀𝐍𝐙𝐀𝐃𝐎 ✨╮
┃֪࣪
├ׁ̟̇❍✎ 👤 *Usuario:* @${m.sender.split('@')[0]}
├ׁ̟̇❍✎ 📈 *Rango:* \`${before}\` ➔ \`${user.level}\`
├ׁ̟̇❍✎ ⚡ *Experiencia:* \`${user.exp} / ${max}\`
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯

> 🌟 *¡Felicidades! Sigue interactuando para desbloquear más sorpresas
        `.trim();

        await conn.sendMessage(m.chat, {
            image: { url: alertImage },
            caption: txt,
            contextInfo: {
                mentionedJid: [m.sender],
                isForwarded: true
            }
        }, { quoted: m });
    }

    return true;
};

export default handler;
