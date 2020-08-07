/* The player's ship.
 */

'use strict';

var shipBuffers = [];

function shipCreate() {
    var vertices = [[1, 0],
                    [Math.cos(rad(140)), Math.sin(rad(140))],
                    [-0.3, 0],
                    [Math.cos(rad(220)), Math.sin(rad(220))]]

    shipBuffers.push(buffersCreate(vertices));

    var shield = [];
    for (var i = 0; i < 5; i++) {
        shield.push([Math.cos(rad(i * 360 / 5 - 15)), 
                     Math.sin(rad(i * 360 / 5 - 15))]);
        shield.push([Math.cos(rad(i * 360 / 5 + 15)), 
                     Math.sin(rad(i * 360 / 5 + 15))]);
    }

    shipBuffers.push(buffersCreateDiscontinuous(shield));
}

var Ship = function (world) {
    Sprite.call(this, world);

    this.buffers = shipBuffers[0];
    this.x = world.width / 2; 
    this.y = world.height / 2;

    this.scale = 10;
    this.life = 100;
    this.scale = 5;
    this.reload_timer = 0;
    this.regenerate_timer = 0;
    this.jet_timer = 1;
    this.max_shields = 3;
    this.shields = this.max_shields;
    this.shield_tick = 0;

    this.engine_audio = new Audio("media/starship_engine.mp3");
    this.engine_audio.volume = 1.0;
    this.engine_audio.loop = true;

    this.audio_sprite = new AudioSprite(this.world, "media/ship_sounds.mp3", {
        lose_bar: {
            volume: 0.8,
            start: 0.0,
            length: 2.3
        },
        gain_bar: {
            volume: 0.3,
            start: 2.5,
            length: 2.5
        },
        shot: {
            volume: 0.9,
            start: 5.2,
            length: 0.5
        }
    });
}

Ship.prototype = Object.create(Sprite.prototype); 
Ship.prototype.constructor = Ship;

Ship.prototype.rotate_by = function (angle) {
    var world = this.world;
    var dt = world.dt;

    this.angle += dt * angle;
    this.angle = wrap_around(this.angle, 360);
}

Ship.prototype.rotate_to = function (angle) {
    this.angle = wrap_around(angle, 360);
}

Ship.prototype.thrust = function () {
    var world = this.world;
    var dt = world.dt;
    var power = 0.02;

    this.u += dt * power * Math.cos(rad(this.angle));
    this.v += dt * power * Math.sin(rad(this.angle));

    this.jet_timer -= dt;
    if (this.jet_timer < 0) { 
        this.world.particles.jet(this.x, this.y, this.u, this.v, this.angle);
        this.jet_timer = 1;
    }

    if (world.audio_on) {
        this.engine_audio.play();
    }
}

Ship.prototype.no_thrust = function () {
    this.engine_audio.pause();
}

Ship.prototype.fire = function () {
    if (this.reload_timer <= 0) { 
        var u = Math.cos(rad(this.angle));
        var v = Math.sin(rad(this.angle));

        var bullet = new Bullet(self.world);
        bullet.x = this.x + u * this.scale;
        bullet.y = this.y + v * this.scale;
        bullet.u = this.u + u * 7.0;
        bullet.v = this.v + v * 7.0;
        bullet.angle = this.angle;
        this.reload_timer = 10;
        this.audio_sprite.play("shot"); 
    }
}

Ship.prototype.reload = function () {
    this.reload_timer = 0;
}

Ship.prototype.update = function () {
    this.reload_timer -= world.dt;
    this.shield_tick += world.dt;

    this.regenerate_timer -= world.dt;
    if (this.regenerate_timer < 0 && this.shields < this.max_shields) {
        this.regenerate_timer = 500;
        this.shields += 1;
        this.audio_sprite.play("get_bar"); 
    }

    Sprite.prototype.update.call(this);
}

Ship.prototype.terminate = function () {
    if (!this.kill) { 
        this.kill = true;
    }
}

Ship.prototype.impact = function (other) {
    if (other instanceof Alien || other instanceof Asteroid) {
        this.world.particles.sparks(this.x, this.y, this.u, this.v);
        this.shields -= 1;
        this.regenerate_timer = 1000;
        this.audio_sprite.play("lose_bar"); 

        if (this.shields < 0) { 
            this.terminate();
            this.world.particles.explosion2(this.x, this.y, this.u, this.v);
        }
    }

    Sprite.prototype.impact.call(this, other);
}

Ship.prototype.draw_at = function (x, y) {
    Sprite.prototype.draw_at.call(this, x, y);

    for (var i = 0; i < Math.max(0, this.shields); i++) {
        var radius = 1.7 + i * 0.7;
        var angle = ((i & 1) * 2 - 1) * this.shield_tick;

        mvPushMatrix();

        mat4.scale(mvMatrix, [radius, radius, 1]);
        mat4.rotate(mvMatrix, rad(angle), [0, 0, 1]);
        setMatrixUniforms();

        buffersDrawDiscontinuous(shipBuffers[1]);

        mvPopMatrix();
    }
}

