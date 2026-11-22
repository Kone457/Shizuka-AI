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

const setup = () => {
  global.db = { data: { chats: {}, settings: {} }, write: async () => {} }
}

const run = async (command, args, { chat = '120363@g.us', isOwner = false } = {}) => {
  const { default: handler } = await import('../plugins/group-on_off.js')
  const calls = []
  const m = { chat, isGroup: true, reply: async (t) => { calls.push(t) } }
  await handler(m, { conn: { user: { jid: '2011@s.whatsapp.net' } }, args, command, isOwner })
  return { calls, chatData: global.db.data.chats[chat] }
}

test('«تشغيل ترحيب» بيفعّل فعلًا (مش بيقفل)', async (t) => {
  if (skipNoDeps(t)) return
  setup()
  const { chatData, calls } = await run('تشغيل', ['ترحيب'])
  assert.equal(chatData.welcome, true)
  assert.match(calls[0], /مفعّلة/)
})

test('«ايقاف ترحيب» بيقفل', async (t) => {
  if (skipNoDeps(t)) return
  setup()
  global.db.data.chats['120363@g.us'] = { welcome: true }
  const { chatData, calls } = await run('ايقاف', ['ترحيب'])
  assert.equal(chatData.welcome, false)
  assert.match(calls[0], /مقفولة/)
})

test('«تفعيل» بيفعّل زي تشغيل', async (t) => {
  if (skipNoDeps(t)) return
  setup()
  const { chatData } = await run('تفعيل', ['اللينكات'])
  assert.equal(chatData.antiLink, true)
})

test('«on»/«off» لسه شغالين', async (t) => {
  if (skipNoDeps(t)) return
  setup()
  assert.equal((await run('on', ['القنوات'])).chatData.antichannel, true)
  assert.equal((await run('off', ['القنوات'])).chatData.antichannel, false)
})

test('بدون اختيار: بيعرض قايمة الإعدادات', async (t) => {
  if (skipNoDeps(t)) return
  setup()
  const { calls } = await run('تشغيل', [])
  assert.match(calls[0], /الإعدادات/)
})

test('اختيار غلط: رسالة خطأ + القايمة', async (t) => {
  if (skipNoDeps(t)) return
  setup()
  const { calls } = await run('تشغيل', ['كلام_فاضي'])
  assert.match(calls[0], /اختيار غير صحيح/)
})

test('«الفرعية» للمطور بس', async (t) => {
  if (skipNoDeps(t)) return
  setup()
  global.db.data.settings['2011@s.whatsapp.net'] = { jadibotmd: false }

  const member = await run('تشغيل', ['الفرعية'], { isOwner: false })
  assert.match(member.calls[0], /المطور بس/)
  assert.equal(global.db.data.settings['2011@s.whatsapp.net'].jadibotmd, false)

  await run('تشغيل', ['الفرعية'], { isOwner: true })
  assert.equal(global.db.data.settings['2011@s.whatsapp.net'].jadibotmd, true)
})

test('جروب مش موجود في الـdb مبيcrashش', async (t) => {
  if (skipNoDeps(t)) return
  setup()
  const { chatData } = await run('تشغيل', ['المستويات'], { chat: 'جديد@g.us' })
  assert.equal(chatData.level, true)
})
