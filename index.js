var components = {};

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


// Load game required javascript files

// frontend
scriptLoader.add('frontend/events/EventEmitter.js', true);
scriptLoader.add('frontend/wuic/core/index.js', true);
scriptLoader.add('frontend/wuic/core/Canvas/index.js', true);
scriptLoader.add('frontend/wuic/core/Sprite/index.js', true);
scriptLoader.add('frontend/wuic/behaviors/core/index.js', true);
scriptLoader.add('frontend/wuic/behaviors/Button/index.js', true);
scriptLoader.add('frontend/wuic/components/core/index.js', true);
scriptLoader.add('frontend/wuic/drawings/index.js', true);

// lib
scriptLoader.add('lib/utils.js', true);
scriptLoader.add('lib/tweener.js', true);
scriptLoader.add('lib/fx/index.js', true);
scriptLoader.add('lib/fx/fireworks.js', true);
scriptLoader.add('lib/loaders/imageLoader.js', true);
scriptLoader.add('lib/loaders/audioLoader.js', true);
scriptLoader.add('lib/navTree/navTree.js', true);
scriptLoader.add('lib/navTree/view.js', true);

// audio
//scriptLoader.add('lib/audio/audioComponent.js', true);
scriptLoader.add('lib/audio/audio.js', true);

// components
//scriptLoader.add('components/Particle.js', true);
//scriptLoader.add('components/Explosion.js', true);
scriptLoader.add('components/Background.js', true);
scriptLoader.add('components/Button.js', true);
scriptLoader.add('components/Label.js', true);
scriptLoader.add('components/Toolbar.js', true);
scriptLoader.add('components/Autotiles.js', true);
scriptLoader.add('components/Tileset.js', true);
scriptLoader.add('components/Tile.js', true);
scriptLoader.add('components/Grid.js', true);
scriptLoader.add('components/Header.js', true);
scriptLoader.add('components/Footer.js', true);

//views
scriptLoader.add('views/home/index.js', true);
scriptLoader.add('views/game/index.js', true);

// app
scriptLoader.add('loader.js', true);
scriptLoader.add('app.js', true);

// Once all files are loaded, start the app
scriptLoader.setCallback(function () {
	main();
});
scriptLoader.start();
