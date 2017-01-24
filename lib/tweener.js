// usage:
// var o = {x:100, y:200};
// Tweener.addTween(o, {x:400, y:500, time:2, delay:1, transition:"easeOutBounce"});
// then, from the game main loop we must call Tweener.update();

// TODO: Add onStart and onUpdate callbacks


var Tweener = {
	objs	: [],		// all tweened objects
	twns	: [],		// all tweens for object
	looping	: false,	// if Tweener is looping
	def		: {			// default values
		time: 1,
		transition: "easeOutExpo",
		delay: 0,
		prefix: {},
		suffix: {},
		onStart: undefined,
		onStartParams: undefined,
		onUpdate: undefined,
		onUpdateParams: undefined,
		onComplete: undefined,
		onCompleteParams: undefined
	}
};


Tweener.addTween = function(o, ps) {
	var tweens, T = Tweener;
	var ind = T.objs.indexOf(o);
	if(ind<0)
	{
		tweens = [];
		T.objs.push(o);
		T.twns.push(tweens);
	}
	else tweens = T.twns[ind];

	var dur, del, ef;
	dur = (ps.time  ==null)?T.def.time  : ps.time;
	del = (ps.delay ==null)?T.def.delay : ps.delay;
	if (ps.transition==null) ef = T.easingFunctions[T.def.transition];
	else ef = T.easingFunctions[ps.transition];

	var onCompleteSet = false;

	for(var p in ps)
	{
		if(p=="time" || p=="delay" || p=="transition") continue;
		var t = new T.Tween();
		t.Set(p, dur, del, ps[p], ef);

		if(!onCompleteSet && ps.onComplete) {
			t.onComplete = ps.onComplete;
			t.onCompleteParams = ps.onCompleteParams;
			onCompleteSet = true;
		}

		/*t.onStart = ps.onStart; t.onStartParams = ps.onStartParams;
		t.onUpdate = ps.onUpdate; t.onUpdateParams = ps.onUpdateParams;
		t.onComplete = ps.onComplete; t.onCompleteParams = ps.onCompleteParams;*/

		tweens.push(t);
	}
	T.loop();
};


Tweener.loop = function() {
	var T = Tweener;
	if(!T.looping) {
		//requestAnimFrame(T.step);
	}
	T.looping = true;
};


Tweener.update = function () {
	if(Tweener.objs.length > 0) {
		Tweener.step();
	}
};


Tweener.step = function() {
	var T = Tweener;
	var step = 1/60;
	var callbacks = [];

	for(var i=0; i<T.objs.length; i++) {
		var o = T.objs[i];
		var tweens = T.twns[i];
		for(var j=0; j<tweens.length; j++) {
			var t = tweens[j];
			if(t.del > 0) t.del -= step;
			else {
				if(t.t == 0) {t.b = o[t.par]; t.c = t.tval - t.b;}
				t.t += step;
				if(t.t > t.dur) {
					o[t.par] = t.tval;
					tweens.splice(j, 1);
					j--;

					// tween has ended, so check if an onComplete function have to be fired
					if(t.onComplete) {
						callbacks.push({fn: t.onComplete, params: t.onCompleteParams});
						t.onComplete = null;
					}
				} else {
					o[t.par] = t.ef(t.t, t.b, t.c, t.dur);
				}
			}
		}
		if(tweens.length == 0) {
			T.objs.splice(i, 1);
			T.twns.splice(i, 1);
			i--;
		}
	}

	if(T.objs.length>0) {
		//requestAnimFrame(T.step);
	} else {
		T.looping = false;
	}

	// trigger all the requested callbacks
	for (var n = 0; n < callbacks.length; n++) {
		callbacks[n].fn(callbacks[n].params);
	}

};


/*
 Animation Frame
 */
/*if(window.requestAnimFrame == null) window.requestAnimFrame = (function() {
 return window.requestAnimationFrame ||
 window.webkitRequestAnimationFrame ||
 window.mozRequestAnimationFrame ||
 window.oRequestAnimationFrame ||
 window.msRequestAnimationFrame ||
 function(callback, element) {
 window.setTimeout(callback, FRAME_RATE);
 };
 })();*/


/*
 Tween class
 */
Tweener.Tween = function()
{
	this.t = 0;
	this.b = 0;
	this.c = 0;
	this.par = null;
	this.dur = 0;
	this.del = 0;
	this.tval = 0;
	this.ef = null;

	this.onStart = null;
	this.onUpdate = null;
	this.onComplete = null;

	this.onStartParams = null;
	this.onUpdateParams = null;
	this.onCompleteParams = null;
};

Tweener.Tween.prototype.Set = function(par, dur, del, tval, ef)
{
	this.par = par;
	this.dur = dur;		// duration
	this.del = del;		// delay
	this.tval = tval;	// target value
	this.ef  = ef;  	// easing function
};




