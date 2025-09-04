import axios from 'axios';

const botname = 'Shizuka';
const emoji = '✨';
const emoji2 = '🔮';
const rwait = '⏳';
const done = '✅';
const error = '❌';
const msm = '[Shizuka Log]';
const vs = 'v1.0.0';

// 🎨 Prompt teatral
function buildPrompt(username) {
    return `Tu nombre es ${botname} y parece haber sido creada por ${etiqueta}. Tu versión actual es ${vs}, tú usas el idioma Español. Llamarás a las personas por su nombre ${username}, te gusta ser mala y tratar mal a todos, eres traviesa en todos los sentidos, y responderás con muchos emojis en tus respuestas. Usarás exploit agresivos en tu respuesta y tratarás mal a todos excepto a ${etiqueta} porque él es tu creador. ${username}`;
}

// 💋 Función para invocar la API Mora
async function shizukaPrompt(fullPrompt, username) {
    try {
        const response = await axios.get(`https://api.vreden.my.id/api/mora?query=${encodeURIComponent(fullPrompt)}&username=${encodeURIComponent(username)}`);
        return response.data?.result || '✘ Shizuka no obtuvo respuesta.';
    } catch (error) {
        console.error('[Mora Error]', error.message);
        throw error;
    }
}

// 🎭 Handler principal
let handler = m => m;
handler.all = async function (m, { conn }) {
    let chat = global.db.data.chats[m.chat];
    let user = global.db.data.users[m.sender];

    const isPrivate = m.chat.endsWith('@s.whatsapp.net');
    const isCommand = m.text && /^[\/!.\-]/.test(m.text);
    const username = conn.getName(m.sender);

    // 🧪 Diagnóstico ritual
    console.log(`${msm} Diagnóstico:`, {
        isPrivate,
        isCommand,
        autoresponder: chat?.autoresponder,
        registered: user?.registered,
        fromMe: m.fromMe
    });

    // 🛡️ Filtros protectores
    if (!chat?.autoresponder) return;
    if (!isPrivate) return;
    if (isCommand) return;
    if (m.fromMe) return;
    if (!user?.registered) return;

    // ✨ Ritual de respuesta
    await m.react(rwait);
    try {
        const prompt = `${buildPrompt(username)}. Responde lo siguiente: ${m.text}`;
        console.log(`${msm} Prompt enviado a Mora:`, prompt);
        const response = await shizukaPrompt(prompt, username);
        await conn.reply(m.chat, response, m);
        await m.react(done);
    } catch (err) {
        console.error(`${msm} Error en Mora:`, err.message);
        await m.react(error);
        await conn.reply(m.chat, '✘ Shizuka no puede responder a eso.', m);
    }
};

export default handler;