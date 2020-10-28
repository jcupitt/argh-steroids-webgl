/* Sprite base class.
 */

'use strict';

var Sprite = function (world) {
    this.world = world;
    this.x = 0;
    this.y = 0;
    this.u = 0;
    this.v = 0;
    this.angle = 0;
    this.scale = 10;
    this.kill = false;
    this.tested_collision = false;

    this.world.add(this);
};

Sprite.prototype.constructor = Sprite;

Sprite.prototype.update = function () {
    var world = this.world;
    var dt = world.dt;

    this.x = wrap_around(this.x + dt * this.u, world.width);
    this.y = wrap_around(this.y + dt * this.v, world.height);
};

Sprite.prototype.setAudio = function (audio_on) {
};

Sprite.prototype.terminate = function () {
    this.kill = true;
};

// This is triggered for each object in a collision, so it's for asymmetric
// things, like something blowing up
Sprite.prototype.impact = function (other) {
};

// This is triggered once per collision, so it's for symmetric
// things, like physics
Sprite.prototype.collide = function (other) {
    var u = other.u;
    other.u = this.u;
    this.u = u;

    var v = other.v;
    other.v = this.v;
    this.v = v;
};

Sprite.prototype.test_collisions = function (possible_sprites) {
    possible_sprites.forEach (function (other) { 
        if (other != this && !other.tested_collision) {
            var world = this.world;
            var width = world.width;
            var height = world.height;

            var dx = this.x - other.x;
            var dy = this.y - other.y;

            // we need to do wrap-around testing
            //
            // we know that possible_sprites is only other sprites in the
            // immediate neighbourhood, therefore if dx > half screen width,
            // then this and other must be on opposite sides of the screen and
            // must be possibly colliding via warp-around
            //
            // in this case, notionally move down by a screen width 
            if (dx > width / 2) {
                dx -= width;
            }
            else if (dx < -width / 2) {
                dx += width;
            }

            if (dy > height / 2) {
                dy -= height;
            }
            else if (dy < -height / 2) {
                dy += height;
            }

            var d2 = dx * dx + dy * dy;
            var t = this.scale + other.scale;
            var t2 = t * t ;

            if (d2 < t2) {
                // unit vector
                var d = Math.sqrt(d2);
                if (d == 0) {
                    d = 0.0001;
                }
                var u = dx / d;
                var v = dy / d;
                
                // amount of overlap
                var overlap = d - t;

                // displace by overlap in that direction
                other.x += u * overlap;
                other.x = wrap_around(other.x, width);
                other.y += v * overlap;
                other.y = wrap_around(other.y, height);

                // tell the objects they have collided ... both objects 
                // need to be told
                this.impact(other);
                other.impact(this);

                // don't do the physics if either object is now dead
                if (!this.kill && !other.kill) {
                    this.collide(other);
                }
            }
        }
    }, this);
};

// draw in display space 
Sprite.prototype.draw_at = function (x, y) {
    mvPushMatrix();

    mat4.translate(mvMatrix, [x, y, 0]);
    mat4.scale(mvMatrix, [this.scale, this.scale, 1]);
    mat4.rotate(mvMatrix, rad(this.angle), [0, 0, 1]);
    setMatrixUniforms();

    buffersDraw(this.buffers);

    mvPopMatrix();
};

Sprite.prototype.draw = function () {
    var world = this.world;

    // to display space
    var display_x = wrap_around(this.x - world.camera_x, world.width);
    var display_y = wrap_around(this.y - world.camera_y, world.height);

    this.draw_at(display_x, display_y);

    // wrap around edges
    if (display_x > world.width - this.scale) 
        this.draw_at(display_x - world.width, display_y);
    else if (display_x < this.scale) 
        this.draw_at(display_x + world.width, display_y);

    if (display_y > world.height - this.scale) 
        this.draw_at(display_x, display_y - world.height);
    else if (display_y < this.scale) 
        this.draw_at(display_x, display_y + world.height);
};

