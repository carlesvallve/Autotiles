(function () {

	function Sprite() {

		window.EventEmitter.call(this);

		this.x = 0;
		this.y = 0;
		this.pivotX = 0;
		this.pivotY = 0;
		this.scaleX = 1;
		this.scaleY = 1;
		this.width = 0;
		this.height = 0;
		this.alpha = 1;
		this.rotation = 0; // radius NOT degree
		this._visible = true;
		this.context = window.context || null;

		this._parent = null;
		this._children = [];
		this._draw = null; // record a function to draw

		this._tweens = {};
	}


	window.inherits(Sprite, window.EventEmitter);

	window.wuic.core.Sprite = Sprite;

	Sprite.prototype.getParent = function () {
		return this._parent;
	};

	Sprite.prototype.getAllChildren = function () {
		return this._children.slice();
	};

	Sprite.prototype.eachChild = function (fnc) {
		if (typeof fnc !== 'function') {
			return console.warn('Sprite.eachChild: expected a function but "' + (typeof fnc) + '" given');
		}
		var list = this._children.slice();
		var len = list.length;
		for (var i = 0; i < len; i++) {
			var child = list[i];
			if (child) {
				fnc(child);
			}
		}
	};

	Sprite.prototype.eachChildSeries = function (fnc, cb) {
		var list = this._children.slice();
		var len = list.length;
		var eachHandler = function (index) {
			var child = list[index];
			if (child) {
				fnc(child, function () {
					index += 1;
					if (index < len) {
						eachHandler(index);
					} else {
						cb();
					}
				});
			}
		};
		eachHandler(0);
	};

	Sprite.prototype.getChildByIndex = function (index) {
		if (index !== undefined && this._children[index]) {
			return this._children[index];
		} else {
			return null;
		}
	};

	Sprite.prototype.getGlobalIndex = function () {
		var myIndex = this.getIndex();
		var parent = this.getParent();
		if (parent && parent._visible) {
			myIndex += parent.getGlobalIndex() + 1; // + 1 for parent
		}
		return myIndex || 0;
	};

	Sprite.prototype.getIndex = function () {
		if (this._parent) {
			return this._parent._children.indexOf(this);
		} else {
			// no parent
			return null;
		}
	};

	Sprite.prototype.setIndex = function (index) {
		if (this._parent) {
			var siblings = this._parent._children;
			siblings.splice((index > siblings.length) ? siblings.length : ((index < 0) ? 0 : index), 0, siblings.splice(siblings.indexOf(this), 1)[0]);
		}
	};

	// move itself to the bottom of index
	Sprite.prototype.moveToBottomIndex = function () {
		if (this._parent) {
			var siblings = this._parent._children;
			siblings.splice(0, 0, siblings.splice(siblings.indexOf(this), 1)[0]);
		}
	};

	// move itself to the top of index
	Sprite.prototype.moveToTopIndex = function () {
		if (this._parent) {
			var siblings = this._parent._children;
			var myIndex = siblings.indexOf(this);
			var me = siblings.splice(siblings.indexOf(this), 1)[0];
			siblings.push(me);
		}
	};

	Sprite.prototype.createChild = function () {
		var sprite = new Sprite();
		this.appendChild(sprite);
		return sprite;
	};


	Sprite.prototype.appendChild = function (sprite) {
		if (sprite._parent && this !== sprite._parent) {
			console.warn('Sprite.appendChild: given sprite is a child of another parent: ', JSON.stringify(sprite._parent));
			sprite._parent.removeChild(sprite);
		}
		if (this === sprite._parent) {
			return;
		}
		delete sprite._removed;
		// inherit canvas context from parent sprite
		sprite.context = this.context;
		this._children.push(sprite);
		sprite._parent = this;

	};


	Sprite.prototype.removeChild = function (sprite) {
		var index = this._children.indexOf(sprite);
		if (index === -1) {
			return;
		}
		sprite._removed = true;
		this._children.splice(index, 1);
		sprite.context = null;
		sprite._parent = null;
	};


	Sprite.prototype.destroyChildren = function () {
		var children = this._children.slice();
		while (children.length > 0) {
			var child = children.pop();
			child.destroy();
		}
	};

	// Deprecated
	Sprite.prototype.removeAllChildren = Sprite.prototype.destroyChildren;


	// remove itself from its parent
	Sprite.prototype.destroy = function () {
		this.emit('destroy');

		if (this._parent) {
			this._parent.removeChild(this);
		}
		this.context = null;
		this.destroyChildren();
		this.removeAllListeners();
	};


	Sprite.prototype.detach = function () {
		this._parent.removeChild(this);
	};

	// Deprecated
	Sprite.prototype.remove = Sprite.prototype.detach;


	// this function allows you to copy Sprites into a different canvas
	// returns a copy of this Sprite
	// copies children, but does NOT copy parent
	Sprite.prototype.copy = function (newContext) {
		var copy = new Sprite();
		copy.x = this.x;
		copy.y = this.y;
		copy.pivotX = this.pivotX;
		copy.pivotY = this.pivotY;
		copy.scaleX = this.scaleX;
		copy.scaleY = this.scaleY;
		copy.alpha = this.alpha;
		copy._visible = this._visible;
		copy.rotation = this.rotation;
		copy.width = this.width;
		copy.height = this.height;
		copy._draw = this._draw;

		// move all copied sprites to a new context if provided
		copy.context = newContext || this.context;

		// copy all children
		for (var i = 0, len = this._children.length; i < len; i++) {
			var child = this._children[i];
			var copiedChild = child.copy(newContext);
			copy.appendChild(copiedChild);
		}

		return copy;
	};

	Sprite.prototype.render = function () {
		this._render();
	};

	Sprite.prototype.setRenderMethod = function (drawingFunc) {
		if (typeof drawingFunc !== 'function') {
			return console.warn('Sprite.setRenderMethod: Expecting the argument to be a function.');
		}
		this._draw = drawingFunc;
	};

	Sprite.prototype.getParentAlpha = function () {
		return this._parent ? this._parent.alpha : 1;
	};

	// Deprecated
	Sprite.prototype.parentAlpha = Sprite.prototype.getParentAlpha;


	// Default show/hide implementation

	Sprite.prototype.show = function (data) {
		if (this._visible) {
			return;
		}
		this._visible = true;
		this.emit('show', data);
	};

	Sprite.prototype.hide = function (data) {
		if (this._visible) {
			this._visible = false;
			this.emit('hide', data);
		}
	};

	Sprite.prototype.isVisible = function () {
		var sprite = this;
		var visible = sprite._visible;
		while (visible && sprite) {
			visible = sprite._visible;
			sprite = sprite._parent;
		}
		return visible;
	};

	Sprite.prototype.addTween = function (name, tween) {
		if (this._tweens[name]) {
			return console.warn('Sprite.addTween: cannot add the same tween more than once', name);
		}
		this._tweens[name] = tween;

	};

	Sprite.prototype.getTween = function (name) {
		if (this._tweens[name]) {
			return this._tweens[name];
		}
		return false;
	};

	Sprite.prototype.removeTween = function (name) {
		delete this._tweens[name];
	};

	Sprite.prototype.removeAllTweens = function () {
		this._tweens = {};
	};

	Sprite.prototype._updateTween = function () {
		for (var tweenName in this._tweens) {
			this._tweens[tweenName].update();
		}
	};

	Sprite.prototype._transform = function () {
		var context = this.context;
		context.globalAlpha = context.globalAlpha * this.alpha;
		context.translate(this.x + this.pivotX, this.y + this.pivotY);
		context.rotate(this.rotation);
		context.scale(this.scaleX, this.scaleY);
		// offset the center of the Sprite object after scale and rotation
		context.translate(-this.pivotX, -this.pivotY);
	};

	Sprite.prototype._getLocalCoordinate = function (x, y, callback) {
		var result = {x : x, y : y};
		var extra = null;
		// if callback is given
		if (typeof callback === 'function') {
			extra = callback(this);
		}

		// revert the parent transformation :
		if (this._parent) {
			result = this._parent._getLocalCoordinate(result.x, result.y, callback);
		}

		// revert first translation :
		result.x = result.x - this.x - this.pivotX;
		result.y = result.y - this.y - this.pivotY;

		// revert rotation :
		var cosR = Math.cos(this.rotation);
		var sinR = Math.sin(this.rotation);
		var rotX =  (cosR * result.x) + (sinR * result.y);
		result.y = (-sinR * result.x) + (cosR * result.y);
		result.x = rotX;

		// revert scale :
		result.x = result.x / this.scaleX;
		result.y = result.y / this.scaleY;

		// revert pivot translation :
		result.x = result.x + this.pivotX;
		result.y = result.y + this.pivotY;

		// append extra object to result object
		if (extra) {
			for (var key in extra) {
				result[key] = extra[key];
			}
		}

		return result;
	};

	// this function requires canvasContext.translate for moving the sprite object
	Sprite.prototype._render = function () {
		// There is no rendering method set
		if (!this._draw) {
			return;
		}
		if (this._visible && !this._removed) {
			// run tween if there is any
			this._updateTween();
			if (this.context) {
				this.emit('beforeRender');
				// render myself
				this.context.save();
				this._transform();
				this._draw(this.context);
				// render children
				var children = this._children.slice();
				for (var i = 0, len = children.length; i < len; i++) {
					var child = children[i];
					if (child && !child._removed) {
						child._render();
					}
				}
				this.context.restore();
				this.emit('afterRender');
			}
		}
	};

}());
