let handler = async (m, { conn, args, command, isOwner }) => {
  const words = (args || []).map(a => String(a).toLowerCase());
  const setting = words.length > 1 && ['بدون بادئة'].includes(words.slice(0, 2).join(' '))
    ? words.slice(0, 2).join(' ')
    : words[0];

  const chatData = global.db.data.chats[m.chat];
  const botSettings = global.db.data.settings[conn.user.jid];

  const statusIcon = (conf) => conf ? '🟢' : '🔴';

  const configList = `
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼⚙️ الإعدادات ⚙️╮
┃֪࣪
├ׁ̟̇❍✎ ترحيب ${statusIcon(chatData.welcome)}
├ׁ̟̇❍✎ اللينكات ${statusIcon(chatData.antiLink)}
├ׁ̟̇❍✎ القنوات ${statusIcon(chatData.antichannel)}
├ׁ̟̇❍✎ الخاص ${statusIcon(chatData.antiprivado ?? true)}
├ׁ̟̇❍✎ الاقتصاد ${statusIcon(chatData.economy)}
├ׁ̟̇❍✎ المستويات ${statusIcon(chatData.level ?? true)}
├ׁ̟̇❍✎ المشرفين ${statusIcon(chatData.adminonly)}
├ׁ̟̇❍✎ التفاعل ${statusIcon(chatData.reaction)}
├ׁ̟̇❍✎ التنبيهات ${statusIcon(chatData.alerts)}
├ׁ̟̇❍✎ بدونبادئة ${statusIcon(chatData.notprefix)}
├ׁ̟̇❍✎ الفرعية ${statusIcon(botSettings?.jadibotmd)}
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯

✎ مثال:
${command} ترحيب
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

    case 'اللينكات':
    case 'antilink':
    case 'antilinks':
    case 'antienlaces':
      chatData.antiLink = status;
      reply('Anti Enlaces');
      break;

    case 'القنوات':
    case 'antichannel':
    case 'anticanales':
    case 'anticanal':
      chatData.antichannel = status;
      reply('Anti Canales');
      break;

    case 'الخاص':
    case 'antiprivado':
    case 'antiprivados':
    case 'private':
    case 'privado':
      chatData.antiprivado = status;
      reply('Anti Privado');
      break;

    case 'الاقتصاد':
    case 'rpg':
    case 'economia':
      chatData.rpg = status;
      chatData.economy = status;
      reply('الاقتصاد');
      break;

    case 'المستويات':
    case 'level':
    case 'niveles':
    case 'nivel':
      chatData.level = status;
      reply('Niveles');
      break;

    case 'المشرفين':
    case 'modoadmin':
    case 'adminonly':
    case 'onlyadmin':
      chatData.adminonly = status;
      reply('وضع المشرفين');
      break;

    case 'ترحيب':
    case 'bienvenida':
    case 'welcome':
      chatData.welcome = status;
      reply('Bienvenida');
      break;

    case 'التفاعل':
    case 'reaccion':
    case 'reaction':
      chatData.reaction = status;
      reply('Reacciones');
      break;

    case 'التنبيهات':
    case 'alerts':
    case 'alertas':
      chatData.alerts = status;
      reply('Alertas');
      break;

    case 'بدون بادئة':
    case 'بدونبادئة':
    case 'notprefix':
    case 'noprefix':
    case 'sinprefijo':
      chatData.notprefix = status;
      reply('بدون بادئة (NotPrefix)');
      break;

    case 'الفرعية':
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

handler.help = ['تشغيل', 'ايقاف'];
handler.tags = ['grupo'];
handler.command = ['on', 'off', 'تشغيل', 'ايقاف', 'تفعيل'];
handler.admin = true;
handler.botAdmin = false;

export default handler;
