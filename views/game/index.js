(function () {

	function GameView() {
		this.name = 'game';
		this.width = canvasWidth;
		this.height = canvasHeight;

		// create animated background
		//this.bg = assets.bg2; //new window.components.Background(this.width * 2, this.height, { x: 0, y: -1 });

		// create header
		this.header = new components.Header( { view: this, x: 0, y: 0, width: this.width + 1, height: 32, alpha: 1 });

		// create footer
		this.footer = new components.Footer( { view: this, x: 0, y: this.height - 32, width: this.width + 1, height: 128, alpha: 1 });

		// create grid
		this.grid = new components.TileBoard( { view: this, x: 0, y: 32, tilesX: 10, tilesY: 13, gridSize: 32, tileSize: 32, margin: 0 });
		//this.grid = new components.TileBoard( { view: this, x: 4, y: 39, tilesX: 9, tilesY: 10, gridSize: 39, tileSize: 27, margin: 0 });
	}

	GameView.prototype = new View();
	window.GameView = GameView;


	GameView.prototype.on('open', function (params) {
		// init game vars
		window.game.player.score = 0;
		window.game.player.moves = params.moves || 10;

		// init background
		//this.bg.init(assets['bg' + utils.randomInt(2,2)]);

		// init tile board
		this.grid.init();

		// fade-in game view
		this.fadeIn(0.3, function() {
		});

		// play game ambient music
		//audio.pause(assets.rain);
		//audio.play(assets.gibons, 0.2, false, true);
		//audio.play(assets.town, 0.1, false, true);
	});


	GameView.prototype.on('close', function (params) {
	});


	GameView.prototype.on('draw', function (ctx) {
		ctx.save();

		//draw background
		ctx.fillStyle = '#000';
		ctx.fillRect(0, 0, this.width, this.height);
		//ctx.drawImage(this.bg, 0, 0, this.width, this.height);
		//this.bg.draw(ctx);
		// draw components
		this.grid.draw(ctx);
		// draw header
		this.header.draw(ctx);
		// draw footer
		this.footer.draw(ctx);
		// manage view fade in-out
		this.fade(ctx);

		ctx.restore();
	});

}());
