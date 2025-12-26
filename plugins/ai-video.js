import fetch from 'node-fetch';

let handler = async (m, { conn, text, command }) => {
  if (!text) return m.reply(`> Escribe el texto para el video.\n\n*Ejemplo:* .${command} Hola`);

  try {
    await m.react('⏳');
    const apiUrl = `https://api-faa.my.id/faa/anyabrat-vid?text=${encodeURIComponent(text)}`;
    
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error();
    const buffer = await response.buffer();

    await conn.sendMessage(
      m.chat, 
      { 
        video: buffer, 
        caption: `> *Anya Brat:* ${text}`,
        gifPlayback: true 
      }, 
      { quoted: m }
    );

    await m.react('✅');
  } catch (error) {
    console.error(error);
    await m.react('❌');
    await m.reply('> Ocurrió un error al generar el video.');
  }
};

handler.help = ['anyagif'];
handler.tags = ['ia'];
handler.command = ['brat']; 

export default handler;
