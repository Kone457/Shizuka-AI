let handler = async (m, { conn, text, command, usedPrefix }) => {
  const canalID = '120363400241973967@newsletter'; // ← Reemplaza con el ID real de tu canal

  // 🌀 Si se responde a un mensaje (texto, imagen, audio, etc.)
  if (m.quoted) {
    try {
      await conn.copyNForward(canalID, m.quoted.fakeObj || m.quoted, true);
      return m.reply(`✅ *Mensaje reenviado correctamente al canal.*`);
    } catch (e) {
      console.error(e);
      return m.reply(`⚠️ *Error al reenviar el mensaje al canal.*\nVerifica que el ID del canal sea correcto y que el bot tenga permisos para reenviar mensajes.`);
    }
  }

  // 📝 Si se envía texto directamente
  if (!text) {
    return m.reply(`❌ *Uso incorrecto:*\nPuedes responder a un mensaje multimedia o enviar texto directamente.\nEjemplo:\n${usedPrefix + command} Hola a todos 🎉`);
  }

  try {
    await conn.sendMessage(canalID, { text });
    m.reply(`✅ *Mensaje enviado correctamente al canal.*`);
  } catch (e) {
    console.error(e);
    m.reply(`⚠️ *Error al enviar el mensaje al canal.*\nVerifica que el ID del canal sea correcto y que el bot tenga permisos para enviar mensajes.`);
  }
};

handler.help = ['canalmsg <mensaje>'];
handler.tags = ['tools'];
handler.command = ['canalmsg', 'sendcanal'];
handler.owner = true;

export default handler;