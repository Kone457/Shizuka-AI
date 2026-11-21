import { getBotConfig } from '../lib/botconfig.js'

let linkRegex = /https:\/\/chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i;

let handler = async (m, { conn, text, isOwner }) => {
  const botname = getBotConfig(conn, 'botname')
    if (!text) return m.reply(`《✧》 لازم تبعت دعوة عشان *${botname}* ينضم للجروب.`);

    let [_, code] = text.match(linkRegex) || [];

    if (!code) return m.reply(`《✧》 لينك الدعوة غير صحيح.`);

    if (isOwner) {
        await conn.groupAcceptInvite(code)
            .then(res => m.reply(`《✧》 انضميت للجروب بنجاح.`))
            .catch(err => m.reply(`《✧》 خطأ في الانضمام للجروب.`));
    } else {
        let message = `《✧》 دعوة لجروب:\n${text}\n\nمن: @${m.sender.split('@')[0]}`;
        await conn.sendMessage(`${suittag}` + '@s.whatsapp.net', { text: message, mentions: [m.sender] }, { quoted: m });
        m.reply(`《✧》 لينك الجروب اتبعت، شكراً على الدعوة.`);
    }
};

handler.help = ['دعوة'];
handler.tags = ['owner'];
handler.command = ['invite', 'join', 'دعوة', 'انضم'];

export default handler;