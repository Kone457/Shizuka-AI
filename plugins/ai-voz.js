import axios from 'axios';
import gtts from 'node-gtts';
import { readFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import mime from 'mime-types';

// 🎭 Variables del bot
const botname = 'Shizuka';
const vs = 'v1.0.0';
const emoji = '✨';
const emoji2 = '🔮';
const rwait = '⏳';
const done = '✅';
const error = '❌';
const msm = '[Shizuka Log]';

// 🔑 API KEY de Gemini
const GEMINI_API_KEY = "AIzaSyDwBh9DGaV88MW2WHSp7e4bMLv87GMbg8M";
const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// 🎨 Construye el prompt base
function buildPrompt(username) {
    return `Tu nombre es ${botname}, versión ${vs}, hablas Español. Llamarás a las personas por su nombre ${username}, eres traviesa, respondona y con mucho flow.`;
}

// 🗣 Función de TTS
async function tts(text, lang = 'es') {
    return new Promise((resolve, reject) => {
        try {
            const ttsEngine = gtts(lang);
            const filePath = join(global.__dirname(import.meta.url), '../tmp', `${Date.now()}.wav`);
            ttsEngine.save(filePath, text, () => {
                const buffer = readFileSync(filePath);
                unlinkSync(filePath);
                resolve(buffer);
            });
        } catch (e) {
            reject(e);
        }
    });
}

// 💬 Función para interactuar con Gemini (texto)
async function shizukaPrompt(prompt) {
    try {
        const response = await axios.post(GEMINI_ENDPOINT, {
            contents: [{ role: "user", parts: [{ text: prompt }] }]
        }, {
            headers: {
                'Content-Type': 'application/json',
                'X-goog-api-key': GEMINI_API_KEY
            }
        });

        // Manejo seguro de la respuesta
        let result = '';
        if (response.data?.candidates?.length > 0) {
            result = response.data.candidates[0].content?.map(p => p.text).join('') || '';
        }
        if (!result && response.data?.output_text) result = response.data.output_text;
        return result || '✘ Shizuka no obtuvo respuesta.';
    } catch (err) {
        console.error('[Gemini Error]', err.response?.data || err.message);
        throw err;
    }
}

// 📸 Función para análisis de imagen con Gemini
async function fetchImageBuffer(basePrompt, imageBuffer, query, mimeType) {
    try {
        const base64Image = imageBuffer.toString('base64');
        const response = await axios.post(GEMINI_ENDPOINT, {
            contents: [
                {
                    role: "user",
                    parts: [
                        { text: `${basePrompt}. ${query}` },
                        { inlineData: { mimeType, data: base64Image } }
                    ]
                }
            ]
        }, {
            headers: {
                'Content-Type': 'application/json',
                'X-goog-api-key': GEMINI_API_KEY
            }
        });

        let result = '';
        if (response.data?.candidates?.length > 0) {
            result = response.data.candidates[0].content?.map(p => p.text).join('') || '';
        }
        return result || '✘ Shizuka no obtuvo respuesta de la imagen.';
    } catch (err) {
        console.error('[Gemini Img Error]', err.response?.data || err.message);
        throw err;
    }
}

// 📌 Handler principal
let handler = async (m, { conn, text }) => {
    const username = conn.getName(m.sender);
    const basePrompt = buildPrompt(username);

    // 📸 Analiza imagen si está citada
    const isQuotedImage = m.quoted && (m.quoted.msg || m.quoted).mimetype?.startsWith('image/');
    if (isQuotedImage) {
        const img = await m.quoted.download?.();
        if (!img) return conn.reply(m.chat, '✘ Shizuka no pudo descargar la imagen.', m);
        const mimeType = m.quoted.mimetype || 'image/png';
        try {
            const description = await fetchImageBuffer(basePrompt, img, 'Describe esta imagen detalladamente', mimeType);
            return conn.reply(m.chat, description, m);
        } catch {
            return conn.reply(m.chat, '✘ Shizuka no pudo analizar la imagen.', m);
        }
    }

    // 💬 Texto normal
    if (!text && m.quoted?.text) text = m.quoted.text;
    if (!text) return conn.reply(m.chat, '✘ Por favor ingresa un mensaje para Shizuka.', m);

    await m.react(rwait);
    try {
        const prompt = `${basePrompt}. Responde lo siguiente: ${text}`;
        const responseText = await shizukaPrompt(prompt);
        const voiceBuffer = await tts(responseText, 'es');
        await conn.sendFile(m.chat, voiceBuffer, 'shizuka.opus', null, m, true);
        await m.react(done);
    } catch {
        await conn.react(error);
        await conn.reply(m.chat, '✘ Shizuka no pudo procesar tu solicitud.', m);
    }
};

// 🏷 Configuración de comandos
handler.help = ['shizuka <texto>'];
handler.tags = ['ai', 'voz'];
handler.command = ['shizuka', 'ia', 'chatgpt'];
handler.register = true;

export default handler;