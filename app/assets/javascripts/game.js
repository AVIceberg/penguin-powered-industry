// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.

// Initializes game logic and the map
window.onload=function(){ createjsinit(); initialize();  };

//
var pressobject; // Tracks the building currently being placed
var stageCanvas; // The primary canvas (Map)
var temporaryCursor;
var shop;

var numberOfBuildingTypes = 3;

var terrainTypes = ["Invalid", "Tundra", "Water", "Shoreline"];
var terrainColours = ["Green", "White", "#89cff0", "White"];

var terrainTypesPermitted = [["Tundra", "Shoreline"], ["Tundra", "Shoreline"], ["Tundra", "Shoreline"]];
var buildingTypes = ["Labour Camp", "Toy Mine", "Factory"];
var buildingDescriptions = ["A nice, happy place to get some work done.", "Beneath the earth lie treasures aplenty...",
                            "The grinding of gears can be heard within."];

var buildingCosts = [100, 500, 2500];
var buildingIncome = [5, 10, 100];
var buildingSize = [1, 1, 2]; // Size of each building (i x i) on the grid
var buildingImages = ["brown", "grey", "#FFFF88"];
var penguinCapacity = [20, 100, 1000];

// Income-Handling Variables
var incomeGeneratedPerBuildingType = [0, 0, 0]; // Used to track how much each building type is producing per second
var numberOfBuildingsOwned = [0, 0, 0];         // Tracks the number of each building type owned
var buildingTypeMultipliers = [1.0, 1.0, 1.0];  // Tracks current multipliers for each building (affected by upgrades, events)
var fTotalPassiveIncome = 0.0;                  // Total generated income
var fClickMultiplier = 1.0;                     // Current multiplier for clicks (affected by upgrades, events)
var iClickingBase = 1;

// Game Handlers : Manage game logic
var iSaveInterval = 2;
var iMapSize = 800;
var iMapOffsetX = 200;
var iBaseTileLength = 100;
var buildingShopWidth = 300;

// Tracks which tiles are currently illuminated / hovered over by a building during placement
var tilesHoveredOver = [[null, null, null], [null, null, null], [null, null, null]];

function createjsinit(){
  stageCanvas = new createjs.Stage("gamecanvas");
  // Initialize major map components
  drawMap(); // Draw map in 'center' of the canvas (offset from y-axis by iMapOffsetX)
  drawClickingArea(); // Draw clicking area to the left of the map (length iMapOffsetX)
  drawShop(); // Draw shop to the right of the map (offset from y-axis by iMapOffsetX + iMapSize)

  stageCanvas.enableMouseOver(); // Enables mouseover events for the canvas

  // Load buildings
  loadAllBuildings();

  // Sets up ticker
  createjs.Ticker.setFPS(40);
  createjs.Ticker.addEventListener("tick",tick);
}

function admin()
{
  if (gon.iadmin == true)
  {
    document.getElementById("nickname").innerHTML += "<font color='red'>(ADMIN)</font>";

    var user_options = document.getElementById("user-options");
    var add10000 = document.createElement("BUTTON");
    add10000.appendChild(document.createTextNode("Add 10000 toys"));
    add10000.setAttribute("onclick", "gon.iToys += 10000; updateToys();");
    var substractminute =document.createElement("BUTTON");
    substractminute.appendChild(document.createTextNode("Substract a minute"));
    substractminute.setAttribute("onclick", "gon.iTimeLeft -= 60;");

    user_options.appendChild(add10000);
    user_options.appendChild(substractminute);
  }
}

// Draws the grid-based map and populates each square with a container
function drawMap()
{
  // Draws singular tiles
  for (x = iMapOffsetX ; x < iMapSize + iMapOffsetX; x = x + iBaseTileLength)
  {
    for (y = 0 ; y < iMapSize ; y = y + iBaseTileLength)
    {
      var iType = (gon.strMapSave[y / iBaseTileLength][(x - iMapOffsetX) / iBaseTileLength]); // Read map data to determine what goes here
      var gridSquare = getGridSquare(x, y, iBaseTileLength, iBaseTileLength, iType); // Fetches a container for the square
      // Adds the grid tile to the canvas
      stageCanvas.addChild(gridSquare);
      stageCanvas.update();
    }
  }
}

