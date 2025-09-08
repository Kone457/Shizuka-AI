import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, command }) => {
  
  // Dark tech aesthetic variables
  const emojis = '🕷️☠️'
  const darkBorder = 'ׄ─ׄ⭒─ׄ─ׅ─ׄ⭒─ׄ─ׅ─ׄ⭒─ׄ─ׅ─ׄ⭒─ׄ─ׅ─ׄ⭒─ׄ'
  const warning = '⚠️ 𝕯𝖆𝖙𝖆 �𝖓𝖙𝖗𝖚𝖘𝖎𝖔𝖓 𝖉𝖊𝖙𝖊𝖈𝖙𝖊𝖉 ⚠️'
  
  let grupos = `*${warning}*

*ℌ𝔬𝔩𝔞 𝔪𝔬𝔯𝔱𝔞𝔩, 𝔢𝔩 𝔟𝔬𝔱 𝔥𝔞 𝔡𝔢𝔱𝔢𝔠𝔱𝔞𝔡𝔬 𝔱𝔲 𝔭𝔯𝔢𝔰𝔢𝔫𝔠𝔦𝔞...*

▄︻デ══━► *𝕲𝖗𝖚𝖕𝖔𝖘 𝕺𝖋𝖎𝖈𝖎𝖆𝖑𝖊𝖘* ◄══━デ︻▄
> 🕸️ ${namegrupo}
> https://chat.whatsapp.com/G5PblfIsVaT5ixPp0PAgzm


▄︻デ══━► *𝕾𝖔𝖕𝖔𝖗𝖙𝖊 𝕯𝖆𝖗𝖐* ◄══━デ︻▄
> 🕸️ Soporte 
> https://chat.whatsapp.com/DIXvs4fzTKj0QKzyUnfT0t?mode=ac_t

${darkBorder}

*⚠️ 𝕷𝖎𝖓𝖐 𝖈𝖔𝖗𝖗𝖚𝖕𝖙𝖔? 𝕽𝖊𝖕𝖔𝖗𝖙𝖆𝖑𝖔 𝖆𝖖𝖚𝖎́:*
> 🕷️ ${namechannel}
> *❀* ${channel}

*𝕯𝖊𝖛𝖊𝖑𝖔𝖕𝖊𝖗'𝖘 𝖒𝖊𝖘𝖘𝖆𝖌𝖊:*
> ${dev}`

  // Send with dark tech aesthetic
  await conn.sendFile(m.chat, catalogo, "grupos_dark.jpg", grupos, m, null, {
    contextInfo: {
      externalAdReply: {
        title: `⚠️ 𝕽𝖊𝖉 𝕯𝖆𝖗𝖐 𝕹𝖊𝖙𝖜𝖔𝖗𝖐 ⚠️`,
        body: "𝕿𝖚 𝖉𝖆𝖙𝖆 𝖍𝖆𝖘 𝖇𝖊𝖊𝖓 𝖗𝖊𝖈𝖔𝖗𝖉𝖊𝖉",
        thumbnail: await (await fetch('https://qu.ax/qmfkB.jpg')).buffer()
      }
    }
  })

  await m.react(emojis)
}

handler.help = ['grupos', 'links', 'darknetwork']
handler.tags = ['dark', 'info']
handler.command = /^(grupos|links|groups|darkweb)$/i

export default handler