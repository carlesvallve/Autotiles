/**
 * Copyright (C) 2011 by Paul Lewis for CreativeJS. We love you all :)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

var Fireworks = function () {

	// declare the variables we need
	this.particles = [];
	this.mainContext = context;
	this.viewportWidth = canvasWidth;
	this.viewportHeight = canvasHeight;

	this.type = 'spark';

	// and now we set off
	this.update();
};


/**
 * Pass through function to create a
 * new firework on touch / click
 */

Fireworks.prototype.createFirework = function(type, pos, color) {
	if(type) {
		this.type = type;
	}

	if(color) {
		this.color = color;
	}

	this.createParticle(pos, pos, null, color);
};

/**
 * Creates a block of colours for the
 * fireworks to use as their colouring
 */

/*Fireworks.prototype.createFireworkPalette = function(gridSize) {
	var size = gridSize * 100;
	this.fireworkCanvas.width = size;
	this.fireworkCanvas.height = size;
	this.fireworkContext.globalCompositeOperation = 'source-over';

	// create 100 blocks which cycle through
	// the rainbow... HSL is teh r0xx0rz
	for(var c = 0; c < 100; c++) {

		var marker = (c * gridSize);
		var gridX = marker % size;
		var gridY = Math.floor(marker / size) * gridSize;

		this.fireworkContext.fillStyle = "hsl(" + Math.round(c * 3.6) + ",100%,60%)"; //'rgba(255,0,0,1)'; // '#0f0';//
		this.fireworkContext.fillRect(gridX, gridY, gridSize, gridSize);
		this.fireworkContext.drawImage(
			assets.bigGlow,
			gridX,
			gridY);
	}
};*/


/**
 * The main loop where everything happens
 */
Fireworks.prototype.update = function() {
	//clearContext();
	//requestAnimFrame(this.update);

	this.drawFireworks(this.type);
};


/**
 * Passes over all particles particles
 * and draws them
 */

Fireworks.prototype.drawFireworks = function(type) { //, color
	var a = this.particles.length;

	while(a--) {
		var firework = this.particles[a];
		//firework.color = color;

		// if the update comes back as true
		// then our firework should explode
		if(firework.update()) {

			// kill off the firework, replace it
			// with the particles for the exploded version
			this.particles.splice(a, 1);

			// if the firework isn't using physics
			// then we know we can safely(!) explode it... yeah.
			if(!firework.usePhysics) {

				switch (type) {
				case 'spark':
					FireworkExplosions.spark(firework);
					break;
				case 'circle':
					FireworkExplosions.circle(firework);
					break;
				case 'star':
					FireworkExplosions.star(firework);
					break;
				}

				/*if(Math.random() < 0.8) {
					FireworkExplosions.star(firework);
				} else {
					FireworkExplosions.circle(firework);
				}*/
			}
		}

		// pass the canvas context and the firework
		// colours to the
		firework.render(this.mainContext);//, this.fireworkCanvas);
	}
};

/**
 * Creates a new particle / firework
 */

Fireworks.prototype.createParticle = function(pos, target, vel, color, usePhysics) {

	pos = pos || {};
	target = target || {};
	vel = vel || {};

	this.particles.push(
		new Particle(
			// position
			{
				x: pos.x || this.viewportWidth * 0.5,
				y: pos.y || this.viewportHeight + 10
			},

			// target
			{
				y: target.y || 150 + Math.random() * 100
			},

			// velocity
			{
				x: vel.x || Math.random() * 0.5, //3 - 1.5,
				y: vel.y || 0
			},

			color || Math.floor(Math.random() * 100) * 12,

			usePhysics)
	);
};


/**
 * Represents a single point, so the firework being fired up
 * into the air, or a point in the exploded firework
 */

var Particle = function(pos, target, vel, marker, usePhysics) {

	// properties for animation
	// and colouring
	this.GRAVITY  = 0.06;
	this.alpha    = 1;
	this.easing   = Math.random() * 0.02;
	this.fade     = Math.random() * 0.1;
	//this.gridX    = marker % 120;
	//this.gridY    = Math.floor(marker / 120) * 12;
	this.color    = marker;

	this.pos = {
		x: pos.x || 0,
		y: pos.y || 0
	};

	this.vel = {
		x: vel.x || 0,
		y: vel.y || 0
	};

	this.lastPos = {
		x: this.pos.x,
		y: this.pos.y
	};

	this.target = {
		y: target.y || 0
	};

	this.usePhysics = usePhysics || false;

};

/**
 * Functions that we'd rather like to be
 * available to all our particles, such
 * as updating and rendering
 */

