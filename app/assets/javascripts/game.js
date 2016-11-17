// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.

window.onload=function(){ creatjsinit(); };

var pressobject;
var stage;
var link;
var container;
var circle;
var mapsave=[];
var buildingData={"home2":4};
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
  image.crossOrigin = "Anonymous";
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

  //stage.update();
  //createjs.Ticker.setFPS(40);
  //createjs.Ticker.addEventListener("tick",tick);


//$(document).ready(function(){$.get("http://ipinfo.io", function (response) { $("#map").html("<img src='https://maps.googleapis.com/maps/api/staticmap?size=600x300&sensor=false&zoom=10&center=" + response.loc +"'/>"); }, "jsonp");});


}





function tick() {
    stage.update();
}

function handleImageLoad(event,image) {



            container.x=(800-640/1.25)/2;
            var bitmap = new createjs.Bitmap(image);
            var buildscon=createbuild(image);
            bitmap.scaleX=0.75;
            bitmap.scaleY=0.75;
            container.addChild(bitmap);
            var line = drawgridline(container);
            container.addChild(line);
            circle.graphics.beginFill("DeepSkyBlue").drawCircle(0, 0, 50);
            circle.x = 300;
            circle.y = 200;
            //container.addChild(circle);

            bitmap.addEventListener("rollover",function(){
                        console.log(4);
                      });



            //bitmap2.x=200;
            //bitmap2.y=200;
            stage.addChild(container);

            enableDrag(circle);

            //container.addChild(bitmap2);

            stage.enableMouseOver();
            //stage.cursor = "none";

            //stage.canvas.style.cursor = 'none';

            var bgShape = new createjs.Shape();
            bgShape.graphics.beginFill("red").drawRect(0, 0, 30, 30);
            bgShape.x=-200;
            bgShape.y=-200;

            stage.addChild(bgShape);
            stage.addChild(buildscon);



            container.setChildIndex(bitmap,0);
            container.setChildIndex(line,1);
            container.setChildIndex(circle,container.getNumChildren()-1);

            //container.removeChild(image2.parent);

            //var line = new createjs.Graphics();
            //line.beginStroke('cyan');
            //line.moveTo(50,50);
            //line.lineTo(100,100);
            //line.endStroke();


            /*
            stage.addEventListener("stagemousemove",function(){
              bgShape.x=stage.mouseX;
              bgShape.y=stage.mouseY;
            });
            container.addEventListener("click",function(){
              console.log(4);
            });*/

            //stage.update();
}


function createbuild(image){

  var bdcon=new createjs.Container();
  var width=image.width;
  var height=image.height;
  console.log(buildingData);
  bdcon.x=(800-width/1.25)/2;
  bdcon.y=height/1.25;
  bdcon.setBounds((800-width/1.25)/2,height,width,800-height);
  var xlen=0;
  for(var x in buildingData){
    if (x!="_proto_"){

      var path=$("#"+x).data("pathToAsset");
      var tempimg=new Image();
      console.log(path);
      tempimg.src=path;
      tempimg.onload = function(){

        var bitm=new createjs.Bitmap(tempimg);
        console.log(tempimg);
        //bitm.x=xlen;

        for(var i=0;i<buildingData[x];i++){
          var tempbit=bitm.clone();
          tempbit.x=xlen;
          //console.log(tempbit.getBounds());
          bdcon.addChild(tempbit);
          enableDrag(tempbit);
          if(i!=buildingData[x]-1){

            xlen+=tempbit.getBounds().width*1.5;
          }
        }

      };



      xlen+=tempimg.width*1.5;
      console.log(x);
    }

  }
/*
  var homepath = $("#home2").data("pathToAsset");
  console.log(homepath);
  var image2 = new Image();
  image2.src = homepath;
  var bitmap2 = new createjs.Bitmap(image2);
  bdcon.addChild(bitmap2);
  console.log(image2.width);
  enableDrag(bitmap2);
*/
  return bdcon;



}