// Draws the clicking area and adds the 'click' event
function drawClickingArea()
{
  // Graphics for clicking area
  clickingArea = new createjs.Shape();
  clickingArea.graphics.beginStroke("black").beginFill("#6666CC").drawRect(0, 0, iMapOffsetX - 5, 200);

  // "Click" toy gain event
  clickingArea.on("click", function(event) {
    if (pressobject != null)
    {
      // Refund the building
      refundBuildingPurchase(pressobject.type);
      stageCanvas.removeChild(temporaryCursor);
      pressobject = null;
    }
    else
    {
      incrementToys();
    }
  });
  stageCanvas.addChild(clickingArea);
}

function drawShop()
{
  var upgradeShopWidth = 100;
  // Entire Shop (container / visuals)
  shop = new createjs.Container();
  var visualShop = new createjs.Shape();

  // Building shop (buildings)
  var buildingShop = new createjs.Container();
  var visualBuildingShop = new createjs.Shape();

  // Upgrade shop (Upgrades)
  var upgradeShop = new createjs.Container();
  var visualUpgradeShop = new createjs.Shape();

  var shopWidth = upgradeShopWidth + buildingShopWidth;
  var shopHeight = stageCanvas.canvas.height;

  // Instantiate 'general' shop
      // Instantiate boundaries / positioning
  shop.x = iMapOffsetX + iMapSize;
  shop.y = 0;

      // Instantiate visual background
  visualShop.graphics.beginStroke("black").drawRect(0, 0, shopWidth, shopHeight);
  shop.addChild(visualShop);
  stageCanvas.addChild(shop);

  // Instantiate building shop
    // Instantiate boundaries / positioning
  buildingShop.x = iMapOffsetX + iMapSize + upgradeShopWidth;
  buildingShop.y = 0;

  instantiateBuildingButtons(buildingShop, buildingShopWidth); // Create shop buttons and attach the relevant events

      // Instantiate visual background
  visualBuildingShop.graphics.beginStroke("black").drawRect(0, 0, buildingShopWidth, shopHeight);
  buildingShop.addChild(visualBuildingShop);
  stageCanvas.addChild(buildingShop);

  // Instantiate upgrade shop
  upgradeShop.x = shop.x;
  upgradeShop.y = 0;

  visualUpgradeShop.graphics.beginStroke("black").drawRect(0, 0, upgradeShopWidth, shopHeight);
  upgradeShop.addChild(visualUpgradeShop);
  stageCanvas.addChild(upgradeShop);

  // Enables events for children of each container
  shop.mouseChildren = true;
  buildingShop.mouseChildren = true;
  upgradeShop.mouseChildren = true;
}

function instantiateBuildingButtons(buildingShop, buildingShopWidth)
{
  var buildingButtonHeight = stageCanvas.canvas.height / numberOfBuildingTypes;
  for (iIndex = 0 ; iIndex < numberOfBuildingTypes ; iIndex++)
  {
    var buildingButton = new createjs.Container(); // Button container
    var buildingButtonVisual = new createjs.Shape(); // Button visual appearance
    var buildingButtonTooltip = new createjs.Container();
    var buildingButtonTooltipText = new createjs.Text();
    var buildingButtonTooltipBox = new createjs.Shape();

    // Manage text appearance / placement
    buildingButtonText = new createjs.Text(buildingTypes[iIndex], "20px Arial", "black");
    buildingButtonText.text += "\nCost: " + buildingCosts[iIndex] + " toys";
    buildingButtonText.textAlign = "center";
    buildingButtonText.x = buildingShopWidth / 2;
    buildingButtonText.y = buildingButtonHeight / 2;

    buildingButtonVisual.graphics.beginStroke("black").beginFill("white").drawRect(0, 0, buildingShopWidth, buildingButtonHeight);

    // Determine button position within shop
    buildingButton.y = iIndex * buildingButtonHeight;
    buildingButton.x = 0;

    // Sets container properties
    buildingButton.type = "building";

    // Initial tooltip Setup
    buildingButtonTooltipBox.graphics.beginStroke("black").beginFill("#F0F0F0").drawRect(0, 0, 400, 100);

    buildingButtonTooltipText.name = "text";
    buildingButtonTooltipText.font = "16px Arial";
    buildingButtonTooltipText.x = 5;
    buildingButtonTooltipText.y = 10;

    buildingButtonTooltip.addChild(buildingButtonTooltipBox);
    buildingButtonTooltip.addChild(buildingButtonTooltipText);

    // Sets the visual portion of the container to be the 'clickable' area
    buildingButton.addChild(buildingButtonVisual);
    buildingButton.hitArea = buildingButtonVisual;

    buildingButton.strBuildingType = buildingTypes[iIndex];
    addButtonEvents(buildingButton, iIndex, buildingButtonTooltip, buildingShopWidth, buildingButtonHeight); // Add purchase event to click

    buildingButton.addChild(buildingButtonText);
    buildingShop.addChild(buildingButton);
  }
}

