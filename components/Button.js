(function () {

	var Button = function (params) {
		// init as a sprite
		this.initSprite(params);

		this.color = params.color || '#fff';
		this.fontName = params.fontName || 'Stencil';
		this.fontSize = params.fontSize || 16;
		this.caption = params.caption || ('' + utils.randomInt(1,20) * 10);
		this.stroke = params.stroke || '#fff'; // '#000';
		this.corners = params.corners || 5;
		this.shadow = params.shadow || false; // '#000';

		this.captionOffset = params.captionOffset || 5;

		if(params.corners === 0) { this.corners = 0; }
		if(params.alpha === 0) { this.alpha = 0; }


		// assign buttonBehavior
		buttonBehavior.register(this);

	};


	Button.prototype = new wuic.core.Sprite();
	components.Button = Button;


	Button.prototype.draw = function (ctx) {
		ctx.save();
		ctx.globalAlpha = this.alpha;

		var pos = { x: this.gx(), y: this.gy() };

		if(this.asset) {
			ctx.drawImage(this.asset, pos.x, pos.y, this.width , this.height);
		} else {

			if(this.shadow) {
				/*context.shadowOffsetX = 0;
				context.shadowOffsetY = 2;
				context.shadowBlur = 5;
				context.shadowColor = "black";*/
			}

			wuic.drawings.roundRect(ctx, pos.x, pos.y, this.width, this.height, this.corners, '#000', this.stroke, this.alpha, 1, 0.5);

			// draw label
			ctx.globalAlpha = 1;
			ctx.fillStyle = this.color;
			ctx.font ='normal '+ this.fontSize + 'px ' + this.fontName;
			ctx.textAlign = 'center';
			ctx.textBaseline = 'center';
			ctx.fillText(this.caption, pos.x + this.width / 2, pos.y + this.height / 2 + this.captionOffset);

		}

		ctx.restore();
	};

}());

