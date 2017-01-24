/* DOM extensions
 * --------------
 * Helpers functions, registered on DOM class prototypes.
 * Requirements:
 * - arrays.js
 */

/* Window behavior */

Document.prototype.scrollToTop = function () {
	this.body.scrollIntoView(true);
};


/* DOM manipulation */

Element.prototype.insertAfter = function (newNode) {
	if (this.nextSibling) {
		this.parentNode.insertBefore(newNode, this.nextSibling);
	} else {
		this.parentNode.appendChild(newNode);
	}
};


/* CSS helpers */

Element.prototype.addClassName = function () {
	var classes = this.className.split(' ');
	var args = Array.prototype.flatten.call(arguments);
	var n = args.length;

	for (var i = 0; i < n; i++) {
		var className = args[i];

		if (classes.indexOf(className) === -1) {
			classes.push(className);
		}
	}

	this.className = classes.join(' ');
};


Element.prototype.delClassName = function () {
	var classes = this.className.split(' ');
	var args = Array.prototype.flatten.call(arguments);

	this.className = classes.filter(function (elm) {
		return args.indexOf(elm) === -1;
	}).join(' ');
};


Element.prototype.setClassName = function (className, value) {
	if (value) {
		this.addClassName(className);
	} else {
		this.delClassName(className);
	}
};


Element.prototype.toggleClassName = function (className) {
	if (this.hasClassName(className)) {
		this.delClassName(className);
		return false;
	}

	this.addClassName(className);
	return true;
};


Element.prototype.replaceClassNames = function (remove, add) {
	var classes = this.className.split(' ');

	remove = remove.flatten();
	add    = add.flatten();

	classes = classes.filter(function (elm) {
		return (remove.indexOf(elm) === -1);
	});

	add.forEach(function (elm) {
		if (classes.indexOf(elm) === -1) {
			classes.push(elm);
		}
	});

	this.className = classes.join(' ');
};


Element.prototype.hasClassName = function () {
	var classes = this.className.split(' ');

	var args = Array.prototype.flatten.call(arguments);
	var n = args.length;

	for (var i = 0; i < n; i++) {
		if (classes.indexOf(args[i]) === -1) {
			return false;
		}
	}

	return true;
};

Element.prototype.getCssClassName = function () {

	var classes = this.className.split(' ');
	classes = classes.filter(function (className) {
		return className;
	});

	return "." + classes.join(".");
};

/* DOM traversal */

Element.prototype.getParentElementByTagName = function (tagName, includeThis) {
	var target = includeThis ? this : this.parentElement;
	tagName = tagName.toUpperCase();

	do {
		if (target.tagName === tagName) {
			break;
		}

		target = target.parentElement;
	} while (target);

	return target;
};


Element.prototype.getParentElementByClassName = function (className, includeThis) {
	var target = includeThis ? this : this.parentElement;

	do {
		if ('className' in target && target.hasClassName(className)) {
			break;
		}

		target = target.parentElement;
	} while (target);

	return target;
};


/* DOM lists */

NodeList.prototype.forEach = function (fn, thisContext) {
	if (!thisContext) {
		thisContext = window;
	}

	for (var i = 0; i < this.length; i++) {
		fn.call(thisContext, this[i]);
	}
};

NodeList.prototype.toArray = function () {
	var arr = [];
	for (var i = 0; i < this.length; i++) {
		arr.push(this[i]);
	}
	return arr;
};



NodeList.prototype.indexOf = function (node) {
	if (!node) {
		return false;
	}

	for (var i = 0; i < this.length; i++) {
		if (node === this[i]) {
			return i;
		}
	}
	return false;
};


NodeList.prototype.addClassName = function () {
	var args = Array.prototype.flatten.call(arguments);
	this.forEach(function (node) {
		node.addClassName(args);
	});
};


NodeList.prototype.delClassName = function () {
	var args = Array.prototype.flatten.call(arguments);
	this.forEach(function (node) {
		node.delClassName(args);
	});
};


NodeList.prototype.setClassName = function (className, value) {
	this.forEach(function (node) {
		node.setClassName(className, value);
	});
};


NodeList.prototype.toggleClassName = function (className) {
	this.forEach(function (node) {
		node.toggleClassName(className);
	});
};


NodeList.prototype.replaceClassNames = function (remove, add) {
	this.forEach(function (node) {
		node.replaceClassNames(remove, add);
	});
};

var baseMatrix = new WebKitCSSMatrix('matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)');

Element.prototype.getTransformMatrix = function () {
	var transformStyle = window.getComputedStyle(this).getPropertyCSSValue("-webkit-transform");
	return (transformStyle.cssText !== "none") ? new WebKitCSSMatrix(transformStyle.cssText) : baseMatrix;
};

