/* World map (collision detection management).
 */

'use strict';

var Map = function (world, cell_size) {
    this.world = world;

    this.cell_width = cell_size;
    this.cell_height = cell_size;
    this.width = world.width;
    this.height = world.height;
    this.sprites = world.sprites;

    /* Size cells up so that we have a whole number of cells across and
     * down. We size up so that we can't have an object larger than a cell.
     */
    this.n_cells_across = Math.floor(this.width / this.cell_width);
    this.n_cells_down = Math.floor(this.height / this.cell_height);
    this.cell_width = this.width / this.n_cells_across; 
    this.cell_height = this.height / this.n_cells_down;

    this.map = new Array(this.n_cells_across);
    for (var x = 0; x < this.n_cells_across; x++) {
        this.map[x] = new Array(this.n_cells_down);
        for (var y = 0; y < this.n_cells_down; y++) {
            this.map[x][y] = [];
        }
    }

    this.sprites.forEach (function (sprite) { 
        var x = (sprite.x / this.cell_width) | 0;
        var y = (sprite.y / this.cell_height) | 0;

        this.map[x][y].push(sprite);
    }, this);
};

Map.prototype.constructor = Map;

Map.prototype.nearby = function (sprite, r, func) {
    // sprite (x, y) might be outside screen space
    var map_x = (sprite.x / this.cell_width) | 0;
    map_x = wrap_around(map_x, this.n_cells_across);
    var map_y = (sprite.y / this.cell_height) | 0;
    map_y = wrap_around(map_y, this.n_cells_down);
    var map_rx = 1 + (r / this.cell_width) | 0;
    var map_ry = 1 + (r / this.cell_height) | 0;

    for (var a = map_x - map_rx; a <= map_x + map_rx; a++ ) {
        for (var b = map_y - map_ry; b <= map_y + map_ry; b++ ) {
            var cell_x = wrap_around(a, this.n_cells_across);
            var cell_y = wrap_around(b, this.n_cells_down);

            this.map[cell_x][cell_y].forEach (function(other) {
                if (sprite != other) {
                    func(other);
                }
            });
        }
    }
};
