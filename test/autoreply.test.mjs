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

const fresh = () => {
  global.db = { data: { chats: {}, settings: {}, users: {} }, write: async () => {} }
  global.autoReply = {
    on: true,
    mode: 'contains',
    rules: [
      { k: 'بوت', r: ['اسمي *هينا* 🌸'] },
      { k: 'شغال', r: ['أرحب 🌸'] }
    ]
  }
}

const fakeMsg = (text, { chat = 'g1@g.us', isGroup = true, name = 'أحمد' } = {}) => {
  const calls = []
  return {
    calls,
    m: {
      chat,
      isGroup,
      fromMe: false,
      isBaileys: false,
      text,
      pushName: name,
      reply: async (t) => { calls.push(t) }
    }
  }
}

const conn = { user: { jid: '2011@s.whatsapp.net' } }

test('normalize بيوحّد الهمزات والتاء المربوطة والتشكيل', async (t) => {
  if (skipNoDeps(t)) return
  const { normalize } = await import('../plugins/tools-autoreply.js')
  assert.equal(normalize('شغّالة يا روحي؟'), 'شغاله يا روحي')
  assert.equal(normalize('أهلاً وسهلاً'), 'اهلا وسهلا')
  assert.equal(normalize('مصطفى'), 'مصطفي')
  assert.equal(normalize('  البوت  '), 'البوت')
})

test('findRule: جزئي بيطابق بداية الكلمة، ودقيق لازم الكلمة كلها', async (t) => {
  if (skipNoDeps(t)) return
  const { findRule } = await import('../plugins/tools-autoreply.js')
  const rules = [{ k: 'بوت', r: ['اسمي هينا'] }, { k: 'شغال', r: ['أرحب'] }]

  assert.equal(findRule('شغاله يا روحي', rules)?.k, 'شغال')
  assert.equal(findRule('انت بوت؟', rules)?.k, 'بوت')
  assert.equal(findRule('السلام عليكم', rules), null)
  assert.equal(findRule('تابوت', rules), null, 'مفروض ميطابقش جوّه كلمة')

  assert.equal(findRule('بوت', rules, 'exact')?.k, 'بوت')
  assert.equal(findRule('انت بوت', rules, 'exact'), null)
})

test('اضف/حذف قواعد الجروب + الحد الأقصى للردود', async (t) => {
  if (skipNoDeps(t)) return
  const { addRule, removeRule, getStore } = await import('../plugins/tools-autoreply.js')
  fresh()

  assert.equal(addRule('g1@g.us', 'تمام', 'أكيد يا باشا').ok, true)
  assert.equal(addRule('g1@g.us', 'تمام', 'وبكل ثقة').ok, true)
  assert.equal(getStore('g1@g.us').rules.length, 1)
  assert.deepEqual(getStore('g1@g.us').rules[0].r, ['أكيد يا باشا', 'وبكل ثقة'])

  assert.equal(addRule('g1@g.us', '', 'x').ok, false)
  assert.equal(addRule('g1@g.us', 'كلمه', '   ').ok, false)

  assert.equal(removeRule('g1@g.us', 'تمام').ok, true)
  assert.equal(getStore('g1@g.us').rules.length, 0)
  assert.equal(removeRule('g1@g.us', 'تمام').ok, false)
})

test('الأمر: مشرف يضيف، وعضو عادي ميتقبلش', async (t) => {
  if (skipNoDeps(t)) return
  const { default: handler } = await import('../plugins/tools-autoreply.js')
  fresh()

  const admin = fakeMsg('اضف مرحبا | هلا بيك ; نوّرت')
  await handler(admin.m, { conn, text: 'اضف مرحبا | هلا بيك ; نوّرت', isAdmin: true, isOwner: false })
  assert.match(admin.calls[0], /اتضافت/)
  assert.deepEqual(global.db.data.chats['g1@g.us'].autoreply.rules[0].r, ['هلا بيك', 'نوّرت'])

  const member = fakeMsg('اضف بوت | اسمي انا')
  await handler(member.m, { conn, text: 'اضف بوت | اسمي انا', isAdmin: false, isOwner: false })
  assert.match(member.calls[0], /للمشرفين/)
})

