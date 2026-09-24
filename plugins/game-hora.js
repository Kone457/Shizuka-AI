import crypto from 'crypto'

const CLOCK_HTML = `
<div style="width:100%;min-height:520px;padding:20px 0;background:linear-gradient(135deg,#0a0f1a,#1e3a5f,#2563eb);font-family:'Segoe UI',Arial,sans-serif;overflow:hidden;color:white;position:relative;">

<div style="text-align:center;font-size:24px;font-weight:900;margin-bottom:6px;letter-spacing:3px;text-shadow:0 0 15px #60a5fa;">⏰ RELOJ</div>
<div style="text-align:center;font-size:12px;opacity:.7;margin-bottom:22px;letter-spacing:2px;">HORA ACTUAL</div>

<div style="width:230px;height:230px;margin:0 auto;border:5px solid rgba(255,255,255,.9);border-radius:50%;position:relative;background:radial-gradient(circle at 30% 30%,rgba(96,165,250,.15),rgba(0,0,0,.4));box-shadow:0 0 40px rgba(96,165,250,.5),inset 0 0 30px rgba(0,0,0,.4);">
<div style="position:absolute;top:50%;left:50%;width:1px;height:8px;background:#93c5fd;transform-origin:50% 100%;transform:translate(-50%,-100%) rotate(0deg);border-radius:2px;" id="tick0"></div>
<div style="position:absolute;top:50%;left:50%;width:1px;height:8px;background:#93c5fd;transform-origin:50% 100%;transform:translate(-50%,-100%) rotate(30deg);border-radius:2px;"></div>
<div style="position:absolute;top:50%;left:50%;width:1px;height:8px;background:#93c5fd;transform-origin:50% 100%;transform:translate(-50%,-100%) rotate(60deg);border-radius:2px;"></div>
<div style="position:absolute;top:50%;left:50%;width:1px;height:8px;background:#93c5fd;transform-origin:50% 100%;transform:translate(-50%,-100%) rotate(90deg);border-radius:2px;"></div>
<div style="position:absolute;top:50%;left:50%;width:1px;height:8px;background:#93c5fd;transform-origin:50% 100%;transform:translate(-50%,-100%) rotate(120deg);border-radius:2px;"></div>
<div style="position:absolute;top:50%;left:50%;width:1px;height:8px;background:#93c5fd;transform-origin:50% 100%;transform:translate(-50%,-100%) rotate(150deg);border-radius:2px;"></div>
<div style="position:absolute;top:50%;left:50%;width:1px;height:8px;background:#93c5fd;transform-origin:50% 100%;transform:translate(-50%,-100%) rotate(180deg);border-radius:2px;"></div>
<div style="position:absolute;top:50%;left:50%;width:1px;height:8px;background:#93c5fd;transform-origin:50% 100%;transform:translate(-50%,-100%) rotate(210deg);border-radius:2px;"></div>
<div style="position:absolute;top:50%;left:50%;width:1px;height:8px;background:#93c5fd;transform-origin:50% 100%;transform:translate(-50%,-100%) rotate(240deg);border-radius:2px;"></div>
<div style="position:absolute;top:50%;left:50%;width:1px;height:8px;background:#93c5fd;transform-origin:50% 100%;transform:translate(-50%,-100%) rotate(270deg);border-radius:2px;"></div>
<div style="position:absolute;top:50%;left:50%;width:1px;height:8px;background:#93c5fd;transform-origin:50% 100%;transform:translate(-50%,-100%) rotate(300deg);border-radius:2px;"></div>
<div style="position:absolute;top:50%;left:50%;width:1px;height:8px;background:#93c5fd;transform-origin:50% 100%;transform:translate(-50%,-100%) rotate(330deg);border-radius:2px;"></div>

<div style="position:absolute;top:50%;left:50%;width:5px;height:70px;background:linear-gradient(180deg,#fff,#93c5fd);transform-origin:50% 100%;transform:translate(-50%,-100%) rotate(0deg);border-radius:5px;box-shadow:0 0 10px rgba(255,255,255,.6);" id="clock-hour"></div>
<div style="position:absolute;top:50%;left:50%;width:3px;height:88px;background:linear-gradient(180deg,#93c5fd,#3b82f6);transform-origin:50% 100%;transform:translate(-50%,-100%) rotate(0deg);border-radius:5px;box-shadow:0 0 10px rgba(147,197,253,.7);" id="clock-minute"></div>
<div style="position:absolute;top:50%;left:50%;width:2px;height:96px;background:#ef4444;transform-origin:50% 100%;transform:translate(-50%,-100%) rotate(0deg);border-radius:5px;box-shadow:0 0 10px #ef4444;" id="clock-second"></div>
<div style="position:absolute;top:50%;left:50%;width:14px;height:14px;background:radial-gradient(circle,#fff,#60a5fa);border-radius:50%;transform:translate(-50%,-50%);z-index:10;box-shadow:0 0 12px #60a5fa;"></div>
</div>

<div id="clock-digital" style="text-align:center;font-size:34px;font-weight:900;margin-top:22px;letter-spacing:3px;font-family:'Courier New',monospace;text-shadow:0 0 20px #60a5fa;">00:00:00</div>
<div id="clock-ampm" style="text-align:center;font-size:12px;font-weight:bold;color:#93c5fd;letter-spacing:4px;margin-top:2px;">AM</div>
<div id="clock-date" style="text-align:center;font-size:13px;margin-top:8px;opacity:.85;text-transform:capitalize;letter-spacing:1px;">Cargando...</div>
<div id="clock-week" style="text-align:center;font-size:11px;margin-top:12px;opacity:.6;letter-spacing:2px;">DÍA 0 DEL AÑO</div>

<script>
(function(){
function updateClock(){
const now=new Date();
const hours=now.getHours();
const minutes=now.getMinutes();
const seconds=now.getSeconds();
const hourDeg=(hours%12)*30+minutes*0.5;
const minuteDeg=minutes*6+seconds*0.1;
const secondDeg=seconds*6;
const hour=document.getElementById("clock-hour");
const minute=document.getElementById("clock-minute");
const second=document.getElementById("clock-second");
if(hour)hour.style.transform="translate(-50%,-100%) rotate("+hourDeg+"deg)";
if(minute)minute.style.transform="translate(-50%,-100%) rotate("+minuteDeg+"deg)";
if(second)second.style.transform="translate(-50%,-100%) rotate("+secondDeg+"deg)";
const digital=document.getElementById("clock-digital");
if(digital){
const h=String(hours).padStart(2,"0");
const m=String(minutes).padStart(2,"0");
const s=String(seconds).padStart(2,"0");
digital.textContent=h+":"+m+":"+s;
}
const ampm=document.getElementById("clock-ampm");
if(ampm)ampm.textContent=hours>=12?"PM":"AM";
const date=document.getElementById("clock-date");
if(date){
date.textContent=now.toLocaleDateString("es-ES",{weekday:"long",day:"2-digit",month:"long",year:"numeric"});
}
const week=document.getElementById("clock-week");
if(week){
const start=new Date(now.getFullYear(),0,0);
const diff=now-start;
const dayOfYear=Math.floor(diff/86400000);
const daysInYear=((now.getFullYear()%4===0&&now.getFullYear()%100!==0)||now.getFullYear()%400===0)?366:365;
const weekOfYear=Math.ceil(dayOfYear/7);
week.textContent="DÍA "+dayOfYear+" / "+daysInYear+" · SEMANA "+weekOfYear;
}
}
updateClock();
setInterval(updateClock,1000);
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