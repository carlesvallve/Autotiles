Array.prototype.min = function () {
	var len = this.length;
	if (len === 0) {
		return null;
	}

	var min = this[0];
	for (var i = 1; i < len; i++) {
		var current = parseFloat(this[i]);
		if (current < min) {
			min = current;
		}
	}
	return min;
};


Array.prototype.max = function () {
	var len = this.length;
	if (len === 0) {
		return null;
	}

	var max = this[0];
	for (var i = 1; i < len; i++) {
		var current = parseFloat(this[i]);
		if (current > max) {
			max = current;
		}
	}
	return max;
};


Array.prototype.sum = function () {
	var len = this.length;
	var sum = 0;

	for (var i = 0; i < len; i++)
	{
		sum += parseFloat(this[i]);
	}

	return sum;
};


Array.prototype.avg = function () {
	var len = this.length;
	if (len === 0) {
		return null;
	}

	var sum = 0;

	for (var i = 0; i < len; i++)
	{
		sum += parseFloat(this[i]);
	}

	return sum / len;
};


Array.prototype.flatten = function () {
	var result = [];
	var len = this.length;

	for (var i = 0; i < len; i++) {
		if (this[i] instanceof Array) {
			result = result.concat(this[i].flatten());
		} else {
			result.push(this[i]);
		}
	}
	return result;
};

