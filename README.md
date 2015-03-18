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
  fast.

* Your ship has a shield and you can bump into asteroids a few times. The
  shield regenerates slowly.

* Mouse and keyboard controls. Double click and you get fullscreen with a
  locked pointer. 

# Secret keys

* Hold 'S' during level start animation to spawn extra asteroids for testing.

* Hold 'I' to see object and FPS counts.

* Press 'N' to skip to the next level. Handy for testing. 

* Hold 'P' for slo-mo. Handy for testing. 

* Press '1' for default rendering, '2' for mega-explosions. 

# TODO

* There's no sound. 

* The fullscreen code seems to be broken in Safari.

* Collision detection is just touching circles, we could look at the geometry
  as well to get pixel-perfect detection.

* Collision physics just exchanges the two velocities, we could do true
  billiard-ball collisions.

* The shaders are very crude for that retro look. An option to use fancy
  shaders would be fun. 

* If running locally, you need to tell your browser to allow JS to access
  file:// URLs. For example, in Chrome on Mac:

  	/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --allow-file-access-from-files
 
# Author

John Cupitt
