(function (window) {

	// create a namespace for phonegap plugin wrappers

	if (!window.pg) {
		window.pg = {};
	}

	var document = window.document;
	var cordova = window.cordova || null;
	var navSplash = window.navigator.splashscreen || null;


	// create and register the wrapper object

	var wrapper = {};

	window.pg.splashScreen = wrapper;


	var div;

	wrapper.show = function () {
		if (cordova) {
			cordova.exec(null, null, 'SplashScreen', 'show', []);
		} else if (navSplash) {
			navSplash.show();
		} else {
			div = document.createElement('div');
			div.style.position = 'absolute';
			div.style.zIndex = 9000;
			div.style.width = '100%';
			div.style.height = '100%';
			div.style.left = '0';
			div.style.top = '0';
			div.style.textAlign = 'center';
			div.style['-webkit-box-sizing'] = 'border-box';
			div.style.paddingTop = '50%';
			div.style.fontFamily = 'Helvetica';
			div.style.background = '#888';
			div.innerText = 'SPLASH SCREEN';
			document.documentElement.appendChild(div);
		}
	};


	wrapper.hide = function () {
		if (cordova) {
			cordova.exec(null, null, 'SplashScreen', 'hide', []);
		} else if (navSplash) {
			navSplash.hide();
		} else if (div) {
			div.parentElement.removeChild(div);
			div = null;
		}
	};

	if (!cordova && !navSplash) {
		// on start, the splash is automatically visible

		wrapper.show();
	}


	wrapper.showOnPause = function () {
		if (window.wizUtils) {
			window.wizUtils.setSplashInBackground(true);
		} else {
			window.pg.onpause(function () {
				wrapper.show();
			});
		}
	};


	wrapper.hideOnResume = function () {
		window.pg.onresume(function () {
			wrapper.hide();
		});
	};

}(window));
