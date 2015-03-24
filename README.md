# Argh-steroids

Asteroids-like game using webgl. 

You can play the game on the [github pages for this
repository](http://jcupitt.github.io/argh-steroids-webgl), or alternatively
there's a [version in pygame](https://github.com/jcupitt/argh-steroids)
as well.

![Start screen](/screenshots/start_screen.png)
![In play](/screenshots/play.png)

# Features

* Asteroids bump off each other. It uses a map to make collision detection
  fast. The particle effects are entirely on the GPU and should be fast even
  on modest hardware. 

* Your ship has a shield and you can bump into asteroids a few times. The
  shield regenerates slowly.

* Mouse, keyboard and touch controls. Double click and you get fullscreen with a
  locked pointer. Unfortunately Safari does not yet support pointerlock, but
  Chrome and FF work fine. 

# Secret keys

* Press 'N' to nuke: all asteroids explode, but you get no points. Handy for 
  testing, or you're bored of shooting gravel and want to jump to the next
  level.

* Hold 'S' during level start animation to spawn extra asteroids for testing.

* Hold 'I' to see object and FPS counts.

* Hold 'P' for slo-mo. Handy for testing. 

# TODO

* There's no sound. 

* Collision detection is just touching circles, we could look at the geometry
  as well to get pixel-perfect detection.

* Collision physics just exchanges the two velocities, we could do true
  billiard-ball collisions.

# Developing

If running locally, you need to tell your browser to allow JS to access 
`file://` URLs. 
  
For example, in Chrome on Mac:

```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --allow-file-access-from-files
```

Or Linux:

```bash
google-chrome --allow-file-access-from-files index.html
```

In Firefox, go to `about:config` and add `webgl.verbose=true`, you get JS
warnings for every WebGL error and more. Go to the web console (Ctrl-Shift-K)
and in the JS tab make sure warnings are enabled. 
 
# Author

John Cupitt
