(function () {

	/***
	 * Generic Menu component
	 *
	 * @param params
	 * x, y, width, height, asset, caption, fontSize
	 */

	var Menu = function Button(params) {
		wuic.core.Sprite.call(this);
		var that = this;

		this.asset = params && params.asset || null;
		this.x = params && params.x || 0;
		this.y = params && params.y || 0;
		this.width = params && params.width || 115;
		this.height = params && params.height || 45;
		this.alpha = params && params.alpha || 1;

		var arr = params && params.arr || [];
		var cb = params && params.cb || null;

		var corners = params && params.corners || 5;
		var bgcolor = params && params.bgcolor || '#333';
		var fgcolor = params && params.fgcolor || '#fff';
		var lineWidth = params && params.lineWidth || 0;

		this.items = [];
		this.selectedItem = null;


		// create menu buttons

		function createButton(i) {
			var y = 5 + i * (that.height + 5);
			var h = that.height;
			var but = new window.components.Button({ caption: arr[i], x: 5, y: y, width: that.width - 10, height: h });
			but.num = i;
			that.appendChild(but);
			that.items.push(but);

			but.on('tapstart', function (event, pos) {
				// select the button for future use
				that.selectItem(i);

				// call the menu callback in xase is given
				if(cb) {
					cb({ num: i, caption: arr[i] });
				}
			});
		}

		for (var i = 0, len = arr.length; i < len; i++) {
			createButton(i);
		}


		// select menu item

		this.selectItem = function (num) {
			this.selectedItem = that.items[num];
			for (var i = 0, len = arr.length; i < len; i++) {
				that.items[i].setCaption({ color: '#fff' });
			}
			this.selectedItem.setCaption({ color: '#ff0' });
		};


		//-----------------------------------
		// Render
		//-----------------------------------

		this.setRenderMethod(function (ctx) {
			// if button has a caption means that the asset will be generically composed,
			// if not, we just draw the asset as normal

			if(this.asset) {
				ctx.drawImage(this.asset, 0, 0, this.width, this.height);
			} else {
				window.drawings.roundRect(ctx, 0, 0, this.width, 5 + (this.height + 5) * arr.length, corners, bgcolor, fgcolor, lineWidth);
			}

			/*if(caption) {
				// write caption
				ctx.fillStyle = '#fff';
				ctx.font ='bold ' + fontSize + 'px ' + font;
				ctx.textAlign = 'center';
				ctx.textBaseline = 'center';
				ctx.fillText(caption, this.width / 2, 4 * window.res + this.height / 2);
			}*/
		});
	};


	window.inherits(Menu, window.wuic.core.Sprite);
	window.components.Menu = Menu;


}());

