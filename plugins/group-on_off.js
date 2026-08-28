let handler = async (m, { conn, args, command, isOwner }) => {
  if (!m.isGroup)
    return m.reply('❌ Este comando solo se puede usar en grupos.');

  const setting = args[0]?.toLowerCase();

  const chatData = globalThis.db.data.chats[m.chat] ||= {};
  const botSettings =
    globalThis.db.data.settings?.[conn.user.jid] ||= {};

  if (!('welcome' in chatData)) chatData.welcome = true;
  if (!('antiLink' in chatData)) chatData.antiLink = true;
  if (!('antilinks' in chatData)) chatData.antilinks = true;
  if (!('antiprivado' in chatData)) chatData.antiprivado = true;
  if (!('economy' in chatData)) chatData.economy = true;
  if (!('gacha' in chatData)) chatData.gacha = true;
  if (!('level' in chatData)) chatData.level = true;
  if (!('adminonly' in chatData)) chatData.adminonly = false;
  if (!('reaction' in chatData)) chatData.reaction = true;
  if (!('nsfw' in chatData)) chatData.nsfw = false;
  if (!('alerts' in chatData)) chatData.alerts = true;
  if (!('notprefix' in chatData)) chatData.notprefix = false;

  const statusIcon = conf => conf ? '🟢' : '🔴';

  const configList = `
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼⚙️ 𝐂𝐎𝐍𝐅𝐈𝐆𝐔𝐑𝐀𝐂𝐈Ó𝐍 ⚙️╮
┃֪࣪
├ׁ̟̇❍✎ welcome ${statusIcon(chatData.welcome)}
├ׁ̟̇❍✎ antilink ${statusIcon(chatData.antiLink)}
├ׁ̟̇❍✎ antiprivado ${statusIcon(chatData.antiprivado)}
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
${command} level
`.trim();

  if (!setting) {
    return m.reply(configList);
  }

  const status = command.toLowerCase() === 'on';

  const reply = async (name, customMsg = null, image = null) => {
    const textMsg = customMsg || `
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼⚙️ 𝐅𝐔𝐍𝐂𝐈Ó𝐍 ⚙️╮
┃֪࣪
├ׁ̟̇❍✎ ${name}
├ׁׁ̟̇❍✎ ${status ? '🟢 ACTIVADA' : '🔴 DESACTIVADA'}
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯
`.trim();

    if (image) {
      await conn.sendMessage(
        m.chat,
        {
          image: { url: image },
          caption: textMsg,
          contextInfo: {
            isForwarded: true
          }
        },
        { quoted: m }
      );
    } else {
      await m.reply(textMsg);
    }
  };

  switch (setting) {

    case 'antilink':
    case 'antilinks':
    case 'antienlaces':
      chatData.antiLink = status;
      chatData.antilinks = status;
      await reply('Anti Enlaces');
      break;

    case 'antiprivado':
    case 'antiprivados':
    case 'private':
    case 'privado':
      chatData.antiprivado = status;
      await reply('Anti Privado');
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
      await reply('Niveles');
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

      botSettings.jadibotmd = status;

      await reply('Subbots (JadiBot)');
      break;

    default:
      return m.reply(`
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼⚙️ 𝐎𝐏𝐂𝐈Ó𝐍 𝐍𝐎 𝐕Á𝐋𝐈𝐃𝐀 ⚙️╮
┃֪࣪
├ׁ̟̇❍✎ Usa una opción válida
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯

${configList}
`.trim());
  }
};

handler.help = ['on', 'off'];
handler.tags = ['grupo'];
handler.command = ['on', 'off'];
handler.admin = true;
handler.botAdmin = false;

export default handler;