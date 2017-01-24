(function () {

	var Background = function Background(params) {
		wuic.core.Sprite.call(this);

		// init vars
		this.asset = params && params.asset || assets.bg1;
		this.width = params && params.width || canvasWidth;
		this.height = params && params.height || canvasHeight;
		this.alpha = params && params.alpha || 1;
		this.inc = params && params.inc || { x: 0, y: -1 };


		//-----------------------------------
		// Render
		//-----------------------------------

		this.setRenderMethod(function (ctx) {

			ctx.drawImage(this.asset, 0, 0, this.width, this.height);

			if(this.inc.x != 0) {
				ctx.drawImage(this.asset, this.width, 0, this.width, this.height);
				if(this.inc.x > 0 && this.x > 0) { this.x = - this.width; }
				if(this.inc.x < 0 && this.x < - this.width) { this.x = 0; }
			}
			if(this.inc.y != 0) {
				ctx.drawImage(this.asset, 0, this.height, this.width, this.height);
				if(this.inc.y > 0 && this.y > 0) { this.y = - this.height; }
				if(this.inc.y < 0 && this.y < - this.height) { this.y = 0; }
			}

			this.x += this.inc.x;
			this.y += this.inc.y;

		});

	};


	window.inherits(Background, window.wuic.core.Sprite);
	window.components.Background = Background;

}());




