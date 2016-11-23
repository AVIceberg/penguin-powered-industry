// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.

// Initializes game logic and the map
window.onload=function(){ createjsinit(); initialize(); };

var pressobject; // Tracks the building currently being placed
var stage;
var mouse = {x : -100, y : -100, press : false};
var gridondrag = [];
var mouseoffset = [0, 0];
var stageCanvas; // The primary canvas (Map)
var link;
var container;
var circle;
var mapsave=[];
var buildingData=[{name:"home2",number:4,x:2,y:3}];
var temporaryCursor;
var buildingPen;
var objectonpress;
var buildingPenHelper = [0, 0, 0, 0, 0, 0, 0, 0];



function createjsinit(){
  stage = new createjs.Stage("demoCanvas");
  stageCanvas = new createjs.Stage("gamecanvas");
  // Draws the grid-based map and populates each square with a container
  for (x = 0 ; x < gon.iMapSize ; x = x + 100)
  {
    for (y = 0 ; y < gon.iMapSize ; y = y + 100)
    {
      var strType = getTerrainType(gon.strMapSave[y / 100][x / 100]); // Read map data to determine what goes here
      var gridSquare = getGridSquare(x, y, 100, 100, strType); // Fetches a container for the square

      // Adds the grid tile to the canvas
      stageCanvas.addChild(gridSquare);
      stageCanvas.update();
    }
  }
  stageCanvas.enableMouseOver(); // Enables mouseover events for the canvas

  // Builds building pen
  buildingPen = getBuildingPen(0, gon.iMapSize, 800, 100);
  stageCanvas.addChild(buildingPen);
  stageCanvas.update();

  // Load buildings
  loadAllBuildings();
  
  mousemove(stageCanvas);

  // Sets up ticker
  createjs.Ticker.setFPS(40);
  createjs.Ticker.addEventListener("tick",tick);
}


function mousemove(stg){
  
  
  
  
  
  stg.on("stagemousemove", function(evt) {
    
    if (pressobject != null){
        
      
      
      
        
      var coordinates = pressobject.coordinates;
        
      pressobject.x = evt.stageX-coordinates.x;
      pressobject.y = evt.stageY-coordinates.y;
      
      var left = evt.stageX - coordinates.tilewidth*100/2;
      var right = evt.stageX + coordinates.tilewidth*100/2;
      var up = evt.stageY - coordinates.tileheight*100/2;
      var down = evt.stageY + coordinates.tileheight*100/2;
      
      if (left <= gon.iMapSize && right >= 0 && up <= gon.iMapSize && down >= 0){
        
        var mouseX = Math.floor(evt.stageX/100);
        var mouseY = Math.floor(evt.stageY/100);
        
        if (mouseX != coordinates.gridX || mouseY != coordinates.gridY){
          
          
          
          coordinates.gridX = mouseX;
          coordinates.gridY = mouseY;
          
          if (gridondrag.length > 0){
            
            for (var k in gridondrag){
            
              gridondrag[k].removeChildAt(gridondrag[k].numChildren - 1);
            
            }
          
            gridondrag = [];
            
          }
          
          if (left < 0){
            left = 0;
          }
          if (right > gon.iMapSize){
            right = gon.iMapSize;
          }
          if (up < 0){
            up = 0;
          }
          if (down > gon.iMapSize){
            down = gon.iMapSize;
          }
          
          var visualEffectProhibit = new createjs.Shape();
          visualEffectProhibit.graphics.beginFill("yellow").drawRect(0, 0, 100, 100);// Yellow means player cannot place at this grid.
          visualEffectProhibit.alpha = 0.20;
          
          var visualEffect = new createjs.Shape();
              
          visualEffect.graphics.beginFill("#5FFF5f").drawRect(0, 0, 100, 100);
          visualEffect.alpha = 0.10;
          
          
          
          for (var i = left; i < right; i += 100){
        
            for (var j = up; j < down; j += 100){
              
          
              var gridcontainer = stageCanvas.getChildByName("" + Math.floor(i/100) + Math.floor(j/100));
              
              
              
              
              if (gridcontainer.terrainType == "Plains" && gridcontainer.isBuilding == false){
                gridcontainer.addChild(visualEffect.clone());
              }
              else{
                gridcontainer.addChild(visualEffectProhibit.clone());
              }
              
              gridondrag.push(gridcontainer);
          
            }
          }
        }
      }
        
    }
      
      
  });
  
}


