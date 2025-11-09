import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'
import { tmpdir } from 'os'

let handler = async (m, { conn, text }) => {
  const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1436892691433521183/C_wUqs-yclWsiUS6gxvZuedIAxEnRI5UUKSUh-uYhAbrfDg_HhfXawcSjz1gmSuaovWc'

  // Determinar contenido a enviar
  let contentToSend = text
  let imageBuffer = null

  if (!contentToSend && m.quoted) {
    const q = m.quoted
    // Si el mensaje citado es imagen
    if (q.message?.imageMessage) {
      const media = await conn.downloadMediaMessage(q)
      imageBuffer = media
    }
    // Si el mensaje citado tiene texto
    if (!contentToSend) {
      contentToSend = q.text || q.body || ''
    }
  }

  if (!contentToSend && !imageBuffer) {
    return m.reply(
      `🌙 *Debes escribir un mensaje o responder a un mensaje con imagen para enviarlo al Webhook de Discord.*\n` +
      `📎 Ejemplo: #postdiscord Las estrellas susurran buenas noticias.`
    )
  }

  try {
    let body
    if (imageBuffer) {
      // Si hay imagen, enviamos embed con imagen
      const base64Image = `data:image/png;base64,${imageBuffer.toString('base64')}`
      body = {
        embeds: [
          {
            title: '📷 Nuevo mensaje desde Shizuka',
            description: contentToSend || '',
            color: 16711680, // rojo
            image: { url: base64Image },
            timestamp: new Date()
          }
        ]
      }
    } else {
      // Solo texto
      body = { content: contentToSend }
    }

    const res = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    if (!res.ok) {
      const txt = await res.text()
      throw new Error(`HTTP ${res.status} → ${txt}`)
    }

    await conn.reply(
      m.chat,
      `📨 *Mensaje enviado correctamente al Webhook de Discord.*\n` +
      `🪷 *Shizuka ha compartido tu voz con el universo.*`,
      m
    )
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

// 🧾 Configuración del comando
handler.help = ['postdiscord <mensaje>']
handler.tags = ['tools']
handler.command = ['postdiscord', 'discord', 'senddiscord']
handler.rowner = true 

export default handler