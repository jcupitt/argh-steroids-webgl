/* Start up everything, run the main loop.
 */

var shaderPrograms = [];
var currentProgram;

function initShaders() {
    shaderPrograms[1] = getProgram("shader-fs-white", "shader-vs-plain");

    currentProgram = shaderPrograms[1]
    gl.useProgram(currentProgram);
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

var asteroidBuffers = []

function initBuffers() {
    asteroidBuffers = asteroidsCreate();

}

var rTri = 0;

function drawScene() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

    mat4.identity(mvMatrix);

    mvPushMatrix();

    mat4.translate(mvMatrix, [0, 0, -7.0]);

    mat4.rotate(mvMatrix, rad(rTri), [0, 0, 1]);

    aster = asteroidBuffers[0]

    gl.bindBuffer(gl.ARRAY_BUFFER, aster[0]);
    gl.vertexAttribPointer(currentProgram.vertexPositionAttribute, aster[0].itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, aster[1]);
    setMatrixUniforms();
    gl.drawElements(gl.LINE_LOOP, aster[1].numItems, gl.UNSIGNED_SHORT, 0);

    mvPopMatrix();

}

var lastTime = 0;

function animate() {
    var timeNow = new Date().getTime();
    if (lastTime != 0) {
        var elapsed = timeNow - lastTime;

        rTri += (50 * elapsed) / 1000.0;
    }
    lastTime = timeNow;
}

function tick() {
    requestAnimFrame(tick);
    drawScene();
    animate();
}

function webGLStart() {
    var canvas = document.getElementById("argh-steroids-canvas");

    initGL(canvas);
    initShaders()
    initBuffers();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    tick();
}
