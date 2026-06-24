const handler = async (m, { conn, text, usedPrefix, command }) => {
  const [numero, mensaje] = text.split('|').map(v => v?.trim())

  if (!numero || !mensaje) {
    return conn.reply(m.chat, `《✧》 Formato incorrecto.\nUsa: ${usedPrefix + command} +1234567890|Mensaje`, m)
  }

  const jid = numero.replace(/[^0-9]/g, '') + '@s.whatsapp.net'

  try {
    await conn.sendMessage(jid, { text: mensaje })
    await conn.reply(m.chat, `《✧》 *Mensaje enviado a:* ${numero}\n✰ *Contenido:* ${mensaje}`, m)
  } catch (e) {
    console.error(e)
    conn.reply(m.chat, `《✧》 No se pudo enviar el mensaje.\n️✰ Error: ${e.message}`, m)
  }
}

handler.command = ['sendto', 'sendmsg']
handler.help = ['sendto']
handler.tags = ['owner']
handler.group = false
handler.owner = true
export default handler