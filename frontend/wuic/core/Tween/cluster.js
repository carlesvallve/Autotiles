(function (window) {

	function TweenCluster() {
		EventEmitter.call(this);
		this._finished = true;
		this._sprite = null;
		this._tweens = [];
		this._tweenNames = [];
		this._tweenLen = 0;
	}

	window.wuic.core.inherits(TweenCluster, EventEmitter);
	window.wuic.core.TweenCluster = TweenCluster;

	TweenCluster.prototype.setRepeat = function (repeat) {
		var tweens = this._tweens.slice();
		for (var i = 0, len = tweens.length; i < len; i++) {
			var tween = tweens[i];
			if (tween) {
				tween.repeat = repeat;
				if (tween._repeat !== undefined) {
					tween._repeat = repeat;
				}
			}
		}
	};

	TweenCluster.prototype.setSprite = function (sprite, defaults) {
		if (this._sprite) {
			this.stop();
			this.removeSprite();
		}
		var name = Date.now();
		this._sprite = { tweenName: name, sp: sprite, defaults: defaults };
	};

	TweenCluster.prototype.removeSprite = function () {
		if (this._sprite) {
			this._sprite.sp.removeTween(this._sprite.tweenName);
			this._sprite = null;
		}
	};

	TweenCluster.prototype.addTween = function (name, tween) {
		this._tweens.push(tween);
		this._tweenNames.push(name);
		this._tweenLen += 1;
	};

	TweenCluster.prototype.removeTween = function (tween) {
		var index = this._tweens.indexOf(tween);
		this._removeTweenByIndex(index);
	};

	TweenCluster.prototype.removeTweenByName = function (name) {
		var index = this._tweenNames.indexOf(name);
		if (index === -1) {
			return false;
		}
		this._removeTweenByIndex(index);
	};

	TweenCluster.prototype.update = function () {
		if (this._finished) {
			return;
		}
		var tweens = this._tweens.concat();
		var tweenLen = this._tweenLen;
		// calculate updates
		var updates = {};
		for (var i = 0; i < tweenLen; i++) {
			var tween = tweens[i];
			if (tween) {
				var values = tween.update();
				for (var key in values) {
					updates[key] = (updates[key] || 0) + values[key];
				}
			}
		}
		// update sprite
		if (this._sprite) {
			var sprite = this._sprite.sp;
			var defaults = this._sprite.defaults;
			for (var prop in updates) {
				sprite[prop] = updates[prop] + (defaults[prop] || 0);
			}
		}
		// emit
		this.emit('change', updates);
	};

	TweenCluster.prototype.start = function () {
		this._prepare('start');
	};

	TweenCluster.prototype.reverse = function () {
		this._prepare('reverse');
	};

	TweenCluster.prototype.jumpTo = function (time) {
		this._prepare('jumpTo', time);
	};

	TweenCluster.prototype.pause = function () {
		if (this._finished) {
			return;
		}
		var tweens = this._tweens.slice();
		for (var i = 0, len = tweens.length; i < len; i++) {
			var tween = tweens[i];
			if (tween) {
				tween.pause();
			}
		}
	};

	TweenCluster.prototype.resume = function () {
		if (this._finished) {
			return;
		}
		var tweens = this._tweens.slice();
		for (var i = 0, len = tweens.length; i < len; i++) {
			var tween = tweens[i];
			if (tween) {
				tween.resume();
			}
		}
	};

	TweenCluster.prototype.stop = function () {
		if (this._finished) {
			return;
		}
		var tweens = this._tweens.slice();
		for (var i = 0, len = tweens.length; i < len; i++) {
			var tween = tweens[i];
			if (tween) {
				tween.stop();
			}
		}
		// remove cluster tween from target sprite
		if (this._sprite) {
			this._sprite.sp.removeTween(this._sprite.tweenName);
		}
		this._finished = true;
		this.emit('stop');
	};

	TweenCluster.prototype._prepare = function (action, param) {
		if (!this._finished) {
			return;
		}
		if (this._sprite) {
			// add cluster to target sprite
			this._sprite.sp.addTween(this._sprite.tweenName, this);
		}
		var that = this;
		var finished = 0;
		this._finished = false;
		// setup listeners
		this.once('finish', function () {
			that._finished = true;
		});
		// start all tweens
		var tweens = this._tweens.concat();
		for (var i = 0, len = this._tweenLen; i < len; i += 1) {
			var tween = tweens[i];
			// set up event listener
			tween.once('finish', handleTweenFinish);
			// start tween
			tween[action](param);
		}
		// emit
		this.emit(action);
		// finish handler
		function handleTweenFinish() {
			finished += 1;
			if (finished === that._tweenLen) {
				// remove cluster tween from target sprite
				if (that._sprite) {
					that._sprite.sp.removeTween(that._sprite.tweenName);
				}
				// all tween finished
				that.emit('finish');
			}
		}
	};

	TweenCluster.prototype._removeTweenByIndex = function (index) {
		if (index !== -1) {
			this._tweens.splice(index, 1);
			this._tweenNames.splice(index, 1);
			this._tweenLen -= 1;
		} else {
			console.warn('TweenCluster._removeTweenByIndex: failed to remove tween > ' + index);
		}
	};

}(window));
