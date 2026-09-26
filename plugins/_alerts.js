let WAMessageStubType = (await import('@whiskeysockets/baileys')).default
import { getBotConfig } from '../lib/botconfig.js'

const lidCache = new Map()
let handler = m => m

const cleanJid = value => {
    if (!value) return null
    if (typeof value === 'object') {
        value = value.id || value.jid || value.phoneNumber || value.lid || value.participant || ''
    }
    if (typeof value !== 'string') value = String(value)
    return value ? value.split(':')[0] : null
}

const getNumber = value => {
    const jid = cleanJid(value)
    if (!jid) return ''
    return jid.split('@')[0].replace(/\D/g, '')
}

const resolveStubUser = async (value, conn, groupChatId) => {
    let jid = cleanJid(value)
    if (!jid) return null
    if (!jid.endsWith('@lid')) return jid
    if (lidCache.has(jid)) return lidCache.get(jid)
    try {
        const metadata = await conn.groupMetadata(groupChatId)
        for (const participant of metadata?.participants || []) {
            const ids = [
                participant?.id,
                participant?.jid,
                participant?.lid,
                participant?.phoneNumber
            ]
            for (const id of ids) {
                const testJid = cleanJid(id)
                if (!testJid || !testJid.endsWith('@lid')) continue
                if (getNumber(testJid) !== getNumber(jid)) continue
                const realJid = cleanJid(
                    participant?.jid ||
                    participant?.phoneNumber ||
                    participant?.id
                )
                if (realJid && !realJid.endsWith('@lid')) {
                    lidCache.set(jid, realJid)
                    return realJid
                }
            }
            try {
                const participantJid = cleanJid(
                    participant?.jid ||
                    participant?.phoneNumber ||
                    participant?.id
                )
                if (!participantJid || participantJid.endsWith('@lid')) continue
                const info = await conn.onWhatsApp(participantJid)
                if (info?.[0]?.lid && getNumber(info[0].lid) === getNumber(jid)) {
                    lidCache.set(jid, participantJid)
                    return participantJid
                }
            } catch {}
        }
    } catch {}
    return jid
}

handler.before = async function (m, { conn }) {
    if (!m.messageStubType || !m.isGroup) return

    const chat = globalThis.db?.data?.chats?.[m.chat]
    if (!chat) return

    const stubType = Number(m.messageStubType)

    if (stubType !== 29 && stubType !== 30) return

    const rawUser = m.messageStubParameters?.[0]
    if (!rawUser) return

    let affectedJid = cleanJid(rawUser)
    if (!affectedJid) return

    affectedJid = await resolveStubUser(affectedJid, conn, m.chat)

    let realSender = cleanJid(m.sender)

    if (realSender?.endsWith('@lid')) {
        realSender = await resolveStubUser(realSender, conn, m.chat)
    }

    const affectedNumber = getNumber(affectedJid)
    const senderNumber = getNumber(realSender)

    if (!affectedNumber) return

    const userTag = `@${affectedNumber}`
    const adminTag = senderNumber ? `@${senderNumber}` : 'Sistema'

    const mentions = []
    if (affectedJid) mentions.push(affectedJid)
    if (realSender && !mentions.includes(realSender)) mentions.push(realSender)

    const context = {
        contextInfo: {
            mentionedJid: mentions,
            isForwarded: true
        }
    }

    const admingp = `
╔═══❖•°•°•°❖•°•°•°❖═══╗
👑 𝐍𝐔𝐄𝐕𝐎 𝐀𝐃𝐌𝐈𝐍 👑
╚═══❖•°•°•°❖•°•°•°❖═══╝

✨ ${userTag}
ahora es ADMINISTRADOR

📌 Acción realizada por:
${adminTag}

╔═══❖•°•°•°❖•°•°•°❖═══╗
⚡ 𝐏𝐎𝐃𝐄𝐑 𝐎𝐓𝐎𝐑𝐆𝐀𝐃Ｏ ⚡
╚═══❖•°•°•°❖•°•°•°❖═══╝
`.trim()

    const noadmingp = `
╔═══❖•°•°•°❖•°•°•°❖═══╗
⚠️ 𝐀𝐃𝐌𝐈𝐍 𝐑𝐄𝐌𝐎𝐕𝐈𝐃𝐎 ⚠️
╚═══❖•°•°•°❖•°•°•°❖═══╝

❌ ${userTag}
ya no es administrador

📌 Acción realizada por:
${adminTag}

╔═══❖•°•°•°❖•°•°•°❖═══╗
🔒 𝐏ＥＲＭＩ𝐒𝐎𝐒 𝐑𝐄𝐕𝐎𝐂Ａ𝐃Ｏ𝐒 🔒
╚═══❖•°•°•°❖•°•°•°❖═══╝
`.trim()

    if (chat.alerts && stubType === 29) {
        await conn.sendMessage(m.chat, {
            image: { url: getBotConfig(conn, 'banner') },
            caption: admingp,
            ...context
        }, { quoted: null })
        return
    }

    if (chat.alerts && stubType === 30) {
        await conn.sendMessage(m.chat, {
            image: { url: getBotConfig(conn, 'banner') },
            caption: noadmingp,
            ...context
        }, { quoted: null })
        return
    }
}

export default handler