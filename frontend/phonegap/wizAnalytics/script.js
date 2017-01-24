(function (window) {

	// create a namespace for phonegap plugin wrappers

	var pg = window.pg;

	if (!pg) {
		pg = window.pg = {};
	}

	var wizAnalytics = window.wizAnalytics;


	// create and register the wrapper object

	var wrapper = pg.wizAnalytics = {
		config: {
			kontagent: {
				eventDelimiter: '.'
			}
		}
	};


	var debugMode = false;


	wrapper.__defineSetter__("debugMode", function (status) {
		debugMode = !!status;
	});

	wrapper.__defineGetter__("debugMode", function () {
		return debugMode;
	});


	// logs events

	wrapper.log = function (evtName, data) {
		if (wizAnalytics) {
			wizAnalytics.event.log(evtName, data || {});
		} else if (debugMode) {
			console.log('[wizAnalytics]', evtName, data);
		}
	};


	// logs screens navigation

	wrapper.screen = function (screenName, options) {
		if (wizAnalytics && wizAnalytics.screen) {
			wizAnalytics.screen.log(screenName, options || {});
		} else if (debugMode) {
			console.log('[wizAnalytics] Screen ', screenName, options);
		}
	};


	// analyzer: kontagent

	wrapper.kontagent = function (st, evtName, v, l) {
		// st (array or string): describes the event name, eg: ['Mission', 'Progress'] or "Mission.Progress"
		// v (int):
		// l (int):

		if (typeof st === 'string') {
			st = st.split(wrapper.config.kontagent.eventDelimiter);
		}

		var data = {};

		if (typeof v !== 'undefined') {
			data.v = v;
		}

		if (typeof l !== 'undefined') {
			data.l = l;
		}

		var stLen = st.length;

		if (stLen > 0) {
			data.st1 = st[0];
		}

		if (stLen > 1) {
			data.st2 = st[1];
		}

		if (stLen > 2) {
			data.st3 = st[2];
		}

		wrapper.log(evtName, { kontagent: data });
	};

}(window));
