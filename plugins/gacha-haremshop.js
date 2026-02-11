import fs from 'fs';

function obtenerCharacterValue(name) {
  const characterDataPath = './lib/characters.json'
  if (!fs.existsSync(characterDataPath)) return 'Valor no disponible'
  const characterData = JSON.parse(fs.readFileSync(characterDataPath, 'utf-8'))
  const character = characterData.find((char) => char.name === name)
  return character ? character.value?.toLocaleString() : 'Valor no disponible'
}

function obtenerTiempoRestante(expira) {
  const ahora = Date.now()
  const diferencia = expira - ahora
  if (diferencia <= 0) return 'Expirado'

  const segundos = Math.floor((diferencia / 1000) % 60)
  const minutos = Math.floor((diferencia / (1000 * 60)) % 60)
  const horas = Math.floor((diferencia / (1000 * 60 * 60)) % 24)
  const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24))

  const partes = []
  if (dias > 0) partes.push(`${dias}d`)
  if (horas > 0) partes.push(`${horas}h`)
  if (minutos > 0) partes.push(`${minutos}m`)
  if (segundos > 0 || partes.length === 0) partes.push(`${segundos}s`)

  return partes.join(' ')
}

export default {
  command: ['haremshop', 'tiendawaifus', 'wshop'],
  category: 'gacha',
  run: async (client, m, args) => {
    const db = global.db.data
    const chatId = m.chat
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const chatConfig = db.chats[chatId]
    const monedas = db.settings?.[botId]?.currency || 'monedas'

    if (chatConfig.adminonly || !chatConfig.gacha)
      return m.reply(`✎ Estos comandos estan desactivados en este grupo.`)

    const personajesEnVenta = Object.entries(chatConfig.users || {}).flatMap(
      ([uid, user]) =>
        user.personajesEnVenta?.map((p) => ({
          name: p.name,
          precio: p.precio,
          expira: p.expira,
          vendedor: uid,
        })) || [],
    )

    if (personajesEnVenta.length === 0) return m.reply(' No hay personajes en venta actualmente.')

    const page = parseInt(args[0]) || 1
    const perPage = 10
    const totalPages = Math.ceil(personajesEnVenta.length / perPage)

    if (page < 1 || page > totalPages)
      return m.reply(` La página *${page}* no existe. Hay *${totalPages}* páginas.`)

    const start = (page - 1) * perPage
    const end = start + perPage
    const lista = personajesEnVenta.slice(start, end)

    let mensaje = `✰ ໌　۟　𝖧𝖺𝗋𝖾𝗆𝖲𝗁𝗈𝗉　ׅ　팅화　ׄ\n✐ Personajes en venta:\n\n`

    lista.forEach((p) => {
      const vendedorNombre = db.users?.[p.vendedor]?.name || p.vendedor.split('@')[0]
      const valorEstimado = obtenerCharacterValue(p.name)
      const tiempo = obtenerTiempoRestante(new Date(p.expira).getTime())
      mensaje += `> 𖣣ֶㅤ֯⌗ ꕥ  ׄ ⬭ *${p.name}* (✭ ${valorEstimado})\n> 𖣣ֶㅤ֯⌗ ⛁  ׄ ⬭ Precio › *${p.precio.toLocaleString()} ${monedas}*\n> 𖣣ֶㅤ֯⌗ ❖  ׄ ⬭ Vendedor › *${vendedorNombre}*\n> 𖣣ֶㅤ֯⌗ ❀  ׄ ⬭ Expira › *${tiempo}*\n\n`
    })

    mensaje += `> ⌦ Página *${page}* de *${totalPages}*`

    try {
      await client.sendMessage(chatId, { text: mensaje }, { quoted: m })
    } catch {
      await m.reply(msgglobal)
    }
  },
};
