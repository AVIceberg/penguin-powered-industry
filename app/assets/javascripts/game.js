// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.

// Initializes game logic and the map
window.onload=function(){ createjsinit(); initialize(); };

var pressobject; // Tracks the building currently being placed
var stage;
var stageCanvas; // The primary canvas (Map)
var link;
var container;
var circle;
var mapsave=[];
var buildingData={"home2":4};
var temporaryCursor;
var buildingPen;
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

  // Sets up ticker
  createjs.Ticker.setFPS(40);
  createjs.Ticker.addEventListener("tick",tick);
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
      coordinates = {  x:event.stageX - event.target.parent.x - event.target.x,
                      y:event.stageY - event.target.parent.y - event.target.y,
                      originX: event.target.x,
                      originY: event.target.y};
      /*
      temporaryCursor = new createjs.Shape();
      temporaryCursor.graphics.beginFill("Green").drawCircle(50, 50, 50);
      */
      pressobject = event.target.clone(true);
      pressobject.type = event.target.type;
      pressobject.placement = event.target.placement;
      event.target.parent.removeChild(event.target);
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
        document.getElementById("error").innerHTML = "At least 100 toys are required to buy a Labour Camp!";
        colour = "Invalid";
        errorClearInterval = 0;
      break;
    case "Toy Mine":
      colour = "Grey";
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
  gridSquare.setBounds(x * width, y * height, width, height);

  // Hover-over colour / transparency
  visualEffect.graphics.beginFill("#5FFF5f").drawRect(0, 0, width, height);
  visualEffect.alpha = 0.10;

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
    gridSquare.addChild(visualEffect);
  });
  gridSquare.on("mouseout", function(event) {
    gridSquare.removeChild(visualEffect);
  });

  // Handles cases wherein buildings are bei ng placed on the map
  gridSquare.on("click", function(event) {
    if (pressobject != null) {
      if (gridSquare.terrainType != "Water") // To-do: Expand for different types, make building specific
      {
        pressobject = drawBuildingForMapPlacement(pressobject);
        gridSquare.addChild(pressobject.clone());
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
    // Return the building to the pen
    building = pressobject.clone(true);
    building.type = pressobject.type;
    buildingEventSetup(building);
    buildingPen.addChild(building);
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
      if(gon.iRequiredToys < gon.iToys)
        window["resetGame"](true);
      else
        window["resetGame"](false);
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