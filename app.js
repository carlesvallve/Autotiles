window.FRAME_RATE = 64;

var options = {
	showFps: true,
	debugTiles: false,
	drawGrid: false
};

var game = {
	player: {
		highScore: 0,
		score: 0,
		moves: 20,
		level: 1
	}
};

var canvasWidth, canvasHeight, canvas, context;
var navTree;

// --------------------------------------------------------------
// App Initialization
// --------------------------------------------------------------


function main () {
	initCanvas();
	loadAssets(initGame);
}


function initCanvas() {
	canvasWidth = 640 / 2;
	canvasHeight = 960 / 2;
	console.log('initCanvas: ' + canvasWidth + 'x' + canvasHeight + ' at ' + FRAME_RATE + ' fps');

	canvas = new window.wuic.core.Canvas();
	canvas.appendTo(document.body);
	canvas.setFrameRate(FRAME_RATE);
	canvas.setSize(canvasWidth, canvasHeight);
	context = canvas.getContext('2d');

	context.globalCompositeOperation = 'source-over';
	context.fillStyle = '#000';
	context.fillRect( 0, 0, canvasWidth, canvasHeight );
}

// --------------------------------------------------------------
// NavTree Logic
// --------------------------------------------------------------


function initNavTree() {
	// init navTree and views
	navTree = new NavTree();

	// register views
	navTree.add('home', new HomeView());
	navTree.add('game', new GameView());

	// set up event listeners
	navTree.on('open', function (view) {
		navTree.draw();
	});

	navTree.on('openPopup', function (view) {
		navTree.draw();
	});

	navTree.on('draw', function (view) {
		if(options.showFps) {
			utils.drawFPS(context);
		}
	});

	// open default view
	navTree.open('home');
}


// --------------------------------------------------------------
// Game Logic
// --------------------------------------------------------------


function initGame() {
	// init navTree and views
	initNavTree();

	// init game loop
	canvas.on('frameUpdate', updateGame);

	// init mouse
	initMouse();

	// init fireworks
	window.fireworks = new Fireworks();

	console.log('INIT GAME!');

	// if we are in Wizcorp native framework let's display the canvas
	if (window.cordova) {
		window.cordova.showCanvas();
	}

}


function updateGame() {
	// update tweener
	Tweener.update();

	// render the game
	renderGame();
}


function renderGame() {
	// set canvas default props
	context.fillStyle = '#000000';
	context.fillRect(0, 0, canvasWidth, canvasHeight);
	context.globalCompositeOperation = 'source-over';

	// draw the navTree
	navTree.draw();

	//fx.setColorTransform(context, assets.tile0, 255, 0, 0, .5);

	// update and draw the fireworks
	window.fireworks.update();
}


// --------------------------------------------------------------
// Mouse/Touch Events
// --------------------------------------------------------------

var buttonBehavior = new wuic.behaviors.Button();
var mouseDown = false;

function initMouse() {
	mouseDown = false;
	if(window.ejecta) {
		canvas.addEvent('touchstart');
		canvas.addEvent('touchend');
		canvas.addEvent('touchmove');
		canvas.on('touchstart', touchstart);
		canvas.on('touchend', touchend);
		canvas.on('touchmove', touchmove);
	} else {
		canvas.addEvent('mousedown');
		canvas.addEvent('mouseup');
		canvas.addEvent('mousemove');
		canvas.on('mousedown', touchstart);
		canvas.on('mouseup', touchend);
		canvas.on('mousemove', touchmove);
	}
}


function touchstart(e) {
	var currentView = navTree.getCurrentView();
	if (mouseDown || !currentView) {
		return false;
	}
	mouseDown = true;
	var touchPos = getTouchPos(e);
	buttonBehavior.tapstart(e, touchPos);
	//currentView.tapstart(e, touchPos);
}


function touchend(e) {
	mouseDown = false;
	var currentView = navTree.getCurrentView();
	if (mouseDown || !currentView) {
		return false;
	}
	var touchPos = getTouchPos(e);
	buttonBehavior.tapend(e, touchPos);
	//currentView.tapend(e, touchPos);
}


function touchmove(e) {
	var currentView = navTree.getCurrentView();
	if (!mouseDown || !currentView) {
		return false;
	}
	var touchPos = getTouchPos(e);
	buttonBehavior.tapmove(e, touchPos);
	//currentView.tapmove(e, touchPos);
}


function getTouchPos(e) {
	var x, y;
	if(window.ejecta) {
		x = e.changedTouches[0].pageX;
		y = e.changedTouches[0].pageY;
	} else {
		var totalOffsetX = document.body.offsetLeft - document.body.scrollLeft;
		var totalOffsetY = document.body.offsetTop - document.body.scrollTop;
		x = e.clientX - totalOffsetX;
		y = e.clientY - totalOffsetY;
	}
	return { x:x, y:y };
}
