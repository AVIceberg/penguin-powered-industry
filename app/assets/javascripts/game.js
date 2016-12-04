// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.

// Initializes game logic and all interactive elements
window.onload=function(){ createjsinit(); initialize();  };

// General global variables used for easy manipulation across functions
// Do not add global variables lightly! Use them only for things used in disconnected functions / events

var pressobject; // Tracks the building currently being placed
var stageCanvas; // The primary canvas (Map)
var temporaryCursor; // Holds the object being moved across the map
var shop; // General shop container (Should probably be refactored out)
var pShop; // Penguin shop (Should probably be refactored out : Temporarily used to update penguin pen

var terrainTypes = ["Invalid", "Tundra", "Water", "Shoreline"];
var terrainColours = ["Green", "White", "#89cff0", "White"];
var terrainTypesPermitted = [["Tundra", "Shoreline"], ["Tundra", "Shoreline"], ["Tundra", "Shoreline"]];

// Building variables, handlers : Handle building visuals and logic
var numberOfBuildingTypes = 3;
var buildingTypes = ["Labour Camp", "Toy Mine", "Factory"];
var buildingDescriptions = ["A nice, happy place to get some work done.", "Beneath the earth lie treasures aplenty...",
                            "The grinding of gears can be heard within."];

var buildingCosts = [100, 500, 2500];
var buildingIncome = [20, 50, 10000];
var buildingSize = [1, 1, 2]; // Size of each building (i x i) on the grid
var buildingImages = ["brown", "grey", "#FFFF88"];
var penguinCapacity = [20, 100, 1000];

//Penguin counters/logic
var penguinImage = "Yellow";
var penguinCost = 5; // Initial cost : Every purchased penguin increments this cost
//var idlePenguins = 0; // The number of penguins sitting idly in the pen : Handled by a gon variable so penguins in pen are saved!
var totalPenguins = 0; // The total number of penguins owned : Initially 0, calculated on load / purchase
var penguinCostScale = 0.1; // The scale at which, per penguin, penguin cost scales

// Income-Handling Variables
var incomeGeneratedPerBuildingType = [0, 0, 0]; // Used to track how much each building type is producing per second
var numberOfBuildingsOwned = [0, 0, 0];         // Tracks the number of each building type owned
var buildingTypeMultipliers = [1.0, 1.0, 1.0];  // Tracks current multipliers for each building (affected by upgrades, events)
var fTotalPassiveIncome = 0.0;                  // Total generated income
var fClickMultiplier = 1.0;                     // Current multiplier for clicks (affected by upgrades, events)
var iClickingBase = 1;

// Upgrade Handlers : Manage upgrade descriptions and logic
var numberOfUpgrades = 3;
var upgradeNames = ["Upgrade #1", "Upgrade #2", "Upgrade #3"];
var upgradeDescriptions = ["Description for upgrade #1", "Description for upgrade #2", "Description for upgrade #3"];
var upgradeFormalDescriptions = ["Clicking gain increased by 20%", "Labour camp efficiency increased by 10%", "Efficiency of all buildings incrased by 10%"];
var upgradeCost = [500, 800, 10000];
// First Value refers to the building they alter. -1 == all buildings; -2 == clicking
var upgradeType = [[-2, 0.2], [0, 0.1], [-1, 0.1]];
var upgradeShopSlotHelper = [null, null, null, null, null, null, null, null];

// Statically holds all upgrade info in case it is required (used during upgrade load, as shop helper changes)
var upgradeInfoHelper = [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null];

// Game Handlers : Manage game logic
var iSaveInterval = 2;
var iMapSize = 800;
var iMapOffsetX = 200;
var iBaseTileLength = 100;
var buildingShopWidth = 300;

// Tracks which tiles are currently illuminated / hovered over by a building during placement
var tilesHoveredOver = [[null, null, null], [null, null, null], [null, null, null]];