function loadAllBuildings()
{
  // Searches through to find any existant buildings and places them as appropriate
  for (x = 0 ; x < gon.iMapSize ; x = x + 100)
  {
    for (y = 0 ; y < gon.iMapSize ; y = y + 100)
    {
      var strType = (gon.strBuildingMapSave[x / 100][y / 100]); // Read map data to determine what goes here
      if (strType != "0")
      {
        var colour = "Green";
        if (strType == "Labour Camp")
        {
          colour = "Brown";
        }
        else if (strType == "Toy Mine")
        {
          colour = "Grey";
        }

        pressobject = new createjs.Shape();
        pressobject.graphics.beginStroke("black").beginFill("Brown")
        .drawCircle(50, 50, 50);
        pressobject.type = strType;
        pressobject.placement = 0;
        buildingEventSetup(pressobject);

        gridSquare = stageCanvas.getObjectUnderPoint(x, y, 0);
        gridSquare.dispatchEvent("click")
      }
    //  stageCanvas.addChild(gridSquare);
    //  stageCanvas.update();
    }
  }
}

// Determines the terrain type of the grid spot and returns its colour.
function getTerrainType(squareData)
{
  if (squareData == "P")
  {
    return "Plains";
  }
  else if (squareData == "W")
  {
    return "Water";
  }
  else
  {
      return "Error";
  }
}

function getTerrainColour(strTileData)
{
  if (strTileData == "Plains")
  {
    return "White";
  }
  else if (strTileData == "Water")
  {
    return "#89cff0";
  }
  else
  {
      return "Green";
  }
}

function buildingEventSetup(building)
{
  var coordinates;

  building.on("click", function(event) {
    if (pressobject == null)
    {
      coordinates = { x:event.stageX - event.target.parent.x - event.target.x,
                      y:event.stageY - event.target.parent.y - event.target.y,
                      gridX: -100,
                      gridY: -100,
                      tilewidth: event.target.tilewidth,
                      tileheight: event.target.tileheight,
                      container: event.target.parent,
                      originX: event.target.x,
                      originY: event.target.y};
      
      
      pressobject = event.target.clone(true);
      pressobject.type = event.target.type;
      pressobject.placement = event.target.placement;
      pressobject.coordinates = coordinates;
      pressobject.x = event.stageX - coordinates.x;
      pressobject.y = event.stageY - coordinates.y;
      
      event.target.parent.removeChild(event.target);
      
      
      
      
      stageCanvas.addChild(pressobject);
      
      
      
      
    }
  });
  
  
  
  
  
  
  
}

function tick() {
  
    
  
    
    
  
    stage.update();
    stageCanvas.update();
}


function getBuildingPen(x, y, width, height)
{
  buildingPen = new createjs.Container();
  var visualPen = new createjs.Shape();

  buildingPen.x = x;
  buildingPen.y = y;
  buildingPen.setBounds(x * width, y * height, width, height);
  buildingPen.capacity = 8;
  buildingPen.currentCapacity = 0;

  visualPen.graphics.beginStroke("black").drawRect(0, 0, width, height);
  buildingPen.addChild(visualPen);
  buildingPen.mouseChildren = true; // Enables events for children of the pen
  return buildingPen;
}

function purchaseBuilding(event)
{
  var building = new createjs.Shape();
  var colour;

  // If pen is full, do not buy a new building
  if (buildingPen.currentCapacity >= 8)
    return;

  switch(event.target.strBuildingType)
  {
    case "Labour Camp":
      if (gon.iToys >= 100)
      {
        colour = "Brown";
        gon.iToys = gon.iToys - 100;
        updateToys();
      }
      else
      {
        document.getElementById("error").innerHTML = "At least 100 toys are required to buy a Labour Camp!";
        colour = "Invalid";
        errorClearInterval = 0;
      }
      break;
    case "Toy Mine":
      colour = "Grey";
      break;
    default:
      colour = "Invalid";
      break;
  }

  if (colour == "Invalid")
    return;
  i = 0;
  while (buildingPenHelper[i] != 0 && i <= 7)
    i++;

  building.graphics.beginStroke("black").beginFill(colour)
  .drawCircle(50 + i * 100, 50, 50);
  buildingPenHelper[i] = 1;
  building.type = event.target.strBuildingType;
  building.placement = i;
  buildingEventSetup(building);
  buildingPen.addChild(building);
  buildingPen.currentCapacity += 1;
  
  building.tilewidth = 2;
  building.tileheight = 3;
  
  return;
}

