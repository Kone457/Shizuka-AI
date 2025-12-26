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

    // Realizamos la petición a la API
    const res = await fetch(`${ANYABRAT_API_PATH}?text=${encodeURIComponent(text)}`);

    // Si la respuesta no es 200 OK, mostrar un error
    if (!res.ok) {
      return m.reply(`> Error al contactar con la API. Código de error: ${res.status}`);
    }

    // Intentar parsear la respuesta como JSON
    const json = await res.json();

    // Verificar si la API devuelve una URL del vídeo
    const videoUrl = json?.result;

    if (!videoUrl) {
      return conn.reply(m.chat, '> No se pudo obtener el vídeo. La respuesta de la API no contiene un URL válido.');
    }

    // Enviar el video a la conversación (usamos la URL directamente)
    await conn.sendMessage(m.chat, { video: { url: videoUrl }, caption: 'Aquí tienes el vídeo generado:', edit: key });
  } catch (error) {
    console.error(error);
    await m.reply(`> Ocurrió un error al procesar tu solicitud: ${error.message}`);
  }
};

handler.help = ['brat'];
handler.tags = ['ia', 'media'];
handler.command = ['brat'];

export default handler;