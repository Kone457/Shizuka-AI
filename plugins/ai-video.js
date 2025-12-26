import fetch from 'node-fetch';

const ANYA_PATH = 'https://api-faa.my.id/faa/anyabrat-vid';

let handler = async (m, { conn, args }) => {
  const text = args.join(' ').trim();

  if (!text) {
    return m.reply('> Escribe un *texto* para que *Anya* genere tu video.');
  }

  try {
    const { key } = await conn.sendMessage(
      m.chat,
      { text: '> 🎥 *Anya* está procesando tu video...' },
      { quoted: m }
    );

    // Llamada a la API
    const res = await fetch(`${ANYA_PATH}?text=${encodeURIComponent(text)}`);
    const json = await res.json();

    // La API devuelve un enlace de video
    const videoUrl = json?.result || json?.url || json?.video;

    if (!videoUrl) {
      return conn.reply(m.chat, '> No se pudo generar un *video* válido.');
    }

    // Enviar el video generado
    await conn.sendMessage(
      m.chat,
      {
        video: { url: videoUrl },
        caption: `🎬 Video generado para: ${text}`
      },
      { edit: key }
    );
  } catch (error) {
    console.error(error);
    await m.reply('️> Ocurrió un error al procesar tu solicitud.');
  }
};

handler.help = ['anya'];
handler.tags = ['ia'];
handler.command = ['anya'];

export default handler;