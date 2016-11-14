// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.

window.onload=function(){ pixi1(); initialize();};
function init(){

  var stage = new createjs.Stage("demoCanvas");
  var circle = new createjs.Shape();
  circle.graphics.beginFill("DeepSkyBlue").drawCircle(0, 0, 50);
  circle.x = 100;
  circle.y = 100;
  stage.addChild(circle);
  stage.update();

  createjs.Tween.get(circle, { loop: true })
  .to({ x: 400 }, 1000, createjs.Ease.getPowInOut(4))
  .to({ alpha: 0, y: 175 }, 500, createjs.Ease.getPowInOut(2))
  .to({ alpha: 0, y: 225 }, 100)
  .to({ alpha: 1, y: 200 }, 500, createjs.Ease.getPowInOut(2))
  .to({ x: 100 }, 800, createjs.Ease.getPowInOut(2));

  createjs.Ticker.setFPS(60);
  createjs.Ticker.addEventListener("tick", stage);

}
function init2(){

  var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser', { preload: preload, create: create, update: update });

}
var renderer;
var stage;
var bunny;
function pixi1(){

  // You can use either `new PIXI.WebGLRenderer`, `new PIXI.CanvasRenderer`, or `PIXI.autoDetectRenderer`
// which will try to choose the best renderer for the environment you are in.
renderer = new PIXI.autoDetectRenderer(800, 600);
renderer.backgroundColor = 0x061639;

// The renderer will create a canvas element for you that you can then insert into the DOM.
document.body.appendChild(renderer.view);

// You need to create a root container that will hold the scene you want to draw.
 stage = new PIXI.Container();

// Declare a global variable for our sprite so that the animate function can access it.

bunny = null;
// load the texture we need
var bunnyPath = $("#bunnypath").data("pathToAsset");
console.log(bunnyPath);
PIXI.loader.add('bunny',bunnyPath).load(function (loader, resources) {
    // This creates a texture from a 'bunny.png' image.

    bunny = new PIXI.Sprite(resources.bunny.texture);
    //var texture1 = PIXI.utils.TextureCache[bunnyPath];
    //bunny = new PIXI.Sprite(texture1);
    //bunny = new PIXI.Sprite(PIXI.loader.resources[bunnyPath].texture);

    // Setup the position and scale of the bunny
    bunny.position.x = 400;
    bunny.position.y = 300;

    bunny.scale.x = 2;
    bunny.scale.y = 2;

    // Add the bunny to the scene we are building.
    stage.addChild(bunny);

    // kick off the animation loop (defined below)
    animate();

});



}
function animate() {
    // start the timer for the next animation loop
    requestAnimationFrame(animate);

    // each frame we spin the bunny around a bit
    bunny.rotation += 0.01;

    // this is the main render call that makes pixi draw your container and its children.
    renderer.render(stage);
}

function preload() {
}

function create() {
}

function update() {
}


// GAME LOGIC //
// Initializes all necessary JS variables and adds required events
function initialize()
{
    var clickingArea = document.getElementById("clicking-area");

    // Temporary Appearance for clicking canvas
    var click = clickingArea.getContext("2d");
    click.fillStyle=("#48489D");
    click.fillRect(0, 0, 200, 200);
   // Clicking Canvas appearance ends

    document.getElementById("nickname").innerHTML = gon.strNickname + "'s Workshop";
    document.getElementById("clicking-area").addEventListener("click", incrementToys, false);
    updateToys();

}
// Increments the user's local toys (gon.iToys) by an amount determined by their given multiplier.
function incrementToys()
{
  var iBase = 1;
  var fMultiplier = 1; // Placeholder

  gon.iToys = gon.iToys + iBase * fMultiplier;
  updateToys();
}

// Updates the displayed toys on screen
function updateToys()
{
  document.getElementById("toys").innerHTML = gon.iToys + " toys";
}
var callSave = function(){
$.ajax({
  url: "save",
  type: "put",
  data: {toys: Number(gon.iToys)}
});
}

$(document).on("click", "#save-button", callSave);
