import axios from 'axios';
import gtts from 'node-gtts';
import { Readable } from 'stream';

const defaultLang = 'es';
const botname = 'Shizuka';
const vs = 'v1.0.0';
const rwait = '⏳';
const done = '✅';
const error = '❌';
const msm = '[Shizuka Log]';
const GEMINI_API_KEY = 'AIzaSyBA_t7qCvPrsuokI_RV2myhaEf3wtJSqbc';

function buildPrompt(username) {
    return `Tu nombre es ${botname}, versión ${vs}, usas Español. Llamarás a las personas por su nombre ${username}, eres traviesa y respondona, sin emojis ni símbolos y con mucho flow.`;
}

let handler = async (m, { conn, args }) => {
    const username = conn.getName(m.sender);
    const basePrompt = buildPrompt(username);
    const langArg = args[0] && args[0].length === 2 ? args[0] : defaultLang;
    const userText = args.slice(langArg === defaultLang ? 0 : 1).join(' ') || m.quoted?.text || 'Cuéntame algo interesante, Shizuka.';

    await m.react(rwait);

    try {
        // Genera prompt final
        const prompt = `${basePrompt}. Responde: ${userText}`;

        // Llamada a Gemini API
        const aiResp = await axios.post('https://gemini-api.example.com/v1/chat', {
            prompt,
            user: username
        }, { headers: { 'Authorization': `Bearer ${GEMINI_API_KEY}` } });

        const replyText = aiResp.data?.response || 'Shizuka no obtuvo respuesta.';

        // Generar TTS directamente a buffer
        const voiceBuffer = await tts(replyText, langArg);

        // Enviar voz
        await conn.sendFile(m.chat, voiceBuffer, 'shizuka.opus', null, m, true);

        await m.react(done);
    } catch (err) {
        console.error(`${msm} Error:`, err.message);
        await m.react(error);
        await conn.reply(m.chat, 'Ocurrió un error al procesar tu solicitud.', m);
    }
};

// TTS con node-gtts directo a buffer
async function tts(text, lang = defaultLang) {
    return new Promise((resolve, reject) => {
        try {
            const ttsEngine = gtts(lang);
            const chunks = [];
            const stream = ttsEngine.stream(text);
            stream.on('data', chunk => chunks.push(chunk));
            stream.on('end', () => resolve(Buffer.concat(chunks)));
            stream.on('error', reject);
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