function addButtonEvents(buildingButton, iIndex, buttonTooltip, buttonWidth, buttonHeight)
{
  buildingButton.iIndex = iIndex; // Index of the button
  buildingButton.on("click", function(event)
{
  if (pressobject == null)
  {
    var building = purchaseBuilding(buildingTypes[iIndex], event.target.iIndex);
    if (building)
    {
      building.dispatchEvent("click");
    }
  }
  else
  {
    // Refund the building
    refundBuildingPurchase(pressobject.type);
    stageCanvas.removeChild(temporaryCursor);
    pressobject = null;
  }
});

// Displays tooltip if cursor remains stationary for 2 second
buildingButton.on("mouseover", function(event)
{
  setTimeout(displayShopButtonTooltip, 2000, stageCanvas.mouseX, stageCanvas.mouseY, buildingButton, buttonTooltip, buttonWidth, buttonHeight);
});

buildingButton.on("mouseout", function(event)
{
  stageCanvas.removeChild(buttonTooltip);
});
}


function displayShopButtonTooltip(originalX, originalY, button, tooltip, buttonWidth, buttonHeight)
{
  var stageX = stageCanvas.mouseX;
  var stageY = stageCanvas.mouseY;
  if (button.type == "building")
  {
    point = button.globalToLocal(stageX, stageY);
      // Determines whether the mouse has moved and whether the user has moved to a different location
    if (Math.abs(originalX - stageX) < buttonWidth / 2 && Math.abs(originalY - stageY) < buttonHeight / 2
      && Math.abs(button.x - point.x) < buttonWidth && Math.abs(button.y - point.y) < buttonHeight
      && (stageX >= button.x) && (stageY >= button.y) )
    {
      // Updates tooltip text
      tooltip.getChildByName("text").text = buildingTypes[button.iIndex] + "\n";
      tooltip.getChildByName("text").text += "Cost: " + buildingCosts[button.iIndex] + " toys\n";
      tooltip.getChildByName("text").text += buildingDescriptions[button.iIndex] + "\n";
      tooltip.getChildByName("text").text += "Owned: " + numberOfBuildingsOwned[button.iIndex] + "\n";
      tooltip.getChildByName("text").text += "Generating: " + incomeGeneratedPerBuildingType[button.iIndex] + " toys\n";
      // Adds tooltip to stage offset from the current position
      tooltip.x = stageX;
      tooltip.y = stageY;
      stageCanvas.addChild(tooltip);
    }
  }

}

// LOADING CODE - Loads buildings and upgrades at game initialization

function loadAllBuildings()
{
  var iOffset = 5; // Prevents objects that share boundaries from being selected erroneously
  // Searches through to find any existent buildings and places them as appropriate
  for (x = 0 ; x < iMapSize; x = x + iBaseTileLength)
  {
    for (y = 0 ; y < iMapSize ; y = y + iBaseTileLength)
    {
      // Note: X, Y reversed from map data
      var iType = (gon.strBuildingMapSave[x / iBaseTileLength][y / iBaseTileLength]); // Read map data to determine what goes here

      if (iType != "-1")
      {
        var colour = getBuildingImage(iType);

        pressobject = createBuilding(iType, colour);

        gridSquare = stageCanvas.getObjectUnderPoint(x + iMapOffsetX + iOffset, y, 0);
        gridSquare.dispatchEvent("click");
      }
    }
  }
}

// START OF BUILDING

