(function () {

	var Data = function () {
		window.EventEmitter.call(this);


		var mapNames = JSON.parse(window.localStorage.getItem('mapNames')) || [];

		// Methods

		this.getMapNames = function() {
			return mapNames;
		};


		this.saveMap = function(filename) {
			// set map data
			var game = window.navTree.getItem('game');
			//console.log(game.grid.tilesX, game.grid.tilesY, game.grid.tiles);

			var tiles = [];
			for (var layer = 0; layer < 3; layer++) {
				tiles[layer] = [];
				for (var y = 0; y < game.grid.tilesY; y++) {
					tiles[layer][y] = [];
					for (var x = 0; x < game.grid.tilesX; x++) {
						var tile = game.grid.tiles[layer][y][x];
						if(tile) {
							tiles[layer][y][x] = {
								layer: tile.layer,
								gridx: tile.gridx,
								gridy: tile.gridy,
								size: tile.size,
								tileset:  "terrain",
								type: tile.type,
								visible: tile.visible,
								visited: tile.visited,
								walkable: tile.walkable
							};
						} else {
							tiles[layer][y][x] = null;
						}
					}
				}
			}

			// create final map object  and store it
			var map = { id: filename, tilesX: game.grid.tilesX, tilesY: game.grid.tilesY, tiles: tiles };
			window.localStorage.setItem('map_' + filename, JSON.stringify(map));
			//console.log('stringified map:', JSON.stringify(map));

			// add or replace map name in the map list
			var index = mapNames.indexOf(filename);
			if (index === -1) {
				mapNames.push(filename);
			} else {
				mapNames[index] = filename;
			}

			// and store map data in the local storage
			window.localStorage.setItem('mapNames', JSON.stringify(mapNames));
		};


		this.openMap = function(filename) {
			var map = JSON.parse(window.localStorage.getItem('map_' + filename)) || null;
			//console.log('OPENED:', filename, map);
			return map;
		};

	};


	window.inherits(Data, window.EventEmitter);
	window.Data = Data;

})();
