import fetch from 'node-fetch';

let handler = async (m, { conn, text }) => {
  try {
    if (!text?.trim()) {
      return m.reply('🔎 Especifica tu búsqueda.');
    }

    const consulta = text.trim();

    const response = await fetch(
      `${api.url}/search/steam?q=${encodeURIComponent(consulta)}&apikey=${api.key}`
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!data?.estado || !Array.isArray(data.resultados) || !data.resultados.length) {
      return m.reply(`🔎 Sin resultados para *${consulta}*.`);
    }

    const resultados = data.resultados.slice(0, 3);

    let caption = `🔎 *Steam*\n\nResultados para *${consulta}*:\n\n`;

    for (const juego of resultados) {
      caption +=
        `🎮 *${juego.name || 'N/A'}*\n` +
        `🆔 ID: ${juego.id ?? 'N/A'}\n` +
        `💰 Precio: ${juego.price || 'N/A'}\n` +
        `⭐ Score: ${juego.score || 'N/A'}\n` +
        `🖥️ Plataforma: ${juego.platform || 'N/A'}\n` +
        `🔗 https://store.steampowered.com/app/${juego.id}/\n\n`;
    }

    const primeraImagen = resultados.find(j => j.image)?.image;

    if (primeraImagen) {
      try {
        const imageResponse = await fetch(primeraImagen);
        if (imageResponse.ok) {
          const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
          return await conn.sendMessage(
            m.chat,
            { image: imageBuffer, caption },
            { quoted: m }
          );
        }
      } catch (imgErr) {
        console.error('STEAM IMG:', imgErr.message);
      }
    }

    await conn.sendMessage(m.chat, { text: caption }, { quoted: m });

  } catch (error) {
    console.error('STEAM ERROR:', error);
    await m.reply('No fue posible realizar la búsqueda.');
  }
};

handler.help = ['steam'];
handler.tags = ['buscadores'];
handler.command = ['steam'];

export default handler;