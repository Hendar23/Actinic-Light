// ==========================================
// NEW GAME DEFAULTS
// ==========================================
const newGameDefaults = {
    startingCredits: 10,
    startingSystemId: 0,
    startingSkills: {
        piloting: 35,
        weapon: 40,
        engineer: 30
    },
    startingShip: {
        hull: "Weescow",
        core: {
            warpDrive: "Drive T1",
            armour: "Armour T1",
            cargoBay: "Bay T1",
            thrusters: "Thrust T1",
            weapons: "Weap T1"
        },
        modules: [
            "Cargo Exp T1" 
        ]
    }
};

// ==========================================
// SHIPS & EQUIPMENT DATA
// ==========================================

const shipHulls = {
    "Weescow": {
        name: "Weescow",
        image: "ship_weescow.png",
        size: "Tiny",
        description: "A two-seater runabout",
        baseHull: 10,
        weight: 5,
        price: 10000,
        multipliers: {
            jumpRange: 1,
            armour: 0.8,
            cargo: 0.8,
            handling: 1.2,
            firepower: 0.8,
            accuracy: 1
        },
        coreSlots: {
            warpDrive: 1,
            armour: 1,
            cargoBay: 1,
            thrusters: 1,
            weapons: 1
        },
        modularSlots: 1
    },
    "Midgeito": {
        name: "Midgeito",
        size: "Tiny",
        description: "A microfighter designed to be deployed in swarms.",
        baseHull: 12,
        weight: 4,
        price: 13000,
        multipliers: {
            jumpRange: 0.7,
            armour: 1.3,
            cargo: 0.2,
            handling: 1.4,
            firepower: 1.2,
            accuracy: 1
        },
        coreSlots: {
            warpDrive: 1,
            armour: 1,
            cargoBay: 1,
            thrusters: 1,
            weapons: 1
        },
        modularSlots: 1
    },
    "Keiship": {
        name: "Keiship",
        image: "ship_keiship.png",
        size: "Tiny",
        description: "A tiny delivery ship",
        baseHull: 10,
        weight: 6,
        price: 12000,
        multipliers: {
            jumpRange: 1,
            armour: 0.8,
            cargo: 1.2,
            handling: 0.9,
            firepower: 0.8,
            accuracy: 1
        },
        coreSlots: {
            warpDrive: 1,
            armour: 1,
            cargoBay: 1,
            thrusters: 1,
            weapons: 1
        },
        modularSlots: 1
    },
    "Rooster": {
        name: "Rooster",
        size: "Small",
        description: "Small patrol craft popular with law enforcement",
        baseHull: 18,
        weight: 8,
        price: 34000,
        multipliers: {
            jumpRange: 0.8,
            armour: 1.4,
            cargo: 0.3,
            handling: 1.2,
            firepower: 1.2,
            accuracy: 1.2
        },
        coreSlots: {
            warpDrive: 1,
            armour: 1,
            cargoBay: 1,
            thrusters: 1,
            weapons: 1
        },
        modularSlots: 2
    }
};

