let handler = async (m, { conn, args, command, isOwner }) => {
  if (!m.isGroup) return m.reply('❌ Este comando solo se puede usar en grupos.');

  const setting = args[0]?.toLowerCase();
  const chatData = globalThis.db.data.chats[m.chat] ||= {};
  const botSettings = globalThis.db.data.settings?.[conn.user.jid] ||= {};

  const statusIcon = (conf) => conf ? '🟢' : '🔴';

  const configList = `
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼⚙️ 𝐂𝐎𝐍𝐅𝐈𝐆𝐔𝐑𝐀𝐂𝐈𝐎́𝐍 ⚙️╮
┃֪࣪
├ׁ̟̇❍✎ welcome ${statusIcon(chatData.welcome)}
├ׁ̟̇❍✎ antilink ${statusIcon(chatData.antiLink)}
├ׁ̟̇❍✎ economia ${statusIcon(chatData.economy)}
├ׁ̟̇❍✎ gacha ${statusIcon(chatData.gacha)}
├ׁ̟̇❍✎ level ${statusIcon(chatData.level)}
├ׁ̟̇❍✎ modoadmin ${statusIcon(chatData.adminonly)}
├ׁ̟̇❍✎ reaccion ${statusIcon(chatData.reaction)}
├ׁ̟̇❍✎ nsfw ${statusIcon(chatData.nsfw)}
├ׁ̟̇❍✎ alertas ${statusIcon(chatData.alerts)}
├ׁ̟̇❍✎ notprefix ${statusIcon(chatData.notprefix)}
├ׁ̟̇❍✎ serbot ${statusIcon(botSettings?.jadibotmd)}
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯

✎ Ejemplo:
${command} welcome
`.trim();

  if (!setting) {
    return m.reply(configList);
  }

  const status = command === 'on';

  const reply = async (name, customMsg = null, image = null) => {
    const textMsg = customMsg || `
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼⚙️ 𝐅𝐔𝐍𝐂𝐈𝐎́𝐍 ⚙️╮
┃֪࣪
├ׁ̟̇❍✎ ${name}
├ׁ̟̇❍✎ ${status ? '🟢 ACTIVADA' : '🔴 DESACTIVADA'}
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯
`.trim();

    if (image) {
      await conn.sendMessage(m.chat, {
        image: { url: image },
        caption: textMsg,
        contextInfo: { isForwarded: true }
      }, { quoted: m });
    } else {
      await m.reply(textMsg);
    }
  };

  switch (setting) {
    case 'antilink':
    case 'antilinks':
    case 'antienlaces':
      chatData.antiLink = status;
      await reply('Anti Enlaces');
      break;

    case 'rpg':
    case 'economia':
      chatData.rpg = status;
      chatData.economy = status;
      await reply('Economía');
      break;

    case 'gacha':
      chatData.gacha = status;
      await reply('Gacha');
      break;

    case 'level':
    case 'niveles':
    case 'nivel':
      chatData.level = status;
      const levelImage = 'https://files.evogb.win/ChAkmb.jpg';
      const levelCaption = `
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼🔔 𝐀𝐋𝐄𝐑𝐓𝐀𝐒 𝐃𝐄 𝐍𝐈𝐕𝐄𝐋𝐄𝐒 🔔╮
┃֪࣪
├ׁ̟̇❍✎ Alertas de niveles
├ׁ̟̇❍✎ ${status ? '🟢 ACTIVADAS' : '🔴 DESACTIVADAS'}
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯
`.trim();
      await reply('Niveles', levelCaption, levelImage);
      break;

    case 'modoadmin':
    case 'adminonly':
    case 'onlyadmin':
      chatData.adminonly = status;
      await reply('Modo Admin');
      break;

    case 'nsfw':
      chatData.nsfw = status;
      await reply('NSFW');
      break;

    case 'bienvenida':
    case 'welcome':
      chatData.welcome = status;
      await reply('Bienvenida');
      break;

    case 'reaccion':
    case 'reaction':
      chatData.reaction = status;
      await reply('Reacciones');
      break;

    case 'alerts':
    case 'alertas':
      chatData.alerts = status;
      await reply('Alertas');
      break;

    case 'notprefix':
    case 'noprefix':
    case 'sinprefijo':
      chatData.notprefix = status;
      await reply('Sin Prefijo (NotPrefix)');
      break;

    case 'serbot':
    case 'jadibot':
    case 'subbots':
      if (!isOwner) {
        return m.reply(`
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼⛔ 𝐀𝐂𝐂𝐄𝐒𝐎 𝐃𝐄𝐍𝐄𝐆𝐀𝐃𝐎 ⛔╮
┃֪࣪
├ׁ̟̇❍✎ Solo el creador puede modificar
├ׁ̟̇❍✎ esta función del sistema
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯
`.trim());
      }

      if (botSettings) {
        botSettings.jadibotmd = status;
        await reply('Subbots (JadiBot)');
      }
      break;

    default:
      await m.reply(`
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

handler.help = [
  'on welcome','off welcome',
  'on antilink','off antilink',
  'on economia','off economia',
  'on gacha','off gacha',
  'on level','off level',
  'on modoadmin','off modoadmin',
  'on reaccion','off reaccion',
  'on nsfw','off nsfw',
  'on alertas','off alertas',
  'on notprefix','off notprefix',
  'on serbot','off serbot'
];
handler.tags = ['nable'];
handler.command = ['on', 'off'];
handler.admin = true;
handler.botAdmin = false;

export default handler;