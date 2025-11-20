let handler = async (m, { conn }) => {
  await conn.reply(
    m.chat, 
    `🔄⚙️ *Reiniciando el Bot...*\n> Por favor, espere un momento mientras reinicio el sistema ⚡🤖`, 
    m
  );

  setTimeout(() => {
    process.exit(0);
  }, 3000);
};

handler.help = ['restart'];
handler.tags = ['owner'];
handler.command = ['restart','reiniciar'];
handler.owner = true;

export default handler;