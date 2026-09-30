import crypto from 'crypto'
const MOTO_RACING_HTML = `
<div style="width:100%;height:600px;background:#05070b;position:relative;overflow:hidden;font-family:'Segoe UI',sans-serif;user-select:none;color:#fff;">
<canvas id="mrC" width="360" height="600" style="width:100%;height:100%;display:block;touch-action:none;"></canvas>
<div id="mrMenu" style="position:absolute;inset:0;z-index:20;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;background:radial-gradient(circle at 50% 38%,rgba(45,12,0,.96),rgba(3,5,10,.99) 72%);">
<h1 style="margin:0;color:#fff;font-size:32px;letter-spacing:3px;white-space:nowrap;text-shadow:0 0 10px #ff4d00,0 0 35px #ff1e00;">MOTO RACING</h1>
<div style="color:#a8897d;font-size:11px;margin:10px 0 25px;text-align:center;line-height:1.7;">Acelera. Esquiva. Sobrevive.<br>¡Llega lo más lejos posible!</div>
<div style="width:100%;max-width:290px;padding:15px 18px;box-sizing:border-box;background:rgba(255,255,255,.035);border:1px solid rgba(255,77,0,.25);border-radius:16px;margin-bottom:18px;">
<div style="display:flex;justify-content:space-between;color:#8e7167;font-size:9px;letter-spacing:2px;"><span>RÉCORD</span><span>MONEDAS</span></div>
<div style="display:flex;justify-content:space-between;align-items:center;margin-top:5px;"><strong id="mrBest" style="font-size:24px;color:#ff5a1f;">0</strong><span id="mrCoins" style="font-size:18px;color:#ffd447;">0 🪙</span></div>
</div>
<button id="mrStart" type="button" style="width:100%;max-width:290px;padding:15px;border:0;border-radius:30px;background:linear-gradient(135deg,#ff5a1f,#ff1e00);color:#fff;font-size:14px;font-weight:900;letter-spacing:3px;box-shadow:0 0 30px rgba(255,69,0,.3);">ARRANCAR</button>
</div>
<div id="mrHUD" style="position:absolute;top:0;left:0;width:100%;z-index:8;display:none;pointer-events:none;">
<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 13px;background:linear-gradient(180deg,rgba(3,5,9,.98),rgba(3,5,9,.6));border-bottom:1px solid rgba(255,77,0,.18);">
<div><div style="font-size:8px;color:#8e7167;letter-spacing:2px;">DISTANCIA</div><div id="mrDistance" style="font:900 17px monospace;color:#fff;">0 m</div></div>
<div style="text-align:center;"><div style="font-size:8px;color:#8e7167;letter-spacing:2px;">VELOCIDAD</div><div id="mrSpeed" style="font:900 17px monospace;color:#ff5a1f;">0 KM/H</div></div>
<div style="text-align:right;"><div style="font-size:8px;color:#8e7167;letter-spacing:2px;">MONEDAS</div><div id="mrCoinHud" style="font:900 17px monospace;color:#ffd447;">0</div></div>
</div>
</div>
<div id="mrNitro" style="position:absolute;left:15px;bottom:80px;width:125px;height:13px;border:1px solid rgba(0,190,255,.5);border-radius:10px;background:rgba(0,0,0,.5);z-index:9;display:none;overflow:hidden;"><div id="mrNitroFill" style="height:100%;width:100%;background:linear-gradient(90deg,#00cfff,#008cff);box-shadow:0 0 12px #00cfff;"></div></div>
<div id="mrControls" style="position:absolute;bottom:0;left:0;width:100%;z-index:10;display:none;justify-content:space-between;align-items:end;padding:12px;box-sizing:border-box;pointer-events:none;">
<div style="display:flex;gap:8px;pointer-events:auto;"><button id="mrLeft" type="button" style="width:62px;height:54px;border:1px solid rgba(255,255,255,.2);border-radius:15px;background:rgba(0,0,0,.55);color:#fff;font-size:25px;">◀</button><button id="mrRight" type="button" style="width:62px;height:54px;border:1px solid rgba(255,255,255,.2);border-radius:15px;background:rgba(0,0,0,.55);color:#fff;font-size:25px;">▶</button></div>
<button id="mrBoost" type="button" style="width:75px;height:54px;border:1px solid #00cfff;border-radius:15px;background:rgba(0,120,180,.2);color:#00cfff;font-size:10px;font-weight:900;pointer-events:auto;">NITRO<br>⚡</button>
</div>
<div id="mrResult" style="position:absolute;inset:0;z-index:15;display:none;align-items:center;justify-content:center;background:rgba(2,4,8,.78);backdrop-filter:blur(5px);">
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
let boosting=false;
let roadOffset=0;
let spawnTimer=0;
let coinTimer=0;
let shake=0;
let last=performance.now();
let enemies=[];
let pickups=[];
let particles=[];
let keys={left:false,right:false,boost:false};
let touchDir=0;
function reset(){
running=true;
x=180;
targetX=180;
distance=0;
coins=0;
speed=5;
nitro=100;
boosting=false;
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
const lanes=[92,136,180,224,268];
const lane=lanes[Math.floor(Math.random()*lanes.length)];
const types=[
{w:26,h:48,color:'#e92d3f'},
{w:28,h:52,color:'#247cff'},
{w:25,h:45,color:'#ffd22e'},
{w:30,h:50,color:'#a94cff'}
];
const t=types[Math.floor(Math.random()*types.length)];
enemies.push({x:lane,y:-70,w:t.w,h:t.h,color:t.color,speed:1.5+Math.random()*2.2,tilt:(Math.random()-.5)*.08});
}
function spawnCoin(){
const lanes=[92,136,180,224,268];
pickups.push({x:lanes[Math.floor(Math.random()*lanes.length)],y:-30,r:7,spin:0});
}
function particle(x,y,color){
particles.push({x,y,vx:(Math.random()-.5)*5,vy:(Math.random()-.5)*5,life:1,size:2+Math.random()*4,color});
}
function drawRoad(){
ctx.fillStyle='#070a0f';
ctx.fillRect(0,0,W,H);
ctx.fillStyle='#111820';
ctx.fillRect(55,0,250,H);
ctx.fillStyle='#292d32';
ctx.fillRect(48,0,7,H);
ctx.fillRect(305,0,7,H);
const segment=38;
for(let y=-segment;y<H+segment;y+=segment){
const yy=(y+roadOffset)%segment;
ctx.fillStyle='#e5e5e5';
ctx.fillRect(50,yy,4,19);
ctx.fillRect(306,yy,4,19);
}
ctx.strokeStyle='rgba(255,255,255,.65)';
ctx.lineWidth=3;
ctx.setLineDash([24,20]);
ctx.lineDashOffset=-roadOffset;
ctx.beginPath();
ctx.moveTo(124,0);
ctx.lineTo(124,H);
ctx.moveTo(236,0);
ctx.lineTo(236,H);
ctx.stroke();
ctx.setLineDash([]);
ctx.fillStyle='rgba(255,77,0,.08)';
ctx.fillRect(55,0,250,H);
}
function drawBike(){
const by=500;
ctx.save();
ctx.translate(x,by);
ctx.rotate((targetX-x)*-.025);
ctx.shadowBlur=18;
ctx.shadowColor='#ff4d00';
ctx.fillStyle='#090909';
ctx.beginPath();
ctx.ellipse(0,20,7,20,0,0,Math.PI*2);
ctx.fill();
ctx.shadowBlur=0;
ctx.fillStyle='#161616';
ctx.beginPath();
ctx.ellipse(0,-18,7,19,0,0,Math.PI*2);
ctx.fill();
ctx.fillStyle='#ff4d00';
ctx.beginPath();
ctx.moveTo(0,-30);
ctx.lineTo(11,-8);
ctx.lineTo(9,23);
ctx.lineTo(0,31);
ctx.lineTo(-9,23);
ctx.lineTo(-11,-8);
ctx.closePath();
ctx.fill();
ctx.fillStyle='#ffb38e';
ctx.beginPath();
ctx.arc(0,-26,5,0,Math.PI*2);
ctx.fill();
ctx.fillStyle='#111';
ctx.beginPath();
ctx.arc(0,-28,6,Math.PI,Math.PI*2);
ctx.fill();
ctx.fillStyle='#00cfff';
ctx.beginPath();
ctx.moveTo(-6,-13);
ctx.lineTo(6,-13);
ctx.lineTo(4,-3);
ctx.lineTo(-4,-3);
ctx.closePath();
ctx.fill();
if(boosting){
ctx.fillStyle='#00cfff';
ctx.shadowBlur=15;
ctx.shadowColor='#00cfff';
ctx.beginPath();
ctx.moveTo(-4,28);
ctx.lineTo(0,45+Math.random()*10);
ctx.lineTo(4,28);
ctx.closePath();
ctx.fill();
}
ctx.restore();
}
function drawEnemy(e){
ctx.save();
ctx.translate(e.x,e.y);
ctx.rotate(e.tilt);
ctx.shadowBlur=10;
ctx.shadowColor=e.color;
ctx.fillStyle='#050505';
ctx.beginPath();
ctx.ellipse(0,e.h*.35,5,e.h*.22,0,0,Math.PI*2);
ctx.fill();
ctx.fillStyle=e.color;
ctx.fillRect(-e.w/2,-e.h/2,e.w,e.h);
ctx.fillStyle='#151515';
ctx.fillRect(-e.w/2+3,-e.h/2+7,e.w-6,11);
ctx.fillStyle='#fff';
ctx.fillRect(-e.w/2+4,e.h/2-9,5,4);
ctx.fillRect(e.w/2-9,e.h/2-9,5,4);
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
p.life-=dt*.0028;
p.vy+=.04;
if(p.life<=0){particles.splice(i,1);continue;}
ctx.globalAlpha=p.life;
ctx.fillStyle=p.color;
ctx.beginPath();
ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
ctx.fill();
}
ctx.globalAlpha=1;
}
function collision(a,b){
return Math.abs(a.x-b.x)<(a.w/2+12)&&Math.abs(a.y-b.y)<(a.h/2+20);
}
function coinCollision(c){
return Math.abs(c.x-x)<18&&Math.abs(c.y-500)<30;
}
function crash(){
if(!running)return;
running=false;
shake=18;
for(let i=0;i<35;i++)particle(x,500,'#ff4d00');
for(let i=0;i<20;i++)particle(x,500,'#ffd447');
if(Math.floor(distance)>best)best=Math.floor(distance);
controls.style.display='none';
nitroBox.style.display='none';
resultIcon.textContent='💥';
resultTitle.textContent='¡CHOQUE!';
resultTitle.style.color='#ff5a1f';
resultText.innerHTML='Distancia: <b style="color:#fff;">'+Math.floor(distance)+' m</b><br>Monedas: <b style="color:#ffd447;">+'+coins+' 🪙</b><br><br>Récord: <b style="color:#ff5a1f;">'+best+' m</b>';
bestEl.textContent=best;
totalCoins+=coins;
coinsEl.textContent=totalCoins+' 🪙';
setTimeout(()=>result.style.display='flex',350);
}
function update(dt){
if(!running)return;
const factor=dt/16.67;
if(keys.left||touchDir<0)targetX-=5*factor;
if(keys.right||touchDir>0)targetX+=5*factor;
targetX=Math.max(78,Math.min(282,targetX));
x+=(targetX-x)*Math.min(1,.18*factor);
boosting=keys.boost&&nitro>0;
if(boosting){
speed=Math.min(15,speed+.08*factor);
nitro-=.9*factor;
}else{
nitro=Math.min(100,nitro+.1*factor);
speed=Math.min(12,speed+.006*factor);
}
if(nitro<=0){nitro=0;boosting=false;}
distance+=speed*.045*factor;
roadOffset=(roadOffset+speed*factor*2.4)%38;
spawnTimer-=dt;
coinTimer-=dt;
if(spawnTimer<=0){
spawnEnemy();
spawnTimer=Math.max(320,800-speed*32)+Math.random()*350;
}
if(coinTimer<=0){
spawnCoin();
coinTimer=600+Math.random()*700;
}
for(let i=enemies.length-1;i>=0;i--){
const e=enemies[i];
e.y+=(speed+e.speed)*factor;
if(collision({x:x,y:500,w:22,h:60},e)){crash();return;}
if(e.y>650)enemies.splice(i,1);
}
for(let i=pickups.length-1;i>=0;i--){
const c=pickups[i];
c.y+=(speed+2)*factor;
c.spin+=.12*factor;
if(coinCollision(c)){
coins++;
for(let j=0;j<8;j++)particle(c.x,c.y,'#ffd447');
pickups.splice(i,1);
continue;
}
if(c.y>640)pickups.splice(i,1);
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
drawBike();
drawParticles(dt);
ctx.restore();
update(dt);
requestAnimationFrame(render);
}
function bindHold(btn,dir){
const down=e=>{e.preventDefault();touchDir=dir;};
const up=e=>{e.preventDefault();if(touchDir===dir)touchDir=0;};
btn.addEventListener('pointerdown',down);
btn.addEventListener('pointerup',up);
btn.addEventListener('pointercancel',up);
btn.addEventListener('pointerleave',up);
btn.addEventListener('touchstart',down,{passive:false});
btn.addEventListener('touchend',up,{passive:false});
}
bindHold(leftBtn,-1);
bindHold(rightBtn,1);
const boostDown=e=>{e.preventDefault();keys.boost=true;boosting=true;};
const boostUp=e=>{e.preventDefault();keys.boost=false;boosting=false;};
boostBtn.addEventListener('pointerdown',boostDown);
boostBtn.addEventListener('pointerup',boostUp);
boostBtn.addEventListener('pointercancel',boostUp);
boostBtn.addEventListener('touchstart',boostDown,{passive:false});
boostBtn.addEventListener('touchend',boostUp,{passive:false});
window.addEventListener('keydown',e=>{
if(e.key==='ArrowLeft'||e.key.toLowerCase()==='a')keys.left=true;
if(e.key==='ArrowRight'||e.key.toLowerCase()==='d')keys.right=true;
if(e.code==='Space'){keys.boost=true;boosting=true;}
});
window.addEventListener('keyup',e=>{
if(e.key==='ArrowLeft'||e.key.toLowerCase()==='a')keys.left=false;
if(e.key==='ArrowRight'||e.key.toLowerCase()==='d')keys.right=false;
if(e.code==='Space'){keys.boost=false;boosting=false;}
});
canvas.addEventListener('touchmove',e=>{
if(!running)return;
const rect=canvas.getBoundingClientRect();
targetX=Math.max(78,Math.min(282,(e.touches[0].clientX-rect.left)*(W/rect.width)));
},{passive:true});
function startGame(e){
if(e)e.preventDefault();
reset();
}
startBtn.addEventListener('click',startGame);
startBtn.addEventListener('pointerup',startGame);
startBtn.addEventListener('touchend',startGame,{passive:false});
againBtn.addEventListener('click',startGame);
againBtn.addEventListener('pointerup',startGame);
againBtn.addEventListener('touchend',startGame,{passive:false});
updateHUD();
requestAnimationFrame(render);
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
                                messageText: '🏍️ MOTO RACING'
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
                                                    payload: MOTO_RACING_HTML,
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
handler.help = ['moto']
handler.tags = ['game']
handler.command = ['moto']
export default handler