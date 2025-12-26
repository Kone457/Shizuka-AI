import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    await conn.sendMessage(m.chat, { react: { text: '❔', key: m.key } });
    return m.reply(`> Escribe el texto para generar el sticker animado.\n\n*Ejemplo:* ${usedPrefix + command} Cenix es Gey`);
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    const apiUrl = `https://api-faa.my.id/faa/anyabrat-vid?text=${encodeURIComponent(text)}`;
    const res = await fetch(apiUrl);

    if (!res.ok) {
      await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
      return;
    }

    const buffer = await res.buffer();

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    
    await conn.sendMessage(
      m.chat, 
      { sticker: buffer }, 
      { quoted: m }
    );

  } catch (error) {
    console.error(error);
    await conn.sendMessage(m.chat, { react: { text: '💥', key: m.key } });
  }
};

handler.help = ['brat'];
handler.tags = ['ia'];
handler.command = ['brat'];

export default handler;
