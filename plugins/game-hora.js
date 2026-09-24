import crypto from 'crypto'

const CLOCK_HTML = `
<div style="width:100%;height:600px;background:#000;position:relative;overflow:hidden;font-family:'Segoe UI',sans-serif;user-select:none;display:flex;align-items:center;justify-content:center;">
<canvas id="cC" width="360" height="600" style="width:100%;height:100%;display:block;"></canvas>
</div>
<script>
(function(){
const c=document.getElementById('cC'),ctx=c.getContext('2d');
const W=c.width,H=c.height;
const CX=W/2,CY=H/2-40;
const CLOCK_R=Math.min(W,H)*0.36;
function drawBackground(){
const g=ctx.createRadialGradient(CX,CY,50,CX,CY,Math.max(W,H));
g.addColorStop(0,'#0a0f1a');
g.addColorStop(0.5,'#050810');
g.addColorStop(1,'#000');
ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
const t=Date.now()*0.0002;
for(let i=0;i<80;i++){
const x=(i*73.7+Math.sin(t+i)*5)%W;
const y=(i*47.3+Math.cos(t*0.7+i)*5)%H;
const s=0.5+((i*13)%10)/15;
ctx.globalAlpha=0.15+((i*7)%10)/40*(0.5+0.5*Math.sin(t*3+i));
ctx.fillStyle='#fff';
ctx.beginPath();ctx.arc(x,y,s,0,Math.PI*2);ctx.fill();
}
ctx.globalAlpha=1;
}
function drawClockFace(){
const now=new Date();
const h=now.getHours(),m=now.getMinutes(),s=now.getSeconds(),ms=now.getMilliseconds();
const outerG=ctx.createRadialGradient(CX-CLOCK_R*0.3,CY-CLOCK_R*0.3,10,CX,CY,CLOCK_R);
outerG.addColorStop(0,'rgba(0,200,255,0.08)');
outerG.addColorStop(0.7,'rgba(0,100,200,0.05)');
outerG.addColorStop(1,'rgba(0,50,100,0.15)');
ctx.fillStyle=outerG;
ctx.beginPath();ctx.arc(CX,CY,CLOCK_R+8,0,Math.PI*2);ctx.fill();
ctx.strokeStyle='rgba(0,200,255,0.9)';
ctx.lineWidth=3;
ctx.shadowBlur=25;ctx.shadowColor='#0ff';
ctx.beginPath();ctx.arc(CX,CY,CLOCK_R,0,Math.PI*2);ctx.stroke();
ctx.shadowBlur=0;
ctx.strokeStyle='rgba(0,200,255,0.4)';
ctx.lineWidth=1;
ctx.beginPath();ctx.arc(CX,CY,CLOCK_R-4,0,Math.PI*2);ctx.stroke();
ctx.beginPath();ctx.arc(CX,CY,CLOCK_R-12,0,Math.PI*2);ctx.stroke();
for(let i=0;i<60;i++){
const ang=(i/60)*Math.PI*2-Math.PI/2;
const isHour=i%5===0;
const inner=isHour?CLOCK_R-22:CLOCK_R-14;
const outer=CLOCK_R-8;
const x1=CX+Math.cos(ang)*inner;
const y1=CY+Math.sin(ang)*inner;
const x2=CX+Math.cos(ang)*outer;
const y2=CY+Math.sin(ang)*outer;
if(isHour){
ctx.strokeStyle='#0ff';
ctx.lineWidth=3;
ctx.shadowBlur=8;ctx.shadowColor='#0ff';
}else{
ctx.strokeStyle='rgba(0,200,255,0.5)';
ctx.lineWidth=1.5;
ctx.shadowBlur=0;
}
ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
}
ctx.shadowBlur=0;
ctx.fillStyle='#0ff';
ctx.font='bold 18px sans-serif';
ctx.textAlign='center';ctx.textBaseline='middle';
for(let i=1;i<=12;i++){
const ang=(i/12)*Math.PI*2-Math.PI/2;
const x=CX+Math.cos(ang)*(CLOCK_R-40);
const y=CY+Math.sin(ang)*(CLOCK_R-40);
ctx.shadowBlur=10;ctx.shadowColor='#0ff';
ctx.fillText(i,x,y);
ctx.shadowBlur=0;
}
const hourAng=((h%12)+m/60+s/3600)/12*Math.PI*2-Math.PI/2;
const minAng=(m+s/60+ms/60000)/60*Math.PI*2-Math.PI/2;
const secAng=(s+ms/1000)/60*Math.PI*2-Math.PI/2;
ctx.save();
ctx.translate(CX,CY);
ctx.shadowBlur=15;ctx.shadowColor='#0ff';
ctx.strokeStyle='#0ff';
ctx.lineWidth=6;
ctx.lineCap='round';
ctx.rotate(hourAng);
ctx.beginPath();ctx.moveTo(0,12);ctx.lineTo(0,-CLOCK_R*0.5);ctx.stroke();
ctx.rotate(-hourAng);
ctx.strokeStyle='#0ff';
ctx.lineWidth=4;
ctx.rotate(minAng);
ctx.beginPath();ctx.moveTo(0,14);ctx.lineTo(0,-CLOCK_R*0.72);ctx.stroke();
ctx.rotate(-minAng);
ctx.shadowColor='#f0f';
ctx.strokeStyle='#f0f';
ctx.lineWidth=2;
ctx.rotate(secAng);
ctx.beginPath();ctx.moveTo(0,18);ctx.lineTo(0,-CLOCK_R*0.85);ctx.stroke();
ctx.rotate(-secAng);
ctx.shadowBlur=0;
ctx.fillStyle='#0ff';
ctx.shadowBlur=20;ctx.shadowColor='#0ff';
ctx.beginPath();ctx.arc(0,0,6,0,Math.PI*2);ctx.fill();
ctx.shadowBlur=0;
ctx.fillStyle='#fff';
ctx.beginPath();ctx.arc(0,0,3,0,Math.PI*2);ctx.fill();
ctx.restore();
}
function drawDigitalTime(){
const now=new Date();
const hh=String(now.getHours()).padStart(2,'0');
const mm=String(now.getMinutes()).padStart(2,'0');
const ss=String(now.getSeconds()).padStart(2,'0');
const ms=String(Math.floor(now.getMilliseconds()/10)).padStart(2,'0');
ctx.save();
ctx.textAlign='center';
ctx.textBaseline='middle';
const pulse=Math.sin(now.getMilliseconds()*Math.PI/500)*0.5+0.5;
ctx.font='bold 40px monospace';
ctx.shadowBlur=20;ctx.shadowColor='#0ff';
const timeStr=hh+':'+mm;
const wTime=ctx.measureText(timeStr).width;
ctx.fillStyle='#fff';
ctx.fillText(timeStr,CX-wTime/2-15,CY+CLOCK_R+55);
ctx.shadowBlur=15;ctx.shadowColor='#f0f';
ctx.fillStyle='rgba(255,0,255,'+(0.6+pulse*0.4)+')';
ctx.font='bold 24px monospace';
ctx.fillText(ss,CX+wTime/2-5,CY+CLOCK_R+60);
ctx.shadowBlur=8;ctx.shadowColor='#0ff';
ctx.font='bold 12px monospace';
ctx.fillStyle='rgba(0,200,255,0.7)';
ctx.fillText('.'+ms,CX+wTime/2+30,CY+CLOCK_R+65);
ctx.restore();
}
function drawDate(){
const now=new Date();
const days=['DOMINGO','LUNES','MARTES','MIÉRCOLES','JUEVES','VIERNES','SÁBADO'];
const months=['ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'];
const dayName=days[now.getDay()];
const monthName=months[now.getMonth()];
const dateStr=now.getDate();
const year=now.getFullYear();
ctx.save();
ctx.textAlign='center';ctx.textBaseline='middle';
ctx.font='bold 13px sans-serif';
ctx.fillStyle='rgba(0,200,255,0.8)';
ctx.shadowBlur=10;ctx.shadowColor='#0ff';
ctx.fillText(dayName,CX,CY-CLOCK_R-45);
ctx.font='bold 11px sans-serif';
ctx.fillStyle='rgba(0,200,255,0.6)';
ctx.fillText(dateStr+' '+monthName+' '+year,CX,CY-CLOCK_R-25);
ctx.restore();
}
function drawSunMoon(){
const now=new Date();
const hour=now.getHours()+now.getMinutes()/60;
const isDay=hour>=6&&hour<18;
const progress=(hour-6)/12;
const arcX=CX+(progress-0.5)*CLOCK_R*1.4;
const arcY=CY-CLOCK_R*0.75-Math.sin(progress*Math.PI)*30;
ctx.save();
ctx.globalAlpha=0.15;
ctx.strokeStyle=isDay?'#ffd700':'#8af';
ctx.lineWidth=1.5;
ctx.setLineDash([4,6]);
ctx.beginPath();
ctx.arc(CX,CY-CLOCK_R*0.75,CLOCK_R*0.7,Math.PI,Math.PI*2);
ctx.stroke();
ctx.setLineDash([]);
ctx.globalAlpha=1;
if(isDay){
ctx.shadowBlur=20;ctx.shadowColor='#ffd700';
const g=ctx.createRadialGradient(arcX,arcY,2,arcX,arcY,14);
g.addColorStop(0,'#ffff80');
g.addColorStop(0.6,'#ffd700');
g.addColorStop(1,'rgba(255,215,0,0)');
ctx.fillStyle=g;
ctx.beginPath();ctx.arc(arcX,arcY,14,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#fff8a0';
ctx.beginPath();ctx.arc(arcX,arcY,6,0,Math.PI*2);ctx.fill();
}else{
ctx.shadowBlur=15;ctx.shadowColor='#8af';
ctx.fillStyle='#e0e8ff';
ctx.beginPath();ctx.arc(arcX,arcY,10,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#0a0f1a';
ctx.beginPath();ctx.arc(arcX+5,arcY-3,9,0,Math.PI*2);ctx.fill();
}
ctx.restore();
}
function drawBatteryHealth(){
const now=new Date();
const dayPct=((now.getHours()*3600+now.getMinutes()*60+now.getSeconds())/86400)*100;
const y=H-115;
ctx.save();
ctx.fillStyle='rgba(0,200,255,0.1)';
ctx.fillRect(20,y,W-40,6);
const g=ctx.createLinearGradient(20,0,W-20,0);
g.addColorStop(0,'#0f0');
g.addColorStop(0.5,'#ff0');
g.addColorStop(1,'#f00');
ctx.fillStyle=g;
ctx.fillRect(20,y,(W-40)*dayPct/100,6);
ctx.strokeStyle='rgba(0,200,255,0.4)';
ctx.lineWidth=1;
ctx.strokeRect(20,y,W-40,6);
ctx.font='bold 8px monospace';
ctx.textAlign='left';
ctx.fillStyle='rgba(0,200,255,0.6)';
ctx.fillText('DÍA',20,y-5);
ctx.textAlign='right';
ctx.fillText(Math.floor(dayPct)+'%',W-20,y-5);
ctx.restore();
}
function drawStats(){
const now=new Date();
const start=new Date(now.getFullYear(),0,0);
const diff=now-start;
const dayOfYear=Math.floor(diff/86400000);
const daysInYear=((now.getFullYear()%4===0&&now.getFullYear()%100!==0)||now.getFullYear()%400===0)?366:365;
const weekOfYear=Math.ceil(dayOfYear/7);
const yearPct=(dayOfYear/daysInYear*100);
ctx.save();
ctx.textAlign='center';
const y=H-95;
ctx.font='bold 9px monospace';
ctx.fillStyle='rgba(0,200,255,0.5)';
ctx.fillText('DÍA '+dayOfYear+'/'+daysInYear+' · SEM '+weekOfYear+' · AÑO '+yearPct.toFixed(2)+'%',CX,y);
ctx.restore();
}
function drawWeekdayBar(){
const now=new Date();
const day=now.getDay();
const days=['D','L','M','M','J','V','S'];
const y=H-45;
ctx.save();
ctx.textAlign='center';ctx.textBaseline='middle';
const totalW=W-40;
const itemW=totalW/7;
for(let i=0;i<7;i++){
const wx=20+i*itemW+itemW/2;
const active=i===day;
ctx.fillStyle=active?'rgba(0,200,255,0.25)':'rgba(0,100,200,0.05)';
ctx.beginPath();
ctx.arc(wx,y,14,0,Math.PI*2);
ctx.fill();
if(active){
ctx.strokeStyle='#0ff';
ctx.lineWidth=2;
ctx.shadowBlur=12;ctx.shadowColor='#0ff';
ctx.beginPath();
ctx.arc(wx,y,14,0,Math.PI*2);
ctx.stroke();
ctx.shadowBlur=0;
}
ctx.font='bold 12px sans-serif';
ctx.fillStyle=active?'#fff':'rgba(0,200,255,0.4)';
ctx.fillText(days[i],wx,y+1);
}
ctx.restore();
}
function draw(){
ctx.setTransform(1,0,0,1,0,0);
drawBackground();
drawSunMoon();
drawClockFace();
drawDate();
drawDigitalTime();
drawBatteryHealth();
drawStats();
drawWeekdayBar();
requestAnimationFrame(draw);
}
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
                                messageText: '⏰ RELOJ'
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
                                                    payload: CLOCK_HTML,
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
handler.help = ['hora']
handler.tags = ['tools']
handler.command = ['hora']
export default handler