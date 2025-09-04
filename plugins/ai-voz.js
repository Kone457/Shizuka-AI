import { readFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import axios from 'axios';
import gtts from 'node-gtts';

const defaultLang = 'es';
const botname = 'Shizuka';
const vs = 'v1.0.0';
const rwait = '⏳';
const done = '✅';
const error = '❌';
const msm = '[Shizuka Log]';
const GEMINI_API_KEY = 'AIzaSyBA_t7qCvPrsuokI_RV2myhaEf3wtJSqbc';
const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

function buildPrompt(username) {
    return `Tu nombre es ${botname}, versión ${vs}, hablas Español. Llamarás a las personas por su nombre ${username}, eres traviesa y respondona, con mucho flow.`;
}

let handler = async (m, { conn, text, args }) => {
    const username = conn.getName(m.sender);
    const basePrompt = buildPrompt(username);
    const langArg = args[0] && args[0].length === 2 ? args[0] : defaultLang;
    const userText = args.slice(langArg === defaultLang ? 0 : 1).join(' ') || m.quoted?.text || 'Cuéntame algo interesante, Shizuka.';

    await m.react(rwait);

    try {
        // Analiza imagen si hay
        let analysisText = '';
        if (m.quoted?.mimetype?.startsWith('image/')) {
            const imgBuffer = await m.quoted.download();
            const response = await axios.post('https://Luminai.my.id', {
                content: `Analiza esta imagen`,
                imageBuffer: imgBuffer
            }, { headers: { 'Content-Type': 'application/json' } });
            analysisText = response.data.result || '';
        }

        // Construir prompt final para Gemini
        const prompt = `${basePrompt}. ${analysisText} Responde: ${userText}`;

        // Llamada a Gemini API
        const aiResp = await axios.post(GEMINI_ENDPOINT, {
            contents: [
                { parts: [{ text: prompt }] }
            ]
        }, {
            headers: {
                'Content-Type': 'application/json',
                'X-goog-api-key': GEMINI_API_KEY
            }
        });

        const replyText = aiResp.data?.candidates?.[0]?.content?.map(p => p.text).join('') || 'Shizuka no obtuvo respuesta.';

        // Generar TTS
        const voiceBuffer = await tts(replyText, langArg);

        await conn.sendFile(m.chat, voiceBuffer, 'shizuka.opus', null, m, true);
        await m.react(done);
    } catch (err) {
        console.error(`${msm} Error:`, err.message);
        await m.react(error);
        await conn.reply(m.chat, 'Ocurrió un error al procesar tu solicitud.', m);
    }
};

async function tts(text, lang = defaultLang) {
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

handler.help = ['voz <texto>'];
handler.tags = ['ai', 'voz'];
handler.command = ['voz', 'ttsai', 'ttsvoz'];
handler.register = true;

export default handler;