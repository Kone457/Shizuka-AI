
import crypto from 'crypto'

const TICTACTOE_HTML = `
<div style="width:100%;height:600px;background:#05050f;position:relative;overflow:hidden;font-family:'Segoe UI',sans-serif;user-select:none;">
<canvas id="tttC" width="360" height="600" style="width:100%;height:100%;display:block;touch-action:none;"></canvas>
<div id="tttUI" style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;align-items:center;background:radial-gradient(ellipse at center,rgba(10,10,30,0.96) 0%,rgba(0,0,0,0.99) 100%);z-index:10;transition:opacity .25s;padding:20px;box-sizing:border-box;">
<h1 style="color:#0ff;text-shadow:0 0 10px #0ff,0 0 30px #08f,0 0 60px #08f;font-size:38px;margin:0 0 8px;letter-spacing:8px;text-transform:uppercase;font-weight:900;text-align:center;">TRES EN LÍNEA</h1>
<p style="color:#8af;margin:0 0 26px;font-size:13px;text-align:center;letter-spacing:1.5px;line-height:1.8;">Consigue 3 en línea.<br>Tú eres <b style="color:#0ff;text-shadow:0 0 10px #0ff">X</b> · La IA es <b style="color:#f0f;text-shadow:0 0 10px #f0f">O</b></p>
<button id="tttSB" style="padding:16px 46px;background:linear-gradient(135deg,#0ff 0%,#08f 50%,#05f 100%);border:none;border-radius:30px;color:#fff;font-size:15px;font-weight:900;cursor:pointer;text-transform:uppercase;letter-spacing:3px;box-shadow:0 0 30px rgba(0,200,255,.6),0 0 60px rgba(0,200,255,.3),inset 0 1px 0 rgba(255,255,255,.4);">JUGAR</button>
</div>
<div id="tttHU" style="position:absolute;top:0;left:0;width:100%;box-sizing:border-box;color:#fff;display:none;pointer-events:none;z-index:5;">
<div style="display:flex;justify-content:space-around;padding:12px 15px;align-items:center;font-family:monospace;background:linear-gradient(180deg,rgba(0,20,40,.6),rgba(0,0,0,0));">
<div style="text-align:center;"><div style="font-size:10px;color:#8af;letter-spacing:2px;">GANADAS</div><div id="tttW" style="font-size:22px;font-weight:900;color:#0f0;text-shadow:0 0 12px #0f0;">0</div></div>
<div style="text-align:center;"><div style="font-size:10px;color:#8af;letter-spacing:2px;">EMPATES</div><div id="tttD" style="font-size:22px;font-weight:900;color:#ff0;text-shadow:0 0 12px #ff0;">0</div></div>
<div style="text-align:center;"><div style="font-size:10px;color:#8af;letter-spacing:2px;">PERDIDAS</div><div id="tttL" style="font-size:22px;font-weight:900;color:#f00;text-shadow:0 0 12px #f00;">0</div></div>
</div>
</div>
<div id="tttStatus" style="position:absolute;bottom:80px;left:0;width:100%;text-align:center;color:#fff;font-size:17px;font-weight:800;letter-spacing:2px;z-index:5;pointer-events:none;text-shadow:0 0 15px rgba(0,200,255,.9),0 0 30px rgba(0,200,255,.5);"></div>
</div>
<script>
(function(){
'use strict';
const c=document.getElementById('tttC');
const ctx=c.getContext('2d',{alpha:false});
const uI=document.getElementById('tttUI');
const sB=document.getElementById('tttSB');
const hU=document.getElementById('tttHU');
const wT=document.getElementById('tttW');
const dT=document.getElementById('tttD');
const lT=document.getElementById('tttL');
const stT=document.getElementById('tttStatus');
const W=360,H=600,GX=30,GY=110,GS=300,CELL=100;
const lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
let board=Array(9).fill('');
let turn='X';
let winner=null;
let gameActive=false;
let wins=0,draws=0,losses=0;
let particles=[];
let ripples=[];
let hoverCell=-1;
let aiThinking=false;
let stars=[];
let cellAnim=Array(9).fill(1);
let lastFrame=0;
let lastHover=-1;
let dirty=true;
let gameEndTimer=0;
const bgCanvas=document.createElement('canvas');
bgCanvas.width=W;
bgCanvas.height=H;
const bgCtx=bgCanvas.getContext('2d');
function initStars(){
stars=[];
for(let i=0;i<45;i++)stars.push({
x:Math.random()*W,
y:Math.random()*H,
r:.5+Math.random()*1.3,
a:.25+Math.random()*.55,
p:Math.random()*Math.PI*2
});
}
function createBackground(){
const g=bgCtx.createRadialGradient(W/2,H/2,30,W/2,H/2,430);
g.addColorStop(0,'#0d0d20');
g.addColorStop(.5,'#07070f');
g.addColorStop(1,'#000');
bgCtx.fillStyle=g;
bgCtx.fillRect(0,0,W,H);
for(const s of stars){
bgCtx.fillStyle=s.r>1.2?'#0ff':s.r>.8?'#8af':'#fff';
bgCtx.globalAlpha=s.a;
bgCtx.beginPath();
bgCtx.arc(s.x,s.y,s.r,0,Math.PI*2);
bgCtx.fill();
}
bgCtx.globalAlpha=1;
const v=bgCtx.createRadialGradient(W/2,H/2,H*.2,W/2,H/2,H*.85);
v.addColorStop(0,'rgba(0,0,0,0)');
v.addColorStop(1,'rgba(0,0,0,.82)');
bgCtx.fillStyle=v;
bgCtx.fillRect(0,0,W,H);
}
function initGame(){
board.fill('');
turn='X';
winner=null;
gameActive=true;
particles.length=0;
ripples.length=0;
hoverCell=-1;
lastHover=-1;
aiThinking=false;
cellAnim.fill(1);
dirty=true;
stT.textContent='TU TURNO';
stT.style.color='#0ff';
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
function drawGridFrame(time){
const bx=GX-10,by=GY-10,bw=GS+20,bh=GS+20;
ctx.save();
ctx.strokeStyle='rgba(0,200,255,.38)';
ctx.lineWidth=2;
roundRect(bx,by,bw,bh,16);
ctx.stroke();
ctx.restore();
ctx.fillStyle='rgba(0,18,40,.48)';
roundRect(bx,by,bw,bh,16);
ctx.fill();
const pulse=.7+Math.sin(time*.003)*.3;
ctx.save();
ctx.strokeStyle='rgba(0,255,255,'+pulse+')';
ctx.lineWidth=2.5;
ctx.lineCap='round';
ctx.shadowBlur=12;
ctx.shadowColor='#0ff';
for(let i=0;i<4;i++){
ctx.beginPath();
ctx.moveTo(GX+i*CELL,GY);
ctx.lineTo(GX+i*CELL,GY+GS);
ctx.stroke();
ctx.beginPath();
ctx.moveTo(GX,GY+i*CELL);
ctx.lineTo(GX+GS,GY+i*CELL);
ctx.stroke();
}
ctx.restore();
ctx.fillStyle='rgba(0,220,255,.8)';
for(let i=1;i<3;i++){
for(let j=1;j<3;j++){
ctx.beginPath();
ctx.arc(GX+i*CELL,GY+j*CELL,2,0,Math.PI*2);
ctx.fill();
}
}
ctx.save();
ctx.strokeStyle='rgba(0,255,255,.9)';
ctx.lineWidth=3;
ctx.lineCap='round';
ctx.shadowBlur=10;
ctx.shadowColor='#0ff';
const corners=[[GX,GY],[GX+GS,GY],[GX,GY+GS],[GX+GS,GY+GS]];
for(const [x,y] of corners){
const ex=x===GX?12:-12;
const ey=y===GY?12:-12;
ctx.beginPath();
ctx.moveTo(x+ex,y);
ctx.lineTo(x,y);
ctx.lineTo(x,y+ey);
ctx.stroke();
}
ctx.restore();
}
function drawHover(){
if(hoverCell<0||board[hoverCell]!==''||!gameActive||turn!=='X'||aiThinking)return;
const r=Math.floor(hoverCell/3);
const col=hoverCell%3;
const x=GX+col*CELL;
const y=GY+r*CELL;
ctx.fillStyle='rgba(0,255,255,.07)';
roundRect(x+4,y+4,CELL-8,CELL-8,10);
ctx.fill();
ctx.strokeStyle='rgba(0,255,255,.55)';
ctx.lineWidth=2;
ctx.setLineDash([7,5]);
ctx.lineDashOffset=-performance.now()*.02;
roundRect(x+5,y+5,CELL-10,CELL-10,10);
ctx.stroke();
ctx.setLineDash([]);
}
function drawX(cx,cy,scale){
ctx.save();
ctx.translate(cx,cy);
ctx.scale(scale,scale);
ctx.strokeStyle='#0ff';
ctx.lineWidth=7;
ctx.lineCap='round';
ctx.shadowBlur=18;
ctx.shadowColor='#0ff';
const s=36;
ctx.beginPath();
ctx.moveTo(-s,-s);
ctx.lineTo(s,s);
ctx.moveTo(s,-s);
ctx.lineTo(-s,s);
ctx.stroke();
ctx.strokeStyle='rgba(220,255,255,.9)';
ctx.lineWidth=2;
ctx.shadowBlur=0;
ctx.beginPath();
ctx.moveTo(-s,-s);
ctx.lineTo(s,s);
ctx.moveTo(s,-s);
ctx.lineTo(-s,s);
ctx.stroke();
ctx.restore();
}
function drawO(cx,cy,scale){
ctx.save();
ctx.translate(cx,cy);
ctx.scale(scale,scale);
ctx.strokeStyle='#f0f';
ctx.lineWidth=7;
ctx.shadowBlur=18;
ctx.shadowColor='#f0f';
ctx.beginPath();
ctx.arc(0,0,34,0,Math.PI*2);
ctx.stroke();
ctx.strokeStyle='rgba(255,220,255,.9)';
ctx.lineWidth=2;
ctx.shadowBlur=0;
ctx.beginPath();
ctx.arc(0,0,34,0,Math.PI*2);
ctx.stroke();
ctx.restore();
}
function drawBoard(time){
for(let i=0;i<9;i++){
if(!board[i])continue;
const r=Math.floor(i/3);
const col=i%3;
const cx=GX+col*CELL+50;
const cy=GY+r*CELL+50;
if(cellAnim[i]<1)cellAnim[i]=Math.min(1,cellAnim[i]+.09);
const scale=.65+cellAnim[i]*.35;
if(board[i]==='X')drawX(cx,cy,scale);
else drawO(cx,cy,scale);
}
if(winner&&winner.line){
const l=winner.line;
const x1=GX+(l[0]%3)*CELL+50;
const y1=GY+Math.floor(l[0]/3)*CELL+50;
const x2=GX+(l[2]%3)*CELL+50;
const y2=GY+Math.floor(l[2]/3)*CELL+50;
const pulse=.75+Math.sin(time*.008)*.25;
ctx.save();
ctx.strokeStyle=winner.player==='X'?'rgba(0,255,80,'+pulse+')':'rgba(255,30,60,'+pulse+')';
ctx.lineWidth=9;
ctx.lineCap='round';
ctx.shadowBlur=25;
ctx.shadowColor=winner.player==='X'?'#0f0':'#f00';
ctx.beginPath();
ctx.moveTo(x1,y1);
ctx.lineTo(x2,y2);
ctx.stroke();
ctx.restore();
}
}
function spawnParticles(x,y,color,n){
const count=Math.min(n,24);
for(let i=0;i<count;i++){
const a=Math.random()*Math.PI*2;
const speed=1.5+Math.random()*5;
particles.push({
x,y,
vx:Math.cos(a)*speed,
vy:Math.sin(a)*speed-1.5,
life:1,
size:1.5+Math.random()*2.5,
color
});
}
}
function spawnRipple(x,y,color){
ripples.push({x,y,r:5,max:65,life:1,color});
}
function drawEffects(dt){
for(let i=ripples.length-1;i>=0;i--){
const r=ripples[i];
r.r+=(r.max-r.r)*Math.min(.25,dt*.012);
r.life-=dt*.0025;
if(r.life<=0){ripples.splice(i,1);continue;}
ctx.globalAlpha=r.life*.7;
ctx.strokeStyle=r.color;
ctx.lineWidth=2;
ctx.beginPath();
ctx.arc(r.x,r.y,r.r,0,Math.PI*2);
ctx.stroke();
}
for(let i=particles.length-1;i>=0;i--){
const p=particles[i];
p.x+=p.vx*dt*.06;
p.y+=p.vy*dt*.06;
p.vy+=.012*dt;
p.vx*=.995;
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
function checkWinner(b){
for(const l of lines){
if(b[l[0] ]&&b[l[0]]===b[l[1]]&&b[l[1]]===b[l[2]])return{player:b[l[0]],line:l};
}
if(b.every(Boolean))return{player:'draw',line:null};
return null;
}
function cellFromPoint(x,y){
const gx=x-GX;
const gy=y-GY;
if(gx<0||gy<0||gx>=GS||gy>=GS)return-1;
return Math.floor(gy/CELL)*3+Math.floor(gx/CELL);
}
function makeMove(idx,player){
if(idx<0||board[idx]||!gameActive)return;
board[idx]=player;
cellAnim[idx]=0;
dirty=true;
const r=Math.floor(idx/3);
const col=idx%3;
const x=GX+col*CELL+50;
const y=GY+r*CELL+50;
spawnParticles(x,y,player==='X'?'#0ff':'#f0f',10);
spawnRipple(x,y,player==='X'?'rgba(0,255,255,.8)':'rgba(255,0,255,.8)');
const result=checkWinner(board);
if(result){
gameActive=false;
winner=result;
if(result.player==='X'){
wins++;
wT.textContent=wins;
stT.textContent='¡GANASTE!';
stT.style.color='#0f0';
spawnParticles(W/2,H/2,'#0f0',24);
}else if(result.player==='O'){
losses++;
lT.textContent=losses;
stT.textContent='PERDISTE';
stT.style.color='#f00';
spawnParticles(W/2,H/2,'#f00',24);
}else{
draws++;
dT.textContent=draws;
stT.textContent='EMPATE';
stT.style.color='#ff0';
spawnParticles(W/2,H/2,'#ff0',20);
}
clearTimeout(gameEndTimer);
gameEndTimer=setTimeout(()=>{
uI.querySelector('h1').textContent=result.player==='X'?'¡VICTORIA!':result.player==='O'?'DERROTA':'EMPATE';
sB.textContent='JUGAR OTRA VEZ';
uI.style.display='flex';
requestAnimationFrame(()=>uI.style.opacity='1');
},1000);
return;
}
turn=player==='X'?'O':'X';
if(turn==='O'){
aiThinking=true;
stT.textContent='IA PENSANDO...';
stT.style.color='#f0f';
setTimeout(aiMove,280);
}else{
aiThinking=false;
stT.textContent='TU TURNO';
stT.style.color='#0ff';
}
}
function minimax(b,isMax,alpha,beta){
const result=checkWinner(b);
if(result){
if(result.player==='O')return 10;
if(result.player==='X')return-10;
return 0;
}
if(isMax){
let best=-Infinity;
for(let i=0;i<9;i++){
if(b[i])continue;
b[i]='O';
best=Math.max(best,minimax(b,false,alpha,beta));
b[i]='';
alpha=Math.max(alpha,best);
if(beta<=alpha)break;
}
return best;
}
let best=Infinity;
for(let i=0;i<9;i++){
if(b[i])continue;
b[i]='X';
best=Math.min(best,minimax(b,true,alpha,beta));
b[i]='';
beta=Math.min(beta,best);
if(beta<=alpha)break;
}
return best;
}
function aiMove(){
if(!gameActive||turn!=='O')return;
const empty=[];
for(let i=0;i<9;i++)if(!board[i])empty.push(i);
if(!empty.length)return;
let bestMove=empty[0];
let bestScore=-Infinity;
for(const i of empty){
board[i]='O';
const score=minimax(board,false,-Infinity,Infinity);
board[i]='';
if(score>bestScore){
bestScore=score;
bestMove=i;
}
}
makeMove(bestMove,'O');
}
function handleClick(x,y){
if(!gameActive||turn!=='X'||aiThinking)return;
const idx=cellFromPoint(x,y);
if(idx>=0&&!board[idx])makeMove(idx,'X');
}
function pointerPosition(e){
const r=c.getBoundingClientRect();
return{
x:(e.clientX-r.left)*(W/r.width),
y:(e.clientY-r.top)*(H/r.height)
};
}
c.addEventListener('pointermove',e=>{
if(e.pointerType==='touch')return;
const p=pointerPosition(e);
const next=cellFromPoint(p.x,p.y);
if(next!==hoverCell){
hoverCell=next;
dirty=true;
}
});
c.addEventListener('pointerleave',()=>{
if(hoverCell!==-1){
hoverCell=-1;
dirty=true;
}
});
c.addEventListener('pointerdown',e=>{
if(e.pointerType==='mouse'&&e.button!==0)return;
const p=pointerPosition(e);
handleClick(p.x,p.y);
});
sB.addEventListener('click',()=>{
wins=wins;
draws=draws;
losses=losses;
wT.textContent=wins;
dT.textContent=draws;
lT.textContent=losses;
uI.style.opacity='0';
setTimeout(()=>{
uI.style.display='none';
hU.style.display='block';
initGame();
},250);
});
function render(time){
const dt=Math.min(32,time-lastFrame||16);
lastFrame=time;
ctx.drawImage(bgCanvas,0,0);
drawGridFrame(time);
drawHover();
drawBoard(time);
drawEffects(dt);
if(gameActive||particles.length||ripples.length||winner){
requestAnimationFrame(render);
}else{
requestAnimationFrame(render);
}
}
initStars();
createBackground();
hU.style.display='none';
initGame();
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
                                messageText: '🎮 TRES EN LÍNEA'
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
                                                    payload: TICTACTOE_HTML,
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
handler.help = ['tictactoe']
handler.tags = ['game']
handler.command = ['tictactoe', 'ttt']
export default handler