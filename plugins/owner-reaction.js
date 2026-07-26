const letters = {
  a: '🅐', b: '🅑', c: '🅒', d: '🅓', e: '🅔', f: '🅕', g: '🅖',
  h: '🅗', i: '🅘', j: '🅙', k: '🅚', l: '🅛', m: '🅜', n: '🅝',
  o: '🅞', p: '🅟', q: '🅠', r: '🅡', s: '🅢', t: '🅣', u: '🅤',
  v: '🅥', w: '🅦', x: '🅧', y: '🅨', z: '🅩',
  '0': '⓿', '1': '➊', '2': '➋', '3': '➌', '4': '➍',
  '5': '➎', '6': '➏', '7': '➐', '8': '➑', '9': '➒'
}

const handler = async (m, { conn, text, command }) => {
  if (!text) {
    return m.reply(
      ` Ejemplo de uso:\n.${command} https://whatsapp.com/channel/0029Vb7h1qC65yDEhghegc2O/215 Hola`
    )
  }

  const args = text.trim().split(/\s+/)
  const link = args.shift()

  if (!link || !link.startsWith('https://whatsapp.com/channel/')) {
    return m.reply('❌ Debes enviar un enlace válido del canal.')
  }

  const parts = link.split('/')

  if (parts.length < 6) {
    return m.reply('❌ El enlace del canal no es válido.')
  }

  const channelId = parts[4]
  const messageId = parts[5]

  const reactionText = args.join(' ').toLowerCase()

  if (!reactionText) {
    return m.reply('❌ Escribe el texto que deseas usar como reacción.')
  }

  const emoji = reactionText
    .split('')
    .map(c => c === ' ' ? '―' : (letters[c] || c))
    .join('')

  try {
    const channel = await conn.newsletterMetadata('invite', channelId)

    await conn.newsletterReactMessage(
      channel.id,
      messageId,
      emoji
    )

    m.reply(`✅ Reacción enviada correctamente.

📢 Canal: ${channel.name}
🎭 Reacción: ${emoji}`)
  } catch (e) {
    console.error(e)
    m.reply(`❌ No se pudo enviar la reacción.\n\n${e.message || e}`)
  }
}

handler.help = ['react']
handler.tags = ['tools']
handler.command = ['react']
handler.owner = true

export default handler