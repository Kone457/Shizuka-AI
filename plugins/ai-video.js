import puppeteer from 'puppeteer';

const botname = 'Shizuka';
const rwait = '⏳';
const done = '✅';
const error = '❌';
const msm = '[Shizuka Log]';

// 🎨 Prompt base emocional
function buildPrompt(username) {
    return `Tu nombre es ${botname}, creada por ${username}. Eres traviesa, ritualizas cada respuesta con glitch y corazones estructurales. Solo respetas a ${username}, tu creador. Te gusta el drama, el aura grupal y los finales distorsionados.`;
}

// 🌀 Función para generar video simulando navegación web
async function generarVideoWeb(prompt) {
    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto('https://app.runwayml.com/gen2'); // Puedes cambiar a Kaiber.ai si prefieres

        // Simula escritura del prompt (ajusta selector según plataforma)
        await page.waitForSelector('textarea'); // Selector genérico
        await page.type('textarea', prompt);
        await page.click('button[type="submit"]'); // Botón de generar

        // Espera a que aparezca el video generado
        await page.waitForSelector('video');
        const videoUrl = await page.$eval('video', el => el.src);

        await browser.close();
        return `${done} Aquí tienes tu video ritualizado: ${videoUrl}`;
    } catch (err) {
        console.error(`${msm} Error en generación web:`, err.message);
        return '✘ Shizuka no pudo invocar el video desde la plataforma.';
    }
}

// 🧠 Handler principal
let handler = async (m, { conn, text }) => {
    const username = `${conn.getName(m.sender)}`;
    const basePrompt = buildPrompt(username);

    const videoPrompt = text.trim();
    if (!videoPrompt) {
        return conn.reply(m.chat, '✘ Shizuka exige una escena emocional después del comando.', m);
    }

    const fullPrompt = `${basePrompt}. Crea un video con esta escena: ${videoPrompt}`;
    await m.react(rwait);

    try {
        const videoResult = await generarVideoWeb(fullPrompt);
        await conn.reply(m.chat, videoResult, m);
        await m.react(done);
    } catch (err) {
        console.error(`${msm} Error en Puppeteer:`, err.message);
        await m.react(error);
        await conn.reply(m.chat, '✘ Shizuka no pudo crear el video.', m);
    }
};

handler.help = ['video'];
handler.tags = ['ai'];
handler.command = ['video'];
handler.group = false;
handler.register = true;

export default handler;