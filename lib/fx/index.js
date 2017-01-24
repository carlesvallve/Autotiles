fx = {};


fx.initBackBuffer = function() {
	this.canvas = document.createElement('canvas');
	this.context = this.canvas.getContext('2d');
};
fx.initBackBuffer();


fx.getHex = function(data, i) {
	//  Builds a CSS color string from the RGB value (ignore alpha)
	return ("#" + d2Hex(data[i]) + d2Hex(data[i + 1]) + d2Hex(data[i + 2]));
};

fx.d2Hex = function(d) {
	// Converts a decimal number to a two digit Hex value
	var hex = Number(d).toString(16);
	while (hex.length < 2) {
		hex = "0" + hex;
	}
	return hex.toUpperCase();
};

fx.hexToRgb = function(hex) {

	var bigint = parseInt(hex, 16);
	var r = (bigint >> 16) & 255;
	var g = (bigint >> 8) & 255;
	var b = bigint & 255;
	return { r: r, g: g, b: b };
}


fx.setColorTransform = function(ctx, img, hex, t) {
	// Apply color transform.
	/*var r = 115, // Red tint (0-255)
		g = 208, // Green tint (0-255)
		b = 189, // Blue tint (0-255)
		t = 0.6, // Tint strength (0-1)*/
	var	i,
		rgb = fx.hexToRgb(hex);
		//ctx = document.getElementById('myCanvas').getContext('2d'), // Get the drawing context of your canvas element.
		//img = ctx.getImageData(), //(0, 0, 100, 100), // Pull a rectangle of image data from context
		data = img.data, // Image image data array.
		len = data.length; // Length of data array.

	// Loop through image data array.
	// Apply color trasform to each block of RGBA values.
	// Applied as: c = c * cmodifier + coffset.
	for (i = 0; i < len;) {
		data[i] = data[i++] * (1-t) + (rgb.r*t);
		data[i] = data[i++] * (1-t) + (rgb.g*t);
		data[i] = data[i++] * (1-t) + (rgb.b*t);
		i++; //data[i] = data[i++] * 1 + 0; << skip alpha component. Adjust as needed.
	}

	// Restore image data within the canvas.
	ctx.putImageData(img, 0, 0);
};