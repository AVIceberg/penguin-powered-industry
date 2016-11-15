// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.

window.onload=function(){ creatjsinit(); };


var stage;
var link;
var container;
var circle;
$(document).ready(function(){
  $.get("http://ipinfo.io", function (response) {
    link = "https://maps.googleapis.com/maps/api/staticmap?size=640x640&sensor=false&zoom=10&key=AIzaSyDuUn1x0ZoXHX-CorcQkOO1nTTi3_nthNI&center=" + response.loc ;
  }, "jsonp");

});
function creatjsinit(){

  stage = new createjs.Stage("demoCanvas");
  circle = new createjs.Shape();
  container = new createjs.Container();





  console.log(link);
  var image = new Image();
  image.src = link;




  image.onload = function(){handleImageLoad(event,image);};

  //container.setChildIndex(circle,1);
  //container.setChildIndex(image,0);


/*

  createjs.Tween.get(circle, { loop: true })
  .to({ x: 400 }, 1000, createjs.Ease.getPowInOut(4))
  .to({ alpha: 0, y: 175 }, 500, createjs.Ease.getPowInOut(2))
  .to({ alpha: 0, y: 225 }, 100)
  .to({ alpha: 1, y: 200 }, 500, createjs.Ease.getPowInOut(2))
  .to({ x: 100 }, 800, createjs.Ease.getPowInOut(2));*/

  //createjs.Ticker.setFPS(60);
  //createjs.Ticker.addEventListener("tick", stage);

  stage.update();
  createjs.Ticker.setFPS(40);
  createjs.Ticker.addEventListener("tick",tick);


//$(document).ready(function(){$.get("http://ipinfo.io", function (response) { $("#map").html("<img src='https://maps.googleapis.com/maps/api/staticmap?size=600x300&sensor=false&zoom=10&center=" + response.loc +"'/>"); }, "jsonp");});


}





function tick() {
    stage.update();
}

function handleImageLoad(event,image) {
            var bitmap = new createjs.Bitmap(image);
            bitmap.scaleX=1.25;
            bitmap.scaleY=1.25;
            container.addChild(bitmap);
            circle.graphics.beginFill("DeepSkyBlue").drawCircle(0, 0, 50);
            circle.x = 300;
            circle.y = 200;
            container.addChild(circle);


            var homepath = $("#home").data("pathToAsset");
            var image2 = new Image();
            image2.src = homepath;
            var bitmap2 = new createjs.Bitmap(image2);
            bitmap2.x=200;
            bitmap2.y=200;
            stage.addChild(container);
            enableDrag(bitmap2);
            enableDrag(circle);

            container.addChild(bitmap2);

            //stage.enableMouseOver();
            //stage.cursor = "none";

            stage.canvas.style.cursor = 'none';

            var bgShape = new createjs.Shape();
            bgShape.graphics.beginFill("red").drawRect(0, 0, 30, 30);
            bgShape.x=-200;
            bgShape.y=-200;

            stage.addChild(bgShape);


            drawgridline();

            stage.addEventListener("stagemousemove",function(){
              bgShape.x=stage.mouseX;
              bgShape.y=stage.mouseY;
            });

            stage.update();
}


function drawgridline(){



}


function enableDrag(item) {
    console.log(2);
    // OnPress event handler
/*
    item.addEventListener("pressmove",function(evt){
      var offset = {  x:item.x-evt.stageX,
                        y:item.y-evt.stageY};

        // Bring to front
        container.addChild(item);

        // Mouse Move event handler
        evt.onMouseMove = function(ev) {

            item.x = ev.stageX+offset.x;
            item.y = ev.stageY+offset.y;
            stage.update();
        };
    });*/


    item.on("pressmove", function(evt) {
      evt.target.x = evt.stageX;
      evt.target.y = evt.stageY;
    });



    item.onClick = function(evt) {
      console.log(1);
        var offset = {  x:item.x-evt.stageX,
                        y:item.y-evt.stageY};

        // Bring to front
        container.addChild(item);

        // Mouse Move event handler
        evt.onMouseMove = function(ev) {

            item.x = ev.stageX+offset.x;
            item.y = ev.stageY+offset.y;
            stage.update();
        };
    };
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
