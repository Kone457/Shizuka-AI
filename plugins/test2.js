import { download, detail, search } from "../lib/anime.js";

// Helper para reaccionar con emojis
async function react(conn, m, emoji) {
    await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } });
}

async function lang(episodes) {
    const list = [];
    for (const ep of episodes) {
        try {
            const dl = await download(ep.link);
            const langs = [];
            if (dl?.dl?.sub) langs.push('sub');
            if (dl?.dl?.dub) langs.push('dub');
            list.push({ ...ep, lang: langs });
        } catch {
            list.push({ ...ep, lang: [] });
        }
    }
    return list;
}

let handler = async (m, { command, usedPrefix, conn, text, args }) => {
    if (!text) return m.reply(`❦ \`Ingresa el título de algún anime o la URL. Ejemplo:\`\n\n • ${usedPrefix + command} Mushoku Tensei\n • ${usedPrefix + command} https://animeav1.com/media/mushoku-tensei`);

    try {
        if (text.includes('https://animeav1.com/media/')) {
            await react(conn, m, "⌛");
            let info = await detail(args[0]);
            let { title, altTitle, description, cover, votes, rating, total, genres } = info;
            let episodes = await lang(info.episodes);

            const gen = genres.join(', ');
            let cap = `
乂 \`\`\`ANIME - DOWNLOAD\`\`\`

≡ ❦ \`Título :\` ${title} - ${altTitle}
≡ ❦ \`Descripción :\` ${description}
≡ ❦ \`Votos :\` ${votes}
≡ ❦ \`Rating :\` ${rating}
≡ ❦ \`Géneros :\` ${gen}
≡ ❦ \`Episodios totales :\` ${total}
`.trim();

            // Generar botones dinámicos para cada episodio/idioma
            let buttons = episodes.map(e => {
                let langs = [];
                if (e.lang.includes('sub')) langs.push({ buttonId: `ep_${e.ep}_sub`, buttonText: { displayText: `Episodio ${e.ep} SUB` }, type: 1 });
                if (e.lang.includes('dub')) langs.push({ buttonId: `ep_${e.ep}_dub`, buttonText: { displayText: `Episodio ${e.ep} DUB` }, type: 1 });
                return langs;
            }).flat();

            let buffer = await (await fetch(cover)).arrayBuffer();
            let sent = await conn.sendMessage(m.chat, {
                image: Buffer.from(buffer),
                caption: cap,
                footer: "Selecciona el episodio y el idioma",
                buttons,
                headerType: 4
            }, { quoted: m });

            conn.anime = conn.anime || {};
            conn.anime[m.sender] = {
                title,
                episodes,
                key: sent.key,
                downloading: false,
                timeout: setTimeout(() => delete conn.anime[m.sender], 600_000)
            };
        } else {
            await react(conn, m, "🔍");
            const results = await search(text);
            if (results.length === 0) {
                return conn.reply(m.chat, 'No se encontraron resultados.', m);
            }

            let cap = `◜ Anime - Search ◞\n`;
            results.slice(0, 15).forEach((res, index) => {
                cap += `\n\`${index + 1}\`\n≡ ❦ \`Title :\` ${res.title}\n≡ ❦ \`Link :\` ${res.link}\n`;
            });

            await conn.sendMessage(m.chat, { text: cap }, { quoted: m });
            await react(conn, m, "❦");
        }
    } catch (error) {
        console.error('Error en handler anime:', error);
        conn.reply(m.chat, 'Error al procesar la solicitud: ' + error.message, m);
    }
};

handler.before = async (m, { conn }) => {
    conn.anime = conn.anime || {};
    const session = conn.anime[m.sender];
    if (!session) return;

    // Detectar respuesta de botón
    const btnId = m.message?.buttonsResponseMessage?.selectedButtonId;
    if (!btnId) return;

    // btnId tendrá formato "ep_3_sub" o "ep_5_dub"
    let [_, epStr, lang] = btnId.split("_");
    const epi = parseInt(epStr);

    if (session.downloading) return m.reply('⏳ Ya estás descargando un episodio. Espera a que termine.');

    const episode = session.episodes.find(e => parseInt(e.ep) === epi);
    if (!episode) return m.reply(`Episodio ${epi} no encontrado.`);

    const inf = await download(episode.link);
    if (!inf.dl[lang]) return m.reply(`Ese idioma no está disponible para el episodio ${epi}.`);

    const idiomaLabel = lang === 'sub' ? 'sub español' : 'español latino';
    await m.reply(`Descargando ${session.title} - cap ${epi} ${idiomaLabel}`);
    await react(conn, m, "📥");

    session.downloading = true;

    try {
        const videoBuffer = await (await fetch(inf.dl[lang])).buffer();
        await conn.sendFile(m.chat, videoBuffer, `${session.title} - cap ${epi} ${idiomaLabel}.mp4`, '', m, false, {
            mimetype: 'video/mp4',
            asDocument: true
        });
        await react(conn, m, "✅");
    } catch (err) {
        console.error('Error al descargar:', err);
        m.reply(`Error al descargar el episodio: ${err.message}`);
    }

    clearTimeout(session.timeout);
    delete conn.anime[m.sender];
};

handler.command = ["anime2"];
handler.tags = ['download'];
handler.help = ["anime2"];

export default handler;