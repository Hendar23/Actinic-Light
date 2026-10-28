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
    const number = (value, label, min = 0, required = false, integer = false) => {
      if (value === undefined && !required) return;
      if (!Number.isFinite(value) || value < min || integer && !Number.isInteger(value)) {
        errors.push(`${label}: invalid number`);
      }
    };
    const aliases = (registry, label) => {
      const ids = new Set(Object.keys(registry));
      for (const [id, entry] of Object.entries(registry)) {
        if (entry.legacyIds !== undefined && !Array.isArray(entry.legacyIds)) {
          errors.push(`${label}/${id}: legacyIds must be an array`);
          continue;
        }
        for (const oldId of entry.legacyIds || []) {
          if (typeof oldId !== 'string' || !oldId || ids.has(oldId)) errors.push(`${label}/${id}: ambiguous legacy ID ${oldId}`);
          ids.add(oldId);
        }
      }
    };
    aliases(shipHulls, 'ships');
    aliases(Object.assign({}, ...Object.values(equipment)), 'equipment');
    aliases(data.commodities || {}, 'commodities');
    for (const [name, hull] of Object.entries(shipHulls)) {
      number(hull.baseHull, `${name}/baseHull`, 1, true);
      number(hull.weight, `${name}/weight`);
      number(hull.price, `${name}/price`);
      number(hull.modularSlots, `${name}/modularSlots`, 0, true, true);
      for (const stat of ['jumpRange', 'armour', 'cargo', 'handling', 'firepower', 'accuracy']) {
        number(hull.multipliers?.[stat], `${name}/multipliers/${stat}`, 0, !['firepower', 'accuracy'].includes(stat));
      }
    }
    for (const [category, items] of Object.entries(equipment)) for (const [name, item] of Object.entries(items)) {
      for (const field of ['price', 'weight']) number(item[field], `${name}/${field}`);
      for (const field of category === 'weapons' ? ['firepower', 'accuracy'] : category === 'modules' ? ['flatBonus'] : ['baseValue']) {
        number(item[field], `${name}/${field}`, field === 'flatBonus' ? -Infinity : 0, true);
      }
      if (category === 'modules' && !['jumpRange', 'armour', 'cargo', 'handling', 'firepower', 'accuracy'].includes(item.stat)) errors.push(`${name}: unknown module stat ${item.stat}`);
    }
    for (const [name, commodity] of Object.entries(data.commodities || {})) {
      number(commodity.basePrice, `${name}/basePrice`, 0, true);
      number(commodity.min, `${name}/min`);
      number(commodity.max, `${name}/max`);
      if (commodity.min > commodity.max) errors.push(`${name}: min exceeds max`);
    }
    number(newGameDefaults.startingCredits, 'Starting credits', 0, true);
    for (const skill of ['piloting', 'weapon', 'engineer', 'charm']) number(newGameDefaults.startingSkills?.[skill], `Starting ${skill}`, 0, true);
    const itemNames = new Set(Object.values(equipment).flatMap(items => Object.keys(items)));
    const poiIds = new Set();
    const systems = new Map();
    for (const system of galaxy) {
      number(system.id, `${system.name}/id`, 0, true, true);
      number(system.x, `${system.name}/x`, -Infinity, true);
      number(system.y, `${system.name}/y`, -Infinity, true);
      if (systems.has(system.id)) errors.push(`Duplicate system ID: ${system.id}`);
      systems.set(system.id, system);
    }
    const reachableEncounters = new Set();
    for (const system of galaxy) {
      for (const poi of system.pois || []) {
        if (typeof poi.id !== 'string' || !poi.id || poiIds.has(poi.id)) errors.push(`${poi.name}: missing or duplicate station ID`);
        poiIds.add(poi.id);
        number(poi.repairCost, `${poi.name}/repairCost`);
        for (const name of poi.encounters || []) reachableEncounters.add(name);
        if (poi.type === 'Encounter') reachableEncounters.add(poi.encounter || poi.name);
        for (const name of poi.inventory || []) if (!itemNames.has(name)) errors.push(`${poi.name}: unknown equipment ${name}`);
        for (const name of poi.shipInventory || []) if (!shipHulls[name]) errors.push(`${poi.name}: unknown ship ${name}`);
      }
      for (const spawn of system.npcSpawns || []) if (spawn.encounter) reachableEncounters.add(spawn.encounter);
      for (const spawn of system.npcSpawns || []) {
        number(spawn.chance, `${system.name}/${spawn.name}/chance`, 0, true);
        if (spawn.chance > 1) errors.push(`${spawn.name}: chance exceeds 1`);
        if (spawn.stats) for (const stat of ['hull', 'armour', 'handling', 'firepower', 'accuracy', 'piloting', 'weapon']) number(spawn.stats[stat], `${spawn.name}/${stat}`, stat === 'handling' ? -Infinity : 0, true);
      }
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
        for (const field of ['taxiJobCount', 'bountyJobCount']) number(node[field], `${name}/${key}/${field}`, 0, false, true);
        for (const field of ['taxiMaxDistance', 'bountyMaxDistance']) number(node[field], `${name}/${key}/${field}`);
        for (const [stat, value] of Object.entries(node.bountyStats || {})) number(value, `${name}/${key}/bountyStats/${stat}`);
        if (!Array.isArray(node.options)) {
          errors.push(`${name}/${key}: missing options`);
          continue;
        }
        for (const option of node.options) {
          const label = `${name}/${key}`;
          for (const field of ['credits', 'xp']) number(option[field], `${label}/${field}`, -Infinity);
          if (option.customEnemy?.stats) for (const stat of ['hull', 'armour', 'handling', 'firepower', 'accuracy', 'piloting', 'weapon']) number(option.customEnemy.stats[stat], `${label}/enemy/${stat}`, stat === 'handling' ? -Infinity : 0, true);
          if (option.nextNode !== 'leave' && !encounter.dialogue[option.nextNode]) errors.push(`${label}: unknown node ${option.nextNode}`);
          if (option.winEncounter && !interactions[option.winEncounter]) errors.push(`${label}: unknown victory encounter ${option.winEncounter}`);
          if (option.rewardItem && !itemNames.has(option.rewardItem)) errors.push(`${label}: unknown reward ${option.rewardItem}`);
          for (const field of ['startTask', 'completeTask']) if (option[field] && !quests[option[field]]) errors.push(`${label}: unknown quest ${option[field]}`);
        }
      }
    }
    for (const [name, quest] of Object.entries(quests)) {
      number(quest.xpReward, `${name}/xpReward`);
      const system = systems.get(quest.targetSystemId);
      if (!system || (quest.targetPoiId != null || quest.targetPoiName) && !system.pois.some(p => quest.targetPoiId != null ? p.id === quest.targetPoiId : p.name === quest.targetPoiName)) {
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
