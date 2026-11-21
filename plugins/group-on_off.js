let handler = async (m, { conn, args, command, isOwner }) => {
  const setting = args[0]?.toLowerCase();

  const chatData = global.db.data.chats[m.chat];
  const botSettings = global.db.data.settings[conn.user.jid];

  const statusIcon = (conf) => conf ? '🟢' : '🔴';

  const configList = `
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼⚙️ الإعدادات ⚙️╮
┃֪࣪
├ׁ̟̇❍✎ welcome ${statusIcon(chatData.welcome)}
├ׁ̟̇❍✎ antilink ${statusIcon(chatData.antiLink)}
├ׁ̟̇❍✎ antichannel ${statusIcon(chatData.antichannel)}
├ׁ̟̇❍✎ antiprivado ${statusIcon(chatData.antiprivado ?? true)}
├ׁ̟̇❍✎ economia ${statusIcon(chatData.economy)}
├ׁ̟̇❍✎ gacha ${statusIcon(chatData.gacha)}
├ׁ̟̇❍✎ level ${statusIcon(chatData.level ?? true)}
├ׁ̟̇❍✎ modoadmin ${statusIcon(chatData.adminonly)}
├ׁ̟̇❍✎ reaccion ${statusIcon(chatData.reaction)}
├ׁ̟̇❍✎ nsfw ${statusIcon(chatData.nsfw)}
├ׁ̟̇❍✎ alertas ${statusIcon(chatData.alerts)}
├ׁ̟̇❍✎ notprefix ${statusIcon(chatData.notprefix)}
├ׁ̟̇❍✎ serbot ${statusIcon(botSettings?.jadibotmd)}
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯

✎ مثال:
${command} welcome
`.trim();

  if (!setting) {
    return m.reply(configList);
  }

  const status = command.toLowerCase() === 'on';

  const reply = (name) =>
    m.reply(`
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼⚙️ الحالة ⚙️╮
┃֪࣪
├ׁ̟̇❍✎ ${name}
├ׁ̟̇❍✎ ${status ? '🟢 مفعّلة' : '🔴 مقفولة'}
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯
`.trim());

  switch (setting) {

    case 'antilink':
    case 'antilinks':
    case 'antienlaces':
      chatData.antiLink = status;
      reply('Anti Enlaces');
      break;

    case 'antichannel':
    case 'anticanales':
    case 'anticanal':
      chatData.antichannel = status;
      reply('Anti Canales');
      break;

    case 'antiprivado':
    case 'antiprivados':
    case 'private':
    case 'privado':
      chatData.antiprivado = status;
      reply('Anti Privado');
      break;

    case 'rpg':
    case 'economia':
      chatData.rpg = status;
      chatData.economy = status;
      reply('الاقتصاد');
      break;

    case 'gacha':
      chatData.gacha = status;
      reply('Gacha');
      break;

    case 'level':
    case 'niveles':
    case 'nivel':
      chatData.level = status;
      reply('Niveles');
      break;

    case 'modoadmin':
    case 'adminonly':
    case 'onlyadmin':
      chatData.adminonly = status;
      reply('وضع المشرفين');
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

    case 'notprefix':
    case 'noprefix':
    case 'sinprefijo':
      chatData.notprefix = status;
      reply('Sin Prefijo (NotPrefix)');
      break;

    case 'serbot':
    case 'jadibot':
    case 'subbots':
      if (!isOwner) {
        return m.reply(`
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼⛔ ممنوع ⛔╮
┃֪࣪
├ׁ̟̇❍✎ المطور بس اللي يقدر يعدّل
├ׁ̟̇❍✎ الخاصية دي في النظام
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
╭╼⚙️ اختيار غير صحيح ⚙️╮
┃֪࣪
├ׁ̟̇❍✎ استخدم اختيار صحيح
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
