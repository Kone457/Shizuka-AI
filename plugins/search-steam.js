import fetch from 'node-fetch';
import {
  proto,
  prepareWAMessageMedia,
  generateWAMessageFromContent
} from '@whiskeysockets/baileys';

let handler = async (m, { conn, text }) => {
  try {
    if (!text?.trim()) {
      return m.reply('Debe especificar lo que desea buscar en steam');
    }

    const consulta = text.trim();
    const url = `${api.url}/search/steam?q=${encodeURIComponent(consulta)}&apikey=${api.key}`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data?.estado || !Array.isArray(data.resultados) || !data.resultados.length) {
      return m.reply(` No encontré resultados para *${consulta}*.`);
    }

    const resultados = data.resultados.slice(0, 10);
    const cards = [];

    for (let i = 0; i < resultados.length; i++) {
      const juego = resultados[i];

      try {
        const media = await prepareWAMessageMedia(
          {
            image: {
              url: juego.image
            }
          },
          {
            upload: conn.waUploadToServer
          }
        );

        const descripcion =
          `🎮 *${juego.name || 'N/A'}*\n\n` +
          `🆔 *ID:* ${juego.id ?? 'N/A'}\n` +
          `💰 *Precio:* ${juego.price || 'N/A'}\n` +
          `⭐ *Score:* ${juego.score || 'N/A'}\n` +
          `🖥️ *Plataforma:* ${juego.platform || 'N/A'}`;

        cards.push(
          proto.Message.InteractiveMessage.CarouselMessage.Card.fromObject({
            header: proto.Message.InteractiveMessage.Header.fromObject({
              title: `${i + 1}/${resultados.length}`,
              hasMediaAttachment: true,
              ...media
            }),
            body: proto.Message.InteractiveMessage.Body.fromObject({
              text: descripcion
            }),
            footer: proto.Message.InteractiveMessage.Footer.fromObject({
              text: 'The Roxy MD • Steam'
            }),
            nativeFlowMessage:
              proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                buttons: [
                  {
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({
                      display_text: '🎮 Ver en Steam',
                      url: `https://store.steampowered.com/app/${juego.id}/`,
                      merchant_url: `https://store.steampowered.com/app/${juego.id}/`
                    })
                  }
                ]
              })
          })
        );
      } catch (e) {
        console.error(`Error en resultado ${i + 1}:`, e);
      }
    }

    if (!cards.length) {
      return m.reply(' No se pudieron cargar los resultados.');
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
                  text:
                    `🔎 *STEAM SEARCH*\n\n` +
                    `🎮 Búsqueda: *${consulta}*\n` +
                    `📦 Resultados: *${cards.length}*`
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
      {
        messageId: msg.key.id
      }
    );

  } catch (error) {
    console.error('STEAM ERROR:', error);
    m.reply(`Error al buscar en Steam.*\n\n${error.message || 'Error desconocido'}`);
  }
};

handler.help = ['steam <texto>'];
handler.tags = ['buscadores'];
handler.command = ['steam'];

export default handler;