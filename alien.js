/* Allen the alien.
 */

'use strict';

var alienBuffers = [];

function alienCreate() {
    var vertices = [[1, 0], [-1, 0], [-0.7, 0],
                    [-0.5, -0.2], [0.5, -0.2], [0.7, 0],
                    [0.5, 0.4], [-0.5, 0.4], [-0.7, 0]];

    alienBuffers = buffersCreate(vertices);
}

var Alien = function (world) {
    Sprite.call(this, world);

    this.buffers = alienBuffers;
    this.direction = randint(1, 2) * 2 - 3;
    this.x = world.width / 2 - 
        this.direction * (world.width / 2 - 2) + world.camera_x;
    this.y = randint(0, world.height);
    this.angle = 0;
    this.scale = 10;
    this.mass = 100;
    this.direction_timer = randint(10, 50);
    this.random_velocity();

    this.audio = new Audio("media/alien_engine.mp3");
    this.audio.volume = 0.3;
    this.audio.loop = true;

    if (this.world.audio_on) {
        this.audio.play();
    }
}

Alien.prototype = Object.create(Sprite.prototype); 
Alien.prototype.constructor = Alien;

Alien.prototype.terminate = function () {
    if (!this.kill) { 
        this.kill = true;
        this.audio.pause();
    }
}

Alien.prototype.setAudio = function (audio_on) {
    if (audio_on) {
        this.audio.play();
    }
    else {
        this.audio.pause();
    }
}

Alien.prototype.random_velocity = function () {
    this.u = this.direction * (Math.random() * 2 + 1);
    this.v = Math.random() * 6 - 3;
}

Alien.prototype.update = function () {
    var dt = this.world.dt;

    this.direction_timer -= dt;
    if (this.direction_timer < 0) {
        this.direction_timer = randint(10, 50);
        this.random_velocity();
    }

    if (this.angle > 0) {
        this.angle -= dt;
    }
    else if (this.angle < 0) {
        this.angle += dt;
    }

    if (this.direction == 1 && 
        this.x - this.world.camera_x > this.world.width - 10) {
        this.terminate();
    }
    else if (this.direction == -1 && 
        this.x - this.world.camera_x < 10) {
        this.terminate();
    }

    Sprite.prototype.update.call(this);
}

Alien.prototype.impact = function (other) {
    this.angle = randint(-90, 90);
    Sprite.prototype.impact.call(this, other);
}

