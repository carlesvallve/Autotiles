(function () {

	var GridOverlay = function Footer(params) {
		wuic.core.Sprite.call(this);
		var view = navTree.getItem('game');

		var tilesX = params.tilesX;
		var tilesY = params.tilesY;
		var gridSize = params.gridSize;

		this.width = tilesX * gridSize;
		this.height = tilesY * gridSize;
		this.x = params && params.x != null ? params.x : (view.width - this.width) / 2;
		this.y = params && params.y != null ? params.y : (view.height - this.height) / 2;


		//-----------------------------------
		// Init
		//-----------------------------------

		this.init = function(params) {
			// init params
			tilesX = params.tilesX;
			tilesY = params.tilesY;
			this.width = tilesX * gridSize;
			this.height = tilesY * gridSize;
			this.x = 0;
			this.y = 32;
		};


		//-----------------------------------
		// Render
		//-----------------------------------

		this.setRenderMethod(function (ctx) {
			// draw grid lines in 'over' mode
			if(view.grid.options.grid.arr[view.grid.options.grid.value] === 'over') {
				var xx, yy;
				for (var x = 0; x < tilesX; x++) {
					for (var y = 0; y < tilesY; y++) {
						xx = x * gridSize;
						yy = y * gridSize;
						window.drawings.roundRect(ctx, xx, yy, gridSize, gridSize, 0, null, '#fff', 0.2);
					}
				}
			}
		});

	};

	window.inherits(GridOverlay, window.wuic.core.Sprite);
	window.components.GridOverlay = GridOverlay;

}());