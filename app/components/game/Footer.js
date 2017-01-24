(function () {

	var Tween = window.wuic.core.Tween;

	var Footer = function Footer(params) {
		wuic.core.Sprite.call(this);
		var view = navTree.getItem('game');
		var that = this;

		// init params
		this.asset = params && params.asset || null;
		this.width = params && params.width || canvasWidth;
		this.height = params && params.height || 32;
		this.alpha = params && params.alpha || 1;
		this.y = canvasHeight - this.height;

		// init vars
		var tweens = {};
		var buttons = {};

		this.selectedLayer = 0;
		this.tileMode = 'floor';
		this.tilesetOpen = false;

		// create tileset box

		var tileset = this.tileset = new components.Tileset({ gridSize: 28, x: 6, y: 32 }); // width: this.width - 12, height: 32
		this.appendChild(tileset);

		// create layers button

		buttons.layer = new window.components.Button({ caption: '1  2  3', x: 4, y: 6, width: 65, height: 20, alpha: 0.8, bgcolor: '#222' });
		this.appendChild(buttons.layer);
		buttons.layer.on('tapstart', function(e, mPos) {
			that.selectedLayer = Math.floor(mPos.localX / (buttons.layer.width / 3));
			console.log('selectedLayer:', that.selectedLayer);
		});

		// create tileset button

		buttons.tileset = new window.components.Button({ caption: 'A  B  C  D', x: 75, y: 6, width: 95, height: 20, alpha: 0.8, bgcolor: '#222' });
		this.appendChild(buttons.tileset);
		buttons.tileset.on('tapstart', function(e, mPos) {
			var tilesetNum = Math.floor(mPos.localX / (buttons.tileset.width / 4)); // (this is only for drawing the selection in this class)
			tileset.selectTileset(tilesetNum);
		});

		// create mode button (floor/wall)

		buttons.options = new window.components.Button({ caption: 'Options', x: 176, y: 6, width: 85, height: 20, alpha: 0.8, bgcolor: '#222' });
		this.appendChild(buttons.options);
		buttons.options.on('tapstart', function(e, mPos) {
			//if(that.tileMode === 'floor') { that.options = 'wall'; } else { that.options = 'floor'; }
			//this.caption = that.tileMode;
			//navTree.open('options');
			view.emit('end', { viewName: 'options' });
		});

		// create exit button

		buttons.exit = new window.components.Button({ caption: 'Exit', x: (this.width - 54), y: 6, width: 50, height: 20, alpha: 0.8, bgcolor: '#222' });
		this.appendChild(buttons.exit);
		buttons.exit.on('tapstart', function(e, mPos) {
			//navTree.open('home');
			view.emit('end', { viewName: 'home' });
		});


		//-----------------------------------
		// Init
		//-----------------------------------

		this.init = function () {
			this.tileset.init();
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


		//-------------------------------------
		// Adjust footer to fit current tileset
		//-------------------------------------

		this.adjustFooter = function(open) {
			// get footer new y position
			var y = view.height - 32;
			if(open) {
				y = view.height - 32 - tileset.height - 8;
			}

			// tween footer to match current tileset
			//tileset.hide();
			tweens.move = new Tween(Tween.QuadInOut, { y: this.y }, { y: y },  0, 0.5);
			this.removeTween('move');
			this.addTween('move', tweens.move);
			tweens.move.on('change', function(v) {
				that.y = v.y;
				that.height = view.height - v.y;
			});
			tweens.move.on('finish', function(v) {
				//tileset.show();
			});
			tweens.move.start();

			// record open state
			this.tilesetOpen = open;
		}

	};


	window.inherits(Footer, window.wuic.core.Sprite);
	window.components.Footer = Footer;

}());




