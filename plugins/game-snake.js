import crypto from 'crypto'

const SNAKE_HTML = `
<div style="width:100%;height:600px;background:#050510;position:relative;overflow:hidden;font-family:'Segoe UI',sans-serif;user-select:none;touch-action:none;">
<canvas id="snkC" width="800" height="800" style="width:100%;height:100%;display:block;"></canvas>
<div id="snkUI" style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;align-items:center;background:rgba(0,0,0,0.9);z-index:10;transition:opacity 0.3s;padding:20px;box-sizing:border-box;">
<h1 style="color:#0f0;text-shadow:0 0 20px #0f0,0 0 40px #0a0;font-size:32px;margin:0 0 10px;letter-spacing:5px;text-transform:uppercase;font-weight:900;text-align:center;">SNAKE IO</h1>
<p style="color:#8f8;margin:0 0 20px;font-size:12px;text-align:center;letter-spacing:1px;line-height:1.8;">Devora puntos y serpientes más pequeñas.<br>Evita chocar contra las más grandes.<br>¡Crece y domina la arena!</p>
<button id="snkSB" style="padding:14px 42px;background:linear-gradient(45deg,#0f0,#0a0);border:none;border-radius:30px;color:#000;font-size:15px;font-weight:900;cursor:pointer;text-transform:uppercase;letter-spacing:3px;box-shadow:0 0 25px rgba(0,255,0,0.6);">JUGAR</button>
</div>
<div id="snkHU" style="position:absolute;top:0;left:0;width:100%;box-sizing:border-box;color:#fff;display:none;pointer-events:none;z-index:5;">
<div style="display:flex;justify-content:space-between;padding:8px 14px;align-items:center;">
<div>
<div style="font-size:9px;color:#8f8;letter-spacing:2px;">LONGITUD</div>
<div id="snkLen" style="font-size:20px;font-weight:900;font-family:monospace;text-shadow:0 0 8px #0f0;">10</div>
</div>
<div style="text-align:center;">
<div style="font-size:9px;color:#8f8;letter-spacing:2px;">RANKING</div>
<div id="snkRk" style="font-size:20px;font-weight:900;font-family:monospace;color:#0f0;text-shadow:0 0 8px #0f0;">1/8</div>
</div>
<div style="text-align:right;">
<div style="font-size:9px;color:#8f8;letter-spacing:2px;">PUNTOS</div>
<div id="snkSc" style="font-size:20px;font-weight:900;font-family:monospace;color:#ff0;text-shadow:0 0 8px #ff0;">0</div>
</div>
</div>
</div>
<div id="snkPad" style="position:absolute;bottom:0;left:0;width:100%;box-sizing:border-box;display:none;z-index:6;padding:8px;background:linear-gradient(to top,rgba(5,5,16,0.95),rgba(5,5,16,0.6));">
<div style="display:flex;justify-content:center;gap:6px;">
<button data-dir="up" style="width:60px;height:60px;border-radius:50%;background:linear-gradient(180deg,#0a2a0a,#051505);border:2px solid #0f0;color:#0f0;font-size:24px;font-weight:900;cursor:pointer;box-shadow:0 0 15px rgba(0,255,0,0.5);">▲</button>
</div>
<div style="display:flex;justify-content:center;gap:6px;margin-top:6px;">
<button data-dir="left" style="width:60px;height:60px;border-radius:50%;background:linear-gradient(180deg,#0a2a0a,#051505);border:2px solid #0f0;color:#0f0;font-size:24px;font-weight:900;cursor:pointer;box-shadow:0 0 15px rgba(0,255,0,0.5);">◀</button>
<button data-dir="down" style="width:60px;height:60px;border-radius:50%;background:linear-gradient(180deg,#0a2a0a,#051505);border:2px solid #0f0;color:#0f0;font-size:24px;font-weight:900;cursor:pointer;box-shadow:0 0 15px rgba(0,255,0,0.5);">▼</button>
<button data-dir="right" style="width:60px;height:60px;border-radius:50%;background:linear-gradient(180deg,#0a2a0a,#051505);border:2px solid #0f0;color:#0f0;font-size:24px;font-weight:900;cursor:pointer;box-shadow:0 0 15px rgba(0,255,0,0.5);">▶</button>
</div>
</div>
</div>
<script>
(function(){
const c=document.getElementById('snkC'),ctx=c.getContext('2d');
const uI=document.getElementById('snkUI'),sB=document.getElementById('snkSB'),hU=document.getElementById('snkHU');
const lenT=document.getElementById('snkLen'),rkT=document.getElementById('snkRk'),scT=document.getElementById('snkSc');
const pad=document.getElementById('snkPad');
const W=c.width,H=c.height;
const WORLD=1800;
const FOOD_COUNT=350;
const AI_COUNT=7;
const BASE_SPEED=2.2;
const BOOST_SPEED=4.2;
const SEGMENT_DIST=6;
const START_LEN=10;
let player,snakes,foods,particles,running,anim,lastTime,sc,camX,camY,canvasRect;
const AI_NAMES=['Neo','Viper','Hydra','Cobra','Kaa','Slith','Aspik','Boa','Fang','Rattler'];
const AI_COLORS=['#f30','#f0f','#08f','#ff0','#fa0','#0ff','#a0f','#f0a','#0f8','#8f0'];
function rand(min,max){return Math.random()*(max-min)+min;}
function getCanvasCoords(cx,cy){
if(!canvasRect)canvasRect=c.getBoundingClientRect();
return{
x:(cx-canvasRect.left)*(W/canvasRect.width),
y:(cy-canvasRect.top)*(H/canvasRect.height)
};
}
function makeSnake(x,y,color,isPlayer,name){
const s={
x,y,angle:Math.random()*Math.PI*2,
targetAngle:0,
segments:[],
length:START_LEN,
color,isPlayer,name,
speed:BASE_SPEED,
boosting:false,
alive:true,
score:0,
turnSpeed:0.08
};
s.targetAngle=s.angle;
for(let i=0;i<START_LEN*3;i++){
s.segments.push({x:x-Math.cos(s.angle)*i*SEGMENT_DIST,y:y-Math.sin(s.angle)*i*SEGMENT_DIST});
}
return s;
}
function spawnFood(x,y,color,value){
foods.push({x,y,color:color||'#ff0',value:value||1,size:6+Math.random()*4,pulse:Math.random()*Math.PI*2});
}
function initFoods(){
foods=[];
for(let i=0;i<FOOD_COUNT;i++){
spawnFood(rand(-WORLD/2,WORLD/2),rand(-WORLD/2,WORLD/2),['#ff0','#0ff','#f0f','#fff','#0f0'][Math.floor(Math.random()*5)],1);
}
}
function spawnParticles(x,y,color,n,spread){
for(let i=0;i<n;i++){
const a=Math.random()*Math.PI*2;
const s=spread||3;
particles.push({x,y,vx:Math.cos(a)*s*(0.3+Math.random()),vy:Math.sin(a)*s*(0.3+Math.random()),life:1,color,size:2+Math.random()*3});
}
}
function aiThink(s){
let closestEnemy=null,closestDist=Infinity;
let closestFood=null,foodDist=Infinity;
for(const o of snakes){
if(o===s||!o.alive)continue;
const dx=o.x-s.x,dy=o.y-s.y;
const d=Math.sqrt(dx*dx+dy*dy);
if(o.length<s.length*0.9&&d<400&&d<closestDist){
closestDist=d;closestEnemy=o;
}
}
for(const f of foods){
const dx=f.x-s.x,dy=f.y-s.y;
const d=dx*dx+dy*dy;
if(d<foodDist){foodDist=d;closestFood=f;}
}
let targetX,targetY;
if(closestEnemy){
targetX=closestEnemy.x;targetY=closestEnemy.y;
s.boosting=closestDist<250;
}else if(closestFood){
targetX=closestFood.x;targetY=closestFood.y;
s.boosting=false;
}else{
targetX=Math.cos(s.angle)*500+s.x;
targetY=Math.sin(s.angle)*500+s.y;
}
const wallMargin=200;
const distLeft=s.x+WORLD/2,distRight=WORLD/2-s.x,distTop=s.y+WORLD/2,distBot=WORLD/2-s.y;
if(distLeft<wallMargin){targetX=s.x+300;}
if(distRight<wallMargin){targetX=s.x-300;}
if(distTop<wallMargin){targetY=s.y+300;}
if(distBot<wallMargin){targetY=s.y-300;}
for(const o of snakes){
if(o===s||!o.alive)continue;
for(let i=0;i<Math.min(o.segments.length,20);i+=4){
const seg=o.segments[i];
const dx=seg.x-s.x,dy=seg.y-s.y;
const d=Math.sqrt(dx*dx+dy*dy);
if(d<120){
targetX=s.x-dx*2;targetY=s.y-dy*2;
break;
}
}
}
s.targetAngle=Math.atan2(targetY-s.y,targetX-s.x);
}
function updateSnake(s,dt){
if(!s.alive)return;
let da=s.targetAngle-s.angle;
while(da>Math.PI)da-=Math.PI*2;
while(da<-Math.PI)da+=Math.PI*2;
const maxTurn=s.turnSpeed*(s.boosting?0.7:1);
if(da>maxTurn)da=maxTurn;
if(da<-maxTurn)da=-maxTurn;
s.angle+=da;
s.speed=s.boosting?BOOST_SPEED:BASE_SPEED;
if(s.boosting&&s.length>START_LEN){
s.boostDecay=(s.boostDecay||0)+dt;
if(s.boostDecay>120){
s.boostDecay=0;
s.length-=0.15;
}
}
s.x+=Math.cos(s.angle)*s.speed;
s.y+=Math.sin(s.angle)*s.speed;
const bound=WORLD/2;
if(s.x<-bound)s.x=-bound;
if(s.x>bound)s.x=bound;
if(s.y<-bound)s.y=-bound;
if(s.y>bound)s.y=bound;
const head={x:s.x,y:s.y};
s.segments.unshift(head);
const maxSeg=Math.floor(s.length*3);
while(s.segments.length>maxSeg)s.segments.pop();
}
function checkCollisions(){
for(const s of snakes){
if(!s.alive)continue;
for(const o of snakes){
if(o===s||!o.alive)continue;
const skipSegs=s.isPlayer?8:3;
for(let i=skipSegs;i<o.segments.length;i++){
const seg=o.segments[i];
const dx=seg.x-s.x,dy=seg.y-s.y;
if(dx*dx+dy*dy<100){
if(o.length>s.length*1.15){
killSnake(s);
if(o.isPlayer){
o.length+=Math.floor(s.length*0.7);
o.score+=Math.floor(s.length*10);
sc=o.score;scT.innerText=sc;
}
}else if(s.length>o.length*1.15){
killSnake(o);
if(s.isPlayer){
s.length+=Math.floor(o.length*0.7);
s.score+=Math.floor(o.length*10);
sc=s.score;scT.innerText=sc;
}
}
break;
}
}
}
}
}
function killSnake(s){
if(!s.alive)return;
s.alive=false;
spawnParticles(s.x,s.y,s.color,25,6);
for(let i=0;i<s.segments.length;i+=3){
const seg=s.segments[i];
spawnFood(seg.x+rand(-10,10),seg.y+rand(-10,10),s.color,2);
}
if(s.isPlayer)setTimeout(gameOver,600);
}
function checkFood(){
for(const s of snakes){
if(!s.alive)continue;
for(let i=foods.length-1;i>=0;i--){
const f=foods[i];
const dx=f.x-s.x,dy=f.y-s.y;
if(dx*dx+dy*dy<(s.isPlayer?26:22)*(s.isPlayer?26:22)){
s.length+=f.value*0.35;
s.score+=f.value*5;
if(s.isPlayer){sc=s.score;scT.innerText=sc;}
spawnParticles(f.x,f.y,f.color,5,3);
foods.splice(i,1);
spawnFood(rand(-WORLD/2,WORLD/2),rand(-WORLD/2,WORLD/2),['#ff0','#0ff','#f0f','#fff','#0f0'][Math.floor(Math.random()*5)],1);
}
}
}
}
function drawSnake(s){
if(!s.alive)return;
const segs=s.segments;
if(segs.length<2)return;
const aliveSegs=segs.slice(0,Math.floor(s.length*3));
for(let i=aliveSegs.length-1;i>=0;i--){
const seg=aliveSegs[i];
const t=1-i/aliveSegs.length;
const radius=(s.isPlayer?11:9)*t+(s.isPlayer?4:3);
const alpha=0.5+t*0.5;
ctx.globalAlpha=alpha;
if(s.isPlayer){
ctx.shadowBlur=14;ctx.shadowColor=s.color;
}else{
ctx.shadowBlur=8;ctx.shadowColor=s.color;
}
ctx.fillStyle=s.color;
ctx.beginPath();
ctx.arc(seg.x,seg.y,radius,0,Math.PI*2);
ctx.fill();
}
ctx.shadowBlur=0;
ctx.globalAlpha=1;
const head=aliveSegs[0];
if(head){
ctx.shadowBlur=s.isPlayer?20:12;
ctx.shadowColor=s.color;
ctx.fillStyle=s.color;
ctx.beginPath();
ctx.arc(head.x,head.y,s.isPlayer?14:12,0,Math.PI*2);
ctx.fill();
ctx.shadowBlur=0;
const ex=Math.cos(s.angle)*5,ey=Math.sin(s.angle)*5;
const px=-Math.sin(s.angle)*5,py=Math.cos(s.angle)*5;
ctx.fillStyle='#fff';
ctx.beginPath();
ctx.arc(head.x+ex+px,head.y+ey+py,s.isPlayer?4:3.5,0,Math.PI*2);
ctx.arc(head.x+ex-px,head.y+ey-py,s.isPlayer?4:3.5,0,Math.PI*2);
ctx.fill();
ctx.fillStyle='#000';
ctx.beginPath();
ctx.arc(head.x+ex*1.3+px,head.y+ey*1.3+py,s.isPlayer?2:1.8,0,Math.PI*2);
ctx.arc(head.x+ex*1.3-px,head.y+ey*1.3-py,s.isPlayer?2:1.8,0,Math.PI*2);
ctx.fill();
}
if(!s.isPlayer&&s.name){
ctx.globalAlpha=0.8;
ctx.fillStyle='#fff';
ctx.font='bold 12px monospace';
ctx.textAlign='center';
ctx.fillText(s.name,head.x,head.y-22);
ctx.globalAlpha=1;
}
}
function drawFoods(){
const camLeft=camX-W/2-50;
const camRight=camX+W/2+50;
const camTop=camY-H/2-50;
const camBot=camY+H/2+50;
for(const f of foods){
if(f.x<camLeft||f.x>camRight||f.y<camTop||f.y>camBot)continue;
f.pulse+=0.08;
const size=f.size+Math.sin(f.pulse)*2;
ctx.shadowBlur=12;ctx.shadowColor=f.color;
ctx.fillStyle=f.color;
ctx.beginPath();
ctx.arc(f.x,f.y,size,0,Math.PI*2);
ctx.fill();
ctx.shadowBlur=0;
ctx.fillStyle='rgba(255,255,255,0.7)';
ctx.beginPath();
ctx.arc(f.x-1,f.y-1,size*0.35,0,Math.PI*2);
ctx.fill();
}
}
function drawGrid(){
const gridSize=80;
const camLeft=camX-W/2;
const camRight=camX+W/2;
const camTop=camY-H/2;
const camBot=camY+H/2;
const startX=Math.floor(camLeft/gridSize)*gridSize;
const startY=Math.floor(camTop/gridSize)*gridSize;
ctx.strokeStyle='rgba(0,255,100,0.06)';
ctx.lineWidth=1;
for(let x=startX;x<camRight;x+=gridSize){
ctx.beginPath();
ctx.moveTo(x,camTop);
ctx.lineTo(x,camBot);
ctx.stroke();
}
for(let y=startY;y<camBot;y+=gridSize){
ctx.beginPath();
ctx.moveTo(camLeft,y);
ctx.lineTo(camRight,y);
ctx.stroke();
}
const bound=WORLD/2;
ctx.strokeStyle='rgba(255,50,50,0.6)';
ctx.lineWidth=6;
ctx.shadowBlur=20;ctx.shadowColor='#f00';
ctx.strokeRect(-bound,-bound,WORLD,WORLD);
ctx.shadowBlur=0;
}
function drawMinimap(){
const size=100;
const mx=W-size-15,my=15;
ctx.fillStyle='rgba(0,0,0,0.5)';
ctx.fillRect(mx,my,size,size);
ctx.strokeStyle='rgba(0,255,0,0.4)';
ctx.lineWidth=1;
ctx.strokeRect(mx,my,size,size);
const scale=size/WORLD;
for(const s of snakes){
if(!s.alive)continue;
const px=mx+size/2+s.x*scale;
const py=my+size/2+s.y*scale;
ctx.fillStyle=s.isPlayer?'#0f0':s.color;
ctx.beginPath();
ctx.arc(px,py,s.isPlayer?3.5:2.5,0,Math.PI*2);
ctx.fill();
}
}
function updateCamera(dt){
if(!player||!player.alive)return;
const targetX=player.x,targetY=player.y;
camX+=(targetX-camX)*0.1;
camY+=(targetY-camY)*0.1;
}
function draw(){
ctx.fillStyle='#050510';
ctx.fillRect(0,0,W,H);
ctx.save();
ctx.translate(W/2-camX,H/2-camY);
drawGrid();
drawFoods();
for(const s of snakes){
if(s.isPlayer)drawSnake(s);
}
for(const s of snakes){
if(!s.isPlayer)drawSnake(s);
}
for(let i=particles.length-1;i>=0;i--){
const p=particles[i];
ctx.globalAlpha=p.life;
ctx.fillStyle=p.color;
ctx.shadowBlur=6;ctx.shadowColor=p.color;
ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);
}
ctx.shadowBlur=0;
ctx.globalAlpha=1;
ctx.restore();
drawMinimap();
}
function updateRanking(){
const sorted=snakes.filter(s=>s.alive).sort((a,b)=>b.length-a.length);
const rank=sorted.indexOf(player)+1;
rkT.innerText=rank+'/'+sorted.length;
lenT.innerText=Math.floor(player.length);
}
function update(dt){
if(!running)return;
updateCamera(dt);
for(const s of snakes){
if(!s.isPlayer)aiThink(s);
updateSnake(s,dt);
}
checkCollisions();
checkFood();
for(let i=particles.length-1;i>=0;i--){
const p=particles[i];
p.x+=p.vx;p.y+=p.vy;p.vx*=0.97;p.vy*=0.97;
p.life-=dt/800;
if(p.life<=0)particles.splice(i,1);
}
updateRanking();
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
const bx=rand(-300,300),by=rand(-300,300);
player=makeSnake(bx,by,'#0f0',true,'Tú');
camX=bx;camY=by;
snakes=[player];
for(let i=0;i<AI_COUNT;i++){
let ex,ey,ok;
let tries=0;
do{
ok=true;
ex=rand(-WORLD/2+100,WORLD/2-100);
ey=rand(-WORLD/2+100,WORLD/2-100);
const dx=ex-bx,dy=ey-by;
if(dx*dx+dy*dy<300*300)ok=false;
tries++;
}while(!ok&&tries<20);
const ai=makeSnake(ex,ey,AI_COLORS[i],false,AI_NAMES[i]);
ai.length=START_LEN+Math.floor(Math.random()*8);
snakes.push(ai);
}
initFoods();
particles=[];
sc=0;
lenT.innerText=START_LEN;scT.innerText=0;rkT.innerText='1/'+(AI_COUNT+1);
hU.style.display='block';pad.style.display='block';
uI.style.opacity=0;setTimeout(()=>uI.style.display='none',300);
running=true;lastTime=0;
canvasRect=null;
anim=requestAnimationFrame(tick);
}
function gameOver(){
if(!running)return;
running=false;
cancelAnimationFrame(anim);
draw();
setTimeout(()=>{
uI.style.display='flex';uI.style.opacity=1;
sB.innerText='REINTENTAR';
uI.querySelector('h1').innerText='ELIMINADO';
uI.querySelector('p').innerHTML='<b style="color:#0f0">Longitud: '+Math.floor(player.length)+'</b> · <b style="color:#ff0">Puntos: '+sc+'</b><br><br>Otra serpiente fue más astuta.';
hU.style.display='none';pad.style.display='none';
},600);
}
function setDir(dx,dy){
if(!player||!player.alive)return;
player.targetAngle=Math.atan2(dy,dx);
}
pad.querySelectorAll('button').forEach(b=>{
const dir=b.getAttribute('data-dir');
const set=()=>{
if(dir==='up')setDir(0,-1);
else if(dir==='down')setDir(0,1);
else if(dir==='left')setDir(-1,0);
else if(dir==='right')setDir(1,0);
};
const startB=()=>{player&&(player.boosting=true);};
const endB=()=>{player&&(player.boosting=false);};
b.addEventListener('touchstart',e=>{e.preventDefault();e.stopPropagation();set();startB();},{passive:false});
b.addEventListener('touchend',e=>{e.preventDefault();endB();},{passive:false});
b.addEventListener('touchcancel',e=>{e.preventDefault();endB();},{passive:false});
b.addEventListener('mousedown',e=>{e.preventDefault();e.stopPropagation();set();startB();});
b.addEventListener('mouseup',e=>{e.preventDefault();endB();});
b.addEventListener('mouseleave',endB);
b.addEventListener('contextmenu',e=>e.preventDefault());
});
let touchStartX=0,touchStartY=0,touchActive=false;
c.addEventListener('touchstart',e=>{
if(!running)return;
e.preventDefault();
const t=e.touches[0];
touchStartX=t.clientX;touchStartY=t.clientY;
touchActive=true;
if(player)player.boosting=true;
},{passive:false});
c.addEventListener('touchmove',e=>{
if(!running||!touchActive)return;
e.preventDefault();
const t=e.touches[0];
const dx=t.clientX-touchStartX,dy=t.clientY-touchStartY;
if(dx*dx+dy*dy>400){
setDir(dx,dy);
touchStartX=t.clientX;touchStartY=t.clientY;
}
},{passive:false});
c.addEventListener('touchend',e=>{
touchActive=false;
if(player)player.boosting=false;
},{passive:false});
c.addEventListener('mousedown',e=>{
if(!running)return;
const p=getCanvasCoords(e.clientX,e.clientY);
const wx=p.x+camX-W/2,wy=p.y+camY-H/2;
if(player)setDir(wx-player.x,wy-player.y);
if(player)player.boosting=true;
});
c.addEventListener('mouseup',e=>{
if(player)player.boosting=false;
});
document.addEventListener('keydown',e=>{
if(!running)return;
if(e.key==='ArrowUp'||e.key==='w'||e.key==='W'){e.preventDefault();setDir(0,-1);}
else if(e.key==='ArrowDown'||e.key==='s'||e.key==='S'){e.preventDefault();setDir(0,1);}
else if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A'){e.preventDefault();setDir(-1,0);}
else if(e.key==='ArrowRight'||e.key==='d'||e.key==='D'){e.preventDefault();setDir(1,0);}
else if(e.key===' '){e.preventDefault();if(player)player.boosting=true;}
});
document.addEventListener('keyup',e=>{
if(e.key===' '){if(player)player.boosting=false;}
});
window.addEventListener('resize',()=>{canvasRect=null;});
sB.addEventListener('click',start);
ctx.fillStyle='#050510';
ctx.fillRect(0,0,W,H);
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
                                messageText: '🐍 SNAKE IO'
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
                                                    payload: SNAKE_HTML,
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
handler.help = ['snake']
handler.tags = ['game']
handler.command = ['snake']
export default handler