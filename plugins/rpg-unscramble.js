import { getUser, ensureUser } from '../lib/userdb.js'
import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getBotConfig } from '../lib/botconfig.js'

const timeout = 60000
const reward = 500

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const jsonPath = path.join(__dirname, '..', 'lib', 'unscramble.json')

const handler = async (m, { conn }) => {
    conn.unscramble = conn.unscramble || {}

    const id = m.chat

    if (!getUser(global.db.data.users, m.sender))
        ensureUser(global.db.data.users, m.sender, {})

    if (!global.db.data.chats[m.chat])
        global.db.data.chats[m.chat] = { economy: true }

    if (conn.unscramble[id]) {
        return m.reply('⚠️ فيه كلمة مستنية في الشات ده.')
    }

    if (m.isGroup && !global.db.data.chats[m.chat].economy) {
        return m.reply('《✦》أوامر *الاقتصاد* متقفلة في الجروب ده.\n\nالمشرف يقدر يفتحها بـ:\n*.on economy*')
    }

    try {
        const file = await fs.readFile(jsonPath, 'utf8')
        const words = JSON.parse(file)

        if (!Array.isArray(words) || !words.length)
            return m.reply('❌ ملف unscramble.json فاضي.')

        const randomWord = words[Math.floor(Math.random() * words.length)]

        const currency = getBotConfig(conn, 'currency')

        const text = `🧩 *لعبة: رتّب الحروف* 🧩\n\nرتّب الحروف:\n\n*${randomWord.scrambled.toUpperCase()}*\n\n⏳ الوقت: ${timeout / 1000} ثانية\n💰 الجايزة: +${reward}`

        const msg = await conn.sendMessage(m.chat, {
            text
        }, {
            quoted: m
        })

        conn.unscramble[id] = {
            msg,
            answer: String(randomWord.respuesta).trim().toLowerCase(),
            timer: setTimeout(async () => {
                if (!conn.unscramble[id]) return

                await conn.sendMessage(m.chat, {
                    text: `⏳ الوقت خلص.\n\n✅ الإجابة: *${randomWord.respuesta}*`
                }, {
                    quoted: msg
                })

                delete conn.unscramble[id]
            }, timeout)
        }

    } catch (e) {
        console.error(e)
        m.reply('❌ مقدرتش أقرأ lib/unscramble.json')
    }
}

handler.before = async function (m) {
    this.unscramble = this.unscramble || {}

    const game = this.unscramble[m.chat]

    if (!game) return

    if (!m.text) return

    const answer = m.text.trim().toLowerCase()

    if (answer !== game.answer) return

    if (!getUser(global.db.data.users, m.sender))
        ensureUser(global.db.data.users, m.sender, {})

    getUser(global.db.data.users, m.sender).coin =
        (getUser(global.db.data.users, m.sender).coin || 0) + reward

    clearTimeout(game.timer)

    const currency = getBotConfig(this, 'currency')

    delete this.unscramble[m.chat]

    await this.sendMessage(m.chat, {
        text: `🎉 صح! @${m.sender.split('@')[0]}\n> كسبت *${reward} ${currency}*`,
        mentions: [m.sender]
    }, {
        quoted: m
    })

    return true
}

handler.help = ['unscramble']
handler.tags = ['rpg']
handler.command = ['unscramble']
handler.group = true

export default handler