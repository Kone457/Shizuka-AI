import QRCode from 'qrcode'

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('> Ingresa el texto o enlace que quieras convertir en QR.')

  try {
    await conn.sendMessage(m.chat, {
      react: { text: '⌛', key: m.key }
    })

    const qrBuffer = await QRCode.toBuffer(text, { type: 'png' })

    await conn.sendMessage(m.chat, {
      image: qrBuffer,
      caption: `🔗 Código QR generado\n\n📌 Contenido: ${text}`
    }, { quoted: m })

    await conn.sendMessage(m.chat, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {
    console.error('[QR Plugin] Error:', e)
    await conn.sendMessage(m.chat, {
      react: { text: '❌', key: m.key }
    })
    await conn.sendMessage(m.chat, { text: `🕸 Error [${e.message || e}]` }, { quoted: m })
  }
}

handler.help = ['qr']
handler.tags = ['tools']
handler.command = ['qr', 'qrcode']

export default handler