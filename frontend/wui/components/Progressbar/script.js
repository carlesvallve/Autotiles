(function (window) {
	// maxValue: Number > maximum value of the progressbar this value will be considered 100%
	// event(s): Progressbar.update
	// options: Object > expected options { numberOfProgress: number, borderRadius: [number, number, number, number], horizontalWidth: number, horizontalHeight: number, verticalWidth: number, verticalHeight: number }
	function Progressbar(maxValue, options) {
		this.assign(document.createElement('div'));
		this.options = this._applyDefault({ numberOfProgress: 1, borderRadius: null, horizontalWidth: null, horizontalHeight: null, verticalWidth: null, verticalHeight: null }, options);
		this.maxValue = maxValue;
		this.values = [];
		this.container = null;
		this.bars = [];
		this.cover = null;
		this.direction = 'horizontal';
		this.barStyles = 'wui-progressbar-progress wui-progressbar-size-horizontal';
		this.currentState = {};
		// execute
		this._create();
		this.rightToLeft();
	}

	Progressbar.prototype = new window.wui.core.Dom();

	// public > used mostly to add custom styles
	Progressbar.prototype.getContainer = function () {
		return this.container;
	};

	// public > used mostly to add custom styles
	Progressbar.prototype.getCover = function () {
		return this.cover;
	};

	// public > used mostly to add animation(s) and/or custom styles
	Progressbar.prototype.getBars = function () {
		return this.bars;
	};

	// public
	Progressbar.prototype.getOrientation = function () {
		return this.direction;
	};

	// public
	Progressbar.prototype.leftToRight = function () {
		this.direction = 'horizontal';
		this._setDirection('lr');
	};
	// public
	Progressbar.prototype.rightToLeft = function () {
		this.direction = 'horizontal';
		this._setDirection('rl');
	};
	// public
	Progressbar.prototype.topToBottom = function () {
		this.direction = 'vertical';
		this._setDirection('tb');
	};
	// public
	Progressbar.prototype.bottomToTop = function () {
		this.direction = 'vertical';
		this._setDirection('bt');
	};

	// public
	Progressbar.prototype.setMaxValue = function (maxValue) {
		this.maxValue = maxValue;
		var values = this.currentState.currentValues.map(function (item) {
			return item.value;
		});
		this.__update(values);
	};

	// public
	Progressbar.prototype.update = function () {
		this.__update(arguments);
	};

	// private
	Progressbar.prototype.__update = function (values) {
		var prevValues = [];
		for (var i = 0; i < this.options.numberOfProgress; i++) {
			var value = values[i];
			if (!this.values[i]) {
				this.values[i] = { value: this.maxValue, ratio: 1 };
			}
			prevValues[i] = { value: this.values[i].value, ratio: this.values[i].ratio };
			if (value !== undefined && value !== null && isNaN(value) !== true) {
				var ratio = 0;
				if (value <= 0) {
					ratio = 0; // below 0%
				} else {
					ratio = value / this.maxValue;
					if (ratio > 1) {
						ratio = 1; // exceeds 100%
					}
				}
				this.values[i] = { value: value, ratio: ratio };
				if (this.direction === 'horizontal') {
					this.bars[i].style.WebkitTransform = 'scale(' + ratio + ', 1)';
				} else {
					this.bars[i].style.WebkitTransform = 'scale(1, ' + ratio + ')';
				}
			} else {
				this.values[i] = prevValues[i];
			}
		}
		this.currentState = { maxValue: this.maxValue, currentValues: this.values, previousValues: prevValues };
		this.emit('Progressbar.update', this.currentState);
	};

	// private
	Progressbar.prototype._create = function () {
		this.container = document.createElement('div');
		this.container.className = 'wui-progressbar-container-horizontal wui-progressbar-borders wui-progressbar-size-horizontal';
		this.rootElement.appendChild(this.container);
		var self = this;
		var pause = function () {
			var v = self.currentState.previousValues;
			if (v) {
				var ratio = v[this.getAttribute('bar-counter')].ratio;
				if (self.direction === 'horizontal') {
					this.style.WebkitTransform = 'scale(' + ratio + ', 1)';
				} else {
					this.style.WebkitTransform = 'scale(1, ' + ratio + ')';
				}
			}
		};
		var resume = function () {
			var v = self.currentState.currentValues;
			if (v) {
				var ratio = v[this.getAttribute('bar-counter')].ratio;
				if (self.direction === 'horizontal') {
					this.style.WebkitTransform = 'scale(' + ratio + ', 1)';
				} else {
					this.style.WebkitTransform = 'scale(1, ' + ratio + ')';
				}
			}
		};
		for (var i = this.options.numberOfProgress - 1; i >= 0; i--) {
			this.bars[i] = document.createElement('div');
			this.bars[i].className = this.barStyles + ' wui-progressbar-progress-horizontal-id-' + i;
			this.bars[i].setAttribute('bar-counter', i);
			this.container.appendChild(this.bars[i]);
			// check for custom width and height
			if (this.options.horizontalWidth) {
				this.bars[i].style.width = this.options.horizontalWidth + 'px';
			}
			if (this.options.horizontalHeight) {
				this.bars[i].style.height = this.options.horizontalHeight + 'px';
			}
			// assign pause and resume progress
			this.bars[i].pause = pause;
			this.bars[i].resume = resume;
		}
		this.cover = document.createElement('div');
		this.cover.className = 'wui-progressbar-cover-horizontal wui-progressbar-borders wui-progressbar-size-horizontal';
		this.container.appendChild(this.cover);
		// check for custom width and height
		if (this.options.horizontalWidth) {
			this.container.style.width = this.options.horizontalWidth + 'px';
			this.cover.style.width = this.options.horizontalWidth + 'px';
		}
		if (this.options.horizontalHeight) {
			this.container.style.height = this.options.horizontalHeight + 'px';
			this.cover.style.height = this.options.horizontalHeight + 'px';
		}
		// check for the custom border radius
		if (this.options.borderRadius) {
			var br = '';
			for (var j = 0, len = this.options.borderRadius.length; j < len; j++) {
				br += this.options.borderRadius[j] + 'px ';
			}
			this.container.style.WebkitBorderRadius = br;
			this.cover.style.WebkitBorderRadius = br;
		}
	};

	// private
	Progressbar.prototype._setDirection = function (dir) {
		var prev = 'vertical';
		if (this.direction === 'vertical') {
			prev = 'horizontal';
		}
		// update bars
		for (var i = 0; i < this.options.numberOfProgress; i++) {
			this.bars[i].className = this.barStyles + ' wui-progressbar-progress-' + this.direction + '-id-' + i + ' wui-progressbar-direction-' + dir;
			// style change
			this.bars[i].className = this.bars[i].className.replace(prev, this.direction);
			// check for custom width and height
			if (this.options[this.direction + 'Width']) {
				this.bars[i].style.width = this.options[this.direction + 'Width'] + 'px';
			}
			if (this.options[this.direction + 'Height']) {
				this.bars[i].style.height = this.options[this.direction + 'Height'] + 'px';
			}
		}
		// update container and cover
		var regex = RegExp(prev, 'g');
		this.container.className = this.container.className.replace(regex, this.direction);
		this.cover.className = this.cover.className.replace(regex, this.direction);
		// check for custom width and height
		if (this.options[this.direction + 'Width']) {
			this.container.style.width = this.options[this.direction + 'Width'] + 'px';
			this.cover.style.width = this.options[this.direction + 'Width'] + 'px';
		}
		if (this.options[this.direction + 'Height']) {
			this.container.style.height = this.options[this.direction + 'Height'] + 'px';
			this.cover.style.height = this.options[this.direction + 'Height'] + 'px';
		}
	};

	// private
	Progressbar.prototype._applyDefault = function (defaults, values) {
		for (var key in defaults) {
			if (values && values[key] !== undefined) {
				defaults[key] = values[key];
			}
		}
		return defaults;
	};

	// expose the class
	window.wui.components.Progressbar = Progressbar;

}(window));
