import axios from 'axios';

let handler = async (m, { conn, text, command }) => {
  if (!text) return m.reply(`> Escribe el texto.\n\n*Ejemplo:* .${command} Hola`);

  try {
    await m.react('⏳');
    
    const apiUrl = `https://api-faa.my.id/faa/anyabrat-vid?text=${encodeURIComponent(text)}`;

    const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');

    await conn.sendMessage(
      m.chat, 
      { 
        sticker: buffer 
      }, 
      { quoted: m }
    );

    await m.react('✅');
  } catch (e) {
    console.error(e);
    await m.react('❌');
    await m.reply('> La API devolvió un formato no compatible o está caída.');
  }
};

handler.help = ['anyagif'];
handler.tags = ['ia'];
handler.command = ['anyagif', 'brat']; 

export default handler;
