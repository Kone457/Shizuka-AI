import fetch from 'node-fetch'

const commandAliases = {
  hug: 'hug', abrazo: 'hug',
  kiss: 'kiss', beso: 'kiss',
  pat: 'pat', caricia: 'pat',
  slap: 'slap', bofetada: 'slap',
  wave: 'wave', saludar: 'wave',
  laugh: 'laugh', reir: 'laugh',

  cuddle: 'cuddle',
  wink: 'wink',
  smile: 'smile',
  cry: 'cry',
  smug: 'smug',
  dance: 'dance',
  blush: 'blush',
  bonk: 'bonk',
  bite: 'bite',
  bully: 'bully',
  highfive: 'highfive',
  handhold: 'handhold'
}

const captions = {
  hug: (a, b, g) => `abraza a`,
  kiss: (a, b, g) => `besa a`,
  pat: (a, b, g) => `acaricia a`,
  slap: (a, b, g) => `golpea a`,
  wave: (a, b, g) => `saluda a`,
  laugh: (a, b, g) => `se ríe con`,

  cuddle: (a,b,g)=>`acurruca a`,
  wink: (a,b,g)=>`guiña a`,
  smile: (a,b,g)=>`sonríe a`,
  cry: (a,b,g)=>`llora con`,
  smug: (a,b,g)=>`se burla de`,
  dance: (a,b,g)=>`baila con`,
  blush: (a,b,g)=>`se sonroja con`,
  bonk: (a,b,g)=>`le da un bonk a`,
  bite: (a,b,g)=>`muerde a`,
  bully: (a,b,g)=>`molesta a`,
  highfive: (a,b,g)=>`choca la mano con`,
  handhold: (a,b,g)=>`toma la mano de`
}


const symbols = ['🕷️','🕸️','🕷','🕸']

function getRandomSymbol () {
  return symbols[Math.floor(Math.random() * symbols.length)]
}


async function getGif(action) {

  const queries = {
    hug: 'anime hug',
    kiss: 'anime kiss',
    pat: 'anime head pat',
    slap: 'anime slap',
    wave: 'anime wave',
    laugh: 'anime laugh',
    cuddle: 'anime cuddle',
    wink: 'anime wink',
    smile: 'anime smile',
    cry: 'anime cry',
    smug: 'anime smug',
    dance: 'anime dance',
    blush: 'anime blush',
    bonk: 'anime bonk',
    bite: 'anime bite',
    bully: 'anime bully',
    highfive: 'anime high five',
    handhold: 'anime hand holding'
  }

  const q = queries[action] || action

  const params = new URLSearchParams({
    key: 'AIzaSyC-P6_qz3FzCoXGLk6tgitZo4jEJ5mLzD8',
    client_key: 'tenor_web',
    locale: 'es_US',
    q,
    limit: '25',
    contentfilter: 'low',
    media_filter: 'gif,originalgif,mp4,webm,tinymp4'
  })

  const url = `https://tenor.googleapis.com/v2/search?${params}`

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Android 13)'
    }
  })

  const json = await res.json()

  const list = (json.results || [])
    .map(r =>
      r.media_formats?.tinymp4?.url ||
      r.media_formats?.mp4?.url ||
      r.media_formats?.gif?.url ||
      r.media_formats?.originalgif?.url ||
      r.media_formats?.webm?.url
    )
    .filter(Boolean)

  if (!list.length) return null

  return list[Math.floor(Math.random() * list.length)]
}


export default {
  command: Object.keys(commandAliases),
  category: 'anime',

  run: async (client, m, args, command) => {

    const currentCommand = commandAliases[command] || command

    if (!captions[currentCommand]) return

    let who
    const texto = m.mentionedJid || []

    if (m.isGroup) {
      who = texto.length
        ? texto[0]
        : m.quoted
          ? m.quoted.sender
          : m.sender
    } else {
      who = m.quoted ? m.quoted.sender : m.sender
    }

    const fromName = global.db.data.users[m.sender]?.name || 'Alguien'
    const toName = global.db.data.users[who]?.name || 'alguien'
    const genero = global.db.data.users[m.sender]?.genre || 'Oculto'

    const captionText = captions[currentCommand](fromName, toName, genero)

    const caption =
      who !== m.sender
        ? `@${m.sender.split('@')[0]} ${captionText} @${who.split('@')[0]} ${getRandomSymbol()}.`
        : `${fromName} ${captionText} ${getRandomSymbol()}.`

    try {

      const result = await getGif(currentCommand)

      if (!result) {
        return client.reply(m.chat, '✐ No se pudo obtener un gif', m)
      }

      await client.sendMessage(
        m.chat,
        {
          video: { url: result },
          gifPlayback: true,
          caption,
          mentions: [m.sender, who]
        },
        { quoted: m }
      )

    } catch (e) {
      console.error(e)
      await m.reply(msgglobal)
    }
  }
}