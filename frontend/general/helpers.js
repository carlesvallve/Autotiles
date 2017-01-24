function isEmpty(obj) {
	if (obj === null) {
		return true;
	}

	switch (typeof obj) {
	case 'undefined':
		return true;
	case 'object':
		return (Object.keys(obj).length === 0);
	case 'string':
		return (obj.length === 0);
	case 'number':
		return (obj === 0);
	case 'boolean':
		return (obj === false);
	case 'function':
		return false;
	}

	return false;
}

function isEqual(a, b) {
	if (typeof a !== typeof b) {
		return false;
	}

	if (a === b) {
		return true;
	}

	if (typeof a === 'function') {
		return (a.toString() === b.toString());
	}

	if (typeof a === 'object') {
		// first check class type

		if (!b) {
			return false;
		}

		if (isEmpty(a) && !isEmpty(b)) {
			return false;
		}

		if (a.prototype !== b.prototype) {
			return false;
		}

		if (a.toString() !== b.toString()) {
			return false;
		}

		if (Array.isArray(a)) {
			// check array values

			if (a.length !== b.length) {
				return false;
			}

			for (var i = 0; i < a.length; i++) {
				if (!isEqual(a[i], b[i])) {
					return false;
				}
			}
		} else {
			// first check keys

			var aKeys = Object.keys(a);
			var bKeys = Object.keys(b);

			if (aKeys.length !== bKeys.length) {
				return false;
			}

			// now check values

			for (var key in a) {
				if (!(key in b)) {
					return false;
				}

				if (!isEqual(a[key], b[key])) {
					return false;
				}
			}
		}
		return true;
	}

	return false;
}

