import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const hasDeps = fs.existsSync(path.join(root, 'node_modules'))
const skipNoDeps = (t) => {
  if (hasDeps) return false
  t.skip('محتاج npm install الأول')
  return true
}

const BOT = '201100000000@s.whatsapp.net'
const ADMIN = '201111111111@s.whatsapp.net'
const MEMBER = '201222222222@s.whatsapp.net'
const OWNER = '201333333333@s.whatsapp.net'

const setup = () => {
  global.db = { data: { chats: {}, settings: {} }, write: async () => {} }
  global.owner = [[OWNER.split('@')[0], 'المطور', true]]
}

const groupInfo = () => ({
  owner: OWNER,
  subject: 'جروب التجارب',
  participants: [
    { id: BOT, admin: 'admin' },
    { id: ADMIN, admin: 'admin' },
    { id: MEMBER, admin: null },
    { id: OWNER, admin: null }
  ]
})

const makeConn = () => {
  const replies = []
  const deleted = []
  const conn = {
    user: { jid: BOT },
    replies,
    deleted,
    groupMetadata: async () => groupInfo(),
    reply: async (chat, text, quoted, opts) => { replies.push({ chat, text, opts }) },
    sendMessage: async (chat, content) => { deleted.push(content) }
  }
  return conn
}

const makeMsg = (over = {}) => ({
  chat: '120363@g.us',
  isGroup: true,
  fromMe: false,
  sender: ADMIN,
  mentionedJid: [],
  text: '',
  key: { id: 'k1' },
  reply: async () => {},
  ...over
})

const run = async (command, over = {}, ctx = {}) => {
  const { default: handler } = await import('../plugins/group-mute.js')
  const conn = makeConn()
  const m = makeMsg(over)
  m.reply = async (text) => { conn.replies.push({ chat: m.chat, text }) }
  await handler(m, {
    conn,
    command,
    text: m.text,
    isAdmin: true,
    isOwner: false,
    participants: groupInfo().participants,
    groupMetadata: groupInfo(),
    ...ctx
  })
  return { conn, m, chat: global.db.data.chats[m.chat] }
}

test('كتم: بيضيف العضو لقايمة المكتومين', async (t) => {
  if (skipNoDeps(t)) return
  setup()
  const { conn, chat } = await run('كتم', { mentionedJid: [MEMBER] })

  assert.deepEqual(chat.mutedUsers, [MEMBER])
  assert.match(conn.replies[0].text, /اتكتم/)
  assert.deepEqual(conn.replies[0].opts.mentions, [MEMBER])
})

test('كتم: مش بيكتم مرتين', async (t) => {
  if (skipNoDeps(t)) return
  setup()
  await run('كتم', { mentionedJid: [MEMBER] })
  const { conn, chat } = await run('كتم', { mentionedJid: [MEMBER] })

  assert.equal(chat.mutedUsers.length, 1)
  assert.match(conn.replies[0].text, /مكتوم بالفعل/)
})

test('فك_كتم: بيشيل العضو من القايمة', async (t) => {
  if (skipNoDeps(t)) return
  setup()
  await run('كتم', { mentionedJid: [MEMBER] })
  const { conn, chat } = await run('فك_كتم', { mentionedJid: [MEMBER] })

  assert.deepEqual(chat.mutedUsers, [])
  assert.match(conn.replies[0].text, /اتفك كتمه/)
})

test('فك_كتم: عضو مش مكتوم', async (t) => {
  if (skipNoDeps(t)) return
  setup()
  const { conn } = await run('فك_كتم', { mentionedJid: [MEMBER] })
  assert.match(conn.replies[0].text, /مش مكتوم/)
})

test('كتم بالرد على رسالة العضو', async (t) => {
  if (skipNoDeps(t)) return
  setup()
  const { chat } = await run('كتم', { quoted: { sender: MEMBER } })
  assert.deepEqual(chat.mutedUsers, [MEMBER])
})

test('كتم بالرقم في النص', async (t) => {
  if (skipNoDeps(t)) return
  setup()
  const { chat } = await run('كتم', { text: '201222222222' })
  assert.deepEqual(chat.mutedUsers, [MEMBER])
})

test('بدون منشن: رسالة توضيح', async (t) => {
  if (skipNoDeps(t)) return
  setup()
  const { conn } = await run('كتم')
  assert.match(conn.replies[0].text, /اعمل منشن/)
})

test('مش جروب: مرفوض', async (t) => {
  if (skipNoDeps(t)) return
  setup()
  const { conn } = await run('كتم', { isGroup: false, mentionedJid: [MEMBER] })
  assert.match(conn.replies[0].text, /للجروبات بس/)
})

test('مش مشرف: مرفوض', async (t) => {
  if (skipNoDeps(t)) return
  setup()
  const { conn, chat } = await run('كتم', { mentionedJid: [MEMBER] }, { isAdmin: false })
  assert.match(conn.replies[0].text, /المشرفين بس/)
  assert.equal(chat, undefined)
})

test('حماية: مش بيكتم المطور ولا البوت', async (t) => {
  if (skipNoDeps(t)) return
  setup()
  const a = await run('كتم', { mentionedJid: [OWNER] })
  assert.match(a.conn.replies[0].text, /مش تقدر تكتم/)

  const b = await run('كتم', { mentionedJid: [BOT] })
  assert.match(b.conn.replies[0].text, /مش تقدر تكتم/)
})

test('عضو مش في الجروب', async (t) => {
  if (skipNoDeps(t)) return
  setup()
  const { conn } = await run('كتم', { mentionedJid: ['201999999999@s.whatsapp.net'] })
  assert.match(conn.replies[0].text, /مش عضو/)
})

test('before: بيحذف رسايل المكتوم وبيسمح لغير المكتوم', async (t) => {
  if (skipNoDeps(t)) return
  setup()
  const { default: handler } = await import('../plugins/group-mute.js')

  await run('كتم', { mentionedJid: [MEMBER] })
  const chat = global.db.data.chats['120363@g.us']

  const conn = makeConn()
  const mutedMsg = makeMsg({ sender: MEMBER })
  const blocked = await handler.before(mutedMsg, { conn, chat, isBotAdmin: true })
  assert.equal(blocked, true)
  assert.deepEqual(conn.deleted, [{ delete: mutedMsg.key }])

  const ok = await handler.before(makeMsg({ sender: ADMIN }), { conn, chat, isBotAdmin: true })
  assert.equal(ok, false)
  assert.equal(conn.deleted.length, 1)

  const notBotAdmin = await handler.before(makeMsg({ sender: MEMBER }), { conn, chat, isBotAdmin: false })
  assert.equal(notBotAdmin, false)
})

test('chat مش موجود في الـdb مبيcrashش', async (t) => {
  if (skipNoDeps(t)) return
  setup()
  const { chat } = await run('كتم', { mentionedJid: [MEMBER], chat: 'جديد@g.us' })
  assert.deepEqual(chat.mutedUsers, [MEMBER])
})
