let handler = async (m, { conn, args }) => {
  const isSocketOwner = [
    conn.user.jid,
    ...(global.owner || []).map(n => n + '@s.whatsapp.net'),
  ].includes(m.sender);

  if (!isSocketOwner) {
    return m.reply('✿ Solo el propietario del bot puede usar este comando.');
  }

  const groupId = args[0] || m.chat;

  try {
     await conn.sendMessage(m.chat, { text: `✿ ${botname} se despide.` }, { quoted: m });
    await conn.groupLeave(groupId);
  } catch (error) {
    console.error(error);
    m.reply('✿ No se pude abandonar el grupo.\n> Intenta nuevamente.');
  }
};

handler.help = ['leave2'];
handler.tags = ['serbot'];
handler.command = ['leave2'];

export default handler;