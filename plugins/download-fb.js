import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text || !/(facebook\.com|fb\.watch|fb\.gg)/.test(text)) {
    return await conn.sendMessage(
      m.chat,
      { text: `《✧》 Proporciona un enlace válido de Facebook.` },
      { quoted: m }
    );
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    const { data } = await axios.get(
      `${api.url}/download/facebook?url=${encodeURIComponent(text)}&apikey=${api.key}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        timeout: 30000
      }
    );

    const result = data?.result || data
    if (!result?.media) {
      throw new Error(data?.message || 'No se pudo descargar el contenido de Facebook.')
    }

    const { title, duration, media } = result
    let dlUrl = media?.video || media?.video_sd

    if (!dlUrl) {
      throw new Error('No se encontró un enlace de video válido.')
    }

    if (dlUrl.startsWith('/')) {
      dlUrl = new URL(dlUrl, api.url).toString()
    }

    await conn.sendMessage(
      m.chat,
      {
        video: { url: dlUrl },
        caption: `*✿ Aquí tienes...*\n\n📌 ${title || 'Video de Facebook'}${duration ? `\n⏱️ Duración: ${duration}s` : ''}`
      },
      { quoted: m }
    );

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

  } catch (err) {
    console.error('❏ Error:', err);
    await conn.sendMessage(
      m.chat,
      { text: `❏ Error al procesar la solicitud.\n❏ Detalles: ${err.message}` },
      { quoted: m }
    );
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
  }
};

handler.help = ['facebook'];
handler.tags = ['descargas'];
handler.command = ['fb', 'facebook'];
handler.group = true;

export default handler;