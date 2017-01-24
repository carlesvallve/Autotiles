(function (window) {

	function Timer() {
		window.EventEmitter.call(this);
		this._loopList = [];
		this._waitList = [];
	}

	window.inherits(Timer, window.EventEmitter);
	window.Timer = Timer;

	Timer.prototype.update = function () {
		this.emit('_update', Date.now());
	};

	Timer.prototype.wait = function (duration, cb) {
		var index = this._waitList.length;
		var startTime = Date.now();
		var that = this;
		this.once('_update', timeCheck);
		function timeCheck(now) {
			if (this._waitList[index]) {
				if ((now - startTime) / 1000 >= duration) {
					return cb();
				} else {
					that.once('_update', timeCheck);
				}
			}
		}
		this._waitList[index] = true;
		return index;
	};

	Timer.prototype.clearWait = function (waitIndex) {
		if (this._waitList[waitIndex]) {
			delete this._waitList[waitIndex];
		}
	};

	Timer.prototype.loop = function (interval, cb) {
		var index = this._loopList.length;
		var startTime = Date.now();
		var that = this;
		this.once('_update', loopCheck);
		function loopCheck(now) {
			if ((now - startTime) / 1000 >= interval) {
				startTime = now;
				cb();
			}
			if (that._loopList[index]) {
				// continue
				that.once('_update', loopCheck);
			}
		}
		this._loopList[index] = true;
		return index;
	};

	Timer.prototype.clearLoop = function (loopIndex) {
		if (this._loopList[loopIndex]) {
			delete this._loopList[loopIndex];
		}
	};

}(window));
