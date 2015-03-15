/* Allen the alien.
 */

var alienBuffers = [];

function alienCreate() {
    var vertices = [[1, 0, 0], [-1, 0, 0], [-0.7, 0, 0],
                    [-0.5, 0.2, 0], [0.5, 0.2, 0],
                    [0.7, 0, 0],
                    [0.5, -0.4, 0], [-0.5, -0.4, 0],
                    [-0.7, 0, 0]];

    var index = []
    for (var j = 0; j < vertices.length; j++) {
        index.push(j);
    }

    var vertex_buffer = 
        createBuffer(gl.ARRAY_BUFFER, new Float32Array(vertices));
    vertex_buffer.itemSize = 3;
    vertex_buffer.numItems = vertices.length;

    var index_buffer = 
        createBuffer(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(index));
    index_buffer.itemSize = 1;
    index_buffer.numItems = vertices.length;

    alienBuffers = [vertex_buffer, index_buffer];
}

var Alien = function(world) {
    Sprite.call(this, world);

    //this.buffers = asteroidBuffers[0];
    this.buffers = alienBuffers;
    this.direction = randint(1, 2) * 2 - 3;
    this.x = world.width / 2 - this.direction * world.width / 2;
    this.y = randint(0, world.height);
    this.angle = 0;
    this.scale = 10;
    this.direction_timer = randint(10, 50);
    this.random_velocity();
}

Alien.prototype = Object.create(Sprite.prototype); 
Alien.prototype.constructor = Alien;

Alien.prototype.random_velocity = function() {
    this.u = this.direction * (Math.random() * 2 + 1);
    this.v = Math.random() * 6 - 3;
}

Alien.prototype.update = function() {
    this.direction_timer -= 1;
    if (this.direction_timer < 0) {
        this.direction_timer = randint(10, 50);
        this.random_velocity();
    }

    if (this.angle > 0) {
        this.angle -= 1;
    }
    else if (this.angle < 0) {
        this.angle += 1;
    }

    if (this.direction == 1 && this.x > this.world.width - 10) {
        this.kill = true;
    }
    else if (this.direction == -1 && this.x < 10) {
        this.kill = true;
    }

    Sprite.prototype.update.call(this);
}

Alien.prototype.impact = function(other) {
    this.angle = randint(-90, 90);

    Sprite.prototype.update.call(this, other);
}

