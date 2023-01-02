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
    this.mass = 50;
    this.kill = false;
    this.in_impact = false;
    this.was_impact = false;
    this.spark_countdown = 0;

    this.world.add(this);
};

Sprite.prototype.constructor = Sprite;

Sprite.prototype.update = function () {
    var world = this.world;
    var dt = world.dt;

    if (this.spark_countdown >= 0) {
        this.spark_countdown -= dt;
    }

    this.x = wrap_around(this.x + dt * this.u, world.width);
    this.y = wrap_around(this.y + dt * this.v, world.height);
};

Sprite.prototype.setAudio = function (audio_on) {
};

Sprite.prototype.terminate = function () {
    this.kill = true;
};

Sprite.prototype.impact = function () {
    // not too many sparks, it looks odd
    if (this.spark_countdown <= 0) {
        this.spark_countdown = randint(0, 40);

        if (this.impact_f > 0.01) {
            // point of impact for sparks
            var impact_x = this.x + this.impact_ux * this.scale;
            var impact_y = this.y + this.impact_uy * this.scale;
            var n_sparks = 3 * this.impact_f;

            this.world.particles.sparks(n_sparks,
                impact_x, impact_y, 20 * this.u, 20 * this.v);
        }
    }
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

