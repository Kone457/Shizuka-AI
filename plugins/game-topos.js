
import crypto from 'crypto'

const WHACK_HTML = `
<div style="width:100%;height:600px;background:linear-gradient(180deg,#1a4a1a,#0a2010);position:relative;overflow:hidden;font-family:'Segoe UI',sans-serif;user-select:none;touch-action:none;">
<canvas id="wC" width="360" height="600" style="width:100%;height:100%;display:block;"></canvas>
<div id="wUI" style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;align-items:center;background:rgba(0,0,0,0.9);z-index:10;transition:opacity 0.3s;padding:20px;box-sizing:border-box;">
<h1 style="color:#fa0;text-shadow:0 0 20px #fa0,0 0 40px #f40;font-size:32px;margin:0 0 8px;letter-spacing:3px;text-transform:uppercase;font-weight:900;text-align:center;">WHACK-A-MOLE</h1>
<p style="color:#8f8;margin:0 0 22px;font-size:12px;text-align:center;letter-spacing:1px;line-height:1.7;">¡Golpea los topos con el mazo!<br>Evita golpear las bombas 💣<br>¡Consigue la mayor puntuación!</p>
<button id="wSB" style="padding:14px 40px;background:linear-gradient(45deg,#fa0,#f40);border:none;border-radius:30px;color:#fff;font-size:15px;font-weight:900;cursor:pointer;text-transform:uppercase;letter-spacing:2px;box-shadow:0 0 25px rgba(255,100,0,0.5);">JUGAR</button>
</div>
<div id="wHU" style="position:absolute;top:0;left:0;width:100%;box-sizing:border-box;color:#fff;display:none;pointer-events:none;z-index:5;">
<div style="display:flex;justify-content:space-between;padding:10px 15px;align-items:center;font-family:monospace;">
<div>
<div style="font-size:9px;color:#8f8;letter-spacing:2px;">PUNTOS</div>
<div id="wSc" style="font-size:20px;font-weight:900;text-shadow:0 0 8px #0f0;">0</div>
</div>
<div style="text-align:center;">
<div style="font-size:9px;color:#8f8;letter-spacing:2px;">RACHA</div>
<div id="wCb" style="font-size:20px;font-weight:900;color:#fa0;text-shadow:0 0 8px #fa0;">x1</div>
</div>
<div style="text-align:right;">
<div style="font-size:9px;color:#8f8;letter-spacing:2px;">TIEMPO</div>
<div id="wTm" style="font-size:20px;font-weight:900;color:#f44;text-shadow:0 0 8px #f44;">60s</div>
</div>
</div>
<div style="padding:0 15px;">
<div style="width:100%;height:6px;background:rgba(0,0,0,0.5);border-radius:3px;overflow:hidden;">
<div id="wBr" style="width:100%;height:100%;background:linear-gradient(90deg,#0f0,#fa0,#f00);transition:width 0.1s linear;"></div>
</div>
</div>
</div>
</div>
<script>
(function(){
const c=document.getElementById('wC'),ctx=c.getContext('2d');
const uI=document.getElementById('wUI'),sB=document.getElementById('wSB'),hU=document.getElementById('wHU');
const scT=document.getElementById('wSc'),cbT=document.getElementById('wCb'),tmT=document.getElementById('wTm'),brT=document.getElementById('wBr');
const W=c.width,H=c.height;
const COLS=3,ROWS=3;
const HOLE_W=100,HOLE_H=90;
const GAP_X=(W-COLS*HOLE_W)/(COLS+1);
const GAP_Y=30;
const TOP_OFFSET=130;
let holes,sc,combo,maxCombo,timeLeft,running,anim,lastTime,hammer,swingT,swingX,swingY,particles,shake,moleTimer,missCount,hitCount;
function initHoles(){
holes=[];
for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){
const hx=GAP_X+(GAP_X+HOLE_W)*x;
const hy=TOP_OFFSET+(HOLE_H+GAP_Y)*y;
holes.push({
x:hx,y:hy,w:HOLE_W,h:HOLE_H,
cx:hx+HOLE_W/2,cy:hy+HOLE_H/2,
state:'empty',
timer:0,
moleType:'normal',
hit:0,
targetUp:0,
duration:1200
});
}
}
function spawnMole(){
if(!running)return;
const empties=holes.filter(h=>h.state==='empty');
if(empties.length===0)return;
const h=empties[Math.floor(Math.random()*empties.length)];
h.state='rising';
h.timer=0;
h.targetUp=0;
const elapsed=60-timeLeft;
const difficulty=Math.min(1,elapsed/45);
let bombChance=0.10+difficulty*0.18;
let goldChance=0.08;
const r=Math.random();
if(r<bombChance){h.moleType='bomb';}
else if(r<bombChance+goldChance){h.moleType='gold';}
else if(r<bombChance+goldChance+0.05){h.moleType='fast';}
else{h.moleType='normal';}
h.duration=h.moleType==='fast'?700:Math.max(700,1400-difficulty*500);
}
function updateHoles(dt){
for(const h of holes){
if(h.state==='empty')continue;
h.timer+=dt;
if(h.state==='rising'){
h.targetUp=Math.min(1,h.timer/180);
if(h.timer>=180){h.state='up';h.timer=0;h.targetUp=1;}
}else if(h.state==='up'){
h.targetUp=1;
if(h.timer>h.duration){h.state='falling';h.timer=0;}
}else if(h.state==='falling'){
h.targetUp=Math.max(0,1-h.timer/180);
if(h.timer>=180){h.state='empty';h.timer=0;h.targetUp=0;}
}else if(h.state==='hit'){
h.hit+=dt;
h.targetUp=Math.max(0,1-h.hit/250);
if(h.hit>=250){h.state='empty';h.timer=0;h.targetUp=0;h.hit=0;}
}
}
}
function spawnParticles(x,y,color,n){
for(let i=0;i<n;i++)particles.push({
x,y,vx:(Math.random()-0.5)*8,vy:-Math.random()*6-2,
life:1,color,size:2+Math.random()*4
});
}
function popText(x,y,text,color){
particles.push({x,y,vx:0,vy:-1.5,life:1,color,size:0,text:text,isText:true});
}
function drawHole(h){
const sh=ctx.createRadialGradient(h.cx,h.cy+h.h*0.3,5,h.cx,h.cy+h.h*0.3,h.w*0.6);
sh.addColorStop(0,'#000');
sh.addColorStop(1,'rgba(0,0,0,0)');
ctx.fillStyle=sh;
ctx.beginPath();
ctx.ellipse(h.cx,h.cy+h.h*0.35,h.w*0.45,h.h*0.28,0,0,Math.PI*2);
ctx.fill();
ctx.fillStyle='#0a1a08';
ctx.beginPath();
ctx.ellipse(h.cx,h.cy+h.h*0.35,h.w*0.42,h.h*0.24,0,0,Math.PI*2);
ctx.fill();
ctx.strokeStyle='rgba(80,160,60,0.6)';
ctx.lineWidth=3;
ctx.beginPath();
ctx.ellipse(h.cx,h.cy+h.h*0.35,h.w*0.42,h.h*0.24,0,0,Math.PI*2);
ctx.stroke();
}
function drawMole(h){
if(h.targetUp<=0)return;
const yOff=(1-h.targetUp)*(h.h+20);
const mx=h.cx,my=h.cy+yOff;
ctx.save();
ctx.beginPath();
ctx.rect(h.x-15,h.y-60,h.w+30,h.h+80);
ctx.clip();
const bob=Math.sin(Date.now()*0.006)*2;
my+=bob*h.targetUp;
if(h.moleType==='bomb'){
const bg=ctx.createRadialGradient(mx,my-10,3,mx,my,28);
bg.addColorStop(0,'#666');bg.addColorStop(1,'#111');
ctx.fillStyle=bg;
ctx.beginPath();ctx.arc(mx,my,24,0,Math.PI*2);ctx.fill();
ctx.strokeStyle='#888';ctx.lineWidth=2;
ctx.beginPath();ctx.arc(mx,my,24,0,Math.PI*2);ctx.stroke();
ctx.strokeStyle='#fa0';ctx.lineWidth=3;
ctx.beginPath();
ctx.moveTo(mx+8,my-22);
ctx.quadraticCurveTo(mx+18,my-34,mx+12,my-42);
ctx.stroke();
ctx.fillStyle='#f80';
ctx.beginPath();ctx.arc(mx+12,my-44,6,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#fff';
ctx.beginPath();ctx.arc(mx+10,my-47,3,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#f00';
ctx.beginPath();ctx.arc(mx+11,my-47,2,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#000';
ctx.beginPath();ctx.arc(mx-7,my-4,2.5,0,Math.PI*2);ctx.arc(mx+7,my-4,2.5,0,Math.PI*2);ctx.fill();
ctx.strokeStyle='#000';ctx.lineWidth=2;
ctx.beginPath();ctx.moveTo(mx-6,my+8);ctx.lineTo(mx+6,my+8);ctx.stroke();
}else{
let bodyCol='#a06030',darkCol='#6a3a15',noseCol='#f0a0a0';
if(h.moleType==='gold'){
bodyCol='#ffd700';darkCol='#b8860b';noseCol='#fff0a0';
ctx.shadowBlur=20;ctx.shadowColor='#ffd700';
}else if(h.moleType==='fast'){
bodyCol='#e08040';darkCol='#a05020';
}
ctx.fillStyle=darkCol;
ctx.beginPath();
ctx.ellipse(mx-16,my-12,7,9,-0.3,0,Math.PI*2);ctx.fill();
ctx.beginPath();
ctx.ellipse(mx+16,my-12,7,9,0.3,0,Math.PI*2);ctx.fill();
ctx.fillStyle=bodyCol;
ctx.beginPath();
ctx.ellipse(mx,my+6,22,24,0,0,Math.PI*2);
ctx.fill();
ctx.beginPath();
ctx.ellipse(mx,my-6,18,18,0,0,Math.PI*2);
ctx.fill();
ctx.shadowBlur=0;
ctx.fillStyle=noseCol;
ctx.beginPath();
ctx.ellipse(mx,my+2,10,7,0,0,Math.PI*2);
ctx.fill();
ctx.fillStyle='#000';
ctx.beginPath();ctx.arc(mx-8,my-12,3.5,0,Math.PI*2);ctx.arc(mx+8,my-12,3.5,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#fff';
ctx.beginPath();ctx.arc(mx-7,my-13,1.3,0,Math.PI*2);ctx.arc(mx+9,my-13,1.3,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#000';
ctx.beginPath();ctx.arc(mx-2,my+1,1.5,0,Math.PI*2);ctx.arc(mx+2,my+1,1.5,0,Math.PI*2);ctx.fill();
ctx.strokeStyle='#fff';ctx.lineWidth=1.5;
ctx.beginPath();
ctx.moveTo(mx-6,my+10);
ctx.lineTo(mx-3,my+8);
ctx.lineTo(mx,my+10);
ctx.lineTo(mx+3,my+8);
ctx.lineTo(mx+6,my+10);
ctx.stroke();
}
ctx.restore();
}
function drawHammer(){
if(swingT<=0)return;
const ang=-Math.PI/2+Math.sin(swingT*Math.PI)*1.4;
ctx.save();
ctx.translate(swingX,swingY);
ctx.rotate(ang);
ctx.shadowBlur=15;ctx.shadowColor='#000';
ctx.fillStyle='#8a5a2a';
ctx.beginPath();
if(ctx.roundRect)ctx.roundRect(-5,0,10,60,3);else ctx.rect(-5,0,10,60);
ctx.fill();
ctx.fillStyle='#555';
ctx.beginPath();
if(ctx.roundRect)ctx.roundRect(-22,-22,44,26,4);else ctx.rect(-22,-22,44,26);
ctx.fill();
ctx.fillStyle='#777';
ctx.beginPath();
if(ctx.roundRect)ctx.roundRect(-22,-22,44,8,4);else ctx.rect(-22,-22,44,8);
ctx.fill();
ctx.fillStyle='rgba(255,255,255,0.3)';
ctx.beginPath();
if(ctx.roundRect)ctx.roundRect(-20,-20,16,4,2);else ctx.rect(-20,-20,16,4);
ctx.fill();
ctx.shadowBlur=0;
ctx.restore();
}
function draw(){
let sx=0,sy=0;
if(shake>0){sx=(Math.random()-0.5)*shake;sy=(Math.random()-0.5)*shake;shake*=0.85;if(shake<0.2)shake=0;}
ctx.setTransform(1,0,0,1,0,0);
const bg=ctx.createLinearGradient(0,0,0,H);
bg.addColorStop(0,'#2a5a2a');bg.addColorStop(0.5,'#1a4a1a');bg.addColorStop(1,'#0a2010');
ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
ctx.translate(sx,sy);
for(let i=0;i<30;i++){
const gx=(i*137.5)%W,gy=(i*97.3+Math.sin(Date.now()*0.001+i)*20)%H;
ctx.fillStyle='rgba(255,255,200,0.06)';
ctx.beginPath();
ctx.arc(gx,gy,2,0,Math.PI*2);ctx.fill();
}
for(const h of holes)drawHole(h);
for(const h of holes){
if(h.targetUp>0)drawMole(h);
}
for(const h of holes){
if(h.state==='up'||h.state==='rising'){
const p=1-h.timer/h.duration;
if(p<0.35&&p>0){
ctx.fillStyle='rgba(255,0,0,'+(0.6-p*1.7)+')';
ctx.beginPath();
ctx.ellipse(h.cx,h.cy+h.h*0.35,h.w*0.42,h.h*0.24,0,0,Math.PI*2);
ctx.fill();
}
}
}
for(let i=particles.length-1;i>=0;i--){
const p=particles[i];
p.x+=p.vx;p.y+=p.vy;
if(!p.isText)p.vy+=0.4;
p.life-=0.025;
if(p.life<=0){particles.splice(i,1);continue;}
ctx.globalAlpha=p.life;
if(p.isText){
ctx.fillStyle=p.color;
ctx.font='bold 22px sans-serif';
ctx.textAlign='center';
ctx.strokeStyle='#000';ctx.lineWidth=3;
ctx.strokeText(p.text,p.x,p.y);
ctx.fillText(p.text,p.x,p.y);
}else{
ctx.fillStyle=p.color;
ctx.fillRect(p.x,p.y,p.size,p.size);
}
}
ctx.globalAlpha=1;
drawHammer();
if(swingT>0)swingT-=0.07;
ctx.setTransform(1,0,0,1,0,0);
}
function hitHole(mx,my){
if(!running)return;
for(const h of holes){
if(h.state!=='up'&&h.state!=='rising')continue;
if(h.targetUp<0.4)continue;
const yOff=(1-h.targetUp)*(h.h+20);
const headX=h.cx,headY=h.cy+yOff;
const dx=mx-headX,dy=my-headY;
const dist=Math.hypot(dx,dy);
if(dist<45){
if(h.moleType==='bomb'){
h.state='hit';h.hit=0;
combo=1;
sc=Math.max(0,sc-50);
spawnParticles(h.cx,h.cy,'#f00',25);
spawnParticles(h.cx,h.cy,'#ff0',15);
popText(h.cx,h.cy-30,'-50','#f00');
shake=20;
scT.innerText=sc;
updateCombo();
return true;
}
let pts=10;
let col='#fff';
if(h.moleType==='gold'){pts=50;col='#ffd700';}
else if(h.moleType==='fast'){pts=20;col='#ff8';}
pts*=combo;
sc+=pts;
hitCount++;
spawnParticles(h.cx,h.cy,col,15);
popText(h.cx,h.cy-30,'+'+pts,col);
h.state='hit';h.hit=0;
shake=6;
combo++;
if(combo>maxCombo)maxCombo=combo;
scT.innerText=sc;
updateCombo();
return true;
}
}
combo=1;
missCount++;
updateCombo();
return false;
}
function updateCombo(){
cbT.innerText='x'+combo;
if(combo>=20)cbT.style.color='#f0f';
else if(combo>=10)cbT.style.color='#f80';
else if(combo>=5)cbT.style.color='#ff0';
else cbT.style.color='#fa0';
}
function updateTime(){
tmT.innerText=Math.ceil(timeLeft)+'s';
brT.style.width=(timeLeft/60*100)+'%';
if(timeLeft<=10)tmT.style.color='#f00';
else tmT.style.color='#f44';
}
function tick(ts){
if(!running)return;
if(!lastTime)lastTime=ts;
const dt=Math.min(50,ts-lastTime);lastTime=ts;
timeLeft-=dt/1000;
if(timeLeft<=0){timeLeft=0;updateTime();gameOver();return;}
if(timeLeft<10)tmT.style.color=(Math.floor(timeLeft*4)%2===0)?'#f00':'#800';
updateTime();
updateHoles(dt);
const interval=Math.max(450,1100-(60-timeLeft)*11);
moleTimer+=dt;
if(moleTimer>interval){
moleTimer=0;
const numSpawn=timeLeft<20?2:1;
for(let i=0;i<numSpawn;i++)spawnMole();
}
draw();
anim=requestAnimationFrame(tick);
}
function gameOver(){
running=false;cancelAnimationFrame(anim);
const hitRate=hitCount+missCount>0?Math.round(hitCount/(hitCount+missCount)*100):0;
uI.style.display='flex';uI.style.opacity=1;
sB.innerText='VOLVER A JUGAR';
uI.querySelector('h1').innerText='¡TIEMPO!';
uI.querySelector('p').innerHTML='<b style="color:#0f0">Puntos: '+sc+'</b><br><b style="color:#fa0">Mejor racha: x'+maxCombo+'</b><br><b style="color:#0ff">Precisión: '+hitRate+'%</b><br><br>'+(sc>800?'¡Eres un maestro del mazo! 🔨':sc>400?'¡Buen trabajo! 💪':'Sigue practicando 🐹');
hU.style.display='none';
}
function start(){
initHoles();
sc=0;combo=1;maxCombo=1;timeLeft=60;particles=[];shake=0;moleTimer=0;
missCount=0;hitCount=0;swingT=0;
scT.innerText=sc;
updateCombo();updateTime();
hU.style.display='block';
uI.style.opacity=0;setTimeout(()=>uI.style.display='none',300);
running=true;lastTime=0;anim=requestAnimationFrame(tick);
for(let i=0;i<5;i++)setTimeout(()=>{if(running)spawnMole();},i*200);
}
function getPos(e){
const r=c.getBoundingClientRect();
const cx=e.touches?e.touches[0].clientX:e.clientX;
const cy=e.touches?e.touches[0].clientY:e.clientY;
return{x:(cx-r.left)/r.width*c.width,y:(cy-r.top)/r.height*c.height};
}
function handleHit(e){
if(!running)return;
const p=getPos(e);
swingX=p.x;swingY=p.y-30;swingT=1;
hitHole(p.x,p.y);
}
c.addEventListener('touchstart',e=>{e.preventDefault();handleHit(e);},{passive:false});
c.addEventListener('mousedown',e=>{e.preventDefault();handleHit(e);});
c.addEventListener('contextmenu',e=>e.preventDefault());
document.addEventListener('keydown',e=>{
if(!running)return;
if(e.key>='1'&&e.key<='9'){
const idx=parseInt(e.key)-1;
if(idx<holes.length){
const h=holes[idx];
swingX=h.cx;swingY=h.cy-30;swingT=1;
hitHole(h.cx,h.cy);
}
}
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
                                messageText: '🔨 WHACK-A-MOLE'
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
                                                    payload: WHACK_HTML,
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
handler.help = ['topos']
handler.tags = ['game']
handler.command = ['topos']
export default handler