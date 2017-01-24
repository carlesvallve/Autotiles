(function () {

	//create, open, close


	/***
	 * Constructor
	 * @return (Void)
	 */
	function View() {
		window.wuic.core.Sprite.call(this);
		this.name = 'default';
		this._components = [];
		this._visible = false;
	}

	window.inherits(View, window.wuic.core.Sprite);
	window.wuic.components.View = View;


	View.prototype.create = function (options, itemName) {
		this.name = itemName;
		this.context = options.parentElement;

		this.emit('created', options, itemName);
	};


	/***
	 * Open the view
	 * @params (Object) optional
	 */
	View.prototype.open = function (params) {
		if (this._visible) {
			return false;
		}

		this.emit('opening', params);
		this.show();
		this.emit('opened', params);
	};


	/***
	 * Close the view
	 * @params (Object) optional
	 */
	View.prototype.close = function (params) {
		if (!this._visible) {
			return false;
		}
		var that = this;
		//this.emit('beforeClose', params);
		this.hide();
		this.emit('closed');
	};


}());

