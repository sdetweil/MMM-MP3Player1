var NodeHelper = require('node_helper');
const Fs = require('fs');

module.exports = NodeHelper.create({
    start: function() {
        console.log("Loaded MP3Player node_helper");
    },

    socketNotificationReceived: function(notification, payload) {
        var self = this;
        if (notification === 'SOURCE_MUSIC') {
            const musicPath = payload.musicPath;
            const extensions = payload.extensions;

            Fs.readdir(musicPath, (err, folders) => {
                if (err) {
                    console.error("Error reading music directory:", err);
                    self.sendSocketNotification('ERROR', {message: "Error reading music directory"});
                } else {
                    const musicData = folders.map(folder => ({
                        folderName: folder,
                        songs: Fs.readdirSync(`${musicPath}/${folder}`).filter(file => self.checkExt(file, extensions))
                    }));
                    self.sendSocketNotification("RETURNED_MUSIC", { musicData: musicData }); 
                }
            });
        }
    },

    checkExt: function(file, ext) {
        return ext.some(extension => file.toLowerCase().endsWith(extension)); 
    }
});