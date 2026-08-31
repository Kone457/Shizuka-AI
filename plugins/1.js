import crypto from 'crypto'

const PIANO_HTML = `<div style="
    width:100%;
    min-height:300px;
    padding:20px 0;
    background:linear-gradient(#5c94fc,#8fc4ff);
    font-family:Arial,sans-serif;
    overflow:hidden;
">

    <div style="
        text-align:center;
        color:white;
        font-size:22px;
        font-weight:bold;
    ">
        🎹 PIANO
    </div>

    <div style="
        text-align:center;
        color:white;
        font-size:13px;
        margin:6px 0 25px;
    ">
        Do - Re - Mi - Fa - Sol - La - Si - Do
    </div>

    <div style="
        width:100%;
        padding:0 12px;
        box-sizing:border-box;
    ">
        <div id="piano" style="
            position:relative;
            width:100%;
            height:52vw;
            max-height:260px;
            min-height:170px;
            display:flex;
            touch-action:none;
        ">

            <button class="piano-white" data-freq="261.63" data-name="Do">Do</button>
            <button class="piano-white" data-freq="293.66" data-name="Re">Re</button>
            <button class="piano-white" data-freq="329.63" data-name="Mi">Mi</button>
            <button class="piano-white" data-freq="349.23" data-name="Fa">Fa</button>
            <button class="piano-white" data-freq="392.00" data-name="Sol">Sol</button>
            <button class="piano-white" data-freq="440.00" data-name="La">La</button>
            <button class="piano-white" data-freq="493.88" data-name="Si">Si</button>
            <button class="piano-white" data-freq="523.25" data-name="Do">Do</button>

            <button class="piano-black piano-b1" data-freq="277.18" data-name="Do#">Do#</button>
            <button class="piano-black piano-b2" data-freq="311.13" data-name="Re#">Re#</button>
            <button class="piano-black piano-b3" data-freq="369.99" data-name="Fa#">Fa#</button>
            <button class="piano-black piano-b4" data-freq="415.30" data-name="Sol#">Sol#</button>
            <button class="piano-black piano-b5" data-freq="466.16" data-name="La#">La#</button>

        </div>
    </div>

    <div id="piano-note" style="
        text-align:center;
        color:white;
        font-size:22px;
        font-weight:bold;
        margin-top:25px;
    ">
        🎵 Toca una tecla
    </div>

    <style>

        .piano-white{
            position:relative;
            width:12.5%;
            flex:1;
            height:100%;
            padding:0;
            margin:0;
            background:#fff;
            border:1px solid #222;
            border-radius:0 0 8px 8px;
            color:#222;
            font-size:11px;
            font-weight:bold;
            display:flex;
            align-items:flex-end;
            justify-content:center;
            padding-bottom:14px;
            box-shadow:0 5px 0 #aaa;
            z-index:1;
            cursor:pointer;
            user-select:none;
            -webkit-user-select:none;
        }

        .piano-white:active,
        .piano-white.piano-active{
            background:#ddd;
            transform:translateY(5px);
            box-shadow:0 1px 0 #888;
        }

        .piano-black{
            position:absolute;
            top:0;
            width:9%;
            height:58%;
            padding:0;
            margin:0;
            background:linear-gradient(90deg,#111,#333,#050505);
            border:2px solid #000;
            border-radius:0 0 6px 6px;
            color:white;
            font-size:9px;
            font-weight:bold;
            display:flex;
            align-items:flex-end;
            justify-content:center;
            padding-bottom:10px;
            box-shadow:0 6px 5px rgba(0,0,0,.5);
            z-index:5;
            cursor:pointer;
            user-select:none;
            -webkit-user-select:none;
        }

        .piano-black:active,
        .piano-black.piano-active{
            background:#555;
            transform:translateY(4px);
        }

        .piano-b1{left:7.8%}
        .piano-b2{left:20.3%}
        .piano-b3{left:45.3%}
        .piano-b4{left:57.8%}
        .piano-b5{left:70.3%}

    </style>

    <script>

        (function(){

            let audioContext = null;

            function initPianoAudio(){

                if(!audioContext){

                    const AC =
                        window.AudioContext ||
                        window.webkitAudioContext;

                    if(!AC){

                        const note =
                            document.getElementById("piano-note");

                        if(note){
                            note.textContent =
                                "🔇 Audio no compatible";
                        }

                        return null;
                    }

                    audioContext = new AC();
                }

                if(audioContext.state === "suspended"){
                    audioContext.resume();
                }

                return audioContext;
            }

            function playPiano(freq){

                const ctx = initPianoAudio();

                if(!ctx) return;

                const now = ctx.currentTime;

                const master =
                    ctx.createGain();

                master.gain.setValueAtTime(
                    0,
                    now
                );

                master.gain.linearRampToValueAtTime(
                    0.5,
                    now + 0.015
                );

                master.gain.exponentialRampToValueAtTime(
                    0.001,
                    now + 1.2
                );

                master.connect(
                    ctx.destination
                );

                const osc1 =
                    ctx.createOscillator();

                const osc2 =
                    ctx.createOscillator();

                const osc3 =
                    ctx.createOscillator();

                const gain1 =
                    ctx.createGain();

                const gain2 =
                    ctx.createGain();

                const gain3 =
                    ctx.createGain();

                osc1.type = "triangle";
                osc2.type = "sine";
                osc3.type = "sine";

                osc1.frequency.value = freq;
                osc2.frequency.value = freq * 2;
                osc3.frequency.value = freq * 3;

                gain1.gain.value = 1;
                gain2.gain.value = 0.22;
                gain3.gain.value = 0.08;

                osc1.connect(gain1);
                osc2.connect(gain2);
                osc3.connect(gain3);

                gain1.connect(master);
                gain2.connect(master);
                gain3.connect(master);

                osc1.start(now);
                osc2.start(now);
                osc3.start(now);

                osc1.stop(now + 1.3);
                osc2.stop(now + 1.3);
                osc3.stop(now + 1.3);
            }

            document
                .querySelectorAll(
                    ".piano-white,.piano-black"
                )
                .forEach(function(key){

                    function press(e){

                        e.preventDefault();

                        key.classList.add(
                            "piano-active"
                        );

                        const note =
                            document.getElementById(
                                "piano-note"
                            );

                        if(note){
                            note.textContent =
                                "🎵 " +
                                key.dataset.name;
                        }

                        playPiano(
                            parseFloat(
                                key.dataset.freq
                            )
                        );
                    }

                    function release(){

                        key.classList.remove(
                            "piano-active"
                        );
                    }

                    key.addEventListener(
                        "pointerdown",
                        press
                    );

                    key.addEventListener(
                        "pointerup",
                        release
                    );

                    key.addEventListener(
                        "pointercancel",
                        release
                    );

                    key.addEventListener(
                        "pointerleave",
                        release
                    );

                });

        })();

    </script>

</div>`;

const handler = async (m, { conn }) => {

    const jid = m.key.remoteJid;

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
                                messageText: "🎹 PIANO"
                            }
                        ],

                        unifiedResponse: {
                            data: Buffer.from(
                                JSON.stringify({

                                    response_id:
                                        crypto.randomUUID(),

                                    sections: [
                                        {
                                            view_model: {

                                                primitive: {

                                                    __typename:
                                                        "GenAIaeacdsnwHtmlPrimitive",

                                                    payload:
                                                        PIANO_HTML,

                                                    trusted_sources: []

                                                },

                                                __typename:
                                                    "GenAISingleLayoutViewModel"

                                            }
                                        }
                                    ]

                                })
                            ).toString("base64")
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
    );
};

handler.command = ['piano'];
export default handler;