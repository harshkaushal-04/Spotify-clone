console.log("hello")
let currentsong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getsongs(folder) {
  currFolder = folder
  let a = await fetch(`http://192.168.9.221:3000/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }
  let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
  songUL.innerHTML = ""
  for (const song of songs) {
    songUL.innerHTML = songUL.innerHTML + `<li>
                <img class="invert" src="img/music.svg" alt="">
                <div class="info">
                  <div>${song.replaceAll("%20"," ")}</div>
                  <Div>Harsh</Div>
                </div>
                <div class="playnow">
                  <span>Play now</span>
                  <img class="invert" src="img/play.svg" alt="">
                </div> </li>`;
  }
  Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e=>{
    e.addEventListener("click",element=>{
      playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
    })
  })
  return songs
  
}

const playmusic = (track, pause=false) =>{
  let audio = new Audio("songs" + track)
  currentsong.src = `/${currFolder}/` + track
  if(!pause){
    currentsong.play()
    play.src = "img/pause.svg"
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track)
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00"

}

async function displayAlbums() {

  let a = await fetch(`/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a")
  let cardcontainer = document.querySelector(".cardcontainer")
  let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index]; 
        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0]
            // Get the metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json();
            cardcontainer.innerHTML = cardcontainer.innerHTML + ` <div data-folder="${folder}" class="card">
            <div class="play">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                        stroke-linejoin="round" />
                </svg>
            </div>

            <img src="/songs/${folder}/cover.jpg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div>`
        }
    }
    Array.from(document.getElementsByClassName("card")).forEach(e => { 
        e.addEventListener("click", async item => {
            console.log("Fetching Songs")
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`)  
            playmusic(songs[0], true)

    })
    })

}

async function main() {
  await getsongs("songs"); 
  playmusic(songs[0], true)

  await displayAlbums()

  play.addEventListener("click",()=>{
    if(currentsong.paused){
      currentsong.play()
      play.src = "img/pause.svg"
    }
    else{
      currentsong.pause()
      play.src = "img/play.svg"
    }
  })
  currentsong.addEventListener("timeupdate",(a)=>{
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)}/${secondsToMinutesSeconds(currentsong.duration)}`
    document.querySelector(".circle").style.left = (currentsong.currentTime/currentsong.duration)*100 + "%";
  })
currentsong.addEventListener("ended", () => {
  document.querySelector("#play").src = "img/play.svg"; // switch to play icon
})


  document.querySelector(".seekbar").addEventListener("click",e=>{
    let percent = (e.offsetX/e.target.getBoundingClientRect().width)*100
    document.querySelector(".circle").style.left = percent + "%"
    currentsong.currentTime = (currentsong.duration * percent) / 100
  })
  document.querySelector(".hamberger").addEventListener("click",()=>{
    document.querySelector(".left").style.left = 0
  })
  document.querySelector(".close").addEventListener("click",()=>{
    document.querySelector(".left").style.left = -120 + "%"
  })
   previous.addEventListener("click", () => {
        currentsong.pause()
        console.log("Previous clicked")
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playmusic(songs[index - 1])
        }
    })

    // Add an event listener to next
    next.addEventListener("click", () => {
        currentsong.pause()
        console.log("Next clicked")
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playmusic(songs[index + 1])
        }
    })
    document.querySelector(".volumerange").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
      currentsong.volume =parseInt(e.target.value)/100
    })

    document.querySelector(".volume>img").addEventListener("click", e=>{ 
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentsong.volume = 0;
            document.querySelector(".volumerange").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentsong.volume = .10;
            document.querySelector(".volumerange").getElementsByTagName("input")[0].value = 10;
        }
      
  
})
}

main();