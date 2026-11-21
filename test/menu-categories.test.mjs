import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { resolveCommand, acceptsCommand } from '../lib/command-resolver.js'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const hasDeps = fs.existsSync(path.join(root, 'node_modules'))

const skipNoDeps = (t) => {
  if (hasDeps) return false
  t.skip('محتاج npm install الأول (اختبار على الـplugins الحقيقية)')
  return true
}

const loadPlugins = async () => {
  const plugins = {}
  const dir = path.join(root, 'plugins')
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.js')).sort()) {
    try {
      const h = (await import(path.join(dir, f))).default
      if (h) plugins[f] = h
    } catch {}
  }
  return plugins
}

const setup = async () => {
  global.plugins = await loadPlugins()
  return import('../plugins/info-menu.js')
}

test('الأقسام بتتجمّع وكل قسم فيه أوامر', async (t) => {
  if (skipNoDeps(t)) return
  const { collectCategories } = await setup()
  const cats = collectCategories()
  assert.ok(cats.length >= 10, `أقسام قليلة: ${cats.length}`)
  for (const c of cats) {
    assert.ok(c.cmds.length > 0, `قسم فاضي: ${c.label}`)
    assert.equal(new Set(c.cmds).size, c.cmds.length)
  }
  const labels = cats.map(c => c.label)
  assert.equal(new Set(labels).size, labels.length, 'فيه قسمين بنفس الاسم')
})

test('قائمة الأقسام فيها .ق1 وترقيم متسلسل', async (t) => {
  if (skipNoDeps(t)) return
  const { collectCategories, buildIndexText } = await setup()
  const cats = collectCategories()
  const text = buildIndexText({ categories: cats, userName: 'تست', botname: 'بوت', botType: '', channelUrl: '' })
  cats.forEach((c, i) => assert.equal(c.n, i + 1))
  for (const c of cats) assert.ok(text.includes(`*ق${c.n}*`), `ق${c.n} مش في القائمة`)
  assert.ok(text.includes('*.ق1*'))
})

test('صفحة القسم بتعرض أوامر القسم بس + تنقّل', async (t) => {
  if (skipNoDeps(t)) return
  const { collectCategories, buildCategoryText } = await setup()
  const cats = collectCategories()
  const first = buildCategoryText({ categories: cats, index: 1, userName: 'تست', botname: 'بوت', channelUrl: '' })
  for (const cmd of cats[0].cmds) assert.ok(first.includes(`.${cmd}`), `أمر ناقص: ${cmd}`)
  for (const cmd of cats[1].cmds) {
    if (cats[0].cmds.includes(cmd)) continue
    assert.ok(!first.includes(`.${cmd}`), `أمر من قسم تاني ظهر: ${cmd}`)
  }
  assert.ok(first.includes('*.اوامر* رجوع'))
  assert.ok(first.includes('*.ق2* التالي'))

  const last = buildCategoryText({ categories: cats, index: cats.length, userName: 'تست', botname: 'بوت', channelUrl: '' })
  assert.ok(!last.includes('التالي'))
  assert.ok(last.includes(`*.ق${cats.length - 1}* السابق`))
})

test('أمر .ق1 بيتحل على info-menu', async (t) => {
  if (skipNoDeps(t)) return
  const plugins = await loadPlugins()
  for (const n of [1, 2, 7, 13]) {
    const r = resolveCommand(plugins, `ق${n}`)
    assert.ok(r, `ق${n} مش بيتحل`)
    assert.equal(r.plugin, 'info-menu.js')
  }
})

test('مفيش أوامر إباحية خالص', async (t) => {
  if (skipNoDeps(t)) return
  const plugins = await loadPlugins()
  const bad = []
  for (const [f, p] of Object.entries(plugins)) {
    if (p.nsfw) bad.push(`${f}:nsfw`)
    const helps = [].concat(p.help || [])
    for (const h of helps) if (/سكس|اباحي|إباحي|لولي|نيكو|xnxx|hentai|porn/i.test(String(h))) bad.push(`${f}:${h}`)
  }
  assert.deepEqual(bad, [])
  const files = fs.readdirSync(path.join(root, 'plugins'))
  assert.ok(!files.some(f => f.startsWith('nsfw-')), 'فيه ملفات nsfw لسه موجودة')
})

