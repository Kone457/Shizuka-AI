const handler = async (m, { conn }) => {
  const texto = (m.text || '').trim().toLowerCase();

  const despedidas = [
    'adiós',
    'hasta luego',
    'hasta mañana',
    'nos vemos',
    'me voy',
    'bye',
    'chao',
    'hasta pronto'
  ];

  if (!despedidas.includes(texto)) return;

  const imageUrl = 'https://qu.ax/TcFBY.jpg';

  await conn.sendMessage(m.chat, {
    image: { url: imageUrl }
  }, { quoted: m });
};

handler.customPrefix = /^(adiós|hasta luego|hasta mañana|nos vemos|me voy|bye|chao|hasta pronto)$/i;
handler.command = new RegExp(); 
handler.group = false;
handler.admin = false;
handler.botAdmin = false;
handler.tags = ['imagen'];
handler.help = ['despedidas'];

export default handler;