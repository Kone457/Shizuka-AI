import crypto from 'crypto'

const RACE_HTML = `
<div style="width:100%;height:600px;background:#0a0a1a;position:relative;overflow:hidden;font-family:'Segoe UI',sans-serif;user-select:none;touch-action:none;">
<canvas id="rC" width="360" height="600" style="width:100%;height:100%;display:block;"></canvas>
<div id="rUI" style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;align-items:center;background:rgba(0,0,0,0.92);z-index:10;padding:20px;box-sizing:border-box;">
<h1 style="color:#ff0;text-shadow:0 0 20px #ff0,0 0 40px #f80,0 4px 0 #f00;font-size:38px;margin:0 0 10px;letter-spacing:4px;font-weight:900;text-align:center;font-family:Impact,sans-serif;">RACE</h1>
<p style="color:#8af;margin:0 0 24px;font-size:13px;text-align:center;line-height:1.8;">Esquiva el tráfico a toda velocidad<br>Recoge monedas 🪙 y nitro ⚡<br>¡Llega lo más lejos posible!</p>
<button id="rSB" style="padding:16px 44px;background:linear-gradient(180deg,#ff0,#f80);border:3px solid #a00;border-radius:14px;color:#3a0000;font-size:16px;font-weight:900;cursor:pointer;text-transform:uppercase;letter-spacing:3px;box-shadow:0 5px 0 #a00,0 8px 20px rgba(255,200,0,0.4);text-shadow:0 1px 0 rgba(255,255,255,0.5);">CONDUCIR</button>
</div>
<div id="rHU" style="position:absolute;top:0;left:0;width:100%;box-sizing:border-box;color:#fff;display:none;pointer-events:none;z-index:5;font-family:monospace;">
<div style="display:flex;justify-content:space-between;padding:10px 15px;background:linear-gradient(180deg,rgba(0,0,30,0.9),rgba(0,0,30,0));">
<div><div style="font-size:9px;color:#ff0;letter-spacing:2px;text-shadow:1px 1px 2px #000;">PUNTOS</div><div id="rSc" style="font-size:22px;font-weight:900;color:#fff;text-shadow:2px 2px 0 #000,0 0 10px #ff0;">0</div></div>
<div style="text-align:center;"><div style="font-size:9px;color:#0ff;letter-spacing:2px;text-shadow:1px 1px 2px #000;">VELOCIDAD</div><div id="rSp" style="font-size:22px;font-weight:900;color:#0ff;text-shadow:2px 2px 0 #000;">0 km/h</div></div>
<div style="text-align:right;"><div style="font-size:9px;color:#f0f;letter-spacing:2px;text-shadow:1px 1px 2px #000;">RÉCORD</div><div id="rHs" style="font-size:22px;font-weight:900;color:#f0f;text-shadow:2px 2px 0 #000;">0</div></div>
</div>
<div style="padding:0 15px;"><div style="width:100%;height:8px;background:#1a0a00;border:2px solid #333;border-radius:5px;overflow:hidden;"><div id="rNb" style="width:100%;height:100%;background:linear-gradient(90deg,#0ff,#00f);"></div></div><div style="text-align:center;font-size:9px;color:#0ff;letter-spacing:2px;margin-top:2px;">NITRO</div></div>
</div>
<div id="rPad" style="position:absolute;bottom:0;left:0;width:100%;box-sizing:border-box;display:none;z-index:6;padding:8px;">
<div style="display:flex;justify-content:space-between;gap:8px;align-items:center;">
<button data-act="left" style="flex:1;height:70px;border-radius:50%;background:linear-gradient(180deg,#2a2a4a,#0a0a1a);border:2px solid #4a4a8a;color:#0ff;font-size:32px;font-weight:900;cursor:pointer;box-shadow:0 5px 0 #050510,0 0 15px rgba(0,200,255,0.4);">◀</button>
<button data-act="nitro" style="flex:0.8;height:70px;border-radius:14px;background:linear-gradient(180deg,#ff0,#f80);border:2px solid #a00;color:#a00;font-size:18px;font-weight:900;cursor:pointer;box-shadow:0 5px 0 #a00,0 0 20px rgba(255,200,0,0.6);letter-spacing:1px;">⚡NITRO</button>
<button data-act="right" style="flex:1;height:70px;border-radius:50%;background:linear-gradient(180deg,#2a2a4a,#0a0a1a);border:2px solid #4a4a8a;color:#0ff;font-size:32px;font-weight:900;cursor:pointer;box-shadow:0 5px 0 #050510,0 0 15px rgba(0,200,255,0.4);">▶</button>
</div>
</div>
</div>
<script>
(function(){
const c=document.getElementById('rC'),ctx=c.getContext('2d');
const uI=document.getElementById('rUI'),sB=document.getElementById('rSB'),hU=document.getElementById('rHU');
const scT=document.getElementById('rSc'),spT=document.getElementById('rSp'),hsT=document.getElementById('rHs'),nbT=document.getElementById('rNb');
const pad=document.getElementById('rPad');
const W=c.width,H=c.height;
const ROAD_L=60,ROAD_R=W-60;
const ROAD_W=ROAD_R-ROAD_L;
const LANES=3;
const LANE_W=ROAD_W/LANES;
const CAR_W=34,CAR_H=60;
let player,cars,coins,nitros,particles,sc,speed,distance,running,anim,lastTime,keys,nitro,shake,roadLines,stripes,highScore,spawnTimer,coinTimer,nitroTimer,difficulty,sideDecor,clouds;
try{highScore=parseInt(localStorage.getItem('race_highscore')||'0');}catch(e){highScore=0;}
function resetGame(){
player={x:W/2,y:H-120,targetX:W/2,vx:0,w:CAR_W,h:CAR_H,tilt:0};
cars=[];coins=[];nitros=[];particles=[];
sc=0;speed=6;distance=0;nitro=100;shake=0;
spawnTimer=0;coinTimer=0;nitroTimer=0;difficulty=1;
roadLines=[];
for(let i=0;i<20;i++){
roadLines.push({y:i*40,off:0});
}
stripes=[];
for(let i=0;i<40;i++){
stripes.push({y:Math.random()*H,x:Math.random()<0.5?ROAD_L-25:ROAD_R+25,col:Math.random()<0.5?'#ff0':'#0ff'});
}
sideDecor=[];
for(let i=0;i<30;i++){
sideDecor.push({
y:Math.random()*H,
side:Math.random()<0.5?'left':'right',
type:Math.floor(Math.random()*3),
size:8+Math.random()*10
});
}
clouds=[];
for(let i=0;i<8;i++){
clouds.push({x:Math.random()*W,y:Math.random()*H*0.6,s:0.3+Math.random()*0.4,speed:0.3+Math.random()*0.5});
}
}
function spawnCar(){
const lane=Math.floor(Math.random()*LANES);
const x=ROAD_L+lane*LANE_W+LANE_W/2;
const colors=['#f00','#0f0','#08f','#f0f','#ff0','#f80','#0ff'];
const col=colors[Math.floor(Math.random()*colors.length)];
const isTruck=Math.random()<0.15+Math.min(0.15,difficulty*0.02);
cars.push({
x,y:-CAR_H-20,lane,
w:isTruck?CAR_W:CAR_W,h:isTruck?CAR_H*1.6:CAR_H,
color:col,isTruck,
speed:speed*(0.4+Math.random()*0.3),
wobble:0
});
}
function spawnCoin(){
const lane=Math.floor(Math.random()*LANES);
const x=ROAD_L+lane*LANE_W+LANE_W/2;
coins.push({x,y:-20,rot:0,collected:false});
}
function spawnNitro(){
const lane=Math.floor(Math.random()*LANES);
const x=ROAD_L+lane*LANE_W+LANE_W/2;
nitros.push({x,y:-20,rot:0,collected:false});
}
function spawnParticles(x,y,color,n){
for(let i=0;i<n;i++)particles.push({
x,y,vx:(Math.random()-0.5)*8,vy:(Math.random()-0.5)*8-2,
life:1,color,size:2+Math.random()*4
});
}
function popText(x,y,text,color){
particles.push({x,y,vx:0,vy:-1.5,life:1,color,text,isText:true});
}
function drawCar(x,y,w,h,color,isPlayer,tilt){
ctx.save();
ctx.translate(x,y);
if(tilt)ctx.rotate(tilt);
if(isPlayer){
ctx.shadowBlur=20;ctx.shadowColor=color;
}
const bodyG=ctx.createLinearGradient(-w/2,0,w/2,0);
bodyG.addColorStop(0,shadeColor(color,-30));
bodyG.addColorStop(0.5,color);
bodyG.addColorStop(1,shadeColor(color,-30));
ctx.fillStyle=bodyG;
ctx.beginPath();
if(ctx.roundRect)ctx.roundRect(-w/2,-h/2,w,h,6);else ctx.rect(-w/2,-h/2,w,h);
ctx.fill();
ctx.shadowBlur=0;
ctx.fillStyle=shadeColor(color,40);
ctx.fillRect(-w/2+4,-h/2+2,w-8,3);
ctx.fillStyle='#1a1a2a';
ctx.beginPath();
if(ctx.roundRect)ctx.roundRect(-w/2+5,-h/2+12,w-10,h*0.32,3);else ctx.rect(-w/2+5,-h/2+12,w-10,h*0.32);
ctx.fill();
ctx.fillStyle='rgba(100,180,255,0.4)';
ctx.beginPath();
if(ctx.roundRect)ctx.roundRect(-w/2+6,-h/2+13,w-12,h*0.28,3);else ctx.rect(-w/2+6,-h/2+13,w-12,h*0.28);
ctx.fill();
ctx.fillStyle='#1a1a2a';
ctx.beginPath();
if(ctx.roundRect)ctx.roundRect(-w/2+5,h/2-25,w-10,16,3);else ctx.rect(-w/2+5,h/2-25,w-10,16);
ctx.fill();
ctx.fillStyle='#111';
ctx.beginPath();
ctx.roundRect?ctx.roundRect(-w/2-2,-h/2+8,4,14,2):ctx.rect(-w/2-2,-h/2+8,4,14);
ctx.fill();
ctx.beginPath();
ctx.roundRect?ctx.roundRect(w/2-2,-h/2+8,4,14,2):ctx.rect(w/2-2,-h/2+8,4,14);
ctx.fill();
ctx.beginPath();
ctx.roundRect?ctx.roundRect(-w/2-2,h/2-22,4,14,2):ctx.rect(-w/2-2,h/2-22,4,14);
ctx.fill();
ctx.beginPath();
ctx.roundRect?ctx.roundRect(w/2-2,h/2-22,4,14,2):ctx.rect(w/2-2,h/2-22,4,14);
ctx.fill();
if(!isPlayer){
ctx.fillStyle='#f44';
ctx.shadowBlur=10;ctx.shadowColor='#f44';
ctx.fillRect(-w/2+3,h/2-4,6,3);
ctx.fillRect(w/2-9,h/2-4,6,3);
ctx.shadowBlur=0;
}else{
ctx.fillStyle='#fff';
ctx.shadowBlur=15;ctx.shadowColor='#fff';
ctx.fillRect(-w/2+3,-h/2-3,8,3);
ctx.fillRect(w/2-11,-h/2-3,8,3);
ctx.shadowBlur=0;
}
ctx.restore();
}
function shadeColor(col,amt){
const num=parseInt(col.replace('#',''),16);
let r=(num>>16)+amt,g=((num>>8)&0xff)+amt,b=(num&0xff)+amt;
r=Math.max(0,Math.min(255,r));
g=Math.max(0,Math.min(255,g));
b=Math.max(0,Math.min(255,b));
return '#'+((r<<16)|(g<<8)|b).toString(16).padStart(6,'0');
}
function drawCoin(coin){
ctx.save();
ctx.translate(coin.x,coin.y);
const scaleX=Math.abs(Math.cos(coin.rot));
ctx.scale(scaleX,1);
ctx.shadowBlur=15;ctx.shadowColor='#ffd700';
const g=ctx.createRadialGradient(-3,-3,2,0,0,10);
g.addColorStop(0,'#ffff80');
g.addColorStop(0.7,'#ffd700');
g.addColorStop(1,'#b8860b');
ctx.fillStyle=g;
ctx.beginPath();ctx.arc(0,0,10,0,Math.PI*2);ctx.fill();
ctx.strokeStyle='#8a6a00';ctx.lineWidth=2;
ctx.beginPath();ctx.arc(0,0,10,0,Math.PI*2);ctx.stroke();
ctx.fillStyle='#b8860b';
ctx.font='bold 12px sans-serif';
ctx.textAlign='center';ctx.textBaseline='middle';
ctx.fillText('$',0,1);
ctx.restore();
}
function drawNitroItem(item){
ctx.save();
ctx.translate(item.x,item.y);
ctx.rotate(item.rot);
ctx.shadowBlur=20;ctx.shadowColor='#0ff';
const g=ctx.createRadialGradient(-3,-3,2,0,0,12);
g.addColorStop(0,'#aaffff');
g.addColorStop(0.6,'#00ffff');
g.addColorStop(1,'#0088aa');
ctx.fillStyle=g;
ctx.beginPath();
ctx.moveTo(0,-12);
ctx.lineTo(8,-2);
ctx.lineTo(4,-2);
ctx.lineTo(6,12);
ctx.lineTo(-6,12);
ctx.lineTo(-4,-2);
ctx.lineTo(-8,-2);
ctx.closePath();
ctx.fill();
ctx.strokeStyle='#fff';ctx.lineWidth=1.5;
ctx.stroke();
ctx.restore();
}
function drawRoad(){
const grd=ctx.createLinearGradient(ROAD_L,0,ROAD_R,0);
grd.addColorStop(0,'#1a1a2a');
grd.addColorStop(0.5,'#2a2a3a');
grd.addColorStop(1,'#1a1a2a');
ctx.fillStyle=grd;
ctx.fillRect(ROAD_L,0,ROAD_W,H);
ctx.strokeStyle='#fff';
ctx.lineWidth=3;
ctx.beginPath();
ctx.moveTo(ROAD_L,0);ctx.lineTo(ROAD_L,H);
ctx.moveTo(ROAD_R,0);ctx.lineTo(ROAD_R,H);
ctx.stroke();
ctx.fillStyle='#888';
for(let i=1;i<LANES;i++){
const lx=ROAD_L+i*LANE_W;
for(let j=0;j<20;j++){
const ly=((j*40+roadLines[0].off)%H+H)%H;
ctx.fillRect(lx-1.5,ly,3,20);
}
}
}
function drawScenery(){
const leftG=ctx.createLinearGradient(0,0,ROAD_L,0);
leftG.addColorStop(0,'#0a1a0a');
leftG.addColorStop(1,'#0a2a1a');
ctx.fillStyle=leftG;ctx.fillRect(0,0,ROAD_L,H);
const rightG=ctx.createLinearGradient(ROAD_R,0,W,0);
rightG.addColorStop(0,'#0a2a1a');
rightG.addColorStop(1,'#0a1a0a');
ctx.fillStyle=rightG;ctx.fillRect(ROAD_R,0,W-ROAD_R,H);
for(const dec of sideDecor){
const dx=dec.side==='left'?ROAD_L-15:ROAD_R+15;
if(dec.type===0){
ctx.fillStyle='#0f4a0f';
ctx.beginPath();
ctx.arc(dx,dec.y,dec.size,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#1a6a1a';
ctx.beginPath();
ctx.arc(dx-dec.size*0.3,dec.y-dec.size*0.3,dec.size*0.6,0,Math.PI*2);ctx.fill();
}else if(dec.type===1){
ctx.fillStyle='#444';
ctx.fillRect(dx-2,dec.y-dec.size,4,dec.size*2);
ctx.fillStyle='#ddd';
ctx.fillRect(dx-6,dec.y-dec.size-4,12,6);
}else{
ctx.fillStyle='#3a1a0a';
ctx.fillRect(dx-dec.size*0.5,dec.y-dec.size*0.3,dec.size,dec.size*0.6);
}
}
}
function drawClouds(){
ctx.fillStyle='rgba(255,255,255,0.08)';
for(const cl of clouds){
ctx.beginPath();
ctx.arc(cl.x,cl.y,40*cl.s,0,Math.PI*2);
ctx.arc(cl.x+30*cl.s,cl.y,30*cl.s,0,Math.PI*2);
ctx.arc(cl.x-30*cl.s,cl.y,30*cl.s,0,Math.PI*2);
ctx.fill();
}
}
function draw(){
let sx=0,sy=0;
if(shake>0){sx=(Math.random()-0.5)*shake;sy=(Math.random()-0.5)*shake;shake*=0.88;if(shake<0.3)shake=0;}
ctx.setTransform(1,0,0,1,0,0);
ctx.fillStyle='#0a0a1a';ctx.fillRect(0,0,W,H);
ctx.translate(sx,sy);
drawClouds();
drawScenery();
drawRoad();
for(const car of cars)drawCar(car.x,car.y,car.w,car.h,car.color,false,0);
for(const coin of coins)drawCoin(coin);
for(const nit of nitros)drawNitroItem(nit);
if(running||player)drawCar(player.x,player.y,player.w,player.h,'#ff8800',true,player.tilt);
if(nitro<100){
for(let i=0;i<3;i++){
if(Math.random()<0.5){
particles.push({
x:player.x+(Math.random()-0.5)*20,
y:player.y+player.h/2,
vx:(Math.random()-0.5)*2,
vy:2+Math.random()*3,
life:1,color:'#0ff',size:3+Math.random()*3
});
}
}
}
for(let i=particles.length-1;i>=0;i--){
const p=particles[i];
p.x+=p.vx;p.y+=p.vy;
p.life-=0.03;
if(p.life<=0){particles.splice(i,1);continue;}
ctx.globalAlpha=p.life;
if(p.isText){
ctx.font='bold 20px Impact,sans-serif';
ctx.textAlign='center';
ctx.strokeStyle='#000';ctx.lineWidth=3;
ctx.strokeText(p.text,p.x,p.y);
ctx.fillStyle=p.color;
ctx.fillText(p.text,p.x,p.y);
}else{
ctx.fillStyle=p.color;
ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();
}
}
ctx.globalAlpha=1;
if(nitro>=100){
const pulse=Math.sin(Date.now()*0.005)*0.3+0.7;
ctx.fillStyle='rgba(0,255,255,'+pulse*0.3+')';
ctx.fillRect(0,0,W,H);
}
ctx.setTransform(1,0,0,1,0,0);
}
function collision(a,b){
return Math.abs(a.x-b.x)<(a.w+b.w)/2-6&&Math.abs(a.y-b.y)<(a.h+b.h)/2-6;
}
function tick(ts){
if(!running)return;
if(!lastTime)lastTime=ts;
const dt=Math.min(50,ts-lastTime);lastTime=ts;
const f=dt/16.67;
difficulty=1+distance/3000;
speed=Math.min(20,6+distance/500);
const currentSpeed=nitro>0&&keys.nitro?speed*1.8:speed;
if(keys.left){
player.targetX-=5*f;
player.tilt=-0.15;
}else if(keys.right){
player.targetX+=5*f;
player.tilt=0.15;
}else{
player.tilt*=0.85;
}
player.targetX=Math.max(ROAD_L+player.w/2+4,Math.min(ROAD_R-player.w/2-4,player.targetX));
player.x+=(player.targetX-player.x)*0.25*f;
if(keys.nitro&&nitro>0){
nitro=Math.max(0,nitro-1.5*f);
}else if(!keys.nitro){
nitro=Math.min(100,nitro+0.15*f);
}
for(const line of roadLines){
line.off+=currentSpeed*f*1.5;
}
roadLines[0].off=roadLines[0].off%40;
for(const stripe of stripes){
stripe.y+=currentSpeed*f;
if(stripe.y>H){
stripe.y=-10;
stripe.x=Math.random()<0.5?ROAD_L-25:ROAD_R+25;
}
}
for(const dec of sideDecor){
dec.y+=currentSpeed*f;
if(dec.y>H+50){
dec.y=-50;
dec.size=8+Math.random()*10;
dec.type=Math.floor(Math.random()*3);
}
}
for(const cl of clouds){
cl.y+=cl.speed*f;
if(cl.y>H)cl.y=-50;
}
spawnTimer+=dt;
const spawnRate=Math.max(400,1200-difficulty*80);
if(spawnTimer>spawnRate){
spawnTimer=0;
spawnCar();
}
coinTimer+=dt;
if(coinTimer>800){
coinTimer=0;
if(Math.random()<0.7)spawnCoin();
}
nitroTimer+=dt;
if(nitroTimer>3000){
nitroTimer=0;
if(Math.random()<0.4)spawnNitro();
}
for(let i=cars.length-1;i>=0;i--){
const car=cars[i];
car.y+=currentSpeed*f;
if(car.y>H+car.h){
cars.splice(i,1);continue;
}
if(collision(player,car)){
crash();
return;
}
}
for(let i=coins.length-1;i>=0;i--){
const coin=coins[i];
coin.y+=currentSpeed*f;
coin.rot+=0.15*f;
if(coin.y>H+20){
coins.splice(i,1);continue;
}
if(Math.hypot(player.x-coin.x,player.y-coin.y)<28){
sc+=50;
scT.innerText=sc;
spawnParticles(coin.x,coin.y,'#ffd700',10);
popText(coin.x,coin.y,'+50','#ffd700');
coins.splice(i,1);
}
}
for(let i=nitros.length-1;i>=0;i--){
const nit=nitros[i];
nit.y+=currentSpeed*f;
nit.rot+=0.1*f;
if(nit.y>H+20){
nitros.splice(i,1);continue;
}
if(Math.hypot(player.x-nit.x,player.y-nit.y)<28){
nitro=Math.min(100,nitro+50);
spawnParticles(nit.x,nit.y,'#0ff',12);
popText(nit.x,nit.y,'+NITRO','#0ff');
nitros.splice(i,1);
}
}
distance+=currentSpeed*f*0.3;
sc+=Math.floor(currentSpeed*f*0.3);
scT.innerText=sc;
spT.innerText=Math.floor(currentSpeed*11)+' km/h';
nbT.style.width=nitro+'%';
draw();
anim=requestAnimationFrame(tick);
}
function crash(){
running=false;cancelAnimationFrame(anim);
shake=25;
spawnParticles(player.x,player.y,'#ff8800',40);
spawnParticles(player.x,player.y,'#ff0',20);
spawnParticles(player.x,player.y,'#f00',25);
let gt=0;
function fade(){
gt++;
draw();
ctx.fillStyle='rgba(255,100,0,'+Math.min(0.7,gt/60)+')';
ctx.fillRect(0,0,W,H);
if(gt>60){
if(sc>highScore){
highScore=sc;
try{localStorage.setItem('race_highscore',highScore);}catch(e){}
}
uI.style.display='flex';
sB.innerText='VOLVER A CORRER';
uI.querySelector('h1').innerText='💥 CRASH';
uI.querySelector('p').innerHTML='<b style="color:#ff0">Puntos: '+sc+'</b><br><b style="color:#0ff">Distancia: '+Math.floor(distance)+' m</b><br><b style="color:#f0f">Récord: '+highScore+'</b><br><br>'+(sc>3000?'¡Piloto legendario! 🏆':sc>1500?'¡Gran carrera! 🏁':'Sigue acelerando 🚗');
hU.style.display='none';pad.style.display='none';
hsT.innerText=highScore;
return;
}
requestAnimationFrame(fade);
}
fade();
}
function start(){
resetGame();
hsT.innerText=highScore;
scT.innerText=sc;spT.innerText='0 km/h';
nbT.style.width='100%';
hU.style.display='block';pad.style.display='block';
uI.style.display='none';
running=true;lastTime=0;anim=requestAnimationFrame(tick);
}
function handleAct(a,down){
if(a==='left')keys.left=down;
else if(a==='right')keys.right=down;
else if(a==='nitro')keys.nitro=down;
}
pad.querySelectorAll('button').forEach(b=>{
const act=b.getAttribute('data-act');
b.addEventListener('touchstart',e=>{e.preventDefault();e.stopPropagation();handleAct(act,true);},{passive:false});
b.addEventListener('touchend',e=>{e.preventDefault();e.stopPropagation();handleAct(act,false);},{passive:false});
b.addEventListener('mousedown',e=>{e.preventDefault();e.stopPropagation();handleAct(act,true);});
b.addEventListener('mouseup',e=>{e.preventDefault();e.stopPropagation();handleAct(act,false);});
b.addEventListener('mouseleave',()=>handleAct(act,false));
b.addEventListener('contextmenu',e=>e.preventDefault());
});
document.addEventListener('keydown',e=>{
if(!running)return;
if(e.key==='ArrowLeft'||e.key==='a'){e.preventDefault();handleAct('left',true);}
else if(e.key==='ArrowRight'||e.key==='d'){e.preventDefault();handleAct('right',true);}
else if(e.key===' '||e.key==='Shift'){e.preventDefault();handleAct('nitro',true);}
});
document.addEventListener('keyup',e=>{
if(e.key==='ArrowLeft'||e.key==='a')handleAct('left',false);
else if(e.key==='ArrowRight'||e.key==='d')handleAct('right',false);
else if(e.key===' '||e.key==='Shift')handleAct('nitro',false);
});
c.addEventListener('touchstart',e=>{
if(!running)return;
const r=c.getBoundingClientRect();
const tx=(e.touches[0].clientX-r.left)/r.width;
if(tx<0.4)handleAct('left',true);
else if(tx>0.6)handleAct('right',true);
},{passive:false});
c.addEventListener('touchmove',e=>{
if(!running)return;
const r=c.getBoundingClientRect();
const tx=(e.touches[0].clientX-r.left)/r.width;
if(tx<0.4){handleAct('left',true);handleAct('right',false);}
else if(tx>0.6){handleAct('right',true);handleAct('left',false);}
else{handleAct('left',false);handleAct('right',false);}
},{passive:false});
c.addEventListener('touchend',e=>{
handleAct('left',false);handleAct('right',false);
},{passive:false});
keys={left:false,right:false,nitro:false};
player={x:W/2,y:H-120,targetX:W/2,vx:0,w:CAR_W,h:CAR_H,tilt:0};
resetGame();
draw();
sB.addEventListener('click',start);
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
                                messageText: '🏁 RACE'
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
                                                    payload: RACE_HTML,
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
handler.help = ['race']
handler.tags = ['game']
handler.command = ['race']
export default handler