import { getBotConfig } from '../lib/botconfig.js'

let handler = async (m, { conn, usedPrefix }) => {
  const currency = getBotConfig(conn, 'currency')
  if (!global.db.data.chats[m.chat].economy && m.isGroup) {
    return m.reply(`《✦》Los comandos de *Economía* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con:\n» *${usedPrefix}on economy*`)
  }

  let user = global.db.data.users[m.sender]
  if (!user) return m.reply("✿ No estás en la base de datos.")

  const ahora = Date.now()

  const cds = {
    work: 2 * 60 * 1000,
    slut: 5 * 60 * 1000,
    crime: 8 * 60 * 1000,
    dungeon: 18 * 60 * 1000,
    pescar: 12 * 60 * 1000,
    cazar: 15 * 60 * 1000,
    minar: 10 * 60 * 1000,
    roboauto: 6 * 60 * 1000,
    daily: 24 * 60 * 60 * 1000,
    weekly: 7 * 24 * 60 * 60 * 1000,
    monthly: 30 * 24 * 60 * 60 * 1000
  }

  const tiempoRestante = (last, cd) => {
    const restante = last ? last - ahora : 0
    return restante > 0 ? formatTime(restante) : "Disponible"
  }

  const texto = [
    `✿ *》Economia ${m.pushName || m.sender}* `,
    ``,
    `ⴵ Work » *${tiempoRestante(user.lastwork, cds.work)}*`,
    `ⴵ Slut » *${tiempoRestante(user.lastslut, cds.slut)}*`,
    `ⴵ Crime » *${tiempoRestante(user.lastcrime, cds.crime)}*`,
    `ⴵ Dungeon » *${tiempoRestante(user.lastDungeon, cds.dungeon)}*`,
    `ⴵ Pescar » *${tiempoRestante(user.lastFish, cds.pescar)}*`,
    `ⴵ Cazar » *${tiempoRestante(user.lastHunt, cds.cazar)}*`,
    `ⴵ Minar » *${tiempoRestante(user.lastmine, cds.minar)}*`,
    `ⴵ RoboAuto » *${tiempoRestante(user.lastroboauto, cds.roboauto)}*`,
    `ⴵ Daily » *${tiempoRestante(user.lastDaily, cds.daily)}*`,
    `ⴵ Weekly » *${tiempoRestante(user.lastweekly, cds.weekly)}*`,
    `ⴵ Monthly » *${tiempoRestante(user.lastmonthly, cds.monthly)}*`,
    ``,
    `⛁ Coins totales » ${user.coin.toLocaleString()} ${currency}`
  ].join('\n')

  conn.reply(m.chat, texto, m)
}

handler.help = ['einfo']
handler.tags = ['economy']
handler.command = ['einfo']
handler.group = true

export default handler

function formatTime(ms) {
  const totalSec = Math.ceil(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  const parts = []
  if (h) parts.push(`${h}h`)
  if (m) parts.push(`${m}m`)
  if (s) parts.push(`${s}s`)
  return parts.join(' ')
}