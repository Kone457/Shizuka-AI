import crypto from 'crypto'

const TICTACTOE_HTML = `
<div style="width:100%;height:600px;background:#0a0a1a;position:relative;overflow:hidden;font-family:'Segoe UI',sans-serif;user-select:none;">
<canvas id="tttC" width="360" height="600" style="width:100%;height:100%;display:block;"></canvas>
<div id="tttUI" style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;align-items:center;background:rgba(0,0,0,0.92);z-index:10;transition:opacity 0.3s;padding:20px;box-sizing:border-box;">
<h1 style="color:#0ff;text-shadow:0 0 20px #0ff,0 0 40px #08f;font-size:36px;margin:0 0 8px;letter-spacing:6px;text-transform:uppercase;font-weight:900;text-align:center;">TRES EN LÍNEA</h1>
<p style="color:#8af;margin:0 0 22px;font-size:13px;text-align:center;letter-spacing:1px;line-height:1.7;">Consigue 3 en línea para ganar.<br>Tú eres <b style="color:#0ff">X</b> · La IA es <b style="color:#f0f">O</b></p>
<button id="tttSB" style="padding:14px 40px;background:linear-gradient(45deg,#0ff,#08f);border:none;border-radius:30px;color:#fff;font-size:15px;font-weight:900;cursor:pointer;text-transform:uppercase;letter-spacing:2px;box-shadow:0 0 25px rgba(0,200,255,0.5);">JUGAR</button>
</div>
<div id="tttHU" style="position:absolute;top:0;left:0;width:100%;box-sizing:border-box;color:#fff;display:none;pointer-events:none;z-index:5;">
<div style="display:flex;justify-content:space-around;padding:10px 15px;align-items:center;font-family:monospace;">
<div style="text-align:center;">
<div style="font-size:10px;color:#8af;letter-spacing:2px;">GANADAS</div>
<div id="tttW" style="font-size:20px;font-weight:900;color:#0f0;text-shadow:0 0 8px #0f0;">0</div>
</div>
<div style="text-align:center;">
<div style="font-size:10px;color:#8af;letter-spacing:2px;">EMPATES</div>
<div id="tttD" style="font-size:20px;font-weight:900;color:#ff0;text-shadow:0 0 8px #ff0;">0</div>
</div>
<div style="text-align:center;">
<div style="font-size:10px;color:#8af;letter-spacing:2px;">PERDIDAS</div>
<div id="tttL" style="font-size:20px;font-weight:900;color:#f00;text-shadow:0 0 8px #f00;">0</div>
</div>
</div>
</div>
<div id="tttStatus" style="position:absolute;bottom:80px;left:0;width:100%;text-align:center;color:#fff;font-size:16px;font-weight:700;letter-spacing:1px;z-index:5;pointer-events:none;text-shadow:0 0 10px rgba(0,200,255,0.8);"></div>
</div>
<script>
(function(){
const c=document.getElementById('tttC'),ctx=c.getContext('2d');
const uI=document.getElementById('tttUI'),sB=document.getElementById('tttSB'),hU=document.getElementById('tttHU');
const wT=document.getElementById('tttW'),dT=document.getElementById('tttD'),lT=document.getElementById('tttL');
const stT=document.getElementById('tttStatus');
const W=c.width,H=c.height;
const GX=30,GY=100,GS=300,CELL=100;
let board,turn,winner,gameActive,wins,draws,losses,anim,particles,hoverCell,aiThinking,aiTimer;
function initGame(){
board=Array(9).fill('');
turn='X';winner=null;gameActive=true;particles=[];hoverCell=-1;aiThinking=false;
stT.innerText='TU TURNO';
}
function drawGrid(){
ctx.clearRect(0,0,W,H);
const bg=ctx.createLinearGradient(0,0,0,H);
bg.addColorStop(0,'#0a0a1a');bg.addColorStop(1,'#050510');
ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
for(let i=0;i<40;i++){
const sx=(i*137.5)%W,sy=(i*97.3+Date.now()*0.02)%H;
ctx.globalAlpha=0.1+((i*7)%10)/30;
ctx.fillStyle='#0ff';
ctx.fillRect(sx,sy,1.5,1.5);
}
ctx.globalAlpha=1;
ctx.strokeStyle='#0ff';ctx.lineWidth=3;
ctx.shadowBlur=15;ctx.shadowColor='#0ff';
for(let i=0;i<4;i++){
ctx.beginPath();
ctx.moveTo(GX+i*CELL,GY);ctx.lineTo(GX+i*CELL,GY+GS);
ctx.stroke();
ctx.beginPath();
ctx.moveTo(GX,GY+i*CELL);ctx.lineTo(GX+GS,GY+i*CELL);
ctx.stroke();
}
ctx.shadowBlur=0;
if(hoverCell>=0&&board[hoverCell]===''&&gameActive&&turn==='X'&&!aiThinking){
const r=Math.floor(hoverCell/3),col=hoverCell%3;
const x=GX+col*CELL,y=GY+r*CELL;
ctx.fillStyle='rgba(0,255,255,0.15)';
ctx.fillRect(x+4,y+4,CELL-8,CELL-8);
}
}
function drawX(cx,cy,size,alpha){
ctx.save();
ctx.globalAlpha=alpha;
ctx.strokeStyle='#0ff';ctx.lineWidth=6;ctx.lineCap='round';
ctx.shadowBlur=20;ctx.shadowColor='#0ff';
const s=size/2-10;
ctx.beginPath();
ctx.moveTo(cx-s,cy-s);ctx.lineTo(cx+s,cy+s);
ctx.moveTo(cx+s,cy-s);ctx.lineTo(cx-s,cy+s);
ctx.stroke();
ctx.restore();
}
function drawO(cx,cy,size,alpha){
ctx.save();
ctx.globalAlpha=alpha;
ctx.strokeStyle='#f0f';ctx.lineWidth=6;ctx.lineCap='round';
ctx.shadowBlur=20;ctx.shadowColor='#f0f';
ctx.beginPath();
ctx.arc(cx,cy,size/2-12,0,Math.PI*2);
ctx.stroke();
ctx.restore();
}
function drawBoard(){
for(let i=0;i<9;i++){
const r=Math.floor(i/3),col=i%3;
const cx=GX+col*CELL+CELL/2,cy=GY+r*CELL+CELL/2;
if(board[i]==='X')drawX(cx,cy,CELL,1);
else if(board[i]==='O')drawO(cx,cy,CELL,1);
}
if(winner){
const line=winner.line;
const r1=Math.floor(line[0]/3),c1=line[0]%3;
const r2=Math.floor(line[2]/3),c2=line[2]%3;
const x1=GX+c1*CELL+CELL/2,y1=GY+r1*CELL+CELL/2;
const x2=GX+c2*CELL+CELL/2,y2=GY+r2*CELL+CELL/2;
ctx.save();
ctx.strokeStyle=winner.player==='X'?'#0f0':'#f00';
ctx.lineWidth=8;ctx.lineCap='round';
ctx.shadowBlur=25;ctx.shadowColor=winner.player==='X'?'#0f0':'#f00';
ctx.beginPath();
ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);
ctx.stroke();
ctx.restore();
}
}
function drawParticles(){
for(let i=particles.length-1;i>=0;i--){
const p=particles[i];
p.x+=p.vx;p.y+=p.vy;p.vy+=0.15;p.life-=0.02;
if(p.life<=0){particles.splice(i,1);continue;}
ctx.globalAlpha=p.life;
ctx.fillStyle=p.color;
ctx.fillRect(p.x,p.y,p.size,p.size);
}
ctx.globalAlpha=1;
}
function spawnParticles(x,y,color,n){
for(let i=0;i<n;i++)particles.push({
x,y,vx:(Math.random()-0.5)*6,vy:(Math.random()-0.5)*6-2,
life:1,color,size:2+Math.random()*3
});
}
function checkWinner(b){
const lines=[
[0,1,2],[3,4,5],[6,7,8],
[0,3,6],[1,4,7],[2,5,8],
[0,4,8],[2,4,6]
];
for(const l of lines){
if(b[l[0]]&&b[l[0]]===b[l[1]]&&b[l[1]]===b[l[2]]){
return {player:b[l[0]],line:l};
}
}
if(b.every(c=>c))return {player:'draw',line:null};
return null;
}
function cellFromPoint(px,py){
const x=px-GX,y=py-GY;
if(x<0||x>GS||y<0||y>GS)return -1;
const col=Math.floor(x/CELL),r=Math.floor(y/CELL);
return r*3+col;
}
function makeMove(idx,player){
board[idx]=player;
const r=Math.floor(idx/3),col=idx%3;
const cx=GX+col*CELL+CELL/2,cy=GY+r*CELL+CELL/2;
spawnParticles(cx,cy,player==='X'?'#0ff':'#f0f',10);
const result=checkWinner(board);
if(result){
gameActive=false;
winner=result;
if(result.player==='X'){
wins++;wT.innerText=wins;
stT.innerText='¡GANASTE!';
stT.style.color='#0f0';
spawnParticles(W/2,H/2,'#0f0',30);
}else if(result.player==='O'){
losses++;lT.innerText=losses;
stT.innerText='PERDISTE';
stT.style.color='#f00';
}else{
draws++;dT.innerText=draws;
stT.innerText='EMPATE';
stT.style.color='#ff0';
}
setTimeout(()=>{
if(gameActive===false){
sB.style.display='block';
uI.style.display='flex';uI.style.opacity=1;
uI.querySelector('h1').innerText=result.player==='X'?'¡VICTORIA!':result.player==='O'?'DERROTA':'EMPATE';
sB.innerText='JUGAR OTRA VEZ';
}
},1200);
}else{
turn=player==='X'?'O':'X';
if(turn==='O'){
aiThinking=true;
stT.innerText='IA PENSANDO...';
stT.style.color='#f0f';
aiTimer=setTimeout(()=>aiMove(),500);
}else{
aiThinking=false;
stT.innerText='TU TURNO';
stT.style.color='#fff';
}
}
}
function minimax(b,depth,isMax){
const res=checkWinner(b);
if(res){
if(res.player==='O')return 10-depth;
if(res.player==='X')return depth-10;
return 0;
}
if(isMax){
let best=-Infinity;
for(let i=0;i<9;i++){
if(b[i]===''){
b[i]='O';
best=Math.max(best,minimax(b,depth+1,false));
b[i]='';
}
}
return best;
}else{
let best=Infinity;
for(let i=0;i<9;i++){
if(b[i]===''){
b[i]='X';
best=Math.min(best,minimax(b,depth+1,true));
b[i]='';
}
}
return best;
}
}
function aiMove(){
if(!gameActive)return;
let bestScore=-Infinity,bestMove=-1;
const empty=board.map((v,i)=>v===''?i:-1).filter(i=>i>=0);
if(empty.length===9){
bestMove=4;
}else{
for(const i of empty){
board[i]='O';
const score=minimax(board,0,false);
board[i]='';
if(score>bestScore){bestScore=score;bestMove=i;}
}
}
if(bestMove>=0)makeMove(bestMove,'O');
aiThinking=false;
}
function handleClick(px,py){
if(!gameActive||turn!=='X'||aiThinking)return;
const idx=cellFromPoint(px,py);
if(idx>=0&&board[idx]==='')makeMove(idx,'X');
}
c.addEventListener('mousemove',e=>{
const rect=c.getBoundingClientRect();
const px=(e.clientX-rect.left)*(W/rect.width);
const py=(e.clientY-rect.top)*(H/rect.height);
hoverCell=cellFromPoint(px,py);
});
c.addEventListener('mouseleave',()=>{hoverCell=-1;});
c.addEventListener('click',e=>{
const rect=c.getBoundingClientRect();
const px=(e.clientX-rect.left)*(W/rect.width);
const py=(e.clientY-rect.top)*(H/rect.height);
handleClick(px,py);
});
c.addEventListener('touchstart',e=>{
e.preventDefault();
const rect=c.getBoundingClientRect();
const t=e.touches[0];
const px=(t.clientX-rect.left)*(W/rect.width);
const py=(t.clientY-rect.top)*(H/rect.height);
handleClick(px,py);
},{passive:false});
function loop(){
drawGrid();
drawBoard();
drawParticles();
anim=requestAnimationFrame(loop);
}
function start(){
wins=0;draws=0;losses=0;
wT.innerText=0;dT.innerText=0;lT.innerText=0;
initGame();
hU.style.display='block';
uI.style.opacity=0;
setTimeout(()=>uI.style.display='none',300);
if(!anim)loop();
}
sB.addEventListener('click',start);
drawGrid();
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