// Creates a building to be purchased
function createBuilding(iIndexOfBuildingType, colour)
{
  // Builds building graphic
  var building = new createjs.Shape();
  building.graphics.beginStroke("black").beginFill(colour)
  .drawCircle(50, 50, 50);

  // Sets building properties and events
  building.type = iIndexOfBuildingType;

  building.maxPenguins = penguinCapacity[iIndexOfBuildingType]; // Sets the number of penguins the building can hold
  building.currentPenguins = 0;
  building.size = buildingSize[iIndexOfBuildingType];
  building.allowedTerrain = terrainTypesPermitted[iIndexOfBuildingType];
  building.name = "building";
  buildingEventSetup(building);

  return building;
}

// Adds relevant events to a building object
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
      temporaryCursor = drawBuildingForMapPlacement(temporaryCursor, event.target.size);
      temporaryCursor.x = stageCanvas.mouseX - 50;
      temporaryCursor.y = stageCanvas.mouseY - 50;
      stageCanvas.addChild(temporaryCursor);

      // While building is clicked, stageCanvas will update temporaryCursor's coordinates on mousemove
      stageCanvas.on("stagemousemove", function(event2) {
        temporaryCursor.x = event2.target.mouseX - 50;
        temporaryCursor.y = event2.target.mouseY - 50;
      });

      // Set pressobject to be a copy of the event.target
      pressobject = event.target.clone(true);
      pressobject.type = event.target.type;

      pressobject.size = event.target.size;
      pressobject.maxPenguins = event.target.maxPenguins;
      pressobject.currentPenguins = event.target.currentPenguins;
      pressobject.allowedTerrain = event.target.allowedTerrain;
      pressobject.name = event.target.name;

      if ( event.target.parent !== null)
      {
        event.target.parent.removeChild(event.target);
      }
    }
  });
}

// Purchases a building of the given building type
function purchaseBuilding(strBuildingType, iIndex)
{
  var colour = getBuildingImage(iIndex);

  if (colour == "Invalid")
    return null;

  if (deductCost(iIndex))
  {
    var building = createBuilding(iIndex, colour);
    return building;
  }
}

// Gets the appropriate building image
function getBuildingImage(iIndexOfBuildingType)
{
  var colour;
  // Error checking
  if ((buildingTypes.length <= iIndexOfBuildingType) || (iIndexOfBuildingType < 0))
  {
    colour = "Invalid";
    return colour;
  }

  colour = buildingImages[iIndexOfBuildingType];

  return colour;
}

// Deducts the cost of a building being purchased from the user's total toy stash
function deductCost(iIndexOfBuildingType)
{
  var hasEnoughToys = false;
  if (gon.iToys >= buildingCosts[iIndexOfBuildingType])
  {
    gon.iToys = gon.iToys - buildingCosts[iIndexOfBuildingType];
    hasEnoughToys = true;
  }
  else
  {
    document.getElementById("error").innerHTML = "At least " + buildingCosts[iIndexOfBuildingType] +
    " toys are required to build a " + buildingTypes[iIndexOfBuildingType];
    errorClearInterval = 0;
  }
  return hasEnoughToys;
}

// Refunds the building purchase when the user decides to cancel it by clicking in an invalid location
function refundBuildingPurchase(iType)
{
  gon.iToys += buildingCosts[iType];
}

// Redraws the building with the proper coordinates to fit into its grid tile
function drawBuildingForMapPlacement(building, size)
{
  var colour = getBuildingImage(building.type); // Green == Error
  building.graphics.clear("White");

  building.graphics.beginFill(colour).drawCircle(50 * size, 50 * size, 50 * size);
  return building;
}

// END OF BUILDING CODE

