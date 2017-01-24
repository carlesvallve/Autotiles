(function () {

	function loadingView() {
		window.wuic.components.View.call(this);
		var that = this;

		var type = null;
		var total = 0;
		var loaded = 0;
		var fontSize = 20;


		this.once('created', function (options, name) {

			// render view
			this.setRenderMethod(function (ctx) {
				// draw bg
				//ctx.drawImage(assets.bgLoading, 0,0, canvasWidth, canvasHeight);

				// draw labels
				ctx.fillStyle = '#fff';
				ctx.font ='bold ' + fontSize + 'px godofwar';
				ctx.textBaseline = 'middle';
				ctx.textAlign = 'center';
				ctx.fillText('Autotiles 1.0', canvasWidth / 2, canvasHeight / 2);

				// draw copyright message
				//utils.drawSimpleText(ctx, '© Copyright 2013, Wizcorp Inc. All Rights Reserved.', canvasWidth / 2, canvasHeight - 20, 'vinsdojo', 16, 'center', 'middle');

				// draw loading message
				//if (type) {
					//var msg = 'loading ' + type + ' ' + loaded + '/' + total;
					//console.log(msg);
					//utils.drawSimpleText(ctx, msg, canvasWidth / 1.52, canvasHeight / 1.65, 'vinsdojo', 22, 'center', 'middle');
				//}
			});
		});


		this.update = function (params) {
			type = params.type;
			loaded = params.loaded;
			total = params.total;
			var msg = 'loading ' + type + ' ' + loaded + '/' + total;
			//console.log(msg);
		};

	}


	window.inherits(loadingView, window.wuic.components.View);
	window.loadingView = loadingView;

}());