const equipment = {
    warpDrive: {
        "Drive T1": { name: "Jumpmaster XS", size: "Tiny", type: "warpDrive", price: 1000, weight: 1, baseValue: 50, description: "A budget stock warp drive" },
        "Drive T2": { name: "Jumpmaster Plus", size: "Tiny", type: "warpDrive", price: 1500, weight: 1, baseValue: 60, description: "Popular with couriers and taxis" },
        "Drive T3": { name: "Starhopper T23", size: "Tiny", type: "warpDrive", price: 2000, weight: 2, baseValue: 70, description: "Military grade scout drive" }
    },
    armour: {
        "Armour T1": { name: "Stock Armour", size: "Tiny", type: "armour", price: 1000, weight: 1, baseValue: 10, description: "The legal minimum level of protection." },
        "Armour T2": { name: "Reinforced Plate", size: "Tiny", type: "armour", price: 2000, weight: 2, baseValue: 12, description: "Added reflective layers for increased protection." },
        "Armour T3": { name: "Military Spec", size: "Tiny", type: "armour", price: 3000, weight: 3, baseValue: 14, description: "Military grade fighter armour" }
    },
    cargoBay: {
        "Bay T1": { name: "Weekender XS5", size: "Tiny", type: "cargoBay", price: 1000, weight: 1, baseValue: 5, description: "Slightly bigger than the glove compartment" },
        "Bay T2": { name: "Bigpocket DLV10", size: "Tiny", type: "cargoBay", price: 2000, weight: 2, baseValue: 10, description: "Standard personal haulage bay" },
        "Bay T3": { name: "BigBag 2000", size: "Tiny", type: "cargoBay", price: 3000, weight: 3, baseValue: 15, description: "Light haulage module for small buisnesses" }
    },
    thrusters: {
        "Thrust T1": { name: "380C Windbreakers", size: "Tiny", type: "thrusters", price: 1000, weight: 1, baseValue: 30, description: "Stock fighter class thrusters" },
        "Thrust T2": { name: "Darooky 1220s", size: "Tiny", type: "thrusters", price: 2000, weight: 1, baseValue: 40, description: "Aftermarket modded thrusters" },
        "Thrust T3": { name: "ShiftCore Accelerators", size: "Tiny", type: "thrusters", price: 3000, weight: 2, baseValue: 50, description: "A common sight in the illegal racing scene" }
    },
    weapons: {
        "Weap T1": { name: "Commblaster", size: "Tiny", type: "weapons", price: 1000, weight: 1, firepower: 10, accuracy: 5, description: "Illegally overclocked communication laser." },
        "Weap T2": { name: "Microcannon", size: "Tiny", type: "weapons", price: 1000, weight: 2, firepower: 15, accuracy: 5, description: "A low power directed energy weapon." }
    },
    modules: {
        "Cargo Exp T1": { name: "Cargo Exp T1", size: "Tiny", type: "module", price: 1000, weight: 1, stat: "cargo", flatBonus: 5, description: "A little extra storage space" },
        "T1 FP": { name: "T1 FP", size: "Tiny", type: "module", price: 1000, weight: 1, stat: "firepower", flatBonus: 5, description: "Tiny Overcharger" },
        "T2 FP": { name: "T2 FP", size: "Tiny", type: "module", price: 2000, weight: 1, stat: "firepower", flatBonus: 10, description: "Overcharger" },
        "T1 ACC": { name: "T1 ACC", size: "Tiny", type: "module", price: 1000, weight: 1, stat: "accuracy", flatBonus: 10, description: "Tiny Target Illuminator" }
    }
};

// ==========================================
// PROCEDURAL GENERATION DATA
// ==========================================

const TOTAL_ALIEN_PORTRAITS = 13; // Total number of random_alien_XXX.png images

const firstNames = [
    "Frank", "Bobby", "Aaron", "Jason", "Aria", "Jaxon", "Kael", "Lyra", "Zane", "Nova", 
    "Orion", "Pax", "Ren", "Sera", "Talon", "Vex", "Wren", "Xyler", "Yara", "Zephyr", 
    "Elara", "Finn", "Gael", "Kira", "Loki", "Mace", "Nyx", "Olin", "Poe", "Quin", 
    "Roa", "Silas", "Tia", "John", "Jeremy", "Jimmy", "Tyla", "Susan", "Suz-anne", "Kaylee",
    "Xorbo", "Brance", "Skinny", "Fat", "Sneaky", "Serious", "Faith", "Popo", "Lampf", "Queeto", 
    "Miss", "Mr", "Mrs", "Lord", "Lady", "Doctor", "Captain", "Exarch", "Zora", "Kaelith", 
    "Nex", "Vayda", "Riff", "Jett", "Echo", "Mars", "Plu", "Grix", "Vor", "Thrak", 
    "Zin", "Kel", "Ryker", "Dax", "Bly", "Moss", "Vahn", "Kiri", "Neo", "Solis", 
    "Vesper", "Nox", "Astra", "Helix", "Quark", "Zen", "Titan", "Atlas", "Rogue", "Storm", 
    "Blaze", "Flint", "Onyx", "Slate", "Iron", "Copper", "Silver", "Gold", "Bronze", "Neon",
    "X'thlx", "Qzh-rr", "Mmm'rra", "Tkhu-Phel", "G’ldoo", "Bhhh’zt", "Pneuma-X", "J’klypt", "Sss’th", "Oooo-Aaa",
    "Kkhh’rn", "Zh’nn-G’rth", "B’kk’t’t", "Cth-Ryk", "Ggggh’r", "Hhhh-Lnn",
    "Tali", "Garrus", "Solas", "Vax", "Koth", "Jace", "Vora", "Zedd", "Kaelen", "Mira", 
    "Aris", "Sora", "Rhane", "Bosh", "Jora", "Veen", "Lorn", "Prys", "Vahl", "Kyre", 
    "Sian", "Toth", "Gorn", "Kryn", "Valen", "Myra", "Ryl", "Brey", "Vexis", "Cyra", 
    "Eris", "Fael", "Gynn", "Isis", "Kora", "Lyre", "Nero", "Oz", "Quon", "Ryz", 
    "Tey", "Ura", "Vyk", "Wray", "Xal", "Yana", "Zeth", "Bel", "Corso", "Drue"
];

