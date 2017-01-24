(function () {

	function Canvas(canvas) {
		this._frameUpdater = null;
		this._minFrameRate = 1;
		this._frameRate = 100; // milliseconds
		this._canvas = canvas || document.createElement('canvas');
		this._size = {
			w: 100,
			h: 100
		};
	}

	Canvas.prototype = new EventEmitter();
	window.wuic.core.Canvas = Canvas;

	Canvas.prototype.appendTo = function (parentElement) {
		parentElement.appendChild(this._canvas);
	};

	Canvas.prototype.setFrameRate = function (framePerSecond) {
		this._frameRate = Math.max(this._minFrameRate, Math.floor(1000 / framePerSecond));
		setupFrameUpdater(this, this._frameRate, this._frameUpdater);
		this.emit('setFrameRate', framePerSecond);
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
		return this._size;
	};

	Canvas.prototype.getContext = function (type) {
		return this._canvas.getContext(type);
	};

	function setupFrameUpdater(that, frameRate, updater) {
		if (updater) {
			window.clearInterval(updater);
			updater = null;
		}
		updater = window.setInterval(function () {
			that.emit('frameUpdate');
		}, frameRate);
	}

}());