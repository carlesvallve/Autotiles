(function () {

	var Tile = function Tile(params) {
		wuic.core.Sprite.call(this);
		var view = navTree.getItem('game');

		var debug = false;
		var halfSize = params.size / 2;

		// vars;
		this.layer = params.layer;
		this.type = params.type;
		this.tileset = params.tileset;

		// sizes
		var gridSize = params.gridSize;
		this.size = params.size;
		this.width = this.size;
		this.height = this.size;

		// positions
		this.gridx = params.gridx;
		this.gridy = params.gridy;
		this.x = this.gridx * gridSize;
		this.y = this.gridy * gridSize;

		// states
		this.autotile = null;
		this.walkable = true;
		this.opaque = true;
		this.visible = true;
		this.visited = true;


		//-----------------------------------
		// Render
		//-----------------------------------

		this.setRenderMethod(function (ctx) {

			// get tileset rect and mode
			var rect = this.tileset.tiles[this.type];
			var walls = view.grid.options.walls.arr[view.grid.options.walls.value];


			// set sprite pos to grid pos
			this.x = this.gridx * gridSize + gridSize / 2 - this.size / 2;
			this.y = this.gridy * gridSize + gridSize / 2 - this.size / 2;


			// draw simple tile
			ctx.drawImage(this.tileset.asset, rect.x, rect.y, rect.width, rect.height, 0, 0, this.size , this.size);

			if(this.autotile) {
				// draw autotile
				for(var i in this.autotile) {
					if (walls === 'off' || this.tileset.id != 'wall') {
						this.drawAutoFloor(ctx, rect, this.autotile[i]);
					} else if (walls === 'on') {
						this.drawAutoWall(ctx, rect, this.autotile[i]);
					}
				}
			} else {
				// draw simple tile
				ctx.drawImage(this.tileset.asset, rect.x, rect.y, rect.width, rect.height, 0, 0, this.size , this.size);
			}

			// write tile info
			ctx.fillStyle = '#fff';
			ctx.font ='bold 10px godofwar';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'center';
			ctx.fillText(this.getIndex(), this.width / 2, 4 + this.height / 2);
		});


		this.drawAutoFloor = function(ctx, rect, r) {
			//console.log(rect, r, halfSize);
			// draw floor autotile
			ctx.drawImage(this.tileset.asset,
				rect.x + r.sourceX, rect.y + r.sourceY, halfSize, halfSize,
				r.x, r.y, halfSize, halfSize
			);
		};


		this.drawAutoWall = function(ctx, rect, r) {
			var parent = this.getParent();

			// draw wall's roof (like an autotiled floor but elevated)
			ctx.drawImage(this.tileset.asset,
				rect.x + r.sourceX, rect.y + r.sourceY, halfSize, halfSize,
				r.x, r.y - 32, halfSize, halfSize
			);

			// if left tile is of a diferent type,
			// draw (0,0,32,16) draw (0,32,32,16)
			var leftTile = parent.getTile(this.layer, { x: this.gridx - 1, y: this.gridy });
			if(!leftTile || (leftTile && leftTile.type != this.type)) {
				ctx.drawImage(this.tileset.asset, rect.x + 0, rect.y + 96, 32, 16,              0, 0, 32, 16);
				ctx.drawImage(this.tileset.asset, rect.x + 0, rect.y + 96 + 48, 32, 16,         0, 16, 32, 16);
				//return;
			}

			// if right tile is of a diferent type
			// draw (32,0,32,16) draw (32,32,32,16)
			var rightTile = parent.getTile(this.layer, { x: this.gridx + 1, y: this.gridy });
			if(!rightTile || (rightTile && rightTile.type != this.type)) {
				ctx.drawImage(this.tileset.asset, rect.x + 32, rect.y + 96, 32, 16,             0, 0, 32, 16);
				ctx.drawImage(this.tileset.asset, rect.x + 32, rect.y + 96 + 48, 32, 16,        0, 16, 32, 16);
				//return;
			}

			// if both sides are of the same type
			// draw (16,0,32,16) draw (16,32,32,16)
			if(leftTile && leftTile.type === this.type  && rightTile && rightTile.type === this.type) {
				ctx.drawImage(this.tileset.asset, rect.x + 16, rect.y + 96, 32, 16,             0, 0, 32, 16);
				ctx.drawImage(this.tileset.asset, rect.x + 16, rect.y + 96 + 48, 32, 16,        0, 16, 32, 16);
				//return;
			}

			// if both sides are of a diferent type,
			// draw (0,0,16,16) draw (0,48,16,16)
			if((!leftTile || (leftTile && leftTile.type != this.type)) && (!rightTile || (rightTile && rightTile.type != this.type))) {
				ctx.drawImage(this.tileset.asset, rect.x + 0, rect.y + 96, 16, 16,              0, 0, 16, 16);
				ctx.drawImage(this.tileset.asset, rect.x + 0, rect.y + 96 + 48, 16, 16,         0, 16, 16, 16);

				ctx.drawImage(this.tileset.asset, rect.x + 48, rect.y + 96, 16, 16,             16, 0, 16, 16);
				ctx.drawImage(this.tileset.asset, rect.x + 48, rect.y + 96 + 48, 16, 16,        16, 16, 16, 16);
			}

		};

	};


	window.inherits(Tile, window.wuic.core.Sprite);
	window.components.Tile = Tile;

}());




