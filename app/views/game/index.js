(function () {

	var Tween = window.wuic.core.Tween;

	function GameView() {
		window.wuic.components.View.call(this);
		var that = this;
		var tweens = {};

		this.width = canvasWidth;
		this.height = canvasHeight;

		this.currentTool = 'draw';

		//--------------------------
		// Init
		//--------------------------

		this.once('created', function (options, name) {

			// -----------------------
			// Tweens

			// alphaIn
			tweens.alphaIn = new Tween(Tween.QuadInOut, { alpha: 0 }, { alpha: 1 },  0, window.options.fadeInterval);
			this.addTween('alphaIn', tweens.alphaIn);
			tweens.alphaIn.on('change', function(v) {
				that.alpha = v.alpha;
			});

			// alphaOut
			tweens.alphaOut = new Tween(Tween.QuadInOut, { alpha: 1 }, { alpha: 0 },  0, window.options.fadeInterval);
			this.addTween('alphaOut', tweens.alphaOut);
			tweens.alphaOut.on('change', function(v) {
				that.alpha = v.alpha;
			});

			// -----------------------
			// Components

			// scrolling background
			var bg = new window.components.Background({ asset: assets.bg2 });
			this.appendChild(bg);

			// grid
			this.grid = new window.components.Grid({ x: 0, y: 32, tilesX: 32, tilesY: 32, gridSize: 32, margin: 0 });
			this.appendChild(this.grid);

			this.overlay = new window.components.GridOverlay({ x: 0, y: 32, tilesX: 32, tilesY: 32, gridSize: 32, margin: 0 });
			this.appendChild(this.overlay);

			// overlay (where we will draw the scores labels and information)
			/*this.overlay = new window.wuic.core.Sprite();
			this.appendChild(this.overlay);
			this.overlay.x = this.grid.x;
			this.overlay.y = this.grid.y;
			this.overlay.width = this.grid.width;
			this.overlay.height = this.grid.height;
			this.overlay.setRenderMethod(function (ctx) {
			});*/

			// header
			this.header = new window.components.Header();
			this.appendChild(this.header);

			// footer
			this.footer = new window.components.Footer();
			this.appendChild(this.footer);

			// popup
			//this.popup = new window.components.Popup();
			//this.appendChild(this.popup);
		});


		//--------------------------
		// Open
		//--------------------------

		this.on('opened', function (params) {
			// start tweeners
			tweens.alphaIn.start()

			// initialize game
			switch (params.action) {
				case 'new':
					this.init(params);
					break;
				case 'open':
					this.grid.buildMap(params.map);
					break;
				case 'save':
					break;
			}
		});


		this.init = function (params) {
			// init components
			this.header.init();
			this.footer.init();
			this.grid.init(params.map);
			this.overlay.init(params.map);

			// play audio
			window.timeHandler.wait(0.5, function() {
				//audio.play(assets.town, 0.2, false, true);
			});
		};


		//--------------------------
		// Close
		//--------------------------

		this.on('end', function (params) {
			// fade out ('once', cause we are in a 'on' listener already)
			tweens.alphaOut.once('finish', function(v) {
				navTree.open(params.viewName, params);
			});
			tweens.alphaOut.start();
		});


		//--------------------------
		// Render
		//--------------------------

		this.setRenderMethod(function (ctx) {
		});

	}


	window.inherits(GameView, window.wuic.components.View);
	window.gameView = GameView;

}());
