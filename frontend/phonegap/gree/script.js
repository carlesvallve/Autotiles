(function (window) {
	if (!window.pg) {
		window.pg = {};
	}

	var gree = window.pg.gree = {};
	var plugin = window.gree;


	function error(message, cb) {
		var err = new Error(message || 'Error');
		console.warn(err);

		if (typeof cb === 'function') {
			cb(err);
		}
	}

	function success(data, cb) {
		if (typeof cb === 'function') {
			cb(null, data);
		}
	}


	// core APIs

	gree.authenticate = function (cb) {
		if (plugin) {
			plugin.authenticate(
				function (data) {
					if (data && data.id) {
						success(data, cb);
					} else {
						error('Authentication: no ID returned', cb);
					}
				},
				function () {
					error('Authentication failed', cb);
				}
			);
		} else {
			error('gree.authenticate not implemented', cb);
		}
	};


	gree.logout = function (cb) {
		if (plugin) {
			plugin.logout(
				function () {
					success(null, cb);
				},
				function () {
					error('Logout error', cb);
				}
			);
		} else {
			error('Not implemented', cb);
		}
	};


	// Fallback images for getThumbnail() below
	var fallbackThumbnails = {
		// 25x25 pink image
		small:  'iVBORw0KGgoAAAANSUhEUgAAABkAAAAZAQMAAAD+JxcgAAAAA1BMVEX/wMversVBAAAAC0lEQVQIHWMYSAAAAH0AAZLAsisAAAAASUVORK5CYII=',
		// 48x48 pink image
		normal: 'iVBORw0KGgoAAAANSUhEUgAAADAAAAAwAQMAAABtzGvEAAAAA1BMVEX/wMversVBAAAADElEQVQYGWMYBVQFAAFQAAHUa/NpAAAAAElFTkSuQmCC',
		// 76x48 pink image
		large:  'iVBORw0KGgoAAAANSUhEUgAAAEwAAAAwAQMAAACBuQ7SAAAAA1BMVEX/wMversVBAAAADklEQVQoFWMYBaMACQAAAhAAAfx0gEMAAAAASUVORK5CYII=',
		// 190x120 pink image
		huge:   'iVBORw0KGgoAAAANSUhEUgAAAL4AAAB4AQMAAAB2C9p3AAAAA1BMVEX/wMversVBAAAAGklEQVRIDe3BMQEAAADCIPunXg0PYAAAwL0AC7gAAQtWyn4AAAAASUVORK5CYII='
	};


	gree.getThumbnail = function (userId, size, cb) {
		// size must be either 'small' (25x25), 'normal' (48x48), 'large' (76x48) or 'huge' (190x120).
		if (plugin) {
			plugin.getThumbnail(
				userId,
				size,
				function (url) {
					success(url, cb);
				},
				function (message) {
					error(message, cb);
				}
			);
		} else {
			var data = fallbackThumbnails[size];
			if (!data) {
				return error('Invalid thumbnail size: ' + size, cb);
			}

			success('data:image/png;base64,' + data, cb);
		}
	};


	gree.showDashboard = function (animate) {
		if (animate === null || animate === undefined) {
			animate = true;
		} else {
			animate = !!animate;
		}

		if (plugin) {
			plugin.showDashboard(animate);
		} else {
			window.setTimeout(function () {
				window.alert('Displaying GREE dashboard');
			}, 0);
		}
	};


	// wallet API

	var wallet = gree.wallet = {};

	function PaymentItem(itemId, itemName, description, unitPrice, imageUrl, quantity) {
		this.itemId = itemId;
		this.itemName = itemName;
		this.description = description;
		this.unitPrice = unitPrice;
		this.imageUrl = imageUrl;
		this.quantity = quantity || 1;
	}

	wallet.PaymentItem = PaymentItem;


	wallet.paymentWithItems = function (items, messageToServer, callbackUrl, cb) {
		// items is an array of PaymentItem objects
		// messageToServer (string or null) is sent along to the callbackUrl
		// callbackUrl is the URL to which the gree SDK will connect to notify the game server

		if (plugin) {
			// the property names required by the PG plugin differ slightly from the naming used by GGP
			// so we translate them here

			items = items.map(function (item) {
				return {
					id: item.itemId,
					name: item.itemName,
					description: item.description,
					price: item.unitPrice,
					imageUrl: item.imageUrl,
					quantity: item.quantity
				};
			});

			plugin.wallet.paymentWithItems(
				items,
				messageToServer,
				callbackUrl,
				function (paymentId) {
					success(paymentId, cb);
				},
				function (message) {
					error(message, cb);
				}
			);
		} else {
			error('Not implemented', cb);
		}
	};


	wallet.completedPurchase = function (paymentId, purchaseStatus, cb) {
		if (plugin) {
			var itemObject = {
				paymentId: paymentId,
				status: purchaseStatus
			};

			plugin.wallet.completedPurchase(
				itemObject,
				function () {
					success(null, cb);
				},
				function (err) {
					error('CompletedPurchase error: ' + err, cb);
				}
			);
		} else {
			error('Not implemented', cb);
		}
	};


	wallet.getIncompletePurchases = function (cb) {
		if (plugin) {
			plugin.wallet.checkIncompletePurchase(
				function (purchases) {
					success(purchases, cb);
				},
				function (err) {
					error('getIncompletePurchases error: ' + err, cb);
				}
			);
		} else {
			error('Not implemented', cb);
		}
	};


	wallet.getBalance = function (cb) {
		if (plugin) {
			plugin.wallet.getBalance(
				function (balance) {
					success(balance, cb);
				},
				function (message) {
					error(message, cb);
				}
			);
		} else {
			error('Not implemented', cb);
		}
	};


	wallet.showDeposit = function (cb) {
		if (plugin) {
			plugin.wallet.showDeposit(
				function () {
					success(null, cb);
				},
				function (message) {
					error(message, cb);
				}
			);
		} else {
			error('Not implemented', cb);
		}
	};


	wallet.showDepositHistory = function (cb) {
		if (plugin) {
			plugin.wallet.showDepositHistory(
				function () {
					success(null, cb);
				},
				function (message) {
					error(message, cb);
				}
			);
		} else {
			error('Not implemented', cb);
		}
	};

}(window));

