export async function before(m, { groupMetadata }) {
  if (!m.text || !globalThis.prefix.test(m.text)) return;

  const usedPrefix = globalThis.prefix.exec(m.text)[0];
  const command = m.text.slice(usedPrefix.length).trim().split(' ')[0].toLowerCase(); 

  const validCommand = (command, plugins) => {
    for (let plugin of Object.values(plugins)) {
      if (plugin.command && (Array.isArray(plugin.command) ? plugin.command : [plugin.command]).includes(command)) {
        return true;
      }
    }
    return false;
  };

  let chat = globalThis.db.data.chats[m.chat];
  let id = this.user.jid;
  let settings = globalThis.db.data.settings[id];
  let owner = [...globalThis.owner.map(([number]) => number)].map(v => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net").includes(m.sender);

  if (chat.adminonly) return;
  if (settings.self) return;
  if (!command) return;
  if (command === 'mute') return;
  if (chat.bannedGrupo && !owner) return;

  
}