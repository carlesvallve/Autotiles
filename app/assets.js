

window.assets = {};

// --------------------------------------------------------------
// Preloader assets
// --------------------------------------------------------------

function preloadAssets(cb) {

	var pathPrefix = './app/assets/';
	var imgLoader = new window.imgLoaderClass();

	if (typeof cb == 'function') {
		imgLoader.setCallback(cb);
	}

	var assetsList = {
		img: {
			// bitmap fonts
			//vinsdojo:  'font/vinsdojo.png',

			//backgrounds
			bgLoading: 'img/bg/cloud1.jpg'
		}
	};

	var loadGraphics = function(cb) {

		var keys = Object.keys(assetsList.img);

		for (var i = 0, len = keys.length; i < len; i++) {
			assets[keys[i]] = new Image();
			imgLoader.add(assets[keys[i]], pathPrefix + assetsList.img[keys[i]]);//window.getFilePath(assetsList.img[keys[i]]));
		}

		imgLoader.setOnFileLoad(function (loaded, total) {});
		imgLoader.setCallback(function() {
			if (typeof cb == 'function') {
				cb();
			}
		});
		// start img asset loader
		imgLoader.start();
	};
	loadGraphics(cb);
}

// --------------------------------------------------------------
// App assets
// --------------------------------------------------------------

function loadAssets(cb) {

	var pathPrefix = './app/assets/';
	var imgLoader = new window.imgLoaderClass();
	var audioLoader = new window.audioLoaderClass();
	var loadingView = window.navTree.getItem('loading');

	if (typeof cb == 'function') {
		imgLoader.setCallback(cb);
	}

	var assetsList = {

		img: {
			// backgrounds
			bg1:                    'img/bg/cloud1.jpg',
			bg2:                    'img/bg/colors1.jpg',
			bg3:                    'img/bg/space1.jpg',

			// tilesets
			terrain:               'img/tilesets/TerrainVX.png',
			terrainOverlay:        'img/tilesets/TerrainOverlayVX.png',
			wall:                  'img/tilesets/WallVX.png',
			outdoor:                'img/tilesets/OutdoorVX.png',

			// buttons
			/*butBlue:                'img/ui/buttons/but-blue.png',
			butBrown:               'img/ui/buttons/but-brown.png',
			butGreen:               'img/ui/buttons/but-green.png',
			butRed:                 'img/ui/buttons/but-red.png',
			butWhite:               'img/ui/buttons/but-white.png',
			butYellow:              'img/ui/buttons/but-yellow.png',

			// tiles
			tLump:                   'img/tiles/Lump.png',
			tScar:                   'img/tiles/Scar.png',
			tBox:                    'img/tiles/Box.png',
			tCircle:                 'img/tiles/Circular.png',
			tRing:                   'img/tiles/Ring.png',
			tStar:                   'img/tiles/Star.png',
			tPoly:                   'img/tiles/Polygon.png',
			tDiamond:                'img/tiles/Corners.png',
			tGrid:                   'img/tiles/Grid.png',
			tWindows:                'img/tiles/Windows.png',
			tTiler:                  'img/tiles/Tiler.png',
			tRings:                  'img/tiles/Rings.png',
			tDrip:                   'img/tiles/DripDrop.png',
			tMarble:                 'img/tiles/MarbleNoise.png',
			tPlanet:                 'img/tiles/Planet.png',

			// fx
			smallGlow:               'img/fx/small-glow.png'*/

		},

		audio: {
			/*town:               {file: 'audio/music/04_peaceful_town.mp3', preload: false, loop: true },

			rain:               {file: 'audio/ambient/amb_rain_main.mp3', preload: false, loop: true },
			gibons:             {file: 'audio/ambient/amb_gibons.mp3', preload: false, loop: true },

			button1:            {file: 'audio/fx/tiki_button1.mp3', preload: true, loop: false },
			button2:            {file: 'audio/fx/tiki_button1.mp3', preload: true, loop: false },

			arrow1:             {file: 'audio/fx/hit-arrow.mp3', preload: true, loop: false },
			arrow2:             {file: 'audio/fx/hit-arrow-2.mp3', preload: true, loop: false },
			stub:               {file: 'audio/fx/hit-stub.mp3', preload: true, loop: false },
			sword1:             {file: 'audio/fx/hit-sword.mp3', preload: true, loop: false },
			sword2:             {file: 'audio/fx/hit-sword-2.mp3', preload: true, loop: false },
			coins:              {file: 'audio/fx/coins.mp3', preload: true, loop: false },
			unlock:             {file: 'audio/fx/door-unlock.mp3', preload: true, loop: false },
			heal:               {file: 'audio/fx/magic-heal.mp3', preload: true, loop: false },
			door:               {file: 'audio/fx/door-open.mp3', preload: true, loop: false },
			levelup:            {file: 'audio/fx/levelup.mp3', preload: true, loop: false },
			water:              {file: 'audio/fx/magic-water.mp3', preload: true, loop: false },

			bongo1:             {file: 'audio/fx/bongo_acute1.mp3', preload: true, loop: false },
			bongo2:             {file: 'audio/fx/bongo_acute2.mp3', preload: true, loop: false },
			bongo3:             {file: 'audio/fx/bongo_acute3.mp3', preload: true, loop: false },
			bongo4:             {file: 'audio/fx/bongo_acute4.mp3', preload: true, loop: false },
			bongo5:             {file: 'audio/fx/bongo_acute5.mp3', preload: true, loop: false },
			bongo6:             {file: 'audio/fx/bongo_acute6.mp3', preload: true, loop: false }*/
		}

	};

	var loadGraphics = function(cb) {


		var keys = Object.keys(assetsList.img);

		for (var i = 0, len = keys.length; i < len; i++) {
			assets[keys[i]] = new Image();
			imgLoader.add(assets[keys[i]], pathPrefix + assetsList.img[keys[i]]); //window.getFilePath(assetsList.img[keys[i]]));
		}

		imgLoader.setOnFileLoad(function (loaded, total) {
			loadingView.update({ type: 'Image', loaded: loaded, total: total });
		});

		imgLoader.setCallback(function() {
			if (typeof cb == 'function') {
				cb();
			}
		});
		// start img asset loader
		imgLoader.start();
	};

	// audio assets loader
	var loadAudio = function(cb) {
		var keys = Object.keys(assetsList.audio);
		var i;

		for (i = 0; i < keys.length; i++) {
			assets[keys[i]] = document.createElement('audio');
			assets[keys[i]].preload = assetsList.audio[keys[i]].preload;
			assets[keys[i]].loop = false;
			document.body.appendChild(assets[keys[i]]);
			audioLoader.add(assets[keys[i]], pathPrefix + assetsList.audio[keys[i]].file); //window.getFilePath(assetsList.audio[keys[i]].file));
		}

		audioLoader.setOnFileLoad(function (loaded, total) {
			loadingView.update({ type: 'Audio', loaded: loaded, total: total });
		});

		audioLoader.setCallback(function() {
			if (typeof cb == 'function') {
				cb();
			}
		});
		audioLoader.start();
	};

	// Load audio, then load images
	/*loadAudio(function(){
		loadGraphics(cb);
	});*/
	loadGraphics(cb);

}