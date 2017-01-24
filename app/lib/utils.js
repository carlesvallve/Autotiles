window.components = {};

window.utils = {};

window.utils.gameText = null; // we populate this object in app.js

// display game text
/*
* @textCode     {String} key from gameText.json
* @vars         {Object} optional array of variable replacement: format = $myVar Example { SC: Coins, NAME: 'Nobu' } "$NAME does not have enough $SC" >> "Nobu does not have enough Coins"
* @defaultText  {String} optional default text
*/
utils.getText = function (textCode, vars, defaultText) {
	if (window.utils.gameText.data[textCode]) {
		var text = window.utils.gameText.data[textCode];
		for (var key in vars) {
			text = text.replace('$' + key, vars[key]);
		}
		return text;
	} else {
		if (defaultText) {
			return defaultText;
		} else {
			console.error('utils.getText: *** Error > textCode "' + textCode + '" not found.');
			console.trace();
			return '???';
		}
	}
};

utils.getBoostItem = function (id) {
	if (window.utils.boostItems.data[id]) {
		return window.utils.boostItems.data[id];
	} else {
		return null;
	}
};

utils.getAllBoostItems = function () {
	return window.utils.boostItems.data || null;
};


// ----------------------------------------------------
// Operations
// ----------------------------------------------------

utils.mergeArraysUnique = function (array1, array2) {
	var merged = array1.concat(array2);
	var res = [];
	for (var i = 0, len = merged.length; i < len; i++) {
		var item = merged[i];
		if (res.indexOf(item) === -1) {
			res.push(item);
		}
	}
	return res;
};


// ----------------------------------------------------
// Generic Element Drawings
// ----------------------------------------------------

utils.drawGenericAsset = function (ctx, asset, x, y, width, height, direction, d) {
	d = d || 40;
	if(direction === 'vertical') {
		// draw top
		ctx.drawImage(asset, 0, 0, asset.width, d,                      x, y, width, d);
		// draw middle
		ctx.drawImage(asset, 0, d, asset.width, asset.height - d * 2,   x, y + d, width, height - d * 2);
		// draw bottom
		ctx.drawImage(asset, 0, asset.height - d, asset.width, d,       x, y + height - d, width, d);
	} else {
		// draw left
		ctx.drawImage(asset, 0, 0, d, asset.height,                     x, y, d, height);
		// draw center
		ctx.drawImage(asset, d, 0, asset.width - d * 2, asset.height,   x + d, y, width - d * 2, height);
		// draw right
		ctx.drawImage(asset, asset.width - d, 0, d, asset.height,       x + width - d, y, d, height);
	}
};


