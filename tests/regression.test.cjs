const test = require('node:test');
const assert = require('node:assert/strict');
const {
  harness,
  loadData
} = require('./harness.cjs');
const GameRules = require('../game-rules.js');
const SaveStore = require('../save-store.js');
const setup = () => {
  const h = harness();
  h.run('startNewGame(true)');
  return h;
};
const clone = x => JSON.parse(JSON.stringify(x));
test('new game immediately saves and can reload through the actual UI renderers', () => {
  const h = setup();
  const other = harness(h.saved);
  other.run('loadGame()');
  assert.equal(other.run('player.credits'), 50);
  assert.equal(other.run('player.ship.currentHull'), 21);
  assert.deepEqual(other.alerts, []);
});
test('paid quest reward survives equipment cancellation and reload without paying again', () => {
  const h = setup();
  h.run(`player.credits=2000;player.flags.meet_bitz=true;currentSystem=galaxy.find(s=>s.id===8);currentPoi=currentSystem.pois.find(p=>p.name==='Bitz and Bobs Outfitters');spawnedNPCs=[];startEncounter('Bitz');chooseDialogueOption(1);chooseDialogueOption(0);claimRewardItem('equip');closeTradeIn();`);
  assert.equal(h.run('player.credits'), 0);
  assert.equal(h.run('player.tasks.meet_bitz'), 'completed');
  assert.equal(h.run("player.storage.filter(x=>x==='Drive T3').length"), 1);
  const other = harness(h.saved);
  other.run('loadGame()');
  assert.equal(other.run("player.storage.filter(x=>x==='Drive T3').length"), 1);
  assert.equal(other.run('player.ship.core.warpDrive'), 'Drive T1');
  assert.deepEqual(other.alerts, []);
});
test('closing the reward modal via reload keeps the item and completed quest', () => {
  const h = setup();
  h.run(`player.flags.killed_locus=true;currentSystem=galaxy.find(s=>s.id===8);currentPoi=currentSystem.pois[2];spawnedNPCs=[];startEncounter('Bitz');chooseDialogueOption(0);chooseDialogueOption(0);`);
  const other = harness(h.saved);
  other.run('loadGame()');
  assert.equal(other.run("player.storage.includes('Drive T3')"), true);
  assert.equal(other.run('player.tasks.locus_done'), 'completed');
  assert.deepEqual(other.alerts, []);
});
test('cargo downgrade is rejected without changing inventory, credits, or save', () => {
  const h = setup();
  h.run(`player.ship.core.cargoBay='Bay T3';player.cargo={Water:12};player.storage=['Bay T1'];refreshDerivedStats();saveGame();`);
  const before = h.run('JSON.stringify(player)'),
    beforeSave = h.saved.get(SaveStore.KEY);
  h.run(`startEquipProcess('cargoBay','Bay T1',0,true,0);finalizeEquipmentChange('trade')`);
  assert.equal(h.run('JSON.stringify(player)'), before);
  assert.equal(h.saved.get(SaveStore.KEY), beforeSave);
  assert.match(h.alerts.at(-1), /Unload cargo/);
});
test('cargo expansion replacement is rejected and legal stored equipment installs exactly once', () => {
  const h = setup();
  h.run(`player.ship.modules=['Cargo Exp T1'];player.cargo={Water:8};player.storage=['T1 FP'];refreshDerivedStats();saveGame();startEquipProcess('module','T1 FP',0,true,0);selectModuleToReplace(0,'Cargo Exp T1');finalizeEquipmentChange('store');`);
  assert.equal(h.run('player.ship.modules[0]'), 'Cargo Exp T1');
  assert.equal(h.run('player.storage[0]'), 'T1 FP');
  h.run(`player.cargo={Water:4};finalizeEquipmentChange('store');`);
  assert.equal(h.run('player.ship.modules[0]'), 'T1 FP');
  assert.equal(h.run('player.storage[0]'), 'Cargo Exp T1');
  assert.equal(h.run('player.storage.length'), 1);
});
test('shipyard preview and purchase retain the same fitted equipment and capacity', () => {
  const h = setup();
  h.run(`player.credits=5000;player.ship.core.cargoBay='Bay T3';player.cargo={Water:3};currentPoi=galaxy[0].pois.find(p=>p.type==='Ship Vendor');`);
  const preview = h.run("rules.previewShip(player,'Midgeito')");
  assert.equal(preview.stats.cargoMax, 3);
  assert.equal(preview.error, '');
  h.run("buyShip('Midgeito')");
  assert.equal(h.run('player.cargoMax'), preview.stats.cargoMax);
  assert.equal(h.run('player.ship.core.cargoBay'), 'Bay T3');
  assert.deepEqual(h.alerts, []);
});
test('janitor completion awards XP once through real dialogue buttons', () => {
  const h = setup();
  h.run(`currentSystem=galaxy.find(s=>s.id===13);currentPoi=currentSystem.pois[0];spawnedNPCs=[];player.tasks.moving_on='active';startEncounter('Mysterious Janitor');chooseDialogueOption(0);chooseDialogueOption(0);startEncounter('Mysterious Janitor');chooseDialogueOption(0);chooseDialogueOption(0);`);
  assert.equal(h.run('player.xp'), 50);
  assert.equal(h.run('player.tasks.moving_on'), 'completed');
});
function startTestCombat(h, enemyHull = 1) {
  h.run(`spawnedNPCs=[];player.skills.weapon=1000;startCombat('',{name:'Test Opponent',shipHull:'Weescow',image:'ship_weescow.png',stats:{hull:${enemyHull},armour:0,handling:0,firepower:0,accuracy:0,piloting:0,weapon:0}});`);
}
test('combat victory is saved immediately and cannot pay XP twice after reload', () => {
  const h = setup();
  startTestCombat(h);
  h.run("doCombatRound('attack')");
  const xp = h.run('player.xp');
  assert.equal(xp, 150);
  const other = harness(h.saved);
  other.run("loadGame();doCombatRound('attack')");
  assert.equal(other.run('combatStatus'), 'won');
  assert.equal(other.run('player.xp'), xp);
  other.run('continueCombat()');
  assert.equal(other.run('currentEnemy'), null);
  assert.equal(JSON.parse(other.saved.get(SaveStore.KEY)).player.xp, xp);
  assert.deepEqual(other.alerts, []);
});
test('active combat reload retains damage and advantage instead of restarting enemy hull', () => {
  const h = setup();
  startTestCombat(h, 10000);
  h.run("doCombatRound('attack');playerAdvantage=2;saveGame()");
  const hull = h.run('currentEnemy.currentHull');
  const other = harness(h.saved);
  other.run('loadGame()');
  assert.equal(other.run('currentEnemy.currentHull'), hull);
  assert.equal(other.run('playerAdvantage'), 2);
  assert.equal(other.run('combatStatus'), 'active');
  assert.equal(other.run('activeTab'), 'battle');
  assert.deepEqual(other.alerts, []);
});
test('victory continuation after reload resumes the scripted boss chain', () => {
  const h = setup();
  startTestCombat(h);
  h.run("combatWinEncounter='High Locus';doCombatRound('attack')");
  const other = harness(h.saved);
  other.run('loadGame();continueCombat()');
  assert.equal(other.run('currentEncounterName'), 'High Locus');
  assert.equal(other.run('currentEnemy'), null);
  assert.equal(other.run('player.xp'), 150);
  assert.deepEqual(other.alerts, []);
});
test('valid V4 saves migrate in memory without rewriting on load', () => {
  const h = setup();
  const legacy = JSON.parse(h.saved.get(SaveStore.KEY));
  delete legacy.version;
  delete legacy.runtime;
  delete legacy.player.storage;
  delete legacy.player.skills.charm;
  const text = JSON.stringify(legacy);
  h.saved.set(SaveStore.KEY, text);
  const other = harness(h.saved);
  other.run('loadGame()');
  assert.equal(other.run('player.skills.charm'), 10);
  assert.equal(other.run('player.storage.length'), 0);
  assert.equal(other.saved.get(SaveStore.KEY), text);
  assert.deepEqual(other.alerts, []);
});
test('parse and render failures preserve the primary save and previous backup', () => {
  const h = setup();
  h.run('player.credits=75;saveGame()');
  const primary = h.saved.get(SaveStore.KEY),
    backup = h.saved.get(SaveStore.BACKUP_KEY);
  const other = harness(h.saved);
  other.run("updateUI=()=>{throw Error('render failure')};loadGame()");
  assert.equal(other.saved.get(SaveStore.KEY), primary);
  assert.equal(other.saved.get(SaveStore.BACKUP_KEY), backup);
  h.saved.set(SaveStore.KEY, '{invalid');
  h.run('loadGame()');
  assert.equal(h.saved.get(SaveStore.KEY), '{invalid');
  assert.equal(h.saved.get(SaveStore.BACKUP_KEY), backup);
  h.run('loadGame(true)');
  assert.equal(h.run('player.credits'), 50);
});
test('failed persistence writes preserve the previous save', () => {
  const data = loadData(),
    memory = new Map();
  let fail = false;
  const store = SaveStore.create({
    getItem: key => memory.get(key),
    setItem(key, value) {
      if (fail) throw Error('quota');
      memory.set(key, value);
    },
    removeItem: key => memory.delete(key)
  }, data);
  const h = setup();
  const snapshot = JSON.parse(h.saved.get(SaveStore.KEY));
  store.write(snapshot);
  const previous = memory.get(SaveStore.KEY);
  fail = true;
  assert.throws(() => store.write({
    ...snapshot,
    player: {
      ...snapshot.player,
      credits: 300
    }
  }), /quota/);
  assert.equal(memory.get(SaveStore.KEY), previous);
});
test('pure actions do not mutate their inputs, and reject insufficient funds', () => {
  const data = loadData(),
    rules = GameRules.create(data);
  const h = setup(),
    player = clone(h.run('player')),
    before = clone(player);
  assert.throws(() => rules.previewEquipment(player, {
    category: 'weapons',
    itemName: 'Weap T2',
    fromStorage: false
  }, 'trade'), /Insufficient/);
  assert.deepEqual(player, before);
  const next = rules.trade(player, 'Water', 8, true);
  assert.equal(next.cargo.Water, 1);
  assert.deepEqual(player, before);
});
test('dialogue rendering does not generate or reroll job offers', () => {
  const h = setup();
  h.run("spawnedNPCs=[];startEncounter('Dispatcher Varlo');chooseDialogueOption(0)");
  const before = h.run('JSON.stringify(window.currentTaxiOffers)');
  h.run('renderEncounter();renderEncounter()');
  assert.equal(h.run('JSON.stringify(window.currentTaxiOffers)'), before);
  const other = harness(h.saved);
  other.run('loadGame()');
  assert.equal(other.run('JSON.stringify(window.currentTaxiOffers)'), before);
  assert.deepEqual(other.alerts, []);
});
test('bounty victory saves credits, contract completion and NPC removal together', () => {
  const h = setup();
  h.run(`player.skills.weapon=1000;player.activeBounty={targetName:'Bounty Test',targetSysId:0,targetSysName:'Herbies Star',targetImage:'default.png',shipHull:'Weescow',stats:{hull:1,armour:0,handling:0,firepower:0,accuracy:0,piloting:0,weapon:0},reward:175,xpReward:25};player.tasks.bounty_mission='active';generateNPCs();startEncounter('SYSTEM_BOUNTY_TARGET','Bounty Test');chooseDialogueOption(0);doCombatRound('attack')`);
  const other = harness(h.saved);
  other.run('loadGame()');
  assert.equal(other.run('player.credits'), 225);
  assert.equal(other.run('player.xp'), 25);
  assert.equal(other.run('player.activeBounty'), null);
  assert.equal(other.run('player.tasks.bounty_mission'), 'completed');
  assert.equal(other.run('spawnedNPCs.some(n=>n.isBountyTarget)'), false);
  assert.deepEqual(other.alerts, []);
});
test('fatal combat and escape retain their terminal state after reload', () => {
  for (const outcome of ['lost', 'escaped']) {
    const h = setup();
    startTestCombat(h, 10000);
    h.run(`rules.combatRound=()=>({winner:'${outcome === 'lost' ? 'enemy' : 'player'}',enemyAction:'attack',damageToPlayer:${outcome === 'lost' ? 100 : 0},damageToEnemy:0,escaped:${outcome === 'escaped'}});doCombatRound('flee');`);
    const other = harness(h.saved);
    other.run('loadGame()');
    assert.equal(other.run('combatStatus'), outcome);
    const hull = other.run('player.ship.currentHull');
    other.run("doCombatRound('attack')");
    assert.equal(other.run('player.ship.currentHull'), hull);
    other.run('continueCombat()');
    if (outcome === 'lost') assert.equal(h.saved.has(SaveStore.KEY), false);else assert.equal(other.run('currentEnemy'), null);
    assert.deepEqual(other.alerts, []);
  }
});
test('taxi pickup and payment persist without clicking Leave and cannot pay twice', () => {
  const h = setup();
  h.run(`currentPoi=currentSystem.pois[0];spawnedNPCs=[];player.activeTaxi={status:'pickup',client:{name:'Test Passenger',image:'default.png'},pickupSysId:0,pickupPoiName:currentPoi.name,dropoffSysId:0,dropoffSysName:currentSystem.name,dropoffPoiName:currentPoi.name,reward:60,xpReward:15,pickupText:'Hello',dropoffText:'Thank you'};quests.taxi_mission={title:'Taxi'};player.tasks.taxi_mission='active';startTaxiPickup();`);
  const other = harness(h.saved);
  other.run('loadGame()');
  assert.equal(other.run('player.activeTaxi.status'), 'dropoff');
  other.run("selectDialogue('leave');startTaxiDropoff()");
  const final = harness(h.saved);
  final.run('loadGame();completeTaxiDropoff()');
  assert.equal(final.run('player.credits'), 110);
  assert.equal(final.run('player.xp'), 15);
  assert.equal(final.run('player.activeTaxi'), null);
  assert.deepEqual(final.alerts, []);
});
test('render failure after a committed purchase cannot discard the purchase', () => {
  const h = setup();
  h.run("currentPoi=currentSystem.pois[0];updateUI=()=>{throw Error('render failure')}");
  assert.throws(() => h.run("buyGood('Water')"), /render failure/);
  const other = harness(h.saved);
  other.run('loadGame()');
  assert.equal(other.run('player.cargo.Water'), 1);
  assert.deepEqual(other.alerts, []);
});
