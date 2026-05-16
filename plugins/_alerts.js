let WAMessageStubType = (await import('@whiskeysockets/baileys')).default
import fs from 'fs'
import path from 'path'

const lidCache = new Map()
let handler = m => m

handler.before = async function (m, { conn }) {
    if (!m.messageStubType || !m.isGroup) return

    let chat = globalThis.db.data.chats[m.chat]
    let userss = m.messageStubParameters?.[0]
    if (!userss) return

    const realSenderRaw = await resolveLidToRealJid(m?.sender, conn, m?.chat)
    const realSender = realSenderRaw?.includes('@') ? realSenderRaw : null

    const userTag = `@${userss.split('@')[0]}`
    const adminTag = realSender ? `@${realSender.split('@')[0]}` : 'Sistema'

    const mentions = [userss]
    if (realSender) mentions.push(realSender)

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
🔒 𝐏ＥＲＭＩＳＯＳ 𝐑𝐄𝐕𝐎𝐂ＡＤ𝐎Ｓ 🔒
╚═══❖•°•°•°❖•°•°•°❖═══╝
`.trim()

    if (chat.detect && m.messageStubType == 2) {
        const uniqid = (m.isGroup ? m.chat : m.sender).split('@')[0]
        const sessionPath = `./sessions/` 
        for (const file of await fs.readdir(sessionPath)) {
            if (file.includes(uniqid)) {
                await fs.unlink(path.join(sessionPath, file))
            }
        }
    }

    if (chat.alerts && m.messageStubType == 29) {
        await conn.sendMessage(m.chat, {
            image: { url: `${banner}` },
            caption: admingp,
            ...context
        }, { quoted: null })
        return
    }

    if (chat.alerts && m.messageStubType == 30) {
        await conn.sendMessage(m.chat, {
            image: { url: `${banner}` },
            caption: noadmingp,
            ...context
        }, { quoted: null })
        return
    }

    if (m.messageStubType == 2) return
}

export default handler

async function resolveLidToRealJid(lid, conn, groupChatId, maxRetries = 3, retryDelay = 60000) {
    const inputJid = lid?.toString?.() || ''
    if (!inputJid.endsWith("@lid") || !groupChatId?.endsWith("@g.us")) {
        return inputJid.includes("@") ? inputJid : `${inputJid}@s.whatsapp.net`
    }

    if (lidCache.has(inputJid)) {
        return lidCache.get(inputJid)
    }

    const lidToFind = inputJid.split("@")[0]
    let attempts = 0

    while (attempts < maxRetries) {
        try {
            const metadata = await conn?.groupMetadata(groupChatId)
            if (!metadata?.participants) throw new Error()

            for (const participant of metadata.participants) {
                try {
                    if (!participant?.jid) continue
                    const contactDetails = await conn?.onWhatsApp(participant.jid)
                    if (!contactDetails?.[0]?.lid) continue

                    const possibleLid = contactDetails[0].lid.split("@")[0]
                    if (possibleLid === lidToFind) {
                        lidCache.set(inputJid, participant.jid)
                        return participant.jid
                    }
                } catch {}
            }
            lidCache.set(inputJid, inputJid)
            return inputJid
        } catch {
            if (++attempts >= maxRetries) {
                lidCache.set(inputJid, inputJid)
                return inputJid
            }
            await new Promise(r => setTimeout(r, retryDelay))
        }
    }
    return inputJid
}
