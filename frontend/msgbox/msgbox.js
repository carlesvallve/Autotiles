(function () {

	function MsgBox(app, classnames) {
		var darkScreen = null;
		var closing = false;
		var _this = this;

		this.close = function () {
			if (closing) {
				return;
			}

			closing = true;
			darkScreen.className = 'msgbox';

			window.setTimeout(function () {
				darkScreen.parentElement.removeChild(darkScreen);
				darkScreen = null;
			}, 300);
		};

		darkScreen = document.createElement("DIV");
		darkScreen.className = 'msgbox';

		this.render = function (content, options, callback) {

			var notification = document.createElement("DIV");

			notification.className = classnames;
			darkScreen.appendChild(notification);

			if (!options.yes) {
				window.setTimeout(function () {
					app.ui.createButton(darkScreen, function () {
						if (callback) {
							callback(false);
						}
						_this.close();
					}, true);
					darkScreen.delClassName(["disabled","button"]);
				}, 700);
			}
			var titleElem = document.createElement("H1");
			titleElem.innerText = options.title;
			notification.appendChild(titleElem);

			var contentElement;
			if (!content) {
				content = '';
			}

			if (typeof content === 'string') {
				contentElement = document.createElement("P");
				contentElement.innerText = content;
			} else {
				//its a dom node
				contentElement = content;
			}

			notification.appendChild(contentElement);
			document.getElementById("viewport").appendChild(darkScreen);
			var buttons = document.createElement('div');
			buttons.addClassName("msgbox_buttons");

			if (options.cancel) {
				var noButton = document.createElement('div');
				noButton.className = 'btn_generic btn_sec';
				noButton.innerText = options.cancel;
				buttons.appendChild(noButton);
				app.ui.createButton(noButton, function () {
					_this.close();
					if (callback) {
						callback(false);
					}
				});
				noButton.delClassName(["disabled","button"]);
			}

			if (options.yes) {
				var yesButton = document.createElement('div');
				yesButton.className = 'btn_generic';
				yesButton.innerText = options.yes;
				buttons.appendChild(yesButton);
				app.ui.createButton(yesButton, function () {
					_this.close();
					if (callback) {
						callback(true);
					}
				});
				yesButton.delClassName(["disabled","button"]);

			} else {
				var closeButton = document.createElement("DIV");
				closeButton.addClassName("close");
				notification.appendChild(closeButton);
				app.ui.createButton(closeButton, function () {
					_this.close();
					if (callback) {
						callback(false);
					}
				});
				closeButton.delClassName(["disabled","button"]);
			}

			notification.appendChild(buttons);

			window.setTimeout(function () {
				darkScreen.className = 'msgbox open';
				notification.style.top =  (app.screenSize.height - notification.offsetHeight) / 2 + document.body.scrollTop + "px";
			}, 0);
		};
	}

	window.MsgBox = MsgBox;

}());