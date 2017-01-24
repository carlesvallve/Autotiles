function NavTree() {
	this.views = {};
	this.currentView = null;
	this.sleepingView = {}; // for popup
	this.popupStack = [];
}


NavTree.prototype = new window.EventEmitter();


NavTree.prototype.add = function (name, view) {
	if (this.views[name]) {
		return false;
	}
	this.views[name] = view;
	this.views[name].name = name;
	this.emit('add', name);
};


NavTree.prototype.open = function (name, params) {
	// close previous view
	var prevView = this.views[this.currentView];
	if (prevView) {
		prevView.close();
	}
	// open new view
	var newView = this.views[name];
	if (newView) {
		this.currentView = name;
		this.sleepingView = { name: name, params: params };
		newView.open(params);
		this.emit('open', newView);
	}
};


NavTree.prototype.draw = function () {
	var currentView = this.getCurrentView();
	if (currentView) {
		currentView.draw(window.context);
		this.emit('draw', currentView);
	}
};


NavTree.prototype.getCurrentView = function () {
	var currentView = this.views[this.currentView];
	if (currentView) {
		return currentView;
	} else {
		return null;
	}
};


NavTree.prototype.openPopup = function (name, params) {
	if (this.popupStack.indexOf(name) === -1) {
		var view = this.getViewByName(name);
		this.currentView = name;
		view.openPopup(params);
		this.popupStack.push(name);
		this.emit('openPopup', view);
	}
};


NavTree.prototype.closePopup = function (name) {
	if (name) {
		var index = this.popupStack.indexOf(name);
		if (index > -1) {
			var view = this.getViewByName(name);
			view.closePopup();
			this.popupStack.splice(index, 1);
			this.emit('closePopup', view);
		}
	} else {
		// no name given we close the top most popup
		var topViewName = this.popupStack.shift();
		var topView = this.getViewByName(topViewName);
		topView.closePopup();
		this.emit('closePopup', topView);
	}
	if (this.popupStack.length === 0) {
		// no more popup
		this.open(this.sleepingView.name, this.sleepingView.params);
	} else {
		this.currentView = this.popupStack[0];
	}
};


NavTree.prototype.getViewByName = function (name) {
	var view = this.views[name];
	if (view) {
		return view;
	} else {
		return null;
	}
};