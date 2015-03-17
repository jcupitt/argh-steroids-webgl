/* World object. We have one of these: it runs the world state.
 */

'use strict';

var updateSizes = function(canvas) {
    var viewportSize = {
        height: window.innerHeight,
        width:  window.innerWidth
    };

    canvas.width = viewportSize.width
    canvas.height = viewportSize.height

    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;

    canvas.world.width = gl.viewportWidth;
    canvas.world.height = gl.viewportHeight;
};

var World = function(canvas) {
    this.canvas = canvas;
    // makes it easy to get to the world back again
    canvas.world = this;

    window.addEventListener('resize', function() {
        updateSizes(canvas);
        canvas.world.particles.reset();
        canvas.world.particles.starfield();
    });
    updateSizes(canvas);

    this.sprites = [];
    this.n_asteroids = 0;
    this.last_time = 0;

    // number of frames since last update, can be fractional ... scale speed
    // etc. by this
    this.dt = 1;

    // next alien timer
    this.alien_time = randint(1000, 2000)

    // the player's ship, or null for no player on screen
    this.player = null;

    this.particles = new Particles(this);
};

World.prototype.add = function(sprite) {
    this.sprites.push(sprite);
}

World.prototype.add_player = function() {
    if (!this.player) {
        this.player = new Ship(this);
    }
}

World.prototype.update = function() {
    var time_now = new Date().getTime();

    if (this.last_time != 0) {
        var time_elapsed = time_now - this.last_time;

        this.delta_time = time_elapsed / (1000.0 / 60);
    }
    this.last_time = time_now;

    var movement = Mouse.getMovement();
    var rotate_by = -movement[0] / 5;

    if (Key.isDown(Key.LEFT)) {
        rotate_by += 3;
    }
    if (Key.isDown(Key.RIGHT)) {
        rotate_by -= 3;
    }

    if (this.player) {
        this.player.rotate_by(rotate_by);
        if (Key.isDown(Key.SPACE) || Mouse.isDown[Mouse.LEFT]) {
            this.player.fire();
        }
        if (Key.isDown(Key.UP) || Mouse.isDown[Mouse.RIGHT]) {
            this.player.thrust();
        }
    }

    this.alien_time -= 1;
    if (this.alien_time < 0) {
        this.alien_time = randint(1000, 2000);
        new Alien(this);
    }

    this.sprites.forEach (function(sprite) { 
        sprite.update();
    });

    if (this.player && this.player.kill) {
        this.player = null;
    }
    this.sprites = this.sprites.filter(function(sprite) {
        return !sprite.kill;
    });

    var map_spacing = 100;
    var map_width = Math.ceil(this.width / map_spacing);
    var map_height = Math.ceil(this.height / map_spacing);

    var world_map = new Array(map_width);
    for (var x = 0; x < map_width; x++) {
        world_map[x] = new Array(map_height);
        for (var y = 0; y < map_height; y++) {
            world_map[x][y] = [];
        }
    }

    this.sprites.forEach (function(sprite) { 
        sprite.tested_collision = false;

        var x = (sprite.x / map_spacing) | 0;
        var y = (sprite.y / map_spacing) | 0;

        for (var a = x - 1; a <= x + 1; a++ ) {
            for (var b = y - 1; b <= y + 1; b++ ) {
                var map_x = wrap_around(a, map_width);
                var map_y = wrap_around(b, map_height);

                world_map[map_x][map_y].push(sprite);
            }
        }
    });

    this.sprites.forEach (function(sprite) { 
        var x = (sprite.x / map_spacing) | 0;
        var y = (sprite.y / map_spacing) | 0;

        sprite.test_collisions(world_map[x][y]);

        // now we've tested sprite against everything it could possibly touch, 
        // we no longer need to test anything against sprite
        sprite.tested_collision = true;
    });

    this.particles.update(); 
}

World.prototype.draw = function() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.ortho(0, gl.viewportWidth, 0, gl.viewportHeight, 0.1, 100, pMatrix);
    mat4.identity(mvMatrix);
    mat4.translate(mvMatrix, [0, 0, -1]);

    setShaderProgram(shaderPrograms[0]);
    gl.enableVertexAttribArray(currentProgram.vertexColorAttribute);
    this.particles.draw(); 
    gl.disableVertexAttribArray(currentProgram.vertexColorAttribute);

    setShaderProgram(shaderPrograms[1]);

    this.sprites.forEach (function(sprite) { 
        mvPushMatrix();
        sprite.draw();
        mvPopMatrix();
    });
}