const lastNames = [
    "Vance", "Korne", "Drex", "Farr", "Voss", "Graves", "Tark", "Zell", "Renn", "Vane", 
    "Stark", "Vale", "Quinn", "Dax", "Kaelen", "Sol", "Nyx", "Cort", "Bane", "Jinn",
    "Kross", "Lenn", "Marn", "Nass", "Ordo", "Pryce", "Qel", "Rath", "Sato", "Tarn", 
    "Bobo", "Dziert", "Droox", "Drax", "Vex", "Krux", "Zorn", "Phox", "Glynt", "Syth", 
    "Veldt", "Kron", "Skar", "Jolt", "Vyce", "Brax", "Droon", "Ghal", "Hext", "Jory", 
    "Klyne", "Lurk", "Myrx", "Nym", "Phane", "Qorr", "Ryze", "Styxx", "Tuv", "Ulix", 
    "Vry", "Wisp", "Xon", "Yul", "Zark", "Breen", "Crake", "Dyne", "Flit", "Grin", 
    "Haze", "Inx", "Jape", "Knell", "Lox", "Mump", "Nook", "Ooze", "Pox", "Quip", 
    "Rasp", "Slit", "Tweak", "Urk", "Vexx", "Whir", "Xyl", "Yap", "Zest", "Blip", 
    "Clonk", "Drip", "Eek", "Fizz", "Glug", "Honk", "Itch", "Klonk", "Murk", "Zorg",
    "Xx-Phor’tth", "Qk’lll", "G’v-Nok", "Ph’nglui", "Mglw’nafh", "W’gah-nagl", "Fhtagn", "Cth’lk",
    "Thorne", "Vexis", "Krell", "Draven", "Halloway", "Vesper", "Valerius", "Kyron", "Malan", "Solari", 
    "Lunaris", "Kaizen", "Mordax", "Valos", "Grixis", "Phage", "Aetheris", "Voidan", "Stellis", "Lucian", 
    "Shadowen", "Ignis", "Cryos", "Volanis", "Maris", "Terran", "Lithos", "Pulver", "Ashen", "Ossis", 
    "Haem", "Ferrum", "Aurum", "Plumb", "Hydrar", "Zinca", "Stann", "Nicko", "Chromis", "Orich", 
    "Vitrum", "Argil", "Arenis", "Seric", "Lana", "Cannabis", "Linum", "Jutan", "Cocos", "Rhex"
];

const taxiPickupLines = [
    // Original / Standard
    "I'm late, let's go!",
    "You the pilot? Hurry up, time is credits.",
    "Finally. Get me out of this dump.",
    "Let's get moving, spacer.",
    "Dude the gig starts soon! Lets hussle!",

    // The Nervous/Paranoid
    "Don't look back. Just fly. Are they following? ...Wait, don't answer that.",
    "Is this ship scanned for tracking beacons? Nevermind, just go!",
    "Keep it under the speed limit leaving the dock, we don't want to draw attention.",

    // The High-Maintenance / Elite
    "I hope your inertial dampeners are functional. My species has a very delicate digestive system.",
    "This upholstery is... adequate. Try not to rattle the hull.",
    "Exalted One, the destination is logged. Ensure the flight is smooth.",

    // The Bizarre / Alien
    "The stars told me you would arrive. They didn't mention the smell of the cabin, though.",
    "My second stomach is feeling adventurous. Let's see what these thrusters can do!",
    "Warning: I may vibrate during transit. It is a sign of excitement, not a malfunction.",
    "Take me to the coordinates where the air tastes like copper.",

    // The Grumpy / Veteran
    "This bucket still holds air? Impressive. Just get me there in one piece.",
    "I've flown through supernova remnants more stable than this old crate. Move it, kid.",
    "Less talk, more thrust. My credits are burning a hole in my environmental suit.",

	//The Metaphorist (Poetic / Abstract)
    "The silver needle seeks the fabric of the far reaches. Thread me through, pilot.",
    "The great exhale begins; carry my essence to the lungs of the next station.",
    "Time is a glass desert, and my sand is running low. Move like the storm.",
    "The void is a hungry mouth; let your metal wings be the song that lulls it to sleep.",
    "A leaf caught in the solar wind, I seek the branch where the shadows grow long.",
    "The river of stars flows toward the dawn. Carry my vessel upon its current.",
    "The clock of the cosmos ticks toward the eclipse. We must outrun the shadow.",
    "My path is a tangled knot. Be the blade that cuts through the distance."
];

