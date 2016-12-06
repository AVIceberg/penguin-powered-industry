
// include spec/javascripts/helpers/jasmine_helper.rb and app/assets/javascripts/game.js
//= require helpers/jasmine_helper
//= require game


describe("Gamepage", function() {

	it("spec works", function() {
		expect(true).toBe(true);
	});
});

describe("Toys", function() {

	it("successfully increments toys", function() {
		var toys = 1.0;
		incrementToys();
		expect(returnToys()).toEqual(toys);
	});
});

describe("Passive Events", function() {

	it("income successfully delayed", function() {
		var fZero = 0.0;
		incomeGeneratedPerBuildingType[0] = 5;
		recalculateIncome();
		modifyIncome(iEvent, 'delay');
		expect(fTotalPassiveIncome).toEqual(fZero);
	});

	it("income successfully renewed", function() {
		var fZero = 0.0;
		incomeGeneratedPerBuildingType[0] = 5;
		recalculateIncome();
		modifyIncome(iEvent, 'delay');
		returnIncome(fAmount, fTime, realNumberOfBuildingTypes);
		expect(fTotalPassiveIncome).not.toEqual(fZero);
	});

	it("income not reset upon recalculation", function() {
		var fZero = 0.0;
		modifyIncome(iEvent, 'delay');
		recalculateIncome();
		expect(fTotalPassiveIncome).toEqual(fZero);
	});

	it("Income successfully changed upon change event", function() {
		fTotalPassiveIncome = 5.0;
		var prevIncome = fTotalPassiveIncome;
		changeIncome(iEvent, eventInfo);
		expect(fTotalPassiveIncome).not.toEqual(prevIncome);
	});
});

describe("Toy Events", function() {

	it("Number of toys cannot drop below 0", function() {
		fZero = 0.0;
		eventInfo[3] = -6;        //subtraction of 6 toys
		gon.iToys = 5.0;
		changeCurrentToys(iEvent, eventInfo);
		expect(returnToys()).toEqual(fZero);
	});

	it("Number of toys is added correctly", function() {
		fFour = 4.0;
		eventInfo[3] = 4;
		gon.iToys = 0.0;
		changeCurrentToys(iEvent, eventInfo);
		expect(returnToys()).toEqual(fFour);
	});
});

describe("Building Purchase", function() {

	it("labour camp can be purchased", function() {
		gon.iToys = 100.0;
		var buildingPresc = purchaseBuilding("Labour Camp", 0);
		expect(buildingPresc);
	});

	it("toy mine can be purchased", function() {
		gon.iToys = 500.0;
		var buildingPresc = purchaseBuilding("Toy Mine", 1);
		expect(buildingPresc);
	});

	it("factory can be purchased", function() {
		gon.iToys = 2500.0;
		var buildingPresc = purchaseBuilding("Factory", 2);
		expect(buildingPresc);
	});

	it("building has no penguins upon purchase", function() {
		gon.iToys = 100.0;
		var buildingPresc = purchaseBuilding("Labour Camp", 0);
		expect(buildingPresc.currentPenguins).toEqual(0);
	});

	it("indexes type properly", function() {
		gon.iToys = 100.0;
		var buildingPresc = purchaseBuilding("Labour Camp", 0);
		expect(buildingPresc.type).toEqual(0);
	});

	it("labour camp has size 1", function() {
		gon.iToys = 100.0;
		var buildingPresc = purchaseBuilding("Labour Camp", 0);
		expect(buildingPresc.size).toEqual(1);
	});

	it("toy mine has size 1", function() {
		gon.iToys = 500.0;
		var buildingPresc = purchaseBuilding("Toy Mine", 1);
		expect(buildingPresc.size).toEqual(1);
	});

	it("factory has size 2", function() {
		gon.iToys = 2500.0;
		var buildingPresc = purchaseBuilding("Factory", 2);
		expect(building.size).not.toEqual(1);
	});
});

describe("Refunds", function() {

	it("Buildings are refunded appropriately", function() {
		refundBuildingPurchase(0);
		expect(returnToys()).toEqual(100);
	});

	it("penguins refund properly", function() {
		refundBuildingPurchase(100);
		expect(gon.iIdlePenguins).toEqual(1);
	});
});

describe("Penguins", function() {

	it("can be purchased", function() {
		gon.iIdlePenguins = 0;
		gon.iToys = 5000.0;
		purchasePenguin();
		expect(gon.iIdlePenguins).toEqual(1);
	});

	it("cost increases as it gets purchased", function() {
		gon.iToys = 5000.0;
		var temp = penguinCost;
		purchasePenguin();
		expect(penguinCost).not.toEqual(temp);
	});
});

describe("Invalid Events", function() {

	it("works", function() {
		var boolean = eventInvalid(1);     //toy mine event; no toy mine exists
		expect(boolean).not.toEqual(true);
	});
});

describe("Upgrades", function() {
	it("Building multiplier successfully changed", function() {
		buildingTypeMultiplier[0] = 1.0;
		var multiplierAmount = 1.1;
		upgradeBuildingMultiplier(0, multiplierAmount);
		expect(buildingTypeMultiplier[0]).toEqual(1.1);
	});

	it("Click multiplier successfully changed", function() {
		fClickMultiplier = 1.0;
		var multiplierAmount = 1.1;
		upgradeClickMultiplier(multiplierAmount);
		expect(fClickMultiplier).toEqual(1.1);
	});
});

decribe("Tooltips", function() {
	it("Building name returned correctly", function() {
		var buildingName = getBuildingName(0);
		expect(buildingName).toEqual("Labour Camp");

		buildingName = getBuildingName(1);
		expect(buildingName).toEqual("Toy Mine");
	});

	it("Building capacity returned correctly", function() {
		var building = purchaseBuilding("Labour Camp", 0);
		building.currentPenguins = 2;
		var strCapacity = getCapacity(building);
		expect(strCapacity).toEqual("2 / 20");
	});

	it("Current Generation should be returned correctly", function() {
		var building = purchaseBuilding("Labour Camp", 0);
		building.currentPenguins = 2;
		buildingTypeMultipliers[0] = 1.0 // Ensure the answer is not somehow manipulated
		var fValue = getCurrentGeneration(building);
		expect(fValue).toEqual(2);
	});
});
