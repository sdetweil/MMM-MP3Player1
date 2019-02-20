/* MagicMIrror Module - MMM-MP3Player
 *
 * This is a 3rd Party Module for the [MagicMirror² By Michael Teeuw http://michaelteeuw.nl]
 * (https://github.com/MichMich/MagicMirror/).
 *
 * A mp3 player -- 
 * can use a url or a local directory (music) 
 *
 * NOT tested with Raspberry Pi.
 * It DOES work with Windows 10!!!
 *
 * version: 1.0.0
 *
 * Module created by @justjim1220 @Seann & @sdetweil
 *
 * Licensed with a crapload of good ole' Southern Sweet Tea
 * and a lot of Cheyenne Extreme Menthol cigars!!!
 */

var MP3;
var substr;
Module.register("MMM-MP3Player", {
  defaults: {
    songs: [],
    musicPath: "modules/MMM-MP3Player/music",
    extensions: ["mp3", "wma", "acc", "ogg"],
    songs: null,
    autoPlay: true,
    random: true,
  },
  audio: null,
  songTitle: null,
  mediaPlayer: null,
  dataAvailable :false,
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
    Log.info("Starting module: " + MP3.name);
  },

  getDom: function(){
    var wrapper = document.createElement("div");
      if(MP3.config.songs!=null) {
        MP3.mediaPlayer = MP3.createElement("div", "mediaPlayer", "mediaPlayer");
        MP3.audio = MP3.createElement("audio", "audioPlayer", "audioPlayer");
        MP3.audio.setAttribute("autoplay","true");
        MP3.audio.addEventListener("load", function() {
          MP3.audio.play(); 
        }, true);
        MP3.audio.addEventListener("loadeddata", () => {
          MP3.dataAvailable = true;
          MP3.curLength = MP3.audio.duration;
        }),
        MP3.audio.addEventListener("ended", () => {
          Log.log(" play ended")
          MP3.audio.currentTime = 0;
          if(MP3.config.autoPlay)
          {
            MP3.loadNext(MP3.config.random)
          }
          else
            MP3.mediaPlayer.classList.toggle("play");
        }),
        MP3.mediaPlayer.appendChild(MP3.audio);
      }

      var controls = MP3.createElement("div", "controls", false);
      MP3.songTitle = MP3.createElement("span", "title", "songTitle");
      MP3.setCurrentSong(MP3.curSong);
      controls.appendChild(MP3.songTitle);

      var discArea = MP3.createElement("div", "discarea", false);
      discArea.appendChild(MP3.createElement("div", "disc", false));
      var stylus = MP3.createElement("div", "stylus", false);
      stylus.appendChild(MP3.createElement("div", "pivot", false));
      stylus.appendChild(MP3.createElement("div", "arm", false));
      stylus.appendChild(MP3.createElement("div", "head", false));
      discArea.appendChild(stylus);
      MP3.mediaPlayer.appendChild(discArea);

      var buttons = MP3.createElement("div", "buttons", false);

      //  Previous Button
      var prev = MP3.createButton("back", "prevButton", "fa fa-backward");
      prev.addEventListener("click", () => {
        MP3.mediaPlayer.classList.toggle("play");
        MP3.dataAvailable = false;
        MP3.loadNext(MP3.config.random);
        MP3.audio.play();
        MP3.play.getElementsByTagName('i')[0].className = "fa fa-pause";
      }, false),
      buttons.appendChild(prev);

      //  Play Button
      MP3.play = MP3.createButton("play", "playButton", "fa fa-play");
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
      buttons.appendChild(MP3.play);

      //  Stop Button
      var stop = MP3.createButton("stop", "stopButton", "fa fa-stop");
      stop.addEventListener("click", () => {
        MP3.mediaPlayer.classList.remove("play");
        MP3.audio.pause();
        MP3.audio.currentTime = 0;
        MP3.play.getElementsByTagName('i')[0].className = "fa fa-play";
        MP3.updateDurationLabel();
      }, false);
      buttons.appendChild(stop);

      //  Next Button
      var next = MP3.createButton("next", "nextButton", "fa fa-forward");
      next.addEventListener("click", () => {
        MP3.mediaPlayer.classList.toggle("play");
        MP3.dataAvailable = false;
        MP3.loadNext(MP3.config.random);
        MP3.play.getElementsByTagName('i')[0].className = "fa fa-play";
      }, false);
      buttons.appendChild(next);

      controls.appendChild(buttons);

      var subControls = MP3.createElement("div", "subControls", false);
      var duration = MP3.createElement("span", "duration", "currentDuration");
      duration.innerHTML = "00:00" + "&nbsp&nbsp&nbsp";
      subControls.appendChild(duration);

      var volumeSlider = MP3.createElement("input", "volumeSlider", "volumeSlider");
      volumeSlider.type = "range";
      volumeSlider.min = "0";
      volumeSlider.max = "1";
      volumeSlider.step = "0.01";
      volumeSlider.addEventListener("input", () => {
          MP3.audio.volume = parseFloat(volumeSlider.value);
      }, false);

      subControls.appendChild(volumeSlider);
      controls.appendChild(subControls);
      MP3.mediaPlayer.appendChild(controls);
      wrapper.appendChild(MP3.mediaPlayer);

      if(MP3.firstTime && MP3.config.autoPlay){
        MP3.firstTime=false;
      }
    return wrapper;
  },

  createElement: function(type, className, id){
    var elem = document.createElement(type);
    if(className) elem.className = className;
    if(id)  elem.id = id;
    return elem;
  },

  createButton: function(className, id, icon){
    var button = document.createElement('button');
    button.className = className;
    button.id = id;
    var ico = document.createElement("i");
    ico.className = icon;
    button.appendChild(ico);
    return button;
  },

  updateDurationLabel: function(){
    var duration = document.getElementById('currentDuration');
     if(MP3.dataAvailable)
         duration.innerText = MP3.parseTime(MP3.audio.currentTime) + " / " + MP3.parseTime(MP3.curLength);
     else
         duration.innerText = MP3.parseTime(MP3.audio.currentTime).substr(0, MP3.config.songs[index].length - 4);
  },

  parseTime: function(time){
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time - minutes * 60)
    const secondsZero = seconds < 10 ? "0" : ""
    const minutesZero = minutes < 10 ? "0" : ""
    return minutesZero + minutes.toString() + ":" + secondsZero + seconds.toString()
  },
  
  setCurrentSong: function(index){
      if(MP3.audio!= undefined){
        MP3.audio.src = MP3.config.musicPath + '/' + MP3.config.songs[index];
        MP3.songTitle.innerHTML = MP3.config.songs[index].substr(0, MP3.config.songs[index].length - 4);
        MP3.curSong = index;
      }
  },
  loadNext: function(next){
   let index=0;
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
      MP3.config.songs = payload.songs;
      // set the initial song index 
      MP3.setCurrentSong(0);
      // paint the player
      MP3.updateDom(2);
  },
});