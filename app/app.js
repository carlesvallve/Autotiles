/*
- Create a function capable of writing colored text
- Use it to colorize footer's menu selections
- create a map bigger than the screen
- implement drag behaviour to scroll the grid map
- create options button
- create options popup with:
	- new
	- open
	- save
	- wall height
 */


window.FRAME_RATE = 64;

window.options = {
	showFps: false,
	fadeInterval: 0.3
};

var navTree;
var assets;
var canvasWidth, canvasHeight, canvas, context;

window.timeHandler = new window.Timer();
var ua = window.browserCompatibility.ua;


window.data = new window.Data();

//window.maps = window.localStorage.getItem('maps') || {};

// --------------------------------------------------------------
// App Initialization
// --------------------------------------------------------------

function main () {


	// preload assets to use in loading screen
	preloadAssets(function() {
		// init canvas
		console.log('[APP] initialize canvas...');
		initCanvas();

		// init navTree
		console.log('[APP] initialize navTree...');
		initNavTree();

		// update canvas frame
		canvas.on('frameUpdate', updateGame);

		// load game assets
		console.log('[APP] loading assets...');
		loadAssets(initGame);
	});

}

// --------------------------------------------------------------
// Canvas Initialization
// --------------------------------------------------------------

function initCanvas() {
	/*var screenW = window.innerWidth;
	var screenH = window.innerHeight;

	if ((screenW == 320 && screenH == 568) || (screenW == 640 && screenH == 1136)) {
		// iphone 5 in a half sized viewport or full sized viewport
		canvasWidth = 640;
		canvasHeight = 1136;
	} else {
		// iphone 4 and default resolution
		canvasWidth = 640;
		canvasHeight = 960;
	}*/

	canvasWidth = 320;
	canvasHeight = 480;

	console.log('[APP] canvas status: ' + canvasWidth + 'x' + canvasHeight + ' at ' + FRAME_RATE + 'fps');

	var canvasSrc = document.getElementById('canvas');
	if (!canvasSrc) {
		// for browser
		canvasSrc = document.createElement('canvas');
		document.body.appendChild(canvasSrc);
	}
	canvas = new window.wuic.core.Canvas(canvasSrc);
	canvas.appendTo(document.body);
	canvas.setFrameRate(FRAME_RATE);
	canvas.setSize(canvasWidth, canvasHeight);
	context = canvas.getContext('2d');

	context.globalCompositeOperation = 'source-over';
	context.fillStyle = '#000';
	context.fillRect( 0, 0, canvasWidth, canvasHeight );

	console.log('[APP] canvas setup complete...');



}


// --------------------------------------------------------------
// NavTree Logic
// --------------------------------------------------------------


function initNavTree() {
	// init navTree
	console.log('[APP] initalizing NavTree...');
	navTree = new window.NavTree({}, { parentElement: window.context });

	// register loading view
	console.log('[APP] registering landing view'); // >> ' + navTree.register);
	navTree.register('loading', new window.loadingView());

	// open loading view
	console.log('[APP] opening loading view...');
	navTree.open('loading');

	// debug frame rate display
	navTree.on('draw', function (view) {
		if (options.showFps) {
			window.utils.drawFPS(context);
		}
	});
}


// --------------------------------------------------------------
// Mouse/Touch Events
// --------------------------------------------------------------

var mouseDown = false;

function initMouse() {

	var isSmartPhone = ua.isIOS() || ua.isAndroid();

	mouseDown = false;
	if (window.ejecta || isSmartPhone) {
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
	//console.log('touchstart', e);
	window.wuic.behaviors.setupButtonStart(e);
}


function touchend(e) {
	//console.log('touchend', e);
	window.wuic.behaviors.setupButtonEnd(e);
}


function touchmove(e) {
	e.preventDefault();
	//console.log('touchmove', e);
	window.wuic.behaviors.setupButtonMove(e);
}


// --------------------------------------------------------------
// Game Logic
// --------------------------------------------------------------

function initGame() {

	// add game views to navTree
	navTree.register('home', new window.homeView());
	navTree.register('game', new window.gameView());
	navTree.register('options', new window.optionsView());

	// open default view
	navTree.open('home');

	// init mouse
	initMouse();

	// init fx
	window.fireworks = new Fireworks();

	console.log('[APP] game initialized...');
}


function updateGame() {
	// update time handler
	window.timeHandler.update();

	// render the game
	renderGame();
}


function renderGame() {
	// set canvas default props
	context.fillStyle = '#000000';
	context.fillRect(0, 0, canvasWidth, canvasHeight);
	context.globalCompositeOperation = 'source-over';

	// set canvas default props
	context.fillStyle = '#000000';
	context.fillRect(0, 0, canvasWidth, canvasHeight);
	context.globalCompositeOperation = 'source-over';

	// draw the currentView
	var currentView = navTree.stack.current();
	if (currentView && currentView.item) {
		currentView.item._render();
		navTree.emit('draw', currentView.item);
	}

	// update and draw the fireworks
	if(window.fireworks) {
		window.fireworks.update();
	}
}




