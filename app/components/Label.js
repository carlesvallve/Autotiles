(function () {

	var Label = function Label(params) {
		wuic.core.Sprite.call(this);

		// init vars
		this.alpha = params & params.alpha ? params.alpha : 1;
		this.gridSize = params.gridSize;
		this.gridx = params.gridx;
		this.gridy = params.gridy;

		// define font and caption
		this.color = params.color || '#000';
		this.fontName = params.fontName || 'serif';
		this.fontSize = params.fontSize || 12;
		this.caption = params.caption || ('' + utils.randomInt(1,20) * 10);
		this.stroke = params.stroke || null;

		this.shadow = true;

		this.tweens = {};


		//-----------------------------------
		// Render
		//-----------------------------------

		this.setRenderMethod(function (ctx) {

			// set sprite pos to grid pos
			this.x = this.gridx * this.gridSize + this.gridSize / 1.9;
			this.y = this.gridy * this.gridSize + this.gridSize / 1.7;

			// get global pos
			//var pos = { x: this.gx(), y: this.gy() };

			if(this.shadow) {
				context.shadowOffsetX = 0;
				 context.shadowOffsetY = 2;
				 context.shadowBlur = 5;
				 context.shadowColor = "black";
			}

			//ctx.fillRect(0,0, this.gridSize, this.gridSize, '#f0f');

			// draw label
			ctx.fillStyle = this.color;
			ctx.font ='bold '+ this.fontSize + 'px ' + this.fontName;
			ctx.textAlign = 'center';
			ctx.textBaseline = 'center';
			ctx.fillText(this.caption, 0, 0);

			// draw label stroke
			if(this.stroke) {
				ctx.lineWidth = 1;
				ctx.strokeStyle = this.stroke;
				ctx.strokeText(this.caption, 0, 0);
			}

		});


	};


	window.inherits(Label, window.wuic.core.Sprite);
	window.components.Label = Label;





}());

