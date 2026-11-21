import { getBotConfig } from '../lib/botconfig.js'

let handler = async (m, { conn, args }) => {
  const botname = getBotConfig(conn, 'botname')
  const isSocketOwner = [
    conn.user.jid,
    ...(global.owner || []).map(n => n + '@s.whatsapp.net'),
  ].includes(m.sender);

  if (!isSocketOwner) {
    return m.reply('✿ صاحب البوت بس اللي يقدر يستخدم الأمر ده.');
  }

  const groupId = args[0] || m.chat;

  try {
     await conn.sendMessage(m.chat, { text: `✿ ${botname} se despide.` }, { quoted: m });
    await conn.groupLeave(groupId);
  } catch (error) {
    console.error(error);
    m.reply('✿ مقدرتش أسيب الجروب.\n> جرّب تاني.');
  }
};

handler.help = ['leave2'];
handler.tags = ['serbot'];
handler.command = ['leave2'];

export default handler;