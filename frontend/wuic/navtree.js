function NavTree(options, creationOptions) {
	this.views = {};
	this.currentView = null;
	this.sleepingView = {}; // for popup
	this.popupStack = [];

	this.options = options || {};
	this.creationOptions = creationOptions || {};
}


NavTree.prototype = new window.EventEmitter();


NavTree.prototype.register = function (name, view) {
	if (this.views[name]) {
		return false;
	}
	this.views[name] = view;
	this.views[name].name = name;

	if (view.create) {
		view.create(this.options, name);
	}

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


NavTree.prototype.getCurrentView = function () {
	var currentView = this.views[this.currentView];
	if (currentView) {
		return currentView;
	} else {
		return null;
	}
};


NavTree.prototype.getItem = function (name) {
	var view = this.views[name];
	if (view) {
		return view;
	} else {
		return null;
	}
};