import { smsg } from './lib/simple.js'
import { format } from 'util' 
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { unwatchFile, watchFile } from 'fs'
import chalk from 'chalk'
import fetch from 'node-fetch'

const { proto } = (await import('@whiskeysockets/baileys')).default
const isNumber = x => typeof x === 'number' && !isNaN(x)
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
if (global.db.data == null)
await global.loadDatabase()       
try {
m = smsg(this, m) || m
if (!m)
return
m.exp = 0
m.coin = false
try {
let user = global.db.data.users[m.sender]
if (typeof user !== 'object')  
global.db.data.users[m.sender] = {}
if (user) {
if (!isNumber(user.exp))
user.exp = 0
if (!isNumber(user.coin))
user.coin = 10
if (!isNumber(user.joincount))
user.joincount = 1
if (!isNumber(user.diamond))
user.diamond = 3
if (!isNumber(user.lastadventure))
user.lastadventure = 0
if (!isNumber(user.lastclaim))
user.lastclaim = 0
if (!isNumber(user.health))
user.health = 100
if (!isNumber(user.crime))
user.crime = 0
if (!isNumber(user.lastcofre))
user.lastcofre = 0
if (!isNumber(user.lastdiamantes))
user.lastdiamantes = 0
if (!isNumber(user.lastpago))
user.lastpago = 0
if (!isNumber(user.lastcode))
user.lastcode = 0
if (!isNumber(user.lastcodereg))
user.lastcodereg = 0
if (!isNumber(user.lastduel))
user.lastduel = 0
if (!isNumber(user.lastmining))
user.lastmining = 0
if (!('muto' in user))
user.muto = false
if (!('premium' in user))
user.premium = false
if (!user.premium)
user.premiumTime = 0
if (!('registered' in user))
user.registered = false
if (!('genre' in user))
user.genre = ''
if (!('birth' in user))
user.birth = ''
if (!('marry' in user))
user.marry = ''
if (!('description' in user))
user.description = ''
if (!('packstickers' in user))
user.packstickers = null
if (!user.registered) {
if (!('name' in user))
user.name = m.name
if (!isNumber(user.age))
user.age = -1
if (!isNumber(user.regTime))
user.regTime = -1
}
if (!isNumber(user.afk))
user.afk = -1
if (!('afkReason' in user))
user.afkReason = ''
if (!('role' in user))
user.role = 'Nuv'
if (!('banned' in user))
user.banned = false
if (!('useDocument' in user))
user.useDocument = false
if (!isNumber(user.level))
user.level = 0
if (!isNumber(user.bank))
user.bank = 0
if (!isNumber(user.warn))
user.warn = 0
} else
global.db.data.users[m.sender] = {
exp: 0,
coin: 10,
joincount: 1,
diamond: 3,
lastadventure: 0,
health: 100,
lastclaim: 0,
lastcofre: 0,
lastdiamantes: 0,
lastcode: 0,
lastduel: 0,
lastpago: 0,
lastmining: 0,
lastcodereg: 0,
muto: false,
registered: false,
genre: '',
birth: '',
marry: '',
description: '',
packstickers: null,
name: m.name,
age: -1,
regTime: -1,
afk: -1,
afkReason: '',
banned: false,
useDocument: false,
bank: 0,
level: 0,
role: 'Nuv',
premium: false,
premiumTime: 0,                 
}
let chat = global.db.data.chats[m.chat]
if (typeof chat !== 'object')
global.db.data.chats[m.chat] = {}
if (chat) {
if (!('isBanned' in chat))
chat.isBanned = false
if (!('sAutoresponder' in chat))
chat.sAutoresponder = ''
if (!('welcome' in chat))
chat.welcome = true
if (!('autolevelup' in chat))
chat.autolevelup = false
if (!('autoAceptar' in chat))
chat.autoAceptar = false
if (!('autosticker' in chat))
chat.autosticker = false
if (!('autoRechazar' in chat))
chat.autoRechazar = false
if (!('autoresponder' in chat))
chat.autoresponder = false
if (!('detect' in chat))
chat.detect = true
if (!('antiBot' in chat))
chat.antiBot = false
if (!('antiBot2' in chat))
chat.antiBot2 = false
if (!('modoadmin' in chat))
chat.modoadmin = false   
if (!('antiLink' in chat))
chat.antiLink = true
if (!('reaction' in chat))
chat.reaction = false
if (!('nsfw' in chat))
chat.nsfw = false
if (!('antifake' in chat))
chat.antifake = false
if (!('delete' in chat))
chat.delete = false
if (!isNumber(chat.expired))
chat.expired = 0
} else
global.db.data.chats[m.chat] = {
isBanned: false,
sAutoresponder: '',
welcome: true,
autolevelup: false,
autoresponder: false,
delete: false,
autoAceptar: false,
autoRechazar: false,
detect: true,
antiBot: false,
antiBot2: false,
modoadmin: false,
antiLink: true,
antifake: false,
reaction: false,
nsfw: false,
expired: 0, 
antiLag: false,
per: [],
}
var settings = global.db.data.settings[this.user.jid]
if (typeof settings !== 'object') global.db.data.settings[this.user.jid] = {}
if (settings) {
if (!('self' in settings)) settings.self = false
if (!('restrict' in settings)) settings.restrict = true
if (!('jadibotmd' in settings)) settings.jadibotmd = true
if (!('antiPrivate' in settings)) settings.antiPrivate = false
if (!('autoread' in settings)) settings.autoread = false
} else global.db.data.settings[this.user.jid] = {
self: false,
restrict: true,
jadibotmd: true,
antiPrivate: false,
autoread: false,
status: 0
}
} catch (e) {
console.error(e)
}

let _user = global.db.data && global.db.data.users && global.db.data.users[m.sender]

const detectwhat = m.sender.includes('@lid') ? '@lid' : '@s.whatsapp.net';
const isROwner = [...global.owner.map(([number]) => number)].map(v => v.replace(/[^0-9]/g, '') + detectwhat).includes(m.sender)
const isOwner = isROwner || m.fromMe
const isMods = isROwner || global.mods.map(v => v.replace(/[^0-9]/g, '') + detectwhat).includes(m.sender)
const isPrems = isROwner || global.prems.map(v => v.replace(/[^0-9]/g, '') + detectwhat).includes(m.sender) || _user.premium == true

if (m.isBaileys) return
if (opts['nyimak'])  return
if (!isROwner && opts['self']) return
if (opts['swonly'] && m.chat !== 'status@broadcast')  return
if (typeof m.text !== 'string')
m.text = ''

if (opts['queque'] && m.text && !(isMods || isPrems)) {
let queque = this.msgqueque, time = 1000 * 5
const previousID = queque[queque.length - 1]
queque.push(m.id || m.key.id)
setInterval(async function () {
if (queque.indexOf(previousID) === -1) clearInterval(this)
await delay(time)
}, time)
}

m.exp += Math.ceil(Math.random() * 10)

let usedPrefix

async function getLidFromJid(id, conn) {
if (id.endsWith('@lid')) return id
const res = await conn.onWhatsApp(id).catch(() => [])
return res[0]?.lid || id
}
const senderLid = await getLidFromJid(m.sender, conn)
const botLid = await getLidFromJid(conn.user.jid, conn)
const senderJid = m.sender
const botJid = conn.user.jid
const groupMetadata = m.isGroup ? ((conn.chats[m.chat] || {}).metadata || await this.groupMetadata(m.chat).catch(_ => null)) : {}
const participants = m.isGroup ? (groupMetadata.participants || []) : []
const user = participants.find(p => p.id === senderLid || p.id === senderJid) || {}
const bot = participants.find(p => p.id === botLid || p.id === botJid) || {}
const isRAdmin = user?.admin === "superadmin"
const isAdmin = isRAdmin || user?.admin === "admin"
const isBotAdmin = !!bot?.admin

const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins')
for (let name in global.plugins) {
let plugin = global.plugins[name]
if (!plugin)
continue
if (plugin.disabled)
continue
const __filename = join(___dirname, name)
if (typeof plugin.all === 'function') {
try {
await plugin.all.call(this, m, {
chatUpdate,
__dirname: ___dirname,
__filename
})
} catch (e) {
console.error(e)
}}
if (!opts['restrict'])
if (plugin.tags && plugin.tags.includes('admin')) {
continue
}
const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
let _prefix = plugin.customPrefix ? plugin.customPrefix : conn.prefix ? conn.prefix : global.prefix
let match = (_prefix instanceof RegExp ? 
[[_prefix.exec(m.text), _prefix]] :
Array.isArray(_prefix) ?
_prefix.map(p => {
let re = p instanceof RegExp ?
p :
new RegExp(str2Regex(p))
return [re.exec(m.text), re]
}) :
typeof _prefix === 'string' ?
[[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]] :
[[[], new RegExp]]
).find(p => p[1])
if (typeof plugin.before === 'function') {
if (await plugin.before.call(this, m, {
match,
conn: this,
participants,
groupMetadata,
user,
bot,
isROwner,
isOwner,
isRAdmin,
isAdmin,
isBotAdmin,
isPrems,
chatUpdate,
__dirname: ___dirname,
__filename
}))
continue
}
if (typeof plugin !== 'function')
continue
if ((usedPrefix = (match[0] || '')[0])) {
let noPrefix = m.text.replace(usedPrefix, '')
let [command, ...args] = noPrefix.trim().split` `.filter(v => v)
args = args || []
let _args = noPrefix.trim().split` `.slice(1)
let text = _args.join` `
command = (command || '').toLowerCase()
let fail = plugin.fail || global.dfail
let isAccept = plugin.command instanceof RegExp ? 
plugin.command.test(command) :
Array.isArray(plugin.command) ?
plugin.command.some(cmd => cmd instanceof RegExp ? 
cmd.test(command) :
cmd === command) :
typeof plugin.command === 'string' ? 
plugin.command === command :
false

global.comando = command

if ((m.id.startsWith('NJX-') || (m.id.startsWith('BAE5') && m.id.length === 16) || (m.id.startsWith('B24E') && m.id.length === 20))) return

if (!isAccept) {
continue
}
m.plugin = name
if (m.chat in global.db.data.chats || m.sender in global.db.data.users) {
let chat = global.db.data.chats[m.chat]
let user = global.db.data.users[m.sender]
if (!['grupo-unbanchat.js'].includes(name) && chat && chat.isBanned && !isROwner) return
if (name != 'grupo-unbanchat.js' && name != 'owner-exec.js' && name != 'owner-exec2.js' && name != 'grupo-delete.js' && chat?.isBanned && !isROwner) return
if (m.text && user.banned && !isROwner) {
m.reply(`⛔ ¡Acceso Denegado, alma errante!  
Shizuka ha percibido una anomalía en tu energía...  
No estás autorizado/a para usar comandos en este santuario.

${user.bannedReason ? `✶ Motivo: *${user.bannedReason}*` : '✶ Motivo: *Silencio sin razón aparente...*'}

┊❖ Si este bot es oficial y hay pruebas celestiales de que esto es un error,  
┊↳ ✦ Puedes elevar tu caso ante un moderador del reino.`)
return
}

if (m.chat in global.db.data.chats || m.sender in global.db.data.users) {
let chat = global.db.data.chats[m.chat]
let user = global.db.data.users[m.sender]
let setting = global.db.data.settings[this.user.jid]
if (name != 'grupo-unbanchat.js' && chat?.isBanned)
return 
if (name != 'owner-unbanuser.js' && user?.banned)
return
}}

let hl = _prefix 
let adminMode = global.db.data.chats[m.chat].modoadmin
let mini = `${plugins.botAdmin || plugins.admin || plugins.group || plugins || noPrefix || hl ||  m.text.slice(0, 1) == hl || plugins.command}`
if (adminMode && !isOwner && !isROwner && m.isGroup && !isAdmin && mini) return   
if (plugin.rowner && plugin.owner && !(isROwner || isOwner)) { 
fail('owner', m, this)
continue
}
if (plugin.rowner && !isROwner) { 
fail('rowner', m, this)
continue
}
if (plugin.owner && !isOwner) { 
fail('owner', m, this)
continue
}
if (plugin.mods && !isMods) { 
fail('mods', m, this)
continue
}
if (plugin.premium && !isPrems) { 
fail('premium', m, this)
continue
}
if (plugin.group && !m.isGroup) { 
fail('group', m, this)
continue
} else if (plugin.botAdmin && !isBotAdmin) { 
fail('botAdmin', m, this)
continue
} else if (plugin.admin && !isAdmin) { 
fail('admin', m, this)
continue
}
if (plugin.private && m.isGroup) {
fail('private', m, this)
continue
}
if (plugin.register == true && _user.registered == false) { 
fail('unreg', m, this)
continue
}
m.isCommand = true
let xp = 'exp' in plugin ? parseInt(plugin.exp) : 10
m.exp += xp
if (!isPrems && plugin.coin && global.db.data.users[m.sender].coin < plugin.coin * 1) {
conn.reply(m.chat, `❮✦❯ Se agotaron tus ${moneda}`, m)
continue
}
if (plugin.level > _user.level) {
conn.reply(m.chat, `❮✦❯ Acceso Restringido por el manto del sistema...

┊• Nivel requerido: *${plugin.level}*  
┊• Tu esencia actual vibra en el nivel: *${_user.level}*  

𓆩✦𓆪 Para trascender y desbloquear este poder, ejecuta el ritual:  
*${usedPrefix}levelup*`, m)
continue
}
let extra = {
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
bot,
isROwner,
isOwner,
isRAdmin,
isAdmin,
isBotAdmin,
isPrems,
chatUpdate,
__dirname: ___dirname,
__filename
}
try {
await plugin.call(this, m, extra)
if (!isPrems)
m.coin = m.coin || plugin.coin || false
} catch (e) {
m.error = e
console.error(e)
if (e) {
let text = format(e)
for (let key of Object.values(global.APIKeys))
text = text.replace(new RegExp(key, 'g'), 'Administrador')
m.reply(text)
}
} finally {
if (typeof plugin.after === 'function') {
try {
await plugin.after.call(this, m, extra)
} catch (e) {
console.error(e)
}}
if (m.coin)
conn.reply(m.chat, `Transacción realizada con el eco de tus decisiones...

• Has invertido: +${m.coin} ${moneda}  
• La energía ha sido transferida al cauce del destino.`, m)
}
break
}}
} catch (e) {
console.error(e)
} finally {
if (opts['queque'] && m.text) {
const quequeIndex = this.msgqueque.indexOf(m.id || m.key.id)
if (quequeIndex !== -1)
this.msgqueque.splice(quequeIndex, 1)
}
let user, stats = global.db.data.stats
if (m) { let utente = global.db.data.users[m.sender]
if (utente.muto == true) {
let bang = m.key.id
let cancellazzione = m.key.participant
await conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: cancellazzione }})
}
if (m.sender && (user = global.db.data.users[m.sender])) {
user.exp += m.exp
user.coin -= m.coin * 1
}

