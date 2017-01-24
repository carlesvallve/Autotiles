(function () {

	if (window.wuic) {
		return;
	}

	window.wuic = {
		core: {},
		behaviors: {},
		components: {}
	};

	wuic.core.inherits = function (ChildCls, ParentCls) {
		ChildCls.prototype = Object.create(ParentCls.prototype, {
			constructor: {
				value: ChildCls,
				enumerable: false,
				writable: true,
				configurable: true
			}
		});
	};

}());
