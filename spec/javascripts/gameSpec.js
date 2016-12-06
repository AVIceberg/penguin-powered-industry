
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

	it("income changes upon change event", function() {
		fTotalPassiveIncome = 5.0;
		var prevIncome = fTotalPassiveIncome;
		changeIncome(iEvent, eventInfo);
		expect(fTotalPassiveIncome).not.toEqual(prevIncome);
	});
});

describe("Toy Events", function() {

	it("toys dont drop below zero", function() {
		fZero = 0.0;
		eventInfo[3] = -6;        //subtraction of 6 toys
		gon.iToys = 5.0;
		changeCurrentToys(iEvent, eventInfo);
		expect(returnToys()).toEqual(fZero);
	});

	it("toys add properly", function() {
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

	it("building refunds properly", function() {
		refundBuildingPurchase(0);
		expect(returnToys()).toEqual(100); 
	});

	it("penguins refund properly", function() {
		refundBuildingPurchase(100);
		expect(gon.iIdlePenguins).toEqual(1);
	});
});