import fetch from 'node-fetch';

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('> Escribe un texto para generar el sticker.');

  try {
    await m.react('⏳');
    
    const apiUrl = `https://api-faa.my.id/faa/anyabrat-vid?text=${encodeURIComponent(text)}`;
    const res = await fetch(apiUrl);
    
    if (!res.ok) throw new Error();
    const buffer = await res.buffer();

    await conn.sendMessage(m.chat, { sticker: buffer }, { quoted: m });
    await m.react('✅');
    
  } catch (error) {
    console.error(error);
    await m.react('❌');
  }
};

handler.help = ['brat'];
handler.tags = ['ia'];
handler.command = ['brat'];

export default handler;
