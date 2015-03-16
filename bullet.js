/* A bullet.
 */

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
    this.life -= 1;
    if (this.life < 0) {
        this.kill = true;
    }

    Sprite.prototype.update.call(this);
}

Bullet.prototype.impact = function(other) {
    if (other instanceof Alien) {
        other.kill = true;
        this.kill = true;
        this.world.score += 1000;
    }
    else if (other instanceof Asteroid) {
        other.kill = true;
        this.kill = true;
        this.world.score += other.scale;
        this.world.n_asteroids -= 1;

        if (other.scale > 15) { 
            var n = randint(2, Math.max(2, Math.min(5, other.scale / 5)));

            for (var i = 0; i < n; i++) {
                new_asteroid = Asteroid(this.world, other.scale / n, 1);
                new_asteroid.x = other.x;
                new_asteroid.y = other.y;
                new_asteroid.u += other.u;
                new_asteroid.v += other.v;
            }
        }
    }

    Sprite.prototype.impact.call(this, other);
}

