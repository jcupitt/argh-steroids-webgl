/* World object. We have one of these: it runs the world state.
 */

var World = function() {
    this.sprites = [];
    this.n_asteroids = 0;
    this.width = gl.viewportWidth;
    this.height = gl.viewportHeight;
    this.last_time = 0;

    // number of frames since last update, can be fractional ... scale speed
    // etc. by this
    this.dt = 1;
};

World.prototype.add = function(sprite) {
    this.sprites.push(sprite);
}

World.prototype.update = function() {
    var time_now = new Date().getTime();

    if (this.last_time != 0) {
        var time_elapsed = time_now - this.last_time;

        this.delta_time = time_elapsed / (1000.0 / 60);
    }
    this.last_time = time_now;

    this.sprites.forEach (function(sprite) { 
        sprite.update();
    });

    var map_spacing = 100;
    var map_width = Math.ceil(this.width / map_spacing);
    var map_height = Math.ceil(this.height / map_spacing);

    world_map = new Array(map_width);
    for (var x = 0; x < map_width; x++) {
        world_map[x] = new Array(map_height);
        for (var y = 0; y < map_height; y++) {
            world_map[x][y] = [];
        }
    }

    this.sprites.forEach (function(sprite) { 
        sprite.tested_collision = false

        var x = Math.floor(sprite.x / map_spacing)
        var y = Math.floor(sprite.y / map_spacing)

        for (var a = x - 1; a <= x + 1; a++ ) {
            for (var b = y - 1; b <= y + 1; b++ ) {
                var map_x = wrap_around(a, map_width);
                var map_y = wrap_around(b, map_height);

                world_map[map_x][map_y].push(sprite);
            }
        }
    });

    this.sprites.forEach (function(sprite) { 
        var x = Math.floor(sprite.x / map_spacing);
        var y = Math.floor(sprite.y / map_spacing);

        sprite.test_collisions(world_map[x][y]);

        // now we've tested sprite against everything it could possibly touch, 
        // we no longer need to test anything against sprite
        sprite.tested_collision = true;
    });
}

World.prototype.draw = function() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.ortho(0, gl.viewportWidth, 0, gl.viewportHeight, 0.1, 100, pMatrix);
    mat4.identity(mvMatrix);

    this.sprites.forEach (function(sprite) { 
        mvPushMatrix();
        sprite.draw();
        mvPopMatrix();
    });
}


