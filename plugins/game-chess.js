import crypto from 'crypto'
const CHESS_HTML = `
<div style="width:100%;height:600px;background:#0f0d0a;position:relative;overflow:hidden;font-family:'Segoe UI',sans-serif;user-select:none;touch-action:none;">
<canvas id="chC" width="360" height="600" style="width:100%;height:100%;display:block;"></canvas>
<div id="chUI" style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;align-items:center;background:rgba(0,0,0,0.94);z-index:20;padding:20px;box-sizing:border-box;">
<h1 style="color:#d4a54a;text-shadow:0 0 20px #d4a54a,0 0 40px #8a6a2a;font-size:34px;margin:0 0 10px;letter-spacing:6px;text-transform:uppercase;font-weight:900;text-align:center;">AJEDREZ</h1>
<p style="color:#c9a96a;margin:0 0 22px;font-size:12px;text-align:center;letter-spacing:1px;line-height:1.8;">Juega contra la IA.<br>Toca una pieza y después su destino.<br>Las piezas blancas empiezan abajo.</p>
<button id="chSB" type="button" style="padding:14px 46px;background:linear-gradient(45deg,#d4a54a,#8a6a2a);border:none;border-radius:30px;color:#1a1410;font-size:15px;font-weight:900;cursor:pointer;text-transform:uppercase;letter-spacing:3px;box-shadow:0 0 25px rgba(212,165,74,0.6);">JUGAR</button>
</div>
<div id="chHU" style="position:absolute;top:0;left:0;width:100%;box-sizing:border-box;color:#fff;display:none;pointer-events:none;z-index:5;">
<div style="display:flex;justify-content:space-between;padding:8px 12px;align-items:center;">
<div>
<div style="font-size:8px;color:#c9a96a;letter-spacing:2px;">TURNO</div>
<div id="chTn" style="font-size:15px;font-weight:900;font-family:monospace;color:#fff;">BLANCAS</div>
</div>
<div style="text-align:center;">
<div style="font-size:8px;color:#c9a96a;letter-spacing:2px;">ESTADO</div>
<div id="chSt" style="font-size:12px;font-weight:900;font-family:monospace;color:#d4a54a;">EN JUEGO</div>
</div>
<div style="text-align:right;">
<div style="font-size:8px;color:#c9a96a;letter-spacing:2px;">MOV.</div>
<div id="chMv" style="font-size:15px;font-weight:900;font-family:monospace;color:#d4a54a;">0</div>
</div>
</div>
</div>
<div id="chPad" style="position:absolute;bottom:0;left:0;width:100%;box-sizing:border-box;display:none;z-index:10;padding:8px;background:linear-gradient(to top,rgba(15,13,10,1),rgba(15,13,10,0.8));">
<div style="display:flex;justify-content:center;gap:8px;">
<button type="button" data-act="undo" style="width:120px;height:42px;border-radius:10px;background:linear-gradient(180deg,#3a2a1a,#1a1208);border:1px solid #8a6a2a;color:#d4a54a;font-size:11px;font-weight:900;cursor:pointer;letter-spacing:1px;">DESHACER</button>
<button type="button" data-act="new" style="width:120px;height:42px;border-radius:10px;background:linear-gradient(180deg,#3a2a1a,#1a1208);border:1px solid #8a6a2a;color:#d4a54a;font-size:11px;font-weight:900;cursor:pointer;letter-spacing:1px;">NUEVA PARTIDA</button>
</div>
</div>
</div>
<script>
(function(){
'use strict';
const c=document.getElementById('chC');
const ctx=c.getContext('2d');
const uI=document.getElementById('chUI');
const sB=document.getElementById('chSB');
const hU=document.getElementById('chHU');
const tnT=document.getElementById('chTn');
const stT=document.getElementById('chSt');
const mvT=document.getElementById('chMv');
const pad=document.getElementById('chPad');

const W=360,H=600;
const BOARD_SIZE=340;
const SQ=BOARD_SIZE/8;
const BX=(W-BOARD_SIZE)/2;
const BY=82;

const PIECES={
K:'♔',Q:'♕',R:'♖',B:'♗',N:'♘',P:'♙',
k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'♟'
};

const VALUES={p:100,n:320,b:330,r:500,q:900,k:20000};

let board;
let turn='w';
let selected=null;
let validMoves=[];
let history=[];
let lastMove=null;
let running=false;
let aiThinking=false;
let anim=0;
let moveCount=0;
let checkHighlight=null;
let gameEnded=false;

let castling={
w:{k:true,q:true},
b:{k:true,q:true}
};

function initBoard(){
return[
['r','n','b','q','k','b','n','r'],
['p','p','p','p','p','p','p','p'],
[null,null,null,null,null,null,null,null],
[null,null,null,null,null,null,null,null],
[null,null,null,null,null,null,null,null],
[null,null,null,null,null,null,null,null],
['P','P','P','P','P','P','P','P'],
['R','N','B','Q','K','B','N','R']
];
}

function isWhite(p){return !!p&&p===p.toUpperCase()}
function color(p){return !p?null:isWhite(p)?'w':'b'}
function inBounds(x,y){return x>=0&&x<8&&y>=0&&y<8}
function cloneBoard(b){return b.map(r=>r.slice())}

function findKing(b,side){
const k=side==='w'?'K':'k';
for(let y=0;y<8;y++)for(let x=0;x<8;x++){
if(b[y][x]===k)return{x,y}
}
return null;
}

function squareAttacked(b,x,y,by){
const pawn=by==='w'?'P':'p';
const py=by==='w'?y+1:y-1;

for(const px of[x-1,x+1]){
if(inBounds(px,py)&&b[py][px]===pawn)return true;
}

const knight=by==='w'?'N':'n';

for(const[dx,dy]of[[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]]){
const nx=x+dx,ny=y+dy;
if(inBounds(nx,ny)&&b[ny][nx]===knight)return true;
}

const bishop=by==='w'?'B':'b';
const rook=by==='w'?'R':'r';
const queen=by==='w'?'Q':'q';
const king=by==='w'?'K':'k';

for(const[dx,dy]of[[1,1],[1,-1],[-1,1],[-1,-1]]){
let nx=x+dx,ny=y+dy;
while(inBounds(nx,ny)){
const p=b[ny][nx];
if(p){
if(p===bishop||p===queen)return true;
break;
}
nx+=dx;
ny+=dy;
}
}

for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){
let nx=x+dx,ny=y+dy;
while(inBounds(nx,ny)){
const p=b[ny][nx];
if(p){
if(p===rook||p===queen)return true;
break;
}
nx+=dx;
ny+=dy;
}
}

for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){
const nx=x+dx,ny=y+dy;
if(inBounds(nx,ny)&&b[ny][nx]===king)return true;
}

return false;
}

function inCheck(b,side){
const k=findKing(b,side);
if(!k)return true;
return squareAttacked(b,k.x,k.y,side==='w'?'b':'w');
}

function pseudoMoves(b,x,y,side){
const p=b[y][x];
if(!p||color(p)!==side)return[];

const type=p.toLowerCase();
const moves=[];
const dir=side==='w'?-1:1;

if(type==='p'){
const ny=y+dir;

if(inBounds(x,ny)&&!b[ny][x]){
moves.push({x,y:ny});
if((side==='w'&&y===6)||(side==='b'&&y===1)){
const ny2=y+dir*2;
if(!b[ny2][x])moves.push({x,y:ny2,double:true});
}
}

for(const dx of[-1,1]){
const nx=x+dx;
if(!inBounds(nx,ny))continue;

if(b[ny][nx]&&color(b[ny][nx])!==side){
moves.push({x:nx,y:ny,capture:true});
}

if(
lastMove&&
lastMove.double&&
lastMove.toY===y&&
lastMove.toX===nx&&
b[y][nx]&&
b[y][nx].toLowerCase()==='p'&&
color(b[y][nx])!==side
){
moves.push({x:nx,y:ny,capture:true,enPassant:true});
}
}
}

else if(type==='n'){
for(const[dx,dy]of[[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]]){
const nx=x+dx,ny=y+dy;
if(inBounds(nx,ny)&&(!b[ny][nx]||color(b[ny][nx])!==side)){
moves.push({x:nx,y:ny,capture:!!b[ny][nx]});
}
}
}

else if(type==='b'||type==='r'||type==='q'){
const dirs=[];

if(type==='b'||type==='q'){
dirs.push([1,1],[1,-1],[-1,1],[-1,-1]);
}

if(type==='r'||type==='q'){
dirs.push([1,0],[-1,0],[0,1],[0,-1]);
}

for(const[dx,dy]of dirs){
let nx=x+dx,ny=y+dy;

while(inBounds(nx,ny)){
if(!b[ny][nx]){
moves.push({x:nx,y:ny});
}else{
if(color(b[ny][nx])!==side){
moves.push({x:nx,y:ny,capture:true});
}
break;
}
nx+=dx;
ny+=dy;
}
}
}

else if(type==='k'){
for(const[dx,dy]of[
[1,0],[-1,0],[0,1],[0,-1],
[1,1],[1,-1],[-1,1],[-1,-1]
]){
const nx=x+dx,ny=y+dy;
if(inBounds(nx,ny)&&(!b[ny][nx]||color(b[ny][nx])!==side)){
moves.push({x:nx,y:ny,capture:!!b[ny][nx]});
}
}

const row=side==='w'?7:0;
const enemy=side==='w'?'b':'w';

if(x===4&&y===row){
if(
castling[side].k&&
b[row][7]===(side==='w'?'R':'r')&&
!b[row][5]&&!b[row][6]&&
!squareAttacked(b,4,row,enemy)&&
!squareAttacked(b,5,row,enemy)&&
!squareAttacked(b,6,row,enemy)
){
moves.push({x:6,y:row,castle:'k'});
}

if(
castling[side].q&&
b[row][0]===(side==='w'?'R':'r')&&
!b[row][1]&&!b[row][2]&&!b[row][3]&&
!squareAttacked(b,4,row,enemy)&&
!squareAttacked(b,3,row,enemy)&&
!squareAttacked(b,2,row,enemy)
){
moves.push({x:2,y:row,castle:'q'});
}
}
}

return moves;
}

function makeMove(b,m){
const nb=cloneBoard(b);
const p=nb[m.fromY][m.fromX];

nb[m.fromY][m.fromX]=null;

if(m.enPassant){
nb[m.fromY][m.toX]=null;
}

nb[m.toY][m.toX]=p;

if(m.castle==='k'){
nb[m.fromY][5]=nb[m.fromY][7];
nb[m.fromY][7]=null;
}

if(m.castle==='q'){
nb[m.fromY][3]=nb[m.fromY][0];
nb[m.fromY][0]=null;
}

if(m.promotion){
nb[m.toY][m.toX]=color(p)==='w'?'Q':'q';
}

return nb;
}

function legalMoves(b,side){
const result=[];

for(let y=0;y<8;y++)for(let x=0;x<8;x++){
const p=b[y][x];

if(!p||color(p)!==side)continue;

const moves=pseudoMoves(b,x,y,side);

for(const m of moves){
m.fromX=x;
m.fromY=y;

if(p.toLowerCase()==='p'&&(m.toY===0||m.toY===7)){
m.promotion=true;
}

const nb=makeMove(b,m);

if(!inCheck(nb,side)){
result.push(m);
}
}
}

return result;
}

function evaluate(b){
let score=0;

for(let y=0;y<8;y++)for(let x=0;x<8;x++){
const p=b[y][x];

if(!p)continue;

const value=VALUES[p.toLowerCase()]||0;
const center=(3.5-Math.abs(x-3.5))+(3.5-Math.abs(y-3.5));

if(isWhite(p)){
score+=value+center*2;
}else{
score-=value+center*2;
}
}

return score;
}

function minimax(b,depth,alpha,beta,maximizing){
if(depth<=0)return evaluate(b);

const side=maximizing?'w':'b';
const moves=legalMoves(b,side);

if(!moves.length){
if(inCheck(b,side)){
return maximizing?-100000:100000;
}
return 0;
}

if(maximizing){
let best=-Infinity;

for(const m of moves){
const value=minimax(makeMove(b,m),depth-1,alpha,beta,false);

best=Math.max(best,value);
alpha=Math.max(alpha,value);

if(beta<=alpha)break;
}

return best;
}

let best=Infinity;

for(const m of moves){
const value=minimax(makeMove(b,m),depth-1,alpha,beta,true);

best=Math.min(best,value);
beta=Math.min(beta,value);

if(beta<=alpha)break;
}

return best;
}

function bestMove(b){
const moves=legalMoves(b,'b');

if(!moves.length)return null;

let bestScore=Infinity;
let choices=[];

for(const m of moves){
const score=minimax(makeMove(b,m),1,-Infinity,Infinity,true);

if(score<bestScore){
bestScore=score;
choices=[m];
}else if(score===bestScore){
choices.push(m);
}
}

return choices[Math.floor(Math.random()*choices.length)];
}

function updateCastling(m,p,captured){
if(p==='K')castling.w.k=castling.w.q=false;
if(p==='k')castling.b.k=castling.b.q=false;

if(p==='R'){
if(m.fromX===0&&m.fromY===7)castling.w.q=false;
if(m.fromX===7&&m.fromY===7)castling.w.k=false;
}

if(p==='r'){
if(m.fromX===0&&m.fromY===0)castling.b.q=false;
if(m.fromX===7&&m.fromY===0)castling.b.k=false;
}

if(captured==='R'){
if(m.toX===0&&m.toY===7)castling.w.q=false;
if(m.toX===7&&m.toY===7)castling.w.k=false;
}

if(captured==='r'){
if(m.toX===0&&m.toY===0)castling.b.q=false;
if(m.toX===7&&m.toY===0)castling.b.k=false;
}
}

function applyMove(m){
const p=board[m.fromY][m.fromX];
const captured=m.enPassant?board[m.fromY][m.toX]:board[m.toY][m.toX];

history.push({
board:cloneBoard(board),
castling:JSON.parse(JSON.stringify(castling)),
turn,
lastMove,
moveCount
});

updateCastling(m,p,captured);

board=makeMove(board,m);
lastMove=m;

moveCount++;
mvT.innerText=moveCount;
}

function checkEnd(){
const moves=legalMoves(board,turn);

if(!moves.length){
if(inCheck(board,turn)){
gameEnded=true;
stT.innerText='JAQUE MATE';
tnT.innerText=turn==='w'?'NEGRAS GANAN':'BLANCAS GANAN';
}else{
gameEnded=true;
stT.innerText='TABLAS';
tnT.innerText='TABLAS';
}

return true;
}

if(inCheck(board,turn)){
stT.innerText='¡JAQUE!';
checkHighlight=findKing(board,turn);
}else{
stT.innerText='EN JUEGO';
checkHighlight=null;
}

return false;
}

function draw(){
ctx.setTransform(1,0,0,1,0,0);
ctx.fillStyle='#0f0d0a';
ctx.fillRect(0,0,W,H);

ctx.fillStyle='#1a1410';
ctx.fillRect(BX-5,BY-5,BOARD_SIZE+10,BOARD_SIZE+10);

for(let y=0;y<8;y++)for(let x=0;x<8;x++){
ctx.fillStyle=(x+y)%2===0?'#e8d4a8':'#8a6a3a';
ctx.fillRect(BX+x*SQ,BY+y*SQ,SQ,SQ);
}

if(checkHighlight){
ctx.fillStyle='rgba(255,40,40,0.5)';
ctx.fillRect(
BX+checkHighlight.x*SQ,
BY+checkHighlight.y*SQ,
SQ,
SQ
);
}

if(selected){
ctx.fillStyle='rgba(50,170,255,0.25)';
ctx.fillRect(
BX+selected.x*SQ,
BY+selected.y*SQ,
SQ,
SQ
);

ctx.strokeStyle='#4af';
ctx.lineWidth=3;
ctx.shadowBlur=12;
ctx.shadowColor='#4af';

ctx.strokeRect(
BX+selected.x*SQ+2,
BY+selected.y*SQ+2,
SQ-4,
SQ-4
);

ctx.shadowBlur=0;

for(const m of validMoves){
const mx=BX+m.x*SQ+SQ/2;
const my=BY+m.y*SQ+SQ/2;

if(board[m.y][m.x]){
ctx.strokeStyle='rgba(255,50,50,0.8)';
ctx.lineWidth=3;
ctx.beginPath();
ctx.arc(mx,my,SQ/2-4,0,Math.PI*2);
ctx.stroke();
}else{
ctx.fillStyle='rgba(40,160,255,0.7)';
ctx.beginPath();
ctx.arc(mx,my,SQ/7,0,Math.PI*2);
ctx.fill();
}
}
}

for(let y=0;y<8;y++)for(let x=0;x<8;x++){
const p=board[y][x];
if(!p)continue;

const px=BX+x*SQ+SQ/2;
const py=BY+y*SQ+SQ/2;

ctx.font=(SQ*0.82)+'px "Segoe UI Symbol","DejaVu Sans",serif';
ctx.textAlign='center';
ctx.textBaseline='middle';

if(isWhite(p)){
ctx.fillStyle='#fff';
ctx.strokeStyle='#222';
ctx.lineWidth=1.5;
ctx.shadowBlur=7;
ctx.shadowColor='#000';
ctx.fillText(PIECES[p],px,py+2);
ctx.strokeText(PIECES[p],px,py+2);
}else{
ctx.fillStyle='#111';
ctx.strokeStyle='#d4a54a';
ctx.lineWidth=1.5;
ctx.shadowBlur=7;
ctx.shadowColor='#d4a54a';
ctx.fillText(PIECES[p],px,py+2);
ctx.strokeText(PIECES[p],px,py+2);
}

ctx.shadowBlur=0;
}

ctx.fillStyle='rgba(212,165,74,0.65)';
ctx.font='10px monospace';
ctx.textAlign='center';

const files='abcdefgh';

for(let i=0;i<8;i++){
ctx.fillText(
files[i],
BX+i*SQ+SQ/2,
BY+BOARD_SIZE+13
);
}

ctx.textAlign='right';

for(let i=0;i<8;i++){
ctx.fillText(
8-i,
BX-8,
BY+i*SQ+SQ/2
);
}
}

function playerMove(m){
if(aiThinking||!running)return;

applyMove(m);

selected=null;
validMoves=[];
turn='b';
tnT.innerText='NEGRAS';

if(checkEnd()){
running=false;
return;
}

aiThinking=true;
stT.innerText='PENSANDO...';

setTimeout(()=>{
if(!running)return;

const ai=bestMove(board);

if(!ai){
aiThinking=false;
checkEnd();
running=false;
return;
}

applyMove(ai);

turn='w';
tnT.innerText='BLANCAS';
aiThinking=false;
selected=null;
validMoves=[];

if(checkEnd()){
running=false;
return;
}

stT.innerText='EN JUEGO';

},180);
}

function selectPiece(x,y){
if(!board[y][x]||color(board[y][x])!=='w')return;

selected={x,y};

validMoves=legalMoves(board,'w')
.filter(m=>m.fromX===x&&m.fromY===y);
}

function onTap(px,py){
if(!running||aiThinking||turn!=='w'||gameEnded)return;

const x=Math.floor((px-BX)/SQ);
const y=Math.floor((py-BY)/SQ);

if(!inBounds(x,y))return;

if(selected){
const move=validMoves.find(m=>m.x===x&&m.y===y);

if(move){
playerMove(move);
return;
}

if(board[y][x]&&color(board[y][x])==='w'){
selectPiece(x,y);
return;
}

selected=null;
validMoves=[];
return;
}

selectPiece(x,y);
}

function undo(){
if(aiThinking||!history.length)return;

const h=history.pop();

board=cloneBoard(h.board);
castling=JSON.parse(JSON.stringify(h.castling));
turn=h.turn;
lastMove=h.lastMove;
moveCount=h.moveCount;

mvT.innerText=moveCount;
tnT.innerText=turn==='w'?'BLANCAS':'NEGRAS';
stT.innerText='EN JUEGO';

selected=null;
validMoves=[];
checkHighlight=null;
gameEnded=false;

draw();
}

function newGame(){
cancelAnimationFrame(anim);

board=initBoard();
turn='w';
selected=null;
validMoves=[];
history=[];
lastMove=null;
moveCount=0;
aiThinking=false;
gameEnded=false;
checkHighlight=null;

castling={
w:{k:true,q:true},
b:{k:true,q:true}
};

mvT.innerText='0';
tnT.innerText='BLANCAS';
stT.innerText='EN JUEGO';

draw();

running=true;
anim=requestAnimationFrame(loop);
}

function start(){
uI.style.display='none';
uI.style.opacity='0';

hU.style.display='block';
pad.style.display='block';

newGame();
}

function loop(){
if(!running)return;
draw();
anim=requestAnimationFrame(loop);
}

c.addEventListener('click',function(e){
if(!running)return;

const r=c.getBoundingClientRect();

const px=(e.clientX-r.left)*(W/r.width);
const py=(e.clientY-r.top)*(H/r.height);

onTap(px,py);
});

c.addEventListener('touchstart',function(e){
e.preventDefault();

if(!running)return;

const t=e.touches[0];
const r=c.getBoundingClientRect();

const px=(t.clientX-r.left)*(W/r.width);
const py=(t.clientY-r.top)*(H/r.height);

onTap(px,py);
},{passive:false});

pad.querySelectorAll('button').forEach(btn=>{
btn.addEventListener('click',function(e){
e.preventDefault();
e.stopPropagation();

const act=this.getAttribute('data-act');

if(act==='undo')undo();
if(act==='new')newGame();
});

btn.addEventListener('touchstart',function(e){
e.preventDefault();
e.stopPropagation();

const act=this.getAttribute('data-act');

if(act==='undo')undo();
if(act==='new')newGame();
},{passive:false});
});

sB.addEventListener('click',function(e){
e.preventDefault();
e.stopPropagation();
start();
});

sB.addEventListener('touchstart',function(e){
e.preventDefault();
e.stopPropagation();
start();
},{passive:false});

board=initBoard();
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
                                messageText: '♟️ AJEDREZ'
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
                                                    payload: CHESS_HTML,
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

handler.help = ['ajedrez']
handler.tags = ['game']
handler.command = ['ajedrez','chess']

export default handler