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

    const resultados = data.resultados.slice(0, 3);
    let enviados = 0;

    for (const juego of resultados) {
      try {
        let media = null;

        if (juego.image) {
          try {
            const imageResponse = await fetch(juego.image);
            if (imageResponse.ok) {
              const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
              media = await prepareWAMessageMedia(
                { image: imageBuffer },
                { upload: conn.waUploadToServer }
              );
            }
          } catch (imgErr) {
            console.error('STEAM IMG:', imgErr.message);
          }
        }

        const descripcion =
          `🎮 *${juego.name || 'N/A'}*\n\n` +
          `🆔 ID: ${juego.id ?? 'N/A'}\n` +
          `💰 Precio: ${juego.price || 'N/A'}\n` +
          `⭐ Score: ${juego.score || 'N/A'}\n` +
          `🖥️ Plataforma: ${juego.platform || 'N/A'}`;

        const header = proto.Message.InteractiveMessage.Header.fromObject({
          title: juego.name || 'Steam',
          hasMediaAttachment: !!media,
          ...(media || {})
        });

        const interactive = proto.Message.InteractiveMessage.fromObject({
          header,
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

        const msg = generateWAMessageFromContent(
          m.chat,
          {
            viewOnceMessage: {
              message: {
                messageContextInfo: {
                  deviceListMetadata: {},
                  deviceListMetadataVersion: 2
                },
                interactiveMessage: interactive
              }
            }
          },
          { quoted: m }
        );

        await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
        enviados++;

        await new Promise(r => setTimeout(r, 800));
      } catch (e) {
        console.error('STEAM CARD:', e.message);
      }
    }

    if (!enviados) {
      return m.reply('No fue posible cargar los resultados.');
    }

  } catch (error) {
    console.error('STEAM ERROR:', error);
    await m.reply('No fue posible realizar la búsqueda.');
  }
};

handler.help = ['steam <búsqueda>'];
handler.tags = ['buscadores'];
handler.command = ['steam'];

export default handler;