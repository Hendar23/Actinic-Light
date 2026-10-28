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

test('shipyard opens through the UI and displays catalog prices before purchase', () => {
  const h = setup();
  h.run("player.credits=5000;currentPoi=currentSystem.pois.find(p=>p.type==='Ship Vendor');setLocalView('shipyard')");
  assert.match(h.elements.get('tab-local').innerHTML, /Base Price: 1,200 CR/);
  assert.match(h.elements.get('tab-local').innerHTML, /buyShip/);
  h.run("buyShip('Midgeito')");
  assert.equal(h.run('player.ship.hull'), 'Midgeito');
  const reload = harness(h.saved);
  reload.run('loadGame()');
  assert.equal(reload.run('player.ship.hull'), 'Midgeito');
  assert.deepEqual(reload.alerts, []);
});

test('zero multipliers and weight survive into actual ship statistics', () => {
  const h = setup();
  h.run('shipHulls.Weescow.multipliers.firepower=0;shipHulls.Weescow.multipliers.accuracy=0;shipHulls.Weescow.weight=0');
  const stats = h.run('getShipStats(player.ship)');
  assert.equal(stats.firepower, 0);
  assert.equal(stats.accuracy, 0);
  assert.equal(stats.multFirepower, 0);
  assert.equal(stats.multAccuracy, 0);
  assert.equal(stats.chassisWeight, 0);
});

test('renaming and reordering stations preserves the saved location by ID', () => {
  const h = setup();
  h.run('currentPoi=currentSystem.pois[0];saveGame()');
  const stationId = h.run('currentPoi.id');
  const reload = harness(h.saved);
  reload.run("galaxy[0].pois[0].name='Renamed station';galaxy[0].pois.reverse();loadGame()");
  assert.equal(reload.run('currentPoi.id'), stationId);
  assert.equal(reload.run('currentPoi.name'), 'Renamed station');
  assert.deepEqual(reload.alerts, []);
});

test('V5 station names migrate in memory even after renaming, without rewriting the save', () => {
  const h = setup();
  h.run('currentPoi=currentSystem.pois[0];saveGame()');
  const saved = JSON.parse(h.saved.get(SaveStore.KEY));
  saved.version = 5;
  delete saved.poiId;
  const text = JSON.stringify(saved);
  h.saved.set(SaveStore.KEY, text);
  const reload = harness(h.saved);
  reload.run("galaxy[0].pois[0].name='Renamed station';loadGame()");
  assert.equal(reload.run('currentPoi.name'), 'Renamed station');
  assert.equal(reload.saved.get(SaveStore.KEY), text);
  assert.deepEqual(reload.alerts, []);
});

test('removing a saved station returns to orbit and preserves player progress', () => {
  const h = setup();
  h.run('currentPoi=currentSystem.pois[0];player.credits=123;saveGame()');
  const reload = harness(h.saved);
  reload.run('galaxy[0].pois.shift();loadGame()');
  assert.equal(reload.run('currentPoi'), null);
  assert.equal(reload.run('player.credits'), 123);
  assert.equal(reload.run('localView'), 'menu');
  assert.deepEqual(reload.alerts, []);
});

test('explicit legacy equipment, ship and commodity IDs migrate without losing ownership', () => {
  const h = setup();
  h.run("player.cargo.Water=2;player.storage=['Drive T1'];saveGame()");
  const reload = harness(h.saved);
  reload.run(`shipHulls.NewHull={...shipHulls.Weescow,legacyIds:['Weescow']};delete shipHulls.Weescow;
    equipment.warpDrive.NewDrive={...equipment.warpDrive['Drive T1'],legacyIds:['Drive T1']};delete equipment.warpDrive['Drive T1'];
    commodities.NewWater={...commodities.Water,legacyIds:['Water']};delete commodities.Water;loadGame()`);
  assert.equal(reload.run('player.ship.hull'), 'NewHull');
  assert.equal(reload.run('player.ship.core.warpDrive'), 'NewDrive');
  assert.equal(reload.run('player.storage[0]'), 'NewDrive');
  assert.equal(reload.run('player.cargo.NewWater'), 2);
  assert.deepEqual(reload.alerts, []);
});

test('taxi destinations survive rename and reload, and pickup uses IDs', () => {
  const h = setup();
  h.run(`currentPoi=currentSystem.pois[0];player.activeTaxi={status:'pickup',client:{name:'Passenger'},pickupSysId:0,pickupPoiId:currentPoi.id,pickupPoiName:currentPoi.name,dropoffSysId:0,dropoffPoiId:currentPoi.id,dropoffPoiName:currentPoi.name,reward:60,xpReward:15};player.tasks.taxi_mission='active';saveGame()`);
  const reload = harness(h.saved);
  reload.run("galaxy[0].pois[0].name='Renamed terminal';loadGame()");
  assert.equal(reload.run("isTaxiLocation('pickup')"), true);
  assert.equal(reload.run('player.activeTaxi.pickupPoiName'), 'Renamed terminal');
  assert.deepEqual(reload.alerts, []);
});