// Builds a grid tile for use in the map
function getGridSquare(x, y, width, height, iType)
{
  var gridSquare = new createjs.Container(); // Primary container
  var visualEffect = new createjs.Shape();   // Visual effect upon hover-over
  var visualEffectProhibited = new createjs.Shape(); // Visual effect upon hover-over of unusable land
  var visualTerrain = new createjs.Shape();  // Terrain (I.e., visual appearance)
  var tileTooltip = new createjs.Container(); // Container for tooltip elements
  gridSquare.x = x;
  gridSquare.y = y;
  //gridSquare.setBounds(x * width, y * height, width, height);

  // Hover-over colours / transparency
  visualEffect.graphics.beginFill("#5FFF5f").drawRect(0, 0, width, height);
  visualEffect.alpha = 0.10;
  visualEffectProhibited.graphics.beginFill("#FF5F5F").drawRect(0, 0, width, height);
  visualEffectProhibited.alpha = 0.50;

  // Terrain Graphics Setup
  visualTerrain.graphics.beginStroke("black").beginFill(terrainColours[iType]).drawRect(0, 0, width, height); // Draw terrain

  // Set container properties
  gridSquare.addChild(visualTerrain);
  gridSquare.hitArea = visualTerrain;
  gridSquare.width = width;
  gridSquare.height = height;
  gridSquare.isBuilding = false;  // Tracks whether the tile contains a building
  gridSquare.terrainType = iType; // Stores terrain type for building logic
  gridSquare.hovering = false;    // Determines whether the user's mouse is hovering over the tile during certain events
  gridSquare.buildingType = "None"; // Tracks the building type currently occupying it

  // Sets initial tile tooltip visuals
  var tooltipText = new createjs.Text();
  tooltipText.text = "Terrain Type: " + buildingTypes[gridSquare.terrainType] + "\n";
  tooltipText.text += "Building: " + gridSquare.buildingType;
  tooltipText.name = "text";
  tooltipText.font = "18px Arial";
  tooltipText.x = 10;
  tooltipText.y = 15;

  var tooltipBox = new createjs.Shape();
  tooltipBox.graphics.beginStroke("black").beginFill("#F0F0F0").drawRect(0, 0, 200, 100);

  tileTooltip.addChild(tooltipBox);
  tileTooltip.addChild(tooltipText);

  // TILE EVENTS : Initializes building placement events and hover events

  mouseHoverEvents(gridSquare, visualEffect, visualEffectProhibited, tileTooltip);
  buildingPlacementEvent(gridSquare);
  return gridSquare;
}

// EVENTS FOR GRID TILES

function mouseHoverEvents(gridSquare, visualEffect, visualEffectProhibited, tileTooltip)
{
  // On mouseover, light the relevant tiles
  gridSquare.on("mouseover", function(event)
  {
    var point = gridSquare.globalToLocal(stageCanvas.mouseX, stageCanvas.mouseY);
    setTimeout(displayTileTooltip, 2000, stageCanvas.mouseX, stageCanvas.mouseY, gridSquare, tileTooltip); // Displays tooltip if cursor remains stationary for 2 second
    // If user is placing an object, light up relevant tiles persuant to user's choice (Called once on first call)
    if ( (pressobject != null) && (gridSquare.hovering == false) && gridSquare.hitTest(point.x, point.y) )
    {
      gridSquare.hovering = true;
      tilesHoveredOver = getTilesByCursor();
      for (i = 0 ; i < pressobject.size ; i++)
      {
        for (j = 0 ; j < pressobject.size ; j++)
        {
          tilesHoveredOver[i][j].dispatchEvent("mouseover");
        }
      }
    }
    // Used to handle all calls made in the above statement
    else if (pressobject != null)
    {
      if (gridSquare.isBuilding == true || terrainTypesPermitted[pressobject.type].indexOf(terrainTypes[gridSquare.terrainType]) < 0)
      {
        gridSquare.addChild(visualEffectProhibited); // Red
      }
      else
      {
          gridSquare.addChild(visualEffect); // Green
      }
    }
    // Else, light all non-water tiles green, and water tiles red
    else if (gridSquare.terrainType != 2)
    {
      gridSquare.addChild(visualEffect);
    }
    else
    {
      gridSquare.addChild(visualEffectProhibited);
    }
  });
  // When the mouse moves out of a tile, remove all light-up effects
  gridSquare.on("mouseout", function(event)
   {
     var point = gridSquare.globalToLocal(stageCanvas.mouseX, stageCanvas.mouseY);
     if (pressobject != null && gridSquare.hovering == true)
     {
       gridSquare.hovering = false;

       for (i = 0 ; i < pressobject.size ; i++)
       {
         for (j = 0 ; j < pressobject.size ; j++)
         {
           tilesHoveredOver[i][j].dispatchEvent("mouseout");
         }
       }
     }
     else
     {
       gridSquare.removeChild(visualEffect);
       gridSquare.removeChild(visualEffectProhibited);
       stageCanvas.removeChild(tileTooltip);
     }
  });
}

