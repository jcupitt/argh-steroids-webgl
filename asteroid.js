/* Asteroid object.
 */

// We make a few random asteroid models at startup and reuse them during the
// game
var asteroidBuffers = [];

function asteroidsCreate() {
    var i = 0;
    var j = 0;

    for (i = 0; i < 10; i++) {
        var vertices = [];
        var index = [];
        var n_points = 20

        for (j = 0; j < n_points; j++) {
            var delta = 360 / n_points;
            var angle = j * 360 / n_points + randint(-delta / 2, delta / 2);
            var distance = Math.random() / 4.0 + 0.75;

            vertices = vertices.concat([
                distance * Math.cos(rad(angle)), 
                distance * Math.sin(rad(angle)), 
                0
            ]);
            index.push(j);
        }

        var vertex_buffer = 
            createBuffer(gl.ARRAY_BUFFER, new Float32Array(vertices));
        vertex_buffer.itemSize = 3;
        vertex_buffer.numItems = n_points;

        var index_buffer = 
            createBuffer(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(index));
        index_buffer.itemSize = 1;
        index_buffer.numItems = n_points;

        asteroidBuffers.push([vertex_buffer, index_buffer]);
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
        this.y = randint(0, 1) * world.height;
    }
    else {
        this.x = randint(0, 1) * world.width;
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
