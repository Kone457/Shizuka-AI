import os from 'os';

let handler = async (m, { conn }) => {
    try {
        const mensaje = `
╭♡───────────────♡╮
│ Ya me reinicio, amor...     
│ Solo serán 3 segundos        
│ Ya vuelvo 😘                 
╰♡───────────────♡╯
        `.trim();

        await conn.reply(m.chat, mensaje, m);

        setTimeout(() => process.exit(0), 3000);

    } catch (error) {
        console.error('[ERROR][REINICIO]', error);
        await conn.reply(m.chat, `❌ *No pude descansar como esperaba:*\n${error.message || error}`, m);
    }
};

handler.help = ['reiniciar'];
handler.tags = ['owner'];
handler.command = ['restart', 'reiniciar'];
handler.rowner = true;

export default handler;