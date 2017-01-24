(function (window) {

	var plugin = window.localNotification;

	// create a namespace for phonegap plugin wrappers

	if (!window.pg) {
		window.pg = {};
	}


	// create and register the wrapper object

	var wrapper = {};

	window.pg.localNotification = wrapper;


	var lastId = Date.now();

	function generateId() {
		return ++lastId;
	}


	// notification tracker

	var notifications = {};


	// mute logic

	var muters = {};

	wrapper.mute = function (name, matcher) {
		// never set notifications with an ID matching the given matcher regexp

		muters[name] = matcher;

		for (var id in notifications) {
			if (matcher.test(id)) {
				notifications[id].muted = true;
				wrapper.cancel(id);
			}
		}
	};

	wrapper.unmute = function (name) {
		var matcher = muters[name];

		if (!matcher) {
			return;
		}

		delete muters[name];

		for (var id in notifications) {
			if (matcher.test(id)) {
				notifications[id].muted = false;
				wrapper.set(id, notifications[id].options);
			}
		}
	};


	function isMuted(id) {
		for (var name in muters) {
			var matcher = muters[name];

			if (matcher.test(id)) {
				return true;
			}
		}

		return false;
	}


	// set and queue notifications

	function normalizeTime(options) {
		if (options.timestamp) {
			options.seconds = options.timestamp - parseInt(Date.now() / 1000, 10);
		}
	}


	wrapper.set = function (id, options) {
		if (id === null) {
			id = generateId();
		}

		normalizeTime(options);

		if (notifications[id]) {
			window.clearTimeout(notifications[id].timer);
		} else {
			notifications[id] = {};
		}

		notifications[id].timer = window.setTimeout(function() {
			if (!plugin) {
				if (!notifications[id].muted) {
					console.info('localNotification.fired', id, options);
				} else {
					console.info('localNotification.fired ignored', id, options);
				}
			}
			delete notifications[id];
		}, options.seconds * 1000);

		notifications[id].options = options;

		if (isMuted(id)) {
			console.info('localNotification.set ignored', id, options);
			notifications[id].muted = true;
			return;
		}

		if (plugin) {
			plugin.add(id, options);
		} else {
			console.info('localNotification.set', id, options);
		}

		return id;
	};


	wrapper.queue = function (id, options) {
		if (id === null) {
			id = generateId();
		} else if (isMuted(id)) {
			console.info('localNotification.queue ignored', id, options);
			return;
		}

		normalizeTime(options);

		if (plugin) {
			plugin.queue(id, options);
		} else {
			console.info('localNotification.queue', id, options);
		}

		return id;
	};


	wrapper.cancel = function (id) {
		if (plugin) {
			plugin.cancel(id);
		} else if (notifications[id]) {
			if (notifications[id].muted) {
				console.info('localNotification.muted', id);
			} else {
				console.info('localNotification.cancel', id);
				window.clearTimeout(notifications[id].timer);
				delete notifications[id];
			}
		}
	};


	wrapper.cancelAll = function () {
		if (plugin) {
			plugin.cancelAll();
		} else {
			console.info('localNotification.cancelAll');
		}

		for (var id in notifications) {
			window.clearTimeout(notifications[id].timer);
			delete notifications[id];
		}
	};

}(window));

