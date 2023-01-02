/* Asteroid object.
 */

'use strict';

// We make a few random asteroid models at startup and reuse them during the
// game
var asteroidBuffers = [];

function asteroidsCreate() {
    for (var i = 0; i < 10; i++) {
        var vertices = [];
        var n_points = randint(10, 20);

        for (var j = 0; j < n_points; j++) {
            var delta = 360 / n_points;
            var angle = j * 360 / n_points + randint(-delta / 2, delta / 2);
            var distance = Math.random() / 4.0 + 0.75;

            vertices.push([
                distance * Math.cos(rad(angle)), 
                distance * Math.sin(rad(angle))
            ]);
        }

        asteroidBuffers.push(buffersCreate(vertices));
    }
}

var Asteroid = function (world, scale, max_speed) {
    Sprite.call(this, world);

    this.scale = scale;
    this.mass = scale * scale;
    this.max_speed = max_speed;
    this.buffers = asteroidBuffers[randint(0, asteroidBuffers.length - 1)];

    // spawn on a screen edge
    if (randint(0, 1) == 0) {
        this.x = randint(0, world.width) + world.camera_x;
        this.y = randint(0, 1) * (world.height - 1) + world.camera_y;
    }
    else {
        this.x = randint(0, 1) * (world.width - 1) + world.camera_x;
        this.y = randint(0, world.height) + world.camera_y;
    }

    // random speed
    this.u = Math.random() * max_speed * 2 - max_speed;
    this.v = Math.random() * max_speed * 2 - max_speed;

    this.angle = 0;
    this.angular_velocity = Math.random() * 4 - 2;

    world.n_asteroids += 1;
};

Asteroid.prototype = Object.create(Sprite.prototype); 
Asteroid.prototype.constructor = Asteroid;

Asteroid.prototype.terminate = function () {
    if (!this.kill) { 
        this.kill = true;
        this.world.n_asteroids -= 1;
        this.world.particles.explosion(this.scale, 
                                       this.x, this.y, 
                                       this.u / 2, this.v / 2);

        if (this.scale > 15) { 
            var n_fragments = 
                randint(2, Math.max(2, Math.min(5, this.scale / 5)));
            var new_scale = this.scale / n_fragments;
            var delta = 360 / n_fragments;

            for (var i = 0; i < n_fragments; i++) {
                var angle = i * delta;
                var u = Math.cos(rad(angle));
                var v = Math.sin(rad(angle));

                var new_asteroid = new Asteroid(this.world, new_scale, 1);
                new_asteroid.x = this.x + 1.5 * u * new_scale;
                new_asteroid.y = this.y + 1.5 * v * new_scale;
                new_asteroid.u = -2 * u + this.u;
                new_asteroid.v = -2 * v + this.v;
            }
        }
    }
};

Asteroid.prototype.update = function () {
    var world = this.world;
    var dt = world.dt;

    // scale angular_velocity by speed, so slower asteroids spin more slowly
    var speed = this.u * this.u + this.v * this.v;
    var angular_velocity = 0.1 * speed * this.angular_velocity;
    this.angle = wrap_around(this.angle + dt * angular_velocity, 360);

    Sprite.prototype.update.call(this);
};

Asteroid.prototype.impact = function (other) {
    if (other instanceof Asteroid) {
        var angular_velocity = other.angular_velocity;
        other.angular_velocity = this.angular_velocity;
        this.angular_velocity = angular_velocity;
    }

    Sprite.prototype.impact.call(this, other);
}
