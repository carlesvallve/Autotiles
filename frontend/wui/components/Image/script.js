(function (window) {

	function Image(asset) {
		if (asset.getUrl) {
			this.setAsset(asset);
		} else if (typeof asset === 'string') {
			this.setUrl(asset);
		}
	}

	Image.prototype = new window.wui.core.Dom();

	window.wui.components.Image = Image;


	Image.prototype.setAsset = function (asset) {
		this.asset = asset;
		this.url = null;
		this.loaded = false;
	};


	Image.prototype.setUrl = function (url) {
		this.asset = null;
		this.url = url;
		this.loaded = false;
	};


	Image.prototype.getUrl = function () {
		return this.url || this.asset.getUrl();
	};


	Image.prototype.load = function (cb) {
		if (this.loaded) {
			if (cb) {
				cb(null, this);
			}
			return;
		}

		var that = this;

		if (!this.rootElement) {
			this.assign(new window.Image());
		}

		var img = this.rootElement;

		img.onload = function () {
			that.loaded = true;
			img.onload = null;
			img.onerror = null;

			if (cb) {
				cb(null, that);
			}
		};

		img.onerror = function (domEvent) {
			that.loaded = false;
			img.onload = null;
			img.onerror = null;

			if (cb) {
				cb(domEvent, that);
			}
		};

		img.src = this.getUrl();
	};

}(window));

