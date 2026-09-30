import crypto from 'crypto'

const TANK_HTML = `
<div style="width:100%;height:600px;background:#0a0a0f;position:relative;overflow:hidden;font-family:'Segoe UI',sans-serif;user-select:none;touch-action:none;">
<canvas id="tankC" width="400" height="600" style="width:100%;height:100%;display:block;"></canvas>
<div id="tankUI" style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;align-items:center;background:rgba(0,0,0,0.92);z-index:10;transition:opacity 0.3s;padding:20px;box-sizing:border-box;">
<h1 style="color:#f60;text-shadow:0 0 20px #f60,0 0 40px #f30;font-size:32px;margin:0 0 10px;letter-spacing:5px;text-transform:uppercase;font-weight:900;text-align:center;">TANK WAR</h1>
<p style="color:#fa8;margin:0 0 20px;font-size:12px;text-align:center;letter-spacing:1px;line-height:1.8;">Destruye todos los tanques enemigos.<br>Usa los controles para moverte, apuntar y disparar.<br>¡Sobrevive el mayor tiempo posible!</p>
<button id="tankSB" style="padding:14px 42px;background:linear-gradient(45deg,#f60,#f30);border:none;border-radius:30px;color:#fff;font-size:15px;font-weight:900;cursor:pointer;text-transform:uppercase;letter-spacing:3px;box-shadow:0 0 25px rgba(255,100,0,0.6);">COMENZAR</button>
</div>
<div id="tankHU" style="position:absolute;top:0;left:0;width:100%;box-sizing:border-box;color:#fff;display:none;pointer-events:none;z-index:5;">
<div style="display:flex;justify-content:space-between;padding:8px 14px;align-items:center;">
<div>
<div style="font-size:9px;color:#fa8;letter-spacing:2px;">PUNTOS</div>
<div id="tankSc" style="font-size:20px;font-weight:900;font-family:monospace;text-shadow:0 0 8px #f60;">0</div>
</div>
<div style="text-align:center;">
<div style="font-size:9px;color:#fa8;letter-spacing:2px;">OLEADA</div>
<div id="tankWv" style="font-size:20px;font-weight:900;font-family:monospace;color:#f60;text-shadow:0 0 8px #f60;">1</div>
</div>
<div style="text-align:right;">
<div style="font-size:9px;color:#fa8;letter-spacing:2px;">VIDA</div>
<div id="tankHp" style="font-size:20px;font-weight:900;font-family:monospace;color:#0f0;text-shadow:0 0 8px #0f0;">100</div>
</div>
</div>
</div>
<div id="tankPad" style="position:absolute;bottom:0;left:0;width:100%;box-sizing:border-box;display:none;z-index:6;padding:6px;background:linear-gradient(to top,rgba(10,10,15,0.98),rgba(10,10,15,0.75));">
<div style="display:flex;justify-content:space-between;gap:4px;align-items:stretch;">
<div style="display:flex;gap:4px;">
<button data-act="left" style="width:52px;height:48px;border-radius:12px;background:linear-gradient(180deg,#2a1a0a,#150a05);border:1px solid #7a4a2a;color:#f60;font-size:20px;font-weight:900;cursor:pointer;box-shadow:0 3px 0 #100805,0 0 12px rgba(255,100,0,0.4);">◀</button>
<button data-act="right" style="width:52px;height:48px;border-radius:12px;background:linear-gradient(180deg,#2a1a0a,#150a05);border:1px solid #7a4a2a;color:#f60;font-size:20px;font-weight:900;cursor:pointer;box-shadow:0 3px 0 #100805,0 0 12px rgba(255,100,0,0.4);">▶</button>
</div>
<div style="display:flex;gap:4px;">
<button data-act="up" style="width:46px;height:48px;border-radius:12px;background:linear-gradient(180deg,#1a2a0a,#0a1505);border:1px solid #4a7a2a;color:#0f0;font-size:20px;font-weight:900;cursor:pointer;box-shadow:0 3px 0 #051005,0 0 12px rgba(0,255,0,0.4);">▲</button>
<button data-act="down" style="width:46px;height:48px;border-radius:12px;background:linear-gradient(180deg,#1a2a0a,#0a1505);border:1px solid #4a7a2a;color:#0f0;font-size:20px;font-weight:900;cursor:pointer;box-shadow:0 3px 0 #051005,0 0 12px rgba(0,255,0,0.4);">▼</button>
<button data-act="fire" style="width:46px;height:48px;border-radius:12px;background:linear-gradient(180deg,#4a0a0a,#250505);border:1px solid #aa2a2a;color:#f00;font-size:18px;font-weight:900;cursor:pointer;box-shadow:0 3px 0 #200505,0 0 12px rgba(255,0,0,0.5);">🔥</button>
</div>
</div>
</div>
</div>
<script>
(function(){
const c=document.getElementById('tankC'),ctx=c.getContext('2d');
const uI=document.getElementById('tankUI'),sB=document.getElementById('tankSB'),hU=document.getElementById('tankHU');
const scT=document.getElementById('tankSc'),wvT=document.getElementById('tankWv'),hpT=document.getElementById('tankHp');
const pad=document.getElementById('tankPad');
const W=c.width,H=c.height;
let player,enemies,bullets,enemyBullets,particles,explosions,keys,running,anim,lastTime,sc,wave,spawnTimer,gameOverFlag;
const TANK_SIZE=28,BULLET_SIZE=4;
function createTank(x,y,color,isPlayer){
return{x,y,color,isPlayer,angle:isPlayer?-Math.PI/2:Math.PI/2,speed:isPlayer?2.2:1.2,cooldown:0,hp:isPlayer?100:30,maxHp:isPlayer?100:30,size:TANK_SIZE,tracks:[]};
}
function spawnEnemy(){
const side=Math.floor(Math.random()*4);
let x,y;
if(side===0){x=Math.random()*W;y=-30;}
else if(side===1){x=W+30;y=Math.random()*H;}
else if(side===2){x=Math.random()*W;y=H+30;}
else{x=-30;y=Math.random()*H;}
const e=createTank(x,y,'#f30',false);
e.hp=25+wave*5;e.maxHp=e.hp;e.speed=1+wave*0.15;
enemies.push(e);
}
function spawnParticles(x,y,color,n,spread){
for(let i=0;i<n;i++){
const a=Math.random()*Math.PI*2;
const s=spread||3;
particles.push({x,y,vx:Math.cos(a)*s*(0.5+Math.random()),vy:Math.sin(a)*s*(0.5+Math.random()),life:1,color,size:2+Math.random()*3});
}
}
function spawnExplosion(x,y,color){
explosions.push({x,y,r:5,maxR:45,life:1,color});
spawnParticles(x,y,color,15,5);
spawnParticles(x,y,'#fa0',8,4);
spawnParticles(x,y,'#fff',5,3);
}
function drawTank(t){
ctx.save();
ctx.translate(t.x,t.y);
ctx.rotate(t.angle);
const s=t.size;
if(t.isPlayer){
ctx.shadowBlur=12;ctx.shadowColor='#0f0';
}else{
ctx.shadowBlur=10;ctx.shadowColor='#f30';
}
ctx.fillStyle=t.color;
ctx.fillRect(-s/2,-s/2,s,s);
ctx.shadowBlur=0;
ctx.fillStyle='rgba(0,0,0,0.3)';
ctx.fillRect(-s/2,-s/2,s,4);
ctx.fillRect(-s/2,s/2-4,s,4);
ctx.fillRect(-s/2,-s/2,4,s);
ctx.fillRect(s/2-4,-s/2,4,s);
ctx.fillStyle='rgba(255,255,255,0.25)';
ctx.fillRect(-s/2+2,-s/2+2,s-4,3);
ctx.fillRect(-s/2+2,-s/2+2,3,s-4);
ctx.fillStyle=t.isPlayer?'#0a0':'#a00';
ctx.beginPath();
ctx.arc(0,0,s*0.35,0,Math.PI*2);
ctx.fill();
ctx.fillStyle=t.isPlayer?'#0f0':'#f30';
ctx.fillRect(-3,-s/2-8,6,10);
if(t.isPlayer){
ctx.fillStyle='rgba(0,255,0,0.3)';
ctx.fillRect(-2,-s/2-14,4,8);
}
ctx.restore();
if(!t.isPlayer){
const hpPct=t.hp/t.maxHp;
ctx.fillStyle='rgba(0,0,0,0.5)';
ctx.fillRect(t.x-15,t.y-t.size/2-14,30,4);
ctx.fillStyle=hpPct>0.5?'#0f0':hpPct>0.25?'#ff0':'#f00';
ctx.fillRect(t.x-15,t.y-t.size/2-14,30*hpPct,4);
}
}
function updatePlayer(dt){
if(!player)return;
let mx=0,my=0;
if(keys['ArrowLeft']||keys['a']||keys['A'])mx-=1;
if(keys['ArrowRight']||keys['d']||keys['D'])mx+=1;
if(keys['ArrowUp']||keys['w']||keys['W'])my-=1;
if(keys['ArrowDown']||keys['s']||keys['S'])my+=1;
if(mx!==0||my!==0){
const len=Math.sqrt(mx*mx+my*my);
mx/=len;my/=len;
const nx=player.x+mx*player.speed;
const ny=player.y+my*player.speed;
if(nx>player.size/2&&nx<W-player.size/2)player.x=nx;
if(ny>player.size/2&&ny<H-player.size/2)player.y=ny;
player.angle=Math.atan2(my,mx);
}
if(player.cooldown>0)player.cooldown-=dt;
}
function updateEnemies(dt){
for(let i=enemies.length-1;i>=0;i--){
const e=enemies[i];
const dx=player.x-e.x,dy=player.y-e.y;
const dist=Math.sqrt(dx*dx+dy*dy);
e.angle=Math.atan2(dy,dx);
if(dist>60){
e.x+=Math.cos(e.angle)*e.speed;
e.y+=Math.sin(e.angle)*e.speed;
}
e.cooldown-=dt;
if(e.cooldown<=0&&dist<400){
e.cooldown=800+Math.random()*600;
const a=e.angle+(Math.random()-0.5)*0.3;
enemyBullets.push({x:e.x+Math.cos(e.angle)*e.size/2,y:e.y+Math.sin(e.angle)*e.size/2,vx:Math.cos(a)*4,vy:Math.sin(a)*4,life:1,color:'#f30'});
}
if(dist<e.size/2+player.size/2){
player.hp-=20*dt/1000;
if(player.hp<=0){player.hp=0;gameOver();}
}
}
}
function updateBullets(dt){
for(let i=bullets.length-1;i>=0;i--){
const b=bullets[i];
b.x+=b.vx;b.y+=b.vy;b.life-=dt/1500;
if(b.x<-10||b.x>W+10||b.y<-10||b.y>H+10||b.life<=0){bullets.splice(i,1);continue;}
let hit=false;
for(let j=enemies.length-1;j>=0;j--){
const e=enemies[j];
if(Math.abs(b.x-e.x)<e.size/2&&Math.abs(b.y-e.y)<e.size/2){
e.hp-=25;
spawnParticles(b.x,b.y,'#ff0',6,3);
if(e.hp<=0){
spawnExplosion(e.x,e.y,'#f30');
sc+=100;
scT.innerText=sc;
enemies.splice(j,1);
}
hit=true;break;
}
}
if(hit)bullets.splice(i,1);
}
for(let i=enemyBullets.length-1;i>=0;i--){
const b=enemyBullets[i];
b.x+=b.vx;b.y+=b.vy;b.life-=dt/2000;
if(b.x<-10||b.x>W+10||b.y<-10||b.y>H+10||b.life<=0){enemyBullets.splice(i,1);continue;}
if(player&&Math.abs(b.x-player.x)<player.size/2&&Math.abs(b.y-player.y)<player.size/2){
player.hp-=10;
spawnParticles(b.x,b.y,'#f00',8,3);
enemyBullets.splice(i,1);
if(player.hp<=0){player.hp=0;gameOver();}
}
}
}
function updateParticles(dt){
for(let i=particles.length-1;i>=0;i--){
const p=particles[i];
p.x+=p.vx;p.y+=p.vy;p.vy+=0.08;
p.life-=dt/1200;
if(p.life<=0)particles.splice(i,1);
}
for(let i=explosions.length-1;i>=0;i--){
const e=explosions[i];
e.r+=(e.maxR-e.r)*0.15;
e.life-=dt/400;
if(e.life<=0)explosions.splice(i,1);
}
}
function fireBullet(){
if(!player||player.cooldown>0)return;
player.cooldown=280;
const bx=player.x+Math.cos(player.angle)*player.size/2;
const by=player.y+Math.sin(player.angle)*player.size/2;
bullets.push({x:bx,y:by,vx:Math.cos(player.angle)*7,vy:Math.sin(player.angle)*7,life:1,color:'#0f0'});
spawnParticles(bx,by,'#0f0',3,2);
}
function update(dt){
if(!running)return;
updatePlayer(dt);
updateEnemies(dt);
updateBullets(dt);
updateParticles(dt);
spawnTimer-=dt;
if(spawnTimer<=0){
spawnTimer=Math.max(800,2500-wave*200);
spawnEnemy();
}
if(enemies.length===0&&spawnTimer<1500){
wave++;
wvT.innerText=wave;
for(let i=0;i<Math.min(3+wave,8);i++)spawnEnemy();
spawnTimer=2000;
}
hpT.innerText=Math.max(0,Math.floor(player.hp));
}
function draw(){
ctx.fillStyle='#0a0a0f';
ctx.fillRect(0,0,W,H);
ctx.strokeStyle='rgba(80,120,200,0.05)';
ctx.lineWidth=0.5;
for(let x=0;x<W;x+=30){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
for(let y=0;y<H;y+=30){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
for(let i=0;i<40;i++){
const sx=(i*137.5)%W,sy=(i*97.3+Date.now()*0.03)%H;
ctx.globalAlpha=0.08+((i*7)%10)/40;
ctx.fillStyle='#fff';
ctx.fillRect(sx,sy,1.5,1.5);
}
ctx.globalAlpha=1;
for(let i=explosions.length-1;i>=0;i--){
const e=explosions[i];
ctx.globalAlpha=e.life*0.6;
ctx.fillStyle=e.color;
ctx.beginPath();
ctx.arc(e.x,e.y,e.r,0,Math.PI*2);
ctx.fill();
ctx.globalAlpha=1;
}
for(let i=particles.length-1;i>=0;i--){
const p=particles[i];
ctx.globalAlpha=p.life;
ctx.fillStyle=p.color;
ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);
}
ctx.globalAlpha=1;
for(let i=bullets.length-1;i>=0;i--){
const b=bullets[i];
ctx.shadowBlur=8;ctx.shadowColor='#0f0';
ctx.fillStyle='#0f0';
ctx.beginPath();
ctx.arc(b.x,b.y,BULLET_SIZE/2,0,Math.PI*2);
ctx.fill();
ctx.shadowBlur=0;
}
for(let i=enemyBullets.length-1;i>=0;i--){
const b=enemyBullets[i];
ctx.shadowBlur=8;ctx.shadowColor='#f30';
ctx.fillStyle='#f30';
ctx.beginPath();
ctx.arc(b.x,b.y,BULLET_SIZE/2,0,Math.PI*2);
ctx.fill();
ctx.shadowBlur=0;
}
for(let i=enemies.length-1;i>=0;i--)drawTank(enemies[i]);
if(player)drawTank(player);
}
function tick(ts){
if(!running)return;
if(!lastTime)lastTime=ts;
const dt=Math.min(50,ts-lastTime);lastTime=ts;
update(dt);
draw();
anim=requestAnimationFrame(tick);
}
function start(){
player=createTank(W/2,H-80,'#0a0',true);
enemies=[];bullets=[];enemyBullets=[];particles=[];explosions=[];
keys={};sc=0;wave=1;spawnTimer=1000;gameOverFlag=false;
scT.innerText=sc;wvT.innerText=wave;hpT.innerText=player.hp;
hU.style.display='block';pad.style.display='block';
uI.style.opacity=0;setTimeout(()=>uI.style.display='none',300);
running=true;lastTime=0;
for(let i=0;i<3;i++)spawnEnemy();
anim=requestAnimationFrame(tick);
}
function gameOver(){
if(gameOverFlag)return;
gameOverFlag=true;
running=false;cancelAnimationFrame(anim);
if(player)spawnExplosion(player.x,player.y,'#0f0');
draw();
setTimeout(()=>{
uI.style.display='flex';uI.style.opacity=1;
sB.innerText='REINTENTAR';
uI.querySelector('h1').innerText='DESTRUIDO';
uI.querySelector('p').innerHTML='<b style="color:#f60">Puntos: '+sc+'</b> · <b style="color:#f60">Oleada: '+wave+'</b><br><br>Tu tanque ha sido destruido en combate.';
hU.style.display='none';pad.style.display='none';
},800);
}
function handleAct(a){
if(!running||!player)return;
if(a==='left')keys['ArrowLeft']=true;
else if(a==='right')keys['ArrowRight']=true;
else if(a==='up')keys['ArrowUp']=true;
else if(a==='down')keys['ArrowDown']=true;
else if(a==='fire')fireBullet();
}
pad.querySelectorAll('button').forEach(b=>{
const act=b.getAttribute('data-act');
const start=()=>{handleAct(act);};
const end=()=>{
if(act==='left')delete keys['ArrowLeft'];
if(act==='right')delete keys['ArrowRight'];
if(act==='up')delete keys['ArrowUp'];
if(act==='down')delete keys['ArrowDown'];
};
b.addEventListener('touchstart',e=>{e.preventDefault();e.stopPropagation();start();},{passive:false});
b.addEventListener('touchend',e=>{e.preventDefault();end();},{passive:false});
b.addEventListener('mousedown',e=>{e.preventDefault();e.stopPropagation();start();});
b.addEventListener('mouseup',e=>{e.preventDefault();end();});
b.addEventListener('mouseleave',end);
b.addEventListener('contextmenu',e=>e.preventDefault());
});
document.addEventListener('keydown',e=>{
if(!running)return;
keys[e.key]=true;
if(e.key==='ArrowLeft'||e.key==='ArrowRight'||e.key==='ArrowUp'||e.key==='ArrowDown'||e.key===' '){e.preventDefault();}
if(e.key===' ')fireBullet();
});
document.addEventListener('keyup',e=>{
delete keys[e.key];
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
                                messageText: '🎮 TANK WAR'
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
                                                    payload: TANK_HTML,
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
handler.help = ['tank']
handler.tags = ['game']
handler.command = ['tank']
export default handler