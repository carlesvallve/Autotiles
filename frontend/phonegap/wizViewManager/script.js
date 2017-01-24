(function (window) {

	// create a namespace for phonegap plugin wrappers

	if (!window.pg) {
		window.pg = {};
	}

	var document = window.document;
	var Error = window.Error;
	var plugin = window.wizViewManager || null;
	var EventEmitter = window.EventEmitter;

	// detect if we're a mobile device

	var ua = window.navigator.userAgent.toLowerCase();
	var isMobileDevice = ua.match(/ipad/) || ua.match(/ipod/) || ua.match(/iphone/) || ua.match(/webos/) || ua.match(/android/);


	// create and register the wrapper object

	var wrapper = Object.create(new EventEmitter());

	wrapper.mainViewName = 'mainView';
	wrapper.thisViewName = null;
	wrapper.deviceDimensions = {
		width: isMobileDevice ? screen.width : 320,
		height: isMobileDevice ? screen.height : 480,
		ratio: 1 // Use for desktop compatibility (html size / device screen size)
	};


	window.pg.wizViewManager = wrapper;

	if (!isMobileDevice) {
		var style = document.createElement('style');
		style.type = 'text/css';
		style.innerHTML = '::-webkit-scrollbar { width: 0; height: 0; }';
		document.head.appendChild(style);
		style = null;
	}


	var views = {};


	// message sending:

	function postPayload(viewName, payload) {
		payload = JSON.stringify(payload);

		var win = ((viewName === wrapper.mainViewName) && window.parent !== window) ? window.parent : window.frames[viewName];

		if (win && win.constructor && win.constructor.name === 'Window' && win === win.self) {
			// window found, so we can do postMessage

			win.postMessage(payload, '*');
		} else {
			// frame not found, so assume phonegap

			win = document.createElement('iframe');
			win.style.display = 'none';
			win.setAttribute('src', 'wizmessageview://' + viewName + '?' + window.encodeURIComponent(payload));
			document.documentElement.appendChild(win);
			win.parentNode.removeChild(win);
		}
	}


	var callbacks = {};
	var lastCallbackId = 0;

	function emitToView(viewName, evtName, data, cb) {
		var payload = { type: 'event', name: evtName, data: data, sender: wrapper.thisViewName };

		if (typeof cb === 'function') {
			lastCallbackId += 1;

			callbacks[lastCallbackId] = cb;

			payload.cb = lastCallbackId;
		}

		postPayload(viewName, payload);
	}


	function identifyView(name) {
		postPayload(name, { type: 'identify', name: name });
	}

	function callCallback(viewName, id, args) {
		postPayload(viewName, { type: 'callback', id: id, args: args });
	}


	// message receiving:

	function receivePayload(payload) {
		try {
			payload = JSON.parse(payload);
		} catch (err) {
			console.warn('Payload parse error', err);
			return;
		}

		if (!payload || !payload.type) {
			console.warn('Unsupported payload');
			return;
		}

		var sender = payload.sender || wrapper.mainViewName;

		switch (payload.type) {
		case 'identify':
			wrapper.thisViewName = payload.name;
			break;

		case 'event':
			wrapper.emit(payload.name, wrapper.get(sender), payload.data, function () {
				if (payload.cb) {
					callCallback(sender, payload.cb, Array.prototype.slice.call(arguments));
				}
			});
			break;

		case 'callback':
			var callback = callbacks[payload.id];

			if (callback) {
				callback.apply(null, payload.args);
				delete callbacks[payload.id];
			}
			break;
		}
	}


	// event listener for phonegap support

	window.wizMessageReceiver = function (payload) {
		receivePayload(window.decodeURIComponent(payload));
	};


	// event listener for the HTML5 postMessage API

	window.addEventListener('message', function (msg) {
		receivePayload(msg.data);
	}, false);


	// View object

	function View(name) {
		views[name] = this;

		this.name = name;
		this.created = false;
		this.isTopView = (name === wrapper.mainViewName);
		this.isAnimating = false;

		this.showAnimation = null;
		this.hideAnimation = null;
	}


	View.prototype.emit = function (evtName, data, cb) {
		emitToView(this.name, evtName, data, cb);
	};


	View.prototype.postMessage = function (message) {
		emitToView(this.name, 'message', message);
	};


	// creating a view

	wrapper.create = function (name, options, cb) {
		var view = new View(name);

		view.create(options, function (error) {
			if (cb) {
				if (error) {
					cb(error);
				} else {
					cb(null, view);
				}
			}
		});
	};


	// creating just a View object to represent an already existing view

	wrapper.get = function (name) {
		var view = views[name];

		if (!view) {
			view = new View(name);
			view.created = true;
		}

		return view;
	};


	// scrolling the current webview

	wrapper.scrollTo = function (x, y) {
		var elm = document.body.querySelector('body > #gameContainer');

		if (elm) {
			elm.scrollLeft = x || 0;
			elm.scrollTop = y || 0;
		} else {
			window.scrollTo(x || 0, y || 0);
		}
	};


	// color rewriting functions for phonegap

	function decToHex(n) {
		// n: 0-255
		var str = parseInt(n, 10).toString(16);

		return str.length < 2 ? '0' + str : str;
	}

	function floatToHex(n) {
		// n: 0-1
		return decToHex(Math.round(parseFloat(n) * 255));
	}

	function parseColor(c) {
		if (c.match(/^#[0-9a-fA-F]{3,6}$/) || c === 'transparent') {
			// already compatible with the wizViewManager plugin

			return c;
		}

		var m = c.match(/^rgba?\((.+)\)$/);

		if (m) {
			var chan = m[1].split(',');

			c = '#' + decToHex(chan[0]) + decToHex(chan[1]) + decToHex(chan[2]);

			if (chan.length === 4) {
				c += floatToHex(chan[3]);
			}
		}

		return c;
	}


	// Creating a webview
	// the options objects may contain setLayout options, and:
	//   src: url to load ('data:,' if left out)
	// cb called after creation, which is right after the page finishes loading

	View.prototype.create = function (options, cb) {
		var error;

		if (this.created) {
			error = new Error('View ' + this.name + ' was already created.');
			console.warn(error);

			if (cb) {
				cb(error);
			}
			return;
		}

		if (!options) {
			options = {};
		}

		var view = this;
		view.options = options;

		if (plugin) {
			// if a background color is given (CSS formatted), we rewrite it to fit the phonegap plugin's supported formats

			if (options.backgroundColor) {
				options.backgroundColor = parseColor(options.backgroundColor);
			}

			plugin.create(
				view.name,
				options,
				function () {
					if (options.src) {
						identifyView(view.name);
					}

					view.created = true;

					if (cb) {
						cb();
					}
				},
				function (error) {
					console.warn(error);

					if (cb) {
						cb(error);
					}
				}
			);
		} else {
			this.created = true;

			this.iframe = document.createElement('iframe');
			this.iframe.setAttribute('scrolling', 'no');
			this.iframe.style.position = 'absolute';
			this.iframe.style.border = 'none';
			this.iframe.style.pointerEvents = 'none';
			this.iframe.style.opacity = '0';
			this.iframe.style.background = options.backgroundColor || '#fff';
			this.iframe.name = this.name;

			function finish() {
				view.setLayout(options, function (error) {
					if (cb) {
						window.setTimeout(function () {
							cb(error);
						}, 0);
					}
				});
			}

			document.documentElement.appendChild(this.iframe);

			if (options.src) {
				this.load(options.src, finish);
			} else {
				this.iframe.src = 'data:,';
				finish();
			}
		}
	};


	View.prototype.setShowAnimation = function (animation) {
		this.showAnimation = animation;
	};


	View.prototype.setHideAnimation = function (animation) {
		this.hideAnimation = animation;
	};


	View.prototype.setLayout = function (options, cb) {
		var error;

		if (!options) {
			// no options: full screen
			options = {};
		}

		if (plugin) {
			var view = this;

			if (!plugin.setLayout) {
				error = new Error('PhoneGap plugin wizViewManager does not support setLayout() method.');
				console.warn(error);

				if (cb) {
					cb(error);
				}
				return;
			}

			plugin.setLayout(
				this.name,
				options,
				function () {
					if (cb) {
						cb();
					}
				},
				function (error) {
					console.warn(error);

					if (cb) {
						cb(error);
					}
				}
			);
		} else {
			// backwards compatibility:

			if ('x' in options) {
				options.left = options.x;
			}

			if ('y' in options) {
				options.top = options.y;
			}

			// ensure alignment

			if (!('left' in options) && !('right' in options)) {
				// no horizontal alignment given, so left: 0 enforced
				options.left = 0;
			}

			if (!('top' in options) && !('bottom' in options)) {
				// no vertical alignment given, so top: 0 enforced
				options.top = 0;
			}

			// ensure width, with a preference for a left/right combination

			if ('width' in options) {
				// if full horizontal alignment is given, ignore the width property

				if ('left' in options && 'right' in options) {
					delete options.width;
				}
			} else {
				// no width given, so fill to device edge if left/right not given

				if (!('left' in options)) {
					options.left = 0;
				}

				if (!('right' in options)) {
					options.right = 0;
				}
			}

			// ensure height, with a preference for a top/bottom combination

			if ('height' in options) {
				// if full vertical alignment is given, ignore the height property

				if ('top' in options && 'bottom' in options) {
					delete options.height;
				}
			} else {
				// no height given, so fill to device edge if top/bottom not given

				if (!('top' in options)) {
					options.top = 0;
				}

				if (!('bottom' in options)) {
					options.bottom = 0;
				}
			}

			// setting the CSS position

			function setPos(elm, prop) {
				if (prop in options) {
					elm.style[prop] = (typeof options[prop] === 'number') ? (options[prop] * wrapper.deviceDimensions.ratio) + 'px' : options[prop];
				} else {
					elm.style[prop] = '';
				}
			}

			var elm;

			if (this.isTopView) {
				// because body.style.height misbehaves, we make a wrapper <div> :(

				elm = document.body.querySelector('body > #gameContainer');
				if (!elm) {
					elm = document.createElement('div');
					elm.id = 'gameContainer';
					elm.style.position = 'relative';
					elm.style.overflow = 'scroll';
					elm.style.width = wrapper.deviceDimensions.width + 'px';
					elm.style.height = wrapper.deviceDimensions.height + 'px';

					var children = Array.prototype.slice.call(document.body.children, 0);
					for (var i = 0, len = children.length; i < len; i++) {
						elm.appendChild(children[i]);
					}

					document.body.appendChild(elm);
				}
			} else {
				elm = this.iframe;
			}

			if (!elm) {
				error = new Error('View ' + this.name + ' has no container (iframe/div) to resize.');
				console.warn(error);

				if (cb) {
					cb(error);
				}
				return;
			}

			// workaround because iframe alignment doesn't play nice inside of <html>

			if ('bottom' in options) {
				if ('top' in options) {
					options.height = wrapper.deviceDimensions.height - options.bottom - options.top;
				} else {
					options.top = wrapper.deviceDimensions.height - options.height - options.bottom;
				}

				delete options.bottom;
			}

			if ('right' in options) {
				if ('left' in options) {
					options.width = wrapper.deviceDimensions.width - options.right - options.left;
				} else {
					options.left = wrapper.deviceDimensions.width - options.width - options.right;
				}

				delete options.right;
			}

			setPos(elm, 'top');
			setPos(elm, 'left');
			setPos(elm, 'bottom');
			setPos(elm, 'right');
			setPos(elm, 'width');
			setPos(elm, 'height');

			if (cb) {
				window.setTimeout(function () {
					cb();
				}, 0);
			}
		}
	};


	View.prototype.load = function (src, cb) {
		var view = this;

		if (plugin) {
			plugin.load(
				this.name,
				src,
				function () {
					identifyView(view.name);

					if (cb) {
						cb();
					}
				},
				function (error) {
					console.warn(error);

					if (cb) {
						cb(error);
					}
				}
			);
		} else {
			if (this.isTopView) {
				window.top.location.href = src;
			} else {
				var iframe = this.iframe;

				if (!iframe) {
					var error = new Error('View ' + this.name + ' has no iframe to load into.');
					console.warn(error);

					if (cb) {
						cb(error);
					}
					return;
				}

				iframe.src = src;

				// iframes only load when they are in the document

				iframe.onload = function () {
					iframe.onload = null;

					identifyView(view.name);

					if (cb) {
						cb();
					}
				};
			}
		}
	};


	// clearing out a view

	View.prototype.clear = function () {
		this.load('data:,');
	};


	// show-animation definitions

	function getShowAnimation(options) {
		if (!options) {
			options = {};
		}

		var result = {
			duration: options.duration || 500
		};

		switch (options.type) {
		case 'fadeIn':
			result.fnStart = function (elm) {
				elm.style.opacity = '0';
				elm.style.webkitTransition = 'ease-in ' + result.duration + 'ms opacity';
				elm.style.pointerEvents = '';
			};

			result.fnEffect = function (elm) {
				elm.style.opacity = '1';
			};

			break;
		default:
			// a non-animation

			result.duration = 0;

			result.fnEffect = function (elm) {
				elm.style.pointerEvents = '';
				elm.style.opacity = '1';
			};
			break;

		}

		return result;
	}


	// hide-animation definitions

	function getHideAnimation(options) {
		if (!options) {
			options = {};
		}

		var result = {
			duration: options.duration || 500
		};

		switch (options.type) {
		case 'fadeOut':
			result.fnStart = function (elm) {
				elm.style.opacity = '1';
				elm.style.webkitTransition = 'ease-out ' + result.duration + 'ms opacity';
			};

			result.fnEffect = function (elm) {
				elm.style.opacity = '0';
			};

			result.fnFinal = function (elm) {
				elm.style.pointerEvents = 'none';
				elm.style.opacity = '0';
			};
			break;
		default:
			// a non-animation

			result.duration = 0;

			result.fnEffect = function (elm) {
				elm.style.pointerEvents = 'none';
				elm.style.opacity = '0';
			};
			break;

		}

		return result;
	}


	// apply an animation definition to a view

	function animate(view, animation, cb) {
		var error;

		// don't animate an already animating view

		if (view.isAnimating) {
			window.clearTimeout(view.isAnimating);
		}

		// if no animation given, this is an error

		if (!animation) {
			error = new Error('Animation definition missing on view ' + view.name + '.');

			if (cb) {
				cb(error);
			}
			return;
		}

		// get the element to animate

		var elm = view.iframe;

		if (!elm) {
			error = new Error('View ' + view.name + ' has no iframe to animate.');

			if (cb) {
				cb(error);
			}
			return;
		}

		if (animation.fnStart) {
			animation.fnStart(elm);
		}

		if (animation.fnEffect) {
			animation.fnEffect(elm);
		}

		view.isAnimating = window.setTimeout(function () {
			if (animation.fnFinal) {
				animation.fnFinal(elm);
			}

			view.isAnimating = false;

			if (cb) {
				cb();
			}
		}, animation.duration || 0);
	}


	// making a view visible

	View.prototype.show = function (options, cb) {
		if (!options) {
			options = {};
		}

		if (!options.animation && this.showAnimation) {
			options.animation = this.showAnimation;
		}

		wrapper.emit('view.show', this, options);

		if (plugin) {
			plugin.show(
				this.name,
				options,
				function () {
					if (cb) {
						cb();
					}
				},
				function (error) {
					console.warn(error);

					if (cb) {
						cb(error);
					}
				}
			);
		} else {
			animate(this, getShowAnimation(options.animation), cb);
		}
	};


	// making a view invisible

	View.prototype.hide = function (options, cb) {
		if (!options) {
			options = {};
		}

		if (!options.animation && this.hideAnimation) {
			options.animation = this.hideAnimation;
		}

		wrapper.emit('view.hide', this, options);

		if (plugin) {
			plugin.hide(
				this.name,
				options,
				function () {
					if (cb) {
						cb();
					}
				},
				function (error) {
					console.warn(error);

					if (cb) {
						cb(error);
					}
				}
			);
		} else {
			animate(this, getHideAnimation(options.animation), cb);
		}
	};


	// removing a view from the system

	View.prototype.destroy = function (cb) {
		if (plugin) {
			plugin.remove(
				this.name,
				function () {
					if (cb) {
						cb();
					}
				},
				function (error) {
					console.warn(error);

					if (cb) {
						cb(error);
					}
				}
			);
		} else {
			var iframe = this.iframe;

			if (!iframe) {
				var error = new Error('View ' + this.name + ' has no iframe to destroy.');

				if (cb) {
					cb(error);
				}
				return;
			}

			iframe.parentNode.removeChild(iframe);

			this.iframe = null;

			if (cb) {
				cb();
			}
		}
	};

}(window));
