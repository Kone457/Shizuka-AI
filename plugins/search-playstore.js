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
      `${api.url}/search/playstore?q=${encodeURIComponent(consulta)}&apikey=${api.key}`
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

    for (const app of resultados) {
      try {
        const imageUrl = app.grande || app.pequeña;

        if (!imageUrl) continue;

        const imageResponse = await fetch(imageUrl);

        if (!imageResponse.ok) continue;

        const imageBuffer = Buffer.from(
          await imageResponse.arrayBuffer()
        );

        const media = await prepareWAMessageMedia(
          { image: imageBuffer },
          { upload: conn.waUploadToServer }
        );

        const descripcion =
          `📱 *${app.titulo || 'N/A'}*\n\n` +
          `👨‍💻 Desarrollador: ${app.desarrollador || 'N/A'}\n` +
          `⭐ Valoración: ${app.rating ?? 'N/A'}\n` +
          `📦 Package: ${app.package || 'N/A'}`;

        cards.push({
          header: proto.Message.InteractiveMessage.Header.fromObject({
            title: app.titulo || 'Google Play',
            hasMediaAttachment: true,
            ...media
          }),

          body: proto.Message.InteractiveMessage.Body.fromObject({
            text: descripcion
          }),

          footer: proto.Message.InteractiveMessage.Footer.fromObject({
            text: 'Google Play'
          }),

          nativeFlowMessage:
            proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
              buttons: [
                {
                  name: 'cta_url',
                  buttonParamsJson: JSON.stringify({
                    display_text: 'Ver en Play Store',
                    url: app.link,
                    merchant_url: app.link
                  })
                }
              ]
            })
        });

      } catch (error) {
        console.error('PLAYSTORE CARD:', error.message);
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
                  text: `🔎 *Play Store*\n\nResultados para *${consulta}*: ${cards.length}`
                }),

                footer: proto.Message.InteractiveMessage.Footer.fromObject({
                  text: 'Todos los derechos reservados'
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
    console.error('PLAYSTORE ERROR:', error);
    await m.reply('No fue posible realizar la búsqueda.');
  }
};

handler.help = ['playstore <búsqueda>'];
handler.tags = ['buscadores'];
handler.command = ['playstore'];

export default handler;