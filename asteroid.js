/* Asteroid object.
 */

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
                distance * Math.sin(rad(angle)), 
            ]);
        }

        asteroidBuffers.push(buffersCreate(vertices));
    }
}

var Asteroid = function(world, scale, max_speed) {
    Sprite.call(this, world);

    this.scale = scale;
    this.max_speed = max_speed;
    this.buffers = asteroidBuffers[randint(0, asteroidBuffers.length - 1)];

    // spawn on a screen edge
    if (randint(0, 1) == 0) {
        this.x = randint(0, world.width);
        this.y = randint(0, 1) * (world.height - 1);
    }
    else {
        this.x = randint(0, 1) * (world.width - 1);
        this.y = randint(0, world.height);
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

Asteroid.prototype.update = function() {
    var world = this.world;
    var dt = world.dt;

    this.angle = wrap_around(this.angle + dt * this.angular_velocity, 360);

    Sprite.prototype.update.call(this);
};
