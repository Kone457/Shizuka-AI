let handler = async (m, { conn }) => {
  const canalID = '120363417186717632@newsletter'; 

  try {
    await conn.sendMessage(canalID, {
      text: '🧪 Prueba de envío desde el bot.'
    });

    m.reply('✅ El mensaje de prueba fue enviado correctamente al canal.');
  } catch (e) {
    console.error(e);
    m.reply('❌ El bot no pudo enviar el mensaje. Verifica que esté suscrito y tenga permisos en el canal.');
  }
};

handler.help = ['canal'];
handler.tags = ['tools'];
handler.command = ['canal'];
handler.owner = true;

export default handler;