Particle.prototype = {

	update: function() {

		this.lastPos.x = this.pos.x;
		this.lastPos.y = this.pos.y;

		if(this.usePhysics) {
			this.vel.y += this.GRAVITY;
			this.pos.y += this.vel.y;

			// since this value will drop below
			// zero we'll occasionally see flicker,
			// ... just like in real life! Woo! xD
			this.alpha -= this.fade;
			if(this.alpha < 0) { this.alpha = 0; }
		} else {

			var distance = (this.target.y - this.pos.y);

			// ease the position
			this.pos.y += distance * (0.03 + this.easing);

			// cap to 1
			this.alpha = Math.min(distance * distance * 0.00005, 1);
		}

		this.pos.x += this.vel.x;

		return (this.alpha < 0.005);
	},

	render: function(context) {

		var x = Math.round(this.pos.x),
			y = Math.round(this.pos.y),
			xVel = (x - this.lastPos.x) * -5,
			yVel = (y - this.lastPos.y) * -5;

		context.save();

		context.globalCompositeOperation = 'lighter';
		context.globalAlpha = 1;

		// draw the line from where we were to where
		// we are now

		var d = 1.5;
		context.fillStyle = this.color;
		context.beginPath();
		context.moveTo(this.pos.x, this.pos.y);
		context.lineTo(this.pos.x + d, this.pos.y);
		context.lineTo(this.pos.x + xVel, this.pos.y + yVel);
		context.lineTo(this.pos.x - d, this.pos.y);
		context.closePath();
		context.fill();

		context.globalAlpha = 0.9;
		var w = assets.smallGlow.width / 1.5;
		context.drawImage(assets.smallGlow, x - w / 2, y - w / 2,  w, w);

		context.restore();
	}

};


var FireworkExplosions = {

	/**
	 * Explodes in a little spark at random directions
	 */
	spark: function(firework) {

		var count = 5;
		var angle = utils.randomInt(0,360);
		while(count--) {

			var randomVelocity = 4 + Math.random() * 4;
			var particleAngle = count * angle;

			fireworks.createParticle(
				firework.pos,
				null,
				{
					x: Math.cos(particleAngle) * randomVelocity,
					y: Math.sin(particleAngle) * randomVelocity
				},
				firework.color,
				true);
		}
	},

	/**
	 * Explodes in a roughly circular fashion
	 */
	circle: function(firework) {

		var count = 50;
		var angle = (Math.PI * 2) / count;
		while(count--) {

			var randomVelocity = 4 + Math.random() * 4;
			var particleAngle = count * angle;

			fireworks.createParticle(
				firework.pos,
				null,
				{
					x: Math.cos(particleAngle) * randomVelocity,
					y: Math.sin(particleAngle) * randomVelocity
				},
				firework.color,
				true);
		}
	},

	/**
	 * Explodes in a star shape
	 */
	star: function(firework) {

		// set up how many points the firework
		// should have as well as the velocity
		// of the exploded particles etc
		var points          = 6 + Math.round(Math.random() * 15); //utils.randomInt(3, 10);//
		var jump            = 3 + Math.round(Math.random() * 7);
		var subdivisions    = 10;
		var radius          = 40; //80
		var randomVelocity  = -(Math.random() * 3 - 6);

		var start           = 0;
		var end             = 0;
		var circle          = Math.PI * 2;
		var adjustment      = Math.random() * circle;

		do {

			// work out the start, end
			// and change values
			start = end;
			end = (end + jump) % points;

			var sAngle = (start / points) * circle - adjustment;
			var eAngle = ((start + jump) / points) * circle - adjustment;

			var startPos = {
				x: firework.pos.x + Math.cos(sAngle) * radius,
				y: firework.pos.y + Math.sin(sAngle) * radius
			};

			var endPos = {
				x: firework.pos.x + Math.cos(eAngle) * radius,
				y: firework.pos.y + Math.sin(eAngle) * radius
			};

			var diffPos = {
				x: endPos.x - startPos.x,
				y: endPos.y - startPos.y,
				a: eAngle - sAngle
			};

			// now linearly interpolate across
			// the subdivisions to get to a final
			// set of particles
			for(var s = 0; s < subdivisions; s++) {

				var sub = s / subdivisions;
				var subAngle = sAngle + (sub * diffPos.a);

				fireworks.createParticle(
					{
						x: startPos.x + (sub * diffPos.x),
						y: startPos.y + (sub * diffPos.y)
					},
					null,
					{
						x: Math.cos(subAngle) * randomVelocity,
						y: Math.sin(subAngle) * randomVelocity
					},
					firework.color,
					true);
			}

			// loop until we're back at the start
		} while(end !== 0);

	}

};

// Go
/*window.onload = function() {
	Fireworks.initialize();
};*/

