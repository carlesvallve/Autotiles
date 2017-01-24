(function (window) {

	// create a namespace for phonegap plugin wrappers

	var core = window.pg;

	if (!core) {
		core = window.pg = {};
	}

	var document = window.document;


	// event handler helper

	function runAll(handlers, args) {
		for (var i = 0, len = handlers.length; i < len; i++) {
			if (args) {
				handlers[i].apply(null, args);
			} else {
				handlers[i]();
			}
		}
	}


	// core.restart(), restarts the application

	var restartHandlers = [];

	core.restart = function () {
		runAll(restartHandlers);
		restartHandlers = [];

		window.setTimeout(function () {
			if (window.wizUtils) {
				window.wizUtils.restart();
			} else {
				console.info('Restart triggered');
				window.alert('Restart triggered');
			}
		}, 1000);
	};

	core.onrestart = function (fn) {
		restartHandlers.push(fn);
	};


	// core.onready(fn), for registering device ready handlers

	var readyHandlers = [];

	function ready() {
		runAll(readyHandlers);
		readyHandlers = [];
	}

	core.onready = function (fn) {
		readyHandlers.push(fn);
	};

	if (window.cordova) {
		window.document.addEventListener('deviceready', ready, false);
	} else {
		window.setTimeout(ready, 0);
	};

	// core.onpause(fn) and core.onresume(fn), for background/resume management

	var backgroundSince, pauseHandlers = [], resumeHandlers = [];

	function pause() {
		backgroundSince = Date.now() / 1000;

		runAll(pauseHandlers);
	}

	function resume() {
		if (backgroundSince) {
			runAll(resumeHandlers, [Date.now() / 1000 - backgroundSince]);
		} else {
			runAll(resumeHandlers);
		}
	}

	if (window.cordova) {
		document.addEventListener('pause', pause, false);
		document.addEventListener('resume', resume, false);
	}


	core.onpause = function (fn) {
		pauseHandlers.push(fn);
	};

	core.onresume = function (fn) {
		resumeHandlers.push(fn);
	};


	// core.simulatePause() and core.simulateResume(), for testing purposes

	core.simulatePause = pause;
	core.simulateResume = resume;

}(window));
