Math.randomInt = function (low, high) {
	return low + Math.floor(Math.random() * (high + 1 - low));
};


Math.randomFloat = function (low, high) {
	return low + Math.random() * (high - low);
};
