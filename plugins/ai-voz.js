import axios from 'axios';
import gtts from 'node-gtts';
import { Buffer } from 'buffer';
import mime from 'mime-types';

// 🎭 Variables rituales
const botname = 'Shizuka';
const emoji = '✨';
const emoji2 = '🔮';
const rwait = '⏳';
const done = '✅';
const error = '❌';
const msm = '[Shizuka Log]';

// 🔑 API KEY de Gemini
const GEMINI_API_KEY = "AIzaSyBA_t7qCvPrsuokI_RV2WHSp7e4bMLv87GMbg8M";

// 🎨 Función para construir el prompt base
function buildPrompt(username) {
    return `Tu nombre es ${botname}, eres traviesa y respondes con mucho flow. Llamas a las personas por su nombre ${username} y siempre eres directa.`;
}

// 💋 Función adaptada para la API Gemini (texto)
async function shizukaPrompt(fullPrompt) {
    try {
        const response = await axios.post(
            'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
            {
                contents: [{ role: "user", parts: [{ text: fullPrompt }] }]
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-goog-api-key': GEMINI_API_KEY
                }
            }
        );
        const result = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '✘ Shizuka no obtuvo respuesta.';
        return result;
    } catch (err) {
        console.error('[Gemini Error]', err.response?.data || err.message);
        throw err;
    }
}

// 📸 Función para analizar imagen con Gemini
async function fetchImageBuffer(basePrompt, imageBuffer, query, mimeType) {
    try {
        const base64Image = imageBuffer.toString('base64');
        const response = await axios.post(
            'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
            {
                contents: [
                    {
                        role: "user",
                        parts: [
                            { text: `${basePrompt}. ${query}` },
                            { inlineData: { mimeType, data: base64Image } }
                        ]
                    }
                ]
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-goog-api-key': GEMINI_API_KEY
                }
            }
        );
        return response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '✘ Shizuka no obtuvo respuesta de la imagen.';
    } catch (err) {
        console.error('[Gemini Img Error]', err.response?.data || err.message);
        throw err;
    }
}

// 🔊 Función TTS en memoria
function tts(text, lang = 'es') {
    return new Promise((resolve, reject) => {
        try {
            const ttsEngine = gtts(lang);
            ttsEngine.stream(text, (err, audioStream) => {
                if (err) return reject(err);
                const chunks = [];
                audioStream.on('data', (chunk) => chunks.push(chunk));
                audioStream.on('end', () => resolve(Buffer.concat(chunks)));
            });
        } catch (e) {
            reject(e);
        }
    });
}

// 🧩 Handler principal
let handler = async (m, { conn, args }) => {
    const username = conn.getName(m.sender);
    const basePrompt = buildPrompt(username);

    // Detectar imagen citada
    const isQuotedImage = m.quoted && (m.quoted.msg || m.quoted).mimetype?.startsWith('image/');

    let text = args.join(' ');
    if (!text && m.quoted?.text) text = m.quoted.text;
    if (!text && !isQuotedImage) return conn.reply(m.chat, '✘ Por favor ingresa un mensaje para Shizuka.', m);

    await m.react(rwait);

    try {
        if (isQuotedImage) {
            const img = await m.quoted.download?.();
            if (!img) return conn.reply(m.chat, '✘ Shizuka no pudo descargar la imagen.', m);
            const mimeType = m.quoted.mimetype || 'image/png';
            const description = await fetchImageBuffer(basePrompt, img, 'Describe esta imagen detalladamente', mimeType);
            await conn.reply(m.chat, description, m);
        } else {
            const prompt = `${basePrompt}. Responde lo siguiente: ${text}`;
            const responseText = await shizukaPrompt(prompt);
            const voiceBuffer = await tts(responseText, 'es');
            await conn.sendFile(m.chat, voiceBuffer, 'shizuka.opus', null, m, true);
        }
        await m.react(done);
    } catch (err) {
        console.error(`${msm} Error:`, err.response?.data || err.message);
        await m.react(error);
        await conn.reply(m.chat, '✘ Shizuka no pudo procesar tu solicitud.', m);
    }
};

handler.help = ['shizuka <texto>'];
handler.tags = ['ai', 'voz'];
handler.command = ['shizuka', 'ia', 'chatgpt'];
handler.register = true;

export default handler;