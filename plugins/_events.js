import chalk from 'chalk'
import moment from 'moment-timezone'

export default async (client, m) => {
  client.ev.on('group-participants.update', async (anu) => {
    try {
      const metadata = await client.groupMetadata(anu.id)
      const chat = global.db.data.chats[anu.id]
      const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
      const primaryBotId = chat?.primaryBot

      if (primaryBotId && primaryBotId !== botId) return

      const now = moment().tz('America/Bogota')
      const fecha = now.format('DD MMM YYYY')
      const hora = now.format('hh:mm A')

      const memberCount = metadata.participants.length

      for (const participant of anu.participants) {
        const jid = participant
        const phone = jid.split('@')[0]
        const pp = await client.profilePictureUrl(jid, 'image')
          .catch(() => 'https://cdn.stellarwa.xyz/files/1755559736781.jpeg')

        const baseContext = {
          contextInfo: {
            mentionedJid: [jid]
          }
        }

        const normalThumbContext = {
          contextInfo: {
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: global.db.data.settings[botId]?.id || botId,
              serverMessageId: '0',
              newsletterName: global.db.data.settings[botId]?.nameid || 'Bot Notification'
            },
            externalAdReply: {
              title: global.db.data.settings[botId]?.namebot || 'Sistema de Grupos',
              body: global.dev || 'Notificación Automática',
              mediaUrl: null,
              description: null,
              previewType: 'PHOTO',
              thumbnailUrl: global.db.data.settings[botId]?.icon || pp,
              sourceUrl: global.db.data.settings[botId]?.link || '',
              mediaType: 1,
              renderLargerThumbnail: true
            },
            mentionedJid: [jid]
          }
        }

        switch (anu.action) {
          case 'promote':
            if (chat?.alerts) {
              const adminJid = anu.author
              let adminName = adminJid
              try {
                const contact = await client.onWhatsApp(adminJid)
                if (contact && contact[0]?.exists) {
                  const info = await client.fetchContact(adminJid)
                  adminName = info?.name || adminJid.split('@')[0]
                }
              } catch { adminName = adminJid.split('@')[0] }

              const promotionMessage = `
╭─────────────────╮
   ⚡ 𝐍𝐔𝐄𝐕𝐎 𝐀𝐃𝐌𝐈𝐍𝐈𝐒𝐓𝐑𝐀𝐃𝐎𝐑 ⚡
╰─────────────────╯

👑 @${phone} ha sido ascendido
👤 Por: @${adminName}

📋 Ahora tiene privilegios de administrador
🛡️ Responsabilidades asignadas

╰─⊷ ${fecha} ${hora} ⊶─╯`

              await client.sendMessage(anu.id, {
                text: promotionMessage,
                mentions: [jid, adminJid],
                ...normalThumbContext 
              })
            }
            break

          case 'demote':
            if (chat?.alerts) {
              const adminJid = anu.author
              let adminName = adminJid
              try {
                const contact = await client.onWhatsApp(adminJid)
                if (contact && contact[0]?.exists) {
                  const info = await client.fetchContact(adminJid)
                  adminName = info?.name || adminJid.split('@')[0]
                }
              } catch { adminName = adminJid.split('@')[0] }

              const demotionMessage = `
╭─────────────────╮
   📉 𝐂𝐀𝐌𝐁𝐈𝐎 𝐃𝐄 𝐑𝐎𝐋 📉
╰─────────────────╯

🔻 @${phone} ha sido degradado
👤 Por: @${adminName}

📋 Privilegios de administrador removidos
⚙️ Rol cambiado a miembro regular

╰─⊷ ${fecha} ${hora} ⊶─╯`

              await client.sendMessage(anu.id, {
                text: demotionMessage,
                mentions: [jid, adminJid],
                ...normalThumbContext 
              })
            }
            break
        }
      }
    } catch (error) {
      console.error(chalk.red(`[ERROR] Group Participants Update → ${error.message}`))
      console.error(chalk.gray(`Stack: ${error.stack}`))
    }
  })
}