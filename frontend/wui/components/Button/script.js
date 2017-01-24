(function (window) {

	var wui = window.wui;


	function Button(caption) {
		var div = document.createElement('div');
		div.className = 'button';
		div.innerText = caption;
		this.assign(div);

		wui.behaviors.button(this);
	}

	Button.prototype = new wui.core.Dom();

	wui.components.Button = Button;

}(window));
