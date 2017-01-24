(function () {

	var Msg = function (params) {
		// initialize props
		this.x = params && params.x ? params.x : canvasWidth / 2;
		this.y = params && params.y ? params.y : 0;
		this.alpha = params &&  params.alpha ? params.alpha : 1;
		this.color = params &&  params.color ? params.color : '#FFF';
		this.stroke = params &&  params.stroke ? params.stroke : true;
		this.font = params &&  params.font ? params.font : '50px MarkerFelt-Wide';
		this.lineHeight = params &&  params.lineHeight ? params.lineHeight : 80;
		this.visible = params &&  params.visible ? params.visible : false;

	};

	components.Msg = Msg;


	Msg.prototype.init = function(params) {
		var that = this;

		this.font = params &&  params.font ? params.font : '50px MarkerFelt-Wide';
		this.str = params &&  params.str ? params.str : 'Message';
		this.visible = true;
		this.alpha = 0;
		this.y = 200 + canvasHeight / 2;

		// tween-in
		var yy = canvasHeight / 2;
		Tweener.addTween(this, { y: yy, alpha: 1, time: 0.3, delay: params.start, transition: 'easeOutQuad',
			onComplete: function() {

			}
		});

		// tween-out
		yy = canvasHeight / 2 - 200;
		Tweener.addTween(this, { y: yy, alpha: 0, time: 0.3, delay: params.end, transition: 'easeInQuad',
			onComplete: function() {
				that.visible = false;
			}
		});
	};


	Msg.prototype.draw = function(ctx, params) {
		if(!this.visible) {
			return;
		}

		ctx.save();

		this.alpha = params &&  params.alpha ? params.alpha : this.alpha;
		this.x = params && params.x ? params.x : this.x;
		this.y = params && params.y ? params.y : this.y;

		ctx.globalAlpha = this.alpha;
		ctx.font = this.font;
		ctx.fillStyle = this.color;
		ctx.textBaseLine = 'top';
		ctx.strokeStyle = 'black';
		ctx.lineWidth = 1;
		ctx.textAlign = 'center';

		utils.drawMultilineText(ctx, this.str, this.x, this.y, this.lineHeight, this.stroke);

		ctx.restore();
	};

}());