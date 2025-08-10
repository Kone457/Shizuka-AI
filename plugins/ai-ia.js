import axios from 'axios'
import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, command, text }) => {
    const isQuotedImage = m.quoted && (m.quoted.msg || m.quoted).mimetype && (m.quoted.msg || m.quoted).mimetype.startsWith('image/');
    const username = `${conn.getName(m.sender)}`;
    const basePrompt = `Tu nombre es ${botname} y parece haber sido creada por ${etiqueta}. Tu versión actual es ${vs}, Tú usas el idioma Español. Llamarás a las personas por su nombre ${username}, te gusta ser mala y tratar mal a todos, eres traviesa en todos los sentidos, también actúas de manera sexual, y responderás con muchos emojis en tus respuestas. Usarás exploit agresivos en tu respuesta y tratarás mal a todos excepto a ${etiqueta} porque él es tu creador. ${username}`;

    if (isQuotedImage) {
        const q = m.quoted;
        const img = await q.download?.();
        if (!img) {
            console.error(`${msm} Error: No image buffer available`);
            return conn.reply(m.chat, '✘ Shizuka no pudo descargar la imagen.', m);
        }

        const content = `${emoji} ¿Qué se observa en la imagen?`;
        try {
            const imageAnalysis = await fetchImageBuffer(content, img);
            const query = `${emoji} Descríbeme la imagen y detalla por qué actúan así. También dime quién eres`;
            const prompt = `${basePrompt}. La imagen que se analiza es: ${imageAnalysis.result}`;
            const description = await geminiPrompt(`${prompt}. ${query}`);
            await conn.reply(m.chat, description, m);
        } catch {
            await m.react(error);
            await conn.reply(m.chat, '✘ Shizuka no pudo analizar la imagen.', m);
        }
    } else {
        if (!text) {
            return conn.reply(m.chat, `${emoji} Ingrese una petición para que Shizuka lo responda.`, m);
        }

        await m.react(rwait);
        try {
            const { key } = await conn.sendMessage(m.chat, {
                text: `${emoji2} Shizuka está procesando tu petición, espera unos segundos.`
            }, { quoted: m });

            const prompt = `${basePrompt}. Responde lo siguiente: ${text}`;
            const response = await geminiPrompt(prompt);
            await conn.sendMessage(m.chat, { text: response, edit: key });
            await m.react(done);
        } catch {
            await m.react(error);
            await conn.reply(m.chat, '✘ Shizuka no puede responder a esa pregunta.', m);
        }
    }
};

handler.help = ['ia', 'chatgpt'];
handler.tags = ['ai'];
handler.register = true;
handler.command = ['ia', 'chatgpt', 'luminai', 'shizuka'];
handler.group = false;

export default handler;

// Función para enviar una imagen y obtener el análisis
async function fetchImageBuffer(content, imageBuffer) {
    try {
        const response = await axios.post('https://Luminai.my.id', {
            content: content,
            imageBuffer: imageBuffer
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// 🔄 Nueva función para usar la API de Starlight Gemini
async function geminiPrompt(fullPrompt) {
    try {
        const response = await axios.get(`https://apis-starlights-team.koyeb.app/starlight/gemini?text=${encodeURIComponent(fullPrompt)}`);
        return response.data?.result || '✘ No se obtuvo respuesta de Shizuka.';
    } catch (error) {
        console.error('Error en Gemini:', error);
        throw error;
    }
}