let stat
if (m.plugin) {
let now = +new Date
if (m.plugin in stats) {
stat = stats[m.plugin]
if (!isNumber(stat.total))
stat.total = 1
if (!isNumber(stat.success))
stat.success = m.error != null ? 0 : 1
if (!isNumber(stat.last))
stat.last = now
if (!isNumber(stat.lastSuccess))
stat.lastSuccess = m.error != null ? 0 : now
} else
stat = stats[m.plugin] = {
total: 1,
success: m.error != null ? 0 : 1,
last: now,
lastSuccess: m.error != null ? 0 : now
}
stat.total += 1
stat.last = now
if (m.error == null) {
stat.success += 1
stat.lastSuccess = now
}}}

try {
if (!opts['noprint']) await (await import(`./lib/print.js`)).default(m, this)
} catch (e) { 
console.log(m, m.quoted, e)}
let settingsREAD = global.db.data.settings[this.user.jid] || {}  
if (opts['autoread']) await this.readMessages([m.key])

if (db.data.chats[m.chat].reaction && m.text.match(/(ción|dad|aje|oso|izar|mente|pero|tion|age|ous|ate|and|but|ify|ai|yuki|a|s)/gi)) {
let emot = pickRandom(["🍟", "😃", "😄", "😁", "😆", "🍓", "😅", "😂", "🤣", "🥲", "☺️", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "🌺", "🌸", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🌟", "🤓", "😎", "🥸", "🤩", "🥳", "😏", "💫", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😶‍🌫️", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔", "🫣", "🤭", "🤖", "🍭", "🤫", "🫠", "🤥", "😶", "📇", "😐", "💧", "😑", "🫨", "😬", "🙄", "😯", "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😮‍💨", "😵", "😵‍💫", "🤐", "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "🤑", "🤠", "😈", "👿", "👺", "🧿", "🌩", "👻", "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾", "🫶", "👍", "✌️", "🙏", "🫵", "🤏", "🤌", "☝️", "🖕", "🙏", "🫵", "🫂", "🐱", "🤹‍♀️", "🤹‍♂️", "🗿", "✨", "⚡", "🔥", "🌈", "🩷", "❤️", "🧡", "💛", "💚", "🩵", "💙", "💜", "🖤", "🩶", "🤍", "🤎", "💔", "❤️‍🔥", "❤️‍🩹", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "🚩", "👊", "⚡️", "💋", "🫰", "💅", "👑", "🐣", "🐤", "🐈"])
if (!m.fromMe) return this.sendMessage(m.chat, { react: { text: emot, key: m.key }})
}
function pickRandom(list) { return list[Math.floor(Math.random() * list.length)]}
}}

