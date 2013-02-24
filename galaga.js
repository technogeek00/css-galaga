// GALAGA CONSTANTS
var SCALE = 2;
var FPS = 60;
var SPEED = 1000 / FPS;
var SOUNDS_ON = true;
var WIDTH, HEIGHT, FIGHTER_WIDTH;
var MAX_MISSLES = 3;
var ENEMY_TYPES = ["yellow", "red", "commander"];

// Galaga game state
var gamePhase = -1;
var steps = 0;
var leftDown, rightDown = false;
var playArea, starField, playerScore, fighter;
// specific holders
var GAME_OBJECTS = [];
var SOUNDS = [];

// called whenever a key is pressed down
function keysDown(e) {
	if((e.keyCode == 37 || e.keyCode == 65) && !leftDown) {
		leftDown = true;
		rightDown = false;
	}
	if((e.keyCode == 39 || e.keyCode == 68) && !rightDown) {
		leftDown = false;
		rightDown = true;
	}
	if(e.keyCode == 13 && gamePhase == -1) {
		buildLevel();
	}
}

// called whenever a key is lifted up
function keysUp(e) {
	if(e.keyCode == 37 || e.keyCode == 65) {
		leftDown = false;
	}
	if(e.keyCode == 39 || e.keyCode == 68) {
		rightDown = false;
	}
	if(e.keyCode == 32 && (gamePhase == 1 || gamePhase == 2)) {
		fireMissle();
	}
}

// moves the ship left iff the left arrow is being held
function moveShipLeft() {
	if(leftDown) {
		if(((fighter.position().left - (FIGHTER_WIDTH / 2)) / SCALE) - 2 > 0) {
			fighter.css('left', "-=2");
			return true;
		}
	}
	return false;
}

// moves the ship right iff the right arrow is being held
function moveShipRight() {
	if(rightDown) {
		if(((fighter.position().left - (FIGHTER_WIDTH / 2)) / SCALE) + 1 < (WIDTH - FIGHTER_WIDTH * 2)) {
			fighter.css('left', "+=2");
			return true;
		}
	}
	return false;
}

// animates the game, general method always called on interval
function animate() {
	moveShipRight();
	moveShipLeft();
	if(GAME_OBJECTS["missles"].length > 0) {
		stepMissle();
	}
	if(steps % 60 == 0) {
		animateEnemies();
	}
	steps++;
	if(steps == 600) {
		steps = 0;
	}
	
	// check if game has been finished
	if(isGameOver() && gamePhase == 1){
		displayEnd();
	}
}

function isGameOver() {
	var finished = true;
	for(var t in ENEMY_TYPES) {
		var type = ENEMY_TYPES[t];
		if(GAME_OBJECTS[type].length > 0) {
			finished = false;
		}
	}
	return finished;
}

function displayEnd() {
	SOUNDS["start"].currentTime=0;
	SOUNDS["start"].play();
	gamePhase = 2;
	$('message').text('Level Complete');
	$('message').show();
}

// fires a new missle
function fireMissle() {
	// galaga rules, only 3 at a time
	if(GAME_OBJECTS["missles"].length < MAX_MISSLES) {
		var missle = $(document.createElement('missle'));
		missle.addClass("alt");
		playArea.append(missle);
		missle.css({'position':'absolute', 'top':(fighter.position().top / SCALE) - 1, 'left':(fighter.position().left / SCALE) + 2, '-webkit-animation':'missles 1s linear infinite'});
		if(SOUNDS_ON) {
			SOUNDS["firing"].pause();
			SOUNDS["firing"].currentTime=0;
			SOUNDS["firing"].play();
		}
		GAME_OBJECTS["missles"][GAME_OBJECTS["missles"].length] = missle;
	}
}

//Handles missle animation, called by animate
function stepMissle() {
	for(var i in GAME_OBJECTS["missles"]) {
		var missle = GAME_OBJECTS["missles"][i];
		var isPlayer = missle.hasClass('alt');
		var position = missle.position();
		var ypos = position.top / SCALE;
		var xpos = position.left / SCALE;
		if((isPlayer && ypos <= 0) || (!isPlayer && ypos >= HEIGHT)) {
			missle.remove();
			GAME_OBJECTS["missles"].splice(i, 1);
		} else {
			if(hasHitEnemy(xpos, ypos)) {
				missle.remove(); // take it off the screen
				GAME_OBJECTS["missles"].splice(i, 1);
				if(SOUNDS_ON) {
					SOUNDS["kill"].pause();
					SOUNDS["kill"].currentTime=0;
					SOUNDS["kill"].play();
				}
			}
		}
	}
}

