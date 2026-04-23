let handler = async (m, { conn }) => {
  await conn.reply(
    m.chat, 
    `🔄⚙️ *Reiniciando la Bot...*\n> Por favor, espere un momento mientras reinicio el sistema`, 
    m
  );

  const fs = await import('fs')
  if (!fs.existsSync('./tmp')) fs.mkdirSync('./tmp')
  const botId = conn.user.jid.split('@')[0]
  fs.writeFileSync(`./tmp/restarting_${botId}.txt`, `${m.chat}|${m.id}`)

  setTimeout(() => {
    process.exit(0);
  }, 3000);
};

handler.help = ['restart'];
handler.tags = ['owner'];
handler.command = ['restart','reiniciar'];
handler.owner = true;

export default handler;