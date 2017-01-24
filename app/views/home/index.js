(function () {

	var Tween = window.wuic.core.Tween;

	function HomeView() {
		window.wuic.components.View.call(this);
		var that = this;
		var tweens = {};

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

			// play button
			var x = canvasWidth / 2 - (110 / 2), y = canvasHeight / 2 - (45 / 2);
			var butPlay = new window.components.Button({ caption: 'Play', x: x, y: y, width: 110, height: 40, alpha: 0.8 }); //asset: assets.butGreen
			this.appendChild(butPlay);
			butPlay.on('tapstart', function (event, pos) {
				// open game view
				that.emit('end', { viewName: 'game', action: 'new', map: { tilesX: 16, tilesY: 16 } });
			});
		});


		//--------------------------
		// Open
		//--------------------------

		this.on('opened', function (params) {
			window.navTree.clearHistory();

			// start tweeners
			tweens.alphaIn.start();

			// init components

			// play audio
			window.timeHandler.wait(0.5, function() {
			});
		});


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


	window.inherits(HomeView, window.wuic.components.View);
	window.homeView = HomeView;

}());
