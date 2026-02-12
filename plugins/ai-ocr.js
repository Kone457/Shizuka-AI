import { gotScraping } from 'got-scraping';
import { fileTypeFromBuffer } from 'file-type';

export default {
  command: ['ocr', 'totext', 'imagetotext'],
  category: 'ai',
  run: async (client, m, args, command) => {

    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const isOficialBot = botId === global.client.user.id.split(':')[0] + '@s.whatsapp.net'
    const isPremiumBot = global.db.data.settings[botId]?.botprem === true
    const isModBot = global.db.data.settings[botId]?.botmod === true

    if (!isOficialBot && !isPremiumBot && !isModBot) {
      return client.reply(m.chat, `🔹 El comando *${command}* no está disponible en *Sub-Bots.*`, m)
    }

    const q = m.quoted ? m.quoted : m
    const mime = (q.msg || q).mimetype || q.mediaType || ''

    if (!/image\/(png|jpe?g|gif|bmp|webp)/.test(mime)) {
      return m.reply(`*⚠️ Responde a una imagen para extraer el texto.*\nEjemplo: Responde a una foto y escribe:\n#${command}`)
    }

    try {
      await m.reply('⏳ *Procesando imagen...*')

      const buffer = await q.download?.()
      if (!buffer) return m.reply('❌ Error al descargar la imagen.')

      const ft = await fileTypeFromBuffer(buffer)
      const ext = ft?.ext || 'png'
      const base64 = buffer.toString('base64')

    
      const ocrBase64 = async (b64, ext) => {
        const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
        const baseUrl = 'https://imagetotextconverter.net'
        const apiUrl = 'https://itt2.imagetotextconverter.net'
        const bypassReferers = [
          '/handwriting-to-text', '/image-translator', '/image-compressor',
          '/reverse-image-search', '/jpg-to-pdf', '/png-to-pdf'
        ]
        let currentReferer = 0
        let jwt = null
        let jwtExpiry = 0

        const upd = () => (Math.random() * 1000).toString()
        const getReferer = () => `${baseUrl}${bypassReferers[currentReferer % bypassReferers.length]}`
        const rotateReferer = () => { currentReferer++ }

        const getJwt = async () => {
          const now = Math.floor(Date.now() / 1000)
          if (jwt && jwtExpiry > now + 10) return jwt

          const res = await gotScraping({
            url: `${baseUrl}/gen-ref-jwt?upd=${upd()}`,
            method: 'POST',
            headers: {
              'User-Agent': UA,
              'Referer': getReferer(),
              'Origin': baseUrl,
              'X-Requested-With': 'XMLHttpRequest',
              'Content-Type': 'application/json',
            },
            json: { method: 'V2' },
            throwHttpErrors: false,
          })

          const data = JSON.parse(res.body)
          if (res.statusCode !== 200) {
            rotateReferer()
            return getJwt()
          }

          jwt = data.result.token
          const payload = JSON.parse(Buffer.from(jwt.split('.')[1], 'base64url').toString())
          jwtExpiry = payload.exp
          return jwt
        }

        const token = await getJwt()
        const res = await gotScraping({
          url: `${apiUrl}/file-to-text/?upd=${upd()}`,
          method: 'POST',
          headers: {
            'User-Agent': UA,
            'Referer': getReferer(),
            'Origin': baseUrl,
            'Authorization': `Bearer ${token}`,
            'JVer': 'JwtV2',
            'Content-Type': 'application/json'
          },
          json: {
            ext: ext,
            tool_user: 'web',
            base64_image: b64,
          },
          throwHttpErrors: false,
        })

        if (res.statusCode === 401) {
          jwt = null
          return ocrBase64(b64, ext)
        }

        const data = JSON.parse(res.body)
        if (data.code !== 200) throw new Error('Error al procesar la imagen')
        return data.response?.data || ''
      }

      const text = await ocrBase64(base64, ext)

      if (!text.trim()) return m.reply('⚠️ No se detectó texto en la imagen.')

      await client.sendMessage(m.chat, { text: `📝 *TEXTO EXTRAÍDO:*\n\n${text.trim()}` }, { quoted: m })

    } catch (error) {
      console.error(error)
      await m.reply('❌ Ocurrió un error inesperado.')
    }
  }
}