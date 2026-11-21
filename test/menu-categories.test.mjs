import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { resolveCommand } from '../lib/command-resolver.js'

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
