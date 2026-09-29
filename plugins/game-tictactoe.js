import crypto from 'crypto'

const games = new Map()

function getGame(jid) {
    if (!games.has(jid)) games.set(jid, { players: [], board: Array(9).fill(''), turn: 0, active: false })
    return games.get(jid)
}

function render(b) {
    const c = i => b[i] === '' ? '⬜' : (b[i] === 'X' ? '❌' : '⭕')
    return `${c(0)}${c(1)}${c(2)}\n${c(3)}${c(4)}${c(5)}\n${c(6)}${c(7)}${c(8)}`
}

function checkWin(b) {
    const L = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]
    for (const l of L) if (b[l[0]] && b[l[0]] === b[l[1]] && b[l[1]] === b[l[2]]) return l
    return null
}

function normalize(jid) {
    return String(jid || '').split('@')[0].split(':')[0]
}

const TICTACTOE_HTML = `<div style="width:100%;height:100vh;background:radial-gradient(ellipse at center,#1a1a2e 0%,#0a0a14 60%,#000 100%);display:flex;flex-direction:column;justify-content:center;align-items:center;font-family:'Segoe UI',sans-serif;user-select:none;overflow:hidden;margin:0;">
<canvas id="c" width="340" height="460" style="max-width:100%;"></canvas>
<script>
(function(){
const cv=document.getElementById('c'),x=cv.getContext('2d');
const W=340,H=460,GX=20,GY=80,GS=300,CE=100;
let b=Array(9).fill(''),t='X',w=null,pt=[],hv=-1;
function rr(a,c,d,e,f){a.beginPath();a.moveTo(c+f,d);a.lineTo(c+e-f,d);a.quadraticCurveTo(c+e,d,c+e,d+f);a.lineTo(c+e,d+e-f);a.quadraticCurveTo(c+e,d+e,c+e-f,d+e);a.lineTo(c+f,d+e);a.quadraticCurveTo(c,d+e,c,d+e-f);a.lineTo(c,d+f);a.quadraticCurveTo(c,d,c+f,d);a.closePath();}
function bg(){const g=x.createRadialGradient(W/2,H/2,50,W/2,H/2,W*0.9);g.addColorStop(0,'#1a1a2e');g.addColorStop(0.6,'#0a0a14');g.addColorStop(1,'#000');x.fillStyle=g;x.fillRect(0,0,W,H);for(let i=0;i<50;i++){const sx=(i*137.5+Date.now()*0.01)%W,sy=(i*97.3+Date.now()*0.02)%H;x.globalAlpha=0.15+Math.sin(Date.now()*0.002+i)*0.1;x.fillStyle=i%3===0?'#0ff':i%3===1?'#f0f':'#fff';x.beginPath();x.arc(sx,sy,1.2,0,Math.PI*2);x.fill();}x.globalAlpha=1;}
function grid(){bg();x.save();x.shadowBlur=25;x.shadowColor='rgba(0,200,255,0.4)';x.strokeStyle='rgba(0,200,255,0.35)';x.lineWidth=2;rr(x,GX-8,GY-8,GS+16,GS+16,14);x.stroke();x.restore();x.fillStyle='rgba(0,20,40,0.4)';rr(x,GX-8,GY-8,GS+16,GS+16,14);x.fill();x.save();x.strokeStyle='rgba(0,200,255,0.9)';x.shadowBlur=18;x.shadowColor='#0ff';x.lineCap='round';for(let i=0;i<4;i++){x.lineWidth=(i===0||i===3)?3:2.5;x.beginPath();x.moveTo(GX+i*CE,GY);x.lineTo(GX+i*CE,GY+GS);x.stroke();x.beginPath();x.moveTo(GX,GY+i*CE);x.lineTo(GX+GS,GY+i*CE);x.stroke();}x.restore();if(hv>=0&&b[hv]===''&&!w){const r=Math.floor(hv/3),co=hv%3,X=GX+co*CE,Y=GY+r*CE,c=t==='X'?'0,255,255':'255,0,255';const g=x.createRadialGradient(X+CE/2,Y+CE/2,5,X+CE/2,Y+CE/2,CE/2);g.addColorStop(0,'rgba('+c+',0.35)');g.addColorStop(1,'rgba('+c+',0)');x.fillStyle=g;rr(x,X+3,Y+3,CE-6,CE-6,10);x.fill();x.strokeStyle='rgba('+c+',0.7)';x.lineWidth=2;x.setLineDash([6,4]);x.lineDashOffset=-Date.now()*0.01;rr(x,X+3,Y+3,CE-6,CE-6,10);x.stroke();x.setLineDash([]);}}
function dX(cx,cy){x.save();x.translate(cx,cy);x.strokeStyle='#0ff';x.lineWidth=7;x.lineCap='round';x.shadowBlur=25;x.shadowColor='#0ff';const s=CE/2-14;x.beginPath();x.moveTo(-s,-s);x.lineTo(s,s);x.stroke();x.beginPath();x.moveTo(s,-s);x.lineTo(-s,s);x.stroke();x.strokeStyle='rgba(255,255,255,0.7)';x.lineWidth=2;x.beginPath();x.moveTo(-s,-s);x.lineTo(s,s);x.stroke();x.beginPath();x.moveTo(s,-s);x.lineTo(-s,s);x.stroke();x.restore();}
function dO(cx,cy){x.save();x.translate(cx,cy);x.strokeStyle='#f0f';x.lineWidth=7;x.lineCap='round';x.shadowBlur=25;x.shadowColor='#f0f';x.beginPath();x.arc(0,0,CE/2-16,0,Math.PI*2);x.stroke();x.strokeStyle='rgba(255,255,255,0.7)';x.lineWidth=2;x.beginPath();x.arc(0,0,CE/2-16,0,Math.PI*2);x.stroke();x.restore();}
function board(){for(let i=0;i<9;i++){const r=Math.floor(i/3),co=i%3,cx=GX+co*CE+CE/2,cy=GY+r*CE+CE/2;if(b[i]==='X')dX(cx,cy);else if(b[i]==='O')dO(cx,cy);}if(w&&w.line){const l=w.line,r1=Math.floor(l[0]/3),c1=l[0]%3,r2=Math.floor(l[2]/3),c2=l[2]%3,x1=GX+c1*CE+CE/2,y1=GY+r1*CE+CE/2,x2=GX+c2*CE+CE/2,y2=GY+r2*CE+CE/2;x.save();const p=0.7+Math.sin(Date.now()*0.008)*0.3;x.strokeStyle=w.player==='X'?'rgba(0,255,0,'+p+')':'rgba(255,0,0,'+p+')';x.lineWidth=9;x.lineCap='round';x.shadowBlur=35;x.shadowColor=w.player==='X'?'#0f0':'#f00';x.beginPath();x.moveTo(x1,y1);x.lineTo(x2,y2);x.stroke();x.restore();}}
function parts(){for(let i=pt.length-1;i>=0;i--){const p=pt[i];p.x+=p.vx;p.y+=p.vy;p.vy+=0.18;p.life-=0.018;if(p.life<=0){pt.splice(i,1);continue;}x.globalAlpha=p.life;x.fillStyle=p.color;x.shadowBlur=8;x.shadowColor=p.color;x.beginPath();x.arc(p.x,p.y,p.s*p.life,0,Math.PI*2);x.fill();}x.globalAlpha=1;x.shadowBlur=0;}
function loop(){grid();board();parts();requestAnimationFrame(loop);}
cv.addEventListener('mousemove',e=>{const r=cv.getBoundingClientRect();const px=(e.clientX-r.left)*(W/r.width),py=(e.clientY-r.top)*(H/r.height);const gx=px-GX,gy=py-GY;if(gx<0||gx>GS||gy<0||gy>GS){hv=-1;return;}hv=Math.floor(gy/CE)*3+Math.floor(gx/CE);});
cv.addEventListener('mouseleave',()=>{hv=-1;});
cv.addEventListener('click',e=>{const r=cv.getBoundingClientRect();const px=(e.clientX-r.left)*(W/r.width),py=(e.clientY-r.top)*(H/r.height);const gx=px-GX,gy=py-GY;if(gx<0||gx>GS||gy<0||gy>GS||w)return;const i=Math.floor(gy/CE)*3+Math.floor(gx/CE);if(b[i])return;b[i]=t;const cx=GX+(i%3)*CE+CE/2,cy=GY+Math.floor(i/3)*CE+CE/2;for(let k=0;k<10;k++)pt.push({x:cx,y:cy,vx:(Math.random()-0.5)*7,vy:(Math.random()-0.5)*7-2,life:1,color:t==='X'?'#0ff':'#f0f',s:1.5+Math.random()*3.5});const L=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];for(const l of L){if(b[l[0]]&&b[l[0]]===b[l[1]]&&b[l[1]]===b[l[2]]){w={player:b[l[0]],line:l};for(let k=0;k<30;k++)pt.push({x:W/2,y:H/2,vx:(Math.random()-0.5)*10,vy:(Math.random()-0.5)*10-3,life:1,color:b[l[0]]==='X'?'#0f0':'#f00',s:2+Math.random()*4});return;}}if(b.every(c=>c)){w={player:'draw',line:null};return;}t=t==='X'?'O':'X';});
loop();
})();
<\/script>
</div>`

