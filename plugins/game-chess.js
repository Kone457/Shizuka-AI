import crypto from 'crypto'

const CHESS_HTML = `
<div style="width:100%;height:600px;background:#0f0d0a;position:relative;overflow:hidden;font-family:'Segoe UI',sans-serif;user-select:none;touch-action:none;">
<canvas id="chC" width="400" height="600" style="width:100%;height:100%;display:block;"></canvas>
<div id="chUI" style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;align-items:center;background:rgba(0,0,0,0.92);z-index:10;transition:opacity 0.3s;padding:20px;box-sizing:border-box;">
<h1 style="color:#d4a54a;text-shadow:0 0 20px #d4a54a,0 0 40px #8a6a2a;font-size:34px;margin:0 0 10px;letter-spacing:6px;text-transform:uppercase;font-weight:900;text-align:center;">AJEDREZ</h1>
<p style="color:#c9a96a;margin:0 0 20px;font-size:12px;text-align:center;letter-spacing:1px;line-height:1.8;">Juega contra la IA.<br>Toca una pieza y luego la casilla destino.<br>Las piezas blancas empiezan abajo.</p>
<button id="chSB" style="padding:14px 42px;background:linear-gradient(45deg,#d4a54a,#8a6a2a);border:none;border-radius:30px;color:#1a1410;font-size:15px;font-weight:900;cursor:pointer;text-transform:uppercase;letter-spacing:3px;box-shadow:0 0 25px rgba(212,165,74,0.6);">JUGAR</button>
</div>
<div id="chHU" style="position:absolute;top:0;left:0;width:100%;box-sizing:border-box;color:#fff;display:none;pointer-events:none;z-index:5;">
<div style="display:flex;justify-content:space-between;padding:8px 14px;align-items:center;">
<div>
<div style="font-size:9px;color:#c9a96a;letter-spacing:2px;">TURNO</div>
<div id="chTn" style="font-size:16px;font-weight:900;font-family:monospace;color:#fff;">BLANCAS</div>
</div>
<div style="text-align:center;">
<div style="font-size:9px;color:#c9a96a;letter-spacing:2px;">ESTADO</div>
<div id="chSt" style="font-size:14px;font-weight:900;font-family:monospace;color:#d4a54a;">EN JUEGO</div>
</div>
<div style="text-align:right;">
<div style="font-size:9px;color:#c9a96a;letter-spacing:2px;">MOVIMIENTOS</div>
<div id="chMv" style="font-size:16px;font-weight:900;font-family:monospace;color:#d4a54a;">0</div>
</div>
</div>
</div>
<div id="chPad" style="position:absolute;bottom:0;left:0;width:100%;box-sizing:border-box;display:none;z-index:6;padding:8px;background:linear-gradient(to top,rgba(15,13,10,0.98),rgba(15,13,10,0.75));">
<div style="display:flex;justify-content:center;gap:8px;">
<button data-act="undo" style="flex:1;max-width:110px;height:44px;border-radius:10px;background:linear-gradient(180deg,#3a2a1a,#1a1208);border:1px solid #8a6a2a;color:#d4a54a;font-size:12px;font-weight:900;cursor:pointer;letter-spacing:1px;box-shadow:0 3px 0 #0a0805;">DESHACER</button>
<button data-act="new" style="flex:1;max-width:110px;height:44px;border-radius:10px;background:linear-gradient(180deg,#3a2a1a,#1a1208);border:1px solid #8a6a2a;color:#d4a54a;font-size:12px;font-weight:900;cursor:pointer;letter-spacing:1px;box-shadow:0 3px 0 #0a0805;">NUEVA</button>
</div>
</div>
</div>
<script>
(function(){
const c=document.getElementById('chC'),ctx=c.getContext('2d');
const uI=document.getElementById('chUI'),sB=document.getElementById('chSB'),hU=document.getElementById('chHU');
const tnT=document.getElementById('chTn'),stT=document.getElementById('chSt'),mvT=document.getElementById('chMv');
const pad=document.getElementById('chPad');
const W=c.width,H=c.height;
const BOARD_TOP=60;
const BOARD_SIZE=Math.min(W-20,H-BOARD_TOP-70);
const SQ=BOARD_SIZE/8;
const BX=(W-BOARD_SIZE)/2;
const BY=BOARD_TOP;
const PIECES={
K:'♔',Q:'♕',R:'♖',B:'♗',N:'♘',P:'♙',
k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'♟'
};
const VALUES={p:100,n:320,b:330,r:500,q:900,k:20000};
let board,turn,selected,validMoves,history,running,aiThinking,anim,lastTime,animPieces,gameEnded,moveCount,checkHighlight,aiDepth;
function initBoard(){
const b=[
['r','n','b','q','k','b','n','r'],
['p','p','p','p','p','p','p','p'],
[null,null,null,null,null,null,null,null],
[null,null,null,null,null,null,null,null],
[null,null,null,null,null,null,null,null],
[null,null,null,null,null,null,null,null],
['P','P','P','P','P','P','P','P'],
['R','N','B','Q','K','B','N','R']
];
return b;
}
function isWhite(p){return p&&p===p.toUpperCase();}
function isBlack(p){return p&&p===p.toLowerCase();}
function color(p){if(!p)return null;return isWhite(p)?'w':'b';}
function cloneBoard(b){return b.map(r=>r.slice());}
function findKing(b,c){
const k=c==='w'?'K':'k';
for(let y=0;y<8;y++)for(let x=0;x<8;x++)if(b[y][x]===k)return{x,y};
return null;
}
function inBounds(x,y){return x>=0&&x<8&&y>=0&&y<8;}
function genMoves(b,x,y,checkCastle,lastMove){
const p=b[y][x];
if(!p)return[];
const moves=[];
const c=color(p);
const type=p.toLowerCase();
const dir=c==='w'?-1:1;
function add(nx,ny){
if(!inBounds(nx,ny))return false;
const t=b[ny][nx];
if(t&&color(t)===c)return false;
moves.push({x:nx,y:ny,capture:!!t});
return !t;
}
if(type==='p'){
if(inBounds(x,y+dir)&&!b[y+dir][x]){
moves.push({x,y:y+dir,capture:false});
if(!b[y+2*dir][x]&&((c==='w'&&y===6)||(c==='b'&&y===1))){
if(inBounds(x,y+2*dir)&&!b[y+2*dir][x])moves.push({x,y:y+2*dir,capture:false,double:true});
}
}
for(const dx of[-1,1]){
const nx=x+dx,ny=y+dir;
if(inBounds(nx,ny)&&b[ny][nx]&&color(b[ny][nx])!==c)moves.push({x:nx,y:ny,capture:true});
if(lastMove&&lastMove.double&&lastMove.x===nx&&lastMove.y===y){
moves.push({x:nx,y:ny,capture:true,enPassant:true});
}
}
}
else if(type==='n'){
const offsets=[[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]];
for(const[dx,dy]of offsets)add(x+dx,y+dy);
}
else if(type==='b'||type==='r'||type==='q'){
const dirs=[];
if(type==='b'||type==='q')dirs.push([1,1],[1,-1],[-1,1],[-1,-1]);
if(type==='r'||type==='q')dirs.push([1,0],[-1,0],[0,1],[0,-1]);
for(const[dx,dy]of dirs){
let nx=x+dx,ny=y+dy;
while(inBounds(nx,ny)){
const t=b[ny][nx];
if(!t){moves.push({x:nx,y:ny,capture:false});}
else{
if(color(t)!==c)moves.push({x:nx,y:ny,capture:true});
break;
}
nx+=dx;ny+=dy;
}
}
}
else if(type==='k'){
for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]])add(x+dx,y+dy);
if(checkCastle){
const row=c==='w'?7:0;
if(x===4&&y===row&&!b[row][5]&&!b[row][6]&&b[row][7]===(c==='w'?'R':'r')){
if(!isAttacked(b,4,row,c)&&!isAttacked(b,5,row,c)&&!isAttacked(b,6,row,c)){
moves.push({x:6,y:row,castle:'k'});
}
}
if(x===4&&y===row&&!b[row][3]&&!b[row][2]&&!b[row][1]&&b[row][0]===(c==='w'?'R':'r')){
if(!isAttacked(b,4,row,c)&&!isAttacked(b,3,row,c)&&!isAttacked(b,2,row,c)){
moves.push({x:2,y:row,castle:'q'});
}
}
}
}
return moves;
}
function isAttacked(b,x,y,byColor){
for(let yy=0;yy<8;yy++)for(let xx=0;xx<8;xx++){
const p=b[yy][xx];
if(!p||color(p)!==byColor)continue;
const moves=genMoves(b,xx,yy,false,null);
for(const m of moves){
if(m.x===x&&m.y===y)return true;
}
}
return false;
}
function isInCheck(b,c){
const k=findKing(b,c);
if(!k)return true;
return isAttacked(b,k.x,k.y,c==='w'?'b':'w');
}
function makeMove(b,move,lastMove){
const nb=cloneBoard(b);
const p=nb[move.fromY][move.fromX];
nb[move.fromY][move.fromX]=null;
if(move.enPassant){
nb[move.fromY][move.toX]=null;
}
nb[move.toY][move.toX]=p;
if(move.castle==='k'){
const row=move.fromY;
nb[row][5]=nb[row][7];
nb[row][7]=null;
}
if(move.castle==='q'){
const row=move.fromY;
nb[row][3]=nb[row][0];
nb[row][0]=null;
}
if(move.promotion){
nb[move.toY][move.toX]=color(p)==='w'?'Q':'q';
}
return nb;
}
function genAllMoves(b,c,lastMove){
const moves=[];
for(let y=0;y<8;y++)for(let x=0;x<8;x++){
const p=b[y][x];
if(!p||color(p)!==c)continue;
const pieceMoves=genMoves(b,x,y,true,lastMove);
for(const m of pieceMoves){
m.fromX=x;m.fromY=y;
const test=makeMove(b,m,lastMove);
if(!isInCheck(test,c))moves.push(m);
}
}
return moves;
}
function evaluate(b){
let score=0;
for(let y=0;y<8;y++)for(let x=0;x<8;x++){
const p=b[y][x];
if(!p)continue;
const v=VALUES[p.toLowerCase()]||0;
const centerBonus=(3.5-Math.abs(x-3.5))+(3.5-Math.abs(y-3.5));
if(isWhite(p))score+=v+centerBonus*2;
else score-=v+centerBonus*2;
}
return score;
}
function minimax(b,depth,alpha,beta,maximizing,lastMove){
if(depth===0)return evaluate(b);
const c=maximizing?'w':'b';
const moves=genAllMoves(b,c,lastMove);
if(moves.length===0){
if(isInCheck(b,c))return maximizing?-99999:99999;
return 0;
}
if(maximizing){
let maxEval=-Infinity;
for(const m of moves){
const nb=makeMove(b,m,lastMove);
const e=minimax(nb,depth-1,alpha,beta,false,m);
if(e>maxEval)maxEval=e;
if(e>alpha)alpha=e;
if(beta<=alpha)break;
}
return maxEval;
}else{
let minEval=Infinity;
for(const m of moves){
const nb=makeMove(b,m,lastMove);
const e=minimax(nb,depth-1,alpha,beta,true,m);
if(e<minEval)minEval=e;
if(e<beta)beta=e;
if(beta<=alpha)break;
}
return minEval;
}
}
function findBestMove(b,depth,lastMove){
const moves=genAllMoves(b,'b',lastMove);
if(moves.length===0)return null;
let best=null,bestScore=Infinity;
moves.sort(()=>Math.random()-0.5);
for(const m of moves){
const nb=makeMove(b,m,lastMove);
const score=minimax(nb,depth-1,-Infinity,Infinity,true,m);
if(score<bestScore){bestScore=score;best=m;}
}
return best;
}
function checkGameEnd(){
const moves=genAllMoves(board,turn,history[history.length-1]);
if(moves.length===0){
if(isInCheck(board,turn)){
gameEnded=turn==='w'?'JAQUE MATE - NEGRAS GANAN':'JAQUE MATE - BLANCAS GANAN';
}else{
gameEnded='TABLAS - AHOGADO';
}
stT.innerText='FIN';
tnT.innerText=gameEnded;
return true;
}
if(isInCheck(board,turn)){
stT.innerText='¡JAQUE!';
}else{
stT.innerText='EN JUEGO';
}
return false;
}
function boardToScreen(x,y){
return{x:BX+x*SQ,y:BY+y*SQ};
}
function screenToBoard(px,py){
const x=Math.floor((px-BX)/SQ);
const y=Math.floor((py-BY)/SQ);
if(x<0||x>7||y<0||y>7)return null;
return{x,y};
}
function drawBoard(){
ctx.fillStyle='#0f0d0a';
ctx.fillRect(0,0,W,H);
ctx.fillStyle='#1a1410';
ctx.fillRect(BX-4,BY-4,BOARD_SIZE+8,BOARD_SIZE+8);
for(let y=0;y<8;y++)for(let x=0;x<8;x++){
const isLight=(x+y)%2===0;
ctx.fillStyle=isLight?'#e8d4a8':'#8a6a3a';
ctx.fillRect(BX+x*SQ,BY+y*SQ,SQ,SQ);
}
for(let y=0;y<8;y++)for(let x=0;x<8;x++){
if(checkHighlight&&checkHighlight.x===x&&checkHighlight.y===y){
ctx.fillStyle='rgba(255,50,50,0.5)';
ctx.fillRect(BX+x*SQ,BY+y*SQ,SQ,SQ);
}
}
if(selected){
const px=BX+selected.x*SQ,py=BY+selected.y*SQ;
ctx.strokeStyle='#4af';ctx.lineWidth=3;
ctx.shadowBlur=15;ctx.shadowColor='#4af';
ctx.strokeRect(px+2,py+2,SQ-4,SQ-4);
ctx.shadowBlur=0;
for(const m of validMoves){
const mx=BX+m.x*SQ+SQ/2,my=BY+m.y*SQ+SQ/2;
if(board[m.y][m.x]){
ctx.strokeStyle='rgba(255,50,50,0.7)';ctx.lineWidth=3;
ctx.beginPath();
ctx.arc(mx,my,SQ/2-3,0,Math.PI*2);
ctx.stroke();
}else{
ctx.fillStyle='rgba(80,200,255,0.5)';
ctx.beginPath();
ctx.arc(mx,my,SQ/6,0,Math.PI*2);
ctx.fill();
}
}
}
}
function drawPiece(x,y,piece){
const s=boardToScreen(x,y);
const centerX=s.x+SQ/2;
const centerY=s.y+SQ/2;
const size=SQ*0.85;
const isW=isWhite(piece);
const animKey=x+','+y;
let px=centerX,py=centerY;
if(animPieces&&animPieces[animKey]){
const a=animPieces[animKey];
px=centerX+(a.fromX-centerX)*a.t;
py=centerY+(a.fromY-centerY)*a.t;
}
ctx.font=`${size}px "Segoe UI Symbol","Apple Symbols","DejaVu Sans",serif`;
ctx.textAlign='center';
ctx.textBaseline='middle';
if(isW){
ctx.fillStyle='#fff';
ctx.strokeStyle='#222';
ctx.lineWidth=1.5;
ctx.shadowBlur=8;ctx.shadowColor='rgba(0,0,0,0.8)';
ctx.fillText(PIECES[piece],px,py+2);
ctx.strokeText(PIECES[piece],px,py+2);
}else{
ctx.fillStyle='#111';
ctx.strokeStyle='#d4a54a';
ctx.lineWidth=1.5;
ctx.shadowBlur=6;ctx.shadowColor='rgba(212,165,74,0.6)';
ctx.fillText(PIECES[piece],px,py+2);
ctx.strokeText(PIECES[piece],px,py+2);
}
ctx.shadowBlur=0;
}
function drawPieces(){
for(let y=0;y<8;y++)for(let x=0;x<8;x++){
const p=board[y][x];
if(p)drawPiece(x,y,p);
}
}
function drawCoords(){
ctx.fillStyle='rgba(212,165,74,0.5)';
ctx.font='10px monospace';
ctx.textAlign='center';
ctx.textBaseline='middle';
const files='abcdefgh';
for(let i=0;i<8;i++){
ctx.fillText(files[i],BX+i*SQ+SQ/2,BY+BOARD_SIZE+12);
}
ctx.textAlign='right';
for(let i=0;i<8;i++){
ctx.fillText(8-i,BX-8,BY+i*SQ+SQ/2);
}
}
function draw(){
drawBoard();
drawCoords();
drawPieces();
}
function updateAnim(dt){
if(!animPieces)return;
let any=false;
for(const k in animPieces){
animPieces[k].t-=dt/150;
if(animPieces[k].t<=0){delete animPieces[k];}
else any=true;
}
if(!any)animPieces=null;
}
function tick(ts){
if(!running)return;
if(!lastTime)lastTime=ts;
const dt=Math.min(50,ts-lastTime);lastTime=ts;
updateAnim(dt);
draw();
anim=requestAnimationFrame(tick);
}
function playerMove(move){
const moveObj={
fromX:move.fromX,fromY:move.fromY,
toX:move.x,toY:move.y,
capture:move.capture,
castle:move.castle,
enPassant:move.enPassant
};
history.push({board:cloneBoard(board),lastMove:history[history.length-1],turn});
board=makeMove(board,moveObj,history[history.length-2]?.lastMove);
moveCount++;
mvT.innerText=moveCount;
selected=null;validMoves=[];
turn='b';
tnT.innerText='NEGRAS';
checkHighlight=null;
if(checkGameEnd()){running=false;return;}
aiThinking=true;
stT.innerText='PENSANDO...';
setTimeout(()=>{
const best=findBestMove(board,aiDepth,history[history.length-1]);
if(!best){checkGameEnd();running=false;return;}
const aiMove={
fromX:best.fromX,fromY:best.fromY,
toX:best.x,toY:best.y,
capture:best.capture,
castle:best.castle,
enPassant:best.enPassant,
promotion:best.promotion
};
history.push({board:cloneBoard(board),lastMove:history[history.length-1],turn});
board=makeMove(board,aiMove,history[history.length-2]?.lastMove);
moveCount++;
mvT.innerText=moveCount;
turn='w';
tnT.innerText='BLANCAS';
aiThinking=false;
if(checkGameEnd()){running=false;}
else stT.innerText='EN JUEGO';
},80);
}
function onTap(px,py){
if(!running||aiThinking||turn!=='w')return;
const cell=screenToBoard(px,py);
if(!cell)return;
const{x,y}=cell;
const piece=board[y][x];
if(selected){
const move=validMoves.find(m=>m.x===x&&m.y===y);
if(move){
playerMove(move);
return;
}
if(piece&&isWhite(piece)){
selected={x,y};
validMoves=genMoves(board,x,y,true,history[history.length-1]?.lastMove).filter(m=>{
m.fromX=x;m.fromY=y;
const test=makeMove(board,m,history[history.length-1]?.lastMove);
return !isInCheck(test,'w');
});
}else{
selected=null;validMoves=[];
}
}else{
if(piece&&isWhite(piece)){
selected={x,y};
validMoves=genMoves(board,x,y,true,history[history.length-1]?.lastMove).filter(m=>{
m.fromX=x;m.fromY=y;
const test=makeMove(board,m,history[history.length-1]?.lastMove);
return !isInCheck(test,'w');
});
}
}
}
function undo(){
if(!running||aiThinking)return;
if(history.length<1)return;
const last=history.pop();
if(history.length>0){
const prev=history[history.length-1];
board=cloneBoard(prev.board);
turn=prev.turn;
history.pop();
}else{
board=cloneBoard(last.board);
turn='w';
}
turn='w';
tnT.innerText='BLANCAS';
selected=null;validMoves=[];
checkHighlight=null;
stT.innerText='EN JUEGO';
gameEnded=null;
}
function newGame(){
board=initBoard();
turn='w';
selected=null;validMoves=[];
history=[];
animPieces=null;
gameEnded=null;
aiThinking=false;
moveCount=0;
mvT.innerText=0;
tnT.innerText='BLANCAS';
stT.innerText='EN JUEGO';
checkHighlight=null;
aiDepth=2;
}
function start(){
newGame();
hU.style.display='block';pad.style.display='block';
uI.style.opacity=0;setTimeout(()=>uI.style.display='none',300);
running=true;lastTime=0;
anim=requestAnimationFrame(tick);
}
let canvasRect=null;
function getCanvasCoords(cx,cy){
if(!canvasRect)canvasRect=c.getBoundingClientRect();
return{
x:(cx-canvasRect.left)*(W/canvasRect.width),
y:(cy-canvasRect.top)*(H/canvasRect.height)
};
}
c.addEventListener('touchstart',e=>{
if(!running)return;
e.preventDefault();
const t=e.touches[0];
const p=getCanvasCoords(t.clientX,t.clientY);
onTap(p.x,p.y);
},{passive:false});
c.addEventListener('mousedown',e=>{
if(!running)return;
const p=getCanvasCoords(e.clientX,e.clientY);
onTap(p.x,p.y);
});
c.addEventListener('contextmenu',e=>e.preventDefault());
pad.querySelectorAll('button').forEach(b=>{
const act=b.getAttribute('data-act');
b.addEventListener('touchstart',e=>{e.preventDefault();e.stopPropagation();if(act==='undo')undo();else if(act==='new')newGame();},{passive:false});
b.addEventListener('mousedown',e=>{e.preventDefault();e.stopPropagation();if(act==='undo')undo();else if(act==='new')newGame();});
b.addEventListener('contextmenu',e=>e.preventDefault());
});
window.addEventListener('resize',()=>{canvasRect=null;});
sB.addEventListener('click',start);
board=initBoard();
turn='w';
selected=null;validMoves=[];
history=[];
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
handler.command = ['ajedrez', 'chess']
export default handler