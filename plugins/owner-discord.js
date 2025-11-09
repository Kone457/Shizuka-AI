import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'
import { tmpdir } from 'os'
import FormData from 'form-data'

let handler = async (m, { conn, text }) => {
  const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1436892691433521183/C_wUqs-yclWsiUS6gxvZuedIAxEnRI5UUKSUh-uYhAbrfDg_HhfXawcSjz1gmSuaovWc'

  let contentToSend = text
  let filePath = null

  // Si el mensaje es una respuesta con imagen
  if (m.quoted && m.quoted.message?.imageMessage) {
    const media = await conn.downloadMediaMessage(m.quoted) // buffer
    const tempFileName = path.join(tmpdir(), `discord_${Date.now()}.jpg`)
    fs.writeFileSync(tempFileName, media)
    filePath = tempFileName
  }

  if (!contentToSend && !filePath) {
    return m.reply(
      `🌙 *Debes escribir un mensaje o responder a un mensaje con imagen para enviarlo al Webhook de Discord.*\n` +
      `📎 Ejemplo: #postdiscord Las estrellas susurran buenas noticias.`
    )
  }

  try {
    const formData = new FormData()

    if (filePath) {
      formData.append('file', fs.createReadStream(filePath))
      formData.append(
        'payload_json',
        JSON.stringify({
          content: contentToSend || '',
          embeds: [
            {
              title: '📷 Nuevo mensaje desde Shizuka',
              description: contentToSend || '',
              color: 16711680, // rojo
              timestamp: new Date()
            }
          ]
        })
      )
    } else {
      formData.append(
        'payload_json',
        JSON.stringify({ content: contentToSend })
      )
    }

    const res = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      body: formData
    })

    if (!res.ok) {
      const txt = await res.text()
      throw new Error(`HTTP ${res.status} → ${txt}`)
    }

    // Confirmación en WhatsApp
    await conn.reply(
      m.chat,
      `📨 *Mensaje enviado correctamente al Webhook de Discord.*\n` +
      `🪷 *Shizuka ha compartido tu voz con el universo.*`,
      m
    )

    // Borrar archivo temporal
    if (filePath) fs.unlinkSync(filePath)

  } catch (e) {
    console.error(e)
    await conn.reply(
      m.chat,
      `⚠️ *No se pudo enviar el mensaje al Webhook de Discord.*\n` +
      `📎 *Detalles:* ${e.message || e}`,
      m
    )
  }
}

handler.help = ['postdiscord <mensaje>']
handler.tags = ['tools']
handler.command = ['postdiscord', 'discord', 'senddiscord']
handler.rowner = true

export default handler