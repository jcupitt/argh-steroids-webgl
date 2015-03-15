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
                -7
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
    this.world = world;
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
    world.add(this);
};

// for clock-style arithmetic
function wrap_around(x, limit) {
    if (x > limit) {
        return x - limit;
    }
    else if (x < 0) {
        return x + limit;
    }
    else
        return x;
}

Asteroid.prototype.update = function() {
    var world = this.world;
    var dt = world.dt;

    this.x = wrap_around(this.x + dt * this.u, world.width);
    this.y = wrap_around(this.y + dt * this.v, world.height);
    this.angle = wrap_around(this.angle + dt * this.angular_velocity, 360);
};

function draw_asteroid_at(asteroid, x, y) {
    mat4.translate(mvMatrix, [x, y, 0]);
    mat4.scale(mvMatrix, [asteroid.scale, asteroid.scale, 1]);
    mat4.rotate(mvMatrix, rad(asteroid.angle), [0, 0, 1]);

    gl.bindBuffer(gl.ARRAY_BUFFER, asteroid.buffers[0]);
    gl.vertexAttribPointer(currentProgram.vertexPositionAttribute, 
            asteroid.buffers[0].itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, asteroid.buffers[1]);
    setMatrixUniforms();
    gl.drawElements(gl.LINE_LOOP, 
            asteroid.buffers[1].numItems, gl.UNSIGNED_SHORT, 0);
};

Asteroid.prototype.draw = function() {
    mvPushMatrix();
    draw_asteroid_at(this, this.x, this.y);
    mvPopMatrix();

    // if we're near the left edge, draw again on the right
    if (this.x < this.scale) {
        mvPushMatrix();
        draw_asteroid_at(this, this.x + world.width, this.y);
        mvPopMatrix();
    }
    else if (this.x > this.world.width - this.scale) {
        mvPushMatrix();
        draw_asteroid_at(this, this.x - world.width, this.y);
        mvPopMatrix();
    }

    if (this.y < this.scale) {
        mvPushMatrix();
        draw_asteroid_at(this, this.x, this.y + world.height);
        mvPopMatrix();
    }
    else if (this.y > this.world.height - this.scale) {
        mvPushMatrix();
        draw_asteroid_at(this, this.x, this.y - world.height);
        mvPopMatrix();
    }

    // could add another case or the corner, but why bother

};


