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

const loadAll = async () => {
  const plugins = {}
  for (const f of fs.readdirSync(path.join(root, 'plugins')).filter(x => x.endsWith('.js'))) {
    if (f === 'jadibot-serbot.js') continue
    plugins[f] = await import(`../plugins/${f}`)
  }
  return plugins
}

const allNames = (plugins) => {
  const set = new Set()
  for (const mod of Object.values(plugins)) {
    const h = mod.default
    for (const c of [].concat(h?.command || [])) if (typeof c === 'string') set.add(c)
  }
  return set
}

test('أسماء البوتات المصرية موجودة', async (t) => {
  if (skipNoDeps(t)) return
  const names = allNames(await loadAll())
  const egyptian = [
    'منيو', 'اوامر', 'الاوامر', 'قائمة', 'القائمة',
    'المطور', 'مطور',
    'ضيف', 'اضف', 'طرد', 'حظر', 'تبنيد', 'المبندين', 'المحظورين',
    'الغاء_الحظر', 'فك_حظر',
    'تاج', 'منشن', 'منشن_الكل',
    'جروب', 'الجروب', 'معلومات_الجروب',
    'ترتيب', 'توب', 'رانك', 'لفل',
    'رهان', 'راهن', 'اكس', 'اكس_او',
    'اغنيه', 'يوتيوب', 'فيديو', 'صوت',
    'الترحيب', 'ترحيب', 'مغادرة',
    'يومي', 'اسبوعي', 'شهري', 'رصيد', 'بنك', 'ملفي', 'بروفايل', 'بينج'
  ]
  const missing = egyptian.filter(n => !names.has(n))
  assert.deepEqual(missing, [])
})

test('الأوامر الملهاش لزمة اتشالت', async (t) => {
  if (skipNoDeps(t)) return
  const names = allNames(await loadAll())
  for (const gone of ['انتحار', 'شحاته', 'شغل_اضافي', 'غش', 'نور', 'كهربا', 'رصيدي', 'تيس']) {
    assert.ok(!names.has(gone), `لسه موجود: ${gone}`)
  }
  for (const gone of ['لحس', 'مداعبة', 'اغراء']) {
    assert.ok(!names.has(gone), `تفاعل لسه موجود: ${gone}`)
  }
  const removedFiles = ['utils-test.js', 'info-luz.js', 'anime-suicidar.js', 'rpg-slut.js', 'search-ba.js', 'owner-chetar.js']
  for (const f of removedFiles) assert.ok(!fs.existsSync(path.join(root, 'plugins', f)), `الملف لسه موجود: ${f}`)
})

test('.ضيف بيضيف بالرقم وبيتعامل مع رد واتساب', async (t) => {
  if (skipNoDeps(t)) return
  const { default: add } = await import('../plugins/group-add.js')

  const calls = []
  let added = null
  const conn = {
    groupParticipantsUpdate: async (chat, jids, action) => {
      added = { chat, jids, action }
      return [{ status: '200' }]
    },
    sendMessage: async (chat, content) => calls.push(content),
    reply: async (chat, text) => calls.push({ text })
  }

  await add({ chat: 'g@g.us', sender: 'u@s.whatsapp.net', key: { id: '1' } }, { conn, text: '+20 101 234 5678' })
  assert.deepEqual(added, { chat: 'g@g.us', jids: ['201012345678@s.whatsapp.net'], action: 'add' })
  assert.ok(calls.at(-1).text.includes('تم إضافة'))
  assert.deepEqual(calls.at(-1).mentions, ['201012345678@s.whatsapp.net'])

  await add({ chat: 'g@g.us', sender: 'u@s.whatsapp.net', key: { id: '2' } }, { conn, text: '' })
  assert.ok(calls.at(-1).text.includes('اكتب رقم المستخدم'))
})

test('.المبندين بيعرض المحظورين من الداتابيز', async (t) => {
  if (skipNoDeps(t)) return
  const { default: banlist } = await import('../plugins/owner-banlist.js')
  globalThis.db = { data: { users: {
    '201111111111@s.whatsapp.net': { banned: true, name: 'أحمد' },
    '201222222222@s.whatsapp.net': { banned: true },
    '201333333333@s.whatsapp.net': { banned: false }
  } } }

  const calls = []
  const conn = { sendMessage: async (c, content) => calls.push(content) }
  await banlist({ chat: 'g@g.us', sender: 'o@s.whatsapp.net' }, { conn })

  const text = calls[0].text
  assert.ok(text.includes('المحظورين:* 2'))
  assert.ok(text.includes('201111111111') && text.includes('أحمد'))
  assert.ok(!text.includes('201333333333'), 'متطمن: مفيش محظور غير مذكور')
  assert.deepEqual(calls[0].contextInfo.mentionedJid.sort(), ['201111111111@s.whatsapp.net', '201222222222@s.whatsapp.net'])
})
