let handler = async (m, { conn }) => {
  await conn.reply(
    m.chat, 
    `🔄⚙️ *بجدد تشغيل البوت...*\n> استنى لحظة وأنا بعيد تشغيل النظام`, 
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

handler.help = ['ريستارت'];
handler.tags = ['owner'];
handler.command = ['restart','reiniciar', 'ريستارت', 'اعادة'];
handler.owner = true;

export default handler;