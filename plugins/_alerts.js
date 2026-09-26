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

const parseStubParameter = value => {
    if (!value) return null
    if (typeof value === 'object') return value
    if (typeof value !== 'string') return value
    const text = value.trim()
    if (!text) return null
    try {
        if (text.startsWith('{') && text.endsWith('}')) {
            return JSON.parse(text)
        }
    } catch {}
    return text
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

const resolveLid = async (jid, conn, groupId) => {
    jid = cleanJid(jid)
    if (!jid || !isLid(jid)) return jid
    if (lidCache.has(jid)) return lidCache.get(jid)

    try {
        const mapping = conn?.signalRepository?.lidMapping

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
                    let result = await mapping[method](jid)
                    if (!result) result = await mapping[method](jid.split('@')[0])
                    const real = cleanJid(result)
                    if (real && real.endsWith('@s.whatsapp.net')) {
                        lidCache.set(jid, real)
                        return real
                    }
                } catch {}
            }
        }
    } catch {}

    try {
        const metadata = await conn.groupMetadata(groupId)
        const participants = metadata?.participants || []

        for (const participant of participants) {
            const participantLid = cleanJid(
                participant?.lid ||
                participant?.id
            )

            if (participantLid !== jid) continue

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

        for (const participant of participants) {
            const real = cleanJid(
                participant?.jid ||
                participant?.phoneNumber ||
                participant?.pn
            )

            if (!real || !real.endsWith('@s.whatsapp.net')) continue

            try {
                const result = await conn.onWhatsApp(real)

                for (const contact of result || []) {
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

const resolveUser = async (data, conn, groupId) => {
    const parsed = parseStubParameter(data)

    if (!parsed) return null

    if (typeof parsed === 'object') {
        const phone = cleanJid(
            parsed.phoneNumber ||
            parsed.pn
        )

        if (phone && phone.endsWith('@s.whatsapp.net')) {
            return phone
        }

        const id = cleanJid(
            parsed.id ||
            parsed.jid ||
            parsed.lid ||
            parsed.participant ||
            parsed.userJid
        )

        if (!id) return null

        if (isLid(id)) {
            return await resolveLid(id, conn, groupId)
        }

        return id
    }

    const jid = cleanJid(parsed)

    if (!jid) return null

    if (isLid(jid)) {
        return await resolveLid(jid, conn, groupId)
    }

    return jid
}

handler.before = async function (m, { conn }) {
    if (!m?.messageStubType || !m?.isGroup) return

    const type = Number(m.messageStubType)

    if (type !== 29 && type !== 30) return

    const chat = globalThis.db?.data?.chats?.[m.chat]

    if (!chat?.alerts) return

    const rawParameter = m.messageStubParameters?.[0]

    if (!rawParameter) return

    let affectedJid = await resolveUser(
        rawParameter,
        conn,
        m.chat
    )

    if (!affectedJid) return

    let senderJid = cleanJid(m.sender)

    if (senderJid && isLid(senderJid)) {
        senderJid = await resolveLid(
            senderJid,
            conn,
            m.chat
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

    if (affectedJid) {
        mentions.push(affectedJid)
    }

    if (senderJid && !mentions.includes(senderJid)) {
        mentions.push(senderJid)
    }

    const contextInfo = {
        mentionedJid: mentions,
        isForwarded: true
    }

    let text

    if (type === 29) {
        text = `
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
    } else {
        text = `
╔═══❖•°•°•°❖•°•°•°❖═══╗
⚠️ 𝐀𝐃𝐌𝐈𝐍 𝐑𝐄𝐌𝐎𝐕𝐈𝐃𝐎 ⚠️
╚═══❖•°•°•°❖•°•°•°❖═══╝

❌ ${userTag}
ya no es administrador

📌 Acción realizada por:
${adminTag}

╔═══❖•°•°•°❖•°•°•°❖═══╗
🔒 𝐏ＥＲＭ𝐈𝐒Ｏ𝐒 𝐑𝐄𝐕𝐎𝐂Ａ𝐃Ｏ𝐒 🔒
╚═══❖•°•°•°❖•°•°•°❖═══╝
`.trim()
    }

    try {
        const banner = getBotConfig(conn, 'banner')

        if (banner) {
            try {
                await conn.sendMessage(
                    m.chat,
                    {
                        image: { url: banner },
                        caption: text,
                        contextInfo
                    },
                    { quoted: null }
                )
                return
            } catch (error) {
                console.error('❏ Error enviando imagen de alerta:', error)
            }
        }

        await conn.sendMessage(
            m.chat,
            {
                text,
                contextInfo
            },
            { quoted: null }
        )
    } catch (error) {
        console.error('❏ Error enviando alerta de administrador:', error)
    }
}

export default handler
