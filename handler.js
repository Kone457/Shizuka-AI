import { smsg } from './lib/simple.js'
import { format } from 'util'
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import fs from 'fs'
import chalk from 'chalk'
import fetch from 'node-fetch'
import ws from 'ws'

const isNumber = x => typeof x === 'number' && !isNaN(x)

const testRegex = (regex, value) => {
    if (!(regex instanceof RegExp)) return false
    regex.lastIndex = 0
    const result = regex.test(value)
    regex.lastIndex = 0
    return result
}

const escapeRegex = str =>
    String(str).replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')

const getOwnerJids = () => {
    const owners = globalThis.owner || []

    return owners.map(owner => {
        const number = Array.isArray(owner) ? owner[0] : owner
        if (!number) return null

        const clean = String(number).replace(/[^0-9]/g, '')
        return clean ? `${clean}@s.whatsapp.net` : null
    }).filter(Boolean)
}

const isOwnerNumber = (sender, conn) => {
    if (!sender) return false

    return sender === conn?.user?.jid ||
        getOwnerJids().includes(sender)
}

const getCommandMatch = (pluginPrefix, text) => {
    if (pluginPrefix instanceof RegExp) {
        pluginPrefix.lastIndex = 0
        const match = pluginPrefix.exec(text)
        pluginPrefix.lastIndex = 0
        return match ? [match, pluginPrefix] : null
    }

    if (Array.isArray(pluginPrefix)) {
        for (const prefix of pluginPrefix) {
            const regex = prefix instanceof RegExp
                ? prefix
                : new RegExp(escapeRegex(prefix), 'i')

            regex.lastIndex = 0
            const match = regex.exec(text)
            regex.lastIndex = 0

            if (match) return [match, regex]
        }

        return null
    }

    if (typeof pluginPrefix === 'string') {
        const regex = new RegExp(escapeRegex(pluginPrefix), 'i')
        const match = regex.exec(text)
        return match ? [match, regex] : null
    }

    return null
}

export async function handler(chatUpdate) {
    if (!chatUpdate?.messages?.length) return

    this.uptime ??= Date.now()
    this._activeHandlers ??= new Set()

    try {
        this.pushMessage(chatUpdate.messages).catch(() => {})
    } catch {}

    const task = processMessage.call(this, chatUpdate)

    this._activeHandlers.add(task)

    task.catch(() => {}).finally(() => {
        this._activeHandlers.delete(task)
    })
}

