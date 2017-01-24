(function () {

	var Header = function Header(params) {
		wuic.core.Sprite.call(this);
		var view = navTree.getItem('game');
		var that = this;

		// init vars
		this.asset = params && params.asset || null;
		this.width = params && params.width || canvasWidth;
		this.height = params && params.height || 32;
		this.alpha = params && params.alpha || 1;

		this.fontSize = 12;


		// create toolbar buttons (draw / drag)

		var x = this.width - 130;
		var butDraw = new window.components.Button({ caption: 'Draw', x: x, y: 5, width: 60, height: 20, alpha: 0.8, bgcolor: '#922' });
		this.appendChild(butDraw);
		butDraw.on('tapend', function(e, mPos) {
			view.currentTool = 'draw';
			console.log('currentTool:', view.currentTool);
		});

		x = this.width - 65;
		var butDrag = new window.components.Button({ caption: 'Drag', x: x, y: 5, width: 60, height: 20, alpha: 0.8, bgcolor: '#229' });
		this.appendChild(butDrag);
		butDrag.on('tapend', function(e, mPos) {
			view.currentTool = 'drag';
			console.log('currentTool:', view.currentTool);
		});


		//-----------------------------------
		// Init
		//-----------------------------------

		this.init = function () {
		};


		//-----------------------------------
		// Render
		//-----------------------------------

		this.setRenderMethod(function (ctx) {

			if(this.asset) {
				ctx.drawImage(this.asset, 0, 0, this.width, this.height);
			} else {
				// draw shadow
				context.shadowOffsetX = 0;
				context.shadowOffsetY = 2;
				context.shadowBlur = 5;
				context.shadowColor = "black";
				// draw bg
				window.drawings.roundRect(ctx, 0, 0, this.width, this.height, 0, 'rgba(0,0,0,0.5)');
			}

		});

	};


	window.inherits(Header, window.wuic.core.Sprite);
	window.components.Header = Header;

}());




