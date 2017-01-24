(function () {
	window.audioLoaderClass = function () {
		var that = this;
		var list = [];
		var total = null;
		var cb = null;
		var onFileLoad = null;

		this.setCallback = function (callback) {
			cb = callback;
		};

		this.add = function (audioObj, src) {
			list.push({audioObj: audioObj, src: src});
		};

		// the function will receive 2 parameters: the current number of files loaded and the total number
		this.setOnFileLoad = function (fn) {
			if(typeof fn == 'function') {
				onFileLoad = fn;
			}
		};

		this.start = function () {
			total = list.length;
			var audioOnLoadFunction = function() {
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
				list[i].audioObj.addEventListener('canplaythrough', audioOnLoadFunction);
				list[i].audioObj.src = list[i].src;
				list[i].audioObj.load();
			}
		};
	};

	//window.audioLoader = new audioLoaderClass();
})();