async function processMessage(chatUpdate) {
    let m = chatUpdate.messages[chatUpdate.messages.length - 1]

    if (!m) return

    try {
        if (globalThis.db?.data == null) {
            await globalThis.loadDatabase()
        }
    } catch {
        return
    }

    try {
        m = smsg(this, m) || m
    } catch {
        return
    }

    if (!m) return

    m.exp = 0

    try {
        globalThis.db.data.users ??= {}
        globalThis.db.data.chats ??= {}
        globalThis.db.data.settings ??= {}

        let user = globalThis.db.data.users[m.sender]

        if (!user || typeof user !== 'object') {
            user = globalThis.db.data.users[m.sender] = {
                name: m.name || '',
                chocolates: 0,
                coin: 0,
                bank: 0,
                exp: 0,
                usedcommands: 0,
                level: 0,
                streak: 0,
                lastDaily: 0,
                lastDailyGlobal: 0,
                banned: false
            }
        } else {
            if (!('name' in user)) user.name = m.name || ''
            if (!('chocolates' in user)) user.chocolates = 0
            if (!('coin' in user)) user.coin = 0
            if (!('bank' in user)) user.bank = 0
            if (!('exp' in user)) user.exp = 0
            if (!('usedcommands' in user)) user.usedcommands = 0
            if (!('level' in user)) user.level = 0
            if (!('streak' in user)) user.streak = 0
            if (!('lastDaily' in user)) user.lastDaily = 0
            if (!('lastDailyGlobal' in user)) user.lastDailyGlobal = 0
            if (!('banned' in user)) user.banned = false
        }

        let chat = globalThis.db.data.chats[m.chat]

        if (!chat || typeof chat !== 'object') {
            chat = globalThis.db.data.chats[m.chat] = {
                sWelcome: '',
                sBye: '',
                welcome: true,
                nsfw: false,
                gacha: true,
                alerts: true,
                adminonly: false,
                antilinks: true,
                antiLink: true,
                notprefix: false,
                bannedGrupo: false,
                economy: true,
                rpg: true,
                level: true,
                reaction: false,
                antiprivado: true,
                expired: 0
            }
        } else {
            if (!('sWelcome' in chat)) chat.sWelcome = ''
            if (!('sBye' in chat)) chat.sBye = ''
            if (!('welcome' in chat)) chat.welcome = true
            if (!('nsfw' in chat)) chat.nsfw = false
            if (!('gacha' in chat)) chat.gacha = true
            if (!('alerts' in chat)) chat.alerts = true
            if (!('adminonly' in chat)) chat.adminonly = false
            if (!('antilinks' in chat)) chat.antilinks = true
            if (!('antiLink' in chat)) chat.antiLink = chat.antilinks
            if (!('notprefix' in chat)) chat.notprefix = false
            if (!('bannedGrupo' in chat)) chat.bannedGrupo = false
            if (!('economy' in chat)) chat.economy = true
            if (!('rpg' in chat)) chat.rpg = chat.economy
            if (!('level' in chat)) chat.level = true
            if (!('reaction' in chat)) chat.reaction = false
            if (!('antiprivado' in chat)) chat.antiprivado = true
            if (!isNumber(chat.expired)) chat.expired = 0
        }

        const jid = this.user?.jid

        let setting = globalThis.db.data.settings[jid]

        if (!setting || typeof setting !== 'object') {
            setting = globalThis.db.data.settings[jid] = {
                self: false,
                botcommando: 0,
                config: {
                    botname: '',
                    namebot: '',
                    banner: '',
                    banner2: '',
                    icon: '',
                    currency: '',
                    wm: '',
                    packname: ''
                },
                jadibotmd: false
            }
        } else {
            if (!('self' in setting)) setting.self = false
            if (!('botcommando' in setting)) setting.botcommando = 0
            if (!('jadibotmd' in setting)) setting.jadibotmd = false
            if (!('config' in setting)) setting.config = {}

            const cfg = setting.config

            if (!('botname' in cfg)) cfg.botname = ''
            if (!('namebot' in cfg)) cfg.namebot = ''
            if (!('banner' in cfg)) cfg.banner = ''
            if (!('banner2' in cfg)) cfg.banner2 = ''
            if (!('icon' in cfg)) cfg.icon = ''
            if (!('currency' in cfg)) cfg.currency = ''
            if (!('wm' in cfg)) cfg.wm = ''
            if (!('packname' in cfg)) cfg.packname = ''
        }

    } catch {
        return
    }

    if (typeof m.text !== 'string') {
        m.text = ''
    }

    const user = globalThis.db.data.users[m.sender]
    const chat = globalThis.db.data.chats[m.chat]
    const setting = globalThis.db.data.settings[this.user.jid]
    const opts = globalThis.opts || {}

    const isOwner = isOwnerNumber(m.sender, this)
    const isMods = isOwner

    if (m.isBaileys) return


    if (user?.banned && !isOwner) {
        return
    }


    if (!m.isGroup && chat?.antiprivado !== false && !isOwner) {
        return
    }

    if (m.isGroup && chat?.primaryBot) {
        const texto = (m.text || '').trim().toLowerCase()

        const esComandoDelPrimary =
            texto.startsWith('.delprimary') ||
            texto.startsWith('#delprimary')

        if (!esComandoDelPrimary && this.user.jid !== chat.primaryBot) {
            return
        }
    }

    m.exp += Math.ceil(Math.random() * 10)

    let groupMetadata = {}

    if (m.isGroup) {
        try {
            groupMetadata = {
                ...(this.chats?.[m.chat]?.metadata ||
                    await this.groupMetadata(m.chat).catch(() => null) ||
                    {})
            }
        } catch {
            groupMetadata = {}
        }
    }

    const participants =
        (m.isGroup ? groupMetadata.participants : []) || []

    const decodeJidSafe = jid => {
        try {
            return this.decodeJid(jid)
        } catch {
            return jid
        }
    }

    const userGroup =
        (m.isGroup
            ? participants.find(u =>
                decodeJidSafe(u.jid) === m.sender
            )
            : {}) || {}

    const botGroup =
        m.isGroup
            ? participants.find(u =>
                decodeJidSafe(u.jid) === this.user.jid
            )
            : null

    const isRAdmin =
        userGroup?.admin === 'superadmin'

    const isAdmin =
        isRAdmin ||
        userGroup?.admin === 'admin'

    const isBotAdmin =
        !!botGroup?.admin

    const ___dirname = path.join(
        path.dirname(fileURLToPath(import.meta.url)),
        './plugins'
    )

    const plugins = globalThis.plugins || {}

    for (const name of Object.keys(plugins)) {
        const plugin = plugins[name]

        if (!plugin || plugin.disabled) continue

        const __filename = join(___dirname, name)

        if (typeof plugin.all === 'function') {
            try {
                await plugin.all.call(this, m, {
                    chatUpdate,
                    ___dirname,
                    __filename,
                    user,
                    chat,
                    setting
                })
            } catch {}
        }

        if (!opts?.restrict) {
            if (plugin.tags?.includes('admin')) {
                continue
            }
        }

        let pluginPrefix =
            plugin.customPrefix ||
            this.prefix ||
            globalThis.prefix

        if (chat?.notprefix && !plugin.customPrefix) {
            if (Array.isArray(pluginPrefix)) {
                pluginPrefix = pluginPrefix.map(prefix => {
                    let src =
                        prefix instanceof RegExp
                            ? prefix.source
                            : escapeRegex(prefix)

                    if (src.startsWith('^')) {
                        src = src.slice(1)
                    }

                    return new RegExp(`^(${src})?`, 'i')
                })
            } else {
                let src =
                    pluginPrefix instanceof RegExp
                        ? pluginPrefix.source
                        : escapeRegex(pluginPrefix)

                if (src.startsWith('^')) {
                    src = src.slice(1)
                }

                pluginPrefix =
                    new RegExp(`^(${src})?`, 'i')
            }
        }

        const matchData =
            getCommandMatch(pluginPrefix, m.text)

        if (typeof plugin.before === 'function') {
            try {
                const beforeResult =
                    await plugin.before.call(this, m, {
                        match: matchData,
                        conn: this,
                        participants,
                        groupMetadata,
                        isOwner,
                        isRAdmin,
                        isAdmin,
                        isBotAdmin,
                        chatUpdate,
                        ___dirname,
                        __filename,
                        user,
                        chat,
                        setting
                    })

                if (beforeResult) {
                    continue
                }
            } catch {}
        }

        if (typeof plugin !== 'function') {
            continue
        }

        if (!matchData) {
            continue
        }

        const match = matchData

        if (!match[0]) {
            continue
        }

        const usedPrefix = match[0][0] || ''

        const noPrefix =
            m.text.slice(usedPrefix.length)

        const parts =
            noPrefix.trim().split(/\s+/).filter(Boolean)

        let command =
            (parts.shift() || '').toLowerCase()

        const args = parts
        const _args = [...args]
        const text = args.join(' ')

        const isAccept =
            plugin.command instanceof RegExp
                ? testRegex(plugin.command, command)

                : Array.isArray(plugin.command)
                    ? plugin.command.some(cmd =>
                        cmd instanceof RegExp
                            ? testRegex(cmd, command)
                            : cmd === command
                    )

                    : typeof plugin.command === 'string'
                        ? plugin.command === command
                        : false

        if (!isAccept) {
            continue
        }

        if (setting.self && !isOwner) {
            continue
        }

        setting.botcommando =
            (Number(setting.botcommando) || 0) + 1

        user.usedcommands =
            (Number(user.usedcommands) || 0) + 1

        m.plugin = name
        m.command = command

        const allowedWhenOff = ['bot']

        if (
            chat?.bannedGrupo &&
            !isOwner &&
            !allowedWhenOff.includes(command)
        ) {
            continue
        }


        if (
            !m.isGroup &&
            chat?.antiprivado !== false &&
            !isOwner
        ) {
            continue
        }

        if (!m.chat?.endsWith('g.us')) {
            if (!isOwner) {
                continue
            }
        }

        const adminMode = chat?.adminonly || false

        const wa =
            plugin.botAdmin ||
            plugin.admin ||
            plugin.group ||
            command

        if (
            adminMode &&
            !isOwner &&
            m.isGroup &&
            !isAdmin &&
            wa
        ) {
            continue
        }

        const fail = plugin.fail || globalThis.dfail

        if (plugin.nsfw && !chat.nsfw && m.isGroup) {
            try {
                await fail?.('nsfw', m, this)
            } catch {}

            continue
        }

        if (plugin.gacha && !chat.gacha && m.isGroup) {
            try {
                await fail?.('gacha', m, this)
            } catch {}

            continue
        }

        if (plugin.restrict && !opts?.restrict) {
            try {
                await fail?.('restrict', m, this)
            } catch {}

            continue
        }

        if (plugin.owner && !isOwner) {
            try {
                await fail?.('owner', m, this)
            } catch {}

            continue
        }

        if (plugin.botAdmin && !isBotAdmin) {
            try {
                await fail?.('botAdmin', m, this)
            } catch {}

            continue
        }

        if (plugin.admin && !isAdmin) {
            try {
                await fail?.('admin', m, this)
            } catch {}

            continue
        }

        m.isCommand = true

        m.exp += plugin.exp
            ? parseInt(plugin.exp) || 0
            : 10

        const extra = {
            match,
            usedPrefix,
            noPrefix,
            _args,
            args,
            command,
            text,
            conn: this,
            participants,
            groupMetadata,
            user,
            chat,
            setting,
            isOwner,
            isRAdmin,
            isAdmin,
            isBotAdmin,
            chatUpdate,
            ___dirname,
            __filename
        }

        try {
            await plugin.call(this, m, extra)
        } catch (err) {
            m.error = err
        } finally {
            if (typeof plugin.after === 'function') {
                try {
                    await plugin.after.call(
                        this,
                        m,
                        extra
                    )
                } catch {}
            }
        }
    }

    try {
        if (m?.sender) {
            const dbUser =
                globalThis.db?.data?.users?.[m.sender]

            if (dbUser) {
                dbUser.exp =
                    (Number(dbUser.exp) || 0) +
                    (Number(m.exp) || 0)
            }
        }
    } catch {}

    try {
        if (!opts?.noprint && m) {
            const print =
                (await import('./lib/print.js')).default

            if (typeof print === 'function') {
                await print(m, this)
            }
        }
    } catch {}
}

global.dfail = (type, m, conn) => {
    const command = m?.command || ''

    const msg = {
        owner:
            `✿ El comando *${command}* solo puede ser ejecutado por mi Creador.`,

        mods:
            `✿ El comando *${command}* solo puede ser ejecutado por los mods.`,

        admin:
            `✿ El comando *${command}* solo puede ser ejecutado por los admins del Grupo.`,

        botAdmin:
            `✿ Para usar el comando *${command}* debo ser admin del Grupo.`,

        nsfw:
            `✿ Los comandos *NSFW* están desáctivados.\n> Un admin puede activarlo con:\n> *.on nsfw*`,

        gacha:
            `✿ Los comandos *Gacha* están desáctivados.\n> Un admin puede activarlo con:\n> *.on gacha*`,

        restrict:
            `✿ *_¡Esta característica está -deshabilitada-_*`
    }[type]

    if (!msg || !m) return

    try {
        return m.reply(msg)
    } catch {}
}
