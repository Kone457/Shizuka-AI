import os from 'os';

let handler = async (m, { conn }) => {
    try {
        const mensaje = `
╭─〔 🔄 Reinicio del sistema 〕─╮
│ 🧠 Estado: *Preparando memoria*
│ 🧩 Módulos: *Desactivando procesos*
│ 🕰️ Tiempo estimado: *3 segundos*
╰──────────────────────────────╯
        `.trim();

        await conn.reply(m.chat, mensaje, m);

        setTimeout(() => process.exit(0), 3000);

    } catch (error) {
        console.error('[ERROR][REINICIO]', error);
        await conn.reply(m.chat, `❌ *Error durante el reinicio:*\n${error.message || error}`, m);
    }
};

handler.help = ['reiniciar'];
handler.tags = ['owner'];
handler.command = ['restart', 'reiniciar'];
handler.rowner = true;

export default handler;