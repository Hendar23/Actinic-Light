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
});
