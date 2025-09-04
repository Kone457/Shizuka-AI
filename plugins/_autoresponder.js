import axios from 'axios';

const botname = 'Shizuka';
const etiqueta = 'TuCreador';
const vs = 'v1.0.0';
const rwait = '⏳';
const done = '✅';
const error = '❌';
const msm = '[Shizuka Log]';

// 🎨 Generar prompt teatral
function buildPrompt(username, mensaje) {
    return `Tu nombre es ${botname} y fue creada por ${etiqueta}. Versión: ${vs}. Hablas Español, llamas a las personas por su nombre ${username}, eres traviesa, respondes con muchos emojis y tratas mal a todos excepto a ${etiqueta}. Responde lo siguiente: ${mensaje}`;
}

// 💋 Función para llamar a la API Mora
async function shizukaPrompt(prompt, username) {
    try {
        const response = await axios.get(`https://api.vreden.my.id/api/mora?query=${encodeURIComponent(prompt)}&username=${encodeURIComponent(username)}`);
        return response.data?.result || '✘ Shizuka no obtuvo respuesta.';
    } catch (err) {
        console.error('[Mora Error]', err.message);
        return '✘ Shizuka no pudo conectarse a la API.';
    }
}

// 🎭 Handler principal
let handler = m => m;
handler.all = async function (m, { conn }) {
    const chat = global.db?.data?.chats?.[m.chat];
    const user = global.db?.data?.users?.[m.sender];

    const isPrivate = m.chat.endsWith('@s.whatsapp.net');
    const isCommand = m.text && /^[\/!.\-]/.test(m.text);
    const username = conn.getName(m.sender);

    // Solo activa el autoresponder si está habilitado en el chat
    if (!chat?.autoresponder) return;
    if (!isPrivate) return;       // Solo mensajes privados
    if (isCommand) return;        // Ignorar comandos
    if (m.fromMe) return;         // Ignorar mensajes propios
    if (!user?.registered) return; // Ignorar usuarios no registrados

    try {
        // Reacción inicial
        await conn.sendMessage(m.chat, { react: { text: rwait, key: m.key } });

        // Generar prompt y obtener respuesta
        const prompt = buildPrompt(username, m.text);
        console.log(`${msm} Prompt enviado a Mora:`, prompt);
        const response = await shizukaPrompt(prompt, username);

        // Responder en privado
        await conn.reply(m.chat, response, m);

        // Reacción final
        await conn.sendMessage(m.chat, { react: { text: done, key: m.key } });
    } catch (err) {
        console.error(`${msm} Error en Mora:`, err.message);
        await conn.sendMessage(m.chat, { react: { text: error, key: m.key } });
        await conn.reply(m.chat, '✘ Shizuka no puede responder a eso.', m);
    }
};

export default handler;