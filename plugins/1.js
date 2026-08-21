import { generateWAMessageFromContent } from '@whiskeysockets/baileys'

const handler = async (m, { conn }) => {
  const id =
    m.buttonId ||
    m.message?.buttonsResponseMessage?.selectedButtonId ||
    m.message?.listResponseMessage?.singleSelectReply?.selectedRowId

  if (id) {
    await conn.sendMessage(m.chat, { text: '✅ Éxito' }, { quoted: m })
    return
  }

  const message = {
    text: 'Pulsa un botón criatura.',
    buttons: [
      { buttonId: 'btn_infiel', buttonText: { displayText: '🔵 Infiel' }, type: 1 },
      { buttonId: 'btn_sexo', buttonText: { displayText: '🟢 Sexo?' }, type: 1 },
      { buttonId: 'btn_gusto', buttonText: { displayText: '🔴 Te gustó' }, type: 1 }
    ],
    headerType: 1
  }

  await conn.sendMessage(m.chat, message, { quoted: m })
}

handler.before = async (m, { conn }) => {
  const id =
    m.buttonId ||
    m.message?.buttonsResponseMessage?.selectedButtonId ||
    m.message?.listResponseMessage?.singleSelectReply?.selectedRowId
  if (!id) return
  await conn.sendMessage(m.chat, { text: '✅ Éxito' }, { quoted: m })
  return true
}

handler.command = ['1']
handler.tags = ['tools']
export default handler