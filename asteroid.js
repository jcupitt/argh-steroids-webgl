/* Asteroid object.
 */

function asteroidsCreate() {
    buffers = [];

    for (var i = 0; i < 4; i++) {
        var vertices = [];
        var index = [];

        var n_points = 20
        for (var j = 0; j < n_points; j++) {
            var delta = 360 / n_points;
            var angle = j * 360 / n_points + randint(-delta / 2, delta / 2);
            var distance = Math.random() / 4.0 + 0.75;
            vertices = vertices.concat([
                distance * Math.cos(rad(angle)), 
                distance * Math.sin(rad(angle)), 
                -7
            ]);
            index.push(j);
        }

        var vertex_buffer = 
            createBuffer(gl.ARRAY_BUFFER, new Float32Array(vertices));
        vertex_buffer.itemSize = 3;
        vertex_buffer.numItems = n_points;

        var index_buffer = 
            createBuffer(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(index));
        index_buffer.itemSize = 1;
        index_buffer.numItems = n_points;

        buffers.push([vertex_buffer, index_buffer]);
    }

    return buffers;
}


