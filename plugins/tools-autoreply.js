import helper from '../lib/helper.js'
import { getBotConfig } from '../lib/botconfig.js'

const PREFIX_RE = helper.prefix

const MAX_RULES = 50
const MAX_REPLIES = 5
const COOLDOWN_MS = 4000
const MAX_TEXT = 300

const cooldowns = new Map()

export const normalize = text => String(text ?? '')
  .toLowerCase()
  .replace(/[\u064B-\u0652\u0640\u0670]/g, '')
  .replace(/[أإآٱ]/g, 'ا')
  .replace(/ى/g, 'ي')
  .replace(/ؤ/g, 'و')
  .replace(/ئ/g, 'ي')
  .replace(/ة/g, 'ه')
  .replace(/[^\p{L}\p{N}\s]+/gu, ' ')
  .replace(/\s+/g, ' ')
  .trim()

const globalConf = () => (global.autoReply ||= { on: true, mode: 'contains', rules: [] })

export function getStore(chatId) {
  const chats = (global.db.data.chats ||= {})
  const chat = (chats[chatId] ||= {})
  const ar = (chat.autoreply ||= {})
  if (!Array.isArray(ar.rules)) ar.rules = []
  if (typeof ar.on !== 'boolean') ar.on = true
  if (!ar.mode) ar.mode = 'contains'
  return ar
}

export const isEnabled = chatId => getStore(chatId).on !== false && globalConf().on !== false

export const effectiveRules = chatId => [
  ...getStore(chatId).rules,
  ...(globalConf().rules || [])
]

const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export function findRule(text, rules, mode = 'contains') {
  const t = normalize(text)
  if (!t) return null
  for (const rule of rules) {
    const k = normalize(rule?.k)
    if (!k) continue
    const hit = mode === 'exact'
      ? t === k
      : new RegExp(`(^|\\s)${escapeRe(k)}`).test(t)
    if (hit) return rule
  }
  return null
}

export function renderReply(tpl, ctx = {}) {
  return String(tpl)
    .replace(/\{(اسم|name)\}/gi, ctx.name || '')
    .replace(/\{(بوت|bot)\}/gi, ctx.bot || '')
    .replace(/\{(جروب|group)\}/gi, ctx.group || '')
    .trim()
}

export function addRule(chatId, key, replies) {
  const ar = getStore(chatId)
  const k = String(key || '').trim()
  if (!k) return { ok: false, msg: '❌ اكتب الكلمة بعد `اضف`\nمثال: *.ردود اضف بوت | اسمي هينا*' }
  const list = (Array.isArray(replies) ? replies : [replies])
    .map(r => String(r ?? '').trim())
    .filter(Boolean)
  if (!list.length) return { ok: false, msg: '❌ اكتب الرد بعد `|`\nمثال: *.ردود اضف بوت | اسمي هينا*' }

  const existing = ar.rules.find(r => normalize(r.k) === normalize(k))
  if (existing) {
    existing.r = [...new Set([...existing.r, ...list])].slice(0, MAX_REPLIES)
    return { ok: true, msg: `✅ اتحدّثت *${k}* — بقى عندها ${existing.r.length} رد` }
  }
  if (ar.rules.length >= MAX_RULES) {
    return { ok: false, msg: `❌ وصلت الحد الأقصى (${MAX_RULES} قاعدة) — امسح شوية بـ *.ردود مسح*` }
  }
  ar.rules.push({ k, r: list.slice(0, MAX_REPLIES) })
  return { ok: true, msg: `✅ اتضافت *${k}* — ${list.length} رد` }
}

export function removeRule(chatId, key) {
  const ar = getStore(chatId)
  const k = normalize(key)
  const i = ar.rules.findIndex(r => normalize(r.k) === k)
  if (i < 0) return { ok: false, msg: `❌ مفيش قاعدة اسمها *${key}*` }
  ar.rules.splice(i, 1)
  return { ok: true, msg: `✅ اتشالت *${key}*` }
}

const listText = chatId => {
  const ar = getStore(chatId)
  const mine = ar.rules
  const defaults = globalConf().rules || []
  const l = []
  l.push(`📮 *الردود التلقائية* — ${isEnabled(chatId) ? 'شغالة ✅' : 'مقفولة ❌'}`)
  l.push(`الوضع: *${ar.mode === 'exact' ? 'دقيق (الرسالة كلها)' : 'جزئي (أي جزء من الرسالة)'}*`)
  l.push('')
  if (!mine.length && !defaults.length) {
    l.push('مفيش ردود لسه.')
  } else {
    if (mine.length) {
      l.push(`*— ردود الجروب (${mine.length}) —*`)
      for (const r of mine) l.push(`• *${r.k}* → ${r.r.map(x => `_${x}_`).join(' | ')}`)
      l.push('')
    }
    if (defaults.length) {
      l.push(`*— الردود الافتراضية (${defaults.length}) —*`)
      for (const r of defaults) l.push(`• *${r.k}* → ${r.r.map(x => `_${x}_`).join(' | ')}`)
    }
  }
  l.push('')
  l.push('*.ردود مساعده* لكل الأوامر')
  return l.join('\n')
}

