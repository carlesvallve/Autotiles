(function () {

	var spriteList = [];
	var spriteLen = 0;

	/*
	* @sprite (Sprite)
	* @params (Object) swipeDistance: Number, tapInterval: Number (in seconds)
	*/
	function button(sprite, params) {
		if (spriteList.indexOf(sprite) === -1) {
			spriteList.push(sprite);
			spriteLen += 1;
			sprite.__enable = true;
			sprite.__tapParams = params || {};
		}
	}

	function setupButtonStart(event) {
		var isDown = true;
		initEvent('tapstart', event, isDown);
	}

	function setupButtonEnd(event) {
		var isDown = false;
		initEvent('tapend', event, isDown);
	}

	function setupButtonMove(event) {
		initEvent('tapmove', event, null);
	}

	function setupButtonCancel(event) {
		var isDown = false;
		initEvent('tapcancel', event, isDown);
	}

	function buttonEnable(sprite) {
		if (spriteList.indexOf(sprite) === -1) {
			return false;
		}
		sprite.__enable = true;
	}

	function buttonDisable(sprite) {
		if (spriteList.indexOf(sprite) === -1) {
			return false;
		}
		sprite.__enable = false;
	}

	window.wuic.behaviors.button = button;
	window.wuic.behaviors.setupButtonStart = setupButtonStart;
	window.wuic.behaviors.setupButtonEnd = setupButtonEnd;
	window.wuic.behaviors.setupButtonMove = setupButtonMove;
	window.wuic.behaviors.setupButtonCancel = setupButtonCancel;
	window.wuic.behaviors.buttonEnable = buttonEnable;
	window.wuic.behaviors.buttonDisable = buttonDisable;

	function initEvent(eventName, event, isDown) {
		var touchPos = getTouchPos(event);
		for (var i = 0; i < spriteLen; i++) {
			triggerEvent(eventName, spriteList[i], event, touchPos, isDown);
		}
	}

	function getTouchPos(event) {
		var x = 0;
		var y = 0;
		if (event.changedTouches) {
			x = event.changedTouches[0].pageX;
			y = event.changedTouches[0].pageY;
		} else {
			x = event.offsetX;
			y = event.offsetY;
		}

		return { x: x, y: y };
	}

	function isInBounds(sprite, positions) {
		var localCoordinate = sprite._getLocalCoordinate(positions.x, positions.y);
		positions.localX = localCoordinate.x;
		positions.localY = localCoordinate.y;
		if (localCoordinate.x >= 0 && localCoordinate.x <= sprite.width) {
			if (localCoordinate.y >= 0 && localCoordinate.y <= sprite.height) {
				return true;
			}
		}
		return false;
	}

	function triggerEvent(eventName, sprite, event, positions, isDown) {
		if (isEnabled(sprite) && sprite.isVisible() && isInBounds(sprite, positions)) {
			if (isDown !== null) {
				sprite.__isDown = isDown;
			}
			emitEvent(eventName, sprite, event, positions);
		} else if (sprite.__isDown && eventName === 'tapend') {
			delete sprite.__isDown;
			sprite.emit('tapendoutside', event, positions);
		} else if (sprite.__isDown && eventName === 'tapmove') {
			sprite.emit('tapmoveoutside', event, positions);
		}
	}

	function isEnabled(sprite) {
		var enabled = sprite.__enable || false;
		if (!enabled) {
			return false;
		}
		var parent = sprite.getParent();
		while (parent && enabled) {
			enabled = (parent.__enable !== undefined) || true;
			parent = parent.getParent();
		}
		return enabled;
	}

	function emitEvent(eventName, sprite, event, positions) {
		var emit = false;
		// evaluate the event
		switch (eventName) {
			case 'tapstart':
				if (sprite.__isDown && !sprite.__tapLock) {
					// remember start positions
					sprite.__tapAnchors = positions;
					emit = true;
					// lock tap with tapInterval
					var tapInterval = (sprite.__tapParams.tapInterval === undefined) ? 0.5 : sprite.__tapParams.tapInterval;
					if (tapInterval) {
						sprite.__tapLock = true;
						window.setTimeout(function () {
							delete sprite.__tapLock;
						}, tapInterval * 1000);
					}
				}
				break;
			case 'tapmove':
				if (sprite.__isDown) {
					emit = true;
					// detect swipe
					detectSwipe(sprite, event, positions);
				}
				break;
			case 'tapend':
				if (!sprite.__isDown) {
					emit = true;
					// reset anchor positions
					delete sprite.__tapAnchors;
				}
				break;
			case 'tapcancel':
				if (sprite.__isDown) {
					emit = true;
					delete sprite.__tapAnchors;
				}
				break;
		}
		if (emit) {
			sprite.emit(eventName, event, positions);
		}
	}

	function detectSwipe(sprite, event, positions) {
		if (!sprite.__tapAnchors) {
			return;
		}
		var threshHold = (sprite.__tapParams && sprite.__tapParams.swipeDistance) || 5;
		var distX = positions.x - sprite.__tapAnchors.x;
		var distY = positions.y - sprite.__tapAnchors.y;
		var dist = Math.sqrt(distX * distX + distY * distY);
		if (dist > threshHold) {
			var vector = {
				x: distX,
				y: distY,
				localX: positions.localX - sprite.__tapAnchors.localX,
				localY: positions.localY - sprite.__tapAnchors.localY
			};
			sprite.emit('swipe', event, { startPositions: sprite.__tapAnchors, distance: dist, vector: vector });
		}
	}

}());
