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
            var n = randint(2, Math.max(2, Math.min(5, this.scale / 5)));

            for (var i = 0; i < n; i++) {
                var new_asteroid = new Asteroid(this.world, this.scale / n, 1);
                new_asteroid.x = this.x;
                new_asteroid.y = this.y;
                new_asteroid.u += this.u;
                new_asteroid.v += this.v;
            }
        }
    }
};

Asteroid.prototype.update = function () {
    var world = this.world;
    var dt = world.dt;

    this.angle = wrap_around(this.angle + dt * this.angular_velocity, 360);

    Sprite.prototype.update.call(this);
};

Asteroid.prototype.collide = function (other) {
    if (other instanceof Asteroid) {
        var angular_velocity = other.angular_velocity;
        other.angular_velocity = this.angular_velocity;
        this.angular_velocity = angular_velocity;

        // calculate point of impact for sparks
        var dx = this.x - other.x;
        var dy = this.y - other.y;
        var d2 = dx * dx + dy * dy;
        var d = Math.sqrt(d2);
        if (d == 0) {
            d = 0.0001;
        }
        var u = dx / d;
        var v = dy / d;
        var impact_x = other.x + u * other.scale;
        var impact_y = other.y + v * other.scale;
        this.world.particles.sparks(impact_x, impact_y, other.u, other.v);
    }

    Sprite.prototype.collide.call(this, other);
}
