var MP3, timer;
var curSong = curLength = 0;
var dataAvailable = false;

Module.register("MMM-MP3Player", {
  defaults: {
    songs: [],
    musicPath: "modules/MMM-MP3Player/music",
    extensions: ["mp3", "wma", "acc", "ogg"]
  },
  getStyles: function(){
    return ["MMM-MP3Player.css", "font-awesome.css"];
  },
  start: function(){
    MP3 = this;
    Log.info("Starting module: " + MP3.name);
  },
  getDom: function(){
    var wrapper = document.createElement("div");
    var mediaPlayer = MP3.createElem("div", "mediaPlayer", "mediaPlayer");
    var audio = MP3.createElem("audio", "audioPlayer", "audioPlayer");
    audio.load("src", "music/Chris Isaak - Wicked Game.mp3");
    audio.addEventListener("load", function() { 
      audio.play(); 
    }, true);
    audio.addEventListener("loadeddata", () => {
        dataAvailable = true;
        curLength = audio.duration;
    }),
    audio.addEventListener("ended", () => {
         audio.currentTime = 0;
    }),


    mediaPlayer.appendChild(audio);
    var discArea = MP3.createElem("div", "discArea", false);
    discArea.appendChild(MP3.createElem("div", "disc", false));
    var stylus = MP3.createElem("div", "stylus", false);
    stylus.appendChild(MP3.createElem("div", "pivot", false));
    stylus.appendChild(MP3.createElem("div", "arm", false));
    stylus.appendChild(MP3.createElem("div", "head", false));
    discArea.appendChild(stylus);
    mediaPlayer.appendChild(discArea);

    var controls = MP3.createElem("div", "controls", false);
    controls.appendChild(MP3.createElem("span", "title", "songTitleLabel"));
    controls.title.innerHTML = this.currentSongTitle;

    var buttons = MP3.createElem("div", "buttons", false);

    //  Previous Button
    var prev = MP3.createButton("back", "prevButton", "fa fa-backward");
    prev.addEventListener("click", () => {
        dataAvailable = false;
        MP3.loadNext(false);
    }, false),
    buttons.appendChild(prev);

    //  Play Button
    var play = MP3.createButton("play", "playButton", "fa fa-play");
    play.addEventListener("click", () => {
        mediaPlayer.classList.toggle("play");
        if (audio.paused) {
            setTimeout(() => {
                audio.play();
            }, 300);
            timer = setInterval(MP3.updateDurationLabel, 100);
            play.getElementsByTagName('i')[0].className = "fa fa-pause";
        } else {
            audio.pause();
            clearInterval(timer);
            play.getElementsByTagName('i')[0].className = "fa fa-play";
        }
    }, false);
    buttons.appendChild(play);

    //  Stop Button
    var stop = MP3.createButton("stop", "stopButton", "fa fa-stop");
    stop.addEventListener("click", () => {
        mediaPlayer.classList.remove("play");
        audio.pause();
        audio.currentTime = 0;
        MP3.updateDurationLabel();
    }, false);
    buttons.appendChild(stop);

    //  Next Button
    var next = MP3.createButton("next", "nextButton", "fa fa-forward");
    next.addEventListener("click", () => {
        dataAvailable = false;
        MP3.loadNext(true);
    }, false);
    buttons.appendChild(next);

    controls.appendChild(buttons);

    var subControls = MP3.createElem("div", "subControls", false);
    var duration = MP3.createElem("span", "duration", "currentDuration");
    duration.innerHTML = "00:00";
    subControls.appendChild(duration);

    var volumeSlider = MP3.createElem("input", "volumeSlider", "volumeSlider");
    volumeSlider.type = "range";
    volumeSlider.min = "0";
    volumeSlider.max = "1";
    volumeSlider.step = "0.01";
    volumeSlider.addEventListener("input", () => {
        audio.volume = parseFloat(volumeSlider.value);
    }, false);

    subControls.appendChild(volumeSlider);
    controls.appendChild(subControls);
    mediaPlayer.appendChild(controls);
    wrapper.appendChild(mediaPlayer);

    return wrapper;
  },

  createElem: function(type, className, id){
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
    var audio = document.getElementById('audioPlayer');
    var duration = document.getElementById('currentDuration');
     if(dataAvailable)
         duration.innerText = MP3.parseTime(audio.currentTime) + " / " + MP3.parseTime(curLength);
     else
         duration.innerText = MP3.parseTime(audio.currentTime);
  },

  parseTime: function(time){
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time - minutes * 60)
    const secondsZero = seconds < 10 ? "0" : ""
    const minutesZero = minutes < 10 ? "0" : ""
    return minutesZero + minutes.toString() + ":" + secondsZero + seconds.toString()
  },

  loadNext: function(next){
    var audio = document.getElementById('audioPlayer');
    var title = document.getElementById('songTitleLabel');
      audio.pause();
      if(next)  curSong = (curSong + 1) % MP3.config.songs.length;
      else      curSong = (curSong - 1) < 0 ? MP3.config.songs.length - 1 : curSong - 1;
      audio.src = MP3.config.musicPath + '/' + MP3.config.songs[curSong];
      title.innerHTML = MP3.config.songs[curSong].substr(0, MP3.config.songs[curSong].length - 4);
      audio.play();
  },

  notificationReceived: function (notification, payload) {
    if(notification === "ALL_MODULES_STARTED")
		  MP3.sendSocketNotification('SOURCE_MUSIC', MP3.config);
  },
  
  socketNotificationReceived: function(notification, payload){
    if(notification === "RETURNED_MUSIC")
      MP3.config.songs = payload.songs;
  },
});