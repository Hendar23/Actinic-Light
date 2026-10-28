const test = require('node:test'),
  assert = require('node:assert/strict'),
  vm = require('node:vm');
const {
  loadData,
  source
} = require('./harness.cjs');
const DataValidator = require('../data-validator.js');
test('current playable content has valid links, equipment and quest destinations', () => {
  const result = DataValidator.validate(loadData());
  assert.deepEqual(result.errors, []);
  // This historical quest is not reachable from any placed encounter.
  assert.deepEqual(result.warnings, ['meet_frank: quest destination does not exist (unused content)']);
});
test('validator catches broken live content before the editor overwrites data', () => {
  const data = loadData();
  data.galaxy[0].pois[1].encounters.push('Missing Encounter');
  data.quests.meet_bob.targetSystemId = 999;
  const errors = DataValidator.validate(data).errors;
  assert.ok(errors.some(e => e.includes('Missing Encounter')));
  assert.ok(errors.some(e => e.includes('meet_bob')));
});
test('numeric validation rejects malformed stats, nonfinite values and invalid counts', () => {
  const data = loadData();
  data.equipment.weapons['Weap T1'].firepower = 'bad';
  data.shipHulls.Weescow.multipliers.firepower = Infinity;
  data.shipHulls.Weescow.modularSlots = 1.5;
  data.commodities.Water.basePrice = -1;
  const errors = DataValidator.validate(data).errors;
  for (const field of ['Weap T1/firepower', 'Weescow/multipliers/firepower', 'Weescow/modularSlots', 'Water/basePrice']) {
    assert.ok(errors.some(error => error.includes(field)), field);
  }
});
test('numeric validation accepts zero-valued multipliers, weapons and mission settings', () => {
  const data = loadData();
  data.equipment.weapons['Weap T1'].firepower = 0;
  data.shipHulls.Weescow.weight = 0;
  data.shipHulls.Weescow.multipliers.firepower = 0;
  data.shipHulls.Weescow.multipliers.accuracy = 0;
  data.interactions.Bob.dialogue.start.bountyJobCount = 0;
  data.interactions.Bob.dialogue.start.bountyMaxDistance = 0;
  assert.deepEqual(DataValidator.validate(data).errors, []);
});
test('content validation rejects duplicate station IDs and ambiguous migration aliases', () => {
  const data = loadData();
  data.galaxy[0].pois[1].id = data.galaxy[0].pois[0].id;
  data.equipment.warpDrive['Drive T2'].legacyIds = ['Drive T1'];
  const errors = DataValidator.validate(data).errors;
  assert.ok(errors.some(error => error.includes('duplicate station ID')));
  assert.ok(errors.some(error => error.includes('ambiguous legacy ID Drive T1')));
});
test('editor serializers round-trip content, zero values and future fields without loss', () => {
  const data = loadData();
  const element = {
    addEventListener() {},
    classList: {
      add() {},
      remove() {}
    },
    getContext() {
      return {};
    },
    style: {}
  };
  const c = vm.createContext({
    console,
    crypto: require('node:crypto').webcrypto,
    window: {
      addEventListener() {}
    },
    document: {
      getElementById() {
        return element;
      },
      querySelectorAll() {
        return [];
      }
    },
    DataValidator,
    fixture: data
  });
  for (const script of source('Editor.html').matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) if (!script[1].includes('src=')) vm.runInContext(script[2], c);
  vm.runInContext(`galaxy=fixture.galaxy;mapBackgrounds=[];interactions=fixture.interactions;shipHullsData=fixture.shipHulls;equipmentData=fixture.equipment;galaxy[0].futureField='preserve';shipHullsData.Weescow.weight=0;interactions['High Locus'].dialogue.start.options[0].customEnemy.stats.accuracy=0;`, c);
  const output = vm.runInContext("stringifyShipsAndEq()+'\\n'+stringifyInteractions()+'\\n'+stringifyMap()", c);
  const roundTrip = vm.runInNewContext(output + ';({galaxy,shipHulls,interactions})');
  assert.equal(roundTrip.galaxy[0].futureField, 'preserve');
  assert.equal(roundTrip.shipHulls.Weescow.weight, 0);
  assert.equal(roundTrip.interactions['High Locus'].dialogue.start.options[0].customEnemy.stats.accuracy, 0);
  assert.equal(roundTrip.galaxy[0].pois[0].id, data.galaxy[0].pois[0].id);
  vm.runInContext('buildMapInspector=()=>{};renderMap=()=>{};selectedSystem=galaxy[0];addPoi()', c);
  const newId = vm.runInContext('selectedSystem.pois.at(-1).id', c);
  assert.match(newId, /^[0-9a-f-]{36}$/);
  vm.runInContext("updatePoiData(selectedSystem.pois.length-1,'name','Renamed station');movePoiUp(selectedSystem.pois.length-1)", c);
  assert.equal(vm.runInContext('selectedSystem.pois.at(-2).id', c), newId);
});
