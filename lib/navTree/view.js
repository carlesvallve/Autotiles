// -----------------------------------------
// Wiew Superclass
// -----------------------------------------
(function () {

	/***
	 * Constructor
	 * @return (Void)
	 */
	function View() {
		this.name = 'default';
		this.visible = false;
	}

	View.prototype = new window.wuic.core.Sprite(); //EventEmitter(); //
	window.View = View;

	/***
	 * Open the view
	 * @params (Object) optional
	 */
	View.prototype.open = function (params) {
		if (this.visible) {
			return false;
		}
		this.visible = true;
		this.emit('open', params);
	};

	/***
	 * Close the view
	 * @params (Object) optional
	 */
	View.prototype.close = function (params, cb) {
		if (!this.visible) {
			return false;
		}
		this.visible = false;
		this.emit('close', params);
	};

	/***
	 * View Fadings In and Out
	 * we must call view.fade(ctx) from the view draw method to take effect
	 */

	View.prototype.fadeIn = function (time, cb) {
		var that = this;
		this.alpha = 0;
		this.fading = true;
		Tweener.addTween(this, { alpha: 1, time: time, transition:'easeInQuad', onComplete: function() {
			that.fading = false;
			if(cb && typeof cb === 'function') { cb(); }
		} });
	};

	View.prototype.fadeOut = function (time, newViewName, params) {
		var that = this;
		this.fading = true;
		Tweener.addTween(this, { alpha: 0, time: time, transition:'easeOutQuad', onComplete: function() {
			that.fading = false;
			navTree.open(newViewName, params);
		} });
	};

	View.prototype.fade = function (ctx) {
		if(this.fading) {
			ctx.globalAlpha = (1 - this.alpha);
			ctx.fillStyle = '#000';
			ctx.fillRect( 0, 0, canvasWidth, canvasHeight );
		}
	};

	/***
	 * Open the view as popup
	 * @params (Object) optional
	 */
	View.prototype.openPopup = function (params) {
		if (this.visible) {
			console.warn('View.openPopup: "', this.name, '" > already opened as a view. ignoring...');
			return false;
		}
		this.visible = true;
		this.emit('openPopup', params); //{ view: this, params: params }); // TODO:  Ask Nobu about this!
	};

	/***
	 * Close the view as popup
	 * @params (Object) optional
	 */
	View.prototype.closePopup = function (params) {
		if (!this.visible) {
			return false;
		}
		this.visible = false;
		this.emit('closePopup', params); //{ view: this, params: params }); // TODO:  Ask Nobu about this!
	};

	/***
	 * Draw added components
	 * @params (Object) optional
	 */
	View.prototype.draw = function (params) {
		if (!this.visible) {
			console.warn('View.draw: "', this.name, '" is attemping to draw when it is not visible. ignoring...');
			return false;
		}
		this.emit('draw', params); //{ view: this, params: params }); // TODO:  Ask Nobu about this!
	};

	/***
	 * Add a component to the view
	 * @component (Object) component object to add the view
	 */
	View.prototype.addComponent = function (component) {
		this.components.push(component);
		this.components = this.components.sort(sortByZIndex);
		this.emit('addComponent', { view: this, componented: component });
	};

	/***
	 * Remove a component from the view
	 * @component (Object) component to remove from the view
	 */
	View.prototype.removeComponent = function (component) {
		var index = this.components.indexOf(components);
		if (index === -1) {
			console.log('View.removeComponent: "', this.name , '" > attempting to remove a component that has not been added.');
			return false;
		}
		this.components.splice(index, 1);
		this.emit('removeComponent', { view: this, component: component });
	};

	/***
	 * Event call back for ontouchstart
	 * @event (Object) event object of ontouchstart event
	 * @data (Object) { x: Number, y: Number }
	 */
	View.prototype.tapstart = function (event, data) {
		this.emit('tapstart', { view: this, event: event, data: data});
	};

	/***
	 * Event call back for ontouchmove
	 * @event (Object) event object of ontouchmove
	 * @data (Object) { x: Number, y: Number }
	 */
	View.prototype.tapmove = function (event, data) {
		this.emit('tapmove', { view: this, event: event, data: data });
	};

	/***
	 * Event call back for ontouchend
	 * @event (Object) event object of ontouchend
	 * @data (Object) { x: Number, y: Number }
	 */
	View.prototype.tapend = function (event, data) {
		this.emit('tapend', { view: this, event: event, data: data });
	};

	/***
	 * Sort view.components array on zIndex
	 */
	function sortByZIndex(a, b) {
		return (a.zIndex || 0) - (b.zIndex || 0);
	}

}());
