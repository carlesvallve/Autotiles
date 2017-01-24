var AutoTiles = (function(){
	'use strict';

	var cls = function(){};

	/**
	 * Conformed to RPG Tkool VX (en. RPG Maker VX) specifications
	 *
	 * Ref) http://tkool.jp/products/rpgvx/material.html
	 */
	cls.TILE_SIZE = [32, 32];
	cls.TILE_PART_SIZE = [16, 16];
	cls.TILE_SET_SIZE = [64, 96];


	/**
	 * Divide 32x32 size map chip to parts of 16x16 size with label "a"-"d"
	 *   +--+
	 *   |ab|
	 *   |dc|
	 *   +--+
	 *
	 * '00000' is a boundary line data
	 *   '00000'='Top Right Bottom Left Angle'
	 *   0=false 1=true
	 *
	 * Ref) http://blog42701.blog42.fc2.com/blog-entry-73.html
	 */
	cls.TILE_SPECIFICATIONS = {
		'a': {
			'00000': [64, 32],
			'10000': [32, 32],
			'00010': [64,  0],
			'10010': [32,  0],
			'00001': [ 0, 32]
		},
		'b': {
			'00000': [64, 16],
			'10000': [32, 16],
			'01000': [64, 48],
			'11000': [32, 48],
			'00001': [ 0, 48]
		},
		'c': {
			'00000': [48, 16],
			'01000': [48, 48],
			'00100': [80, 16],
			'01100': [80, 48],
			'00001': [16, 48]
		},
		'd': {
			'00000': [48, 32],
			'00100': [80, 32],
			'00010': [48,  0],
			'00110': [80,  0],
			'00001': [16, 32]
		}
	};

	/**
	 * Convert boundary data to parts data
	 *
	 * @param array boundaryData Is a boundary existed around a part of tile?
	 *                           [top, topRight, right, bottomRight, bottom, leftBottom, left, topLeft]
	 *                           0=Existed, 1=Not existed
	 *                           ex) [1, 1, 1, 0, 0, 0, 0, 0]
	 * @return array Auto tile parts data
	 */
	cls._convertBoundaryDataToPartsData = function(boundaryData){
		var a = [0, 0, 0, 0, 0];
		var b = [0, 0, 0, 0, 0];
		var c = [0, 0, 0, 0, 0];
		var d = [0, 0, 0, 0, 0];
		if (boundaryData[0]) { a[0] += 1; b[0] += 1; }
		if (boundaryData[1]) b[4] += 1;
		if (boundaryData[2]) { b[1] += 1; c[1] += 1; }
		if (boundaryData[3]) c[4] += 1;
		if (boundaryData[4]) { c[2] += 1; d[2] += 1;}
		if (boundaryData[5]) d[4] += 1;
		if (boundaryData[6]) { a[3] += 1; d[3] += 1; }
		if (boundaryData[7]) a[4] += 1;
		return [
			cls.TILE_SPECIFICATIONS.a[a.join('')],
			cls.TILE_SPECIFICATIONS.b[b.join('')],
			cls.TILE_SPECIFICATIONS.c[c.join('')],
			cls.TILE_SPECIFICATIONS.d[d.join('')]
		];
	};

	/**
	 * Convert neighbor squares data to boundary data
	 *
	 * @param array neighborhoodData
	 *                  Neighborhood tile types data are expressed by 2D array
	 *                  ex) [ [1, 1, 1],
	 *                        [0, 1, 1],
	 *                        [0, 0, 0] ]
	 * @return array Boundary data
	 */
	cls._convertNeighborhoodDataToBoundaryData = function(tileType, neighborhoodData){
		var bd = [0, 0, 0, 0, 0, 0, 0, 0];
		var n = neighborhoodData; // Compact variable name
		var t = tileType;
		if (n[0][1] !=  t) bd[0]++; // top
		if (n[0][1] === t && n[0][2] !=  t && n[1][2] === t) bd[1]++; // top-right
		if (n[1][2] !=  t) bd[2]++; // right
		if (n[1][2] === t && n[2][2] !=  t && n[2][1] === t) bd[3]++; // bottom-right
		if (n[2][1] !=  t) bd[4]++; // bottom
		if (n[2][1] === t && n[2][0] !=  t && n[1][0] === t) bd[5]++; // bottom-left
		if (n[1][0] !=  t) bd[6]++; // left
		if (n[1][0] === t && n[0][0] !=  t && n[0][1] === t) bd[7]++; // top-left
		return bd;
	};

	/**
	 * Convert neighbor squares data to boundary data
	 *
	 * @param array tiles
	 *                  The tiles of the map expressed by 2D array of objects
	 *
	 * @return array NeighborhoodData
	 */
	cls._createNeighborhoodData = function(tiles, tile){
		var getTileType = function(tile, topDelta, leftDelta){
			var row = tiles[tile.gridy + topDelta];
			if (!row) return 0;
			var neighborSquare = row[tile.gridx + leftDelta];
			if (!neighborSquare) return 0;
			return neighborSquare.type;
		};
		return [
			[
				getTileType(tile, -1, -1),
				getTileType(tile, -1, 0),
				getTileType(tile, -1, +1)
			],
			[
				getTileType(tile, 0, -1),
				getTileType(tile, 0, 0),
				getTileType(tile, 0, +1)
			],
			[
				getTileType(tile, +1, -1),
				getTileType(tile, +1, 0),
				getTileType(tile, +1, +1)
			]
		];
	};

	cls._createPartsData = function(tiles, tile){
		var neighborhoodData = cls._createNeighborhoodData(tiles, tile);
		var boundaryData = cls._convertNeighborhoodDataToBoundaryData(tile.type, neighborhoodData);
		var partsData = cls._convertBoundaryDataToPartsData(boundaryData);
		return [ // Merge part position in tile
			[[0, 0],                                         partsData[0]],
			[[0, cls.TILE_PART_SIZE[0]],                     partsData[1]],
			[[cls.TILE_PART_SIZE[1], cls.TILE_PART_SIZE[0]], partsData[2]],
			[[cls.TILE_PART_SIZE[1], 0],                     partsData[3]]
		];
	};

	cls.updateAutoTiles = function(tiles){
		for(var layer = 0; layer < 3; layer++) {
			for (var y = 0; y < tiles[layer].length; y++) {
				for (var x = 0; x < tiles[layer][0].length; x++) {
					var tile = tiles[layer][y][x];
					if(tile) {
						//if(tile.type === -1) { continue; }
						var partsData = cls._createPartsData(tiles[layer], tile);
						if(tile.tileset.mode === 'floor') {
							cls._setTileFloorData(tile, partsData);
						} else {
							cls._setTileWallData(tile, partsData);
						}

					}
				}
			}
		}
	};


	cls._setTileFloorData = function(tile, partsData) {
		tile.autotile = {
			a: { sourceX: partsData[0][1][1], sourceY: partsData[0][1][0], x: partsData[0][0][1], y: partsData[0][0][0] },
			b: { sourceX: partsData[1][1][1], sourceY: partsData[1][1][0], x: partsData[1][0][1], y: partsData[1][0][0] },
			c: { sourceX: partsData[2][1][1], sourceY: partsData[2][1][0], x: partsData[2][0][1], y: partsData[2][0][0] },
			d: { sourceX: partsData[3][1][1], sourceY: partsData[3][1][0], x: partsData[3][0][1], y: partsData[3][0][0] }
		}
	};


	cls._setTileWallData = function(tile, partsData) {
		tile.autotile = {
			a: { sourceX: partsData[0][1][1], sourceY: partsData[0][1][0], x: partsData[0][0][1], y: partsData[0][0][0] },
			b: { sourceX: partsData[1][1][1], sourceY: partsData[1][1][0], x: partsData[1][0][1], y: partsData[1][0][0] },
			c: { sourceX: partsData[2][1][1], sourceY: partsData[2][1][0], x: partsData[2][0][1], y: partsData[2][0][0] },
			d: { sourceX: partsData[3][1][1], sourceY: partsData[3][1][0], x: partsData[3][0][1], y: partsData[3][0][0] }
		}
	};


	/*cls._setTileWallData = function(tile, partsData) {
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

	};*/

	return cls;
}());


