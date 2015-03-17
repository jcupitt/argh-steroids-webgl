/* Misc utility functions. 
 */

'use strict';

function randint(min, max) {
    min |= 0;
    max |= 0;

    return ((Math.random() * (1 + max - min)) | 0) + min;
}

function rad(angle) {
    return angle * Math.PI / 180.0;
}

var gl;

function initGL(canvas) {
    gl = WebGLUtils.setupWebGL(canvas);
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
}

function getShader(id) {
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
        return null;
    }

    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType == 3) {
            str += k.textContent;
        }
        k = k.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function getProgram(fs_id, vs_id) {
    var fragmentShader = getShader(fs_id);
    var vertexShader = getShader(vs_id);

    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    program.vertexPositionAttribute = 
        gl.getAttribLocation(program, "aVertexPosition");
    gl.enableVertexAttribArray(program.vertexPositionAttribute);

    program.pMatrixUniform = gl.getUniformLocation(program, "uPMatrix");
    program.mvMatrixUniform = gl.getUniformLocation(program, "uMVMatrix");

    return program;
}

// for clock-style arithmetic
function wrap_around(x, limit) {
    if (x >= limit) {
        return x - limit;
    }
    else if (x < 0) {
        return x + limit;
    }
    else
        return x;
}

function bufferCreate(type, data) {
    var buf = gl.createBuffer();
    gl.bindBuffer(type, buf);
    gl.bufferData(type, data, gl.STATIC_DRAW);

    return buf;
}

/* vertices is a 2D array of points [[x1, y1], [x2, y2], ..], make a pair of
 * draw buffers.
 */
function buffersCreate(vertices) {
    var points = [];
    var index = [];
    for (var i = 0; i < vertices.length; i++) {
        points = points.concat([vertices[i][0], vertices[i][1], 0]);
        index.push(i);
    }

    var vertex_buffer = 
        bufferCreate(gl.ARRAY_BUFFER, new Float32Array(points));
    vertex_buffer.itemSize = 3;
    vertex_buffer.numItems = vertices.length;

    var index_buffer = 
        bufferCreate(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(index));
    index_buffer.itemSize = 1;
    index_buffer.numItems = vertices.length;

    return [vertex_buffer, index_buffer];
}

/* vertices is a 2D array of points [[x1, y1], [x2, y2], ..], make a pair of
 * draw buffers which will join pairs of points.
 */
function buffersCreateDiscontinuous(vertices) {
    if (vertices.length % 2 != 0) {
        console.log("buffersCreateDiscontinuous: not an even number of points");
    }

    var points = [];
    var index = [];
    for (var i = 0; i < vertices.length; i++) {
        points = points.concat([vertices[i][0], vertices[i][1], 0]);
        index.push(i);
    }

    var vertex_buffer = 
        bufferCreate(gl.ARRAY_BUFFER, new Float32Array(points));
    vertex_buffer.itemSize = 3;
    vertex_buffer.numItems = vertices.length;

    var index_buffer = 
        bufferCreate(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(index));
    index_buffer.itemSize = 2;
    index_buffer.numItems = vertices.length;

    return [vertex_buffer, index_buffer];
}

var Key = {
    _pressed: {},

    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    ENTER: 13,
    SPACE: 32,
    ESC: 27,
    I: 73,
    S: 83,
    N: 78,
    P: 80,

    isDown: function(keyCode) {
        return this._pressed[keyCode];
    },

    onKeydown: function(event) {
        this._pressed[event.keyCode] = true;
    },

    onKeyup: function(event) {
        delete this._pressed[event.keyCode];
    }
};

window.addEventListener('keyup', function(event) { 
    Key.onKeyup(event); 
}, false);
window.addEventListener('keydown', function(event) { 
    Key.onKeydown(event); 
}, false);

var Mouse = {
    movementX: 0,
    movementY: 0,
    locked: false,
    isDown: {},
    LEFT: 0,
    RIGHT: 2,

    onMove: function (event) {
        Mouse.movementX += 
            event.movementX ||
            event.mozMovementX ||
            event.webkitMovementX ||
            0;
        Mouse.movementY += 
            event.movementX ||
            event.mozMovementX ||
            event.webkitMovementX ||
            0;
    },

    mousedown: function(event) {
        Mouse.isDown[event.button] = true;
    },

    mouseup: function(event) {
        delete Mouse.isDown[event.button];
    },

    // pick up all the movement since the last call
    getMovement: function() {
        var result = [Mouse.movementX, Mouse.movementy];
        Mouse.movementX = 0;
        Mouse.movementY = 0;

        return result;
    },

    onChange: function () {
        if(document.pointerLockElement === Mouse.element ||
            document.mozPointerLockElement === Mouse.element ||
            document.webkitPointerLockElement === Mouse.element) {
            document.addEventListener("mousemove", Mouse.onMove, false);
            Mouse.locked = true;
        } 
        else {
            document.removeEventListener("mousemove", Mouse.onMove, false);
            Mouse.locked = false;
        }
    },

    attach: function(element) {
        Mouse.element = element;

        element.requestPointerLock = element.requestPointerLock ||
            element.mozRequestPointerLock ||
            element.webkitRequestPointerLock;

        if ("onpointerlockchange" in document) {
            document.addEventListener('pointerlockchange', 
                Mouse.onChange, false);
        } 
        else if ("onmozpointerlockchange" in document) {
            document.addEventListener('mozpointerlockchange', 
                Mouse.onChange, false);
        } 
        else if ("onwebkitpointerlockchange" in document) {
            document.addEventListener('webkitpointerlockchange', 
                Mouse.onChange, false);
        }

        if (element.requestPointerLock) {
            element.onclick = function() {
                if (!Mouse.locked) {
                    Mouse.element.requestPointerLock();

                    if (Mouse.element.requestFullscreen) {
                          Mouse.element.requestFullscreen();
                    } 
                    else if (Mouse.element.msRequestFullscreen) {
                          Mouse.element.msRequestFullscreen();
                    } 
                    else if (Mouse.element.mozRequestFullScreen) {
                          Mouse.element.mozRequestFullScreen();
                    } 
                    else if (Mouse.element.webkitRequestFullscreen) {
                          Mouse.element.webkitRequestFullscreen();
                    }
                }
            }
        }

        element.addEventListener('mousedown', Mouse.mousedown, false);
        element.addEventListener('mouseup', Mouse.mouseup, false);
    }
};
