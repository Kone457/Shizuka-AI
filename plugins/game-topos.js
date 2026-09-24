import crypto from 'crypto'

const WHACK_HTML = `
<div style="width:100%;height:600px;background:#5a3a1a;position:relative;overflow:hidden;font-family:'Segoe UI',sans-serif;user-select:none;touch-action:none;">
<canvas id="wC" width="360" height="600" style="width:100%;height:100%;display:block;"></canvas>
<div id="wUI" style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;align-items:center;background:rgba(30,15,5,0.94);z-index:10;padding:20px;box-sizing:border-box;">
<h1 style="color:#ffd700;text-shadow:0 4px 0 #8b4513,0 0 30px #ffd700;font-size:34px;margin:0 0 10px;letter-spacing:3px;font-weight:900;text-align:center;font-family:Impact,sans-serif;">WHACK-A-MOLE</h1>
<p style="color:#ffe8b0;margin:0 0 24px;font-size:13px;text-align:center;line-height:1.8;text-shadow:1px 1px 2px #000;">¡Aplasta a los topos con el mazo!<br>Evita las bombas 💣<br>60 segundos de furia</p>
<button id="wSB" style="padding:16px 44px;background:linear-gradient(180deg,#ffcc00,#cc8800);border:3px solid #5a2a00;border-radius:14px;color:#3a1a00;font-size:16px;font-weight:900;cursor:pointer;text-transform:uppercase;letter-spacing:2px;box-shadow:0 5px 0 #5a2a00,0 8px 20px rgba(0,0,0,0.5);text-shadow:0 1px 0 rgba(255,255,255,0.4);">JUGAR</button>
</div>
<div id="wHU" style="position:absolute;top:0;left:0;width:100%;box-sizing:border-box;color:#fff;display:none;pointer-events:none;z-index:5;font-family:monospace;">
<div style="display:flex;justify-content:space-between;padding:10px 15px;background:linear-gradient(180deg,rgba(60,30,10,0.9),rgba(60,30,10,0));">
<div><div style="font-size:9px;color:#ffd700;letter-spacing:2px;text-shadow:1px 1px 2px #000;">PUNTOS</div><div id="wSc" style="font-size:22px;font-weight:900;color:#fff;text-shadow:2px 2px 0 #000,0 0 10px #ffd700;">0</div></div>
<div style="text-align:center;"><div style="font-size:9px;color:#ffd700;letter-spacing:2px;text-shadow:1px 1px 2px #000;">RACHA</div><div id="wCb" style="font-size:22px;font-weight:900;color:#fa0;text-shadow:2px 2px 0 #000;">x1</div></div>
<div style="text-align:right;"><div style="font-size:9px;color:#ffd700;letter-spacing:2px;text-shadow:1px 1px 2px #000;">TIEMPO</div><div id="wTm" style="font-size:22px;font-weight:900;color:#ff4444;text-shadow:2px 2px 0 #000;">60s</div></div>
</div>
<div style="padding:0 15px;"><div style="width:100%;height:10px;background:#1a0a00;border:2px solid #5a2a00;border-radius:5px;overflow:hidden;box-shadow:inset 0 2px 4px rgba(0,0,0,0.8);"><div id="wBr" style="width:100%;height:100%;background:linear-gradient(90deg,#ff0000,#ffaa00,#00ff00);"></div></div></div>
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
const TOP=110;
const CH=(H-TOP-30)/ROWS;
let holes,sc,combo,maxCombo,timeLeft,running,anim,lastTime,swingT,swingX,swingY,particles,shake,spawnT,hitCount,missCount,hitParticles,grassBlades,dirtSpecks;
function initHoles(){
holes=[];
for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){
const cx=CW*x+CW/2;
const cy=TOP+CH*y+CH/2;
holes.push({
cx,cy,
holeCX:cx,
holeCY:cy+CH*0.15,
holeRX:CW*0.42,
holeRY:CH*0.24,
type:'none',
time:0,
dur:0,
up:0,
hitAnim:0
});
}
grassBlades=[];
for(let i=0;i<120;i++){
grassBlades.push({
x:Math.random()*W,
y:TOP-30+Math.random()*(H-TOP),
len:3+Math.random()*6,
ang:(Math.random()-0.5)*0.6,
col:Math.random()<0.5?'#2d5a1a':'#3a7a20'
});
}
dirtSpecks=[];
for(let i=0;i<200;i++){
dirtSpecks.push({
x:Math.random()*W,
y:TOP+Math.random()*(H-TOP),
r:0.5+Math.random()*1.8,
a:0.1+Math.random()*0.25,
col:Math.random()<0.6?'#3a2010':'#5a3a1a'
});
}
hitParticles=[];
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
h.up=0;
h.hitAnim=0;
}
function updateHoles(dt){
for(const h of holes){
if(h.type==='none'){h.up=Math.max(0,h.up-dt/120);continue;}
h.time+=dt;
if(h.type==='hit'){
h.hitAnim+=dt;
h.up=Math.max(0,1-h.hitAnim/200);
if(h.hitAnim>=200){h.type='none';h.up=0;h.hitAnim=0;}
continue;
}
const t=h.time;
if(t<140)h.up=t/140;
else if(t>h.dur-140)h.up=Math.max(0,(h.dur-t)/140);
else h.up=1;
if(t>=h.dur){h.type='none';h.up=0;}
}
}
function spawnParticles(x,y,color,n){
for(let i=0;i<n;i++)particles.push({
x,y,vx:(Math.random()-0.5)*10,vy:-Math.random()*8-2,
life:1,color,size:2+Math.random()*5,grav:0.4
});
}
function spawnDirt(x,y,n){
for(let i=0;i<n;i++)hitParticles.push({
x:x+(Math.random()-0.5)*30,
y:y+(Math.random()-0.5)*10,
vx:(Math.random()-0.5)*4,
vy:-Math.random()*3-1,
life:1,
size:1+Math.random()*3,
color:Math.random()<0.5?'#5a3a1a':'#3a2010'
});
}
function popText(x,y,text,color){
particles.push({x,y,vx:0,vy:-1.8,life:1,color,text,isText:true,grav:0});
}
function drawBackground(){
const sky=ctx.createLinearGradient(0,0,0,TOP);
sky.addColorStop(0,'#87ceeb');sky.addColorStop(0.7,'#b0e0f0');sky.addColorStop(1,'#d8f0d8');
ctx.fillStyle=sky;ctx.fillRect(0,0,W,TOP);
const sun=ctx.createRadialGradient(W*0.8,50,5,W*0.8,50,60);
sun.addColorStop(0,'rgba(255,255,180,0.9)');sun.addColorStop(1,'rgba(255,255,180,0)');
ctx.fillStyle=sun;ctx.fillRect(0,0,W,TOP);
ctx.fillStyle='#ffd700';
ctx.beginPath();ctx.arc(W*0.8,50,22,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#a0d0a0';
ctx.beginPath();
ctx.moveTo(0,TOP-15);
for(let i=0;i<=W;i+=20){
ctx.lineTo(i,TOP-15-Math.sin(i*0.05)*8);
}
ctx.lineTo(W,TOP);
ctx.lineTo(0,TOP);
ctx.fill();
const ground=ctx.createLinearGradient(0,TOP,0,H);
ground.addColorStop(0,'#4a7a2a');
ground.addColorStop(0.4,'#3a5a1a');
ground.addColorStop(1,'#2a3a10');
ctx.fillStyle=ground;ctx.fillRect(0,TOP,W,H-TOP);
for(const d of dirtSpecks){
ctx.globalAlpha=d.a;
ctx.fillStyle=d.col;
ctx.beginPath();ctx.arc(d.x,d.y,d.r,0,Math.PI*2);ctx.fill();
}
ctx.globalAlpha=1;
for(const g of grassBlades){
ctx.strokeStyle=g.col;ctx.lineWidth=1.2;
ctx.beginPath();
ctx.moveTo(g.x,g.y);
ctx.quadraticCurveTo(g.x+g.ang*3,g.y-g.len*0.6,g.x+g.ang*6,g.y-g.len);
ctx.stroke();
}
}
function drawHoleTop(h){
ctx.save();
ctx.beginPath();
ctx.ellipse(h.holeCX,h.holeCY-2,h.holeRX,h.holeRY,0,Math.PI,Math.PI*2);
ctx.strokeStyle='#1a0a00';
ctx.lineWidth=3;
ctx.stroke();
ctx.beginPath();
ctx.ellipse(h.holeCX,h.holeCY-2,h.holeRX-2,h.holeRY-1,0,Math.PI,Math.PI*2);
ctx.strokeStyle='#2a1505';
ctx.lineWidth=1.5;
ctx.stroke();
ctx.restore();
}
function drawHole(h){
ctx.save();
ctx.fillStyle='#000';
ctx.beginPath();
ctx.ellipse(h.holeCX,h.holeCY+3,h.holeRX+2,h.holeRY+2,0,0,Math.PI*2);
ctx.fill();
const dirtG=ctx.createRadialGradient(h.holeCX,h.holeCY,2,h.holeCX,h.holeCY,h.holeRX);
dirtG.addColorStop(0,'#0a0500');
dirtG.addColorStop(0.7,'#2a1505');
dirtG.addColorStop(1,'#4a2a10');
ctx.fillStyle=dirtG;
ctx.beginPath();
ctx.ellipse(h.holeCX,h.holeCY,h.holeRX,h.holeRY,0,0,Math.PI*2);
ctx.fill();
ctx.strokeStyle='#1a0a00';ctx.lineWidth=2;
ctx.beginPath();
ctx.ellipse(h.holeCX,h.holeCY,h.holeRX,h.holeRY,0,0,Math.PI*2);
ctx.stroke();
ctx.restore();
}
function drawMole(h){
if(h.up<=0)return;
const e=h.up;
const ease=e<0.5?2*e*e:1-Math.pow(-2*e+2,2)/2;
const mx=h.holeCX;
const baseY=h.holeCY;
const hiddenY=baseY+h.holeRY*1.2;
const shownY=baseY-h.holeRY*0.85;
const my=hiddenY+(shownY-hiddenY)*ease;
const radius=Math.min(CW*0.32,CH*0.32);
ctx.save();
ctx.beginPath();
ctx.ellipse(h.holeCX,h.holeCY-2,h.holeRX-2,h.holeRY-2,0,0,Math.PI*2);
ctx.clip();
if(h.type==='bomb'){
drawBomb(mx,my,radius,ease);
}else{
drawRealMole(mx,my,radius,ease,h.type);
}
ctx.restore();
drawHoleTop(h);
}
function drawRealMole(mx,my,r,e,type){
let fur='#8b5a2b',furDark='#5a3a1a',furLight='#a07040',belly='#d4a574';
if(type==='gold'){
fur='#e6b800';furDark='#8a6a00';furLight='#ffdd44';belly='#fff0a0';
ctx.shadowBlur=25;ctx.shadowColor='#ffd700';
}else if(type==='fast'){
fur='#c07040';furDark='#803a10';furLight='#e0a070';belly='#f0c090';
}
ctx.save();
ctx.fillStyle=furDark;
ctx.beginPath();
ctx.ellipse(mx-r*0.75,my-r*0.55,r*0.32,r*0.42,-0.4,0,Math.PI*2);ctx.fill();
ctx.beginPath();
ctx.ellipse(mx+r*0.75,my-r*0.55,r*0.32,r*0.42,0.4,0,Math.PI*2);ctx.fill();
ctx.fillStyle=furLight;
ctx.beginPath();
ctx.ellipse(mx-r*0.75,my-r*0.6,r*0.16,r*0.22,-0.4,0,Math.PI*2);ctx.fill();
ctx.beginPath();
ctx.ellipse(mx+r*0.75,my-r*0.6,r*0.16,r*0.22,0.4,0,Math.PI*2);ctx.fill();
ctx.fillStyle=fur;
ctx.beginPath();
ctx.arc(mx,my,r,0,Math.PI*2);ctx.fill();
const faceG=ctx.createRadialGradient(mx-r*0.2,my-r*0.4,2,mx,my,r);
faceG.addColorStop(0,furLight);
faceG.addColorStop(1,fur);
ctx.fillStyle=faceG;
ctx.beginPath();
ctx.arc(mx,my-r*0.05,r*0.88,0,Math.PI*2);ctx.fill();
ctx.fillStyle=belly;
ctx.beginPath();
ctx.ellipse(mx,my+r*0.35,r*0.55,r*0.4,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#000';
ctx.beginPath();
ctx.ellipse(mx-r*0.38,my-r*0.35,r*0.14,r*0.17,0,0,Math.PI*2);ctx.fill();
ctx.beginPath();
ctx.ellipse(mx+r*0.38,my-r*0.35,r*0.14,r*0.17,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#fff';
ctx.beginPath();
ctx.arc(mx-r*0.33,my-r*0.4,r*0.05,0,Math.PI*2);ctx.fill();
ctx.beginPath();
ctx.arc(mx+r*0.43,my-r*0.4,r*0.05,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#f0a0a0';
ctx.beginPath();
ctx.ellipse(mx,my+r*0.1,r*0.28,r*0.2,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#d07070';
ctx.beginPath();
ctx.arc(mx-r*0.08,my+r*0.08,r*0.05,0,Math.PI*2);ctx.fill();
ctx.beginPath();
ctx.arc(mx+r*0.08,my+r*0.08,r*0.05,0,Math.PI*2);ctx.fill();
ctx.strokeStyle='#5a2a10';ctx.lineWidth=r*0.06;
ctx.beginPath();
ctx.moveTo(mx-r*0.2,my+r*0.32);
ctx.quadraticCurveTo(mx,my+r*0.45,mx+r*0.2,my+r*0.32);
ctx.stroke();
ctx.fillStyle='#fff';
ctx.beginPath();
ctx.moveTo(mx-r*0.12,my+r*0.38);
ctx.lineTo(mx-r*0.08,my+r*0.5);
ctx.lineTo(mx-r*0.04,my+r*0.38);
ctx.fill();
ctx.beginPath();
ctx.moveTo(mx+r*0.12,my+r*0.38);
ctx.lineTo(mx+r*0.08,my+r*0.5);
ctx.lineTo(mx+r*0.04,my+r*0.38);
ctx.fill();
ctx.fillStyle='rgba(255,255,255,0.15)';
ctx.beginPath();
ctx.ellipse(mx-r*0.35,my-r*0.5,r*0.25,r*0.15,-0.5,0,Math.PI*2);ctx.fill();
ctx.restore();
}
function drawBomb(mx,my,r,e){
ctx.save();
ctx.fillStyle='#1a1a1a';
ctx.beginPath();
ctx.arc(mx,my,r,0,Math.PI*2);ctx.fill();
const bG=ctx.createRadialGradient(mx-r*0.4,my-r*0.4,2,mx,my,r);
bG.addColorStop(0,'#555');
bG.addColorStop(0.6,'#222');
bG.addColorStop(1,'#000');
ctx.fillStyle=bG;
ctx.beginPath();
ctx.arc(mx,my,r*0.95,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#666';
ctx.beginPath();
ctx.ellipse(mx-r*0.4,my-r*0.45,r*0.28,r*0.18,-0.6,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#888';
ctx.fillRect(mx-r*0.1,my-r*1.1,r*0.2,r*0.25);
ctx.strokeStyle='#8a6a3a';ctx.lineWidth=r*0.12;
ctx.beginPath();
ctx.moveTo(mx+r*0.05,my-r*1.1);
ctx.quadraticCurveTo(mx+r*0.5,my-r*1.5,mx+r*0.2,my-r*1.9);
ctx.stroke();
const flick=Math.sin(Date.now()*0.02)*0.3+0.7;
ctx.shadowBlur=15*flick;ctx.shadowColor='#ffaa00';
ctx.fillStyle='#ffaa00';
ctx.beginPath();ctx.arc(mx+r*0.2,my-r*1.95,r*0.22*flick+0.5,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#ffff00';
ctx.beginPath();ctx.arc(mx+r*0.2,my-r*1.95,r*0.12*flick,0,Math.PI*2);ctx.fill();
ctx.shadowBlur=0;
ctx.fillStyle='#fff';
ctx.beginPath();
ctx.arc(mx+r*0.2,my-r*1.95,r*0.05,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#000';
ctx.beginPath();
ctx.arc(mx-r*0.25,my-r*0.1,r*0.12,0,Math.PI*2);ctx.fill();
ctx.beginPath();
ctx.arc(mx+r*0.25,my-r*0.1,r*0.12,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#fff';
ctx.beginPath();
ctx.arc(mx-r*0.22,my-r*0.13,r*0.04,0,Math.PI*2);ctx.fill();
ctx.beginPath();
ctx.arc(mx+r*0.28,my-r*0.13,r*0.04,0,Math.PI*2);ctx.fill();
ctx.strokeStyle='#000';ctx.lineWidth=r*0.1;
ctx.beginPath();
ctx.arc(mx,my+r*0.3,r*0.35,0.15*Math.PI,0.85*Math.PI);
ctx.stroke();
ctx.restore();
}
function drawHammer(){
if(swingT<=0)return;
const ang=-Math.PI/2+Math.sin(swingT*Math.PI)*1.6;
ctx.save();
ctx.translate(swingX,swingY);
ctx.rotate(ang);
ctx.shadowBlur=15;ctx.shadowColor='rgba(0,0,0,0.5)';
ctx.shadowOffsetX=4;ctx.shadowOffsetY=4;
const handleG=ctx.createLinearGradient(-6,0,6,0);
handleG.addColorStop(0,'#5a3a1a');
handleG.addColorStop(0.5,'#a07040');
handleG.addColorStop(1,'#5a3a1a');
ctx.fillStyle=handleG;
ctx.beginPath();
if(ctx.roundRect)ctx.roundRect(-6,0,12,65,3);else ctx.rect(-6,0,12,65);
ctx.fill();
ctx.shadowBlur=0;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;
const headG=ctx.createLinearGradient(-26,-26,26,4);
headG.addColorStop(0,'#3a3a3a');
headG.addColorStop(0.5,'#8a8a8a');
headG.addColorStop(1,'#4a4a4a');
ctx.fillStyle=headG;
ctx.beginPath();
if(ctx.roundRect)ctx.roundRect(-26,-26,52,32,5);else ctx.rect(-26,-26,52,32);
ctx.fill();
ctx.strokeStyle='#1a1a1a';ctx.lineWidth=2;
ctx.beginPath();
if(ctx.roundRect)ctx.roundRect(-26,-26,52,32,5);else ctx.rect(-26,-26,52,32);
ctx.stroke();
ctx.fillStyle='rgba(255,255,255,0.4)';
ctx.beginPath();
if(ctx.roundRect)ctx.roundRect(-22,-23,20,5,2);else ctx.rect(-22,-23,20,5);
ctx.fill();
ctx.fillStyle='#2a2a2a';
ctx.fillRect(-26,-26,52,4);
ctx.restore();
}
function draw(){
let sx=0,sy=0;
if(shake>0){sx=(Math.random()-0.5)*shake;sy=(Math.random()-0.5)*shake;shake*=0.85;if(shake<0.2)shake=0;}
ctx.setTransform(1,0,0,1,0,0);
ctx.fillStyle='#2a3a10';ctx.fillRect(0,0,W,H);
ctx.translate(sx,sy);
drawBackground();
for(const h of holes)drawHole(h);
for(const h of holes)drawMole(h);
for(let i=particles.length-1;i>=0;i--){
const p=particles[i];
p.x+=p.vx;p.y+=p.vy;
if(p.grav)p.vy+=p.grav;
p.life-=0.025;
if(p.life<=0){particles.splice(i,1);continue;}
ctx.globalAlpha=p.life;
if(p.isText){
ctx.font='bold 24px Impact,sans-serif';
ctx.textAlign='center';
ctx.strokeStyle='#000';ctx.lineWidth=4;
ctx.strokeText(p.text,p.x,p.y);
ctx.fillStyle=p.color;
ctx.fillText(p.text,p.x,p.y);
}else{
ctx.fillStyle=p.color;
ctx.beginPath();
ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();
}
}
ctx.globalAlpha=1;
for(let i=hitParticles.length-1;i>=0;i--){
const p=hitParticles[i];
p.x+=p.vx;p.y+=p.vy;p.vy+=0.4;p.life-=0.02;
if(p.life<=0){hitParticles.splice(i,1);continue;}
ctx.globalAlpha=p.life;
ctx.fillStyle=p.color;
ctx.beginPath();
ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();
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
if(h.up<0.3)continue;
const d=Math.hypot(mx-h.holeCX,my-h.holeCY);
if(d<CW*0.42){
if(h.type==='bomb'){
h.type='hit';h.hitAnim=0;
combo=1;
sc=Math.max(0,sc-50);
spawnParticles(h.holeCX,h.holeCY-30,'#ff4400',35);
spawnParticles(h.holeCX,h.holeCY-30,'#ffff00',20);
spawnDirt(h.holeCX,h.holeCY,25);
popText(h.holeCX,h.holeCY-50,'-50','#ff2222');
shake=22;scT.innerText=sc;updateCombo();
return true;
}
let pts=10,col='#ffdd00';
if(h.type==='gold'){pts=50;col='#ffd700';}
else if(h.type==='fast'){pts=20;col='#ffaa00';}
pts*=combo;
sc+=pts;hitCount++;
spawnParticles(h.holeCX,h.holeCY-20,'#ffffff',8);
spawnDirt(h.holeCX,h.holeCY,15);
popText(h.holeCX,h.holeCY-50,'+'+pts,col);
h.type='hit';h.hitAnim=0;
shake=8;combo++;
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
if(combo>=20)cbT.style.color='#ff00ff';
else if(combo>=10)cbT.style.color='#ff8800';
else if(combo>=5)cbT.style.color='#ffff00';
else cbT.style.color='#ffaa00';
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
uI.querySelector('p').innerHTML='<b style="color:#ffd700">Puntos: '+sc+'</b><br><b style="color:#ffaa00">Mejor racha: x'+maxCombo+'</b><br><b style="color:#00ddff">Precisión: '+rate+'%</b><br><br>'+(sc>800?'¡Maestro del mazo! 🔨':sc>400?'¡Buen trabajo! 💪':'Sigue practicando 🐹');
hU.style.display='none';
}
function start(){
initHoles();
sc=0;combo=1;maxCombo=1;timeLeft=60;particles=[];hitParticles=[];shake=0;spawnT=0;
hitCount=0;missCount=0;swingT=0;
scT.innerText=sc;updateCombo();updateTime();
hU.style.display='block';
uI.style.display='none';
running=true;lastTime=0;
for(let i=0;i<5;i++)spawnMole();
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
swingX=h.holeCX;swingY=h.holeCY-30;swingT=1;
hitHole(h.holeCX,h.holeCY);
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