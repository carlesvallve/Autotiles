if (!String.prototype.escapeHtml) {
	String.prototype.escapeHtml = function ()
	{
		return this.split('&').join('&amp;').split('<').join('&lt;').split('>').join('&gt;').split('"').join('&quot;');
	};
}


if (!String.prototype.nlToBr) {
	String.prototype.nlToBr = function () {
		return this.replace(/\n/g, '<br/>');
	};
}


String.prototype.pathInfo = function (delim) {
	if (!delim) {
		delim = '/';
	}

	var path = this.split(delim);
	var filename = path.pop();

	return { path: path.join(delim), filename: filename };
};


Number.prototype.toZenkaku = function () {
	return this.toString().toZenkaku();
};


String.prototype.toZenkaku = function () {
	var result = [];
	var len = this.length;

	for (var i = 0; i < len; i++) {
		var c = this[i];

		switch (c) {
		case '0':
			result.push('０');
			break;
		case '1':
			result.push('１');
			break;
		case '2':
			result.push('２');
			break;
		case '3':
			result.push('３');
			break;
		case '4':
			result.push('４');
			break;
		case '5':
			result.push('５');
			break;
		case '6':
			result.push('６');
			break;
		case '7':
			result.push('７');
			break;
		case '8':
			result.push('８');
			break;
		case '9':
			result.push('９');
			break;
		default:
			result.push(c);
			break;
		}
	}

	return result.join('');
};

String.prototype.parseQueryString = function (plusAsSpace) {
	var result = {};
	var qs = this.split('&');
	for (var i = 0; i < qs.length; i++) {
		var param = qs[i].split('=');

		if (param.length === 2 && param[0].length > 0) {
			param[0] = decodeURIComponent(param[0]);
			param[1] = decodeURIComponent(param[1]);

			if (plusAsSpace) {
				param[0] = param[0].replace(/\+/g, ' ');
				param[1] = param[1].replace(/\+/g, ' ');
			}
			result[param[0]] = param[1];
		}
	}
	return result;
};

String.prototype.toCapitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

String.prototype.getUriParam = function (key) {
	var qs = this.split('&');
	for (var i = 0; i < qs.length; i++) {
		var param = qs[i].split('=');

		param[0] = decodeURIComponent(param[0]);

		if (param[0] === key) {
			if (param.length > 0) {
				return decodeURIComponent(param[1]);
			}
			return '';
		}
	}
	return null;
};


String.prototype.setUriParam = function (key, value) {
	var hash = [];
	var added = false;

	var qs = this.split('&');

	for (var i = 0; i < qs.length; i++) {
		var param = qs[i].split('=');

		if (param.length === 2 && decodeURIComponent(param[0]) === key) {
			added = true;
			hash.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
		}
		else {
			hash.push(qs[i]);
		}
	}

	if (!added) {
		hash.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
	}

	return hash.join('&');
};

String.prototype.strChunks = function (delim, count) {
	// like string.split, except that it does not leave out the last part of the delimited result
	// eg: strSlice('a.b.c.d', '.', 2) returns: ['a', 'b.c.d.']

	var str = this.split(delim);

	var last = str.splice(count - 1);
	if (last.length > 0) {
		return str.concat(last.join(delim));
	}

	return str;
};
