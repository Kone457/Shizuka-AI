import ws from 'ws'
const cleanJid = value => {
    if (!value) return null
    if (typeof value === 'object') value = value.id || value.jid || value.phoneNumber || value.lid || ''
    if (typeof value !== 'string') value = String(value)
    if (!value) return null
    return value.split(':')[0]
}
const jidNumber = value => {
    const jid = cleanJid(value)
    if (!jid) return ''
    return jid.split('@')[0].replace(/\D/g, '')
}
const isOpen = bot => {
    try {
        return !!(
            bot?.user &&
            bot?.ws?.socket &&
            bot.ws.socket.readyState === ws.OPEN
        )
    } catch {
        return false
    }
}
const sameJid = (a, b) => {
    const ja = cleanJid(a)
    const jb = cleanJid(b)
    if (!ja || !jb) return false
    if (ja === jb) return true
    const na = jidNumber(ja)
    const nb = jidNumber(jb)
    return !!na && !!nb && na === nb
}
const getBotIdentifiers = bot => {
    const ids = new Set()
    const user = bot?.user || {}
    const values = [
        user.jid,
        user.id,
        user.lid,
        user.phoneNumber,
        user?.lid?.id,
        user?.jid?.id,
        bot?.user?.lid,
        bot?.user?.jid
    ]
    for (const value of values) {
        const jid = cleanJid(value)
        if (jid) ids.add(jid)
        const num = jidNumber(value)
        if (num) ids.add(num)
    }
    return [...ids]
}
const botMatches = (bot, target) => {
    if (!bot?.user || !target) return false
    const targetJid = cleanJid(target)
    const targetNum = jidNumber(target)
    const identifiers = getBotIdentifiers(bot)
    for (const id of identifiers) {
        if (id === targetJid) return true
        if (targetNum && id.replace(/\D/g, '') === targetNum) return true
    }
    return sameJid(bot.user.jid, targetJid) || sameJid(bot.user.id, targetJid)
}
const getMentionTarget = m => {
    if (Array.isArray(m?.mentionedJid) && m.mentionedJid.length) {
        const first = m.mentionedJid[0]
        return cleanJid(first)
    }
    if (m?.quoted?.sender) {
        return cleanJid(m.quoted.sender)
    }
    return null
}
let handler = async (m, { conn, args }) => {
    try {
        if (!global.conns || !Array.isArray(global.conns)) {
            global.conns = []
        }
        const bots = []
        const seen = new Set()
        for (const bot of global.conns) {
            if (!isOpen(bot)) continue
            const jid = cleanJid(bot.user?.jid || bot.user?.id)
            if (!jid) continue
            const key = jidNumber(jid) || jid
            if (seen.has(key)) continue
            seen.add(key)
            bots.push(bot)
        }
        const mainBot = conn
        if (isOpen(mainBot)) {
            const mainJid = cleanJid(mainBot.user?.jid || mainBot.user?.id)
            const exists = bots.some(bot => sameJid(bot.user?.jid, mainJid))
            if (!exists && mainJid) bots.push(mainBot)
        }
        if (!bots.length) {
            return conn.reply(
                m.chat,
                '《✧》 No hay bots conectados actualmente.',
                m
            )
        }
        let target = getMentionTarget(m)
        if (!target && args?.[0]) {
            const raw = String(args[0]).trim()
            if (raw.includes('@')) {
                target = cleanJid(raw)
            } else {
                const number = raw.replace(/\D/g, '')
                if (number) target = `${number}@s.whatsapp.net`
            }
        }
        if (!target) {
            return conn.reply(
                m.chat,
                '《✧》 Menciona al bot o responde a su mensaje.\n\nEjemplo:\n#setprimary @Bot',
                m
            )
        }
        let selectedBot = bots.find(bot => botMatches(bot, target))
        if (!selectedBot) {
            const targetNumber = jidNumber(target)
            const targetName = String(
                m?.quoted?.pushName ||
                m?.quoted?.name ||
                ''
            ).trim().toLowerCase()
            if (targetName) {
                selectedBot = bots.find(bot => {
                    const name = String(
                        bot?.user?.name ||
                        bot?.user?.verifiedName ||
                        bot?.user?.notify ||
                        ''
                    ).trim().toLowerCase()
                    return name && name === targetName
                })
            }
            if (!selectedBot && targetNumber) {
                selectedBot = bots.find(bot => {
                    return getBotIdentifiers(bot).some(id => {
                        const n = String(id).replace(/\D/g, '')
                        return n && n === targetNumber
                    })
                })
            }
        }
        if (!selectedBot) {
            const shown = jidNumber(target) || cleanJid(target)?.split('@')[0] || 'usuario'
            return conn.reply(
                m.chat,
                `《✧》 @${shown} no es un bot conectado en esta sesión.\n\nVerifica los bots conectados usando *#bots*.`,
                m,
                {
                    mentions: [`${shown}@s.whatsapp.net`]
                }
            )
        }
        const selectedJid = cleanJid(
            selectedBot.user?.jid ||
            selectedBot.user?.id ||
            selectedBot.user?.phoneNumber
        )
        if (!selectedJid) {
            return conn.reply(
                m.chat,
                '《✧》 No se pudo obtener el identificador del bot seleccionado.',
                m
            )
        }
        let chat = global.db?.data?.chats?.[m.chat]
        if (!chat) {
            global.db.data.chats[m.chat] = {}
            chat = global.db.data.chats[m.chat]
        }
        const currentPrimary = cleanJid(chat.primaryBot)
        if (currentPrimary && sameJid(currentPrimary, selectedJid)) {
            const num = jidNumber(selectedJid)
            return conn.reply(
                m.chat,
                `《✧》 @${num || selectedJid.split('@')[0]} ya es el bot primario en este grupo.`,
                m,
                {
                    mentions: [selectedJid]
                }
            )
        }
        chat.primaryBot = selectedJid
        if (typeof global.db.write === 'function') {
            try {
                await global.db.write()
            } catch {}
        } else if (typeof global.db.save === 'function') {
            try {
                global.db.save()
            } catch {}
        }
        const botName =
            selectedBot.user?.name ||
            selectedBot.user?.verifiedName ||
            selectedBot.user?.notify ||
            jidNumber(selectedJid) ||
            selectedJid.split('@')[0]
        return await conn.sendMessage(
            m.chat,
            {
                text: `《✧》 El bot *${botName}* ha sido establecido como primario en este grupo.\n\n> Los demás bots no responderán aquí.`,
                mentions: [selectedJid]
            },
            {
                quoted: m
            }
        )
    } catch (error) {
        console.error('❏ Error en .setprimary:', error)
        return m.reply(
            '❏ Ocurrió un error al establecer el bot primario. Inténtalo nuevamente.'
        )
    }
}
handler.help = ['setprimary <@tag>']
handler.tags = ['jadibot']
handler.command = ['setprimary']
handler.group = true
handler.admin = true
export default handler