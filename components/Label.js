(function () {

	var Label = function (params) {
		params.width = params.size;
		params.height = params.size;

		// init vars;
		this.gridx = params.gridx;
		this.gridy = params.gridy;
		this.x = this.gridx * params.gridSize;
		this.y = this.gridy * params.gridSize;
		this.gridSize = params.gridSize;
		this.size = params.size;

		// init as a sprite
		this.initSprite(params);

		// define font and caption
		this.color = params.color || '#000';
		this.fontName = params.fontName || 'serif';
		this.fontSize = params.fontSize || 12; // 16
		this.caption = params.caption || ('' + utils.randomInt(1,20) * 10);

		this.stroke = params.stroke || null; // '#000';
		this.shadow = false;
	};


	Label.prototype = new wuic.core.Sprite();
	components.Label = Label;


	Label.prototype.draw = function(ctx) {
		ctx.save();
		ctx.globalAlpha = this.alpha;

		// set sprite pos to grid pos
		this.x = this.gridx * this.gridSize + this.gridSize / 2;
		this.y = this.gridy * this.gridSize + this.gridSize / 2 + 6;

		// get global pos
		var pos = { x: this.gx(), y: this.gy() };

		if(this.shadow) {
			/*context.shadowOffsetX = 0;
			context.shadowOffsetY = 2;
			context.shadowBlur = 5;
			context.shadowColor = "black";*/
		}

		// draw label
		ctx.fillStyle = this.color;
		ctx.font ='bold '+ this.fontSize + 'px ' + this.fontName;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'center';
		ctx.fillText(this.caption, pos.x, pos.y);

		// draw label stroke
		if(this.stroke) {
			ctx.lineWidth = 1;
			ctx.strokeStyle = this.stroke;
			ctx.strokeText(this.caption, pos.x, pos.y);
		}

		ctx.restore();
	};


}());

