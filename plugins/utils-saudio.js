
import { downloadContentFromMessage, prepareWAMessageMedia, generateWAMessageFromContent } from '@whiskeysockets/baileys'
import { spawn } from 'child_process'
import { promises as fsp } from 'fs'
import os from 'os'
import path from 'path'
import { sticker as crearSticker } from '../lib/sticker.js'

const MAX_SEG = 8
const MIME_AUDIO = 'audio/ogg; codecs=opus'
const MAX_STICKER = 1536 * 1024
const TTL_PENDIENTE = 5 * 60 * 1000
const TTL_RECIENTE = 10 * 60 * 1000
const MAX_CACHE = 500
const pendientes = new Map()
const recientes = new Map()

const claveDe = (chat, sender) => `${chat}|${sender}`
const tipoDe = x => x?.mtype || ''
const mimeDe = x => x?.mimetype || x?.msg?.mimetype || ''
const segundosDe = x => Number(x?.seconds || x?.msg?.seconds || 0) || 0
const esAudio = tipo => tipo === 'audioMessage' || tipo === 'pttMessage'
const esSticker = tipo => tipo === 'stickerMessage'
const esVideo = tipo => tipo === 'videoMessage' || tipo === 'ptvMessage'
const esAudioDoc = x => {
    const nombre = `${mimeDe(x)} ${x?.fileName || x?.msg?.fileName || ''}`
    return tipoDe(x) === 'documentMessage' && /audio|ogg|opus|mpeg|mp3|m4a|aac|wav|amr/i.test(nombre)
}
const esWebp = b => Buffer.isBuffer(b) && b.length > 32 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP'
const esOgg = b => Buffer.isBuffer(b) && b.length > 4 && b.toString('ascii', 0, 4) === 'OggS'

const limpiar = (mapa, ttl) => {
    const ahora = Date.now()
    for (const [k, v] of mapa) if (ahora - (v?.ts || 0) > ttl) mapa.delete(k)
    if (mapa.size > MAX_CACHE) {
        const viejos = [...mapa.entries()].sort((a, b) => (a[1]?.ts || 0) - (b[1]?.ts || 0)).slice(0, mapa.size - MAX_CACHE)
        for (const [k] of viejos) mapa.delete(k)
    }
}

const bajar = async x => {
    if (!x) return null
    try {
        if (typeof x.download === 'function') {
            const buffer = await x.download()
            if (Buffer.isBuffer(buffer) && buffer.length) return buffer
        }
    } catch {}
    try {
        const tipo = x?.mediaType || tipoDe(x)
        const contenedor = x?.mediaMessage || x?.message || x
        const media = contenedor?.[tipo] || x?.msg
        if (!media || (!media.directPath && !media.url)) return null
        let formato = tipo.replace(/Message$/i, '').toLowerCase()
        if (formato === 'ptv') formato = 'video'
        if (formato === 'ptt') formato = 'audio'
        const stream = await downloadContentFromMessage(media, formato)
        const partes = []
        for await (const parte of stream) partes.push(parte)
        const buffer = Buffer.concat(partes)
        return buffer.length ? buffer : null
    } catch {
        return null
    }
}

const correr = args => new Promise((resolve, reject) => {
    let proceso
    try {
        proceso = spawn('ffmpeg', ['-y', '-loglevel', 'error', ...args])
    } catch (error) {
        return reject(error)
    }
    let salidaError = ''
    proceso.stderr.on('data', data => {
        salidaError = (salidaError + data.toString()).slice(-300)
    })
    proceso.on('error', reject)
    proceso.on('close', codigo => codigo === 0 ? resolve() : reject(new Error(`ffmpeg ${codigo} ${salidaError.trim()}`)))
})

