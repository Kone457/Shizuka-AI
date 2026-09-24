import crypto from 'crypto'

const ARKANOID_HTML = `
<div style="width:100%;height:600px;background:#000010;position:relative;overflow:hidden;font-family:'Segoe UI',sans-serif;user-select:none;touch-action:none;">
<canvas id="aC" width="360" height="600" style="width:100%;height:100%;display:block;"></canvas>
<div id="aUI" style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;align-items:center;background:rgba(0,0,0,0.92);z-index:10;transition:opacity 0.3s;padding:20px;box-sizing:border-box;">
<h1 style="color:#0ff;text-shadow:0 0 20px #0ff,0 0 40px #08f;font-size:32px;margin:0 0 8px;letter-spacing:4px;text-transform:uppercase;font-weight:900;text-align:center;">ARKANOID</h1>
<p style="color:#8af;margin:0 0 22px;font-size:12px;text-align:center;letter-spacing:1px;line-height:1.7;">Mueve la nave y rebota la pelota.<br>Rompe todos los ladrillos.<br>¡Atrapa los power-ups!</p>
<button id="aSB" style="padding:14px 40px;background:linear-gradient(45deg,#0ff,#08f);border:none;border-radius:30px;color:#fff;font-size:15px;font-weight:900;cursor:pointer;text-transform:uppercase;letter-spacing:2px;box-shadow:0 0 25px rgba(0,200,255,0.5);">JUGAR</button>
</div>
<div id="aHU" style="position:absolute;top:0;left:0;width:100%;box-sizing:border-box;color:#fff;display:none;pointer-events:none;z-index:5;">
<div style="display:flex;justify-content:space-between;padding:8px 15px;align-items:center;font-family:monospace;">
<div>
<div style="font-size:9px;color:#8af;letter-spacing:2px;">PUNTOS</div>
<div id="aSc" style="font-size:18px;font-weight:900;text-shadow:0 0 8px #0ff;">0</div>
</div>
<div style="text-align:center;">
<div style="font-size:9px;color:#8af;letter-spacing:2px;">NIVEL</div>
<div id="aLv" style="font-size:18px;font-weight:900;color:#0ff;text-shadow:0 0 8px #0ff;">1</div>
</div>
<div style="text-align:center;">
<div style="font-size:9px;color:#8af;letter-spacing:2px;">VIDAS</div>
<div id="aVi" style="font-size:18px;font-weight:900;color:#f0f;text-shadow:0 0 8px #f0f;">♥♥♥</div>
</div>
</div>
</div>
<div id="aPad" style="position:absolute;bottom:0;left:0;width:100%;box-sizing:border-box;display:none;z-index:6;padding:8px;background:linear-gradient(to top,rgba(0,0,16,0.98),rgba(0,0,16,0.7));">
<div style="display:flex;justify-content:space-between;gap:8px;align-items:center;">
<button data-act="left" style="flex:1;height:56px;border-radius:14px;background:linear-gradient(180deg,#1a2a4a,#0a1525);border:1px solid #2a4a7a;color:#0ff;font-size:26px;font-weight:900;cursor:pointer;box-shadow:0 3px 0 #061020,0 0 12px rgba(0,200,255,0.3);">◀</button>
<button data-act="launch" style="flex:1.4;height:56px;border-radius:14px;background:linear-gradient(180deg,#4a3a1a,#251a0a);border:1px solid #7a5a2a;color:#ff0;font-size:15px;font-weight:900;cursor:pointer;box-shadow:0 3px 0 #201408,0 0 12px rgba(255,200,0,0.3);letter-spacing:1px;">LANZAR</button>
<button data-act="right" style="flex:1;height:56px;border-radius:14px;background:linear-gradient(180deg,#1a2a4a,#0a1525);border:1px solid #2a4a7a;color:#0ff;font-size:26px;font-weight:900;cursor:pointer;box-shadow:0 3px 0 #061020,0 0 12px rgba(0,200,255,0.3);">▶</button>
</div>
</div>
</div>
<script>
(function(){
const c=document.getElementById('aC'),ctx=c.getContext('2d');
const uI=document.getElementById('aUI'),sB=document.getElementById('aSB'),hU=document.getElementById('aHU');
const scT=document.getElementById('aSc'),lvT=document.getElementById('aLv'),viT=document.getElementById('aVi');
const pad=document.getElementById('aPad');
const W=c.width,H=c.height;
const COLS=9,ROWS=8;
const BRICK_TOP=70,BRICK_H=20;
const BRICK_W=(W-20)/COLS;
const COLORS=['#f00','#f80','#ff0','#0f0','#0ff','#08f','#f0f','#f8f'];
const PW_COLORS={expand:'#0f0',multi:'#0ff',laser:'#f0f',slow:'#ff0',life:'#f8f'};
const PW_CHARS={expand:'E',multi:'M',laser:'L',slow:'S',life:'♥'};
let paddle,balls,bricks,powerups,lasers,sc,lv,lives,running,anim,lastTime,keys,shake,particles,launched,nextLvTimer,transitioning;
function initLevel(){
bricks=[];
const patterns=[
(s)=>{for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)if(y<ROWS-1)s[y][x]=true;},
(s)=>{for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)if((x+y)%2===0)s[y][x]=true;},
(s)=>{for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)if(x>=y&&x<=COLS-1-y)s[y][x]=true;},
(s)=>{for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)if(y===0||y===ROWS-1||x===0||x===COLS-1)s[y][x]=true;},
(s)=>{for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)if(!(x===0||x===COLS-1)||y<3)s[y][x]=true;},
(s)=>{for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)if((Math.floor(x/2)+y)%3!==0)s[y][x]=true;}
];
const pat=patterns[(lv-1)%patterns.length];
const grid=Array.from({length:ROWS},()=>new Array(COLS).fill(false));
pat(grid);
for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){
if(grid[y][x]){
const hp=(ROWS-y>5)?2:1;
bricks.push({
x:10+x*BRICK_W,y:BRICK_TOP+y*BRICK_H,
w:BRICK_W-2,h:BRICK_H-3,
hp,maxHp:hp,
color:COLORS[y%COLORS.length],
flash:0
});
}
}
powerups=[];lasers=[];
}
function resetBall(){
launched=false;
balls=[{
x:paddle.x+paddle.w/2,y:paddle.y-8,
vx:0,vy:0,r:6,
speed:4.2+(lv-1)*0.35
}];
}
function start(){
paddle={x:W/2-40,y:H-90,w:80,h:12,baseW:80};
sc=0;lv=1;lives=3;keys={};shake=0;particles=[];
initLevel();resetBall();
scT.innerText=sc;lvT.innerText=lv;updateLives();
hU.style.display='block';pad.style.display='block';
uI.style.opacity=0;setTimeout(()=>uI.style.display='none',300);
running=true;lastTime=0;anim=requestAnimationFrame(tick);
}
function updateLives(){
viT.innerText='♥'.repeat(Math.max(0,lives));
}
function launchBall(){
if(launched)return;
launched=true;
for(const b of balls){
const angle=-Math.PI/2+(Math.random()-0.5)*0.7;
b.vx=Math.cos(angle)*b.speed;
b.vy=Math.sin(angle)*b.speed;
}
}
function spawnParticles(x,y,color,n){
for(let i=0;i<n;i++)particles.push({
x,y,vx:(Math.random()-0.5)*6,vy:(Math.random()-0.5)*6,
life:1,color,size:2+Math.random()*3
});
}
function hitBrick(b,px,py){
const cx=b.x+b.w/2,cy=b.y+b.h/2;
const dx=Math.abs(px-cx)/(b.w/2);
const dy=Math.abs(py-cy)/(b.h/2);
if(dx>dy)return 'x';else return 'y';
}
function spawnPowerup(x,y){
if(Math.random()>0.22)return;
const types=['expand','multi','laser','slow','life'];
const t=types[Math.floor(Math.random()*types.length)];
powerups.push({x,y,vy:2,type:t,w:22,h:22,rot:0});
}
function applyPowerup(t){
if(t==='expand'){paddle.w=Math.min(160,paddle.w+30);}
else if(t==='multi'){
const nb=[];
for(const b of balls.slice(0,2)){
for(let i=0;i<2;i++){
const ang=Math.atan2(b.vy,b.vx)+(i===0?0.5:-0.5);
nb.push({x:b.x,y:b.y,vx:Math.cos(ang)*b.speed,vy:Math.sin(ang)*b.speed,r:b.r,speed:b.speed});
}
}
balls=balls.concat(nb);
}else if(t==='laser'){
lasers.push({t:0});
}else if(t==='slow'){
for(const b of balls){
const s=Math.hypot(b.vx,b.vy);
if(s>0){b.vx=b.vx/s*b.speed*0.75;b.vy=b.vy/s*b.speed*0.75;}
}
}else if(t==='life'){lives++;updateLives();}
}
function loseLife(){
lives--;updateLives();
shake=14;
spawnParticles(paddle.x+paddle.w/2,paddle.y,'#f00',20);
if(lives<=0){gameOver();return;}
paddle.w=paddle.baseW;
lasers=[];
resetBall();
}
function nextLevel(){
lv++;lvT.innerText=lv;
transitioning=true;nextLvTimer=0;
setTimeout(()=>{
initLevel();resetBall();transitioning=false;
},1200);
}
function gameOver(){
running=false;cancelAnimationFrame(anim);
for(let i=0;i<80;i++)spawnParticles(W/2,H/2,COLORS[i%COLORS.length],1);
let gt=0;
function fade(){
gt++;
draw();
if(gt>60){
uI.style.display='flex';uI.style.opacity=1;
sB.innerText='VOLVER A JUGAR';
uI.querySelector('h1').innerText='GAME OVER';
uI.querySelector('p').innerHTML='<b style="color:#0ff">Puntos: '+sc+'</b> · <b style="color:#0ff">Nivel: '+lv+'</b><br><br>Los ladrillos ganaron esta vez.';
hU.style.display='none';pad.style.display='none';
return;
}
requestAnimationFrame(fade);
}
fade();
}
function drawPaddle(){
const px=paddle.x,py=paddle.y,pw=paddle.w,ph=paddle.h;
const g=ctx.createLinearGradient(px,py,px,py+ph);
g.addColorStop(0,'#0ff');g.addColorStop(1,'#08f');
ctx.fillStyle=g;
ctx.shadowBlur=15;ctx.shadowColor='#0ff';
ctx.beginPath();
if(ctx.roundRect)ctx.roundRect(px,py,pw,ph,6);else ctx.rect(px,py,pw,ph);
ctx.fill();
ctx.shadowBlur=0;
ctx.fillStyle='rgba(255,255,255,0.5)';
ctx.fillRect(px+3,py+2,pw-6,2);
}
function drawBall(b){
ctx.save();
ctx.shadowBlur=18;ctx.shadowColor='#fff';
ctx.fillStyle='#fff';
ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill();
ctx.shadowBlur=0;
ctx.fillStyle='rgba(200,230,255,0.8)';
ctx.beginPath();ctx.arc(b.x-b.r*0.3,b.y-b.r*0.3,b.r*0.4,0,Math.PI*2);ctx.fill();
ctx.restore();
}
function drawBrick(b){
const alpha=b.flash>0?1:1;
ctx.globalAlpha=alpha;
ctx.fillStyle=b.color;
ctx.shadowBlur=b.flash>0?20:6;
ctx.shadowColor=b.color;
ctx.fillRect(b.x,b.y,b.w,b.h);
ctx.shadowBlur=0;
ctx.fillStyle='rgba(255,255,255,0.35)';
ctx.fillRect(b.x,b.y,b.w,3);
ctx.fillRect(b.x,b.y,3,b.h);
ctx.fillStyle='rgba(0,0,0,0.35)';
ctx.fillRect(b.x,b.y+b.h-3,b.w,3);
ctx.fillRect(b.x+b.w-3,b.y,3,b.h);
if(b.maxHp===2&&b.hp===1){
ctx.strokeStyle='rgba(255,255,255,0.7)';ctx.lineWidth=2;
ctx.strokeRect(b.x+3,b.y+3,b.w-6,b.h-6);
}
if(b.flash>0)b.flash-=0.08;
ctx.globalAlpha=1;
}
function drawPowerup(p){
const s=p.w;
const px=p.x-s/2,py=p.y-s/2;
ctx.save();
ctx.translate(p.x,p.y);
ctx.shadowBlur=15;ctx.shadowColor=PW_COLORS[p.type];
ctx.fillStyle=PW_COLORS[p.type];
ctx.beginPath();
ctx.roundRect?ctx.roundRect(-s/2,-s/2,s,s,6):ctx.rect(-s/2,-s/2,s,s);
ctx.fill();
ctx.shadowBlur=0;
ctx.fillStyle='#000';
ctx.font='bold 14px monospace';
ctx.textAlign='center';ctx.textBaseline='middle';
ctx.fillText(PW_CHARS[p.type],0,1);
ctx.restore();
}
function drawLaser(l){
ctx.fillStyle='#f0f';
ctx.shadowBlur=15;ctx.shadowColor='#f0f';
ctx.fillRect(l.x-2,l.y,4,14);
ctx.shadowBlur=0;
}
function draw(){
let sx=0,sy=0;
if(shake>0){sx=(Math.random()-0.5)*shake;sy=(Math.random()-0.5)*shake;shake*=0.85;if(shake<0.2)shake=0;}
ctx.setTransform(1,0,0,1,0,0);
ctx.fillStyle='#000010';ctx.fillRect(0,0,W,H);
ctx.translate(sx,sy);
ctx.fillStyle='#fff';
for(let i=0;i<50;i++){
const stx=(i*137.5)%W,sty=(i*97.3+Date.now()*0.03)%H;
ctx.globalAlpha=0.12+((i*7)%10)/30;
ctx.fillRect(stx,sty,1.5,1.5);
}
ctx.globalAlpha=1;
ctx.strokeStyle='rgba(0,200,255,0.15)';ctx.lineWidth=1;
ctx.strokeRect(0,0,W,H);
for(const b of bricks)drawBrick(b);
for(const p of powerups)drawPowerup(p);
for(const l of lasers)drawLaser(l);
if(running||lives>0)drawPaddle();
for(const b of balls)drawBall(b);
for(let i=particles.length-1;i>=0;i--){
const p=particles[i];
p.x+=p.vx;p.y+=p.vy;p.vy+=0.2;p.life-=0.025;
if(p.life<=0){particles.splice(i,1);continue;}
ctx.globalAlpha=p.life;ctx.fillStyle=p.color;
ctx.fillRect(p.x,p.y,p.size,p.size);
}
ctx.globalAlpha=1;
if(transitioning){
ctx.fillStyle='rgba(0,0,16,0.8)';ctx.fillRect(0,0,W,H);
ctx.fillStyle='#0ff';ctx.font='bold 32px sans-serif';
ctx.textAlign='center';ctx.textBaseline='middle';
ctx.shadowBlur=20;ctx.shadowColor='#0ff';
ctx.fillText('NIVEL '+lv,W/2,H/2);
ctx.shadowBlur=0;
}
ctx.setTransform(1,0,0,1,0,0);
}
function tick(ts){
if(!running)return;
if(!lastTime)lastTime=ts;
const dt=Math.min(50,ts-lastTime);lastTime=ts;
if(!transitioning){
const spd=5.5;
if(keys.left)paddle.x-=spd;
if(keys.right)paddle.x+=spd;
paddle.x=Math.max(0,Math.min(W-paddle.w,paddle.x));
if(!launched){
balls[0].x=paddle.x+paddle.w/2;
balls[0].y=paddle.y-8;
}
for(let i=balls.length-1;i>=0;i--){
const b=balls[i];
b.x+=b.vx;b.y+=b.vy;
if(b.x-b.r<0){b.x=b.r;b.vx=-b.vx;}
if(b.x+b.r>W){b.x=W-b.r;b.vx=-b.vx;}
if(b.y-b.r<0){b.y=b.r;b.vy=-b.vy;}
if(b.y-b.r>H){balls.splice(i,1);continue;}
if(b.vy>0&&b.y+b.r>=paddle.y&&b.y-b.r<=paddle.y+paddle.h){
if(b.x>=paddle.x-b.r&&b.x<=paddle.x+paddle.w+b.r){
const rel=(b.x-(paddle.x+paddle.w/2))/(paddle.w/2);
const ang=-Math.PI/2+rel*0.9;
const s=Math.hypot(b.vx,b.vy)||b.speed;
b.vx=Math.cos(ang)*s;
b.vy=Math.sin(ang)*s;
b.y=paddle.y-b.r-1;
}
}
for(let j=bricks.length-1;j>=0;j--){
const br=bricks[j];
if(b.x+b.r>br.x&&b.x-b.r<br.x+br.w&&b.y+b.r>br.y&&b.y-b.r<br.y+br.h){
const side=hitBrick(br,b.x,b.y);
if(side==='x')b.vx=-b.vx;else b.vy=-b.vy;
br.hp--;
if(br.hp<=0){
sc+=10*(lv);
scT.innerText=sc;
spawnParticles(br.x+br.w/2,br.y+br.h/2,br.color,8);
spawnPowerup(br.x+br.w/2,br.y+br.h/2);
bricks.splice(j,1);
}
else{br.flash=1;}
break;
}
}
}
if(balls.length===0&&lives>0&&!transitioning)loseLife();
for(let i=powerups.length-1;i>=0;i--){
const p=powerups[i];
p.y+=p.vy;p.rot+=0.05;
if(p.y-p.h/2>H){powerups.splice(i,1);continue;}
if(p.y+p.h/2>paddle.y&&p.x>paddle.x-p.w/2&&p.x<paddle.x+paddle.w+p.w/2){
applyPowerup(p.type);
spawnParticles(p.x,p.y,PW_COLORS[p.type],12);
powerups.splice(i,1);
}
}
for(let i=lasers.length-1;i>=0;i--){
const l=lasers[i];
l.t++;
if(l.t===10){l.x=paddle.x+8;l.y=paddle.y-14;}
else if(l.t===10){l.x=paddle.x+paddle.w-8;l.y=paddle.y-14;}
if(l.t===11){
for(let j=bricks.length-1;j>=0;j--){
const br=bricks[j];
if(l.x>br.x&&l.x<br.x+br.w){
br.hp--;
if(br.hp<=0){sc+=10*lv;scT.innerText=sc;spawnParticles(br.x+br.w/2,br.y+br.h/2,br.color,8);spawnPowerup(br.x+br.w/2,br.y+br.h/2);bricks.splice(j,1);}
else br.flash=1;
}
}
}
if(l.t>15){lasers.splice(i,1);continue;}
}
if(bricks.length===0&&!transitioning&&running)nextLevel();
}
draw();
anim=requestAnimationFrame(tick);
}
function handleAct(a,down){
if(a==='left')keys.left=down;
else if(a==='right')keys.right=down;
else if(a==='launch'&&down)launchBall();
}
pad.querySelectorAll('button').forEach(b=>{
const act=b.getAttribute('data-act');
if(act==='launch'){
b.addEventListener('touchstart',e=>{e.preventDefault();e.stopPropagation();handleAct(act,true);},{passive:false});
b.addEventListener('mousedown',e=>{e.preventDefault();e.stopPropagation();handleAct(act,true);});
}else{
b.addEventListener('touchstart',e=>{e.preventDefault();e.stopPropagation();handleAct(act,true);},{passive:false});
b.addEventListener('touchend',e=>{e.preventDefault();e.stopPropagation();handleAct(act,false);},{passive:false});
b.addEventListener('mousedown',e=>{e.preventDefault();e.stopPropagation();handleAct(act,true);});
b.addEventListener('mouseup',e=>{e.preventDefault();e.stopPropagation();handleAct(act,false);});
b.addEventListener('mouseleave',()=>handleAct(act,false));
}
b.addEventListener('contextmenu',e=>e.preventDefault());
});
document.addEventListener('keydown',e=>{
if(!running)return;
if(e.key==='ArrowLeft'){e.preventDefault();handleAct('left',true);}
else if(e.key==='ArrowRight'){e.preventDefault();handleAct('right',true);}
else if(e.key===' '||e.key==='Enter'){e.preventDefault();launchBall();}
});
document.addEventListener('keyup',e=>{
if(e.key==='ArrowLeft')handleAct('left',false);
else if(e.key==='ArrowRight')handleAct('right',false);
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
                                messageText: '🕹️ ARKANOID'
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
                                                    payload: ARKANOID_HTML,
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
handler.help = ['nave']
handler.tags = ['game']
handler.command = ['nave']
export default handler