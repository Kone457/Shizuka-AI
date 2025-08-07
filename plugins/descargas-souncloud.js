import fetch from 'node-fetch'

const sc = {
  _tools: {
    async hit(descripcion, url, opciones, tipo = "text") {
      try {
        const response = await fetch(url, opciones)
        if (!response.ok) {
          const cuerpo = await response.text()
          throw Error(`${response.status} ${response.statusText}: ${(cuerpo || 'Respuesta vacía').substring(0, 100)}...`)
        }

        switch (tipo) {
          case "text": return { data: await response.text(), response }
          case "json": return { data: await response.json(), response }
          case "buffer": return { data: Buffer.from(await response.arrayBuffer()), response }
          default: throw Error(`Tipo de retorno inválido: ${tipo}`)
        }
      } catch (e) {
        throw Error(`❌ Error en "${descripcion}": ${e.message}`)
      }
    },

    validateString(nombre, valor) {
      if (typeof valor !== "string" || valor.trim().length === 0) {
        throw Error(`⚠️ "${nombre}" debe ser una cadena no vacía.`)
      }
    }
  },

  get baseHeaders() {
    return {
      'accept-encoding': 'gzip, deflate, br, zstd',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0'
    }
  },

  async getTrackMetadata(url) {
    const headers = this.baseHeaders
    const { data: html } = await this._tools.hit("Obtener HTML de la pista", url, { headers })

    const jsonRaw = html.match(/<script>window.__sc_hydration = (.+?);<\/script>/)?.[1]
    if (!jsonRaw) throw Error("No se encontró el JSON de hidratación.")

    const json = JSON.parse(jsonRaw)
    const ddjsKey = html.match(/window\.ddjskey = '(.+?)';/)?.[1]
    const trackData = json?.[7]?.data

    const stream_url = trackData?.media?.transcodings?.[3]?.url
    if (!ddjsKey || !trackData?.track_authorization || !stream_url) {
      throw Error("Datos incompletos para la descarga.")
    }

    return {
      ddjsKey,
      track_authorization: trackData.track_authorization,
      stream_url,
      soundMetadata: {
        title: trackData.title || "Sin título",
        image: html.match(/og:image" content="(.+?)">/)?.[1],
        username: trackData.user?.username || "Desconocido",
        playbackCount: trackData.playback_count || 0,
        likesCount: trackData.likes_count || 0,
        commentsCount: trackData.comment_count || 0,
        displayDate: trackData.display_date || "Fecha desconocida"
      }
    }
  },

  async getDatadome({ ddjsKey }) {
    const headers = { Referer: "https://soundcloud.com/", ...this.baseHeaders }
    const body = new URLSearchParams({ ddk: ddjsKey })
    const url = 'https://dwt.soundcloud.com/js/'

    const { data: json } = await this._tools.hit("Obtener Datadome", url, { headers, body, method: "POST" }, "json")
    const valor = json?.cookie?.split("; ")?.[0]?.split("=")?.[1]
    if (!valor) throw Error("Datadome vacío.")
    return { datadome: valor }
  },

  async getClientId() {
    const { data: js } = await this._tools.hit("Obtener Client ID", 'https://a-v2.sndcdn.com/assets/0-b9979956.js', { headers: this.baseHeaders })
    const client_id = js.match(/"client_id=(.+?)"\)/)?.[1]
    if (!client_id) throw Error("Client ID no encontrado.")
    return { client_id }
  },

  async getHls(obj1, obj2, obj3) {
    const { datadome, stream_url, client_id, track_authorization } = { ...obj1, ...obj2, ...obj3 }
    const headers = { "x-datadome-clientid": datadome, ...this.baseHeaders }
    const url = new URL(stream_url)
    url.search = new URLSearchParams({ client_id, track_authorization })

    const { data: json } = await this._tools.hit("Obtener HLS", url, { headers }, "json")
    return json
  },

  async download(trackUrl) {
    this._tools.validateString("URL de la pista", trackUrl)
    const obj1 = await this.getTrackMetadata(trackUrl)
    const obj2 = await this.getClientId()
    const obj3 = await this.getDatadome(obj1)
    const hls = await this.getHls(obj1, obj2, obj3)

    return { ...obj1.soundMetadata, url: hls.url }
  }
}

let handler = async (m, { conn, args }) => {
  if (!args[0]) throw '📎 Proporciona una URL válida. Ejemplo:\n.soundcloudl https://soundcloud.com/nocopyrightsounds/stars-ncs-release'

  m.reply('⏳ Procesando tu solicitud...')

  try {
    const res = await sc.download(args[0])
    const audioRes = await fetch(res.url)
    const audioBuffer = await audioRes.buffer()

    await conn.sendMessage(m.chat, {
      audio: Buffer.from(audioBuffer),
      mimetype: 'audio/mpeg',
      fileName: `${res.title}.mp3`,
      ptt: false,
      contextInfo: {
        forwardingScore: 999999,
        isForwarded: true,
        externalAdReply: {
          title: `🎧 SoundCloud Downloader`,
          body: `${res.title} | Usuario: ${res.username} | Reproducciones: ${res.playbackCount?.toLocaleString('id-ID') || '-'}`,
          mediaType: 1,
          previewType: 0,
          renderLargerThumbnail: true,
          thumbnailUrl: res.image,
          sourceUrl: args[0]
        }
      }
    }, { quoted: m })

  } catch (e) {
    m.reply(`❌ Error al descargar:\n${e.message}`)
  }
}

handler.help = ['soundcloudl <url>']
handler.tags = ['descargador']
handler.command = ['soundcloudl', 'scdl']

export default handler