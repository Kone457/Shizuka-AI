let handler = async (m, { conn, text, command, usedPrefix }) => {
  const grupoID = '120363400877777201@g.us'; // ID del grupo

  if (m.quoted) {
    try {
      await conn.copyNForward(grupoID, m.quoted.fakeObj || m.quoted, true);
      return m.reply(`✅ El mensaje ha sido reenviado correctamente al grupo.`);
    } catch (e) {
      console.error(e);
      return m.reply(`⚠️ No se pudo reenviar el mensaje.\nPor favor, verifica que el ID del grupo sea correcto y que el bot tenga los permisos necesarios.`);
    }
  }

  if (!text) {
    return m.reply(`❌ *Falta el mensaje:*\nPuedes responder a un mensaje multimedia o escribir uno directamente.\nEjemplo:\n${usedPrefix + command} ¡Hola a todos! Espero que estén bien 😊`);
  }

  try {
    await conn.sendMessage(grupoID, { text });
    m.reply(`✅ Tu mensaje ha sido enviado al grupo con éxito.`);
  } catch (e) {
    console.error(e);
    m.reply(`⚠️ Ocurrió un error al enviar el mensaje.\nVerifica que el ID del grupo sea correcto y que el bot tenga permisos para enviar mensajes.`);
  }
};

handler.help = ['grupomsg <mensaje>'];
handler.tags = ['tools'];
handler.command = ['grupomsg', 'sendgrupo'];
handler.owner = true;

export default handler;