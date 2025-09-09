/*───────────────────────────────────────
  📁 Módulo:     kiss.js
  🧠 Autor:      Carlos (ajuste)
  🛠 Proyecto:   Shizuka-AI
───────────────────────────────────────*/

// lista de videos (puedes agregar/quitar urls)
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

// Mapa temporal: targetJid -> { proposer, timeout }
const kissPending = {}

/**
 * Handler principal: envía el beso y el botón.
 */
let handler = async (m, { conn }) => {
  if (!m.isGroup) return conn.reply(m.chat, 'Este comando funciona solo en grupos.', m)

  // Determinar destinatario (who)
  let who = (m.mentionedJid && m.mentionedJid.length > 0)
    ? m.mentionedJid[0]
    : (m.quoted ? m.quoted.sender : m.sender)

  const proposer = m.sender // quien inició el beso
  const nameWho = await conn.getName(who)
  const nameProposer = await conn.getName(proposer)

  const video = videos[Math.floor(Math.random() * videos.length)]

  // Mensaje dependiendo si se besa a sí mismo
  const caption = (who === proposer)
    ? `╭──〔 💞 BESO EN SOLITARIO 〕──╮\n┃ ${nameProposer} se dio un beso con cariño\n╰───────────────────────────────╯`
    : `╭──〔 💋 BESO COMPARTIDO 〕──╮\n┃ ${nameProposer} besó a ${nameWho}\n╰──────────────────────────╯`

  // Si el usuario se besa a sí mismo: no mostramos botón porque no hay a quién devolver
  if (who === proposer) {
    return await conn.sendMessage(
      m.chat,
      {
        video: { url: video },
        gifPlayback: true,
        caption,
        mentions: [proposer]
      },
      { quoted: m }
    )
  }

  // Si ya había un pending para esa persona, limpiar el timeout anterior
  if (kissPending[who]?.timeout) clearTimeout(kissPending[who].timeout)

  // Guardamos que 'who' tiene un beso pendiente para devolver a 'proposer'
  kissPending[who] = {
    proposer,
    timeout: setTimeout(() => {
      try {
        conn.sendMessage(m.chat, { text: `⏳ Se acabó el tiempo para devolver el beso a ${nameProposer}.` }, { quoted: m })
      } catch (e) {}
      delete kissPending[who]
    }, 60 * 1000) // 60 segundos para devolver
  }

  // ButtonId contiene la JID del proposer para poder identificarla después
  const buttonId = `kiss_return:${proposer}`

  const buttons = [
    { buttonId, buttonText: { displayText: "💋 Devolver beso" }, type: 1 }
  ]

  await conn.sendMessage(
    m.chat,
    {
      video: { url: video },
      gifPlayback: true,
      caption,
      mentions: [who, proposer],
      buttons
    },
    { quoted: m }
  )
}

/**
 * handler.before: intercepta cuando alguien presiona el botón
 * - Solo permite que lo presione la persona que fue besada (who).
 * - Envía un nuevo video/nota devolviendo el beso al proposer.
 */
handler.before = async (m, { conn }) => {
  try {
    if (m.isBaileys) return // omitir mensajes del propio cliente
    const selected = m.message?.buttonsResponseMessage?.selectedButtonId
    if (!selected) return

    if (!selected.startsWith('kiss_return:')) return // no es nuestro botón

    // Extraer proposer JID del buttonId
    const proposer = selected.split(':')[1]
    const presser = m.sender // quien presionó el botón -> debe ser el 'who'

    // Validar que exista un pending para el presser y que el proposer coincida
    const pending = kissPending[presser]
    if (!pending || pending.proposer !== proposer) {
      return await conn.sendMessage(m.chat, { text: '❌ Este botón no es para ti o ya expiró.' }, { quoted: m })
    }

    // OK: devolver el beso
    clearTimeout(pending.timeout)
    delete kissPending[presser]

    const video = videos[Math.floor(Math.random() * videos.length)]
    const namePresser = await conn.getName(presser)
    const nameProposer = await conn.getName(proposer)

    const captionReturn = `╭──〔 💞 BESO DEVUELTO 〕──╮\n┃ ${namePresser} le devolvió un beso a ${nameProposer}\n╰──────────────────────────╯`

    await conn.sendMessage(
      m.chat,
      {
        video: { url: video },
        gifPlayback: true,
        caption: captionReturn,
        mentions: [presser, proposer]
      },
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