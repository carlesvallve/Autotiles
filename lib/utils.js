utils = {};

utils.getUid = function() {
	if(!utils.getUid_current) {
		utils.getUid_current = 0;
	}
	utils.getUid_current++;
	return utils.getUid_current;
};

utils.toRadians = function(d) {
	return d * (Math.PI / 180);
};

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

utils.objectLog = function (obj, prefix) {
	prefix = prefix || '';
	if (obj) {
		for (var key in obj) {
			if (typeof obj[key] == "object") {
				utils.objectLog(obj[key], prefix + '=>' + key);
			} else if (typeof obj[key] != "function") {
				console.log(prefix + '=>' + key + ' = ' + obj[key]);
			}
		}
	}
};

// ----------------------------------------------------
// Array Utilities
// ----------------------------------------------------

// merges 2 arrays removing duplicated items
utils.mergeUniqueArray = function(array1, array2) {
	var array = array1.concat(array2)
	var a = array.concat();
	for(var i=0; i<a.length; ++i) {
		for(var j=i+1; j<a.length; ++j) {
			if(a[i] === a[j])
				a.splice(j, 1);
		}
	}
	return a;
};

//var array1 = ["Vijendra","Singh"];
//var array2 = ["Singh", "Shakya"];
// Merges both arrays and gets unique items
//var array3 = arrayUnique(array1.concat(array2));

// ----------------------------------------------------
// Canvas Utilities
// ----------------------------------------------------

utils.convertAssetToGrayScale = function(asset, name) {
	// create a temporary canvas to fraw the grayscale image
	var canvas = document.createElement('canvas');
	var canvasContext = canvas.getContext('2d');

	// escape if the asset is not ok
	if(asset.width === 0 && asset.height === 0) {
		console.log('couldnt convert', name);
		return asset.src;
	}

	// set canvas to asset dimensions
	var imgW = asset.width;
	var imgH = asset.height;
	canvas.width = imgW;
	canvas.height = imgH;

	// draw the asset in the canvas and get the pixels
	canvasContext.drawImage(asset, 0, 0);
	var imgPixels = canvasContext.getImageData(0, 0, imgW, imgH);

	// iterate on all pixels and convert them to grayscale
	for(var y = 0, lenY = imgPixels.height; y < lenY; y++) {
		for(var x = 0, lenX = imgPixels.width; x < lenX; x++) {
			var i = (y * 4) * imgPixels.width + x * 4;
			var avg = (imgPixels.data[i] + imgPixels.data[i + 1] + imgPixels.data[i + 2]) / 3;
			imgPixels.data[i] = avg;
			imgPixels.data[i + 1] = avg;
			imgPixels.data[i + 2] = avg;
		}
	}

	// put the image data into canvas context
	canvasContext.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);

	// return new image as the asset.src
	return canvas.toDataURL(); // TODO: Doesnt work in compiled Ejecta, we must find another way to do this...
	//return canvas;//Context;
};

// ----------------------------------------------------
// Text Utils
// ----------------------------------------------------

utils.drawMultilineText = function(context, textval, x, y, linespacing, drawStroke) {
	// Creates an array where the <br/> tag splits the values.
	function toMultiLine(text){
		var textArr = new Array();
		text = text.replace(/\n\r?/g, '<br/>');
		textArr = text.split("<br/>");
		return textArr;
	}
	var textvalArr = toMultiLine(textval);

	// draw each line on canvas.
	for(var i = 0, len = textvalArr.length; i < len; i++){
		context.fillText(textvalArr[i], x, y);
		if(drawStroke) {
			context.strokeText(textvalArr[i], x, y);
		}
		y += linespacing;
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

	ctx.save();

	// render fps
	ctx.globalAlpha = 0.5;
	ctx.fillStyle = '#000';
	ctx.fillRect(canvasWidth - 44, 0, 100, 16);

	ctx.globalAlpha = 1;
	ctx.font = '11px Verdana-Bold';
	ctx.fillStyle = '#FFF';
	ctx.textAlign = 'right';
	ctx.textBaseLine = 'bottom';

	if(averageFps > 0 && averageFps < Infinity) {
		ctx.fillText('FPS ' + averageFps, canvasWidth - 4, 11);
	} else {
		ctx.fillText('FPS 99', canvasWidth - 4, 11);
	}

	ctx.restore();

	// update vars
	prevTime = now;
	fpsHistory = newFpsHistory;
};

