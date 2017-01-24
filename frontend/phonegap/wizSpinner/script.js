(function (window) {

	// create a namespace for phonegap plugin wrappers

	if (!window.pg) {
		window.pg = {};
	}

	var document = window.document;
	var Error = window.Error;
	var plugin = window.wizSpinner || window.nativeSpinner || null;


	// create and register the wrapper object

	var wrapper = {};

	window.pg.wizSpinner = wrapper;

	// create

	var overlay, spinner, spinnerAnimStyle, text;
	var lastOptions = {};


	function mergeOptions(o) {
		if (o) {
			for (var key in o) {
				lastOptions[key] = o[key];
			}
		}

		return lastOptions;
	}


	function createOverlay(options) {
		if (!overlay) {
			overlay = document.createElement('div');
			overlay.style.display = 'none';
			overlay.style.position = 'absolute';
			overlay.style.left = '0';
			overlay.style.top = '0';
			overlay.style.zIndex = '9999';
			overlay.style.width = '100%';
			overlay.style.height = '100%';
			document.documentElement.appendChild(overlay);
		}

		overlay.style.background = 'rgba(0,0,0,' + (options.opacity || '0') + ')';
	}


	function createSpinner(options) {
		var bar, i, style;

		if (!options.showSpinner) {
			if (spinner) {
				overlay.removeChild(spinner);
				spinner = null;
			}
			return;
		}

		if (!spinnerAnimStyle) {
			spinnerAnimStyle = document.createElement('style');
			spinnerAnimStyle.type = 'text/css';
			spinnerAnimStyle.innerHTML = '@-webkit-keyframes wizSpinnerFade { from { opacity: 1; } to { opacity: 0.25; } }';
			document.head.appendChild(spinnerAnimStyle);
		}

		if (!spinner) {
			spinner = document.createElement('div');
			spinner.style.position = 'relative';
			spinner.style.width = '30px';
			spinner.style.height = '30px';
			spinner.style.margin = 'auto';

			overlay.appendChild(spinner);
		} else {
			spinner.innerHTML = '';
		}

		if (options.position === 'low') {
			spinner.style.top = (window.innerHeight / 1.5) + 'px';
		} else {
			spinner.style.top = (window.innerHeight / 2) + 'px';
		}

		for (i = 0; i < 12; i++) {
			bar = document.createElement('div');
			style = bar.style;

			style.width = '12%';
			style.height = '26%';
			style.background = options.spinnerColour || 'white';
			style.position = 'absolute';
			style.left = '44.5%';
			style.top = '37%';
			style.opacity = '0';
			style['-webkit-border-radius'] = '50px';
			style['-webkit-box-shadow'] = '0 0 3px rgba(0,0,0,0.2)';

			style['-webkit-transform'] = 'rotate(' + (i * 30) + 'deg) translate(0, -142%)';
			style['-webkit-animation'] = 'wizSpinnerFade 1s linear infinite';
			style['-webkit-animation-delay'] = ((i - 11) / 12) + 's';

			spinner.appendChild(bar);
		}
	}


	function createText(options) {
		if (!options.labelText) {
			if (text) {
				overlay.removeChild(text);
			}
			return;
		}

		if (!text) {
			text = document.createElement('span');
			text.style.display = 'block';
			text.style.position = 'absolute';
			text.style.top = '60%';
			text.style.width = '100%';
			text.style.textAlign = 'center';
			text.style.fontFamily = 'Helvetica';
			text.style.fontStyle = 'italic';
			text.style.fontSize = '13px';
		}

		text.style.color = options.textColour || 'white';
		text.innerText = options.labelText; // newlines should break

		overlay.appendChild(text);
	}


	// show

	wrapper.show = function (options) {
		if (plugin) {
			plugin.show(options);
		} else {
			options = mergeOptions(options);

			createOverlay(options);
			createSpinner(options);
			createText(options);

			overlay.style.display = '';
		}
	};


	// hide

	wrapper.hide = function () {
		if (plugin) {
			plugin.hide();
		} else {
			if (overlay) {
				overlay.style.display = 'none';
			}
		}
	};


	// rotate

	wrapper.rotate = function (orientation) {
		if (plugin) {
			plugin.rotate(orientation);
		} else {
			console.info('Rotating to', orientation);
		}
	};

}(window));
