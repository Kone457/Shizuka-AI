const handler = async (m, { conn }) => {
  const texto = (m.text || '').trim().toUpperCase();

  if (texto !== 'A') return;

  const imageUrl = 'https://qu.ax/ZdOdf.jpg';

  await conn.sendMessage(m.chat, {
    image: { url: imageUrl }
  }, { quoted: m });
};

handler.customPrefix = /^A$/i; 
handler.command = new RegExp(); 
handler.group = false;
handler.admin = false;
handler.botAdmin = false;
handler.tags = ['imagen'];
handler.help = ['A'];

export default handler;