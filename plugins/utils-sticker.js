import fs from 'fs'
import axios from 'axios'
import moment from 'moment-timezone'
import { sticker } from '../lib/sticker.js'
import uploadFile from '../lib/uploadFile.js'
import uploadImage from '../lib/uploadImage.js'
import { webp2png } from '../lib/webp2mp4.js'
import { getBotConfig } from '../lib/botconfig.js'

const isUrl = (text) => {
  return text.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)(jpe?g|gif|png)/, 'gi'))
}

let handler = async (m, { conn, args }) => {
  let stiker = false
  const hora = moment.tz('America/Havana').locale('es').format('hh:mm A')
  const fecha = moment.tz('America/Havana').locale('es').format('dddd, DD [de] MMMM [de] YYYY')
  const wm = `Bot: ${getBotConfig(conn, 'packname')}\nUsuario: ${m.pushName || 'Usuario'}\nHora: ${hora}\nFecha: ${fecha}\nDueño: ${global.author}\n${global.dev}`
  const pack = ''

  let thumb = null
  try {
    const ppUrl = await conn.profilePictureUrl(m.sender, 'image')
    if (ppUrl) {
      const res = await axios.get(ppUrl, { responseType: 'arraybuffer' })
      thumb = Buffer.from(res.data, 'binary')
    }
  } catch {
    try {
      const res = await axios.get('https://files.evogb.win/UTpc8M.jpg', { responseType: 'arraybuffer' })
      thumb = Buffer.from(res.data, 'binary')
    } catch {
      thumb = null
    }
  }

  const fkontak = {
    key: { fromMe: false, participant: '0@s.whatsapp.net' },
    message: {
      contactMessage: {
        displayName: m.pushName || 'Usuario',
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;${m.pushName};;;\nFN:${m.pushName}\nitem1.TEL;waid=${m.sender.replace(/[^0-9]/g,'')}:${m.sender}\nitem1.X-ABLabel:Cel\nEND:VCARD`,
        jpegThumbnail: thumb || fs.readFileSync('./src/logo.jpg')
      }
    }
  }

  try {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || q.mediaType || ''

    if (/webp|image|video/g.test(mime)) {
      if (/video/g.test(mime) && (q.msg || q).seconds > 10) {
        return m.reply(`《✧》 *¡El video no puede durar mas de 10 segundos!*`, m, { quoted: fkontak })
      }

      let img = await q.download?.()
      if (!img) return conn.reply(m.chat, `> *_La conversión ha fallado, intenta enviar primero imagen/video/gif y luego responde con el comando._*`, m, { quoted: fkontak })

      let out
      try {
        stiker = await sticker(img, false, pack, wm)
      } catch (e) {
        console.error(e)
      } finally {
        if (!stiker) {
          if (/webp/g.test(mime)) out = await webp2png(img)
          else if (/image/g.test(mime)) out = await uploadImage(img)
          else if (/video/g.test(mime)) out = await uploadFile(img)

          if (typeof out !== 'string') out = await uploadImage(img)
          stiker = await sticker(false, out, pack, wm)
        }
      }
    } else if (args[0]) {
      if (isUrl(args[0])) {
        stiker = await sticker(false, args[0], pack, wm)
      } else {
        return m.reply(`《✧》 El url es incorrecto`, m, { quoted: fkontak })
      }
    }
  } catch (e) {
    console.error(e)
    if (!stiker) stiker = e
  } finally {
    if (stiker) {
      await conn.sendMessage(m.chat, {
        sticker: stiker,
        forwardingScore: 0,
        isForwarded: false
      }, { quoted: fkontak })
    } else {
      return conn.reply(m.chat, '> *_La conversión ha fallado, intenta enviar primero imagen/video/gif y luego responde con el comando._*', m, { quoted: fkontak })
    }
  }
}

handler.help = ['sticker']
handler.tags = ['tools']
handler.command = ['s', 'sticker']

export default handler