let handler = async (m, { conn, args, command, isOwner }) => {
  const setting = args[0]?.toLowerCase();
  const chatData = global.db.data.chats[m.chat];
  const botSettings = global.db.data.settings[conn.user.jid];

  const statusIcon = (conf) => conf ? '🟢' : '🔴';

  const configList = `
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼⚙️ 𝐂𝐎𝐍𝐅𝐈𝐆𝐔𝐑𝐀𝐂𝐈𝐎𝐍 ⚙️╮
┃֪࣪
├ׁ̟̇❍✎ welcome ${statusIcon(chatData.welcome)}
├ׁ̟̇❍✎ antilink ${statusIcon(chatData.antiLink)}
├ׁ̟̇❍✎ economia ${statusIcon(chatData.economy)}
├ׁ̟̇❍✎ gacha ${statusIcon(chatData.gacha)}
├ׁ̟̇❍✎ modoadmin ${statusIcon(chatData.adminonly)}
├ׁ̟̇❍✎ reaccion ${statusIcon(chatData.reaction)}
├ׁ̟̇❍✎ nsfw ${statusIcon(chatData.nsfw)}
├ׁ̟̇❍✎ alertas ${statusIcon(chatData.alerts)}
├ׁ̟̇❍✎ serbot ${statusIcon(botSettings?.jadibotmd)}
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯

✎ Ejemplo:
${command} welcome
`.trim();

  if (!setting) {
    return m.reply(configList);
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
      reply('Modo Admin');
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
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯
`.trim());
      }

      if (botSettings) {
        botSettings.jadibotmd = status;
        reply('Subbots (JadiBot)');
      }
      break;

    default:
      m.reply(`
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼⚙️ 𝐎𝐏𝐂𝐈𝐎́𝐍 𝐍𝐎 𝐕𝐀́𝐋𝐈𝐃𝐀 ⚙️╮
┃֪࣪
├ׁ̟̇❍✎ Usa una opción válida
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯

${configList}
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