test('قسم المطور موجود وأوامره مش متكررة في أقسام تانية', async (t) => {
  if (skipNoDeps(t)) return
  const { collectCategories } = await setup()
  const cats = collectCategories()
  const owner = cats.find(c => c.label.includes('المطور'))
  assert.ok(owner, 'قسم المطور مش موجود')
  assert.ok(owner.cmds.length >= 10, `أوامر المطور قليلة: ${owner.cmds.length}`)
  for (const c of cats) {
    if (c === owner) continue
    const overlap = c.cmds.filter(x => owner.cmds.includes(x))
    assert.deepEqual(overlap, [], `أوامر مطور ظهرت في ${c.label}`)
  }
})

test('كل قسم فيه إيموجي', async (t) => {
  if (skipNoDeps(t)) return
  const { collectCategories, buildIndexText } = await setup()
  const cats = collectCategories()
  for (const c of cats) assert.ok(c.emoji && c.emoji !== '▸', `قسم من غير إيموجي: ${c.label}`)
  const text = buildIndexText({ categories: cats, userName: 'تست', botname: 'بوت', botType: '', channelUrl: '' })
  for (const c of cats) assert.ok(text.includes(c.emoji), `إيموجي ${c.label} مش في القائمة`)
})

test('رد المينيو بيبقى ردّ (quote) على رسالة اليوزر', async (t) => {
  if (skipNoDeps(t)) return
  global.plugins = await loadPlugins()
  global.db = { data: { users: {}, chats: {}, settings: {} } }
  const mod = await import('../plugins/info-menu.js')
  const calls = []
  const conn = {
    user: { jid: '201000000000:1@s.whatsapp.net', id: '201000000000:1@s.whatsapp.net' },
    sendMessage: async (chat, content, opts) => { calls.push({ content, opts }) },
    profilePictureUrl: async () => { throw new Error('no pp') },
    waUploadToServer: async () => ({})
  }
  const m = { chat: '201111111111@s.whatsapp.net', sender: '201111111111@s.whatsapp.net', pushName: 'تست', key: { id: 'ABC', remoteJid: '201111111111@s.whatsapp.net' }, message: { conversation: '.ق1' } }
  await mod.default.call(conn, m, { conn, command: 'ق1', args: [], usedPrefix: '.', text: '' })
  const reply = calls.filter(c => !c.content.react).pop()
  assert.ok(reply, 'مفيش رد اتـsend')
  assert.equal(reply.opts?.quoted, m, 'الرد مش quote على رسالة اليوزر')
  assert.match(reply.content.caption || reply.content.text, /معلومات/)
})

test('أسماء الأوامر موحّدة: مفيش مسافات/شرطات، مفيش تكرار، help ⊆ command', async (t) => {
  if (skipNoDeps(t)) return
  const plugins = await loadPlugins()
  const AR = /[\u0600-\u06FF]/
  const seen = new Map()
  const problems = []
  for (const [f, p] of Object.entries(plugins)) {
    if (p.customPrefix) continue
    const cmds = [].concat(p.command || []).filter(c => typeof c === 'string')
    for (const c of cmds) {
      if (AR.test(c)) {
        if (c.includes(' ')) problems.push(`${f}: مسافة في "${c}"`)
        if (c.includes('-')) problems.push(`${f}: شرطة في "${c}"`)
        if (/^_|_$|__/.test(c)) problems.push(`${f}: شرطة سفلية زيادة في "${c}"`)
      }
      if (seen.has(c) && seen.get(c) !== f) problems.push(`تكرار "${c}" في ${seen.get(c)} و ${f}`)
      seen.set(c, f)
    }
    for (const h of [].concat(p.help || [])) {
      if (typeof h !== 'string') continue
      if (!acceptsCommand(p.command, h)) problems.push(`${f}: help "${h}" مش في command`)
    }
  }
  assert.deepEqual(problems, [])
})

test('كل أمر عربي بيتحل على الـplugin بتاعه', async (t) => {
  if (skipNoDeps(t)) return
  const plugins = await loadPlugins()
  const AR = /[\u0600-\u06FF]/
  const bad = []
  for (const [f, p] of Object.entries(plugins)) {
    for (const c of [].concat(p.command || [])) {
      if (typeof c !== 'string' || !AR.test(c)) continue
      const r = resolveCommand(plugins, c)
      if (!r || r.plugin !== f) bad.push(`${c} → ${r?.plugin || 'null'} (المفروض ${f})`)
    }
  }
  assert.deepEqual(bad, [])
})
