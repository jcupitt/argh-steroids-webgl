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
    world.draw();
    //world.draw_hud(); 
    world.update();
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
    textCreate();
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    world = new World(canvas);
    world.particles.starfield();
    for (var i = 0; i < 2; i += 1) 
        new Asteroid(world, randint(50, 100), 2);
    world.add_text('ARGH ITS THE ASTEROIDS', 20)
    world.add_text('PRESS ESC TO QUIT') 
    world.add_text('PRESS LEFT AND RIGHT TO ROTATE') 
    world.add_text('PRESS UP FOR THRUST')
    world.add_text('PRESS SPACE FOR FIRE')
    world.add_text('OR USE MOUSE CONTROLS') 
    world.add_text('WATCH OUT FOR ALLEN THE ALIEN')
    world.add_text('PRESS ENTER TO START', 20)

    tick();
}
