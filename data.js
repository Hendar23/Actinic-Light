// ==========================================
// INTERACTIONS & ENCOUNTERS
// ==========================================
const interactions = {
    "Shady Bartender": {
        image: "portrait001.png", // Will fallback to default.png if missing
        dialogue: {
            "start": {
                text: "The bartender wipes down the sticky counter with a greasy rag.<br><br><i>\"What're you drinking, spacer?\"</i>",
                options: [
                    { text: "Can you just, like, give me some money?", nextNode: "cash" },
                    { text: "Got any work?", nextNode: "work", hidesOnFlag: "knows_frank" },
                    { text: "About that job...", nextNode: "work2", requiresFlag: "knows_frank" },
                    { text: "Whatever is on tap.", nextNode: "drink", credits: -1 },
                    { text: "[Leave]", nextNode: "leave" } // 'leave' is a special keyword
                ]
            },
            "cash": {
                text: "He rolls his eyes and tosses a cred-chip onto the bar.<br><br><i>\"I guess you are just testing the game, so why not? Here you go.\"</i>",
                options: [
                    { text: "Thanks! [Leave]", nextNode: "leave", credits: +1000 }
                ]
            },
            "drink": {
                text: "He pours you a glowing blue liquid. It tastes like battery acid and regret.",
                options: [
                    { text: "Ugh. Thanks. [Leave]", nextNode: "leave" }
                ]
            },
            "work": {
                text: "He leans in close over the bar.<br><br><i>\"Speak to Frank at Sol taxis, they are always looking for drivers.\"</i>",
                options: [
                    { text: "Thanks. [Leave]", nextNode: "leave", setFlag: "knows_frank" }
                ]
            },
            "work2": {
                text: "He sighs, looking annoyed that you asked again.<br><br><i>\"Like I said, speak to Frank at Sol taxis.\"</i>",
                options: [
                    { text: "Thanks. [Leave]", nextNode: "leave"}
                ]
            }
        }
    },

"Dispatcher Frank": {
        requiresFlag: "knows_frank",
        image: "portrait002.png", 
        dialogue: {
            "start": {
                text: "The dispatchers office is cluttered and dirty. Smoke hangs in the air.<br><br><i>\"Yeah?\"</i>",
                options: [
                    { text: "Nothing. [Leave]", nextNode: "leave" } 
                ]
            }
        }
    },

"Brother Moo": {
	requiresFlag: "knows_frank",
        image: "brother_moo.png", 
        dialogue: {
            "start": {
                text: "<i>\"Greetings.\"</i>",
                options: [
                    { text: "Nothing. [Leave]", nextNode: "leave" } 
                ]
            }
        }
    }
};

// ==========================================
// COMMODITIES & BASELINE PRICES
// ==========================================
const commodities = {
    "Water": { basePrice: 10, min: 6, max: 15 },
    "Wheat": { basePrice: 20, min: 12, max: 30 },
    "Meat": { basePrice: 40, min: 24, max: 60 },
    "Packaged Food": { basePrice: 50, min: 30, max: 75 },
    "Copper Ore": { basePrice: 30, min: 18, max: 45 },
    "Iron Ore": { basePrice: 35, min: 21, max: 53 },
    "Silicon Ore": { basePrice: 40, min: 24, max: 60 },
    "Gold Ore": { basePrice: 80, min: 48, max: 120 },
    "Platinum Ore": { basePrice: 100, min: 60, max: 150 },
    "Copper Bars": { basePrice: 70, min: 42, max: 105 },
    "Iron Bars": { basePrice: 80, min: 48, max: 120 },
    "Silicon Wafers": { basePrice: 90, min: 54, max: 135 },
    "Gold Bars": { basePrice: 200, min: 120, max: 300 },
    "Platinum Bars": { basePrice: 250, min: 150, max: 375 },
    "Machine Parts": { basePrice: 150, min: 90, max: 225 },
    "Microchips": { basePrice: 300, min: 180, max: 450 }
};