// Builds a grid tile for use in the map
function getGridSquare(x, y, width, height, strType)
{
  var gridSquare = new createjs.Container(); // Primary container
  var visualEffect = new createjs.Shape();   // Visual effect upon hover-over
  var visualTerrain = new createjs.Shape();  // Terrain (I.e., visual appearance)

  gridSquare.x = x;
  gridSquare.y = y;
  gridSquare.name = "" + (x/100) + (y/100);
  gridSquare.setBounds(x * width, y * height, width, height);

  // Hover-over colour / transparency
  visualEffect.graphics.beginFill("#5FFF5f").drawRect(0, 0, width, height);
  visualEffect.alpha = 0.10;
  
  var visualEffectProhibit = new createjs.Shape();
  visualEffectProhibit.graphics.beginFill("yellow").drawRect(0, 0, width, height);// Yellow means player cannot place at this grid.
  visualEffectProhibit.alpha = 0.20;

  visualTerrain.graphics.beginStroke("black").beginFill(getTerrainColour(strType)).drawRect(0, 0, width, height); // Draw terrain

  // Set container properties
  gridSquare.addChild(visualTerrain);
  gridSquare.hitArea = visualTerrain;
  gridSquare.width = x * width;
  gridSquare.height = y * height;
  gridSquare.isBuilding = false;
  gridSquare.terrainType = strType; // Stores terrain type for building logic

  // EVENTS

  // To-Do: Display info on current building
  gridSquare.on("mouseover", function(event) {
    if (strType == "Plains" && gridSquare.isBuilding == false){
      gridSquare.addChild(visualEffect);
    }
    else{
      gridSquare.addChild(visualEffectProhibit);
    }
    
  });
  gridSquare.on("mouseout", function(event) {
    gridSquare.removeChildAt(gridSquare.numChildren - 1);
  });

  // Handles cases wherein buildings are being placed on the map
  gridSquare.on("click", function(event) {
    
    
    
    if (pressobject != null) {
      if (gridSquare.terrainType != "Water" && gridSquare.isBuilding == false) // To-do: Expand for different types, make building specific
      {
        
        if (gridondrag.length > 0){
            
            for (var k in gridondrag){
            
              gridondrag[k].removeChildAt(gridondrag[k].numChildren - 1);
            
            }
          
            gridondrag = [];
            
        }
        
        gridSquare.isBuilding = true;
        stageCanvas.removeChild(pressobject);
        pressobject = drawBuildingForMapPlacement(pressobject);
        pressobject.x = 0;
        pressobject.y = 0;
        gridSquare.addChildAt(pressobject, gridSquare.numChildren - 1);
        buildingPenHelper[pressobject.placement] = 0;
        gon.strBuildingMapSave[gridSquare.x / 100][gridSquare.y / 100] = pressobject.type;
        switch(pressobject.type)
          {
          case 'Labour Camp':
            gon.iPassiveIncome = gon.iPassiveIncome + 5;
            break;
          case 'Toy Mine':
            gon.iPassiveIncome = gon.iPassiveIncome + 10;
          }
        pressobject = null;
        buildingPen.currentCapacity--;
        return;
      }
    }
    
    if (gridondrag.length > 0){
            
            for (var k in gridondrag){
            
              gridondrag[k].removeChildAt(gridondrag[k].numChildren - 1);
            
            }
          
            gridondrag = [];
            
    }
    
    // Return the building to the pen
    
    
    var building = pressobject.clone(true);
    building.type = pressobject.type;
    building.placement = pressobject.placement;
    buildingEventSetup(building);
    building.x = pressobject.coordinates.originX;
    building.y = pressobject.coordinates.originY;
    building.tileheight = pressobject.coordinates.tileheight;
    building.tilewidth = pressobject.coordinates.tilewidth;
    buildingPen.addChild(building);
    pressobject.parent.removeChild(pressobject);
    pressobject = null;
  });
  return gridSquare;
}

