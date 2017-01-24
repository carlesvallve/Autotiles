/*
Dependency:
- [optional] window.pg.localStorage
 */

(function (window) {

	var pg = window.pg;

	if (!pg) {
		pg = window.pg = {};
	}

	var wrapper = pg.audio = {};

	var Media = window.Media;
	var Audio = window.Audio;
	var lowLatencyAudio = window.LowLatencyAudio;

	var channels = {};
	var isRestarting = false;


	function loadSuccess() {
	}

	function loadFailure(code) {
		console.warn('Failed loading audio asset, code: ' + code);
	}


	function AudioFile(name, options, priority) {
		this.name = name;
		this.encodedUrl = null;
		this.options = options || {};
		this._isPlaying = false;
		this.priority = priority || 0;

		// external APIs
		this.media = null;
		this.audio = null;
		this.lla = null;
	}


	AudioFile.prototype.identifyLibrary = function () {
		if (this.lla) {
			return 'LowLatencyAudio';
		}

		if (this.media) {
			return 'Cordova Media';
		}

		if (this.audio) {
			return 'HTML5 Audio';
		}

		return 'File not loaded, or no library available.';
	};


	AudioFile.prototype.load = function (encodedUrl, cb) {
		this.encodedUrl = encodedUrl;

		function loadSuccess() {
			if (cb) {
				cb();
			}
		}

		function loadFailure(err) {
			var error = new Error('Audio file load error: ' + err + ' (' + encodedUrl + ')');

			console.warn(error);

			if (cb) {
				cb(error);
			}
		}

		if (lowLatencyAudio) {
			this.lla = lowLatencyAudio;

			if (this.options.prebuffer) {
				this.lla.preloadFX(this.name, window.decodeURI(encodedUrl), loadSuccess, loadFailure);
			} else {
				this.lla.preloadAudio(this.name, window.decodeURI(encodedUrl), this.options.voices || 1, loadSuccess, loadFailure);
			}
		} else if (Media) {
			this.media = new Media(window.decodeURI(encodedUrl), loadSuccess, loadFailure);
		} else if (Audio) {
			this.audio = new Audio(encodedUrl);

			var that = this;

			this.audio.addEventListener('ended', function () {
				that._isPlaying = false;

				if (that.options.loop) {
					that.play();
				}
			}, false);

			loadSuccess();
		} else {
			loadFailure('No supported audio engine found.');
		}
	};


	AudioFile.prototype.isPlaying = function () {
		return this._isPlaying;
	};


	AudioFile.prototype.play = function () {
		this._isPlaying = true;

		if (isRestarting) {
			// in the case of the application restarting, we don't want to actually start playing anything
			return;
		}

		if (this.lla) {
			if (this.options.loop) {
				this.lla.loop(this.name);
			} else {
				this.lla.play(this.name);
			}
		} else if (this.media) {
			if (this.options.loop) {
				this.media.play({ numberOfLoops: 'infinite' });
			} else {
				this.media.play();
			}
		} else if (this.audio) {
			this.audio.play();
		}
	};


	AudioFile.prototype.stop = function () {
		if (this.lla) {
			this.lla.stop(this.name);
		} else if (this.media) {
			this.media.stop();
		} else if (this.audio) {
			this.audio.pause();
			this.audio.currentTime = 0;
		}

		this._isPlaying = false;
	};


	AudioFile.prototype.pause = function () {
		if (this.lla) {
			// LowLatencyAudio does not (yet?) support pausing

			this.lla.stop();
		} else if (this.media) {
			this.media.pause();
		} else if (this.audio) {
			this.audio.pause();
		}

		this._isPlaying = false;
	};


	AudioFile.prototype.setVolume = function (n) {
		// n between 0 and 1

		if (this.lla && this.lla.setVolume) {
			this.lla.setVolume(this.name, n);
		}
	};

	function BgmChannel(name, options) {
		this.name = name;
		this.options = options || {};
		this.currentFile = null;
		this._isPlaying = false;
		this.files = {};
		this.priorities = {};
		this._isMuted = this.options.muted || false;
		this.setVolume(0.5);

		if (pg.localStorage && pg.localStorage.get('audio.' + this.name + '.mute')) {
			this._isMuted = true;
		}
	}

	BgmChannel.prototype.add = function (name, asset, priority) {
		var file = new AudioFile(name, this.options, priority);

		this.files[name] = file;

		file.load(asset.getUrl());
	};


	BgmChannel.prototype.mute = function () {
		if (!this._isMuted) {
			this._isMuted = true;

			this.pause();

			if (pg.localStorage) {
				pg.localStorage.set('audio.' + this.name + '.mute', true);
			}
		}
	};


	BgmChannel.prototype.unmute = function () {
		if (this._isMuted) {
			this._isMuted = false;

			this.resume();

			if (pg.localStorage) {
				pg.localStorage.del('audio.' + this.name + '.mute');
			}
		}
	};


	BgmChannel.prototype.isMuted = function () {
		return this._isMuted;
	};


	BgmChannel.prototype.play = function (name) {

		// re-play the last played, or the given sound name
		var file;

		if (name) {
			file = this.files[name];
		} else {
			file = this.currentFile;
		}

		if (!file) {
			console.warn('Audio file not found: ' + name);
			return;
		}

		// replace priority file for this priority
		this.priorities[file.priority] = name;

		// if the same file is already playing or if it has lower priority than the file currently playing, we stop right there
		if (this.currentFile && (file.name === this.currentFile.name || file.priority < this.currentFile.priority)) {
			return;
		}

		if (!this.isMuted()) {
			// stop the sound that is currently playing

			if (this.currentFile) {
				this.currentFile.stop();
			}

			// play the new sound

			file.play();

			this._isPlaying = true;
		}

		this.currentFile = file;
	};


	BgmChannel.prototype.pause = function () {
		if (this.currentFile) {
			this.currentFile.stop();
		}
	};

	BgmChannel.prototype.resume = function () {
		if (this.currentFile) {
			this.currentFile.play();
		}
	};


	BgmChannel.prototype._stopCurrentFile = function () {
		if (this.currentFile) {
			this.currentFile.stop();
			this.currentFile = null;
		}

		this._isPlaying = false;
	};


	// can explicitely say to stop a filename. i.e. if it is not the one currently playing, we don't stop it
	BgmChannel.prototype.stop = function (name) {
		if (!this.currentFile) {
			// nothing is currently playing, so there is nothing to stop
			return;
		}

		if (typeof name === 'undefined') {
			// stop all bgm
			this._stopCurrentFile();
			this.priorities = {};
			return;
		}

		if (name === this.currentFile.name) {
			// the given name is the bgm that is currently playing
			this._stopCurrentFile();
		}

		// forget about the file that we're stopping

		var file = this.files[name];

		if (file && this.priorities[file.priority] === name) {
			delete this.priorities[file.priority];
		}

		// try to play next available file with the highest priority

		var highestPriority = null;

		for (var i in this.priorities) {
			if (highestPriority === null && i > highestPriority) {
				highestPriority = i;
			}
		}

		if (highestPriority !== null && this.priorities[highestPriority]) {
			this.play(this.priorities[highestPriority]);
		}
	};


	BgmChannel.prototype.nowPlaying = function () {
		return this.currentFile ? this.currentFile.name : null;
	};

	BgmChannel.prototype.isPlaying = function () {
		return this._isPlaying;
	};

	BgmChannel.prototype.getCurrentFile = function () {
		return this.currentFile;
	};


	BgmChannel.prototype.setVolume = function (n) {
		// n between 0 and 1

		for (var name in this.files) {
			this.files[name].setVolume(n);
		}
	};



	function SfxChannel(name, options) {
		this.name = name;
		this.options = options || {};
		this.files = {};
		this._isMuted = this.options.muted || false;

		if (pg.localStorage && pg.localStorage.get('audio.' + this.name + '.mute')) {
			this._isMuted = true;
		}
	}

	SfxChannel.prototype.add = function (name, asset) {
		var file = new AudioFile(name, this.options);

		this.files[name] = file;

		file.load(asset.getUrl());
	};


	SfxChannel.prototype.mute = function () {
		if (!this._isMuted) {
			this._isMuted = true;

			if (pg.localStorage) {
				pg.localStorage.set('audio.' + this.name + '.mute', true);
			}
		}
	};


	SfxChannel.prototype.unmute = function () {
		if (this._isMuted) {
			this._isMuted = false;

			if (pg.localStorage) {
				pg.localStorage.del('audio.' + this.name + '.mute');
			}
		}
	};

	SfxChannel.prototype.isMuted = function () {
		return this._isMuted;
	};


	SfxChannel.prototype.play = function (name) {
		var file = null;

		if (name) {
			file = this.files[name];
		}

		if (!file) {
			console.warn('Audio file not found: ' + name);
			return;
		}

		if (!this.isMuted()) {
			file.play();
		}
	};

	wrapper.addBgmChannel = function (name, options) {
		var channel = new BgmChannel(name, options);

		channels[name] = channel;

		if (pg.onrestart) {
			// older versions of the phonegap wrapper (which can exist in iOS app builds),
			// don't have onrestart

			pg.onrestart(function () {
				isRestarting = true;

				channel.stop();
			});
		}

		return channel;
	};

	wrapper.addSfxChannel = function (name, options) {
		var channel = new SfxChannel(name, options);

		channels[name] = channel;

		return channel;
	};


	wrapper.removeChannel = function (name) {
		var channel = channels[name];

		if (channel) {
			channels[name] = null;
			// channel.close();
		}
	};

	wrapper.getChannel = function (name) {
		return channels[name] || null;
	};


}(window));
