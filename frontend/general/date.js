(function () {

	var aDay	= new Array("Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday");
	var aMonth	= new Array("January","February","March","April","May","June","July","August","September","October","November","December");

	function dateFormat(xdate, x) {

		var hours;

		switch(x) {
		case "d":
			return (xdate.getDate() <= 9) ? "0" + xdate.getDate() : xdate.getDate();
		case "j":
			return xdate.getDate();
		case "D":
			return aDay[xdate.getDay()].substring(0,3);
		case "l":
			return aDay[xdate.getDay()];
		case "w":
			return xdate.getDay();
		case "n":
			return xdate.getMonth() + 1;
		case "m":
			var month = xdate.getMonth() + 1;
			return (month <= 9) ? "0" + month : month;
		case "M":
			return aMonth[xdate.getMonth()].substring(0,3);
		case "F":
			return aMonth[xdate.getMonth()];
		case "y":
			return xdate.getFullYear().toString().substring(2, 4);
		case "Y":
			return xdate.getFullYear().toString();
		case "g":
			hours = xdate.getHours();
			if (hours > 12) {
				hours -= 12;
			}
			return hours || 12;
		case "G":
			return xdate.getHours();
		case "h":
			hours = xdate.getHours();
			if (hours > 12) {
				hours -= 12;
			}
			if (hours < 10) {
				hours = "0" + hours;
			}
			return hours;
		case "H":
			hours = xdate.getHours();
			if (hours < 10) {
				hours = "0" + hours;
			}
			return hours;
		case "i":
			var minutes = xdate.getMinutes();
			if (minutes < 10) {
				minutes = "0" + minutes;
			}
			return minutes;
		case "s":
			var seconds = xdate.getSeconds();
			if (seconds < 10) {
				seconds = "0" + seconds;
			}
			return seconds;
		default:
			return x;

		}
	}

	Date.prototype.toCustomString = function (format) {

		var stringDate = "";
		format = format || "";

		for (var  i = 0, len = format.length; i < len; i += 1) {
			if (format[i] === "%") {
				i += 1;
				if (format[i]) {
					stringDate += dateFormat(this, format[i]);
				}
			} else {
				stringDate += format[i];
			}
		}

		return stringDate;

	};

}());
