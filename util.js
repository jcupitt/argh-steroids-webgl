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

function deg(angle) {
    return angle * 180 / Math.PI;
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

var currentProgram;

function setShaderProgram(program) {
    if (currentProgram !== program) {
        currentProgram = program;
        gl.useProgram(currentProgram);

        // turn off all vertex attributes ... draw operations need to turn the 
        // ones they need back on
        //
        // if we don't do this we see mysterious warnings from welgl on some
        // platforms due to unused attributes being left on
        var maxVSattribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
        for (var i = 0; i < maxVSattribs; i++) {
            gl.disableVertexAttribArray(i);
        }
    }
}

var mvMatrix = mat4.create();
var mvMatrixStack = [];

function mvPushMatrix() {
    var copy = mat4.create();
    mat4.set(mvMatrix, copy);
    mvMatrixStack.push(copy);
}

function mvPopMatrix() {
    if (mvMatrixStack.length == 0) {
        throw "Invalid popMatrix!";
    }
    mvMatrix = mvMatrixStack.pop();
}

var pMatrix = mat4.create();

function setMatrixUniforms() {
    gl.uniformMatrix4fv(currentProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(currentProgram.mvMatrixUniform, false, mvMatrix);
}

// for clock-style arithmetic
function wrap_around(x, limit) {
    if (x > 0) {
        return x % limit;
    }
    else
        return ((x % limit) + limit) % limit;
}

function rect_to_polar(x, y) { 
    var angle;

    /* We have to get the right quadrant!
     */
    if( x == 0 ) {
        if( y < 0.0 ) {
            angle = 270;
        }
        else if( y == 0.0 ) {
            angle = 0;
        }
        else {
            angle = 90;
        }
    }
    else {
        var t = Math.atan(y / x);

        if( x > 0.0 ) {
            if( y < 0.0 ) {
                angle = deg(t + Math.PI * 2.0);
            }
            else {
                angle = deg(t);
            }
        }
        else {
            angle = deg(t + Math.PI);
        }
    }

    return angle;
}

function bufferCreate(type, data) {
    var buf = gl.createBuffer();
    gl.bindBuffer(type, buf);
    gl.bufferData(type, data, gl.STATIC_DRAW);

    return buf;
}

/* points is a 2D array like [[x1, y1], [x2, y2], ..] ... make a 
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

/* points is a 2D array like [[x1, y1], [x2, y2], ..] ... make a pair of
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
    img.onload = function () {
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

    isDown: function (keyCode) {
        return this._pressed[keyCode];
    },

    _keyDown: function (event) {
        Key._pressed[event.keyCode] = true;
    },

    _keyUp: function (event) {
        delete Key._pressed[event.keyCode];
    },

    attach: function (element) {
        Key.element = element;

        window.addEventListener('keyup', this._keyUp, false);
        window.addEventListener('keydown', this._keyDown, false); 
    }
};

var Mouse = {
    movementX: 0,
    movementY: 0,
    locked: false,
    _pressed: {},
    LEFT: 0,
    RIGHT: 2,
    click: null,

    isDown: function (button) {
        return this._pressed[button];
    },

    // pick up all the movement since the last call
    getMovement: function () {
        var result = [this.movementX, this.movementy];
        this.movementX = 0;
        this.movementY = 0;

        return result;
    },

    // pick up any click since the last call
    getClick: function () {
        var result = this.click;
        this.click = null;
        return result;
    },

    mouseDown: function (event) {
        Mouse._pressed[event.button] = true;

        if (event.button == 0) {
            Mouse.click = {
                x: event.clientX,
                y: event.clientY
            };
        }

        // things like audio play can only be started from callbacks ... so we
        // have to have a hook here for the startscreen to use for the music
        // on/off button
        if (Mouse.onclick) {
            Mouse.onclick(event);
        }
    },

    mouseUp: function (event) {
        delete Mouse._pressed[event.button];
    },

    mouseMove: function (event) {
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

    pointerLockChange: function () {
        if(document.pointerLockElement === Mouse.element ||
            document.mozPointerLockElement === Mouse.element ||
            document.webkitPointerLockElement === Mouse.element) {
            document.addEventListener("mousemove", Mouse.mouseMove, false);
            Mouse.locked = true;
        } 
        else {
            document.removeEventListener("mousemove", Mouse.mouseMove, false);
            Mouse.locked = false;
        }
    },

    attach: function (element) {
        this.element = element;

        element.requestPointerLock = element.requestPointerLock ||
            element.mozRequestPointerLock ||
            element.webkitRequestPointerLock;

        // Safari has fullscreen but does not support pointerlock
        element.requestFullScreen = element.requestFullscreen ||
            element.msRequestFullscreen ||
            element.mozRequestFullScreen ||
            element.webkitRequestFullscreen;

        if ("onpointerlockchange" in document) {
            document.addEventListener('pointerlockchange', 
                this.pointerLockChange, false);
        } 
        else if ("onmozpointerlockchange" in document) {
            document.addEventListener('mozpointerlockchange', 
                this.pointerLockChange, false);
        } 
        else if ("onwebkitpointerlockchange" in document) {
            document.addEventListener('webkitpointerlockchange', 
                this.pointerLockChange, false);
        }

        element.ondblclick = function () {
            if (!Mouse.locked && Mouse.element.requestPointerLock) {
                Mouse.element.requestPointerLock();
            }

            if (Mouse.element.requestFullScreen) {
                Mouse.element.requestFullScreen();
            }
        }

        element.addEventListener('mousedown', this.mouseDown, false);
        element.addEventListener('mouseup', this.mouseUp, false);
    }
};

var Touch = {
    last_rotation: 0,
    current_rotation: 0,

    current_taps: [],
    tapped: false,
    tap_position: null,

    double_tapped: false,
    double_tap_timeout: 0,

    current_holds: [],
    n_holds: 0,
    holding: false,
    holding_id: null,

    triple_hold: false,

    // return total rotation since the last call
    getRotation: function () {
        var result = this.current_rotation;
        this.current_rotation = 0;
        return result;
    },

    // has there been a doubletap since the last call
    getDoubletap: function () {
        var result = this.double_tapped;
        this.double_tapped = false;
        return result;
    },

    // has there been a triplehold since the last call
    getTriplehold: function () {
        var result = this.triple_hold;
        this.triple_hold = false;
        return result;
    },

    // has there been a tap since the last call
    getTap: function () {
        var result;

        result = null;
        if (this.tapped) {
            result = this.tap_position;
            this.tap_position = null;
            this.tapped = false;
        }

        return result;
    },

    // are we holding
    getHold: function () {
        var result;

        result = null;
        if (this.holding) {
            result = this.current_holds[this.holding_id];
        }

        return result;
    },

    touchStart: function (event) {
        event.preventDefault();
        var changedTouches = event.changedTouches;

        if (Touch.double_tap_timeout) {
            clearTimeout(Touch.double_tap_timeout);
            Touch.double_tap_timeout = 0;
            Touch.double_tapped = true;
        }
        else {
            Touch.double_tap_timeout = setTimeout(function () { 
                Touch.double_tap_timeout = 0;
            }, 400);
        }

        for (var i = 0; i < changedTouches.length; i++) { 
            var touch = changedTouches[i];
            var id = touch.identifier;

            Touch.current_taps[id] = {
                x: touch.clientX,
                y: touch.clientY
            };

            Touch.current_holds[id] = {
                x: touch.clientX,
                y: touch.clientY,
                timeout: setTimeout(function () { 
                    if (!Touch.holding) { 
                        Touch.holding = true;
                        Touch.holding_id = id;
                        Touch.current_holds[id].timeout = null;
                    }

                    Touch.n_holds += 1;
                    if (Touch.n_holds == 3) {
                        Touch.triple_hold = true;
                    }
                }, 100)
            };


            // things like audio play can only be started from callbacks ... 
            // so we have to have a hook here for the startscreen to use for 
            // the music on/off button
            if (Touch.onclick) {
                Touch.onclick(touch);
            }
        }
    }, 

    touchMove: function (event) {
        event.preventDefault();
        var changedTouches = event.changedTouches;

        if (Touch.double_tap_timeout) {
            clearTimeout(Touch.double_tap_timeout);
            Touch.double_tap_timeout = 0;
        }

        for (var i = 0; i < changedTouches.length; i++) { 
            var touch = changedTouches[i];
            var id = touch.identifier;

            if (Touch.current_taps[id]) { 
                var dx = touch.clientX - Touch.current_taps[id].x;
                var dy = touch.clientY - Touch.current_taps[id].y;

                if (Math.abs(dx) > 10 || 
                    Math.abs(dy) > 10) {
                    delete Touch.current_taps[id];
                }
            }

            if (Touch.current_holds[id]) {
                Touch.current_holds[id].x = touch.clientX;
                Touch.current_holds[id].y = touch.clientY;
            }
        }
    }, 

    touchEnd: function (event) {
        event.preventDefault();
        var changedTouches = event.changedTouches;

        for (var i = 0; i < changedTouches.length; i++) { 
            var touch = changedTouches[i];
            var id = touch.identifier;

            if (Touch.current_taps[id]) {
                Touch.tap_position = Touch.current_taps[id];
                Touch.tapped = true;

                delete Touch.current_taps[id];
            }

            if (Touch.current_holds[id]) {
                if (id == Touch.holding_id) {
                    Touch.holding = false;
                    Touch.holding_id = null;
                }

                if (Touch.current_holds[id].timeout) {
                    clearTimeout(Touch.current_holds[id].timeout);
                }
                else {
                    Touch.n_holds -= 1;
                }

                delete Touch.current_holds[id];
            }
        }
    }, 

    touchCancel: function (event) {
        event.preventDefault();
        var changedTouches = event.changedTouches;

        for (var i = 0; i < changedTouches.length; i++) { 
            var touch = changedTouches[i];
            var id = touch.identifier;

            delete Touch.current_taps[id];

            if (Touch.current_holds[id]) {
                if (id == Touch.holding_id) {
                    Touch.holding = false;
                    Touch.holding_id = null;
                }

                if (Touch.current_holds[id].timeout) {
                    clearTimeout(Touch.current_holds[id].timeout);
                }
                else {
                    Touch.n_holds -= 1;
                }

                delete Touch.current_holds[id];
            }
        }
    }, 

    gestureStart: function (event) {
        event.preventDefault();
        var allTouches = event.touch;
    }, 

    gestureChange: function (event) {
        event.preventDefault();
        var allTouches = event.touch;
    }, 

    gestureEnd: function (event) {
        event.preventDefault();
        var allTouches = event.touch;
    }, 

    attach: function (element) {
        element.addEventListener("touchstart", this.touchStart, false);
        element.addEventListener("touchmove", this.touchMove, false);
        element.addEventListener("touchend", this.touchEnd, false);
        element.addEventListener("touchcancel", this.touchCancel, false);

        element.addEventListener("gesturestart", this.gestureStart, false);
        element.addEventListener("gesturechange", this.gestureChange, false);
        element.addEventListener("gestureend", this.gestureEnd, false);

        this.element = element;
    }
};
