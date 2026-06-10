
export function getBotConfig(conn, key) {
  const config = global.db?.data?.settings?.[conn?.user?.jid]?.config
  const val = config?.[key]
  return (val !== undefined && val !== '') ? val : global[key]
}

export function setBotConfig(conn, key, value) {
  const jid = conn?.user?.jid
  if (!jid) return
  const settings = global.db.data.settings[jid]
  if (!settings.config) settings.config = {}
  settings.config[key] = value
  global.db.write().catch(console.error)
}
