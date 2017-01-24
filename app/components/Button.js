(function () {

	/***
	 * Generic button component
	 *
	 * @param params
	 * x, y, width, height, asset, caption, fontSize
	 */

	var Button = function Button(params) {
		wuic.core.Sprite.call(this);

		this.asset = params && params.asset || null;
		this.x = params && params.x || 0;
		this.y = params && params.y || 0;
		this.width = params && params.width || 115;
		this.height = params && params.height || 45;
		this.alpha = params && params.alpha || 1;

		var caption = params && params.caption || null;
		var font = params && params.font ? params.font : 'godofwar';
		var fontSize = (params && params.fontSize ? params.fontSize : 14);
		var color = params && params.color ? params.color : '#fff';
		var cb = params && params.cb || null;

		var corners = params && params.corners || 5;
		var bgcolor = params && params.bgcolor || '#000';
		var fgcolor = params && params.fgcolor || '#fff';
		var lineWidth = params && params.lineWidth || 0;

		// set as button
		window.wuic.behaviors.button(this);

		//-----------------------------------
		// Handlers
		//-----------------------------------

		this.setCaption = function (params) {
			caption = params.caption || caption;
			fontSize = params.fontSize || fontSize;
			color = params.color || color;
		};
		this.setCaption({ caption: caption, fontSize: fontSize });

		this.getCaption = function () {
			return caption;
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
				window.drawings.roundRect(ctx, 0, 0, this.width, this.height, corners, bgcolor, fgcolor, lineWidth);
			}

			if(caption) {
				// write caption
				ctx.fillStyle = color;
				ctx.font ='bold ' + fontSize + 'px ' + font;
				ctx.textAlign = 'center';
				ctx.textBaseline = 'center';
				ctx.fillText(caption, this.width / 2, 4 + this.height / 2);
			}
		});
	};


	window.inherits(Button, window.wuic.core.Sprite);
	window.components.Button = Button;


}());