test('before بيرد على «شغاله يا روحي» و«بوت» وبيتجاهل الأوامر', async (t) => {
  if (skipNoDeps(t)) return
  const { default: handler } = await import('../plugins/tools-autoreply.js')
  fresh()

  const a = fakeMsg('شغاله يا روحي')
  await handler.before(a.m, { conn, groupMetadata: { subject: 'جروب التجارب' } })
  assert.deepEqual(a.calls, ['أرحب 🌸'])

  const b = fakeMsg('انت بوت؟', { chat: 'g2@g.us' })
  await handler.before(b.m, { conn, groupMetadata: {} })
  assert.deepEqual(b.calls, ['اسمي *هينا* 🌸'])

  const c = fakeMsg('.منيو')
  await handler.before(c.m, { conn, groupMetadata: {} })
  assert.deepEqual(c.calls, [], 'الأوامر لازم تتجاهل')

  const d = fakeMsg('')
  await handler.before(d.m, { conn, groupMetadata: {} })
  assert.deepEqual(d.calls, [])
})

test('الاطفاء بيوقف الردود، والتشغيل بيرجّعها', async (t) => {
  if (skipNoDeps(t)) return
  const { default: handler, getStore } = await import('../plugins/tools-autoreply.js')
  fresh()

  const off = fakeMsg('اطفاء', { chat: 'g3@g.us' })
  await handler(off.m, { conn, text: 'اطفاء', isAdmin: true, isOwner: false })
  assert.equal(getStore('g3@g.us').on, false)

  const m1 = fakeMsg('شغاله يا روحي', { chat: 'g3@g.us' })
  await handler.before(m1.m, { conn, groupMetadata: {} })
  assert.deepEqual(m1.calls, [])

  await handler(fakeMsg('تشغيل', { chat: 'g3@g.us' }).m, { conn, text: 'تشغيل', isAdmin: true, isOwner: false })
  const m2 = fakeMsg('شغاله يا روحي', { chat: 'g3@g.us' })
  await handler.before(m2.m, { conn, groupMetadata: {} })
  assert.deepEqual(m2.calls, ['أرحب 🌸'])
})

test('الوضع الدقيق: «انت بوت» مبيردش، «بوت» بيرد', async (t) => {
  if (skipNoDeps(t)) return
  const { default: handler } = await import('../plugins/tools-autoreply.js')
  fresh()

  await handler(fakeMsg('دقيق', { chat: 'g4@g.us' }).m, { conn, text: 'دقيق', isAdmin: true, isOwner: false })

  const no = fakeMsg('انت بوت', { chat: 'g4@g.us' })
  await handler.before(no.m, { conn, groupMetadata: {} })
  assert.deepEqual(no.calls, [])

  const yes = fakeMsg('بوت', { chat: 'g5@g.us' })
  await handler(fakeMsg('دقيق', { chat: 'g5@g.us' }).m, { conn, text: 'دقيق', isAdmin: true, isOwner: false })
  await handler.before(yes.m, { conn, groupMetadata: {} })
  assert.deepEqual(yes.calls, ['اسمي *هينا* 🌸'])
})

test('كولداون: مش بيرد مرتين ورا بعض على نفس القاعدة', async (t) => {
  if (skipNoDeps(t)) return
  const { default: handler } = await import('../plugins/tools-autoreply.js')
  fresh()

  const one = fakeMsg('شغاله يا روحي', { chat: 'g6@g.us' })
  await handler.before(one.m, { conn, groupMetadata: {} })
  const two = fakeMsg('شغاله يا روحي', { chat: 'g6@g.us' })
  await handler.before(two.m, { conn, groupMetadata: {} })

  assert.equal(one.calls.length, 1)
  assert.equal(two.calls.length, 0)
})

test('المتغيرات {اسم} و{بوت} بتتبدل + أمر تجربة', async (t) => {
  if (skipNoDeps(t)) return
  const { default: handler, renderReply } = await import('../plugins/tools-autoreply.js')
  fresh()
  global.botname = 'هينا'

  assert.equal(
    renderReply('أهلاً {اسم} أنا {بوت} في {جروب}', { name: 'سارة', bot: 'هينا', group: 'المطبخ' }),
    'أهلاً سارة أنا هينا في المطبخ'
  )

  await handler(fakeMsg('اضف يا هلا | أهلاً {اسم} 🌸', { chat: 'g7@g.us' }).m,
    { conn, text: 'اضف يا هلا | أهلاً {اسم} 🌸', isAdmin: true, isOwner: false })

  const out = fakeMsg('تجربة يا هلا', { chat: 'g7@g.us', name: 'منة' })
  await handler(out.m, { conn, text: 'تجربة يا هلا', isAdmin: true, isOwner: false })
  assert.match(out.calls[0], /أهلاً منة/)
})
