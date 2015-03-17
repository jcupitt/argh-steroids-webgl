/* Start up everything, run the main loop.
 */

'use strict';

var shaderPrograms = [];
var currentProgram;

function setShaderProgram(program) {
    currentProgram = program;
    gl.useProgram(currentProgram);
}

function initShaders() {
    shaderPrograms[0] = getProgram("shader-fs-particle", "shader-vs-particle");

    shaderPrograms[0].vertexColorAttribute = 
        gl.getAttribLocation(shaderPrograms[0], "aVertexColor");

    shaderPrograms[1] = getProgram("shader-fs-vector", "shader-vs-vector");
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

var world;

function tick() {
    requestAnimFrame(tick);
    world.update();
    world.draw();
}

function arghsteroids() {
    var canvas = document.getElementById("argh-steroids-canvas");

    Mouse.attach(canvas);

    initGL(canvas);
    initShaders()
    asteroidsCreate();
    alienCreate();
    bulletCreate();
    shipCreate();
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    world = new World(canvas);
    for (var i = 0; i < 20; i += 1) 
        new Asteroid(world, randint(50, 100), 2);
    new Alien(world);
    world.add_player();
    world.particles.starfield();

    tick();
}
