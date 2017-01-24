function benchmark(n, fn) {
	var startTime = new Date();

	for (var i = 0; i < n; i++) {
		fn(i);
	}

	var endTime = new Date();

	console.log((endTime.getTime() - startTime.getTime()) / 1000);
}

function isInIframe() {
	return window.location !== window.parent.location ;
}