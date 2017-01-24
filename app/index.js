window.components = {};

// -----------------------------------
// Load game required javascript files
// -----------------------------------

var scriptLoader = new (function () {
	var filesList   = [];
	var filesLoaded = 0;
	var filesQueued = 0;
	var cb          = null;

	this.scriptLoaded = function() {
		filesLoaded++;
		if(filesLoaded == filesQueued) {
			if(filesLoaded == filesList.length) {
				if(typeof cb == 'function') {
					cb();
				}
			} else {
				this.start();
			}
		}
	};

	this.add = function (scriptPath, waitForPrevious) {
		filesList.push({path: scriptPath, wait: waitForPrevious ? true : false});
	};

	this.setCallback = function (callback) {
		cb = callback;
	};

	this.start = function () {
		function addScript(path) {
			// 2 different methods depending if we are on native or not
			var script;
			if(window.ejecta) {
				//document.body.appendChild({src: path, tagName: 'script'});
				script = document.createElement('script');
				script.src = path;
				script.tagName = 'script';
				document.body.appendChild(script);
			} else {
				script = document.createElement('script');
				script.setAttribute('type','text/javascript');
				script.setAttribute('src', path + '?update=' + Math.random());
				document.getElementsByTagName('head')[0].appendChild(script);
			}

			script.onload = function() {
				scriptLoader.scriptLoaded();
				//console.log(path);
			};
		}

		for(var i = filesLoaded; i < filesList.length; i++) {
			if(filesList[i].wait && i > filesLoaded) {
				return;
			}
			filesQueued++;
			addScript(filesList[i].path);
		}
	}
})();

// Load required javascript files

// frontend
scriptLoader.add('frontend/browser-compatibility/index.js', true);
scriptLoader.add('frontend/events/EventEmitter.js', true);
scriptLoader.add('frontend/utils/inherits.js', true);
scriptLoader.add('frontend/utils/timer.js', true);
scriptLoader.add('frontend/navtree/script.js', true);
scriptLoader.add('frontend/UserStorage/script.js', true);

// wuic
scriptLoader.add('frontend/wuic/core/index.js', true);
scriptLoader.add('frontend/wuic/core/Canvas/index.js', true);
scriptLoader.add('frontend/wuic/core/Sprite/index.js', true);
scriptLoader.add('frontend/wuic/core/Tween/index.js', true);
scriptLoader.add('frontend/wuic/components/View/script.js', true);
scriptLoader.add('frontend/wuic/behaviors/button/index.js', true);

// lib
scriptLoader.add('app/lib/audio/audio.js', true);
scriptLoader.add('app/lib/loaders/imageLoader.js', true);
scriptLoader.add('app/lib/loaders/audioLoader.js', true);
scriptLoader.add('app/lib/drawings/index.js', true);
scriptLoader.add('app/lib/fx/index.js', true);
scriptLoader.add('app/lib/fx/fireworks.js', true);
scriptLoader.add('app/lib/utils.js', true);
scriptLoader.add('app/lib/data.js', true);

// autotiles
scriptLoader.add('app/components/autotiles/Autotiles.js', true);
scriptLoader.add('app/components/autotiles/Tileset.js', true);

// components
scriptLoader.add('app/components/Background.js', true)
scriptLoader.add('app/components/Input.js', true);
scriptLoader.add('app/components/Button.js', true);
scriptLoader.add('app/components/Menu.js', true);
scriptLoader.add('app/components/Popup.js', true);
scriptLoader.add('app/components/Label.js', true);
scriptLoader.add('app/components/game/Tile.js', true);
scriptLoader.add('app/components/game/GridOverlay.js', true);
scriptLoader.add('app/components/game/Grid.js', true);
scriptLoader.add('app/components/game/Header.js', true);
scriptLoader.add('app/components/game/Footer.js', true);

//views
scriptLoader.add('app/views/loading/index.js', true);
scriptLoader.add('app/views/options/index.js', true);
scriptLoader.add('app/views/home/index.js', true);
scriptLoader.add('app/views/game/index.js', true);

// app
scriptLoader.add('app/assets.js', true);
scriptLoader.add('app/app.js', true);

// Once all files are loaded, start the app
scriptLoader.setCallback(function () {
	console.log('All scripts loaded.');
	main();
});
scriptLoader.start();
