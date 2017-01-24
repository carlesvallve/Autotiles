(function () {

	function Sprite() {
		this.x = 0;
		this.y = 0;
		this._parent = null;
		this._children = [];
	}

	Sprite.prototype = new EventEmitter();
	window.wuic.core.Sprite = Sprite;

	Sprite.prototype.initSprite = function (params) {
		// set sprite props
		this.view = params && params.view && !this.view ? params.view : this.view;
		this.parent = params &&  params.parent ? params.parent : this.parent;
		this.name = params &&  params.name ? params.name : 'sprite';
		this.asset = params && params.asset ? params.asset : this.asset;
		this.x = params && params.x ? params.x : this.x;
		this.y = params && params.y ? params.y : this.y;
		this.width = params && params.width ? params.width : this.asset.width / 2;
		this.height = params &&  params.height ? params.height : this.asset.height / 2;
		this.alpha = params &&  params.alpha ? params.alpha : 1;
		this.visible = params &&  params.visible ? params.visible : true;
		// add sprite to parent sprite
		if(this.parent) {
			this.parent.appendChild(this);
		}
	};

	Sprite.prototype.appendChild = function (sprite) {
		if (this._children.indexOf(sprite) === -1) {
			this._children.push(sprite);
			sprite._parent = this;;
			this.emit('appendChild', sprite);
		}
	};

	Sprite.prototype.gx = function () {
		var gx = getAllParentProp(this, 'x');
		return gx;
	};

	Sprite.prototype.gy = function () {
		var gy = getAllParentProp(this, 'y');
		return gy;
	};

	function getAllParentProp(me, pos) {
		var p = me[pos];
		var parent = me._parent;
		while (parent) {
			p += parent[pos];
			parent = parent._parent;
		}
		return p;
	}

	Sprite.prototype.draw = function (ctx) {
		if(!this.visible || !this.asset) {
			return;
		}

		ctx.save();
		ctx.globalAlpha = this.alpha;
		ctx.drawImage(this.asset, this.gx(), this.gy(), this.width , this.height);
		ctx.restore();
	};

}());