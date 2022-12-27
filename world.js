/* World object. We have one of these: it runs the world state.
 */

'use strict';

var updateSizes = function (canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;

    canvas.world.width = gl.viewportWidth;
    canvas.world.height = gl.viewportHeight;
};

var World = function (canvas) {
    this.canvas = canvas;
    // makes it easy to get the world back again
    canvas.world = this;

    this.resize_handler_id = null;
    window.addEventListener('resize', function () {
        // we need to throttle resizes ... they can be issued very
        // frequently 
        //
        // on a tablet you get a resize at the start of orientation change, so
        // we need to wait for that animation to finish
        if (canvas.world.resize_handler_id) {
            clearTimeout(canvas.world.resize_handler_id);
            canvas.world.resize_handler_id = null;
        }

        canvas.world.resize_handler_id = setTimeout(function () { 
            World.prototype.resize.call(canvas.world);
        }, 1000);
    });

    updateSizes(canvas);

    this.music = new Audio('media/hoarse_space_cadet.mp3');
    this.music.loop = true;
    this.audio_on = false;

    this.camera_x = 0;
    this.camera_dx = 0;
    this.camera_y = 0;
    this.camera_dy = 0;

    this.particles = new Particles(this);

    this.G = 0.001;

    this.reset();
}

World.prototype.constructor = World;

World.prototype.setAudio = function (audio_on) {
    this.audio_on = audio_on;

    if (this.audio_on) {
        this.music.play();
    }
    else {
        this.music.pause();
    }

    this.sprites.forEach(function (sprite) { 
        sprite.setAudio(audio_on);
    });
};

World.prototype.sound = function (event) {
    var dx = (this.width - 50) - event.clientX;
    var dy = 50 - (this.height - event.clientY);
    var d = Math.sqrt(dx * dx + dy * dy);

    if (d < 50) {
        this.setAudio(!this.audio_on); 
    }
}

World.prototype.resize = function () {
    if (!this.resize_handler_id) {
        return;
    }
    this.resize_handler_id = null;

    updateSizes(this.canvas);

    // ugly! during the startscreen we want to be able to spot resize and
    // relayout the text ... offer this callback for that
    if (this.resize_handler) {
        this.resize_handler();
    }
    else {
        // just do the minimum
        this.particles.reset();
        this.particles.starfield();
    }
};

