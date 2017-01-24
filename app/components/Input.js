(function () {

	/***
	 * Generic button component
	 *
	 * @param params
	 * x, y, width, height, asset, caption, fontSize
	 */

	var Input = function Input(params) {

		// creation

		this.elm = document.createElement('input');
		this.elm.type = params.type || 'text';
		this.elm.value = params.caption || '';
		document.body.appendChild(this.elm);


		// Methods

		this.hide = function() {
			//this.elm.style.visiblility = 'hidden';
			this.elm.style.display = 'none';
		};


		this.show = function() {
			//this.elm.style.visibility = 'visible';
			this.elm.style.display = 'block';
		};


		this.locate = function(x, y) {
			this.elm.style.left = x + 'px';
			this.elm.style.top = y + 'px';
		};


		this.resize = function(w, h) {
			this.elm.style.width = w + 'px';
			this.elm.style.height = h + 'px';
		};


		this.align = function(align) {
			this.elm.style.textAlign = align;
		};


		// Initialization

		this.resize(params.width || 200, params.height || 20);
		this.locate(params.x || 0, params.y || 0);
		this.align(params.align || 'center');
		this.hide();

	};

	window.components.Input = Input;


}());

