const handler = async (m, { text, conn, args }) => {
  if (!args[0]) {
    return conn.reply(m.chat, `${emoji} Por favor, ingresa un enlace de Facebook.`, m)
  }

  let res;
  try {
    await m.react(rwait);
    const apiUrl = `https://delirius-apiofc.vercel.app/download/facebook?url=${encodeURIComponent(args[0])}`;
    const response = await fetch(apiUrl);
    res = await response.json();
  } catch (e) {
    return conn.reply(m.chat, `${msm} Error al obtener datos. Verifica el enlace.`, m)
  }

  if (!res || !res.urls || res.urls.length === 0) {
    return conn.reply(m.chat, `${emoji2} No se encontraron resultados.`, m)
  }

  let videoUrl;
  try {
    const hd = res.urls.find(u => u.hd);
    const sd = res.urls.find(u => u.sd);
    videoUrl = hd?.hd || sd?.sd;
  } catch (e) {
    return conn.reply(m.chat, `${msm} Error al procesar los datos.`, m)
  }

  if (!videoUrl) {
    return conn.reply(m.chat, `${emoji2} No se encontró una resolución adecuada.`, m)
  }

  try {
    await conn.sendMessage(m.chat, {
      video: { url: videoUrl },
      caption: `🎬 *${res.title}*\nAquí tienes, amigo. Ritual completado.`,
      fileName: 'fb.mp4',
      mimetype: 'video/mp4'
    }, { quoted: m });
    await m.react(done);
  } catch (e) {
    await m.react(error);
    return conn.reply(m.chat, `${msm} Error al enviar el video.`, m)
  }
}

handler.help = ['facebook', 'fb']
handler.tags = ['descargas']
handler.command = ['facebook', 'fb']
handler.group = true;
handler.register = true;
handler.coin = 2;

export default handler;