CSS Galaga 
==========

Recreating classical Galaga in HTML/JS/CSS.

The idea behind this project is: Can I rebuild Galaga, to scale, with only CSS and Javascript? After playing around with some css tricks I found the box-shadow method to be the best method for recreating pixels without images. I created a secondary project that would take a picture and produce css to render it. Now that I had the sprites it was time to implement the logic. It is just basic movement and missle fire, some day I will get back to implementing enemy flight and attack from my notes.

Controls
========
When running the game, wait for the sound to load, you will be prompted with the classical Galaga coin insert noise when everything is ready to go. The beginning level sound will play and then the game will commence. Use the `left` and `right` arrow keys to move back and forth and use the `space` key to fire missles.

Running Version
===============
http://zacharycava.com/games

Notes About Performance
=======================
The game is not very optimized at the moment and requires some heafty hardware to run, though I have been able to successfully run it on an ASUS 1000HE netbook, so any moderate hardware should do. You must play the game in Chrome though because of render differences in Firefox and absolute destruction in IE. Its just a project for fun, I am not to concerned with cross browser support at the moment. Perhaps in the future.
