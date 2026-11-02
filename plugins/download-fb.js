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

    const result = data?.result ?? data?.data ?? data?.resultado ?? data

    let media =
      result?.media ??
      result?.result?.media ??
      result?.resultado?.media ??
      null

    if (!media) {
      const list = result?.list || result?.result?.list
      if (Array.isArray(list) && list.length) {
        const hd = list.find(i => /720|hd/i.test(i.quality || ''))
        const sd = list.find(i => !/720|hd/i.test(i.quality || ''))
        media = {
          video: hd?.url || list[0]?.url || null,
          video_sd: sd?.url || null
        }
      }
    }

    if (!media) {
      const v = result?.video || result?.video_hd || result?.video_sd || result?.url || null
      if (v) media = { video: result.video_hd || v, video_sd: result.video_sd || null }
    }

    if (!media) {
      throw new Error(data?.message || data?.mensaje || 'No se pudo descargar el contenido de Facebook.')
    }

    let dlUrl = media.video || media.video_sd || media.video_hd || media.hd || media.sd

    if (!dlUrl) {
      throw new Error('No se encontró un enlace de video válido.')
    }

    if (dlUrl.startsWith('/')) {
      dlUrl = new URL(dlUrl, api.url).toString()
    }

    const title =
      result?.title || result?.titulo || result?.result?.title || null
    const duration =
      result?.duration || result?.duracion || result?.result?.duration || null
    const thumbnail =
      result?.thumbnail || result?.thumb || result?.result?.thumbnail || null

    await conn.sendMessage(
      m.chat,
      {
        video: { url: dlUrl },
        caption: `*✿ Aquí tienes...*\n\n📌 ${title || 'Video de Facebook'}${duration ? `\n⏱️ Duración: ${duration}s` : ''}`,
        ...(thumbnail ? { jpegThumbnail: undefined, thumbnail: undefined } : {})
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