global.dfail = (type, m, usedPrefix, command, conn) => {

let edadaleatoria = ['10', '28', '20', '40', '18', '21', '15', '11', '9', '17', '25'].getRandom()
let user2 = m.pushName || 'Anónimo'
let verifyaleatorio = ['registrar', 'reg', 'verificar', 'verify', 'register'].getRandom()

const msg = {rowner: `☠️ *𝕯𝖊𝖓𝖎𝖊𝖉 𝖉𝖊 𝕮𝖗𝖊𝖆𝖉𝖔𝖗* ☠️\n» 𝖊𝖑 𝖈𝖔𝖒𝖆𝖓𝖉𝖔 *${comando}* 𝖘𝖔𝖑𝖔 𝖕𝖚𝖊𝖉𝖊 𝖘𝖊𝖗 𝖚𝖘𝖆𝖉𝖔 𝖕𝖔𝖗 𝖊𝖑 𝖉𝖎𝖔𝖘 𝖉𝖊𝖑 𝖇𝖔𝖙`,
  
  owner: `🕷️ *𝕯𝖊𝖛 𝕺𝖓𝖑𝖞* 🕷️\n» 𝖊𝖑 𝖈𝖔𝖒𝖆𝖓𝖉𝖔 *${comando}* 𝖗𝖊𝖖𝖚𝖎𝖊𝖗𝖊 𝖕𝖗𝖎𝖛𝖎𝖑𝖊𝖌𝖎𝖔𝖘 𝖉𝖊 𝖉𝖊𝖘𝖆𝖗𝖗𝖔𝖑𝖑𝖆𝖉𝖔𝖗`,
  
  mods: `⚡ *𝕸𝖔𝖉 𝕷𝖔𝖈𝖐* ⚡\n» 𝖊𝖑 𝖈𝖔𝖒𝖆𝖓𝖉𝖔 *${comando}* 𝖊𝖘 𝖘𝖔𝖑𝖔 𝖕𝖆𝖗𝖆 𝖒𝖔𝖉𝖊𝖗𝖆𝖉𝖔𝖗𝖊𝖘 𝖉𝖊𝖑 𝖘𝖎𝖘𝖙𝖊𝖒𝖆`,
  
  premium: `💎 *𝕻𝖗𝖊𝖒𝖎𝖚𝖒 𝕷𝖔𝖈𝖐* 💎\n» 𝖊𝖘𝖙𝖊 𝖈𝖔𝖒𝖆𝖓𝖉𝖔 𝖊𝖘 𝖚𝖓 𝖇𝖊𝖓𝖊𝖋𝖎𝖈𝖎𝖔 𝖊𝖝𝖈𝖑𝖚𝖘𝖎𝖛𝖔 𝖕𝖆𝖗𝖆 𝖚𝖘𝖚𝖆𝖗𝖎𝖔𝖘 𝖕𝖗𝖊𝖒𝖎𝖚𝖒`,
  
  group: `👥 *𝕲𝖗𝖔𝖚𝖕 𝕺𝖓𝖑𝖞* 👥\n» 𝖊𝖘𝖙𝖊 𝖈𝖔𝖒𝖆𝖓𝖉𝖔 𝖘𝖔𝖑𝖔 𝖋𝖚𝖓𝖈𝖎𝖔𝖓𝖆 𝖊𝖓 𝖌𝖗𝖚𝖕𝖔𝖘 𝖉𝖊𝖑 𝖇𝖔𝖙`,
  
  private: `🤖 *𝕯𝖒 𝕺𝖓𝖑𝖞* 🤖\n» 𝖉𝖊𝖇𝖊𝖘 𝖊𝖓𝖛𝖎𝖆𝖗 𝖊𝖑 𝖈𝖔𝖒𝖆𝖓𝖉𝖔 *${comando}* 𝖆𝖑 𝖈𝖍𝖆𝖙 𝖕𝖗𝖎𝖛𝖆𝖉𝖔 𝖉𝖊𝖑 𝖇𝖔𝖙`,
  
  admin: `👑 *𝕬𝖉𝖒𝖎𝖓 𝕺𝖓𝖑𝖞* 👑\n» 𝖘𝖔𝖑𝖔 𝖑𝖔𝖘 𝖆𝖉𝖒𝖎𝖓𝖎𝖘𝖙𝖗𝖆𝖉𝖔𝖗𝖊𝖘 𝖕𝖚𝖊𝖉𝖊𝖓 𝖚𝖘𝖆𝖗 𝖊𝖑 𝖈𝖔𝖒𝖆𝖓𝖉𝖔 *${comando}*`,
  
  botAdmin: `🤖 *𝕭𝖔𝖙 𝕬𝖉𝖒𝖎𝖓 𝕽𝖊𝖖𝖚𝖎𝖗𝖊𝖉* 🤖\n» 𝖕𝖆𝖗𝖆 𝖚𝖘𝖆𝖗 *${comando}*, 𝖉𝖊𝖇𝖔 𝖘𝖊𝖗 𝖆𝖉𝖒𝖎𝖓𝖎𝖘𝖙𝖗𝖆𝖉𝖔𝖗 𝖉𝖊𝖑 𝖌𝖗𝖚𝖕𝖔`,
  
  unreg: `📝 *𝕽𝖊𝖌𝖎𝖘𝖙𝖗𝖔 𝕽𝖊𝖖𝖚𝖊𝖗𝖎𝖉𝖔* 📝\n» 𝖉𝖊𝖇𝖊𝖘 𝖗𝖊𝖌𝖎𝖘𝖙𝖗𝖆𝖗𝖙𝖊 𝖕𝖆𝖗𝖆 𝖚𝖘𝖆𝖗 𝖊𝖑 𝖈𝖔𝖒𝖆𝖓𝖉𝖔 *${comando}*\n\n✧ 𝖚𝖘𝖆: #${verifyaleatorio} ${user2}.${edadaleatoria}`,
  
  restrict: `🔒 *𝕱𝖊𝖆𝖙𝖚𝖗𝖊 𝕷𝖔𝖈𝖐𝖊𝖉* 🔒\n» 𝖊𝖘𝖙𝖆 𝖈𝖆𝖗𝖆𝖈𝖙𝖊𝖗í𝖘𝖙𝖎𝖈𝖆 𝖊𝖘𝖙á 𝖉𝖊𝖘𝖆𝖈𝖙𝖎𝖛𝖆𝖉𝖆 𝖊𝖓 𝖊𝖑 𝖘𝖎𝖘𝖙𝖊𝖒𝖆`


}[type];
if (msg) return m.reply(msg).then(_ => m.react('✖️'))}

let file = global.__filename(import.meta.url, true)
watchFile(file, async () => {
unwatchFile(file)
console.log(chalk.magenta("Se actualizo 'handler.js'"))

if (global.conns && global.conns.length > 0 ) {
const users = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED).map((conn) => conn)])]
for (const userr of users) {
userr.subreloadHandler(false)
}}})
  
