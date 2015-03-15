/* Misc utility functions. 
 */

function randint(min, max) {
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

function createBuffer(type, data) {
    var buf = gl.createBuffer();
    gl.bindBuffer(type, buf);
    gl.bufferData(type, data, gl.STATIC_DRAW);

    return buf;
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