// An event for each grid tile that activates when a user tries to place a building on the map
function buildingPlacementEvent(gridSquare)
{
  gridSquare.on("click", function(event) {
    if (pressobject != null)
    {
      // Remove custom cursor
      stageCanvas.removeEventListener("mouseover");
      stageCanvas.removeChild(temporaryCursor);

      var gridTilesAffected = getTiles(gridSquare) // Collect affected containers and check for validity
      var validLocation = validateTiles(gridTilesAffected);
      // If the location is valid, place the building
      if (validLocation == true)
      {
        // If necessary, draw a new container to hold the building (if it is larger than a 1x1)
        if (pressobject.size > 1)
        {
          // Remove all 1v1 tiles to make room for the new container
          for (i = 0 ; i < pressobject.size ; i++)
          {
            for (j = 0 ; j < pressobject.size ; j++)
            {
              stageCanvas.removeChild(gridTilesAffected[i][j]);
            }
          }
          // Create the new container
          gridSquare = getGridSquare(gridSquare.x, gridSquare.y, iBaseTileLength * pressobject.size, iBaseTileLength * pressobject.size, 1);
          gridSquare.isBuilding = true;
          stageCanvas.addChild(gridSquare);
        }
        else
        {
          gridSquare.isBuilding = true;
        }
        // Draw building for proper placement in tile
        pressobject = drawBuildingForMapPlacement(pressobject, pressobject.size);

        // Create a new object of pressobject so pressobject can be cleared freely.
        newCopyOfBuilding = pressobject.clone(true);
        newCopyOfBuilding.name = "building";
        newCopyOfBuilding.type = pressobject.type

        newCopyOfBuilding.size = pressobject.size;
        newCopyOfBuilding.maxPenguins = pressobject.maxPenguins;
        newCopyOfBuilding.currentPenguins = pressobject.currentPenguins;
        newCopyOfBuilding.allowedTerrain = pressobject.allowedTerrain;

        // Add the new building to the tile and increment income appropriately
        gridSquare.addChild(newCopyOfBuilding);
        gridSquare.buildingType = pressobject.type;
        gon.strBuildingMapSave[(gridSquare.x - iMapOffsetX) / iBaseTileLength][gridSquare.y / iBaseTileLength] = pressobject.type;
        //fTotalPassiveIncome += (pressobject.currentPenguins / penguinCapacity[pressobject.type]) * buildingIncome[pressobject.type];
        // Note for Godwin: Remove this and decomment previous line of code once penguins are implemented. Also see the clock code for another change
        gon.iPassiveIncome += buildingIncome[pressobject.type];
        gridSquare.dispatchEvent("mouseout");
        pressobject = null;
        return;
      }
      else
      {
        // Else, Refund the building
        gridSquare.dispatchEvent("mouseout");
        refundBuildingPurchase(pressobject.type);
        pressobject = null;
      }
    }
  });
}

// END OF EVENTS FOR GRID TILES
// TILE HELPER METHODS : Used during placement and hover-over events to get a collection of tiles and validate them
//                       or called during events to add tooltips

// Displays a tooltip for a tile, given that it has been hovered over for an appropriate amount of time
function displayTileTooltip(originalX, originalY, gridSquare, tileTooltip)
{
  var stageX = stageCanvas.mouseX;
  var stageY = stageCanvas.mouseY;
  // Determines whether the mouse has moved and whether the user has moved to a different tile
  if (Math.abs(originalX - stageX) < iBaseTileLength / 2 && Math.abs(originalY - stageY) < iBaseTileLength / 2
    && Math.abs(gridSquare.x - stageX) < iBaseTileLength && Math.abs(gridSquare.y - stageY) < iBaseTileLength
    && (stageX >= gridSquare.x) && (stageY >= gridSquare.y) )
  {
    // Updates tooltip text
    tileTooltip.getChildByName("text").text = "Terrain Type: " + terrainTypes[gridSquare.terrainType] + "\n";

    if (gridSquare.isBuilding == true)
    {
      tileTooltip.getChildByName("text").text += "Building: " + buildingTypes[gridSquare.buildingType];
      tileTooltip.getChildByName("text").text += "\nCapacity: " + gridSquare.getChildByName("building").currentPenguins + " / " + gridSquare.getChildByName("building").maxPenguins + "\n";
      tileTooltip.getChildByName("text").text += "Generating: " +
       (gridSquare.getChildByName("building").currentPenguins / gridSquare.getChildByName("building").maxPenguins)
        * gridSquare.getChildByName("building").type + " toys";
    }
    // Adds tooltip to stage offset from the current position
    tileTooltip.x = stageCanvas.mouseX;
    tileTooltip.y = stageCanvas.mouseY;
    stageCanvas.addChild(tileTooltip);
  }
}

