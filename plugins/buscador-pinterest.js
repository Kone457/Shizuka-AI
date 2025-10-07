import fetch from 'node-fetch';
import baileys from '@whiskeysockets/baileys';

async function sendAlbumMessage(jid, medias, options = {}) {
    if (typeof jid !== 'string') throw new TypeError(`jid debe ser un string, recibido: ${typeof jid}`);
    if (!Array.isArray(medias) || medias.length < 2) {
        throw new RangeError('Se necesitan al menos 2 imágenes para crear un álbum.');
    }

    const caption = options.text || options.caption || '';
    const delay = !isNaN(options.delay) ? Number(options.delay) : 500;
    const quoted = options.quoted || null;

    const album = baileys.generateWAMessageFromContent(
        jid,
        { messageContextInfo: {}, albumMessage: { expectedImageCount: medias.length } },
        {}
    );

    await conn.relayMessage(jid, album.message, { messageId: album.key.id });

    for (let i = 0; i < medias.length; i++) {
        const { type, data } = medias[i];
        const msg = await baileys.generateWAMessage(
            jid,
            { [type]: data, ...(i === 0 ? { caption } : {}) },
            { upload: conn.waUploadToServer }
        );

        msg.message.messageContextInfo = {
            messageAssociation: {
                associationType: 1,
                parentMessageKey: album.key,
            },
        };

        await conn.relayMessage(jid, msg.message, { messageId: msg.key.id });
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    return album;
}

const pinterest = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return conn.reply(m.chat, ` *¿Qué estás buscando?* Ingresa una palabra clave para buscar imágenes en Pinterest.`, m);
    }

    await m.react('🕒');

    const thumbnail = await fetch('https://qu.ax/GoxWU.jpg').then(res => res.buffer());

    conn.reply(m.chat, '⌛ *Explorando Pinterest para ti...*', m, {
        contextInfo: {
            externalAdReply: {
                mediaUrl: null,
                mediaType: 1,
                showAdAttribution: true,
                title: packname,
                body: dev,
                previewType: 0,
                thumbnail,
                sourceUrl: redes
            }
        }
    });

    try {
        const res = await fetch(`https://delirius-apiofc.vercel.app/search/pinterest?text=${encodeURIComponent(text)}`);
        const json = await res.json();

        if (!json.status || !Array.isArray(json.results) || json.results.length < 2) {
            return conn.reply(m.chat, '📭 *No encontré suficientes resultados visuales para mostrarte un álbum.* Intenta con otra búsqueda más específica.', m);
        }

        const images = json.results.slice(0, 10).map(url => ({
            type: 'image',
            data: { url }
        }));

        const caption = `*Resultados de búsqueda para:* "${text}"`;
        await sendAlbumMessage(m.chat, images, { caption, quoted: m });

        await m.react('✅');
        await conn.reply(m.chat, `✨ *Listo.* Aquí están las imágenes de *${text}*. ¿Te gustaría buscar otra cosa o ver más resultados?`, m);

    } catch (error) {
        console.error(error);
        await m.react('❌');
        conn.reply(m.chat, '🚫 *Ups... algo falló al intentar obtener imágenes de Pinterest.* Intenta más tarde o cambia tu término de búsqueda.', m);
    }
};

pinterest.help = ['pinterest <consulta>'];
pinterest.tags = ['buscador', 'descargas'];
pinterest.command = ['pinterest', 'pin'];
pinterest.register = true;
pinterest.group = true;

handler.coin = 50;

export default pinterest;