import os from 'os';

function rTime(seconds) {
  seconds = Number(seconds)
  const d = Math.floor(seconds / (3600 * 24))
  const h = Math.floor((seconds % (3600 * 24)) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const dDisplay = d > 0 ? d + (d === 1 ? " día, " : " días, ") : ""
  const hDisplay = h > 0 ? h + (h === 1 ? " hora, " : " horas, ") : ""
  const mDisplay = m > 0 ? m + (m === 1 ? " minuto, " : " minutos, ") : ""
  const sDisplay = s > 0 ? s + (s === 1 ? " segundo" : " segundos") : ""
  return dDisplay + hDisplay + mDisplay + sDisplay
}

export default {
  command: ['infobot', 'infosocket'],
  category: 'info',
  run: async (client, m) => {
    const botId = client.user.id.split(':')[0] + "@s.whatsapp.net"
    const botSettings = global.db.data.settings[botId] || {}

    const botname = botSettings.namebot || 'Ai Surus'
    const botname2 = botSettings.namebot2 || 'Surus'
    const monedas = botSettings.currency || 'BitCoins'
    const banner = botSettings.banner
    const prefijo = botSettings.prefijo
    const owner = botSettings.owner
    const canalId = botSettings.id
    const canalName = botSettings.nameid
    const link = botSettings.link

    let desar = 'Oculto'
    if (owner && !isNaN(owner.replace(/@s\.whatsapp\.net$/, ''))) {
      const userData = global.db.data.users[owner]
      desar = userData?.genre || 'Oculto'
    }

    const platform = os.type()
    const now = new Date()
    const colombianTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Bogota' }))
    const nodeVersion = process.version
    const sistemaUptime = rTime(os.uptime())

    const uptime = process.uptime()
    const uptimeDate = new Date(colombianTime.getTime() - uptime * 1000)
    const formattedUptimeDate = uptimeDate.toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/^./, m => m.toUpperCase())

    const isOficialBot = botId === global.client.user.id.split(':')[0] + "@s.whatsapp.net"
    const isPremiumBot = botSettings.botprem === true
    const isModBot = botSettings.botmod === true

    const botType = isOficialBot ? 'Principal/Owner' : isPremiumBot ? 'Premium' : isModBot ? 'Principal/Mod' : 'Sub Bot'

    try {
    const message = `✐ Información del bot *${botname2}!*

✿ *Nombre Corto ›* ${botname2}
✿ *Nombre Largo ›* ${botname}
✦ *Moneda ›* ${monedas}
✦ *Prefijo ›* ${prefijo}

❒ *Tipo ›* ${botType}
❒ *Plataforma ›* ${platform}
❒ *NodeJS ›* ${nodeVersion}
❒ *Activo desde ›* ${formattedUptimeDate}
❒ *Sistema Activo ›* ${sistemaUptime}
❒ *${desar === 'Hombre' ? 'Dueño' : desar === 'Mujer' ? 'Dueña' : 'Dueño(a)'} ›* ${owner ? (!isNaN(owner.replace(/@s\.whatsapp\.net$/, '')) ? `@${owner.split('@')[0]}` : owner) : "Oculto por privacidad"}

> \`Enlace:\` ${link}`.trim()

if (banner.endsWith('.mp4') || banner.endsWith('.gif') || banner.endsWith('.webm')) {
await client.sendMessage(
  m.chat,
  {
    video: { url: banner },
    gifPlayback: true,
    caption: message.trim(),
    contextInfo: {
      mentionedJid: [owner, m.sender],
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: canalId,
        serverMessageId: '0',
        newsletterName: canalName,
      }
    }
  },
  { quoted: m }
)
} else {
  await client.sendMessage(
    m.chat,
    {
      text: message.trim(),
      contextInfo: {
        mentionedJid: [owner, m.sender],
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: canalId,
          serverMessageId: '0',
          newsletterName: canalName,
        },
        externalAdReply: {
          title: botname,
          body: `${botname2}`,
          showAdAttribution: false,
          thumbnailUrl: banner,
          mediaType: 1,
          previewType: 0,
          renderLargerThumbnail: true
        }
      }
    },
    { quoted: m }
  )
}

    
   } catch (e) {
     m.reply(msgglobal)
   }
  }
};