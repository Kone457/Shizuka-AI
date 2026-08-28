let marriages = globalThis.marriages || (globalThis.marriages = {})

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!m.isGroup) return m.reply('❌ Este comando solo se puede usar en grupos.')

  let mentioned = m.mentionedJid || []
  let who = mentioned.length > 0
    ? mentioned[0]
    : (m.quoted ? m.quoted.sender : false)

  if (!who) {
    return m.reply(`⚠️ Debes mencionar el usuario al que desea proponer matrimonio`)
  }

  if (who === m.sender) return m.reply('❌ No puedes casarte contigo mismo/a.')
  if (who === conn.user.jid) return m.reply('❌ ¡Muchas gracias por el detalle, pero estoy casado con el código!')

  let user = globalThis.db.data.users[m.sender] ||= {}
  let target = globalThis.db.data.users[who] ||= {}

  if (user.marry) return m.reply('⚠️ Ya estás casado/a con otra persona.')
  if (target.marry) return m.reply('⚠️ Esa persona ya está casada.')

  marriages[who] = {
    proposer: m.sender,
    chat: m.chat,
    time: Date.now()
  }

  let nameProposer = await conn.getName(m.sender)
  let nameTarget = await conn.getName(who)

  await conn.sendMessage(m.chat, {
    text: `💍 ¡Atención @${who.split('@')[0]}!\n\n${nameProposer} te ha propuesto matrimonio.\n\nResponde a este mensaje con:\n• *acepto* para dar el "Sí, acepto"\n• *rechazo* para rechazar la propuesta`,
    mentions: [who, m.sender]
  }, { quoted: m })
}

handler.before = async function (m, { conn }) {
  if (!m.isGroup || !m.text) return

  let who = m.sender
  if (!marriages[who]) return

  let proposal = marriages[who]
  if (proposal.chat !== m.chat) return

  let txt = m.text.trim().toLowerCase()

  if (['acepto', 'si', 'aceptar'].includes(txt)) {
    let user = globalThis.db.data.users[proposal.proposer]
    let target = globalThis.db.data.users[who]

    user.marry = who
    target.marry = proposal.proposer

    delete marriages[who]

    let nameProposer = await conn.getName(proposal.proposer)
    let nameTarget = await conn.getName(who)

    await conn.sendMessage(m.chat, {
      text: `🎉 ¡Felicidades! ${nameProposer} y ${nameTarget} acaban de unirse en matrimonio. 💍✨`,
      mentions: [proposal.proposer, who]
    }, { quoted: m })
  } else if (['rechazo', 'no', 'rechazar'].includes(txt)) {
    delete marriages[who]

    let nameProposer = await conn.getName(proposal.proposer)
    let nameTarget = await conn.getName(who)

    await conn.sendMessage(m.chat, {
      text: `💔 ${nameTarget} ha rechazado la propuesta de matrimonio de ${nameProposer}. Qué triste historia... 🥀`,
      mentions: [who, proposal.proposer]
    }, { quoted: m })
  }
}

handler.command = ['marry', 'casarse', 'matrimonio']
export default handler