World.prototype.reset = function () {
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

World.prototype.n_objects = function () {
    return this.sprites.length;
}

World.prototype.add = function (sprite) {
    this.sprites.push(sprite);
}

World.prototype.add_player = function () {
    if (!this.player) {
        this.player = new Ship(this);
    }
}

World.prototype.terminate_asteroids = function () {
    this.sprites.forEach (function (sprite) { 
        if (sprite instanceof Asteroid) {
            sprite.terminate();
        }
    });
}

World.prototype.add_text = function (string, scale) {
    scale = typeof scale !== 'undefined' ? scale : 10;

    text_add(this, string, this.width / 2, this.text_y, scale);
    this.text_y -= scale + 50;
}

World.prototype.update = function () {
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

    if (this.player) {
        var movement = Mouse.getMovement();
        var rotate_by = -movement[0] / 5;

        var has_thrusted = false;

        if (Key.isDown(Key.LEFT)) {
            rotate_by += 2;
        }
        if (Key.isDown(Key.RIGHT)) {
            rotate_by -= 2;
        }
        this.player.rotate_by(rotate_by);

        if (Key.isDown(Key.SPACE) || 
            Key.isDown(Key.ENTER) || 
            Mouse.isDown(Mouse.LEFT)) {
            this.player.fire();
        }

        if (Key.isDown(Key.UP) || 
            Mouse.isDown(Mouse.RIGHT)) {
            this.player.thrust();
            has_thrusted = true;
        }

        var tap = Touch.getTap();
        if (tap) {
            // ship xy in display coordinates
            var x = wrap_around(this.player.x - world.camera_x, world.width);
            var y = wrap_around(this.player.y - world.camera_y, world.height);

            // vector to player
            var dx = tap.x - x;
            var dy = (this.height - tap.y) - y;
            var angle = rect_to_polar(dx, dy);

            this.player.rotate_to(angle);
            this.player.reload();
            this.player.fire();
        }

        var hold = Touch.getHold();
        if (hold) {
            // ship xy in display coordinates
            var x = wrap_around(this.player.x - world.camera_x, world.width);
            var y = wrap_around(this.player.y - world.camera_y, world.height);

            // vector to player
            var dx = hold.x - x;
            var dy = (this.height - hold.y) - y;
            var angle = rect_to_polar(dx, dy);

            this.player.rotate_to(angle);
            this.player.thrust();
            has_thrusted = true;
        }
     
        if (!has_thrusted) {
            this.player.no_thrust();
        }

        /* Useful for testing.
        var click = Mouse.getClick();
        if (click) {
            var dx = click.x - this.player.x;
            var dy = (this.height - click.y) - this.player.y;
            var angle = rect_to_polar(dx, dy);

            this.player.rotate_to(angle);
            this.player.reload();
            this.player.fire();
        }
         */
    }

    this.alien_time -= 1;
    if (this.alien_time < 0) {
        this.alien_time = randint(1000, 2000);
        new Alien(this);
    }

    this.sprites.forEach (function (sprite) { 
        sprite.update();
    });

    if (this.player && this.player.kill) {
        this.player = null;
    }
    this.sprites = this.sprites.filter(function (sprite) {
        return !sprite.kill;
    });

    /* Cells in the map need to be at least 100x100 (the size of the largest
     * asteroid).
     */
    var map = new Map(this, 100);

    this.sprites.forEach (function (sprite) { 
        sprite.tested_collision = false;
    });
    this.sprites.forEach (function (sprite) { 
        map.nearby(sprite, 100, function (other) {
            if (!other.tested_collision) {
                sprite.test_collision(other);
            }
        });

        // now we've tested sprite against everything it could possibly 
        // touch, we no longer need to test anything against sprite
        sprite.tested_collision = true;
    });

    /* Gravity, sort-of.
     */
    this.sprites.forEach (function (sprite) { 
        map.nearby(sprite, 200, function (other) {
            var dx = sprite.x - other.x;
            var dy = sprite.y - other.y;
            var d = Math.sqrt(dx * dx + dy * dy);

            /// avoid /0 issues
            if (d > 5) {
                var f = world.G * sprite.mass * other.mass / d;
                var du = f * dx / d;
                var dv = f * dy / d;

                sprite.u -= du;
                sprite.v -= dv;
            }
        });
    });

    if (this.player) {
        // target x/y for the screen 
        var target_x = this.player.x - this.width / 2;
        var target_y = this.player.y - this.height / 2;

        // vector to target, accounting for wrap-around
        var vector_x = target_x - this.camera_x;
        vector_x = wrap_around(vector_x + this.width / 2, this.width) - 
            this.width / 2;
        var vector_y = target_y - this.camera_y;
        vector_y = wrap_around(vector_y + this.height / 2, this.height) - 
            this.height / 2;

        // accelerate gently towards the target
        this.camera_dx += vector_x * 0.2;
        this.camera_dy += vector_y * 0.2;

        // and damp
        this.camera_dx *= 0.2;
        this.camera_dy *= 0.2;
    }

    this.camera_x += this.camera_dx * this.dt;
    this.camera_y += this.camera_dy * this.dt;

}

World.prototype.draw = function () {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.ortho(0, gl.viewportWidth, 0, gl.viewportHeight, 0.1, 100, pMatrix);
    mat4.identity(mvMatrix);
    mat4.translate(mvMatrix, [0, 0, -1]);

    setShaderProgram(shaderPrograms[1]);
    this.sprites.forEach (function (sprite) { 
        mvPushMatrix();
        sprite.draw();
        mvPopMatrix();
    });

    setShaderProgram(shaderPrograms[0]);
    this.particles.draw(); 

    // back into vector mode for any extra lettering
    setShaderProgram(shaderPrograms[1]);

    var music_angle = 0;
    var music_scale = 30;
    if (this.audio_on) {
        music_angle = this.ticks;
        music_scale = 30 - wrap_around(0.2 * this.ticks, 10);
    }
    text_draw_immediate("m", 
                        this.width - 70, 70,
                        music_scale, music_angle, false); 
}

World.prototype.draw_hud = function () {
    text_draw_immediate("SCORE " + this.score, 
                        20, world.height - 20, 10, 0, false);
    text_draw_immediate("LEVEL " + this.level, 
                        20, world.height - 40, 10, 0, false);
}

World.prototype.draw_info = function () {
    text_draw_immediate("FPS " + this.fps_current, 
                        20, 20, 10, 0, false);
    text_draw_immediate("OBJECTS " + world.n_objects(), 
                        20, 40, 10, 0, false);
    text_draw_immediate("PARTICLES " + world.particles.n_particles(), 
                        20, 60, 10, 0, false);
}
