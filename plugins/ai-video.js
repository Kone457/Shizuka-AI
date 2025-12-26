import fetch from 'node-fetch';

let handler = async (m, { conn, text }) => {
  if (!text) return conn.reply(m.chat, '> Escribe un texto para generar el sticker.', m);

  try {
    const apiUrl = `https://api-faa.my.id/faa/anyabrat-vid?text=${encodeURIComponent(text)}`;
    const res = await fetch(apiUrl);
    
    if (!res.ok) throw new Error('Error en la API');
    const buffer = await res.buffer();

    await conn.sendMessage(m.chat, { sticker: buffer }, { quoted: m });
    
  } catch (error) {
    console.error(error);
    conn.reply(m.chat, '> Ocurrió un error al procesar la solicitud.', m);
  }
};

handler.help = ['anyabrat'];
handler.tags = ['ia'];
handler.command = ['brat', 'anyasticker'];

export default handler;