const HELP = `📮 *الردود التلقائية*

*.ردود* — تشوف القايمة
*.ردود اضف <كلمة> | <رد>*
*.ردود اضف <كلمة> | <رد1> ; <رد2>*
   أكتر من رد = البوت بيختار واحد عشوائي
*.ردود حذف <كلمة>*
*.ردود مسح* — يمسح ردود الجروب
*.ردود تشغيل* / *.ردود اطفاء*
*.ردود دقيق* — لازم الرسالة تكون الكلمة بالظبط
*.ردود جزئي* — الكلمة في أي حتة من الرسالة (الافتراضي)
*.ردود تجربة <نص>* — تشوف البوت هيرد بإيه

*متغيرات في الرد:*
{اسم} = اسم اللي كتب · {بوت} = اسم البوت · {جروب} = اسم الجروب

*مثال:*
.ردود اضف بوت | اسمي *هينا* 🌸
.ردود اضف شغال | أرحب 🌸 ; تمام يا كبير 🌸`

let handler = async (m, { conn, text, isAdmin, isOwner }) => {
  const manage = isOwner || isAdmin || !m.isGroup
  const raw = (text || '').trim()
  const [sub, ...rest] = raw.split(/\s+/)
  const cmd = normalize(sub)
  const chatId = m.chat

  if (!manage) return m.reply('❌ الأمر ده للمشرفين بس.')

  if (!raw) return m.reply(listText(chatId))

  if (['مساعده', 'مساعدة', 'help', 'اوامر'].includes(cmd)) return m.reply(HELP)

  if (['اضف', 'أضف', '+'].includes(cmd)) {
    const body = raw.slice(sub.length).trim()
    const [key, ...replyParts] = body.split('|')
    const replies = replyParts.join('|').split(';').map(s => s.trim()).filter(Boolean)
    const res = addRule(chatId, key, replies)
    if (res.ok) await global.db.write().catch(() => {})
    return m.reply(res.msg)
  }

  if (['حذف', '-', 'امسح'].includes(cmd)) {
    const res = removeRule(chatId, rest.join(' ').trim())
    if (res.ok) await global.db.write().catch(() => {})
    return m.reply(res.msg)
  }

  if (['مسح', 'تفريغ', 'reset'].includes(cmd)) {
    const ar = getStore(chatId)
    const n = ar.rules.length
    ar.rules = []
    await global.db.write().catch(() => {})
    return m.reply(n ? `✅ اتمسحت *${n}* قاعدة` : '❌ مفيش حاجة تتمسح')
  }

  if (['تشغيل', 'فعل', 'on'].includes(cmd)) {
    getStore(chatId).on = true
    await global.db.write().catch(() => {})
    return m.reply('✅ الردود التلقائية اتشغلت')
  }

  if (['اطفاء', 'إطفاء', 'ايقاف', 'إيقاف', 'off'].includes(cmd)) {
    getStore(chatId).on = false
    await global.db.write().catch(() => {})
    return m.reply('❌ الردود التلقائية اتقفلت')
  }

  if (['دقيق', 'exact'].includes(cmd)) {
    getStore(chatId).mode = 'exact'
    await global.db.write().catch(() => {})
    return m.reply('✅ الوضع بقى *دقيق* — لازم الرسالة تكون الكلمة بالظبط')
  }

  if (['جزئي', 'contains'].includes(cmd)) {
    getStore(chatId).mode = 'contains'
    await global.db.write().catch(() => {})
    return m.reply('✅ الوضع بقى *جزئي* — الكلمة في أي حتة من الرسالة')
  }

  if (['تجربه', 'تجربة', 'جرب', 'test'].includes(cmd)) {
    const sample = rest.join(' ').trim()
    if (!sample) return m.reply('❌ اكتب النص بعد `تجربة`\nمثال: *.ردود تجربة شغاله يا روحي*')
    const ar = getStore(chatId)
    const rule = findRule(sample, effectiveRules(chatId), ar.mode)
    if (!rule) return m.reply('🤷 مفيش قاعدة بتطابق النص ده')
    const tpl = rule.r[Math.floor(Math.random() * rule.r.length)]
    const reply = renderReply(tpl, {
      name: m.pushName || 'مستخدم',
      bot: getBotConfig(conn, 'botname') || 'Hina',
      group: m.isGroup ? (m.groupMetadata?.subject || '') : ''
    })
    return m.reply(`🎯 طابقت *${rule.k}*\n\n↩️ الرد:\n${reply}`)
  }

  return m.reply(HELP)
}

handler.before = async function (m, { conn, groupMetadata }) {
  try {
    if (m.fromMe || m.isBaileys) return
    const text = String(m.text || '').trim()
    if (!text || text.length > MAX_TEXT) return
    if (PREFIX_RE.test(text)) return
    if (!isEnabled(m.chat)) return

    const ar = getStore(m.chat)
    const rule = findRule(text, effectiveRules(m.chat), ar.mode)
    if (!rule || !rule.r?.length) return

    const cdKey = `${m.chat}|${normalize(rule.k)}`
    const now = Date.now()
    if (now - (cooldowns.get(cdKey) || 0) < COOLDOWN_MS) return
    cooldowns.set(cdKey, now)
    if (cooldowns.size > 500) {
      for (const [k, ts] of cooldowns) if (now - ts > COOLDOWN_MS) cooldowns.delete(k)
    }

    const reply = renderReply(rule.r[Math.floor(Math.random() * rule.r.length)], {
      name: m.pushName || '',
      bot: getBotConfig(conn, 'botname') || 'Hina',
      group: groupMetadata?.subject || ''
    })
    if (!reply) return
    await m.reply(reply)
  } catch {}
}

handler.help = ['ردود']
handler.tags = ['tools']
handler.command = ['ردود', 'رد_تلقائي', 'autoreply', 'autoresponder']
handler.admin = false

export default handler
