import fs from 'fs'
import axios from 'axios'
import moment from 'moment-timezone'
import { sticker } from '../lib/sticker.js'
import uploadFile from '../lib/uploadFile.js'
import uploadImage from '../lib/uploadImage.js'
import { webp2png } from '../lib/webp2mp4.js'
import { getBotConfig } from '../lib/botconfig.js'

const isUrl = (text) => {
    return /https?:\/\/(www\.)?[-a-zA-Z0-9@:%.+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%+.~#?&/=]*)(jpe?g|gif|png)/i.test(text)
}

async function searchPinterest(query, limit = 5) {
    query = String(query).trim()
    const encoded = encodeURIComponent(query)
    const sourceUrl = `/search/pins/?q=${encoded}&rs=typed`

    const data = {
        options: {
            query,
            scope: 'pins',
            rs: 'typed',
            redux_normalize_feed: true,
            source_url: sourceUrl
        },
        context: {}
    }

    const url = `https://id.pinterest.com/resource/BaseSearchResource/get/?source_url=${encodeURIComponent(sourceUrl)}&data=${encodeURIComponent(JSON.stringify(data))}`

    const headers = {
        accept: 'application/json, text/javascript, */*; q=0.01',
        'accept-language': 'es-419,es;q=0.9,en;q=0.8',
        referer: 'https://id.pinterest.com/',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/133 Safari/537.36',
        'x-app-version': 'c056fb7',
        'x-pinterest-appstate': 'active',
        'x-pinterest-pws-handler': 'www/index.js',
        'x-pinterest-source-url': '/',
        'x-requested-with': 'XMLHttpRequest'
    }

    const { data: response } = await axios.get(url, { headers, responseType: 'text', transformResponse: [(data) => data], timeout: 30000 })

    if (!response || !response.trim().startsWith('{')) {
        throw new Error('Pinterest bloqueó la petición')
    }

    const json = JSON.parse(response)
    const results = json?.resource_response?.data?.results || []
    const medias = []

    for (const item of results) {
        const img = item?.images?.orig?.url || item?.images?.['564x']?.url || item?.images?.['236x']?.url
        if (img) medias.push(img)
        if (medias.length >= limit) break
    }

    return medias
}

let handler = async (m, { conn, args }) => {
    let stiker = false
    let searchMode = false
    let searchSent = false

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
        key: {
            fromMe: false,
            participant: '0@s.whatsapp.net'
        },
        message: {
            contactMessage: {
                displayName: m.pushName || 'Usuario',
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;${m.pushName};;;\nFN:${m.pushName}\nitem1.TEL;waid=${m.sender.replace(/[^0-9]/g, '')}:${m.sender}\nitem1.X-ABLabel:Cel\nEND:VCARD`,
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
            const query = args.join(' ')
            if (isUrl(query)) {
                stiker = await sticker(false, query, pack, wm)
            } else {
                searchMode = true
                const results = await searchPinterest(query, 5)
                for (const url of results) {
                    try {
                        const res = await axios.get(url, {
                            responseType: 'arraybuffer',
                            timeout: 30000,
                            headers: {
                                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/133 Safari/537.36',
                                referer: 'https://www.pinterest.com/'
                            }
                        })
                        if (res.status !== 200) continue
                        const img = Buffer.from(res.data)
                        const stickerData = await sticker(img, false, pack, wm)
                        await conn.sendMessage(m.chat, { sticker: stickerData, forwardingScore: 0, isForwarded: false }, { quoted: fkontak })
                        searchSent = true
                    } catch {
                        continue
                    }
                }
            }
        }

    } catch (e) {
        console.error(e)
        if (!stiker) stiker = e
    } finally {
        if (stiker) {
            await conn.sendMessage(m.chat, { sticker: stiker, forwardingScore: 0, isForwarded: false }, { quoted: fkontak })
        } else if (!searchMode || !searchSent) {
            return conn.reply(m.chat, '> La conversión ha fallado, intenta enviar primero imagen/video/gif y luego responde con el comando.', m, { quoted: fkontak })
        }
    }
}

handler.help = ['sticker']
handler.tags = ['tools']
handler.command = ['s', 'sticker']

export default handler
