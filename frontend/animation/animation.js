var wizAnimCount = 0;

function wizAnimation(elm, forced) {
	forced = (forced !== "2d" && forced !== "3d") ? "auto" : forced;

	var head = document.getElementsByTagName("head")[0];
	var animation_name = "animation-" + (++wizAnimCount);
	this.name = animation_name;
	var styleDOM = document.createElement('style');
	styleDOM.id = animation_name;

	var animation_style = [];
	var finalStyle = null;
	var keyframes = {};
	var styles = {};
	var animSetting = {};

	var currentStyle = window.getComputedStyle(elm);
	var originalStyle = elm.style.cssText;
	var isFinish = false;

	var cleanAnimation = false;
	this.onfinish = function () {};
	this.elm = elm;
	var _this = this;

	var createStyle = function (styles) {
		/*
		* TODO:
		* Testing the easing property for each frame;
		*/

		var styleTxt = [];
		for (var style in styles) {
			switch (style) {
			case "transform":
				var strTransform = "";

				if (forced === "3d") {
					var matrix = [];
					for (var i = 1; i < 5; i++) {
						for (var j = 1; j < 5; j++) {
							matrix.push(styles[style]["m" + i + j]);
						}
					}
					strTransform = "matrix3d(" + matrix.join(",") + ")";
				} else if (forced === "2d") {
					var m = new MatrixConverter(styles[style]);
					strTransform += " translate(" + m.translate.x + "px, " + m.translate.y + "px)";
					strTransform += " rotate(" + m.rotate.z + "deg)";
					strTransform += " scale(" + m.scale.x + "," + m.scale.y + ")";

				} else {
					strTransform = styles[style];
				}
				styleTxt.push("-webkit-transform: " + strTransform + ";");
				break;

			case "timing":
				styleTxt.push("-webkit-animation-timing-function: " + styles[style] + ";");
				break;

			default:
				styleTxt.push(style + ": " + styles[style] + ";");
				break;
			}
		}
		return styleTxt.join(" ");
	};

	this.addKeyframe = function (time, style) {
		for (var css in style) {
			styles[css] = true;
		}
		keyframes[time] = style;
	};


	this.animationClean = function () {
		styleDOM.innerHTML = "";
		elm.style.cssText = originalStyle;

		if (styleDOM.parentNode) {
			head.removeChild(styleDOM);
		}
	};

    this.animationReset = function () {
        elm.style.cssText = originalStyle;
    };

	var animationEnd = function () {
		//elm.style.webkitAnimationPlayState = "";

		if (!isFinish) {
			//isFinish = true;
			if (forced === "2d") {
				elm.style.cssText = originalStyle + finalStyle;
				elm.style.webkitAnimation = "";
			}

			if (cleanAnimation) {
				_this.animationClean();
			}

			_this.onfinish();
		}
	};

	this.prepare = function (settings) {
		/*  For better permormance of an animation stage:
		*  prepare each indivual animation on init
		*  clean each individual animation on end (set clean to false)
		*/

		settings = settings || {};
		var i, nbKeys;

		var keys = Object.keys(keyframes);
		var duration = 0;

		for (i = 0, nbKeys = keys.length; i < nbKeys; i++) {
			var key = parseInt(keys[i], 10);

			keys[i] = key;

			if (key > duration) {
				duration = key;
			}
		}

		//delay = (delay < 0 || isNaN(delay))? 0 : delay;
		//var duration = (keys.max() >>> 0) + delay;

		cleanAnimation = settings.clean || false;

		animSetting = settings;
		animSetting.duration = duration;

		//firstStyle = createStyle(keyframes[0]);
		finalStyle = createStyle(keyframes[duration]);

		if (keyframes['0'] === undefined) {
			keys.push(0);
			keyframes['0'] = {};
		}

		keys.sort(function (a, b) {
			return a - b;
		});

		// Creating the animation keyframes style

		animation_style.push("@-webkit-keyframes " + animation_name + " {");

		for (i = 0, nbKeys = keys.length; i < nbKeys; i++) {
			var time = keys[i];

			for (var css in styles) {
				if (keyframes[time][css] === undefined) {
					var cssBrowser = (css === "transform") ? "webkitTransform" : css;

					if (time < 1) {
						if (css === "transform" && currentStyle[cssBrowser] === "none") {
							keyframes[time][css] = elm.getTransformMatrix();
/*
						} else {
							keyframes[time][css] = currentStyle[cssBrowser];
*/
						}
					} else {
						keyframes[time][css] = keyframes[keys[i - 1]][css];
					}
				}
			}

			animation_style.push((time / duration * 100).toFixed(2) + "%");
			animation_style.push("{" + createStyle(keyframes[time]) + "}");
		}
		animation_style.push("}");
		styleDOM.innerHTML = animation_style.join(" ");
		head.appendChild(styleDOM);
	};

	this.startAnimation = function () {
		elm.addEventListener("webkitAnimationEnd", function (e) {
			e.stopPropagation();
			if (e.animationName === animation_name) {
				this.removeEventListener("webkitAnimationEnd", arguments.callee, false);
				window.setTimeout(animationEnd, 0);
			}
		}, false);

		//window.setTimeout(animationEnd, animSetting.delay + animSetting.duration + 150);

		elm.style.webkitAnimationName = 'none';
		elm.style.webkitAnimationFillMode = 'none';

		window.setTimeout(function () {
			elm.style.webkitAnimationDuration = animSetting.duration + 'ms';
			elm.style.webkitAnimationIterationCount = animSetting.iteration || 1;
			elm.style.webkitAnimationDirection = animSetting.direction || "normal";
			elm.style.webkitAnimationTimingFunction = animSetting.easing || "linear";
			elm.style.webkitAnimationName = animation_name;
			elm.style.webkitAnimationDelay = (animSetting.delay || 0) + 'ms';
			elm.style.webkitAnimationFillMode = 'both';
		}, 0);
	};



	/*********************************************************
	* From Here Extra option not used in the game, yet *
	*********************************************************/
	/*
	this.stop = function() {
		elm.style.webkitAnimationPlayState = "paused";

		var computedStyle = document.defaultView.getComputedStyle(elm,null);
		finalStyle.webkitTransform = computedStyle.getPropertyValue("-webkit-transform");
		finalStyle.opacity = computedStyle.getPropertyValue("opacity");

		animationEnd(function(){});
	};

	this.pause = function() {
		elm.style.webkitAnimationPlayState = "paused";
	};

	this.resume = function() {
		elm.style.webkitAnimationPlayState = "running";
	};
	*/
}
