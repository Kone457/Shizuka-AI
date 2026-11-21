import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return conn.reply(m.chat, `╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼☁️ الإبلاغ عن مشكلة ☁️╮
┃֪࣪
├ׁ̟̇❍✎ ✖️ طريقة الاستخدام
├ׁ̟̇❍✎ ${usedPrefix + command} <الرسالة>
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯`, m)
    }

    if (text.length < 10) return conn.reply(m.chat, "⚠️ البلاغ لازم يكون 10 حروف على الأقل.", m)
    if (text.length > 1000) return conn.reply(m.chat, "⚠️ البلاغ مايزيدش عن 1000 حرف.", m)

    const payload = {
        numero: `wa.me/${m.sender.split('@')[0]}`,
        usuario: m.pushName || 'مجهول',
        mensaje: text,
        cita: m.quoted ? m.quoted.text : null
    }

    try {
        const res = await fetch(`${api.url}/reportar?apikey=${api.key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        const json = await res.json()
        m.reply(`╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼☁️ تم إرسال البلاغ ☁️╮
┃֪࣪
├ׁ̟̇❍✎ 📨 رسالتك اتبعتت
├ׁ̟̇❍✎ لسيرفر البلاغات
┃֪࣪
├ׁ̟̇❍✎ ✅ الحالة: ${json.status || 'OK'}
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯`)
    } catch (e) {
        m.reply("❌ خطأ في إرسال البلاغ للسيرفر.")
    }
}

handler.help = ['reportar']
handler.tags = ['info']
handler.command = ['reporte', 'report', 'reportar']

export default handler