// Manages initialization of all canvas-based elements
function createjsinit()
{
  stageCanvas = new createjs.Stage("gamecanvas");
  // Initialize major map components
  drawMap(); // Draw map in 'center' of the canvas (offset from y-axis by iMapOffsetX)
  drawClickingArea(); // Draw clicking area to the left of the map (length iMapOffsetX)
  drawPenguinShop();  // Draw penguin shop right below free penguin area
  drawShop(); // Draw shop to the right of the map (offset from y-axis by iMapOffsetX + iMapSize)

  stageCanvas.enableMouseOver(); // Enables mouseover events for the canvas
  // Load all buildings and upgrades
  loadAllBuildings();
  loadAllUpgrades();

  // Sets up ticker (Stage will update every 40 seconds)
  createjs.Ticker.setFPS(40);
  createjs.Ticker.addEventListener("tick",tick);
}

// If the user is an admin, several debug buttons are created
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
  for (y = 0 ; y < iMapSize ; y = y + iBaseTileLength)
  {
    for (x = iMapOffsetX ; x < iMapSize + iMapOffsetX; x = x + iBaseTileLength)
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
      if (pressobject.name == "penguin")
      {
        gon.iIdlePenguins++;
        updatePenValue(pShop.getChildByName("pPen"));
        stageCanvas.removeChild(temporaryCursor);
        pressobject = null;
      }
      else
      {
        // Refund the building
        refundBuildingPurchase(pressobject.type);
        stageCanvas.removeChild(temporaryCursor);
        pressobject = null;
      }
    }
    else
    {
      incrementToys();
    }
  });
  stageCanvas.addChild(clickingArea);
}

// START OF PENGUIN SHOP CODE

// Draws the penguin shop and creates the 'penguin purchase button' and the 'penguin pen'
function drawPenguinShop()
{
  pShop = new createjs.Container();
  var pVisualShop = new createjs.Shape();
  var pPurchaseButton = new createjs.Container();
  var pPen = new createjs.Container();

  pPen.name = "pPen";
  pPurchaseButton.name = "purchase";

  // Define the width and height for all components
  pShop.width = iMapOffsetX - 5; // Width is the same as clicking area's width
  pShop.height = 600;

  pPurchaseButton.width = iMapOffsetX - 40;
  pPurchaseButton.height = 100;

  pPen.width = iMapOffsetX - 40;
  pPen.height = 100;

  // Position the shop and its two sub-components
  pShop.x = 0;
  pShop.y = 200;
  pPurchaseButton.y = 20;
  pPurchaseButton.x = 20;
  pPen.x = 20;
  pPen.y = 2 * 20 + pPurchaseButton.height;

  // Add all components of the shop to the shop as children
  pVisualShop.graphics.beginStroke("black").drawRect(0, 0, pShop.width, pShop.height);
  pShop.addChild(pVisualShop);
  pShop.addChild(pPurchaseButton);
  pShop.addChild(pPen)

  // Create the two 'buttons' used to purchase and place penguins
  instantiatePenguinShopButton(pPurchaseButton, pShop);
  instantiatePenguinPen(pPen, pShop);

  stageCanvas.addChild(pShop); // Add penguin shop to the page
  pShop.mouseChildren = true;
}

function instantiatePenguinPen(pPen, pShop)
{
  var penguinButtonTooltip = new createjs.Container();
  var penguinButtonTooltipText = new createjs.Text();
  var penguinButtonTooltipBox = new createjs.Shape();
  var penguinPenVisual = new createjs.Shape();

  // Write initial text appearance
  penguinPenText = new createjs.Text("Idle Penguins: 0", "18px Arial", "black");
  penguinPenText.name = "text";
  penguinPenText.x = 5;
  penguinPenText.y = 5;

  penguinPenVisual.graphics.beginStroke("black").beginFill("white").drawRect(0, 0, pPen.width, pPen.height);

  //Initial tooltip Setup
  /*
  penguinButtonTooltipBox.graphics.beginStroke("black").beginFill("#F0F0F0").drawRect(0, 210, 400, 100);

  penguinButtonTooltipText.name = "text";
  penguinButtonTooltipText.font = "16px Arial";
  penguinButtonTooltipText.x = 5;
  penguinButtonTooltipText.y = 10;

  penguinButtonTooltip.addChild(penguinButtonTooltipBox);
  penguinButtonTooltip.addChild(penguinButtonTooltipText);
  */

  // Sets the visual portion of the container to be the 'clickable' area
  pPen.addChild(penguinPenVisual);
  pPen.hitArea = penguinPenVisual;

  addPenguinButtonEvent(pPen);

  pPen.addChild(penguinPenText);
  //freePenguins.addChild(penguinButton);
}

