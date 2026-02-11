export default {
  command: ['report', 'reporte', 'sug', 'suggest'],
  category: 'info',
  run: async (client, m, args) => {

    const texto = args.join(' ').trim()
    const now = Date.now()

    const cmd = m.text.split(' ')[0].replace(/^\/|^\!|^\./, '').toLowerCase()

    const cooldown = global.db.data.users[m.sender].sugCooldown || 0
    const restante = cooldown - now

    if (restante > 0) {
      return m.reply(`
┌───────────────┐
│  ⏳ ESPERA ACTIVA  │
└───────────────┘

Tiempo restante:
→ ${msToTime(restante)}
      `.trim())
    }


    if (!texto || texto.length < 10) {
      return m.reply(`
┌───────────────┐
│   ⚠️ ENTRADA INVÁLIDA │
└───────────────┘

Tu mensaje debe tener al menos 10 caracteres.
      `.trim())
    }

    let tipo2 = 'Sugerencia'
    if (cmd === 'report' || cmd === 'reporte') tipo2 = 'Reporte'

    const user = m.pushName || 'Usuario desconocido'
    const numero = m.sender.split('@')[0]

    const fecha = new Date()
    const opcionesFecha = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    const fechaLocal = fecha.toLocaleDateString('es-MX', opcionesFecha)

    const pp = await client.profilePictureUrl(m.sender, 'image')
      .catch(() => 'https://files.catbox.moe/4k9pie.jpg')

    const reportMsg = `
┌───────────────┐
│  ${tipo2.toUpperCase()}  │
└───────────────┘

Usuario:
→ ${user}

Contacto:
→ wa.me/${numero}

Fecha:
→ ${fechaLocal}

Mensaje:
→ ${texto.split('\n').join('\n→ ')}
    `.trim()

    await global.client.sendContextInfoIndex(
      '120363424651881923@g.us',
      reportMsg,
      {},
      null,
      false,
      null,
      {
        banner: pp,
        title: tipo2,
        body: 'Mensaje enviado al staff',
        redes: global.db.data.settings[
          client.user.id.split(':')[0] + '@s.whatsapp.net'
        ].link
      }
    )

    global.db.data.users[m.sender].sugCooldown = now + 30 * 1000

    await m.reply(`
┌───────────────┐
│   ✅ ENVIADO OK │
└───────────────┘

*Tu ${tipo2.toLowerCase()} fue enviada correctamente al equipo.*\n> Gracias por tu aporte.
    `.trim())
  }
}

const msToTime = (duration) => {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)
  const hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
  const parts = []
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  parts.push(`${seconds}s`)
  return parts.join(' ')
}