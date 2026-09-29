import crypto from 'crypto'

const TICTACTOE_HTML = `
<div style="width:100%;height:640px;background:radial-gradient(ellipse at center,#1a1a2e 0%,#0a0a14 60%,#000 100%);position:relative;overflow:hidden;font-family:'Segoe UI',sans-serif;user-select:none;">
<canvas id="tttC" width="360" height="640" style="width:100%;height:100%;display:block;touch-action:none;"></canvas>
<div id="tttHU" style="position:absolute;top:0;left:0;width:100%;box-sizing:border-box;color:#fff;pointer-events:none;z-index:5;">
<div style="display:flex;justify-content:space-around;padding:14px 15px;align-items:center;font-family:monospace;">
<div style="text-align:center;">
<div style="font-size:10px;color:#8af;letter-spacing:2px;">X</div>
<div id="tttPX" style="font-size:13px;font-weight:900;color:#0ff;text-shadow:0 0 10px #0ff;">—</div>
</div>
<div style="text-align:center;">
<div style="font-size:10px;color:#8af;letter-spacing:2px;">O</div>
<div id="tttPO" style="font-size:13px;font-weight:900;color:#f0f;text-shadow:0 0 10px #f0f;">—</div>
</div>
</div>
</div>
<div id="tttStatus" style="position:absolute;bottom:75px;left:0;width:100%;text-align:center;color:#fff;font-size:15px;font-weight:700;letter-spacing:1px;z-index:5;pointer-events:none;text-shadow:0 0 12px rgba(0,200,255,0.9);padding:0 10px;box-sizing:border-box;"></div>
</div>
<script>
(function(){
const c=document.getElementById('tttC'),ctx=c.getContext('2d');
const pXT=document.getElementById('tttPX'),pOT=document.getElementById('tttPO');
const stT=document.getElementById('tttStatus');
const W=c.width,H=c.height;
const GX=30,GY=110,GS=300,CELL=100;
let board,turn,winner,particles,hoverCell,glow,ripples,pressAnim;
function initBoard(){board=Array(9).fill('');turn='X';winner=null;particles=[];hoverCell=-1;glow=0;ripples=[];pressAnim=0;}
function spawnRipple(x,y,color){
ripples.push({x,y,r:0,max:60,life:1,color});
}
function spawnParticles(x,y,color,n){
for(let i=0;i<n;i++)particles.push({
x,y,vx:(Math.random()-0.5)*7,vy:(Math.random()-0.5)*7-2,
life:1,color,size:1.5+Math.random()*3.5
});
}
function drawBackground(){
const g=ctx.createRadialGradient(W/2,H/2,50,W/2,H/2,W*0.8);
g.addColorStop(0,'#1a1a2e');
g.addColorStop(0.6,'#0a0a14');
g.addColorStop(1,'#000');
ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
for(let i=0;i<60;i++){
const sx=(i*137.5+Date.now()*0.01)%W;
const sy=(i*97.3+Date.now()*0.02)%H;
const tw=0.15+Math.sin(Date.now()*0.002+i)*0.1;
ctx.globalAlpha=tw;
ctx.fillStyle=i%3===0?'#0ff':i%3===1?'#f0f':'#fff';
ctx.beginPath();ctx.arc(sx,sy,1.2,0,Math.PI*2);ctx.fill();
}
ctx.globalAlpha=1;
const vig=ctx.createRadialGradient(W/2,H/2,H*0.3,W/2,H/2,H*0.75);
vig.addColorStop(0,'rgba(0,0,0,0)');
vig.addColorStop(1,'rgba(0,0,0,0.85)');
ctx.fillStyle=vig;ctx.fillRect(0,0,W,H);
}
function drawGrid(){
drawBackground();
const boardW=GS,boardH=GS;
const bx=GX-8,by=GY-8,bw=boardW+16,bh=boardH+16;
ctx.save();
ctx.shadowBlur=25;ctx.shadowColor='rgba(0,200,255,0.4)';
ctx.strokeStyle='rgba(0,200,255,0.35)';
ctx.lineWidth=2;
roundRect(bx,by,bw,bh,14);
ctx.stroke();
ctx.restore();
ctx.fillStyle='rgba(0,20,40,0.35)';
roundRect(bx,by,bw,bh,14);
ctx.fill();
ctx.save();
ctx.strokeStyle='rgba(0,200,255,0.9)';
ctx.lineWidth=3;
ctx.shadowBlur=18;ctx.shadowColor='#0ff';
ctx.lineCap='round';
const pulse=1+Math.sin(Date.now()*0.003)*0.02;
for(let i=0;i<4;i++){
const lw=(i===0||i===3)?3:2.5;
ctx.lineWidth=lw;
ctx.beginPath();
ctx.moveTo(GX+i*CELL,GY);ctx.lineTo(GX+i*CELL,GY+GS);
ctx.stroke();
ctx.beginPath();
ctx.moveTo(GX,GY+i*CELL);ctx.lineTo(GX+GS,GY+i*CELL);
ctx.stroke();
}
ctx.shadowBlur=0;
for(let i=1;i<4;i++){
for(let j=1;j<4;j++){
ctx.fillStyle='rgba(0,200,255,0.6)';
ctx.beginPath();
ctx.arc(GX+i*CELL,GY+j*CELL,2,0,Math.PI*2);
ctx.fill();
}
}
const corners=[[GX,GY],[GX+GS,GY],[GX,GY+GS],[GX+GS,GY+GS]];
ctx.strokeStyle='rgba(0,255,255,0.9)';
ctx.lineWidth=2.5;
ctx.shadowBlur=12;ctx.shadowColor='#0ff';
for(const [cx,cy] of corners){
const d=8;
ctx.beginPath();
ctx.moveTo(cx-d,cy);ctx.lineTo(cx,cy);ctx.lineTo(cx,cy-d);
if(cx===GX)ctx.moveTo(cx+d,cy),ctx.lineTo(cx,cy),ctx.lineTo(cx,cy-d);
ctx.stroke();
}
ctx.shadowBlur=0;
ctx.restore();
if(hoverCell>=0&&board[hoverCell]===''&&!winner){
const r=Math.floor(hoverCell/3),col=hoverCell%3;
const x=GX+col*CELL,y=GY+r*CELL;
const color=turn==='X'?'0,255,255':'255,0,255';
const g=ctx.createRadialGradient(x+CELL/2,y+CELL/2,5,x+CELL/2,y+CELL/2,CELL/2);
g.addColorStop(0,`rgba(${color},0.35)`);
g.addColorStop(1,`rgba(${color},0)`);
ctx.fillStyle=g;
roundRect(x+3,y+3,CELL-6,CELL-6,10);
ctx.fill();
ctx.strokeStyle=`rgba(${color},0.7)`;
ctx.lineWidth=2;
ctx.setLineDash([6,4]);
ctx.lineDashOffset=-Date.now()*0.01;
roundRect(x+3,y+3,CELL-6,CELL-6,10);
ctx.stroke();
ctx.setLineDash([]);
}
}
function roundRect(x,y,w,h,r){
ctx.beginPath();
ctx.moveTo(x+r,y);
ctx.lineTo(x+w-r,y);
ctx.quadraticCurveTo(x+w,y,x+w,y+r);
ctx.lineTo(x+w,y+h-r);
ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
ctx.lineTo(x+r,y+h);
ctx.quadraticCurveTo(x,y+h,x,y+h-r);
ctx.lineTo(x,y+r);
ctx.quadraticCurveTo(x,y,x+r,y);
ctx.closePath();
}
function drawX(cx,cy,size,alpha,scale){
ctx.save();
ctx.globalAlpha=alpha;
ctx.translate(cx,cy);
ctx.scale(scale,scale);
ctx.strokeStyle='#0ff';
ctx.lineWidth=7;
ctx.lineCap='round';
ctx.shadowBlur=25;ctx.shadowColor='#0ff';
const s=size/2-14;
ctx.beginPath();
ctx.moveTo(-s,-s);ctx.lineTo(s,s);
ctx.stroke();
ctx.beginPath();
ctx.moveTo(s,-s);ctx.lineTo(-s,s);
ctx.stroke();
ctx.strokeStyle='rgba(255,255,255,0.7)';
ctx.lineWidth=2;
ctx.beginPath();
ctx.moveTo(-s,-s);ctx.lineTo(s,s);
ctx.stroke();
ctx.beginPath();
ctx.moveTo(s,-s);ctx.lineTo(-s,s);
ctx.stroke();
ctx.restore();
}
function drawO(cx,cy,size,alpha,scale){
ctx.save();
ctx.globalAlpha=alpha;
ctx.translate(cx,cy);
ctx.scale(scale,scale);
ctx.strokeStyle='#f0f';
ctx.lineWidth=7;
ctx.lineCap='round';
ctx.shadowBlur=25;ctx.shadowColor='#f0f';
ctx.beginPath();
ctx.arc(0,0,size/2-16,0,Math.PI*2);
ctx.stroke();
ctx.strokeStyle='rgba(255,255,255,0.7)';
ctx.lineWidth=2;
ctx.beginPath();
ctx.arc(0,0,size/2-16,0,Math.PI*2);
ctx.stroke();
ctx.restore();
}
function drawBoard(){
for(let i=0;i<9;i++){
const r=Math.floor(i/3),col=i%3;
const cx=GX+col*CELL+CELL/2,cy=GY+r*CELL+CELL/2;
if(board[i]==='X')drawX(cx,cy,CELL,1,1);
else if(board[i]==='O')drawO(cx,cy,CELL,1,1);
}
if(winner&&winner.line){
const line=winner.line;
const r1=Math.floor(line[0]/3),c1=line[0]%3;
const r2=Math.floor(line[2]/3),c2=line[2]%3;
const x1=GX+c1*CELL+CELL/2,y1=GY+r1*CELL+CELL/2;
const x2=GX+c2*CELL+CELL/2,y2=GY+r2*CELL+CELL/2;
ctx.save();
const pulse=0.7+Math.sin(Date.now()*0.008)*0.3;
ctx.strokeStyle=winner.player==='X'?`rgba(0,255,0,${pulse})`:`rgba(255,0,0,${pulse})`;
ctx.lineWidth=9;ctx.lineCap='round';
ctx.shadowBlur=35;ctx.shadowColor=winner.player==='X'?'#0f0':'#f00';
ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
ctx.strokeStyle='rgba(255,255,255,0.9)';
ctx.lineWidth=3;
ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
ctx.restore();
}
}
function drawRipples(){
for(let i=ripples.length-1;i>=0;i--){
const r=ripples[i];
r.r+=(r.max-r.r)*0.12;
r.life-=0.03;
if(r.life<=0){ripples.splice(i,1);continue;}
ctx.globalAlpha=r.life*0.7;
ctx.strokeStyle=r.color;
ctx.lineWidth=3;
ctx.beginPath();ctx.arc(r.x,r.y,r.r,0,Math.PI*2);ctx.stroke();
}
ctx.globalAlpha=1;
}
function drawParticles(){
for(let i=particles.length-1;i>=0;i--){
const p=particles[i];
p.x+=p.vx;p.y+=p.vy;p.vy+=0.18;p.vx*=0.99;
p.life-=0.018;
if(p.life<=0){particles.splice(i,1);continue;}
ctx.globalAlpha=p.life;
ctx.fillStyle=p.color;
ctx.shadowBlur=8;ctx.shadowColor=p.color;
ctx.beginPath();ctx.arc(p.x,p.y,p.size*p.life,0,Math.PI*2);ctx.fill();
}
ctx.globalAlpha=1;
ctx.shadowBlur=0;
}
function loop(){drawGrid();drawBoard();drawRipples();drawParticles();requestAnimationFrame(loop);}
initBoard();
stT.innerText='Esperando...';
loop();
})();
</script>
</div>
`

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

