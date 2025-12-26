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

    const res = await fetch(`${ANYABRAT_API_PATH}?text=${encodeURIComponent(text)}`, { timeout: 10000 });

    console.log('Respuesta de la API:', res.status);  // Log del estado de la respuesta
    console.log('Headers:', res.headers);            // Log de los headers de la respuesta

    if (!res.ok) {
      return m.reply(`> Error al contactar con la API. Código de error: ${res.status}`);
    }

    const contentType = res.headers.get('content-type');
    console.log('Content-Type:', contentType);  // Log del tipo de contenido

    if (contentType.includes('image/webp')) {
      const imageBuffer = await res.buffer();

      console.log('Image buffer length:', imageBuffer.length);  // Log del tamaño del buffer de imagen

      if (!imageBuffer || imageBuffer.length === 0) {
        return m.reply('> No se pudo obtener la imagen correctamente.');
      }

      await conn.sendMessage(m.chat, { image: imageBuffer, caption: 'Aquí tienes la imagen generada:', edit: key });
    } else {
      return m.reply('> La respuesta de la API no es una imagen válida.');
    }

  } catch (error) {
    console.error(error);
    await m.reply(`> Ocurrió un error al procesar tu solicitud: ${error.message}`);
  }
};

handler.help = ['brat'];
handler.tags = ['ia', 'media'];
handler.command = ['brat'];

export default handler;