function instantiatePenguinShopButton(button, pShop)
{
  var pshopButtonTooltip = new createjs.Container();
  var pshopButtonTooltipText = new createjs.Text();
  var pshopButtonTooltipBox = new createjs.Shape();
  var pVisualPurchaseButton = new createjs.Shape();

  pVisualPurchaseButton.graphics.beginStroke("black").beginFill("White").drawRect(0, 0, pShop.width - 40, 80);

  //Manage text appearance
  pshopButtonText = new createjs.Text("Purchase Penguin", "14px Arial", "black");
  pshopButtonText.text += "\nCost: " + penguinCost + " toys";
  pshopButtonText.name = "text";

  pshopButtonText.x = 5;
  pshopButtonText.y = 5;

  //Initial tooltip Setup
  /*
  pshopButtonTooltipBox.graphics.beginStroke("black").beginFill("#F0F0F0").drawRect(0, 420, 400, 100);

  pshopButtonTooltipText.name = "text";
  pshopButtonTooltipText.font = "16px Arial";
  pshopButtonTooltipText.x = 5;
  pshopButtonTooltipText.y = 10;

  pshopButtonTooltip.addChild(pshopButtonTooltipBox);
  pshopButtonTooltip.addChild(pshopButtonTooltipText);
  */

  // Add visual button and define its hit box
  button.addChild(pVisualPurchaseButton);
  button.hitArea = pVisualPurchaseButton;

  button.addChild(pshopButtonText);

  addPenguinShopButtonEvent(button, pShop);
}

function addPenguinButtonEvent(pPen)
{
  pPen.on("click", function(event) {

    if(pressobject != null)
    {
      if (pressobject.name == "penguin")
      {
        gon.iIdlePenguins++;
        updatePenValue(pPen);
        stageCanvas.removeChild(temporaryCursor);
        pressobject = null;
      }
      else
      {
        refundBuildingPurchase(pressobject.type);
        stageCanvas.removeChild(temporaryCursor);
        pressobject = null;
      }
    }
    else {
      if(gon.iIdlePenguins > 0) {
        var penguin = createPenguin();
        if (penguin)
        {
          gon.iIdlePenguins = gon.iIdlePenguins - 1;
          updatePenValue(pPen);
          penguin.dispatchEvent("click");
        }
      }
      else {
        document.getElementById("error").innerHTML = "No free penguins are available!";
        errorClearInterval = 0;
      }
    }
  });
}

// Adds the 'purchase penguin' button to the shop and instantiates its variables
function addPenguinShopButtonEvent(pShopButton, pShop) {
  pShopButton.on("click", function(event) {

    if (pressobject != null)
      {
        if (pressobject.name == "penguin")
        {
          gon.iIdlePenguins++;
          updatePenValue(pShop.getChildByName("pPen"));
          stageCanvas.removeChild(temporaryCursor);
          pressobject = null;
        }
        else
        {
          refundBuildingPurchase(pressobject.type);
          stageCanvas.removeChild(temporaryCursor);
          pressobject = null;
        }
      }
    else
    {
      //Logic for buying penguins
      if(gon.iToys >= penguinCost) {
        gon.iToys = gon.iToys - penguinCost;
        gon.iIdlePenguins = gon.iIdlePenguins + 1;
        updatePenValue(pShop.getChildByName("pPen"));
        penguinCost = Math.ceil(penguinCost * (1.0 + penguinCostScale));
        updatePenguinCost(pShop.getChildByName("purchase"));
      }
      else
      {
        document.getElementById("error").innerHTML = "At least " + penguinCost + " toys are required to buy a penguin at this time";
        errorClearInterval = 0;
      }
    }
  });
}

// Updates the number of penguins visually displayed in the pen
function updatePenValue(pPen)
{
    pPen.getChildByName("text").text = "Idle Penguins: " + gon.iIdlePenguins;
}

// Updates the cost of penguins : Called whenever the total number of penguins changes
function updatePenguinCost(purchaseButton)
{
  purchaseButton.getChildByName("text").text = "Purchase Penguin";
  purchaseButton.getChildByName("text").text += "\nCost: " + penguinCost;
}

