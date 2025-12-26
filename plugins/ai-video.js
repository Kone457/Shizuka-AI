import fetch from 'node-fetch';

const ANYABRAT_API_PATH = 'https://api-faa.my.id/faa/anyabrat-vid';

let handler = async (m, { conn, args }) => {
  const text = args.join(' ').trim();

  if (!text) {
    return m.reply('> Escribe una *petición* para generar el vídeo.');
  }

  try {
    const { key } = await conn.sendMessage(
      m.chat,
      { text: '> Generando vídeo, por favor espera...' },
      { quoted: m }
    );

    const res = await fetch(`${ANYABRAT_API_PATH}?text=${encodeURIComponent(text)}`);

    if (!res.ok) {
      return m.reply(`> Error al contactar con la API. Código de error: ${res.status}`);
    }

    const contentType = res.headers.get('content-type');
    console.log('Content-Type:', contentType);

    if (!contentType || !contentType.includes('video')) {
      return m.reply('> La respuesta de la API no es un archivo de vídeo. Content-Type: ' + contentType);
    }

    const videoBuffer = await res.buffer();

    if (!videoBuffer || videoBuffer.length === 0) {
      return m.reply('> No se pudo obtener el vídeo correctamente.');
    }

    await conn.sendMessage(m.chat, { video: videoBuffer, caption: 'Aquí tienes el vídeo generado:', edit: key });

  } catch (error) {
    console.error(error);
    await m.reply(`> Ocurrió un error al procesar tu solicitud: ${error.message}`);
  }
};

handler.help = ['brat'];
handler.tags = ['ia'];
handler.command = ['brat'];

export default handler;