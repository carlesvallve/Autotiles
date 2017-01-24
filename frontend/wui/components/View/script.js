(function (window) {

	function View() {
		window.wui.core.Dom.call(this)
		this.assign('div', { className: 'view', style: { display: 'none' } });
		this.setClassNames(this.constructor.name);
	}

	window.inherits(View, window.wui.core.Dom);

	window.wui.components.View = View;


	View.prototype.create = function (options, itemName) {

		options.parentElement.appendChild(this.rootElement);


		if (this.setup) {
			this.setup(options, itemName);
		}
		this.emit('create', options, itemName);
	};


	View.prototype.open = function (params) {
		var that = this;
		if (this.beforepaint) {
			this.beforepaint(params);
		}

		this.emit('beforeOpen', params);

		window.document.documentElement.scrollIntoView(true);

		this.rootElement.style.display = '';



		window.setTimeout(function () {
			if (that.afterpaint) {
				that.afterpaint(params);
			}
			that.emit('open', params);
		}, 0);

	};


	View.prototype.close = function () {
		this.rootElement.style.display = 'none';

		if (this.unpaint) {
			this.unpaint();
		}
		this.emit('close');
	};


	View.prototype.disableScrolling = function () {
		this.allowDomEvents();

		this.scrollingDisabled = true;
		var that = this;

		this.on('dom.touchmove', function (e) {
			// note: this does not work on a desktop

			if (that.scrollingDisabled) {
				e.preventDefault();
			}
		});
	};


	View.prototype.enableScrolling = function () {
		this.scrollingDisabled = false;
	};

}(window));