Tweener.easingFunctions =
{
	/*
	 t - current time of tween
	 b - starting value of property
	 c - change needed in value
	 d - total duration of tween
	 */
	easeNone: function(t, b, c, d) {
		return c*t/d + b;
	},
	easeInQuad: function(t, b, c, d) {
		return c*(t/=d)*t + b;
	},
	easeOutQuad: function(t, b, c, d) {
		return -c *(t/=d)*(t-2) + b;
	},
	easeInOutQuad: function(t, b, c, d) {
		if((t/=d/2) < 1) return c/2*t*t + b;
		return -c/2 *((--t)*(t-2) - 1) + b;
	},
	easeInCubic: function(t, b, c, d) {
		return c*(t/=d)*t*t + b;
	},
	easeOutCubic: function(t, b, c, d) {
		return c*((t=t/d-1)*t*t + 1) + b;
	},
	easeInOutCubic: function(t, b, c, d) {
		if((t/=d/2) < 1) return c/2*t*t*t + b;
		return c/2*((t-=2)*t*t + 2) + b;
	},
	easeOutInCubic: function(t, b, c, d) {
		if(t < d/2) return Tweener.easingFunctions.easeOutCubic(t*2, b, c/2, d);
		return Tweener.easingFunctions.easeInCubic((t*2)-d, b+c/2, c/2, d);
	},
	easeInQuart: function(t, b, c, d) {
		return c*(t/=d)*t*t*t + b;
	},
	easeOutQuart: function(t, b, c, d) {
		return -c *((t=t/d-1)*t*t*t - 1) + b;
	},
	easeInOutQuart: function(t, b, c, d) {
		if((t/=d/2) < 1) return c/2*t*t*t*t + b;
		return -c/2 *((t-=2)*t*t*t - 2) + b;
	},
	easeOutInQuart: function(t, b, c, d) {
		if(t < d/2) return Tweener.easingFunctions.easeOutQuart(t*2, b, c/2, d);
		return Tweener.easingFunctions.easeInQuart((t*2)-d, b+c/2, c/2, d);
	},
	easeInQuint: function(t, b, c, d) {
		return c*(t/=d)*t*t*t*t + b;
	},
	easeOutQuint: function(t, b, c, d) {
		return c*((t=t/d-1)*t*t*t*t + 1) + b;
	},
	easeInOutQuint: function(t, b, c, d) {
		if((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
		return c/2*((t-=2)*t*t*t*t + 2) + b;
	},
	easeOutInQuint: function(t, b, c, d) {
		if(t < d/2) return Tweener.easingFunctions.easeOutQuint(t*2, b, c/2, d);
		return Tweener.easingFunctions.easeInQuint((t*2)-d, b+c/2, c/2, d);
	},
	easeInSine: function(t, b, c, d) {
		return -c * Math.cos(t/d *(Math.PI/2)) + c + b;
	},
	easeOutSine: function(t, b, c, d) {
		return c * Math.sin(t/d *(Math.PI/2)) + b;
	},
	easeInOutSine: function(t, b, c, d) {
		return -c/2 *(Math.cos(Math.PI*t/d) - 1) + b;
	},
	easeOutInSine: function(t, b, c, d) {
		if(t < d/2) return Tweener.easingFunctions.easeOutSine(t*2, b, c/2, d);
		return Tweener.easingFunctions.easeInSine((t*2)-d, b+c/2, c/2, d);
	},
	easeInExpo: function(t, b, c, d) {
		return(t==0) ? b : c * Math.pow(2, 10 *(t/d - 1)) + b - c * 0.001;
	},
	easeOutExpo: function(t, b, c, d) {
		return(t==d) ? b+c : c * 1.001 *(-Math.pow(2, -10 * t/d) + 1) + b;
	},
	easeInOutExpo: function(t, b, c, d) {
		if(t==0) return b;
		if(t==d) return b+c;
		if((t/=d/2) < 1) return c/2 * Math.pow(2, 10 *(t - 1)) + b - c * 0.0005;
		return c/2 * 1.0005 *(-Math.pow(2, -10 * --t) + 2) + b;
	},
	easeOutInExpo: function(t, b, c, d) {
		if(t < d/2) return Tweener.easingFunctions.easeOutExpo(t*2, b, c/2, d);
		return Tweener.easingFunctions.easeInExpo((t*2)-d, b+c/2, c/2, d);
	},
	easeInCirc: function(t, b, c, d) {
		return -c *(Math.sqrt(1 -(t/=d)*t) - 1) + b;
	},
	easeOutCirc: function(t, b, c, d) {
		return c * Math.sqrt(1 -(t=t/d-1)*t) + b;
	},
	easeInOutCirc: function(t, b, c, d) {
		if((t/=d/2) < 1) return -c/2 *(Math.sqrt(1 - t*t) - 1) + b;
		return c/2 *(Math.sqrt(1 -(t-=2)*t) + 1) + b;
	},
	easeOutInCirc: function(t, b, c, d) {
		if(t < d/2) return Tweener.easingFunctions.easeOutCirc(t*2, b, c/2, d);
		return Tweener.easingFunctions.easeInCirc((t*2)-d, b+c/2, c/2, d);
	},
	easeInElastic: function(t, b, c, d, a, p) {
		var s;
		if(t==0) return b;  if((t/=d)==1) return b+c;  if(!p) p=d*.3;
		if(!a || a < Math.abs(c)) { a=c; s=p/4; } else s = p/(2*Math.PI) * Math.asin(c/a);
		return -(a*Math.pow(2,10*(t-=1)) * Math.sin((t*d-s)*(2*Math.PI)/p )) + b;
	},
	easeOutElastic: function(t, b, c, d, a, p) {
		var s;
		if(t==0) return b;  if((t/=d)==1) return b+c;  if(!p) p=d*.3;
		if(!a || a < Math.abs(c)) { a=c; s=p/4; } else s = p/(2*Math.PI) * Math.asin(c/a);
		return(a*Math.pow(2,-10*t) * Math.sin((t*d-s)*(2*Math.PI)/p ) + c + b);
	},
	easeInOutElastic: function(t, b, c, d, a, p) {
		var s;
		if(t==0) return b;  if((t/=d/2)==2) return b+c;  if(!p) p=d*(.3*1.5);
		if(!a || a < Math.abs(c)) { a=c; s=p/4; }       else s = p/(2*Math.PI) * Math.asin(c/a);
		if(t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin((t*d-s)*(2*Math.PI)/p )) + b;
		return a*Math.pow(2,-10*(t-=1)) * Math.sin((t*d-s)*(2*Math.PI)/p )*.5 + c + b;
	},
	easeOutInElastic: function(t, b, c, d, a, p) {
		if(t < d/2) return Tweener.easingFunctions.easeOutElastic(t*2, b, c/2, d, a, p);
		return Tweener.easingFunctions.easeInElastic((t*2)-d, b+c/2, c/2, d, a, p);
	},
	easeInBack: function(t, b, c, d, s) {
		if(s == undefined) s = 1.70158;
		return c*(t/=d)*t*((s+1)*t - s) + b;
	},
	easeOutBack: function(t, b, c, d, s) {
		if(s == undefined) s = 1.70158;
		return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
	},
	easeInOutBack: function(t, b, c, d, s) {
		if(s == undefined) s = 1.70158;
		if((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
		return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
	},
	easeOutInBack: function(t, b, c, d, s) {
		if(t < d/2) return Tweener.easingFunctions.easeOutBack(t*2, b, c/2, d, s);
		return Tweener.easingFunctions.easeInBack((t*2)-d, b+c/2, c/2, d, s);
	},
	easeInBounce: function(t, b, c, d) {
		return c - Tweener.easingFunctions.easeOutBounce(d-t, 0, c, d) + b;
	},
	easeOutBounce: function(t, b, c, d) {
		if((t/=d) <(1/2.75)) {
			return c*(7.5625*t*t) + b;
		} else if(t <(2/2.75)) {
			return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
		} else if(t <(2.5/2.75)) {
			return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
		} else {
			return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
		}
	},
	easeInOutBounce: function(t, b, c, d) {
		if(t < d/2) return Tweener.easingFunctions.easeInBounce(t*2, 0, c, d) * .5 + b;
		else return Tweener.easingFunctions.easeOutBounce(t*2-d, 0, c, d) * .5 + c*.5 + b;
	},
	easeOutInBounce: function(t, b, c, d) {
		if(t < d/2) return Tweener.easingFunctions.easeOutBounce(t*2, b, c/2, d);
		return Tweener.easingFunctions.easeInBounce((t*2)-d, b+c/2, c/2, d);
	},

	// CHARLIE -> This is a bounce with half intensity!
	easeOutBounce2: function(t, b, c, d) {
		if((t/=d) <(1/2.75)) {
			return c*(7.5625/2*t*t) + b;
		} else if(t <(2/2.75)) {
			return c*(7.5625/2*(t-=(1.5/2.75))*t + .75) + b;
		} else if(t <(2.5/2.75)) {
			return c*(7.5625/2*(t-=(2.25/2.75))*t + .9375) + b;
		} else {
			return c*(7.5625/2*(t-=(2.625/2.75))*t + .984375) + b;
		}
	}
};

Tweener.easingFunctions.linear = Tweener.easingFunctions.easeNone;