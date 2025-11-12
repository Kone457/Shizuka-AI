process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1'
import './settings.js'
import cfonts from 'cfonts'
import { createRequire } from 'module'
import { fileURLToPath, pathToFileURL } from 'url'
import { platform } from 'process'
import * as ws from 'ws'
import fs, { readdirSync, statSync, unlinkSync, existsSync, mkdirSync, readFileSync, rmSync, watch } from 'fs'
import yargs from 'yargs';
import { spawn, execSync } from 'child_process'
import lodash from 'lodash'
import chalk from 'chalk'
import syntaxerror from 'syntax-error'
import pino from 'pino'
import Pino from 'pino'
import path, { join, dirname } from 'path'
import { Boom } from '@hapi/boom'
import { makeWASocket, protoType, serialize } from './lib/simple.js'
import { Low, JSONFile } from 'lowdb'
import store from './lib/store.js'
const { proto } = (await import('@whiskeysockets/baileys')).default
import pkg from 'google-libphonenumber'
const { PhoneNumberUtil } = pkg
const phoneUtil = PhoneNumberUtil.getInstance()
const { DisconnectReason, useMultiFileAuthState, MessageRetryMap, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, jidNormalizedUser } = await import('@whiskeysockets/baileys')
import readline, { createInterface } from 'readline'
import NodeCache from 'node-cache'
const { CONNECTING } = ws
const { chain } = lodash
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000

let { say } = cfonts

console.log(chalk.magentaBright('\nIniciando...'))

say('Shizuka-AI', {
  font: 'simple',
  align: 'left',
  gradient: ['red', 'red']
})
say('Powered By Carlos', {
  font: 'console',
  align: 'center',
  colors: ['red', 'red']
})

protoType()
serialize()

globalThis.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString();
}; global.__dirname = function dirname(pathURL) {
return path.dirname(globalThis.__filename(pathURL, true))
}; globalThis.__require = function require(dir = import.meta.url) {
return createRequire(dir)
}

globalThis.timestamp = {start: new Date}

const __dirname = globalThis.__dirname(import.meta.url)

globalThis.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())

global.prefix = new RegExp('^[#!./]')

