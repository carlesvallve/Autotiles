/*
* Usage:
* logger.debug()           > output in console.log
* logger.warn()            > output in console.warn
* logger.error()           > output in console.error
* logger.suppress.debug()  > suppress logger.debug
* logger.suppress.warn()   > suppress logger.warn
* logger.supress.error()   > suppress logger.error
* logger.filter(pattern)   > output/supress matched log message(s)
* logger.whiteList()       > output matched(logger.filter) log meesage(s) and suppress everything else
* logger.blackList()       > suppress matched(logger.filter) log message(s) and output evrything else
* logger.snapshot(variable, ignoreFunction) > takes a snapshot of a given variable and output the value as a string
*/
(function () {

	var logger = {};
	window.logger = logger;

	var suppressDebug = false; // private
	var suppressWarn = false; // private
	var suppressError = false; // private
	var filterRegex = null; // private
	var filterOut = false; // private > if true filter will suppress output matched, if false filter will output ONLY matched

	logger.suppress =  {
		debug: function (flag) {
			if (flag === false) {
				suppressDebug = false;
			}
			else {
				suppressDebug = true;
			}
			console.warn('Logger.suppress.debug: ', suppressDebug);
		},
		warn: function (flag) {
			if (flag === false) {
				suppressWarn = false;
			}
			else {
				suppressWarn = true;
			}
			console.warn('Logger.suppress.warn: ', suppressWarn);
		},
		error: function (flag) {
			if (flag === false) {
				suppressError = false;
			}
			else {
				suppressError = true;
			}
			console.warn('Logger.suppress.error: ', suppressError);
		}
	};


	// filters debug/warn/error logs and suppresses logs that match
	logger.filter = function (regex) {
		var prev = filterRegex;
		filterRegex = regex;
		console.warn('Logger.filter: ' + prev + ' -> ' + regex);
		console.warn((filterOut) ? 'Logger.filter: suppress matched' : 'Logger.filter: output matched');
	};

	// public > output not matched logs
	logger.blackList = function () {
		filterOut = true;
		console.warn('Logger.blackList: black list mode > output NOT matched ONLY');
	};

	// public > output matched logs
	logger.whiteList = function () {
		filterOut = false;
		console.warn('Logger.whiteList: white list mode > output match ONLY');
	};

	// public
	logger.clearFilter = function () {
		filterRegex = null;
		console.warn('Logger.clearFilter');
	};

	// public console.log
	logger.debug = function () {
		if (!suppressDebug) {
			log('log', arguments);
		}
	};

	// public console.warn
	logger.warn = function () {
		if (!suppressWarn) {
			log('warn', arguments);
		}
	};

	// public function console.error
	logger.error = function () {
		if (!suppressError) {
			log('error', arguments);
			console.trace();
		}
	};

	// public function console.log
	logger.snapshot = function (list, ignoreFunction) {
		if (!suppressDebug) {
			if (ignoreFunction === undefined) {
				ignoreFunction = true; // default
			}
			parseSnapshot('', '', list, ignoreFunction, [ list ]);
		}
	};

	// private
	var parseSnapshot = function (indent, parentKey, list, ignoreFunction, seen) {
		if (typeof list !== 'object') {
			return log('log', [ list + '[' + (typeof list).toUpperCase() + ']'  ]);
		}
		var seenLen = seen.length;
		for (var i in list) {
			var val = list[i];
			if (typeof val === 'function' && ignoreFunction) {
				continue;
			}
			if (typeof val === 'object') {
				var type = '[OBJECT]';
				if (val && val.constructor === Array) {
					type = '[ARRAY]';
				}
				log('log', [ indent + parentKey + i + ' = ' + type ]);
				// check for circular reference TODO: is there a better way to detect circular references?
				for (var k = 0; k < seenLen; k++) {
					if (seen[k] === val) {
						return log('warn',  [ 'Circular Reference Detected at ' + parentKey + i, val ]);
					}
				}
				seen.push(list);
				parseSnapshot(indent + ' ', parentKey + i + '.', val, ignoreFunction, seen);
			}
			else {
				log('log', [ indent + parentKey + i + ' = ' + val + '[' + (typeof val).toUpperCase() + ']' ]);
			}
		}
	};

	// private
	var log = function (type, args) {
		// check for filter
		if (filterRegex) {
			var argStr = JSON.stringify(args);
			if (filterOut) {
				// black list mode
				if (argStr.match(filterRegex)) {
					// filter applied and there is a match > we do not output log
					return false;
				}
			}
			else {
				// white list mode
				if (!argStr.match(filterRegex)) {
					// filter applied and there is no match > we do not output log
					return false;
				}
			}
		}
		console[type].apply(console, args);
	};

}());
