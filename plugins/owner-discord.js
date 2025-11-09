import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1436892691433521183/C_wUqs-yclWsiUS6gxvZuedIAxEnRI5UUKSUh-uYhAbrfDg_HhfXawcSjz1gmSuaovWc'

  // 📝 Validación del mensaje
  if (!text) {
    return m.reply(
      `🌙 *Debes escribir el mensaje que deseas enviar al Webhook de Discord.*\n` +
      `📎 Ejemplo: #postdiscord Las estrellas susurran buenas noticias.`
    )
  }

  try {
    // 🚀 Envío del mensaje al webhook
    const res = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: text,
        username: 'Shizuka Bot ✨',
        avatar_url: 'https://cdn-icons-png.flaticon.com/512/4712/4712109.png'
      })
    })

    // 🧩 Manejo de errores HTTP
    if (!res.ok) {
      const txt = await res.text()
      throw new Error(`HTTP ${res.status} → ${txt}`)
    }

    // ✅ Confirmación al remitente
    await conn.reply(
      m.chat,
      `📨 *Mensaje enviado correctamente al Webhook de Discord.*\n` +
      `🪷 *Shizuka ha compartido tu voz con las estrellas.*`,
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

// 🧾 Propiedades del comando
handler.help = ['postdiscord <mensaje>']
handler.tags = ['tools']
handler.command = ['postdiscord', 'discord', 'senddiscord']
handler.rowner = true  // Solo el dueño del bot puede usarlo

export default handler