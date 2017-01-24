(function () {

	var Tileset = function Tileset(params) {
		wuic.core.Sprite.call(this);
		var view = navTree.getItem('game');
		var parent;
		var that = this;

		// init params;
		var gridSize = params.gridSize;
		this.x = params.x || 0;
		this.y = params.y || 0;
		this.width = 0 + params.width || 12 * gridSize;
		this.height = params.height || gridSize;

		// tile selection
		this.selectedTileId = 0;
		var selectedTilePos = { x: 0, y: 0 };

		// tilesets data
		this.tilesets = [
			{ id: 'terrain',        asset: assets.terrain,        mode: 'floor', layer: 0, tiles: []},
			{ id: 'terrainOverlay', asset: assets.terrainOverlay, mode: 'floor', layer: 1, tiles: []},
			{ id: 'wall',           asset: assets.wall,           mode: 'wall',  layer: 2, tiles: []},
			{ id: 'outdoor',        asset: assets.outdoor,        mode: 'none',  layer: 2, tiles: []}
		];
		this.currentTileset = this.tilesets[0];


		/// set as button
		window.wuic.behaviors.button(this);

		// click on tileset
		this.on('tapstart', function(e, mPos) {
			// get grid coord at mouse pos

			that.selectTileInTileset(mPos);
		});


		//--------------------------
		// Methods
		//--------------------------

		this.selectTileInTileset = function(mPos) {
			// get tile position in grid
			var pos = this.pixelToGrid({ x: mPos.localX, y:mPos.localY });

			// get tile id by pos
			var id = pos.y * (Math.floor(this.width / gridSize) - 1) + pos.x;

			// if we selected the tile that is already selected, close footer
			if(id === this.selectedTileId) {
				parent.adjustFooter(false);
			} else {
				// if not, record the selected tile id
				this.selectedTileId = id;
				selectedTilePos = pos;
			}

			console.log('select tile:', this.selectedTileId, selectedTilePos);
		};


		this.selectTileset = function(num) {
			// set current tileset
			var temp = this.currentTileset;
			this.currentTileset = this.tilesets[num];

			// toggle open flag
			var open = this.tilesets[num] != temp;
			if(parent.tilesetOpen === false) {
				open = true;
			}

			// set tile height to current tileset
			this.height = this.getCurrentHeight(this.currentTileset);

			// open/close footer to fit current tileset height
			parent.adjustFooter(open);
		};


		this.pixelToGrid = function(pixelPos) {
			var x = Math.floor(pixelPos.x / gridSize);
			var y = Math.floor(pixelPos.y / gridSize);
			return { x: x, y: y }
		};


		this.getTilesInTileset = function(tileset) {
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

			return tiles;
		};


		this.drawTilesInTileset = function(ctx, tileset) {
			// draw all tiles in tileset
			var x = 0, y = 0;
			for(var i = 0, len = tileset.tiles.length; i < len; i++) {
				var rect = tileset.tiles[i];
				ctx.drawImage(tileset.asset, rect.x, rect.y, rect.width, rect.height, x, y, gridSize, gridSize);
				x += gridSize;
				if(x >= this.width - gridSize) {
					x = 0;
					y += gridSize;
				}
			}
		};


		this.getCurrentHeight = function(tileset) {
			var x = 0, y = 0;
			for(var i = 0, len = tileset.tiles.length; i < len; i++) {
				x += gridSize;
				if(x >= this.width - gridSize) {
					x = 0;
					y += gridSize;
				}
			}
			return y + gridSize;
		};


		//--------------------------
		// Init
		//--------------------------

		this.init = function () {
			parent = this.getParent();
			// generate tile rects for all tilesets
			for(var i = 0, len = this.tilesets.length; i < len; i++) {
				var tileset = this.tilesets[i];
				tileset.tiles = this.getTilesInTileset(tileset);
			}
		};


		//--------------------------
		// Render
		//--------------------------

		this.setRenderMethod(function (ctx) {
			//ctx.fillStyle = 'rgba(0,0,0,1);';
			//ctx.fillRect(0,0, this.width, this.height);
			this.drawTilesInTileset(ctx, this.currentTileset);

			// draw tile selection rect
			var x = 1 + selectedTilePos.x * gridSize;
			var y = 1 + selectedTilePos.y * gridSize;
			window.drawings.roundRect(ctx, x, y, gridSize - 2, gridSize - 2, 0, null, '#fff', 1);
		});

	};


	window.inherits(Tileset, window.wuic.core.Sprite);
	window.components.Tileset = Tileset;

}());

