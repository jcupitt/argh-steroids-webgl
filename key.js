/* Misc utility functions. 
 */

class Key {
    LEFT = 37;
    UP = 38;
    RIGHT = 39;
    DOWN = 40;
    ENTER = 13;
    SPACE = 32;
    ESC = 27;
    I = 73;
    S = 83;
    N = 78;
    P = 80;
    ONE = 49;
    TWO = 50;
    THREE = 51;
    FOUR = 52;
    FIVE = 53;

    construct(element) {
        this.pressed = {};
        this.element = element;

        element.addEventListener('keyup', this.keyUp, false);
        element.addEventListener('keydown', this.keyDown, false); 
    }

    isDown(keyCode) {
        return this.pressed[keyCode];
    }

    keyDown(event) {
        this.pressed[event.keyCode] = true;
    }

    keyUp(event) {
        delete this.pressed[event.keyCode];
    }
}

export { Key };
