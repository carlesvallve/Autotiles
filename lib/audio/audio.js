var audio = {};

audio.play = function(asset, volume, reload, loop) {
	if(reload) {
		asset.load();
	}
	asset.volume = volume || 1;
	asset.loop = loop || false;
	asset.play();
};

audio.pause = function(asset) {
	asset.pause();
};