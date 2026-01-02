var handler = async (m, { conn, participants, usedPrefix, command }) => {
  let texto = await m.mentionedJid;
  let user = texto.length > 0 ? texto[0] : (m.quoted ? await m.quoted.sender : false);

  if (!user) {
    return conn.reply(m.chat, 
      `⚠️ *Debes mencionar al esclavo que quieras castigar.*\n> Usa: ${usedPrefix + command} @usuario`, 
      m
    );
  }

  const groupInfo = await conn.groupMetadata(m.chat);
  const ownerGroup = groupInfo.owner || m.chat.split`-`[0] + '@s.whatsapp.net';
  const ownerBot = globalThis.owner?.[0]?.[0] ? globalThis.owner[0][0] + '@s.whatsapp.net' : '';

  if (user === m.sender) {
    return conn.reply(m.chat, 
      `🙅‍♂️ *No puedes castigarte a ti mismo, masoquista.*`, 
      m
    );
  }

  if (user === conn.user.jid) {
    return conn.reply(m.chat, 
      `🤖 *¡Yo soy quien castiga! No al revés.*`, 
      m
    );
  }

  if (user === ownerGroup) {
    return conn.reply(m.chat, 
      `👑 *No puedo castigar al dueño del grupo.*`, 
      m
    );
  }

  if (user === ownerBot) {
    return conn.reply(m.chat, 
      `🛡️ *No puedo castigar a mi creador.*`, 
      m
    );
  }

  const participant = groupInfo.participants.find(p => p.jid === user);
  
  if (!participant) {
    return conn.reply(m.chat, 
      `📭 *El esclavo ya huyó del grupo.*`, 
      m
    );
  }

  const userName = globalThis.db?.data?.users?.[user]?.name || 'el esclavo';
  
  // Inicio del castigo con delay progresivo
  await conn.sendMessage(m.chat, {
    text: `🩸 *¡${userName} será castigado!* 🔥\n_El látigo está listo..._`
  }, { quoted: m });
  
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  await conn.sendMessage(m.chat, {
    text: `👹 *¡TE DOY UNOS LATIGAZOS!* 😈\n_¡Crack! ¡Crack!_`
  }, { quoted: m });
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await conn.sendMessage(m.chat, {
    text: `😏 *¿A PUES TE GUSTA?* 🥵\n_¡Se está excitando el muy zorro!_`
  }, { quoted: m });
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await conn.sendMessage(m.chat, {
    text: `😈 *¡PUES TOMA MÁS LATIGAZOS ZORRA!* 🔥\n_¡Crack! ¡Crack! ¡Crack!_`
  }, { quoted: m });
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await conn.sendMessage(m.chat, {
    text: `😏 *¿A PUES QUIERES MÁS?* 🥴\n_Sigamos entonces..._`
  }, { quoted: m });
  
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  await conn.sendMessage(m.chat, {
    text: `🔥 *¡Y SIGA!* 💥\n_¡Más latigazos! ¡Más dolor!_`
  }, { quoted: m });
  
  await new Promise(resolve => setTimeout(resolve, 2500));
  
  await conn.sendMessage(m.chat, {
    text: `💀 *¡GOLPE FINAL!* ⚡\n_¡ADIÓS ESCLAVO!_`
  }, { quoted: m });
  
  // Eliminar al usuario después del castigo
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  try {
    await conn.groupParticipantsUpdate(m.chat, [user], 'remove');
    
    await conn.sendMessage(m.chat, {
      text: `🚪 *${userName} ha sido eliminado del grupo.*\n_El castigo ha terminado. La puerta se cerró._`
    }, { quoted: m });
    
  } catch (error) {
    console.error(error);
    await conn.reply(m.chat, 
      `❌ *Error al eliminar al esclavo.*\n_Pero al menos recibió su castigo._`, 
      m
    );
  }
};

handler.help = ['castigar'];
handler.tags = ['grupo'];
handler.command = ['castigar', 'latigar', 'whip'];
handler.admin = true;
handler.botAdmin = true;

export default handler;