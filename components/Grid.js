/**
 *
 * - Move wall autotile logic out of Tile and into Autotiles
 *
 *  - We want to generate some tilesets:
 *      - terrain
 *      - terrain overlay
 *      - walls
 *      - interior elements
 *      - exterior elements
 *
 *  - Implement toolbar buttons:
 *      - draw
 *      - fill -> implement also a floodfilling algorithm
 *      - delete -> also, may be possible to include a special tile in the tileset that means deletion
 *      - options
 *          - load
 *          - save
 *          - exit
 */

(function () {

	var Grid = function (params) {

		// init vars
		this.tilesX = params.tilesX;
		this.tilesY = params.tilesY;
		this.gridSize = params.gridSize;
		this.tileSize = params.tileSize;
		this.margin = params.margin || 0;
		params.width = this.tilesX * this.gridSize;
		params.height = this.tilesY * this.gridSize;

		this.lastPos = null;
		this.drawGrid = window.options.drawGrid;

		// init as a sprite
		this.initSprite(params);

		// assign buttonBehavior
		buttonBehavior.register(this);

		// mouse events
		this.on('tapstart', function(e, mPos) {
			this.setAutoTile(mPos)
		});

		this.on('tapmove', function(e, mPos) {
			this.setAutoTile(mPos)
		});

		this.on('tapend', function(e, mPos) {
			this.lastPos = null;
		});

	};

	Grid.prototype = new wuic.core.Sprite();
	components.TileBoard = Grid;

	//---------------------------------------------------------------
	// TileBoard initialization
	//---------------------------------------------------------------

	Grid.prototype.init = function() {
		// init vars
		this.labels = [];
		this.tiles = [];
		this.chain = 0;
		// init tiles
		this.initTiles();
		// populate board
		this.populate();
	};


	Grid.prototype.initTiles = function() {
		// init board with empty tiles
		for(var layer = 0; layer < 3; layer++) {
			this.tiles[layer] = [];
			for(var y = 0; y < this.tilesY; y++) {
				this.tiles[layer][y] = [];
				for(var x = 0; x < this.tilesX; x++) {
					this.tiles[layer][y][x] = null;
				}
			}
		}
	};


	Grid.prototype.populate = function() {
		// populate grid with random tiles at layer 0
		var layer = 0;
		var tileset = this.view.footer.tileset.currentTileset;
		for (var y = 0; y < this.tilesY; y++) {
			for (var x = 0; x < this.tilesX; x++) {
				var tile = this.tiles[layer][y][x];
				if(!tile) {
					var type = 0;
					//if (x <3 && y < 3) type = 3;
					//if (x > this.tilesX - 3 && y > this.tilesY -3) type = 3;
					this.tiles[layer][y][x] = new components.Tile({ view: this.view, parent:this,
						tileset: tileset, type: type, layer: layer, gridSize: this.gridSize, size: this.tileSize, gridx: x, gridy: y});
				}
			}
		}

		// update autoTiles
		AutoTiles.updateAutoTiles(this.tiles);
	};


	//---------------------------------------------------------------
	// TileBoard Drawing
	//---------------------------------------------------------------

	Grid.prototype.draw = function(ctx) {

		// draw tiles
		for(var layer = 0; layer < 3; layer++) {
			for (var y = 0; y < this.tilesY; y++) {
				for (var x = 0; x < this.tilesX; x++) {
					var tile = this.getTile(layer, { x: x, y: y });
					if(tile) {
						tile.draw(ctx);
					}
				}
			}
		}

		// draw grid
		if(this.drawGrid) {
			for (var y = 0; y < this.tilesY; y++) {
				for (var x = 0; x < this.tilesX; x++) {
					var d = this.margin;//0.5;
					var xx = d / 2 + this.x + x * this.gridSize, yy = d / 2 + this.y + y * this.gridSize;
					wuic.drawings.roundRect(ctx, xx, yy, this.gridSize - d, this.gridSize - d, 0, null, '#111', 1, 0.2, 1);
				}
			}
		}

	};


	//---------------------------------------------------------------
	// Tile Operations
	//---------------------------------------------------------------

	Grid.prototype.pixelToGrid = function(pixelPos) {
		var x = Math.floor(pixelPos.x / this.gridSize);
		var y = Math.floor(pixelPos.y / this.gridSize);
		return { x: x, y: y }
	};


	Grid.prototype.getTile = function(layer, pos) {
		if(pos.x < 0 || pos.y < 0 || pos.x > this.tilesX - 1 || pos.y > this.tilesY - 1) {
			//console.log('getTile out of bounds!');
			return null;
		}
		pos.x = Math.round(pos.x);
		pos.y = Math.round(pos.y);
		return this.tiles[layer][pos.y][pos.x];
	};


	Grid.prototype.setTile = function(tile, layer, pos) {
		pos.x = Math.round(pos.x);
		pos.y = Math.round(pos.y);
		if(pos.x < 0 || pos.y < 0 || pos.x > this.tilesX - 1 || pos.y > this.tilesY - 1) {
			//console.log('setTile out of bounds!');
			return;
		}
		pos.x = Math.round(pos.x);
		pos.y = Math.round(pos.y);
		this.tiles[layer][pos.y][pos.x] = tile;
	};


	Grid.prototype.setAutoTile = function(mPos) {
		// escape if mouse is inside the footer
		if(mPos.y >= this.view.footer.y - this.view.header.height) { return; }

		// get pos, and escape if same as lastPos
		var pos = this.pixelToGrid(mPos);
		if(this.lastPos && pos.x === this.lastPos.x && pos.y === this.lastPos.y) { return; }
		this.lastPos = pos;

		// get layer and selected tileset image from the footer data
		var layer = this.view.footer.toolbar.selectedLayer;
		var type = this.view.footer.tileset.selectedTileId;
		var tileset = this.view.footer.tileset.currentTileset;

		// get the tile to be changed
		var tile = this.getTile(layer, pos);
		if(tile) {
			// if tile exists, we change its type
			tile.type = type;
			tile.layer = layer;
			tile.tileset = tileset;
		} else {
			// if tile does not exist, we create it and register it
			tile = new components.Tile({ view: this.view, parent:this,
				tileset: tileset, type: type, layer: layer, gridSize: this.gridSize, size: this.tileSize, gridx: pos.x, gridy: pos.y});
			this.setTile(tile, layer, pos);
		}

		// update autoTiles
		AutoTiles.updateAutoTiles(this.tiles);
	};


	/*Grid.prototype.destroyTile = function(tile, params) {
		if(!tile) { return }

		// make tile shrink
		var that = this;
		Tweener.addTween(tile, { size: 0, alpha: 0, time: this.vel * 0.5, transition: 'linear', onComplete: function() { //easeInOutQuad
			// destroy tile in board
			that.setTile(null, {x: tile.gridx, y: tile.gridy });
		} });
	};*/

}());

