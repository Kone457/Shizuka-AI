const uid = () => Math.random().toString(36).slice(2, 8)

const handler = async (m, { conn }) => {
  conn.mathGames = conn.mathGames || new Map()
  conn.processedIds = conn.processedIds || new Set()

  const num = () => Math.floor(Math.random() * 50) + 10
  const a = num(), b = num(), c = num()
  const correct = (a * b) + c
  const delta = Math.floor(Math.random() * 15) + 5
  const wrong1 = correct + delta
  const wrong2 = correct - (delta + Math.floor(Math.random() * 7))
  const options = [correct, wrong1, wrong2].sort(() => Math.random() - 0.5)

  const gameId = uid()
  const info = `
˚∩　ׅ　🅔𝖈𝗎𝖺𝖼𝗂𝗈𝗇 𝖉𝗂𝖿𝗂𝖈𝗂𝗹　ׄᰙ　ׅ

> ✨ Resuelve: (*${a} × ${b}*) + ${c}

𖣣ֶㅤ֯⌗ A › *${options[0]}*
𖣣ֶㅤ֯⌗ B › *${options[1]}*
𖣣ֶㅤ֯⌗ C › *${options[2]}*

⏳ Tienes *1 minuto* para responder.
`.trim()

  await conn.sendMessage(m.chat, {
    text: info,
    footer: 'Selecciona tu respuesta:',
    buttons: [
      { buttonId: `eq|${gameId}|${options[0]}`, buttonText: { displayText: 'A' }, type: 1 },
      { buttonId: `eq|${gameId}|${options[1]}`, buttonText: { displayText: 'B' }, type: 1 },
      { buttonId: `eq|${gameId}|${options[2]}`, buttonText: { displayText: 'C' }, type: 1 }
    ],
    headerType: 1
  }, { quoted: m })

  const timeoutId = setTimeout(async () => {
    const state = conn.mathGames.get(m.chat)
    if (!state || state.answered || state.gameId !== gameId) return
    await conn.sendMessage(m.chat, { text: `⌛ Se acabó el tiempo. La respuesta correcta era *${correct}*.` })
    conn.mathGames.delete(m.chat)
  }, 60 * 1000)

  conn.mathGames.set(m.chat, {
    gameId,
    correct,
    answered: false,
    timeoutId
  })
}

handler.before = async (m, { conn }) => {
  const id = m.message?.buttonsResponseMessage?.selectedButtonId
  const msgKeyId = m.key?.id
  conn.processedIds = conn.processedIds || new Set()
  if (msgKeyId && conn.processedIds.has(msgKeyId)) return
  if (msgKeyId) conn.processedIds.add(msgKeyId)
  if (!id || !id.startsWith('eq|')) return

  const [_, gameId, chosenStr] = id.split('|')
  const chosen = parseInt(chosenStr)
  const state = conn.mathGames?.get(m.chat)
  if (!state) return
  if (state.answered) return
  if (state.gameId !== gameId) return

  state.answered = true
  clearTimeout(state.timeoutId)
  conn.mathGames.delete(m.chat)

  if (chosen === state.correct) {
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    m.reply(`🎉 ¡Correcto! ${chosen} es la respuesta.`)
  } else {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    m.reply(`❌ Incorrecto. La respuesta era *${state.correct}*.`)
  }
}

handler.command = ['calcular']
handler.tags = ['fun']
handler.help = ['calcular']

export default handler