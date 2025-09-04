import gtts from 'node-gtts';
import { readFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import axios from 'axios';

const defaultLang = 'es';
const botname = 'Shizuka';
const emoji = '✨';
const rwait = '⏳';
const done = '✅';
const error = '❌';
const msm = '[Shizuka Log]';
const vs = 'v1.0.0';

function buildPrompt(username) {
    return `Tu nombre es ${botname}, versión ${vs}, usas Español. Llamarás a las personas por su nombre ${username}, eres traviesa y respondona, sin emojis ni símbolos y con mucho flow.`;
}

let handler = async (m, { conn, text, args }) => {
    const username = conn.getName(m.sender);
    const basePrompt = buildPrompt(username);
    const langArg = args[0] && args[0].length === 2 ? args[0] : defaultLang;
    const userText = args.slice(langArg === defaultLang ? 0 : 1).join(' ') || m.quoted?.text || 'Cuéntame algo interesante, Shizuka.';

    await m.react(rwait);

    try {
        // Procesa imagen si se envía
        let analysisText = '';
        if (m.quoted?.mimetype?.startsWith('image/')) {
            const imgBuffer = await m.quoted.download();
            const response = await axios.post('https://Luminai.my.id', {
                content: `Analiza esta imagen`,
                imageBuffer: imgBuffer
            }, { headers: { 'Content-Type': 'application/json' } });
            analysisText = response.data.result || '';
        }

        // Genera prompt final
        const prompt = `${basePrompt}. ${analysisText} Responde: ${userText}`;

        // Llamada a Mora API
        const aiResp = await axios.get(`https://api.vreden.my.id/api/mora?query=${encodeURIComponent(prompt)}&username=${encodeURIComponent(username)}`);
        const replyText = aiResp.data?.result || 'Shizuka no obtuvo respuesta.';

        // Generar TTS y enviar voz únicamente
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

handler.help = ['voz2 <texto o imagen>'];
handler.tags = ['ai', 'voz'];
handler.command = ['voz2', 'ttsai', 'ttsvoz'];
handler.register = true;

export default handler;
