import fetch from 'node-fetch'

const emoji = '⚠️'
const emoji2 = '❌'
const rwait = '⏳'
const wait = '> Procesando tu solicitud...'
const done = '✅'
const error = '💥'
const dev = 'Powered by Carlos'

let regex = /(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/(.+)/i

let handler = async (m, { args, usedPrefix, command }) => {
  if (!args[0]) {
    return conn.reply(m.chat, `${emoji} Por favor, ingresa la URL de un repositorio de GitHub que deseas descargar.`, m)
  }
  if (!regex.test(args[0])) {
    return conn.reply(m.chat, `${emoji2} Verifica que la *URL* sea de GitHub`, m).then(_ => m.react(error))
  }

  let [_, user, repo] = args[0].match(regex) || []
  let sanitizedRepo = repo.replace(/.git$/, '')
  let repoUrl = `https://api.github.com/repos/${user}/${sanitizedRepo}`
  let zipUrl = `https://api.github.com/repos/${user}/${sanitizedRepo}/zipball`

  await m.react(rwait)
  try {
    conn.reply(m.chat, wait, m)

    let [repoResponse, zipResponse] = await Promise.all([
      fetch(repoUrl),
      fetch(zipUrl),
    ])

    let repoData = await repoResponse.json()

    let disposition = zipResponse.headers.get('content-disposition') || ''
    let filenameMatch = disposition.match(/attachment; filename=(.*)/)
    let filename = filenameMatch ? filenameMatch[1] : `${sanitizedRepo}.zip`

    let img = 'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745610598914.jpeg'
    let txt = `*乂  G I T H U B  -  D O W N L O A D*\n\n`
    txt += `✩  *Nombre* : ${sanitizedRepo}\n`
    txt += `✩  *Repositorio* : ${user}/${sanitizedRepo}\n`
    txt += `✩  *Creador* : ${repoData.owner?.login || 'Desconocido'}\n`
    txt += `✩  *Descripción* : ${repoData.description || 'Sin descripción disponible'}\n`
    txt += `✩  *Url* : ${args[0]}\n\n`
    txt += `> ${dev}`

    await conn.sendFile(m.chat, img, 'thumbnail.jpg', txt, m)

    let zipBuffer = Buffer.from(await zipResponse.arrayBuffer())
    await conn.sendFile(m.chat, zipBuffer, filename, null, m)

    await m.react(done)
  } catch (e) {
    console.error(e)
    await m.react(error)
  }
}

handler.help = ['gitclone *<url git>*']
handler.tags = ['descargas']
handler.command = ['gitclone']
handler.group = true

export default handler