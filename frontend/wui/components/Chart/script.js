(function (window) {

function Chart(width, height, options) {
	var canvas = document.createElement('canvas');
	this.assign(canvas);
	this.rootElement.setAttribute('width', width);
	this.rootElement.setAttribute('height', height);
	this.format = { width: width, height: height, spacing: 1 };
	this.options = applyOptions({ outlineColor: '#666', gridColor: '#ddd', gridNumX: 10, gridNumY: 10 }, options);
	// draw grids
	var grid = this.rootElement.getContext('2d');
	var xInterval = this.format.width / this.options.gridNumX;
	var yInterval = this.format.height / this.options.gridNumY;
	grid.strokeStyle = this.options.gridColor;
	grid.beginPath();
	grid.lineWidth = 1;
	// x
	for (var i = 1; i < this.options.gridNumX; i++) {
		grid.moveTo(i * xInterval, 0);
		grid.lineTo(i * xInterval, this.format.height);
		grid.stroke();
	}
	// y
	for (var j = 1; j < this.options.gridNumY; j++) {
		grid.moveTo(0, j * yInterval);
		grid.lineTo(this.format.width, j * yInterval);
		grid.stroke();
	}
}

Chart.prototype = new window.wui.core.Dom();
window.wui.components.Chart = Chart;

// data: Array > data[x] = y, format.width / options.gridNumX = data.length
Chart.prototype.setData = function (color, data) {
	// set up context object for plots
	var plots = this.rootElement.getContext('2d');
	plots.strokeStyle = color;
	plots.beginPath();
	plots.lineWidth = 1;
	// caculate x spacing
	this.format.spacing = this.format.width / this.options.gridNumX;
	// draw plots
	plots.moveTo(0, this.format.height - data[0]);
	for (var i = 1, len = data.length; i < len; i++) {
		var x = i * this.format.spacing;
		var y = this.format.height - data[i];
		this._drawPlot(plots, x, y);
	}
	// draw borders and axis
	this._setup();
	// return the chart context
	return plots;
};

Chart.prototype.clear = function () {
	var context = this.rootElement.getContext('2d');
	context.save();
	context.setTransform(1, 0, 0, 1, 0, 0);
	context.clearRect(0, 0, this.format.width, this.format.height);
	context.restore();
};

Chart.prototype._setup = function () {
	// outlines
	var ctx = this.rootElement.getContext('2d');
	ctx.strokeStyle = this.options.outlineColor;
	ctx.beginPath();
	// draw y axis
	ctx.moveTo(0, 0);
	ctx.lineTo(0, this.format.height);
	ctx.stroke();
	// draw x axis
	ctx.moveTo(0, this.format.height);
	ctx.lineTo(this.format.width, this.format.height);
	ctx.stroke();
	// draw other boundings
	var ctx2 = this.rootElement.getContext('2d');
	ctx2.strokeStyle = this.options.outlineColor;
	ctx2.beginPath();
	// top
	ctx2.moveTo(0, 0);
	ctx2.lineTo(this.format.width, 0);
	ctx2.stroke();
	// right
	ctx2.moveTo(this.format.width, 0);
	ctx2.lineTo(this.format.width, this.format.height);
	ctx2.stroke();
};

Chart.prototype._drawPlot = function (plots, x, y) {
	plots.lineTo(x, y);
	plots.stroke();
};

// helper function(s)
function applyOptions(defaults, options) {
	for (var i in defaults) {
		if (options && options[i] !== undefined) {
			defaults[i] = options[i];
		}
	}
	return defaults;
}

}(window));
