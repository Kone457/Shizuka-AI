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

const isLidJid = value => {
    const jid = cleanJid(value)
    return !!jid && jid.endsWith('@lid')
}

const isPnJid = value => {
    const jid = cleanJid(value)
    return !!jid && jid.endsWith('@s.whatsapp.net')
}

const normalizeJid = value => {
    const jid = cleanJid(value)
    if (!jid) return null
    if (jid.endsWith('@s.whatsapp.net')) return jid
    if (jid.endsWith('@lid')) return jid
    if (jid.endsWith('@g.us')) return jid
    const number = jid.replace(/\D/g, '')
    return number ? `${number}@s.whatsapp.net` : jid
}

const getMapping = conn => {
    try {
        return conn?.signalRepository?.lidMapping || conn?.signalRepository?.lidMappingStore || null
    } catch {
        return null
    }
}

const resolveWithLidMapping = async (jid, conn) => {
    jid = cleanJid(jid)
    if (!jid || !isLidJid(jid)) return jid

    if (lidCache.has(jid)) return lidCache.get(jid)

    const mapping = getMapping(conn)

    if (mapping) {
        const methods = [
            'getPNForLID',
            'getPnForLid',
            'getPhoneNumberForLID',
            'getPhoneNumberForLid'
        ]

        for (const method of methods) {
            try {
                if (typeof mapping[method] !== 'function') continue
                const result = await mapping[method](jid)
                const resolved = cleanJid(result)
                if (resolved && isPnJid(resolved)) {
                    lidCache.set(jid, resolved)
                    return resolved
                }
            } catch {}
        }

        try {
            const result = await mapping.get(jid)
            const resolved = cleanJid(result)
            if (resolved && isPnJid(resolved)) {
                lidCache.set(jid, resolved)
                return resolved
            }
        } catch {}

        try {
            const result = await mapping.getPNForLID(jid.split('@')[0])
            const resolved = cleanJid(result)
            if (resolved && isPnJid(resolved)) {
                lidCache.set(jid, resolved)
                return resolved
            }
        } catch {}
    }

    return jid
}

const resolveParticipantJid = participant => {
    if (!participant) return null

    const values = [
        participant?.jid,
        participant?.phoneNumber,
        participant?.pn,
        participant?.userJid,
        participant?.id
    ]

    for (const value of values) {
        const jid = cleanJid(value)
        if (jid && isPnJid(jid)) return jid
    }

    return null
}

const resolveLidFromParticipants = async (lid, conn, groupChatId, metadata = null) => {
    const inputJid = cleanJid(lid)
    if (!inputJid) return null
    if (!isLidJid(inputJid)) return inputJid

    if (lidCache.has(inputJid)) return lidCache.get(inputJid)

    const mapped = await resolveWithLidMapping(inputJid, conn)

    if (mapped && isPnJid(mapped)) {
        lidCache.set(inputJid, mapped)
        return mapped
    }

    try {
        const groupMetadata = metadata || await conn.groupMetadata(groupChatId)
        const participants = groupMetadata?.participants || []

        for (const participant of participants) {
            const ids = [
                participant?.id,
                participant?.lid,
                participant?.userJid
            ]

            for (const id of ids) {
                const testJid = cleanJid(id)

                if (!testJid || !isLidJid(testJid)) continue

                if (testJid === inputJid) {
                    const realJid = resolveParticipantJid(participant)

                    if (realJid) {
                        lidCache.set(inputJid, realJid)
                        return realJid
                    }
                }
            }
        }

        for (const participant of participants) {
            const realJid = resolveParticipantJid(participant)

            if (!realJid) continue

            try {
                const info = await conn.onWhatsApp(realJid)

                for (const contact of info || []) {
                    const contactLid = cleanJid(contact?.lid)

                    if (contactLid === inputJid) {
                        lidCache.set(inputJid, realJid)
                        return realJid
                    }
                }
            } catch {}
        }
    } catch {}

    return inputJid
}

const resolveJid = async (jid, conn, groupChatId, metadata = null) => {
    jid = cleanJid(jid)

    if (!jid) return null

    if (isLidJid(jid)) {
        return await resolveLidFromParticipants(jid, conn, groupChatId, metadata)
    }

    return normalizeJid(jid)
}

const extractAffectedUser = value => {
    if (!value) return null

    if (typeof value === 'string') {
        return cleanJid(value)
    }

    if (typeof value === 'object') {
        const values = [
            value.id,
            value.jid,
            value.phoneNumber,
            value.pn,
            value.lid,
            value.participant,
            value.userJid
        ]

        for (const item of values) {
            const jid = cleanJid(item)
            if (jid) return jid
        }
    }

    return null
}

handler.before = async function (m, { conn }) {
    if (!m?.messageStubType || !m?.isGroup) return

    const stubType = Number(m.messageStubType)

    if (stubType !== 29 && stubType !== 30) return

    const chat = globalThis.db?.data?.chats?.[m.chat]

    if (!chat?.alerts) return

    const rawUser = m.messageStubParameters?.[0]

    if (!rawUser) return

    let metadata = null

    try {
        metadata = await conn.groupMetadata(m.chat)
    } catch {}

    let affectedJid = extractAffectedUser(rawUser)

    if (!affectedJid) return

    affectedJid = await resolveJid(
        affectedJid,
        conn,
        m.chat,
        metadata
    )

    if (!affectedJid) return

    let senderJid = cleanJid(m.sender)

    if (senderJid) {
        senderJid = await resolveJid(
            senderJid,
            conn,
            m.chat,
            metadata
        )
    }

    const affectedNumber = getNumber(affectedJid)
    const senderNumber = getNumber(senderJid)

    if (!affectedNumber) return

    const userTag = `@${affectedNumber}`
    const adminTag = senderNumber
        ? `@${senderNumber}`
        : 'Sistema'

    const mentions = []

    if (isPnJid(affectedJid)) {
        mentions.push(affectedJid)
    }

    if (senderJid && isPnJid(senderJid) && !mentions.includes(senderJid)) {
        mentions.push(senderJid)
    }

    const context = {
        contextInfo: {
            mentionedJid: mentions,
            isForwarded: true
        }
    }

    if (stubType === 29) {
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

        try {
            await conn.sendMessage(
                m.chat,
                {
                    image: {
                        url: getBotConfig(conn, 'banner')
                    },
                    caption: admingp,
                    ...context
                },
                {
                    quoted: null
                }
            )
        } catch (error) {
            console.error('Error enviando alerta de nuevo admin:', error)
        }

        return
    }

    if (stubType === 30) {
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

        try {
            await conn.sendMessage(
                m.chat,
                {
                    image: {
                        url: getBotConfig(conn, 'banner')
                    },
                    caption: noadmingp,
                    ...context
                },
                {
                    quoted: null
                }
            )
        } catch (error) {
            console.error('Error enviando alerta de admin removido:', error)
        }

        return
    }
}

export default handler

