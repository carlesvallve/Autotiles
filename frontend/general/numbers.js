(function () {
	
	Number.prototype.toStringComma = function (thousand, decimal) {
		
		thousand = thousand || ",";
		decimal = decimal || "."; 
		
		var number = this / 1;
		
		var up = (number >>> 0);
		var low = (number - up).round(3);
		
		var upper = up.toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, thousand);
		var lower = "";
		
		if (low > 0) {
			lower = low.toString().replace("0.", decimal);
		}
	
		return upper + lower;
	};
	
	var units = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
	var tens = ["twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
	
	Number.prototype.toWord = function () {
		
		var i;
		var it = this >>> 0;
		var theword = "";
		
		if (it > 999) {
			return "Lots";
		}
		
		if (it === 0) {
			return units[0];
		}
		
		for (i = 9; i >= 1; i--) {
			if (it >= i * 100) {
				theword += units[i];
				started = true;
				theword += " hundred";
				if (it !== i * 100) {
					theword += " and ";
				}
				it -= i * 100;
				i = 0;
			}
		}
		
		for (i = 9; i >= 2; i--){
			if (it >= i * 10) {
				theword += tens[i-2];
				started = 1;
				if (it !== i * 10) {
					theword += "-";
				}
				it -= i*10;
				i = 0;
			}
		}
		
		for (i = 1; i < 20; i++) {
			if (it === i) {
				theword += units[i];
			}
		}
		return theword;
	};
	
	Number.prototype.round = function (ind) {
		var _nb = this * (Math.pow(10,ind));
		_nb = Math.round(_nb);
		_nb = _nb / (Math.pow(10,ind));
		return _nb;
	};
	
	Number.prototype.trunc = function (ind) {
		var _nb = this * (Math.pow(10,ind));
		_nb = Math.floor(_nb);
		_nb = _nb / (Math.pow(10,ind));
		return _nb;
	};
	// convert a big number to k,M,G
	Number.prototype.toRoundAbv = function (thousand, decimal) {
		
		var num = "";
		var ext = "";
		
		if (this >= 1e18) {
			num = (this/1e18);
			ext = "E";
		} else if (this >= 1e15) {
			num = (this/1e15);
			ext = "P";
		} else if (this >= 1e12) {
			num = (this/1e12);
			ext = "T";
		} else if (this >= 1e9) {
			num = (this/1e9);
			ext = "G";
		} else if (this >= 1e6) {
			num = (this/1e6);
			ext = "M";
		} else {
			num = this >>> 0;
		}
		return num.trunc(2).toStringComma(thousand, decimal) + ext;
	};
}());