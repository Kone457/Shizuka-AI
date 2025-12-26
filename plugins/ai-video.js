import fetch from 'node-fetch';

let handler = async (m, { conn, text, command }) => {
  if (!text) return m.reply(`> Escribe el texto para el video.\n\n*Ejemplo:* .${command} Hola`);

  try {
    await m.react('⏳');
    const apiUrl = `https://api-faa.my.id/faa/anyabrat-vid?text=${encodeURIComponent(text)}`;

    await conn.sendMessage(
      m.chat, 
      { 
        video: { url: apiUrl }, 
        caption: `> *Anya Brat:* ${text}`,
        gifPlayback: true 
      }, 
      { quoted: m }
    );

    await m.react('✅');
  } catch (error) {
    console.error(error);
    await m.reply('> Ocurrió un error.');
  }
};

handler.help = ['brat'];
handler.tags = ['ia'];
handler.command = ['brat']; 

export default handler;
