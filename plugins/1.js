import { generateWAMessageFromContent } from '@whiskeysockets/baileys'

const handler = async (m, { conn }) => {
    const faseId =
        m.buttonId ||
        m.message?.buttonsResponseMessage?.selectedButtonId ||
        m.message?.listResponseMessage?.singleSelectReply?.selectedRowId

    if (faseId) {
        await conn.sendMessage(m.chat, { text: `✅ Éxito` })
        return
    }

    const buttons = [
        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🔵 Infiel', id: 'btn_azul' }) },
        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🟢 Sexo?', id: 'btn_verde' }) },
        { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🔴 Te gustó', id: 'btn_rojo' }) }
    ]

    const messageContent = {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    header: { title: '🎛️ Elije', hasMediaAttachment: false },
                    body: { text: 'Pulsa un botón para probar la respuesta.' },
                    footer: { text: 'Pervertidos' },
                    nativeFlowMessage: { buttons },
                    contextInfo: { mentionedJid: [m.sender] }
                }
            }
        }
    }

    const msg = generateWAMessageFromContent(m.chat, messageContent, { userJid: conn.user.id })
    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
}

handler.command = ['tes']
handler.tags = ['tools']
export default handler