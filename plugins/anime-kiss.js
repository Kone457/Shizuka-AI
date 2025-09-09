

let handler = async (m, { conn, usedPrefix, args }) => {
  // Si viene con argumento, usarlo como destinatario
  let who =
    args[0] && args[0].includes('@')
      ? args[0].replace(/[@+]/g, '') + '@s.whatsapp.net'
      : m.mentionedJid.length > 0
        ? m.mentionedJid[0]
        : (m.quoted ? m.quoted.sender : m.sender)

  let name = await conn.getName(who)
  let name2 = await conn.getName(m.sender)

  let str =
    who === m.sender
      ? `╭──〔 💞 BESO EN SOLITARIO 〕──╮\n` +
        `┃ ${name2} se dio un beso con cariño\n` +
        `╰───────────────────────────────╯`
      : `╭──〔 💋 BESO COMPARTIDO 〕──╮\n` +
        `┃ ${name2} besó a ${name}\n` +
        `╰──────────────────────────╯`

  if (m.isGroup) {
    const videos = [
      'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745784879173.mp4',
      'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745784874988.mp4',
      'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745784869583.mp4',
      'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745784864195.mp4',
      'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745784856547.mp4',
      'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745784908581.mp4',
      'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745784904437.mp4',
      'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745784899621.mp4',
      'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745784894649.mp4',
      'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745784889479.mp4',
      'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745784945508.mp4',
      'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745784940220.mp4',
      'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745784935466.mp4',
      'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745784918972.mp4',
      'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745784914086.mp4'
    ]

    const video = videos[Math.floor(Math.random() * videos.length)]

    // Botón que devuelve el beso al que inició el comando
    const target = m.sender // siempre devolver al que inició
    const devolverBeso = `${usedPrefix}kiss ${target.split('@')[0]}`

    const buttons = [
      { buttonId: devolverBeso, buttonText: { displayText: "💋 Devolver beso" }, type: 1 }
    ]

    await conn.sendMessage(
      m.chat,
      {
        video: { url: video },
        gifPlayback: true,
        caption: str,
        mentions: [who, m.sender],
        buttons
      },
      { quoted: m }
    )
  }
}

handler.help = ['kiss']
handler.tags = ['anime']
handler.command = ['kiss', 'besar']
handler.group = true

export default handler