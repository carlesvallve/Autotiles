var audio = {};
var globalVolume = 1.0;

audio.play = function(asset, volume, reload, loop) {
	if(reload) {
		asset.load();
	}
	asset.volume = volume * globalVolume || globalVolume;
	asset.loop = loop || false;
	asset.play();
};

audio.pause = function(asset) {
	asset.pause();
};