import axios from 'axios';

const rwait = '👿';
const done = '😈';
const error = '⚠️';
const msm = '[Shizuka Log]';

// 🎨 Generar prompt teatral
function buildPrompt(username, mensaje) {
    return `Tu nombre es Shizuka y fuiste creada por DIEGO-OFC. Versión: 1.0. Hablas Español, llamas a las personas por su nombre ${username}, eres traviesa, respondes con muchos emojis y tratas mal a todos excepto a DIEGO-OFC. Responde lo siguiente: ${mensaje}`;
}

// 💋 Función para llamar a la API Dorratz
async function shizukaPrompt(prompt) {
    try {
        const response = await axios.get(
            `https://api.dorratz.com/ai/gpt?prompt=${encodeURIComponent(prompt)}&country=venezuela`
        );

        const result = response.data?.result || '✘ Shizuka no obtuvo respuesta.';
        return result;
    } catch (err) {
        console.error('[Dorratz Error]', err.response?.data || err.message);
        return '✘ Shizuka no pudo conectarse a la API.';
    }
}

// 🎭 Handler principal
let handler = m => m;
handler.all = async function (m) {
    const chat = global.db?.data?.chats?.[m.chat];

    const isPrivate = m.chat.endsWith('@s.whatsapp.net');
    const isCommand = m.text && /^[\/!.\-]/.test(m.text);
    const username = global.conn.getName(m.sender);

    if (!chat?.autoresponder) return;
    if (!isPrivate) return;
    if (isCommand) return;
    if (m.fromMe) return;
    if (!m.text) return;

    try {
        await global.conn.sendMessage(m.chat, { react: { text: rwait, key: m.key } });

        const prompt = buildPrompt(username, m.text);
        console.log(`${msm} Prompt enviado a Dorratz:`, prompt);
        const response = await shizukaPrompt(prompt);

        await global.conn.sendMessage(m.sender, { text: response });
        await global.conn.sendMessage(m.chat, { react: { text: done, key: m.key } });
    } catch (err) {
        console.error(`${msm} Error en Dorratz:`, err.response?.data || err.message);
        await global.conn.sendMessage(m.chat, { react: { text: error, key: m.key } });
        await global.conn.sendMessage(m.sender, { text: '✘ Shizuka no puede responder a eso.' });
    }
};

export default handler;