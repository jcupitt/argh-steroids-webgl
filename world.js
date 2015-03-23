/* World object. We have one of these: it runs the world state.
 */

'use strict';

var updateSizes = function(canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;

    canvas.world.width = gl.viewportWidth;
    canvas.world.height = gl.viewportHeight;
};

var World = function(canvas) {
    this.canvas = canvas;
    // makes it easy to get to the world back again
    canvas.world = this;

    // orientationchange signals the start of a rotate event on a tablet ...
    // delay responding to a resize event for a loooong time if we see one of
    // these
    canvas.world.in_orientation_change = false;
    window.addEventListener('orientationchange', function() {
        canvas.world.in_orientation_change = true;
        setTimeout(function() { 
            canvas.world.in_orientation_change = false;
        }, 1000);
    });

    this.resize_handler_id = null;
    window.addEventListener('resize', function() {
        // we need to throttle resizes ... they can be issued very
        // frequently 
        if (canvas.world.resize_handler_id) {
            clearTimeout(canvas.world.resize_handler_id);
            canvas.world.resize_handler_id = null;
        }

        var timeout = 100;
        if (canvas.world.in_orientation_change) {
            timeout = 1000;
        }
        canvas.world.resize_handler_id = setTimeout(function() { 
            World.prototype.resize.call(canvas.world);
        }, timeout);
    });

    updateSizes(canvas);

    this.particles = new Particles(this);

    this.reset();
}

World.prototype.constructor = World;

World.prototype.resize = function() {
    if (!this.resize_handler_id) {
        return;
    }
    this.resize_handler_id = null;

    updateSizes(this.canvas);
    this.particles.reset();
    this.particles.starfield();

    // ugly! during the startscreen we want to be able to spot resize and
    // relayout the text ... offer this callback for that
    if (this.resize_handler) {
        this.resize_handler();
    }
};

World.prototype.reset = function() {
    this.sprites = [];
    this.score = 0;
    this.level = 1;
    this.n_asteroids = 0;
    this.player = null;
    this.fps_start_time = 0;
    this.fps_count = 0;
    this.fps_current = 0;
    this.text_y = this.height - 100;
    this.alien_time = randint(1000, 2000)
    this.particles.reset();

    // note t0, handy to keep tick numbers comprehensible
    this.t0 = new Date().getTime();

    this.ticks = 0;
    this.dt = 0;
    this.last_time = 0;
}

World.prototype.n_objects = function() {
    return this.sprites.length;
}

World.prototype.add = function(sprite) {
    this.sprites.push(sprite);
}

World.prototype.add_player = function() {
    if (!this.player) {
        this.player = new Ship(this);
    }
}

World.prototype.terminate_asteroids = function() {
    this.sprites.forEach (function(sprite) { 
        if (sprite instanceof Asteroid) {
            sprite.terminate();
        }
    });
}

World.prototype.add_text = function(string, scale) {
    scale = typeof scale !== 'undefined' ? scale : 10;

    text_add(this, string, this.width / 2, this.text_y, scale);
    this.text_y -= scale + 50;
}

World.prototype.update = function() {
    var time_now = new Date().getTime() - this.t0;

    if (this.last_time != 0) {
        var time_elapsed = time_now - this.last_time;

        this.dt = time_elapsed / (1000.0 / 60);

        if (Key.isDown(Key.P)) {
            this.dt *= 0.1;
        }

        this.ticks += this.dt;
    }
    this.last_time = time_now;

    this.fps_count += 1;
    if (time_now - this.fps_start_time > 1000) {
        this.fps_start_time = time_now;
        this.fps_current = this.fps_count;
        this.fps_count = 0;
    }

    var movement = Mouse.getMovement();
    var rotate_by = -movement[0] / 5;

    if (Key.isDown(Key.LEFT)) {
        rotate_by += 2;
    }
    if (Key.isDown(Key.RIGHT)) {
        rotate_by -= 2;
    }

    if (this.player) {
        this.player.rotate_by(rotate_by);
        if (Key.isDown(Key.SPACE) || Mouse.isDown(Mouse.LEFT)) {
            this.player.fire();
        }
        if (Key.isDown(Key.UP) || Mouse.isDown(Mouse.RIGHT)) {
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
        // wrap_around() just in case the sprite is outside screenspace 
        var x = wrap_around((sprite.x / map_spacing) | 0, map_width);
        var y = wrap_around((sprite.y / map_spacing) | 0, map_height);

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
    mat4.translate(mvMatrix, [0, 0, -1]);

    setShaderProgram(shaderPrograms[1]);
    this.sprites.forEach (function(sprite) { 
        mvPushMatrix();
        sprite.draw();
        mvPopMatrix();
    });

    setShaderProgram(shaderPrograms[0]);
    this.particles.draw(); 

    // back into vector mode for any extra lettering
    setShaderProgram(shaderPrograms[1]);
}

World.prototype.draw_hud = function() {
    text_draw_immediate("SCORE " + this.score, 
                        20, world.height - 20, 10, 0, false);
    text_draw_immediate("LEVEL " + this.level, 
                        20, world.height - 40, 10, 0, false);
}

World.prototype.draw_info = function() {
    text_draw_immediate("FPS " + this.fps_current, 
                        20, 20, 10, 0, false);
    text_draw_immediate("OBJECTS " + world.n_objects(), 
                        20, 40, 10, 0, false);
    text_draw_immediate("PARTICLES " + world.particles.n_particles(), 
                        20, 60, 10, 0, false);
}