utils.drawRoundRect = function(ctx, x, y, width, height, color, radius, alpha) {
	if (typeof radius === "undefined") {
		radius = 5;
	}

	ctx.save();

	ctx.fillStyle = color;

	if(alpha != 'undefined') {
		ctx.globalAlpha = alpha;
	}

	ctx.beginPath();
	ctx.moveTo(x + radius, y);
	ctx.lineTo(x + width - radius, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
	ctx.lineTo(x + width, y + height - radius);
	ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
	ctx.lineTo(x + radius, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
	ctx.lineTo(x, y + radius);
	ctx.quadraticCurveTo(x, y, x + radius, y);
	ctx.closePath();

	ctx.fill();

	ctx.restore();
};

// ----------------------------------------------------
// Random Generators
// ----------------------------------------------------

utils.randomInt = function (min, max, excludeZero) {
	var num = Math.floor(Math.random() * (max-min+1) + min);

	if(excludeZero) {
		while(num === 0) {
			num = Math.floor(Math.random() * (max-min+1) + min);
		}
	}

	return num;
};


utils.randomNumberGenerator = function (Seed){
	this.A = 48271;
	this.M = 2147483647;
	this.seed = Seed;
	this.Q = this.M / this.A;
	this.R = this.M % this.A;
	this.oneOverM = 1.0 / this.M;
	this.next = function () {
		var hi = this.seed / this.Q;
		var lo = this.seed % this.Q;
		var test = this.A * lo - this.R * hi;
		if(test > 0){
			this.seed = test;
		} else {
			this.seed = test + this.M;
		}
		return (this.seed * this.oneOverM);
	};
	return this;
};

// ----------------------------------------------------
// Canvas text
// ----------------------------------------------------

utils.fillMultilineText = function(ctx, str, x, y, lineHeight) {
	if(!str || str === '') { return; }
	var arr = str.split('\n');
	for (var i = 0, len = arr.length; i < len; i++) {
		ctx.fillText(arr[i], x, y + i * lineHeight);
	}
};

// ----------------------------------------------------
// Bitmap Fonts
// ----------------------------------------------------

// TODO: If we need to implement colored text we'll need a diferent tileset for each color.

utils.drawSimpleText = function(ctx, str, x, y, fontName, fontSize, xalign, yalign, lineHeight) {
	str = '' + str;
	if (!str) {
		return; // console.error('drawSimpleText: trying to write an empty string... ignored');
	}

	// vars that we should get also from the font file
	var kerning = 0.9;

	// default vars
	fontName = fontName || 'vinsdojo';
	fontSize = fontSize || 10;
	xalign = xalign || 'left';
	yalign = yalign || 'top';

	// init vars
	var fontData = window.fontMaps[fontName].chars;
	var data = [];
	var offsetX = 0;
	var offsetY = 0;
	var sz = 1 / 60 * fontSize;
	var dx = 0, dy = 0;
	var xx = 0;
	var yy = 0;

	var lastCharCode;

	for(var i = 0; i < str.length; i++) {
		var charCode = str.charCodeAt(i);
		var fchar = fontData[charCode];

		if(fchar) {
			// update next char pos offset from last char width
			if(i > 0) {
				var bchar = fontData[str.charCodeAt(i - 1)];
				if(bchar) {
					dx += bchar.xadvance;
				}
			}

			// get char final position
			xx = x + (dx + fchar.xoffset) * sz * kerning;
			yy = y + (dy + fchar.yoffset) * sz * kerning;

			// get char size
			var w = fchar.width * sz;
			var h = fchar.height * sz;

			// store char data
			data[i] = { sourceX: fchar.x, sourceY: fchar.y, sourceWidth: fchar.width, sourceHeight: fchar.height, x: xx, y: yy, width: w, height: h };

			// re-calculate string y align
			if(yalign == 'middle') {
				if (h / 2 > offsetY) { offsetY = h / 2; }
			} else if(yalign == 'bottom') {
				if (h > offsetY) { offsetY = h; }
			}
		}

		lastCharCode = charCode;
	}


	// calculate string x align
	var totalW = -x + xx + data[data.length - 1].width;
	if(xalign === 'center') {
		offsetX = totalW / 2;
	} else if (xalign === 'right') {
		offsetX = totalW;
	}

	// calculate final alignmen offsets
	offsetX = Math.round(-offsetX);
	offsetY = Math.round(-offsetY);

	// draw string as char images
	for(i = 0; i < data.length; i++) {
		var dat = data[i];
		if(dat) {
			ctx.drawImage(assets.vinsdojo, dat.sourceX, dat.sourceY, dat.sourceWidth, dat.sourceHeight, dat.x + offsetX, dat.y + offsetY, dat.width, dat.height);
		}
	}

};


utils.drawMultilineText = function(ctx, str, x, y, fontName, fontSize, xalign, yalign, lineHeight) {
	str = '' + str;
	if (!str) {
		return; //console.error('drawSimpleText: trying to write an empty string... ignored');
	}

	// default vars
	fontName = fontName || 'vinsdojo';
	fontSize = fontSize || 10;
	xalign = xalign || 'left';
	yalign = yalign || 'top';
	lineHeight = lineHeight || 1.2;
	lineHeight *= fontSize;

	// convert string to string array of lines
	function toMultiLine(text){
		var textArr = [];
		//text = text.replace(/\n\r?/g, '<br/>'); // TODO: Let's just like \n for the moment, this is too expensive...
		textArr = text.split('\n');
		return textArr;
	}
	var strArr = toMultiLine(str);

	// draw each line on canvas.
	for (var i = 0, len = strArr.length; i < len; i++) {
		utils.drawSimpleText(ctx, strArr[i], x, y, fontName, fontSize, xalign, yalign);
		y += lineHeight;
	}
};


// ----------------------------------------------------
// FPS debugger
// ----------------------------------------------------

var prevTime = Date.now();
var averageFPS = 0;
var fpsHistory = [];
var historyLength = 60;
for (var n = 1, len = historyLength; n < len; n++) {
	fpsHistory.push(60);
}


utils.drawFPS = function(ctx) {
	if(!options.showFps) {
		return;
	}

	// get fps
	var now = Date.now();
	var duration = now - prevTime;
	var fps = 1000 / duration;

	var newFpsHistory = [];
	for (var i = 1, len = historyLength; i < len; i++) {
		newFpsHistory.push(fpsHistory[i]);
	}
	newFpsHistory.push(fps);

	var averageFps = 0;
	for (i = 0, len = historyLength; i < len; i++) {
		averageFps += newFpsHistory[i];
	}
	averageFps /= historyLength;
	averageFps = Math.round(averageFps);

	// render fps
	ctx.fillStyle = '#000';
	ctx.fillRect(canvasWidth - 50, 0, 50, 20);
	if(averageFps > 0) {
		ctx.font = '10px Verdana-Bold';
		ctx.fillStyle = '#FFF';
		ctx.textAlign = 'right';
		ctx.textBaseLine = 'bottom';
		ctx.fillText('fps: ' + averageFps, canvasWidth - 4, 13);
	}

	// update vars
	prevTime = now;
	fpsHistory = newFpsHistory;
};