globalThis.db = new Low(/https?:\/\//.test(opts['db'] || '') ? new cloudDBAdapter(opts['db']) : new JSONFile('datos.json'))
globalThis.DATABASE = globalThis.db; 
globalThis.loadDatabase = async function loadDatabase() {
if (globalThis.db.READ) {
return new Promise((resolve) => setInterval(async function() {
if (!globalThis.db.READ) {
clearInterval(this);
resolve(globalThis.db.data == null ? globalThis.loadDatabase() : globalThis.db.data);
}}, 1 * 1000));
}
if (globalThis.db.data !== null) return;
globalThis.db.READ = true;
await globalThis.db.read().catch(console.error);
globalThis.db.READ = null;
globalThis.db.data = {
users: {},
chats: {},
settings: {},
...(globalThis.db.data || {}),
};
globalThis.db.chain = chain(globalThis.db.data);
};
loadDatabase();

const {state, saveState, saveCreds} = await useMultiFileAuthState(globalThis.sessions)
const msgRetryCounterMap = new Map()
const msgRetryCounterCache = new NodeCache({ stdTTL: 0, checkperiod: 0 })
const userDevicesCache = new NodeCache({ stdTTL: 0, checkperiod: 0 })
const { version } = await fetchLatestBaileysVersion()
let phoneNumber = globalThis.botNumber

const methodCodeQR = process.argv.includes("qr")
const methodCode = !!phoneNumber || process.argv.includes("code")
const MethodMobile = process.argv.includes("mobile")
const colors = chalk.bold.red
const qrOption = chalk.redBright
const textOption = chalk.red
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (texto) => new Promise((resolver) => rl.question(texto, resolver))

let opcion
if (methodCodeQR) {
opcion = '1'
}
if (!methodCodeQR && !methodCode && !fs.existsSync(`./${sessions}/creds.json`)) {
do {
        opcion = await question(colors("Seleccione una opción:\n") + qrOption("1. Con código QR\n") + textOption("2. Con código de texto de 8 dígitos\n--> "))

if (!/^[1-2]$/.test(opcion)) {
console.log(chalk.bold.redBright(`No se permiten numeros que no sean 1 o 2, tampoco letras o símbolos especiales.`))
}} while (opcion !== '1' && opcion !== '2' || fs.existsSync(`./${sessions}/creds.json`))
} 

console.info = () => { }

const connectionOptions = {
logger: pino({ level: 'silent' }),
printQRInTerminal: opcion == '1' ? true : methodCodeQR ? true : false,
mobile: MethodMobile, 
browser: ["Ubuntu", "Chrome"],
auth: {
creds: state.creds,
keys: makeCacheableSignalKeyStore(state.keys, Pino({ level: "fatal" }).child({ level: "fatal" })),
},
markOnlineOnConnect: false, 
generateHighQualityLinkPreview: true, 
syncFullHistory: false,
getMessage: async (key) => {
try {
let jid = jidNormalizedUser(key.remoteJid);
let msg = await store.loadMessage(jid, key.id);
return msg?.message || "";
} catch (error) {
return "";
}},
msgRetryCounterCache: msgRetryCounterCache || new Map(),
userDevicesCache: userDevicesCache || new Map(),
//msgRetryCounterMap,
defaultQueryTimeoutMs: undefined,
cachedGroupMetadata: (jid) => globalThis.conn.chats[jid] ?? {},
version: version, 
keepAliveIntervalMs: 55000, 
maxIdleTimeMs: 60000, 
};

globalThis.conn = makeWASocket(connectionOptions);
conn.ev.on("creds.update", saveCreds)

if (!fs.existsSync(`./${sessions}/creds.json`)) {
if (opcion === '2' || methodCode) {
opcion = '2'
if (!conn.authState.creds.registered) {
let addNumber
if (!!phoneNumber) {
addNumber = phoneNumber.replace(/[^0-9]/g, '')
} else {
do {
phoneNumber = await question(chalk.bgBlack(chalk.bold.redBright(`✎ Por favor, Ingrese el número de WhatsApp.\n${chalk.bold.magentaBright('---> ')}`)))
phoneNumber = phoneNumber.replace(/\D/g,'')
if (!phoneNumber.startsWith('+')) {
phoneNumber = `+${phoneNumber}`
}
} while (!await isValidPhoneNumber(phoneNumber))
rl.close()
addNumber = phoneNumber.replace(/\D/g, '')
setTimeout(async () => {
let codeBot = await conn.requestPairingCode(addNumber)
codeBot = codeBot.match(/.{1,4}/g)?.join("-") || codeBot
console.log(chalk.bold.red(chalk.bgMagenta(`✦ CÓDIGO DEL BOT ✦`)), chalk.bold.red(chalk.red(codeBot)))
}, 3000)
}}}
}

conn.isInit = false;
conn.well = false;
conn.logger.info(`[ ✦ ]  I N I C I A N D O\n`)

if (!opts['test']) {
if (globalThis.db) setInterval(async () => {
if (globalThis.db.data) await globalThis.db.write()
if (opts['autocleartmp'] && (global.support || {}).find) (tmp = [os.tmpdir(), 'tmp', `${jadi}`], tmp.forEach((filename) => cp.spawn('find', [filename, '-amin', '3', '-type', 'f', '-delete'])));
}, 30 * 1000);
}

async function connectionUpdate(update) {
const {connection, lastDisconnect, isNewLogin} = update;
global.stopped = connection;
if (isNewLogin) conn.isInit = true;
const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
if (code && code !== DisconnectReason.loggedOut && conn?.ws.socket == null) {
await globalThis.reloadHandler(true).catch(console.error);
globalThis.timestamp.connect = new Date;
}
if (globalThis.db.data == null) loadDatabase();
if (update.qr != 0 && update.qr != undefined || methodCodeQR) {
if (opcion == '1' || methodCodeQR) {
console.log(chalk.red.bold(`
╭───────────────────╼
│ ${chalk.red("Escanea este código QR para conectarte.")}
╰───────────────────╼`))}
}
        if (connection === "open") {
        await joinChannels(conn)
            console.log(chalk.bold.redBright('\n✩ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈✦ 𝗢𝗡𝗟𝗜𝗡𝗘 ✦┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ✩\n│\n│★ CONEXIÓN EXITOSA CON WHATSAPP 🌷\n│\n✩ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈✦ ✅  ✦┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ✩'))
        }
let reason = new Boom(lastDisconnect?.error)?.output?.statusCode
if (connection === "close") {
if ([401, 440, 428, 405].includes(reason)) {      
console.log(chalk.red(`→ (${code}) › Cierra la session Principal.`));
}
console.log(chalk.red("→ Reconectando el Bot Principal..."));
await globalThis.reloadHandler(true).catch(console.error)
}};

process.on('uncaughtException', console.error);

let isInit = true;
let handler = await import('./handler.js')
globalThis.reloadHandler = async function(restatConn) {
try {
const Handler = await import(`./handler.js?update=${Date.now()}`).catch(console.error);
if (Object.keys(Handler || {}).length) handler = Handler
} catch (e) {
console.error(e);
}
if (restatConn) {
const oldChats = globalThis.conn.chats
try {
globalThis.conn.ws.close()
} catch { }
conn.ev.removeAllListeners()
globalThis.conn = makeWASocket(connectionOptions, {chats: oldChats})
isInit = true
}
if (!isInit) {
conn.ev.off('messages.upsert', conn.handler)
conn.ev.off('connection.update', conn.connectionUpdate)
conn.ev.off('creds.update', conn.credsUpdate)
}

conn.handler = handler.handler.bind(globalThis.conn)
conn.connectionUpdate = connectionUpdate.bind(globalThis.conn)
conn.credsUpdate = saveCreds.bind(globalThis.conn, true)

const currentDateTime = new Date()
const messageDateTime = new Date(conn.ev)
if (currentDateTime >= messageDateTime) {
const chats = Object.entries(conn.chats).filter(([jid, chat]) => !jid.endsWith('@g.us') && chat.isChats).map((v) => v[0])

} else {
const chats = Object.entries(conn.chats).filter(([jid, chat]) => !jid.endsWith('@g.us') && chat.isChats).map((v) => v[0])
}

conn.ev.on('messages.upsert', conn.handler)
conn.ev.on('connection.update', conn.connectionUpdate)
conn.ev.on('creds.update', conn.credsUpdate)
isInit = false
return true
};

process.on('unhandledRejection', (reason, promise) => {
  console.error("Rechazo no manejado detectado:", reason);
});

const pluginFolder = globalThis.__dirname(join(__dirname, './plugins/index'))
const pluginFilter = (filename) => /\.js$/.test(filename)
globalThis.plugins = {}
async function filesInit() {
for (const filename of readdirSync(pluginFolder).filter(pluginFilter)) {
try {
const file = global.__filename(join(pluginFolder, filename))
const module = await import(file)
globalThis.plugins[filename] = module.default || module
} catch (e) {
conn.logger.error(e)
delete globalThis.plugins[filename]
}}}
filesInit().then((_) => Object.keys(globalThis.plugins)).catch(console.error);

globalThis.reload = async (_ev, filename) => {
if (pluginFilter(filename)) {
const dir = globalThis.__filename(join(pluginFolder, filename), true);
if (filename in globalThis.plugins) {
if (existsSync(dir)) conn.logger.info(` updated plugin - '${filename}'`)
else {
conn.logger.warn(`deleted plugin - '${filename}'`)
return delete globalThis.plugins[filename]
}} else conn.logger.info(`new plugin - '${filename}'`);
const err = syntaxerror(readFileSync(dir), filename, {
sourceType: 'module',
allowAwaitOutsideFunction: true,
});
if (err) conn.logger.error(`syntax error while loading '${filename}'\n${format(err)}`)
else {
try {
const module = (await import(`${globalThis.__filename(dir)}?update=${Date.now()}`));
globalThis.plugins[filename] = module.default || module;
} catch (e) {
conn.logger.error(`error require plugin '${filename}\n${format(e)}'`)
} finally {
globalThis.plugins = Object.fromEntries(Object.entries(globalThis.plugins).sort(([a], [b]) => a.localeCompare(b)))
}}
}}
Object.freeze(globalThis.reload)
watch(pluginFolder, globalThis.reload)
await globalThis.reloadHandler()
async function _quickTest() {
const test = await Promise.all([
spawn('ffmpeg'),
spawn('ffprobe'),
spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-filter_complex', 'color', '-frames:v', '1', '-f', 'webp', '-']),
spawn('convert'),
spawn('magick'),
spawn('gm'),
spawn('find', ['--version']),
].map((p) => {
return Promise.race([
new Promise((resolve) => {
p.on('close', (code) => {
resolve(code !== 127);
});
}),
new Promise((resolve) => {
p.on('error', (_) => resolve(false));
})]);
}));
const [ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find] = test;
const s = global.support = {ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find};
Object.freeze(globalThis.support);
}

// Tmp
setInterval(async () => {
const tmpDir = join(__dirname, 'tmp')
try {
const filenames = readdirSync(tmpDir)
filenames.forEach(file => {
const filePath = join(tmpDir, file)
unlinkSync(filePath)})
console.log(chalk.gray(`→ Archivos de la carpeta TMP eliminados`))
} catch {
console.log(chalk.gray(`→ Los archivos de la carpeta TMP no se pudieron eliminar`));
}}, 30 * 1000) 

setInterval(async () => {
  if (stopped === 'close' || !conn || !conn?.user) return;
  const _uptime = process.uptime() * 1000;
  const uptime = clockString(_uptime);
  const bio = `| ⚡ Uptime : ${uptime}`;
  await conn?.updateProfileStatus(bio).catch((_) => _);
}, 60000);
function clockString(ms) {
  const d = isNaN(ms) ? '--' : Math.floor(ms / 86400000);
  const h = isNaN(ms) ? '--' : Math.floor(ms / 3600000) % 24;
  const m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60;
  const s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60;
  return [d, 'd ️', h, 'h ', m, 'm ', s, 's '].map((v) => v.toString().padStart(2, 0)).join('');
}

_quickTest().catch(console.error)

async function isValidPhoneNumber(number) {
try {
number = number.replace(/\s+/g, '')
if (number.startsWith('+521')) {
number = number.replace('+521', '+52');
} else if (number.startsWith('+52') && number[4] === '1') {
number = number.replace('+52 1', '+52');
}
const parsedNumber = phoneUtil.parseAndKeepRawInput(number)
return phoneUtil.isValidNumber(parsedNumber)
} catch (error) {
return false
}}

async function joinChannels(conn) {
  for (const value of Object.values(global.my)) {
    if (typeof value === 'string' && value.endsWith('@newsletter')) {
    await conn.newsletterFollow(value).catch(() => {})
    }
  }
}