import fetch from 'node-fetch';

const handler = async (m, { conn, text }) => {
  if (!text) {
    await conn.sendMessage(m.chat, { react: { text: '✰', key: m.key } });

    return m.reply(`
  ╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼☁️ 𝐘𝐎𝐔𝐓𝐔𝐁𝐄 𝐏𝐋𝐀𝐘 ☁️╮
┃֪࣪
├ׁ̟̇❍✎ Ingresa el nombre de la música
├ׁ̟̇❍✎ Ej: play imagine dragons
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯
`.trim());
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: 'ⴵ', key: m.key } });

    const res = await fetch(`${api.url}/search/youtube?q=${encodeURIComponent(text)}&apikey=${api.key}`);
    const json = await res.json();

    if (!json.status || !json.result?.length) {
      await conn.sendMessage(m.chat, { react: { text: '✰', key: m.key } });

      return m.reply(`
  ╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼☁️ 𝐒𝐈𝐍 𝐑𝐄𝐒𝐔𝐋𝐓𝐀𝐃𝐎𝐒 ☁️╮
┃֪࣪
├ׁ̟̇❍✎ No se encontró coincidencia
├ׁ̟̇❍✎ Intenta otro nombre
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯
`.trim());
    }

    const { title, channel, duration, imageUrl, link } = json.result[0];

    const caption = `
  ╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼☁️ 𝐘𝐎𝐔𝐓𝐔𝐁𝐄 ☁️╮
┃֪࣪
├ׁ̟̇❍✎ ❖ ${title}
├ׁ̟̇❍✎ ✿ Canal: ${channel}
├ׁ̟̇❍✎ ⏱️ Duración: ${duration}
┃֪࣪
├ׁ̟̇❍✎ 🔗 Link:
├ׁ̟̇❍✎ ${link}
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯

✰ Selecciona una opción
`.trim();

    const thumb = await (await fetch(imageUrl)).buffer();

    await conn.sendMessage(m.chat, {
      image: thumb,
      caption,
      buttons: [
        { buttonId: `audio_${link}`, buttonText: { displayText: '❖ AUDIO' }, type: 1 },
        { buttonId: `video_${link}`, buttonText: { displayText: '❖ VIDEO' }, type: 1 }
      ],
      headerType: 4
    }, { quoted: m });

  } catch (e) {
    await conn.sendMessage(m.chat, { react: { text: '✰', key: m.key } });

    m.reply(`
  ╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼☁️ 𝐄𝐑𝐑𝐎𝐑 ☁️╮
┃֪࣪
├ׁ̟̇❍✎ No se pudo procesar la solicitud
├ׁ̟̇❍✎ Intenta nuevamente
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯
`.trim());
  }
};

handler.before = async (m, { conn }) => {
  const id = m.message?.buttonsResponseMessage?.selectedButtonId;
  if (!id) return;

  try {

    if (id.startsWith('audio_')) {
      const link = id.replace('audio_', '');

      await conn.sendMessage(m.chat, { react: { text: 'ⴵ', key: m.key } });

      const res = await fetch(`${api.url}/download/audio?url=${encodeURIComponent(link)}&apikey=${api.key}`);
      const json = await res.json();

      if (!json.status || !json.result?.url) {
        await conn.sendMessage(m.chat, { react: { text: '✰', key: m.key } });

        return m.reply(`
  ╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼☁️ 𝐀𝐔𝐃𝐈𝐎 ☁️╮
┃֪࣪
├ׁ̟̇❍✎ No disponible
├ׁ̟̇❍✎ Intenta otro video
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯
`.trim());
      }

      const data = json.result;

      await conn.sendMessage(m.chat, { react: { text: '❖', key: m.key } });

      await conn.sendMessage(m.chat, {
        audio: { url: data.url },
        mimetype: 'audio/mpeg',
        fileName: `${(data.title || 'audio').replace(/[^\w\s]/gi, '')}.mp3`,
        caption: `
  ╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼☁️ 𝐀𝐔𝐃𝐈𝐎 ☁️╮
┃֪࣪
├ׁ̟̇❍✎ ${data.title || 'Audio'}
├ׁ̟̇❍✎ ⏱️ ${data.info?.duration || 'Desconocido'}
├ׁ̟̇❍✎ ⚡ ${data.quality} kbps
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯
`.trim()
      }, { quoted: m });
    }

    if (id.startsWith('video_')) {
      const link = id.replace('video_', '');

      await conn.sendMessage(m.chat, { react: { text: 'ⴵ', key: m.key } });

      const res = await fetch(`${api.url}/download/video?url=${encodeURIComponent(link)}&apikey=${api.key}`);
      const json = await res.json();

      if (!json.status || !json.result?.url) {
        await conn.sendMessage(m.chat, { react: { text: '✰', key: m.key } });

        return m.reply(`
  ╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼☁️ 𝐕𝐈𝐃𝐄𝐎 ☁️╮
┃֪࣪
├ׁ̟̇❍✎ No disponible
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯
`.trim());
      }

      const data = json.result;

      await conn.sendMessage(m.chat, { react: { text: '❖', key: m.key } });

      await conn.sendMessage(m.chat, {
        video: { url: data.url },
        fileName: `${(data.title || 'video').replace(/[^\w\s]/gi, '')}.mp4`,
        mimetype: 'video/mp4'
      }, { quoted: m });
    }

  } catch {
    await conn.sendMessage(m.chat, { react: { text: '✰', key: m.key } });

    m.reply(`
  ╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼☁️ 𝐄𝐑𝐑𝐎𝐑 ☁️╮
┃֪࣪
├ׁ̟̇❍✎ Fallo inesperado
├ׁ̟̇❍✎ Intenta nuevamente
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯
`.trim());
  }
};

handler.command = ['play', 'play2'];
handler.tags = ['descargas'];
handler.help = ['play'];
handler.group = true;

export default handler;