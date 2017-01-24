(function () {

	var Header = function (params) {
		// init as a sprite
		this.initSprite(params);
	};


	Header.prototype = new wuic.core.Sprite();
	components.Header = Header;


	Header.prototype.draw = function(ctx) {
		ctx.save();

		// draw bg
		ctx.globalAlpha = this.alpha;
		wuic.drawings.roundRect(ctx, this.x, this.y, this.width, this.height, 0, '#111', null, this.alpha);

		ctx.restore();

		ctx.save();

		// draw score
		/*ctx.fillStyle = '#fff';
		ctx.font ='normal 12px Stencil';
		ctx.textAlign = 'left';
		ctx.textBaseline = 'top';
		ctx.fillText('Score ' + window.game.player.score, 9, 9);

		// draw moves
		ctx.fillStyle = '#fff';
		ctx.font ='normal 12px Stencil';
		ctx.textAlign = 'right';
		ctx.textBaseline = 'top';
		ctx.fillText(window.game.player.moves + ' Moves', canvasWidth - 9, 9);*/

		ctx.restore();
	};


}());

