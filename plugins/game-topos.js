import crypto from 'crypto'

const WHACK_HTML = `
<div style="width:100%;height:600px;background:#0a2010;position:relative;overflow:hidden;font-family:'Segoe UI',sans-serif;user-select:none;touch-action:none;">
<canvas id="wC" width="360" height="600" style="width:100%;height:100%;display:block;"></canvas>
<div id="wUI" style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;align-items:center;background:rgba(0,0,0,0.9);z-index:10;padding:20px;box-sizing:border-box;">
<h1 style="color:#fa0;text-shadow:0 0 20px #fa0;font-size:30px;margin:0 0 8px;letter-spacing:3px;font-weight:900;text-align:center;">WHACK-A-MOLE</h1>
<p style="color:#8f8;margin:0 0 22px;font-size:12px;text-align:center;line-height:1.7;">¡Toca los topos!<br>Evita las bombas 💣<br>60 segundos de furia</p>
<button id="wSB" style="padding:14px 40px;background:linear-gradient(45deg,#fa0,#f40);border:none;border-radius:30px;color:#fff;font-size:15px;font-weight:900;cursor:pointer;text-transform:uppercase;letter-spacing:2px;">JUGAR</button>
</div>
<div id="wHU" style="position:absolute;top:0;left:0;width:100%;box-sizing:border-box;color:#fff;display:none;pointer-events:none;z-index:5;font-family:monospace;">
<div style="display:flex;justify-content:space-between;padding:10px 15px;">
<div><div style="font-size:9px;color:#8f8;letter-spacing:2px;">PUNTOS</div><div id="wSc" style="font-size:20px;font-weight:900;text-shadow:0 0 8px #0f0;">0</div></div>
<div style="text-align:center;"><div style="font-size:9px;color:#8f8;letter-spacing:2px;">RACHA</div><div id="wCb" style="font-size:20px;font-weight:900;color:#fa0;">x1</div></div>
<div style="text-align:right;"><div style="font-size:9px;color:#8f8;letter-spacing:2px;">TIEMPO</div><div id="wTm" style="font-size:20px;font-weight:900;color:#f44;">60s</div></div>
</div>
<div style="padding:0 15px;"><div style="width:100%;height:6px;background:rgba(0,0,0,0.5);border-radius:3px;overflow:hidden;"><div id="wBr" style="width:100%;height:100%;background:linear-gradient(90deg,#0f0,#fa0,#f00);"></div></div></div>
</div>
</div>
<script>
(function(){
const c=document.getElementById('wC'),ctx=c.getContext('2d');
const uI=document.getElementById('wUI'),sB=document.getElementById('wSB'),hU=document.getElementById('wHU');
const scT=document.getElementById('wSc'),cbT=document.getElementById('wCb'),tmT=document.getElementById('wTm'),brT=document.getElementById('wBr');
const W=c.width,H=c.height;
const COLS=3,ROWS=3;
const CW=W/COLS;
const TOP=120;
const CH=(H-TOP-40)/ROWS;
let holes,sc,combo,maxCombo,timeLeft,running,anim,lastTime,swingT,swingX,swingY,particles,shake,spawnT,hitCount,missCount;
function initHoles(){
holes=[];
for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){
holes.push({
cx:CW*x+CW/2,
cy:TOP+CH*y+CH/2,
type:'none',
time:0,
dur:0,
scale:0,
hitAnim:0
});
}
}
function spawnMole(){
if(!running)return;
const empties=holes.filter(h=>h.type==='none');
if(empties.length===0)return;
const h=empties[Math.floor(Math.random()*empties.length)];
const diff=Math.min(1,(60-timeLeft)/45);
const r=Math.random();
const bombC=0.12+diff*0.15;
if(r<bombC)h.type='bomb';
else if(r<bombC+0.08)h.type='gold';
else if(r<bombC+0.13)h.type='fast';
else h.type='normal';
h.time=0;
h.dur=h.type==='fast'?700:Math.max(800,1500-diff*600);
h.scale=0;
h.hitAnim=0;
}
function updateHoles(dt){
for(const h of holes){
if(h.type==='none'){h.scale=0;continue;}
h.time+=dt;
if(h.type==='hit'){
h.hitAnim+=dt;
h.scale=Math.max(0,1-h.hitAnim/220);
if(h.hitAnim>=220){h.type='none';h.scale=0;h.hitAnim=0;}
continue;
}
const t=h.time;
if(t<160)h.scale=t/160;
else if(t>h.dur-160)h.scale=Math.max(0,(h.dur-t)/160);
else h.scale=1;
if(t>=h.dur){h.type='none';h.scale=0;}
}
}
function spawnParticles(x,y,color,n){
for(let i=0;i<n;i++)particles.push({x,y,vx:(Math.random()-0.5)*8,vy:-Math.random()*6-2,life:1,color,size:3+Math.random()*4});
}
function popText(x,y,text,color){
particles.push({x,y,vx:0,vy:-1.5,life:1,color,text,isText:true});
}
function drawHole(h){
ctx.save();
ctx.fillStyle='#000';
ctx.beginPath();
ctx.ellipse(h.cx,h.cy+CH*0.22,CW*0.4,CH*0.18,0,0,Math.PI*2);
ctx.fill();
ctx.fillStyle='#0d2a10';
ctx.beginPath();
ctx.ellipse(h.cx,h.cy+CH*0.22,CW*0.36,CH*0.15,0,0,Math.PI*2);
ctx.fill();
ctx.strokeStyle='#3a7a3a';
ctx.lineWidth=3;
ctx.beginPath();
ctx.ellipse(h.cx,h.cy+CH*0.22,CW*0.36,CH*0.15,0,0,Math.PI*2);
ctx.stroke();
ctx.restore();
}
function drawMole(h){
if(h.scale<=0)return;
const s=h.scale;
const sc=Math.min(1,s);
const radius=Math.min(CW*0.35,CH*0.35)*sc;
const mx=h.cx,my=h.cy-CH*0.05;
ctx.save();
ctx.globalAlpha=sc;
if(h.type==='bomb'){
ctx.fillStyle='#222';
ctx.beginPath();ctx.arc(mx,my,radius,0,Math.PI*2);ctx.fill();
ctx.strokeStyle='#666';ctx.lineWidth=2;
ctx.beginPath();ctx.arc(mx,my,radius,0,Math.PI*2);ctx.stroke();
ctx.strokeStyle='#fa0';ctx.lineWidth=3;
ctx.beginPath();
ctx.moveTo(mx+radius*0.3,my-radius*0.9);
ctx.quadraticCurveTo(mx+radius*0.8,my-radius*1.4,mx+radius*0.5,my-radius*1.8);
ctx.stroke();
ctx.fillStyle='#f80';
ctx.beginPath();ctx.arc(mx+radius*0.5,my-radius*1.9,radius*0.25,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#fff';
ctx.beginPath();ctx.arc(mx+radius*0.4,my-radius*2,radius*0.12,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#f00';
ctx.beginPath();ctx.arc(mx+radius*0.45,my-radius*2,radius*0.08,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#000';
ctx.beginPath();ctx.arc(mx-radius*0.3,my-radius*0.15,radius*0.12,0,Math.PI*2);ctx.arc(mx+radius*0.3,my-radius*0.15,radius*0.12,0,Math.PI*2);ctx.fill();
ctx.strokeStyle='#000';ctx.lineWidth=2;
ctx.beginPath();ctx.arc(mx,my+radius*0.35,radius*0.4,0.2*Math.PI,0.8*Math.PI);ctx.stroke();
}else{
let body='#a06030',dark='#6a3a15',nose='#f0a0a0';
if(h.type==='gold'){body='#ffd700';dark='#b8860b';nose='#fff0a0';ctx.shadowBlur=25;ctx.shadowColor='#ffd700';}
else if(h.type==='fast'){body='#e08040';dark='#a05020';}
ctx.fillStyle=dark;
ctx.beginPath();ctx.ellipse(mx-radius*0.75,my-radius*0.55,radius*0.32,radius*0.42,-0.3,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.ellipse(mx+radius*0.75,my-radius*0.55,radius*0.32,radius*0.42,0.3,0,Math.PI*2);ctx.fill();
ctx.fillStyle=body;
ctx.beginPath();ctx.arc(mx,my,radius,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(mx,my-radius*0.35,radius*0.85,0,Math.PI*2);ctx.fill();
ctx.shadowBlur=0;
ctx.fillStyle=nose;
ctx.beginPath();ctx.ellipse(mx,my+radius*0.15,radius*0.5,radius*0.35,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#000';
ctx.beginPath();ctx.arc(mx-radius*0.35,my-radius*0.4,radius*0.16,0,Math.PI*2);ctx.arc(mx+radius*0.35,my-radius*0.4,radius*0.16,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#fff';
ctx.beginPath();ctx.arc(mx-radius*0.3,my-radius*0.45,radius*0.06,0,Math.PI*2);ctx.arc(mx+radius*0.4,my-radius*0.45,radius*0.06,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#000';
ctx.beginPath();ctx.arc(mx-radius*0.08,my+radius*0.1,radius*0.08,0,Math.PI*2);ctx.arc(mx+radius*0.08,my+radius*0.1,radius*0.08,0,Math.PI*2);ctx.fill();
ctx.strokeStyle='#fff';ctx.lineWidth=1.5;
ctx.beginPath();
ctx.moveTo(mx-radius*0.25,my+radius*0.5);
ctx.lineTo(mx-radius*0.1,my+radius*0.4);
ctx.lineTo(mx,my+radius*0.5);
ctx.lineTo(mx+radius*0.1,my+radius*0.4);
ctx.lineTo(mx+radius*0.25,my+radius*0.5);
ctx.stroke();
}
ctx.restore();
}
function drawHammer(){
if(swingT<=0)return;
const ang=-Math.PI/2+Math.sin(swingT*Math.PI)*1.5;
ctx.save();
ctx.translate(swingX,swingY);
ctx.rotate(ang);
ctx.fillStyle='#8a5a2a';
ctx.fillRect(-5,0,10,60);
ctx.fillStyle='#555';
ctx.fillRect(-24,-24,48,28);
ctx.fillStyle='#777';
ctx.fillRect(-24,-24,48,8);
ctx.fillStyle='rgba(255,255,255,0.3)';
ctx.fillRect(-22,-22,16,4);
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
for(const h of holes)drawHole(h);
for(const h of holes)drawMole(h);
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
if(!running)return false;
for(const h of holes){
if(h.type==='none'||h.type==='hit')continue;
if(h.scale<0.35)continue;
const d=Math.hypot(mx-h.cx,my-h.cy);
const radius=Math.min(CW*0.42,CH*0.42);
if(d<radius){
if(h.type==='bomb'){
h.type='hit';h.hitAnim=0;
combo=1;
sc=Math.max(0,sc-50);
spawnParticles(h.cx,h.cy,'#f00',25);
spawnParticles(h.cx,h.cy,'#ff0',15);
popText(h.cx,h.cy-40,'-50','#f00');
shake=20;scT.innerText=sc;updateCombo();
return true;
}
let pts=10,col='#fff';
if(h.type==='gold'){pts=50;col='#ffd700';}
else if(h.type==='fast'){pts=20;col='#ff8';}
pts*=combo;
sc+=pts;hitCount++;
spawnParticles(h.cx,h.cy,col,15);
popText(h.cx,h.cy-40,'+'+pts,col);
h.type='hit';h.hitAnim=0;
shake=6;combo++;
if(combo>maxCombo)maxCombo=combo;
scT.innerText=sc;updateCombo();
return true;
}
}
combo=1;missCount++;updateCombo();
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
}
function tick(ts){
if(!running)return;
if(!lastTime)lastTime=ts;
const dt=Math.min(50,ts-lastTime);lastTime=ts;
timeLeft-=dt/1000;
if(timeLeft<=0){timeLeft=0;updateTime();gameOver();return;}
updateTime();
updateHoles(dt);
const interval=Math.max(500,1200-(60-timeLeft)*12);
spawnT+=dt;
if(spawnT>interval){
spawnT=0;
const n=timeLeft<25?2:1;
for(let i=0;i<n;i++)spawnMole();
}
draw();
anim=requestAnimationFrame(tick);
}
function gameOver(){
running=false;cancelAnimationFrame(anim);
const total=hitCount+missCount;
const rate=total>0?Math.round(hitCount/total*100):0;
uI.style.display='flex';
sB.innerText='VOLVER A JUGAR';
uI.querySelector('h1').innerText='¡TIEMPO!';
uI.querySelector('p').innerHTML='<b style="color:#0f0">Puntos: '+sc+'</b><br><b style="color:#fa0">Mejor racha: x'+maxCombo+'</b><br><b style="color:#0ff">Precisión: '+rate+'%</b><br><br>'+(sc>800?'¡Maestro del mazo! 🔨':sc>400?'¡Buen trabajo! 💪':'Sigue practicando 🐹');
hU.style.display='none';
}
function start(){
initHoles();
sc=0;combo=1;maxCombo=1;timeLeft=60;particles=[];shake=0;spawnT=0;
hitCount=0;missCount=0;swingT=0;
scT.innerText=sc;updateCombo();updateTime();
hU.style.display='block';
uI.style.display='none';
running=true;lastTime=0;
for(let i=0;i<6;i++)spawnMole();
anim=requestAnimationFrame(tick);
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
initHoles();
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