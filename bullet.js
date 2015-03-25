/* A bullet.
 */

'use strict';

var bulletBuffers = [];

function bulletCreate() {
    var vertices = [[1, 0],  
                    [Math.cos(rad(120)), Math.sin(rad(120))],
                    [Math.cos(rad(240)), Math.sin(rad(240))]]

    bulletBuffers = buffersCreate(vertices);
}

var Bullet = function(world) {
    Sprite.call(this, world);

    this.buffers = bulletBuffers;
    this.scale = 2;
    this.life = 100;
}

Bullet.prototype = Object.create(Sprite.prototype); 
Bullet.prototype.constructor = Bullet;

Bullet.prototype.update = function() {
    this.life -= world.dt;
    if (this.life < 0) {
        this.terminate();
    }

    Sprite.prototype.update.call(this);
}

Bullet.prototype.impact = function(other) {
    this.terminate();

    if (other instanceof Alien) {
        this.world.score += 500;
        other.terminate();
        this.world.particles.explosion(100, 
                                       other.x, other.y, other.u, other.v);
    }
    else if (other instanceof Asteroid) {
        this.world.score += other.scale | 0;
        other.terminate();
    }

    Sprite.prototype.impact.call(this, other);
}

