(function () {

	var Tween = window.wuic.core.Tween;

	var Popup = function Popup(params) {
		wuic.core.Sprite.call(this);
		var that = this;


		// init vars
		this.type = null;
		this.width = canvasWidth;
		this.height = canvasHeight;
		this.alpha = 1;
		this.tweens = {};

		// buttons and callbacks
		var butData = {};
		var buttons = [];
		var menu = null;
		var cb = null;

		// appereance
		var bgcolor = '#000';
		var fgcolor = '#999';
		var lineHeight = 0.5;
		var shadow = false;

		// fonts
		var color = '#fff';
		var fontName = 'godofwar';
		var fontSize = 16;


		// define content
		var title = '';
		var body = '';
		var menuData = null;

		// hide popup by default
		var tweening = false;
		this.hide();

		//-----------------------------------
		// Menu
		//-----------------------------------

		this.createMenu = function() {
			// create new menu
			this.menu = new window.components.Menu({ x: (this.width - 200) / 2, y: menuData.y, width: menuData.width, height: menuData.height,
												arr: menuData.arr, cb: menuData.cb });
			this.appendChild(this.menu);
		};


		//-----------------------------------
		// Buttons
		//-----------------------------------

		this.createButtons = function() {
			// destroy previous buttons
			this.destroyButtons();

			var totalw = 0;

			// create button
			function createButton(data) {
				var w = data.width || 100;
				var h = data.height || 30;
				var but = new window.components.Button({ caption: data.caption,
					x: 0, y: that.height - h - 20, width: w, height: h,
					alpha: 0.8, bgcolor: '#222', fgcolor: '#fff', lineHeight: 1 });
				that.appendChild(but);
				but.on('tapstart', function(e, mPos) {
					if(data.cb) {
						data.cb();
					}
				});

				totalw += w;
				return but;
			}

			// create buttons
			for(var d in butData) {
				buttons.push(createButton(butData[d]));
			}

			// auto-positionate buttons in popup
			var between = Math.floor((this.width - totalw - 40) / (buttons.length + 1));
			var currentButWidthAdd = 0;
			for (var i = 0, len = buttons.length; i < len; i++) {
				var but = buttons[i];
				but.x = 20 + between * (i + 1) + currentButWidthAdd;
				currentButWidthAdd += but.width;
			}
		};


		this.destroyButtons = function () {
			for(var i = 0, len = buttons.length; i < len; i++) {
				buttons[i].destroy();
			}
			buttons = [];
		};


		//-----------------------------------
		// Init
		//-----------------------------------

		this.init = function(params) {
			// assign parameters
			this.type = params && params.type ? params.type : null;
			this.width = params && params.width ? params.width : canvasWidth;
			this.height = params && params.height ? params.height : canvasHeight;
			this.w = this.width;
			this.h = this.height;
			this.x = (canvasWidth - this.width) / 2;
			this.y = (canvasHeight - this.height) / 2;
			this.alpha = params && params.alpha ? params.alpha : 1;

			butData = params && params.butData ? params.butData : butData;
			cb = params && params.cb ? params.cb : null;

			fontName = params && params.fontName ? params.fontName : 'godofwar';
			fontSize =  params && params.fontSize ? params.fontSize : 14;
			shadow = true;

			// assign content
			title = params && params.title ? params.title : '';
			body = params && params.body ? params.body : '';
			menuData = params && params.menuData ? params.menuData : null;

			// colors
			bgcolor = params && params.bgcolor ? params.bgcolor : '#000';
			fgcolor = params && params.fgcolor ? params.fgcolor : '#999';
			lineHeight = params && params.lineHeight ? params.lineHeight : 0.5;

			// destroy previous menu
			if(this.menu) {
				this.menu.destroy();
			}

			// create menu
			if(menuData) {
				this.createMenu();
			}

			// create buttons
			this.createButtons();

			// start popup transition-in
			this.animate('in');
		};


		this.end = function(transitionType) {
			// set default transition type
			if(!transitionType) {
				transitionType = 'out';
			}

			// close popup without transition
			if(transitionType === 'none') {
				that.emit('close');
				that.eachChild(function(child) {
					child.hide();
				});

				that.emit('closed');
				if(that.cb) {
					that.cb();
				}

			// or start popup transition
			} else {
				this.animate(transitionType);
			}
		};


		this.animate = function(mode) {
			this.tweens = {};
			var w = this.w;
			var h = this.h;
			this.width = 0; this.height = 0;
			var x = (canvasWidth - w) / 2;
			var y = (canvasHeight -h) / 2;

			// tween in

			this.tweens.in = new Tween(Tween.QuadInOut, { w: 0, h: 0, x: canvasWidth / 2, y: canvasHeight / 2, a: 0 }, { w: w, h: h, x: x, y: y, a: 1 }, 0, 0.3);
			this.removeTween('in');
			this.addTween('in', this.tweens.in);

			this.tweens.in.on('change', function(v) {
				that.x = v.x;
				that.y = v.y;
				that.width = v.w;
				that.height = v.h;
				that.alpha = v.a;
			});
			this.tweens.in.on('start', function() {
				that.emit('open');
				that.eachChild(function(child) {
						child.hide();
				});
				that.show();
			});
			this.tweens.in.on('finish', function(v) {
				that.emit('opened');
				that.eachChild(function(child) {
					child.show();
				});
			});

			// tween out

			this.tweens.out = new Tween(Tween.QuadInOut, { w: w, h: h, x: x, y: y, a: 1 }, { w: 0, h: 0, x: canvasWidth / 2, y: canvasHeight / 2, a: 0 }, 0, 0.3);
			this.removeTween('out');
			this.addTween('out', this.tweens.out);

			this.tweens.out.on('change', function(v) {
				that.x = v.x;
				that.y = v.y;
				that.width = v.w;
				that.height = v.h;
				that.alpha = v.a;
			});
			this.tweens.out.on('start', function() {
				that.emit('close');
				that.eachChild(function(child) {
					child.hide();
				});
			});
			this.tweens.out.on('finish', function() {
				that.emit('closed');
				if(that.cb) {
					that.cb();
				}
			});

			// start animation
			this.tweens[mode].start();
		};


		this.on('open', function() {
		});


		this.on('opened', function() {
		});


		this.on('close', function() {
		});


		this.on('closed', function() {
			that.hide();
		});


		//-----------------------------------
		// Render
		//-----------------------------------

		this.setRenderMethod(function (ctx) {

			ctx.save();

			// set shadow
			if(shadow) {
				ctx.shadowOffsetX = 0;
				ctx.shadowOffsetY = 2;
				ctx.shadowBlur = 5;
				ctx.shadowColor = "black";
			}

			// draw bg
			if(this.asset) {
				ctx.drawImage(this.asset, 0, 0, this.width, this.height);
			} else {
				window.drawings.roundRect(ctx, 0, 0, this.width, this.height, 5, bgcolor, fgcolor, lineHeight);
			}

			if(this.alpha === 1) {
				ctx.fillStyle = color;
				ctx.textAlign = 'center';
				ctx.textBaseline = 'top';

				// draw text content
				ctx.font ='bold ' + (fontSize + 10) + 'px ' + fontName;
				ctx.fillText(title, this.width / 2, 20);

				// draw body
				if(body) {
					ctx.font ='bold ' + fontSize + 'px ' + fontName;
					utils.fillMultilineText(ctx, body, this.width / 2, 60, fontSize);
				}
			}

			ctx.restore();
		});


	};


	window.inherits(Popup, window.wuic.core.Sprite);
	window.components.Popup = Popup;


}());

