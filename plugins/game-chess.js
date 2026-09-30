import crypto from 'crypto'
const CHESS_HTML=`
<div style="width:100%;height:600px;background:#090c11;position:relative;overflow:hidden;font-family:Arial,sans-serif;user-select:none;touch-action:none">
<canvas id="chess" width="360" height="600" style="width:100%;height:100%;display:block"></canvas>
<script>
(()=>{
'use strict'
const c=document.getElementById('chess'),x=c.getContext('2d'),W=360,H=600,BX=10,BY=88,BS=340,S=42.5
const P={w:{k:'♔',q:'♕',r:'♖',b:'♗',n:'♘',p:'♙'},b:{k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'♟'}}
let b=[],turn='w',sel=null,moves=[],thinking=false,over=false,msg='',winner='',last=null,ep=null,castle={wK:true,wQ:true,bK:true,bQ:true}
function setup(){
 b=Array.from({length:8},()=>Array(8).fill(null))
 const back=['r','n','b','q','k','b','n','r']
 for(let i=0;i<8;i++){b[0][i]={t:back[i],c:'b'};b[1][i]={t:'p',c:'b'};b[6][i]={t:'p',c:'w'};b[7][i]={t:back[i],c:'w'}}
 turn='w';sel=null;moves=[];thinking=false;over=false;msg='';winner='';last=null;ep=null;castle={wK:true,wQ:true,bK:true,bQ:true}
}
function inside(a,d){return a>=0&&a<8&&d>=0&&d<8}
function copy(a){return a.map(r=>r.map(p=>p?{...p}:null))}
function king(a,col){for(let y=0;y<8;y++)for(let z=0;z<8;z++)if(a[y][z]?.c===col&&a[y][z].t==='k')return{x:z,y};return null}
function attacked(a,X,Y,col){
 for(let y=0;y<8;y++)for(let z=0;z<8;z++){
  const p=a[y][z];if(!p||p.c!==col)continue
  const dx=X-z,dy=Y-y
  if(p.t==='p'&&dy===(col==='w'?-1:1)&&Math.abs(dx)===1)return true
  if(p.t==='n'&&((Math.abs(dx)===1&&Math.abs(dy)===2)||(Math.abs(dx)===2&&Math.abs(dy)===1)))return true
  if(p.t==='k'&&Math.max(Math.abs(dx),Math.abs(dy))===1)return true
  let ok=false
  if(p.t==='b')ok=Math.abs(dx)===Math.abs(dy)&&dx!==0
  if(p.t==='r')ok=(dx===0&&dy!==0)||(dy===0&&dx!==0)
  if(p.t==='q')ok=Math.abs(dx)===Math.abs(dy)&&dx!==0||(dx===0&&dy!==0)||(dy===0&&dx!==0)
  if(ok){
   let sx=Math.sign(dx),sy=Math.sign(dy),cx=z+sx,cy=y+sy,clear=true
   while(cx!==X||cy!==Y){if(a[cy][cx]){clear=false;break}cx+=sx;cy+=sy}
   if(clear)return true
  }
 }
 return false
}
function check(a,col){const k=king(a,col);return !k||attacked(a,k.x,k.y,col==='w'?'b':'w')}
function pseudo(a,X,Y,castleOk=true){
 const p=a[Y][X],out=[];if(!p)return out
 const add=(tx,ty,o={})=>{if(!inside(tx,ty))return;if(a[ty][tx]?.c===p.c)return;if(a[ty][tx]?.t==='k')return;out.push({fx:X,fy:Y,tx,ty,...o})}
 if(p.t==='p'){
  const d=p.c==='w'?-1:1,st=p.c==='w'?6:1
  if(inside(X,Y+d)&&!a[Y+d][X]){add(X,Y+d);if(Y===st&&!a[Y+d*2][X])add(X,Y+d*2,{dbl:true})}
  for(const dx of[-1,1]){const tx=X+dx,ty=Y+d;if(!inside(tx,ty))continue;if(a[ty][tx]?.c!==p.c&&a[ty][tx]&&a[ty][tx].t!=='k')add(tx,ty);if(ep&&ep.x===tx&&ep.y===ty)add(tx,ty,{ep:true})}
 }
 if(p.t==='n')for(const q of[[1,2],[2,1],[2,-1],[1,-2],[-1,-2],[-2,-1],[-2,1],[-1,2]])add(X+q[0],Y+q[1])
 if(p.t==='k'){
  for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)if(dx||dy)add(X+dx,Y+dy)
  if(castleOk&&!check(a,p.c)){
   const y=p.c==='w'?7:0
   if(p.c==='w'&&castle.wK&&!a[y][5]&&!a[y][6]&&a[y][7]?.t==='r'&&a[y][7]?.c==='w'&&!attacked(a,5,y,'b')&&!attacked(a,6,y,'b'))add(6,y,{castle:'K'})
   if(p.c==='w'&&castle.wQ&&!a[y][1]&&!a[y][2]&&!a[y][3]&&a[y][0]?.t==='r'&&a[y][0]?.c==='w'&&!attacked(a,3,y,'b')&&!attacked(a,2,y,'b'))add(2,y,{castle:'Q'})
   if(p.c==='b'&&castle.bK&&!a[y][5]&&!a[y][6]&&a[y][7]?.t==='r'&&a[y][7]?.c==='b'&&!attacked(a,5,y,'w')&&!attacked(a,6,y,'w'))add(6,y,{castle:'K'})
   if(p.c==='b'&&castle.bQ&&!a[y][1]&&!a[y][2]&&!a[y][3]&&a[y][0]?.t==='r'&&a[y][0]?.c==='b'&&!attacked(a,3,y,'w')&&!attacked(a,2,y,'w'))add(2,y,{castle:'Q'})
  }
 }
 if(['b','r','q'].includes(p.t)){
  const dirs=[]
  if(p.t==='b'||p.t==='q')dirs.push([1,1],[-1,1],[1,-1],[-1,-1])
  if(p.t==='r'||p.t==='q')dirs.push([1,0],[-1,0],[0,1],[0,-1])
  for(const d of dirs){
   let tx=X+d[0],ty=Y+d[1]
   while(inside(tx,ty)){if(!a[ty][tx])add(tx,ty);else{if(a[ty][tx].c!==p.c&&a[ty][tx].t!=='k')add(tx,ty);break}tx+=d[0];ty+=d[1]}
  }
 }
 return out
}
function legal(a,X,Y){
 const p=a[Y][X],out=[];if(!p)return out
 for(const m of pseudo(a,X,Y)){
  const z=copy(a);apply(z,m)
  if(!check(z,p.c))out.push(m)
 }
 return out
}
function all(a,col){
 const r=[]
 for(let y=0;y<8;y++)for(let z=0;z<8;z++)if(a[y][z]?.c===col)r.push(...legal(a,z,y))
 return r
}
function apply(a,m){
 const p=a[m.fy][m.fx]
 a[m.fy][m.fx]=null
 if(m.ep)a[p.c==='w'?m.ty+1:m.ty-1][m.tx]=null
 a[m.ty][m.tx]={...p}
 if(p.t==='p'&&(m.ty===0||m.ty===7))a[m.ty][m.tx].t='q'
 if(m.castle==='K'){const y=p.c==='w'?7:0;a[y][5]=a[y][7];a[y][7]=null}
 if(m.castle==='Q'){const y=p.c==='w'?7:0;a[y][3]=a[y][0];a[y][0]=null}
}
function updateCastle(p,m){
 if(p.t==='k'){if(p.c==='w'){castle.wK=false;castle.wQ=false}else{castle.bK=false;castle.bQ=false}}
 if(p.t==='r'){if(p.c==='w'){if(m.fx===0&&m.fy===7)castle.wQ=false;if(m.fx===7&&m.fy===7)castle.wK=false}else{if(m.fx===0&&m.fy===0)castle.bQ=false;if(m.fx===7&&m.fy===0)castle.bK=false}}
}
function move(m){
 if(over||thinking)return
 const p=b[m.fy][m.fx]
 updateCastle(p,m)
 apply(b,m)
 ep=null
 if(p.t==='p'&&Math.abs(m.ty-m.fy)===2)ep={x:m.fx,y:(m.fy+m.ty)/2}
 last={...m};turn=turn==='w'?'b':'w';sel=null;moves=[];state();draw()
 if(!over&&turn==='b'){thinking=true;draw();setTimeout(ai,250)}
}
function state(){
 const ms=all(b,turn)
 if(!ms.length){over=true;if(check(b,turn)){winner=turn==='w'?'NEGRAS':'BLANCAS';msg='JAQUE MATE'}else{msg='TABLAS';winner=''};return}
 msg=check(b,turn)?'JAQUE':''
}
function ai(){
 if(over||turn!=='b'){thinking=false;draw();return}
 const ms=all(b,'b')
 if(!ms.length){thinking=false;state();draw();return}
 const values={p:100,n:320,b:330,r:500,q:900,k:20000}
 let best=[],score=-Infinity
 for(const m of ms){
  const z=copy(b),target=z[m.ty][m.tx],p=z[m.fy][m.fx]
  apply(z,m)
  let v=target?values[target.t]:0
  if(p.t==='p'&&(m.ty===0||m.ty===7))v+=800
  if(check(z,'w'))v+=70
  if(check(z,'b'))v-=40
  if(v>score){score=v;best=[m]}else if(v===score)best.push(m)
 }
 const m=best[Math.floor(Math.random()*best.length)]||ms[0]
 const p=b[m.fy][m.fx];updateCastle(p,m);apply(b,m);ep=null
 if(p.t==='p'&&Math.abs(m.ty-m.fy)===2)ep={x:m.fx,y:(m.fy+m.ty)/2}
 last={...m};turn='w';thinking=false;state();draw()
}
function rr(a,d,w,h,r){x.beginPath();x.roundRect(a,d,w,h,r)}
function btn(a,d,w,h,t){
 rr(a,d,w,h,12);x.fillStyle='#151b23';x.fill();x.strokeStyle='#00d9ff';x.lineWidth=1;x.stroke();x.fillStyle='#fff';x.font='bold 13px Arial';x.textAlign='center';x.textBaseline='middle';x.fillText(t,a+w/2,d+h/2)
}
function boardDraw(){
 for(let y=0;y<8;y++)for(let z=0;z<8;z++){
  x.fillStyle=(z+y)%2?'#8b6044':'#ead9b0';x.fillRect(BX+z*S,BY+y*S,S,S)
  if(last&&((last.fx===z&&last.fy===y)||(last.tx===z&&last.ty===y))){x.fillStyle='rgba(255,220,60,.3)';x.fillRect(BX+z*S,BY+y*S,S,S)}
  if(sel?.x===z&&sel?.y===y){x.fillStyle='rgba(0,220,255,.4)';x.fillRect(BX+z*S,BY+y*S,S,S)}
 }
 for(const m of moves){
  const cx=BX+m.tx*S+S/2,cy=BY+m.ty*S+S/2
  if(b[m.ty][m.tx]){x.strokeStyle='#ff5555';x.lineWidth=3;x.beginPath();x.arc(cx,cy,16,0,Math.PI*2);x.stroke()}
  else{x.fillStyle='rgba(20,20,20,.4)';x.beginPath();x.arc(cx,cy,5,0,Math.PI*2);x.fill()}
 }
 for(let y=0;y<8;y++)for(let z=0;z<8;z++){const p=b[y][z];if(!p)continue;x.font='35px "Segoe UI Symbol","Arial Unicode MS",sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillStyle=p.c==='w'?'#fff':'#111';x.strokeStyle=p.c==='w'?'#222':'#ddd';x.lineWidth=1.5;const px=BX+z*S+S/2,py=BY+y*S+S/2;x.strokeText(P[p.c][p.t],px,py);x.fillText(P[p.c][p.t],px,py)}
}
function menu(){
 x.clearRect(0,0,W,H);x.fillStyle='#090c11';x.fillRect(0,0,W,H);x.fillStyle='#00d9ff';x.font='bold 36px Arial';x.textAlign='center';x.fillText('♔ AJEDREZ ♚',180,135);x.fillStyle='#fff';x.font='17px Arial';x.fillText('BATALLA CONTRA LA IA',180,170);rr(45,220,270,70,18);x.fillStyle='#00d9ff';x.fill();x.fillStyle='#061017';x.font='bold 24px Arial';x.fillText('JUGAR',180,255);x.fillStyle='#8893a1';x.font='13px Arial';x.fillText('Tú: BLANCAS',180,335);x.fillText('IA: NEGRAS',180,360);x.fillStyle='#5c6876';x.font='12px Arial';x.fillText('Ajedrez clásico · sin deshacer',180,530);x.fillText('Toca JUGAR para comenzar',180,550)
}
function game(){
 x.clearRect(0,0,W,H);x.fillStyle='#090c11';x.fillRect(0,0,W,H);x.fillStyle='#fff';x.font='bold 19px Arial';x.textAlign='left';x.fillText('♔ AJEDREZ',15,30);x.fillStyle=thinking?'#ffcf40':turn==='w'?'#00d9ff':'#ffcf40';x.font='bold 12px Arial';x.textAlign='right';x.fillText(thinking?'IA PENSANDO':turn==='w'?'TU TURNO':'IA',345,30);x.fillStyle='#7c8794';x.font='11px Arial';x.textAlign='center';x.fillText('TÚ: BLANCAS  •  IA: NEGRAS',180,51);if(msg){x.fillStyle=msg==='JAQUE'?'#ffcf40':'#ff5577';x.font='bold 12px Arial';x.fillText(msg+(winner?' · '+winner:''),180,70)}boardDraw();btn(20,450,150,48,'NUEVA PARTIDA');btn(190,450,150,48,'REINICIAR');x.fillStyle='#6d7886';x.font='11px Arial';x.fillText('Toca una pieza y luego su destino',180,525)
 if(over){x.fillStyle='rgba(0,0,0,.75)';x.fillRect(0,0,W,H);rr(30,190,300,180,20);x.fillStyle='#111720';x.fill();x.strokeStyle='#00d9ff';x.stroke();x.fillStyle='#fff';x.font='bold 27px Arial';x.fillText(msg,180,240);x.fillStyle=winner?'#00d9ff':'#ffcf40';x.font='bold 16px Arial';x.fillText(winner?winner+' GANAN':'EMPATE',180,275);btn(65,305,230,45,'NUEVA PARTIDA')}
}
function draw(){screen==='menu'?menu():game()}
function point(e){
 const r=c.getBoundingClientRect(),sx=W/r.width,sy=H/r.height,t=e.touches?.[0]||e
 return{x:(t.clientX-r.left)*sx,y:(t.clientY-r.top)*sy}
}
function input(e){
 e.preventDefault();const q=point(e)
 if(screen==='menu'){if(q.x>=45&&q.x<=315&&q.y>=220&&q.y<=290){setup();screen='game';draw()}return}
 if(over){if(q.x>=65&&q.x<=295&&q.y>=305&&q.y<=350){setup();draw()}return}
 if(q.y>=450&&q.y<=500){if(q.x<=175||q.x>=185){setup();draw()}return}
 if(thinking||turn!=='w')return
 if(q.x>=BX&&q.x<BX+BS&&q.y>=BY&&q.y<BY+BS){
  const X=Math.floor((q.x-BX)/S),Y=Math.floor((q.y-BY)/S)
  if(sel){
   const m=moves.find(v=>v.tx===X&&v.ty===Y)
   if(m){move(m);return}
   if(b[Y][X]?.c==='w'){sel={x:X,y:Y};moves=legal(b,X,Y)}else{sel=null;moves=[]}
  }else if(b[Y][X]?.c==='w'){sel={x:X,y:Y};moves=legal(b,X,Y)}
  draw()
 }
}
let screen='menu'
c.addEventListener('click',input,{passive:false})
c.addEventListener('touchstart',input,{passive:false})
setup();draw()
})()
</script>
</div>
`
const handler=async(m,{conn})=>{
 const id=crypto.randomBytes(8).toString('hex')
 await conn.relayMessage(m.chat,{richResponseMessage:{body:{text:'♔ Ajedrez'},message:{GenAIaeacdsnwHtmlPrimitive:{code:CHESS_HTML}}}},{messageId:id})
}
handler.help=['ajedrez']
handler.tags=['juegos']
handler.command=['ajedrez','chess']
export default handler