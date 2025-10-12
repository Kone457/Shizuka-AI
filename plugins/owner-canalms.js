let handler = async (m, { conn, text, command, usedPrefix }) => {
  // 🆔 ID FIJO del canal de WhatsApp (asegúrate que sea correcto)
  const canalID = '120363400241973967@newsletter'; // ← Reemplaza con el ID real de tu canal

  if (!text) {
    return m.reply(`❌ *Uso incorrecto:*\nEjemplo:\n${usedPrefix + command} Hola a todos 🎉`);
  }

  try {
    await conn.sendMessage(canalID, {
      text: text
    });

    m.reply(`✅ *Mensaje enviado correctamente al canal.*`);
  } catch (e) {
    console.error(e);
    m.reply(`⚠️ *Error al enviar el mensaje al canal.*\nVerifica que el ID del canal sea correcto y que el bot tenga permisos para enviar mensajes.`);
  }
};

handler.help = ['canalmsg <mensaje>'];
handler.tags = ['tools'];
handler.command = ['canalmsg', 'sendcanal']; 
handler.owner = true; // Solo el owner puede usarlo

export default handler;
