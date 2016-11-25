// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.

// Initializes game logic and the map
window.onload=function(){ createjsinit(); initialize(); };

var pressobject; // Tracks the building currently being placed
var stageCanvas; // The primary canvas (Map)
var temporaryCursor;
var buildingPen;
var buildingPenHelper = [0, 0, 0, 0, 0, 0, 0, 0];

function createjsinit(){
  stageCanvas = new createjs.Stage("gamecanvas");

  drawMap();
  drawClickingArea();

  stageCanvas.enableMouseOver(); // Enables mouseover events for the canvas

  // Builds building pen
  buildingPen = getBuildingPen(gon.iMapOffsetX, gon.iMapSize, gon.iMapSize, gon.iBaseTileLength);
  stageCanvas.addChild(buildingPen);
  stageCanvas.update();

  // Load buildings
  loadAllBuildings();

  // Sets up ticker
  createjs.Ticker.setFPS(40);
  createjs.Ticker.addEventListener("tick",tick);
}

// Draws the grid-based map and populates each square with a container
function drawMap()
{
  for (x = gon.iMapOffsetX ; x < gon.iMapSize + gon.iMapOffsetX; x = x + gon.iBaseTileLength)
  {
    for (y = 0 ; y < gon.iMapSize ; y = y + gon.iBaseTileLength)
    {
      var strType = getTerrainType(gon.strMapSave[y / gon.iBaseTileLength][(x - gon.iMapOffsetX) / gon.iBaseTileLength]); // Read map data to determine what goes here
      var gridSquare = getGridSquare(x, y, gon.iBaseTileLength, gon.iBaseTileLength, strType); // Fetches a container for the square

      // Adds the grid tile to the canvas
      stageCanvas.addChild(gridSquare);
      stageCanvas.update();
    }
  }
}

function drawClickingArea()
{
  // Graphics for clicking area
  clickingArea = new createjs.Shape();
  clickingArea.graphics.beginStroke("black").beginFill("#6666CC").drawRect(0, 0, gon.iMapOffsetX, 200);

  // "Click" toy gain event
  clickingArea.on("click", function(event) {
    incrementToys();
  });

  stageCanvas.addChild(clickingArea);
}

function loadAllBuildings()
{
  // Searches through to find any existent buildings and places them as appropriate
  for (x = 0 ; x < gon.iMapSize; x = x + gon.iBaseTileLength)
  {
    for (y = 0 ; y < gon.iMapSize ; y = y + gon.iBaseTileLength)
    {
      // Note: X, Y reversed from map data
      var strType = (gon.strBuildingMapSave[x / gon.iBaseTileLength][y / gon.iBaseTileLength]); // Read map data to determine what goes here
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
        pressobject.graphics.beginStroke("black").beginFill(colour)
        .drawCircle(50, 50, 50);
        pressobject.type = strType;
        pressobject.placement = 0;
        buildingEventSetup(pressobject);

        gridSquare = stageCanvas.getObjectUnderPoint(x + gon.iMapOffsetX, y, 0);
        gridSquare.dispatchEvent("click")
      }
    }
  }
  buildingPen.currentCapacity = 0;
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
      coordinates = { originX: event.target.x,
                      originY: event.target.y,
                      };

      // Grab building graphics and store it in temp cursor
      temporaryCursor = event.target.clone(true);
      temporaryCursor.type = event.target.type;
      temporaryCursor = drawBuildingForMapPlacement(temporaryCursor);
      temporaryCursor.x = stageCanvas.mouseX - 50;
      temporaryCursor.y = stageCanvas.mouseY - 50;
      stageCanvas.addChild(temporaryCursor);

      // While building is clicked, stageCanvas will update temporaryCursor's coordinates on mousemove
      stageCanvas.on("stagemousemove", function(event2) {
        temporaryCursor.x = event2.target.mouseX - 50;
        temporaryCursor.y = event2.target.mouseY - 50;
      });

      pressobject = event.target.clone(true);
      pressobject.type = event.target.type;
      pressobject.placement = event.target.placement;
      event.target.parent.removeChild(event.target);
    }
  });
}

function tick() {
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
  // If pen is full, do not buy a new building
  if (buildingPen.currentCapacity >= 8)
    return;

  var building = new createjs.Shape();
  var colour;

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
  return;
}

// Builds a grid tile for use in the map
function getGridSquare(x, y, width, height, strType)
{
  var gridSquare = new createjs.Container(); // Primary container
  var visualEffect = new createjs.Shape();   // Visual effect upon hover-over
  var visualEffectProhibited = new createjs.Shape(); // Visual effect upon hover-over of unusable land
  var visualTerrain = new createjs.Shape();  // Terrain (I.e., visual appearance)
  gridSquare.x = x;
  gridSquare.y = y;
  gridSquare.setBounds(x * width, y * height, width, height);

  // Hover-over colours / transparency
  visualEffect.graphics.beginFill("#5FFF5f").drawRect(0, 0, width, height);
  visualEffect.alpha = 0.10;
  visualEffectProhibited.graphics.beginFill("#FF5F5F").drawRect(0, 0, width, height);
  visualEffectProhibited.alpha = 0.50;

  // Terrain Graphics Setup
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
    if (gridSquare.terrainType != "Water") {
      gridSquare.addChild(visualEffect);
    }
    else {
      gridSquare.addChild(visualEffectProhibited);
    }
  });
  gridSquare.on("mouseout", function(event) {
    gridSquare.removeChild(visualEffect);
    gridSquare.removeChild(visualEffectProhibited);
  });

  buildingPlacementEvent(gridSquare);
  return gridSquare;
}

function buildingPlacementEvent(gridSquare)
{
  // Handles cases wherein buildings are being placed on the map
  gridSquare.on("click", function(event) {
    if (pressobject != null) {
      // Remove custom cursor
      stageCanvas.removeEventListener("mouseover");
      stageCanvas.removeChild(temporaryCursor);
      // If the tile is available to accept the building, accept it.
      if (gridSquare.terrainType != "Water" && gridSquare.isBuilding == false) // To-do: Expand for different types, make building specific
      {
        gridSquare.isBuilding = true;
        pressobject = drawBuildingForMapPlacement(pressobject);
        gridSquare.addChild(pressobject.clone());
        buildingPenHelper[pressobject.placement] = 0;
        gon.strBuildingMapSave[(gridSquare.x - gon.iMapOffsetX) / gon.iBaseTileLength][gridSquare.y / gon.iBaseTileLength] = pressobject.type;
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
      else
      {
        // Else, Return the building to the pen
        building = pressobject.clone(true);
        building.type = pressobject.type;
        building.placement = pressobject.placement;
        buildingEventSetup(building);
        buildingPen.addChild(building);
        pressobject = null;
      }
    }
  });
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

    initializeGameEvents();

    document.getElementById("nickname").innerHTML = gon.strNickname + "'s Workshop";
    updateToys();

    var timeinterval = setInterval(updateClock(gon.iTimeLeft), 1000);
}

function initializeGameEvents()
{
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
