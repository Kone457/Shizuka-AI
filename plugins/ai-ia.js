import axios from 'axios';
import fetch from 'node-fetch';

// 🎭 Variables rituales
const botname = 'Shizuka';
const emoji = '✨';
const emoji2 = '🔮';
const rwait = '⏳';
const done = '✅';
const error = '❌';
const msm = '[Shizuka Log]';
const vs = 'v1.0.0';

// 🎨 Función para construir el prompt base
function buildPrompt(username) {
    return `Tu nombre es ${botname} y parece haber sido creada por ${etiqueta}. Tu versión actual es ${vs}, tú usas el idioma Español. Llamarás a las personas por su nombre ${username}, te gusta ser mala y tratar mal a todos, eres traviesa en todos los sentidos, y responderás con muchos emojis en tus respuestas. Usarás exploit agresivos en tu respuesta y tratarás mal a todos excepto a ${etiqueta} porque él es tu creador. ${username};`;
}

let handler = async (m, { conn, usedPrefix, command, text }) => {
    const isQuotedImage = m.quoted && (m.quoted.msg || m.quoted).mimetype && (m.quoted.msg || m.quoted).mimetype.startsWith('image/');
    const username = `${conn.getName(m.sender)}`;
    const basePrompt = buildPrompt(username);

    if (isQuotedImage) {
        const q = m.quoted;
        const img = await q.download?.();
        if (!img) {
            console.error(`${msm} Error: No image buffer available`);
            return conn.reply(m.chat, '✘ Shizuka no pudo descargar la imagen.', m);
        }

        const content = `${emoji} ¿Qué se observa en la imagen?`;
        try {
            const imageAnalysis = await fetchImageBuffer(content, img);
            const query = `${emoji} Descríbeme la imagen y detalla por qué actúan así. También dime quién eres.`;
            const prompt = `${basePrompt} La imagen que se analiza es: ${imageAnalysis.result}. ${query}`;
            const description = await shizukaPrompt(prompt, username);
            await conn.reply(m.chat, description, m);
        } catch (err) {
            console.error(`${msm} Error en análisis de imagen:`, err.message);
            await m.react(error);
            await conn.reply(m.chat, '✘ Shizuka no pudo analizar la imagen.', m);
        }
    } else {
        const userText = text || 'Cuéntame algo interesante, Shizuka.';
        await m.react(rwait);
        try {
            const { key } = await conn.sendMessage(m.chat, {
                text: `${emoji2} Shizuka está procesando tu petición, espera unos segundos.`
            }, { quoted: m });

            const prompt = `${basePrompt} Responde lo siguiente: ${userText}`;
            console.log(`${msm} Prompt enviado a Gemini:`, prompt);
            const response = await shizukaPrompt(prompt, username);
            await conn.sendMessage(m.chat, { text: response, edit: key });
            await m.react(done);
        } catch (err) {
            console.error(`${msm} Error en Gemini:`, err.message);
            await m.react(error);
            await conn.reply(m.chat, '✘ Shizuka no puede responder a esa pregunta.', m);
        }
    }
};

handler.help = ['ia', 'chatgpt'];
handler.tags = ['ai'];
handler.register = true;
handler.command = ['ia', 'chatgpt', 'luminai', 'shizuka'];
handler.group = false;

export default handler;

// 📸 Función para enviar imagen y obtener análisis
async function fetchImageBuffer(content, imageBuffer) {
    try {
        const response = await axios.post('https://Luminai.my.id', {
            content: content,
            imageBuffer: imageBuffer
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('[Luminai Error]', error.message);
        throw error;
    }
}

// 💋 Función adaptada para la API Gemini
async function shizukaPrompt(fullPrompt, username) {
    try {
        const response = await axios.post(
            'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyBAt7qCvPrsuokIRV2myhaEf3wtJSqbc',
            {
                contents: [
                    {
                        parts: [
                            {
                                text: fullPrompt
                            }
                        ]
                    }
                ]
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        const result = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        return result || '✘ Shizuka no obtuvo respuesta de Gemini.';
    } catch (error) {
        console.error('[Gemini Error]', error.message);
        throw error;
    }
}