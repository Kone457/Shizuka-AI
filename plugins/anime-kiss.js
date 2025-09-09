
import fs from 'fs'
import path from 'path'

// Archivo para almacenar historial de besos
const kissDBFile = path.resolve('./storage/databases/kissHistory.json')
let kissHistory = fs.existsSync(kissDBFile) ? JSON.parse(fs.readFileSync(kissDBFile)) : {}

// Videos
const videos = [
  'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745784879173.mp4',
  'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745784874988.mp4',
  'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745784869583.mp4',
  'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745784864195.mp4',
  'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745784856547.mp4',
  'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745784908581.mp4'
]

// Propuestas pendientes (quien fue besado -> { proposer })
const kissPending = {}

// Guardar historial en archivo
function saveKissHistory() {
  fs.writeFileSync(kissDBFile, JSON.stringify(kissHistory, null, 2))
}

let handler = async (m, { conn }) => {
  if (!m.isGroup) return conn.reply(m.chat, 'Este comando funciona solo en grupos.', m)

  let who = (m.mentionedJid && m.mentionedJid.length > 0)
    ? m.mentionedJid[0]
    : (m.quoted ? m.quoted.sender : m.sender)

  const proposer = m.sender
  const nameWho = await conn.getName(who)
  const nameProposer = await conn.getName(proposer)
  const video = videos[Math.floor(Math.random() * videos.length)]

  const caption = (who === proposer)
    ? `╭──〔 💞 BESO EN SOLITARIO 〕──╮\n┃ ${nameProposer} se dio un beso con cariño\n╰───────────────────────────────╯`
    : `╭──〔 💋 BESO COMPARTIDO 〕──╮\n┃ ${nameProposer} besó a ${nameWho}\n╰──────────────────────────╯`

  // Si se besa a sí mismo, enviamos solo video sin botón
  if (who === proposer) {
    return await conn.sendMessage(
      m.chat,
      { video: { url: video }, gifPlayback: true, caption, mentions: [proposer] },
      { quoted: m }
    )
  }

  // Guardar propuesta pendiente sin límite de tiempo
  kissPending[who] = { proposer }

  // Botón para devolver beso
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

    const proposer = selected.split(':')[1]
    const presser = m.sender

    const pending = kissPending[presser]
    if (!pending || pending.proposer !== proposer) {
      return await conn.sendMessage(m.chat, { text: '❌ Este botón no es para ti.' }, { quoted: m })
    }

    // Devolver beso
    delete kissPending[presser]

    const video = videos[Math.floor(Math.random() * videos.length)]
    const namePresser = await conn.getName(presser)
    const nameProposer = await conn.getName(proposer)

    // Actualizar historial
    if (!kissHistory[nameProposer]) kissHistory[nameProposer] = {}
    if (!kissHistory[nameProposer][namePresser]) kissHistory[nameProposer][namePresser] = { given: 0, returned: 0 }

    kissHistory[nameProposer][namePresser].given += 1
    kissHistory[nameProposer][namePresser].returned += 1
    saveKissHistory()

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