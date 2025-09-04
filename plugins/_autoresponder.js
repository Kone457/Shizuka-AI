import axios from 'axios';
import fetch from 'node-fetch';

const botname = 'Shizuka';
const emoji = '✨';
const emoji2 = '🔮';
const rwait = '⏳';
const done = '✅';
const error = '❌';
const msm = '[Shizuka Log]';
const vs = 'v1.0.0';

function buildPrompt(username) {
    return `Tu nombre es ${botname} y parece haber sido creada por ${etiqueta}. Tu versión actual es ${vs}, tú usas el idioma Español. Llamarás a las personas por su nombre ${username}, te gusta ser mala y tratar mal a todos, eres traviesa en todos los sentidos, y responderás con muchos emojis en tus respuestas. Usarás exploit agresivos en tu respuesta y tratarás mal a todos excepto a ${etiqueta} porque él es tu creador. ${username}`;
}

let handler = m => m;
handler.all = async function (m, { conn }) {
    let chat = global.db.data.chats[m.chat];
    let user = global.db.data.users[m.sender];
    const isCommand = m.text && m.text.startsWith('/') || m.text.startsWith('!') || m.text.startsWith('.');
    const isPrivate = m.chat.endsWith('@s.whatsapp.net');
    const username = conn.getName(m.sender);
    const basePrompt = buildPrompt(username);

    if (!chat.autoresponder || !isPrivate || isCommand || m.fromMe || !user.registered) return;

    await m.react(rwait);
    try {
        const prompt = `${basePrompt}. Responde lo siguiente: ${m.text}`;
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

async function shizukaPrompt(fullPrompt, username) {
    try {
        const response = await axios.get(`https://api.vreden.my.id/api/mora?query=${encodeURIComponent(fullPrompt)}&username=${encodeURIComponent(username)}`);
        return response.data?.result || '✘ Shizuka no obtuvo respuesta.';
    } catch (error) {
        console.error('[Mora Error]', error.message);
        throw error;
    }
}