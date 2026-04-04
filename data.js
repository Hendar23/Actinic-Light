// ==========================================
// SHIPS & EQUIPMENT DATA
// ==========================================

const shipHulls = {
    "Weescow": {
        name: "Weescow",
        size: "Tiny",
        description: "A tiny two-seater runabout",
        multipliers: {
            jumpRange: 1.0,
            hull: 0.8,
            cargo: 0.8,
            handling: 1.2,
            offensive: 0.8
        },
        coreSlots: {
            warpDrive: 1,
            hullArmour: 1,
            cargoBay: 1,
            thrusters: 1,
            weapons: 1
        },
        modularSlots: 1
    },

	"Keiship": {
        name: "Keiship",
        size: "Tiny",
        description: "A tiny delivery ship",
        multipliers: {
            jumpRange: 1.0,
            hull: 0.8,
            cargo: 1.2,
            handling: 0.9,
            offensive: 0.8
        },
        coreSlots: {
            warpDrive: 1,
            hullArmour: 1,
            cargoBay: 1,
            thrusters: 1,
            weapons: 1
        },
        modularSlots: 1
    }
};

const equipment = {
    warpDrive: {
        "Civilian Drive T1": { name: "Civilian Drive T1", size: "Tiny", type: "warpDrive", baseValue: 50, description: "Standard issue civilian warp drive." },
        "Civilian Drive T2": { name: "Civilian Drive T2", size: "Tiny", type: "warpDrive", baseValue: 75, description: "Upgraded civilian warp drive." }
    },
    hullArmour: {
        "Light Plating": { name: "Light Plating", size: "Tiny", type: "hullArmour", baseValue: 10, description: "Basic hull protection." }
    },
    cargoBay: {
        "Tiny Hold": { name: "Tiny Hold", size: "Tiny", type: "cargoBay", baseValue: 5, description: "Just slightly bigger than the glove compartment." }
    },
    thrusters: {
        "Basic Maneuvering Jets": { name: "Basic Maneuvering Jets", size: "Tiny", type: "thrusters", baseValue: 10, description: "Standard thrusters." }
    },
    weapons: {
        "Pea Shooter": { name: "Pea Shooter", size: "Tiny", type: "weapons", baseValue: 5, description: "Better than nothing." }
    },
    modules: {
        "Cargo Expander I": { name: "Cargo Expander I", size: "Tiny", type: "module", stat: "cargo", flatBonus: 5, description: "Adds a little extra space." },
        "Jump Booster I": { name: "Jump Booster I", size: "Tiny", type: "module", stat: "jumpRange", flatBonus: 10, description: "Overclocks the warp drive slightly." }
    }
};

// ==========================================
// PROCEDURAL GENERATION DATA
// ==========================================

const TOTAL_ALIEN_PORTRAITS = 3; // Total number of random_alien_XXX.png images

const firstNames = [
    "Frank", "Bobby", "Aaron", "Jason", "Aria", "Jaxon", "Kael", "Lyra", "Zane", "Nova", "Orion", "Pax", "Ren", "Sera",
    "Talon", "Vex", "Wren", "Xyler", "Yara", "Zephyr", "Cassian", "Elara", "Finn", "Gael",
    "Kira", "Loki", "Mace", "Nyx", "Olin", "Poe", "Quin", "Roa", "Silas", "Tia"
];

const lastNames = [
    "Vance", "Korne", "Drex", "Farr", "Voss", "Graves", "Tark", "Zell", "Renn", "Vane",
    "Stark", "Vale", "Quinn", "Dax", "Kaelen", "Sol", "Nyx", "Cort", "Bane", "Jinn",
    "Kross", "Lenn", "Marn", "Nass", "Ordo", "Pryce", "Qel", "Rath", "Sato", "Tarn"
];

const taxiPickupLines = [
    "I'm late, let's go!",
    "You the pilot? Hurry up, time is credits.",
    "Finally. Get me out of this dump.",
    "Let's get moving, spacer.",
    "Dude the gig starts soon! Lets hussle!"
];

const taxiDropoffLines = [
    "Hey man, let's hurry. I got an important meeting to get to... oh, we're here? Thanks!",
    "Thanks for the ride, spacer! Kept the hull in one piece.",
    "Finally! I thought I'd never get out of that bucket.",
    "Smooth flying dude.",
    "Not the worst flight I've had. Here are your credits.",
    "Praise the stars we made it. Transferring your funds now."
];

