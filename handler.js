import { smsg } from './lib/simple.js'
import { format } from 'util' 
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import fs, { unwatchFile, watchFile } from 'fs'
import chalk from 'chalk'
import fetch from 'node-fetch'
import ws from 'ws'

const isNumber = x => typeof x === "number" && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(function () {
    clearTimeout(this)
    resolve()
}, ms))

export async function handler(chatUpdate) {
    this.msgqueque = this.msgqueque || []
    this.uptime = this.uptime || Date.now()
    if (!chatUpdate)
        return
    this.pushMessage(chatUpdate.messages).catch(console.error)
    let m = chatUpdate.messages[chatUpdate.messages.length - 1]
    if (!m)
        return;
    if (globalThis.db.data == null)
        await globalThis.loadDatabase()
    try {
        m = smsg(this, m) || m
        if (!m)
            return
        globalThis.mconn = m

        // --- INICIO DE CORRECCIÓN PARA BOTONES ---
        // Extraemos el ID si el mensaje proviene de un botón interactivo o lista
        const interactiveResponse = m.message?.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson
        const buttonId = interactiveResponse 
            ? JSON.parse(interactiveResponse).id 
            : (m.message?.buttonsResponseMessage?.selectedButtonId || 
               m.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
               m.message?.templateButtonReplyMessage?.selectedId)

        if (buttonId) {
            m.text = buttonId // Inyectamos el ID como texto para que el bot lo procese como comando
        }
        // --- FIN DE CORRECCIÓN ---

        m.exp = 0
        try {
            const user = globalThis.db.data.users[m.sender]
            if (typeof user !== "object")
                globalThis.db.data.users[m.sender] = {}
            if (user) {
                if (!("name" in user)) user.name = ''
                if (!("chocolates" in user)) user.chocolates = 0
                if (!("bank" in user)) user.bank = 0
                if (!("exp" in user)) user.exp = 0
                if (!("usedcommands" in user)) user.usedcommands = 0
                if (!("level" in user)) user.level = 0
            } else {
                globalThis.db.data.users[m.sender] = {
                    name: '',
                    chocolates: 0,
                    bank: 0,
                    exp: 0,
                    usedcommands: 0,
                    level: 0
                }
            }
            
            const chat = globalThis.db.data.chats[m.chat]
            if (typeof chat !== "object") globalThis.db.data.chats[m.chat] = {}
            if (chat) {
                if (!("sWelcome" in chat)) chat.sWelcome = ''
                if (!("sBye" in chat)) chat.sBye = ''
                if (!("welcome" in chat)) chat.welcome = true
                if (!("nsfw" in chat)) chat.nsfw = false
                if (!("alerts" in chat)) chat.alerts = true
                if (!("adminonly" in chat)) chat.adminonly = false
                if (!("antilinks" in chat)) chat.antilinks = true
                if (!("bannedGrupo" in chat)) chat.bannedGrupo = false
                if (!isNumber(chat.expired)) chat.expired = 0
            } else {
                globalThis.db.data.chats[m.chat] = {
                    sWelcome: '',
                    sBye: '',
                    welcome: true,
                    nsfw: false,
                    alerts: true,
                    adminonly: false,
                    antilinks: true,
                    bannedGrupo: false
                }
            }
                   
            const settings = globalThis.db.data.settings[this.user.jid]
            if (typeof settings !== "object") globalThis.db.data.settings[this.user.jid] = {}
            if (settings) {
                if (!('self' in settings)) settings.self = false
                if (!('botcommando' in settings)) settings.botcommando = 0
            } else {
                globalThis.db.data.settings[this.user.jid] = {
                    self: false,
                    botcommando: 0
                }
            }
        } catch (err) {
            console.error(err)
        }

        if (typeof m.text !== "string") m.text = ""

        const user = globalThis.db.data.users[m.sender]
        const chat = globalThis.db.data.chats[m.chat]

        if (m.isGroup && chat && chat.primaryBot) {
            if (this.user.jid !== chat.primaryBot) return
        }

        globalThis.setting = globalThis.db.data.settings[this.user.jid]
        const isOwner = [...globalThis.owner.map(([number]) => number)].map(v => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net").includes(m.sender)
        
        if (opts["queque"] && m.text && !isOwner) {
            const queque = this.msgqueque, time = 1000 * 5
            const previousID = queque[queque.length - 1]
            queque.push(m.id || m.key.id)
            setInterval(async function () {
                if (queque.indexOf(previousID) === -1) clearInterval(this)
                await delay(time)
            }, time)
        }

        if (m.isBaileys) return

        m.exp += Math.ceil(Math.random() * 10)
        let usedPrefix
        
        const groupMetadata = m.isGroup ? { ...(conn.chats[m.chat]?.metadata || await this.groupMetadata(m.chat).catch(_ => null) || {}) } : {}
        const participants = (m.isGroup ? groupMetadata.participants : []) || []
        const userGroup = (m.isGroup ? participants.find(u => conn.decodeJid(u.jid) === m.sender) : {}) || {}
        const botGroup = (m.isGroup ? participants.find(u => conn.decodeJid(u.jid) === this.user.jid) : {}) || {}
        const isRAdmin = userGroup?.admin == "superadmin" || false
        const isAdmin = isRAdmin || userGroup?.admin == "admin" || false
        const isBotAdmin = botGroup?.admin || false

        const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), "./plugins")
        for (const name in globalThis.plugins) {
            const plugin = globalThis.plugins[name]
            if (!plugin || plugin.disabled) continue
            
            const __filename = join(___dirname, name)

            if (typeof plugin.all === "function") {
                try {
                    await plugin.all.call(this, m, { chatUpdate, ___dirname, __filename, user, chat, setting })
                } catch (err) {
                    console.error(err)
                }
            }

            if (!opts["restrict"]) {
                if (plugin.tags && plugin.tags.includes("admin")) continue
            }

            const strRegex = (str) => str.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&")
            const pluginPrefix = plugin.customPrefix || conn.prefix || globalThis.prefix
            const match = (pluginPrefix instanceof RegExp ?
                [[pluginPrefix.exec(m.text), pluginPrefix]] :
                Array.isArray(pluginPrefix) ?
                    pluginPrefix.map(prefix => {
                        const regex = prefix instanceof RegExp ? prefix : new RegExp(strRegex(prefix))
                        return [regex.exec(m.text), regex]
                    }) :
                    typeof pluginPrefix === "string" ?
                        [[new RegExp(strRegex(pluginPrefix)).exec(m.text), new RegExp(strRegex(pluginPrefix))]] :
                        [[[], new RegExp]]
            ).find(prefix => prefix[1])

            if (typeof plugin.before === "function") {
                if (await plugin.before.call(this, m, {
                    match, conn: this, participants, groupMetadata, isOwner, isRAdmin, isAdmin, isBotAdmin, chatUpdate, ___dirname, __filename, user, chat, setting
                })) continue
            }

            if (typeof plugin !== "function") continue

            if ((usedPrefix = (match[0] || "")[0])) {
                const noPrefix = m.text.replace(usedPrefix, "")
                let [command, ...args] = noPrefix.trim().split(" ").filter(v => v)
                args = args || []
                let _args = noPrefix.trim().split(" ").slice(1)
                let text = _args.join(" ")
                command = (command || "").toLowerCase()
                
                const fail = plugin.fail || globalThis.dfail
                const isAccept = plugin.command instanceof RegExp ?
                    plugin.command.test(command) :
                    Array.isArray(plugin.command) ?
                        plugin.command.some(cmd => cmd instanceof RegExp ? cmd.test(command) : cmd === command) :
                        typeof plugin.command === "string" ?
                            plugin.command === command :
                            false

                globalThis.comando = command

                if (!isAccept) continue

                m.plugin = name
                globalThis.db.data.settings[this.user.jid].botcommando += 1

                if (chat?.bannedGrupo && !isOwner && name !== "grupo-mute.js") return

                if (!m.chat.endsWith('g.us') && !isOwner) return

                const adminMode = chat.adminonly || false
                if (adminMode && !isOwner && m.isGroup && !isAdmin) return

                if (plugin.owner && !isOwner) {
                    fail("owner", m, this)
                    continue
                }
                if (plugin.botAdmin && !isBotAdmin) {
                    fail("botAdmin", m, this)
                    continue
                }
                if (plugin.admin && !isAdmin) {
                    fail("admin", m, this)
                    continue
                }

                m.isCommand = true
                m.exp += plugin.exp ? parseInt(plugin.exp) : 10
                let extra = {
                    match, usedPrefix, noPrefix, _args, args, command, text, conn: this,
                    participants, groupMetadata, user, chat, setting, isOwner, isRAdmin, isAdmin, isBotAdmin, chatUpdate, ___dirname, __filename
                }

                try {
                    await plugin.call(this, m, extra)
                } catch (err) {
                    m.error = err
                    console.error(err)
                } finally {
                    if (typeof plugin.after === "function") {
                        try {
                            await plugin.after.call(this, m, extra)
                        } catch (err) {
                            console.error(err)
                        }
                    }
                }
            }
        }
    } catch (err) {
        console.error(err)
    } finally {
        if (opts["queque"] && m.text) {
            const quequeIndex = this.msgqueque.indexOf(m.id || m.key.id)
            if (quequeIndex !== -1) this.msgqueque.splice(quequeIndex, 1)
        }
        try {
            if (!opts["noprint"]) await (await import(`./lib/console.js`)).default(m, this)
        } catch (err) {}
    }
}

global.dfail = (type, m, conn) => {
    const msg = {
        owner: `> El comando *${globalThis.comando}* solo puede ser ejecutado por mi Creador.`,
        moderation: `> El comando *${globalThis.comando}* solo puede ser ejecutado por los mods.`,
        admin: `> El comando *${globalThis.comando}* solo puede ser ejecutado por los admins del Grupo.`,
        botAdmin: `> Para usar el comando *${globalThis.comando}* debo ser admin del Grupo.`
    }[type];
    if (msg) return m.reply(msg)
}
