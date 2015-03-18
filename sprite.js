/* Sprite base class.
 */

'use strict';

var Sprite = function(world) {
    this.world = world;
    this.x = 0;
    this.y = 0;
    this.u = 0;
    this.v = 0;
    this.angle = 0;
    this.scale = 10;
    this.kill = false;
    this.tested_collision = false;

    world.add(this);
};

Sprite.prototype.constructor = Sprite;

Sprite.prototype.update = function() {
    var world = this.world;
    var dt = world.dt;

    this.x = wrap_around(this.x + dt * this.u, world.width);
    this.y = wrap_around(this.y + dt * this.v, world.height);
};

// This is triggered for each object in a collision, so it's for asymmetric
// things, like something blowing up
Sprite.prototype.impact = function(other) {
}

// This is triggered once per collision, so it's for symmetric
// things, like physics
Sprite.prototype.collide = function(other) {
    var u = other.u;
    other.u = this.u;
    this.u = u;

    var v = other.v;
    other.v = this.v;
    this.v = v;
}

Sprite.prototype.test_collisions = function(possible_sprites) {
    possible_sprites.forEach (function(other) { 
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
}

Sprite.prototype.draw_at = function(x, y) {
    mat4.translate(mvMatrix, [x, y, 0]);
    mat4.scale(mvMatrix, [this.scale, this.scale, 1]);
    mat4.rotate(mvMatrix, rad(this.angle), [0, 0, 1]);
    setMatrixUniforms();

    gl.enableVertexAttribArray(currentProgram.vertexPositionAttribute);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[0]);
    gl.vertexAttribPointer(currentProgram.vertexPositionAttribute, 
        this.buffers[0].itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers[1]);
    gl.drawElements(gl.LINE_LOOP, 
        this.buffers[1].numItems, gl.UNSIGNED_SHORT, 0);
};

Sprite.prototype.draw = function() {
    mvPushMatrix();
    this.draw_at(this.x, this.y);
    mvPopMatrix();

    // if we're near the left edge, draw again on the right
    if (this.x < this.scale) {
        mvPushMatrix();
        this.draw_at(this.x + world.width, this.y);
        mvPopMatrix();
    }
    else if (this.x > this.world.width - this.scale) {
        mvPushMatrix();
        this.draw_at(this.x - world.width, this.y);
        mvPopMatrix();
    }

    if (this.y < this.scale) {
        mvPushMatrix();
        this.draw_at(this.x, this.y + world.height);
        mvPopMatrix();
    }
    else if (this.y > this.world.height - this.scale) {
        mvPushMatrix();
        this.draw_at(this.x, this.y - world.height);
        mvPopMatrix();
    }

    // could add another set of cases for the corners
};