// END OF PENGUIN SHOP CODE
// BEGINNING OF BUILDING / UPGRADE SHOP CODE

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
  upgradeShop.name = "upgradeShop";

  visualUpgradeShop.graphics.beginStroke("black").drawRect(0, 0, upgradeShopWidth, shopHeight);
  upgradeShop.addChild(visualUpgradeShop);
  populateUpgradeShop(upgradeShop);
  stageCanvas.addChild(upgradeShop);

  // Enables events for children of each container
  shop.mouseChildren = true;
  buildingShop.mouseChildren = true;
  upgradeShop.mouseChildren = true;
}

// Creates shop buttons to purchase each building
// Handles visuals and hitboxes : Calls to addButtonEvents to make buttons responsive
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

// Sets up a building button's purchase and tooltip events
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
    if (pressobject.name == "penguin")
    {
      gon.iIdlePenguins++;
      updatePenValue(pShop.getChildByName("pPen"));
      stageCanvas.removeChild(temporaryCursor);
      pressobject = null;
    }
    else
    {
      // Refund the building
      refundBuildingPurchase(pressobject.type);
      stageCanvas.removeChild(temporaryCursor);
      pressobject = null;
    }
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

// Displays a shop button's tooltip : Responsible for building and upgrade button tooltips
function displayShopButtonTooltip(originalX, originalY, button, tooltip, buttonWidth, buttonHeight)
{
  var stageX = stageCanvas.mouseX;
  var stageY = stageCanvas.mouseY;
  var point = button.globalToLocal(stageX, stageY);
  var point2 = shop.globalToLocal(stageX, stageY);

  if (button.type == "building")
  {
      // Determines whether the mouse has moved and whether the user has moved to a different location
    if (Math.abs(originalX - stageX) < buttonWidth / 2 && Math.abs(originalY - stageY) < buttonHeight / 2
      && Math.abs(button.x - point2.x) < buttonWidth && Math.abs(button.y - point2.y) < buttonHeight
      && (point.x >= button.x) && (point2.y >= button.y) )
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
  else
  {
    // Determines whether the mouse has moved and whether the user has moved to a different location
    if (Math.abs(originalX - stageX) < buttonWidth && Math.abs(originalY - stageY) < buttonHeight
      && Math.abs(button.x - point2.x - 25) < buttonWidth && Math.abs(button.y - point2.y - 25) < buttonHeight
      && (point.x >= -25) && (point.y >= -25))
      {
        tooltip.getChildByName("text").text = upgradeNames[button.iIndex] + "\n";
        tooltip.getChildByName("text").text += "Cost: " + upgradeCost[button.iIndex] + "\n";
        tooltip.getChildByName("text").text += upgradeDescriptions[button.iIndex] + "\n";
        tooltip.getChildByName("text").text += upgradeFormalDescriptions[button.iIndex] + "\n";
        tooltip.x = stageX;
        tooltip.y = stageY;
        stageCanvas.addChild(tooltip);
      }
  }

}

// END OF BUILDING & UPGRADE SHOP CODE
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
      var iType = (gon.strBuildingMapSave[x / iBaseTileLength][y / iBaseTileLength][0]); // Read map data to determine what goes here
      if (iType != "-1")
      {
        var colour = getBuildingImage(iType);

        pressobject = createBuilding(iType, colour);
        pressobject.currentPenguins = gon.strBuildingMapSave[x / iBaseTileLength][y / iBaseTileLength][1];
        totalPenguins += Number(pressobject.currentPenguins); // This is odd behaviour, given that the rest of the arithmetic treats currentPenguins as an int.
        // Building has penguins in it already
        if (pressobject.currentPenguins != 0)
        {
          incomeGeneratedPerBuildingType[pressobject.type] += buildingIncome[pressobject.type] * (pressobject.currentPenguins / penguinCapacity[pressobject.type]);
          recalculateIncome();
        }

        gridSquare = stageCanvas.getObjectUnderPoint(x + iMapOffsetX + iOffset, y, 0);
        gridSquare.dispatchEvent("click");
      }
    }
  }
  totalPenguins += gon.iIdlePenguins;
  penguinCost = Math.ceil(penguinCost * Math.pow((1.0 + penguinCostScale), totalPenguins));
  updatePenValue(pShop.getChildByName("pPen"));
  updatePenguinCost(pShop.getChildByName("purchase"));
}

