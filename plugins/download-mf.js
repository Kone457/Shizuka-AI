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
        `> Ingresa un enlace de un apk de mediafire o un titulo.`
      );
    }

    const input = args.join(' ');
    const isValidUrl = isValidMediafireUrl(input);

    // await conn.sendMessage(m.chat, { text: '⏳ *Procesando solicitud...*' }, { quoted: m });

    let mediafireUrl = input;

    if (!isValidUrl) {
      const searchRes = await axios.get(`${api.url}/search/mediafire?query=${encodeURIComponent(input)}&apikey=${api.key}`);
      const searchData = searchRes.data;

      if (!searchData.status || !searchData.results?.length) {
        return m.reply('> No se encontraron resultados para tu búsqueda.');
      }

      const result = searchData.results[Math.floor(Math.random() * searchData.results.length)];
      mediafireUrl = result.url;
    }

    const response = await axios.get(`${api.url}/dow/mediafire?url=${mediafireUrl}&apikey=${api.key}`);
    const data = response.data;

    if (!data.status || !data.data) {
      return m.reply('️> No se pudo procesar el enlace.');
    }

    const { title, peso, fecha, tipo, dl } = data.data;

    const info = `> 📦 *Archivo encontrado:*\n\n` +
      `> 📄 *Nombre:* ${title}\n` +
      `> 📦 *Peso:* ${peso}\n` +
      `> 📅 *Fecha:* ${fecha}\n` +
      `> 📁 *Tipo:* ${tipo}\n\n` +
      `> 🔗 *Enlace directo:* ${dl}`;

    await conn.sendMessage(m.chat, { text: info, ...fake }, { quoted: m });

    if (!/GB|gb/.test(peso)) {
      await conn.sendMessage(
        m.chat,
        {
          document: { url: dl },
          mimetype: tipo,
          fileName: title,
        },
        { quoted: m }
      );
    } else {
      await conn.sendMessage(m.chat, {
        text: `> *El archivo supera el límite permitido para envío directo.*`
      }, { quoted: m });
    }

  } catch (error) {
    // console.error(error);
    m.reply('> No se puede realizar la descarga. Intenta nuevamente.')
  }
};

handler.help = ['mediafire', 'mf'];
handler.tags = ['descargas'];
handler.command = ['mediafire', 'mf'];

export default handler;