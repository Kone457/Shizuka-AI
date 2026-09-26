let WAMessageStubType = (await import('@whiskeysockets/baileys')).default
import { getBotConfig } from '../lib/botconfig.js'

const lidCache = new Map()
let handler = m => m

const cleanJid = value => {
    if (!value) return null
    if (typeof value === 'object') {
        value = value.id || value.jid || value.phoneNumber || value.lid || value.participant || value.userJid || ''
    }
    if (typeof value !== 'string') value = String(value)
    if (!value) return null
    return value.split(':')[0]
}

const getNumber = value => {
    const jid = cleanJid(value)
    if (!jid) return ''
    return jid.split('@')[0].replace(/\D/g, '')
}

const isLid = value => {
    const jid = cleanJid(value)
    return !!jid && jid.endsWith('@lid')
}

const normalizeJid = value => {
    const jid = cleanJid(value)
    if (!jid) return null
    if (jid.endsWith('@s.whatsapp.net') || jid.endsWith('@lid') || jid.endsWith('@g.us')) return jid
    const number = jid.replace(/\D/g, '')
    return number ? `${number}@s.whatsapp.net` : jid
}

const extractStubJid = value => {
    if (!value) return null
    if (typeof value === 'string') return cleanJid(value)
    if (typeof value === 'object') {
        const possible = [
            value.id,
            value.jid,
            value.phoneNumber,
            value.lid,
            value.participant,
            value.userJid
        ]
        for (const item of possible) {
            const jid = cleanJid(item)
            if (jid) return jid
        }
    }
    return null
}

const findParticipantByAnyId = (participants, target) => {
    const targetJid = cleanJid(target)
    const targetNumber = getNumber(target)
    if (!targetJid && !targetNumber) return null
    for (const participant of participants || []) {
        const ids = [
            participant?.id,
            participant?.jid,
            participant?.lid,
            participant?.phoneNumber,
            participant?.userJid
        ]
        for (const id of ids) {
            const jid = cleanJid(id)
            if (!jid) continue
            if (targetJid && jid === targetJid) return participant
            const number = getNumber(jid)
            if (targetNumber && number && number === targetNumber) return participant
        }
    }
    return null
}

handler.before = async function (m, { conn }) {
    if (!m.messageStubType || !m.isGroup) return
    const chat = globalThis.db?.data?.chats?.[m.chat]
    if (!chat) return
    if (m.messageStubType !== 29 && m.messageStubType !== 30) return

    const rawUser = m.messageStubParameters?.[0]
    if (!rawUser) return

    let affectedJid = extractStubJid(rawUser)
    if (!affectedJid) return

    let metadata
    try {
        metadata = await conn.groupMetadata(m.chat)
    } catch {
        metadata = null
    }

    const participants = metadata?.participants || []

    if (isLid(affectedJid)) {
        const resolved = await resolveLidToRealJid(affectedJid, conn, m.chat, metadata)
        if (resolved) affectedJid = resolved
    }

    const participant = findParticipantByAnyId(participants, affectedJid)

    if (participant) {
        const participantJid = cleanJid(
            participant.jid ||
            participant.id ||
            participant.phoneNumber
        )
        if (participantJid && !isLid(participantJid)) {
            affectedJid = participantJid
        } else {
            const resolved = await resolveLidToRealJid(
                cleanJid(participant.lid || participant.id || affectedJid),
                conn,
                m.chat,
                metadata
            )
            if (resolved && !isLid(resolved)) affectedJid = resolved
        }
    }

    affectedJid = normalizeJid(affectedJid)
    if (!affectedJid) return

    let realSender = cleanJid(m?.sender)

    if (realSender && isLid(realSender)) {
        const resolvedSender = await resolveLidToRealJid(
            realSender,
            conn,
            m.chat,
            metadata
        )
        if (resolvedSender) realSender = resolvedSender
    }

    realSender = normalizeJid(realSender)

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
🔒 𝐏ＥＲ𝐌𝐈𝐒𝐎𝐒 𝐑𝐄𝐕𝐎𝐂Ａ𝐃Ｏ𝐒 🔒
╚═══❖•°•°•°❖•°•°•°❖═══╝
`.trim()

    if (chat.alerts && m.messageStubType === 29) {
        await conn.sendMessage(
            m.chat,
            {
                image: { url: getBotConfig(conn, 'banner') },
                caption: admingp,
                ...context
            },
            { quoted: null }
        )
        return
    }

    if (chat.alerts && m.messageStubType === 30) {
        await conn.sendMessage(
            m.chat,
            {
                image: { url: getBotConfig(conn, 'banner') },
                caption: noadmingp,
                ...context
            },
            { quoted: null }
        )
        return
    }
}

export default handler

async function resolveLidToRealJid(lid, conn, groupChatId, metadata = null) {
    const inputJid = cleanJid(lid)
    if (!inputJid) return null

    if (!inputJid.endsWith('@lid')) {
        return normalizeJid(inputJid)
    }

    if (lidCache.has(inputJid)) {
        return lidCache.get(inputJid)
    }

    const lidNumber = getNumber(inputJid)
    if (!lidNumber) return inputJid

    try {
        const groupMetadata = metadata || await conn.groupMetadata(groupChatId)
        const participants = groupMetadata?.participants || []

        for (const participant of participants) {
            const ids = [
                participant?.id,
                participant?.jid,
                participant?.lid,
                participant?.phoneNumber
            ]

            for (const id of ids) {
                const jid = cleanJid(id)
                if (!jid) continue

                if (jid.endsWith('@lid') && getNumber(jid) === lidNumber) {
                    const phone = cleanJid(
                        participant?.jid ||
                        participant?.phoneNumber ||
                        participant?.id
                    )

                    if (phone && !phone.endsWith('@lid')) {
                        lidCache.set(inputJid, phone)
                        return phone
                    }
                }
            }

            try {
                const participantJid = cleanJid(
                    participant?.jid ||
                    participant?.id ||
                    participant?.phoneNumber
                )

                if (!participantJid || participantJid.endsWith('@lid')) continue

                const contact = await conn.onWhatsApp(participantJid)

                if (contact?.length) {
                    for (const data of contact) {
                        const contactLid = cleanJid(data?.lid)

                        if (
                            contactLid &&
                            contactLid.endsWith('@lid') &&
                            getNumber(contactLid) === lidNumber
                        ) {
                            lidCache.set(inputJid, participantJid)
                            return participantJid
                        }
                    }
                }
            } catch {}
        }
    } catch {}

    return inputJid
}