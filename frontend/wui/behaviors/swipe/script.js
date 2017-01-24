(function (window) {

	function getTouchPos(domEvent, pos) {
		var touch = domEvent.touches ? domEvent.touches[0] : domEvent;

		pos[0] = touch.pageX;
		pos[1] = touch.pageY;
	}


	function swipeBehavior(comp, options) {
		var startPos, currentPos = [0, 0], realDistance;
		var delta = [0, 0];
		var moveEventData = { delta: delta, realDistance: 0, duration: 0 };
		var startTime, currentTime;
		var cancelled = false;

		options = options || {};

		if (!options.hasOwnProperty('errorMargin')) {
			options.errorMargin = 0.2;
		}

		if (!options.hasOwnProperty('maxDuration')) {
			options.maxDuration = 2000;
		}

		if (!options.hasOwnProperty('minDistance')) {
			options.minDistance = 50;
		}

		comp.allowDomEvents();


		function cancel() {
			comp.emit('swipecancel');
			cancelled = true;
		}

		comp.on('dom.touchstart', function (domEvent) {
			currentTime = startTime = domEvent.timeStamp;
			getTouchPos(domEvent, currentPos);
			startPos = [currentPos[0], currentPos[1]];
			realDistance = 0;
			cancelled = false;

			comp.emit('swipestart');
		});

		comp.on('dom.touchmove', function (domEvent) {
			var x = currentPos[0];
			var y = currentPos[1];

			getTouchPos(domEvent, currentPos);

			delta[0] = currentPos[0] - x;
			delta[1] = currentPos[1] - y;

			realDistance += Math.sqrt(delta[0] * delta[0] + delta[1] * delta[1]);

			moveEventData.realDistance = realDistance;
			moveEventData.duration = domEvent.timeStamp - currentTime;

			currentTime = domEvent.timeStamp;

			comp.emit('swipemove', moveEventData);
		});

		comp.on('dom.touchend', function (domEvent) {
			if (cancelled) {
				return;
			}

			// check if it's still a swipe and emit a "swipeend" event

			// compare the real travelled distance with the shortest possible distance between start and end

			var x = currentPos[0] - startPos[0];
			var y = currentPos[1] - startPos[1];
			var angle = Math.atan2(y, x) * 180 / Math.PI;

			var shortestDistance = Math.sqrt(x * x + y * y);

			if (shortestDistance >= options.minDistance && realDistance * (1 - options.errorMargin) <= shortestDistance) {
				// it was a real swipe

				var duration = Date.now() - startTime;

				if (duration <= options.maxDuration) {
					// the swipe did not take too long

					comp.emit('swipeend', { start: startPos, end: currentPos, distance: shortestDistance, duration: duration, angle: angle });
				} else {
					cancel();
				}
			} else {
				cancel();
			}
		});

		comp.on('dom.touchcancel', cancel);
	}


	window.wui.behaviors.swipe = swipeBehavior;

}(window));