// ==========================================
// QUESTS & TASKS
// ==========================================
const quests = {
    "meet_frank": {
        title: "Speak to Frank",
        description: "Find Frank at Sol Taxis in the Sol system and speak to him about work.",
        targetSystemId: 0, // Sol's ID is 0
	targetPoiName: "Sol Taxis" 
    }
};

// ==========================================
// INTERACTIONS & ENCOUNTERS
// ==========================================
const interactions = {
    "Bartender Milo": {
        image: "portrait001.png",
        dialogue: {
            "start": {
                text: "\"What're you drinking, spacer?\"</i>",
                options: [
                    { text: "Got any work?", nextNode: "work", hidesOnFlag: "knows_frank" },
                    { text: "About that job...", nextNode: "work2", requiresFlag: "knows_frank" },
                    { text: "Whatever is on tap.", nextNode: "drink", credits: -1 },
                    { text: "[Leave]", nextNode: "leave" }
                ]
            },
            "cash": {
                text: "He rolls his eyes and tosses a cred-chip onto the bar.<br><br><i>\"I guess you are just testing the game, so why not? Here you go.\"</i>",
                options: [
                    { text: "Thanks! [Leave]", nextNode: "leave", credits: 1000 }
                ]
            },
            "drink": {
                text: "He pours you a glowing blue liquid. It tastes like battery acid and regret.",
                options: [
                    { text: "Ugh. Thanks. [Leave]", nextNode: "leave" }
                ]
            },
            "work": {
                text: "\"Speak to Frank at Sol taxis, they are always looking for pilots.\"</i>",
                options: [
                    { text: "Thanks. [Leave]", nextNode: "leave", setFlag: "knows_frank", startTask: "meet_frank" }
                ]
            },
            "work2": {
                text: "\"Like I said, speak to Frank at Sol taxis.\"</i>",
                options: [
                    { text: "Thanks. [Leave]", nextNode: "leave" }
                ]
            }
        }
    },
    "Dispatcher Frank": {
        image: "portrait002.png",
        dialogue: {
            "start": {
                text: "<i>\"Yeah what?\"</i>",
                options: [
                    { text: "I heard you got work?", nextNode: "jobs", setFlag: "met_frank", hidesOnFlag: "met_frank", completeTask: "meet_frank" },
                    { text: "Got any taxi fares?", nextNode: "jobs", requiresFlag: "met_frank" },
                    { text: "Nevermind", nextNode: "leave" }
                ]
            },
            "jobs": {
                text: "\"Sure. Here is what we have on the board right now.\"",
                generateTaxiJobs: true,
                taxiJobCount: 3,
                taxiMaxDistance: 50,
                options: [
                    { text: "Maybe later. [Leave]", nextNode: "leave" }
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
                    { text: "Nothing. [Leave]", nextNode: "leave" },
                    { text: "Teach me The Way", nextNode: "teach_me_the_way" }
                ]
            },
            "teach_me_the_way": {
                text: "Yes, let us begin....",
                options: [
                    { text: "Thank you", nextNode: "leave" }
                ]
            }
        }
    },
    "Dispatcher Varlo": {
        image: "random_alien_002.png",
        dialogue: {
            "start": {
                text: "Greetings. May I be of assistance?",
                options: [
                    { text: "Any fares?", nextNode: "work" },
                    { text: "No thanks. [Leave]", nextNode: "leave" }
                ]
            },
            "work": {
                text: "Of course.",
                generateTaxiJobs: true,
                taxiJobCount: 5,
                taxiMaxDistance: 75,
                options: [
                    { text: "Maybe another time. [Leave]", nextNode: "leave" }
                ]
            }
        }
    }

};

// ==========================================
// COMMODITIES & BASELINE PRICES
// ==========================================
const commodities = {
    "Water": { basePrice: 10, min: 8, max: 12 },
    "Plants": { basePrice: 20, min: 16, max: 24 },
    "Meat": { basePrice: 40, min: 32, max: 48 },
    "Packaged Food": { basePrice: 50, min: 40, max: 60 },
    "Copper Ore": { basePrice: 30, min: 24, max: 36 },
    "Iron Ore": { basePrice: 35, min: 28, max: 42 },
    "Silicon Ore": { basePrice: 40, min: 32, max: 48 },
    "Gold Ore": { basePrice: 80, min: 64, max: 96 },
    "Platinum Ore": { basePrice: 100, min: 80, max: 120 },
    "Copper Bars": { basePrice: 70, min: 56, max: 84 },
    "Iron Bars": { basePrice: 80, min: 64, max: 96 },
    "Silicon Wafers": { basePrice: 90, min: 72, max: 108 },
    "Gold Bars": { basePrice: 200, min: 160, max: 240 },
    "Platinum Bars": { basePrice: 250, min: 200, max: 300 },
    "Machine Parts": { basePrice: 150, min: 120, max: 180 },
    "Microchips": { basePrice: 300, min: 240, max: 360 }
};

