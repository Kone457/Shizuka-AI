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

const load = async () => import('../plugins/download-play.js')

test('اختيار الصوت/الفيديو: 1 = صوت، 2 = فيديو', async (t) => {
  if (skipNoDeps(t)) return
  const { parseChoice } = await load()
  assert.deepEqual(parseChoice('1'), { isAudio: true, idx: 1 })
  assert.deepEqual(parseChoice('2'), { isAudio: false, idx: 1 })
  assert.deepEqual(parseChoice('.1'), { isAudio: true, idx: 1 })
  assert.deepEqual(parseChoice('صوت'), { isAudio: true, idx: 1 })
  assert.deepEqual(parseChoice('فيديو'), { isAudio: false, idx: 1 })
  assert.deepEqual(parseChoice('صوت 3'), { isAudio: true, idx: 3 })
  assert.deepEqual(parseChoice('فيديو 2'), { isAudio: false, idx: 2 })
  assert.deepEqual(parseChoice('فيديو3'), { isAudio: false, idx: 3 })
  for (const bad of ['', 'اهلا', '3', '0', 'صوت 0x', 'فيديو -1']) {
    assert.equal(parseChoice(bad), null, `المفروض يرفض: ${bad}`)
  }
})

test('نص البحث فيه النتائج المرقّمة + منشن اليوزر + الخيارين', async (t) => {
  if (skipNoDeps(t)) return
  const { buildSearchText } = await load()
  const results = [
    { title: 'أغنية أولى', timestamp: '3:45', author: { name: 'قناة 1' } },
    { title: 'أغنية تانية', timestamp: '4:10', author: { name: 'قناة 2' } }
  ]
  const text = buildSearchText('عمر دياب', results, { sender: '201111111111@s.whatsapp.net' })
  assert.ok(text.includes('@201111111111'), 'مفيش منشن لليوزر')
  assert.ok(text.includes('1. *أغنية أولى*'))
  assert.ok(text.includes('2. *أغنية تانية*'))
  assert.ok(text.includes('1️⃣') && text.includes('*صوت*'))
  assert.ok(text.includes('2️⃣') && text.includes('*فيديو*'))
})

test('before بيرد على الاختيار وبيشيل الجلسة، وبيتجاهل الرسايل العادية', async (t) => {
  if (skipNoDeps(t)) return
  const mod = await load()
  const handler = mod.default
  const key = 'chat1@c.us|user1@s.whatsapp.net'
  const calls = []
  const conn = {
    sendMessage: async (chat, content) => { calls.push(content) },
    profilePictureUrl: async () => { throw new Error('no pp') },
    waUploadToServer: async () => ({})
  }

  const plain = { chat: 'chat1@c.us', sender: 'user1@s.whatsapp.net', text: 'اهلا بيك', key: { id: 'x' } }
  assert.equal(await handler.before(plain, { conn }), false, 'رسالة عادية المفروض تتجاهل')

  mod.playSessions.set(key, { results: [{ url: 'https://youtu.be/abc', title: 't' }], at: Date.now() })
  assert.equal(await handler.before({ ...plain, text: 'اهلا' }, { conn }), false, 'مش اختيار')
  assert.ok(mod.playSessions.has(key), 'الجلسة اتشالت بالغلط')

  await handler.before({ ...plain, text: '1' }, { conn })
  assert.ok(!mod.playSessions.has(key), 'الجلسة المفروض تتشال بعد الاختيار')
  assert.ok(calls.length >= 1, 'مفيش أي رد بعد الاختيار')
})

test('الجلسة بتخلص بعد ٥ دقايق', async (t) => {
  if (skipNoDeps(t)) return
  const mod = await load()
  const key = 'chat2@c.us|user2@s.whatsapp.net'
  mod.playSessions.set(key, { results: [{ url: 'x' }], at: Date.now() - 6 * 60 * 1000 })
  const conn = { sendMessage: async () => {} }
  const res = await mod.default.before({ chat: 'chat2@c.us', sender: 'user2@s.whatsapp.net', text: '1', key: { id: 'y' } }, { conn })
  assert.equal(res, false)
  assert.ok(!mod.playSessions.has(key), 'الجلسة القديمة المفروض تتشال')
})
