window.drawings = {};

window.drawings.roundRect = function(ctx, x, y, width, height, radius, bg, fg, lineWidth) {
	radius = radius || 0;

	ctx.save();

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

	if(bg) {
		ctx.fillStyle = bg || 'none';
		ctx.fill();
	}

	if(fg && lineWidth) {
		ctx.strokeStyle = fg || 'none';
		ctx.lineWidth = lineWidth || 0;
		ctx.stroke();
	}

	ctx.restore();
};