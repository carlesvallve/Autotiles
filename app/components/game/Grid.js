(function () {

	var Tween = window.wuic.core.Tween;

	var Grid = function Grid(params) {
		wuic.core.Sprite.call(this);
		var view = navTree.getItem('game');

		this.options = {
			walls: { arr: ['off', 'on'], value: 0 },
			grid: { arr: ['over', 'under', 'none'], value: 1 }
		};

		this.tiles = null;
		this.tilesX = params.tilesX;
		this.tilesY = params.tilesY;
		var gridSize = params.gridSize;
		var margin = params.margin || 0;
		var lastPos = null;
		var lastGridPos = null;

		this.width = this.tilesX * gridSize;
		this.height = this.tilesY * gridSize;
		this.x = params && params.x != null ? params.x : (view.width - this.width) / 2;
		this.y = params && params.y != null ? params.y : (view.height - this.height) / 2;

		/// set as button
		window.wuic.behaviors.button(this);

		// mouse events
		this.on('tapstart', function(e, mPos) {
			if(view.currentTool === 'draw') {
				this.setAutoTile({ x: mPos.localX, y: mPos.localY });
			}
			lastPos = { x: mPos.x, y: mPos.y };
		});

		this.on('tapmove', function(e, mPos) {
			if(view.currentTool === 'draw') {
				// draw autotiles
				this.setAutoTile({ x: mPos.localX, y: mPos.localY });

			} else if(view.currentTool === 'drag') {
				// set dragging data
				var pos = { x: mPos.x, y: mPos.y };
				var vec = { x: pos.x - lastPos.x, y: pos.y - lastPos.y };
				lastPos = pos;

				// relocate grid
				this.x += vec.x;
				this.y += vec.y;
				if (this.x > margin) { this.x = margin; }
				if (this.y > 32 + margin) { this.y = 32 + margin; }
				if (this.x < -this.width + canvasWidth - margin) { this.x = -this.width + canvasWidth - margin; }
				if (this.y < -32 - this.height + canvasHeight - margin) { this.y = -32 - this.height + canvasHeight - margin; }

				// relocate grid overlay
				view.overlay.x = this.x;
				view.overlay.y = this.y;
			}
		});

		this.on('tapend', function(e, mPos) {
			lastGridPos = null;
		});


		//-----------------------------------
		// Init
		//-----------------------------------

		this.init = function(params) {
			// destroy previous tiles
			if(this.tiles) {
				this.destroyTiles();
			}

			//console.log('INIT GRID:', params);

			// init params
			this.tilesX = params.tilesX;
			this.tilesY = params.tilesY
			this.width = this.tilesX * gridSize;
			this.height = this.tilesY * gridSize;
			this.x = 0;
			this.y = 32;

			// init new tiles
			this.initTiles();
			//this.populateLayer(0, view.footer.tileset.currentTileset, 0);
		};


		this.initTiles = function() {
			// init board with empty tiles
			this.tiles = [];
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


		this.populateLayer = function(layer, tileset, tileNum) {
			// populate grid at given layer, with given tile number at given tileset
			for (var y = 0; y < this.tilesY; y++) {
				for (var x = 0; x < this.tilesX; x++) {
					var tile = this.tiles[layer][y][x];
					if(!tile) {
						tile = new components.Tile({ view: this.view, parent:this,
							tileset: tileset, type: tileNum, layer: layer, gridSize: gridSize, size: gridSize, gridx: x, gridy: y });
						this.appendChild(tile);
						this.tiles[layer][y][x] = tile;
					}
				}
			}

			// update autoTiles
			AutoTiles.updateAutoTiles(this.tiles);
		};


		this.buildMap = function(map) {
			//console.log('buildMap:', map);

			// get tileset objects
			var tilesets = {};
			for(var i in view.footer.tileset.tilesets) {
				var ts = view.footer.tileset.tilesets[i];
				tilesets[ts.id] = ts;
			}

			// create a new empty map of given dimensions
			this.init({ tilesX: map.tilesX, tilesY: map.tilesY });
			//this.initTiles();

			// populate map with tiles based on map data
			for (var layer = 0, len = 3; layer < len; layer++) {
				for (var y = 0; y < map.tilesY; y++) {
					for (var x = 0; x < map.tilesX; x++) {
						// get tile data
						var obj = map.tiles[layer][y][x];
						if(obj) {
							// get tileset object by tile data tileset id
							var tileset = tilesets[obj.tileset];

							// create tile sprite from tile data
							var tile = new components.Tile({ view: this.view, parent:this,
									   tileset: tileset, type: obj.type, layer: layer, gridSize: gridSize, size: gridSize, gridx: x, gridy: y });
							this.appendChild(tile);
							this.tiles[layer][y][x] = tile;
						}
					}
				}
			}

			// update autoTiles
			AutoTiles.updateAutoTiles(this.tiles);
		};


		//-----------------------------------
		// Methods
		//-----------------------------------

		// Returns a tile form the grid tiles array

		this.getTile = function(layer, pos) {
			if(pos.x < 0 || pos.y < 0 || pos.x > this.tilesX - 1 || pos.y > this.tilesY - 1) {
				//console.log('getTile out of bounds!');
				return null;
			}
			pos.x = Math.round(pos.x);
			pos.y = Math.round(pos.y);

			return this.tiles[layer][pos.y][pos.x];
		};


		// Assigns a tile in the grid tiles array

		this.setTile = function(tile, layer, pos) {
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


		// Creates or changes an autotile in the grid

		this.setAutoTile = function(mPos) {
			// escape if mouse is outside the grid area (footer or header)
			if(mPos.y >= view.footer.y - this.y) { return; }
			if(mPos.y <= view.header.height - this.y) { return; }

			// escape if we are not in 'draw' mode
			if(view.currentTool !='draw') { return; }

			// get pos in grid, and escape if same as lastGridPos
			var pos = this.pixelToGrid(mPos);
			if(lastGridPos && pos.x === lastGridPos.x && pos.y === lastGridPos.y) { return; }
			lastGridPos = pos;

			// get layer and selected tileset image from the footer data
			var layer = view.footer.selectedLayer;
			var type = view.footer.tileset.selectedTileId;
			var tileset = view.footer.tileset.currentTileset;

			// get the tile to be changed
			var tile = this.getTile(layer, pos);
			if(tile) {
				// if tile exists, we change the tile props
				tile.layer = layer;
				tile.tileset = tileset;
				tile.type = type;
			} else {
				// if tile does not exist, we create it and register it
				tile = new components.Tile({ view: this.view, parent:this,
					tileset: tileset, type: type, layer: layer, gridSize: gridSize, size: gridSize, gridx: pos.x, gridy: pos.y });
				this.setTile(tile, layer, pos);
				this.appendChild(tile);
			}


			// update autotiles
			AutoTiles.updateAutoTiles(this.tiles);

			console.log(tile);

			/*var z = tile.gridy;
			console.log(z);
			tile.setIndex(z);*/

			// arrange tiles z-index
			this.arrangeTiles();
		};


		// Arranges grid tiles in propper z-index

		this.arrangeTiles = function () {
			for (var i = 0; i < 3; i++) {
				for (var x = 0; x < this.tilesX; x++) {
					for (var y = 0; y < this.tilesY; y++) {
						var myTile = this.getTile(i, { x: x, y: y });
						if(myTile) {
							myTile.moveToTopIndex();
						}
					}
				}
			}
		};


		// Destroys all tiles in grid

		this.destroyTiles = function() {
			// init board with empty tiles
			for(var layer = 0; layer < 3; layer++) {
				for(var y = 0; y < this.tilesY; y++) {
					for(var x = 0; x < this.tilesX; x++) {
						var tile = this.getTile(layer, { x: x, y: y });
						if(tile) {
							tile.destroy();
						}
					}
				}
			}
		};


		// Returns grid coordinates of a given pixel position

		this.pixelToGrid = function(pixelPos) {
			var x = Math.floor(pixelPos.x / gridSize);
			var y = Math.floor(pixelPos.y / gridSize);
			return { x: x, y: y }
		};


		//-----------------------------------
		// Render
		//-----------------------------------

		this.setRenderMethod(function (ctx) {
			// draw grid lines in 'under' mode
			if(this.options.grid.arr[this.options.grid.value] === 'under') {
				var xx, yy;
				for (var x = 0; x < this.tilesX; x++) {
					for (var y = 0; y < this.tilesY; y++) {
						xx = x * gridSize;
						yy = y * gridSize;
						window.drawings.roundRect(ctx, xx, yy, gridSize, gridSize, 0, null, '#fff', 0.2);
					}
				}
			}
		});


		//-----------------------------------
		// Grid options
		//-----------------------------------

		this.changeOption = function(type) {
			var option = this.options[type];
			option.value += 1;
			if(option.value >= option.arr.length) {
				option.value = 0;
			}
			return option.arr[option.value];
		};

	};

	window.inherits(Grid, window.wuic.core.Sprite);
	window.components.Grid = Grid;

}());