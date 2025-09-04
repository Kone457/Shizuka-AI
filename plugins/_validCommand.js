export async function before(m) {
  if (!m.text || !global.prefix.test(m.text)) return;

  const usedPrefix = global.prefix.exec(m.text)[0];
  const command = m.text.slice(usedPrefix.length).trim().split(' ')[0].toLowerCase();

  const validCommand = (command, plugins) => {
    for (let plugin of Object.values(plugins)) {
      if (plugin.command && (Array.isArray(plugin.command) ? plugin.command : [plugin.command]).includes(command)) {
        return true;
      }
    }
    return false;
  };

  if (!command) return;
  if (command === "bot") return;

  if (validCommand(command, global.plugins)) {
    let chat = global.db.data.chats[m.chat];
    let user = global.db.data.users[m.sender];

    if (chat.isBanned) {
      const avisoDesactivado = `
╭──────────🌸──────────╮
│  💖 ¡Hola, mi querido usuario! 💖
│
│  El bot *${botname}* está tomando una siestita 💤
│  en este grupo tan lindo.
│
│  Si eres admin, puedes despertarlo con:
│  🌷 *${usedPrefix}bot on*
│
│  Gracias por tu comprensión, eres un amor ✨
╰──────────🌸─────────╯`;
      await m.reply(avisoDesactivado);
      return;
    }

    if (!user.commands) user.commands = 0;
    user.commands += 1;

  } else {
    const comando = m.text.trim().split(' ')[0];
    await m.reply(`
╭━━━━━━⊱🌼⊰━━━━━━╮
┃  Ooops... ese comando *${comando}* no existe 😢
┃
┃  Pero no te preocupes, mi cielo 🌈
┃  Puedes ver todos los comandos mágicos con:
┃  💫 *#help*
┃
┃  Siempre estoy aquí para ti, con todo mi cariño 💕
╰━━━━━━⊱🌼⊰━━━━━━╯`);
  }
}