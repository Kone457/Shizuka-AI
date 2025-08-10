import axios from 'axios';

// Configuración ritual
const emoji = '🎨';
const emoji2 = '⏳';
const msm = '⚠️';

const handler = async (m, { conn, args }) => {
    if (!args[0]) {
        return conn.reply(m.chat, `${emoji} Por favor, escribe una descripción. Ejemplo: *!dalle un gato astronauta*`, m);
    }

    const prompt = args.join(' ');
    const encodedPrompt = encodeURIComponent(prompt);

    const apiVreden = `https://api.vreden.my.id/api/artificial/text2image?prompt=${encodedPrompt}`;
    const apiStarlight = `https://apis-starlights-team.koyeb.app/starlight/txt-to-image2?text=${encodedPrompt}`;

    try {
        await conn.sendPresenceUpdate('composing', m.chat);
        const waitMsg = await conn.reply(m.chat, `${emoji2} Generando imagen: "${prompt}"...`, m);

        // 🎨 Primer intento con Vreden
        const responseVreden = await axios.get(apiVreden, {
            responseType: 'arraybuffer',
            timeout: 30000
        });

        if (responseVreden.data && responseVreden.data.length > 1024) {
            await conn.sendMessage(m.chat, {
                image: Buffer.from(responseVreden.data),
                caption: `🖌️ Prompt: "${prompt}"`
            }, { quoted: m });

            await conn.sendMessage(m.chat, { delete: waitMsg.key });
            return;
        }

        throw new Error('La imagen de Vreden es inválida o demasiado pequeña');

    } catch (errorVreden) {
        console.warn('⚠️ Fallback a Starlight por error en Vreden:', errorVreden.message);

        try {
            // 🌌 Segundo intento con Starlight
            const responseStarlight = await axios.get(apiStarlight);

            if (responseStarlight.data?.data?.image) {
                const imageUrl = responseStarlight.data.data.image;

                await conn.sendMessage(m.chat, {
                    image: { url: imageUrl },
                    caption: `🖌️ Prompt: "${prompt}"`
                }, { quoted: m });

                return;
            } else {
                throw new Error('Starlight no devolvió una imagen válida');
            }

        } catch (errorStarlight) {
            console.error('🩸 Error en ambas APIs:', errorStarlight.message);
            await conn.reply(m.chat, `${msm} Error al generar: ${errorStarlight.message}\nPrueba con otro prompt o más tarde.`, m);
        }
    }
};

// Comandos rituales
handler.command = ['dalle', 'aiimg', 'imagenia'];
handler.help = ['dalle <descripción> - Genera imágenes con IA'];
handler.tags = ['ia', 'imagen'];
handler.limit = true;

export default handler;