(function () {

	function HomeView() {
		var that = this;
		this.name = 'home';
		this.width = canvasWidth;
		this.height = canvasHeight;

		// create animated background
		this.bg = new window.components.Background(this.width, this.height, { x: 0, y: 1 });

		// create start button
		var w = 100, h = 40;
		this.btn = new components.Button({ view: this, asset: null,
			width: w, height:h, caption: 'START', alpha: 0.5, shadow: true, stroke: 'none',
			x: this.width / 2 - w / 2, y: this.height / 2 - h / 2 });
		this.btn.on('tapstart', function(e, mPos) {
			audio.play(assets.button1);
			that.fadeOut(0.3, 'game', { moves: 10 });
		});
	}


	HomeView.prototype = new View();
	window.HomeView = HomeView;


	HomeView.prototype.on('open', function (params) {
		// init background
		var img = assets['bg' + utils.randomInt(1,1)];
		this.bg.init(img);

		// fade-in view
		this.fadeIn(0.3, function() {
		});

		// play game ambient music
		//audio.pause(assets.town);
		//audio.pause(assets.gibons);
		//audio.play(assets.rain, 0.15, false, true);
	});


	HomeView.prototype.on('close', function (params) {
	});


	HomeView.prototype.on('draw', function (ctx) {
		ctx.save();

		this.bg.draw(ctx);

		/*if(this.scrollVal >= this.width){
			this.scrollVal = 0;
		}

		this.scrollVal+=2;
		ctx.drawImage(this.bg, this.width-this.scrollVal, 0, this.scrollVal, this.height, 0, 0, this.scrollVal, this.height);
		ctx.drawImage(this.bg, this.scrollVal, 0, this.bg.width, this.height);*/

		//draw background
		//ctx.drawImage(this.bg, 0, 0, this.width, this.height);
		// draw components
		this.btn.draw(ctx);
		// manage view fade in-out
		this.fade(ctx);

		ctx.restore();


	});



}());
