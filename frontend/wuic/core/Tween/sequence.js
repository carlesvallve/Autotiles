(function (window) {

	function TweenSequence(tweens) {
		EventEmitter.call(this);
		this._finished = true;
		this._tweens = tweens;
		this._tweenLen = tweens.length;
		this._current = null;
		this._seq = [];
		this.repeat = 0;
		this._repeat = 0;
	}

	window.wuic.core.inherits(TweenSequence, EventEmitter);
	window.wuic.core.TweenSequence = TweenSequence;

	TweenSequence.prototype.setRepeat = function (repeat) {
		this.repeat = repeat;
		this._repeat = this.repeat;
	};

	TweenSequence.prototype.start = function () {
		if (!this._finished) {
			return;
		}
		this._finished = false;
		// stop any previously running tween
		if (this._current) {
			this._current.stop();
		}
		// reset sequence list
		this._seq = this._tweens.slice();
		// reset repeat
		this._repeat = this.repeat;
		// start sequence
		this._start();
		this.emit('start');
	};

	TweenSequence.prototype.reverse = function () {
		if (!this._finished) {
			return;
		}
		this._finished = false;
		// stop any previously running tween
		if (this._current) {
			this._current.stop();
		}
		// reset sequence list
		this._seq = this._tweens.slice();
		// reset repeat
		this._repeat = this.repeat;
		// start sequence in reverse order
		this._reverse();
		this.emit('reverse');
	};

	TweenSequence.prototype.pause = function () {
		if (this._finished) {
			return;
		}
		if (this._current) {
			this._current.pause();
		}
	};

	TweenSequence.prototype.resume = function () {
		if (this._finished) {
			return;
		}
		if (this._current) {
			this._current.resume();
		}
	};

	TweenSequence.prototype.jumpTo = function (time) {
		var firstTweenDuration = 0;
		this._seq = this._tweens.slice();
		this._repeat = this.repeat;
		this._jumpTo(time, 0);
		this.emit('jumpTo', time);
	};

	TweenSequence.prototype.stop = function () {
		var list = this._tweens.slice();
		for (var i = 0, len = list.length; i < len; i++) {
			var tween = list[i];
			if (tween) {
				tween.stop();
			}
		}
		this.emit('stop');
	};

	TweenSequence.prototype.update = function () {
		if (this._current) {
			var updates = this._current.update();
			this.emit('change', updates);
			return updates;
		}
		return null;
	};

	TweenSequence.prototype._setup = function () {
		var that = this;
		for (var i = 0; i < this._tweenLen; i++) {
			this._tweens[i].on('change', onChange);
		}
		// on change callback
		function onChange(values) {
			that.emit('change', values);
		}
	};

	TweenSequence.prototype._start = function () {
		var that = this;
		this._current = this._seq.shift();
		var onFinish = function (values) {
			if (that._seq.length > 0) {
				// next tween
				that._start();
			} else {
				// end of the last tween in our sequence list
				that._current = null;
				if (that._repeat > 0 || that._repeat === -1) {
					that._repeat = Math.max(-1, that._repeat - 1);
					// reset sequence
					that._seq = that._tweens.slice();
					return that._reverse();
				}
				that._finished = true;
				that.emit('finish');
			}
		};
		this._current.once('finish', onFinish);
		this._current.start();
	};

	TweenSequence.prototype._jumpTo = function (time, count) {
		var that = this;
		this._current = this._seq.shift();
		var onFinish = function (values) {
			if (that._seq.length > 0) {
				// next tween
				count += 1;
				that._jumpTo(time, count);
			} else {
				// end of the last tween in our sequence list
				that._current = null;
				if (that._repeat > 0 || that._repeat === -1) {
					that._repeat = Math.max(-1, that._repeat - 1);
					// reset sequence
					that._seq = that._tweens.slice();
					return that._reverse();
				}
				that._finished = true;
				that.emit('finish');
			}
		};
		this._current.once('finish', onFinish);
		if (count) {
			time -= this._current._duration + this._current._delay;
		}
		if (time) {
			this._current.jumpTo(time);
		} else {
			this._current.start();
		}
	};

	TweenSequence.prototype._reverse = function () {
		var that = this;
		this._current = this._seq.pop();
		var onFinish = function (values) {
			if (that._seq.length > 0) {
				// next tween
				that._reverse();
			} else {
				// end of the last tween in our sequence list
				that._current = null;
				if (that._repeat > 0 || that._repeat === -1) {
					that._repeat = Math.max(-1, that._repeat - 1);
					// reset sequence
					that._seq = that._tweens.slice();
					return that._start();
				}
				that._finished = true;
				that.emit('finish');
			}
		};
		this._current.once('finish', onFinish);
		this._current.reverse();
	};

}(window));
