import test from 'node:test'
import assert from 'node:assert/strict'
import { resolveCommand, acceptsCommand } from '../lib/command-resolver.js'

const plugins = {
  'info-menu.js': { command: ['menu', 'قائمة'] },
  'profile-level.js': { command: ['niveles', 'top', 'ترتيبالمستويات', 'ترتيب المستويات'] },
  'group-kick.js': { command: ['kick', 'طرد'] },
  'group-kickall.js': { command: ['kickall', 'طردالكل', 'طرد الكل'] },
  'ai-gemini.js': { command: ['gemini', 'ذكاء اصطناعي'] },
  'owner-$.js': { command: /(?:)/, customPrefix: /^\$/ },
  'anime-reaction.js': { command: /^(hug|حضن)$/i },
  'disabled.js': { command: ['يومي'], disabled: true }
}

test('أمر بكلمة واحدة', () => {
  const r = resolveCommand(plugins, 'قائمة')
  assert.equal(r.command, 'قائمة')
  assert.equal(r.consumed, 1)
  assert.equal(r.plugin, 'info-menu.js')
})

test('أمر عربي بكلمتين', () => {
  const r = resolveCommand(plugins, 'ترتيب المستويات')
  assert.equal(r.command, 'ترتيب المستويات')
  assert.equal(r.consumed, 2)
  assert.equal(r.plugin, 'profile-level.js')
})

test('الأطول الأول: "طرد الكل" مش "طرد" + args', () => {
  const r = resolveCommand(plugins, 'طرد الكل')
  assert.equal(r.command, 'طرد الكل')
  assert.equal(r.consumed, 2)
  assert.equal(r.plugin, 'group-kickall.js')
})

test('الوسائط بتفضل بعد اسم الأمر', () => {
  const r = resolveCommand(plugins, 'طرد @someone')
  assert.equal(r.command, 'طرد')
  assert.equal(r.consumed, 1)
  assert.deepEqual('طرد @someone'.split(/\s+/).slice(r.consumed), ['@someone'])
})

test('الأوامر اللاتينية لسه شغالة', () => {
  assert.equal(resolveCommand(plugins, 'menu').plugin, 'info-menu.js')
  assert.equal(resolveCommand(plugins, 'kickall').consumed, 1)
})

test('الـplugins اللي عندها customPrefix متشاركش في المطابقة', () => {
  assert.equal(resolveCommand(plugins, '$ ls'), null)
})

test('الـregex بيتطابق والـdisabled بيتخطى', () => {
  assert.equal(resolveCommand(plugins, 'حضن').plugin, 'anime-reaction.js')
  assert.equal(resolveCommand(plugins, 'يومي'), null)
})

test('مفيش مطابقة', () => {
  assert.equal(resolveCommand(plugins, 'كلام عشوائي'), null)
  assert.equal(resolveCommand(plugins, '   '), null)
})

test('acceptsCommand بيتعامل مع regex وأسماء مسجّلة', () => {
  assert.equal(acceptsCommand(['a', 'ب'], 'ب'), true)
  assert.equal(acceptsCommand(/^x$/i, 'X'), true)
  assert.equal(acceptsCommand(/^x$/i, 'y'), false)
  assert.equal(acceptsCommand(/(?:)/, 'أي حاجة'), false)
})
