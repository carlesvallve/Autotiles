(function () {

	var Background = function (width, height, increments, alpha) {
		// init vars
		this.width = width || canvasWidth;
		this.height = height || canvasHeight;
		this.pos = { x: 0, y: 0 };
		this.inc = increments || { x: 0, y: 0 };
		this.alpha = alpha || 1;

		// create canvas as background asset
		var canvas = document.createElement('canvas');
		canvas.width = this.width;
		canvas.height = this.height;
		this.asset = canvas;
	};


	components.Background = Background;

	Background.prototype.init = function(bg) {
		// draw given background image into canvas asset
		var ctx = this.asset.getContext('2d');
		ctx.drawImage(bg, 0, 0, this.width , this.height);
	};

	Background.prototype.draw = function(ctx) {
		ctx.save();
		ctx.globalAlpha = this.alpha;

		ctx.drawImage(this.asset, this.pos.x, this.pos.y, this.asset.width, this.height);
		if(this.inc.x != 0) {
			ctx.drawImage(this.asset, this.pos.x + this.asset.width, this.pos.y, this.asset.width, this.height);
			if(this.inc.x > 0 && this.pos.x > 0) { this.pos.x = - this.asset.width }
			if(this.inc.x < 0 && this.pos.x < - this.asset.width) { this.pos.x = 0 }
		}
		if(this.inc.y != 0) {
			ctx.drawImage(this.asset, this.pos.x, this.pos.y + this.asset.height, this.asset.width, this.height);
			if(this.inc.y > 0 && this.pos.y > 0) { this.pos.y = - this.asset.height }
			if(this.inc.y < 0 && this.pos.y < - this.asset.height) { this.pos.y = 0 }
		}

		this.pos.x += this.inc.x;
		this.pos.y += this.inc.y;

		ctx.restore();
	};


}());