let handler = async (m, { conn, args, command }) => {
    const jid = m.chat || m.key?.remoteJid
    if (!jid) return
    const senderJid = m.sender
    const senderName = m.pushName || senderJid.split('@')[0]
    const game = getGame(jid)
    const ctx = m.message?.extendedTextMessage?.contextInfo || m.msg?.contextInfo
    const num = parseInt(args[0])

    if (/^(ttt|tictactoe|tres)$/i.test(command)) {
        if (game.active) return m.reply('Ya hay partida en curso.')
        let rivalJid = ctx?.participant
        if (!rivalJid && ctx?.mentionedJid?.length) rivalJid = ctx.mentionedJid[0]
        if (!rivalJid) return m.reply('Menciona o responde a alguien.')
        if (rivalJid === senderJid) return m.reply('No puedes jugar contigo.')

        game.players = [
            { name: senderName, jid: senderJid, symbol: 'X' },
            { name: (await conn.getName(rivalJid)) || rivalJid.split('@')[0], jid: rivalJid, symbol: 'O' }
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

        return conn.sendMessage(jid, {
            text: `⚔️ *TRES EN LÍNEA*\n\n❌ @${senderJid.split('@')[0]}\n⭕ @${rivalJid.split('@')[0]}\n\n👉 Turno de @${senderJid.split('@')[0]}\nUsa *.j 1-9*`,
            mentions: [senderJid, rivalJid]
        }, { quoted: m })
    }

    if (/^(j|jugar)$/i.test(command)) {
        if (!game.active) return m.reply('No hay partida.')
        const me = game.players.find(p => p.jid === senderJid)
        if (!me) return m.reply('No estás en la partida.')
        const cur = game.players[game.turn]
        if (cur.jid !== senderJid) return conn.sendMessage(jid, { text: `⏳ Le toca a @${cur.jid.split('@')[0]}`, mentions: [cur.jid] }, { quoted: m })
        if (!num || num < 1 || num > 9) return m.reply('Usa *.j 1-9*')
        const idx = num - 1
        if (game.board[idx] !== '') return m.reply('Ocupada.')

        game.board[idx] = me.symbol
        const win = checkWin(game.board)
        const full = game.board.every(c => c !== '')
        const tab = render(game.board)

        if (win) {
            game.active = false
            return conn.sendMessage(jid, { text: `🏆 ¡GANA @${me.jid.split('@')[0]}!\n\n${tab}`, mentions: [me.jid] }, { quoted: m })
        }
        if (full) {
            game.active = false
            return conn.sendMessage(jid, { text: `🤝 EMPATE\n\n${tab}`, mentions: game.players.map(p => p.jid) }, { quoted: m })
        }

        game.turn = (game.turn + 1) % 2
        const next = game.players[game.turn]
        return conn.sendMessage(jid, {
            text: `✅ ${me.name} → ${num}\n\n${tab}\n\n👉 Turno de @${next.jid.split('@')[0]} (${next.symbol})`,
            mentions: [next.jid]
        }, { quoted: m })
    }
}

handler.help = ['tictactoe']
handler.tags = ['game']
handler.command = ['ttt', 'tictactoe']
export default handler