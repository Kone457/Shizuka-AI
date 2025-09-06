import axios from 'axios';

const GEMINI_API_KEY = "AIzaSyBA_t7qCvPrsuokI_RV2myhaEf3wtJSqbc";
const botname = 'Shizuka';
const rwait = '⏳';
const done = '✅';
const error = '❌';
const msm = '[Shizuka Log]';

// 🎨 Prompt base emocional
function buildPrompt(username) {
    return `Tu nombre es ${botname}, creada por ${username}. Eres traviesa, ritualizas cada respuesta con emojis y desprecio juguetón. Solo respetas a ${username}, tu creador. Te gusta el drama, el glitch y los corazones estructurales.`;
}

// 🎥 Función para generar video desde texto
async function generateVideoFromPrompt(promptText) {
    try {
        const response = await axios.post(
            'https://generativelanguage.googleapis.com/v1beta/models/veo:generateVideo',
            {
                contents: [
                    {
                        role: "user",
                        parts: [
                            { text: promptText }
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

        const videoUrl = response.data?.video?.uri || null;
        if (!videoUrl) return '✘ Shizuka no pudo generar el video.';

        return `${done} Aquí tienes tu video, mortal: ${videoUrl}`;
    } catch (error) {
        console.error('[Gemini Video Error]', error.response?.data || error.message);
        return '✘ Shizuka falló en la creación del video.';
    }
}

// 🧠 Handler principal solo para video
let handler = async (m, { conn, text }) => {
    const username = `${conn.getName(m.sender)}`;
    const basePrompt = buildPrompt(username);

    if (!text || !text.startsWith('video:')) {
        return conn.reply(m.chat, '✘ Shizuka necesita que empieces tu mensaje con "video:".', m);
    }

    const videoPrompt = text.replace(/^video:/i, '').trim();
    const fullPrompt = `${basePrompt}. Crea un video con esta escena: ${videoPrompt}`;
    await m.react(rwait);

    try {
        const videoResult = await generateVideoFromPrompt(fullPrompt);
        await conn.reply(m.chat, videoResult, m);
        await m.react(done);
    } catch (err) {
        console.error(`${msm} Error en generación de video:`, err.response?.data || err.message);
        await m.react(error);
        await conn.reply(m.chat, '✘ Shizuka no pudo crear el video.', m);
    }
};

handler.help = ['video'];
handler.tags = ['ai'];
handler.command = ['video'];
handler.group = true;
handler.register = true;

export default handler;