function updateScore(enemy) {
	var score = parseInt(playerScore.attr('data-points'));
	if(enemy[0].nodeName == 'COMMANDER') {
		score += 150;
	} else if(enemy.hasClass('red')) {
		score += 80;
	} else if(enemy.hasClass('yellow')) {
		score += 50;
	}
	playerScore.attr('data-points',score);
	playerScore.text(score);
}

function hasHitEnemy(x, y) {
	for(var t in ENEMY_TYPES) {
		var type = ENEMY_TYPES[t];
		for(var e in GAME_OBJECTS[type]) {
			var enemy = GAME_OBJECTS[type][e];
			var pos = enemy.dom.position();
			var xe = pos.left / SCALE;
			var ye = pos.top / SCALE;
			var width = enemy.width;
			var height = enemy.height;
			var inside = ((xe <= (x + 3) && x <= (xe + width)) && (ye <= (y + 8) && y <= (ye + height)));
			if(inside) {
				if(enemy.dom[0].nodeName == 'COMMANDER' && !enemy.dom.hasClass('hit')) {
					enemy.dom.addClass('hit');
				} else {
					enemy.dom.remove();
					GAME_OBJECTS[type].splice(e, 1);
					updateScore(enemy.dom);
				}
				return true;
			}
		}
	}
	return false;
}

// methods to create default versions of enemies
function createMinionRed() {
	var redBase = $(document.createElement('minion'));
	redBase.addClass('red enemy');
	redBase.css({'position':'absolute','-webkit-transform':'rotate(180deg)', '-moz-transform':'rotate(180deg)', '-o-transform':'rotate(180deg)'});
	return $(redBase);
}

function createMinionYellow() {
	var yellowBase = $(document.createElement('minion'));
	yellowBase.addClass('yellow enemy');
	yellowBase.css({'-webkit-transform':'rotate(180deg)', '-moz-transform':'rotate(180deg)', '-o-transform':'rotate(180deg)'});
	return $(yellowBase);
}

function createCommander() {
	var commanderBase = $(document.createElement('commander'));
	commanderBase.addClass('enemy');
	return $(commanderBase);
}

function createCommanderHit() {
	var commanderBase = $(document.createElement('commander'));
	commanderBase.addClass('enemy hit');
	return $(commanderBase);
}

function createGyaraga() {
	var gyaragaBase = $(document.createElement('gyaraga'));
	return $(gyaragaBase);
}

