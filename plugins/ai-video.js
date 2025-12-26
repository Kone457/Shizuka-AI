import fetch from 'node-fetch';

const ANYA_PATH = 'https://api-faa.my.id/faa/anyabrat-vid';

let handler = async (m, { conn, args }) => {
  const text = args.join(' ').trim();

  if (!text) {
    return m.reply('> Escribe un *texto* para generar el vídeo.');
  }

  try {
    const { key } = await conn.sendMessage(
      m.chat,
      { text: '> 🎥 Estoy generando tu vídeo...' },
      { quoted: m }
    );

    const url = `${ANYA_PATH}?text=${encodeURIComponent(text)}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Error al descargar video: ${res.statusText}`);
    const buffer = await res.buffer();

    await conn.sendMessage(
      m.chat,
      {
        video: buffer,
        caption: `> 🎬 Aquí está tu vídeo generado:\n"${text}"`
      },
      { quoted: m, edit: key }
    );
  } catch (error) {
    console.error(error);
    await m.reply('️> Ocurrió un error al procesar tu solicitud.');
  }
};

handler.help = ['video'];
handler.tags = ['ia'];
handler.command = ['video'];

export default handler;