// ==========================================
// STATION TYPES & SUPPLY/DEMAND LOGIC
// ==========================================
const stationTypes = {
    "Outpost": {
        // An empty station shell for hosting encounters. 
    },
    "Trade Hub": {
	defaultImage: "tradehub.png",
        produces: ["Water", "Wheat", "Meat", "Packaged Food", "Copper Ore", "Iron Ore", "Silicon Ore", "Gold Ore", "Platinum Ore", "Copper Bars", "Iron Bars", "Silicon Wafers", "Gold Bars", "Platinum Bars", "Machine Parts", "Microchips"],
        consumes: { "Water": "TradeHub", "Wheat": "TradeHub", "Meat": "TradeHub", "Packaged Food": "TradeHub", "Copper Ore": "TradeHub", "Iron Ore": "TradeHub", "Silicon Ore": "TradeHub", "Gold Ore": "TradeHub", "Platinum Ore": "TradeHub", "Copper Bars": "TradeHub", "Iron Bars": "TradeHub", "Silicon Wafers": "TradeHub", "Gold Bars": "TradeHub", "Platinum Bars": "TradeHub", "Machine Parts": "TradeHub", "Microchips": "TradeHub" }
    },
    "Wheat Farm": {
        produces: ["Wheat"],
        consumes: {"Packaged Food": "Low", "Water": "High", "Machine Parts": "Low" }
    },
    "Ice Mine": {
        produces: ["Water"],
        consumes: {"Packaged Food": "Low", "Machine Parts": "Low" }
    },
    "Wheat Processing Plant": {
        produces: ["Packaged Food"],
        consumes: { "Wheat": "High", "Machine Parts": "Low" }
    },
    "Livestock Farm": {
        produces: ["Meat"],
        consumes: { "Packaged Food": "Low", "Water": "High", "Wheat": "High", "Machine Parts": "Low" }
    },
    "Meat Processing Plant": {
        produces: ["Packaged Food"],
        consumes: { "Meat": "High", "Machine Parts": "Low" }
    },
    "Copper Mine": {
        produces: ["Copper Ore"],
        consumes: { "Packaged Food": "Low", "Machine Parts": "Low" }
    },
    "Iron Mine": {
        produces: ["Iron Ore"],
        consumes: { "Packaged Food": "Low", "Machine Parts": "Low" }
    },
    "Platinum Mine": {
        produces: ["Platinum Ore"],
        consumes: { "Packaged Food": "Low", "Machine Parts": "Low" }
    },
    "Silicon Mine": {
        produces: ["Silicon Ore"],
        consumes: { "Packaged Food": "Low", "Machine Parts": "Low" }
    },
    "Gold Mine": {
        produces: ["Gold Ore"],
        consumes: { "Packaged Food": "Low", "Machine Parts": "Low" }
    },
    "Metal Ore Refinery": {
        produces: ["Copper Bars", "Iron Bars", "Platinum Bars", "Gold Bars"],
        consumes: { "Copper Ore": "High", "Iron Ore": "High", "Platinum Ore": "High", "Gold Ore": "High", "Packaged Food": "Low", "Machine Parts": "Low" }
    },
    "Silicon Refinery": {
        produces: ["Silicon Wafers"],
        consumes: { "Silicon Ore": "High", "Packaged Food": "Low", "Machine Parts": "Low" }
    },
    "Machine Parts Factory": {
        produces: ["Machine Parts"],
        consumes: { "Copper Bars": "Average", "Iron Bars": "High", "Platinum Bars": "Average", "Packaged Food": "Low" }
    },
    "Chip Fab": {
        produces: ["Microchips"],
        consumes: { "Silicon Wafers": "High", "Gold Bars": "High", "Machine Parts": "Low", "Packaged Food": "Low" }
    }
};

// ==========================================
// GALAXY MAP
// ==========================================
const galaxy = [
    { id: 0, name: "Sol", x: 492, y: 535, pois: [{ name: "Earth Spacedock", type: "Trade Hub", encounters: ["Shady Bartender", "Brother Moo"], description: "A massive central trading hub. Everything is available, but convenience comes at a high price." }, { name: "Lunar Ice Extractors", type: "Ice Mine", description: "Vast machines evaporate ice into water" },  { name: "Martian Wheat Farm", type: "Wheat Farm" }, { name: "Sol Taxis", type: "Outpost",image: "station001.png", description: "Cheap but not cheerful.", encounters: ["Dispatcher Frank"], requiresFlag: "knows_frank" }] },
    { id: 1, name: "Alpha Centauri", x: 520, y: 480, pois: [{ name: "Centauri Pastures", type: "Livestock Farm" }, { name: "Alpha Meats", type: "Meat Processing Plant" }] },
    { id: 2, name: "Sirius", x: 580, y: 550, pois: [{ name: "Sirius Iron Works", type: "Iron Mine" }, { name: "Dog Star Copper", type: "Copper Mine" }] },
    { id: 3, name: "Vega", x: 420, y: 410, pois: [{ name: "Vega Smelting", type: "Metal Ore Refinery" }, { name: "Lyra Machine Co.", type: "Machine Parts Factory" }] },
    { id: 4, name: "Rigel", x: 350, y: 450, pois: [{ name: "Rigel Silicates", type: "Silicon Mine" }, { name: "Orion Gold", type: "Gold Mine" }] },
    { id: 5, name: "Betelgeuse", x: 455, y: 585, pois: [{ name: "Red Supergiant Wafers", type: "Silicon Refinery" }, { name: "Betelgeuse Exchange", type: "Trade Hub" }] },
    { id: 6, name: "Arcturus", x: 604, y: 458, pois: [{ name: "Arcturan Micro", type: "Chip Fab" }, { name: "Bootes Food Corp", type: "Wheat Processing Plant" }] },
    { id: 7, name: "Altair", x: 620, y: 620, pois: [{ name: "Altair Ice Ring", type: "Ice Mine" }, { name: "Eagle Ranch", type: "Livestock Farm" }, { name: "Altair Platinum", type: "Platinum Mine" }] },
    { id: 8, name: "Capella", x: 496, y: 421, pois: [{ name: "Capella Copper", type: "Copper Mine" }, { name: "Charioteer Smelting", type: "Metal Ore Refinery" }] },
    { id: 9, name: "Procyon", x: 550, y: 380, pois: [{ name: "Procyon Free Market", type: "Trade Hub" }, { name: "Canis Minor Parts", type: "Machine Parts Factory" }] },
    { id: 10, name: "New System", x: 1650, y: 1860, pois: [] },
    { id: 11, name: "Obvious Test System", x: 427, y: 506, pois: [{ name: "This is a Test", type: "Trade Hub", description: "Testing testing testy" }, { name: "This is also a test", type: "Ice Mine", description: "Testing the ICE!" }] }
];
