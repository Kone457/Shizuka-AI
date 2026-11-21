const testRegex = (re, s) => {
  re.lastIndex = 0
  return re.test(s)
}

export const acceptsCommand = (command, candidate) => {
  if (command instanceof RegExp) return command.source !== '(?:)' && testRegex(command, candidate)
  if (Array.isArray(command)) return command.some(c => c instanceof RegExp ? testRegex(c, candidate) : c === candidate)
  return typeof command === 'string' ? command === candidate : false
}

// يرجّع أطول اسم أمر مطابق في أول الرسالة، عشان الأوامر اللي فيها مسافة تشتغل
export const resolveCommand = (plugins, text, maxWords = 3) => {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean)
  if (!words.length) return null
  const names = Object.keys(plugins || {})
  for (let n = Math.min(maxWords, words.length); n >= 1; n--) {
    const candidate = words.slice(0, n).join(' ').toLowerCase()
    for (const name of names) {
      const plugin = plugins[name]
      if (!plugin || plugin.disabled || plugin.customPrefix || !plugin.command) continue
      if (acceptsCommand(plugin.command, candidate)) return { command: candidate, consumed: n, plugin: name }
    }
  }
  return null
}
