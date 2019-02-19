var NodeHelper = require('node_helper');
const Fs = require('fs');

module.exports = NodeHelper.create({
  start: function() {
    console.log("Loaded MP3Player node_helper");
  },
  socketNotificationReceived: function(notification, payload){
    var self = this;
    if(notification == 'SOURCE_MUSIC'){
      var songs = this.getSongs(payload.musicPath, payload.extensions);
      self.sendSocketNotification("RETURNED_MUSIC", {songs: songs});
    }
  },
  getSongs: function(path, ext){
    var songs = [];
    var contents = Fs.readdirSync(path);
    for(var i = 0; i < contents.length; i++){
      songs.push(contents[i]);
    }
    console.log("mp3 player returning song list="+ songs)
    return songs;
  },
  checkExt: function(file, ext){
    for(var i = 0; i < ext.length; i++)
      if(file.toLowerCase().endsWith(ext[i])) return true;
    return false;
  }
});
