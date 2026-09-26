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

const resolveLid = async (jid, conn, groupId) => {
    jid = cleanJid(jid)
    if (!jid) return null
    if (!jid.endsWith('@lid')) return jid
    if (lidCache.has(jid)) return lidCache.get(jid)

    try {
        const mapping = conn?.signalRepository?.lidMapping

        if (mapping) {
            try {
                if (typeof mapping.getPNForLID === 'function') {
                    const result = await mapping.getPNForLID(jid)
                    const real = cleanJid(result)
                    if (real && real.endsWith('@s.whatsapp.net')) {
                        lidCache.set(jid, real)
                        return real
                    }
                }
            } catch {}

            try {
                if (typeof mapping.getPNForLID === 'function') {
                    const result = await mapping.getPNForLID(jid.split('@')[0])
                    const real = cleanJid(result)
                    if (real && real.endsWith('@s.whatsapp.net')) {
                        lidCache.set(jid, real)
                        return real
                    }
                }
            } catch {}
        }

        const metadata = await conn.groupMetadata(groupId)
        const participants = metadata?.participants || []

        for (const participant of participants) {
            const ids = [
                participant?.id,
                participant?.lid,
                participant?.userJid
            ]

            for (const id of ids) {
                const test = cleanJid(id)
                if (!test || test !== jid) continue

                const real = cleanJid(
                    participant?.jid ||
                    participant?.phoneNumber ||
                    participant?.pn
                )

                if (real && real.endsWith('@s.whatsapp.net')) {
                    lidCache.set(jid, real)
                    return real
                }
            }
        }

        for (const participant of participants) {
            const real = cleanJid(
                participant?.jid ||
                participant?.phoneNumber ||
                participant?.pn
            )

            if (!real || !real.endsWith('@s.whatsapp.net')) continue

            try {
                const info = await conn.onWhatsApp(real)

                for (const contact of info || []) {
                    const contactLid = cleanJid(contact?.lid)

                    if (contactLid === jid) {
                        lidCache.set(jid, real)
                        return real
                    }
                }
            } catch {}
        }
    } catch {}

    return jid
}

const getAffectedJid = value => {
    if (!value) return null

    if (typeof value === 'string') {
        return cleanJid(value)
    }

    if (typeof value === 'object') {
        return cleanJid(
            value.id ||
            value.jid ||
            value.phoneNumber ||
            value.lid ||
            value.participant ||
            value.userJid
        )
    }

    return null
}

handler.before = async function (m, { conn }) {
    if (!m?.messageStubType || !m?.isGroup) return

    const type = Number(m.messageStubType)

    if (type !== 29 && type !== 30) return

    const chat = globalThis.db?.data?.chats?.[m.chat]

    if (!chat) return
    if (!chat.alerts) return

    const rawUser = m.messageStubParameters?.[0]

    if (!rawUser) return

    let affectedJid = getAffectedJid(rawUser)

    if (!affectedJid) return

    if (affectedJid.endsWith('@lid')) {
        const resolved = await resolveLid(affectedJid, conn, m.chat)
        if (resolved) affectedJid = resolved
    }

    let senderJid = cleanJid(m.sender)

    if (senderJid?.endsWith('@lid')) {
        const resolvedSender = await resolveLid(senderJid, conn, m.chat)
        if (resolvedSender) senderJid = resolvedSender
    }

    const affectedNumber = getNumber(affectedJid)
    const senderNumber = getNumber(senderJid)

    if (!affectedNumber) return

    const userTag = `@${affectedNumber}`
    const adminTag = senderNumber ? `@${senderNumber}` : 'Sistema'

    const mentions = []

    if (affectedJid) mentions.push(affectedJid)

    if (senderJid && !mentions.includes(senderJid)) {
        mentions.push(senderJid)
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
🔒 𝐏ＥＲＭＩ𝐒𝐎𝐒 𝐑𝐄𝐕𝐎𝐂ＡＤＯＳ 🔒
╚═══❖•°•°•°❖•°•°•°❖═══╝
`.trim()

    const text = type === 29 ? admingp : noadmingp

    try {
        const banner = getBotConfig(conn, 'banner')

        await conn.sendMessage(m.chat, {
            image: { url: banner },
            caption: text,
            contextInfo: {
                mentionedJid: mentions,
                isForwarded: true
            }
        }, { quoted: null })
    } catch (error) {
        console.error('❏ Error enviando alerta de admin:', error)

        try {
            await conn.sendMessage(m.chat, {
                text,
                contextInfo: {
                    mentionedJid: mentions,
                    isForwarded: true
                }
            }, { quoted: null })
        } catch (error2) {
            console.error('❏ Error enviando alerta de admin en texto:', error2)
        }
    }
}

export default handler

