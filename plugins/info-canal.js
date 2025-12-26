let handler = async (m, { conn, usedPrefix, command }) => {
  try {
    
    const canalInfo = {
      nombre: "🎯 *CANAL OFICIAL*",
      descripcion: "¡Únete a nuestro canal para recibir las últimas actualizaciones, novedades y contenido exclusivo!",
      enlace: "https://whatsapp.com/channel/0029VbAVMtj2f3EFmXmrzt0v",
      codigoQR: "0029VbAVMtj2f3EFmXmrzt0v",
      id: "0029VbAVMtj2f3EFmXmrzt0v@newsletter"
    };

    
    const mensaje = `
╭━━━「 *INFORMACIÓN DEL CANAL* 」━━━⬣
│
│ ${canalInfo.nombre}
│
│ 📝 *Descripción:*
│ ${canalInfo.descripcion}
│
│ 🔗 *Enlace Directo:*
│ ${canalInfo.enlace}
│
│ 📱 *ID del Canal:*
│ ${canalInfo.codigoQR}
│
│ 📌 *Para unirte:*
│ 1. Haz clic en el enlace
│ 2. O busca "${canalInfo.codigoQR}" en WhatsApp
│ 3. Pulsa "Seguir"
│
╰━━━━━━━━━━━━━━━━━━━⬣

📢 *¡No te pierdas las novedades!*
⭐ *Activa las notificaciones*
`;

    const botones = [
      { buttonId: `${usedPrefix}sendcanal`, buttonText: { displayText: '📤 Enviar al canal' }, type: 1 },
      { buttonId: `${usedPrefix}qr`, buttonText: { displayText: '📱 Ver QR' }, type: 1 }
    ];

    const templateMessage = {
      text: mensaje,
      footer: '© Bot Official',
      templateButtons: botones,
      headerType: 1
    };

    try {
      await conn.sendMessage(m.chat, templateMessage, { quoted: m });
    } catch (error) {
      
      await conn.sendMessage(m.chat, {
        text: mensaje,
        contextInfo: {
          externalAdReply: {
            title: "🎯 Canal Oficial",
            body: "¡Únete ahora!",
            mediaType: 1,
            thumbnailUrl: "https://files.catbox.moe/0da8x5.jpg",
            sourceUrl: canalInfo.enlace
          }
        }
      }, { quoted: m });
    }

    await conn.sendMessage(m.chat, {
      text: `🔗 *Enlace rápido:*\n${canalInfo.enlace}\n\n_Copia y pega en WhatsApp para unirte_`,
      mentions: [m.sender]
    }, { quoted: m });

  } catch (error) {
    console.error(error);
    await m.reply(`❌ *Error al mostrar la información del canal.*\n\n🔗 Enlace directo:\nhttps://whatsapp.com/channel/0029VbAVMtj2f3EFmXmrzt0v`);
  }
};

handler.help = ['canal'];
handler.tags = ['info'];
handler.command = ['canal', 'channel', 'grupo', 'oficial'];
handler.register = true;

export default handler;