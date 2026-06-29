import fetch from 'node-fetch';

let handler = async (m, { conn, text }) => {
  if (!text) {
    return conn.sendMessage(
      m.chat,
      { text: '《✧》 Ingresa el nombre de un paquete.\n\nEjemplo:\n.npm axios' },
      { quoted: m }
    );
  }

  try {
    await conn.sendMessage(m.chat, {
      react: { text: '⏳', key: m.key }
    });

    const res = await fetch(`https://registry.npmjs.org/${encodeURIComponent(text.trim())}`);

    if (!res.ok) throw new Error('Paquete no encontrado.');

    const data = await res.json();

    const version = data['dist-tags'].latest;
    const tarball = data.versions[version].dist.tarball;

    const file = await fetch(tarball);
    if (!file.ok) throw new Error('No se pudo descargar el paquete.');

    const buffer = await file.buffer();

    await conn.sendMessage(
      m.chat,
      {
        document: buffer,
        fileName: `${data.name}-${version}.tgz`,
        mimetype: 'application/gzip',
        caption: `*✿ Aquí tienes ${data.name} v${version}*`
      },
      { quoted: m }
    );

    await conn.sendMessage(m.chat, {
      react: { text: '✅', key: m.key }
    });

  } catch (err) {
    console.error(err);

    await conn.sendMessage(
      m.chat,
      {
        text: `❏ Error al procesar la solicitud.\n❏ Detalles: ${err.message}`
      },
      { quoted: m }
    );

    await conn.sendMessage(m.chat, {
      react: { text: '❌', key: m.key }
    });
  }
};

handler.help = ['npm'];
handler.tags = ['descargas'];
handler.command = ['npm'];
handler.group = true;

export default handler;