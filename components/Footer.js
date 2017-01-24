(function () {

	var Footer = function (params) {
		// init as a sprite
		this.initSprite(params);

		// create toolbar
		this.toolbar = new components.Toolbar({ view: this.view, parent: this, x: 2, y: 2, width: this.width-4, height: 28 });

		// create textures box
		this.tileset = new components.Tileset({ view: this.view, parent: this, gridSize: 28,
			x: 6, y: 32, width: this.width - 12, height: 32 }); // 28 * 12
	};


	Footer.prototype = new wuic.core.Sprite();
	components.Footer = Footer;


	Footer.prototype.draw = function(ctx) {
		ctx.save();
		ctx.globalAlpha = this.alpha;
		wuic.drawings.roundRect(ctx, this.x, this.y, this.width, 32 + this.tileset.height + 8, 0, '#111', null, this.alpha);
		ctx.restore();

		this.tileset.draw(ctx);
		this.toolbar.draw(ctx);
	};


	Footer.prototype.showTileset = function(open) {
		this.tileset.draw(window.context);
		var y = this.view.height - 32;
		if(open) { y = this.view.height - 32 - this.tileset.height - 8; }
		Tweener.addTween(this, { y: y, time: 0.1, transition: 'linear' });
		this.toolbar.tilesetOpen = open;
	}

}());

