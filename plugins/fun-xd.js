/** const handler = async (m, { conn }) => {
  const texto = (m.text || '').trim();


  const textoLower = texto.toLowerCase();


  const xdRegex = /xd+/i;

  if (!xdRegex.test(textoLower)) return;

  const imageUrl = 'https://files.catbox.moe/990b6k.jpg';


  await conn.sendMessage(m.chat, {
    image: { url: imageUrl }
  }, { quoted: m });
};


handler.customPrefix = /xd+/i; 
handler.command = new RegExp(); 
handler.group = false;
handler.admin = false;
handler.botAdmin = false;
handler.tags = ['imagen'];
handler.help = ['xd'];

export default handler;
**/