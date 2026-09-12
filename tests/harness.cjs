const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const source = name => fs.readFileSync(path.join(root, name), 'utf8');
function loadData() {
  return vm.runInNewContext(source('data.js') + ';({shipHulls,equipment,quests,commodities,galaxy,newGameDefaults,interactions})');
}
function harness(saved = new Map()) {
  const alerts = [],
    elements = new Map();
  const context = new Proxy({}, {
    get: (target, key) => target[key] || (() => {})
  });
  const element = () => ({
    style: {},
    classList: {
      add() {},
      remove() {},
      toggle() {},
      contains() {
        return false;
      }
    },
    addEventListener() {},
    getContext() {
      return context;
    },
    parentElement: {
      clientWidth: 800,
      clientHeight: 600
    },
    innerHTML: '',
    getBoundingClientRect() {
      return {
        left: 0,
        top: 0
      };
    }
  });
  const env = vm.createContext({
    console: {
      log() {},
      warn() {},
      error() {}
    },
    document: {
      getElementById(id) {
        if (!elements.has(id)) elements.set(id, element());
        return elements.get(id);
      },
      addEventListener() {}
    },
    window: {
      addEventListener() {}
    },
    localStorage: {
      getItem: key => saved.get(key) || null,
      setItem: (key, value) => saved.set(key, value),
      removeItem: key => saved.delete(key)
    },
    setTimeout() {},
    clearTimeout() {},
    setInterval() {},
    clearInterval() {},
    Image: function () {},
    alert: text => alerts.push(text),
    location: {
      reload() {}
    }
  });
  // Match the actual page's script order so missing globals are caught.
  for (const script of source('index.html').matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    const src = script[1].match(/src="([^"]+)"/)?.[1];
    if (src?.startsWith('https:')) continue;
    vm.runInContext(src ? source(src) : script[2], env, {
      filename: src || 'inline'
    });
  }
  return {
    run: code => vm.runInContext(code, env),
    saved,
    alerts,
    elements
  };
}
module.exports = {
  harness,
  loadData,
  source
};
