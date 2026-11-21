import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { resolveCommand, matchesResolved, acceptsCommand } from '../lib/command-resolver.js'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const hasDeps = fs.existsSync(path.join(root, 'node_modules'))

const skipNoDeps = (t) => {
  if (hasDeps) return false
  t.skip('محتاج npm install الأول (اختبار على الـplugins الحقيقية)')
  return true
}

const loadRealPlugins = async () => {
  const plugins = {}
  const dir = path.join(root, 'plugins')
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.js')).sort()) {
    try {
      const h = (await import(path.join(dir, f))).default
      if (h && h.command) plugins[f] = h
    } catch {}
  }
  return plugins
}

// الرسالة الواحدة لازم تنفّذ plugin واحد بالكتير — ده اللي كان بيخلي البوت يبعت أوامر ورا بعض
const dispatchCount = (plugins, text) => {
  const resolved = resolveCommand(plugins, text)
  if (!resolved) return 0
  return Object.values(plugins).filter(p => matchesResolved(p, resolved)).length
}

test('matchesResolved: الـplugin المطابق بس', () => {
  const resolved = { command: 'طرد', consumed: 1, plugin: 'group-kick.js' }
  assert.equal(matchesResolved({ command: ['kick', 'طرد'] }, resolved), true)
  assert.equal(matchesResolved({ command: ['menu', 'قائمة'] }, resolved), false)
  assert.equal(matchesResolved({ command: ['kick', 'طرد'], disabled: true }, resolved), false)
  assert.equal(matchesResolved({ command: ['kick', 'طرد'] }, null), false)
  assert.equal(matchesResolved(null, resolved), false)
})

test('matchesResolved: الأوامر اللي فيها مسافة', () => {
  const resolved = { command: 'طرد_الكل', consumed: 1, plugin: 'group-kickall.js' }
  assert.equal(matchesResolved({ command: ['kickall', 'طرد_الكل'] }, resolved), true)
  assert.equal(matchesResolved({ command: ['kick', 'طرد'] }, resolved), false)
})

test('الأوامر اللي ليها customPrefix (زي $) لسه شغالة', () => {
  assert.equal(acceptsCommand(/(?:)/, 'ls', { allowCatchAll: true }), true)
  assert.equal(acceptsCommand(/(?:)/, 'ls'), false)
  assert.equal(acceptsCommand(/^\$ /, '$ ls', { allowCatchAll: true }), true)
})

test('رسالة واحدة = plugin واحد بالكتير (plugins حقيقية)', async (t) => {
  if (skipNoDeps(t)) return
  const plugins = await loadRealPlugins()
  assert.ok(Object.keys(plugins).length > 100, 'المفروض يتحمّل أكتر من ١٠٠ plugin')
  const texts = ['اوامر', 'بينج', 'طرد', 'طرد_الكل', 'توب_المستوى', 'كتم', 'تشغيل', 'يومي', 'ملصق', 'غضب', 'معلومات_الجروب']
  for (const text of texts) {
    const n = dispatchCount(plugins, text)
    assert.equal(n, 1, `"${text}" شغّلت ${n} plugin بدل ١`)
  }
})

test('رسالة مش أمر = صفر تنفيذ', async (t) => {
  if (skipNoDeps(t)) return
  const plugins = await loadRealPlugins()
  assert.equal(dispatchCount(plugins, 'كلام عشوائي خالص'), 0)
})

test('مفيش أسماء أوامر متكررة بين الـplugins', async (t) => {
  if (skipNoDeps(t)) return
  const plugins = await loadRealPlugins()
  const owner = new Map()
  const dup = []
  for (const [file, h] of Object.entries(plugins)) {
    if (h.customPrefix) continue
    const names = h.command instanceof RegExp ? [] : (Array.isArray(h.command) ? h.command : [h.command])
    for (const n of names) {
      if (typeof n !== 'string') continue
      if (owner.has(n) && owner.get(n) !== file) dup.push(`${n}: ${owner.get(n)} + ${file}`)
      else owner.set(n, file)
    }
  }
  assert.deepEqual(dup, [], 'أوامر متكررة هتشغّل أكتر من plugin')
})

test('handler.js لازم يفلتر كل plugin على حدة (حماية من رجوع الباج)', () => {
  const src = fs.readFileSync(path.join(root, 'handler.js'), 'utf8')
  assert.match(src, /if \(!matchesResolved\(plugin, resolved\) \|\| name !== resolved\.plugin\) continue/, 'الفحص لكل plugin مش موجود في handler.js')
  assert.match(src, /if \(!acceptsCommand\(plugin\.command, command, \{ allowCatchAll: true \}\)\) continue/, 'فحص الأوامر اللي ليها customPrefix مش موجود')
})
