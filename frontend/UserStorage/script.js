(function (){

window.UserStorage = UserStorage;
window.userStorage = new UserStorage();

function UserStorage() {
	this.keyPrefix = '';
}

UserStorage.prototype.setPrefix = function (keyPrefix) {
	keyPrefix = keyPrefix.replace(/\ /g, '');
	if (typeof keyPrefix === 'string' && this.keyPrefix === '') {
		this.keyPrefix = keyPrefix;
	}
};

UserStorage.prototype.setItem = function (key, value) {
	if (key && key !== '') {
		if (typeof value === 'object') {
			try {
				value = JSON.stringify(value);
			}
			catch (e) {
				return false;
			}
		}
		localStorage.setItem(this.keyPrefix + key, value);
		if (this.getItem(key) !== null) {
			return true;
		}
	}
	else {
		return false;
	}
};

UserStorage.prototype.getItem = function (key) {
	var res = localStorage.getItem(this.keyPrefix + key);
	try {
		return JSON.parse(res);
	}
	catch (e) {
		return res;
	}
};

UserStorage.prototype.removeItem = function (key) {
	if (this.keyPrefix + key in localStorage === false) {
		return false;
	}
	localStorage.removeItem(this.keyPrefix + key);
	if (this.getItem(key) !== null) {
		return false;
	}
	else {
		return true;
	}
};

// removes all items that match the given key prefix
UserStorage.prototype.clear = function () {
	for (var index in localStorage) {
		if (typeof index === 'string' && index !== this.keyPrefix && index.indexOf(this.keyPrefix) > -1) {
			localStorage.removeItem(index);
		}
	}
};

}());
