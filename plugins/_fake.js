import { getBotConfig } from '../lib/botconfig.js'

export async function before(m, { conn }) {

const redes = [
  global.social?.whatsapp,
  global.social?.telegram,
  global.social?.github,
  global.channel
].filter(Boolean)
globalThis.redes = redes[Math.floor(Math.random() * redes.length)]

  const canales = Object.entries(global.my)
  .reduce((acc, [key, value]) => {
    if (key.startsWith('ch')) {
      const index = key.slice(2)
      const nombre = global.my[`name${index}`]
      if (nombre) {
        acc.push({ id: value, nombre })
      }
    }
    return acc
  }, [])

const channelRD = canales[Math.floor(Math.random() * canales.length)]
if (!channelRD) return

global.fake = { contextInfo: { isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid: channelRD.id, serverMessageId: '0', newsletterName: channelRD.nombre, }, externalAdReply: { showAdAttribution: true, title: getBotConfig(conn, 'packname'), body: global.dev, mediaUrl: null, description: null, previewType: "PHOTO", thumbnailUrl: getBotConfig(conn, 'icon'), sourceUrl: redes, mediaType: 1, renderLargerThumbnail: false }}}

global.rcanal = {
  contextInfo: {
    isForwarded: false,
    forwardedNewsletterMessageInfo: {
      newsletterJid: channelRD.id,
      newsletterName: channelRD.nombre,
      serverMessageId: '0'
    }
  }
}

}