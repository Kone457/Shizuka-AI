import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getBotConfig } from '../lib/botconfig.js'

let timeout = 60000
let reward = 500
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const jsonPath = path.join(__dirname, '..', 'lib', 'unscramble.json')

let handler = async (m, { conn }) => {
    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
    if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {}

    conn.unscramble = conn.unscramble || {}
    let id = m.chat

    if (id in conn.unscramble) {
        return conn.reply(m.chat, '⚠️ Ya hay una palabra sin ordenar en este chat. ¡Respóndela antes de pedir otra!', conn.unscramble[id][0])
    }

    if (!global.db.data.chats[m.chat].economy && m.isGroup) {
        return m.reply('《✦》Los comandos de *Economía* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con:\n» *.on economy*')
    }

    try {
        const data = await fs.readFile(jsonPath, 'utf-8')
        let words = JSON.parse(data)
        let randomWord = words[Math.floor(Math.random() * words.length)]
        const currency = getBotConfig(conn, 'currency')

        let caption = `🧩 *JUEGO: UNSCRAMBLE* 🧩
Ordena las letras:
*${randomWord.scrambled.toUpperCase()}*

⏳ Tiempo: ${(timeout / 1000)} segundos
Premio: +${reward} ${currency}

_Responde a este mensaje con la palabra correcta._`

        let sent = await conn.sendMessage(m.chat, { text: caption }, { quoted: m })

        conn.unscramble[id] = [
            sent,
            randomWord,
            setTimeout(async () => {
                if (conn.unscramble[id]) {
                    await conn.reply(m.chat, `⏳ ¡Se acabó el tiempo!\nLa palabra correcta era: *${randomWord.respuesta}*`, sent)
                    delete conn.unscramble[id]
                }
            }, timeout)
        ]
    } catch (error) {
        return m.reply('❌ No se pudo cargar `lib/unscramble.json`. Asegúrate de que exista.')
    }
}

handler.before = async function (m) {
    let id = m.chat
    this.unscramble = this.unscramble || {}

    if (!(id in this.unscramble)) return !0
    if (!m.text) return !0

    let [msg, randomWord, timer] = this.unscramble[id]

    if (!randomWord || !randomWord.respuesta) {
        delete this.unscramble[id]
        return !0
    }

    if (m.text.toLowerCase().trim() === randomWord.respuesta.toLowerCase().trim()) {
        if (!global.db.data.chats[m.chat].economy && m.isGroup) return !0

        global.db.data.users[m.sender].coin = (global.db.data.users[m.sender].coin || 0) + reward
        const currency = getBotConfig(this, 'currency')

        let successMessage = `🎉 *¡GANASTE!* 🎉
@${m.sender.split`@`[0]} ordenó la palabra correctamente.
Palabra: *${randomWord.respuesta}*
Premio: +${reward} ${currency}`

        await this.reply(m.chat, successMessage, m, { mentions: [m.sender] })
        clearTimeout(timer)
        delete this.unscramble[id]
    }
    return !0
}

handler.help = ['unscramble']
handler.tags = ['rpg']
handler.command = ['unscramble']
handler.group = true

export default handler