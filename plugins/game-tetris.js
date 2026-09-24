import crypto from 'crypto'

const TETRIS_HTML = `
<div style="width:100%;height:600px;background:#08080f;position:relative;overflow:hidden;font-family:'Segoe UI',sans-serif;user-select:none;touch-action:none;">
<canvas id="tC" width="360" height="600" style="width:100%;height:100%;display:block;"></canvas>
<div id="tUI" style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;align-items:center;background:rgba(0,0,0,0.9);z-index:10;transition:opacity 0.3s;padding:20px;box-sizing:border-box;">
<h1 style="color:#0ff;text-shadow:0 0 20px #0ff,0 0 40px #08f;font-size:34px;margin:0 0 8px;letter-spacing:4px;text-transform:uppercase;font-weight:900;text-align:center;">TETRIS</h1>
<p style="color:#8af;margin:0 0 22px;font-size:12px;text-align:center;letter-spacing:1px;line-height:1.7;">Usa los botones para mover, rotar<br>y acelerar la caída de las piezas.<br>¡Completa líneas para puntuar!</p>
<button id="tSB" style="padding:14px 40px;background:linear-gradient(45deg,#0ff,#08f);border:none;border-radius:30px;color:#fff;font-size:15px;font-weight:900;cursor:pointer;text-transform:uppercase;letter-spacing:2px;box-shadow:0 0 25px rgba(0,200,255,0.5);">JUGAR</button>
</div>
<div id="tHU" style="position:absolute;top:0;left:0;width:100%;box-sizing:border-box;color:#fff;display:none;pointer-events:none;z-index:5;">
<div style="display:flex;justify-content:space-between;padding:10px 15px;align-items:center;">
<div>
<div style="font-size:9px;color:#8af;letter-spacing:2px;">PUNTOS</div>
<div id="tSc" style="font-size:20px;font-weight:900;font-family:monospace;text-shadow:0 0 8px #0ff;">0</div>
</div>
<div style="text-align:center;">
<div style="font-size:9px;color:#8af;letter-spacing:2px;">NIVEL</div>
<div id="tLv" style="font-size:20px;font-weight:900;font-family:monospace;color:#0ff;text-shadow:0 0 8px #0ff;">1</div>
</div>
<div style="text-align:right;">
<div style="font-size:9px;color:#8af;letter-spacing:2px;">LÍNEAS</div>
<div id="tLn" style="font-size:20px;font-weight:900;font-family:monospace;color:#fa0;text-shadow:0 0 8px #fa0;">0</div>
</div>
</div>
</div>
<div id="tPad" style="position:absolute;bottom:0;left:0;width:100%;box-sizing:border-box;display:none;z-index:6;padding:6px;background:linear-gradient(to top,rgba(8,8,15,0.98),rgba(8,8,15,0.75));">
<div style="display:flex;justify-content:space-between;gap:4px;align-items:stretch;">
<div style="display:flex;gap:4px;">
<button data-act="left" style="width:50px;height:46px;border-radius:12px;background:linear-gradient(180deg,#1a2a4a,#0a1525);border:1px solid #2a4a7a;color:#0ff;font-size:20px;font-weight:900;cursor:pointer;box-shadow:0 3px 0 #061020,0 0 12px rgba(0,200,255,0.3);">◀</button>
<button data-act="right" style="width:50px;height:46px;border-radius:12px;background:linear-gradient(180deg,#1a2a4a,#0a1525);border:1px solid #2a4a7a;color:#0ff;font-size:20px;font-weight:900;cursor:pointer;box-shadow:0 3px 0 #061020,0 0 12px rgba(0,200,255,0.3);">▶</button>
</div>
<div style="display:flex;gap:4px;">
<button data-act="rotate" style="width:50px;height:46px;border-radius:12px;background:linear-gradient(180deg,#4a1a3a,#250a1a);border:1px solid #7a2a5a;color:#f0f;font-size:20px;font-weight:900;cursor:pointer;box-shadow:0 3px 0 #200610,0 0 12px rgba(255,0,255,0.3);">↻</button>
<button data-act="down" style="width:50px;height:46px;border-radius:12px;background:linear-gradient(180deg,#3a3a1a,#1a1a0a);border:1px solid #7a7a2a;color:#ff0;font-size:20px;font-weight:900;cursor:pointer;box-shadow:0 3px 0 #101006,0 0 12px rgba(255,255,0,0.3);">▼</button>
<button data-act="drop" style="width:50px;height:46px;border-radius:12px;background:linear-gradient(180deg,#4a2a1a,#25150a);border:1px solid #7a4a2a;color:#f80;font-size:18px;font-weight:900;cursor:pointer;box-shadow:0 3px 0 #201008,0 0 12px rgba(255,128,0,0.3);">⤓</button>
</div>
</div>
</div>
</div>
<script>
(function(){
const c=document.getElementById('tC'),ctx=c.getContext('2d');
const uI=document.getElementById('tUI'),sB=document.getElementById('tSB'),hU=document.getElementById('tHU');
const scT=document.getElementById('tSc'),lvT=document.getElementById('tLv'),lnT=document.getElementById('tLn');
const pad=document.getElementById('tPad');
const COLS=10,ROWS=20,BS=24;
const PAD_H=62;
const OX=(c.width-COLS*BS)/2,OY=58;
const BOARD_H=ROWS*BS;
const SHAPES={
I:{s:[[1,1,1,1]],c:'#0ff'},
O:{s:[[1,1],[1,1]],c:'#ff0'},
T:{s:[[0,1,0],[1,1,1]],c:'#f0f'},
S:{s:[[0,1,1],[1,1,0]],c:'#0f0'},
Z:{s:[[1,1,0],[0,1,1]],c:'#f00'},
J:{s:[[1,0,0],[1,1,1]],c:'#08f'},
L:{s:[[0,0,1],[1,1,1]],c:'#f80'}
};
const KEYS=Object.keys(SHAPES);
let board,cur,next,hold,canHold,sc,lv,ln,dropT,dropF,lockDelay,lockResets,running,anim,lastTime,combo,flashLines,particles,shake,bag;
function newBag(){const b=KEYS.slice();for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;}
function rndPiece(){if(!bag||!bag.length)bag=newBag();const k=bag.pop();const sp=SHAPES[k];return{type:k,shape:sp.s.map(r=>r.slice()),color:sp.c,x:Math.floor((COLS-sp.s[0].length)/2),y:0,rot:0};}
function rotM(m){const r=m.length,cc=m[0].length,n=[];for(let x=0;x<cc;x++){n.push([]);for(let y=r-1;y>=0;y--)n[x].push(m[y][x]);}return n;}
function rotN(m,n){for(let i=0;i<n;i++)m=rotM(m);return m;}
function collide(sh,px,py){
for(let y=0;y<sh.length;y++)for(let x=0;x<sh[y].length;x++){
if(!sh[y][x])continue;
const nx=px+x,ny=py+y;
if(nx<0||nx>=COLS||ny>=ROWS)return true;
if(ny>=0&&board[ny][nx])return true;
}
return false;
}
function tryRotate(dir){
if(cur.type==='O')return;
const times=dir>0?1:3;
const r=rotN(cur.shape,times);
const kicks=[[0,0],[-1,0],[1,0],[-2,0],[2,0],[0,-1],[-1,-1],[1,-1]];
for(const[kx,ky]of kicks){
if(!collide(r,cur.x+kx,cur.y+ky)){
cur.shape=r;cur.rot=(cur.rot+(dir>0?1:3))%4;
cur.x+=kx;cur.y+=ky;
resetLock();return;
}
}
}
function merge(){
for(let y=0;y<cur.shape.length;y++)for(let x=0;x<cur.shape[y].length;x++){
if(cur.shape[y][x]){const ny=cur.y+y;if(ny>=0)board[ny][cur.x+x]=cur.color;}
}
}
function spawnParticles(x,y,color,n){
for(let i=0;i<n;i++){
particles.push({x,y,vx:(Math.random()-0.5)*6,vy:(Math.random()-0.5)*6-2,life:1,color,size:2+Math.random()*3});
}
}
function clearLines(){
let cl=0,clearedRows=[];
for(let y=ROWS-1;y>=0;y--){
if(board[y].every(v=>v)){clearedRows.push(y);board.splice(y,1);board.unshift(new Array(COLS).fill(null));cl++;y++;}
}
if(cl>0){
const base=[0,100,300,500,800][cl];
sc+=(base+combo*50)*lv;combo++;ln+=cl;
flashLines={t:1,rows:cl};
shake=Math.min(10,cl*3);
for(let r=0;r<cl;r++){
const ry=OY+(ROWS-1-r)*BS+BS/2;
for(let i=0;i<10;i++){
spawnParticles(OX+Math.random()*COLS*BS,ry,'#fff',3);
}
}
const newLv=Math.floor(ln/10)+1;
if(newLv>lv){lv=newLv;shake=15;}
scT.innerText=sc;lvT.innerText=lv;lnT.innerText=ln;
}else combo=0;
}
function spawn(){
cur=next;next=rndPiece();canHold=true;
if(collide(cur.shape,cur.x,cur.y)){gameOver();return false;}
dropT=0;lockDelay=0;lockResets=0;
return true;
}
function resetLock(){
if(lockDelay>0&&lockResets<15){lockDelay=0;lockResets++;}
}
function drop(){
if(collide(cur.shape,cur.x,cur.y+1)){
lockDelay+=1;return;
}
cur.y++;dropT=0;
resetLock();
}
function hardDrop(){
let n=0;
while(!collide(cur.shape,cur.x,cur.y+1)){cur.y++;n++;}
sc+=n*2;
shake=Math.min(6,2+n*0.2);
for(let y=0;y<cur.shape.length;y++)for(let x=0;x<cur.shape[y].length;x++){
if(cur.shape[y][x])spawnParticles(OX+(cur.x+x)*BS+BS/2,OY+(cur.y+y)*BS+BS/2,cur.color,2);
}
merge();clearLines();spawn();
}
function holdPiece(){
if(!canHold)return;
canHold=false;
if(!hold){
hold=cur;spawn();
}else{
const t=hold;hold=cur;
const sp=SHAPES[t.type];
cur={type:t.type,shape:sp.s.map(r=>r.slice()),color:sp.c,x:Math.floor((COLS-sp.s[0].length)/2),y:0,rot:0};
if(collide(cur.shape,cur.x,cur.y)){gameOver();return;}
dropT=0;lockDelay=0;
}
}
function drawCell(x,y,color,alpha){
const px=OX+x*BS,py=OY+y*BS;
ctx.globalAlpha=alpha!==undefined?alpha:1;
ctx.fillStyle=color;
ctx.shadowBlur=8;ctx.shadowColor=color;
ctx.fillRect(px+1,py+1,BS-2,BS-2);
ctx.shadowBlur=0;
ctx.fillStyle='rgba(255,255,255,0.35)';
ctx.fillRect(px+1,py+1,BS-2,4);
ctx.fillRect(px+1,py+1,4,BS-2);
ctx.fillStyle='rgba(0,0,0,0.35)';
ctx.fillRect(px+1,py+BS-5,BS-2,4);
ctx.fillRect(px+BS-5,py+1,4,BS-2);
ctx.globalAlpha=1;
}
function drawGhost(){
let gy=0;
while(!collide(cur.shape,cur.x,cur.y+gy+1))gy++;
for(let y=0;y<cur.shape.length;y++)for(let x=0;x<cur.shape[y].length;x++){
if(cur.shape[y][x]){
const px=OX+(cur.x+x)*BS,py=OY+(cur.y+y+gy)*BS;
ctx.strokeStyle=cur.color;ctx.globalAlpha=0.35;ctx.lineWidth=1.5;
ctx.strokeRect(px+3,py+3,BS-6,BS-6);ctx.globalAlpha=1;
}
}
}
function draw(){
let sx=0,sy=0;
if(shake>0){sx=(Math.random()-0.5)*shake;sy=(Math.random()-0.5)*shake;shake*=0.85;if(shake<0.2)shake=0;}
ctx.setTransform(1,0,0,1,0,0);
ctx.fillStyle='#08080f';ctx.fillRect(0,0,c.width,c.height);
ctx.translate(sx,sy);
ctx.fillStyle='#fff';
for(let i=0;i<50;i++){
const stx=(i*137.5)%c.width,sty=(i*97.3+Date.now()*0.02)%c.height;
ctx.globalAlpha=0.15+((i*7)%10)/25;
ctx.fillRect(stx,sty,1.5,1.5);
}
ctx.globalAlpha=1;
ctx.strokeStyle='rgba(80,120,200,0.1)';ctx.lineWidth=0.5;
for(let x=0;x<=COLS;x++){ctx.beginPath();ctx.moveTo(OX+x*BS,OY);ctx.lineTo(OX+x*BS,OY+ROWS*BS);ctx.stroke();}
for(let y=0;y<=ROWS;y++){ctx.beginPath();ctx.moveTo(OX,OY+y*BS);ctx.lineTo(OX+COLS*BS,OY+y*BS);ctx.stroke();}
ctx.strokeStyle='rgba(0,200,255,0.6)';ctx.lineWidth=2;
ctx.shadowBlur=15;ctx.shadowColor='#0ff';
ctx.strokeRect(OX,OY,COLS*BS,ROWS*BS);
ctx.shadowBlur=0;
for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){
if(board[y][x])drawCell(x,y,board[y][x]);
}
if(cur&&running){
drawGhost();
for(let y=0;y<cur.shape.length;y++)for(let x=0;x<cur.shape[y].length;x++){
if(cur.shape[y][x])drawCell(cur.x+x,cur.y+y,cur.color);
}
}
if(flashLines&&flashLines.t>0){
ctx.fillStyle='rgba(255,255,255,'+(flashLines.t*0.5)+')';
ctx.fillRect(OX,OY,COLS*BS,ROWS*BS);
flashLines.t-=0.06;
}
for(let i=particles.length-1;i>=0;i--){
const p=particles[i];
p.x+=p.vx;p.y+=p.vy;p.vy+=0.3;p.life-=0.03;
if(p.life<=0){particles.splice(i,1);continue;}
ctx.globalAlpha=p.life;ctx.fillStyle=p.color;
ctx.fillRect(p.x,p.y,p.size,p.size);
}
ctx.globalAlpha=1;
ctx.setTransform(1,0,0,1,0,0);
}
function tick(ts){
if(!running)return;
if(!lastTime)lastTime=ts;
const dt=Math.min(100,ts-lastTime);lastTime=ts;
const speed=Math.max(80,900-(lv-1)*75);
dropT+=dt;
if(dropT>speed){drop();dropT=0;}
if(lockDelay>0){
lockDelay+=dt;
if(lockDelay>450){
merge();clearLines();spawn();
lockDelay=0;lockResets=0;
}
}
draw();
anim=requestAnimationFrame(tick);
}
function start(){
board=Array.from({length:ROWS},()=>new Array(COLS).fill(null));
bag=newBag();hold=null;canHold=true;
sc=0;lv=1;ln=0;dropT=0;lockDelay=0;lockResets=0;combo=0;flashLines=null;particles=[];shake=0;lastTime=0;
next=rndPiece();spawn();
scT.innerText=sc;lvT.innerText=lv;lnT.innerText=ln;
hU.style.display='block';
pad.style.display='block';
uI.style.opacity=0;setTimeout(()=>uI.style.display='none',300);
running=true;anim=requestAnimationFrame(tick);
}
function gameOver(){
running=false;cancelAnimationFrame(anim);
for(let i=0;i<60;i++)spawnParticles(c.width/2,c.height/2,['#0ff','#f0f','#ff0','#f00'][i%4],1);
let gt=0;
function fade(){
gt++;
draw();
if(gt>60){
uI.style.display='flex';uI.style.opacity=1;
sB.innerText='VOLVER A JUGAR';
uI.querySelector('h1').innerText='GAME OVER';
uI.querySelector('p').innerHTML='<b style="color:#0ff">Puntos: '+sc+'</b> · <b style="color:#0ff">Nivel: '+lv+'</b> · <b style="color:#fa0">Líneas: '+ln+'</b><br><br>La gravedad te ha vencido.';
hU.style.display='none';pad.style.display='none';
return;
}
requestAnimationFrame(fade);
}
fade();
}
function handleAct(a){
if(!running)return;
if(a==='left'){if(!collide(cur.shape,cur.x-1,cur.y)){cur.x--;resetLock();}}
else if(a==='right'){if(!collide(cur.shape,cur.x+1,cur.y)){cur.x++;resetLock();}}
else if(a==='down'){drop();}
else if(a==='rotate'){tryRotate(1);}
else if(a==='drop'){hardDrop();}
else if(a==='hold'){holdPiece();}
}
pad.querySelectorAll('button').forEach(b=>{
const act=b.getAttribute('data-act');
b.addEventListener('touchstart',e=>{e.preventDefault();e.stopPropagation();handleAct(act);},{passive:false});
b.addEventListener('mousedown',e=>{e.preventDefault();e.stopPropagation();handleAct(act);});
b.addEventListener('contextmenu',e=>e.preventDefault());
});
document.addEventListener('keydown',e=>{
if(!running)return;
const k=e.key;
if(k==='ArrowLeft'){e.preventDefault();handleAct('left');}
else if(k==='ArrowRight'){e.preventDefault();handleAct('right');}
else if(k==='ArrowDown'){e.preventDefault();handleAct('down');}
else if(k==='ArrowUp'||k===' '){e.preventDefault();handleAct('rotate');}
else if(k==='c'||k==='C'){e.preventDefault();handleAct('hold');}
else if(k==='Enter'){e.preventDefault();handleAct('drop');}
});
sB.addEventListener('click',start);
draw();
})();
</script>
</div>
`

