// Pure rules and atomic player actions. No DOM, storage, or browser dependencies.
const GameRules = (() => {
  function create({
    shipHulls,
    equipment,
    quests,
    commodities
  }) {
    const clone = value => JSON.parse(JSON.stringify(value));
    const cargoCount = player => Object.values(player.cargo || {}).reduce((a, b) => a + b, 0);
    const group = category => category === 'module' ? 'modules' : category;
    function itemCategory(name) {
      for (const category of Object.keys(equipment)) {
        if (Object.hasOwn(equipment[category], name)) return category === 'modules' ? 'module' : category;
      }
      return null;
    }
    function getShipStats(shipData, skills = {}) {
      const chassis = shipHulls[shipData.hull];
      if (!chassis) return null;
      let base = {
        jumpRange: 0,
        armour: 0,
        cargo: 0,
        handling: 0,
        firepower: 0,
        accuracy: 0,
        weight: 0
      };
      const wp = equipment.warpDrive[shipData.core.warpDrive];
      if (wp) {
        base.jumpRange += wp.baseValue || 0;
        base.weight += wp.weight || 0;
      }
      const am = equipment.armour[shipData.core.armour];
      if (am) {
        base.armour += am.baseValue || 0;
        base.weight += am.weight || 0;
      }
      const cb = equipment.cargoBay[shipData.core.cargoBay];
      if (cb) {
        base.cargo += cb.baseValue || 0;
        base.weight += cb.weight || 0;
      }
      const th = equipment.thrusters[shipData.core.thrusters];
      if (th) {
        base.handling += th.baseValue || 0;
        base.weight += th.weight || 0;
      }
      const we = equipment.weapons[shipData.core.weapons];
      if (we) {
        base.firepower += we.firepower || 0;
        base.accuracy += we.accuracy || 0;
        base.weight += we.weight || 0;
      }
      shipData.modules.forEach(modName => {
        const mod = equipment.modules[modName];
        if (mod) {
          if (mod.stat && base[mod.stat] !== undefined) {
            base[mod.stat] += mod.flatBonus;
          }
          if (mod.weight !== undefined) {
            base.weight += mod.weight;
          }
        }
      });
      const engSkill = skills.engineer || 0;
      const engBonus = Math.floor(engSkill / 10);
      return {
        jumpRange: Math.round(base.jumpRange * chassis.multipliers.jumpRange),
        armour: Math.round(base.armour * chassis.multipliers.armour),
        cargoMax: Math.round(base.cargo * chassis.multipliers.cargo),
        handling: Math.round((base.handling + engBonus - (chassis.weight || 0) - base.weight) * chassis.multipliers.handling),
        firepower: Math.round((base.firepower + engBonus) * (chassis.multipliers.firepower || 1)),
        accuracy: Math.round((base.accuracy + engBonus) * (chassis.multipliers.accuracy || 1)),
        maxHull: (chassis.baseHull || 20) + engBonus,
        chassisWeight: chassis.weight || 5,
        equipmentWeight: base.weight,
        baseJump: base.jumpRange,
        multJump: chassis.multipliers.jumpRange,
        baseArmour: base.armour,
        multArmour: chassis.multipliers.armour,
        baseCargo: base.cargo,
        multCargo: chassis.multipliers.cargo,
        baseHandling: base.handling,
        multHandling: chassis.multipliers.handling,
        baseFirepower: base.firepower,
        multFirepower: chassis.multipliers.firepower || 1,
        baseAccuracy: base.accuracy,
        multAccuracy: chassis.multipliers.accuracy || 1,
        baseHull: chassis.baseHull || 20,
        bonusHull: engBonus,
        bonusEng: engBonus
      };
    }
    function dialogue(player, option) {
      const next = clone(player);
      const {
        creditChange = 0,
        xpChange = 0,
        setFlag,
        clearFlag,
        startTask,
        completeTask,
        rewardItem
      } = option;
      if (!Number.isFinite(creditChange) || !Number.isFinite(xpChange)) throw Error('Invalid dialogue reward.');
      if (next.credits + creditChange < 0) throw Error('Insufficient credits.');
      if (rewardItem && !itemCategory(rewardItem)) throw Error('Unknown reward item.');
      if (startTask && !quests[startTask]) throw Error('Unknown quest.');
      if (completeTask && !quests[completeTask]) throw Error('Unknown quest.');
      // A repeated completion cannot pay credits, items, or XP again.
      const alreadyCompleted = completeTask && next.tasks[completeTask] === 'completed';
      if (alreadyCompleted) return {
        player: next,
        questXp: 0,
        completed: false,
        rewarded: false
      };
      next.credits += creditChange;
      next.xp += xpChange;
      if (setFlag) next.flags[setFlag] = true;
      if (clearFlag) next.flags[clearFlag] = false;
      if (startTask && next.tasks[startTask] !== 'completed') next.tasks[startTask] = 'active';
      const questXp = completeTask ? quests[completeTask].xpReward || 0 : 0;
      if (completeTask) {
        next.tasks[completeTask] = 'completed';
        next.xp += questXp;
      }
      // Ownership precedes installation. Cancel/reload can never discard the reward.
      if (rewardItem) {
        next.storage ||= [];
        next.storage.push(rewardItem);
      }
      return {
        player: next,
        questXp,
        completed: !!completeTask,
        rewarded: !!rewardItem
      };
    }
    function previewEquipment(player, proposal, disposition = 'store') {
      const next = clone(player);
      next.storage ||= [];
      const {
        category,
        itemName,
        fromStorage,
        storageIndex,
        slotIndex
      } = proposal;
      const item = equipment[group(category)]?.[itemName];
      const hull = shipHulls[next.ship.hull];
      if (!item || itemCategory(itemName) !== category) throw Error('Unknown equipment.');
      if (item.size !== hull.size) throw Error('This equipment is the wrong class for your ship.');
      if (!['store', 'trade'].includes(disposition)) throw Error('Invalid equipment action.');
      let oldItem;
      if (category === 'module') {
        if (!Number.isInteger(slotIndex) || slotIndex < 0 || slotIndex >= hull.modularSlots) throw Error('No module slot available.');
        oldItem = next.ship.modules[slotIndex];
        next.ship.modules[slotIndex] = itemName;
      } else {
        oldItem = next.ship.core[category];
        next.ship.core[category] = itemName;
      }
      if (fromStorage) {
        if (!Number.isInteger(storageIndex) || next.storage[storageIndex] !== itemName) throw Error('This item is no longer in storage.');
        next.storage.splice(storageIndex, 1);
      }
      const price = fromStorage ? 0 : item.price ?? 1000;
      const tradeIn = oldItem && disposition === 'trade' ? Math.floor((equipment[group(category)][oldItem].price ?? 1000) / 2) : 0;
      if (next.credits < price - tradeIn) throw Error('Insufficient credits.');
      const stats = getShipStats(next.ship, next.skills);
      if (cargoCount(next) > stats.cargoMax) throw Error(`Unload cargo first. This change leaves space for ${stats.cargoMax} units.`);
      next.credits += tradeIn - price;
      if (oldItem && disposition === 'store') next.storage.push(oldItem);
      next.ship.currentHull = Math.min(next.ship.currentHull, stats.maxHull);
      next.cargoMax = stats.cargoMax;
      return {
        player: next,
        stats,
        price,
        tradeIn
      };
    }
    function previewShip(player, shipName) {
      const hull = shipHulls[shipName];
      const oldHull = shipHulls[player.ship.hull];
      if (!hull || shipName === player.ship.hull) throw Error('Choose another ship.');
      const next = clone(player);
      next.storage ||= [];
      const sameSize = oldHull.size === hull.size;
      if (sameSize) {
        next.storage.push(...Object.values(hull.standardLoadout.core).filter(Boolean));
        const modules = next.ship.modules.filter(Boolean);
        next.ship.modules = modules.slice(0, hull.modularSlots);
        next.storage.push(...modules.slice(hull.modularSlots));
      } else {
        next.storage.push(...Object.values(next.ship.core).filter(Boolean), ...next.ship.modules.filter(Boolean));
        next.ship.core = clone(hull.standardLoadout.core);
        next.ship.modules = clone(hull.standardLoadout.modules || []);
      }
      next.ship.hull = shipName;
      const stats = getShipStats(next.ship, next.skills);
      next.ship.currentHull = stats.maxHull;
      next.cargoMax = stats.cargoMax;
      const cost = (hull.price ?? 1000) - Math.floor((oldHull.price ?? 1000) / 2);
      let error = '';
      if (player.activeTaxi) error = 'Cannot trade-in with an active taxi contract';else if (cargoCount(player) > stats.cargoMax) error = `Hold exceeds capacity (${stats.cargoMax})`;else if (player.credits < cost) error = 'Insufficient credits';
      next.credits -= cost;
      return {
        player: next,
        stats,
        cost,
        error,
        sameSize
      };
    }
    function trade(player, itemName, price, buying) {
      if (!commodities[itemName] || !Number.isFinite(price) || price < 0) throw Error('Invalid market price.');
      const next = clone(player);
      if (buying) {
        if (next.credits < price) throw Error('Insufficient credits.');
        if (cargoCount(next) >= getShipStats(next.ship, next.skills).cargoMax) throw Error('Cargo hold is full.');
        next.credits -= price;
        next.cargo[itemName] = (next.cargo[itemName] || 0) + 1;
      } else {
        if (!(next.cargo[itemName] > 0)) throw Error('No cargo to sell.');
        next.credits += price;
        next.cargo[itemName]--;
      }
      return next;
    }
    function repair(player, rate) {
      if (!Number.isFinite(rate) || rate < 0) throw Error('Invalid repair rate.');
      const next = clone(player);
      const damage = Math.max(0, getShipStats(next.ship, next.skills).maxHull - next.ship.currentHull);
      const points = Math.min(damage, rate === 0 ? damage : Math.floor(next.credits / rate));
      next.credits -= points * rate;
      next.ship.currentHull += points;
      return next;
    }
    function upgradeSkill(player, name) {
      if (!Object.hasOwn(player.skills, name)) throw Error('Unknown skill.');
      const next = clone(player);
      const cost = Math.pow(2, Math.floor(next.skills[name] / 10));
      if (next.xp < cost) throw Error('Insufficient XP.');
      next.xp -= cost;
      next.skills[name]++;
      return next;
    }
    function combatRound(player, enemy, action, playerAdvantage, enemyAdvantage, random = Math.random) {
      if (!['attack', 'manoeuvre', 'flee'].includes(action)) throw Error('Unknown combat action.');
      const pStats = getShipStats(player.ship, player.skills),
        eStats = enemy.stats;
      const enemyAction = random() > 0.5 ? 'attack' : 'manoeuvre';
      const pActiveStat = (action === 'attack' ? player.skills.weapon + pStats.accuracy : player.skills.piloting + pStats.handling) + playerAdvantage * 10;
      const eActiveStat = (enemyAction === 'attack' ? eStats.weapon + eStats.accuracy : eStats.piloting + eStats.handling) + enemyAdvantage * 10;
      let winner, pRoll, eRoll, pSuccesses, eSuccesses;
      for (let attempt = 0; attempt <= 100; attempt++) {
        pRoll = Math.floor(random() * 100) + 1;
        eRoll = Math.floor(random() * 100) + 1;
        pSuccesses = Math.floor(pActiveStat / 10) - Math.floor(pRoll / 10);
        eSuccesses = Math.floor(eActiveStat / 10) - Math.floor(eRoll / 10);
        if (pSuccesses !== eSuccesses) winner = pSuccesses > eSuccesses ? 'player' : 'enemy';else if (pRoll <= pActiveStat !== eRoll <= eActiveStat) winner = pRoll <= pActiveStat ? 'player' : 'enemy';
        if (winner) break;
      }
      winner ||= 'player';
      const successMargin = Math.abs(pSuccesses - eSuccesses);
      const escaped = winner === 'player' && action === 'flee' && successMargin >= 6;
      const damageToEnemy = winner === 'player' && action === 'attack' ? Math.max(1, Math.ceil(pStats.firepower + Math.floor(player.skills.weapon / 10) + successMargin - eStats.armour)) : 0;
      const damageToPlayer = winner === 'enemy' && enemyAction === 'attack' ? Math.max(1, Math.ceil(eStats.firepower + Math.floor(eStats.weapon / 10) + successMargin - pStats.armour)) : 0;
      return {
        enemyAction,
        pActiveStat,
        eActiveStat,
        pRoll,
        eRoll,
        pSuccesses,
        eSuccesses,
        winner,
        successMargin,
        escaped,
        damageToEnemy,
        damageToPlayer
      };
    }
    return {
      clone,
      cargoCount,
      itemCategory,
      getShipStats,
      dialogue,
      previewEquipment,
      previewShip,
      trade,
      repair,
      upgradeSkill,
      combatRound
    };
  }
  return {
    create
  };
})();
if (typeof module !== 'undefined') module.exports = GameRules;
