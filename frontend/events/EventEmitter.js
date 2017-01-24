(function () {

	var EventEmitter;

	if (window.EventEmitter) {
		EventEmitter = window.EventEmitter;
	} else {
		EventEmitter = function () {};

		window.EventEmitter = EventEmitter;
	}


	EventEmitter.prototype.on = function (evt, fn, prioritize, thisObj) {
		if (typeof fn !== 'function') {
			console.warn('Tried to register non-function', fn, 'as event handler for event:', evt);
			return;
		}

		if (arguments.length < 4 && typeof prioritize === 'object') {
			thisObj = prioritize;
			prioritize = false;
		}

		this.emit('newListener', evt, fn);

		var handler = { fn: fn, thisObj: thisObj };

		var allHandlers = this.eventHandlers;

		if (!allHandlers) {
			// first event handler for this emitter

			this.eventHandlers = allHandlers = {};
			allHandlers[evt] = [handler];
			return;
		}

		var evtHandlers = allHandlers[evt];

		if (!evtHandlers) {
			// first event handler for this event type
			allHandlers[evt] = [handler];
			return;
		}

		if (prioritize) {
			evtHandlers.unshift(handler);
		} else {
			evtHandlers.push(handler);
		}
	};


	EventEmitter.prototype.once = function (evt, fn, prioritize, thisObj) {
		fn.once = 1 + (fn.once >>> 0);

		this.on(evt, fn, prioritize);
	};


	EventEmitter.prototype._removeEventHandler = function (evt, handler) {
		if (!this.eventHandlers) {
			return;
		}

		var handlers = this.eventHandlers[evt];

		if (handlers) {
			var index = handlers.indexOf(handler);

			if (index !== -1) {
				handlers.splice(index, 1);

				this.emit('removeListener', evt, handler.fn);
			}
		}
	};


	EventEmitter.prototype.removeListener = function (evt, fn) {
		// like node.js, we only remove a single listener at a time, even if it occurs multiple times

		if (!this.eventHandlers) {
			return;
		}

		var handlers = this.eventHandlers[evt];

		if (handlers) {
			for (var i = handlers.length - 1; i >= 0; i--) {
				if (handlers[i].fn === fn) {
					handlers.splice(i, 1);

					this.emit('removeListener', evt, fn);
					break;
				}
			}
		}
	};


	EventEmitter.prototype.removeAllListeners = function (evt) {
		if (evt) {
			delete this.eventHandlers[evt];
		} else {
			this.eventHandlers = null;
		}
	};


	EventEmitter.prototype.hasListeners = function (evt) {
		return (this.eventHandlers && this.eventHandlers[evt] && this.eventHandlers[evt].length > 0) ? true : false;
	};


	EventEmitter.prototype.listeners = function (evt) {
		if (this.eventHandlers) {
			var handlers = this.eventHandlers[evt];

			if (handlers) {
				var len = handlers.length;

				var fns = new Array(len);

				for (var i = 0; i < len; i++) {
					fns[i] = handlers[i].fn;
				}

				return fns;
			}
		}

		return [];
	};


	EventEmitter.prototype.emit = function (evt) {
		if (!this.eventHandlers) {
			return;
		}

		var handlers = this.eventHandlers[evt];

		if (!handlers) {
			return;
		}

		// copy handlers into a new array, so that handler removal doesn't affect array length

		handlers = handlers.slice();

		var args = Array.apply(null, arguments);
		args.shift();

		for (var i = 0, len = handlers.length; i < len; i++) {
			var handler = handlers[i];
			if (!handler) {
				continue;
			}

			var fn = handler.fn;

			var result = fn.apply(handler.thisObj || this, args);

			if (fn.once) {
				if (fn.once > 1) {
					fn.once--;
				} else {
					delete fn.once;
				}

				this._removeEventHandler(evt, handler);
			}

			if (result === false) {
				// cancelBubble
				break;
			}
		}
	};

}());