function drawgridline(ct){
  var number=5;

  var array=[[1,1,0,0,0],[1,1,0,0,0],[1,1,1,1,1],[1,1,1,1,0],[1,1,1,1,1]];
  var array2=[[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1]];
  var line = new createjs.Shape();
  line.graphics.beginStroke('black');

  var width=ct.getBounds().width/number;
  var height=ct.getBounds().height/number;
  var x=0;
  for(var i=0; i<number; i++){
    var y=0;

    for(var j=0;j<number;j++){

      if(array[i][j]==1){
        //line.graphics.moveTo(x,y);
        //line.graphics.lineTo(x+width,y);
        //line.graphics.lineTo(x+width,y+height);
        //line.graphics.lineTo(x,y+height);
        //line.graphics.lineTo(x,y);
        var newsquare=grid(i,j,height,width);
        //createjs.Tween.get(newsquare,{loop:true})
        //  .to({scaleX:0,scaleY:0},1000,createjs.Ease.getPowInOut(2));
        //stage.enableMouseOver(10);
  /*      newsquare.on("mouseover",function(evt){
          console.log(3);
          square.filters = [
           new createjs.ColorFilter(0,0,0,1, 0,0,255,0)
          ];
          square.cache(0, 0, width,height);
        });*/

        container.addChild(newsquare);

        //createjs.Tween.get(newsquare,{loop:true})
          //.to({x:50,y:50}),1000,createjs.Ease.getPowInOut(2);

      }
      y+=height;



    }
    x+=width;
  }

  //line.graphics.moveTo(50,50);
  //line.graphics.lineTo(100,100);
  line.graphics.endStroke();

  createjs.Ticker.setFPS(40);
  createjs.Ticker.addEventListener("tick",tick);

  return line;


}

function grid(i,j,height,width){

  var smallgrid = new createjs.Container();
  var square = new createjs.Shape();
  smallgrid.x=i*width;
  smallgrid.y=j*height;
  smallgrid.setBounds(i*width,j*height,width,height);
  smallgrid.i=i;
  smallgrid.j=j;
  square.graphics.beginStroke("rgba(255,0,0,1)");
  square.graphics.drawRect(0,0,width,height);
  square.graphics.endStroke();
  var twn;

  var boundary = new createjs.Shape();
  boundary.graphics.beginStroke("rgba(0,0,0,1)");
  boundary.graphics.drawRect(0,0,width,height);
  boundary.graphics.endStroke();
  boundary.graphics.beginFill("rgba(0,0,0,0.1)").drawRect(0,0,width,height);

  smallgrid.addChild(boundary);

  smallgrid.hitArea=boundary;
  //console.log(smallgrid.getBounds());
  smallgrid.width=width;
  smallgrid.height=height;
  smallgrid.building=false;
  smallgrid.on("mouseover",function(evt){
    smallgrid.addChild(square);
    console.log(3);
    createjs.Tween.get(square,{loop:true})
    .to({scaleX:0,scaleY:0,x:width/2,y:height/2},1000,createjs.Ease.getPowInOut(1.5));
    /*
    square.filters = [
     new createjs.ColorFilter(0,0,0,1, 0,0,255,0)
   ];*/
    square.cache(0, 0, width,height);
  });
  smallgrid.on("mouseout",function(evt){
    createjs.Tween.removeTweens(square);
    smallgrid.removeChild(square);
    console.log(3);
    /*
    square.filters = [
     new createjs.ColorFilter(0,0,0,1, 255,0,0,0)
   ];*/
    square.cache(0, 0, width,height);
  });
  smallgrid.on("pressup",function(evt){
    console.log(8);
    if(pressobject!=null){
      pressobject.x=0;
      pressobject.y=0;
      smallgrid.addChild(pressobject.clone());
      pressobject=null;
    }


  });

  return smallgrid;

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

    var ofs;
    item.on("pressmove", function(evt) {
      //console.log(""+item.x+" "+evt.stageX);
      pressobject.x = evt.stageX-ofs.x;
      pressobject.y = evt.stageY-ofs.y;
    });

    item.on("mousedown", function(evt) {
      ofs = {  x:evt.stageX-evt.target.parent.x-evt.target.x,
                        y:evt.stageY-evt.target.parent.y-evt.target.y};
      pressobject=evt.target.clone();

      stage.addChild(pressobject);
      evt.target.parent.removeChild(evt.target);
    });
    item.on("pressup", function(evt) {
      stage.removeChild(pressobject);
      var ccon = container.getObjectsUnderPoint(evt.stageX-container.x,evt.stageY-container.y);

      //console.log(ccon);

      if(typeof ccon!="undefined"&&ccon.length>0&&typeof ccon[0].i!= "undefined"&&ccon[0].building==false){
        pressobject.x=(ccon[0].width-pressobject.getBounds().width)/2-pressobject.getBounds().x;
        pressobject.y=(ccon[0].height-pressobject.getBounds().height)/2-pressobject.getBounds().y;
        ccon[0].addChild(pressobject.clone());
        ccon.building=true;
        pressobject=null;
        mapsave.push({i:ccon[0].i,j:ccon[0].j});
        createjs.Tween.get(ccon[0],{loop:true}).to({alpha:0.5},800,createjs.Ease.getPowInOut(2));
      }


      //




    });




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
