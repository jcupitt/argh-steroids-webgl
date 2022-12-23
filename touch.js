/* Link to touch events.
 */

class Touch {
    construct(element) {
        this.element = element;

        this.last_rotation = 0;
        this.current_rotation= 0;
        this.current_taps: [],
        this.tapped = false;
        this.tap_position = null;
        this.double_tapped = false;
        this.double_tap_timeout = 0;

        this.current_holds = [];
        this.n_holds = 0;
        this.holding = false;
        this.holding_id = null;

        this.triple_hold: false;

        element.addEventListener("touchstart", this.touchStart, false);
        element.addEventListener("touchmove", this.touchMove, false);
        element.addEventListener("touchend", this.touchEnd, false);
        element.addEventListener("touchcancel", this.touchCancel, false);

        element.addEventListener("gesturestart", this.gestureStart, false);
        element.addEventListener("gesturechange", this.gestureChange, false);
        element.addEventListener("gestureend", this.gestureEnd, false);
    }

    // return total rotation since the last call
    getRotation() {
        var result = this.current_rotation;
        this.current_rotation = 0;
        return result;
    }

    // has there been a doubletap since the last call
    getDoubletap() {
        var result = this.double_tapped;
        this.double_tapped = false;
        return result;
    }

    // has there been a triplehold since the last call
    getTriplehold() {
        var result = this.triple_hold;
        this.triple_hold = false;
        return result;
    }

    // has there been a tap since the last call
    getTap() {
        var result;

        result = null;
        if (this.tapped) {
            result = this.tap_position;
            this.tap_position = null;
            this.tapped = false;
        }

        return result;
    }

    // are we holding
    getHold() {
        var result;

        result = null;
        if (this.holding) {
            result = this.current_holds[this.holding_id];
        }

        return result;
    }

    /* All the touch handlers.
     */

    touchStart(event) {
        event.preventDefault();

        var changedTouches = event.changedTouches;

        if (this.double_tap_timeout) {
            clearTimeout(this.double_tap_timeout);
            this.double_tap_timeout = 0;
            this.double_tapped = true;
        }
        else {
            this.double_tap_timeout = setTimeout(function () { 
                this.double_tap_timeout = 0;
            }, 400);
        }

        for (var i = 0; i < changedTouches.length; i++) { 
            var touch = changedTouches[i];
            var id = touch.identifier;

            this.current_taps[id] = {
                x: touch.clientX,
                y: touch.clientY
            };

            this.current_holds[id] = {
                x: touch.clientX,
                y: touch.clientY,
                timeout: setTimeout(function () { 
                    if (!this.holding) { 
                        this.holding = true;
                        this.holding_id = id;
                        this.current_holds[id].timeout = null;
                    }

                    this.n_holds += 1;
                    if (this.n_holds == 3) {
                        this.triple_hold = true;
                    }
                }, 100)
            };

            // things like audio play can only be started from callbacks ... 
            // so we have to have a hook here for the startscreen to use for 
            // the music on/off button
            if (this.onclick) {
                this.onclick(touch);
            }
        }
    } 

    touchMove(event) {
        event.preventDefault();

        var changedTouches = event.changedTouches;

        if (this.double_tap_timeout) {
            clearTimeout(this.double_tap_timeout);
            this.double_tap_timeout = 0;
        }

        for (var i = 0; i < changedTouches.length; i++) { 
            var touch = changedTouches[i];
            var id = touch.identifier;

            if (this.current_taps[id]) { 
                var dx = touch.clientX - this.current_taps[id].x;
                var dy = touch.clientY - this.current_taps[id].y;

                if (Math.abs(dx) > 10 || 
                    Math.abs(dy) > 10) {
                    delete this.current_taps[id];
                }
            }

            if (this.current_holds[id]) {
                this.current_holds[id].x = touch.clientX;
                this.current_holds[id].y = touch.clientY;
            }
        }
    } 

    touchEnd(event) {
        event.preventDefault();

        var changedTouches = event.changedTouches;

        for (var i = 0; i < changedTouches.length; i++) { 
            var touch = changedTouches[i];
            var id = touch.identifier;

            if (this.current_taps[id]) {
                this.tap_position = this.current_taps[id];
                this.tapped = true;

                delete this.current_taps[id];
            }

            if (this.current_holds[id]) {
                if (id == this.holding_id) {
                    this.holding = false;
                    this.holding_id = null;
                }

                if (this.current_holds[id].timeout) {
                    clearTimeout(this.current_holds[id].timeout);
                }
                else {
                    this.n_holds -= 1;
                }

                delete this.current_holds[id];
            }
        }
    } 

    touchCancel(event) {
        event.preventDefault();

        var changedTouches = event.changedTouches;

        for (var i = 0; i < changedTouches.length; i++) { 
            var touch = changedTouches[i];
            var id = touch.identifier;

            delete this.current_taps[id];

            if (this.current_holds[id]) {
                if (id == this.holding_id) {
                    this.holding = false;
                    this.holding_id = null;
                }

                if (this.current_holds[id].timeout) {
                    clearTimeout(this.current_holds[id].timeout);
                }
                else {
                    this.n_holds -= 1;
                }

                delete this.current_holds[id];
            }
        }
    } 

    gestureStart(event) {
        event.preventDefault();
        var allTouches = event.touch;
    } 

    gestureChange(event) {
        event.preventDefault();
        var allTouches = event.touch;
    }

    gestureEnd(event) {
        event.preventDefault();
        var allTouches = event.touch;
    }
}

export { Touch };
