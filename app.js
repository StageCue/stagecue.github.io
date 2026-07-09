// ============================
// StageCue - Playback Engine
// ============================

const player = document.getElementById("player");
const fileInput = document.getElementById("fileInput");

const playlistDiv = document.getElementById("playlist");

const addBtn = document.getElementById("addBtn");

const playBtn = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");
const stopBtn = document.getElementById("stopBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

const seekBar = document.getElementById("seekBar");
const volume = document.getElementById("volume");

const currentTimeLabel = document.getElementById("currentTime");
const durationLabel = document.getElementById("duration");

const status = document.getElementById("status");
const filename = document.getElementById("filename");
const clipCount = document.getElementById("clipCount");

const overlay = document.getElementById("overlay");

const loopPlaylist = document.getElementById("loopPlaylist");

// -------------------------------------

let playlist = [];
let currentIndex = -1;

// -------------------------------------

addBtn.onclick = () => fileInput.click();

fileInput.onchange = e => {

    const files = [...e.target.files];

    files.forEach(file => {

        playlist.push({
            name: file.name,
            url: URL.createObjectURL(file),
            file
        });

    });

    renderPlaylist();

    if(currentIndex === -1 && playlist.length)
        loadClip(0);

};

// -------------------------------------

function renderPlaylist(){

    playlistDiv.innerHTML = "";

    clipCount.innerHTML =
        playlist.length + " clips";

    playlist.forEach((clip,index)=>{

        const div = document.createElement("div");

        div.className =
            "clip" +
            (index===currentIndex ? " active":"");

        div.innerHTML=`

        <div class="clip-thumb"></div>

        <div class="clip-info">

            <div class="clip-title">

                ${clip.name}

            </div>

            <div class="clip-time">

                Ready

            </div>

        </div>

        `;

        div.onclick=()=>{

            loadClip(index);
            play();

        };

        playlistDiv.appendChild(div);

    });

}

// -------------------------------------

function loadClip(index){

    if(index<0 || index>=playlist.length)
        return;

    currentIndex=index;

    player.src=
        playlist[index].url;

    filename.innerHTML=
        playlist[index].name;

    status.innerHTML="Loaded";

    overlay.style.display="none";

    renderPlaylist();

}

// -------------------------------------

function play(){

    if(currentIndex==-1) return;

    player.play();

    status.innerHTML="Playing";

}

function pause(){

    player.pause();

    status.innerHTML="Paused";

}

function stop(){

    player.pause();

    player.currentTime=0;

    status.innerHTML="Stopped";

}

// -------------------------------------

playBtn.onclick=play;

pauseBtn.onclick=pause;

stopBtn.onclick=stop;

// -------------------------------------

nextBtn.onclick=()=>{

    if(!playlist.length) return;

    let next=currentIndex+1;

    if(next>=playlist.length){

        if(loopPlaylist.checked)
            next=0;
        else
            return;

    }

    loadClip(next);

    play();

};

prevBtn.onclick=()=>{

    if(!playlist.length) return;

    let prev=currentIndex-1;

    if(prev<0)
        prev=0;

    loadClip(prev);

    play();

};

// -------------------------------------

player.onended=()=>{

    nextBtn.click();

};

// -------------------------------------

player.ontimeupdate=()=>{

    if(player.duration){

        seekBar.value=
            (player.currentTime/player.duration)*100;

    }

    currentTimeLabel.innerHTML=
        format(player.currentTime);

};

// -------------------------------------

player.onloadedmetadata=()=>{

    durationLabel.innerHTML=
        format(player.duration);

};

// -------------------------------------

seekBar.oninput=()=>{

    if(player.duration){

        player.currentTime=
            player.duration*
            seekBar.value/100;

    }

};

// -------------------------------------

volume.oninput=()=>{

    player.volume=
        volume.value;

};

// -------------------------------------

function format(sec){

    if(isNaN(sec))
        return "00:00";

    const m=Math.floor(sec/60);

    const s=Math.floor(sec%60);

    return String(m).padStart(2,"0") +
        ":" +
        String(s).padStart(2,"0");

}

// -------------------------------------
// Keyboard
// -------------------------------------

document.addEventListener("keydown",e=>{

    switch(e.code){

        case "Space":

            e.preventDefault();

            if(player.paused)
                play();
            else
                pause();

            break;

        case "ArrowRight":

            nextBtn.click();

            break;

        case "ArrowLeft":

            prevBtn.click();

            break;

        case "KeyS":

            stop();

            break;

    }

});
