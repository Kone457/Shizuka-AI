/* import fetch from 'node-fetch'

const isUrl = (text) => /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/[^\s]+$/i.test(text)

const handler = async (m, { conn, command, text }) => {
  if (!text) {
    await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } })
    return m.reply('Ingresa el nombre o link de YouTube.')
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

    if (isUrl(text)) {
      if (command === 'play' || command === 'mp3' || command === 'ytmp3') {
        const res = await fetch(`${api.url}/download/audio?url=${encodeURIComponent(text)}&apikey=${api.key}`)
        const json = await res.json()
        if (!json.status || !json.result?.url) {
          await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
          return m.reply('No se pudo obtener el audio.')
        }
        const data = json.result
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
        await conn.sendMessage(m.chat, {
          audio: { url: data.url },
          mimetype: 'audio/mpeg',
          fileName: `${(data.title || 'audio').replace(/[^\w\s]/gi, '')}.mp3`
        }, { quoted: m })
      }

      if (command === 'mp4' || command === 'ytmp4' || command === 'play2') {
        const res = await fetch(`${api.url}/download/ytv2?url=${encodeURIComponent(text)}&apikey=${api.key}`)
        const json = await res.json()
        if (!json.status || !json.result?.dl_url) {
          await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
          return m.reply('No se pudo obtener el video.')
        }
        const data = json.result
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
        await conn.sendMessage(m.chat, {
          video: { url: data.dl_url },
          mimetype: 'video/mp4',
          fileName: `${(data.title || 'video').replace(/[^\w\s]/gi, '')}.mp4`
        }, { quoted: m })
      }

      return
    }

    const res = await fetch(`${api.url}/search/youtube?q=${encodeURIComponent(text)}&apikey=${api.key}`)
    const json = await res.json()
    if (!json.status || !json.result?.length) {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      return m.reply('No se encontró coincidencia, intenta otro nombre.')
    }

    const data = json.result[0]
    const link = data.link
    const caption = `
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼☁️ 𝐘𝐎𝐔𝐓𝐔𝐁𝐄 ☁️╮
┃֪࣪
├ׁ̟̇❍✎ ❖ ${data.title}
├ׁ̟̇❍✎ ✿ Canal: ${data.channel}
├ׁ̟̇❍✎ ⏱️ Duración: ${data.duration}
┃֪࣪
├ׁ̟̇❍✎ 🔗 Link:
├ׁ̟̇❍✎ ${link}
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯

✰ Selecciona una opción
`.trim()

    let message = {
      caption,
      buttons: [
        { buttonId: `audio_${link}`, buttonText: { displayText: '❖ AUDIO' }, type: 1 },
        { buttonId: `video_${link}`, buttonText: { displayText: '❖ VIDEO' }, type: 1 }
      ],
      headerType: 4
    }

    if (data.imageUrl) {
      const thumb = await (await fetch(data.imageUrl)).buffer()
      message.image = thumb
    }

    await conn.sendMessage(m.chat, message, { quoted: m })

  } catch (e) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    m.reply('Error inesperado, intenta nuevamente.')
  }
}

handler.before = async (m, { conn }) => {
  const id = m.message?.buttonsResponseMessage?.selectedButtonId
  if (!id) return

  try {
    if (id.startsWith('audio_')) {
      const link = id.replace('audio_', '')
      await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })
      const res = await fetch(`${api.url}/download/audio?url=${encodeURIComponent(link)}&apikey=${api.key}`)
      const json = await res.json()
      if (!json.status || !json.result?.url) {
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        return m.reply('No se pudo obtener el audio.')
      }
      const data = json.result
      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
      await conn.sendMessage(m.chat, {
        audio: { url: data.url },
        mimetype: 'audio/mpeg',
        fileName: `${(data.title || 'audio').replace(/[^\w\s]/gi, '')}.mp3`
      }, { quoted: m })
    }

    if (id.startsWith('video_')) {
      const link = id.replace('video_', '')
      await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })
      const res = await fetch(`${api.url}/download/ytv2?url=${encodeURIComponent(link)}&apikey=${api.key}`)
      const json = await res.json()
      if (!json.status || !json.result?.dl_url) {
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        return m.reply('No se pudo obtener el video.')
      }
      const data = json.result
      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
      await conn.sendMessage(m.chat, {
        video: { url: data.dl_url },
        mimetype: 'video/mp4',
        fileName: `${(data.title || 'video').replace(/[^\w\s]/gi, '')}.mp4`
      }, { quoted: m })
    }
  } catch (e) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    m.reply('Error inesperado, intenta nuevamente.')
  }
}

handler.command = ['play', 'play2', 'mp3', 'mp4', 'ytmp3', 'ytmp4']
handler.tags = ['descargas']
handler.help = ['play']
handler.group = true

export default handler
*/



