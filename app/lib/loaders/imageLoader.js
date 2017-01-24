(function () {
	window.imgLoaderClass = function () {
		var that = this;
		var list = [];
		var total = null;
		var cb = null;
		var onFileLoad = null;

		this.setCallback = function (callback) {
			cb = callback;
		};

		this.add = function (img, src) {
			list.push({img: img, src: src});
		};

		// the function will receive 2 parameters: the current number of files loaded and the total number
		this.setOnFileLoad = function (fn) {
			if(typeof fn == 'function') {
				onFileLoad = fn;
			}
		};

		this.start = function () {
			total = list.length;
			var imgOnLoadFunction = function() {
				total--;
				if(total === 0) {
					// All assets loaded
					if(typeof cb == 'function') {
						cb();
					}
				} else {
					if (onFileLoad) {
						onFileLoad(list.length - total, list.length);
					}
				}
			};
			for(var i = 0; i < list.length; i++) {
				list[i].img.onload = imgOnLoadFunction;
				list[i].img.src = list[i].src;
			}
		};
	};

	//window.imgLoader = new imgLoaderClass();
})();