// Grabs all tiles relevant to the building being placed and adds them to an array
function getTiles(gridSquare)
{
  gridTilesAffected = [[null, null, null], [null, null, null], [null, null, null]];
  var iOffset = 5; // Prevents the program from 'catching' on a container that shares a boundary with our desired one
  for (i = 0 ; i < pressobject.size ; i++)
  {
    for (j = 0 ; j < pressobject.size ; j++)
    {
      // Get the container and add it to an array
      tile = stageCanvas.getObjectUnderPoint(gridSquare.x + (iBaseTileLength * i) + iOffset, gridSquare.y + (iBaseTileLength * j) + iOffset, 2);

      if (tile.hasEventListener("mouseover"))
      {
            gridTilesAffected[i][j] = tile;
      }
      else
      {
          gridTilesAffected[i][j] = tile.parent;
      }
    }
  }
  return gridTilesAffected;
}

// Grabs all tiles relevant to the building being placed according to the cursor(!), rather than gridSquare
function getTilesByCursor()
{
  gridTilesAffected = [[null, null, null], [null, null, null], [null, null, null]];
  var iOffset = 5; // Prevents the program from 'catching' on a container that shares a boundary with our desired one
  for (i = 0 ; i < pressobject.size ; i++)
  {
    for (j = 0 ; j < pressobject.size ; j++)
    {
      // Get the container and add it to an array
      tile = stageCanvas.getObjectUnderPoint(stageCanvas.mouseX + (iBaseTileLength * i), stageCanvas.mouseY + (iBaseTileLength * j), 2);

      if (tile.hasEventListener("mouseover"))
      {
            gridTilesAffected[i][j] = tile;
      }
      else
      {
          gridTilesAffected[i][j] = tile.parent;
      }
    }
  }
  return gridTilesAffected;
}

// Given an array of tiles, it validates their ability to hold the building currently being placed.
function validateTiles(gridTilesAffected)
{
  var validLocation = true;
  for (i = 0 ; i < pressobject.size ; i++)
  {
    for (j = 0 ; j < pressobject.size ; j++)
    {
      // Get the container and validate it as a position for building currently being placed
      tile = gridTilesAffected[i][j];
      if (tile.isBuilding == true || terrainTypesPermitted[pressobject.type].indexOf(terrainTypes[tile.terrainType]) < 0)
      {
        validLocation = false;
      }
    }
  }
  return validLocation;
}

// END OF TILE HELPER METHODS

// Non-functional method -- deprecated?
function animate() {
}
function preload() {
}
function create() {
}
function update() {
}

// Updates the canvas : Currently set to run 40x / second
function tick() {
    stageCanvas.update();
}

// GAME LOGIC //
// Initializes all necessary JS variables and adds required events
function initialize()
{
    document.getElementById("nickname").innerHTML = gon.strNickname + "'s Workshop";
    updateToys();

    interval = setInterval(updateClock(gon.iTimeLeft), 1000);
    admin();
}

// Increments the user's local toys (gon.iToys) by an amount determined by their given multiplier.
function incrementToys()
{
  gon.iToys = gon.iToys + iClickingBase * fClickMultiplier;
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

    if (typeof gon.iTimeLeft !== 'undefined'){
      time_left = gon.iTimeLeft;
    }

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
    if(((time_left / 60) % iSaveInterval == 0) && (time_left % 60 == 0)) {
      callSave();
    }
    errorClearInterval = errorClearInterval + 1;
    time_left = time_left - 1;
    gon.iToys += gon.iPassiveIncome; // Remove this line of code once penguins are implemented
    // gon.iToys += fTotalPassiveIncome;
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
