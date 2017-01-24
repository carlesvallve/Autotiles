(function (window) {

	var document = window.document;

	// non-touch enabled browser workarounds

	var canTouch = ('ontouchstart' in window && 'ontouchend' in window && 'ontouchmove' in window);

	var touchToMouseMap = {
		touchstart: 'mousedown',
		touchmove: 'mousemove',
		touchend: 'mouseup',
		touchcancel: false
	};


	// fixes for unsupported dom events

	function translateDomEventName(domEventName) {
		if (!canTouch && touchToMouseMap.hasOwnProperty(domEventName)) {
			return touchToMouseMap[domEventName];
		}

		return domEventName;
	}


	// HTML creation helper

	function createHtmlElement(tagName, options) {
		var key, elm = document.createElement(tagName);

		if (options) {
			if (options.className) {
				elm.className = options.className;
			}

			if (options.style) {
				for (key in options.style) {
					elm.style[key] = options.style[key];
				}
			}

			if (options.attr) {
				for (key in options.attr) {
					elm.setAttribute(key, options.attr[key]);
				}
			}

			if (options.text) {
				elm.innerText = options.text;
			}
		}

		return elm;
	}


	// Dom class

	function Dom() {
		this.elementIsVisible = true;
	}

	Dom.prototype = new window.EventEmitter();


	// register DOM on the WUI namespace

	window.wui.core.Dom = Dom;


	// DOM API:

	// Dom#assign makes the given element the rootElement for this component.
	// If instead of an HTML element, a tagName and options are given, the element is created and assigned.
	// The logic for HTML creation follows the rules of the private createHtmlElement function.

	Dom.prototype.assign = function (tagName, options) {
		if (typeof tagName === 'string') {
			// if tagName is a real tag name, create the HTML Element with it

			this.rootElement = createHtmlElement(tagName, options);
		} else if (tagName instanceof window.Element) {
			// the first passed argument already is a real HTML Element

			this.rootElement = tagName;
		} else {
			throw new Error('Dom.assign requires the given argument to be a DOM Element or tagName.');
		}

		if (options && options.hidden) {
			// start hidden
			this.hide();
		}

		return this.rootElement;
	};


	// Dom#createElement creates an instance of Dom and assigns a newly built HTML element to it,
	// following the logic of the private createHtmlElement function.

	Dom.prototype.createElement = function (tagName, options) {
		var instance = new Dom();

		instance.assign(tagName, options);

		return instance;
	};


	// Dom#createChild creates an instance of Dom and assigns a newly built HTML element to it,
	// following the logic of the private createHtmlElement function. It is then appended to
	// this component.

	Dom.prototype.createChild = function (tagName, options) {
		var instance = this.createElement(tagName, options);

		this.appendChild(instance);

		return instance;
	};


	Dom.prototype.appendTo = function (newParent) {
		newParent.appendChild(this);
	};


	// override this function to implement custom appendChild behavior

	Dom.prototype.appendChild = function (newChild) {
		this.rootElement.appendChild(newChild.rootElement);

		// touch events are known to get lost, so rebind them

		newChild.rebindTouchListeners();
	};


	// override this function to implement custom insertBefore behavior

	Dom.prototype.insertBefore = function (newNextSibling) {
		newNextSibling.rootElement.parentNode.insertBefore(this.rootElement, newNextSibling.rootElement);

		// touch events are known to get lost, so rebind them

		this.rebindTouchListeners();
	};


	Dom.prototype.insertChildBefore = function (newChild, newNextSibling) {
		this.rootElement.insertBefore(newChild.rootElement, newNextSibling.rootElement);

		// touch events are known to get lost, so rebind them

		newChild.rebindTouchListeners();
	};


	// timers (for internal use)

	Dom.prototype.setTimer = function (id, fn, interval) {
		this.clearTimer(id);

		this.timers = this.timers || {};

		var handle = window.setTimeout(function (that) {
			delete that.timers[handle];

			fn.call(that);
		}, interval, this);

		this.timers[id] = handle;
	};


	Dom.prototype.clearTimer = function (id) {
		if (!this.timers) {
			return;
		}

		var handle = this.timers[id];

		if (handle) {
			window.clearTimeout(handle);

			delete this.timers[id];
		}
	};


	// content: html and text

	Dom.prototype.setHtml = function (value, interval) {
		// if value is a function, execute it and use the return value as text
		// if an interval is given, repeat the given function every N msec until setHtml is called again, or the component is destroyed
		// if value is not a function, use its string representation as html string

		if (typeof value === 'function') {
			var fn = value;
			value = fn();

			if (interval) {
				this.setTimer('content', function () {
					this.setHtml(fn, interval);
				}, interval);
			} else {
				this.clearTimer('content');
			}
		} else {
			this.clearTimer('content');
		}

		this.rootElement.innerHTML = value;
	};


	Dom.prototype.setText = function (value, interval) {
		// if value is a function, execute it and use the return value as text
		// if an interval is given, repeat the given function every N msec until setText is called again, or the component is destroyed
		// if value is not a function, use its string representation as text

		if (typeof value === 'function') {
			var fn = value;
			value = fn();

			if (interval) {
				this.setTimer('content', function () {
					this.setText(fn, interval);
				}, interval);
			} else {
				this.clearTimer('content');
			}
		} else {
			this.clearTimer('content');
		}

		if (value !== this.currentTextContent) {
			this.currentTextContent = value;
			this.rootElement.innerText = value;
		}
	};


	Dom.prototype.getText = function () {
		return this.currentTextContent;
	};


	// style accessors

	Dom.prototype.setStyle = function (property, value) {
		this.rootElement.style[property] = value;
	};


	Dom.prototype.setStyles = function (map) {
		var s = this.rootElement.style;

		for (var key in map) {
			s[key] = map[key];
		}
	};


	Dom.prototype.unsetStyle = function (property) {
		this.rootElement.style[property] = null;
	};


	Dom.prototype.getStyle = function (property) {
		return this.rootElement.style[property];
	};


	Dom.prototype.getComputedStyle = function (property) {
		var cssValue = window.getComputedStyle(this.rootElement).getPropertyCSSValue(property);

		return cssValue ? cssValue.cssText : undefined;
	};


	// className accessors

	function parseClassNames(str) {
		return (str.indexOf(' ') === -1) ? [str] : str.trim().split(/\s+/);
	}


	function joinArgumentsAsClassNames(base, args) {
		var str = base;

		if (!str) {
			str = args[0];
		} else {
			str += ' ' + args[0];
		}

		for (var i = 1, len = args.length; i < len; i++) {
			str += ' ' + args[i];
		}

		return str;
	}


	function uniqueClassNames(str) {
		var classNames = parseClassNames(str);
		var uniqueClassNames = {};

		for (var i = 0, len = classNames.length; i < len; i++) {
			var className = classNames[i];
			uniqueClassNames[className] = null;
		}

		return Object.keys(uniqueClassNames).join(' ');
	}


	function removeClassNames(baseList, args) {
		// removes the (unparsed) class names in args from baseList
		// baseList is required to be an array (not a string)
		// args is expected to be an arguments object or array

		for (var i = 0, len = args.length; i < len; i++) {
			var parsed = parseClassNames(args[i]);

			for (var j = 0, jlen = parsed.length; j < jlen; j++) {
				var index = baseList.indexOf(parsed[j]);

				if (index !== -1) {
					baseList.splice(index, 1);
				}
			}
		}

		return baseList.join(' ');
	}


	Dom.prototype.getClassNames = function () {
		// returns an array of all class names

		return parseClassNames(this.rootElement.className);
	};


	Dom.prototype.hasClassName = function (className) {
		// returns true/false depending on the given className being present

		return this.getClassNames().indexOf(className) !== -1;
	};


	Dom.prototype.setClassNames = function (className) {
		// allows for adding multiples in separate arguments, space separated or a mix

		if (arguments.length > 1) {
			className = joinArgumentsAsClassNames('', arguments);
		}

		this.rootElement.className = className;
	};


	Dom.prototype.addClassNames = function () {
		// allows for adding multiples in separate arguments, space separated or a mix

		var classNames = joinArgumentsAsClassNames(this.rootElement.className, arguments);
		this.rootElement.className = uniqueClassNames(classNames);
	};


	Dom.prototype.replaceClassNames = function (delList, addList) {
		// adds all classNames in addList and removes the ones in delList

		var current = parseClassNames(joinArgumentsAsClassNames(this.rootElement.className, addList));

		this.rootElement.className = removeClassNames(current, delList);
	};


	Dom.prototype.delClassNames = function () {
		// allows for deleting multiples in separate arguments, space separated or a mix

		this.rootElement.className = removeClassNames(this.getClassNames(), arguments);
	};


	// finding sub-elements

	Dom.prototype.query = function (selector) {
		var elm;

		if (this._queryCache) {
			elm = this._queryCache[selector];
		} else {
			this._queryCache = {};
		}

		if (!elm) {
			elm = this._queryCache[selector] = this.rootElement.querySelector(selector);
		}

		return elm;
	};


	Dom.prototype.queryAll = function (selector) {
		var elm;

		if (this._queryAllCache) {
			elm = this._queryAllCache[selector];
		} else {
			this._queryAllCache = {};
		}

		if (!elm) {
			elm = this._queryAllCache[selector] = this.rootElement.querySelectorAll(selector);
		}

		return elm;
	};


	// cleanup

	Dom.prototype.destroy = function () {
		this.emit('destroy');

		// destroy caches

		delete this._queryCache;
		delete this._queryAllCache;

		// cleanup DOM tree

		var elm = this.rootElement;

		if (elm) {
			// release DOM from parent element

			if (elm.parentElement) {
				elm.parentElement.removeChild(elm);
			}

			// drop DOM references

			this.rootElement = null;
		}

		// drop any built-in timers

		if (this.timers) {
			for (var id in this.timers) {
				this.clearTimer(id);
			}
		}

		// drop any remaining event listeners

		this.removeAllListeners();
	};


	// default show/hide implementation

	Dom.prototype.showMethod = function () {
		this.rootElement.style.display = '';
	};

	Dom.prototype.hideMethod = function () {
		this.rootElement.style.display = 'none';
	};

	Dom.prototype.show = function (data) {
		this.emit('show', data);
		this.elementIsVisible = true;
		this.showMethod();
	};

	Dom.prototype.hide = function (data) {
		this.emit('hide', data);
		this.elementIsVisible = false;
		this.hideMethod();
	};

	Dom.prototype.isVisible = function () {
		return this.elementIsVisible;
	};


	// DOM events

	var domEventPrefix = 'dom';


	Dom.prototype.rebindTouchListeners = function () {
		if (this.domListeners) {
			var elm = this.rootElement;

			for (var domEventName in this.domListeners) {
				if (!domEventName.match(/^touch/)) {
					continue;
				}

				var fn = this.domListeners[domEventName];

				elm.removeEventListener(domEventName, fn);
				elm.addEventListener(domEventName, fn);
			}
		}
	};


	Dom.prototype.allowDomEvents = function () {
		if (this.domListeners) {
			// already set
			return;
		}

		var that = this;
		this.domListeners = {};


		this.on('newListener', function (evt) {
			var evtNameParts = evt.split('.');

			if (evtNameParts[0] !== domEventPrefix) {
				return;
			}

			// translate the dom event name for compatibility reasons

			var domEventName = translateDomEventName(evtNameParts[1]);

			// if we're not yet listening for this event, add a dom event listener that emits dom events

			if (domEventName && !that.domListeners[domEventName]) {
				var fn = function (e) {
					that.emit(evt, e);
				};

				if (domEventName === 'mousedown' || domEventName === 'mousemove') {
					// on desktop, only allow left-mouse clicks to fire events

					fn = function (e) {
						if (e.which === 1) {
							that.emit(evt, e);
						}
					};
				}

				that.domListeners[domEventName] = fn;

				that.rootElement.addEventListener(domEventName, fn);
			}
		});

		this.on('removeListener', function (evt) {
			// when the last event listener for this event gets removed, we stop listening for DOM events

			if (that.listeners(evt).length === 0) {
				var evtNameParts = evt.split('.');

				if (evtNameParts[0] !== domEventPrefix) {
					return;
				}

				var domEventName = translateDomEventName(evtNameParts[1]);

				var fn = that.domListeners[domEventName];

				if (fn) {
					that.rootElement.removeEventListener(domEventName, fn);

					delete that.domListeners[domEventName];
				}
			}
		});

		this.on('destroy', function () {
			// destroy DOM event listeners

			for (var domEventName in that.domListeners) {
				var fn = that.domListeners[domEventName];

				that.rootElement.removeEventListener(domEventName, fn);
			}

			that.domListeners = {};
		});
	};

}(window));
