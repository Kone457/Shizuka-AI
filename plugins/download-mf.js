import axios from 'axios';

function isValidMediafireUrl(url) {
  try {
    const parsed = new URL(url);
    const hostOk = parsed.hostname.includes('mediafire.com');
    const pathOk = parsed.pathname.includes('/file/');
    const queryOk = parsed.search.length > 1;
    return hostOk && (pathOk || queryOk);
  } catch {
    return false;
  }
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    if (!args[0]) {
      return m.reply(
        `> Ingresa un enlace de un archivo de mediafire.`
      );
    }

    const input = args.join(' ');
    const isValidUrl = isValidMediafireUrl(input);

    if (!isValidUrl) {
      return m.reply('> Por favor, ingresa un enlace válido de MediaFire.');
    }

    const mediafireUrl = input;

    await conn.sendMessage(m.chat, { text: '⏳ *Procesando solicitud...*' }, { quoted: m });

    const response = await axios.get(`https://api.nekolabs.web.id/downloader/mediafire?url=${encodeURIComponent(mediafireUrl)}`);
    const data = response.data;

    if (!data.success || !data.result) {
      return m.reply('️> No se pudo procesar el enlace. Verifica que sea válido.');
    }

    const { filename, filesize, mimetype, uploaded, download_url } = data.result;

    const sizeInMB = parseFloat(filesize);
    const isLargeFile = filesize.includes('GB') || sizeInMB > 500;

    const info = `> 📦 *Archivo encontrado:*\n\n` +
      `> 📄 *Nombre:* ${filename}\n` +
      `> 📦 *Peso:* ${filesize}\n` +
      `> 📅 *Subido:* ${uploaded}\n` +
      `> 📁 *Tipo:* ${mimetype}\n\n` +
      `> 📂 *Enviando archivo...`;

    await conn.sendMessage(m.chat, { text: info }, { quoted: m });

    if (!isLargeFile) {
      await conn.sendMessage(
        m.chat,
        {
          document: { url: download_url },
          mimetype: mimetype,
          fileName: filename,
        },
        { quoted: m }
      );
    } else {
      await conn.sendMessage(m.chat, {
        text: `> *El archivo es muy grande (${filesize}). Descárgalo manualmente desde el enlace proporcionado.*`
      }, { quoted: m });
    }

  } catch (error) {
    console.error(error);
    m.reply('> ❌ Error al procesar el enlace. Verifica que sea válido o inténtalo nuevamente.')
  }
};

handler.help = ['mediafire', 'mf'];
handler.tags = ['descargas'];
handler.command = ['mediafire', 'mf'];

export default handler;