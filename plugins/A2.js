let handler = async (m, { conn }) => {
  const canalID = '120363417186717632@newsletter' // ID del canal tipo newsletter
  const mensaje = `📣 *Prueba ritualizada desde NagiBot*\nEste es un test de envío al canal.`

  try {
    await conn.sendMessage(canalID, {
      text: mensaje,
      contextInfo: {
        externalAdReply: {
          title: '🧪 Prueba de Envío',
          body: 'Mensaje ritualizado desde el bot',
          thumbnailUrl: 'https://qu.ax/Mvhfa.jpg',
          sourceUrl: 'https://nagi.bot',
          mediaType: 1,
          renderLargerThumbnail: true,
          showAdAttribution: false
        }
      }
    })

    m.reply('✅ El mensaje de prueba fue enviado correctamente al canal.')
  } catch (e) {
    console.error('❌ Error al enviar al canal:', e)
    m.reply(`💔 El bot no pudo enviar el mensaje al canal.\n\n🔍 Verifica lo siguiente:\n• Que el bot esté suscrito al canal\n• Que tenga permisos para publicar\n• Que el canal aún acepte mensajes desde Baileys\n\n📌 Si el canal fue migrado a estructura oficial, considera usar la API de WhatsApp Business.`)
  }
}

handler.help = ['canal']
handler.tags = ['tools']
handler.command = ['canal']
handler.owner = true

export default handler