let handler = async (m, { conn }) => {
  const suittag = '5355699866' // Número del creador
  const botname = 'Shizuka-AI'
  const correo = 'c211762O@gmail.com'
  const github = 'https://github.com/Kone457/Shizuka-AI'
  const canal = 'https://whatsapp.com/channel/0029VbAVMtj2f3EFmXmrzt0v'
  const packname = 'Shizuka-AI'
  const dev = 'Carlos'

  await m.react('📇')

  // Obtener biografías (si fallan, se usa "Sin Biografía")
  const bioOwnerData = await conn.fetchStatus(`${suittag}@s.whatsapp.net`).catch(() => ({ status: 'Sin Biografía' }))
  const bioBotData = await conn.fetchStatus(conn.user.jid).catch(() => ({ status: 'Sin Biografía' }))

  const bio = bioOwnerData?.status?.toString() || 'Sin Biografía'
  const bioBot = bioBotData?.status?.toString() || 'Sin Biografía'

  const mensaje = `
╭─「 *👤 Información del Creador* 」─╮
│ 🧑‍💻 *Nombre:* ${dev}
│ 🤖 *Bot:* ${botname}
│ 📧 *Correo:* ${correo}
│ 🌐 *GitHub:* ${github}
│ 📣 *Canal:* ${canal}
│ 🗺️ *Ubicación:* Cuba
│ 📝 *Bio:* ${bio}
╰─────────────────────────────╯

╭─「 *🤖 Información del Bot* 」─╮
│ 📦 *Nombre:* ${packname}
│ 🧑‍🎨 *Desarrollador:* ${dev}
│ 📝 *Bio:* ${bioBot}
╰─────────────────────────────╯
`.trim()

  await conn.sendMessage(m.chat, {
    text: mensaje,
    mentions: [`${suittag}@s.whatsapp.net`, conn.user.jid]
  }, { quoted: m })
}

handler.help = ['owner', 'creador']
handler.tags = ['info']
handler.command = ['owner', 'creator', 'creador', 'dueño']

export default handler