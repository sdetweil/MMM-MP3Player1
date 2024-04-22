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
  curSong :0,
  curLength : 0,
  time: null,
  play: null,
  firstTime: true,
  substr: null,
  
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
        let lastOpenList = null;  // This will keep track of the last open song list

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
                //songItem.innerHTML = ;
                //songsList.appendChild(songItem);
            });

            // Click event listeners
            folderItem.addEventListener('click', () => {
                // Toggle the current list
                const isCurrentlyOpen = songsList.style.display !== 'none';
                
                // Close all lists
                document.querySelectorAll(".songsList").forEach(list => {
                    list.style.display = 'none'; // Close all song lists
                    list.parentElement.querySelector('.fa').className = "fa fa-chevron-down"; // Reset all chevrons
                });

                // If the current list was not open before, open it
                if (!isCurrentlyOpen) {
                    songsList.style.display = 'block';
                    folderItem.querySelector('.fa').classList.toggle('fa-chevron-down');
                    folderItem.querySelector('.fa').classList.toggle('fa-chevron-up');
                }
            });

            songsList.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent event from bubbling up to the folder
                const clickedSongItem = event.target.closest('.songItem');
                if (clickedSongItem) {
                    const songName = clickedSongItem.innerText;
                    const folderName = folderData.folderName;
                    MP3.playSong(folderName, songName, clickedSongItem.songType);
                }
            });
            //folderItem.appendChild(songsList);
            //musicList.appendChild(folderItem);
        });

       // wrapper.appendChild(musicList);

        // Add the rest of the existing code...
        MP3.mediaPlayer = MP3.createElement("div", "mediaPlayer", "mediaPlayer", wrapper);
        MP3.audio = MP3.createElement("audio", "audioPlayer", "audioPlayer", MP3.mediaPlayer);

    // Add event listeners for play and pause events
    MP3.audio.addEventListener("play", () => {
        MP3.play.getElementsByTagName('i')[0].className = "fa fa-pause"; // Change to pause icon when playing
    });

    MP3.audio.addEventListener("pause", () => {
        MP3.play.getElementsByTagName('i')[0].className = "fa fa-play"; // Change to play icon when paused
    });

        MP3.audio.addEventListener("loadeddata", () => {
            MP3.dataAvailable = true;
            MP3.curLength = MP3.audio.duration;
            MP3.updateDurationLabel(); 
        })
        MP3.audio.addEventListener("ended", () => {
            Log.log(" play ended")
            MP3.audio.currentTime = 0;
            if(MP3.config.autoPlay)
            {
                MP3.loadNext(MP3.config.random)
            }
            else
                MP3.mediaPlayer.classList.toggle("play");
        })

        MP3.audio.addEventListener("timeupdate", () => {
          MP3.updateDurationLabel();
        })
        //MP3.mediaPlayer.appendChild(MP3.audio);

        // Add the rest of the controls to MP3.mediaPlayer
        var controls = MP3.createElement("div", "controls", false, MP3.mediaPlayer);
        MP3.songTitle = MP3.createElement("span", "title", "songTitle", controls);
        MP3.setCurrentSong(MP3.curSong);
        //controls.appendChild(MP3.songTitle);

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
      prev.addEventListener("click", () => {
        MP3.mediaPlayer.classList.toggle("play");
        MP3.dataAvailable = false;
        MP3.loadNext(MP3.config.random);
        MP3.audio.play();
        MP3.play.getElementsByTagName('i')[0].className = "fa fa-pause";
      }, false),
      //buttons.appendChild(prev);

      //  Play Button
      MP3.play = MP3.createButton("play", "playButton", "fa fa-play", buttons);
      MP3.play.addEventListener("click", () => {
        MP3.mediaPlayer.classList.toggle("play");
        if (MP3.audio.paused) {
          setTimeout(() => {
            MP3.audio.play();
          }, 300);
          MP3.play.getElementsByTagName('i')[0].className = "fa fa-pause";
          MP3.timer = setInterval(MP3.updateDurationLabel, 100);
        } else {
          //MP3.loadNext(MP3.config.random);
          MP3.play.getElementsByTagName('i')[0].className = "fa fa-play";
          clearInterval(MP3.timer);
          MP3.audio.pause();
        }
      }, false);
     // buttons.appendChild(MP3.play);

      //  Stop Button
      var stop = MP3.createButton("stop", "stopButton", "fa fa-stop", buttons);
      stop.addEventListener("click", () => {
        MP3.mediaPlayer.classList.remove("play");
        MP3.audio.pause();
        MP3.audio.currentTime = 0;
        MP3.play.getElementsByTagName('i')[0].className = "fa fa-play";
        MP3.updateDurationLabel();
      }, false);
      //buttons.appendChild(stop);

      //  Next Button
      var next = MP3.createButton("next", "nextButton", "fa fa-forward", buttons);
      next.addEventListener("click", () => {
        MP3.mediaPlayer.classList.toggle("play");
        MP3.dataAvailable = false;
        MP3.loadNext(MP3.config.random);
        MP3.play.getElementsByTagName('i')[0].className = "fa fa-play";
      }, false);

     // buttons.appendChild(next);

       // controls.appendChild(buttons);

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

        //subControls.appendChild(volumeSlider);
        //controls.appendChild(subControls);
       // MP3.mediaPlayer.appendChild(controls);

        //wrapper.appendChild(MP3.mediaPlayer);
    }

    if(MP3.firstTime && MP3.config.autoPlay){
        console.log("First time and autoPlay are true. Setting firstTime to false.");
        MP3.firstTime=false;
    }
    return wrapper;
  },

  playSong: function(folderName, songName, songtype) {
      const songPath = MP3.config.musicPath + '/' + folderName + '/' + songName+'.'+songtype;
      MP3.audio.src = songPath;
      MP3.songTitle.innerHTML = songName;
      MP3.audio.play();
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
  
  setCurrentSong: function(index){
    /*
      if(MP3.audio!= undefined){
        MP3.audio.src = MP3.config.musicPath + '/' + MP3.config.songs[index];
        MP3.songTitle.innerHTML = MP3.config.songs[index].substr(0, MP3.config.songs[index].length - 4);
        MP3.curSong = index;
      }*/
  },

  loadNext: function(next){
   let index=0;
      console.log("loadNext: Autoplay:", MP3.config.autoPlay); // Add this line for logging
      MP3.audio.pause();
      if(next)  index= (MP3.curSong + 1) % MP3.config.songs.length;
      else      index = (MP3.curSong - 1) < 0 ? MP3.config.songs.length - 1 : MP3.curSong - 1;
      MP3.setCurrentSong(index);
      MP3.audio.play();
  },

  notificationReceived: function (notification, payload) {
    if(notification === "ALL_MODULES_STARTED")
		  MP3.sendSocketNotification('SOURCE_MUSIC', MP3.config);
  },
  
  socketNotificationReceived: function(notification, payload){
    if(notification === "RETURNED_MUSIC")
      MP3.config.musicData = payload.musicData;
      // set the initial song index 
      MP3.setCurrentSong(0);
      // paint the player
      MP3.updateDom(2);
  },
});