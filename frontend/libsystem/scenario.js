(function () {

	function Scenario() {
		this.scenarios = {};
		this.runningName = null;
	}

	window.Scenario = Scenario;

	Scenario.prototype.register = function (name, fns) {
		// fns: { setup: function, run: function, cleanup: function }
		// only run is required

		this.scenarios[name] = fns;
	};


	Scenario.prototype.run = function (name, data, onComplete) { //function given on reg needs to call onComplete
		var scenario = this.scenarios[name];
		if (!scenario) {
			console.error('Scenario not found:', name);
			return;
		}

		if (this.runningName === name) {
			// two in a row of the same name will not work (avoids double tap problems).
			return;
		}

		this.close();

		this.runningName = name;

		if (scenario.setup) {
			scenario.setup();
		}

		window.setTimeout(function () {
			scenario.run(data, function () {
				if (onComplete) {
					onComplete();
				}
			});
		}, 0);
	};

	Scenario.prototype.cancel = function () {
		if (!this.runningName) {
			return;
		}

		var scenario = this.scenarios[this.runningName];
		if (!scenario) {
			console.error('Scenario not found:', this.runningName);
			return;
		}

		this.runningName = null;
	};

	Scenario.prototype.close = function () {
		if (!this.runningName) {
			return;
		}

		var scenario = this.scenarios[this.runningName];
		if (!scenario) {
			console.error('Scenario not found:', this.runningName);
			return;
		}

		this.runningName = null;

		if (scenario.cleanup) {
			scenario.cleanup();
		}
	};
}());