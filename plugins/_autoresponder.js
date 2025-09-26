import axios from 'axios';

const rwait = '👿';
const done = '😈';
const error = '⚠️';
const msm = '[Shizuka Log]';

// 🎨 Generar prompt teatral
function buildPrompt(username, mensaje) {
    const botname = 'Shizuka';
    const etiqueta = 'Carlos';
    const vs = '1.0.0';
    return `Tu nombre es ${botname} y fue creada por ${etiqueta}. Versión: ${vs}. Hablas Español, llamas a las personas por su nombre ${username}, eres traviesa, respondes con muchos emojis y tratas mal a todos excepto a ${etiqueta}. Responde lo siguiente: ${mensaje}`;
}

// 💋 Función para llamar a la nueva API Starlights
async function shizukaPrompt(prompt, username) {
    try {
        const response = await axios.get(
            `https://apis-starlights-team.koyeb.app/starlight/turbo-ai?content=${encodeURIComponent('Actuaras como un bot de WhatsApp')}&text=${encodeURIComponent(prompt)}`
        );

        const result =
            response.data?.content ||
            '✘ Shizuka no obtuvo respuesta.';
        return result;
    } catch (err) {
        console.error('[Starlights API Error]', err.response?.data || err.message);
        return '✘ Shizuka no pudo conectarse a la API.';
    }
}

// 🎭 Handler principal
let handler = m => m;
handler.all = async function (m) {
    const chat = global.db?.data?.chats?.[m.chat];

    const isPrivate = m.chat.endsWith('@s.whatsapp.net');
    const isCommand = m.text && /^[\/!.\-]/.test(m.text);
    const username = global.conn.getName(m.sender); // 🔹 Usar global.conn

    if (!chat?.autoresponder) return;
    if (!isPrivate) return;
    if (isCommand) return;
    if (m.fromMe) return;
    if (!m.text) return;

    try {
        await global.conn.sendMessage(m.chat, { react: { text: rwait, key: m.key } });

        const prompt = buildPrompt(username, m.text);
        console.log(`${msm} Prompt enviado a Starlights API:`, prompt);
        const response = await shizukaPrompt(prompt, username);

        await global.conn.sendMessage(m.sender, { text: response });
        await global.conn.sendMessage(m.chat, { react: { text: done, key: m.key } });
    } catch (err) {
        console.error(`${msm} Error en Starlights API:`, err.response?.data || err.message);
        await global.conn.sendMessage(m.chat, { react: { text: error, key: m.key } });
        await global.conn.sendMessage(m.sender, { text: '✘ Shizuka no puede responder a eso.' });
    }
};

export default handler;