import crypto from 'crypto'

const TICTACTOE_HTML = `
<div style="width:100%;height:600px;background:#05050f;position:relative;overflow:hidden;font-family:'Segoe UI',sans-serif;user-select:none;">
<canvas id="tttC" width="360" height="600" style="width:100%;height:100%;display:block;touch-action:none;"></canvas>
<div id="tttUI" style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;align-items:center;background:radial-gradient(ellipse at center,rgba(10,10,30,0.96) 0%,rgba(0,0,0,0.99) 100%);z-index:10;transition:opacity 0.4s;padding:20px;box-sizing:border-box;">
<h1 style="color:#0ff;text-shadow:0 0 10px #0ff,0 0 30px #08f,0 0 60px #08f;font-size:38px;margin:0 0 8px;letter-spacing:8px;text-transform:uppercase;font-weight:900;text-align:center;animation:glow 2s ease-in-out infinite alternate;">TRES EN LÍNEA</h1>
<style>@keyframes glow{from{text-shadow:0 0 10px #0ff,0 0 30px #08f,0 0 60px #08f}to{text-shadow:0 0 20px #0ff,0 0 50px #08f,0 0 90px #0ff}}</style>
<p style="color:#8af;margin:0 0 26px;font-size:13px;text-align:center;letter-spacing:1.5px;line-height:1.8;">Consigue 3 en línea.<br>Tú eres <b style="color:#0ff;text-shadow:0 0 10px #0ff">X</b> · La IA es <b style="color:#f0f;text-shadow:0 0 10px #f0f">O</b></p>
<button id="tttSB" style="padding:16px 46px;background:linear-gradient(135deg,#0ff 0%,#08f 50%,#05f 100%);border:none;border-radius:30px;color:#fff;font-size:15px;font-weight:900;cursor:pointer;text-transform:uppercase;letter-spacing:3px;box-shadow:0 0 30px rgba(0,200,255,0.6),0 0 60px rgba(0,200,255,0.3),inset 0 1px 0 rgba(255,255,255,0.4);transition:transform 0.15s,box-shadow 0.3s;">JUGAR</button>
</div>
<div id="tttHU" style="position:absolute;top:0;left:0;width:100%;box-sizing:border-box;color:#fff;display:none;pointer-events:none;z-index:5;">
<div style="display:flex;justify-content:space-around;padding:12px 15px;align-items:center;font-family:monospace;background:linear-gradient(180deg,rgba(0,20,40,0.6),rgba(0,0,0,0));">
<div style="text-align:center;">
<div style="font-size:10px;color:#8af;letter-spacing:2px;">GANADAS</div>
<div id="tttW" style="font-size:22px;font-weight:900;color:#0f0;text-shadow:0 0 12px #0f0;">0</div>
</div>
<div style="text-align:center;">
<div style="font-size:10px;color:#8af;letter-spacing:2px;">EMPATES</div>
<div id="tttD" style="font-size:22px;font-weight:900;color:#ff0;text-shadow:0 0 12px #ff0;">0</div>
</div>
<div style="text-align:center;">
<div style="font-size:10px;color:#8af;letter-spacing:2px;">PERDIDAS</div>
<div id="tttL" style="font-size:22px;font-weight:900;color:#f00;text-shadow:0 0 12px #f00;">0</div>
</div>
</div>
</div>
<div id="tttStatus" style="position:absolute;bottom:80px;left:0;width:100%;text-align:center;color:#fff;font-size:17px;font-weight:800;letter-spacing:2px;z-index:5;pointer-events:none;text-shadow:0 0 15px rgba(0,200,255,0.9),0 0 30px rgba(0,200,255,0.5);"></div>
</div>
<script>
(function(){
const c=document.getElementById('tttC'),ctx=c.getContext('2d');
const uI=document.getElementById('tttUI'),sB=document.getElementById('tttSB'),hU=document.getElementById('tttHU');
const wT=document.getElementById('tttW'),dT=document.getElementById('tttD'),lT=document.getElementById('tttL');
const stT=document.getElementById('tttStatus');
const W=c.width,H=c.height;
const GX=30,GY=110,GS=300,CELL=100;
let board,turn,winner,gameActive,wins,draws,losses,particles,hoverCell,aiThinking,stars,ripples,pulseTime,cellAnim;
function initStars(){stars=[];for(let i=0;i<70;i++)stars.push({x:Math.random()*W,y:Math.random()*H,z:Math.random()*2+0.3,tw:Math.random()*Math.PI*2});}
function initGame(){
board=Array(9).fill('');
turn='X';winner=null;gameActive=true;particles=[];ripples=[];hoverCell=-1;aiThinking=false;cellAnim=Array(9).fill(0);
stT.innerText='TU TURNO';
stT.style.color='#0ff';
}
function roundRect(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();}
function drawBackground(){
const bg=ctx.createRadialGradient(W/2,H/2,50,W/2,H/2,W*0.9);
bg.addColorStop(0,'#0d0d20');bg.addColorStop(0.5,'#07070f');bg.addColorStop(1,'#000');
ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
for(const s of stars){
s.tw+=0.03;
const tw=0.3+Math.sin(s.tw)*0.35;
ctx.globalAlpha=tw*s.z*0.7;
ctx.fillStyle=s.z>1.5?'#0ff':s.z>1?'#8af':'#fff';
ctx.beginPath();ctx.arc(s.x,s.y,s.z*0.9,0,Math.PI*2);ctx.fill();
}
ctx.globalAlpha=1;
const vig=ctx.createRadialGradient(W/2,H/2,H*0.25,W/2,H/2,H*0.85);
vig.addColorStop(0,'rgba(0,0,0,0)');vig.addColorStop(1,'rgba(0,0,0,0.85)');
ctx.fillStyle=vig;ctx.fillRect(0,0,W,H);
}
function drawGridFrame(){
const bx=GX-10,by=GY-10,bw=GS+20,bh=GS+20;
ctx.save();
ctx.shadowBlur=30;ctx.shadowColor='rgba(0,200,255,0.5)';
ctx.strokeStyle='rgba(0,200,255,0.5)';ctx.lineWidth=2;
roundRect(bx,by,bw,bh,16);ctx.stroke();
ctx.restore();
const fill=ctx.createLinearGradient(bx,by,bx,by+bh);
fill.addColorStop(0,'rgba(0,30,60,0.55)');
fill.addColorStop(1,'rgba(0,10,30,0.65)');
ctx.fillStyle=fill;
roundRect(bx,by,bw,bh,16);ctx.fill();
pulseTime=(Date.now()*0.003)%(Math.PI*2);
const pulse=0.7+Math.sin(pulseTime)*0.3;
ctx.save();
ctx.strokeStyle='rgba(0,255,255,'+pulse+')';
ctx.lineWidth=3;ctx.lineCap='round';
ctx.shadowBlur=22;ctx.shadowColor='#0ff';
for(let i=0;i<4;i++){
const lw=(i===0||i===3)?3:2.5;
ctx.lineWidth=lw;
ctx.beginPath();ctx.moveTo(GX+i*CELL,GY);ctx.lineTo(GX+i*CELL,GY+GS);ctx.stroke();
ctx.beginPath();ctx.moveTo(GX,GY+i*CELL);ctx.lineTo(GX+GS,GY+i*CELL);ctx.stroke();
}
ctx.restore();
for(let i=1;i<4;i++){
for(let j=1;j<4;j++){
ctx.fillStyle='rgba(0,220,255,0.85)';
ctx.shadowBlur=10;ctx.shadowColor='#0ff';
ctx.beginPath();ctx.arc(GX+i*CELL,GY+j*CELL,2.2,0,Math.PI*2);ctx.fill();
ctx.shadowBlur=0;
}
}
const corners=[[GX,GY],[GX+GS,GY],[GX,GY+GS],[GX+GS,GY+GS]];
ctx.strokeStyle='rgba(0,255,255,0.95)';ctx.lineWidth=3;ctx.lineCap='round';
ctx.shadowBlur=15;ctx.shadowColor='#0ff';
for(const [cx,cy] of corners){
const d=12,ex=cx===GX?d:-d,ey=cy===GY?d:-d;
ctx.beginPath();
ctx.moveTo(cx+ex,cy);ctx.lineTo(cx,cy);ctx.lineTo(cx,cy+ey);
ctx.stroke();
}
ctx.shadowBlur=0;
}
function drawGrid(){
drawBackground();
drawGridFrame();
if(hoverCell>=0&&board[hoverCell]===''&&gameActive&&turn==='X'&&!aiThinking){
const r=Math.floor(hoverCell/3),col=hoverCell%3;
const x=GX+col*CELL,y=GY+r*CELL;
const g=ctx.createRadialGradient(x+CELL/2,y+CELL/2,5,x+CELL/2,y+CELL/2,CELL/2);
g.addColorStop(0,'rgba(0,255,255,0.4)');g.addColorStop(1,'rgba(0,255,255,0)');
ctx.fillStyle=g;roundRect(x+3,y+3,CELL-6,CELL-6,10);ctx.fill();
ctx.strokeStyle='rgba(0,255,255,0.85)';ctx.lineWidth=2;
ctx.setLineDash([8,5]);ctx.lineDashOffset=-Date.now()*0.02;
roundRect(x+3,y+3,CELL-6,CELL-6,10);ctx.stroke();
ctx.setLineDash([]);
}
}
function drawX(cx,cy,size,scale){
ctx.save();
ctx.globalAlpha=1;
ctx.translate(cx,cy);ctx.scale(scale,scale);
ctx.strokeStyle='#0ff';ctx.lineWidth=7;ctx.lineCap='round';
ctx.shadowBlur=28;ctx.shadowColor='#0ff';
const s=size/2-14;
ctx.beginPath();ctx.moveTo(-s,-s);ctx.lineTo(s,s);ctx.stroke();
ctx.beginPath();ctx.moveTo(s,-s);ctx.lineTo(-s,s);ctx.stroke();
ctx.strokeStyle='rgba(220,255,255,0.9)';ctx.lineWidth=2;
ctx.shadowBlur=0;
ctx.beginPath();ctx.moveTo(-s,-s);ctx.lineTo(s,s);ctx.stroke();
ctx.beginPath();ctx.moveTo(s,-s);ctx.lineTo(-s,s);ctx.stroke();
ctx.restore();
}
function drawO(cx,cy,size,scale){
ctx.save();
ctx.globalAlpha=1;
ctx.translate(cx,cy);ctx.scale(scale,scale);
ctx.strokeStyle='#f0f';ctx.lineWidth=7;ctx.lineCap='round';
ctx.shadowBlur=28;ctx.shadowColor='#f0f';
ctx.beginPath();ctx.arc(0,0,size/2-16,0,Math.PI*2);ctx.stroke();
ctx.strokeStyle='rgba(255,220,255,0.9)';ctx.lineWidth=2;
ctx.shadowBlur=0;
ctx.beginPath();ctx.arc(0,0,size/2-16,0,Math.PI*2);ctx.stroke();
ctx.restore();
}
function drawBoard(){
for(let i=0;i<9;i++){
const r=Math.floor(i/3),col=i%3;
const cx=GX+col*CELL+CELL/2,cy=GY+r*CELL+CELL/2;
const s=cellAnim[i]>0?Math.min(1,cellAnim[i]):1;
if(cellAnim[i]>0)cellAnim[i]+=0.08;
if(board[i]==='X')drawX(cx,cy,CELL,0.6+s*0.4);
else if(board[i]==='O')drawO(cx,cy,CELL,0.6+s*0.4);
}
if(winner&&winner.line){
const line=winner.line;
const r1=Math.floor(line[0]/3),c1=line[0]%3;
const r2=Math.floor(line[2]/3),c2=line[2]%3;
const x1=GX+c1*CELL+CELL/2,y1=GY+r1*CELL+CELL/2;
const x2=GX+c2*CELL+CELL/2,y2=GY+r2*CELL+CELL/2;
ctx.save();
const pulse=0.65+Math.sin(Date.now()*0.01)*0.35;
ctx.strokeStyle=winner.player==='X'?'rgba(0,255,80,'+pulse+')':'rgba(255,30,60,'+pulse+')';
ctx.lineWidth=10;ctx.lineCap='round';
ctx.shadowBlur=40;ctx.shadowColor=winner.player==='X'?'#0f0':'#f00';
ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
ctx.strokeStyle='rgba(255,255,255,0.95)';ctx.lineWidth=3;ctx.shadowBlur=15;
ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
ctx.restore();
}
}
function drawParticles(){
for(let i=particles.length-1;i>=0;i--){
const p=particles[i];
p.x+=p.vx;p.y+=p.vy;p.vy+=0.18;p.vx*=0.99;p.life-=0.02;
if(p.life<=0){particles.splice(i,1);continue;}
ctx.globalAlpha=p.life;
ctx.fillStyle=p.color;ctx.shadowBlur=12;ctx.shadowColor=p.color;
ctx.beginPath();ctx.arc(p.x,p.y,p.size*p.life,0,Math.PI*2);ctx.fill();
}
ctx.globalAlpha=1;ctx.shadowBlur=0;
}
function drawRipples(){
for(let i=ripples.length-1;i>=0;i--){
const r=ripples[i];
r.r+=(r.max-r.r)*0.14;r.life-=0.03;
if(r.life<=0){ripples.splice(i,1);continue;}
ctx.globalAlpha=r.life*0.8;
ctx.strokeStyle=r.color;ctx.lineWidth=3;
ctx.shadowBlur=15;ctx.shadowColor=r.color;
ctx.beginPath();ctx.arc(r.x,r.y,r.r,0,Math.PI*2);ctx.stroke();
}
ctx.globalAlpha=1;ctx.shadowBlur=0;
}
function spawnParticles(x,y,color,n){
for(let i=0;i<n;i++)particles.push({x,y,vx:(Math.random()-0.5)*8,vy:(Math.random()-0.5)*8-2,life:1,color,size:2+Math.random()*3.5});
}
function spawnRipple(x,y,color){ripples.push({x,y,r:5,max:70,life:1,color});}
function checkWinner(b){
const lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
for(const l of lines){if(b[l[0]]&&b[l[0]]===b[l[1]]&&b[l[1]]===b[l[2]])return{player:b[l[0]],line:l};}
if(b.every(c=>c))return{player:'draw',line:null};
return null;
}
function cellFromPoint(px,py){
const x=px-GX,y=py-GY;
if(x<0||x>GS||y<0||y>GS)return -1;
return Math.floor(y/CELL)*3+Math.floor(x/CELL);
}
function makeMove(idx,player){
board[idx]=player;
cellAnim[idx]=0.01;
const r=Math.floor(idx/3),col=idx%3;
const cx=GX+col*CELL+CELL/2,cy=GY+r*CELL+CELL/2;
spawnParticles(cx,cy,player==='X'?'#0ff':'#f0f',14);
spawnRipple(cx,cy,player==='X'?'rgba(0,255,255,0.9)':'rgba(255,0,255,0.9)');
const result=checkWinner(board);
if(result){
gameActive=false;winner=result;
if(result.player==='X'){wins++;wT.innerText=wins;stT.innerText='¡GANASTE!';stT.style.color='#0f0';spawnParticles(W/2,H/2,'#0f0',40);spawnParticles(W/2,H/2,'#0ff',30);}
else if(result.player==='O'){losses++;lT.innerText=losses;stT.innerText='PERDISTE';stT.style.color='#f00';spawnParticles(W/2,H/2,'#f00',40);}
else{draws++;dT.innerText=draws;stT.innerText='EMPATE';stT.style.color='#ff0';spawnParticles(W/2,H/2,'#ff0',30);}
setTimeout(()=>{
sB.style.display='block';
uI.style.display='flex';uI.style.opacity=1;
uI.querySelector('h1').innerText=result.player==='X'?'¡VICTORIA!':result.player==='O'?'DERROTA':'EMPATE';
sB.innerText='JUGAR OTRA VEZ';
},1400);
}else{
turn=player==='X'?'O':'X';
if(turn==='O'){aiThinking=true;stT.innerText='IA PENSANDO...';stT.style.color='#f0f';setTimeout(()=>aiMove(),550);}
else{aiThinking=false;stT.innerText='TU TURNO';stT.style.color='#0ff';}
}
}
function minimax(b,depth,isMax){
const res=checkWinner(b);
if(res){if(res.player==='O')return 10-depth;if(res.player==='X')return depth-10;return 0;}
if(isMax){let best=-Infinity;for(let i=0;i<9;i++){if(b[i]===''){b[i]='O';best=Math.max(best,minimax(b,depth+1,false));b[i]='';}}return best;}
let best=Infinity;for(let i=0;i<9;i++){if(b[i]===''){b[i]='X';best=Math.min(best,minimax(b,depth+1,true));b[i]='';}}return best;
}
function aiMove(){
if(!gameActive)return;
let bestScore=-Infinity,bestMove=-1;
const empty=board.map((v,i)=>v===''?i:-1).filter(i=>i>=0);
if(empty.length===9)bestMove=4;
else{for(const i of empty){board[i]='O';const s=minimax(board,0,false);board[i]='';if(s>bestScore){bestScore=s;bestMove=i;}}}
if(bestMove>=0)makeMove(bestMove,'O');
aiThinking=false;
}
function handleClick(px,py){
if(!gameActive||turn!=='X'||aiThinking)return;
const idx=cellFromPoint(px,py);
if(idx>=0&&board[idx]==='')makeMove(idx,'X');
}
c.addEventListener('mousemove',e=>{const r=c.getBoundingClientRect();hoverCell=cellFromPoint((e.clientX-r.left)*(W/r.width),(e.clientY-r.top)*(H/r.height));});
c.addEventListener('mouseleave',()=>{hoverCell=-1;});
c.addEventListener('click',e=>{const r=c.getBoundingClientRect();handleClick((e.clientX-r.left)*(W/r.width),(e.clientY-r.top)*(H/r.height));});
c.addEventListener('touchstart',e=>{e.preventDefault();const r=c.getBoundingClientRect();const t=e.touches[0];handleClick((t.clientX-r.left)*(W/r.width),(t.clientY-r.top)*(H/r.height));},{passive:false});
function loop(){drawGrid();drawBoard();drawRipples();drawParticles();requestAnimationFrame(loop);}
function start(){
wins=0;draws=0;losses=0;
wT.innerText=0;dT.innerText=0;lT.innerText=0;
initGame();
hU.style.display='block';
uI.style.opacity=0;
setTimeout(()=>uI.style.display='none',400);
}
sB.addEventListener('click',start);
initStars();
initGame();
loop();
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