let handler = async (m, { conn, args, command }) => {
    const jid = m.chat || m.key?.remoteJid
    if (!jid) return
    const senderJid = m.sender
    const senderName = m.pushName || normalize(senderJid)
    const game = getGame(jid)
    const ctx = m.message?.extendedTextMessage?.contextInfo || m.msg?.contextInfo
    const num = parseInt(args[0])

    if (/^(ttt|tictactoe|tres)$/i.test(command)) {
        if (game.active) return conn.reply(jid, '《✧》 Ya hay partida en curso.', m)
        let rivalJid = null
        if (ctx?.participant) rivalJid = ctx.participant
        if (!rivalJid && ctx?.mentionedJid?.length) rivalJid = ctx.mentionedJid[0]
        if (!rivalJid) return conn.reply(jid, '《✧》 Menciona o responde al usuario con quien jugarás.', m)
        if (normalize(rivalJid) === normalize(senderJid)) return conn.reply(jid, '《✧》 No puedes jugar contigo mismo.', m)

        game.players = [
            { name: senderName, jid: senderJid, symbol: 'X' },
            { name: (await conn.getName(rivalJid)) || normalize(rivalJid), jid: rivalJid, symbol: 'O' }
        ]
        game.board = Array(9).fill('')
        game.turn = 0
        game.active = true

        try {
            await conn.relayMessage(jid, {
                messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
                botForwardedMessage: {
                    message: {
                        richResponseMessage: {
                            messageType: 1,
                            submessages: [{ messageType: 2, messageText: '🎮 TRES EN LÍNEA' }],
                            unifiedResponse: {
                                data: Buffer.from(JSON.stringify({
                                    response_id: crypto.randomUUID(),
                                    sections: [{
                                        view_model: {
                                            primitive: { __typename: 'GenAIaeacdsnwHtmlPrimitive', payload: TICTACTOE_HTML, trusted_sources: [] },
                                            __typename: 'GenAISingleLayoutViewModel'
                                        }
                                    }]
                                })).toString('base64')
                            },
                            contextInfo: { forwardingScore: 1, isForwarded: true, forwardOrigin: 4 }
                        }
                    }
                }
            }, { quoted: m })
        } catch (e) {}

        return conn.reply(jid, `⚔️ *TRES EN LÍNEA*\n\n❌ @${normalize(senderJid)}\n⭕ @${normalize(rivalJid)}\n\n👉 Turno de @${normalize(senderJid)}\nUsa *.j 1-9*`, m, { mentions: [senderJid, rivalJid] })
    }

    if (/^(j|jugar)$/i.test(command)) {
        if (!game.active) return conn.reply(jid, '《✧》 No hay partida activa.', m)
        const me = game.players.find(p => normalize(p.jid) === normalize(senderJid))
        if (!me) return conn.reply(jid, '《✧》 No estás en esta partida.', m)
        const cur = game.players[game.turn]
        if (normalize(cur.jid) !== normalize(senderJid)) return conn.reply(jid, `⏳ Le toca a @${normalize(cur.jid)}`, m, { mentions: [cur.jid] })
        if (!num || num < 1 || num > 9) return conn.reply(jid, '《✧》 Usa *.j 1-9*', m)
        const idx = num - 1
        if (game.board[idx] !== '') return conn.reply(jid, '《✧》 Casilla ocupada.', m)

        game.board[idx] = me.symbol
        const win = checkWin(game.board)
        const full = game.board.every(c => c !== '')
        const tab = render(game.board)

        if (win) {
            game.active = false
            return conn.reply(jid, `🏆 *¡GANA @${normalize(me.jid)}!*\n\n${tab}`, m, { mentions: [me.jid] })
        }
        if (full) {
            game.active = false
            return conn.reply(jid, `🤝 *EMPATE*\n\n${tab}`, m, { mentions: game.players.map(p => p.jid) })
        }

        game.turn = (game.turn + 1) % 2
        const next = game.players[game.turn]
        return conn.reply(jid, `✅ ${me.name} → casilla ${num}\n\n${tab}\n\n👉 Turno de @${normalize(next.jid)} (${next.symbol})\nUsa *.j 1-9*`, m, { mentions: [next.jid] })
    }
}

handler.help = ['tictactoe']]
handler.tags = ['game']
handler.command = ['ttt', 'tictactoe']
export default handler