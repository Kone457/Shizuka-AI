const handler = async (m, { conn }) => {
  const texto = (m.text || '').trim().toLowerCase();

  if (texto !== 'carlos') return;

  const imageUrl = 'https://qu.ax/mJCtJ.jpg';

  await conn.sendMessage(m.chat, {
    image: { url: imageUrl },
    caption: '> Es mío zorra'
  }, { quoted: m });
};

handler.customPrefix = /^carlos$/i; 
handler.command = new RegExp();  
handler.group = false;
handler.admin = false;
handler.botAdmin = false;
handler.tags = ['imagen'];
handler.help = ['carlos'];

export default handler;