let handler = async (m, { conn }) => {
    const jid = m.chat || m.key?.remoteJid
    if (!jid) return
    await conn.relayMessage(
        jid,
        {
            messageContextInfo: {
                deviceListMetadata: {},
                deviceListMetadataVersion: 2
            },
            botForwardedMessage: {
                message: {
                    richResponseMessage: {
                        messageType: 1,
                        submessages: [
                            {
                                messageType: 2,
                                messageText: '🎮 TETRIS'
                            }
                        ],
                        unifiedResponse: {
                            data: Buffer.from(
                                JSON.stringify({
                                    response_id: crypto.randomUUID(),
                                    sections: [
                                        {
                                            view_model: {
                                                primitive: {
                                                    __typename: 'GenAIaeacdsnwHtmlPrimitive',
                                                    payload: TETRIS_HTML,
                                                    trusted_sources: []
                                                },
                                                __typename: 'GenAISingleLayoutViewModel'
                                            }
                                        }
                                    ]
                                })
                            ).toString('base64')
                        },
                        contextInfo: {
                            forwardingScore: 1,
                            isForwarded: true,
                            forwardOrigin: 4
                        }
                    }
                }
            }
        },
        {}
    )
}
handler.help = ['tetris']
handler.tags = ['game']
handler.command = ['tetris']
export default handler