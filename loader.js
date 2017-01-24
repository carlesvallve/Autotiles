var assets;

function loadAssets(cb) {

	// --------------------------------------------------------------
	// Register Assets
	// --------------------------------------------------------------

	var pathPrefix = '';
	if (!window.wizViewManager) {
		pathPrefix = './assets/';
	}

	assets = {};

	var assetsList = {

		img: {
			// backgrounds
			bg1:                    'img/bg/cloud1.jpg',
			bg2:                    'img/bg/colors1.jpg',

			// tilesets
			terrain:               'img/tilesets/TerrainVX.png',
			terrainOverlay:        'img/tilesets/TerrainOverlayVX.png',
			wall:                  'img/tilesets/WallVX.png',
			outdoor:                'img/tilesets/OutdoorVX.png'
		},

		audio: {
			button1:            {file: 'assets/audio/tiki_button1.mp3', preload: true, loop: false }
		}
	};

	// --------------------------------------------------------------
	// Load image files
	// --------------------------------------------------------------

	var loadGraphics = function(cb) {
		console.log('load graphics');
		var keys = Object.keys(assetsList.img);

		for (var i = 0, len = keys.length; i < len; i++) {
			assets[keys[i]] = new Image();
			imgLoader.add(assets[keys[i]], pathPrefix + assetsList.img[keys[i]]); //window.getFilePath(assetsList.img[keys[i]]));
		}

		imgLoader.setOnFileLoad(function (loaded, total) {
			if (window.cordova) {
				window.cordova.sendMsg({ message: 'loadingUpdate', value: 'assets (' + loaded + '/' + total + ')' });
			}
			//console.log('image assets (' + loaded + '/' + total + ')');
		});

		if (typeof cb == 'function') {
			imgLoader.setCallback(cb);
		}

		// start img asset loader
		imgLoader.start();
	}

	// --------------------------------------------------------------
	// Load audio files
	// --------------------------------------------------------------

	var loadAudio = function(cb) {
		console.log('load audio');
		var keys = Object.keys(assetsList.audio);
		var i;
		for (i = 0; i < keys.length; i++) {
			assets[keys[i]] = document.createElement('audio');
			assets[keys[i]].preload = assetsList.audio[keys[i]].preload;
			assets[keys[i]].loop = assetsList.audio[keys[i]].loop;
			document.body.appendChild(assets[keys[i]]);
			audioLoader.add(assets[keys[i]],  assetsList.audio[keys[i]].file); //window.getFilePath(assetsList.audio[keys[i]].file));
		}
		audioLoader.setOnFileLoad(function (loaded, total) {
			if (window.cordova) {
				window.cordova.sendMsg({ message: 'loadingUpdate', type: 'audio', loaded: loaded, total: total });
			}
			//console.log('audio assets (' + loaded + '/' + total + ')');
		});
		audioLoader.setCallback(function() {
			if (typeof cb == 'function') {
				cb();
			}
		});

		audioLoader.start();
	}

	// --------------------------------------------------------------
	// Start Loading
	// --------------------------------------------------------------

	loadAudio(function(){
		loadGraphics(cb);
	});

}