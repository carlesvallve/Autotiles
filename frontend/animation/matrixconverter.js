function MatrixConverter(CSSmatrix) {
	var matrix = {};
	for (var i = 1; i < 5; i++)
		for (var j = 1; j < 5; j++)
			matrix["m" + i + j] = CSSmatrix["m" + i + j];

	// Normalize the matrix.
	if (matrix.m44 == 0)
		throw "Error: The matrix is not valid";

	// removing the scaling perspective
	for (var i = 1; i < 5; i++)
		for (var j = 1; j < 5; j++)
			matrix["m" + i + j] /= matrix["m44"];


	var translate = {};   // default: { x:0, y:0, z:0 }; // a 3 component vector
	var rotate = {};      // default: { x:0, y:0, z:0 }; // Euler angles, represented as a 3 component vector
	var scale = {};       // default: { x:1, y:1, z:1 }; // a 3 component vector
	var skew = {};        // default: { x:0, y:0, z:0 }; // skew factors XY,XZ,YZ represented as a 3 component vector
	var perspective = {}; // default: { x:0, y:0, z:0, k:1 }; // a 4 component vector
	var row = []; // used for calculation

	function isEmptyObject(o) { for (var key in o) { return false; } return true; }

	var cloneOfObject = function (o) {
		if (o instanceof Array) {
			return o.map(cloneOfObject);
		}

		if (typeof o === 'object') {
			var result = {};

			for (var i in o) {
				result[i] = cloneOfObject(o[i]);
			}

			return result;
		}

		return o;
	};

	// Decomposition also makes use of the following function:
	var combine = function (a, b, ascl, bscl) {
		var result = [];
		result[0] = (ascl * a[0]) + (bscl * b[0]);
		result[1] = (ascl * a[1]) + (bscl * b[1]);
		result[2] = (ascl * a[2]) + (bscl * b[2]);
		return result;
	};

	var length = function (point) {
		return Math.sqrt(Math.pow(point[0],2) + Math.pow(point[1],2) + Math.pow(point[2],2));
	};

	var normalize = function (point) {
		var size = length(point);
		point[0] /= size;
		point[1] /= size;
		point[2] /= size;
		return point;
	};

	var cross = function (pointA,pointB) {
		var point = [];
		point[0] = pointA[1] * pointB[2] - pointA[2] * pointB[1];
		point[1] = pointA[2] * pointB[0] - pointA[0] * pointB[2];
		point[2] = pointA[0] * pointB[1] - pointA[1] * pointB[0];

		return point;
	};

	var dot = function (pointA,pointB) {
		return (pointA[0] * pointB[0] + pointA[1] * pointB[1] + pointA[2] * pointB[2]);
	};

	var inverse = function (m) {
		return m.inverse();
	};

	var ran2deg = function (angle) {
		return angle * (180/Math.PI);
	};

	var rFloat = function (f) {
		return Math.round(f * 1000000000) / 1000000000;
	};

	var multVecMatrix = function (p,m) {
		var point = [];
		point[0] = m["m11"] * p[0] + m["m12"] * p[1] + m["m13"] * p[2];
		point[1] = m["m21"] * p[0] + m["m22"] * p[1] + m["m23"] * p[2];
		point[2] = m["m31"] * p[0] + m["m32"] * p[1] + m["m33"] * p[2];
		point[3] = m["m41"] * p[0] + m["m42"] * p[1] + m["m43"] * p[2];
		return point;
	};

	var transposeMatrix4 = function (m) {
		var transM = {};
		for (var i=1; i<5;i++)
			for (var j=1; j<5;j++)
				transM["m" + j + i] = m["m" + i + j];
		return transM;
	};


	var calcPerspective = function () {
		if (!isEmptyObject(perspective)) return perspective;
		//perspectiveMatrix is used to solve for perspective, but it also provides
		// an easy way to test for singularity of the upper 3x3 component.

		var perspectiveMatrix = cloneOfObject(matrix);

		for (var i = 1; i < 4; i++) {
			perspectiveMatrix["m" + i + "4"] = 0;
		}

		perspectiveMatrix["m44"] = 1;

		// First, isolate perspective.
		if (matrix["m14"] != 0 || matrix["m24"] != 0 || matrix["m34"] != 0) {
			// rightHandSide is the right hand side of the equation.
			rightHandSide[0] = matrix["m14"];
			rightHandSide[1] = matrix["m24"];
			rightHandSide[2] = matrix["m34"];
			rightHandSide[3] = matrix["m44"];

			// Solve the equation by inverting perspectiveMatrix and multiplying last column by the inverse.
			var transposedInversePerspectiveMatrix = transposeMatrix4(inverse(perspectiveMatrix));
			perspectivePoint = multVecMatrix(rightHandSide, transposedInversePerspectiveMatrix);
			perspective.x = perspectivePoint[0];
			perspective.y = perspectivePoint[1];
			perspective.z = perspectivePoint[2];
			perspective.k = perspectivePoint[3];

			// Clear the perspective partition
			matrix["m14"] = matrix["m24"] = matrix["m34"] = 0;
			matrix["m44"] = 1;
		} else {
			// No perspective.
			perspective.x = perspective.y = perspective.z = 0;
			perspective.k = 1;
		}
		return perspective;
	};

	var calcTranslate = function () {
		if (!isEmptyObject(rotate)) {
			return translate;
		}
		// Next take care of translation
		translate.x = matrix["m41"];
		translate.y = matrix["m42"];
		translate.z = matrix["m43"];
		return translate;
	};

	// Now get scale and shear. 'row' is a 3 element array of 3 component vectors

	var calcScaleSkew = function () {
		for (var i = 0; i < 3; i++) {
			row[i] = [];
			row[i][0] = matrix["m" + (i+1) + 1];
			row[i][1] = matrix["m" + (i+1) + 2];
			row[i][2] = matrix["m" + (i+1) + 3];
	    }

		// Compute X scale factor and normalize first row.
		scale.x = rFloat(length(row[0]));
		row[0] = normalize(row[0]);

		// Compute XY shear factor and make 2nd row orthogonal to 1st.
		skew.x = rFloat(dot(row[0], row[1]));
		row[1] = combine(row[1], row[0], 1.0, -skew.x);

		// Now, compute Y scale and normalize 2nd row.
		scale.y = rFloat(length(row[1]));
		row[1] = normalize(row[1]);
		skew.x /= scale.y;

		// Compute XZ and YZ shears, orthogonalize 3rd row
		skew.y = rFloat(dot(row[0], row[2]));
		row[2] = combine(row[2], row[0], 1.0, -skew.y);
		skew.z = rFloat(dot(row[1], row[2]));
		row[2] = combine(row[2], row[1], 1.0, -skew.z);

		// Next, get Z scale and normalize 3rd row.
		scale.z = rFloat(length(row[2]));
		row[2] = normalize(row[2]);
		skew.y /= scale.z;
		skew.z /= scale.z;

		// At this point, the matrix (in rows) is orthonormal.
		// Check for a coordinate system flip.  If the determinant
		// is -1, then negate the matrix and the scaling factors.
		var pdum3 = cross(row[1], row[2]);
		if (dot(row[0], pdum3) < 0) {
			for (var i = 0; i < 3; i++) {
				scale.x *= -1;
				row[i][0] *= -1;
				row[i][1] *= -1;
				row[i][2] *= -1;
	        }
		}
	};

	var calcScale = function () {
		if (!isEmptyObject(scale)) {
			return scale;
		}
		calcScaleSkew();
		return scale;
	};

	var calcSkew = function () {
		if (!isEmptyObject(skew)) {
			return skew;
		}
		calcScaleSkew();
		return skew;
	};

	var calcRotate = function () {
		if (!isEmptyObject(rotate)) {
			return rotate;
		}
		
		if (row.length == 0) {
			calcScaleSkew();
		}

		// Now, get the rotations
		rotate.y = rFloat(ran2deg(Math.asin(-row[0][2])));
		if (Math.cos(rotate.y) != 0) {
			rotate.x = rFloat(ran2deg(Math.atan2(row[1][2], row[2][2])));
			rotate.z = rFloat(ran2deg(Math.atan2(row[0][1], row[0][0])));
		} else {
			rotate.x = rFloat(ran2deg(Math.atan2(-row[2][0], row[1][1])));
			rotate.z = 0;
		}
		return rotate;
	};

	this.__defineGetter__("translate",calcTranslate);
	this.__defineGetter__("rotate",calcRotate);
	this.__defineGetter__("scale",calcScale);
	this.__defineGetter__("skew",calcSkew);
	this.__defineGetter__("perspective",calcPerspective);

}
