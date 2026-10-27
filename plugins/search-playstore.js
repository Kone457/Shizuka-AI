import fetch from 'node-fetch';

let handler = async (m, { conn, text }) => {
  try {
    if (!text?.trim()) {
      return m.reply('🔎 Especifica tu búsqueda.');
    }

    const consulta = text.trim();

    const response = await fetch(
      `${api.url}/search/playstore?q=${encodeURIComponent(consulta)}&apikey=${api.key}`
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!data?.estado || !Array.isArray(data.resultados) || !data.resultados.length) {
      return m.reply(`🔎 Sin resultados para *${consulta}*.`);
    }

    const resultados = data.resultados.slice(0, 3);

    let caption = `🔎 *Play Store*\n\nResultados para *${consulta}*:\n\n`;

    for (const app of resultados) {
      caption +=
        `📱 *${app.titulo || 'N/A'}*\n` +
        `👨‍💻 Desarrollador: ${app.desarrollador || 'N/A'}\n` +
        `⭐ Valoración: ${app.rating ?? 'N/A'}\n` +
        `📦 Package: ${app.package || 'N/A'}\n` +
        `🔗 ${app.link || 'N/A'}\n\n`;
    }

    const primeraImagen = resultados.find(a => a.grande || a.pequeña);
    const imageUrl = primeraImagen?.grande || primeraImagen?.pequeña;

    if (imageUrl) {
      try {
        const imageResponse = await fetch(imageUrl);
        if (imageResponse.ok) {
          const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
          return await conn.sendMessage(
            m.chat,
            { image: imageBuffer, caption },
            { quoted: m }
          );
        }
      } catch (imgErr) {
        console.error('PLAYSTORE IMG:', imgErr.message);
      }
    }

    await conn.sendMessage(m.chat, { text: caption }, { quoted: m });

  } catch (error) {
    console.error('PLAYSTORE ERROR:', error);
    await m.reply('No fue posible realizar la búsqueda.');
  }
};

handler.help = ['playstore'];
handler.tags = ['buscadores'];
handler.command = ['playstore'];

export default handler;