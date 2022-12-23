/* Misc utility functions. 
 */

class Mouse {
    LEFT = 0;
    RIGHT = 2;

    construct(element) {
        this.element = element;

        this.movementX = 0;
        this.movementY = 0;
        this.locked = false;
        this.pressed = {};
        this.click = null;

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
            if (!this.locked && this.element.requestPointerLock) {
                this.element.requestPointerLock();
            }

            if (this.element.requestFullScreen) {
                this.element.requestFullScreen();
            }
        }

        element.addEventListener('mousedown', this.mouseDown, false);
        element.addEventListener('mouseup', this.mouseUp, false);
    }

    isDown(button) {
        return this.pressed[button];
    }

    // pick up all the movement since the last call
    getMovement() {
        var result = [this.movementX, this.movementy];
        this.movementX = 0;
        this.movementY = 0;

        return result;
    }

    // pick up any click since the last call
    getClick() {
        var result = this.click;
        this.click = null;
        return result;
    }

    /* Event handlers.
     */

    mouseDown(event) {
        this.pressed[event.button] = true;

        if (event.button == 0) {
            this.click = {
                x: event.clientX,
                y: event.clientY
            };
        }

        // things like audio play can only be started from callbacks ... so we
        // have to have a hook here for the startscreen to use for the music
        // on/off button
        if (this.onclick) {
            this.onclick(event);
        }
    }

    mouseUp(event) {
        delete this.pressed[event.button];
    }

    mouseMove(event) {
        this.movementX += 
            event.movementX ||
            event.mozMovementX ||
            event.webkitMovementX ||
            0;
        this.movementY += 
            event.movementX ||
            event.mozMovementX ||
            event.webkitMovementX ||
            0;
    }

    pointerLockChange() {
        if(document.pointerLockElement === this.element ||
            document.mozPointerLockElement === this.element ||
            document.webkitPointerLockElement === this.element) {
            document.addEventListener("mousemove", this.mouseMove, false);
            this.locked = true;
        } 
        else {
            document.removeEventListener("mousemove", this.mouseMove, false);
            this.locked = false;
        }
    }
}

export { Mouse };
