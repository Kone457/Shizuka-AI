import fetch from 'node-fetch';
import mime from 'mime-types';

// 🎭 Variables rituales
const botname = 'Shizuka';
const emoji = '✨';
const emoji2 = '🔮';
const rwait = '⏳';
const done = '✅';
const error = '❌';
const msm = '[Shizuka Log]';

// 🎨 Prompt base
function buildPrompt(username) {
    const etiqueta = 'Carlos';
    const vs = '1.0.0';
    return `Tu nombre es ${botname}, creada por ${etiqueta}. Tu versión es ${vs}, hablas en Español. Llamas a las personas por su nombre (${username}), eres amable, cariñosa con todos y mucho más con ${etiqueta}, y usas muchos emojis en tus respuestas y símbolos.`;
}


async function shizukaPrompt(fullPrompt) {
    const encodedPrompt = encodeURIComponent(fullPrompt);
    const url = `https://eliasar-yt-api.vercel.app/api/ia/gemini?prompt=${encodedPrompt}`;

    try {
        const res = await fetch(url);
        const json = await res.json();

        if (json.status && json.content) {
            return `${emoji} ${json.content.trim()}`;
        } else {
            console.error(`${msm} Respuesta inválida de EliasarYT:`, json);
            return '✘ Shizuka no recibió una respuesta válida.';
        }
    } catch (error) {
        console.error(`${msm} Error en EliasarYT API:`, error.message);
        throw error;
    }
}

// 🧬 Handler principal
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
            console.log(`${msm} Prompt enviado a EliasarYT:`, fullPrompt);

            const response = await shizukaPrompt(fullPrompt);
            await conn.sendMessage(m.chat, { text: response, edit: key });
            await m.react(done);
        } catch (err) {
            console.error(`${msm} Error en EliasarYT API:`, err.message);
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