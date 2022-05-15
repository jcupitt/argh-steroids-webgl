/* Start up everything, run the main loop.
 */

class Main {
    constructor() {
        self.shaderPrograms = [];
        self.gameover_timer = 0;
        self.gameover_frames = 100;
        self.terminate_ok = true;
        self.levelstart_timer = 0;
        self.levelstart_frames = 100;

        var canvas = document.getElementById("argh-steroids-canvas");

        Key.attach(canvas);
        Mouse.attach(canvas);
        Touch.attach(canvas);

        initGL(canvas);
        initShaders()
        asteroidsCreate();
        alienCreate();
        bulletCreate();
        shipCreate();
        textCreate();
        gl.clearColor(0.0, 0.0, 0.0, 1.0);

        self.world = new World(canvas);

        Mouse.onclick = function (event) {
            self.world.sound(event);
        };
        Touch.onclick = function (event) {
            self.world.sound(event);
        };

        startscreen();
        startscreen_tick();
    }

    initShaders() {
        self.shaderPrograms[0] = getProgram("shader-fs-particle", 
            "shader-vs-particle");

        self.shaderPrograms[0].vertexVelocityAttribute = 
            gl.getAttribLocation(shaderPrograms[0], "aVertexVelocity");

        self.shaderPrograms[0].vertexBirthticksAttribute = 
            gl.getAttribLocation(shaderPrograms[0], "aVertexBirthticks");

        self.shaderPrograms[0].vertexLifespanAttribute = 
            gl.getAttribLocation(shaderPrograms[0], "aVertexLifespan");

        self.shaderPrograms[0].vertexColourstartAttribute = 
            gl.getAttribLocation(shaderPrograms[0], "aVertexColourstart");

        self.shaderPrograms[0].vertexColourscaleAttribute = 
            gl.getAttribLocation(shaderPrograms[0], "aVertexColourscale");

        self.shaderPrograms[0].vertexSizeAttribute = 
            gl.getAttribLocation(shaderPrograms[0], "aVertexSize");

        self.shaderPrograms[0].vertexDampAttribute = 
            gl.getAttribLocation(shaderPrograms[0], "aVertexDamp");

        self.shaderPrograms[0].ticksUniform = 
            gl.getUniformLocation(shaderPrograms[0], "uTicks");
        self.shaderPrograms[0].rampUniform = 
            gl.getUniformLocation(shaderPrograms[0], "uRamp");
        self.shaderPrograms[0].textureUniform = 
            gl.getUniformLocation(shaderPrograms[0], "uTexture");

        self.shaderPrograms[0].cameraPos = 
            gl.getUniformLocation(shaderPrograms[0], "cameraPos");

        self.shaderPrograms[1] = getProgram("shader-fs-vector", 
            "shader-vs-vector");
    }

    set_program(n) {
    }

    epilogue_tick() {
        self.world.draw();
        self.world.draw_hud(); 
        if (Key.isDown(Key.I)) { 
            self.world.draw_info();
        }

        text_draw_immediate("ENTER OR DOUBLETAP", 
                            self.world.width / 2, self.world.height / 2 + 20,
                            20, 0,
                            true);
        text_draw_immediate("TO PLAY AGAIN", 
                            self.world.width / 2, self.world.height / 2 - 20,
                            20, 0,
                            true);

        self.world.update();

        if (Key.isDown(Key.ENTER) ||
            Touch.getDoubletap()) {
            gamestart();
        }
        else {
            requestAnimFrame(epilogue_tick);
        }
    }

    epilogue() {
        Touch.getDoubletap();
        epilogue_tick();
    }

    gameover_tick() {
        self.world.draw();
        self.world.draw_hud(); 
        if (Key.isDown(Key.I)) { 
            self.world.draw_info();
        }

        var t = gameover_timer / gameover_frames;
        text_draw_immediate("GAME OVER", 
                            self.world.width / 2, self.world.height / 2,
                            Math.log(t + 0.001) * 150, 180,
                            true);

        self.world.update();

        self.gameover_timer -= self.world.dt;
        if (self.gameover_timer < 0) {
            epilogue();
        }
        else {
            requestAnimFrame(self.gameover_tick);
        }
    }

    gameover() {
        self.gameover_timer = self.gameover_frames;
        gameover_tick();
    }

    levelplay_tick() {
        self.world.draw();
        self.world.draw_hud(); 
        if (Key.isDown(Key.I)) { 
            self.world.draw_info();
        }

        // need to debounce N key
        if (self.terminate_ok && 
            Key.isDown(Key.N)) {
            self.world.terminate_asteroids();
            self.terminate_ok = false;
        }
        if (!self.terminate_ok && 
            !Key.isDown(Key.N)) {
            self.terminate_ok = true;
        }
        if (Touch.getTriplehold()) {
            self.world.terminate_asteroids();
        }

        self.world.update();

        if (!world.player) {
            gameover();
        }
        else if (self.world.n_asteroids == 0) {
            self.world.level += 1;
            levelstart();
        }
        else {
            requestAnimFrame(levelplay_tick);
        }
    }

    levelplay() {
        for (var i = 0; i < self.world.level * 2; i += 1) 
            new Asteroid(self.world, 
                randint(75, 100), 0.5 + self.world.level / 4.0);

        levelplay_tick();
    }

    levelstart_tick() {
        self.world.draw();
        self.world.draw_hud(); 
        if (Key.isDown(Key.I)) { 
            self.world.draw_info();
        }
        if (Key.isDown(Key.S)) { 
            new Asteroid(self.world, 
                randint(75, 100), 0.5 + self.world.level / 4.0);
        }

        var t = self.levelstart_timer / self.levelstart_frames;
        text_draw_immediate("LEVEL START", 
                            self.world.width / 2, self.world.height / 2,
                            t * 150, t * 200.0, true); 

        self.world.update();

        self.levelstart_timer -= self.world.dt;
        if (self.levelstart_timer < 0) {
            levelplay();
        }
        else {
            requestAnimFrame(levelstart_tick);
        }
    }

    levelstart() {
        self.levelstart_timer = self.levelstart_frames;
        levelstart_tick();
    }

    gamestart() {
        self.world.reset();
        self.world.particles.starfield();
        self.world.add_player();

        // clear any taps
        Touch.getTap();

        levelstart();
    }

    startscreen_tick() {
        self.world.draw();
        if (Key.isDown(Key.I)) { 
            self.world.draw_info();
        }

        self.world.update();

        if (Key.isDown(Key.ENTER) ||
            Touch.getDoubletap()) {
            self.world.resize_handler = null;
            gamestart();
        }
        else {
            requestAnimFrame(startscreen_tick);
        }
    }

    startscreen() {
        self.world.reset();
        self.world.particles.starfield();

        for (var i = 0; i < 2; i += 1) 
            new Asteroid(self.world, randint(50, 100), 2);

        world.add_text('ARGH ITS THE ASTEROIDS', 20)
        world.add_text('PRESS LEFT AND RIGHT TO ROTATE') 
        world.add_text('PRESS UP FOR THRUST')
        world.add_text('PRESS SPACE FOR FIRE')
        world.add_text('OR DOUBLE-CLICK FOR MOUSE CONTROLS') 
        world.add_text('OR DOUBLE-TAP FOR TOUCH CONTROLS') 
        world.add_text('WATCH OUT FOR ALLEN THE ALIEN')
        world.add_text('PRESS ENTER TO START', 20)

        // on a resize, re-run this function
        self.world.resize_handler = startscreen;
    }
}

export { Main };
