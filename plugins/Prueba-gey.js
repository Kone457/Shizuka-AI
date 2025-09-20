const handler = async (m, { conn, usedPrefix, command }) => {
  try {
    // 📡 Identificación del objetivo
    const who = m.quoted?.sender || m.mentionedJid?.[0] || (m.fromMe ? conn.user.jid : m.sender)
    const nombre = await conn.getName(who)

    // 🖼️ Obtener avatar del usuario
    const avatar = await conn.profilePictureUrl(who, 'image')
      .catch(() => 'https://telegra.ph/file/24fa902ead26340f3df2c.png')

    // 🎨 Aplicar filtro de arcoíris con API
    const enlace = `https://some-random-api.com/canvas/gay?avatar=${encodeURIComponent(avatar)}`

    // 📦 Enviar imagen con mensaje completo
    await conn.sendFile(
      m.chat,
      enlace,
      'shizuka-gay.png',
`🏳️‍🌈 *Unidad Shizuka - Análisis Estético Activado*

📸 *Objetivo escaneado:* ${nombre}
🎨 *Filtro aplicado:* 🌈 Gay Overlay (activado)
🧪 *Resultado oficial:* Este usuario ha sido declarado... **𝗚𝗘𝗬** 💅✨

💬 *Análisis renderizado con precisión holográfica.*

🛰️ *Shizuka se despide con orgullo y estilo digital.*`,
      m
    )
  } catch (error) {
    console.error(error)
    await m.reply(`⚠️ *Error en la operación visual.*\n🔧 Detalles técnicos: ${error.message}`)
  }
}

handler.help = ['gey']
handler.tags = ['maker']
handler.command = ['gay', 'gey', 'rainbow']
handler.register = true

export default handler