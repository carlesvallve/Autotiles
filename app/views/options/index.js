(function () {

	var Tween = window.wuic.core.Tween;

	function OptionsView() {
		window.wuic.components.View.call(this);
		var game = navTree.getItem('game');
		var that = this;

		var tweens = {};
		var buttons = {};
		var butBack;
		var popup;


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
			tweens.alphaIn.on('finish', function(v) {
				window.wuic.behaviors.buttonEnable(butBack);
			});

			// alphaOut
			tweens.alphaOut = new Tween(Tween.QuadInOut, { alpha: 1 }, { alpha: 0 },  0, window.options.fadeInterval);
			this.addTween('alphaOut', tweens.alphaOut);
			tweens.alphaOut.on('change', function(v) {
				that.alpha = v.alpha;
			});


			// -----------------------
			// Bg

			// scrolling background
			var bg = new window.components.Background({ asset: assets.bg2 });
			this.appendChild(bg);


			// -----------------------
			// Options Frame

			var w = canvasWidth - (20), h = 40, a = 0.8;
			var x = (canvasWidth - w) / 2, y = 0;

			// Title
			y = 10; h = 40;;
			var title = new window.components.Button({ caption: 'Options', x: x, y: y, width: w, height: h, alpha: a });
			this.appendChild(title);

			// Box
			y = 55; h = 370;
			var box = new window.components.Button({ caption: '', x: x, y: y, width: w, height: h, alpha: a });
			this.appendChild(box);

			// Back
			y = canvasHeight - 50; h = 40;
			butBack = new window.components.Button({ caption: 'Back', x: x, y: y, width: w, height: h, alpha: a });
			this.appendChild(butBack);
			butBack.on('tapstart', function (event, pos) {
				that.emit('end', { viewName: 'game' });
			});


			// -----------------------
			// Buttons

			w = box.width - 40; h = 40; a = 0.8; x = (box.width - w) / 2;


			// New
			buttons.butNew = new window.components.Button({ caption: 'New', x: x, y: 20, width: w, height: h, alpha: a });
			box.appendChild(buttons.butNew);
			buttons.butNew.on('tapstart', function (event, pos) {

				popup.init({ type: 'new', width: canvasWidth - 40, height: 350, title: 'NEW MAP', body:'Please introduce\nthe dimensions\nof the new map:',
					butData: {
						ok: { caption: 'ok', cb: function() {
								// hide 'new' popup
								popup.inputX.hide(); popup.inputY.hide();
								window.timeHandler.wait(0.3, function() {
									popup.end('none');
								});
								// open game view with a new clean map
							var map = { tilesX: ~~popup.inputX.elm.value, tilesY: ~~popup.inputY.elm.value };
								that.emit('end', { viewName: 'game', action: 'new', map: map });
							}
						},
						cancel: { caption: 'cancel', cb: function() { popup.end('out') } }
					}
				});
			});


			// Open
			buttons.butOpen = new window.components.Button({ caption: 'Open', x: x, y: 70, width: w, height: h, alpha: a });
			box.appendChild(buttons.butOpen);
			buttons.butOpen.on('tapstart', function (event, pos) {

				var mapList = window.data.getMapNames();
				console.log('mapList:', mapList);

				popup.init({ type: 'open', width: canvasWidth - 40, height: 350, title: 'OPEN MAP', body: null,
					menuData: { y: 60, width: 200, height: 30, arr: mapList, cb: function(params) {} },
					butData: {
						open: { caption: 'open', cb: function() {
								if(!popup.menu.selectedItem) { return; }
								console.log('open selected map:', popup.menu.selectedItem.num, popup.menu.selectedItem.getCaption());
								popup.end('none');

								// read map data and build a new map with it
								var map = window.data.openMap(popup.menu.selectedItem.getCaption());
								//game.grid.buildMap(map);

								//window.player.getMapNames();
								that.emit('end', { viewName: 'game', action: 'open', map: map });
							}
						},
						cancel: { caption: 'cancel', cb: function() { popup.end('out'); } }
					}
				});
			});


			// Save
			buttons.butSave = new window.components.Button({ caption: 'Save', x: x, y: 120, width: w, height: h, alpha: a });
			box.appendChild(buttons.butSave);
			buttons.butSave.on('tapstart', function (event, pos) {

				var mapList = window.data.getMapNames();

				popup.init({ type: 'save', width: canvasWidth - 40, height: 350, title: 'SAVE MAP', body: null,
					menuData: {
						y: 90, width: 200, height: 30, arr: mapList, cb: function(params) {
							console.log('clicked on menu button:', params);
							popup.inputName.elm.value = params.caption;
						}
					},
					butData: {
						save: { caption: 'save', cb: function() {
							if(!popup.inputName.elm.value) { return; }
							console.log('save selected map:', popup.inputName.elm.value);
							popup.end('none');

							window.data.saveMap(popup.inputName.elm.value);
							//that.emit('end', { viewName: 'game', action: 'new', mapX: popup.inputX.value, mapY: popup.inputY.value });
						}
						},
						cancel: { caption: 'cancel', cb: function() { popup.end('out'); } }
					}
				});
			});

			// Grid Options

			// grid
			buttons.butGrid = new window.components.Button({ caption: 'Grid: over', x: x, y: 260, width: w, height: h, alpha: a });
			box.appendChild(buttons.butGrid);
			buttons.butGrid.on('tapstart', function (event, pos) {
				this.setCaption({ caption: 'Grid: ' + game.grid.changeOption('grid') });
			});

			// walls
			buttons.butWalls = new window.components.Button({ caption: 'Walls: off', x: x, y: 310, width: w, height: h, alpha: a });
			box.appendChild(buttons.butWalls);
			buttons.butWalls.on('tapstart', function (event, pos) {
				this.setCaption({ caption: 'Walls: ' + game.grid.changeOption('walls') });
			});


			// -----------------------
			// Popup

			popup = new window.components.Popup({});
			this.appendChild(popup);
			popup.on('open', function() { that.toggleButtons(false); });
			popup.on('opened', function() {
				if(popup.type === 'new') {
					popup.inputX.show();
					popup.inputY.show();
				} else if(popup.type === 'save') {
					popup.inputName.show();
				}
			});
			popup.on('close', function() {
				if(popup.type === 'new') {
					popup.inputX.hide();
					popup.inputY.hide();
				} else if(popup.type === 'save') {
					popup.inputName.hide();
				}
			});
			popup.on('closed', function() { that.toggleButtons(true); });


			// -----------------------
			// Input Boxes (These are DOM based, we must figure out a way to emulate them in Ejecta...)

			// map dimensions input boxes
			popup.inputX = new window.components.Input({ x: (canvasWidth - 100) / 2, y: 200, width: 100, height: 20, align:'center', type: 'text', caption: '16' });
			popup.inputY = new window.components.Input({ x: (canvasWidth - 100) / 2, y: 240, width: 100, height: 20, align:'center', type: 'text', caption: '16' });

			// map name input box
			popup.inputName = new window.components.Input({ x: 5 + (canvasWidth - 200) / 2, y: 120, width: 185, height: 20, align:'center', type: 'text', caption: 'default' });

		});


		this.toggleButtons = function (enable) {
			for (var i in buttons) {
				if(enable) {
					window.wuic.behaviors.buttonEnable(buttons[i]);
				} else {
					window.wuic.behaviors.buttonDisable(buttons[i]);
				}
			}
		};


		//--------------------------
		// Open
		//--------------------------

		this.on('opened', function (params) {
			window.wuic.behaviors.buttonDisable(butBack);

			// close any opened popups
			popup.emit('close');

			// start tweeners
			tweens.alphaIn.start();

			// play audio
			window.timeHandler.wait(0.5, function() {
			});
		});


		//--------------------------
		// Close
		//--------------------------

		this.on('end', function (params) {
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


	window.inherits(OptionsView, window.wuic.components.View);
	window.optionsView = OptionsView;

}());
