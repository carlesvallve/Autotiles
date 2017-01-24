/* Usage:
* var list = new List(parentElement);
* list.createListItem = function (itemElement, itemDataObject) {
*     //My really cool logic here
* };
* list.vertical(); // you can change the orientation of the list anytime you want
* list.create(listDataArray);
* // I need to update what's displayed in the list
* list.update(newListDataArray);
* events: List.orientation, List.create, List.update
*/

(function () {

window.wui.components.List = List;

function List(parentElm) {
	// private variables
	this.parent = parentElm; // parent DOM element to create the list in
	this.orientation = 'vertical'; // orientation of the list
	this.listData = null; // data to build the list from
	this.listElm = null; // DOM element of the list
	this.itemList = []; // a list of item DOM element
	// public variables
	this.createListItem = function (index, listItemElm, listItemObject) {}; // overwritten by application spicific logic
}

List.prototype = new window.wui.core.Dom();

// *********************  public methods

// change the list orientation
List.prototype.horizontal = function () {
	this.orientation = 'horizontal';
	this.setOrientation();
};

// change the list orientation
List.prototype.vertical = function () {
	this.orientation = 'vertical';
	this.setOrientation();
};

// set up data for the building the list and build the list
// expected data format: [ { listItemObject }, { listItemObject }, { listItemObject }...  ]
List.prototype.create = function (data) {
	// we do not overwrite the element
	if (this.listElm === null) {
		// create the container element
		this.listElm = document.createElement('ul');
		this.setOrientation();
		this.parent.appendChild(this.listElm);
		// set up the data and build the list
		this.update(data);
		this.emit('List.create', data);
	}
};

List.prototype.update = function (dataIn) {
	this.listData = dataIn;
	var len = this.listData.length;
	var ilen = this.itemList.length;
	var iter = Math.max(len, ilen);
	var newItemList = [];
	for (var i = 0; i < iter; i++) {
		// check if the list item element alreay exists
		var itemElm = this.itemList[i] || null;
		var data = this.listData[i] || null;
		if (data) {
			if (itemElm === null) {
				// we do not have a listItem, but we have data for this slot
				itemElm = document.createElement('li');
				this.listElm.appendChild(itemElm);
			}
			itemElm.className = 'item';
			// call the custom build function for an idividual item element
			this.createListItem(i, itemElm, data);
		} else if (itemElm && data === null) {
			// we have an element, but no data
			itemElm.className = 'item hide';
		}
		if (itemElm) {
			// update
			newItemList.push(itemElm);
		}
	}
	this.itemList = newItemList;
	this.emit('List.update', this.listData);
};

List.prototype.destroy = function () {
	// do we need this I wonder?
};

// private method(s)
List.prototype.setOrientation = function () {
	if (this.listElm) {
		this.listElm.className = 'wui-list-display wui-list-display-' + this.orientation;
		this.emit('List.orientation', this.orientation);
	}
};

}());
