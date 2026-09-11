import fetch from 'node-fetch';
import {
  proto,
  prepareWAMessageMedia,
  generateWAMessageFromContent
} from '@whiskeysockets/baileys';

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

    const resultados = data.resultados.slice(0, 10);
    const cards = [];

    for (const juego of resultados) {
      try {
        const imageResponse = await fetch(juego.image);
        if (!imageResponse.ok) continue;

        const imageBuffer = Buffer.from(
          await imageResponse.arrayBuffer()
        );

        const media = await prepareWAMessageMedia(
          { image: imageBuffer },
          { upload: conn.waUploadToServer }
        );

        const descripcion =
          `🎮 *${juego.name || 'N/A'}*\n\n` +
          `🆔 ID: ${juego.id ?? 'N/A'}\n` +
          `💰 Precio: ${juego.price || 'N/A'}\n` +
          `⭐ Score: ${juego.score || 'N/A'}\n` +
          `🖥️ Plataforma: ${juego.platform || 'N/A'}`;

        cards.push({
          header: proto.Message.InteractiveMessage.Header.fromObject({
            title: juego.name || 'Steam',
            hasMediaAttachment: true,
            ...media
          }),

          body: proto.Message.InteractiveMessage.Body.fromObject({
            text: descripcion
          }),

          footer: proto.Message.InteractiveMessage.Footer.fromObject({
            text: 'Steam'
          }),

          nativeFlowMessage:
            proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
              buttons: [
                {
                  name: 'cta_url',
                  buttonParamsJson: JSON.stringify({
                    display_text: 'Ver en Steam',
                    url: `https://store.steampowered.com/app/${juego.id}/`,
                    merchant_url: `https://store.steampowered.com/app/${juego.id}/`
                  })
                }
              ]
            })
        });
      } catch (e) {
        console.error('STEAM CARD:', e.message);
      }
    }

    if (!cards.length) {
      return m.reply('No fue posible cargar los resultados.');
    }

    const msg = generateWAMessageFromContent(
      m.chat,
      {
        viewOnceMessage: {
          message: {
            messageContextInfo: {
              deviceListMetadata: {},
              deviceListMetadataVersion: 2
            },
            interactiveMessage:
              proto.Message.InteractiveMessage.fromObject({
                body: proto.Message.InteractiveMessage.Body.fromObject({
                  text: `🔎 *Steam*\n\nResultados para *${consulta}*: ${cards.length}`
                }),
                footer: proto.Message.InteractiveMessage.Footer.fromObject({
                  text: 'Steam'
                }),
                carouselMessage:
                  proto.Message.InteractiveMessage.CarouselMessage.fromObject({
                    cards
                  })
              })
          }
        }
      },
      { quoted: m }
    );

    await conn.relayMessage(
      m.chat,
      msg.message,
      { messageId: msg.key.id }
    );

  } catch (error) {
    console.error('STEAM ERROR:', error);
    await m.reply('No fue posible realizar la búsqueda.');
  }
};

handler.help = ['steam <búsqueda>'];
handler.tags = ['buscadores'];
handler.command = ['steam'];

export default handler;