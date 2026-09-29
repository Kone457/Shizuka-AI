import crypto from 'crypto'
const BLACKJACK_HTML = `
<div style="width:100%;height:600px;background:#020b08;position:relative;overflow:hidden;font-family:'Segoe UI',sans-serif;user-select:none;color:#fff;">
<canvas id="bjC" width="360" height="600" style="width:100%;height:100%;display:block;touch-action:none;"></canvas>
<div id="bjMenu" style="position:absolute;inset:0;z-index:20;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:22px;box-sizing:border-box;background:radial-gradient(circle at 50% 40%,rgba(0,75,45,.96),rgba(1,5,9,.99) 72%);">
<h1 style="margin:0;color:#fff;font-size:42px;letter-spacing:5px;text-shadow:0 0 10px #00ff88,0 0 35px #00b85c;white-space:nowrap;">BLACKJACK</h1>
<div style="color:#78a994;font-size:12px;margin:10px 0 25px;text-align:center;line-height:1.7;">Consigue 21 sin pasarte.<br>Vence al dealer para ganar la partida.</div>
<div style="width:100%;max-width:290px;padding:15px 18px;box-sizing:border-box;background:rgba(255,255,255,.035);border:1px solid rgba(0,255,136,.2);border-radius:16px;margin-bottom:18px;">
<div style="display:flex;justify-content:space-between;color:#789b8b;font-size:10px;letter-spacing:2px;">
<span>SALDO</span><span>FICHAS</span>
</div>
<div style="display:flex;justify-content:space-between;align-items:center;margin-top:5px;">
<strong style="font-size:25px;color:#00ff88;">1000</strong>
<span style="font-size:18px;">🪙</span>
</div>
</div>
<div style="width:100%;max-width:290px;display:flex;gap:8px;margin-bottom:18px;">
<button class="bjBet" data-bet="25" style="flex:1;padding:11px 4px;border:1px solid #00ff88;background:rgba(0,255,136,.15);color:#00ff88;border-radius:10px;font-weight:900;">25</button>
<button class="bjBet" data-bet="50" style="flex:1;padding:11px 4px;border:1px solid #344c42;background:rgba(255,255,255,.04);color:#789b8b;border-radius:10px;font-weight:900;">50</button>
<button class="bjBet" data-bet="100" style="flex:1;padding:11px 4px;border:1px solid #344c42;background:rgba(255,255,255,.04);color:#789b8b;border-radius:10px;font-weight:900;">100</button>
<button class="bjBet" data-bet="250" style="flex:1;padding:11px 4px;border:1px solid #344c42;background:rgba(255,255,255,.04);color:#789b8b;border-radius:10px;font-weight:900;">250</button>
</div>
<button id="bjStart" style="width:100%;max-width:290px;padding:15px;border:0;border-radius:30px;background:linear-gradient(135deg,#00ff88,#00a85a);color:#02150c;font-size:14px;font-weight:900;letter-spacing:3px;box-shadow:0 0 30px rgba(0,255,136,.3);">REPARTIR</button>
</div>
<div id="bjHUD" style="position:absolute;top:0;left:0;width:100%;z-index:5;display:none;pointer-events:none;">
<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 15px;background:linear-gradient(180deg,rgba(1,15,10,.98),rgba(1,10,7,.72));border-bottom:1px solid rgba(0,255,136,.18);">
<div style="text-align:center;min-width:70px;">
<div style="font-size:8px;color:#628576;letter-spacing:2px;">SALDO</div>
<div id="bjBalance" style="font:900 18px monospace;color:#00ff88;">1000</div>
</div>
<div style="text-align:center;">
<div style="font-size:9px;color:#00ff88;letter-spacing:2px;">BLACKJACK</div>
<div id="bjBetInfo" style="font-size:10px;color:#8aa99a;margin-top:3px;">APUESTA 25</div>
</div>
<div style="text-align:center;min-width:70px;">
<div style="font-size:8px;color:#628576;letter-spacing:2px;">RÉCORD</div>
<div id="bjRecord" style="font:900 18px monospace;color:#fff;">0-0</div>
</div>
</div>
</div>
<div id="bjTable" style="position:absolute;top:65px;left:0;width:100%;bottom:72px;z-index:3;display:none;pointer-events:none;">
<div style="position:absolute;top:10px;left:0;width:100%;text-align:center;">
<div style="font-size:9px;color:#638878;letter-spacing:3px;">DEALER</div>
<div id="bjDealerValue" style="font:900 17px monospace;color:#fff;margin-top:3px;">?</div>
</div>
<div style="position:absolute;top:38px;left:0;width:100%;display:flex;justify-content:center;gap:7px;" id="bjDealerCards"></div>
<div style="position:absolute;top:275px;left:0;width:100%;height:1px;background:linear-gradient(90deg,transparent,rgba(0,255,136,.2),transparent);"></div>
<div style="position:absolute;bottom:90px;left:0;width:100%;text-align:center;">
<div style="font-size:9px;color:#638878;letter-spacing:3px;">TÚ</div>
<div id="bjPlayerValue" style="font:900 19px monospace;color:#00ff88;margin-top:3px;">0</div>
</div>
<div style="position:absolute;bottom:20px;left:0;width:100%;display:flex;justify-content:center;gap:7px;" id="bjPlayerCards"></div>
</div>
<div id="bjControls" style="position:absolute;bottom:0;left:0;width:100%;z-index:8;display:none;justify-content:center;gap:7px;padding:10px;box-sizing:border-box;background:linear-gradient(0deg,rgba(1,7,5,.99),rgba(1,7,5,.75));">
<button id="bjHit" style="flex:1;max-width:105px;padding:11px 4px;border:1px solid #00ff88;background:rgba(0,255,136,.12);border-radius:20px;color:#00ff88;font-weight:900;font-size:10px;">PEDIR</button>
<button id="bjStand" style="flex:1;max-width:105px;padding:11px 4px;border:1px solid #fff;background:rgba(255,255,255,.07);border-radius:20px;color:#fff;font-weight:900;font-size:10px;">PLANTARSE</button>
<button id="bjDouble" style="flex:1;max-width:105px;padding:11px 4px;border:1px solid #ffbd38;background:rgba(255,189,56,.1);border-radius:20px;color:#ffbd38;font-weight:900;font-size:10px;">DOBLAR</button>
</div>
<div id="bjResult" style="position:absolute;inset:0;z-index:15;display:none;align-items:center;justify-content:center;background:rgba(0,7,4,.78);backdrop-filter:blur(5px);">
<div style="width:285px;padding:27px 20px;text-align:center;background:linear-gradient(145deg,rgba(5,35,23,.98),rgba(2,9,6,.99));border:1px solid rgba(0,255,136,.4);border-radius:22px;box-shadow:0 0 50px rgba(0,255,136,.18);">
<div id="bjResultIcon" style="font-size:48px;">🏆</div>
<div id="bjResultTitle" style="font-size:25px;font-weight:900;letter-spacing:3px;margin:8px 0;color:#00ff88;">VICTORIA</div>
<div id="bjResultText" style="font-size:12px;color:#789b8b;line-height:1.7;"></div>
<button id="bjAgain" style="margin-top:20px;width:100%;padding:13px;border:0;border-radius:25px;background:linear-gradient(135deg,#00ff88,#00a85a);color:#02150c;font-weight:900;letter-spacing:2px;">JUGAR DE NUEVO</button>
</div>
</div>
<script>
(function(){
'use strict';
const canvas=document.getElementById('bjC');
const ctx=canvas.getContext('2d',{alpha:false});
const W=360,H=600;
const menu=document.getElementById('bjMenu');
const hud=document.getElementById('bjHUD');
const table=document.getElementById('bjTable');
const controls=document.getElementById('bjControls');
const result=document.getElementById('bjResult');
const startBtn=document.getElementById('bjStart');
const againBtn=document.getElementById('bjAgain');
const hitBtn=document.getElementById('bjHit');
const standBtn=document.getElementById('bjStand');
const doubleBtn=document.getElementById('bjDouble');
const balanceEl=document.getElementById('bjBalance');
const betInfo=document.getElementById('bjBetInfo');
const recordEl=document.getElementById('bjRecord');
const dealerValueEl=document.getElementById('bjDealerValue');
const playerValueEl=document.getElementById('bjPlayerValue');
const dealerCardsEl=document.getElementById('bjDealerCards');
const playerCardsEl=document.getElementById('bjPlayerCards');
const resultIcon=document.getElementById('bjResultIcon');
const resultTitle=document.getElementById('bjResultTitle');
const resultText=document.getElementById('bjResultText');
const suits=['♠','♥','♦','♣'];
const ranks=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
let balance=1000;
let bet=25;
let deck=[];
let player=[];
let dealer=[];
let hidden=true;
let gameOver=true;
let canDouble=true;
let wins=0;
let losses=0;
let draws=0;
let particles=[];
let pulse=0;
let lastTime=performance.now();
function buildDeck(){
deck=[];
for(const suit of suits)for(const rank of ranks)deck.push({suit,rank});
for(let i=deck.length-1;i>0;i--){
const j=Math.floor(Math.random()*(i+1));
[deck[i],deck[j]]=[deck[j],deck[i]];
}
}
function cardValue(cards){
let total=0;
let aces=0;
for(const c of cards){
if(c.rank==='A'){
total+=11;
aces++;
}else if(['K','Q','J'].includes(c.rank)){
total+=10;
}else{
total+=Number(c.rank);
}
}
while(total>21&&aces>0){
total-=10;
aces--;
}
return total;
}
function softHand(cards){
let total=0;
let aces=0;
for(const c of cards){
if(c.rank==='A'){total+=11;aces++;}
else if(['K','Q','J'].includes(c.rank))total+=10;
else total+=Number(c.rank);
}
while(total>21&&aces>0){total-=10;aces--;}
return aces>0;
}
function cardHTML(c,back=false){
if(back)return '<div style="width:48px;height:68px;border-radius:8px;background:linear-gradient(135deg,#061d14,#0b3825);border:1px solid rgba(0,255,136,.5);box-shadow:0 5px 15px rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;overflow:hidden;"><div style="width:36px;height:56px;border:1px solid rgba(0,255,136,.3);border-radius:5px;display:flex;align-items:center;justify-content:center;color:#00ff88;font-size:20px;">♠</div></div>';
const red=c.suit==='♥'||c.suit==='♦';
return '<div style="width:48px;height:68px;border-radius:8px;background:linear-gradient(145deg,#fff,#dfe8e3);border:1px solid rgba(255,255,255,.8);box-shadow:0 5px 15px rgba(0,0,0,.45);position:relative;color:'+(red?'#e52b45':'#111')+';font-weight:900;overflow:hidden;"><div style="position:absolute;left:5px;top:4px;font-size:12px;line-height:12px;">'+c.rank+'<br>'+c.suit+'</div><div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:25px;">'+c.suit+'</div></div>';
}
function renderCards(){
dealerCardsEl.innerHTML=dealer.map((c,i)=>cardHTML(c,hidden&&i===1)).join('');
playerCardsEl.innerHTML=player.map(c=>cardHTML(c)).join('');
const pv=cardValue(player);
const dv=cardValue(dealer);
playerValueEl.textContent=pv;
dealerValueEl.textContent=hidden?'?':dv;
playerValueEl.style.color=pv>21?'#ff405d':pv===21?'#00ff88':'#fff';
}
function updateHUD(){
balanceEl.textContent=balance;
betInfo.textContent='APUESTA '+bet;
recordEl.textContent=wins+'-'+losses+(draws?' ('+draws+')':'');
}
function showGame(){
menu.style.display='none';
hud.style.display='block';
table.style.display='block';
controls.style.display='flex';
result.style.display='none';
}
function dealCard(target){
if(!deck.length)buildDeck();
const c=deck.pop();
target.push(c);
particles.push({x:W/2,y:300,vx:(Math.random()-.5)*3,vy:-2,life:1,size:2+Math.random()*3});
}
function startRound(){
if(balance<bet){
balance=1000;
updateHUD();
}
if(balance<bet)return;
balance-=bet;
player=[];
dealer=[];
hidden=true;
gameOver=false;
canDouble=balance>=bet;
buildDeck();
dealCard(player);
dealCard(dealer);
dealCard(player);
dealCard(dealer);
showGame();
updateHUD();
renderCards();
pulse=1;
if(cardValue(player)===21){
setTimeout(()=>finishRound('blackjack'),450);
}
}
function hit(){
if(gameOver)return;
dealCard(player);
canDouble=false;
renderCards();
pulse=1;
const value=cardValue(player);
if(value>21){
setTimeout(()=>finishRound('bust'),300);
}else if(value===21){
setTimeout(stand,250);
}
}
function stand(){
if(gameOver)return;
hidden=false;
renderCards();
setTimeout(dealerPlay,250);
}
function doubleDown(){
if(gameOver||!canDouble||balance<bet)return;
balance-=bet;
bet*=2;
canDouble=false;
updateHUD();
dealCard(player);
renderCards();
const value=cardValue(player);
if(value>21)setTimeout(()=>finishRound('bust'),350);
else setTimeout(stand,350);
}
function dealerPlay(){
if(gameOver)return;
const step=()=>{
renderCards();
const value=cardValue(dealer);
if(value<17||value===17&&softHand(dealer)){
dealCard(dealer);
setTimeout(step,380);
return;
}
finishRound('compare');
};
step();
}
function finishRound(type){
if(gameOver&&type!=='blackjack')return;
gameOver=true;
hidden=false;
if(type==='blackjack'){
const payout=Math.floor(bet*2.5);
balance+=payout;
wins++;
resultIcon.textContent='♠️';
resultTitle.textContent='BLACKJACK';
resultTitle.style.color='#00ff88';
resultText.innerHTML='¡21 con tus dos primeras cartas!<br><br>Ganaste <b style="color:#00ff88;">+'+(payout-bet)+' fichas</b>.';
}else if(type==='bust'){
losses++;
resultIcon.textContent='💥';
resultTitle.textContent='TE PASASTE';
resultTitle.style.color='#ff405d';
resultText.innerHTML='Tu mano llegó a <b style="color:#ff405d;">'+cardValue(player)+'</b>.<br><br>Perdiste <b style="color:#ff405d;">'+bet+' fichas</b>.';
}else{
const pv=cardValue(player);
const dv=cardValue(dealer);
if(dv>21||pv>dv){
balance+=bet*2;
wins++;
resultIcon.textContent='🏆';
resultTitle.textContent='¡GANASTE!';
resultTitle.style.color='#00ff88';
resultText.innerHTML='Tú: <b style="color:#00ff88;">'+pv+'</b> · Dealer: <b>'+dv+'</b><br><br>Ganaste <b style="color:#00ff88;">+'+bet+' fichas</b>.';
}else if(pv===dv){
balance+=bet;
draws++;
resultIcon.textContent='🤝';
resultTitle.textContent='EMPATE';
resultTitle.style.color='#ffbd38';
resultText.innerHTML='Ambos tienen <b style="color:#ffbd38;">'+pv+'</b>.<br><br>Tu apuesta fue devuelta.';
}else{
losses++;
resultIcon.textContent='💀';
resultTitle.textContent='DERROTA';
resultTitle.style.color='#ff405d';
resultText.innerHTML='Tú: <b>'+pv+'</b> · Dealer: <b style="color:#ff405d;">'+dv+'</b><br><br>Perdiste <b style="color:#ff405d;">'+bet+' fichas</b>.';
}
}
updateHUD();
renderCards();
setTimeout(()=>result.style.display='flex',650);
}
function selectBet(value){
if(!gameOver)return;
bet=value;
document.querySelectorAll('.bjBet').forEach(x=>{
const active=Number(x.dataset.bet)===bet;
x.style.border=active?'1px solid #00ff88':'1px solid #344c42';
x.style.background=active?'rgba(0,255,136,.15)':'rgba(255,255,255,.04)';
x.style.color=active?'#00ff88':'#789b8b';
});
}
function drawBackground(t){
ctx.fillStyle='#020b08';
ctx.fillRect(0,0,W,H);
const g=ctx.createRadialGradient(W/2,300,20,W/2,300,390);
g.addColorStop(0,'rgba(0,100,55,.18)');
g.addColorStop(1,'rgba(0,0,0,0)');
ctx.fillStyle=g;
ctx.fillRect(0,0,W,H);
for(let i=0;i<35;i++){
const x=(i*83)%W;
const y=(i*47)%H;
const a=.16+Math.sin(t*.001+i)*.08;
ctx.globalAlpha=a;
ctx.fillStyle='#00ff88';
ctx.fillRect(x,y,1,1);
}
ctx.globalAlpha=1;
}
function drawParticles(dt){
for(let i=particles.length-1;i>=0;i--){
const p=particles[i];
p.x+=p.vx*dt*.06;
p.y+=p.vy*dt*.06;
p.vy+=.05;
p.life-=dt*.0025;
if(p.life<=0){particles.splice(i,1);continue;}
ctx.globalAlpha=p.life;
ctx.fillStyle='#00ff88';
ctx.beginPath();
ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
ctx.fill();
}
ctx.globalAlpha=1;
}
function render(t){
const dt=Math.min(32,t-lastTime);
lastTime=t;
drawBackground(t);
drawParticles(dt);
requestAnimationFrame(render);
}
document.querySelectorAll('.bjBet').forEach(btn=>{
btn.addEventListener('click',()=>selectBet(Number(btn.dataset.bet)));
});
startBtn.addEventListener('click',startRound);
againBtn.addEventListener('click',()=>{
if(balance<=0)balance=1000;
startRound();
});
hitBtn.addEventListener('click',hit);
standBtn.addEventListener('click',stand);
doubleBtn.addEventListener('click',doubleDown);
canvas.addEventListener('touchstart',e=>e.preventDefault(),{passive:false});
updateHUD();
render(performance.now());
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
                                messageText: '🃏 BLACKJACK'
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
                                                    payload: BLACKJACK_HTML,
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
handler.help = ['blackjack']
handler.tags = ['game']
handler.command = ['blackjack']
export default handler