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

    program.pMatrixUniform = gl.getUniformLocation(program, "uPMatrix");
    program.mvMatrixUniform = gl.getUniformLocation(program, "uMVMatrix");

    return program;
}

// for clock-style arithmetic
function wrap_around(x, limit) {
    if (x > 0) {
        return x % limit;
    }
    else
        return ((x % limit) + limit) % limit;
}

function bufferCreate(type, data) {
    var buf = gl.createBuffer();
    gl.bindBuffer(type, buf);
    gl.bufferData(type, data, gl.STATIC_DRAW);

    return buf;
}

/* points is a 2D array of like [[x1, y1], [x2, y2], ..], make a 
 * draw buffer.
 */
function buffersCreate(points) {
    var vertex = [];
    for (var i = 0; i < points.length; i++) {
        vertex.push(points[i][0]);
        vertex.push(points[i][1]);
    }

    var vertex_buffer = 
        bufferCreate(gl.ARRAY_BUFFER, new Float32Array(vertex));
    vertex_buffer.itemSize = 2;
    vertex_buffer.numItems = points.length;

    return vertex_buffer;
}

/* Draw the thing made by buffersCreate() above.
 */
function buffersDraw(buffers) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers);
    gl.enableVertexAttribArray(currentProgram.vertexPositionAttribute);
    gl.vertexAttribPointer(currentProgram.vertexPositionAttribute, 
        buffers.itemSize, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.LINE_LOOP, 0, buffers.numItems);
};

/* points is a 2D array like [[x1, y1], [x2, y2], ..], make a pair of
 * draw buffers which will join pairs of points.
 */
function buffersCreateDiscontinuous(points) {
    if (points.length % 2 != 0) {
        console.log("buffersCreateDiscontinuous: not an even number of points");
    }

    var vertex = [];
    var index = [];
    for (var i = 0; i < points.length; i++) {
        vertex.push(points[i][0]);
        vertex.push(points[i][1]);
        index.push(i);
    }

    var vertex_buffer = 
        bufferCreate(gl.ARRAY_BUFFER, new Float32Array(vertex));
    vertex_buffer.itemSize = 2;
    vertex_buffer.numItems = points.length;

    var index_buffer = 
        bufferCreate(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(index));
    index_buffer.itemSize = 1;
    index_buffer.numItems = points.length;

    return [vertex_buffer, index_buffer];
}

/* Draw the thing made by buffersCreateDiscontinuous() above.
 */
function buffersDrawDiscontinuous(buffers) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers[0]);
    gl.enableVertexAttribArray(currentProgram.vertexPositionAttribute);
    gl.vertexAttribPointer(currentProgram.vertexPositionAttribute, 
            buffers[0].itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers[1]);
    gl.drawElements(gl.LINES, 
            buffers[1].numItems, gl.UNSIGNED_SHORT, 0);
};

function loadPointTexture(imgURL) {
    var tex = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    var img = new Image();
    img.src = imgURL;
    img.onload = function() {
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 
        0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    };

    return tex;
};

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
    ONE: 49,
    TWO: 50,
    THREE: 51,
    FOUR: 52,
    FIVE: 53,

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
    _pressed: {},
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

    isDown: function(button) {
        return this._pressed[button];
    },

    mousedown: function(event) {
        Mouse._pressed[event.button] = true;
    },

    mouseup: function(event) {
        delete Mouse._pressed[event.button];
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

        element.ondblclick = function() {
            if (!Mouse.locked && Mouse.element.requestPointerLock) {
                Mouse.element.requestPointerLock();
            }

            // Safari has fullscreen but does not support pointerlock
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

        element.addEventListener('mousedown', Mouse.mousedown, false);
        element.addEventListener('mouseup', Mouse.mouseup, false);
    }
};
