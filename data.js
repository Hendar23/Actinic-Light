// ==========================================
// COMMODITIES & BASELINE PRICES
// ==========================================
const commodities = {
    "Water": { basePrice: 10 },
    "Wheat": { basePrice: 20 },
    "Meat": { basePrice: 40 },
    "Packaged Food": { basePrice: 50 },
    "Copper Ore": { basePrice: 30 },
    "Iron Ore": { basePrice: 35 },
    "Silicon Ore": { basePrice: 40 },
    "Gold Ore": { basePrice: 80 },
    "Platinum Ore": { basePrice: 100 },
    "Copper Bars": { basePrice: 70 },
    "Iron Bars": { basePrice: 80 },
    "Silicon Wafers": { basePrice: 90 },
    "Gold Bars": { basePrice: 200 },
    "Platinum Bars": { basePrice: 250 },
    "Machine Parts": { basePrice: 150 },
    "Microchips": { basePrice: 300 }
};

// ==========================================
// STATION TYPES & SUPPLY/DEMAND LOGIC
// ==========================================
const stationTypes = {
    "Trade Hub": {
        produces: ["Water", "Wheat", "Meat", "Packaged Food", "Copper Ore", "Iron Ore", "Silicon Ore", "Gold Ore", "Platinum Ore", "Copper Bars", "Iron Bars", "Silicon Wafers", "Gold Bars", "Platinum Bars", "Machine Parts", "Microchips"],
        consumes: { "Water": "TradeHub", "Wheat": "TradeHub", "Meat": "TradeHub", "Packaged Food": "TradeHub", "Copper Ore": "TradeHub", "Iron Ore": "TradeHub", "Silicon Ore": "TradeHub", "Gold Ore": "TradeHub", "Platinum Ore": "TradeHub", "Copper Bars": "TradeHub", "Iron Bars": "TradeHub", "Silicon Wafers": "TradeHub", "Gold Bars": "TradeHub", "Platinum Bars": "TradeHub", "Machine Parts": "TradeHub", "Microchips": "TradeHub" }
    },
    "Wheat Farm": {
        produces: ["Wheat"],
        consumes: { "Water": "High", "Machine Parts": "Low" }
    },
    "Ice Mine": {
        produces: ["Water"],
        consumes: { "Machine Parts": "Low" }
    },
    "Wheat Processing Plant": {
        produces: ["Packaged Food"],
        consumes: { "Wheat": "High", "Machine Parts": "Low" }
    },
    "Livestock Farm": {
        produces: ["Meat"],
        consumes: { "Water": "High", "Wheat": "High", "Machine Parts": "Low" }
    },
    "Meat Processing Plant": {
        produces: ["Packaged Food"],
        consumes: { "Meat": "High", "Machine Parts": "Low" }
    },
    "Copper Mine": {
        produces: ["Copper Ore"],
        consumes: { "Packaged Food": "Average", "Machine Parts": "Low" }
    },
    "Iron Mine": {
        produces: ["Iron Ore"],
        consumes: { "Packaged Food": "Average", "Machine Parts": "Low" }
    },
    "Platinum Mine": {
        produces: ["Platinum Ore"],
        consumes: { "Packaged Food": "Average", "Machine Parts": "Low" }
    },
    "Silicon Mine": {
        produces: ["Silicon Ore"],
        consumes: { "Packaged Food": "Average", "Machine Parts": "Low" }
    },
    "Gold Mine": {
        produces: ["Gold Ore"],
        consumes: { "Packaged Food": "Average", "Machine Parts": "Low" }
    },
    "Metal Ore Refinery": {
        produces: ["Copper Bars", "Iron Bars", "Platinum Bars", "Gold Bars"],
        consumes: { "Copper Ore": "High", "Iron Ore": "High", "Platinum Ore": "High", "Gold Ore": "High", "Packaged Food": "Average", "Machine Parts": "Low" }
    },
    "Silicon Refinery": {
        produces: ["Silicon Wafers"],
        consumes: { "Silicon Ore": "High", "Packaged Food": "Average", "Machine Parts": "Low" }
    },
    "Machine Parts Factory": {
        produces: ["Machine Parts"],
        consumes: { "Copper Bars": "Average", "Iron Bars": "High", "Platinum Bars": "Average", "Packaged Food": "Average" }
    },
    "Chip Fab": {
        produces: ["Microchips"],
        consumes: { "Silicon Wafers": "High", "Gold Bars": "High", "Machine Parts": "Low", "Packaged Food": "Average" }
    }
};

// ==========================================
// GALAXY MAP (10 Systems)
// ==========================================
const galaxy = [
    { id: 0, name: "Sol", x: 483, y: 516, pois: [{ name: "Earth Spacedock", type: "Trade Hub", description: "A massive central trading hub. Everything is available, but convenience comes at a high price." }, { name: "Lunar Ice Extractors", type: "Ice Mine", description: "Vast machines evaporate ice into water" }, { name: "Martian Wheat Farm", type: "Wheat Farm" }] },
    { id: 1, name: "Alpha Centauri", x: 520, y: 480, pois: [{ name: "Centauri Pastures", type: "Livestock Farm" }, { name: "Alpha Meats", type: "Meat Processing Plant" }] },
    { id: 2, name: "Sirius", x: 580, y: 550, pois: [{ name: "Sirius Iron Works", type: "Iron Mine" }, { name: "Dog Star Copper", type: "Copper Mine" }] },
    { id: 3, name: "Vega", x: 420, y: 410, pois: [{ name: "Vega Smelting", type: "Metal Ore Refinery" }, { name: "Lyra Machine Co.", type: "Machine Parts Factory" }] },
    { id: 4, name: "Rigel", x: 350, y: 450, pois: [{ name: "Rigel Silicates", type: "Silicon Mine" }, { name: "Orion Gold", type: "Gold Mine" }] },
    { id: 5, name: "Betelgeuse", x: 380, y: 580, pois: [{ name: "Red Supergiant Wafers", type: "Silicon Refinery" }, { name: "Betelgeuse Exchange", type: "Trade Hub" }] },
    { id: 6, name: "Arcturus", x: 650, y: 490, pois: [{ name: "Arcturan Micro", type: "Chip Fab" }, { name: "Bootes Food Corp", type: "Wheat Processing Plant" }] },
    { id: 7, name: "Altair", x: 620, y: 620, pois: [{ name: "Altair Ice Ring", type: "Ice Mine" }, { name: "Eagle Ranch", type: "Livestock Farm" }, { name: "Altair Platinum", type: "Platinum Mine" }] },
    { id: 8, name: "Capella", x: 450, y: 350, pois: [{ name: "Capella Copper", type: "Copper Mine" }, { name: "Charioteer Smelting", type: "Metal Ore Refinery" }] },
    { id: 9, name: "Procyon", x: 550, y: 380, pois: [{ name: "Procyon Free Market", type: "Trade Hub" }, { name: "Canis Minor Parts", type: "Machine Parts Factory" }] },
    { id: 10, name: "New System", x: 1650, y: 1860, pois: [] },
    { id: 11, name: "Obvious Test System", x: 427, y: 506, pois: [{ name: "This is a Test", type: "Trade Hub", description: "Testing testing testy" }, { name: "This is also a test", type: "Ice Mine", description: "Testing the ICE!" }] }
];
