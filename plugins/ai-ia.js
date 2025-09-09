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

// 🎨 Función para construir el prompt base
function buildPrompt(username) {
    return `Tu nombre es ${botname}, creada por ${etiqueta}. Tu versión es ${vs}, hablas en Español. Llamas a las personas por su nombre (${username}), eres traviesa, cruel con todos excepto con ${etiqueta}, y usas muchos emojis.`;
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
            console.log(`${msm} Prompt enviado a Dorratz:`, fullPrompt);

            const response = await shizukaPrompt(fullPrompt);
            await conn.sendMessage(m.chat, { text: response, edit: key });
            await m.react(done);
        } catch (err) {
            console.error(`${msm} Error en Dorratz:`, err.message);
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

// 💋 Función para invocar Dorratz API
async function shizukaPrompt(fullPrompt) {
    try {
        const url = `https://api.dorratz.com/ai/gpt?prompt=${encodeURIComponent(fullPrompt)}&country=venezuela`;
        const res = await fetch(url);
        const data = await res.json();

        const result = data.result || '✘ Shizuka no obtuvo respuesta.';
        return result;
    } catch (error) {
        console.error('[Dorratz Error]', error.message);
        throw error;
    }
}