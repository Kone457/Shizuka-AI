const handler = async (m, { conn }) => {
  const texto = (m.text || '').trim().toLowerCase();

  if (texto !== 'uwu') return;

  const imageUrl = 'https://qu.ax/RPNGy.jpg';

  await conn.sendMessage(m.chat, {
    image: { url: imageUrl }
  }, { quoted: m });
};

handler.customPrefix = /^xd$/i; 
handler.command = new RegExp();  
handler.group = false;
handler.admin = false;
handler.botAdmin = false;
handler.tags = ['imagen'];
handler.help = ['uwu'];

export default handler;