// ==========================================
// STATION TYPES
// ==========================================
const stationTypes = {
    "Outpost": {
        description: "An isolated waystation operating on minimal power."
    },
    "Trade Hub": {
        defaultImage: "station003.png",
        description: "A massive central trading hub.",
        produces: ["Water", "Plants", "Meat", "Packaged Food", "Copper Ore", "Iron Ore", "Silicon Ore", "Gold Ore", "Platinum Ore", "Copper Bars", "Iron Bars", "Silicon Wafers", "Gold Bars", "Platinum Bars", "Machine Parts", "Microchips"],
        consumes: { "Water": "TradeHub", "Plants": "TradeHub", "Meat": "TradeHub", "Packaged Food": "TradeHub", "Copper Ore": "TradeHub", "Iron Ore": "TradeHub", "Silicon Ore": "TradeHub", "Gold Ore": "TradeHub", "Platinum Ore": "TradeHub", "Copper Bars": "TradeHub", "Iron Bars": "TradeHub", "Silicon Wafers": "TradeHub", "Gold Bars": "TradeHub", "Platinum Bars": "TradeHub", "Machine Parts": "TradeHub", "Microchips": "TradeHub" }
    },
    "Plant Farm": {
	defaultImage: "station002.png",
        description: "Vast hydroponic bays grow all manner of crops",
        produces: ["Plants"],
        consumes: {"Packaged Food": "Low", "Water": "High", "Machine Parts": "Low" }
    },
    "Ice Mine": {
	defaultImage: "mine002.png",
        description: "Chunks of asteroid are superheated to release precious water vapour.",
        produces: ["Water"],
        consumes: {"Packaged Food": "Low", "Machine Parts": "Low" }
    },
    "Plant Processing Facility": {
        description: "Sterile corridors hum with food packaging machinery.",
        produces: ["Packaged Food"],
        consumes: { "Plants": "High", "Machine Parts": "Low" }
    },
    "Livestock Farm": {
        description: "Large biological containment bays. Smells terrible.",
        produces: ["Meat"],
        consumes: { "Packaged Food": "Low", "Water": "High", "Plants": "High", "Machine Parts": "Low" }
    },
    "Meat Processing Plant": {
        description: "You don't want to know how the sausage is made.",
        produces: ["Packaged Food"],
        consumes: { "Meat": "High", "Machine Parts": "Low" }
    },
    "Copper Mine": {
        description: "Vast machinery grinds at raw copper veins.",
        produces: ["Copper Ore"],
        consumes: { "Packaged Food": "Low", "Machine Parts": "Low" }
    },
    "Iron Mine": {
	defaultImage: "mine001.png",
        description: "Heavy drilling equipment tears iron ore from a tethered asteroid.",
        produces: ["Iron Ore"],
        consumes: { "Packaged Food": "Low", "Machine Parts": "Low" }
    },
    "Platinum Mine": {
        description: "Automated drills mine precious platinum.",
        produces: ["Platinum Ore"],
        consumes: { "Packaged Food": "Low", "Machine Parts": "Low" }
    },
    "Silicon Mine": {
        description: "Silicate dust coats every surface of this extraction facility.",
        produces: ["Silicon Ore"],
        consumes: { "Packaged Food": "Low", "Machine Parts": "Low" }
    },
    "Gold Mine": {
        description: "An asteroid facility mining gold.",
        produces: ["Gold Ore"],
        consumes: { "Packaged Food": "Low", "Machine Parts": "Low" }
    },
    "Metal Ore Refinery": {
        description: "The deafening roar of smelting arrays reverberates in the decking.",
        produces: ["Copper Bars", "Iron Bars", "Platinum Bars", "Gold Bars"],
        consumes: { "Copper Ore": "High", "Iron Ore": "High", "Platinum Ore": "High", "Gold Ore": "High", "Packaged Food": "Low", "Machine Parts": "Low" }
    },
    "Silicon Refinery": {
        description: "Intense chemical processes purify raw silicates into perfect wafers.",
        produces: ["Silicon Wafers"],
        consumes: { "Silicon Ore": "High", "Packaged Food": "Low", "Machine Parts": "Low" }
    },
    "Machine Parts Factory": {
        description: "Automated arms assemble components at blinding speed.",
        produces: ["Machine Parts"],
        consumes: { "Copper Bars": "Average", "Iron Bars": "High", "Platinum Bars": "Average", "Packaged Food": "Low" }
    },
    "Chip Fab": {
        description: "Dust-free cleanrooms manufacture high-tech circuitry.",
        produces: ["Microchips"],
        consumes: { "Silicon Wafers": "High", "Gold Bars": "High", "Machine Parts": "Low", "Packaged Food": "Low" }
    }
};