import { Audio, Video } from "@spoky/nex";
import yts from "yt-search";
import fetch from "node-fetch";

const isUrl = (text) => /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/[^\s]+$/i.test(text);

async function getAudio(link) {
  const bitrates = [128, 160, 320];
  for (const br of bitrates) {
    const data = await Audio(link, br).catch(err => err);
    if (data?.url) return data;
    if (data?.error) return data; // devuelve error crudo para depuración
  }
  return { error: "No bitrate válido" };
}

const handler = async (m, { conn, command, text }) => {
  if (!text) {
    await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
    return m.reply('Ingresa el nombre o link de YouTube.');
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    if (isUrl(text)) {
      if (command === 'play' || command === 'mp3' || command === 'ytmp3') {
        const data = await getAudio(text);
        if (!data?.url) {
          await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
          return m.reply(`Error en scraper:\n${JSON.stringify(data, null, 2)}`);
        }
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
        await conn.sendMessage(m.chat, {
          audio: { url: data.url },
          mimetype: 'audio/mpeg',
          fileName: `${(data.title || 'audio').replace(/[^\w\s]/gi, '')}.mp3`
        }, { quoted: m });
      }

      if (command === 'play2' || command === 'mp4' || command === 'ytmp4') {
        const data = await Video(text, 720).catch(err => err);
        if (!data?.url) {
          await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
          return m.reply(`Error en scraper:\n${JSON.stringify(data, null, 2)}`);
        }
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
        await conn.sendMessage(m.chat, {
          video: { url: data.url },
          mimetype: 'video/mp4',
          fileName: `${(data.title || 'video').replace(/[^\w\s]/gi, '')}.mp4`
        }, { quoted: m });
      }

      return;
    }

    const search = await yts(text);
    if (!search.videos.length) {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      return m.reply('No se encontró coincidencia, intenta otro nombre.');
    }

    const data = search.videos[0];
    const link = data.url;
    const caption = `
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼☁️ 𝐘𝐎𝐔𝐓𝐔𝐁𝐄 ☁️╮
┃֪࣪
├ׁ̟̇❍✎ ❖ ${data.title}
├ׁ̟̇❍✎ ✿ Canal: ${data.author.name}
├ׁ̟̇❍✎ ⏱️ Duración: ${data.timestamp}
┃֪࣪
├ׁ̟̇❍✎ 🔗 Link:
├ׁ̟̇❍✎ ${link}
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯

✰ Selecciona una opción
`.trim();

    let message = {
      caption,
      buttons: [
        { buttonId: `audio_${link}`, buttonText: { displayText: '❖ AUDIO' }, type: 1 },
        { buttonId: `video_${link}`, buttonText: { displayText: '❖ VIDEO' }, type: 1 }
      ],
      headerType: 4
    };

    if (data.thumbnail) {
      const resp = await fetch(data.thumbnail);
      const buff = Buffer.from(await resp.arrayBuffer());
      message.image = buff;
    }

    await conn.sendMessage(m.chat, message, { quoted: m });

  } catch (e) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    m.reply(`Error inesperado:\n${e?.stack || e}`);
  }
};

handler.before = async (m, { conn }) => {
  const id = m.message?.buttonsResponseMessage?.selectedButtonId;
  if (!id) return;

  try {
    if (id.startsWith('audio_')) {
      const link = id.replace('audio_', '');
      await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
      const data = await getAudio(link);
      if (!data?.url) {
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        return m.reply(`Error en scraper:\n${JSON.stringify(data, null, 2)}`);
      }
      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      await conn.sendMessage(m.chat, {
        audio: { url: data.url },
        mimetype: 'audio/mpeg',
        fileName: `${(data.title || 'audio').replace(/[^\w\s]/gi, '')}.mp3`
      }, { quoted: m });
    }

    if (id.startsWith('video_')) {
      const link = id.replace('video_', '');
      await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
      const data = await Video(link, 720).catch(err => err);
      if (!data?.url) {
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        return m.reply(`Error en scraper:\n${JSON.stringify(data, null, 2)}`);
      }
      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      await conn.sendMessage(m.chat, {
        video: { url: data.url },
        mimetype: 'video/mp4',
        fileName: `${(data.title || 'video').replace(/[^\w\s]/gi, '')}.mp4`
      }, { quoted: m });
    }
  } catch (e) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    m.reply(`Error inesperado:\n${e?.stack || e}`);
  }
};

handler.command = ['play', 'play2', 'mp3', 'mp4', 'ytmp3', 'ytmp4'];
handler.tags = ['descargas'];
handler.help = ['play'];
handler.group = true;

export default handler;