(function (window) {

	/***
	 * Constructor
	 * This behavior assumes the target object is a sprite
	 */
	function Button() {
		this.isDown = false;
	}

	Button.prototype = new EventEmitter();
	window.wuic.behaviors.Button = Button;

	/**
	 * Creates a button object
	 * @sprite (Object) EventEmitter with properties of following x, y, width, height, and functions gx() and gy()
	 */
	Button.prototype.register = function (sprite) {
		if (sprite.__enable !== undefined) {
			// sprite has already been registered
			return false;
		}

		// add private flag
		sprite.__enable = true;

		// get mouse relative position inside the sprite
		function getMousePos(positions) {
			return  { x: positions.x - sprite.gx(), y: positions.y - sprite.gy() }
		}

		// enable-disable the button behavior when opening-closing the button sprite's view
		var that =  this;
		if(sprite.view) {
			sprite.__enable = false;
			sprite.view.on('open', function() {
				setTimeout(function() {
					that.enable(sprite);
				}, 0);
			});
			sprite.view.on('close', function() {
				that.disable(sprite);
			});
		}

		// set up event listeners
		this.on('tapstart', function (event, positions) {
			if (sprite.__enable) {
				var pos = getMousePos(positions);
				if (insideBounds(pos, sprite.width, sprite.height)) {
					sprite.emit('tapstart', event, pos);
					// set startPos for swiping
					this.startPos = pos;
				}
			}
		});
		this.on('tapend', function (event, positions) {
			if (sprite.__enable) {
				var pos = getMousePos(positions);
				if (insideBounds(pos, sprite.width, sprite.height)) {
					sprite.emit('tapend', event, pos);
				} else {
					sprite.emit('tapendoutside', event, pos);
				}
			}
		});
		this.on('tapcancel', function (event, positions) {
			if (sprite.__enable) {
				var pos = getMousePos(positions);
				if (insideBounds(pos, sprite.width, sprite.height)) {
					sprite.emit('tapcancel', event, pos);
				}
			}
		});
		this.on('tapmove', function (event, positions) {
			if (sprite.__enable) {
				var pos = getMousePos(positions);
				if (insideBounds(pos, sprite.width, sprite.height)) {
					sprite.emit('tapmove', event, pos);
					// swipe
					var vec = { x: pos.x - this.startPos.x, y: pos.y - this.startPos.y }
					var dist = Math.sqrt(vec.x * vec.x + vec.y * vec.y);
					if(dist > 5) {
						sprite.emit('swipe', event, this.startPos, vec, dist);
					}


				}
			}
		});
		return true;
	};

	Button.prototype.enable = function (sprite) {
		if (sprite.__enable === undefined || sprite.__enable) {
			return false;
		}
		sprite.__enable = true;
		return true;
	};

	Button.prototype.disable = function (sprite) {
		if (sprite.__enable === undefined || sprite.__enable === false) {
			return false;
		}
		sprite.__enable = false;
		return true;
	};

	/***
	 * Register this function to an event such as touchstart
	 */
	Button.prototype.tapstart = function (event, positions) {
		if (!this.isDown) {
			this.isDown = true;
			this.emit('tapstart', event, positions);
		}
	};

	/***
	 * Register this functiin to an event such as touchend
	 */
	Button.prototype.tapend = function (event, positions) {
		if (this.isDown) {
			this.isDown = false;
			this.emit('tapend', event, positions);
		}
	};

	/***
	 * Register this function to an event such as touchcancel
	 */
	Button.prototype.tapcancel = function (event, positions) {
		if (this.isDown) {
			this.isDown = false;
			this.emit('tapcancel', event, positions);
		}
	};

	/***
	 * Register this function to an event such as touchmove
	 */
	Button.prototype.tapmove = function (event, positions) {
		if (this.isDown) {
			this.emit('tapmove', event, positions);
		}
	};

	/***
	 * Check if given relative mouse position is inside sprite bounds
	 */
	function insideBounds(pos, width, height) {
		if (pos) {
			if (pos.x >= 0 && pos.x <= width && pos.y >= 0 && pos.y <= height) {
				return true;
			}
		}
		return false;
	}

}(window));