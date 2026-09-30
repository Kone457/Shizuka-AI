import crypto from 'crypto'
const MOTO_RACING_HTML = `
<div style="width:100%;height:600px;background:#05070b;position:relative;overflow:hidden;font-family:'Segoe UI',sans-serif;user-select:none;color:#fff;">
<canvas id="mrC" width="360" height="600" style="width:100%;height:100%;display:block;touch-action:none;"></canvas>
<div id="mrMenu" style="position:absolute;inset:0;z-index:20;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;background:radial-gradient(circle at 50% 35%,rgba(80,18,0,.96),rgba(3,5,10,.99) 72%);">
<h1 style="margin:0;color:#fff;font-size:32px;letter-spacing:3px;white-space:nowrap;text-shadow:0 0 10px #ff4d00,0 0 35px #ff1e00;">MOTO RACING</h1>
<div style="color:#b18b7d;font-size:11px;margin:10px 0 25px;text-align:center;line-height:1.7;">🏍️ Velocidad extrema · Tráfico · Nitro<br>Esquiva, acelera y consigue el récord.</div>
<div style="width:100%;max-width:290px;padding:15px 18px;box-sizing:border-box;background:rgba(255,255,255,.035);border:1px solid rgba(255,77,0,.25);border-radius:16px;margin-bottom:18px;">
<div style="display:flex;justify-content:space-between;color:#8e7167;font-size:9px;letter-spacing:2px;"><span>RÉCORD</span><span>MONEDAS</span></div>
<div style="display:flex;justify-content:space-between;align-items:center;margin-top:5px;"><strong id="mrBest" style="font-size:24px;color:#ff5a1f;">0 m</strong><span id="mrCoins" style="font-size:18px;color:#ffd447;">0 🪙</span></div>
</div>
<button id="mrStart" type="button" style="width:100%;max-width:290px;padding:15px;border:0;border-radius:30px;background:linear-gradient(135deg,#ff5a1f,#ff1e00);color:#fff;font-size:14px;font-weight:900;letter-spacing:3px;box-shadow:0 0 30px rgba(255,69,0,.3);">ARRANCAR</button>
</div>
<div id="mrHUD" style="position:absolute;top:0;left:0;width:100%;z-index:8;display:none;pointer-events:none;">
<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 13px;background:linear-gradient(180deg,rgba(3,5,9,.98),rgba(3,5,9,.55));border-bottom:1px solid rgba(255,77,0,.18);">
<div><div style="font-size:8px;color:#8e7167;letter-spacing:2px;">DISTANCIA</div><div id="mrDistance" style="font:900 17px monospace;color:#fff;">0 m</div></div>
<div style="text-align:center;"><div style="font-size:8px;color:#8e7167;letter-spacing:2px;">VELOCIDAD</div><div id="mrSpeed" style="font:900 17px monospace;color:#ff5a1f;">0 KM/H</div></div>
<div style="text-align:right;"><div style="font-size:8px;color:#8e7167;letter-spacing:2px;">MONEDAS</div><div id="mrCoinHud" style="font:900 17px monospace;color:#ffd447;">0</div></div>
</div>
</div>
<div id="mrNitro" style="position:absolute;left:15px;bottom:80px;width:125px;height:13px;border:1px solid rgba(0,190,255,.5);border-radius:10px;background:rgba(0,0,0,.5);z-index:9;display:none;overflow:hidden;"><div id="mrNitroFill" style="height:100%;width:100%;background:linear-gradient(90deg,#00cfff,#008cff);box-shadow:0 0 12px #00cfff;"></div></div>
<div id="mrControls" style="position:absolute;bottom:0;left:0;width:100%;z-index:10;display:none;justify-content:space-between;align-items:end;padding:12px;box-sizing:border-box;pointer-events:none;">
<div style="display:flex;gap:8px;pointer-events:auto;">
<button id="mrLeft" type="button" style="width:62px;height:54px;border:1px solid rgba(255,255,255,.2);border-radius:15px;background:rgba(0,0,0,.55);color:#fff;font-size:25px;">◀</button>
<button id="mrRight" type="button" style="width:62px;height:54px;border:1px solid rgba(255,255,255,.2);border-radius:15px;background:rgba(0,0,0,.55);color:#fff;font-size:25px;">▶</button>
</div>
<button id="mrBoost" type="button" style="width:75px;height:54px;border:1px solid #00cfff;border-radius:15px;background:rgba(0,120,180,.2);color:#00cfff;font-size:10px;font-weight:900;pointer-events:auto;">NITRO<br>⚡</button>
</div>
<div id="mrResult" style="position:absolute;inset:0;z-index:15;display:none;align-items:center;justify-content:center;background:rgba(2,4,8,.8);backdrop-filter:blur(5px);">
<div style="width:285px;padding:27px 20px;text-align:center;background:linear-gradient(145deg,rgba(30,15,8,.98),rgba(4,6,10,.99));border:1px solid rgba(255,77,0,.4);border-radius:22px;box-shadow:0 0 50px rgba(255,69,0,.18);">
<div id="mrResultIcon" style="font-size:48px;">💥</div>
<div id="mrResultTitle" style="font-size:25px;font-weight:900;letter-spacing:3px;margin:8px 0;color:#ff5a1f;">¡CHOQUE!</div>
<div id="mrResultText" style="font-size:12px;color:#9c8075;line-height:1.7;"></div>
<button id="mrAgain" type="button" style="margin-top:20px;width:100%;padding:13px;border:0;border-radius:25px;background:linear-gradient(135deg,#ff5a1f,#ff1e00);color:#fff;font-weight:900;letter-spacing:2px;">VOLVER A CORRER</button>
</div>
</div>
<script>
(function(){
'use strict';
const canvas=document.getElementById('mrC');
const ctx=canvas.getContext('2d',{alpha:false});
const W=360,H=600;
const menu=document.getElementById('mrMenu');
const hud=document.getElementById('mrHUD');
const controls=document.getElementById('mrControls');
const nitroBox=document.getElementById('mrNitro');
const nitroFill=document.getElementById('mrNitroFill');
const result=document.getElementById('mrResult');
const startBtn=document.getElementById('mrStart');
const againBtn=document.getElementById('mrAgain');
const leftBtn=document.getElementById('mrLeft');
const rightBtn=document.getElementById('mrRight');
const boostBtn=document.getElementById('mrBoost');
const distanceEl=document.getElementById('mrDistance');
const speedEl=document.getElementById('mrSpeed');
const coinHud=document.getElementById('mrCoinHud');
const bestEl=document.getElementById('mrBest');
const coinsEl=document.getElementById('mrCoins');
const resultIcon=document.getElementById('mrResultIcon');
const resultTitle=document.getElementById('mrResultTitle');
const resultText=document.getElementById('mrResultText');
let running=false;
let x=180;
let targetX=180;
let distance=0;
let coins=0;
let totalCoins=0;
let best=0;
let speed=5;
let nitro=100;
let roadOffset=0;
let spawnTimer=500;
let coinTimer=300;
let shake=0;
let last=performance.now();
let enemies=[];
let pickups=[];
let particles=[];
let keys={left:false,right:false,boost:false};
let touchDir=0;
const road={left:48,right:312};
function reset(){
running=true;
x=180;
targetX=180;
distance=0;
coins=0;
speed=5;
nitro=100;
roadOffset=0;
spawnTimer=500;
coinTimer=300;
shake=0;
enemies=[];
pickups=[];
particles=[];
menu.style.display='none';
hud.style.display='block';
controls.style.display='flex';
nitroBox.style.display='block';
result.style.display='none';
updateHUD();
}
function updateHUD(){
distanceEl.textContent=Math.floor(distance)+' m';
speedEl.textContent=Math.floor(speed*20)+' KM/H';
coinHud.textContent=coins;
nitroFill.style.width=Math.max(0,nitro)+'%';
}
function spawnEnemy(){
const lanes=[88,134,180,226,272];
const lane=lanes[Math.floor(Math.random()*lanes.length)];
const types=[
{type:'car',w:30,h:53,color:'#e62d42'},
{type:'car',w:31,h:55,color:'#247cff'},
{type:'car',w:29,h:51,color:'#ffd22e'},
{type:'bike',w:20,h:57,color:'#b84cff'},
{type:'bike',w:20,h:57,color:'#00d9a6'}
];
const t=types[Math.floor(Math.random()*types.length)];
enemies.push({x:lane,y:-80,w:t.w,h:t.h,color:t.color,type:t.type,speed:1.5+Math.random()*2.4,tilt:(Math.random()-.5)*.06});
}
function spawnCoin(){
const lanes=[88,134,180,226,272];
pickups.push({x:lanes[Math.floor(Math.random()*lanes.length)],y:-30,r:8,spin:0});
}
function particle(px,py,color){
particles.push({x:px,y:py,vx:(Math.random()-.5)*6,vy:(Math.random()-.5)*7,life:1,size:2+Math.random()*4,color});
}
function drawSky(){
const g=ctx.createLinearGradient(0,0,0,240);
g.addColorStop(0,'#050914');
g.addColorStop(.55,'#0b1721');
g.addColorStop(1,'#17242a');
ctx.fillStyle=g;
ctx.fillRect(0,0,W,H);
ctx.fillStyle='rgba(255,90,30,.08)';
ctx.beginPath();
ctx.arc(180,170,90,0,Math.PI*2);
ctx.fill();
for(let i=0;i<35;i++){
const sx=(i*73)%360;
const sy=(i*37)%180;
ctx.fillStyle='rgba(255,255,255,.5)';
ctx.fillRect(sx,sy,1,1);
}
}
function drawRoad(){
drawSky();
ctx.fillStyle='#0b0e12';
ctx.beginPath();
ctx.moveTo(72,0);
ctx.lineTo(288,0);
ctx.lineTo(312,H);
ctx.lineTo(48,H);
ctx.closePath();
ctx.fill();
const sideGrad=ctx.createLinearGradient(0,0,0,H);
sideGrad.addColorStop(0,'#10161b');
sideGrad.addColorStop(1,'#252016');
ctx.fillStyle=sideGrad;
ctx.beginPath();
ctx.moveTo(0,0);
ctx.lineTo(72,0);
ctx.lineTo(48,H);
ctx.lineTo(0,H);
ctx.closePath();
ctx.fill();
ctx.beginPath();
ctx.moveTo(288,0);
ctx.lineTo(360,0);
ctx.lineTo(360,H);
ctx.lineTo(312,H);
ctx.closePath();
ctx.fill();
const seg=38;
for(let y=-seg;y<H+seg;y+=seg){
const yy=(y+roadOffset)%seg;
const stripe=Math.floor((y+roadOffset)/seg)%2===0;
ctx.fillStyle=stripe?'#f2f2f2':'#e23b2e';
ctx.fillRect(51,yy,6,20);
ctx.fillRect(303,yy,6,20);
}
ctx.strokeStyle='rgba(255,255,255,.72)';
ctx.lineWidth=3;
ctx.setLineDash([25,19]);
ctx.lineDashOffset=-roadOffset;
ctx.beginPath();
ctx.moveTo(124,0);
ctx.lineTo(124,H);
ctx.moveTo(236,0);
ctx.lineTo(236,H);
ctx.stroke();
ctx.setLineDash([]);
ctx.strokeStyle='rgba(255,77,0,.08)';
ctx.lineWidth=12;
ctx.beginPath();
ctx.moveTo(60,0);
ctx.lineTo(50,H);
ctx.moveTo(300,0);
ctx.lineTo(310,H);
ctx.stroke();
}
function drawWheel(cx,cy,r){
ctx.fillStyle='#050505';
ctx.beginPath();
ctx.arc(cx,cy,r,0,Math.PI*2);
ctx.fill();
ctx.strokeStyle='#5e6268';
ctx.lineWidth=2;
ctx.beginPath();
ctx.arc(cx,cy,r-2,0,Math.PI*2);
ctx.stroke();
ctx.strokeStyle='#24282d';
ctx.lineWidth=1;
for(let i=0;i<6;i++){
const a=i*Math.PI/3;
ctx.beginPath();
ctx.moveTo(cx+Math.cos(a)*2,cy+Math.sin(a)*2);
ctx.lineTo(cx+Math.cos(a)*(r-3),cy+Math.sin(a)*(r-3));
ctx.stroke();
}
ctx.fillStyle='#111';
ctx.beginPath();
ctx.arc(cx,cy,3,0,Math.PI*2);
ctx.fill();
}
function drawPlayerBike(){
const by=505;
ctx.save();
ctx.translate(x,by);
const lean=Math.max(-.25,Math.min(.25,(targetX-x)*-.035));
ctx.rotate(lean);
ctx.shadowBlur=18;
ctx.shadowColor='#ff4d00';
drawWheel(0,-28,9);
drawWheel(0,31,10);
ctx.shadowBlur=0;
ctx.fillStyle='#24272c';
ctx.beginPath();
ctx.moveTo(-5,-26);
ctx.lineTo(-14,-2);
ctx.lineTo(-9,27);
ctx.lineTo(9,27);
ctx.lineTo(14,-2);
ctx.lineTo(5,-26);
ctx.closePath();
ctx.fill();
ctx.strokeStyle='#666b72';
ctx.lineWidth=2;
ctx.beginPath();
ctx.moveTo(-5,-25);
ctx.lineTo(-11,25);
ctx.moveTo(5,-25);
ctx.lineTo(11,25);
ctx.stroke();
ctx.fillStyle='#ff3d18';
ctx.beginPath();
ctx.moveTo(-8,-19);
ctx.lineTo(8,-19);
ctx.lineTo(12,3);
ctx.lineTo(5,18);
ctx.lineTo(-5,18);
ctx.lineTo(-12,3);
ctx.closePath();
ctx.fill();
ctx.fillStyle='#ff742c';
ctx.beginPath();
ctx.moveTo(-7,-19);
ctx.lineTo(7,-19);
ctx.lineTo(4,-9);
ctx.lineTo(-4,-9);
ctx.closePath();
ctx.fill();
ctx.fillStyle='#11161b';
ctx.beginPath();
ctx.moveTo(-6,-8);
ctx.lineTo(6,-8);
ctx.lineTo(8,9);
ctx.lineTo(-8,9);
ctx.closePath();
ctx.fill();
ctx.fillStyle='#0a0d10';
ctx.beginPath();
ctx.ellipse(0,8,9,14,0,0,Math.PI*2);
ctx.fill();
ctx.fillStyle='#171a1e';
ctx.beginPath();
ctx.arc(0,-17,9,0,Math.PI*2);
ctx.fill();
ctx.fillStyle='#ffad7e';
ctx.beginPath();
ctx.arc(0,-19,5.5,0,Math.PI*2);
ctx.fill();
ctx.fillStyle='#101318';
ctx.beginPath();
ctx.arc(0,-22,7,Math.PI,Math.PI*2);
ctx.fill();
ctx.fillStyle='#00cfff';
ctx.shadowBlur=10;
ctx.shadowColor='#00cfff';
ctx.beginPath();
ctx.roundRect(-4,-26,8,5,2);
ctx.fill();
ctx.shadowBlur=0;
ctx.strokeStyle='#73787e';
ctx.lineWidth=2;
ctx.beginPath();
ctx.moveTo(-10,-17);
ctx.lineTo(-18,-10);
ctx.moveTo(10,-17);
ctx.lineTo(18,-10);
ctx.stroke();
ctx.fillStyle='#15181b';
ctx.fillRect(-19,-12,7,3);
ctx.fillRect(12,-12,7,3);
ctx.fillStyle='#fff';
ctx.shadowBlur=12;
ctx.shadowColor='#fff';
ctx.beginPath();
ctx.ellipse(0,-28,3.5,2.5,0,0,Math.PI*2);
ctx.fill();
ctx.shadowBlur=0;
ctx.fillStyle='#ff3030';
ctx.shadowBlur=8;
ctx.shadowColor='#ff3030';
ctx.beginPath();
ctx.ellipse(0,30,3.5,2.5,0,0,Math.PI*2);
ctx.fill();
ctx.shadowBlur=0;
if(keys.boost&&nitro>0){
ctx.fillStyle='#00cfff';
ctx.shadowBlur=18;
ctx.shadowColor='#00cfff';
ctx.beginPath();
ctx.moveTo(-4,36);
ctx.lineTo(0,65+Math.random()*15);
ctx.lineTo(4,36);
ctx.closePath();
ctx.fill();
ctx.fillStyle='#fff';
ctx.beginPath();
ctx.moveTo(-2,38);
ctx.lineTo(0,54+Math.random()*8);
ctx.lineTo(2,38);
ctx.closePath();
ctx.fill();
}
ctx.restore();
}
function drawEnemy(e){
ctx.save();
ctx.translate(e.x,e.y);
ctx.rotate(e.tilt);
if(e.type==='bike'){
drawWheel(0,-e.h*.35,6);
drawWheel(0,e.h*.34,6);
ctx.fillStyle=e.color;
ctx.shadowBlur=12;
ctx.shadowColor=e.color;
ctx.beginPath();
ctx.moveTo(0,-24);
ctx.lineTo(9,-4);
ctx.lineTo(7,20);
ctx.lineTo(-7,20);
ctx.lineTo(-9,-4);
ctx.closePath();
ctx.fill();
ctx.shadowBlur=0;
ctx.fillStyle='#17191d';
ctx.beginPath();
ctx.ellipse(0,7,8,13,0,0,Math.PI*2);
ctx.fill();
ctx.fillStyle='#16191d';
ctx.beginPath();
ctx.arc(0,-17,7,0,Math.PI*2);
ctx.fill();
ctx.fillStyle='#d28b68';
ctx.beginPath();
ctx.arc(0,-18,4,0,Math.PI*2);
ctx.fill();
ctx.fillStyle='#fff';
ctx.beginPath();
ctx.arc(0,-23,2.5,0,Math.PI*2);
ctx.fill();
}else{
ctx.shadowBlur=12;
ctx.shadowColor=e.color;
ctx.fillStyle=e.color;
ctx.beginPath();
ctx.roundRect(-e.w/2,-e.h/2,e.w,e.h,5);
ctx.fill();
ctx.shadowBlur=0;
ctx.fillStyle='#12171c';
ctx.beginPath();
ctx.roundRect(-e.w/2+4,-e.h/2+7,e.w-8,17,3);
ctx.fill();
ctx.fillStyle='rgba(130,200,255,.7)';
ctx.fillRect(-e.w/2+6,-e.h/2+9,e.w-12,6);
ctx.fillStyle='#111';
ctx.fillRect(-e.w/2-3,-e.h/2+8,4,13);
ctx.fillRect(e.w/2-1,-e.h/2+8,4,13);
ctx.fillRect(-e.w/2-3,e.h/2-21,4,13);
ctx.fillRect(e.w/2-1,e.h/2-21,4,13);
ctx.fillStyle='#fff';
ctx.fillRect(-e.w/2+5,e.h/2-9,5,4);
ctx.fillRect(e.w/2-10,e.h/2-9,5,4);
ctx.fillStyle='#ff3030';
ctx.fillRect(-e.w/2+5,-e.h/2+3,5,4);
ctx.fillRect(e.w/2-10,-e.h/2+3,5,4);
}
ctx.restore();
}
function drawCoin(c){
ctx.save();
ctx.translate(c.x,c.y);
ctx.rotate(c.spin);
ctx.shadowBlur=15;
ctx.shadowColor='#ffd447';
ctx.fillStyle='#ffd447';
ctx.beginPath();
ctx.arc(0,0,c.r,0,Math.PI*2);
ctx.fill();
ctx.fillStyle='#8b6200';
ctx.font='900 9px Arial';
ctx.textAlign='center';
ctx.textBaseline='middle';
ctx.fillText('★',0,0);
ctx.restore();
}
function drawParticles(dt){
for(let i=particles.length-1;i>=0;i--){
const p=particles[i];
p.x+=p.vx*dt*.06;
p.y+=p.vy*dt*.06;
p.vy+=.04;
p.life-=dt*.0028;
if(p.life<=0){particles.splice(i,1);continue;}
ctx.globalAlpha=p.life;
ctx.fillStyle=p.color;
ctx.beginPath();
ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
ctx.fill();
}
ctx.globalAlpha=1;
}
function collision(e){
return Math.abs(x-e.x)<(e.w/2+12)&&Math.abs(505-e.y)<(e.h/2+25);
}
function crash(){
if(!running)return;
running=false;
shake=18;
for(let i=0;i<45;i++)particle(x,505,i%2?'#ff4d00':'#ffd447');
if(Math.floor(distance)>best)best=Math.floor(distance);
totalCoins+=coins;
bestEl.textContent=best+' m';
coinsEl.textContent=totalCoins+' 🪙';
controls.style.display='none';
nitroBox.style.display='none';
resultIcon.textContent='💥';
resultTitle.textContent='¡CHOQUE!';
resultTitle.style.color='#ff5a1f';
resultText.innerHTML='Distancia: <b style="color:#fff;">'+Math.floor(distance)+' m</b><br>Monedas: <b style="color:#ffd447;">+'+coins+' 🪙</b><br><br>Récord: <b style="color:#ff5a1f;">'+best+' m</b>';
setTimeout(()=>result.style.display='flex',400);
}
function update(dt){
if(!running)return;
const f=dt/16.67;
if(keys.left||touchDir<0)targetX-=5*f;
if(keys.right||touchDir>0)targetX+=5*f;
targetX=Math.max(78,Math.min(282,targetX));
x+=(targetX-x)*Math.min(1,.18*f);
if(keys.boost&&nitro>0){
speed=Math.min(15,speed+.08*f);
nitro-=.9*f;
}else{
speed=Math.min(12,speed+.006*f);
nitro=Math.min(100,nitro+.1*f);
}
if(nitro<=0)nitro=0;
distance+=speed*.045*f;
roadOffset=(roadOffset+speed*f*2.4)%38;
spawnTimer-=dt;
coinTimer-=dt;
if(spawnTimer<=0){
spawnEnemy();
spawnTimer=Math.max(300,780-speed*32)+Math.random()*350;
}
if(coinTimer<=0){
spawnCoin();
coinTimer=550+Math.random()*700;
}
for(let i=enemies.length-1;i>=0;i--){
const e=enemies[i];
e.y+=(speed+e.speed)*f;
if(collision(e)){crash();return;}
if(e.y>660)enemies.splice(i,1);
}
for(let i=pickups.length-1;i>=0;i--){
const c=pickups[i];
c.y+=(speed+2)*f;
c.spin+=.12*f;
if(Math.abs(c.x-x)<19&&Math.abs(c.y-505)<32){
coins++;
for(let j=0;j<10;j++)particle(c.x,c.y,'#ffd447');
pickups.splice(i,1);
continue;
}
if(c.y>650)pickups.splice(i,1);
}
updateHUD();
}
function render(t){
const dt=Math.min(35,t-last);
last=t;
ctx.save();
if(shake>0){
ctx.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);
shake*=.88;
if(shake<.2)shake=0;
}
drawRoad();
for(const c of pickups)drawCoin(c);
for(const e of enemies)drawEnemy(e);
drawPlayerBike();
drawParticles(dt);
ctx.restore();
update(dt);
requestAnimationFrame(render);
}
function hold(btn,dir){
const down=e=>{e.preventDefault();touchDir=dir};
const up=e=>{e.preventDefault();if(touchDir===dir)touchDir=0};
btn.addEventListener('pointerdown',down);
btn.addEventListener('pointerup',up);
btn.addEventListener('pointercancel',up);
btn.addEventListener('touchstart',down,{passive:false});
btn.addEventListener('touchend',up,{passive:false});
}
hold(leftBtn,-1);
hold(rightBtn,1);
const boostDown=e=>{e.preventDefault();keys.boost=true};
const boostUp=e=>{e.preventDefault();keys.boost=false};
boostBtn.addEventListener('pointerdown',boostDown);
boostBtn.addEventListener('pointerup',boostUp);
boostBtn.addEventListener('pointercancel',boostUp);
boostBtn.addEventListener('touchstart',boostDown,{passive:false});
boostBtn.addEventListener('touchend',boostUp,{passive:false});
window.addEventListener('keydown',e=>{
if(e.key==='ArrowLeft'||e.key.toLowerCase()==='a')keys.left=true;
if(e.key==='ArrowRight'||e.key.toLowerCase()==='d')keys.right=true;
if(e.code==='Space')keys.boost=true;
});
window.addEventListener('keyup',e=>{
if(e.key==='ArrowLeft'||e.key.toLowerCase()==='a')keys.left=false;
if(e.key==='ArrowRight'||e.key.toLowerCase()==='d')keys.right=false;
if(e.code==='Space')keys.boost=false;
});
canvas.addEventListener('touchmove',e=>{
if(!running)return;
const r=canvas.getBoundingClientRect();
targetX=Math.max(78,Math.min(282,(e.touches[0].clientX-r.left)*(W/r.width)));
},{passive:true});
function start(e){
if(e)e.preventDefault();
reset();
}
startBtn.addEventListener('click',start);
startBtn.addEventListener('pointerup',start);
startBtn.addEventListener('touchend',start,{passive:false});
againBtn.addEventListener('click',start);
againBtn.addEventListener('pointerup',start);
againBtn.addEventListener('touchend',start,{passive:false});
updateHUD();
requestAnimationFrame(render);
})();
</script>
</div>
`
const handler = async (m,{conn}) => {
const jid=m.chat||m.key?.remoteJid
if(!jid)return
await conn.relayMessage(jid,{
messageContextInfo:{deviceListMetadata:{},deviceListMetadataVersion:2},
botForwardedMessage:{
message:{
richResponseMessage:{
messageType:1,
submessages:[{messageType:2,messageText:'🏍️ MOTO RACING'}],
unifiedResponse:{
data:Buffer.from(JSON.stringify({
response_id:crypto.randomUUID(),
sections:[{
view_model:{
primitive:{
__typename:'GenAIaeacdsnwHtmlPrimitive',
payload:MOTO_RACING_HTML,
trusted_sources:[]
},
__typename:'GenAISingleLayoutViewModel'
}
}]
})).toString('base64')
},
contextInfo:{forwardingScore:1,isForwarded:true,forwardOrigin:4}
}
}
}
}, {})
}
handler.help=['moto']
handler.tags=['game']
handler.command=['moto']
export default handler