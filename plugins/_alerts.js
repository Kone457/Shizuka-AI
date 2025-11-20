let WAMessageStubType = (await import('@whiskeysockets/baileys')).default
import fs from 'fs'
import path from 'path'

const groupMetadataCache = new Map();
const lidCache = new Map();
let handler = m => m

handler.before = async function (m, { conn, participants, groupMetadata }) {

  if (!m.messageStubType || !m.isGroup) return
  let chat = globalThis.db.data.chats[m.chat]
  let userss = m.messageStubParameters[0]
  const realSender = await resolveLidToRealJid(m?.sender, conn, m?.chat);

  
  let admingp = `\n
🌟✨━━━━━━━━━━━━━━━━✨🌟
👑 ¡Atención Grupo! 👑
───────────────────────
📢 El miembro @${userss.split('@')[0]} 
ha sido *PROMOVIDO* a 🛡️ Administrador
por @${realSender.split('@')[0]} 🎉
───────────────────────
🌟✨━━━━━━━━━━━━━━━━✨🌟
`

  let noadmingp = `\n
⚠️🔻━━━━━━━━━━━━━━━━🔻⚠️
👑 Aviso Importante 👑
──────────────────────
📢 El miembro @${userss.split('@')[0]} 
ha sido *DEGRADADO* de 🛡️ Administrador
por @${realSender.split('@')[0]} ❌
──────────────────────
⚠️🔻━━━━━━━━━━━━━━━━🔻⚠️
`

  
  if (chat.detect && m.messageStubType == 2) {
    const uniqid = (m.isGroup ? m.chat : m.sender).split('@')[0]
    const sessionPath = `./${sessions}/`
    for (const file of await fs.readdir(sessionPath)) {
      if (file.includes(uniqid)) {
        await fs.unlink(path.join(sessionPath, file))
        console.log(`${chalk.yellow.bold('✎ Delete!')} ${chalk.greenBright(`'${file}'`)}\n${chalk.redBright('Que provoca el "undefined" en el chat.')}`)
      }
    }
  }

  
  if (chat.alerts && m.messageStubType == 29) {
    await conn.sendMessage(m.chat, { text: admingp, mentions: [userss, realSender] }, { quoted: null })
    return;
  }

  if (chat.alerts && m.messageStubType == 30) {
    await conn.sendMessage(m.chat, { text: noadmingp, mentions: [userss, realSender] }, { quoted: null })
  } else {
    if (m.messageStubType == 2) return
    console.log({
      messageStubType: m.messageStubType,
      messageStubParameters: m.messageStubParameters,
      type: WAMessageStubType[m.messageStubType],
    })
  }
}

export default handler


async function resolveLidToRealJid(lid, conn, groupChatId, maxRetries = 3, retryDelay = 60000) {
  const inputJid = lid.toString();
  if (!inputJid.endsWith("@lid") || !groupChatId?.endsWith("@g.us")) {
    return inputJid.includes("@") ? inputJid : `${inputJid}@s.whatsapp.net`;
  }

  if (lidCache.has(inputJid)) {
    return lidCache.get(inputJid);
  }

  const lidToFind = inputJid.split("@")[0];
  let attempts = 0;

  while (attempts < maxRetries) {
    try {
      const metadata = await conn?.groupMetadata(groupChatId);
      if (!metadata?.participants) throw new Error("No se obtuvieron participantes");

      for (const participant of metadata.participants) {
        try {
          if (!participant?.jid) continue;
          const contactDetails = await conn?.onWhatsApp(participant.jid);
          if (!contactDetails?.[0]?.lid) continue;

          const possibleLid = contactDetails[0].lid.split("@")[0];
          if (possibleLid === lidToFind) {
            lidCache.set(inputJid, participant.jid);
            return participant.jid;
          }
        } catch (e) {
          continue;
        }
      }

      lidCache.set(inputJid, inputJid);
      return inputJid;

    } catch (e) {
      if (++attempts >= maxRetries) {
        lidCache.set(inputJid, inputJid);
        return inputJid;
      }
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }

  return inputJid;
}