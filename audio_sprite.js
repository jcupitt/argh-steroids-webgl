/* Audio sprite class.
 *
 * Many platforms, including most mobile ones, take a long time to make a new
 * Audio() object, and will junk the object as soon as the audio has finished
 * playing. 
 *
 * To make sounds happen instantly, you have to load the audio, start playing,
 * then immediately pause. This class plays sections from a sound file.
 */

'use strict';

/* @timing is the timing data for the audio in this URL, something like:
 *
 * {
 *   meow1: {
 *     volume: 0.3,
 *     start: 0,
 *     length: 1.1
 *   },
 *   meow2: {
 *     volume: 0.8,
 *     start: 1.3,
 *     length: 1.1
 *   },
 */
var AudioSprite = function (world, url, timing) {
    this.world = world;
    this.url = url;
    this.timing = timing;
    this.current = {};

    this.audio = new Audio(url);
    this.audio.addEventListener('timeupdate', 
        this.onTimeUpdate.bind(this), false);
};

AudioSprite.prototype.constructor = AudioSprite;

AudioSprite.prototype.onTimeUpdate = function () {
    if (this.current &&
        this.audio.currentTime >= this.current.start + this.current.length) {
        this.audio.pause();
        this.current = {};
    }
};

AudioSprite.prototype.play = function (effect, volume) {
    if (this.timing[effect] && this.timing[effect].length) {
        this.current = this.timing[effect];
        this.audio.currentTime = this.current.start;

        if (typeof volume !== 'undefined') {
            this.audio.volume = volume;
        }
        else if (this.current.volume) {
            this.audio.volume = this.current.volume;
        }
        else {
            this.audio.volume = 1.0;
        }

        if (this.world.audio_on) {
            this.audio.play();
        }
    }
};

