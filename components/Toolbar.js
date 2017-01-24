(function () {

	var Toolbar = function (params) {
		// init as a sprite
		this.initSprite(params);

		var that = this;
		this.buttons = {};
		this.selectedLayer = 0;
		this.selectedTileset = 0;
		this.tilesetOpen = false;

		// create layers button

		this.buttons.layer = new components.Button({ view: this.view, parent: this, asset: null, fontSize: 12,
			caption: '1  2  3', corners: 5, alpha: 1, shadow: false, stroke: '#fff',
			x: 4, y: 4, width: 50, height: 20, captionOffset: 3 });

		this.buttons.layer.on('tapstart', function(e, mPos) {
			var x = Math.floor(mPos.x / 17);
			that.selectedLayer = x;
		});

		// create tileset button

		this.buttons.tileset = new components.Button({ view: this.view, parent: this, asset: null, fontSize: 12,
			caption: 'A  B  C  D', corners: 5, alpha: 1, shadow: false, stroke: '#fff',
			x: 60, y: 4, width: 70, height: 20, captionOffset: 3 });

		this.buttons.tileset.on('tapstart', function(e, mPos) {
			var x = Math.floor(mPos.x / 16);
			that.selectedTileset = x; // (this is only for drawing the selection in this class)
			that.parent.tileset.selectTileset(that.selectedTileset);
		});

		// create mode button (floor/wall)

		this.buttons.tileMode = new components.Button({ view: this.view, parent: this, asset: null, fontSize: 12,
			caption: 'Floor', corners: 5, alpha: 1, shadow: false, stroke: '#fff',
			x: 136, y: 4, width: 50, height: 20, captionOffset: 3 });

		this.tileMode = 'floor';
		this.buttons.tileMode.on('tapstart', function(e, mPos) {
			if(that.tileMode === 'floor') { that.tileMode = 'wall'; } else { that.tileMode = 'floor'; }
			this.caption = that.tileMode;
		});

		// create exit button

		this.buttons.exit = new components.Button({ view: this.view, parent: this, asset: null, fontSize: 12,
			caption: 'exit', corners: 5, alpha: 1, shadow: false, stroke: '#fff',
			x: this.width - 54, y: 4, width: 50, height: 20, captionOffset: 3 }); //this.width - 54

		this.buttons.exit.on('tapstart', function(e, mPos) {
			navTree.open('home');
		});

	};


	Toolbar.prototype = new wuic.core.Sprite();
	components.Toolbar = Toolbar;


	Toolbar.prototype.draw = function(ctx) {
		// draw all buttons
		for(var i in this.buttons) {
			this.buttons[i].draw(ctx);
		}

		// draw layer selection
		wuic.drawings.roundRect(ctx, this.gx() + 4 + (16 * this.selectedLayer), this.gy() + 4, 18, 20, 5, '#fff', null, 0.2);
		// draw tileset selection
		wuic.drawings.roundRect(ctx, this.gx() + 60 + (17 * this.selectedTileset), this.gy() + 4, 18, 20, 5, '#fff', null, 0.2);
	};

}());

