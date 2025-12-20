let handler = async (m, { conn, args, command, isOwner }) => {
  const setting = args[0]?.toLowerCase();
  const chatData = global.db.data.chats[m.chat];
  const botSettings = global.db.data.settings[conn.user.jid];

  if (!setting) {
    return m.reply(
      `> Debes especificar la *función* que deseas activar o desactivar.`
    );
  }

  const status = command === 'on';
  const reply = (name) =>
    m.reply(`> La función *${name}* ha sido *${status ? 'activada' : 'desactivada'}* ${['serbot', 'jadibot', 'subbots'].includes(setting) ? 'en el sistema' : 'en este grupo'}.`);

  switch (setting) {
    case 'antilinks':
    case 'antienlaces':
      chatData.antilink = status;
      reply('Anti Enlaces');
      break;

     case 'antilink':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn)
          throw false
        }
      }
      chat.antiLink = isEnable
      break

    case 'rpg':
    case 'economia':
      chatData.rpg = status;
      reply('Economía');
      break;

    case 'gacha':
      chatData.gacha = status;
      reply('Gacha');
      break;

    case 'adminonly':
    case 'onlyadmin':
      chatData.adminonly = status;
      reply('Solo Admins');
      break;

    case 'nsfw':
      chatData.nsfw = status;
      reply('NSFW');
      break;

    case 'welcome':
      chatData.welcome = status;
      reply('Bienvenida');
      break;

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
      if (!isOwner) return m.reply("> Esta función solo puede ser modificada por el *Creador*.");
      if (botSettings) {
        botSettings.jadibotmd = status;
        reply('Subbots (JadiBot)');
      }
      break;

    default:
      m.reply(
        `> Opción no *válida*\n\n> 📌 *Opciones disponibles:*\n> - welcome\n> - antienlaces\n> - economia\n> - gacha\n> - nsfw\n> - soloadmin\n> - alertas\n> - serbot\n\n> *Ejemplo:* ${command} serbot`
      );
      break;
  }
};

handler.help = ['on', 'off'];
handler.tags = ['grupo'];
handler.command = ['on', 'off'];
handler.admin = true;
handler.botAdmin = false;

export default handler;
