# MMM-MP3Player
a neat MP3 player with a unique look.
this is a 3<sup>rd</sup>party module for the MagicMirror<sup>2</sup>

Still needing to do:<br>
    3) shuffle list option, click shuffle button would auto-play. include stylus animation.<br>
    4) title to scroll during play.<br>
    

## Screenshots

![ScreenShot](https://github.com/justjim1220/MMM-MP3Player/blob/master/Screenshot%20(45).png)

![ScreenShot](https://github.com/justjim1220/MMM-MP3Player/blob/master/Screenshot%20(48).png)

## Installation:

cd ~/MagicMirror/modules
git clone https://github.com/justjim1220/MMM-MP3Player.git
cd MMM-MP3Player
npm install

## Usage:

{  
   disabled: false,
   module: "MMM-MP3Player",
   position: "top_right",
   config: {
     autoplay: true,
     randomOrder: true,
   }    
},

## Instructions:

you provide your own music, they must be mp3, wma, ogg, acc type files.
Place your music files in the music directory.
then just click the play arrow on the player.
Enjoy!

## Contributors:

@Seann, pretty decent teacher! 👌
@sdetweil, really good teacher, this guy knows his shit! Like a blood hound, he can find errors like no other! 😁