function drawBuildingForMapPlacement(building)
{
  var colour = "Green"; // Green == Error

  switch(building.type)
  {
    case 'Labour Camp':
      colour = "Brown";
      break;
    case 'Toy Mine':
      colour = "Grey";
      break;
  }
  building.graphics.clear("White");
  building.graphics.beginFill(colour).drawCircle(50, 50, 50);
  return building;
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
    initializeGameEvents();

    document.getElementById("nickname").innerHTML = gon.strNickname + "'s Workshop";
    updateToys();

    var timeinterval = setInterval(updateClock(gon.iTimeLeft), 1000);
}

function initializeGameEvents()
{
  document.getElementById("clicking-area").addEventListener("click", incrementToys, false);
  document.getElementById("buy-labour-camp").addEventListener("click", purchaseBuilding, false);
  document.getElementById("buy-labour-camp").strBuildingType = "Labour Camp";
}
// Increments the user's local toys (gon.iToys) by an amount determined by their given multiplier.
function incrementToys()
{
  var iBase = 1;

  gon.iToys = gon.iToys + iBase * gon.fClickMultiplier;
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
  data: {toys: Number(gon.iToys), time_left: Number(gon.iTimeLeft), map: JSON.stringify(gon.strMapSave),
     building_map: JSON.stringify(gon.strBuildingMapSave)}
});
}

var resetGame = function(gainedLevel){
  $.ajax({
    url: "reset",
    type: "put",
    data: {maxToys: Number(gon.iToys), leveledUp: Boolean(gainedLevel)}
  });
}

$(document).on("click", "#save-button", callSave);


/******CLOCK SCRIPT********/

var errorClearInterval = 0;               //initialization
var eventClearInterval = 0;               //initialization
function updateClock(time_left) {
  function updateClock2() {
    if(time_left <= 1) {
      clearInterval(timeinterval);
      if(gon.iRequiredToys < gon.iToys) {
        var endDecision = confirm("You have won the game!\nClick OK to proceed to the next level\nAlternatively, you can click Cancel to stay on this level");
        window["resetGame"](endDecision);
      }
      else {
        window["resetGame"](false);
      }
    }
    //Clear Error innerHTML after 15 seconds
    if(errorClearInterval == 15) {
      clearErrors();
      errorClearInterval = 0;
    }
    if(eventClearInterval == 300) {
      clearEvents();
    }
    // Events
    if(time_left == 2100 || time_left == 1500 || time_left == 900 || time_left == 540) {         //35 mins, 25 mins, 15 mins, 9 mins
      eventChooser(randomIntFromInterval(1, 3));
      eventClearInterval = 0;
    }
    // Automatic Save
    if((time_left % gon.iSaveInterval == 0) && (time_left % 60 == 0)) {
      callSave();
    }
    errorClearInterval = errorClearInterval + 1;
    time_left = time_left - 1;
    gon.iToys += gon.iPassiveIncome;
    updateToys();
    gon.iTimeLeft = time_left;
    document.getElementById("minutes").innerHTML = Math.floor(time_left / 60);
    document.getElementById("seconds").innerHTML = time_left % 60;
  }
  var timeinterval = setInterval(updateClock2, 1000);
}

function clearErrors() {
  document.getElementById("error").innerHTML = "";
}
function clearEvents() {
  document.getElementById("events").innerHTML = "";
}


/*******EVENTS*********/
function randomIntFromInterval(min,max) {                                //imported code!
    return Math.floor(Math.random()*(max-min+1)+min);
}
function eventChooser(integer) {
    switch(integer) {
      case 1:
        firstEvent();
        break;
      case 2:
        secondEvent();
        break;
      case 3:
        thirdEvent();
        break;
    }
}
function firstEvent() {
  document.getElementById("events").innerHTML = firstEventText;
  //do something
}
function secondEvent() {
  document.getElementById("events").innerHTML = secondEventText;
  //do something
}
function thirdEvent() {
  document.getElementById("events").innerHTML = thirdEventText;
  //do something
}


/******EVENT TEXT********/

var firstEventText = "Some flavour text about the first type of event";
var secondEventText = "Some flavour text about the second type of event";
var thirdEventText = "Some flavour text about the third type of event";
