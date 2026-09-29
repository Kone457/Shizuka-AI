import crypto from 'crypto'
const MINESWEEPER_HTML = `
<div style="width:100%;height:600px;background:#02040a;position:relative;overflow:hidden;font-family:'Segoe UI',sans-serif;user-select:none;color:#fff;">
<canvas id="msC" width="360" height="600" style="width:100%;height:100%;display:block;touch-action:none;"></canvas>
<div id="msMenu" style="position:absolute;inset:0;z-index:20;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:22px;box-sizing:border-box;background:radial-gradient(circle at 50% 40%,rgba(0,40,65,.97),rgba(1,3,10,.99) 70%);">
<h1 style="margin:0;color:#fff;font-size:34px;letter-spacing:3px;text-shadow:0 0 10px #00eaff,0 0 35px #008cff;white-space:nowrap;">BUSCAMINAS</h1>
<div style="color:#7195b5;font-size:12px;margin:10px 0 28px;text-align:center;line-height:1.7;">Encuentra todas las minas.<br>Primer clic siempre seguro.</div>
<div style="width:100%;max-width:290px;display:flex;gap:8px;margin-bottom:18px;">
<button class="msDiff" data-d="easy" style="flex:1;padding:12px 4px;border:1px solid #00eaff;background:rgba(0,234,255,.15);color:#00eaff;border-radius:10px;font-weight:800;">FÁCIL</button>
<button class="msDiff" data-d="normal" style="flex:1;padding:12px 4px;border:1px solid #34465c;background:rgba(255,255,255,.04);color:#7890a8;border-radius:10px;font-weight:800;">NORMAL</button>
<button class="msDiff" data-d="hard" style="flex:1;padding:12px 4px;border:1px solid #34465c;background:rgba(255,255,255,.04);color:#7890a8;border-radius:10px;font-weight:800;">DIFÍCIL</button>
</div>
<button id="msStart" style="width:100%;max-width:290px;padding:15px;border:0;border-radius:30px;background:linear-gradient(135deg,#00eaff,#0077ff);color:#fff;font-size:14px;font-weight:900;letter-spacing:3px;box-shadow:0 0 30px rgba(0,200,255,.4);">INICIAR MISIÓN</button>
</div>
<div id="msHUD" style="position:absolute;top:0;left:0;width:100%;z-index:5;display:none;pointer-events:none;">
<div style="display:flex;justify-content:space-between;align-items:center;padding:13px 16px;background:linear-gradient(180deg,rgba(1,12,25,.97),rgba(1,8,16,.7));border-bottom:1px solid rgba(0,220,255,.18);">
<div style="text-align:center;min-width:75px;"><div style="font-size:8px;color:#60809d;letter-spacing:2px;">MINAS</div><div id="msMines" style="font:900 20px monospace;color:#ff405d;text-shadow:0 0 12px #ff1744;">000</div></div>
<div style="text-align:center;"><div id="msLevel" style="font-size:9px;color:#00eaff;letter-spacing:2px;">NORMAL</div><div id="msStatus" style="font-size:11px;color:#8aa5bd;margin-top:3px;">BUSCANDO...</div></div>
<div style="text-align:center;min-width:75px;"><div style="font-size:8px;color:#60809d;letter-spacing:2px;">TIEMPO</div><div id="msTime" style="font:900 20px monospace;color:#fff;">000</div></div>
</div>
</div>
<div id="msControls" style="position:absolute;bottom:0;left:0;width:100%;z-index:8;display:none;justify-content:center;gap:10px;padding:12px;box-sizing:border-box;background:linear-gradient(0deg,rgba(1,5,12,.98),rgba(1,5,12,.65));">
<button id="msFlag" style="width:135px;padding:11px;border:1px solid #ffb000;background:rgba(255,176,0,.1);border-radius:20px;color:#ffb000;font-weight:900;font-size:11px;">⚑ BANDERA</button>
<button id="msReset" style="width:135px;padding:11px;border:1px solid #00eaff;background:rgba(0,234,255,.1);border-radius:20px;color:#00eaff;font-weight:900;font-size:11px;">↻ REINICIAR</button>
</div>
<div id="msResult" style="position:absolute;inset:0;z-index:15;display:none;align-items:center;justify-content:center;background:rgba(0,4,12,.76);backdrop-filter:blur(5px);">
<div style="width:285px;padding:28px 20px;text-align:center;background:linear-gradient(145deg,rgba(8,25,43,.98),rgba(2,7,17,.99));border:1px solid rgba(0,234,255,.4);border-radius:22px;box-shadow:0 0 50px rgba(0,180,255,.25);">
<div id="msResultIcon" style="font-size:48px;">💥</div>
<div id="msResultTitle" style="font-size:26px;font-weight:900;letter-spacing:3px;margin:8px 0;">GAME OVER</div>
<div id="msResultText" style="font-size:12px;color:#7895ad;line-height:1.7;"></div>
<button id="msAgain" style="margin-top:20px;width:100%;padding:13px;border:0;border-radius:25px;background:linear-gradient(135deg,#00eaff,#0077ff);color:#fff;font-weight:900;letter-spacing:2px;">JUGAR DE NUEVO</button>
</div>
</div>
<script>
(function(){
'use strict';
const canvas=document.getElementById('msC');
const ctx=canvas.getContext('2d',{alpha:false});
const W=360,H=600;
const menu=document.getElementById('msMenu');
const hud=document.getElementById('msHUD');
const controls=document.getElementById('msControls');
const result=document.getElementById('msResult');
const start=document.getElementById('msStart');
const reset=document.getElementById('msReset');
const again=document.getElementById('msAgain');
const flagBtn=document.getElementById('msFlag');
const minesEl=document.getElementById('msMines');
const timeEl=document.getElementById('msTime');
const statusEl=document.getElementById('msStatus');
const levelEl=document.getElementById('msLevel');
const resultIcon=document.getElementById('msResultIcon');
const resultTitle=document.getElementById('msResultTitle');
const resultText=document.getElementById('msResultText');
const difficulties={
easy:{name:'FÁCIL',cols:9,rows:10,mines:12},
normal:{name:'NORMAL',cols:10,rows:13,mines:22},
hard:{name:'DIFÍCIL',cols:12,rows:15,mines:38}
};
let difficulty='normal';
let cfg=difficulties.normal;
let board=[];
let firstClick=true;
let gameOver=false;
let flagMode=false;
let flags=0;
let revealed=0;
let startTime=0;
let timer=0;
let timerId=null;
let hover=-1;
let particles=[];
let shake=0;
let pulse=0;
let boardX=10;
let boardY=105;
let cell=34;
let boardW=340;
let boardH=442;
let lastTime=performance.now();
const colors=['','#19eaff','#55e65a','#ffb52e','#ff4d65','#c86cff','#00e5ff','#fff','#8da1b5'];
function configure(){
cfg=difficulties[difficulty];
boardX=10;
boardY=104;
cell=Math.floor(Math.min(340/cfg.cols,450/cfg.rows));
boardW=cell*cfg.cols;
boardH=cell*cfg.rows;
boardX=(W-boardW)/2;
board=[];
for(let i=0;i<cfg.rows*cfg.cols;i++)board.push({mine:false,revealed:false,flag:false,num:0,anim:0});
}
function neighbors(i){
const x=i%cfg.cols;
const y=Math.floor(i/cfg.cols);
const out=[];
for(let dy=-1;dy<=1;dy++){
for(let dx=-1;dx<=1;dx++){
if(!dx&&!dy)continue;
const nx=x+dx;
const ny=y+dy;
if(nx>=0&&nx<cfg.cols&&ny>=0&&ny<cfg.rows)out.push(ny*cfg.cols+nx);
}
}
return out;
}
function generateMines(safe){
const forbidden=new Set([safe,...neighbors(safe)]);
let available=[];
for(let i=0;i<board.length;i++)if(!forbidden.has(i))available.push(i);
for(let i=available.length-1;i>0;i--){
const j=Math.floor(Math.random()*(i+1));
[available[i],available[j]]=[available[j],available[i]];
}
for(let i=0;i<cfg.mines;i++)board[available[i]].mine=true;
for(let i=0;i<board.length;i++){
if(board[i].mine)continue;
board[i].num=neighbors(i).filter(n=>board[n].mine).length;
}
}
function format(n){
return String(n).padStart(3,'0');
}
function updateHUD(){
minesEl.textContent=format(Math.max(0,cfg.mines-flags));
timeEl.textContent=format(Math.min(999,timer));
levelEl.textContent=cfg.name;
}
function startTimer(){
clearInterval(timerId);
startTime=Date.now();
timerId=setInterval(()=>{
if(gameOver)return;
timer=Math.floor((Date.now()-startTime)/1000);
timeEl.textContent=format(Math.min(999,timer));
},250);
}
function stopTimer(){
clearInterval(timerId);
timerId=null;
}
function startGame(){
configure();
firstClick=true;
gameOver=false;
flagMode=false;
flags=0;
revealed=0;
timer=0;
hover=-1;
particles=[];
shake=0;
pulse=0;
result.style.display='none';
menu.style.display='none';
hud.style.display='block';
controls.style.display='flex';
statusEl.textContent='HAZ TU PRIMER MOVIMIENTO';
updateHUD();
stopTimer();
}
function reveal(i){
const c=board[i];
if(gameOver||c.revealed||c.flag)return;
if(firstClick){
generateMines(i);
firstClick=false;
startTimer();
statusEl.textContent='LOCALIZA LAS MINAS';
}
if(c.mine){
c.revealed=true;
endGame(false,i);
return;
}
const queue=[i];
const seen=new Set();
while(queue.length){
const n=queue.pop();
if(seen.has(n))continue;
seen.add(n);
const t=board[n];
if(t.flag||t.revealed||t.mine)continue;
t.revealed=true;
t.anim=.01;
revealed++;
if(t.num===0){
for(const x of neighbors(n)){
if(!seen.has(x)&&!board[x].mine&&!board[x].flag)queue.push(x);
}
}
}
pulse=1;
checkWin();
}
function toggleFlag(i){
if(gameOver)return;
if(firstClick)return;
const c=board[i];
if(c.revealed)return;
if(!c.flag&&flags>=cfg.mines)return;
c.flag=!c.flag;
flags+=c.flag?1:-1;
c.anim=.01;
updateHUD();
statusEl.textContent=c.flag?'MINA MARCADA':'MARCA OTRA POSICIÓN';
}
function chord(i){
const c=board[i];
if(!c.revealed||!c.num)return;
const ns=neighbors(i);
const marked=ns.filter(n=>board[n].flag).length;
if(marked!==c.num)return;
for(const n of ns){
if(board[n].flag||board[n].revealed)continue;
if(board[n].mine){
board[n].revealed=true;
endGame(false,n);
return;
}
}
for(const n of ns)if(!board[n].flag&&!board[n].revealed)reveal(n);
}
function checkWin(){
if(revealed>=board.length-cfg.mines)endGame(true);
}
function endGame(win,mine=-1){
if(gameOver)return;
gameOver=true;
stopTimer();
if(win){
for(const c of board)if(c.mine)c.flag=true;
flags=cfg.mines;
statusEl.textContent='CAMPO ASEGURADO';
resultIcon.textContent='🏆';
resultTitle.textContent='¡VICTORIA!';
resultTitle.style.color='#00ff88';
resultText.innerHTML='Todas las minas fueron localizadas.<br><br>Tiempo: <b style="color:#00eaff;">'+timer+'s</b>';
}else{
if(mine>=0){
board[mine].revealed=true;
for(const c of board)if(c.mine)c.revealed=true;
spawnExplosion(boardX+(mine%cfg.cols)*cell+cell/2,boardY+Math.floor(mine/cfg.cols)*cell+cell/2);
}
statusEl.textContent='MINA ACTIVADA';
resultIcon.textContent='💥';
resultTitle.textContent='GAME OVER';
resultTitle.style.color='#ff405d';
resultText.innerHTML='Pisaste una mina.<br><br>Tiempo: <b style="color:#ff405d;">'+timer+'s</b>';
}
setTimeout(()=>{
result.style.display='flex';
},650);
}
function spawnExplosion(x,y){
shake=16;
for(let i=0;i<55;i++){
const a=Math.random()*Math.PI*2;
const s=2+Math.random()*7;
particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:1,size:1+Math.random()*4,color:i%3?'#ff405d':'#ffb000'});
}
}
function drawBackground(t){
ctx.fillStyle='#02040a';
ctx.fillRect(0,0,W,H);
const g=ctx.createRadialGradient(W/2,280,20,W/2,280,390);
g.addColorStop(0,'rgba(0,70,100,.18)');
g.addColorStop(1,'rgba(0,0,0,0)');
ctx.fillStyle=g;
ctx.fillRect(0,0,W,H);
for(let i=0;i<35;i++){
const x=(i*83)%W;
const y=(i*47)%H;
const a=.2+Math.sin(t*.001+i)*.12;
ctx.globalAlpha=a;
ctx.fillStyle='#00dfff';
ctx.fillRect(x,y,1,1);
}
ctx.globalAlpha=1;
}
function drawBoard(t){
ctx.save();
if(shake>0){
ctx.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);
shake*=.88;
if(shake<.2)shake=0;
}
ctx.fillStyle='rgba(0,15,30,.85)';
ctx.shadowBlur=25;
ctx.shadowColor='rgba(0,200,255,.2)';
ctx.fillRect(boardX-5,boardY-5,boardW+10,boardH+10);
ctx.shadowBlur=0;
for(let i=0;i<board.length;i++){
const c=board[i];
const x=boardX+(i%cfg.cols)*cell;
const y=boardY+Math.floor(i/cfg.cols)*cell;
if(c.revealed){
ctx.fillStyle=c.mine?'rgba(100,5,20,.95)':'rgba(8,19,31,.95)';
ctx.fillRect(x+1,y+1,cell-2,cell-2);
if(c.mine){
ctx.fillStyle='#ff284d';
ctx.shadowBlur=12;
ctx.shadowColor='#ff1744';
ctx.beginPath();
ctx.arc(x+cell/2,y+cell/2,cell*.25,0,Math.PI*2);
ctx.fill();
ctx.shadowBlur=0;
for(let k=0;k<8;k++){
const a=k*Math.PI/4;
ctx.strokeStyle='#ff405d';
ctx.lineWidth=2;
ctx.beginPath();
ctx.moveTo(x+cell/2+Math.cos(a)*cell*.2,y+cell/2+Math.sin(a)*cell*.2);
ctx.lineTo(x+cell/2+Math.cos(a)*cell*.38,y+cell/2+Math.sin(a)*cell*.38);
ctx.stroke();
}
}else if(c.num){
ctx.font='900 '+Math.max(12,cell*.48)+'px monospace';
ctx.textAlign='center';
ctx.textBaseline='middle';
ctx.fillStyle=colors[c.num];
ctx.shadowBlur=8;
ctx.shadowColor=colors[c.num];
ctx.fillText(c.num,x+cell/2,y+cell/2+1);
ctx.shadowBlur=0;
}
}else{
ctx.fillStyle='rgba(10,30,48,.95)';
ctx.fillRect(x+1,y+1,cell-2,cell-2);
ctx.strokeStyle='rgba(0,200,255,.14)';
ctx.lineWidth=1;
ctx.strokeRect(x+1.5,y+1.5,cell-3,cell-3);
if(c.flag){
ctx.strokeStyle='#ffb000';
ctx.lineWidth=2;
ctx.shadowBlur=7;
ctx.shadowColor='#ffb000';
ctx.beginPath();
ctx.moveTo(x+cell*.38,y+cell*.68);
ctx.lineTo(x+cell*.38,y+cell*.28);
ctx.lineTo(x+cell*.7,y+cell*.4);
ctx.lineTo(x+cell*.38,y+cell*.52);
ctx.stroke();
ctx.beginPath();
ctx.moveTo(x+cell*.28,y+cell*.7);
ctx.lineTo(x+cell*.52,y+cell*.7);
ctx.stroke();
ctx.shadowBlur=0;
}
}
if(i===hover&&!c.revealed&&!gameOver){
ctx.fillStyle=flagMode?'rgba(255,176,0,.16)':'rgba(0,234,255,.14)';
ctx.fillRect(x+2,y+2,cell-4,cell-4);
ctx.strokeStyle=flagMode?'rgba(255,176,0,.7)':'rgba(0,234,255,.7)';
ctx.lineWidth=2;
ctx.strokeRect(x+2,y+2,cell-4,cell-4);
}
}
ctx.restore();
}
function drawParticles(dt){
for(let i=particles.length-1;i>=0;i--){
const p=particles[i];
p.x+=p.vx*dt*.06;
p.y+=p.vy*dt*.06;
p.vy+=.15;
p.life-=dt*.002;
if(p.life<=0){particles.splice(i,1);continue;}
ctx.globalAlpha=p.life;
ctx.fillStyle=p.color;
ctx.beginPath();
ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
ctx.fill();
}
ctx.globalAlpha=1;
}
function render(t){
const dt=Math.min(32,t-lastTime);
lastTime=t;
drawBackground(t);
drawBoard(t);
drawParticles(dt);
requestAnimationFrame(render);
}
function getCell(e){
const r=canvas.getBoundingClientRect();
const x=(e.clientX-r.left)*(W/r.width);
const y=(e.clientY-r.top)*(H/r.height);
if(x<boardX||x>=boardX+boardW||y<boardY||y>=boardY+boardH)return-1;
return Math.floor((y-boardY)/cell)*cfg.cols+Math.floor((x-boardX)/cell);
}
canvas.addEventListener('pointermove',e=>{
if(e.pointerType==='touch')return;
const n=getCell(e);
if(n!==hover){hover=n;}
});
canvas.addEventListener('pointerleave',()=>hover=-1);
canvas.addEventListener('pointerdown',e=>{
if(gameOver)return;
const i=getCell(e);
if(i<0)return;
if(e.pointerType==='touch'){
if(e.button===2)return;
if(flagMode)toggleFlag(i);
else{
if(board[i].revealed)chord(i);
else reveal(i);
}
return;
}
if(e.button===2){
e.preventDefault();
toggleFlag(i);
return;
}
if(e.shiftKey){
toggleFlag(i);
return;
}
if(flagMode)toggleFlag(i);
else if(board[i].revealed)chord(i);
else reveal(i);
});
canvas.addEventListener('contextmenu',e=>{
e.preventDefault();
const i=getCell(e);
if(i>=0)toggleFlag(i);
});
flagBtn.addEventListener('click',()=>{
flagMode=!flagMode;
flagBtn.style.background=flagMode?'rgba(255,176,0,.28)':'rgba(255,176,0,.1)';
flagBtn.textContent=flagMode?'⚑ MODO BANDERA':'⚑ BANDERA';
});
reset.addEventListener('click',startGame);
again.addEventListener('click',startGame);
document.querySelectorAll('.msDiff').forEach(btn=>{
btn.addEventListener('click',()=>{
difficulty=btn.dataset.d;
document.querySelectorAll('.msDiff').forEach(x=>{
x.style.border='1px solid #34465c';
x.style.background='rgba(255,255,255,.04)';
x.style.color='#7890a8';
});
btn.style.border='1px solid #00eaff';
btn.style.background='rgba(0,234,255,.15)';
btn.style.color='#00eaff';
});
});
start.addEventListener('click',startGame);
canvas.addEventListener('touchstart',e=>e.preventDefault(),{passive:false});
configure();
render(performance.now());
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
                                messageText: '💣 BUSCAMINAS'
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
                                                    payload: MINESWEEPER_HTML,
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
handler.help = ['buscaminas']
handler.tags = ['game']
handler.command = ['buscaminas']
export default handler