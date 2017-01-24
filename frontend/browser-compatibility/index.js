(function (window) {

	var lib = window.browserCompatibility = {};

	// browser version sniffing
	//TODO: use a PhoneGap wrapper to use window.device instead of parsing navigator.userAgent
	//see: http://docs.phonegap.com/en/2.3.0/cordova_device_device.md.html#Device

	lib.ua = {};

	var ua = window.navigator.userAgent.toLowerCase();


	function versionCompare(a, b) {
		a = a.split('.');
		b = b.split('.');

		var minLength = Math.min(a.length, b.length);

		for (var i = 0; i < minLength; i++) {
			var va = a.shift();
			var vb = b.shift();

			if (va === vb) {
				continue;
			}

			while (va.length > 0 || vb.length > 0) {
				var na = va.match(/^0*([0-9]+)/);
				var nb = vb.match(/^0*([0-9]+)/);

				if (na) {
					va = va.substring(na[0].length);
				}
				if (nb) {
					vb = vb.substring(nb[0].length);
				}

				na = na ? parseInt(na[1], 10) : 0;
				nb = nb ? parseInt(nb[1], 10) : 0;

				if (na !== nb) {
					return (na < nb) ? -1 : 1;
				}

				// both numeric versions equal, check non-numeric part

				na = va.match(/^([^0-9]+?)/);
				nb = vb.match(/^([^0-9]+?)/);

				if (na) {
					va = va.substring(na[0].length);
				}
				if (nb) {
					vb = vb.substring(nb[0].length);
				}

				na = na ? na[1] : '';
				nb = nb ? nb[1] : '';

				if (na !== nb) {
					return (na < nb) ? -1 : 1;
				}
			}
		}

		if (a.length === b.length) {
			return 0;
		}

		return (a.length < b.length) ? -1 : 1;
	}


	lib.ua.getWebKitVersion = function () {
		var m = ua.match(/(applewebkit\/)([0-9]+(?:\.[0-9]*)*)/);
		if (m) {
			return m[2];
		}

		return false;
	};


	lib.ua.isIOS = function () {
		// TODO: use navigator.platform instead
		return ua.indexOf('iphone') > -1 || ua.indexOf('ipod') > -1 || ua.indexOf('ipad') > -1;
	};


	lib.ua.isAndroid = function () {
		// TODO: use navigator.platform instead
		return ua.indexOf('android') > -1;
	};


	lib.ua.isMinWebKitVersion = function (version) {
		return versionCompare(lib.ua.getWebKitVersion(), version) >= 0;
	};


	lib.ua.getIOSVersion = function () {
		if (!lib.ua.isIOS()) {
			return false;
		}

		var m = ua.match(/os ([0-9]+(_[0-9]+)*)/);
		if (m) {
			return m[1].replace(/_/g, '.');
		}

		return false;
	};


	lib.ua.getAndroidVersion = function () {
		var m = ua.match(/android ([0-9]+(\.[0-9]+)?)/);
		if (m) {
			return m[1];
		}

		return false;
	};

}(window));

