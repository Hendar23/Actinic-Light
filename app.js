// Browser controller: applies actions, persists transitions, then updates the view.
const rules = GameRules.create({
  shipHulls,
  equipment,
  quests,
  commodities
});
const saveStore = SaveStore.create({
  getItem: key => localStorage.getItem(key),
  setItem: (key, value) => localStorage.setItem(key, value),
  removeItem: key => localStorage.removeItem(key)
}, {
  shipHulls,
  equipment,
  commodities,
  galaxy
});
let combatStatus = null;
let pendingRewardItem = null;
let saveWarningShown = false;
function refreshDerivedStats() {
  const stats = getShipStats(player.ship);
  player.cargoMax = stats.cargoMax;
  jumpRange = stats.jumpRange;
  player.ship.currentHull ??= stats.maxHull;
}
function applyPlayerAction(action) {
  let next;
  try {
    next = action();
  } catch (error) {
    alert(error.message);
    return false;
  }
  player = next;
  refreshDerivedStats();
  saveGame();
  return true;
}
function resetSession() {
  currentPoi = null;
  currentEnemy = null;
  combatStatus = null;
  combatWinEncounter = null;
  currentEncounterName = currentEncounterDisplayName = currentEncounterImage = null;
  currentDialogueNode = baselineEncounterDisplayName = baselineEncounterImage = null;
  localView = 'menu';
  localEncounterMemory = {};
  pendingEquip = pendingRewardItem = null;
  playerAdvantage = enemyAdvantage = 0;
  window.currentTaxiOffers = window.currentBountyOffers = null;
}
function restoreSession(runtime) {
  // V4 saves resume at their saved location. V5 also restores dialogue and combat.
  if (!runtime) return;
  localView = runtime.localView || 'menu';
  window.currentTaxiOffers = runtime.taxiOffers;
  window.currentBountyOffers = runtime.bountyOffers;
  if (runtime.encounter) {
    const e = runtime.encounter;
    interactions[e.name] = e.data;
    currentEncounterName = e.name;
    currentEncounterDisplayName = e.displayName;
    currentEncounterImage = e.image;
    baselineEncounterDisplayName = e.baselineName;
    baselineEncounterImage = e.baselineImage;
    currentDialogueNode = e.node;
    localView = 'encounter';
  } else if (localView === 'encounter') localView = 'menu';
  if (runtime.combat) {
    const b = runtime.combat;
    currentEnemy = b.enemyIndex >= 0 ? spawnedNPCs[b.enemyIndex] : b.enemy;
    if (!currentEnemy) throw Error('Missing combat opponent.');
    combatStatus = b.status;
    combatWinEncounter = b.winEncounter;
    playerAdvantage = b.playerAdvantage;
    enemyAdvantage = b.enemyAdvantage;
  }
}
function prepareDialogueOffers() {
  const node = interactions[currentEncounterName]?.dialogue[currentDialogueNode];
  if (!node) return;
  if (node.generateBountyJobs && !player.activeBounty && !window.currentBountyOffers) {
    window.currentBountyOffers = Array.from({
      length: node.bountyJobCount || 3
    }, () => generateBountyJob(node.bountyMaxDistance || 100, node.bountyShips, node.bountyStats || {}));
  }
  if (node.generateTaxiJobs && !player.activeTaxi && !window.currentTaxiOffers) {
    window.currentTaxiOffers = Array.from({
      length: node.taxiJobCount || 3
    }, () => generateTaxiJob(node.taxiMaxDistance || 150));
  }
}
function continueCombat() {
  if (!currentEnemy || combatStatus === 'active') return;
  if (combatStatus === 'lost') {
    saveStore.clear();
    location.reload();
  } else if (combatStatus === 'won' && combatWinEncounter) {
    const nextEncounter = combatWinEncounter;
    currentEnemy = null;
    combatStatus = combatWinEncounter = null;
    startEncounter(nextEncounter);
    switchTab('local', true);
  } else {
    endCombatAndResume();
  }
}
const drawScale = 4;
let camera = {
  x: 0,
  y: 0,
  zoom: 1
};
let isDragging = false;
let lastMouse = {
  x: 0,
  y: 0
};
let dragThreshold = false;
let initialPinchDistance = null;
let player = {};
let currentSystem = null;
let currentPoi = null;
let jumpRange = 0;
let activeTab = 'map';
let localView = 'menu';
let currentEncounterName = null;
let currentEncounterDisplayName = null;
let currentEncounterImage = null;
let baselineEncounterDisplayName = null;
let baselineEncounterImage = null;
let currentDialogueNode = null;
let currentMarketPrices = {};
let spawnedNPCs = [];
let localEncounterMemory = {};
let currentEnemy = null;
let combatWinEncounter = null;
let pendingEquip = null;
let playerAdvantage = 0;
let enemyAdvantage = 0;
const canvas = document.getElementById('star-map');
const ctx = canvas.getContext('2d');
function randomizeMarket() {
  for (let item in commodities) {
    const comm = commodities[item];
    const volatility = 0.85 + Math.random() * 0.30;
    let volatilePrice = Math.floor(comm.basePrice * volatility);
    if (comm.min !== undefined && volatilePrice < comm.min) volatilePrice = comm.min;
    if (comm.max !== undefined && volatilePrice > comm.max) volatilePrice = comm.max;
    currentMarketPrices[item] = volatilePrice;
  }
}
function generateNPCs() {
  spawnedNPCs = [];
  if (currentSystem.npcSpawns) {
    currentSystem.npcSpawns.forEach(spawn => {
      if (Math.random() < spawn.chance) {
        let finalName = spawn.name;
        let finalImage = null;
        if (finalName.toLowerCase() === 'random') {
          const randomChar = generateRandomCharacter();
          finalName = randomChar.name;
          finalImage = randomChar.image;
        }
        if (!finalImage && spawn.encounter) {
          const encData = interactions[spawn.encounter] || {};
          let baseImg = encData.image || 'default.png';
          if (Array.isArray(baseImg)) {
            finalImage = baseImg[Math.floor(Math.random() * baseImg.length)];
          } else if (baseImg === 'random') {
            finalImage = generateRandomCharacter().image;
          } else {
            finalImage = baseImg;
          }
        }
        const defaultStats = {
          hull: 20,
          armour: 10,
          handling: 20,
          firepower: 10,
          accuracy: 0,
          piloting: 20,
          weapon: 20
        };
        let finalStats = spawn.stats ? JSON.parse(JSON.stringify(spawn.stats)) : defaultStats;
        let shipXp = Math.floor((finalStats.hull + finalStats.firepower + finalStats.piloting) / 2);
        spawnedNPCs.push({
          name: finalName,
          shipType: spawn.shipType,
          shipImage: spawn.shipImage,
          encounter: spawn.encounter,
          isHostile: spawn.isHostile,
          image: finalImage,
          stats: finalStats,
          xpValue: shipXp
        });
      }
    });
  }
  if (player.activeBounty && currentSystem.id === player.activeBounty.targetSysId) {
    const b = player.activeBounty;
    const hullData = shipHulls[b.shipHull] || {};
    spawnedNPCs.push({
      name: b.targetName,
      shipType: b.shipHull,
      shipImage: hullData.image || "default.png",
      encounter: "SYSTEM_BOUNTY_TARGET",
      isHostile: false,
      image: b.targetImage,
      stats: b.stats,
      xpValue: b.xpReward,
      isBountyTarget: true
    });
    ensureBountyEncounter();
  }
}
function checkExistingSave() {
  try {
    document.getElementById('btn-load-game').disabled = !saveStore.hasSave();
    document.getElementById('btn-recover-save').classList.toggle('hidden', !saveStore.hasBackup());
  } catch (error) {
    console.error('Save storage is unavailable.', error);
  }
}
function generateRandomCharacter() {
  if (typeof firstNames === 'undefined' || typeof lastNames === 'undefined') {
    return {
      name: "Unknown Client",
      image: "default.png"
    };
  }
  const first = firstNames[Math.floor(Math.random() * firstNames.length)];
  const last = lastNames[Math.floor(Math.random() * lastNames.length)];
  const maxImages = typeof TOTAL_ALIEN_PORTRAITS !== 'undefined' ? TOTAL_ALIEN_PORTRAITS : 0;
  let generatedImage = "default.png";
  if (maxImages > 0) {
    const randomNum = Math.floor(Math.random() * maxImages) + 1;
    const paddedNum = String(randomNum).padStart(3, '0');
    generatedImage = `random_alien_${paddedNum}.png`;
  }
  return {
    name: `${first} ${last}`,
    image: generatedImage
  };
}
function getShipStats(shipData) {
  return rules.getShipStats(shipData, player.skills);
}
function generateBountyJob(maxDist, shipsStr, baseStats) {
  let targetSys;
  let distToTarget = 0;
  let attempts = 0;
  do {
    targetSys = galaxy[Math.floor(Math.random() * galaxy.length)];
    distToTarget = Math.sqrt((currentSystem.x - targetSys.x) ** 2 + (currentSystem.y - targetSys.y) ** 2);
    attempts++;
  } while ((distToTarget > maxDist || targetSys.id === currentSystem.id) && attempts < 100);
  if (!targetSys) targetSys = galaxy[0];
  const ships = shipsStr ? shipsStr.split(',').map(s => s.trim()) : Object.keys(shipHulls);
  const shipHull = ships[Math.floor(Math.random() * ships.length)] || "Weescow";
  const pilot = generateRandomCharacter();
  const randomizeStat = val => Math.max(1, Math.floor(val * (0.8 + Math.random() * 0.4)));
  const finalStats = {
    hull: randomizeStat(baseStats.hull || 15),
    armour: randomizeStat(baseStats.armour || 15),
    handling: randomizeStat(baseStats.handling || 25),
    firepower: randomizeStat(baseStats.firepower || 15),
    accuracy: randomizeStat(baseStats.accuracy || 10),
    piloting: randomizeStat(baseStats.piloting || 25),
    weapon: randomizeStat(baseStats.weapon || 25)
  };
  const statSum = Object.values(finalStats).reduce((a, b) => a + b, 0);
  const baseReward = Math.round(statSum * 1 + distToTarget * 0.25);
  const charmBonus = player.skills && player.skills.charm !== undefined ? player.skills.charm : 10;
  const reward = Math.round(baseReward * (1 + charmBonus / 100));
  const crimeList = typeof bountyCrimes !== 'undefined' ? bountyCrimes : ["Piracy", "Smuggling"];
  const crime = crimeList[Math.floor(Math.random() * crimeList.length)];
  return {
    targetSysId: targetSys.id,
    crime: crime,
    targetSysName: targetSys.name,
    targetName: pilot.name,
    targetImage: pilot.image,
    shipHull: shipHull,
    stats: finalStats,
    reward: reward,
    xpReward: Math.round(statSum / 3)
  };
}
function acceptBountyJob(index) {
  const job = window.currentBountyOffers[index];
  player.activeBounty = job;
  player.tasks['bounty_mission'] = 'active';
  quests['bounty_mission'] = {
    title: `Bounty: ${job.targetName}`,
    description: `Hunt down and eliminate ${job.targetName} in the ${job.targetSysName} system. Reward: ${job.reward.toLocaleString()} CR`,
    targetSystemId: job.targetSysId
  };
  showTaskPopup("NEW TARGET ACQUIRED", quests['bounty_mission']);
  window.currentBountyOffers = null;
  selectDialogue('leave');
}
function generateTaxiJob(maxDist) {
  let pickupSys, pickupPoi, dropoffSys, dropoffPoi;
  let distToPickup = 0,
    distToDropoff = 0,
    totalTripDist = 0;
  let attempts = 0;
  do {
    pickupSys = galaxy[Math.floor(Math.random() * galaxy.length)];
    const validPois = pickupSys.pois.filter(p => p.type !== 'Outpost' && p.type !== 'Encounter');
    if (validPois.length > 0) {
      pickupPoi = validPois[Math.floor(Math.random() * validPois.length)];
    } else {
      pickupPoi = null;
    }
    distToPickup = Math.sqrt((currentSystem.x - pickupSys.x) ** 2 + (currentSystem.y - pickupSys.y) ** 2);
    attempts++;
  } while ((!pickupPoi || distToPickup > maxDist) && attempts < 100);
  attempts = 0;
  do {
    dropoffSys = galaxy[Math.floor(Math.random() * galaxy.length)];
    const validPois = dropoffSys.pois.filter(p => p.type !== 'Outpost' && p.type !== 'Encounter');
    if (validPois.length > 0) {
      dropoffPoi = validPois[Math.floor(Math.random() * validPois.length)];
    } else {
      dropoffPoi = null;
    }
    distToDropoff = Math.sqrt((currentSystem.x - dropoffSys.x) ** 2 + (currentSystem.y - dropoffSys.y) ** 2);
    totalTripDist = Math.sqrt((pickupSys.x - dropoffSys.x) ** 2 + (pickupSys.y - dropoffSys.y) ** 2);
    attempts++;
  } while ((!dropoffPoi || dropoffSys.id === pickupSys.id && dropoffPoi.name === pickupPoi.name || distToDropoff > maxDist) && attempts < 100);
  if (!pickupPoi) {
    pickupSys = currentSystem;
    pickupPoi = currentSystem.pois.find(p => p.type !== 'Outpost' && p.type !== 'Encounter') || galaxy[0].pois[0];
  }
  if (!dropoffPoi) {
    dropoffSys = currentSystem;
    dropoffPoi = currentSystem.pois.find(p => p.type !== 'Outpost' && p.type !== 'Encounter') || galaxy[0].pois[0];
  }
  const totalDistance = distToPickup + totalTripDist;
  const baseReward = Math.round(10 + totalDistance * 0.5);
  const charmBonus = player.skills && player.skills.charm !== undefined ? player.skills.charm : 10;
  const reward = Math.round(baseReward * (1 + charmBonus / 100));
  const xpReward = Math.round(5 + totalDistance * 0.25);
  const client = generateRandomCharacter();
  const pickLines = typeof taxiPickupLines !== 'undefined' ? taxiPickupLines : ["Let's go!"];
  const dropLines = typeof taxiDropoffLines !== 'undefined' ? taxiDropoffLines : ["Thanks for the ride!"];
  return {
    status: 'pickup',
    pickupSysId: pickupSys.id,
    pickupSysName: pickupSys.name,
    pickupPoiName: pickupPoi.name,
    dropoffSysId: dropoffSys.id,
    dropoffSysName: dropoffSys.name,
    dropoffPoiName: dropoffPoi.name,
    client: client,
    reward: reward,
    xpReward: xpReward,
    pickupText: pickLines[Math.floor(Math.random() * pickLines.length)],
    dropoffText: dropLines[Math.floor(Math.random() * dropLines.length)]
  };
}
function acceptTaxiJob(index) {
  const job = window.currentTaxiOffers[index];
  player.activeTaxi = job;
  player.tasks['taxi_mission'] = 'active';
  quests['taxi_mission'] = {
    title: `Taxi: Pick up ${job.client.name}`,
    description: `Pick up ${job.client.name} from ${job.pickupPoiName} in the ${job.pickupSysName} system.`,
    targetSystemId: job.pickupSysId,
    targetPoiName: job.pickupPoiName
  };
  window.currentTaxiOffers = null;
  selectDialogue('leave');
}
function startTaxiPickup() {
  if (!isTaxiLocation('pickup')) return;
  currentEncounterName = player.activeTaxi.client.name;
  currentEncounterDisplayName = player.activeTaxi.client.name;
  currentEncounterImage = player.activeTaxi.client.image;
  baselineEncounterDisplayName = currentEncounterDisplayName;
  baselineEncounterImage = currentEncounterImage;
  interactions[currentEncounterName] = {
    image: player.activeTaxi.client.image,
    dialogue: {
      "start": {
        text: `"${player.activeTaxi.pickupText}"<br><br><span class="text-blue-600 font-bold">${player.activeTaxi.client.name} boards your ship.</span>`,
        options: [{
          text: "Strap in. [Leave]",
          nextNode: "leave"
        }]
      }
    }
  };
  completeTaxiPickup();
  currentDialogueNode = 'start';
  localView = 'encounter';
  saveGame();
  setLocalView('encounter');
  showTaskPopup('NEW TASK ALERTS', quests.taxi_mission);
}
function completeTaxiPickup() {
  if (!player.activeTaxi || player.activeTaxi.status !== 'pickup') return;
  player.activeTaxi.status = 'dropoff';
  quests['taxi_mission'].title = `Taxi: Deliver ${player.activeTaxi.client.name}`;
  quests['taxi_mission'].description = `Deliver ${player.activeTaxi.client.name} to ${player.activeTaxi.dropoffPoiName} in the ${player.activeTaxi.dropoffSysName} system.`;
  quests['taxi_mission'].targetSystemId = player.activeTaxi.dropoffSysId;
  quests['taxi_mission'].targetPoiName = player.activeTaxi.dropoffPoiName;
}
function startTaxiDropoff() {
  if (!isTaxiLocation('dropoff')) return;
  const fareXp = player.activeTaxi.xpReward;
  currentEncounterName = player.activeTaxi.client.name;
  currentEncounterDisplayName = player.activeTaxi.client.name;
  currentEncounterImage = player.activeTaxi.client.image;
  baselineEncounterDisplayName = currentEncounterDisplayName;
  baselineEncounterImage = currentEncounterImage;
  interactions[currentEncounterName] = {
    image: player.activeTaxi.client.image,
    dialogue: {
      "start": {
        text: `"${player.activeTaxi.dropoffText}"<br><br><span class="text-green-600 font-bold">They transfer ${player.activeTaxi.reward.toLocaleString()} credits to your account.</span>`,
        options: [{
          text: "Safe travels. [Leave]",
          nextNode: "leave"
        }]
      }
    }
  };
  completeTaxiDropoff();
  currentDialogueNode = 'start';
  localView = 'encounter';
  saveGame();
  setLocalView('encounter');
  showXpPopup(fareXp, 'Fare Complete');
  showTaskPopup('TASK COMPLETE', quests.taxi_mission);
}
function completeTaxiDropoff() {
  if (!player.activeTaxi || player.activeTaxi.status !== 'dropoff') return;
  player.credits += player.activeTaxi.reward;
  player.xp += player.activeTaxi.xpReward;
  player.tasks['taxi_mission'] = 'completed';
  player.activeTaxi = null;
}
function closeNewGameModal() {
  const modal = document.getElementById('new-game-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}
function startNewGame(force = false) {
  if (typeof galaxy === 'undefined' || typeof newGameDefaults === 'undefined') {
    return alert("data.js missing or incomplete!");
  }
  if (!force && saveStore.hasSave()) {
    document.getElementById('new-game-modal').classList.remove('hidden');
    document.getElementById('new-game-modal').classList.add('flex');
    return;
  }
  closeNewGameModal();
  resetSession();
  const startingShipClone = JSON.parse(JSON.stringify(newGameDefaults.startingShip));
  player = {
    credits: newGameDefaults.startingCredits,
    xp: 0,
    cargo: {},
    flags: {},
    tasks: {},
    storage: [],
    skills: JSON.parse(JSON.stringify(newGameDefaults.startingSkills)),
    ship: startingShipClone
  };
  if (newGameDefaults.startingTasks) {
    newGameDefaults.startingTasks.forEach(taskId => {
      player.tasks[taskId] = 'active';
    });
  }
  const initialStats = getShipStats(player.ship);
  player.ship.currentHull = initialStats.maxHull;
  currentSystem = galaxy.find(s => s.id === newGameDefaults.startingSystemId) || galaxy[0];
  randomizeMarket();
  generateNPCs();
  refreshDerivedStats();
  saveGame();
  document.getElementById('start-screen').style.display = 'none';
  switchTab('map', true);
  setTimeout(() => {
    centerOnSystem(currentSystem);
  }, 50);
}
function saveGame() {
  try {
    saveStore.write({
      player,
      systemId: currentSystem.id,
      poiName: currentPoi?.name,
      currentMarketPrices,
      spawnedNPCs,
      localEncounterMemory,
      runtime: {
        localView,
        encounter: currentEncounterName ? {
          name: currentEncounterName,
          displayName: currentEncounterDisplayName,
          image: currentEncounterImage,
          baselineName: baselineEncounterDisplayName,
          baselineImage: baselineEncounterImage,
          node: currentDialogueNode,
          data: interactions[currentEncounterName]
        } : null,
        combat: currentEnemy ? {
          enemy: currentEnemy,
          enemyIndex: spawnedNPCs.indexOf(currentEnemy),
          status: combatStatus,
          winEncounter: combatWinEncounter,
          playerAdvantage,
          enemyAdvantage
        } : null,
        bountyOffers: window.currentBountyOffers || null,
        taxiOffers: window.currentTaxiOffers || null
      }
    });
    saveWarningShown = false;
    return true;
  } catch (error) {
    console.error('Could not save progress.', error);
    if (!saveWarningShown) alert('Progress could not be saved. Keep this tab open and try again. Your previous save has been preserved.');
    saveWarningShown = true;
    return false;
  }
}
function loadGame(useBackup = false) {
  let data;
  try {
    data = saveStore.read(useBackup);
  } catch (error) {
    console.error('Could not read saved game.', error);
    alert('This save could not be loaded. It has been preserved. You can try Recover Previous Save if a backup is available.');
    checkExistingSave();
    return;
  }
  // Loading and rendering are deliberately separate. Neither failure deletes a save.
  try {
    resetSession();
    player = data.player;
    if (player.activeBounty) {
      quests['bounty_mission'] = {
        title: `Bounty: ${player.activeBounty.targetName}`,
        description: `Hunt down and eliminate ${player.activeBounty.targetName} in the ${player.activeBounty.targetSysName} system. Reward: ${player.activeBounty.reward.toLocaleString()} CR`,
        targetSystemId: player.activeBounty.targetSysId
      };
    }
    if (player.activeTaxi) {
      if (!player.activeTaxi.client || !player.activeTaxi.client.name || !player.activeTaxi.status) {
        player.activeTaxi = null;
        delete player.tasks['taxi_mission'];
      } else if (player.activeTaxi.status === 'pickup') {
        quests['taxi_mission'] = {
          title: `Taxi: Pick up ${player.activeTaxi.client.name}`,
          description: `Pick up ${player.activeTaxi.client.name} from ${player.activeTaxi.pickupPoiName} in the ${player.activeTaxi.pickupSysName} system.`,
          targetSystemId: player.activeTaxi.pickupSysId,
          targetPoiName: player.activeTaxi.pickupPoiName
        };
      } else {
        quests['taxi_mission'] = {
          title: `Taxi: Deliver ${player.activeTaxi.client.name}`,
          description: `Deliver ${player.activeTaxi.client.name} to ${player.activeTaxi.dropoffPoiName} in the ${player.activeTaxi.dropoffSysName} system.`,
          targetSystemId: player.activeTaxi.dropoffSysId,
          targetPoiName: player.activeTaxi.dropoffPoiName
        };
      }
    }
    currentSystem = galaxy.find(s => s.id === data.systemId);
    currentPoi = currentSystem.pois.find(p => p.name === data.poiName) || null;
    currentMarketPrices = data.currentMarketPrices;
    spawnedNPCs = data.spawnedNPCs;
    localEncounterMemory = data.localEncounterMemory;
    if (!Object.keys(currentMarketPrices).length) randomizeMarket();
    refreshDerivedStats();
    ensureBountyEncounter();
    restoreSession(data.runtime);
    document.getElementById('start-screen').style.display = 'none';
    if (currentEnemy) {
      renderCombatScene();
      switchTab('battle', true);
    } else {
      switchTab(currentEncounterName ? 'local' : 'map', true);
    }
    setTimeout(() => centerOnSystem(currentSystem), 100);
  } catch (error) {
    console.error('Could not display saved game.', error);
    document.getElementById('start-screen').style.display = 'flex';
    alert('Your saved game could not be displayed. The save has been preserved.');
    checkExistingSave();
  }
}
let toastTimeout;
let xpToastTimeout;
const imageCache = {};
function getStationMarket(type) {
  const config = stationTypes[type];
  const market = {
    selling: [],
    buying: []
  };
  if (!config) return market;
  const resolvedPrices = {};
  if (config.produces) {
    config.produces.forEach(itemName => {
      const base = currentMarketPrices[itemName] || commodities[itemName].basePrice;
      let discountMultiplier = type === "Trade Hub" ? 1.0 : 0.8;
      resolvedPrices[itemName] = Math.floor(base * discountMultiplier);
      market.selling.push({
        item: itemName,
        price: resolvedPrices[itemName]
      });
    });
  }
  if (config.consumes) {
    Object.keys(config.consumes).forEach(itemName => {
      if (resolvedPrices[itemName]) {
        market.buying.push({
          item: itemName,
          price: resolvedPrices[itemName]
        });
      } else {
        const base = currentMarketPrices[itemName] || commodities[itemName].basePrice;
        const demand = config.consumes[itemName];
        let multiplier = 1.0;
        if (demand === "High") multiplier = 1.15;else if (demand === "Average") multiplier = 1.1;else if (demand === "Low") multiplier = 1.05;
        let finalPrice = Math.ceil(base * multiplier);
        const absoluteMax = commodities[itemName].max || commodities[itemName].basePrice * 1.5;
        if (finalPrice > absoluteMax) {
          finalPrice = absoluteMax;
        }
        market.buying.push({
          item: itemName,
          price: finalPrice
        });
      }
    });
  }
  return market;
}
function buyGood(itemName) {
  const offer = getStationMarket(currentPoi?.type).selling.find(item => item.item === itemName);
  if (offer && applyPlayerAction(() => rules.trade(player, itemName, offer.price, true))) updateUI();
}
function sellGood(itemName) {
  const offer = getStationMarket(currentPoi?.type).buying.find(item => item.item === itemName);
  if (offer && applyPlayerAction(() => rules.trade(player, itemName, offer.price, false))) updateUI();
}
function repairShip() {
  if (currentPoi?.type !== 'Repair Station') return;
  if (applyPlayerAction(() => rules.repair(player, currentPoi.repairCost ?? 10))) updateUI();
}
function startEncounter(name, displayName = null, displayImage = null) {
  if (!interactions[name]) {
    interactions[name] = {
      image: "default.png",
      dialogue: {
        "start": {
          text: `<i>[SYSTEM ERROR: Encounter node "${name}" not found. Please create it in the Encounter Editor tab.]</i>`,
          options: [{
            text: "Acknowledge [LEAVE]",
            nextNode: "leave"
          }]
        }
      }
    };
  }
  currentEncounterName = name;
  currentEncounterDisplayName = displayName || name;
  if (displayImage) {
    currentEncounterImage = displayImage;
  } else if (localEncounterMemory[name]) {
    currentEncounterImage = localEncounterMemory[name];
  } else {
    const encData = interactions[name] || {};
    let encImageFile = encData.image || 'default.png';
    if (Array.isArray(encImageFile)) {
      encImageFile = encImageFile[Math.floor(Math.random() * encImageFile.length)];
    } else if (encImageFile === 'random') {
      encImageFile = generateRandomCharacter().image;
    }
    currentEncounterImage = encImageFile;
  }
  if (currentEncounterDisplayName.toLowerCase() === 'random') {
    currentEncounterDisplayName = generateRandomCharacter().name;
  }
  baselineEncounterDisplayName = currentEncounterDisplayName;
  baselineEncounterImage = currentEncounterImage;

  // Check for overrides on the starting node
  const startNode = interactions[currentEncounterName].dialogue['start'];
  if (startNode) {
    if (startNode.nodeName) currentEncounterDisplayName = startNode.nodeName;
    if (startNode.nodeImage) currentEncounterImage = startNode.nodeImage;
  }
  currentDialogueNode = 'start';
  localView = 'encounter';
  prepareDialogueOffers();
  saveGame();
  setLocalView('encounter');
}
function selectDialogue(nextNode, creditChange = 0, xpChange = 0, setFlag = '', clearFlag = '', startTask = '', completeTask = '', initiateCombat = false, rewardItem = '', winEncounter = '', customEnemyStr = '') {
  let result;
  try {
    result = rules.dialogue(player, {
      creditChange,
      xpChange,
      setFlag,
      clearFlag,
      startTask,
      completeTask,
      rewardItem
    });
  } catch (error) {
    alert(error.message);
    return;
  }
  player = result.player;
  refreshDerivedStats();
  if (initiateCombat) {
    const customEnemy = customEnemyStr ? JSON.parse(decodeURIComponent(customEnemyStr)) : null;
    startCombat(winEncounter, customEnemy);
    return;
  }
  if (nextNode === 'leave') {
    window.currentTaxiOffers = null;
    window.currentBountyOffers = null;
    currentEncounterName = null;
    currentEncounterDisplayName = null;
    currentEncounterImage = null;
    currentDialogueNode = null;
    const nextHostileIndex = spawnedNPCs.findIndex(npc => npc.isHostile);
    if (nextHostileIndex !== -1) {
      const nextHostile = spawnedNPCs[nextHostileIndex];
      nextHostile.isHostile = false;
      startEncounter(nextHostile.encounter, nextHostile.name, nextHostile.image);
    } else if (currentPoi && currentPoi.type === 'Encounter') {
      triggerLocalTravel(-1);
    } else {
      localView = 'menu';
      saveGame();
      setLocalView('menu');
      if (currentPoi === null) {
        switchTab('map', true);
      }
    }
  } else {
    currentDialogueNode = nextNode;

    // Apply node overrides or restore to baseline
    const nextNodeData = interactions[currentEncounterName].dialogue[nextNode];
    if (nextNodeData) {
      currentEncounterDisplayName = nextNodeData.nodeName || baselineEncounterDisplayName;
      currentEncounterImage = nextNodeData.nodeImage || baselineEncounterImage;
    }
    prepareDialogueOffers();
    saveGame();
    updateUI();
  }
  saveGame();
  if (result.completed) showTaskPopup('TASK COMPLETE', quests[completeTask]);
  if (result.questXp || xpChange > 0) showXpPopup(result.questXp + Math.max(0, xpChange), result.completed ? 'Quest Complete' : 'Dialogue');
  if (startTask && !result.completed) showTaskPopup('NEW TASK ALERTS', quests[startTask]);
  if (result.rewarded) showRewardModal(rewardItem);
}
function endCombatAndResume() {
  const wasPoiEncounter = currentPoi && currentPoi.type === 'Encounter' && currentEncounterName === currentPoi.name;
  currentEnemy = null;
  combatStatus = null;
  combatWinEncounter = null;
  currentEncounterName = null;
  currentEncounterDisplayName = null;
  currentEncounterImage = null;
  baselineEncounterDisplayName = null;
  baselineEncounterImage = null;
  currentDialogueNode = null;
  localView = 'menu';
  saveGame();
  if (wasPoiEncounter) {
    triggerLocalTravel(-1);
    return;
  }
  const nextHostileIndex = spawnedNPCs.findIndex(npc => npc.isHostile);
  if (nextHostileIndex !== -1) {
    const nextHostile = spawnedNPCs[nextHostileIndex];
    nextHostile.isHostile = false;
    startEncounter(nextHostile.encounter, nextHostile.name, nextHostile.image);
    switchTab('local', true);
  } else if (currentPoi && currentPoi.type === 'Encounter') {
    startEncounter(currentPoi.name);
    switchTab('local', true);
  } else {
    setLocalView('menu');
    if (currentPoi === null) {
      switchTab('map', true);
    } else {
      switchTab('local', true);
    }
  }
}
function startCombat(winEncounter = '', customEnemy = null) {
  combatWinEncounter = winEncounter;
  if (customEnemy) {
    currentEnemy = {
      name: customEnemy.name || "Unknown Enemy",
      shipType: customEnemy.shipHull || "Unknown Class",
      shipImage: customEnemy.image || "default.png",
      isHostile: true,
      stats: customEnemy.stats || {
        hull: 50,
        armour: 20,
        handling: 10,
        firepower: 20,
        accuracy: 15,
        piloting: 15,
        weapon: 20
      },
      xpValue: 150
    };
  } else {
    let enemyIndex = spawnedNPCs.findIndex(npc => npc.name === currentEncounterDisplayName);
    if (enemyIndex === -1) {
      const fallbackEnemy = {
        name: currentEncounterDisplayName,
        shipType: "Station / Unknown",
        shipImage: currentEncounterImage || "default.png",
        isHostile: true,
        stats: {
          hull: 50,
          armour: 20,
          handling: 10,
          firepower: 20,
          accuracy: 15,
          piloting: 15,
          weapon: 20
        },
        xpValue: 100
      };
      spawnedNPCs.push(fallbackEnemy);
      enemyIndex = spawnedNPCs.length - 1;
    }
    currentEnemy = spawnedNPCs[enemyIndex];
  }
  currentEnemy.currentHull = currentEnemy.stats.hull;
  playerAdvantage = 0;
  enemyAdvantage = 0;
  combatStatus = 'active';
  saveGame();
  renderCombatScene();
  switchTab('battle', true);
}
function doCombatRound(playerAction) {
  if (!currentEnemy || combatStatus !== 'active') return;
  const round = rules.combatRound(player, currentEnemy, playerAction, playerAdvantage, enemyAdvantage);
  const enemy = currentEnemy;
  if (round.winner === 'player') {
    enemyAdvantage = 0;
    if (playerAction !== 'attack' && !round.escaped) playerAdvantage = Math.min(3, playerAdvantage + 1);
  } else {
    playerAdvantage = 0;
    if (round.enemyAction === 'manoeuvre') enemyAdvantage = Math.min(3, enemyAdvantage + 1);
  }
  player.ship.currentHull -= round.damageToPlayer;
  enemy.currentHull -= round.damageToEnemy;
  let bountyReward = null;
  if (round.escaped) {
    combatStatus = 'escaped';
    if (enemy.isBountyTarget && player.activeBounty) {
      player.tasks.bounty_mission = 'failed';
      player.activeBounty = null;
    }
    if (currentPoi?.type === 'Encounter' && currentEncounterName !== currentPoi.name) currentPoi = null;
  } else if (enemy.currentHull <= 0) {
    combatStatus = 'won';
    player.xp += enemy.xpValue || 0;
    if (enemy.isBountyTarget && player.activeBounty) {
      bountyReward = player.activeBounty;
      player.credits += bountyReward.reward;
      player.tasks.bounty_mission = 'completed';
      player.activeBounty = null;
    }
    spawnedNPCs = spawnedNPCs.filter(npc => npc !== enemy);
  } else if (player.ship.currentHull <= 0) {
    combatStatus = 'lost';
  }
  // Commit the full result, including the terminal state, before drawing anything.
  saveGame();
  renderCombatRound(playerAction, round);
  renderCombatControls();
  updateBattleUI();
  if (combatStatus === 'won') showXpPopup(enemy.xpValue || 0, 'Enemy Destroyed');
  if (bountyReward) showTaskPopup('BOUNTY CLAIMED', {
    title: bountyReward.targetName,
    description: `Collected ${bountyReward.reward.toLocaleString()} CR`
  });
  if (round.escaped && enemy.isBountyTarget) showTaskPopup('BOUNTY FAILED', {
    title: 'Target Escaped',
    description: 'You fled the engagement.'
  });
}
function getEquipmentCategory(itemName) {
  return rules.itemCategory(itemName);
}
function startEquipProcess(category, itemName, price, fromStorage, storageIndex = -1) {
  pendingEquip = {
    category,
    itemName,
    price,
    fromStorage,
    storageIndex,
    slotIndex: -1,
    oldItem: null
  };
  if (category === 'module') {
    const hullData = shipHulls[player.ship.hull];
    const maxModules = hullData.modularSlots;
    let emptySlotIndex = -1;
    for (let i = 0; i < maxModules; i++) {
      if (!player.ship.modules[i]) {
        emptySlotIndex = i;
        break;
      }
    }
    if (emptySlotIndex !== -1) {
      pendingEquip.slotIndex = emptySlotIndex;
      executeEquipmentChange();
    } else {
      showModuleSwapModal();
    }
  } else {
    const oldItem = player.ship.core[category];
    if (oldItem) {
      pendingEquip.oldItem = oldItem;
      showTradeInModal();
    } else {
      executeEquipmentChange();
    }
  }
}
function closeModuleSwap() {
  document.getElementById('module-swap-modal').classList.add('hidden');
  document.getElementById('module-swap-modal').classList.remove('flex');
  pendingEquip = null;
}
function selectModuleToReplace(index, oldModName) {
  document.getElementById('module-swap-modal').classList.add('hidden');
  document.getElementById('module-swap-modal').classList.remove('flex');
  pendingEquip.slotIndex = index;
  pendingEquip.oldItem = oldModName;
  showTradeInModal();
}
function closeTradeIn() {
  document.getElementById('trade-in-modal').classList.add('hidden');
  document.getElementById('trade-in-modal').classList.remove('flex');
  pendingEquip = null;
}
function finalizeEquipmentChange(action) {
  if (executeEquipmentChange(action)) closeTradeIn();
}
function executeEquipmentChange(action = 'store') {
  if (!pendingEquip) return false;
  if (!applyPlayerAction(() => rules.previewEquipment(player, pendingEquip, action).player)) return false;
  pendingEquip = null;
  updateUI();
  return true;
}
function closeRewardModal() {
  document.getElementById('reward-modal').classList.add('hidden');
  document.getElementById('reward-modal').classList.remove('flex');
  pendingRewardItem = null;
}
function claimRewardItem(action) {
  const itemName = pendingRewardItem;
  if (!itemName) return;
  const storageIndex = player.storage.lastIndexOf(itemName);
  if (storageIndex < 0) return;
  closeRewardModal();
  if (action === 'equip') {
    startEquipProcess(getEquipmentCategory(itemName), itemName, 0, true, storageIndex);
  } else {
    updateUI();
    showTaskPopup('ITEM STORED', {
      title: 'STORAGE UPDATED',
      description: 'Your reward is in storage.'
    });
  }
}
function buyShip(shipName) {
  if (!currentPoi || !stationTypes[currentPoi.type]?.hasShipyard) return;
  if (currentPoi.shipInventory?.length && !currentPoi.shipInventory.includes(shipName)) return;
  let result;
  if (!applyPlayerAction(() => {
    result = rules.previewShip(player, shipName);
    if (result.error) throw Error(result.error);
    return result.player;
  })) return;
  updateUI();
  showTaskPopup('NEW SHIP ACQUIRED', {
    title: 'NEW SHIP ACQUIRED!',
    description: result.sameSize ? 'Compatible equipment transferred. Surplus moved to storage.' : 'All equipment moved to storage.'
  });
}
function upgradeSkill(skillName) {
  if (applyPlayerAction(() => rules.upgradeSkill(player, skillName))) updateUI();
}
function triggerLocalTravel(i) {
  const dest = i === -1 ? null : currentSystem.pois[i];
  triggerTravel(dest, dest ? `APPROACHING ${dest.name}` : "DEPARTING STATION", 1000, i === -1);
}
function triggerTravel(dest, msg, dur, isLeavingPOI = false) {
  localEncounterMemory = {};
  let interceptor = null;
  if (!isLeavingPOI) {
    generateNPCs();
    const hostileIndex = spawnedNPCs.findIndex(npc => npc.isHostile);
    if (hostileIndex !== -1) {
      interceptor = spawnedNPCs[hostileIndex];
    }
  }
  const ov = document.getElementById('travel-overlay');
  const bar = document.getElementById('progress-bar');
  const travelText = document.getElementById('travel-text');
  const warnBox = document.getElementById('interdiction-warning');
  const warnImg = document.getElementById('interdiction-image');
  const warnName = document.getElementById('interdiction-name');
  if (interceptor) {
    msg = "INTERDICTION DETECTED!";
    travelText.classList.add('text-red-600');
    let interceptorImage = interceptor.shipImage;
    if (!interceptorImage) {
      const hullData = shipHulls[interceptor.shipType] || {};
      interceptorImage = hullData.image || 'default.png';
    }
    warnImg.src = `assets/${interceptorImage}`;
    warnName.innerHTML = `${interceptor.name}<br><span class="text-base text-black">Class: ${interceptor.shipType}</span>`;
    dur = 2500;
    warnBox.classList.remove('hidden');
    warnBox.classList.add('flex');
  } else {
    travelText.classList.remove('text-red-600');
    warnBox.classList.add('hidden');
    warnBox.classList.remove('flex');
  }
  travelText.innerText = msg;
  ov.style.display = 'flex';
  let start = Date.now();
  let t = setInterval(() => {
    let pc = (Date.now() - start) / dur * 100;
    bar.style.width = pc + "%";
    if (pc >= 100) {
      clearInterval(t);
      ov.style.display = 'none';
      if (interceptor) {
        if (dest && dest.type === 'Encounter') {
          currentPoi = dest;
        } else {
          currentPoi = null;
        }
        if (!interceptor.encounter || interceptor.encounter === 'undefined' || interceptor.encounter === '') {
          currentEncounterDisplayName = interceptor.name;
          startCombat();
        } else {
          interceptor.isHostile = false;
          startEncounter(interceptor.encounter, interceptor.name, interceptor.image);
          switchTab('local', true);
        }
      } else if (dest && dest.type === 'Encounter') {
        currentPoi = dest;
        startEncounter(currentPoi.name);
        switchTab('local', true);
      } else {
        currentPoi = dest;
        setLocalView('menu');
        if (dest !== null) {
          switchTab('local', true);
        } else {
          if (isLeavingPOI) {
            switchTab('local', true);
          } else {
            switchTab('map', true);
          }
        }
      }
      if (activeTab === 'map') renderMap();
      saveGame();
    }
  }, 30);
}
function handleDown(x, y) {
  isDragging = true;
  dragThreshold = false;
  lastMouse = {
    x,
    y
  };
}
function handleMove(x, y) {
  if (!isDragging || activeTab !== 'map') return;
  let dx = x - lastMouse.x,
    dy = y - lastMouse.y;
  if (Math.abs(dx) > 5 || Math.abs(dy) > 5) dragThreshold = true;
  camera.x -= dx;
  camera.y -= dy;
  lastMouse = {
    x,
    y
  };
  renderMap();
}
function handleUp(x, y) {
  if (!isDragging || activeTab !== 'map') return;
  isDragging = false;
  if (!dragThreshold) {
    const r = canvas.getBoundingClientRect();
    const wx = (x - r.left + camera.x) / camera.zoom;
    const wy = (y - r.top + camera.y) / camera.zoom;
    let clickedSystem = null;
    galaxy.forEach(s => {
      const d = Math.sqrt((wx - s.x * drawScale) ** 2 + (wy - s.y * drawScale) ** 2);
      if (d < 20 / camera.zoom) {
        clickedSystem = s;
      }
    });
    if (clickedSystem) {
      if (clickedSystem.id === currentSystem.id) {
        switchTab('local');
      } else {
        if (Math.sqrt((currentSystem.x - clickedSystem.x) ** 2 + (currentSystem.y - clickedSystem.y) ** 2) <= jumpRange) {
          currentSystem = clickedSystem;
          centerOnSystem(clickedSystem);
          randomizeMarket();
          triggerTravel(null, `WARPING TO ${clickedSystem.name}`, 2500, false);
        }
      }
    }
  }
}
canvas.addEventListener('wheel', e => {
  if (activeTab !== 'map') return;
  e.preventDefault();
  const r = canvas.getBoundingClientRect();
  const mx = e.clientX - r.left,
    my = e.clientY - r.top;
  const wx = (mx + camera.x) / camera.zoom,
    wy = (my + camera.y) / camera.zoom;
  camera.zoom *= e.deltaY > 0 ? 0.9 : 1.1;
  camera.zoom = Math.min(Math.max(camera.zoom, 0.2), 3);
  camera.x = wx * camera.zoom - mx;
  camera.y = wy * camera.zoom - my;
  renderMap();
}, {
  passive: false
});
canvas.addEventListener('mousedown', e => handleDown(e.clientX, e.clientY));
window.addEventListener('mousemove', e => handleMove(e.clientX, e.clientY));
window.addEventListener('mouseup', e => handleUp(e.clientX, e.clientY));
canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  if (e.touches.length === 2) initialPinchDistance = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);else handleDown(e.touches[0].clientX, e.touches[0].clientY);
}, {
  passive: false
});
canvas.addEventListener('touchmove', e => {
  if (activeTab !== 'map') return;
  e.preventDefault();
  if (e.touches.length === 2 && initialPinchDistance) {
    const cur = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
    const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2,
      midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
    const wx = (midX + camera.x) / camera.zoom,
      wy = (midY + camera.y) / camera.zoom;
    camera.zoom *= cur / initialPinchDistance;
    camera.zoom = Math.min(Math.max(camera.zoom, 0.2), 3);
    camera.x = wx * camera.zoom - midX;
    camera.y = wy * camera.zoom - midY;
    initialPinchDistance = cur;
    renderMap();
  } else handleMove(e.touches[0].clientX, e.touches[0].clientY);
}, {
  passive: false
});
canvas.addEventListener('touchend', e => {
  e.preventDefault();
  initialPinchDistance = null;
  if (e.changedTouches.length) handleUp(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
}, {
  passive: false
});
window.addEventListener('resize', () => renderMap());

// The DOM passes an option index. Prices, requirements and effects come from content.
function chooseDialogueOption(index) {
  if (currentEnemy) return;
  const option = interactions[currentEncounterName]?.dialogue[currentDialogueNode]?.options[index];
  if (!option || option.requiresFlag && !player.flags[option.requiresFlag] || option.hidesOnFlag && player.flags[option.hidesOnFlag]) return;
  if (option.completePickup) completeTaxiPickup();
  if (option.completeTaxi) completeTaxiDropoff();
  const credits = option.credits > 0 ? Math.round(option.credits * (1 + player.skills.charm / 100)) : option.credits || 0;
  selectDialogue(option.nextNode, credits, option.xp || 0, option.setFlag, option.clearFlag, option.startTask, option.completeTask, !!option.startCombat, option.rewardItem, option.winEncounter, option.customEnemy ? encodeURIComponent(JSON.stringify(option.customEnemy)) : '');
}
function ensureBountyEncounter() {
  if (!player.activeBounty) return;
  const b = player.activeBounty;
  const tLines = typeof bountyTargetLines !== 'undefined' ? bountyTargetLines : ["What do you want, spacer? I'm busy."];
  const pLines = typeof bountyPlayerLines !== 'undefined' ? bountyPlayerLines : ["I'm here to collect the bounty on your head! [ATTACK]"];
  const tLine = tLines[Math.floor(Math.random() * tLines.length)];
  const pLine = pLines[Math.floor(Math.random() * pLines.length)];
  interactions["SYSTEM_BOUNTY_TARGET"] = {
    image: b.targetImage,
    dialogue: {
      "start": {
        text: `"${tLine}"`,
        options: [{
          text: pLine,
          nextNode: "leave",
          startCombat: true
        }, {
          text: "My mistake, carry on. [LEAVE]",
          nextNode: "leave"
        }]
      }
    }
  };
}
function isTaxiLocation(status) {
  const job = player.activeTaxi;
  return job && job.status === status && currentPoi && currentSystem.id === job[status + 'SysId'] && currentPoi.name === job[status + 'PoiName'];
}
