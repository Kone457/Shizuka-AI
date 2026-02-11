import fetch from 'node-fetch'


const captions = {      
  anal: (from, to) => from === to ? 'se la metió en el ano.' : 'se la metió en el ano a',
  cum: (from, to) => from === to ? 'se vino dentro de... Omitiremos eso.' : 'se vino dentro de',
  undress: (from, to) => from === to ? 'se está quitando la ropa' : 'le está quitando la ropa a',
  fuck: (from, to) => from === to ? 'se entrega al deseo' : 'se está cogiendo a',
  spank: (from, to) => from === to ? 'está dando una nalgada' : 'le está dando una nalgada a',
  lickpussy: (from, to) => from === to ? 'está lamiendo un coño' : 'le está lamiendo el coño a',
  fap: (from, to) => from === to ? 'se está masturbando' : 'se está masturbando pensando en',
  grope: (from, to) => from === to ? 'se lo está manoseando' : 'se lo está manoseando a',
  sixnine: (from, to) => from === to ? 'está haciendo un 69' : 'está haciendo un 69 con',
  suckboobs: (from, to) => from === to ? 'está chupando unas ricas tetas' : 'le está chupando las tetas a',
  grabboobs: (from, to) => from === to ? 'está agarrando unas tetas' : 'le está agarrando las tetas a',
  blowjob: (from, to) => from === to ? 'está dando una rica mamada' : 'le dio una mamada a',
  boobjob: (from, to) => from === to ? 'está haciendo una rusa' : 'le está haciendo una rusa a',
  footjob: (from, to) => from === to ? 'está haciendo una paja con los pies' : 'le está haciendo una paja con los pies a'
}

const symbols = ['(⁠◠⁠‿⁠◕⁠)','˃͈◡˂͈','૮(˶ᵔᵕᔶ)ა','(づ｡◕‿‿◕｡)づ','(✿◡‿◡)','(꒪⌓꒪)','(✿✪‿✪｡)','(*≧ω≦)','(✧ω◕)','˃ 𖥦 ˂','(⌒‿⌒)','(¬‿¬)','(✧ω✧)','✿(◕ ‿◕)✿','ʕ•́ᴥ•̀ʔっ','(ㅇㅅㅇ❀)','(∩︵∩)','(✪ω✪)','(✯◕‿◕✯)','(•̀ᴗ•́)و ̑̑']
function getRandomSymbol () { return symbols[Math.floor(Math.random() * symbols.length)] }

const commandAliases = {
  encuerar: 'undress',
  coger: 'fuck',
  nalgada: 'spank',
  paja: 'fap',
  '69': 'sixnine',
  bj: 'blowjob'
}

async function getNsfwGif(type) {
    
  const apis = [
    async () => { 
      try {
        const res = await fetch(`https://api.waifu.pics/nsfw/${type}`)
        const json = await res.json()
        if (json?.url && (json.url.endsWith('.gif') || json.url.endsWith('.mp4') || json.url.endsWith('.webm'))) {
          return json.url
        }
      } catch {}
      return null
    },
    async () => { 
      try {
        const res = await fetch(`https://nekos.best/api/v2/${type}`)
        const json = await res.json()
        if (json?.results?.[0]?.url) return json.results[0].url
      } catch {}
      return null
    },
    async () => { 
      try {
        const nekoMap = {
          anal:'anal', cum:'cum', undress:'hentai', fuck:'hentai', spank:'spank',
          lickpussy:'pussy', fap:'hentai', grope:'hentai', sixnine:'hentai',
          suckboobs:'boobs', grabboobs:'boobs', blowjob:'blowjob', boobjob:'hentai', footjob:'feet'
        }
        const t = nekoMap[type] || 'hentai'
        const res = await fetch(`https://nekobot.xyz/api/image?type=${t}`)
        const j = await res.json()
        if (j?.message) return j.message
      } catch {}
      return null
    }
  ]

  for (const api of apis) {
    const url = await api()
    if (url) return url
  }

  return null
}

export default {
  command: [
    'anal','cum','undress','encuerar','fuck','coger','spank','nalgada',
    'lickpussy','fap','paja','grope','sixnine','69','suckboobs',
    'grabboobs','blowjob','bj','boobjob','footjob'
  ],
  category: 'nsfw',

  run: async (client, m, args, command) => {
    if (!global.db.data.chats[m.chat]?.nsfw)
      return m.reply('✐ Los comandos de *NSFW* están desáctivados en este Grupo.')

    const used = (command || '').toLowerCase()
    const currentCommand = commandAliases[used] || used
    if (!captions[currentCommand]) return

    let who
    const texto = m.mentionedJid || []

    if (m.isGroup) {
      who = texto.length ? texto[0] : m.quoted ? m.quoted.sender : m.sender
    } else {
      who = m.quoted ? m.quoted.sender : m.sender
    }

    const fromName = global.db.data.users[m.sender]?.name || 'Alguien'
    const toName = global.db.data.users[who]?.name || 'alguien'

    const captionText = captions[currentCommand](fromName, toName)
    const caption =
      who !== m.sender
        ? `@${m.sender.split('@')[0]} ${captionText} @${who.split('@')[0]} ${getRandomSymbol()}.`
        : `${fromName} ${captionText} ${getRandomSymbol()}.`

    try {
      const gif = await getNsfwGif(currentCommand)
      if (!gif) return m.reply('✐ No se pudo obtener un gif.')

      await client.sendMessage(
        m.chat,
        {
          video: { url: gif },
          gifPlayback: true,
          caption,
          mentions: [who, m.sender]
        },
        { quoted: m }
      )

    } catch (e) {
      console.error(e)
      await m.reply(msgglobal)
    }
  }
}