// Versioned save persistence. Failed reads never erase or overwrite the source.
const SaveStore = (() => {
  const KEY = 'spaceTraderSaveV4'; // Keep the existing key for V4 migration.
  const BACKUP_KEY = KEY + 'Backup';
  const VERSION = 5;
  const object = value => value && typeof value === 'object' && !Array.isArray(value);
  function normalize(raw, data) {
    if (!object(raw) || !object(raw.player)) throw Error('Save data is incomplete.');
    if (raw.version != null && raw.version !== 4 && raw.version !== VERSION) throw Error('Unsupported save version.');
    const saved = JSON.parse(JSON.stringify(raw));
    const player = saved.player;
    const finite = (value, label, min = 0) => {
      if (!Number.isFinite(value) || value < min) throw Error(`Invalid ${label} in save.`);
    };
    finite(player.credits, 'credits');
    player.xp ??= 0;
    finite(player.xp, 'XP');
    player.flags ??= {};
    player.tasks ??= {};
    player.cargo ??= {};
    player.storage ??= [];
    player.skills ??= {
      piloting: 10,
      weapon: 10,
      engineer: 10,
      charm: 10
    };
    player.skills.charm ??= 10;
    for (const key of ['flags', 'tasks', 'cargo', 'skills']) if (!object(player[key])) throw Error(`Invalid ${key} in save.`);
    for (const skill of ['piloting', 'weapon', 'engineer', 'charm']) finite(player.skills[skill], skill);
    for (const [name, qty] of Object.entries(player.cargo)) {
      if (!data.commodities[name] || !Number.isInteger(qty) || qty < 0) throw Error('Invalid cargo in save.');
    }
    const ship = player.ship;
    if (!object(ship) || !data.shipHulls[ship.hull] || !object(ship.core) || !Array.isArray(ship.modules)) throw Error('Unknown ship in save.');
    for (const cat of ['warpDrive', 'armour', 'cargoBay', 'thrusters', 'weapons']) {
      if (ship.core[cat] && !data.equipment[cat][ship.core[cat]]) throw Error('Unknown equipment in save.');
    }
    if (ship.modules.some(name => name && !data.equipment.modules[name])) throw Error('Unknown module in save.');
    if (!Array.isArray(player.storage) || player.storage.some(name => !Object.values(data.equipment).some(items => Object.hasOwn(items, name)))) throw Error('Unknown stored equipment.');
    if (ship.currentHull != null) finite(ship.currentHull, 'hull', -Infinity);
    const system = data.galaxy.find(s => s.id === saved.systemId);
    if (!system) throw Error('Saved system no longer exists.');
    if (saved.poiName && !system.pois.some(p => p.name === saved.poiName)) throw Error('Saved station no longer exists.');
    saved.currentMarketPrices ??= {};
    saved.spawnedNPCs ??= [];
    saved.localEncounterMemory ??= {};
    if (!Array.isArray(saved.spawnedNPCs) || !object(saved.currentMarketPrices) || !object(saved.localEncounterMemory)) throw Error('Invalid world state.');
    if (player.activeTaxi && (!player.activeTaxi.client?.name || !['pickup', 'dropoff'].includes(player.activeTaxi.status))) throw Error('Invalid taxi contract.');
    if (saved.runtime) {
      const r = saved.runtime;
      if (!object(r)) throw Error('Invalid session state.');
      if (r.encounter && !r.encounter.data?.dialogue?.[r.encounter.node]) throw Error('Saved dialogue is incomplete.');
      if (r.combat) {
        const b = r.combat;
        if (!['active', 'won', 'lost', 'escaped'].includes(b.status) || !b.enemy?.stats) throw Error('Saved combat is incomplete.');
        for (const stat of ['hull', 'armour', 'handling', 'firepower', 'accuracy', 'piloting', 'weapon']) finite(b.enemy.stats[stat], 'enemy ' + stat, -Infinity);
        finite(b.enemy.currentHull, 'enemy hull', -Infinity);
        finite(b.playerAdvantage, 'player advantage');
        finite(b.enemyAdvantage, 'enemy advantage');
      }
    }
    saved.version = VERSION;
    return saved;
  }
  function create(storage, data) {
    const decode = text => normalize(JSON.parse(text), data);
    return {
      read(backup = false) {
        const text = storage.getItem(backup ? BACKUP_KEY : KEY);
        if (!text) throw Error('No saved game found.');
        return decode(text);
      },
      hasSave() {
        return !!storage.getItem(KEY);
      },
      hasBackup() {
        return !!storage.getItem(BACKUP_KEY);
      },
      write(snapshot) {
        const text = JSON.stringify(normalize({
          ...snapshot,
          version: VERSION
        }, data));
        const previous = storage.getItem(KEY);
        if (previous === text) return;
        if (previous) {
          let valid = false;
          try {
            decode(previous);
            valid = true;
          } catch {/* Preserve unreadable data in place on load. */}
          if (valid) storage.setItem(BACKUP_KEY, previous);
        }
        // setItem replaces one value atomically. A write failure leaves the old save.
        storage.setItem(KEY, text);
      },
      clear() {
        storage.removeItem(KEY);
        storage.removeItem(BACKUP_KEY);
      }
    };
  }
  return {
    create,
    normalize,
    KEY,
    BACKUP_KEY,
    VERSION
  };
})();
if (typeof module !== 'undefined') module.exports = SaveStore;
