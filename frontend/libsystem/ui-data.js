(function () {
	function UiData(objName) {

		var nodeList = {};


		this.updateAll = function (properties) {
			if (this.onUpdate) {
				this.onUpdate(properties);
			}
			for (var key in properties) {
				this.update(key, properties[key]);
			}
		};

		this.update = function (property, value, style, parentElm) {
			parentElm = parentElm || document;

			if (!nodeList[property]) {
				nodeList[property] = parentElm.getElementsByClassName('data-' + objName + '-' + property);
			}

			var i, len, elm;
			if (style) {
				for (i = 0, len = nodeList[property].length; i < len; i++) {
					elm = nodeList[property][i];
					elm.style[style] = value;
				}
			} else {
				for (i = 0, len = nodeList[property].length; i < len; i++) {
					elm = nodeList[property][i];
					elm.innerText = value;
				}
			}

			if (this.onUpdate) {
				var data = {};
				data[property] = value;
				this.onUpdate(data);
			}
		};
	}

	window.UiData = UiData;

}());