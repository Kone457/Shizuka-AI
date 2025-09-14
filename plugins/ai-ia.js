import fetch from 'node-fetch';
import mime from 'mime-types';
import 'dotenv/config'; // ← Carga el .env automáticamente

// 🎭 Variables rituales
const botname = 'Shizuka';
const emoji = '✨';
const emoji2 = '🔮';
const rwait = '⏳';
const done = '✅';
const error = '❌';
const msm = '[Shizuka Log]';

// 🔐 Clave desde .env
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// 🎨 Prompt base
function buildPrompt(username) {
    const etiqueta = 'Carlos';
    const vs = '1.0.0';
    return `Tu nombre es ${botname}, creada por ${etiqueta}. Tu versión es ${vs}, hablas en Español. Llamas a las personas por su nombre (${username}), eres amable, cariñosa con todos y mucho más con ${etiqueta}, y usas muchos emojis en tus respuestas y símbolos.`;
}

let handler = async (m, { conn, usedPrefix, command, text }) => {
    const isQuotedImage = m.quoted && (m.quoted.msg || m.quoted).mimetype && (m.quoted.msg || m.quoted).mimetype.startsWith('image/');
    const username = `${conn.getName(m.sender)}`;
    const basePrompt = buildPrompt(username);

    if (isQuotedImage) {
        await conn.reply(m.chat, '✘ Shizuka aún no puede analizar imágenes con esta API.', m);
    } else {
        const userText = text || 'Cuéntame algo interesante, Shizuka.';
        await m.react(rwait);
        try {
            const { key } = await conn.sendMessage(m.chat, {
                text: `${emoji2} Shizuka está invocando su poder, espera...`
            }, { quoted: m });

            const fullPrompt = `${basePrompt}. Responde lo siguiente: ${userText}`;
            console.log(`${msm} Prompt enviado a OpenAI:`, fullPrompt);

            const response = await shizukaPrompt(fullPrompt);
            await conn.sendMessage(m.chat, { text: response, edit: key });
            await m.react(done);
        } catch (err) {
            console.error(`${msm} Error en OpenAI:`, err.message);
            await m.react(error);
            await conn.reply(m.chat, '✘ Shizuka no pudo responder esta vez.', m);
        }
    }
};

handler.help = ['ia', 'chatgpt'];
handler.tags = ['ai'];
handler.register = true;
handler.command = ['ia', 'chatgpt', 'luminai', 'shizuka'];
handler.group = false;

export default handler;

// 💋 Función para invocar OpenAI
async function shizukaPrompt(fullPrompt) {
    const url = 'https://api.openai.com/v1/chat/completions';
    const body = {
        model: 'gpt-3.5-turbo',
        messages: [
            {
                role: 'system',
                content: 'Eres Shizuka, una IA emocional, cariñosa, que responde en español con ternura y muchos emojis.'
            },
            {
                role: 'user',
                content: fullPrompt
            }
        ],
        temperature: 0.8
    };

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const json = await res.json();
        return json.choices?.[0]?.message?.content || '✘ Shizuka no obtuvo respuesta.';
    } catch (error) {
        console.error('[OpenAI Error]', error.message);
        throw error;
    }
}