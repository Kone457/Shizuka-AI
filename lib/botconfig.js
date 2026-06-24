export function getBotConfig(conn, key) {
  const config = global.db?.data?.settings?.[conn?.user?.jid]?.config
  const val = config?.[key]
  return (val !== undefined && val !== '') ? val : global[key]
}

export function setBotConfig(conn, key, value) {
  const jid = conn?.user?.jid
  if (!jid) return
  if (!global.db?.data?.settings) return
  if (!global.db.data.settings[jid]) {
    global.db.data.settings[jid] = { self: false, botcommando: 0, config: {} }
  }
  const settings = global.db.data.settings[jid]
  if (!settings.config) settings.config = {}
  settings.config[key] = value
  global.db.write().catch(console.error)
}
