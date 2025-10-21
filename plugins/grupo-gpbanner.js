/* import sharp from 'sharp';

let handler = async (m, { conn }) => {
  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || q.mediaType || '';

  if (/image/.test(mime)) {
    const img = await q.download();
    if (!img) return m.reply('⚠️ Te faltó subir una imagen.');

    try {
      // Crea una imagen redimensionada manualmente
      const processedImage = await sharp(img)
        .resize(720, 720)
        .jpeg({ quality: 80 })
        .toBuffer();

      await conn.updateProfilePicture(m.chat, processedImage);
      m.reply('✅ Imagen del grupo actualizada.');
    } catch (e) {
      m.reply(`⚠️ Error al actualizar el perfil: ${e.message}`);
    }
  } else {
    m.reply('⚠️ Te faltó la imagen para cambiar el perfil del grupo.');
  }
};

handler.command = ['gpbanner', 'groupimg'];
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler; */