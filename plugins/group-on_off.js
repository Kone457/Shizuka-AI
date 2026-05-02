let handler = async (m, { conn, args, command, isOwner }) => {
  const setting = args[0]?.toLowerCase();
  const chatData = global.db.data.chats[m.chat];
  const botSettings = global.db.data.settings[conn.user.jid];

  if (!setting) {
    const statusIcon = (conf) => conf ? '🟢' : '🔴';
    return m.reply(`
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼⚙️ 𝐂𝐎𝐍𝐅𝐈𝐆𝐔𝐑𝐀𝐂𝐈𝐎𝐍 ⚙️╮
┃֪࣪
├ׁ̟̇❍✎ Opciones disponibles:
├ׁ̟̇❍✎ welcome ${statusIcon(chatData.welcome)}
├ׁ̟̇❍✎ antilink ${statusIcon(chatData.antiLink)}
├ׁ̟̇❍✎ economia ${statusIcon(chatData.economy)}
├ׁ̟̇❍✎ nsfw ${statusIcon(chatData.nsfw)}
├ׁ̟̇❍✎ alertas ${statusIcon(chatData.alerts)}
├ׁ̟̇❍✎ serbot ${statusIcon(botSettings?.jadibotmd)}
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯

✎ Ejemplo:
${command} welcome
`.trim());
  }

  const status = command === 'on';

  const reply = (name) =>
    m.reply(`
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼⚙️ 𝐅𝐔𝐍𝐂𝐈𝐎́𝐍 ⚙️╮
┃֪࣪
├ׁ̟̇❍✎ ${name}
├ׁ̟̇❍✎ ${status ? '🟢 ACTIVADA' : '🔴 DESACTIVADA'}
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯
`.trim());

  switch (setting) {
    case 'antilink':
    case 'antilinks':
    case 'antienlaces':
      chatData.antiLink = status;
      reply('Anti Enlaces');
      break;

    case 'rpg':
    case 'economia':
      chatData.rpg = status;
      chatData.economy = status;
      reply('Economía');
      break;

    case 'gacha':
      chatData.gacha = status;
      reply('Gacha');
      break;

    case 'modoadmin':
    case 'adminonly':
    case 'onlyadmin':
      chatData.adminonly = status;
      reply('Solo Admins');
      break;

    case 'nsfw':
      chatData.nsfw = status;
      reply('NSFW');
      break;

    case 'bienvenida':
    case 'welcome':
      chatData.welcome = status;
      reply('Bienvenida');
      break;

    case 'reaccion':
    case 'reaction':
      chatData.reaction = status;
      reply('Reacciones');
      break;

    case 'alerts':
    case 'alertas':
      chatData.alerts = status;
      reply('Alertas');
      break;

    case 'serbot':
    case 'jadibot':
    case 'subbots':
      if (!isOwner) {
        return m.reply(`
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼⛔ 𝐀𝐂𝐂𝐄𝐒𝐎 𝐃𝐄Ｎ𝐄𝐆𝐀𝐃𝐎 ⛔╮
┃֪࣪
├ׁ̟̇❍✎ Solo el creador puede modificar
├ׁ̟̇❍✎ esta función del sistema
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯`.trim());
      }
      if (botSettings) {
        botSettings.jadibotmd = status;
        reply('Subbots (JadiBot)');
      }
      break;

    default:
      const statusIcon = (conf) => conf ? '🟢' : '🔴';
      m.reply(`
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼⚙️ 𝐎𝐏𝐂𝐈𝐎́𝐍 𝐍𝐎 𝐕𝐀́𝐋𝐈𝐃𝐀 ⚙️╮
┃֪࣪
├ׁ̟̇❍✎ Opciones disponibles:
├ׁ̟̇❍✎ welcome ${statusIcon(chatData.welcome)}
├ׁ̟̇❍✎ antilink ${statusIcon(chatData.antiLink)}
├ׁ̟̇❍✎ economia ${statusIcon(chatData.economy)}
├ׁ̟̇❍✎ nsfw ${statusIcon(chatData.nsfw)}
├ׁ̟̇❍✎ alertas ${statusIcon(chatData.alerts)}
├ׁ̟̇❍✎ serbot ${statusIcon(botSettings?.jadibotmd)}
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯

✎ Ejemplo:
${command} welcome
`.trim());
      break;
  }
};

handler.help = ['on', 'off'];
handler.tags = ['grupo'];
handler.command = ['on', 'off'];
handler.admin = true;
handler.botAdmin = false;

export default handler;
