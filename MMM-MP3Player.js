/* MagicMIrror Module - MMM-MP3Player
 *
 * This is a 3rd Party Module for the [MagicMirror² By Michael Teeuw http://michaelteeuw.nl]
 * (https://github.com/MichMich/MagicMirror/).
 *
 * A mp3 player -- 
 * can use a url or a local directory (music) 
 *
 * NOT tested with Raspberry Pi or Linux-Based systems.
 * It DOES work with Windows 10!!!
 *
 * version: 1.0.0
 *
 * Module created by justjim1220 aka Jim Hallock (justjim1220@gmail.com)
 *
 * Licensed with a crapload of good ole' Southern Sweet Tea
 * and a lot of Cheyenne Extreme Menthol cigars!!!
 */

Module.register("MMM-MP3Player", {

	defaults: {
        useURL: false,
        
        songsArray: [  // Used if wanting to link your music via URL
            { 
                title: "LA Chill Tour",
                songURL: "https://d34x6xks9kc6p2.cloudfront.net/540997b0-a35f-4b69-86d6-b1c925c4a264/540997b0-a35f-4b69-86d6-b1c925c4a264.mp3"
            },
            { 
                title: "This is it band",
                songURL: "https://d34x6xks9kc6p2.cloudfront.net/8bd0ca4f-1b57-47e9-8878-516d14196d86/8bd0ca4f-1b57-47e9-8878-516d14196d86.mp3"
            },
            { 
                title: "LA Fusion Jam",
                songURL: "https://d34x6xks9kc6p2.cloudfront.net/0024ada8-e1c3-4d75-a2df-d19ea5eb6c79/0024ada8-e1c3-4d75-a2df-d19ea5eb6c79.mp3"
            },
        ]
	},

	requiresVersion: "2.1.0",

	getStyles: function() {
		return ["MMM-MP3Player.css", "font-awesome.css"];
	},

	start: function() {
    KitchenTimer = this;
		Log.info("Starting module: " + this.name);
		KTclock = 0;

	},

    getDom: function() {

        var wrapper = document.createElement("div");

            var mediaPlayer = document.createElement("div");
            mediaPlayer.className = "mediaPlayer";
            mediaPlayer.id = "mediaPlayer";

            // ???? --> needs work here
                var audioPlayer = document.createElement("audio");
                audioPlayer.src = "MMM-MP3Player-player";
                audioPlayer.id = "audioPlayer";

                audioPlayer.addEventListener("loadeddata", () => {
                    dataAvailable = true;
                    currentLength = audioPlayer.duration;
                }),
    
                audioPlayer.addEventListener("ended", () => {
                     myAudio.currentTime = 0;
                }),

                mediaPlayer.appendChild(audioPlayer);

            var discArea = document.createElement("div");
            discArea.className = "discArea";
            var disc = document.createElement("div");
            disc.className = "disc";
            discArea.appendChild(disc);

            var stylus = document.createElement("div");
            stylus.className = "stylus";

            var pivot = document.createElement("div");
            pivot.className = "pivot";
            stylus.appendChild(pivot);

            var arm = document.createElement("div");
            arm.className = "arm";
            stylus.appendChild(arm);

            var head = document.createElement("div");
            head.className = "head";
            stylus.appendChild(head);
            
            discArea.appendChild(stylus);
            
            mediaPlayer.appendChild(discArea);

            var controls = document.createElement("div");
            controls.className = "controls";

            var title = document.createElement("span");
            title.className = "title";
            title.id = "songTitleLabel";
            title.innerHTML = this.currentSongTitle;
            controls.appendChild(title);

            var buttons = document.createElement("div");
            buttons.className = "buttons";

            var backItem = document.createElement("button");
            backItem.className = "back";
            var rewind = document.createElement("i");
            rewind.className = "fa fa-backward";
            backItem.addEventListener("click", () => {
                dataAvailable = false;
                loadNext(false);
            }, false),
            backItem.appendChild(rewind);

            // ???? --> Needs work here
                var playState = document.createElement("button");
                playState.className = "playState";

                var playButton = document.createElement("i");
                playButton.className = "fa fa-play";
                var pause = document.createElement("i");
                pause.className = "fa fa-pause";
                playButton.addEventListener("click", () => {
                    playerArea.classList.toggle("play");
                    if (audioPlayer.paused) {
                        setTimeout(()=> {audioPlayer.play()}, 300);
                        timer = setInterval(updateDurationLabel, 100);
                    } else {
                        audioPlayer.pause();
                        clearInterval(timer);
                    }
                }, false),
                playState.appendChild(playButton);
                playState.appendChild(pause);
                        
            var stopItem = document.createElement("button");
            stopItem.className = "stopItem";
            var stop = document.createElement("i");
            stop.className = "fa fa-stop";
            stopItem.addEventListener("click", () => {
                playerArea.classList.remove("play");
                audioPlayer.pause();
                audioPlayer.currentTime = 0;
                updateDurationLabel();
            }, false),
            stopItem.appendChild(stop);

            var nextItem = document.createElement("button");
            nextItem.className = "nextItem";
            var next = document.createElement("i");
            next.className = "fa fa-forward";    
            nextItem.addEventListener("click", () => {
                dataAvailable = false;
                loadNext(true);
            }, false),
            nextItem.appendChild(next);

            buttons.appendChild(backItem);
            buttons.appendChild(playState);
            buttons.appendChild(stopItem);
            buttons.appendChild(nextItem);
            
            controls.appendChild(buttons);

            var subControls = document.createElement("div");
            subControls.className = "subControls";

            var duration = document.createElement("span");
            duration.className = "duration";
            duration.id = "currentDuration";
            duration.innerHTML = "00:00";
            subControls.appendChild(duration);

            var volumeSlider = document.createElement("input");
            volumeSlider.className = "volumeSlider";
            volumeSlider.addEventListener("input", () => {
                audioPlayer.volume = parseFloat(volumeSlider.value);
            }, false);
            volumeSlider.type = "range";
            volumeSlider.id = "volumeSlider";
            volumeSlider.min = "0";
            volumeSlider.max = "1";
            volumeSlider.step = "0.01";
            subControls.appendChild(volumeSlider);
                        
            controls.appendChild(subControls);

            mediaPlayer.appendChild(controls);

            mediaPlayerWrapper.appendChild(mediaPlayer);

        wrapper.appendChild(mediaPlayerWrapper);

        return wrapper;
    },

    const: playerArea = document.getElementById("mediaPlayer"),
    const: playButton = document.getElementById("playState"),
    const: stopButton = document.getElementById("stopItem"),
    const: nextButton = document.getElementById("nextItem"),
    const: prevButton = document.getElementById("backItem"),
    const: durationLabel = document.getElementById("currentDuration"),
    const: songTitleLabel = document.getElementById("songTitleLabel"),
    const: audioPlayer = document.getElementById("audioPlayer"),
    const: volumeSlider = document.getElementById("volumeSlider"),
    let: currentIndex = 0,
    let: dataAvailable = false,
    let: currentLength = 0,
    let: timer = null,
    
    timer : setInterval(this.updateDurationLabel, 100),
    
    parseTime:function(time) {
        const minutes = Math.floor(time / 60)
        const seconds = Math.floor(time - minutes * 60)
        const secondsZero = seconds < 10 ? "0" : ""
        const minutesZero = minutes < 10 ? "0" : ""
        return minutesZero + minutes.toString() + ":" + secondsZero + seconds.toString()
    },
        // ???? --> needs work here
    getMusic:    function () {
            if(!this.config.useURL) {
                music.src = "modules/MMM-MP3Player/music/"
            } else {
                music.src = this.config.songsArray;
            }
        },
    
    loadNext: function (next) {
        audioPlayer.pause();
        if (next) {
            currentIndex = (currentIndex + 1) % songs.length;
        } else {
            currentIndex = (currentIndex - 1) < 0 ? songs.length - 1 : currentIndex - 1;
        };
        audioPlayer.src = songs[currentIndex].songURL;
        songTitleLabel.innerHTML = songs[currentIndex].title;
        audioPlayer.play();
    },
    
     updateDurationLabel: function() {
        if (dataAvailable) {
            durationLabel.innerText = parseTime(audioPlayer.currentTime) + " / " + parseTime(currentLength);
        } else {
            durationLabel.innerText = parseTime(audioPlayer.currentTime);
        }
    },

});