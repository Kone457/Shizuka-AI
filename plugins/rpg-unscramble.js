
import { promises as fs } from 'fs'

let timeout = 60000 
let reward = 500   
const jsonPath = './lib/unscramble.json'

let handler = async (m, { conn }) => {
    conn.unscramble = conn.unscramble ? conn.unscramble : {}
    let id = m.chat

    if (id in conn.unscramble) {
        return conn.reply(m.chat, '⚠️ Ya hay una palabra sin ordenar en este chat. ¡Respóndela antes de pedir otra!', conn.unscramble[id][0])
    }

    try {
        const data = await fs.readFile(jsonPath, 'utf-8')
        let words = JSON.parse(data)
        let randomWord = words[Math.floor(Math.random() * words.length)]

        let caption = `🧩 *JUEGO: UNSCRAMBLE* 🧩\n\nOrdena las letras de la palabra:\n*${randomWord.scrambled.toUpperCase()}*\n\n⏳ Tiempo: ${(timeout / 1000)} segundos\n Premio: +${reward} ${global.currency}\n\n_Responde a este mensaje con la palabra correcta._`.trim()

        conn.unscramble[id] = [
            await conn.reply(m.chat, caption, m),
            randomWord,
            setTimeout(async () => {
                if (conn.unscramble[id]) {
                    await conn.reply(m.chat, `⏳ ¡Se acabó el tiempo!\nLa palabra correcta era: *${randomWord.respuesta}*`, conn.unscramble[id][0])
                    delete conn.unscramble[id]
                }
            }, timeout)
        ]
    } catch (error) {
        return m.reply('❌ No se pudo cargar el archivo `lib/unscramble.json`. Asegúrate de que exista.')
    }
}

handler.before = async function (m) {
    let id = m.chat
    this.unscramble = this.unscramble ? this.unscramble : {}

    if (!(id in this.unscramble)) return !0
    if (!m.text) return !0

    let [msg, randomWord, timer] = this.unscramble[id]

    if (m.text.toLowerCase().trim() === randomWord.respuesta.toLowerCase().trim()) {
        if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {}
        global.db.data.users[m.sender].economy = (global.db.data.users[m.sender].economy || 0) + reward

        let successMessage = `🎉 *¡GANASTE!* 🎉\n\n@${m.sender.split`@`[0]} ordenó la palabra correctamente.\nPalabra: *${randomWord.respuesta}*\nPremio: +${reward} ${global.currency}`.trim()

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
