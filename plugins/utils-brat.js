import fs from 'fs'
import axios from 'axios'
import moment from 'moment-timezone'
import { sticker } from '../lib/sticker.js'
import { getBotConfig } from '../lib/botconfig.js'

let handler = async (m, { conn, args }) => {
  let stiker = false
  const hora = moment.tz('America/Havana').locale('es').format('hh:mm A')
  const fecha = moment.tz('America/Havana').locale('es').format('dddd, DD [de] MMMM [de] YYYY')
  const wm = `Bot: ${getBotConfig(conn, 'packname')}\nUsuario: ${m.pushName || 'Usuario'}\nHora: ${hora}\nFecha: ${fecha}\nDueño: ${global.author}\n${global.dev}`

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
    if (!args[0]) {
      return conn.reply(m.chat, "《✧》 Ingresa el texto para el vídeo.", m, { quoted: fkontak })
    }

    const apiUrl = `${global.api.url2}/canvas/bratvideo?text=${encodeURIComponent(args.join(" "))}`
    const res = await axios.get(apiUrl, { responseType: 'arraybuffer' })
    const buffer = Buffer.from(res.data, 'binary')

    try {
      stiker = await sticker(buffer, false, '', wm)
    } catch (e) {
      console.error(e)
    }

    if (stiker) {
      await conn.sendMessage(m.chat, {
        sticker: stiker,
        forwardingScore: 0,
        isForwarded: false
      }, { quoted: fkontak })
    } else {
      return conn.reply(m.chat, '《✧》 No se pudo convertir el vídeo en sticker.', m, { quoted: fkontak })
    }
  } catch (e) {
    console.error(e)
    return conn.reply(m.chat, '《✧》 Error al generar el vídeo.', m, { quoted: fkontak })
  }
}

handler.help = ['brat']
handler.tags = ['tools']
handler.command = ['brat']

export default handler