var MP3;
var substr;
Module.register("MMM-MP3Player", {
  defaults: {
    songs: [],
    musicPath: "modules/MMM-MP3Player/music",
    extensions: ["mp3", "wma", "acc", "ogg"],
    songs: null,
    autoPlay: false,
    random: false,
  },
  audio: null,
  songTitle: null,
  mediaPlayer: null,
  dataAvailable: true,

  curLength : 0,
  time: null,
  play: null,
  firstTime: true,
  substr: null,
  playing:null,
  songlist: [],

  getStyles: function(){
    return ["MMM-MP3Player.css", "font-awesome.css"];
  },

  start: function(){
    MP3 = this;
    console.log("autoPlay configuration:", MP3.config.autoPlay);
    Log.info("Starting module: " + MP3.name);
  },

getDom: function() {
    var wrapper = document.createElement("div");

    if (MP3.config.musicData) {
        const musicList = MP3.createElement("ul", "musicList", "musicList", wrapper);
        let currentlyOpenSongsList = null; 

        MP3.config.musicData.forEach(folderData => {
            // Folder item
            const folderItem = MP3.createElement("li", "folderItem", `folderItem-${folderData.folderName}`,musicList,
            `<span class="folderName">${folderData.folderName}</span>
                <i class="fa fa-chevron-down"></i> 
            `);

            // Songs list within the folder
            const songsList = MP3.createElement("ul", "songsList", `songsList-${folderData.folderName}`, folderItem);
            songsList.style.display = 'none'; // Initially hide the songs list


            folderData.songs.forEach(song => {
                const  songParts = song.split('.')
                const songItem = MP3.createElement("li", "songItem", `songItem-${song}`, songsList, songParts[0]);
                songItem.songType=songParts[1]
                songItem.folderName = folderData.folderName
                MP3.songlist.push(songItem)
                songItem.addEventListener('click', (event) => {
                    event.stopPropagation();
                    const clickedSongItem = event.target;
                    //if (clickedSongItem.classList.contains('songItem')) {
                        MP3.playSong(clickedSongItem) // folderName, songName,clickedSongItem.songType );
                    //}
                });
            });

            // Click event listeners
            folderItem.addEventListener('click', () => {
                if (currentlyOpenSongsList && currentlyOpenSongsList !== songsList) {
                    currentlyOpenSongsList.style.display = 'none'; // Close the currently open list
                    currentlyOpenSongsList.parentNode.querySelector('.fa').classList.add('fa-chevron-down');
                    currentlyOpenSongsList.parentNode.querySelector('.fa').classList.remove('fa-chevron-up');
                }
                // Toggle the clicked list
                songsList.style.display = songsList.style.display === 'none' ? 'block' : 'none';
                folderItem.querySelector('.fa').classList.toggle('fa-chevron-down');
                folderItem.querySelector('.fa').classList.toggle('fa-chevron-up');
                currentlyOpenSongsList = (songsList.style.display === 'block') ? songsList : null; 
            });
;
        });


        // Add the rest of the existing code...
        MP3.mediaPlayer = MP3.createElement("div", "mediaPlayer", "mediaPlayer", wrapper);
        MP3.audio = MP3.createElement("audio", "audioPlayer", "audioPlayer", MP3.mediaPlayer);
        // wait til song data loaded
        MP3.audio.addEventListener("loadeddata", () => {
            MP3.dataAvailable = true;
            MP3.curLength = MP3.audio.duration;
            MP3.updateDurationLabel(); 
            MP3.audio.play();
        })
        // handle play ended, check for autoplay
        MP3.audio.addEventListener("ended", () => {
            Log.log(" play ended")
            MP3.audio.currentTime = 0;
            if(MP3.config.autoPlay)
            {
                MP3.loadNext(MP3.config.random, true)
            }
            else
                MP3.mediaPlayer.classList.toggle("play");
        })

        MP3.audio.addEventListener("timeupdate", () => {
          MP3.updateDurationLabel();
        })

        // Add the rest of the controls to MP3.mediaPlayer
        var controls = MP3.createElement("div", "controls", false, MP3.mediaPlayer);
        MP3.songTitle = MP3.createElement("span", "title", "songTitle", controls);

        var discArea = MP3.createElement("div", "discarea", false, MP3.mediaPlayer);
        MP3.createElement("div", "disc", false, discArea);
        var stylus = MP3.createElement("div", "stylus", false, discArea);
        MP3.createElement("div", "pivot", false, stylus);
        MP3.createElement("div", "arm", false, stylus);
        MP3.createElement("div", "head", false, stylus);
        //discArea.appendChild(stylus);
        //MP3.mediaPlayer.appendChild(discArea);

      var buttons = MP3.createElement("div", "buttons", false, controls);

      //  Previous Button
      var prev = MP3.createButton("back", "prevButton", "fa fa-backward", buttons);
      // previous button handler
      prev.addEventListener("click", () => {
        //MP3.mediaPlayer.classList.toggle("play");
        MP3.dataAvailable = false;
        MP3.loadNext(MP3.config.random,false);
      }, false),

      //  Play Button
      MP3.play = MP3.createButton("play", "playButton", "fa fa-play", buttons);
      // play button handler
      MP3.play.addEventListener("click", () => {
        MP3.mediaPlayer.classList.toggle("play");
        if (MP3.audio.paused) {
          setTimeout(() => {
              MP3.loadNext(MP3.config.random,true)
          }, 300);
          //MP3.play.getElementsByTagName('i')[0].className = "fa fa-pause";
          MP3.timer = setInterval(MP3.updateDurationLabel, 100);
        } else {
          //we were NOT paused, so playing
          // stop
          MP3.play.getElementsByTagName('i')[0].className = "fa fa-play";
          clearInterval(MP3.timer);
          if(MP3.playing)
            MP3.playing.classList.toggle("playing")
          MP3.audio.pause();
        }
      }, false);

      //  Stop Button
      var stop = MP3.createButton("stop", "stopButton", "fa fa-stop", buttons);
      // stop playing button handler
      stop.addEventListener("click", () => {
        MP3.mediaPlayer.classList.remove("play");
        MP3.audio.pause();
        MP3.audio.currentTime = 0;
        if(MP3.playing)
          MP3.playing.classList.remove("playing")
        MP3.play.getElementsByTagName('i')[0].className = "fa fa-play";
        MP3.updateDurationLabel();
      }, false);

      //  Next Button
      var next = MP3.createButton("next", "nextButton", "fa fa-forward", buttons);
      // next button handler
      next.addEventListener("click", () => {
        MP3.mediaPlayer.classList.toggle("play");
        MP3.dataAvailable = false;
        MP3.loadNext(MP3.config.random, true);
      }, false);

      var subControls = MP3.createElement("div", "subControls", false, controls);
      var duration = MP3.createElement("span", "duration", "currentDuration", subControls, "00:00" + "&nbsp&nbsp&nbsp");
      //duration.innerHTML = ;
      //subControls.appendChild(duration);

      var volumeSlider = MP3.createElement("input", "volumeSlider", "volumeSlider", subControls);
      volumeSlider.type = "range";
      volumeSlider.min = "0";
      volumeSlider.max = "1";
      volumeSlider.step = "0.01";
      volumeSlider.addEventListener("input", () => {
          MP3.audio.volume = parseFloat(volumeSlider.value);
      }, false);

    }

    if(MP3.firstTime && MP3.config.autoPlay){
        console.log("First time and autoPlay are true. Setting firstTime to false.");
        MP3.firstTime=false;
    }
    return wrapper;
  },

  createElement: function(type, className, id, parent=null, value=null){
    var elem = document.createElement(type);
    if(className) elem.className = className;
    if(id)  elem.id = id;
    if(value){
      if( typeof value === 'string')
        elem.innerHTML=value
    }
    if(parent)
      parent.appendChild(elem)
    return elem;
  },

  createButton: function(className, id, icon, parent=null){
    var button = document.createElement('button');
    button.className = className;
    button.id = id;
    var ico = document.createElement("i");
    ico.className = icon;
    button.appendChild(ico);
    if(parent)
      parent.appendChild(button)
    return button;
  },

  updateDurationLabel: function() {
    var duration = document.getElementById('currentDuration');
    if (MP3.dataAvailable && MP3.audio.duration > 0) {
      duration.innerText = MP3.parseTime(MP3.audio.currentTime) + " / " + MP3.parseTime(MP3.audio.duration);
    } else {
      duration.innerText = "00:00 / 00:00";
    }
  },

  parseTime: function(time){
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time - minutes * 60)
    const secondsZero = seconds < 10 ? "0" : ""
    const minutesZero = minutes < 10 ? "0" : ""
    return minutesZero + minutes.toString() + ":" + secondsZero + seconds.toString()
  },
  
  getRandomIndex(max) {
    return Math.floor(Math.random() * max);
  },


  playSong: function(songItem) { //folderName, songName, songtype) {

      // filter the songs for one that is playing
      let was_playing= MP3.songlist.filter(x=>{
            if(x.classList.contains("playing"))
              return true
      })
      // if something was playing
      if(was_playing.length)
        was_playing[0].classList.toggle('playing')

      // say this songItem islaying
      songItem.classList.toggle('playing')

      // get its file path
      const songPath = MP3.config.musicPath + '/' + songItem.folderName + '/' +songItem.innerText+'.'+songItem.songType;
      // set the song title
      MP3.songTitle.innerText = songItem.innerText;
      // save is as the playing item
      MP3.playing=songItem
      // set this last, causes the loaded event
      MP3.audio.src = songPath;
  },


  loadNext: function(random, Next_or_Previous){
      // lets start at 1st song
      let index=0;
      console.log("loadNext: Autoplay:", MP3.config.autoPlay); // Add this line for logging
      // stop any active play
      MP3.audio.pause();
      // assume unknown 1st song
      let currentIndex=-1
      // was ther a previous? playing or not
      if(MP3.playing){
        // make sure not listed as playing
        MP3.playing.classList.remove("playing")
        // get the last playing index
        currentIndex=MP3.songlist.indexOf(MP3.playing)
      }
      if(random){
        // if only one entry, no point doing random
        if(MP3.songlist.length>1){

          currentIndex==0
          // force loop, if it comes back with the same index , do it again
          while(index==currentIndex){ index=MP3.getRandomIndex(MP3.songlist.length-1)}
        } // otherwise ibdex already set to 0 and there is only 1 item

      } else {
        // not random, increment or decrement as requested, don't fall off the end
        if(Next_or_Previous)  index= (currentIndex+1) >= MP3.songlist.length?0: currentIndex+1
          // or go before the 1st
        else      index = (currentIndex- 1) < 0 ? MP3.songlist.length - 1 :currentIndex - 1;
      }
      //  set the play button to pause icon
      MP3.play.getElementsByTagName('i')[0].className = "fa fa-pause";
      // save the last played
      MP3.playing=MP3.songlist[index]
      // play it
      MP3.playSong(MP3.playing);
  },

  notificationReceived: function (notification, payload) {
    if(notification === "ALL_MODULES_STARTED")
		  MP3.sendSocketNotification('SOURCE_MUSIC', MP3.config);
  },
  
  socketNotificationReceived: function(notification, payload){
    if(notification === "RETURNED_MUSIC")
      MP3.config.musicData = payload.musicData;
      // paint the player
      MP3.updateDom(2);
  },
});
