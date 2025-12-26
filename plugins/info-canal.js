let handler = async (m, { conn }) => {
  const canalURL = "https://whatsapp.com/channel/0029VbAVMtj2f3EFmXmrzt0v";
  
  const mensaje = `CANAL OFICIAL

¡Únete para recibir:
• Novedades y actualizaciones
• Contenido exclusivo
• Promociones especiales

Enlace directo:
${canalURL}

ID: 0029VbAVMtj2f3EFmXmrzt0v

¿Cómo unirse?
1. Haz clic en el enlace
2. Presiona "Seguir"
3. ¡Listo!`;

  await conn.sendMessage(m.chat, {
    text: mensaje,
    mentions: [m.sender]
  }, { quoted: m });
};


handler.customPrefix = /^(canal|channel|enlace)$/i;
handler.command = /^(canal|channel|enlace)$/i;
handler.help = ['canal'];
handler.tags = ['info'];


handler.exp = 0;

export default handler;