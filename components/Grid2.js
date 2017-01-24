/*

- Integrate Ejecta plugin

- Be able to draw tinted versions of the tiles -> OK, but we have to create and store many canvas, find a less expensive way... ?

- Tiles must shrink when destroyed, and points must be displayed on matches -> OK!

- BUG: Tiles doesnt seem to match when there are 3 horizontal on the first row (after falling) ... -> Ok, fixed!

- Background grid must be centered and look cool -> OK!

- Header must display score & moves

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

		this.vel = 0.25;

		// init as a sprite
		this.initSprite(params);

		// initialize tile assets
		this.initTileAssets();

		// assign buttonBehavior
		buttonBehavior.register(this);

		// swipe gesture
		this.on('swipe', function(e, mPos, vector, dist) {
			// get swipe increments in grid
			var x = 0, y = 0;
			if(Math.abs(vector.x) > Math.abs(vector.y)) {
				x = vector.x > 0 ? 1 : -1;
			} else {
				y = vector.y > 0 ? 1 : -1;
			}
			// get tiles to swap
			var pos = this.pixelToGrid(mPos);
			var tile1 = this.getTile(pos);
			var tile2 = this.getTile({ x: pos.x + x, y: pos.y + y });
			// swap the tiles
			if(tile1 && tile2) {
				this.swapTiles(tile1, tile2);
			}
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
		// popuplate board
		//this.populate();
	};


	// creates one backbuffer canvas for each type and mode of tile,
	// we will use this canvas as the tile asset when drawing the tile
	// is there a way to store this asset instead of recording the canvas object?

	Grid.prototype.initTileAssets = function() {
		var colors = ['ffff00', '00ff00', 'ff0000', '0066ff', 'ff00ff'];

		var assetTypes = {
			normal: assets.tBox,
			line: assets.tStar,
			bomb: assets.tCircle,
			multi: assets.tStar
		};

		window.tileAssets = {
			normal: [],
			line: [],
			bomb: [],
			multi: []
		};

		for(var type in assetTypes) {
			for(var i = 0; i < 5; i++) {
				// create tile canvas
				var canvas = document.createElement('canvas');
				canvas.width = this.tileSize;
				canvas.height = this.tileSize;
				var ctx = canvas.getContext('2d');
				// draw tile and get image data
				ctx.drawImage(assetTypes[type], 0, 0, this.tileSize , this.tileSize);
				// get tile image data
				var img = ctx.getImageData(0,0, this.tileSize, this.tileSize);
				// get color
				var color = colors[i];
				if(type === 'multi') {
					color = 'ffffff';
				}
				// tint image with color
				fx.setColorTransform(ctx, img, color, 0.6);
				// add image to tileAssets
				window.tileAssets[type].push(canvas);
			}
		}

		//console.log(window.tileAssets);
	};


	Grid.prototype.initTiles = function() {
		// init board with empty tiles
		for(var y = 0; y < this.tilesY; y++) {
			this.tiles[y] = [];
			for(var x = 0; x < this.tilesX; x++) {
				this.tiles[y][x] = null;
			}
		}
	};


	Grid.prototype.populate = function() {
		console.log('populate:', this.tilesX, this.tilesY);

		// populate board with random tiles
		for (var y = 0; y < this.tilesY; y++) {
			for (var x = 0; x < this.tilesX; x++) {
				var tile = this.tiles[y][x];
				if(!tile) {
					var type = utils.randomInt(0,0) == 0 ? utils.randomInt(0,4) : 0;
					this.tiles[y][x] = new components.Tile({ view: this.view, parent:this,
						type: type, gridSize: this.gridSize, size: this.tileSize, gridx: x, gridy: y});
				}
			}
		}
	};


	Grid.prototype.initScoreLabel = function(tile) {

		// get points for this tile
		var points = utils.randomInt(1,20) * 10;

		// create score label
		var label =  new components.Label({ view: this.view, parent:this,
			gridSize: this.gridSize, size: this.tileSize, gridx: tile.gridx, gridy: tile.gridy, alpha: 0,
			fontSize: 6, fontName: 'Stencil', color: tile.color, stroke: null, caption: '' + points });
		this.labels.push(label);

		// tween score label
		var that = this;
		Tweener.addTween(label, { fontSize: 12, alpha: 1, time: 0.25, transition: 'easeInOutQuad' });
		Tweener.addTween(label, { gridy: tile.gridy - 1.0, time: 1.0, delay: 0, transition: 'linear' });
		Tweener.addTween(label, { alpha: 0, fontSize: 8, time: 0.5, delay: 0.5, transition: 'easeInOutQuad', onComplete: function() {
			// destroy score label
			for (var i = 0, len = that.labels.length; i < len; i++) {
				if(that.labels[i] === label) {
					that.labels.splice(i, 1);
					break;
				}
			}
		} });

		// update global score
		Tweener.addTween(label, { time: 0.5, onComplete: function() {
			window.game.player.score += points;
		} });


	};

	//---------------------------------------------------------------
	// TileBoard Drawing
	//---------------------------------------------------------------

	Grid.prototype.draw = function(ctx) {
		//ctx.save();

		// draw grid
		for (var y = 0; y < this.tilesY; y++) {
			for (var x = 0; x < this.tilesX; x++) {
				var d = this.margin;//0.5;
				var xx = d / 2 + this.x + x * this.gridSize, yy = d / 2 + this.y + y * this.gridSize;
				wuic.drawings.roundRect(ctx, xx, yy, this.gridSize - d, this.gridSize - d, 10, '#000', '#666', 0.5, 1, 1); //'#ccc'
			}
		}

		//ctx.restore();



		// draw tiles
		for (var y = 0; y < this.tilesY; y++) {
			for (var x = 0; x < this.tilesX; x++) {
				var tile = this.tiles[y][x];
				if(tile) {
					tile.draw(ctx);
				}
			}
		}

		// draw labels
		for (var i = 0, len = this.labels.length; i < len; i++) {
			this.labels[i].draw(ctx);
		}

	};


	//---------------------------------------------------------------
	// Tile Swaping
	//---------------------------------------------------------------

	Grid.prototype.swapTiles = function(tile1, tile2) {
		if(tile1.swaping || tile2.swaping || this.matching || window.game.player.moves === 0) {
			return;
		}

		// play swapping sound
		audio.play(assets.arrow1, 0.1, true);

		// get tile coords in grid
		var pos1 = { x: tile1.gridx, y: tile1.gridy };
		var pos2 = { x: tile2.gridx, y: tile2.gridy };

		// record swaping props in tile
		tile1.swaping = { target: tile2 };
		tile2.swaping = { target: tile1 };

		// swap tiles in tiles array
		this.setTile(tile1, pos2);
		this.setTile(tile2, pos1);

		// tween tile coords
		Tweener.addTween(tile1, { gridx: pos2.x, gridy: pos2.y, time: this.vel * 0.6, transition: 'easeOutQuart' });
		Tweener.addTween(tile2, { gridx: pos1.x, gridy: pos1.y, time: this.vel * 0.6, transition: 'easeOutQuart' });

		// wait for swipe to end
		var that = this;
		Tweener.addTween(this, { time: this.vel * 0.5, onComplete: function() {
			// initialize the matching process
			that.initMatchingProcess();
			// reset swaping states
			tile1.swaping = null;
			tile2.swaping = null;
			// update global moves
			window.game.player.moves -= 1;
		} });
	};


	Grid.prototype.checkGameOver = function() {
		if(window.game.player.moves === 0) {
			var that = this;
			Tweener.addTween(this, { time: 1.0, onComplete: function() {
				that.view.gameOver();
			} });
		}
	};


	//---------------------------------------------------------------
	// Tile get/set/destroy
	//---------------------------------------------------------------

	Grid.prototype.pixelToGrid = function(pixelPos) {
		var x = Math.floor(pixelPos.x / this.gridSize);
		var y = Math.floor(pixelPos.y / this.gridSize);
		return { x: x, y: y }
	};


	Grid.prototype.getTile = function(pos) {
		if(pos.x < 0 || pos.y < 0 || pos.x > this.tilesX - 1 || pos.y > this.tilesY - 1) {
			//console.log('getTile out of bounds!');
			return null;
		}
		pos.x = Math.round(pos.x);
		pos.y = Math.round(pos.y);
		return this.tiles[pos.y][pos.x];
	};


	Grid.prototype.setTile = function(tile, pos) {
		pos.x = Math.round(pos.x);
		pos.y = Math.round(pos.y);
		if(pos.x < 0 || pos.y < 0 || pos.x > this.tilesX - 1 || pos.y > this.tilesY - 1) {
			//console.log('setTile out of bounds!');
			return;
		}
		pos.x = Math.round(pos.x);
		pos.y = Math.round(pos.y);
		this.tiles[pos.y][pos.x] = tile;
	};


	Grid.prototype.destroyTile = function(tile, params) {
		if(!tile) { return }

		// if the tile we want to destroy is a powerUp, execute it first
		if(tile.power) {
			var escape = this.executePowerUp(tile);
			if(escape) { return; }
		}

		// create score label
		this.initScoreLabel(tile);

		// create explosion fireworks
		window.fireworks.createFirework('spark', { x: tile.gx() + tile.size / 2, y: tile.gy() + tile.size / 2 }, tile.color);

		// make tile shrink
		var that = this;
		Tweener.addTween(tile, { size: 0, alpha: 0, time: this.vel * 0.5, transition: 'linear', onComplete: function() { //easeInOutQuad
			// destroy tile in board
			that.setTile(null, {x: tile.gridx, y: tile.gridy });
		} });
	};


	//---------------------------------------------------------------
	// Using Power Ups
	//---------------------------------------------------------------

	Grid.prototype.convertTileIntoPowerUp = function(tile, tileMatches) {
		// create powerup bomb
		if(tileMatches.H.length >= 3 && tileMatches.V.length >= 3) {
			tile.power = { type: 'bomb', step: 0, maxStep: 2 };
			audio.play(assets.door, 0.2, true);
			return;
		}

		for(var dir in tileMatches) {
			// create powerup line
			if(tileMatches[dir].length === 4 && tile.swaping) {
				tile.power = { type: 'line', dir: dir, step: 0, maxStep: 1 };
				audio.play(assets.sword2, 0.4, true);
			}

			// create powerup multi
			if(tileMatches[dir].length >= 5 && tile.swaping) {
				tile.power = { type: 'multi', step: 0, maxStep: 1 };
				audio.play(assets.levelup, 0.1, true);
			}
		}
	};


	Grid.prototype.executePowerUp = function(tile) {

		// check if the tile to be destroyed is already a powerUp in use,
		// if it is, we dont want to execute it cause will lead to an endless loop...
		for(var i = 0; i < this.usingPowerUpTiles.length; i++) {
			if(this.usingPowerUpTiles[i] === tile) {
				// just destroy the tile, wihout executing the powerup
				return false;
			}
		}

		// if not, execute the powerUp
		if (tile.power.step > 0) {

			// add tile to the usingPowerUpTiles list
			this.usingPowerUpTiles.push(tile);

			// execute active powers
			//console.log('using power:', tile.power);
			switch (tile.power.type) {
				case 'line':
					this.usePowerLine(tile);
					break;
				case 'bomb':
					this.usePowerBomb(tile);
					break;
				case 'multi':
					this.usePowerMulti(tile);
					break;
			}

			// dont destroy tile if it is a set-to-explode bomb
			if(tile.power.type === 'bomb' && tile.power.step < 2) {
				tile.power.step += 1;
				return true;
			}

		// dont execute the powerup if we just made it (step 0)
		} else {
			tile.power.step += 1;
			return true;
		}

		// tile must be destroyed
		return false;

	};


	Grid.prototype.usePowerMulti = function(powerTile) {

		// get target -> all tiles of target type will be destroyed
		var target;
		if(powerTile.swaping) {
			target = powerTile.swaping.target;
		} else {
			// TODO: maybe we want target to be equal to the previously triggered powerup (?)
			// TODO: in that case we have to iterate this.usingPowerUpTiles list and get it
			target = powerTile; // target will be equal to the original tile before being converted in a multi powerup
		}

		// destroy all tiles of target type
		for (var y = 0; y < this.tilesY; y++) {
			for (var x = 0; x < this.tilesX; x++) {
				var tile = this.getTile({ x: x, y: y });
				if(tile && tile != powerTile && tile.type === target.type) {
					this.destroyTile(tile);
				}
			}
		}

		// play multi audio
		audio.play(assets.water, 0.2, true);
	};

	Grid.prototype.usePowerLine = function(powerTile) {
		var x, y, tile;

		if(powerTile.power.dir === 'V') {
			// horizontal line
			//console.log('destroy horizontal line!', powerTile.power.dir);
			for (y = powerTile.gridy; y < powerTile.gridy + 1; y++) {
				for (x = 0; x < this.tilesX; x++) {
					tile = this.getTile({ x: x, y: y });
					if(tile && tile != powerTile) {
						this.destroyTile(tile);
					}
				}
			}
		} else {
			// vertical line
			//console.log('destroy vertical line!', powerTile.power.dir);
			for (y = 0; y < this.tilesY; y++) {
				for (x = powerTile.gridx; x < powerTile.gridx + 1; x++) {
					tile = this.getTile({ x: x, y: y });
					if(tile && tile != powerTile) {
						this.destroyTile(tile);
					}
				}
			}
		}

		// play line audio
		audio.play(assets.heal, 0.5, true);
	};


	Grid.prototype.usePowerBomb = function(powerTile, destroySelf) {
		for (var y = powerTile.gridy - 1; y < powerTile.gridy + 2; y++) {
			for (var x = powerTile.gridx - 1; x < powerTile.gridx + 2; x++) {
				var tile = this.getTile({ x: x, y: y });
				if(tile && tile != powerTile) {
					this.destroyTile(tile);
				}
			}
		}
		// play line audio
		audio.play(assets.stub, 0.5, true);
	};


	//---------------------------------------------------------------
	// Tile Matching
	//---------------------------------------------------------------

	Grid.prototype.initMatchingProcess = function() { //tile1, tile2
		var that = this;
		this.matching = true;

		// reset powerUp tiles in use
		this.usingPowerUpTiles = [];

		// get all tile matches
		var matches = this.getAllMatches(); //tile1, tile2

		// we will set this to true if at least one tile was destroyed,
		// to know that we must play sounds, etc
		var destroyedTiles = false;

		// destroy all matched tiles
		for(var i = 0, len = matches.length; i < len; i++) {
			var tile = matches[i];
			// destroy normal tile matches
			this.destroyTile(tile);
			destroyedTiles = true;
		}

		// if no tiles are being destroyed, escape matching process
		if(!destroyedTiles) {
			this.matching = false;
			this.chain = 0;
			// now is the time to end the game if we are out of moves
			this.checkGameOver();
			return;
		}

		// update chain number
		that.chain += 1;
		if(that.chain > 6) { that.chain = 6; }

		// play explosion sound
		audio.play(assets.arrow2, 0.3, true);
		audio.play(assets['bongo' + that.chain], 0.5, true);

		// wait for tiles to be destroyed, then drop all the uppertiles
		Tweener.addTween(this, { time: this.vel * 0.6, onComplete: function() {
			// get and drop upper tiles
			var upperTiles = that.getUpperTiles();
			that.dropUpperTiles(upperTiles);
		} });

		// create new tiles
		Tweener.addTween(this, { time: this.vel * 0.6, onComplete: function() {
			that.createNewTiles();
		} });

		// wait for tiles to be dropped, and then play the drop end sound
		Tweener.addTween(this, { time: this.vel * 2.1, onComplete: function() {
			if(destroyedTiles) {
				audio.play(assets.button1, 0.6, true);
			}
		} });

		// repeat the matching process until no more matches are found
		Tweener.addTween(this, { time: this.vel * 2.4, onComplete: function() { //2.6
			that.initMatchingProcess();
		} });

	};

	// resolve matches for all tiles in board and return a list of unique matched tiles
	Grid.prototype.getAllMatches = function() { //tile1, tile2
		var matches =[];
		for (var y = 0; y < this.tilesY; y++) {
			for (var x = 0; x < this.tilesX; x++) {
				var tile = this.getTile({ x: x, y: y });
				if(tile) {
					// get matches from single tile
					var tileMatches = this.getMatchesFromTile(tile);

					// merge tile matches with total matches
					for(var dir in tileMatches) {
						// if tile matches > 3 add tile match to total matches
						if(tileMatches[dir].length >= 3) {
							matches = utils.mergeUniqueArray(matches, tileMatches[dir]);
							// if tile is a powerup, add the matching direction to the power props
							if(tile.power) { tile.power.dir = dir; }
						}
					}

					// check if this tile has to be converted in a powerUp and do it if so
					this.convertTileIntoPowerUp(tile, tileMatches);

					// if tile is a to-explode bomb, add it to total matches to make it explode
					if(tile.power && tile.power.type === 'bomb' && tile.power.step === 2) {
						matches = utils.mergeUniqueArray(matches, [tile]);
					}

					// if tile is a multi powerUp, add it to total matches in order to use it
					if(tile.power && tile.power.type === 'multi' && tile.swaping) {
						matches = utils.mergeUniqueArray(matches, [tile]);
					}

				}
			}
		}

		// return total matches
		return matches;
	};


	// return tile matches from given tile in horizontal and vetical directions
	Grid.prototype.getMatchesFromTile = function(originTile) {

		// get matches in each direction
		var directions = { N: [originTile], S: [originTile], W: [originTile], E: [originTile] };
		for (var dir in directions) {
			var tile = originTile;
			var c = 0;
			while(c < this.tilesX) {
				var neighbour = this.getTileNeighbours(tile, dir);
				if(neighbour && neighbour.tile) {
					directions[dir].push(neighbour.tile);
					tile = neighbour.tile;
					c += 1;
				} else {
					c = this.tilesX;
				}
			}
		}

		// merge directional matches into horizontal and vertical matches
		var matches = {
			H: utils.mergeUniqueArray(directions.W, directions.E),
			V: utils.mergeUniqueArray(directions.N, directions.S)
		};

		// return found matches
		return matches;
	};


	//return neighbour tiles of the same type in the given direction
	Grid.prototype.getTileNeighbours = function(tile, dir) {
		var neighbours = {
			E: { tile: null, dir: { x: 1, y: 0 } },
			W: { tile: null, dir: { x: -1, y: 0 } },
			S: { tile: null, dir: { x: 0, y: 1 } },
			N: { tile: null, dir: { x: 0, y: -1 } }
		}
		var pos = { x: tile.gridx + neighbours[dir].dir.x,  y: tile.gridy + neighbours[dir].dir.y }
		var neighbour = this.getTile(pos);
		if(neighbour && neighbour.type === tile.type) {
			neighbours[dir].tile = neighbour;
		}
		return neighbours[dir];
	};


	//---------------------------------------------------------------
	// Tile Dropping
	//---------------------------------------------------------------

	Grid.prototype.getUpperTiles = function() {
		var x, y, i, lenX, lenY, tile;
		var upperTiles = [], uptile;

		// get upper tiles for each destroyed tile
		for (x = 0, lenX = this.tilesX; x < lenX; x++) {
			for (y = 0, lenY = this.tilesY; y < lenY; y++) {
				tile = this.tiles[y][x];
				if (!tile) {
					for (i = 0; i < y; i++) {
						uptile = this.tiles[i][x];

						if (uptile) {
							// check that this uptile isnt already in the upperTiles list
							for (var n = 0, lenUp = upperTiles.length; n < lenUp; n++) {
								if(uptile === upperTiles[n]) {
									break;
								}
							}
							// if it is not, add it to the list
							if (n === upperTiles.length) {
								upperTiles.push(uptile);
								uptile.upperTile = true;
								// calculate how many spaces the uptile has under it
								uptile.spaces = 0;
								//this.spaces[x] = 0;
								for (var j = uptile.gridy + 1; j < this.tilesY; j++) {
									var downtile = this.tiles[j][x];
									if (!downtile) {
										uptile.spaces += 1;
									}
								}

							}
						}
					}
				}
			}
		}

		// return upperTiles list
		return upperTiles;
	};


	Grid.prototype.createNewTiles = function() {
		// get spaces in each column
		var spaces = [];
		for (var x = 0, len = this.tilesX; x < len; x++) {
			spaces[x] = 0;
			for (var y = 0, lenY = this.tilesY; y < lenY; y++) {
				var tile = this.getTile({ x: x, y: y });
				if(!tile) {
					spaces[x] += 1;
				}
			}
		};

		// populate board with new random tiles at the top of the tileboard
		for (y = 0; y < this.tilesY; y++) {
			for (x = 0; x < this.tilesX; x++) {
				tile = this.getTile({ x: x, y: y });
				if(!tile) {
					var type = utils.randomInt(0,0) == 0 ? utils.randomInt(0,4) : 0;
					tile = new components.Tile({ view: this.view, parent:this,
						type: type, gridSize: this.gridSize, size: this.tileSize, gridx: x, gridy: y - spaces[x]});
					this.dropTile(tile, { x: 0, y: spaces[x] });
				}
			}
		}
	};


	Grid.prototype.dropUpperTiles = function(upperTiles) {
		// set all uppertile originals to null
		for (var i = 0, len = upperTiles.length; i < len; i++) {
			this.setTile(null, { x: upperTiles[i].gridx, y: upperTiles[i].gridy });
		}

		// make the upper tiles fall
		for (var i = 0, len = upperTiles.length; i < len; i++) {
			this.dropTile(upperTiles[i], { x: 0, y: upperTiles[i].spaces });
		}
	};


	Grid.prototype.dropTile = function(tile, vec) {
		// get tile new pos
		var newPos = { x: tile.gridx + vec.x, y: tile.gridy + vec.y };
		// set tile in tileboard tiles array
		this.setTile(tile, newPos);
		// tween tile coords
		//Tweener.addTween(tile, { gridx: newPos.x, gridy: newPos.y, time: this.vel * 2, delay: 0, transition: 'easeOutBounce2',
		Tweener.addTween(tile, { gridx: newPos.x, gridy: newPos.y, time: this.vel * 1, delay: 0, transition: 'easeInQuad',
			onComplete: function() {
				tile.gridx = newPos.x;
				tile.gridy = newPos.y;
				tile.upperTile = false;
			}
		});
	};


}());

