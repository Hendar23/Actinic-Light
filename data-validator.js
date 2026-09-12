// Shared by the editor and tests. Content can be checked before a file is replaced.
const DataValidator = (() => {
  function validate(data) {
    const errors = [],
      warnings = [];
    const {
      galaxy,
      interactions,
      quests,
      shipHulls,
      equipment,
      newGameDefaults
    } = data;
    const itemNames = new Set(Object.values(equipment).flatMap(items => Object.keys(items)));
    const systems = new Map();
    for (const system of galaxy) {
      if (systems.has(system.id)) errors.push(`Duplicate system ID: ${system.id}`);
      systems.set(system.id, system);
    }
    const reachableEncounters = new Set();
    for (const system of galaxy) {
      for (const poi of system.pois || []) {
        for (const name of poi.encounters || []) reachableEncounters.add(name);
        if (poi.type === 'Encounter') reachableEncounters.add(poi.name);
        for (const name of poi.inventory || []) if (!itemNames.has(name)) errors.push(`${poi.name}: unknown equipment ${name}`);
        for (const name of poi.shipInventory || []) if (!shipHulls[name]) errors.push(`${poi.name}: unknown ship ${name}`);
      }
      for (const spawn of system.npcSpawns || []) if (spawn.encounter) reachableEncounters.add(spawn.encounter);
    }
    // Scripted post-combat encounters are part of the reachable content graph.
    const activeTasks = new Set(newGameDefaults.startingTasks || []);
    for (const name of reachableEncounters) {
      const encounter = interactions[name];
      if (!encounter) {
        errors.push(`Unknown encounter: ${name}`);
        continue;
      }
      for (const node of Object.values(encounter.dialogue || {})) for (const option of node.options || []) {
        if (option.winEncounter) reachableEncounters.add(option.winEncounter);
        if (option.startTask) activeTasks.add(option.startTask);
      }
    }
    for (const [name, encounter] of Object.entries(interactions)) {
      if (!encounter.dialogue?.start) errors.push(`${name}: missing start node`);
      for (const [key, node] of Object.entries(encounter.dialogue || {})) {
        if (!Array.isArray(node.options)) {
          errors.push(`${name}/${key}: missing options`);
          continue;
        }
        for (const option of node.options) {
          const label = `${name}/${key}`;
          if (option.nextNode !== 'leave' && !encounter.dialogue[option.nextNode]) errors.push(`${label}: unknown node ${option.nextNode}`);
          if (option.winEncounter && !interactions[option.winEncounter]) errors.push(`${label}: unknown victory encounter ${option.winEncounter}`);
          if (option.rewardItem && !itemNames.has(option.rewardItem)) errors.push(`${label}: unknown reward ${option.rewardItem}`);
          for (const field of ['startTask', 'completeTask']) if (option[field] && !quests[option[field]]) errors.push(`${label}: unknown quest ${option[field]}`);
        }
      }
    }
    for (const [name, quest] of Object.entries(quests)) {
      const system = systems.get(quest.targetSystemId);
      if (!system || quest.targetPoiName && !system.pois.some(p => p.name === quest.targetPoiName)) {
        (activeTasks.has(name) ? errors : warnings).push(`${name}: quest destination does not exist${activeTasks.has(name) ? '' : ' (unused content)'}`);
      }
    }
    if (!systems.has(newGameDefaults.startingSystemId)) errors.push('Starting system does not exist');
    for (const task of newGameDefaults.startingTasks || []) if (!quests[task]) errors.push(`Unknown starting quest: ${task}`);
    const validateLoadout = (ship, label) => {
      if (!ship || !ship.core) {
        errors.push(`${label}: missing loadout`);
        return;
      }
      for (const [category, name] of Object.entries(ship.core)) if (name && !equipment[category]?.[name]) errors.push(`${label}: unknown equipment ${name}`);
      for (const name of ship.modules || []) if (name && !equipment.modules[name]) errors.push(`${label}: unknown module ${name}`);
    };
    if (!shipHulls[newGameDefaults.startingShip.hull]) errors.push('Starting ship does not exist');
    validateLoadout(newGameDefaults.startingShip, 'Starting ship');
    for (const [name, hull] of Object.entries(shipHulls)) validateLoadout(hull.standardLoadout, name);
    return {
      errors,
      warnings
    };
  }
  return {
    validate
  };
})();
if (typeof module !== 'undefined') module.exports = DataValidator;
