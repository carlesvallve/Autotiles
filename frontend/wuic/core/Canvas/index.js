(function () {

	function Canvas(canvas) {
		EventEmitter.call(this);
		this._frameUpdater = null;
		this._minFrameRate = 1;
		this._framePerSecond = 0;
		this._frameRate = 100;
		this._canvas = canvas || document.createElement('canvas');
		this._size = {
			w: 100,
			h: 100
		};
		this._rootSprite = null;
	}

	window.wuic.core.inherits(Canvas, EventEmitter);
	window.wuic.core.Canvas = Canvas;

	Canvas.prototype.setFrameRate = function (framePerSecond) {
		this._framePerSecond = framePerSecond;
		this._frameRate = Math.max(this._minFrameRate, Math.floor(1000 / framePerSecond));
		if (!this._frameUpdater) {
			var lastUpdate = Date.now();
			var that = this;
			this._frameUpdater = window.setInterval(function () {
				var now = Date.now();
				var updateInterval = now - lastUpdate;
				if (updateInterval >= that._frameRate) {
					var currentFps = Math.floor(1000 / updateInterval);
					lastUpdate = now;
					that._updateRootSprite();
					that.emit('frameUpdate', currentFps);
				}
			}, 0);
		}
		this.emit('setFrameRate', framePerSecond);
	};

	Canvas.prototype.pause = function () {
		if (this._frameUpdater) {
			window.clearInterval(this._frameUpdater);
			this._frameUpdater = null;
			this.emit('pause');
		}
	};

	Canvas.prototype.resume = function () {
		if (!this._frameUpdater) {
			this.setFrameRate(this._framePerSecond);
			this.emit('resume');
		}
	};

	Canvas.prototype.registerRootSprite = function (sprite) {
		this._rootSprite = sprite;
	};

	Canvas.prototype.appendTo = function (parentElement) {
		parentElement.appendChild(this._canvas);
	};

	Canvas.prototype.addEvent = function (eventName, eventLabel) {
		var that = this;
		this._canvas.addEventListener(eventName, function (event) {
			eventName = eventLabel || eventName;
			that.emit(eventName, event);
		}, false);
	};

	Canvas.prototype.setSize = function (w, h) {
		this._size.w = w;
		this._size.h = h;
		this._canvas.width = w;
		this._canvas.height = h;
		this.emit('resize', this._size);
	};

	Canvas.prototype.getSize = function () {
		return { width: this._size.w, height: this._size.h };
	};

	Canvas.prototype.getContext = function (type) {
		return this._canvas.getContext(type);
	};

	Canvas.prototype._updateRootSprite = function () {
		if (this._rootSprite) {
			this._rootSprite._render();
		}
	};

}());
