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

    if (!global.db.data.users[m.sender])
        global.db.data.users[m.sender] = {}

    if (!global.db.data.chats[m.chat])
        global.db.data.chats[m.chat] = { economy: true }

    if (conn.unscramble[id]) {
        return m.reply('⚠️ Ya hay una palabra pendiente en este chat.')
    }

    if (m.isGroup && !global.db.data.chats[m.chat].economy) {
        return m.reply('《✦》Los comandos de *Economía* están desactivados en este grupo.\n\nUn administrador puede activarlos con:\n*.on economy*')
    }

    try {
        const file = await fs.readFile(jsonPath, 'utf8')
        const words = JSON.parse(file)

        if (!Array.isArray(words) || !words.length)
            return m.reply('❌ El archivo unscramble.json está vacío.')

        const randomWord = words[Math.floor(Math.random() * words.length)]

        const currency = getBotConfig(conn, 'currency')

        const text = `🧩 *JUEGO: UNSCRAMBLE* 🧩

Ordena las letras:

*${randomWord.scrambled.toUpperCase()}*

⏳ Tiempo: ${timeout / 1000} segundos
💰 Premio: +${reward} ${currency}

_Responde con la palabra correcta._`

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
                    text: `⏳ Se acabó el tiempo.\n\n✅ Respuesta: *${randomWord.respuesta}*`
                }, {
                    quoted: msg
                })

                delete conn.unscramble[id]
            }, timeout)
        }

    } catch (e) {
        console.error(e)
        m.reply('❌ No pude leer lib/unscramble.json')
    }
}

handler.before = async function (m) {
    this.unscramble = this.unscramble || {}

    const game = this.unscramble[m.chat]

    if (!game) return

    if (!m.text) return

    const answer = m.text.trim().toLowerCase()

    if (answer !== game.answer) return

    if (!global.db.data.users[m.sender])
        global.db.data.users[m.sender] = {}

    global.db.data.users[m.sender].coin =
        (global.db.data.users[m.sender].coin || 0) + reward

    clearTimeout(game.timer)

    const currency = getBotConfig(this, 'currency')

    delete this.unscramble[m.chat]

    await this.sendMessage(m.chat, {
        text: `🎉 ¡Correcto! @${m.sender.split('@')[0]}
> Ganaste *${reward} ${currency}*`,
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