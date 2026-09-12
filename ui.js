// Presentation only. Game state is owned by app.js; rules live in game-rules.js.

function getPoiDescription(poi) {
  if (poi.description) return poi.description;
  const config = stationTypes[poi.type] || {};
  return config.description || `DEFAULT`;
}
function centerOnSystem(sys) {
  const screenWidth = canvas.parentElement.clientWidth;
  const screenHeight = canvas.parentElement.clientHeight;
  camera.x = sys.x * drawScale * camera.zoom - screenWidth / 2;
  camera.y = sys.y * drawScale * camera.zoom - screenHeight / 2;
  renderMap();
}
function switchTab(tabId, force = false) {
  if (!force && localView === 'encounter' && tabId !== 'battle') return;
  activeTab = tabId;
  ['map', 'local', 'ship', 'player', 'tasks', 'battle'].forEach(id => {
    const el = document.getElementById(`tab-${id}`);
    const btn = document.getElementById(`btn-${id}`);
    if (el) el.style.display = id === tabId ? 'flex' : 'none';
    if (btn) btn.classList.toggle('tab-active', id === tabId);
  });
  const bottomNav = document.getElementById('bottom-nav-bar');
  if (bottomNav) {
    bottomNav.style.display = tabId === 'battle' ? 'none' : 'flex';
  }
  if (tabId === 'map') renderMap();
  updateUI();
}
function setLocalView(view) {
  localView = view;
  updateUI();
}
function showXpPopup(xpAmount, sourceText) {
  const toast = document.getElementById('xp-toast');
  const descEl = document.getElementById('xp-toast-desc');
  const taskToast = document.getElementById('toast-notification');
  descEl.innerText = `+${xpAmount} XP (${sourceText})`;
  toast.classList.remove('-translate-y-full', 'translate-y-4', 'translate-y-40');
  if (taskToast.classList.contains('translate-y-4')) {
    toast.classList.add('translate-y-40');
  } else {
    toast.classList.add('translate-y-4');
  }
  if (xpToastTimeout) clearTimeout(xpToastTimeout);
  xpToastTimeout = setTimeout(() => {
    toast.classList.remove('translate-y-4', 'translate-y-40');
    toast.classList.add('-translate-y-full');
  }, 3000);
}
function showTaskPopup(headerText, questData) {
  if (!questData) return;
  const toast = document.getElementById('toast-notification');
  const titleEl = document.getElementById('toast-title');
  const descEl = document.getElementById('toast-desc');
  const xpToast = document.getElementById('xp-toast');
  if (headerText === "TASK COMPLETE") {
    titleEl.innerText = headerText;
    descEl.innerText = questData.title;
  } else {
    titleEl.innerText = questData.title;
    descEl.innerText = questData.description;
  }
  toast.classList.remove('-translate-y-full');
  toast.classList.add('translate-y-4');
  if (xpToast.classList.contains('translate-y-4')) {
    xpToast.classList.remove('translate-y-4');
    xpToast.classList.add('translate-y-40');
  }
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('translate-y-4');
    toast.classList.add('-translate-y-full');
  }, 3500);
}
function updateTasksUI() {
  let html = '';
  for (const [taskId, status] of Object.entries(player.tasks)) {
    const q = quests[taskId];
    if (!q) continue;
    if (status === 'completed') continue;
    html += `
                 <div class="border-2 border-black p-4 bg-gray-50 shadow-md">
                     <h3 class="text-2xl font-bold uppercase mb-2 text-black">
                         ${q.title}
                     </h3>
                     <p class="text-lg italic">${q.description}</p>
                 </div>`;
  }
  document.getElementById('tasks-list').innerHTML = html || '<p class="text-gray-500 italic text-xl">No active tasks.</p>';
}
function drawCachedImage(ctx, src, x, y, w, h, alpha) {
  if (!imageCache[src]) {
    imageCache[src] = new Image();
    imageCache[src].src = "assets/" + src;
    imageCache[src].onload = () => {
      if (activeTab === 'map') renderMap();
    };
  }
  if (imageCache[src].complete && imageCache[src].naturalWidth > 0) {
    ctx.globalAlpha = alpha;
    ctx.drawImage(imageCache[src], x, y, w, h);
    ctx.globalAlpha = 1.0;
  }
}
function renderMap() {
  if (activeTab !== 'map' || typeof galaxy === 'undefined') return;
  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = canvas.parentElement.clientHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(-camera.x, -camera.y);
  ctx.scale(camera.zoom, camera.zoom);
  if (typeof mapBackgrounds !== 'undefined') {
    mapBackgrounds.forEach(bg => {
      drawCachedImage(ctx, bg.image, bg.x * drawScale, bg.y * drawScale, bg.width * drawScale, bg.height * drawScale, bg.alpha);
    });
  }
  const cx = currentSystem.x * drawScale;
  const cy = currentSystem.y * drawScale;
  ctx.beginPath();
  ctx.arc(cx, cy, jumpRange * drawScale, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0, 0, 0, 0.03)";
  ctx.fill();
  ctx.strokeStyle = "#888888";
  ctx.lineWidth = 2 / camera.zoom;
  ctx.setLineDash([5 / camera.zoom, 5 / camera.zoom]);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
  galaxy.forEach(star => {
    if (star.id !== currentSystem.id) {
      const dist = Math.sqrt((currentSystem.x - star.x) ** 2 + (currentSystem.y - star.y) ** 2);
      if (dist <= jumpRange) {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(star.x * drawScale, star.y * drawScale);
        ctx.stroke();
      }
    }
  });
  galaxy.forEach(star => {
    const sx = star.x * drawScale;
    const sy = star.y * drawScale;
    const dist = Math.sqrt((currentSystem.x - star.x) ** 2 + (currentSystem.y - star.y) ** 2);
    const inRange = dist <= jumpRange;
    ctx.fillStyle = star.id === currentSystem.id ? "#000000" : "#ffffff";
    ctx.strokeStyle = inRange ? "#000000" : "#777777";
    ctx.lineWidth = 2 / camera.zoom;
    ctx.beginPath();
    ctx.arc(sx, sy, 8 / camera.zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = inRange ? "#000000" : "#777777";
    ctx.font = `bold ${18 / camera.zoom}px Courier New`;
    ctx.fillText(star.name.toUpperCase(), sx + 18 / camera.zoom, sy + 6 / camera.zoom);
  });
  Object.keys(player.tasks).forEach(taskId => {
    if (player.tasks[taskId] === "active") {
      const q = quests[taskId];
      if (q && q.targetSystemId !== undefined) {
        const targetSys = galaxy.find(s => s.id === q.targetSystemId);
        if (targetSys) {
          const tx = targetSys.x * drawScale;
          const ty = targetSys.y * drawScale;
          ctx.beginPath();
          ctx.arc(tx, ty, 16 / camera.zoom, 0, Math.PI * 2);
          ctx.strokeStyle = "#2563eb";
          ctx.lineWidth = 4 / camera.zoom;
          ctx.stroke();
        }
      }
    }
  });
  ctx.restore();
}
function getMarketContext(itemName, price, view) {
  const comm = commodities[itemName];
  const base = comm.basePrice;
  const min = comm.min || base * 0.6;
  const max = comm.max || base * 1.5;
  let arrow = "■",
    color = "text-gray-400";
  if (price > base) {
    const ratio = (price - base) / (max - base);
    if (ratio >= 0.66) {
      arrow = "▲▲▲";
      color = view === 'buy' ? "text-red-600" : "text-green-600";
    } else if (ratio >= 0.33) {
      arrow = "▲▲";
      color = view === 'buy' ? "text-red-600" : "text-green-600";
    } else if (ratio > 0.05) {
      arrow = "▲";
      color = view === 'buy' ? "text-red-600" : "text-green-600";
    }
  } else if (price < base) {
    const ratio = (base - price) / (base - min);
    if (ratio >= 0.66) {
      arrow = "▼▼▼";
      color = view === 'buy' ? "text-green-600" : "text-red-600";
    } else if (ratio >= 0.33) {
      arrow = "▼▼";
      color = view === 'buy' ? "text-green-600" : "text-red-600";
    } else if (ratio > 0.05) {
      arrow = "▼";
      color = view === 'buy' ? "text-green-600" : "text-red-600";
    }
  }
  return `<span class="${color} font-bold text-xl ml-1">${arrow}</span>`;
}
function updateBattleUI() {
  if (!currentEnemy || !player.ship) return;
  const pStats = getShipStats(player.ship);
  document.getElementById('battle-hull-player').innerText = `Hull: ${player.ship.currentHull}/${pStats.maxHull}`;
  document.getElementById('battle-hp-player').style.width = `${Math.max(0, player.ship.currentHull / pStats.maxHull * 100)}%`;
  document.getElementById('battle-hull-enemy').innerText = `Hull: ${currentEnemy.currentHull}/${currentEnemy.stats.hull}`;
  document.getElementById('battle-hp-enemy').style.width = `${Math.max(0, currentEnemy.currentHull / currentEnemy.stats.hull * 100)}%`;
}
function updateUI() {
  const stats = getShipStats(player.ship);
  const totalCargo = Object.values(player.cargo).reduce((a, b) => a + b, 0);
  document.getElementById('status-credits').innerText = player.credits.toLocaleString();
  document.getElementById('status-hull').innerText = player.ship.currentHull;
  document.getElementById('status-hull-max').innerText = stats.maxHull;
  document.getElementById('status-cargo').innerText = totalCargo;
  document.getElementById('status-cargo-max').innerText = player.cargoMax;
  document.getElementById('map-range-val').innerText = jumpRange;
  const localTab = document.getElementById('tab-local');
  const localScroll = localTab.scrollTop;
  const marketContainer = document.getElementById('market-container');
  const marketScroll = marketContainer ? marketContainer.scrollTop : 0;
  if (!currentSystem) return;
  if (localView === 'encounter') {
    let html = '';
    if (currentPoi) html += renderPoiHeader();
    html += renderEncounter();
    localTab.innerHTML = html;
  } else if (!currentPoi) {
    localTab.innerHTML = renderPoiList();
  } else {
    let html = renderPoiHeader();
    if (localView === 'menu') {
      html += renderStationMenu();
    } else if (localView === 'outfitter') {
      html += renderOutfitter();
    } else if (localView === 'shipyard') {
      html += renderShipyard(totalCargo);
    } else {
      html += renderMarket(totalCargo);
    }
    localTab.innerHTML = html;
  }
  localTab.scrollTop = localScroll;
  const newMarketContainer = document.getElementById('market-container');
  if (newMarketContainer) newMarketContainer.scrollTop = marketScroll;
  updateShipTabUI(totalCargo);
  renderPlayerTab();
  updateTasksUI();
  const inEncounter = localView === 'encounter';
  ['btn-map', 'btn-local', 'btn-ship', 'btn-player', 'btn-tasks'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
      if (inEncounter) {
        btn.style.pointerEvents = 'none';
        btn.style.opacity = '0.3';
      } else {
        btn.style.pointerEvents = 'auto';
        btn.style.opacity = '1';
      }
    }
  });
}
function renderPoiList() {
  const systemData = galaxy.find(s => s.id === currentSystem.id);
  const sysImagePath = systemData.image ? `assets/${systemData.image}` : 'assets/star_system_default.png';
  const sysDescription = systemData.description ? systemData.description : "";
  let html = `
             <div class="flex items-center gap-6 mb-6 border-b-2 border-black pb-4">
                 <div class="w-24 h-24 shrink-0 border-2 border-black bg-black flex items-center justify-center overflow-hidden">
                     <img src="${sysImagePath}" alt="${systemData.name}" class="w-full h-full object-cover" onerror="this.onerror=null; this.src='assets/default.png';">
                 </div>
                 <div>
                     <h2 class="text-4xl font-bold uppercase mb-2">${currentSystem.name} SYSTEM</h2>
                     <p class="text-lg italic text-gray-600">${sysDescription}</p>
                 </div>
             </div>`;
  currentSystem.pois.forEach((p, i) => {
    if (p.requiresFlag && !player.flags[p.requiresFlag]) return;
    if (p.hidesOnFlag && player.flags[p.hidesOnFlag]) return;
    let isTarget = false;
    Object.keys(player.tasks).forEach(taskId => {
      if (player.tasks[taskId] === "active") {
        const q = quests[taskId];
        if (q && q.targetSystemId === currentSystem.id && q.targetPoiName === p.name) {
          isTarget = true;
        }
      }
    });
    const stationConfig = stationTypes[p.type] || {};
    const imageFile = p.image || stationConfig.defaultImage || 'default.png';
    const imagePath = `assets/${imageFile}`;
    const targetClasses = isTarget ? "!border-blue-600 !bg-blue-50 shadow-[0_0_15px_rgba(37,99,235,0.3)]" : "";
    const textHighlight = isTarget ? "text-blue-700" : "";
    html += `
                 <button class="btn !p-2 ${targetClasses}" onclick="triggerLocalTravel(${i})">
                     <div class="flex items-center gap-4 text-left">
                         <div class="w-16 h-16 shrink-0 border-2 border-black bg-gray-100 flex items-center justify-center overflow-hidden">
                             <img src="${imagePath}" alt="${p.type}" class="w-full h-full object-cover" onerror="this.onerror=null; this.src='assets/default.png';">
                         </div>
                         <div>
                             <div class="text-2xl leading-none mb-1 ${textHighlight}">${p.name.toUpperCase()}</div>
                             ${p.type === 'Encounter' || p.type === 'Outpost' ? '' : `<div class="text-lg text-gray-600">${p.type}</div>`}
                         </div>
                     </div>
                 </button>`;
  });
  html += renderNPCButtons();
  html += `</div>`;
  return html;
}
function renderPoiHeader() {
  const stationConfig = stationTypes[currentPoi.type] || {};
  const imageFile = currentPoi.image || stationConfig.defaultImage || 'default.png';
  const imagePath = `assets/${imageFile}`;
  return `
                 <div class="flex items-center gap-4 mb-4 border-b-2 border-black pb-4">
                     <div class="w-24 h-24 shrink-0 border-2 border-black bg-gray-100 flex items-center justify-center overflow-hidden">
                         <img src="${imagePath}" alt="${currentPoi.type}" class="w-full h-full object-cover" onerror="this.onerror=null; this.src='assets/default.png';">
                     </div>
                     <div>
                         <h2 class="text-4xl font-bold uppercase">${currentPoi.name}</h2>
                         ${currentPoi.type === 'Encounter' || currentPoi.type === 'Outpost' ? '' : `<p class="text-xl font-bold uppercase text-gray-600"> ${currentPoi.type}</p>`}
                     </div>
                 </div>
             `;
}
function renderStationMenu() {
  let html = `<p class="text-xl mb-8 italic border-l-4 border-black pl-4 py-2 bg-gray-50">${getPoiDescription(currentPoi)}</p>`;
  const config = stationTypes[currentPoi.type] || {};
  const hasMarket = config.produces && config.produces.length > 0 || config.consumes && Object.keys(config.consumes).length > 0;
  if (hasMarket) {
    html += `<div class="space-y-4 max-w-md mx-auto">
                     <button class="btn" onclick="setLocalView('buy')">BUY COMMODITIES</button>
                     <button class="btn" onclick="setLocalView('sell')">SELL COMMODITIES</button>
                 </div>`;
  }
  if (currentPoi.type === "Repair Station") {
    const stats = getShipStats(player.ship);
    const damage = stats.maxHull - player.ship.currentHull;
    const rate = currentPoi.repairCost !== undefined ? currentPoi.repairCost : 10;
    const canAffordSomething = player.credits >= rate;
    const isDamaged = damage > 0;
    let btnText = isDamaged ? `REPAIR SHIP [${rate} CR/PT]` : `HULL AT MAX [${rate} CR/PT]`;
    html += `<div class="space-y-4 max-w-md mx-auto mt-4">
                     <button class="btn !border-blue-600 !text-blue-800 bg-blue-50" onclick="repairShip()" ${!isDamaged || !canAffordSomething ? 'disabled' : ''}>
                         ${btnText}
                     </button>
                 </div>`;
  }
  if (config.hasOutfitter || currentPoi.type === "Outfitter") {
    html += `<div class="space-y-4 max-w-md mx-auto mt-4">
                     <button class="btn" onclick="setLocalView('outfitter')">
                         SHIP OUTFITTING
                     </button>
                 </div>`;
  }
  if (config.hasShipyard || currentPoi.type === "Ship Vendor") {
    html += `<div class="space-y-4 max-w-md mx-auto mt-4">
                     <button class="btn" onclick="setLocalView('shipyard')">
                         SHIP SHOWROOM
                     </button>
                 </div>`;
  }
  if (currentPoi.encounters && currentPoi.encounters.length > 0) {
    let encounterHtml = '';
    currentPoi.encounters.forEach(encName => {
      const encData = interactions[encName] || {};
      if (encData.requiresFlag && !player.flags[encData.requiresFlag]) return;
      if (encData.hidesOnFlag && player.flags[encData.hidesOnFlag]) return;
      let encImageFile = encData.image || 'default.png';
      if (localEncounterMemory[encName]) {
        encImageFile = localEncounterMemory[encName];
      } else {
        if (Array.isArray(encImageFile)) {
          encImageFile = encImageFile[Math.floor(Math.random() * encImageFile.length)];
        } else if (encImageFile === 'random') {
          encImageFile = generateRandomCharacter().image;
        }
        localEncounterMemory[encName] = encImageFile;
      }
      const encImagePath = `assets/${encImageFile}`;
      encounterHtml += `
                     <button class="btn bg-gray-100 !p-2" onclick="startEncounter('${encName}')">
                         <div class="flex items-center gap-4 text-left">
                             <div class="w-16 h-16 shrink-0 border-2 border-black bg-white flex items-center justify-center overflow-hidden">
                                 <img src="${encImagePath}" alt="${encName}" class="w-full h-full object-cover" onerror="this.onerror=null; this.src='assets/default.png';">
                             </div>
                             <div>
                                 <div class="text-2xl leading-none mb-1">${encName.toUpperCase()}</div>
                             </div>
                         </div>
                     </button>`;
    });
    if (encounterHtml !== '') {
      const mtClass = hasMarket ? "mt-8" : "";
      html += `<div class="space-y-4 max-w-md mx-auto ${mtClass}">${encounterHtml}</div>`;
    }
  }
  if (player.activeTaxi) {
    const passenger = player.activeTaxi.client;
    if (player.activeTaxi.status === 'pickup' && currentSystem.id === player.activeTaxi.pickupSysId && currentPoi.name === player.activeTaxi.pickupPoiName) {
      html += `
                     <div class="space-y-4 max-w-md mx-auto mt-4">
                         <button class="btn bg-blue-100 !p-2 border-blue-600" onclick="startTaxiPickup()">
                             <div class="flex items-center gap-4 text-left">
                                 <div class="w-16 h-16 shrink-0 border-2 border-black bg-white flex items-center justify-center overflow-hidden">
                                     <img src="assets/${passenger.image}" class="w-full h-full object-cover" onerror="this.onerror=null; this.src='assets/default.png';">
                                 </div>
                                 <div>
                                     <div class="text-2xl leading-none mb-1 text-blue-800">${passenger.name.toUpperCase()}</div>
                                     <div class="text-sm font-bold text-blue-700">PASSENGER PICKUP</div>
                                 </div>
                             </div>
                         </button>
                     </div>`;
    }
    if (player.activeTaxi.status === 'dropoff' && currentSystem.id === player.activeTaxi.dropoffSysId && currentPoi.name === player.activeTaxi.dropoffPoiName) {
      html += `
                     <div class="space-y-4 max-w-md mx-auto mt-4">
                         <button class="btn bg-green-100 !p-2 border-green-600" onclick="startTaxiDropoff()">
                             <div class="flex items-center gap-4 text-left">
                                 <div class="w-16 h-16 shrink-0 border-2 border-black bg-white flex items-center justify-center overflow-hidden">
                                     <img src="assets/${passenger.image}" class="w-full h-full object-cover" onerror="this.onerror=null; this.src='assets/default.png';">
                                 </div>
                                 <div>
                                     <div class="text-2xl leading-none mb-1 text-green-800">${passenger.name.toUpperCase()}</div>
                                     <div class="text-sm font-bold text-green-700">PASSENGER DROPOFF</div>
                                 </div>
                             </div>
                         </button>
                     </div>`;
    }
  }
  html += `<div class="space-y-4 max-w-md mx-auto mt-12 pb-8"><button class="btn bg-gray-200" onclick="triggerLocalTravel(-1)">LAUNCH</button></div>`;
  return html;
}
function renderEncounter() {
  let html = '';
  if (currentPoi && currentPoi.type === 'Encounter') {
    html += `<p class="text-xl mb-8 italic border-l-4 border-black pl-4 py-2 bg-gray-50">${getPoiDescription(currentPoi)}</p>`;
  }
  const encData = interactions[currentEncounterName];
  const node = encData.dialogue[currentDialogueNode];
  const encImagePath = `assets/${currentEncounterImage}`;
  let displayText = node.text.replace(/\b(\d+)(?=\s*(?:credits|cr)\b)/gi, match => parseInt(match).toLocaleString());
  displayText = displayText.replace(/\n/g, '<br>');
  html += `
                 <div class="flex flex-col h-full min-h-[50vh]">
                     <div class="flex-grow bg-gray-50 p-6 border-2 border-black mb-6 flex flex-col gap-6 shadow-inner">

                         <div class="shrink-0 flex flex-col items-center gap-2 w-full">
                             <div class="w-32 h-32 border-2 border-black bg-white flex items-center justify-center overflow-hidden">
                                 <img src="${encImagePath}" alt="${currentEncounterDisplayName}" class="w-full h-full object-cover" onerror="this.onerror=null; this.src='assets/default.png';">
                             </div>
                             <div class="text-xl font-bold uppercase text-center w-full leading-tight border-b-2 border-gray-300 pb-4">
                                 ${currentEncounterDisplayName}
                             </div>
                         </div>

                         <div class="text-2xl font-bold text-gray-800 self-start w-full min-w-0 break-words">
                             ${displayText}
                         </div>

                     </div>
                     <div class="space-y-4 shrink-0 mt-auto max-w-2xl mx-auto w-full pb-8">
             `;
  if (node.generateBountyJobs) {
    if (player.activeBounty) {
      html += `<div class="bg-gray-100 border-2 border-black p-4 mb-4 font-bold text-center">You already have an active Bounty Contract. Clear it before accepting another.</div>`;
    } else {
      html += `<h4 class="text-2xl font-bold uppercase mb-2 border-b-2 border-black pb-2">Available Bounties</h4><div class="space-y-2 mb-6">`;
      (window.currentBountyOffers || []).forEach((job, idx) => {
        const hullData = shipHulls[job.shipHull] || {};
        html += `<div class="border-2 border-black bg-white p-3 flex justify-between items-center">
                             <div class="flex items-center gap-4">
                                 <div class="w-16 h-16 border border-black bg-gray-100 shrink-0"><img src="assets/${job.targetImage}" class="w-full h-full object-cover" onerror="this.onerror=null; this.src='assets/default.png';"></div>
                                 <div>
                                     <div class="font-bold text-lg">${job.targetName}</div>
                                     <div class="text-sm text-gray-700 italic mb-1">Wanted for: ${job.crime}</div>
                                     <div class="text-sm text-gray-600 uppercase">Location: <span class="font-bold text-black">${job.targetSysName}</span></div>
                                     <div class="text-sm text-gray-600 uppercase">Bounty: <span class="font-black text-black text-base">${job.reward.toLocaleString()} CR</span></div>
                                 </div>
                             </div>
                             <button class="btn !w-auto !py-2 !px-4 !mb-0 !bg-gray-100" onclick="acceptBountyJob(${idx})">ACCEPT</button>
                         </div>`;
      });
      html += `</div>`;
    }
  }
  if (node.generateTaxiJobs) {
    if (player.activeTaxi) {
      html += `<div class="mb-4 p-4 bg-yellow-100 border-2 border-yellow-500 font-bold text-yellow-800 text-xl text-center">
                        "You already have a passenger, spacer! Drop them off before taking more fares."
                    </div>`;
    } else {
      html += `<div class="space-y-3 mb-6">`;
      (window.currentTaxiOffers || []).forEach((job, idx) => {
        html += `<button class="btn !bg-blue-50 text-left !p-3" onclick="acceptTaxiJob(${idx})">
                            <div class="text-lg text-gray-500 font-bold mb-1 uppercase">FROM: ${job.pickupPoiName} (${job.pickupSysName})</div>
                            <div class="text-lg text-gray-500 font-bold mb-1 uppercase">TO: ${job.dropoffPoiName} (${job.dropoffSysName})</div>
                            <div class="text-lg font-bold">Take ${job.client.name} [+${job.reward.toLocaleString()} CR]</div>
                        </button>`;
      });
      html += `</div>`;
    }
  }
  node.options.forEach((opt, optionIndex) => {
    if (opt.requiresFlag && !player.flags[opt.requiresFlag]) return;
    if (opt.hidesOnFlag && player.flags[opt.hidesOnFlag]) return;
    let disabledAttr = '';
    let creditTag = '';
    let actualCredits = opt.credits || 0;
    if (opt.credits) {
      if (opt.credits < 0) {
        creditTag = ` [-${Math.abs(opt.credits).toLocaleString()} CR]`;
        if (player.credits < Math.abs(opt.credits)) disabledAttr = 'disabled';
      } else {
        const charmBonus = player.skills && player.skills.charm !== undefined ? player.skills.charm : 10;
        actualCredits = Math.round(opt.credits * (1 + charmBonus / 100));
        creditTag = ` [+${actualCredits.toLocaleString()} CR]`;
      }
    }
    let xpTag = '';
    if (opt.xp) {
      xpTag = opt.xp > 0 ? ` [+${opt.xp.toLocaleString()} XP]` : ` [${opt.xp.toLocaleString()} XP]`;
    }
    let itemTag = '';
    if (opt.rewardItem) {
      itemTag = ` [+ITEM]`;
    }
    html += `<button class="btn" onclick="chooseDialogueOption(${optionIndex})" ${disabledAttr}>
                    <span>${opt.text}${creditTag}${xpTag}${itemTag}</span>
                </button>`;
  });
  html += `</div></div>`;
  return html;
}
function renderMarket(totalCargo) {
  let html = `<div class="flex justify-between items-center mb-6 border-b-2 border-black pb-2">
                <h3 class="text-3xl font-bold uppercase">${localView}ING</h3>
                <button class="btn !w-auto !mb-0 !py-2 !px-4 !text-xl" onclick="setLocalView('menu')">◀ BACK</button>
            </div><div id="market-container" class="overflow-y-auto pb-8">`;
  const marketData = getStationMarket(currentPoi.type);
  const activeMarket = localView === 'buy' ? marketData.selling : marketData.buying;
  html += `<div class="market-list-header"><span>Item</span><span class="text-center">Price</span><span class="text-center">Hold</span><span class="text-center">Action</span></div>`;
  if (activeMarket.length === 0) {
    html += `<p class="text-gray-500 italic mt-4">No goods available for ${localView}.</p>`;
  } else {
    activeMarket.forEach(m => {
      const itemName = m.item;
      const price = m.price;
      const qty = player.cargo[itemName] || 0;
      const can = localView === 'buy' ? player.credits >= price && totalCargo < player.cargoMax : qty > 0;
      html += `<div class="market-item">
                         <span class="text-sm sm:text-lg leading-tight pr-1" title="${itemName}">${itemName}</span>
                         <span class="text-center flex items-center justify-center">${price.toLocaleString()} ${getMarketContext(itemName, price, localView)}</span>
                         <span class="text-center">${qty}</span>
                         <button class="trade-btn" onclick="${localView}Good('${itemName}', ${price})" ${can ? '' : 'disabled'}>${localView.toUpperCase()}</button>
                     </div>`;
    });
  }
  html += `</div>`;
  return html;
}
function getEquipmentStatString(cat, itemData) {
  let stats = [];
  if (itemData.baseValue !== undefined) {
    let statName = cat === 'warpDrive' ? 'Jump' : cat === 'armour' ? 'Armour' : cat === 'cargoBay' ? 'Cargo' : cat === 'thrusters' ? 'Thrust' : 'Value';
    stats.push(`${itemData.baseValue} ${statName}`);
  }
  if (itemData.firepower !== undefined) stats.push(`${itemData.firepower} FP`);
  if (itemData.accuracy !== undefined) stats.push(`${itemData.accuracy} ACC`);
  if (itemData.stat !== undefined) {
    let sName = itemData.stat === 'jumpRange' ? 'Jump' : itemData.stat === 'cargo' ? 'Cargo' : itemData.stat === 'handling' ? 'Handling' : itemData.stat === 'firepower' ? 'FP' : itemData.stat === 'accuracy' ? 'ACC' : itemData.stat;
    stats.push(`+${itemData.flatBonus} ${sName.toUpperCase()}`);
  }
  if (itemData.weight !== undefined) stats.push(`${itemData.weight} WT`);
  return stats.join(' | ');
}
function getEquipmentDiffString(cat, itemName) {
  let curStats = getShipStats(player.ship);
  let simShip = JSON.parse(JSON.stringify(player.ship));
  if (cat === 'module' || cat === 'modules') {
    let hullData = shipHulls[simShip.hull];
    let placed = false;
    for (let i = 0; i < hullData.modularSlots; i++) {
      if (!simShip.modules[i]) {
        simShip.modules[i] = itemName;
        placed = true;
        break;
      }
    }
    if (!placed && hullData.modularSlots > 0) {
      simShip.modules[0] = itemName;
    } else if (!placed) {
      return '<span class="text-red-500">(No slots)</span>';
    }
  } else {
    simShip.core[cat] = itemName;
  }
  let newStats = getShipStats(simShip);
  let diffs = [];
  const compare = [{
    key: 'jumpRange',
    label: 'JMP'
  }, {
    key: 'armour',
    label: 'ARM'
  }, {
    key: 'cargoMax',
    label: 'CRG'
  }, {
    key: 'handling',
    label: 'HND'
  }, {
    key: 'firepower',
    label: 'FP'
  }, {
    key: 'accuracy',
    label: 'ACC'
  }];
  compare.forEach(c => {
    let diff = newStats[c.key] - curStats[c.key];
    if (diff !== 0) {
      let color = diff > 0 ? 'text-green-600' : 'text-red-600';
      let sign = diff > 0 ? '+' : '';
      diffs.push(`<span class="${color} font-bold">${sign}${diff} ${c.label}</span>`);
    }
  });
  if (diffs.length === 0) return '<span class="text-gray-400 font-bold">(+0)</span>';
  return `[ ${diffs.join(' | ')} ]`;
}
function renderOutfitter() {
  let html = `
             <div class="flex justify-between items-center mb-6 border-b-2 border-black pb-2">
                 <h3 class="text-3xl font-bold uppercase">OUTFITTER</h3>
                 <button class="btn !w-auto !mb-0 !py-2 !px-4 !text-xl" onclick="setLocalView('menu')">◀ BACK</button>
             </div>
             <div id="outfitter-container" class="overflow-y-auto pb-8 space-y-8">`;
  const currentShipSize = shipHulls[player.ship.hull].size;
  if (player.storage && player.storage.length > 0) {
    html += `<div><h4 class="text-2xl font-bold uppercase bg-black text-white p-2 mb-2">Your Storage</h4><div class="space-y-2">`;
    player.storage.forEach((itemName, index) => {
      let itemCat = getEquipmentCategory(itemName);
      if (itemCat) {
        const itemData = equipment[itemCat === 'module' ? 'modules' : itemCat][itemName];
        const isWrongClass = itemData.size !== currentShipSize;
        html += `<div class="flex justify-between items-center border-2 border-black bg-gray-50 p-2 ${isWrongClass ? 'opacity-50 grayscale' : ''}">
                             <div>
                                 <div class="font-bold text-lg">${itemData.name} <span class="text-xs font-normal text-gray-500 ml-2">(${itemData.size})</span></div>
                                 <div class="text-sm text-gray-800">${getEquipmentStatString(itemCat, itemData)} <span class="ml-2">${isWrongClass ? '' : getEquipmentDiffString(itemCat, itemName)}</span></div>
                             </div>
                             <button class="btn !w-auto !py-1 !px-3 !mb-0" onclick="startEquipProcess('${itemCat}', '${itemName}', 0, true, ${index})" ${isWrongClass ? 'disabled' : ''}>${isWrongClass ? 'WRONG CLASS' : 'INSTALL'}</button>
                         </div>`;
      }
    });
    html += `</div></div>`;
  }
  html += `<div><h4 class="text-2xl font-bold uppercase bg-black text-white p-2 mb-2">Available Equipment</h4>`;
  const categories = [{
    id: 'warpDrive',
    name: 'Warp Drives'
  }, {
    id: 'armour',
    name: 'Armour'
  }, {
    id: 'cargoBay',
    name: 'Cargo Bays'
  }, {
    id: 'thrusters',
    name: 'Thrusters'
  }, {
    id: 'weapons',
    name: 'Weapons'
  }, {
    id: 'modules',
    name: 'Modules'
  }];
  categories.forEach(cat => {
    let itemsHtml = '';
    for (const [itemName, itemData] of Object.entries(equipment[cat.id])) {
      if (currentPoi && currentPoi.inventory && currentPoi.inventory.length > 0) {
        if (!currentPoi.inventory.includes(itemName)) continue;
      }
      const isCoreEquipped = player.ship.core[cat.id] === itemName;
      const isModEquipped = cat.id === 'modules' && player.ship.modules.includes(itemName);
      const isEquipped = isCoreEquipped || isModEquipped;
      const price = itemData.price || 1000;
      let effectiveCost = price;
      if (cat.id !== 'modules' && player.ship.core[cat.id]) {
        const oldItem = equipment[cat.id][player.ship.core[cat.id]];
        if (oldItem) effectiveCost -= Math.floor((oldItem.price || 1000) / 2);
      } else if (cat.id === 'modules') {
        const hullData = shipHulls[player.ship.hull];
        let hasEmptySlot = false;
        for (let i = 0; i < hullData.modularSlots; i++) {
          if (!player.ship.modules[i]) hasEmptySlot = true;
        }
        if (!hasEmptySlot && player.ship.modules.length > 0) {
          let minTradeIn = Infinity;
          player.ship.modules.forEach(m => {
            if (m) {
              const mData = equipment.modules[m];
              if (mData) {
                const tVal = Math.floor((mData.price || 1000) / 2);
                if (tVal < minTradeIn) minTradeIn = tVal;
              }
            }
          });
          if (minTradeIn !== Infinity) effectiveCost -= minTradeIn;
        }
      }
      const canAfford = player.credits >= effectiveCost;
      const isWrongClass = itemData.size !== currentShipSize;
      let btnText = isEquipped ? 'EQUIPPED' : isWrongClass ? 'WRONG CLASS' : `BUY [${price} CR]`;
      if (!isEquipped && !isWrongClass && player.credits < price && canAfford) {
        btnText = `BUY w/ TRADE [${effectiveCost} CR]`;
      }
      let stylingClasses = isEquipped ? 'opacity-50' : isWrongClass ? 'opacity-50 grayscale bg-gray-100' : '';
      itemsHtml += `<div class="flex justify-between items-center border-2 border-black bg-white p-2 ${stylingClasses}">
                         <div>
                             <div class="font-bold text-lg">${itemData.name} <span class="text-xs font-normal text-gray-500 ml-2">(${itemData.size})</span></div>
                             <div class="text-sm text-gray-800">${getEquipmentStatString(cat.id, itemData)} <span class="ml-2">${isEquipped || isWrongClass ? '' : getEquipmentDiffString(cat.id, itemName)}</span></div>
                         </div>
                         <button class="btn !w-auto !py-1 !px-3 !mb-0" onclick="startEquipProcess('${cat.id === 'modules' ? 'module' : cat.id}', '${itemName}', ${price}, false)" ${!canAfford || isEquipped || isWrongClass ? 'disabled' : ''}>
                             ${btnText}
                         </button>
                     </div>`;
    }
    if (itemsHtml !== '') {
      html += `<h5 class="text-xl font-bold text-gray-700 mt-4 mb-2 border-b border-gray-300">${cat.name.toUpperCase()}</h5><div class="space-y-2">${itemsHtml}</div>`;
    }
  });
  html += `</div></div>`;
  return html;
}
function showModuleSwapModal() {
  const list = document.getElementById('module-swap-list');
  let html = '';
  player.ship.modules.forEach((modName, index) => {
    const modData = equipment.modules[modName];
    html += `<button class="btn !mb-2 !text-lg" onclick="selectModuleToReplace(${index}, '${modName}')">Replace: ${modData.name}</button>`;
  });
  list.innerHTML = html;
  document.getElementById('module-swap-modal').classList.remove('hidden');
  document.getElementById('module-swap-modal').classList.add('flex');
}
function showTradeInModal() {
  const oldItemData = pendingEquip.category === 'module' ? equipment.modules[pendingEquip.oldItem] : equipment[pendingEquip.category][pendingEquip.oldItem];
  const tradeInValue = Math.floor((oldItemData.price || 1000) / 2);
  pendingEquip.tradeInValue = tradeInValue;
  document.getElementById('trade-in-desc').innerHTML = `You are replacing your <strong>${oldItemData.name}</strong>.<br>What would you like to do with it?`;
  const btnStore = document.getElementById('btn-store');
  if (btnStore) {
    if (player.credits < pendingEquip.price) {
      btnStore.disabled = true;
      btnStore.innerText = "STORAGE (INSUFFICIENT FUNDS)";
    } else {
      btnStore.disabled = false;
      btnStore.innerText = "SEND TO STORAGE";
    }
  }
  const netCost = pendingEquip.price - tradeInValue;
  let tradeText = netCost > 0 ? `TRADE IN [COST: ${netCost} CR]` : netCost < 0 ? `TRADE IN [GAIN: ${Math.abs(netCost)} CR]` : `TRADE IN [FREE]`;
  document.getElementById('btn-trade-in').innerText = tradeText;
  document.getElementById('trade-in-modal').classList.remove('hidden');
  document.getElementById('trade-in-modal').classList.add('flex');
}
function showRewardModal(itemName) {
  pendingRewardItem = itemName;
  const category = getEquipmentCategory(itemName);
  const eqGroup = category === 'module' ? 'modules' : category;
  const itemData = equipment[eqGroup] ? equipment[eqGroup][itemName] : null;
  if (!itemData) {
    console.error("Invalid reward item:", itemName);
    return;
  }
  const currentShipSize = shipHulls[player.ship.hull].size;
  const isWrongClass = itemData.size !== currentShipSize;
  document.getElementById('reward-desc').innerHTML = `You received: <strong>${itemData.name}</strong> <span class="text-sm">(${itemData.size})</span>`;
  const btnEquip = document.getElementById('btn-reward-equip');
  if (isWrongClass) {
    btnEquip.disabled = true;
    btnEquip.innerText = "EQUIP (WRONG CLASS)";
  } else {
    btnEquip.disabled = false;
    btnEquip.innerText = "EQUIP NOW";
  }
  document.getElementById('reward-modal').classList.remove('hidden');
  document.getElementById('reward-modal').classList.add('flex');
}
function renderShipyard(totalCargo) {
  let html = `
             <div class="flex justify-between items-center mb-6 border-b-2 border-black pb-2">
                 <h3 class="text-3xl font-bold uppercase">SHIP SHOWROOM</h3>
                 <button class="btn !w-auto !mb-0 !py-2 !px-4 !text-xl" onclick="setLocalView('menu')">◀ BACK</button>
             </div>
             <div id="shipyard-container" class="overflow-y-auto pb-8 space-y-4">`;
  for (const [shipName, shipData] of Object.entries(shipHulls)) {
    if (shipName === player.ship.hull) continue;
    if (currentPoi && currentPoi.shipInventory && currentPoi.shipInventory.length > 0) {
      if (!currentPoi.shipInventory.includes(shipName)) continue;
    }
    const purchase = rules.previewShip(player, shipName);
    const netCost = purchase.cost;
    const disableReason = purchase.error;
    let btnDisabled = disableReason !== "" ? "disabled" : "";
    let btnText = netCost > 0 ? `BUY ${netCost.toLocaleString()} CR` : `+${Math.abs(netCost).toLocaleString()} CR`;
    let errorHtml = disableReason ? `<div class="text-red-500 font-bold text-[10px] uppercase text-right w-full mt-1">${disableReason}</div>` : '';
    const curHullData = shipHulls[player.ship.hull];
    let diffs = [];
    let hullDiff = shipData.baseHull - curHullData.baseHull;
    if (hullDiff !== 0) {
      let color = hullDiff > 0 ? 'text-green-600' : 'text-red-600';
      let sign = hullDiff > 0 ? '+' : '';
      diffs.push(`<span class="${color} font-bold">${sign}${hullDiff} HULL</span>`);
    }
    let wtDiff = (shipData.weight || 0) - (curHullData.weight || 0);
    if (wtDiff !== 0) {
      let color = wtDiff < 0 ? 'text-green-600' : 'text-red-600';
      let sign = wtDiff > 0 ? '+' : '';
      diffs.push(`<span class="${color} font-bold">${sign}${wtDiff} WT</span>`);
    }
    const compareMults = [{
      key: 'jumpRange',
      label: 'JMP'
    }, {
      key: 'armour',
      label: 'ARM'
    }, {
      key: 'handling',
      label: 'HND'
    }, {
      key: 'firepower',
      label: 'FP'
    }, {
      key: 'accuracy',
      label: 'ACC'
    }, {
      key: 'cargo',
      label: 'CRG'
    }];
    compareMults.forEach(c => {
      let val1 = shipData.multipliers[c.key] !== undefined ? shipData.multipliers[c.key] : 1;
      let val2 = curHullData.multipliers[c.key] !== undefined ? curHullData.multipliers[c.key] : 1;
      let diff = val1 - val2;
      if (Math.abs(diff) > 0.01) {
        let color = diff > 0 ? 'text-green-600' : 'text-red-600';
        let sign = diff > 0 ? '+' : '';
        diffs.push(`<span class="${color} font-bold">${sign}${(Math.round(diff * 10) / 10).toFixed(1)}x ${c.label}</span>`);
      }
    });
    let diffHtml = diffs.length > 0 ? `[ ${diffs.join(' | ')} ]` : `<span class="text-gray-400 font-bold">(+0)</span>`;
    const getM = k => shipData.multipliers[k] !== undefined ? shipData.multipliers[k] : 1;
    let statString = `Hull: ${shipData.baseHull} | Wt: ${shipData.weight || 0} | Jmp: x${getM('jumpRange')} | Arm: x${getM('armour')} | Hnd: x${getM('handling')} | FP: x${getM('firepower')} | Acc: x${getM('accuracy')} | Crg: x${getM('cargo')}`;
    html += `<div class="flex justify-between items-center border-2 border-black bg-white p-2">
                     <div class="flex items-center gap-4">
                         <div class="w-20 h-20 shrink-0 border-2 border-black bg-gray-100 flex items-center justify-center overflow-hidden">
                             <img src="assets/${shipData.image}" class="w-full h-full object-cover" onerror="this.onerror=null; this.src='assets/default.png';">
                         </div>
                         <div>
                             <div class="font-bold text-xl uppercase">${shipData.name}</div>
                             <div class="text-sm italic text-gray-600 mb-1">Class: ${shipData.size} | Base Price: ${shipPrice.toLocaleString()} CR</div>
                             <div class="text-xs text-gray-800 mt-1">
                                 <span class="font-bold">${statString}</span> <br> ${diffHtml}
                             </div>
                         </div>
                     </div>
                     <div class="flex flex-col items-end">
                         <button class="btn !w-auto !py-2 !px-4 !mb-0" onclick="buyShip('${shipName.replace(/'/g, "\\'")}', ${netCost})" ${btnDisabled}>
                             ${btnText}
                         </button>
                         ${errorHtml}
                     </div>
                 </div>`;
  }
  html += `</div>`;
  return html;
}
function updateShipTabUI(totalCargo) {
  const stats = getShipStats(player.ship);
  const hullData = shipHulls[player.ship.hull];
  const imageFile = hullData.image || 'default.png';
  document.getElementById('ui-ship-image-container').innerHTML = `<img src="assets/${imageFile}" alt="Ship" class="w-full h-full object-cover" onerror="this.onerror=null; this.src='assets/default.png';">`;
  document.getElementById('ui-ship-name').innerText = hullData.name;
  document.getElementById('ui-ship-desc').innerText = hullData.description;
  document.getElementById('ui-stat-size').innerText = hullData.size;
  if (player.ship.currentHull === undefined) player.ship.currentHull = stats.maxHull;
  document.getElementById('ui-stat-hull').innerText = `${player.ship.currentHull} / ${stats.maxHull}`;
  document.getElementById('ui-stat-jump').innerText = stats.jumpRange;
  document.getElementById('ui-stat-armour').innerText = stats.armour;
  document.getElementById('ui-stat-handling').innerText = stats.handling;
  document.getElementById('ui-stat-firepower').innerText = stats.firepower;
  document.getElementById('ui-stat-accuracy').innerText = stats.accuracy;
  document.getElementById('ui-stat-weight-total').innerText = stats.chassisWeight + stats.equipmentWeight;
  document.getElementById('ship-cargo-current').innerText = totalCargo;
  document.getElementById('ship-cargo-total').innerText = stats.cargoMax;
  document.getElementById('ship-cargo-total').innerText = stats.cargoMax;
  let coreHtml = '';
  const coreTypes = {
    warpDrive: "Warp",
    armour: "Armor",
    cargoBay: "Cargo",
    thrusters: "Engines",
    weapons: "Weapons"
  };
  for (const [key, label] of Object.entries(coreTypes)) {
    const itemName = player.ship.core[key];
    const itemData = itemName ? equipment[key][itemName] : null;
    let displayValue = `<span class="italic text-gray-500">EMPTY</span>`;
    if (itemData) {
      let statText = "";
      if (key === 'weapons') {
        statText = `${itemData.firepower || 0}/${itemData.accuracy || 0}`;
      } else {
        statText = itemData.baseValue !== undefined ? itemData.baseValue : 0;
      }
      displayValue = `${itemData.name} (${statText}) <span class="text-sm text-gray-500 font-normal ml-1">[Wt:${itemData.weight || 1}]</span>`;
    }
    coreHtml += `
                <div class="flex justify-between border-b-2 border-gray-200 py-2">
                    <span class="text-gray-500">${label}</span>
                    <span class="text-right">${displayValue}</span>
                </div>`;
  }
  document.getElementById('ui-core-slots').innerHTML = coreHtml;
  let modHtml = '';
  for (let i = 0; i < hullData.modularSlots; i++) {
    const itemName = player.ship.modules[i];
    const itemData = itemName ? equipment.modules[itemName] : null;
    let displayValue = `<span class="italic text-gray-500">EMPTY SLOT</span>`;
    if (itemData) {
      displayValue = `${itemData.name} (+${itemData.flatBonus} ${itemData.stat}) <span class="text-sm text-gray-500 font-normal ml-1">[Wt:${itemData.weight || 1}]</span>`;
    }
    modHtml += `
                <div class="flex justify-between border-b-2 border-gray-200 py-2">
                    <span class="text-gray-500">Slot ${i + 1}</span>
                    <span class="text-right">${displayValue}</span>
                </div>`;
  }
  document.getElementById('ui-mod-slots').innerHTML = modHtml || '<p class="text-gray-500 italic">No modular slots available.</p>';
  let cl = '';
  for (const [itemName, q] of Object.entries(player.cargo)) {
    if (q > 0) cl += `<div class="flex justify-between border-b border-gray-300 py-1"><span>${itemName}</span><span>${q}</span></div>`;
  }
  document.getElementById('cargo-list').innerHTML = cl || '<p class="text-gray-500 italic">Empty.</p>';
}
function calculateNetWorth() {
  let total = player.credits || 0;
  const hullData = shipHulls[player.ship.hull];
  if (hullData) total += hullData.price || 1000;
  const coreTypes = {
    warpDrive: "warpDrive",
    armour: "armour",
    cargoBay: "cargoBay",
    thrusters: "thrusters",
    weapons: "weapons"
  };
  for (const [key, cat] of Object.entries(coreTypes)) {
    const itemName = player.ship.core[key];
    if (itemName && equipment[cat] && equipment[cat][itemName]) {
      total += equipment[cat][itemName].price || 100;
    }
  }
  if (player.ship.modules) {
    player.ship.modules.forEach(modName => {
      if (modName && equipment.modules && equipment.modules[modName]) {
        total += equipment.modules[modName].price || 100;
      }
    });
  }
  for (const [itemName, qty] of Object.entries(player.cargo)) {
    if (qty > 0 && commodities[itemName]) {
      total += commodities[itemName].basePrice * qty;
    }
  }
  return total;
}
function renderPlayerTab() {
  const netWorth = calculateNetWorth();
  const getCost = skill => Math.pow(2, Math.floor(skill / 10));
  const pilCost = getCost(player.skills.piloting);
  const wepCost = getCost(player.skills.weapon);
  const engCost = getCost(player.skills.engineer);
  const chmCost = getCost(player.skills.charm);
  const currentXp = player.xp || 0;
  const pilDisabled = currentXp < pilCost ? "disabled" : "";
  const wepDisabled = currentXp < wepCost ? "disabled" : "";
  const engDisabled = currentXp < engCost ? "disabled" : "";
  const chmDisabled = currentXp < chmCost ? "disabled" : "";
  let html = `
                 <div class="mb-8 border-b-4 border-black pb-4 flex flex-col gap-2">
                     <div class="flex items-baseline gap-3">
                         <div class="text-xl italic text-gray-500 uppercase">Net Worth:</div>
                         <div class="text-2xl font-bold">${netWorth.toLocaleString()} CR</div>
                     </div>
                     <div class="flex items-baseline gap-3">
                         <div class="text-xl italic text-gray-500 uppercase">Total XP:</div>
                         <div class="text-2xl font-bold text-blue-600">${currentXp.toLocaleString()}</div>
                     </div>
                 </div>

                 <div class="max-w-md">
                     <h3 class="text-2xl font-bold uppercase bg-black text-white p-2 mb-4">Pilot Skills</h3>
                     <div class="space-y-3 text-xl font-bold uppercase bg-gray-50 p-4 border-2 border-black">

                         <div class="flex justify-between items-center border-b border-gray-300 pb-2">
                             <span class="text-gray-600">Piloting</span>
                             <div class="flex items-center gap-4">
                                 <span>${player.skills.piloting}</span>
                                 <button class="btn !w-auto !py-1 !px-3 !mb-0 !text-sm" onclick="upgradeSkill('piloting')" ${pilDisabled}>[${pilCost} XP]</button>
                             </div>
                         </div>

                         <div class="flex justify-between items-center border-b border-gray-300 pb-2">
                             <span class="text-gray-600">Weaponry</span>
                             <div class="flex items-center gap-4">
                                 <span>${player.skills.weapon}</span>
                                 <button class="btn !w-auto !py-1 !px-3 !mb-0 !text-sm" onclick="upgradeSkill('weapon')" ${wepDisabled}>[${wepCost} XP]</button>
                             </div>
                         </div>

                         <div class="flex justify-between items-center border-b border-gray-300 pb-2">
                             <span class="text-gray-600">Engineering</span>
                             <div class="flex items-center gap-4">
                                 <span>${player.skills.engineer}</span>
                                 <button class="btn !w-auto !py-1 !px-3 !mb-0 !text-sm" onclick="upgradeSkill('engineer')" ${engDisabled}>[${engCost} XP]</button>
                             </div>
                         </div>

                         <div class="flex justify-between items-center">
                             <span class="text-gray-600">Charm</span>
                             <div class="flex items-center gap-4">
                                 <span>${player.skills.charm}</span>
                                 <button class="btn !w-auto !py-1 !px-3 !mb-0 !text-sm" onclick="upgradeSkill('charm')" ${chmDisabled}>[${chmCost} XP]</button>
                             </div>
                         </div>

                     </div>
                 </div>
             `;
  document.getElementById('tab-player').innerHTML = html;
}
function renderNPCButtons() {
  let html = '';
  spawnedNPCs.forEach(npc => {
    let imageFile = npc.shipImage;
    if (!imageFile) {
      const hullConfig = shipHulls[npc.shipType] || {};
      imageFile = hullConfig.image || 'default.png';
    }
    const imagePath = `assets/${imageFile}`;
    const hasEncounter = npc.encounter && npc.encounter !== 'undefined' && npc.encounter !== '';
    let onClickAction = "";
    let disabledState = "";
    if (npc.isHostile && !hasEncounter) {
      onClickAction = `onclick="currentEncounterDisplayName = '${npc.name.replace(/'/g, "\\'")}'; startCombat();"`;
    } else if (hasEncounter) {
      onClickAction = `onclick="startEncounter('${npc.encounter}', '${npc.name.replace(/'/g, "\\'")}', '${npc.image || ''}')"`;
    } else {
      disabledState = "disabled";
    }
    const isTarget = player.activeBounty && npc.name === player.activeBounty.targetName && currentSystem.id === player.activeBounty.targetSysId;
    const targetClasses = isTarget ? "!border-blue-600 !bg-blue-50 shadow-[0_0_15px_rgba(37,99,235,0.3)]" : "";
    const textHighlight = isTarget ? "text-blue-700" : "";
    html += `
                 <button class="btn !p-2 ${targetClasses}" ${onClickAction} ${disabledState}>
                     <div class="flex items-center gap-4 text-left">
                         <div class="w-16 h-16 shrink-0 border-2 border-black bg-gray-100 flex items-center justify-center overflow-hidden">
                             <img src="${imagePath}" alt="${npc.shipType}" class="w-full h-full object-cover" onerror="this.onerror=null; this.src='assets/default.png';">
                         </div>
                         <div>
                             <div class="text-2xl leading-none mb-1 ${textHighlight}">${npc.name.toUpperCase()}</div>
                             <div class="text-lg text-gray-600">${npc.shipType.toUpperCase()}</div>
                         </div>
                     </div>
                 </button>`;
  });
  return html;
}
function showStatDetails(statName) {
  const stats = getShipStats(player.ship);
  let title = "";
  let html = "";
  if (statName === 'hull') {
    title = "Integrity";
    html = `<div class="flex justify-between text-gray-600"><span>Base Chassis:</span><span>${stats.baseHull}</span></div>
                         <div class="flex justify-between text-gray-600"><span>Engineering Skill:</span><span>+${stats.bonusHull}</span></div>
                         <div class="flex justify-between font-bold border-t-2 border-black mt-2 pt-2"><span>Max Integrity:</span><span>${stats.maxHull}</span></div>`;
  } else if (statName === 'jump') {
    title = "Jump Range";
    const eq = equipment.warpDrive[player.ship.core.warpDrive];
    let htmlBreakdown = eq ? `<div class="flex justify-between text-gray-600"><span>${eq.name}:</span><span>${eq.baseValue} ly</span></div>` : `<div class="flex justify-between text-gray-600"><span>No Warp Drive:</span><span>0 ly</span></div>`;
    player.ship.modules.forEach(mName => {
      const m = equipment.modules[mName];
      if (m && m.stat === 'jumpRange') htmlBreakdown += `<div class="flex justify-between text-gray-600"><span>${m.name}:</span><span>+${m.flatBonus} ly</span></div>`;
    });
    html = `${htmlBreakdown}
                         <div class="flex justify-between text-gray-600"><span>Chassis Multiplier:</span><span>x${stats.multJump}</span></div>
                         <div class="flex justify-between font-bold border-t-2 border-black mt-2 pt-2"><span>Total Range:</span><span>${stats.jumpRange} ly</span></div>`;
  } else if (statName === 'armour') {
    title = "Armour";
    const eq = equipment.armour[player.ship.core.armour];
    let htmlBreakdown = eq ? `<div class="flex justify-between text-gray-600"><span>${eq.name}:</span><span>${eq.baseValue}</span></div>` : `<div class="flex justify-between text-gray-600"><span>No Armour:</span><span>0</span></div>`;
    player.ship.modules.forEach(mName => {
      const m = equipment.modules[mName];
      if (m && m.stat === 'armour') htmlBreakdown += `<div class="flex justify-between text-gray-600"><span>${m.name}:</span><span>+${m.flatBonus}</span></div>`;
    });
    html = `${htmlBreakdown}
                         <div class="flex justify-between text-gray-600"><span>Chassis Multiplier:</span><span>x${stats.multArmour}</span></div>
                         <div class="flex justify-between font-bold border-t-2 border-black mt-2 pt-2"><span>Total Armour:</span><span>${stats.armour}</span></div>`;
  } else if (statName === 'handling') {
    title = "Handling";
    const totalMass = stats.chassisWeight + stats.equipmentWeight;
    const eq = equipment.thrusters[player.ship.core.thrusters];
    let htmlBreakdown = eq ? `<div class="flex justify-between text-gray-600"><span>${eq.name}:</span><span>${eq.baseValue}</span></div>` : `<div class="flex justify-between text-gray-600"><span>No Thrusters:</span><span>0</span></div>`;
    player.ship.modules.forEach(mName => {
      const m = equipment.modules[mName];
      if (m && m.stat === 'handling') htmlBreakdown += `<div class="flex justify-between text-gray-600"><span>${m.name}:</span><span>+${m.flatBonus}</span></div>`;
    });
    htmlBreakdown += `<div class="flex justify-between text-gray-600"><span>Engineering Skill:</span><span>+${stats.bonusEng}</span></div>`;
    const netThrust = stats.baseHandling + stats.bonusEng - totalMass;
    html = `${htmlBreakdown}
                         <div class="flex justify-between text-red-600"><span>Ship Mass:</span><span>-${totalMass}</span></div>
                         <div class="flex justify-between text-gray-600"><span>Net Thrust:</span><span>${netThrust}</span></div>
                         <div class="flex justify-between text-gray-600"><span>Chassis Multiplier:</span><span>x${stats.multHandling}</span></div>
                         <div class="flex justify-between font-bold border-t-2 border-black mt-2 pt-2"><span>Total Handling:</span><span>${stats.handling}</span></div>`;
  } else if (statName === 'firepower') {
    title = "Firepower";
    const eq = equipment.weapons[player.ship.core.weapons];
    let htmlBreakdown = eq ? `<div class="flex justify-between text-gray-600"><span>${eq.name}:</span><span>${eq.firepower}</span></div>` : `<div class="flex justify-between text-gray-600"><span>No Weapon:</span><span>0</span></div>`;
    player.ship.modules.forEach(mName => {
      const m = equipment.modules[mName];
      if (m && m.stat === 'firepower') htmlBreakdown += `<div class="flex justify-between text-gray-600"><span>${m.name}:</span><span>+${m.flatBonus}</span></div>`;
    });
    htmlBreakdown += `<div class="flex justify-between text-gray-600"><span>Engineering Skill:</span><span>+${stats.bonusEng}</span></div>`;
    html = `${htmlBreakdown}
                         <div class="flex justify-between text-gray-600"><span>Chassis Multiplier:</span><span>x${stats.multFirepower}</span></div>
                         <div class="flex justify-between font-bold border-t-2 border-black mt-2 pt-2"><span>Total Firepower:</span><span>${stats.firepower}</span></div>`;
  } else if (statName === 'accuracy') {
    title = "Accuracy";
    const eq = equipment.weapons[player.ship.core.weapons];
    let htmlBreakdown = eq ? `<div class="flex justify-between text-gray-600"><span>${eq.name}:</span><span>${eq.accuracy}</span></div>` : `<div class="flex justify-between text-gray-600"><span>No Weapon:</span><span>0</span></div>`;
    player.ship.modules.forEach(mName => {
      const m = equipment.modules[mName];
      if (m && m.stat === 'accuracy') htmlBreakdown += `<div class="flex justify-between text-gray-600"><span>${m.name}:</span><span>+${m.flatBonus}</span></div>`;
    });
    htmlBreakdown += `<div class="flex justify-between text-gray-600"><span>Engineering Skill:</span><span>+${stats.bonusEng}</span></div>`;
    html = `${htmlBreakdown}
                         <div class="flex justify-between text-gray-600"><span>Chassis Multiplier:</span><span>x${stats.multAccuracy}</span></div>
                         <div class="flex justify-between font-bold border-t-2 border-black mt-2 pt-2"><span>Total Accuracy:</span><span>${stats.accuracy}</span></div>`;
  } else if (statName === 'weight') {
    title = "Total Mass";
    html = `<div class="flex justify-between text-gray-600"><span>Chassis Weight:</span><span>${stats.chassisWeight}</span></div>
                         <div class="flex justify-between text-gray-600"><span>Equipment Weight:</span><span>+${stats.equipmentWeight}</span></div>
                         <div class="flex justify-between font-bold border-t-2 border-black mt-2 pt-2"><span>Total Mass:</span><span>${stats.chassisWeight + stats.equipmentWeight}</span></div>`;
  } else if (statName === 'cargo') {
    title = "Cargo Capacity";
    const eq = equipment.cargoBay[player.ship.core.cargoBay];
    let htmlBreakdown = eq ? `<div class="flex justify-between text-gray-600"><span>${eq.name}:</span><span>${eq.baseValue}</span></div>` : `<div class="flex justify-between text-gray-600"><span>No Cargo Bay:</span><span>0</span></div>`;
    player.ship.modules.forEach(mName => {
      const m = equipment.modules[mName];
      if (m && m.stat === 'cargo') htmlBreakdown += `<div class="flex justify-between text-gray-600"><span>${m.name}:</span><span>+${m.flatBonus}</span></div>`;
    });
    html = `${htmlBreakdown}
                         <div class="flex justify-between text-gray-600"><span>Chassis Multiplier:</span><span>x${stats.multCargo}</span></div>
                         <div class="flex justify-between font-bold border-t-2 border-black mt-2 pt-2"><span>Max Capacity:</span><span>${stats.cargoMax}</span></div>`;
  }
  document.getElementById('stat-modal-title').innerText = title;
  document.getElementById('stat-modal-desc').innerHTML = html;
  const modal = document.getElementById('stat-modal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}
function closeStatModal() {
  const modal = document.getElementById('stat-modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}
function showHelpScreen() {
  const helpContainer = document.getElementById('help-content-container');
  if (helpContainer && typeof helpDatabase !== 'undefined') {
    let helpHtml = '';
    helpDatabase.forEach(item => {
      helpHtml += `<p><strong>${item.title}:</strong><br>${item.text}</p>`;
    });
    helpContainer.innerHTML = helpHtml;
  }
  document.getElementById('help-modal').classList.remove('hidden');
  document.getElementById('help-modal').classList.add('flex');
}
function closeHelpScreen() {
  document.getElementById('help-modal').classList.add('hidden');
  document.getElementById('help-modal').classList.remove('flex');
}
function renderCombatControls() {
  const finished = combatStatus !== 'active';
  document.getElementById('battle-commands').classList.toggle('hidden', finished);
  const button = document.getElementById('battle-continue');
  button.classList.toggle('hidden', !finished);
  button.innerText = combatStatus === 'lost' ? 'GAME OVER' : combatStatus === 'escaped' ? 'ESCAPE TO SAFETY' : 'CONTINUE';
  button.onclick = continueCombat;
  document.getElementById('battle-adv-player').style.height = Math.min(100, playerAdvantage * 33.33) + '%';
  document.getElementById('battle-adv-enemy').style.height = Math.min(100, enemyAdvantage * 33.33) + '%';
  if (combatStatus === 'won') document.getElementById('battle-img-enemy').src = 'assets/kaboom.png';
  if (combatStatus === 'lost') document.getElementById('battle-img-player').src = 'assets/kaboom.png';
}
function renderCombatScene() {
  const enemyImage = currentEnemy.shipImage || shipHulls[currentEnemy.shipType]?.image || 'default.png';
  const playerImage = shipHulls[player.ship.hull].image || 'default.png';
  document.getElementById('battle-img-player').className = 'w-24 h-24 object-contain filter drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]';
  document.getElementById('battle-img-enemy').className = 'w-24 h-24 object-contain -scale-x-100 filter drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]';
  document.getElementById('battle-img-player').src = `assets/${playerImage}`;
  document.getElementById('battle-img-enemy').src = `assets/${enemyImage}`;
  document.getElementById('battle-name-enemy').innerText = currentEnemy.name;
  const status = {
    active: 'ENGAGING',
    won: 'TARGET DESTROYED',
    lost: 'SHIP DESTROYED',
    escaped: 'ESCAPED'
  }[combatStatus];
  document.getElementById('battle-log').innerText = `> ${status}: ${currentEnemy.name} (${currentEnemy.shipType})`;
  renderCombatControls();
  updateBattleUI();
}
function renderCombatRound(action, round) {
  const log = document.getElementById('battle-log');
  log.innerHTML = `
        <div class="flex justify-between w-full px-4 mb-2 border-b border-gray-700 pb-2 bg-gray-900">
            <span class="text-blue-400 font-bold uppercase">&gt; ${action}</span>
            <span class="text-red-400 font-bold uppercase">${round.enemyAction} &lt;</span>
        </div>
        <div class="text-white my-1 bg-gray-800 p-2 rounded">
            <div>[SYS] Player Target: ${round.pActiveStat} | Rolled: ${round.pRoll} | Successes: ${round.pSuccesses}</div>
            <div>[SYS] Enemy Target: ${round.eActiveStat} | Rolled: ${round.eRoll} | Successes: ${round.eSuccesses}</div>
        </div>`;
  if (round.winner === 'player') {
    log.innerHTML += '<div class="text-green-400">&gt; YOU WON THE EXCHANGE!</div>';
    if (round.damageToEnemy) log.innerHTML += `<div class="text-blue-400">&gt; DIRECT HIT! Dealt ${round.damageToEnemy} damage. (Advantage Retained)</div>`;else if (round.escaped) log.innerHTML += '<div class="text-yellow-400">&gt; ESCAPE VELOCITY REACHED. JUMPING CLEAR!</div>';else log.innerHTML += `<div class="text-blue-400">&gt; ${action === 'flee' ? `EVASION PROGRESSING. Creating distance... (Margin: ${round.successMargin}/6)` : 'PERFECT MANOEUVRE. Superior positioning secured.'} (+Advantage)</div>`;
  } else {
    log.innerHTML += '<div class="text-red-400">&gt; ENEMY WON THE EXCHANGE! (Lost Advantage)</div>';
    if (round.damageToPlayer) log.innerHTML += `<div class="text-red-500 font-bold bg-red-900 bg-opacity-30">&gt; WARNING: HULL HIT${action === 'flee' ? ' WHILE ATTEMPTING EVASION' : ''}! Took ${round.damageToPlayer} damage.</div>`;else log.innerHTML += `<div class="text-red-400">&gt; ${action === 'flee' ? 'ENEMY BLOCKED YOUR ESCAPE VECTOR.' : 'ENEMY OUT-MANOEUVRED YOU.'}</div>`;
  }
  for (const [id, damage] of [['battle-img-enemy', round.damageToEnemy], ['battle-img-player', round.damageToPlayer]]) {
    if (damage) {
      const image = document.getElementById(id);
      image.classList.remove('shake-animation');
      void image.offsetWidth;
      image.classList.add('shake-animation');
    }
  }
  if (combatStatus === 'won') log.innerHTML += `<div class="text-yellow-400 font-bold text-xl mt-2">&gt; TARGET DESTROYED. [+${currentEnemy.xpValue || 0} XP]</div>`;
  if (combatStatus === 'lost') log.innerHTML += '<div class="text-red-600 font-bold text-2xl mt-2 bg-black p-2">&gt; CRITICAL HULL FAILURE. SHIP DESTROYED.</div>';
  log.scrollTop = log.scrollHeight;
}
