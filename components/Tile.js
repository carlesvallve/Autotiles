(function () {

	var Tile = function (params) {
		this.debug = false;

		// init as a sprite
		params.width = params.size;
		params.height = params.size;
		this.initSprite(params);

		// init vars;
		this.layer = params.layer;
		this.type = params.type;
		this.tileset = params.tileset;

		this.gridx = params.gridx;
		this.gridy = params.gridy;
		this.x = this.gridx * params.gridSize;
		this.y = this.gridy * params.gridSize;
		this.gridSize = params.gridSize;
		this.size = params.size;
		this.halfSize = this.size / 2;
		this.autotile = null;

		// additional vars
		this.walkable = true;
		this.opaque = true;
		this.visible = true;
		this.visited = true;

	};


	Tile.prototype = new wuic.core.Sprite();
	components.Tile = Tile;


	Tile.prototype.draw = function(ctx) {

		ctx.save();
		ctx.globalAlpha = this.alpha;

		// set sprite pos to grid pos
		this.x = this.gridx * this.gridSize + this.gridSize / 2 - this.size / 2;
		this.y = this.gridy * this.gridSize + this.gridSize / 2 - this.size / 2;

		// get global pos
		var pos = { x: this.gx(), y: this.gy() };

		// get tileset rect
		var rect = this.tileset.tiles[this.type];
		var mode = this.tileset.mode;
		if(mode === 'wall') {
			mode = this.view.footer.toolbar.tileMode;
		}

		if(this.autotile) {
			// draw autotile
			for(var i in this.autotile) {
				//if(this.type === 14) { tileMode = 'floor'; }

				if( mode === 'floor') {
					this.drawAutoFloor(ctx, pos, rect, this.autotile[i]);
				} else if (mode === 'wall') {
					this.drawAutoWall(ctx, pos, rect, this.autotile[i]);
				}
			}
		} else {
			// draw simple tile
			ctx.drawImage(this.tileset.asset, rect.x, rect.y, rect.width, rect.height, pos.x, pos.y, this.size , this.size);
		}

		// debug tile info
		this.debugInfo(ctx, pos);

		ctx.restore();
	};


	Tile.prototype.drawAutoFloor = function(ctx, pos, rect, r) {
		// draw floor autotile
		ctx.drawImage(this.tileset.asset,
			rect.x + r.sourceX, rect.y + r.sourceY, this.halfSize, this.halfSize,
			pos.x + r.x, pos.y + r.y, this.halfSize, this.halfSize
		);
	};


	Tile.prototype.drawAutoWall = function(ctx, pos, rect, r) {
		// set wall height
		var wallHeight = 32;

		// draw wall's roof (like an autotiled floor but elevated)
		ctx.drawImage(this.tileset.asset,
			rect.x + r.sourceX, rect.y + r.sourceY, this.halfSize, this.halfSize,
			pos.x + r.x, pos.y + r.y - wallHeight, this.halfSize, this.halfSize
		);

		// if left tile is of a diferent type,
		// draw (0,0,32,16) draw (0,32,32,16)
		var leftTile = this.parent.getTile(this.layer, { x: this.gridx - 1, y: this.gridy });
		if(!leftTile || (leftTile && leftTile.type != this.type)) {
			ctx.drawImage(this.tileset.asset, rect.x + 0, rect.y + 96, 32, 16, pos.x + 0, pos.y + 0, 32, 16);
			ctx.drawImage(this.tileset.asset, rect.x + 0, rect.y + 96 + 48, 32, 16, pos.x + 0, pos.y + 16, 32, 16);
			//return;
		}

		// if right tile is of a diferent type
		// draw (32,0,32,16) draw (32,32,32,16)
		var rightTile = this.parent.getTile(this.layer, { x: this.gridx + 1, y: this.gridy });
		if(!rightTile || (rightTile && rightTile.type != this.type)) {
			ctx.drawImage(this.tileset.asset, rect.x + 32, rect.y + 96, 32, 16, pos.x + 0, pos.y + 0, 32, 16);
			ctx.drawImage(this.tileset.asset, rect.x + 32, rect.y + 96 + 48, 32, 16, pos.x + 0, pos.y + 16, 32, 16);
			//return;
		}

		// if both sides are of the same type
		// draw (16,0,32,16) draw (16,32,32,16)
		if(leftTile && leftTile.type === this.type  && rightTile && rightTile.type === this.type) {
			ctx.drawImage(this.tileset.asset, rect.x + 16, rect.y + 96, 32, 16, pos.x + 0, pos.y + 0, 32, 16);
			ctx.drawImage(this.tileset.asset, rect.x + 16, rect.y + 96 + 48, 32, 16, pos.x + 0, pos.y + 16, 32, 16);
			//return;
		}

		// if both sides are of a diferent type,
		// draw (0,0,16,16) draw (0,48,16,16)
		if((!leftTile || (leftTile && leftTile.type != this.type)) && (!rightTile || (rightTile && rightTile.type != this.type))) {
			ctx.drawImage(this.tileset.asset, rect.x + 0, rect.y + 96, 16, 16, pos.x + 0, pos.y + 0, 16, 16);
			ctx.drawImage(this.tileset.asset, rect.x + 0, rect.y + 96 + 48, 16, 16, pos.x + 0, pos.y + 16, 16, 16);

			ctx.drawImage(this.tileset.asset, rect.x + 48, rect.y + 96, 16, 16, pos.x + 16, pos.y + 0, 16, 16);
			ctx.drawImage(this.tileset.asset, rect.x + 48, rect.y + 96 + 48, 16, 16, pos.x + 16, pos.y + 16, 16, 16);
		}

	};

	Tile.prototype.debugInfo = function (ctx, pos) {
		// draw tile debug info
		if(this.debug) {
			ctx.fillStyle = 'rgba(0,0,0,.8)';
			ctx.fillRect(pos.x, pos.y, 18, 10);
			ctx.font = 'Verdana-Bold 10px';
			ctx.fillStyle = '#fff';
			var str = Math.floor(this.gridx) + ',' + Math.floor(this.gridy);
			ctx.fillText(str, pos.x + 1, pos.y + 8);
		}
	};

}());

