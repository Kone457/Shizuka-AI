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
        const jid = typeof participant === 'string' ? participant : participant.id

        // Nombre del usuario afectado
        let userName = jid.split('@')[0]
        try {
          const info = await client.fetchContact(jid)
          if (info?.name) userName = info.name
        } catch {}

        // Foto del usuario afectado
        const pp = await client.profilePictureUrl(jid, 'image')
          .catch(() => 'https://cdn.stellarwa.xyz/files/1755559736781.jpeg')

        const smallThumbContext = {
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
              renderLargerThumbnail: false 
            },
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
          case 'add':
            if (chat?.welcome) {
              const welcomeMessage = `
╔═══❖•°•°•°❖•°•°•°❖═══╗
       🌟 𝐁𝐈𝐄𝐍𝐕𝐄𝐍𝐈𝐃𝐎 🌟
╚═══❖•°•°•°❖•°•°•°❖═══╝

✨ @${userName} se ha unido al grupo
📌 ${metadata.subject}

📅 ${fecha} | 🕐 ${hora}
👥 Miembros: ${memberCount}

💡 Usa .menu para ver comandos disponibles
🎯 ¡Disfruta de tu estadía!

╰─⊷ ${global.db.data.settings[botId]?.namebot || 'Bot'} ⊶─╯`

              await client.sendMessage(anu.id, { 
                image: { url: pp }, 
                caption: welcomeMessage, 
                mentions: [jid],
                ...smallThumbContext
              })
            }
            break

          case 'remove':
          case 'leave':
            if (chat?.welcome) {
              const goodbyeMessage = `
╔═══❖•°•°•°❖•°•°•°❖═══╗
       🕊️  𝐀𝐃𝐈𝐎́𝐒  🕊️
╚═══❖•°•°•°❖•°•°•°❖═══╝

👤 @${userName} ha abandonado el grupo

📅 ${fecha} | 🕐 ${hora}
👥 Miembros restantes: ${memberCount}

🎐 Esperamos verte nuevamente pronto
📝 Tus contribuciones fueron valoradas

╰─⊷ ${global.db.data.settings[botId]?.namebot || 'Bot'} ⊶─╯`

              await client.sendMessage(anu.id, { 
                image: { url: pp }, 
                caption: goodbyeMessage, 
                mentions: [jid],
                ...smallThumbContext 
              })
            }
            break

          case 'promote':
          case 'demote':
            if (chat?.alerts) {
              const adminJid = anu.author
              let adminName = adminJid.split('@')[0]
              try {
                const info = await client.fetchContact(adminJid)
                if (info?.name) adminName = info.name
              } catch {}

              const action = anu.action === 'promote' ? 'ha sido ascendido' : 'ha sido degradado'
              const actionTitle = anu.action === 'promote' ? '⚡ 𝐍𝐔𝐄𝐕𝐎 𝐀𝐃𝐌𝐈𝐍𝐈𝐒𝐓𝐑𝐀𝐃𝐎𝐑 ⚡' : '📉 𝐂𝐀𝐌𝐁𝐈𝐎 𝐃𝐄 𝐑𝐎𝐋 📉'

              const msg = `
╭─────────────────╮
   ${actionTitle}
╰─────────────────╯

👑 @${userName} ${action}
👤 Por: @${adminName}

📋 ${anu.action === 'promote' ? 'Ahora tiene privilegios de administrador\n🛡️ Responsabilidades asignadas' : 'Privilegios de administrador removidos\n⚙️ Rol cambiado a miembro regular'}

╰─⊷ ${fecha} ${hora} ⊶─╯`

              await client.sendMessage(anu.id, {
                text: msg,
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