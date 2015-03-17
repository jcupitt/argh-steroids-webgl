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

function startscreen_tick() {
    var requestId = requestAnimFrame(startscreen_tick);

    world.draw();
    world.update();

    if (Key.isDown(Key.ENTER)) {
        cancelAnimFrame(requestId);
        requestId = undefined;
    }
}

function startscreen() {
    world.particles.starfield();

    for (var i = 0; i < 2; i += 1) 
        new Asteroid(world, randint(50, 100), 2);

    world.add_text('ARGH ITS THE ASTEROIDS', 20)
    world.add_text('PRESS LEFT AND RIGHT TO ROTATE') 
    world.add_text('PRESS UP FOR THRUST')
    world.add_text('PRESS SPACE FOR FIRE')
    world.add_text('OR DOUBLE-CLICK FOR MOUSE CONTROLS') 
    world.add_text('WATCH OUT FOR ALLEN THE ALIEN')
    world.add_text('PRESS ENTER TO START', 20)

    startscreen_tick();
}

var level_start_timer = 0;
var level_start_frames = 100;

function level_start_tick() {
    var requestId = requestAnimFrame(level_start_tick);

    world.draw();
    world.draw_hud(); 
    world.update();

    level_start_timer -= 1;
    if (level_start_timer < 0) {
        cancelAnimFrame(requestId);
        requestId = undefined;
    }
}

function level_start() {
    level_start_timer = level_start_frames;
    level_start_tick();
}

function level_tick() {
    var requestId = requestAnimFrame(level_tick);

    world.draw();
    world.draw_hud(); 
    world.update();

    if (world.n_asteroids == 0 || !world.player) {
        cancelAnimFrame(requestId);
        requestId = undefined;
    }
}

function level_play() {
    for (var i = 0; i < 2; i += 1) 
        new Asteroid(world, randint(50, 100), 2);

    level_tick();
}

var game_over_timer = 0;
var game_over_frames = 100;

function game_over_tick() {
    var requestId = requestAnimFrame(game_over_tick);

    world.draw();
    world.draw_hud(); 
    world.update();

    game_over_timer -= 1;
    if (game_over_timer == 0) {
        cancelAnimFrame(requestId);
        requestId = undefined;
    }
}

function game_over() {
    game_over_timer = game_over_frames;
    game_over_tick();
}

function epilogue_tick() {
    var requestId = requestAnimFrame(epilogue_tick);

    world.draw();
    world.draw_hud(); 
    world.update();

    if (Key.isDown(Key.ENTER)) {
        cancelAnimFrame(requestId);
        requestId = undefined;
    }
}

function epilogue() {
    epilogue_tick();
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

    startscreen();

    //while (true) {
        world.clear();
        world.particles.starfield();
        world.add_player();

        while (world.player) {
            world.level += 1;
            level_start(world);
            level_play(world);
        }

        game_over();
        epilogue();
    //}
}