// ==========================================
// GALAXY MAP
// ==========================================
const galaxy = [
    {
        id: 0, name: "Sol", x: 492, y: 535,
        pois: [
            { name: "Earth Spaceport 01", type: "Trade Hub", image: "port001.png", encounters: ["Bartender Milo", "Brother Moo"], description: "A massive central trading hub for the planet Earth" },
            { name: "Lunar Ice Extractors", type: "Ice Mine", description: "Vast machines evaporate ice into water" },
            { name: "Martian Farm Hub", type: "Plant Farm" },
            { name: "Sol Taxis", type: "Outpost", image: "station001.png", encounters: ["Dispatcher Frank"], requiresFlag: "knows_frank", description: "Cheap but not cheerful." }
        ]
    },
    {
        id: 1, name: "Alpha Centauri", x: 516, y: 517,
        pois: [
            { name: "Centauri Pastures", type: "Livestock Farm" },
            { name: "Alpha Meats", type: "Meat Processing Plant" }
        ]
    },
    {
        id: 2, name: "Sirius", x: 580, y: 550,
        pois: [
            { name: "Sirius Iron Works", type: "Iron Mine" },
            { name: "Dog Star Copper", type: "Copper Mine" }
        ]
    },
    {
        id: 3, name: "Vega", x: 420, y: 410,
        pois: [
            { name: "Vega Smelting", type: "Metal Ore Refinery" },
            { name: "Lyra Machine Co.", type: "Machine Parts Factory" }
        ]
    },
    {
        id: 4, name: "Rigel", x: 350, y: 450,
        pois: [
            { name: "Rigel Silicates", type: "Silicon Mine" },
            { name: "Orion Gold", type: "Gold Mine" }
        ]
    },
    {
        id: 5, name: "Betelgeuse", x: 473, y: 572,
        pois: [
            { name: "Red Supergiant Wafers", type: "Silicon Refinery" },
            { name: "Betelgeuse Exchange", type: "Trade Hub" }
        ]
    },
    {
        id: 6, name: "Arcturus", x: 604, y: 458,
        pois: [
            { name: "Arcturan Micro", type: "Chip Fab" },
            { name: "Bootes Food Corp", type: "Plant Processing Facility" }
        ]
    },
    {
        id: 7, name: "Altair", x: 620, y: 620,
        pois: [
            { name: "Altair Ice Ring", type: "Ice Mine" },
            { name: "Eagle Ranch", type: "Livestock Farm" },
            { name: "Altair Platinum", type: "Platinum Mine" }
        ]
    },
    {
        id: 8, name: "Capella", x: 496, y: 421,
        pois: [
            { name: "Capella Copper", type: "Copper Mine" },
            { name: "Charioteer Smelting", type: "Metal Ore Refinery" }
        ]
    },
    {
        id: 9, name: "Procyon", x: 550, y: 380,
        pois: [
            { name: "Procyon Free Market", type: "Trade Hub" },
            { name: "Canis Minor Parts", type: "Machine Parts Factory" }
        ]
    },
    {
        id: 10, name: "New System", x: 1650, y: 1860,
        pois: [
        ]
    },
    {
        id: 11, name: "Obvious Test", x: 448, y: 538,
        pois: [
            { name: "Testhub", type: "Trade Hub" },
            { name: "This is also a test", type: "Ice Mine", encounters: ["Brother Moo"], description: "Testing the ICE!" },
            { name: "Roid Chewer 023", type: "Iron Mine" },
            { name: "Obvious Taxis", type: "Outpost", encounters: ["Dispatcher Varlo"], description: "Obvious Taxis HQ is a cheaply refurbished outpost." }
        ]
    }
];