const taxiDropoffLines = [
    // Original / Standard
    "Hey man, let's hurry. I got an important meeting to get to... oh, we're here? Thanks!",
    "Thanks for the ride, spacer! Kept the hull in one piece.",
    "Finally! I thought I'd never get out of that bucket.",
    "Smooth flying dude.",
    "Not the worst flight I've had. Here are your credits.",
    "Praise the stars we made it. Transferring your funds now.",

    // The Enthusiastic
    "Wooo! That was better than the Grav-Coaster on Sector 7! Five stars!",
    "Exhilarating! I haven't felt that many G-forces since the Great Maharvian Dustup!",
    "You've got talent, pilot. If you ever need a wingman, look me up.",

    // The Shady / Mysterious
    "Drop me here. Don't watch which airlock I enter. Here’s your money.",
    "We were never here. You never saw me. Delete the flight logs.",
    "The transaction is encrypted. Forget my face, and I'll forget yours.",

    // The Quirky / Non-Humanoid
    "I have left a small gift of pheromones in the backseat as a tip. You are welcome.",
    "My scales are still mostly attached. A successful journey by any metric.",
    "The vibrations were... rhythmic. I shall recommend your vessel to the Hive.",

    // The Hard-to-Please
    "My internal compass confirms we are at the correct co-ordinates. Acceptable work.",
    "You missed the shortcut through the asteroid belt, but I suppose this will do.",
    "I've had smoother rides in a cargo crate, but at least I'm not dead. Credits sent.",

	// The Metaphorist (Poetic / Abstract)
    "The anchor finds the silt. The storm has passed into a quiet harbor.",
    "The blossom of our crossing has withered, leaving only the seed of payment.",
    "The stars have aligned their gaze upon this spot. Our dance of orbits ends here.",
    "A drop of water finds the ocean. My path and yours now diverge.",
    "The weaver pulls the thread tight. We have arrived at the knot.",
    "The sun sets on this journey, but the echoes of your engines linger in the silence.",
    "The circle is complete. The coin of my journey is spent. Take your tribute.",
    "The song of the thrusters fades into the hum of the world. Peace be upon your hull."
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
    "Obvious Pirate Ambush": {
        image: "portrait002.png",
        dialogue: {
            "start": {
                text: "<i>\"Stand and deliver, spacer!\"</i>",
                options: [
                    { text: "Never! [FIGHT]", nextNode: "leave", startCombat: true },
                    { text: "Take my money!", nextNode: "leave", credits: -500 }
                ]
            }
        }
    },
    "Police Patrol": {
        image: ["random_alien_008.png", "random_alien_011.png"],
        dialogue: {
            "start": {
                text: "<i>\"We have our eye on you citizen. You had better behave.\"</i>",
                options: [
                    { text: "You have a lovely day now officer. [Leave]", nextNode: "leave" }
                ]
            }
        }
    },
    "Scrap Trader": {
        image: "random",
        dialogue: {
            "start": {
                text: "<i>\"Fly safe friend!\"</i>",
                options: [
                    { text: "You too. [Leave]", nextNode: "leave" }
                ]
            }
        }
    },
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
        image: "portrait003.png",
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
                text: "Oh I am sorry. There has been a misunderstanding. I exist only to test dialogue triggers. Would you like some money instead?",
                options: [
                    { text: "No, thank you. [LEAVE]", nextNode: "leave" },
                    { text: "Yes please, that would be delightful.", nextNode: "give_money", credits: 1000000 }
                ]
            },
            "give_money": {
                text: "Here you go! <br><br><span class=\"text-green-600 font-bold\">They transfer 1,000,000 credits to your account.</i></span>\n",
                options: [
                    { text: "Oh wow! Thanks!", nextNode: "leave" }
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
    },
    "Rusty Hank": {
        image: "random",
        dialogue: {
            "start": {
                text: "<i> Don't worry, we can patch 'er up for ya.</i>",
                options: [
                    { text: "Thanks", nextNode: "leave" }
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
    },
    "Repair Station": {
        defaultImage: "station005.png",
        description: "A sprawling orbital drydock surrounded by welding drones."
    }
};

// ==========================================
// GALAXY MAP
// ==========================================
const galaxy = [
    {
        id: 0, name: "Sol", x: 494, y: 539,
        image: "star_system_001.png",
        description: "The home of humanity, an obscure species of mammal. It is a run-down polluted backwater.",
        npcSpawns: [
            { name: "System Security", shipType: "Weescow", shipImage: "ship_weescow.png", encounter: "Police Patrol", chance: 0.6,
                stats: { hull: 10, armour: 10, handling: 20, firepower: 10, accuracy: 0, piloting: 30, weapon: 30 } },
            { name: "Independent Hauler", shipType: "Keiship", shipImage: "ship_keiship.png", encounter: "Scrap Trader", chance: 0.4 }
        ],
        pois: [
            { name: "Earth Spaceport 01", type: "Trade Hub", image: "port001.png", encounters: ["Bartender Milo", "Brother Moo"], description: "A massive central trading hub for the planet Earth" },
            { name: "Lunar Ice Extractors", type: "Ice Mine", description: "Vast machines evaporate ice into water" },
            { name: "Martian Farm Hub", type: "Plant Farm" },
            { name: "Sol Taxis", type: "Outpost", image: "station001.png", encounters: ["Dispatcher Frank"], requiresFlag: "knows_frank", description: "Cheap but not cheerful." },
            { name: "Sol Orbital Mechanics", type: "Repair Station", description: "", repairCost: 10 }
        ]
    },
    {
        id: 1, name: "Alpha Centauri", x: 516, y: 517,
        npcSpawns: [
            { name: "Poovy bird", shipType: "<AVIAN>", shipImage: "ship_bird1.png", chance: 0.5, isHostile: true,
                stats: { hull: 20, armour: 10, handling: 40, firepower: 6, accuracy: 10, piloting: 30, weapon: 30 } },
            { name: "Unknown Pilot", shipType: "Weescow", shipImage: "ship_weescow.png", chance: 0.3,
                stats: { hull: 10, armour: 10, handling: 20, firepower: 10, accuracy: 0, piloting: 20, weapon: 20 } }
        ],
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
        npcSpawns: [
            { name: "Cop", shipType: "Weescow", encounter: "Police Patrol", chance: 0.1, isHostile: true }
        ],
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
        id: 11, name: "Obviously", x: 454, y: 547,
        description: "When the famous explorer Dee-rack first saw this star he proclaimed \"Well obviously we have to check that out.\"",
        npcSpawns: [
            { name: "Amateur Pirate", shipType: "Raider Scout", shipImage: "ship_weescow.png", encounter: "Obvious Pirate Ambush", chance: 0.3, isHostile: true,
                stats: { hull: 12, armour: 8, handling: 20, firepower: 8, accuracy: 5, piloting: 30, weapon: 30 } }
        ],
        pois: [
            { name: "The Obvious Trade Station", type: "Trade Hub" },
            { name: "Asteroid Belt Ice Mine", type: "Ice Mine", description: "Testing the ICE!" },
            { name: "Roid Chewer 023", type: "Iron Mine" },
            { name: "Obvious Taxis", type: "Outpost", image: "station001.png", encounters: ["Dispatcher Varlo"], description: "Obvious Taxis HQ is a cheaply refurbished outpost." },
            { name: "Rusty Hanks Discount Repair Emporium", type: "Repair Station", encounters: ["Rusty Hank"], description: "", repairCost: 6 }
        ]
    }
];
