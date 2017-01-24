(function (window) {



	var STATE_CLOSED = 0;
	var STATE_PREPARED = 1;
	var STATE_OPENED = 2;


	// history object

	function NavTreeHistory() {
		if (window.EventEmitter) {
			window.EventEmitter.call(this);
		}
		this.nodes = [];
		this.index = -1;
	}


	if (window.EventEmitter) {
		window.inherits(NavTreeHistory, window.EventEmitter);
	} else {
		NavTreeHistory.prototype.emit = function () {
			// dummy function
		};
	}


	NavTreeHistory.prototype._moveTo = function (index) {
		this.index = index;
		this.emit('move', this.index, this.nodes[this.index]);
	};


	NavTreeHistory.prototype.current = function () {
		return this.nodes[this.index];	// undefined if the list is empty
	};


	NavTreeHistory.prototype.isEmpty = function () {
		return this.nodes.length === 0;
	};


	NavTreeHistory.prototype.clear = function () {
		this.nodes = [];
		this._moveTo(-1);
	};


	NavTreeHistory.prototype.clearPast = function () {
		if (this.index > 0) {
			this.nodes.splice(0, this.index);
			this._moveTo(0);
		}
	};


	NavTreeHistory.prototype.clearFuture = function () {
		this.nodes.splice(this.index + 1);
	};


	NavTreeHistory.prototype.resetToCurrent = function () {
		var node = this.nodes[this.index];

		if (node) {
			this.nodes = [node];
			this._moveTo(0);
		} else {
			this.clear();
		}
	};


	NavTreeHistory.prototype.add = function (node) {
		var index = this.index + 1;

		// drop all nodes starting at the new index, and add the node to the end

		this.nodes.splice(index, this.nodes.length, node);

		// increment the index

		this._moveTo(index);
	};


	NavTreeHistory.prototype.replace = function (node, protectFuture) {
		var index = this.index;

		if (index < 0) {
			// if there were no elements before, we want to write to index 0

			index = 0;
		}

		if (protectFuture) {
			this.nodes[index] = node;
		} else {
			// drop all nodes starting at index, and add the node to the end

			this.nodes.splice(index, this.nodes.length, node);
		}

		this._moveTo(index);
	};


	NavTreeHistory.prototype.getPrevious = function () {
		var index = this.index - 1;
		var node = this.nodes[index];

		if (index >= -1) {
			if (node) {
				return node;
			}
		}
	};

	NavTreeHistory.prototype.back = function () {
		var index = this.index - 1;
		var node = this.nodes[index];

		if (index >= -1) {
			this._moveTo(index);
			if (node) {
				return node;
			}
		}

		// else undefined
	};

	NavTreeHistory.prototype.getNext = function () {
		var index = this.index + 1;
		var node = this.nodes[index];

		if (node) {
			return node;
		}
	};

	NavTreeHistory.prototype.forward = function () {
		var index = this.index + 1;
		var node = this.nodes[index];

		if (node) {
			this._moveTo(index);

			return node;
		}

		// else undefined
	};


	// nav tree implementation

	function NavTree(options, creationOptions) {
		if (window.EventEmitter) {
			window.EventEmitter.call(this);
		}
		this.tree = {};             // collection of objects to which we can navigate, indexed by name
		this.nodeQueue = [];        // FIFO
		this.stack = new NavTreeHistory();

		this.options = options || {};
		this.creationOptions = creationOptions || {};

		if (!this.options.hasOwnProperty('createOnFirstUse')) {
			this.options.createOnFirstUse = false;
		}
	}


	if (window.EventEmitter) {
		window.inherits(NavTree, window.EventEmitter);
	} else {
		NavTree.prototype.emit = function () {
			// dummy function
		};
	}


	window.NavTree = NavTree;


	NavTree.prototype.branch = function (creationOptions, cbCollapse) {
		// create a new NavTree

		var subTree = new NavTree(this.options, creationOptions);

		// give the new tree access to the same items that the source tree has access to

		subTree.tree = this.tree;
		subTree.cbCollapse = cbCollapse;

		return subTree;
	};


	NavTree.prototype.register = function (name, item) {
		this.tree[name] = item;

		if (!this.options.createOnFirstUse) {
			this._createItem(name);
		}
	};


	NavTree.prototype.getItem = function (name) {
		return this.tree[name];
	};


	NavTree.prototype._createNode = function (name, params, closeCb) {
		var item = this.tree[name];

		if (!item) {
			console.error('NavTree item', name, 'not found.');
			return null;
		}

		if (!item._isCreated) {
			this._createItem(name);
		}

		return {
			name: name,
			params: params,
			item: item,
			state: STATE_CLOSED,
			closeCb: closeCb
		};
	};


	NavTree.prototype.rebindItem = function (item) {
		var navTree = this;

		item.getNavTree = function () {
			return navTree;
		};
	};


	NavTree.prototype._createItem = function (name) {
		var item = this.tree[name];
		this.rebindItem(item);

		if (item.create) {
			item.create(this.creationOptions, name);
		}

		item._isCreated = true;
	};


	NavTree.prototype._closeNode = function (node, response) {
		if (node && node.state !== STATE_CLOSED) {
			// only non-closed nodes can be closed

			this.emit('close', node.name);

			if (node.item.close) {
				node.item.close(response);
			}

			node.state = STATE_CLOSED;

			if (node.closeCb) {
				node.closeCb(response);
				node.closeCb = null;
			}
		}
	};


	NavTree.prototype._closeCurrentNode = function (response) {
		this._closeNode(this.stack.current(), response);
	};


	NavTree.prototype._openNode = function (node) {
		// call the beforeopen event if the node wasn't prepared yet

		var replacement, replacementNode;

		if (node.state === STATE_CLOSED && node.item.beforeopen) {
			// replacement is an object { name: 'item name', params: { anything } }

			replacement = node.item.beforeopen(node.params);

			if (replacement) {
				replacementNode = this._createNode(replacement.name, replacement.params);
			}
		}

		// beforeopen event handlers could have injected a node, meaning we have to postpone opening this node

		if (replacementNode) {
			// enqueue the node (first in line), and tag it as prepared, since beforeopen() has been called

			node.state = STATE_PREPARED;

			this.nodeQueue.unshift(node);

			node = this._openNode(replacementNode);
		} else {
			// call item.open() and set the node state to opened.

			node.state = STATE_OPENED;

			this.rebindItem(node.item);

			node.item.open(node.params);

			this.emit('open', node.name, node.params);
		}

		return node;
	};


	/**
	* NavTree.open opens a node with the given parameters.
	* If there is an active node, it will be closed automatically.
	* If cb is given, it will be called on close.
	*/

	NavTree.prototype.open = function (name, params, cb) {
		var node = this._createNode(name, params, cb);

		if (node) {
			this._closeCurrentNode();
			node = this._openNode(node);
			this.stack.add(node);
		}
	};


	NavTree.prototype.enqueue = function (name, params, cb) {
		if (this.stack.isEmpty()) {
			// nothing is active now, so we instantly open the node

			this.open(name, params, cb);
		} else {
			// something is already active, so we append to the end of the queue

			var node = this._createNode(name, params, cb);

			if (node) {
				this.nodeQueue.push(node);
			}
		}
	};


	NavTree.prototype.replace = function (name, params, cb) {
		// like open, but replaces the current node in the history stack
		// ignores the queue

		var node = this._createNode(name, params, cb);

		if (node) {
			this._closeCurrentNode();
			this.stack.replace(node);
			node = that._openNode(node);
		}
	};


	NavTree.prototype.back = function () {
		var current = this.stack.current();
		var node = this.stack.back();

		if (node) {
			this._closeNode(current);
			this._openNode(node);
			return true;
		}

		return false;

	};


	NavTree.prototype.forward = function () {
		var current = this.stack.current();
		var node = this.stack.forward();

		if (node) {
			this._closeNode(current);
			node = this._openNode(node);
			return true;
		}

		return false;
	};


	NavTree.prototype.close = function (response) {
		// manual close
		// that means we open the first queued node, or if none are available, we consider this a "back" request.

		this._closeCurrentNode(response);

		// try to open a queued node

		var node = this.nodeQueue.shift();

		if (node) {
			node = this._openNode(node);
			this.stack.replace(node);
		} else {
			// there was no queued node, so we execute a back() request

			var wentBack = this.back();

			// drop everything after the current node (if there is no current node, it will just clear all)

			this.stack.clearFuture();

			if (!wentBack) {
				// if there was no node to go back to, the navTree can be considered empty

				if (this.cbCollapse) {
					// call the collapse callback

					this.cbCollapse();
				}
			}
		}
	};


	NavTree.prototype.clearHistory = function () {
		// cleanup function to be called whenever hitting a point
		// where no back-option is available, like a main-screen.

		this.stack.resetToCurrent();
	};


}(window));