function loadAllUpgrades()
{
  for (j = 0 ; j < numberOfUpgrades ; j++)
  {
    var upgrade = upgradeInfoHelper[j];
    if (gon.iUpgradeStates[j] == 1)
    {
      gon.iToys = gon.iToys + upgradeCost[j]; // Add toys required to purchase upgrade
      upgrade.dispatchEvent("click");         // Purchase upgrade
    }
  }
}

// END OF LOADING CODE

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

  building.on("click", function(event) {
    if (pressobject == null)
    {
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
  if(iType == 100) {                     //100 is set as penguin
    gon.iIdlePenguins = gon.iIdlePenguins + 1;
  }
  else {
    gon.iToys += buildingCosts[iType];
  }
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

// START OF PENGUIN CODE

//Creates a penguin
function createPenguin() {
  var penguin = new createjs.Shape();
  penguin.graphics.beginStroke("black").beginFill(penguinImage).drawRect(0, 0, 20, 20);
  penguin.name = "penguin";
  penguin.type = 100;
  penguin.size = 1;
  penguinEventSetup(penguin);
  return penguin;
}

function penguinEventSetup(penguin) {
  penguin.on("click", function(event) {
    if(pressobject == null) {
      //Grab penguin graphics and store it in cursor
      temporaryCursor = event.target.clone(true);
      //temporaryCursor = drawPenguinForPlacement();
      temporaryCursor.x = stageCanvas.mouseX - 5;
      temporaryCursor.y = stageCanvas.mouseY - 5;
      stageCanvas.addChild(temporaryCursor);

    //While penguin is clicked, stageCanvas will update temporaryCursor's coordinates on mousemove
      stageCanvas.on("stagemousemove", function(event2) {
        temporaryCursor.x = event2.target.mouseX - 5;
        temporaryCursor.y = event2.target.mouseY - 5;
      });

    //Set pressobject to be a copy of event.target
      pressobject = event.target.clone(true);
      pressobject.name = event.target.name;

      if(event.target.parent == null) {
      }
    }
  });
}

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
      // Don't light up squares when dealing with penguins
      if (pressobject.name == "penguin")
      {
        return;
      }
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
// Requires refactoring and renaming!
function buildingPlacementEvent(gridSquare)
{
  gridSquare.on("click", function(event) {
    if (pressobject != null)
    {
      // Remove custom cursor
      stageCanvas.removeEventListener("stagemousemove");
      stageCanvas.removeChild(temporaryCursor);

      // If a penguin is being added to a building
      if (pressobject.name == "penguin")
      {
        // If the tile does not contain a building
        if(!gridSquare.isBuilding)
        {
          gon.iIdlePenguins = gon.iIdlePenguins + 1;
          updatePenValue(pShop.getChildByName("pPen")); // Updates the penguin pen counter
          pressobject = null;
          return;
        }
        else
        {
          var building = gridSquare.getChildByName("building");
          // If building is full, do not add a penguin to it
          if (building.currentPenguins >= penguinCapacity[building.type])
          {
            gon.iIdlePenguins = gon.iIdlePenguins + 1;
            updatePenValue(pShop.getChildByName("pPen")); // Updates the penguin pen counter
            pressobject = null;
            return;
          }
          else
          {
            incomeGeneratedPerBuildingType[building.type] -= buildingIncome[building.type] * (building.currentPenguins / penguinCapacity[building.type])
            building.currentPenguins++;
            incomeGeneratedPerBuildingType[building.type] += buildingIncome[building.type] * (building.currentPenguins / penguinCapacity[building.type])
            gon.strBuildingMapSave[(gridSquare.x - iMapOffsetX) / iBaseTileLength][gridSquare.y / iBaseTileLength][1]++;
            pressobject = null;
            recalculateIncome();
            return;
          }
        }
      }
      else
      {
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
          gon.strBuildingMapSave[(gridSquare.x - iMapOffsetX) / iBaseTileLength][gridSquare.y / iBaseTileLength][0] = pressobject.type;
          numberOfBuildingsOwned[pressobject.type]++;
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
  }
  // Removes a penguin from the building
  else
  {
    if(gridSquare.isBuilding)
    {
      var building = gridSquare.getChildByName("building");
      // If the building has a penguin, remove it, recalculate income, and 'click' it.
      if (building.currentPenguins > 0)
      {
        incomeGeneratedPerBuildingType[building.type] -= buildingIncome[building.type] * (building.currentPenguins / penguinCapacity[building.type])
        building.currentPenguins--;
        incomeGeneratedPerBuildingType[building.type] += buildingIncome[building.type] * (building.currentPenguins / penguinCapacity[building.type])
        var penguin = createPenguin();
        recalculateIncome();
        penguin.dispatchEvent("click");
      }
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
  if (Math.abs(originalX - stageX) < gridSquare.width / 2 && Math.abs(originalY - stageY) < gridSquare.width / 2
    && Math.abs(gridSquare.x - stageX) < gridSquare.width && Math.abs(gridSquare.y - stageY) < gridSquare.width
    && (stageX >= gridSquare.x) && (stageY >= gridSquare.y) )
  {
    // Updates tooltip text
    tileTooltip.getChildByName("text").text = "Terrain Type: " + terrainTypes[gridSquare.terrainType] + "\n";

    if (gridSquare.isBuilding == true)
    {
      tileTooltip.getChildByName("text").text += "Building: " + buildingTypes[gridSquare.buildingType];
      tileTooltip.getChildByName("text").text += "\nCapacity: " + gridSquare.getChildByName("building").currentPenguins + " / " + gridSquare.getChildByName("building").maxPenguins + "\n";
      tileTooltip.getChildByName("text").text += "Generating: " +
       (gridSquare.getChildByName("building").currentPenguins / penguinCapacity[gridSquare.getChildByName("building").type])
        * buildingIncome[gridSquare.getChildByName("building").type] + " toys";
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

// START OF UPGRADES : Handles the creation, purchase, and logic of upgrades

// Instantiates an upgrade based upon its index within the relevant helpers
function createUpgrade(iIndex, upgradeShop)
{
  upgrade = new createjs.Shape();
  upgrade.graphics.beginFill("orange").drawPolyStar(0, 0, 25, 3, 0, -90); // PLACEHOLDER DISPLAY
  upgrade.name = "upgrade";
  upgrade.x = 50;
  upgrade.y = 50 + iIndex * 50;

  // Tooltip initialization
  upgradeTooltip = new createjs.Container();
  var tooltipText = new createjs.Text();
  tooltipText.name = "text";
  tooltipText.font = "18px Arial";
  tooltipText.x = 10;
  tooltipText.y = 15;

  var tooltipBox = new createjs.Shape();
  tooltipBox.graphics.beginStroke("black").beginFill("#F0F0F0").drawRect(0, 0, 350, 100);

  upgradeTooltip.addChild(tooltipBox);
  upgradeTooltip.addChild(tooltipText);

  // Container properties and events
  upgrade.type = upgradeType[iIndex][0];
  upgrade.position = iIndex;
  upgrade.iIndex = iIndex;
  upgradeEventHandler(upgrade, iIndex, upgradeShop, upgradeTooltip, 50, 50);
  return upgrade;
}

// Populates the upgrade shop with all upgrades
function populateUpgradeShop(upgradeShop)
{
  for (i = 0 ; i < numberOfUpgrades ; i++)
  {
    var upgrade = createUpgrade(i, upgradeShop);
    upgradeShopSlotHelper[i] = upgrade;
    upgradeInfoHelper[i] = upgrade;
    upgradeShop.addChild(upgrade);
  }
}

// Adds the 'click' event handler to purchase an upgrade
// TO-DO: When an upgrade is purchased, all buildings affected should have their 'Generating' tooltip updated accordingly.
function upgradeEventHandler(upgrade, iIndex, upgradeShop, upgradeTooltip, buttonWidth, buttonHeight)
{
  upgrade.on("click", function(event)
  {
    bSuccess = purchaseUpgrade(upgrade, iIndex);
    if (bSuccess == true)
    {
      updateUpgradePositions(upgradeShop, upgrade);
      upgradeShop.removeChild(upgrade);
      gon.iUpgradeStates[iIndex] = 1;

      // Activates the upgrade accordingly
      var multiplerAmount = 1.0 + upgradeType[iIndex][1];

      if (upgrade.type == -1)
      {
        for (i = 0 ; i < numberOfBuildingTypes ; i++)
        {
          buildingTypeMultipliers[i] *= multiplerAmount;
        }
      }
      else if (upgrade.type == -2)
      {
        fClickMultiplier *= multiplerAmount;
      }
      else
      {
        buildingTypeMultipliers[upgrade.type] *= multiplerAmount;
      }
      recalculateIncome();
    }
    else
    {
      var errorMessage = document.getElementById("error");
      errorMessage.innerHTML = "You require " + upgradeCost[iIndex] + " toys to purchase this upgrade!";
    }
  });

  // Displays tooltip if cursor remains stationary for 2 second
  upgrade.on("mouseover", function(event)
  {
    setTimeout(displayShopButtonTooltip, 2000, stageCanvas.mouseX, stageCanvas.mouseY, upgrade, upgradeTooltip, buttonWidth, buttonHeight);
  });

  upgrade.on("mouseout", function(event)
  {
    stageCanvas.removeChild(upgradeTooltip);
  });

}

// If the user has enough toys, the upgrade is purchased
function purchaseUpgrade(upgrade, iIndex)
{
  bSuccess = false;
  if (gon.iToys >= upgradeCost[iIndex])
  {
    gon.iToys = gon.iToys - upgradeCost[iIndex];
    bSuccess = true;
  }
  return bSuccess;
}

// Fills in the empty spot made when the deletedUpgrade is purchased by the user
function updateUpgradePositions(upgradeShop, deletedUpgrade)
{
  for (i = deletedUpgrade.position + 1; i < numberOfUpgrades ; i++)
  {
    var upgrade = upgradeShopSlotHelper[i];
    if (upgrade !== null)
    {
      upgradeShop.removeChild(upgrade);
      upgrade.graphics.clear("White"); // Wipe the upgrade graphic
      upgrade.graphics.beginFill("orange").drawPolyStar(0, 0, 25, 3, 0, -90); // PLACEHOLDER DISPLAY
      upgrade.position = upgrade.position - 1; // The upgrade's position has shifted "down" 1
      upgradeShopSlotHelper[i - 1] = upgrade;
      upgradeShopSlotHelper[i] = null;
      upgrade.x = 50;
      upgrade.y = 50 + (i - 1) * 50;
      upgradeShop.addChild(upgrade);
    }
  }
}

// END OF UPGRADES

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

// BASIC GAME LOGIC //
// Initializes all necessary JS variables and adds required events for tracking base logic (income, etc)
function initialize()
{
    document.getElementById("nickname").innerHTML = gon.strNickname + "'s Workshop";
    updateToys();

    interval = setInterval(updateClock(gon.iTimeLeft), 1000);
    admin();

    window.odometerOptions = {
      duration: 800
    };
}

// Increments the user's local toys (gon.iToys) by an amount determined by their given multiplier.
function incrementToys()
{
  gon.iToys = gon.iToys + iClickingBase * fClickMultiplier;
  updateToys();
}

// Recalculates total income based around building income (by type) and mulipliers.
// Does not recalculate cost for individual buildings : This is done during penguin placement
function recalculateIncome()
{
  fTotalPassiveIncome = 0;

  for (i = 0 ; i < numberOfBuildingTypes ; i++)
  {
    fTotalPassiveIncome += incomeGeneratedPerBuildingType[i] * buildingTypeMultipliers[i];
  }
}

// Updates the displayed toys on screen
function updateToys()
{
  document.getElementById("toys").innerHTML = gon.iToys.toFixed(2) + " toys";
  document.getElementById("income").innerHTML = fTotalPassiveIncome.toFixed(2) + " toys per second";
}

var callSave = function(){
  //window.alert(JSON.stringify(gon.strBuildingMapSave));
$.ajax({
  url: "save",
  type: "put",
  data: {toys: Number(gon.iToys), time_left: Number(gon.iTimeLeft), idle_penguins: Number(gon.iIdlePenguins),
     map: JSON.stringify(gon.strMapSave), building_map: JSON.stringify(gon.strBuildingMapSave),
     upgrade_states: JSON.stringify(gon.iUpgradeStates)}
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

    gon.iToys += fTotalPassiveIncome;
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
