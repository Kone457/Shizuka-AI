import { canLevelUp, xpRange } from '../lib/levelling.js';

let handler = m => m;
handler.before = async function (m, { conn }) {
    if (!m.isGroup || !m.sender) return true;
    
    let chat = globalThis.db.data.chats[m.chat] ||= {};
    if (chat.level === false) return true;

    let user = globalThis.db.data.users[m.sender];
    if (!user) return true;

    user.level = user.level || 0;
    user.exp = user.exp || 0;

    let before = user.level;
    let multiplier = globalThis.multiplier || 1;

    
    while (canLevelUp(user.level, user.exp, multiplier)) {
        user.level++;
    }

    if (before !== user.level) {
        let { min, xp, max } = xpRange(user.level, multiplier);
        let alertImage = 'https://files.evogb.win/ChAkmb.jpg';

        let txt = `
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼ مستوى جديد ╮
┃֪࣪
├ׁ̟̇❍✎ 👤 *المستخدم:* @${m.sender.split('@')[0]}
├ׁ̟̇❍✎ 📈 *المستوى:* \`${before}\` ➔ \`${user.level}\`
├ׁ̟̇❍✎ ⚡ *الخبرة:* \`${user.exp} / ${max}\`
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯

> 🌟 *مبروك! كمّل تفاعل عشان تفتح مفاجآت أكتر*
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
