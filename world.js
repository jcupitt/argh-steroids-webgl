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


