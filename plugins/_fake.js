export async function before(m, { conn }) {

var canal = 'https://whatsapp.com/channel/0029VbAVMtj2f3EFmXmrzt0v'
var canal2 = 'https://whatsapp.com/channel/0029VbAVMtj2f3EFmXmrzt0v'
var canal3 = 'https://whatsapp.com/channel/0029VbAVMtj2f3EFmXmrzt0v'
var api = ''
var git = 'https://github.com/Kone457'
var md = 'https://github.com/Kone457/Shizuka-AI'

globalThis.redes = [canal, canal2, canal3, api, git, md].getRandom()

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

global.fake = { contextInfo: { isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid: channelRD.id, serverMessageId: '0', newsletterName: channelRD.nombre, }, externalAdReply: { showAdAttribution: true, title: packname, body: dev, mediaUrl: null, description: null, previewType: "PHOTO", thumbnailUrl: icon, sourceUrl: redes, mediaType: 1, renderLargerThumbnail: false }}}

global.rcanal = {
  contextInfo: {
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: channelRD.id,
      newsletterName: channelRD.nombre,
      serverMessageId: '0'
    }
  }
}

}