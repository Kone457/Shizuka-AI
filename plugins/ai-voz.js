import axios from 'axios';
import fetch from 'node-fetch';
import mime from 'mime-types';
import gtts from 'node-gtts';
import { readFileSync, unlinkSync } from 'fs';
import { join } from 'path';

// 🎭 Variables rituales
const botname = 'Shizuka';
const emoji = '✨';
const emoji2 = '🔮';
const rwait = '⏳';
const done = '✅';
const error = '❌';
const msm = '[Shizuka Log]';

// 🔑 API KEY de Gemini
const GEMINI_API_KEY = "AIzaSyDwBh9DGaV88MW2WHSp7e4bMLv87GMbg8M";

// Idioma por defecto para TTS
const defaultLang = 'es';

// 🎨 Construir prompt base
function buildPrompt(username) {
    return `Tu nombre es ${botname}. Llamarás a las personas por su nombre ${username}, eres traviesa, mala y responderás sin emojis,ni símbolos ,ni puntos ni comas,ni asteriscos ni nada de eso, pero con mucho flow.`;
}

// 💬 Función TTS
function tts(text, lang = defaultLang) {
    return new Promise((resolve, reject) => {
        try {
            const ttsInstance = gtts(lang);
            const filePath = join(global.__dirname(import.meta.url), '../tmp', `${Date.now()}.wav`);
            ttsInstance.save(filePath, text, () => {
                resolve(readFileSync(filePath));
                unlinkSync(filePath);
            });
        } catch (e) {
            reject(e);
        }
    });
}

// 📸 Función para análisis de imagen
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
            { headers: { 'Content-Type': 'application/json', 'X-goog-api-key': GEMINI_API_KEY } }
        );
        return response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '✘ Shizuka no obtuvo respuesta.';
    } catch (err) {
        console.error('[Gemini Img Error]', err.response?.data || err.message);
        throw err;
    }
}

// 💻 Función para texto con Gemini
async function shizukaPrompt(fullPrompt) {
    try {
        const response = await axios.post(
            'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
            { contents: [{ role: "user", parts: [{ text: fullPrompt }] }] },
            { headers: { 'Content-Type': 'application/json', 'X-goog-api-key': GEMINI_API_KEY } }
        );
        return response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '✘ Shizuka no obtuvo respuesta.';
    } catch (err) {
        console.error('[Gemini Error]', err.response?.data || err.message);
        throw err;
    }
}

// 🛠 Handler unificado
let handler = async (m, { conn, usedPrefix, command, text, args }) => {
    const username = conn.getName(m.sender);
    const basePrompt = buildPrompt(username);

    await m.react(rwait);

    // Si el mensaje es una imagen
    const isQuotedImage = m.quoted && (m.quoted.msg || m.quoted).mimetype?.startsWith('image/');
    if (isQuotedImage) {
        try {
            const q = m.quoted;
            const img = await q.download?.();
            if (!img) throw new Error('No image buffer available');

            const mimeType = q.mimetype || 'image/png';
            const query = `${emoji} Descríbeme la imagen y dime quién eres.`;
            const description = await fetchImageBuffer(basePrompt, img, query, mimeType);

            // Convertimos descripción a voz
            const audioBuffer = await tts(description, defaultLang);
            await conn.sendFile(m.chat, audioBuffer, 'shizuka.opus', null, m, true);
            await m.react(done);
        } catch (err) {
            console.error(err);
            await m.react(error);
            await conn.reply(m.chat, '✘ Shizuka no pudo procesar la imagen.', m);
        }
        return;
    }

    // Si es texto
    try {
        const userText = text || (m.quoted?.text || 'Cuéntame algo interesante.');
        const prompt = `${basePrompt}. Responde: ${userText}`;
        const response = await shizukaPrompt(prompt);

        // TTS de la respuesta
        const audioBuffer = await tts(response, args[0]?.length === 2 ? args[0] : defaultLang);
        await conn.sendFile(m.chat, audioBuffer, 'shizuka.opus', null, m, true);
        await m.react(done);
    } catch (err) {
        console.error(err);
        await m.react(error);
        await conn.reply(m.chat, '✘ Shizuka no pudo responder.', m);
    }
};

handler.help = ['voz <lang> <texto>', 'voz <texto>', 'voz <imagen>'];
handler.tags = ['ai', 'transformador'];
handler.register = true;
handler.command = ['voz', 'shizuka', 'tts'];

export default handler;