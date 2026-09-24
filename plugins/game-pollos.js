import crypto from 'crypto'
const GAME_HTML = `
<div style="width:100%;height:450px;background:#050510;position:relative;overflow:hidden;font-family:'Segoe UI',sans-serif;user-select:none;touch-action:none;">
<canvas id="gC" width="300" height="450" style="width:100%;height:100%;display:block;"></canvas>
<div id="uI" style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;align-items:center;background:rgba(0,0,0,0.85);z-index:10;transition:opacity 0.3s;">
<h1 style="color:#fa0;text-shadow:0 0 15px #fa0;font-size:28px;margin:0 0 10px;letter-spacing:2px;text-transform:uppercase;font-weight:900;text-align:center;">CHICKEN<br>INVADERS</h1>
<p style="color:#aaa;margin:0 0 25px;font-size:13px;text-align:center;">Arrastra la nave.<br>Destruye los pollos, esquiva los huevos.</p>
<button id="sB" style="padding:12px 30px;background:linear-gradient(45deg,#fa0,#f00);border:none;border-radius:25px;color:#fff;font-size:15px;font-weight:900;cursor:pointer;text-transform:uppercase;letter-spacing:1px;box-shadow:0 0 20px rgba(255,100,0,0.4);">SALVAR LA GALAXIA</button>
</div>
<div id="hU" style="position:absolute;top:10px;left:0;width:100%;justify-content:space-between;padding:0 15px;box-sizing:border-box;color:#fff;font-size:18px;font-weight:900;display:none;pointer-events:none;text-shadow:0 0 5px #fff;font-family:monospace;z-index:5;">
<span id="scT">0</span>
<span id="wvT" style="color:#fa0;">W1</span>
</div>
<script>
(function(){
const c=document.getElementById('gC'),ctx=c.getContext('2d'),uI=document.getElementById('uI'),sB=document.getElementById('sB'),hU=document.getElementById('hU'),scT=document.getElementById('scT'),wvT=document.getElementById('wvT');
let i=false,l,p,b,eb,e,pt,st,sc,wv,fr,eD,eS;
function init(){
p={x:c.width/2,y:c.height-40,w:24};b=[];eb=[];e=[];pt=[];st=[];sc=0;wv=1;fr=0;eD=1;eS=1;
for(let j=0;j<50;j++)st.push({x:Math.random()*c.width,y:Math.random()*c.height,v:Math.random()*2+1,s:Math.random()*1.5});
genW();scT.innerText=sc;wvT.innerText='W'+wv;hU.style.display='flex';uI.style.opacity=0;setTimeout(()=>uI.style.display='none',300);i=true;lP();
}
sB.addEventListener('click',init);
function genW(){
e=[];let r=Math.min(5,2+Math.floor(wv/2)),cols=5;
for(let y=0;y<r;y++)for(let x=0;x<cols;x++)e.push({x:40+x*45,y:40+y*40,w:24,hx:40+x*45});
eS=0.5+(wv*0.2);
}
function iC(mX){
if(!i)return;
const r=c.getBoundingClientRect();
p.x=Math.max(20,Math.min(c.width-20,(mX-r.left)/r.width*c.width));
}
c.addEventListener('mousemove',ev=>iC(ev.clientX));
c.addEventListener('touchmove',ev=>{ev.preventDefault();iC(ev.touches[0].clientX)},{passive:false});
function cP(x,y,c,s,l){
for(let k=0;k<s;k++)pt.push({x,y,vx:(Math.random()-0.5)*5,vy:(Math.random()-0.5)*5,li:l,c});
}
function dC(x,y){
ctx.save();ctx.translate(x,y);ctx.shadowBlur=5;ctx.shadowColor='#fff';ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(0,0,12,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#f00';ctx.beginPath();ctx.arc(-5,-10,4,0,Math.PI*2);ctx.arc(5,-10,4,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fa0';ctx.beginPath();ctx.moveTo(-6,0);ctx.lineTo(6,0);ctx.lineTo(0,8);ctx.fill();ctx.fillStyle='#000';ctx.fillRect(-6,-4,3,3);ctx.fillRect(3,-4,3,3);ctx.restore();
}
function lP(){
if(!i)return;
fr++;ctx.fillStyle='#050510';ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle='#fff';
for(let s of st){s.y+=s.v;if(s.y>c.height)s.y=0;ctx.globalAlpha=s.s/2;ctx.beginPath();ctx.arc(s.x,s.y,s.s,0,Math.PI*2);ctx.fill();}
ctx.globalAlpha=1;
if(fr%12===0)b.push({x:p.x,y:p.y-15,v:8});
ctx.shadowBlur=15;ctx.shadowColor='#0af';ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(p.x,p.y-16);ctx.lineTo(p.x-14,p.y+14);ctx.lineTo(p.x-5,p.y+8);ctx.lineTo(p.x+5,p.y+8);ctx.lineTo(p.x+14,p.y+14);ctx.fill();
ctx.shadowBlur=10;ctx.shadowColor='#0f0';ctx.fillStyle='#0f0';
for(let j=b.length-1;j>=0;j--){b[j].y-=b[j].v;ctx.fillRect(b[j].x-1.5,b[j].y,3,10);if(b[j].y<0)b.splice(j,1);}
ctx.shadowBlur=0;
let mD=false;
for(let ch of e){ch.x+=eD*eS;if(ch.x>c.width-20||ch.x<20)mD=true;}
if(mD){eD*=-1;for(let ch of e)ch.y+=20;}
for(let j=e.length-1;j>=0;j--){
dC(e[j].x,e[j].y);
if(Math.random()<0.001+(wv*0.0005))eb.push({x:e[j].x,y:e[j].y+10,v:3+(wv*0.2)});
if(e[j].y>p.y-20){gO();return;}
for(let k=b.length-1;k>=0;k--){
if(Math.hypot(b[k].x-e[j].x,b[k].y-e[j].y)<18){
sc+=10;scT.innerText=sc;cP(e[j].x,e[j].y,'#fff',8,1);cP(e[j].x,e[j].y,'#f00',4,1);e.splice(j,1);b.splice(k,1);break;
}
}
}
ctx.fillStyle='#ffc';
for(let j=eb.length-1;j>=0;j--){
eb[j].y+=eb[j].v;ctx.beginPath();ctx.ellipse(eb[j].x,eb[j].y,4,6,0,0,Math.PI*2);ctx.fill();
if(Math.hypot(p.x-eb[j].x,p.y-eb[j].y)<15){gO();return;}
if(eb[j].y>c.height)eb.splice(j,1);
}
if(e.length===0){wv++;wvT.innerText='W'+wv;genW();}
for(let j=pt.length-1;j>=0;j--){
let t=pt[j];t.x+=t.vx;t.y+=t.vy;t.li-=0.03;
if(t.li<=0)pt.splice(j,1);
else{ctx.globalAlpha=t.li;ctx.fillStyle=t.c;ctx.fillRect(t.x,t.y,3,3);}
}
ctx.globalAlpha=1;l=requestAnimationFrame(lP);
}
function gO(){
i=false;cancelAnimationFrame(l);cP(p.x,p.y,'#0af',20,1.5);cP(p.x,p.y,'#fff',10,1.5);
let gF=0;
function rO(){
if(gF>50){
uI.style.display='flex';uI.style.opacity=1;sB.innerText='VOLVER A JUGAR';uI.querySelector('h1').innerText='GAME OVER';uI.querySelector('p').innerHTML='<b>Puntuación: '+sc+'</b> | <b>Oleada: '+wv+'</b><br>Los pollos han dominado.';
return;
}
ctx.fillStyle='rgba(5,5,16,0.2)';ctx.fillRect(0,0,c.width,c.height);
for(let j=pt.length-1;j>=0;j--){let t=pt[j];t.x+=t.vx;t.y+=t.vy;t.li-=0.02;if(t.li>0){ctx.globalAlpha=t.li;ctx.fillStyle=t.c;ctx.fillRect(t.x,t.y,4,4);}}
ctx.globalAlpha=1;gF++;requestAnimationFrame(rO);
}
rO();
}
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
                                messageText: '🐔 CHICKEN INVADERS'
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
                                                    payload: GAME_HTML,
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
handler.help = ['pollos']
handler.tags = ['game']
handler.command = ['pollos']
export default handler