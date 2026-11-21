import { getBotConfig } from '../lib/botconfig.js'

let handler = async (m, { conn, text, args }) => {
  const botname = getBotConfig(conn, 'botname')

  if (!args[0]) {
    const estado = global.db.data.chats[m.chat]?.bannedGrupo ?? false;
    const estadoTexto = estado ? '✗ متوقف' : '✓ Activado';
    const info = `✿ *حالة ${botname}*\n` +
                 `✰ *Actual ›* ${estadoTexto}\n\n` +
                 `> تقدر تغيّرها بـ:\n` +
                 `> ● _تشغيل ›_ *bot on*\n` +
                 `> ● _إيقاف ›_ *bot off*`;
    return m.reply(info);
  }

  try {
    const chat = global.db.data.chats[m.chat];
    const estado = chat.bannedGrupo ?? false;
    const accion = args[0].toLowerCase();

    if (accion === 'off') {
      if (estado) return m.reply(`✿ *${botname}* متوقف بالفعل في الجروب ده.`);
      chat.bannedGrupo = true;
      return m.reply(`✿ أوقفت ${botname} في الجروب ده.`);
    }

    if (accion === 'on') {
      if (!estado) return m.reply(`✿ *${botname}* شغّال بالفعل في الجروب ده.`);
      chat.bannedGrupo = false;
      return m.reply(`✿ شغّلت *${botname}* في الجروب ده.`);
    }

    return m.reply('> ✿ استخدم: *bot on* أو *bot off* لتغيير الحالة.');
  } catch (e) {
    await m.reply('❏ حصل خطأ وأنا بحاول أغيّر حالة البوت.');
  }
};

handler.tags = ['grupo'];
handler.help = ['بوت'];
handler.command = ['bot', 'بوت'];
handler.admin = true;
handler.group = true;

export default handler;