test('a removed taxi destination cancels the contract without blocking load', () => {
  const h = setup();
  h.run(`player.activeTaxi={status:'pickup',client:{name:'Passenger'},pickupSysId:0,pickupPoiId:currentSystem.pois[0].id,pickupPoiName:currentSystem.pois[0].name,dropoffSysId:0,dropoffPoiId:currentSystem.pois[1].id,dropoffPoiName:currentSystem.pois[1].name,reward:60,xpReward:15};player.tasks.taxi_mission='active';saveGame()`);
  const reload = harness(h.saved);
  reload.run('galaxy[0].pois.shift();loadGame()');
  assert.equal(reload.run('player.activeTaxi'), null);
  assert.equal(reload.run('player.tasks.taxi_mission'), 'failed');
  assert.deepEqual(reload.alerts, []);
});

test('mission generators return no offers when there are no valid destinations', () => {
  const h = setup();
  h.run("galaxy.splice(0,galaxy.length,{id:0,name:'Empty',x:0,y:0,pois:[]});currentSystem=galaxy[0]");
  assert.equal(h.run('generateTaxiJob(100)'), null);
  assert.equal(h.run('generateBountyJob(100)'), null);
  h.run("runtimeEncounters.Board={dialogue:{start:{text:'Jobs',generateTaxiJobs:true,generateBountyJobs:true,options:[]}}};startEncounter('Board')");
  assert.equal(h.run('window.currentTaxiOffers.length'), 0);
  assert.equal(h.run('window.currentBountyOffers.length'), 0);
  assert.match(h.run('renderEncounter()'), /No eligible taxi routes/);
  assert.match(h.run('renderEncounter()'), /No eligible bounty destinations/);
});

test('taxi generation excludes locked stations and never selects identical endpoints', () => {
  const h = setup();
  h.run(`galaxy.splice(0,galaxy.length,{id:0,name:'Test',x:0,y:0,pois:[{id:'a',name:'A',type:'Trade Hub'},{id:'b',name:'B',type:'Trade Hub',requiresFlag:'locked'}]});currentSystem=galaxy[0];Math.random=()=>0`);
  assert.equal(h.run('generateTaxiJob(0)'), null);
  h.run('player.flags.locked=true');
  const job = h.run('generateTaxiJob(0)');
  assert.equal(job.pickupPoiId, 'a');
  assert.equal(job.dropoffPoiId, 'b');
  assert.equal(job.reward, 11);
});

test('bounty generation enforces distance, hull availability and zero-valued stats', () => {
  const h = setup();
  assert.equal(h.run("generateBountyJob(0,'Weescow',{})"), null);
  assert.equal(h.run("generateBountyJob(1000,'Missing Hull',{})"), null);
  h.run('Math.random=()=>0');
  const job = h.run("generateBountyJob(1000,'Weescow',{armour:0,accuracy:0,firepower:0})");
  assert.notEqual(job.targetSysId, h.run('currentSystem.id'));
  assert.equal(job.stats.armour, 0);
  assert.equal(job.stats.accuracy, 0);
  assert.equal(job.stats.firepower, 0);
  assert.ok(h.run(`Math.hypot(galaxy.find(s=>s.id===${job.targetSysId}).x-currentSystem.x,galaxy.find(s=>s.id===${job.targetSysId}).y-currentSystem.y)`) <= 1000);
});

test('generated taxi dialogue cannot overwrite an authored encounter, including after reload', () => {
  const h = setup();
  const authored = h.run('JSON.stringify(interactions.Bob)');
  h.run(`currentPoi=currentSystem.pois[0];spawnedNPCs=[];player.activeTaxi={status:'pickup',client:{name:'Bob',image:'default.png'},pickupSysId:0,pickupPoiName:currentPoi.name,dropoffSysId:0,dropoffPoiName:currentPoi.name,reward:20,xpReward:5,pickupText:'Taxi hello'};quests.taxi_mission={};startTaxiPickup()`);
  assert.equal(h.run('JSON.stringify(interactions.Bob)'), authored);
  assert.equal(h.run('currentEncounterDisplayName'), 'Bob');
  assert.match(h.run('renderEncounter()'), /Taxi hello/);
  const reload = harness(h.saved);
  reload.run('loadGame()');
  assert.equal(reload.run('JSON.stringify(interactions.Bob)'), authored);
  assert.match(reload.run('renderEncounter()'), /Taxi hello/);
  reload.run("selectDialogue('leave');startEncounter('Bob')");
  assert.equal(reload.run('JSON.stringify(getEncounter(currentEncounterName))'), authored);
  assert.deepEqual(reload.alerts, []);
});

test('legacy dialogue snapshots never shadow authored encounters after leaving', () => {
  const h = setup();
  h.run("spawnedNPCs=[];startEncounter('Bob')");
  const authored = h.run('JSON.stringify(interactions.Bob)');
  const saved = JSON.parse(h.saved.get(SaveStore.KEY));
  saved.version = 5;
  saved.runtime.encounter.data.dialogue.start.text = 'Legacy generated taxi dialogue';
  h.saved.set(SaveStore.KEY, JSON.stringify(saved));
  const reload = harness(h.saved);
  reload.run('loadGame()');
  assert.match(reload.run('renderEncounter()'), /Legacy generated taxi dialogue/);
  reload.run("selectDialogue('leave');startEncounter('Bob')");
  assert.equal(reload.run('JSON.stringify(getCurrentEncounter())'), authored);
  assert.deepEqual(reload.alerts, []);
});
