(function (window) {

	function ImageList() {
		this.images = [];
		this.map = {};

		var that = this;

		this.on('destroy', function () {
			var images = that.getAll();

			for (var i = 0, len = images.length; i < len; i++) {
				images[i].destroy();
			}

			that.images = [];
			that.map = {};
		});
	}

	ImageList.prototype = new window.wui.core.Dom();

	window.wui.components.ImageList = ImageList;


	ImageList.prototype.get = function (name) {
		return this.map[name] || null;
	};


	ImageList.prototype.getAll = function () {
		var list = [];

		for (var name in this.map) {
			list.push(this.map[name]);
		}

		return this.images.concat(list);
	};


	ImageList.prototype.appendChild = function (img, name) {
		if (name) {
			this.map[name] = img;
		} else {
			this.images.push(img);
		}
	};


	ImageList.prototype.load = function (cb) {
		// load all images and when all are done, call cb

		var images = this.getAll();
		var loaded = 0;
		var i, len = images.length;
		var errors;

		function callback(loadError, img) {
			if (loadError) {
				if (errors) {
					errors.push(img);
				} else {
					errors = [img];
				}
			}

			loaded += 1;

			if (loaded === len && cb) {
				cb(errors, images);
			}
		}

		for (i = 0; i < len; i++) {
			images[i].load(callback);
		}

		return images;
	};

}(window));
