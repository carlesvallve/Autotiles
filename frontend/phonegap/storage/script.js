(function (window) {

	// create a namespace for phonegap plugin wrappers

	if (!window.pg) {
		window.pg = {};
	}


	// create the wrapper class

	function StorageWrapper(engineName) {
		this.engineName = engineName;
		this.engine = null;
	}


	StorageWrapper.prototype.getEngine = function () {
		// this way we make sure that even if this file is included before onready,
		// window.localStorage is only accessed after onready.

		if (this.engine) {
			return this.engine;
		}

		this.engine = window[this.engineName];
		return this.engine;
	};


	StorageWrapper.prototype.get = function (key, alt) {
		var engine = this.getEngine();

		if (!engine) {
			return alt;
		}

		var value = engine.getItem(key);

		if (typeof value !== 'string') {
			return alt;
		}

		try {
			return JSON.parse(value);
		} catch (e) {
			console.warn(e);
			return alt;
		}
	};


	StorageWrapper.prototype.set = function (key, value) {
		var engine = this.getEngine();

		if (!engine) {
			console.warn('No', this.engineName, 'available. Unable to set:', key);
			return;
		}

		try {
			engine.setItem(key, JSON.stringify(value));
		} catch (e) {
			console.warn(e);
		}
	};


	StorageWrapper.prototype.del = function (key) {
		var engine = this.getEngine();
		if (engine) {
			engine.removeItem(key);
		}
	};


	StorageWrapper.prototype.clear = function () {
		var engine = this.getEngine();
		if (engine) {
			engine.clear();
		}
	};


	// instantiate storage engines

	window.pg.localStorage = new StorageWrapper('localStorage');
	window.pg.sessionStorage = new StorageWrapper('sessionStorage');

}(window));