const aOpus = async (buffer, seg) => {
    const id = `sa-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const entrada = path.join(os.tmpdir(), `${id}.bin`)
    const salida = path.join(os.tmpdir(), `${id}.ogg`)
    try {
        await fsp.writeFile(entrada, buffer)
        await correr(['-i', entrada, '-vn', '-map', '0:a:0', '-t', String(seg), '-c:a', 'libopus', '-b:a', '32k', '-ar', '48000', '-ac', '1', '-application', 'voip', '-f', 'ogg', salida])
        const listo = await fsp.readFile(salida)
        return listo.length ? listo : null
    } catch {
        return null
    } finally {
        await fsp.unlink(entrada).catch(() => {})
        await fsp.unlink(salida).catch(() => {})
    }
}

const prepararAudio = async (buffer, seg, duracion) => {
    if (!Buffer.isBuffer(buffer) || !buffer.length) return null
    if (esOgg(buffer) && duracion > 0 && duracion <= MAX_SEG) return buffer
    const convertido = await aOpus(buffer, seg)
    if (convertido) return convertido
    return esOgg(buffer) && duracion > 0 && duracion <= MAX_SEG ? buffer : null
}

const onda = buffer => {
    const marcas = new Uint8Array(64)
    if (!Buffer.isBuffer(buffer) || !buffer.length) return marcas
    const paso = Math.max(1, Math.floor(buffer.length / 64))
    for (let i = 0; i < 64; i++) {
        const inicio = i * paso
        const fin = Math.min(buffer.length, inicio + paso)
        let suma = 0
        for (let j = inicio; j < fin; j++) suma += Math.abs(buffer[j] - 128)
        marcas[i] = Math.min(100, Math.round((suma / Math.max(1, fin - inicio)) * 1.5))
    }
    return marcas
}

const reaccion = (conn, m, emoji) => {
    try {
        return conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } }).catch(() => {})
    } catch {
        return null
    }
}

const mandar = async (conn, m, webp, opus, seg, animado) => {
    if (!conn.waUploadToServer) throw new Error('No existe waUploadToServer en la conexión')
    const marcas = onda(opus)
    const subida = { upload: conn.waUploadToServer }
    const stickerMedia = await prepareWAMessageMedia({ sticker: webp, mimetype: 'image/webp', isAnimated: animado === true }, subida)
    const audioMedia = await prepareWAMessageMedia({ audio: opus, mimetype: MIME_AUDIO, ptt: true, seconds: seg, waveform: marcas }, subida)
    if (!stickerMedia?.stickerMessage || !audioMedia?.audioMessage) throw new Error('No se pudo preparar el sticker o el audio')
    const contenido = {
        ...stickerMedia.stickerMessage,
        isAnimated: animado === true,
        audioMessage: {
            ...audioMedia.audioMessage,
            mimetype: MIME_AUDIO,
            seconds: seg,
            ptt: true,
            waveform: marcas
        }
    }
    const armado = generateWAMessageFromContent(m.chat, { stickerMessage: contenido }, {
        quoted: m,
        userJid: conn.user?.jid || conn.user?.id
    })
    if (!armado?.message?.stickerMessage?.audioMessage) throw new Error('Baileys no permite audio dentro del sticker')
    await conn.relayMessage(m.chat, armado.message, { messageId: armado.key.id })
    return armado
}

const combinar = async (conn, m, webp, animado, audio, duracion) => {
    const seg = Math.min(MAX_SEG, Math.max(1, Math.round(duracion || MAX_SEG)))
    const opus = await prepararAudio(audio, seg, duracion)
    if (!opus) return null
    return mandar(conn, m, webp, opus, seg, animado)
}

const handler = async (m, { conn, usedPrefix, command }) => {
    const uso = `${usedPrefix || ''}${command || 'sa'}`
    const responder = (texto, defecto) => m.reply(texto || defecto || '❆ No pude hacer eso.')
    const q = m.quoted
    const tipoM = tipoDe(m)
    const k = claveDe(m.chat, m.sender)
    const pack = global.packname || global.botname || 'Shizuka-AI'
    const author = global.author || global.botname || 'Carlos'

    try {
        if (!q) {
            if (esAudio(tipoM) || esAudioDoc(m)) {
                const audio = await bajar(m)
                if (!audio) return responder(null, '❆ No pude descargar ese audio.')
                pendientes.set(k, { tipo: 'audio', buffer: audio, duracion: segundosDe(m), ts: Date.now() })
                return responder(null, '❈ Listo, guardé ese audio.\n\nMandá ahora el *sticker* al que se lo querés pegar.')
            }
            return responder(null, `❈ 1. Mandá un audio y después un sticker.\n2. Respondé a un sticker con un audio para agregarle sonido.\n3. Respondé a un video con ${uso} para convertirlo en sticker animado con audio.\n\n❆ También podés responder a un audio con ${uso} y después enviar el sticker.`)
        }

        if (esVideo(tipoDe(q))) {
            await reaccion(conn, m, '❆')
            const video = await bajar(q)
            if (!video) {
                await reaccion(conn, m, '❆')
                return responder(null, '❆ No pude descargar ese video.')
            }
            const webp = await crearSticker(video, null, pack, author)
            if (!esWebp(webp)) {
                await reaccion(conn, m, '❆')
                return responder(null, '❆ No pude convertir ese video en sticker.')
            }
            if (webp.length > MAX_STICKER) {
                await reaccion(conn, m, '❆')
                return responder(null, '❆ El sticker supera el tamaño permitido.')
            }
            const duracion = segundosDe(q)
            const seg = Math.min(MAX_SEG, Math.max(1, Math.round(duracion || MAX_SEG)))
            const opus = await prepararAudio(video, seg, duracion)
            if (!opus) {
                await reaccion(conn, m, '❆')
                return responder(null, '❆ No encontré audio en ese video.')
            }
            await mandar(conn, m, webp, opus, seg, webp.includes('ANMF'))
            await reaccion(conn, m, '❈')
            return
        }

        if (esAudio(tipoDe(q)) || esAudioDoc(q)) {
            const audio = await bajar(q)
            if (!audio) return responder(null, '❆ No pude descargar ese audio.')
            pendientes.set(k, { tipo: 'audio', buffer: audio, duracion: segundosDe(q), ts: Date.now() })
            return responder(null, '❈ Listo, guardé ese audio.\n\nMandá ahora el *sticker* al que se lo querés pegar.')
        }

        if (esSticker(tipoDe(q))) {
            const webp = await bajar(q)
            if (!esWebp(webp)) return responder(null, '❆ El mensaje citado no es un sticker válido.')
            if (webp.length > MAX_STICKER) return responder(null, '❆ Ese sticker es demasiado grande.')
            const animado = q?.isAnimated === true || q?.msg?.isAnimated === true || webp.includes('ANMF')
            let fuente = null

            if (esAudio(tipoM) || esAudioDoc(m)) {
                const propio = await bajar(m)
                if (propio) fuente = { buffer: propio, duracion: segundosDe(m) }
            }

            if (!fuente) {
                limpiar(recientes, TTL_RECIENTE)
                const guardado = recientes.get(k)
                if (guardado) {
                    const audio = await bajar(guardado.msg)
                    if (audio) fuente = { buffer: audio, duracion: guardado.duracion }
                }
            }

            if (!fuente) {
                pendientes.set(k, { tipo: 'sticker', buffer: webp, animado, ts: Date.now() })
                return responder(null, '❈ Listo, guardé ese sticker.\n\nMandá ahora el *audio* en un mensaje aparte y se lo pegaré.')
            }

            pendientes.delete(k)
            await reaccion(conn, m, '❆')
            const enviado = await combinar(conn, m, webp, animado, fuente.buffer, fuente.duracion)
            if (!enviado) {
                await reaccion(conn, m, '❆')
                return responder(null, '❆ No pude preparar ese audio para el sticker.')
            }
            await reaccion(conn, m, '❈')
            return
        }

        return responder(null, `❈ Respondé con *${uso}* a un sticker, audio o video.`)
    } catch (e) {
        console.error('[STICKERAUDIO]', e?.stack || e)
        await reaccion(conn, m, '❆')
        return responder(null, '❆ Algo falló creando el sticker con audio.')
    }
}

handler.all = async function (m) {
    const conn = this
    try {
        const chat = m?.chat
        const sender = m?.sender
        if (!chat || !sender) return
        const k = claveDe(chat, sender)
        const tipo = tipoDe(m)

        if (esAudio(tipo) || esAudioDoc(m)) {
            limpiar(recientes, TTL_RECIENTE)
            recientes.set(k, { msg: m, duracion: segundosDe(m), ts: Date.now() })
        }

        if (!pendientes.size) return
        const pendiente = pendientes.get(k)
        if (!pendiente) return

        if (Date.now() - pendiente.ts > TTL_PENDIENTE) {
            pendientes.delete(k)
            return
        }

        if (typeof m.text === 'string' && m.text.trim()) {
            const prefijo = global.prefix
            if (prefijo instanceof RegExp) {
                prefijo.lastIndex = 0
                const esComando = prefijo.test(m.text.trim())
                prefijo.lastIndex = 0
                if (esComando) return
            }
        }

        if (pendiente.tipo === 'sticker') {
            if (!esAudio(tipo) && !esAudioDoc(m)) return
            const audio = await bajar(m)
            if (!audio) return
            pendientes.delete(k)
            const enviado = await combinar(conn, m, pendiente.buffer, pendiente.animado, audio, segundosDe(m))
            if (!enviado) {
                await reaccion(conn, m, '❆')
                await m.reply('❆ No pude preparar ese audio para el sticker.')
                return
            }
            await reaccion(conn, m, '❈')
            return
        }

        if (pendiente.tipo === 'audio') {
            if (!esSticker(tipo)) return
            const webp = await bajar(m)
            if (!esWebp(webp)) return
            if (webp.length > MAX_STICKER) {
                pendientes.delete(k)
                await m.reply('❆ Ese sticker es demasiado grande.')
                return
            }
            pendientes.delete(k)
            const animado = m?.msg?.isAnimated === true || webp.includes('ANMF')
            const enviado = await combinar(conn, m, webp, animado, pendiente.buffer, pendiente.duracion)
            if (!enviado) {
                await reaccion(conn, m, '❆')
                await m.reply('❆ No pude armar el sticker con ese audio.')
                return
            }
            await reaccion(conn, m, '❈')
        }
    } catch (e) {
        console.error('[STICKERAUDIO ALL]', e?.stack || e)
    }
}

handler.command = ['sa', 'stickeraudio', 'stickeraudioagregar', 'stickersonoro']
handler.tags = ['sticker']
handler.help = ['sa']

export default handler
