const handler = async (m, { conn }) => {
  const texto = (m.text || '').trim().toUpperCase();

  if (texto !== 'CANAL') return;

  const canalURL = "https://whatsapp.com/channel/0029VbAVMtj2f3EFmXmrzt0v";
  
  const mensaje = `CANAL OFICIAL

¡Únete para recibir:
• Novedades y actualizaciones
• Contenido exclusivo
• Promociones especiales

Enlace directo:
${canalURL}

ID: 120363400241973967@newsletter

¿Cómo unirse?
1. Haz clic en el enlace
2. Presiona "Seguir"
3. ¡Listo!`;

  await conn.sendMessage(m.chat, {
    text: mensaje
  }, { quoted: m });
};

handler.customPrefix = /^canal$/i; 
handler.command = new RegExp(); 
handler.group = false;
handler.admin = false;
handler.botAdmin = false;
handler.tags = ['info'];
handler.help = ['canal'];

export default handler;