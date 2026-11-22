import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const pluginsDir = path.join(root, 'plugins')
const SKIP_CALL = new Set(['owner-restart.js'])
// بيفتح سوكيتس Baileys عند الاستيراد — بنستثنيه من التست عشان ميعملش اتصالات
const SKIP_IMPORT = new Set(['jadibot-serbot.js'])

const calls = []
const mkConn = () => new Proxy({}, {
  get(_, k) {
    if (k === 'user') return { jid: '201000000000:1@s.whatsapp.net', id: '201000000000:1@s.whatsapp.net', name: 'شيزوكا', verify: 'v' }
    if (k === 'logger') return { info() {}, warn() {}, error() {}, debug() {} }
    if (k === 'groupMetadata') return async () => ({
      id: '120363@g.us', subject: 'جروب', owner: '201111111111@s.whatsapp.net',
      participants: [
        { id: '201111111111@s.whatsapp.net', admin: 'superadmin' },
        { id: '201222222222@s.whatsapp.net', admin: null }
      ]
    })
    if (k === 'groupParticipantsUpdate') return async () => [{ status: '200' }]
    if (k === 'getName') return async () => 'مستخدم'
    if (k === 'profilePictureUrl') return async () => { throw new Error('none') }
    if (k === 'groupInviteCode') return async () => 'CODE'
    if (k === 'groupRevokeInvite') return async () => 'CODE2'
    if (k === 'waitForMessage') return async () => null
    if (k === 'sendMessage') return async (chat, content, opts) => { calls.push({ chat, content, opts }); return { key: { id: 'm1' } } }
    if (k === 'reply') return async (chat, text, quoted) => { calls.push({ chat, text, quoted }); return { key: { id: 'm2' } } }
    return async () => ({})
  }
})

function makeMessage(id) {
  return {
    chat: '120363@g.us', sender: '201222222222@s.whatsapp.net', pushName: 'تست',
    isGroup: true, fromMe: false, mentionedJid: [], quoted: null, text: '', body: '',
    key: { id: 'K' + id, remoteJid: '120363@g.us', fromMe: false, participant: '201222222222@s.whatsapp.net' },
    message: { conversation: '' },
    reply: async (t) => { calls.push({ text: typeof t === 'string' ? t : '[obj]' }) }
  }
}

async function boot() {
  await import('file://' + path.join(root, 'config.js'))
  await import('file://' + path.join(root, 'lib/simple.js'))
  globalThis.plugins = {}
  for (const f of fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'))) {
    if (SKIP_IMPORT.has(f)) continue
    const mod = await import('file://' + path.join(pluginsDir, f))
    globalThis.plugins[f] = 'default' in mod ? mod.default : mod
  }
  globalThis.db = globalThis.db || {}
  globalThis.db.data = globalThis.db.data || { users: {}, chats: {}, settings: {}, stats: {} }
  globalThis.db.data.settings['201000000000:1@s.whatsapp.net'] ||= {}
  globalThis.db.write = async () => {}
  globalThis.conn = null
  return globalThis.plugins
}

const withTimeout = (p, ms) => Promise.race([
  p,
  new Promise((_, rej) => setTimeout(() => rej(new Error('TIMEOUT')), ms).unref?.())
])

test('كل الأوامر بتشتغل من غير ما ترمي exception', async (t) => {
  const plugins = await boot()
  const realFetch = globalThis.fetch
  globalThis.fetch = async () => { throw new Error('offline') }
  t.after(() => { globalThis.fetch = realFetch })

  const broken = []
  for (const [f, h] of Object.entries(plugins)) {
    if (!h || typeof h !== 'function') continue
    if (SKIP_CALL.has(f)) continue
    const cmd = [].concat(h.command || []).find(c => typeof c === 'string') || 'x'
    const m = makeMessage(f)
    const conn = mkConn()
    globalThis.conn = conn
    const ctx = {
      conn, command: cmd, args: [], text: '', usedPrefix: '.',
      participants: [], isAdmin: true, isBotAdmin: true, isOwner: true, isRAdmin: true,
      user: globalThis.db.data.users[m.sender] = {}, chat: globalThis.db.data.chats[m.chat] = {}, setting: {}
    }
    try {
      await withTimeout(Promise.resolve(h.call(conn, m, ctx)), 5000)
    } catch (e) {
      broken.push(`${f} → ${(e.message || e).toString().slice(0, 100)}`)
    }
  }
  assert.deepEqual(broken, [], `أوامر رمت أخطاء:\n${broken.join('\n')}`)
})

test('كل plugin له tag معروف في المينيو (ماعدا plugins الشغل الخفي)', async (t) => {
  const plugins = await boot()
  const menu = fs.readFileSync(path.join(pluginsDir, 'info-menu.js'), 'utf8')
  const meta = [...menu.matchAll(/^\s+(\w+):\s*'⊹/gm)].map(m => m[1])
  const orphans = []
  for (const [f, h] of Object.entries(plugins)) {
    if (!h || typeof h !== 'function' || f.startsWith('_')) continue
    if (h.owner) continue
    const tags = [].concat(h.tags || [])
    if (!tags.length) { orphans.push(`${f} → مفيش tags`); continue }
    for (const tag of tags) if (!meta.includes(tag)) orphans.push(`${f} → tag غريب: ${tag}`)
  }
  assert.deepEqual(orphans, [], `plugins مش ظاهرين في المينيو:\n${orphans.join('\n')}`)
})

test('كل plugin عنده help وقابل للظهور في المينيو', async (t) => {
  const plugins = await boot()
  const missing = []
  for (const [f, h] of Object.entries(plugins)) {
    if (!h || typeof h !== 'function' || f.startsWith('_')) continue
    if (!h.help || ![].concat(h.help).filter(Boolean).length) missing.push(f)
  }
  assert.deepEqual(missing, [], `plugins من غير help:\n${missing.join('\n')}`)
})

test('plugins الشغل الخفي (before/all) موجودة وشغالة', async (t) => {
  const plugins = await boot()
  const hidden = Object.entries(plugins).filter(([f]) => f.startsWith('_'))
  assert.ok(hidden.length >= 5, 'مفيش plugins خفية')
  for (const [f, mod] of hidden) {
    const fn = mod.before || mod.all
    if (typeof fn !== 'function') continue
    const m = makeMessage(f)
    m.text = 'رسالة عادية'
    m.isGroup = false
    try {
      await withTimeout(Promise.resolve(fn.call(mkConn(), m, { conn: mkConn(), participants: [], isAdmin: false, isBotAdmin: false, isOwner: false })), 5000)
    } catch (e) {
      assert.fail(`${f} رما خطأ: ${e.message}`)
    }
  }
})
