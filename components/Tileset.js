(function () {

	var Tileset = function (params) {
		// init vars;
		this.gridSize = params.gridSize;
		this.gridx = params.gridx || 0;
		this.gridy = params.gridy || 0;
		this.x = params.x || 0;
		this.y = params.y || 0;

		// init as a sprite
		this.initSprite(params);

		// init tilesets data
		this.tilesets = [
			{ name: 'terrain',        asset: assets.terrain,        mode: 'floor', layer: 0, tiles: []},
			{ name: 'terrainOverlay', asset: assets.terrainOverlay, mode: 'floor', layer: 1, tiles: []},
			{ name: 'wall',           asset: assets.wall,           mode: 'wall',  layer: 2, tiles: []},
			{ name: 'outdoor',        asset: assets.outdoor,        mode: 'none',  layer: 2, tiles: []}
		];
		this.currentTileset = this.tilesets[0];

		// generate tile rects for all tilesets
		for(var i = 0, len = this.tilesets.length; i < len; i++) {
			var tileset = this.tilesets[i];
			tileset.tiles = this.getTilesInTileset(tileset);
		}

		// reset tile selection
		this.selectedTileId = 0;
		this.selectedTilePos = { x: 0, y: 0 };

		// assign buttonBehavior
		buttonBehavior.register(this);
		this.on('tapstart', function(e, mPos) {
			// get grid coord at mouse pos
			var pos = this.pixelToGrid(mPos);
			// get tile id by pos
			var id = pos.y * Math.floor(this.width / this.gridSize) + pos.x;
			// if we selected the tile that is already selected, close footer
			if(id === this.selectedTileId) {
				this.parent.showTileset(false);
			} else {
				// record selected tile id
				this.selectedTileId = id;
				this.selectedTilePos = pos;
			}
		});
	};


	Tileset.prototype = new wuic.core.Sprite();
	components.Tileset = Tileset;


	Tileset.prototype.selectTileset = function(num) {
		var temp = this.currentTileset;
		this.currentTileset = this.tilesets[num];
		var open = this.tilesets[num] != temp;
		if(this.parent.toolbar.tilesetOpen === false) { open = true; }
		this.parent.showTileset(open);
	};


	Tileset.prototype.draw = function(ctx) {
		ctx.save();
		ctx.globalAlpha = this.alpha;

		// get global pos
		var pos = { x: this.gx(), y: this.gy() };

		// draw tileset bg
		ctx.fillRect(pos.x, pos.y, this.width, this.height);

		// draw tiles in tileset
		this.drawTilesInTileset(ctx, this.currentTileset, pos);

		// draw tile selection rect
		var x = pos.x + 1 + this.selectedTilePos.x * this.gridSize;
		var y = pos.y + 1 + this.selectedTilePos.y * this.gridSize;
		wuic.drawings.roundRect(ctx, x, y, this.gridSize - 2, this.gridSize - 2, 0, null, '#fff', 1, 1, 1);

		ctx.restore();
	};

	Tileset.prototype.getTilesInTileset = function(tileset) {
		// set vars
		var sz = 32, w = 64, h = 96;
		if(tileset.mode === 'wall') {
			h = 96 + 64;
		}

		// get how many tiles by tileset page dimensions
		var tilesX = Math.floor(tileset.asset.width / w);
		var tilesY = Math.floor(tileset.asset.height / h);
		var tilesMax = tilesX * tilesY;

		// 8 x 4 (64x96) = 32 tiles of 32x32 pixels
		var tiles =[];
		var x=0, y=0;
		for(var i = 0; i < tilesMax; i++) {
			tiles.push( { id: i, x: x, y: y, width: sz, height: sz } );
			x += w;
			if(x >= tileset.asset.width) { x = 0; y += h; }
		}
		// add last empty tile
		//tiles.push( { id: i, x: x, y: y, width: sz, height: sz } );

		return tiles;
	};


	Tileset.prototype.drawTilesInTileset = function(ctx, tileset, pos) {
		var sz = this.gridSize;
		var x = 0, y = 0;
		for(var i = 0, len = tileset.tiles.length; i < len; i++) {
			var rect = tileset.tiles[i];
			ctx.drawImage(tileset.asset,
				rect.x, rect.y, rect.width, rect.height,
				pos.x + x, pos.y + y, sz, sz);
			x += sz;
			if(x >= this.width - sz) { x = 0; y += sz; }
		}

		this.height = y + this.gridSize;
	};


	Tileset.prototype.pixelToGrid = function(pixelPos) {
		var x = Math.floor(pixelPos.x / this.gridSize);
		var y = Math.floor(pixelPos.y / this.gridSize);
		return { x: x, y: y }
	};


}());

