/*───────────────────────────────────────
  📁 Módulo:     kiss.js
  🧠 Autor:      Carlos (versión final)
  🛠 Proyecto:   Shizuka-AI
───────────────────────────────────────*/

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
  'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745784889479.mp4'
]

// Mapa temporal: quien fue besado -> { proposer, timeout }
const kissPending = {}

let handler = async (m, { conn, usedPrefix }) => {
  if (!m.isGroup) return conn.reply(m.chat, 'Este comando funciona solo en grupos.', m)

  // Determinar destinatario del beso
  let who = (m.mentionedJid && m.mentionedJid.length > 0)
    ? m.mentionedJid[0]
    : (m.quoted ? m.quoted.sender : m.sender)

  const proposer = m.sender // quien envía el beso
  const nameWho = await conn.getName(who)
  const nameProposer = await conn.getName(proposer)

  // Video random
  const video = videos[Math.floor(Math.random() * videos.length)]

  // Mensaje
  const caption = (who === proposer)
    ? `╭──〔 💞 BESO EN SOLITARIO 〕──╮\n┃ ${nameProposer} se dio un beso con cariño\n╰───────────────────────────────╯`
    : `╭──〔 💋 BESO COMPARTIDO 〕──╮\n┃ ${nameProposer} besó a ${nameWho}\n╰──────────────────────────╯`

  // Si es beso a sí mismo: enviamos solo el video sin botón
  if (who === proposer) {
    return await conn.sendMessage(
      m.chat,
      { video: { url: video }, gifPlayback: true, caption, mentions: [proposer] },
      { quoted: m }
    )
  }

  // Guardamos que 'who' tiene un beso pendiente para devolver
  if (kissPending[who]?.timeout) clearTimeout(kissPending[who].timeout)
  kissPending[who] = {
    proposer,
    timeout: setTimeout(() => {
      try {
        conn.sendMessage(m.chat, { text: `⏳ Se acabó el tiempo para devolver el beso a ${nameProposer}.` }, { quoted: m })
      } catch (e) {}
      delete kissPending[who]
    }, 60 * 1000)
  }

  // Botón para devolver el beso
  const buttonId = `kiss_return:${proposer}`
  const buttons = [
    { buttonId, buttonText: { displayText: "💋 Devolver beso" }, type: 1 }
  ]

  await conn.sendMessage(
    m.chat,
    { video: { url: video }, gifPlayback: true, caption, mentions: [who, proposer], buttons },
    { quoted: m }
  )
}

// Cuando alguien pulsa el botón
handler.before = async (m, { conn }) => {
  try {
    if (m.isBaileys) return
    const selected = m.message?.buttonsResponseMessage?.selectedButtonId
    if (!selected) return
    if (!selected.startsWith('kiss_return:')) return

    const proposer = selected.split(':')[1] // a quien se le devuelve el beso
    const presser = m.sender // quien pulsó el botón

    const pending = kissPending[presser]
    if (!pending || pending.proposer !== proposer) {
      return await conn.sendMessage(m.chat, { text: '❌ Este botón no es para ti o ya expiró.' }, { quoted: m })
    }

    // Enviar beso devuelto
    clearTimeout(pending.timeout)
    delete kissPending[presser]

    const video = videos[Math.floor(Math.random() * videos.length)]
    const namePresser = await conn.getName(presser)
    const nameProposer = await conn.getName(proposer)

    const captionReturn = `╭──〔 💞 BESO DEVUELTO 〕──╮\n┃ ${namePresser} le devolvió un beso a ${nameProposer}\n╰──────────────────────────╯`

    await conn.sendMessage(
      m.chat,
      { video: { url: video }, gifPlayback: true, caption: captionReturn, mentions: [presser, proposer] },
      { quoted: m }
    )
  } catch (e) {
    console.error(e)
  }
}

handler.help = ['kiss']
handler.tags = ['anime']
handler.command = ['kiss', 'besar']
handler.group = true

export default handler