function buildLevel() {
	gamePhase = 0;
	$('message').text('Ready?');
	fighter = createGyaraga();
	fighter.attr('id', 'fighter');
	playArea.append(fighter);
	FIGHTER_WIDTH = parseInt($(fighter).css('margin'));
	fighter.css('top', HEIGHT - (FIGHTER_WIDTH * 2) - 2);
	fighter.css('left', (WIDTH / 2) - FIGHTER_WIDTH);
	// get ready to loop
	var xoffset = WIDTH / 2 - 40;
	var yoffset = 20;
	// reset onscreen arrays;
	GAME_OBJECTS["commander"] = [];
	GAME_OBJECTS["red"] = [];
	GAME_OBJECTS["yellow"] = [];
	for(var i = 0; i < 4; i++) {
		var offset = 20 * i;
		var commanderClone;
		if(i % 2 == 0) {
			commanderClone = createCommander();
		} else {
			commanderClone = createCommanderHit();
		}
		commanderClone.css({'top':yoffset, 'left':xoffset + offset});
		commanderClone.addClass('docked');
		playArea.append(commanderClone);
		var h = Math.abs(parseInt(commanderClone.css('margin-top'))) * 2 + 1;
		var w = Math.abs(parseInt(commanderClone.css('margin-left'))) * 2 + 1;
		GAME_OBJECTS["commander"][i] = { dom : commanderClone, origin : {x: xoffset + offset, y: yoffset}, height : h, width : w};
	}
	yoffset += 20;
	xoffset = WIDTH / 2 - 80;
	for(var j = 0; j < 2; j++) {
		for(var i = 0; i < 8; i++) {
			var offset = 20 * i;
			var rclone = createMinionRed();
			rclone.css({'top':yoffset, 'left':xoffset + offset});
			rclone.addClass('docked');
			playArea.append(rclone);
			var h = Math.abs(parseInt(rclone.css('margin-top'))) * 2 + 1;
			var w = Math.abs(parseInt(rclone.css('margin-left'))) * 2 + 1;
			GAME_OBJECTS["red"][i+(j*8)] = { dom : rclone, origin : {x: xoffset + offset, y: yoffset}, height : h, width : w};
		}
		yoffset += 15;
	}
	xoffset = WIDTH / 2 - 100;
	GAME_OBJECTS["yellow"] = [];
	for(var j = 0; j < 2; j++) {
		for(var i = 0; i < 10; i++) {
			var offset = 20 * i;
			var yclone = createMinionYellow();
			yclone.css({'top':yoffset, 'left':xoffset + offset});
			yclone.addClass('docked');
			playArea.append(yclone);
			var h = Math.abs(parseInt(yclone.css('margin-top'))) * 2 + 1;
			var w = Math.abs(parseInt(yclone.css('margin-left'))) * 2 + 1;
			GAME_OBJECTS["yellow"][i+(j*10)] = { dom : yclone, origin : {x: xoffset + offset, y: yoffset}, height : h, width : w};
		}
		yoffset += 15;
	}
	
	// setup the reserves
	var reserve = createGyaraga();
	reserve.addClass('reserve');
	$('.footer').append(reserve.clone()).append(reserve);
	// start the ready
	if(SOUNDS_ON) {
		$(SOUNDS["theme"]).bind('ended', readyPause);
		SOUNDS["theme"].play();
	} else {
		setTimeout(readyPause, 500);
	}
}

function hideMessage() {
	$(SOUNDS["start"]).unbind('ended');
	$('message').hide();
}

function readyPause() {
	$('message').text('Level 1');
	if(SOUNDS_ON) {
		$(SOUNDS["start"]).bind('ended', hideMessage);
		SOUNDS["start"].play();
	} else {
		$('message').hide();
	}
	setInterval(animate, SPEED);
	gamePhase = 1;
}

function animateEnemies() {
	// access stored elements to save dom lookup speed
	for(var i in GAME_OBJECTS["commander"]) {
		GAME_OBJECTS["commander"][i].dom.toggleClass('alt');
	}
	
	for(var i in GAME_OBJECTS["red"]) {
		GAME_OBJECTS["red"][i].dom.toggleClass('alt');
	}
	for(var i in GAME_OBJECTS["yellow"]) {
		GAME_OBJECTS["yellow"][i].dom.toggleClass('alt');
	}
}

function pageReady() {
	$('message').text('Press Enter to Start');
	if(SOUNDS_ON) {
		SOUNDS["coin"].play();
	}
}

function setupStars() {
	GAME_OBJECTS["stars"] = [];
	for(var i = 0; i < 100; i++) {
		var star = $(document.createElement('star'));
		var stary = Math.floor(Math.random() * HEIGHT);
		var starx = Math.floor(Math.random() * WIDTH);
		var animInfo = "twinkle 5s " + (i % 10) + "s linear infinite";
		star.css({'top':stary, 'left':starx, '-webkit-animation':animInfo});
		starField.append(star);
		GAME_OBJECTS["stars"][i] = star;
	}
}

function onWindowLoaded() {
	// screen information
	playArea = $('playarea');
	starField = $('starfield');
	playerScore = $('playerscore');
	WIDTH = playArea.innerWidth();
	HEIGHT = playArea.innerHeight();
	SOUNDS["theme"] = $('#theme')[0];
	SOUNDS["start"] = $('#start')[0];
	SOUNDS["firing"] = $('#firing')[0];
	SOUNDS["coin"] = $('#coin')[0];
	SOUNDS["kill"] = $('#kill')[0];
	GAME_OBJECTS["missles"] = [];
	setupStars();
	// set into default position
	$(document).bind('keydown', keysDown);
	$(document).bind('keyup', keysUp);
	$(document).ready(pageReady);
}

window.onload = onWindowLoaded;
