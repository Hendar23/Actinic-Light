// ==========================================
// NEW GAME DEFAULTS
// ==========================================
const newGameDefaults = {
    startingCredits: 10,
    startingSystemId: 0,
    startingSkills: {
        piloting: 10,
        weapon: 10,
        engineer: 10,
        charm: 10
    },
    storage: [],
    startingTasks: ["meet_bob"],
    startingShip: {
        hull: "Weescow",
        core: {
            warpDrive: "Drive T1",
            armour: "Armour T1",
            cargoBay: "Bay T1",
            thrusters: "Thrust T1",
            weapons: "Weap T1"
        },
        modules: []
    }
};

// ==========================================
// LORE & FLAVOUR DATA
// ==========================================
const bountyCrimes = [
    "Piracy",
    "Smuggling",
    "Grand Theft Starship",
    "Murder",
    "Kicking a puppy",
    "Tax Evasion",
    "Treason",
    "Illegal Salvage",
    "Drug Trafficking",
    "Assault of an Officer",
    "Data Hacking",
    "Narbling tarrs without a licence",
    "Unpaid Parking Tickets"
];

// ==========================================
// SHIPS & EQUIPMENT DATA
// ==========================================

const shipHulls = {
    "Weescow": {
        name: "Weescow",
        image: "ship_weescow.png",
        size: "Tiny",
        description: "A two-seater runabout",
        baseHull: 20,
        weight: 5,
        price: 1000,
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
        modularSlots: 1,
        standardLoadout: {
            core: {
                warpDrive: "Drive T1",
                armour: "Armour T1",
                cargoBay: "Bay T1",
                thrusters: "Thrust T1",
                weapons: "Weap T1"
            },
            modules: []
        }
    },
    "Midgeito": {
        name: "Midgeito",
        image: "ship_midgeito.png",
        size: "Tiny",
        description: "A microfighter designed to be deployed in swarms.",
        baseHull: 24,
        weight: 4,
        price: 1300,
        multipliers: {
            jumpRange: 0.9,
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
        modularSlots: 1,
        standardLoadout: {
            core: {
                warpDrive: "Drive T1",
                armour: "Armour T1",
                cargoBay: "Bay T1",
                thrusters: "Thrust T1",
                weapons: "Weap T1"
            },
            modules: []
        }
    },
    "Keiship": {
        name: "Keiship",
        image: "ship_keiship.png",
        size: "Tiny",
        description: "A tiny delivery ship",
        baseHull: 20,
        weight: 6,
        price: 1200,
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
        modularSlots: 1,
        standardLoadout: {
            core: {
                warpDrive: "Drive T1",
                armour: "Armour T1",
                cargoBay: "Bay T1",
                thrusters: "Thrust T1",
                weapons: "Weap T1"
            },
            modules: []
        }
    },
    "Rooster": {
        name: "Rooster",
        image: "ship_rooster.png",
        size: "Small",
        description: "Small patrol craft popular with law enforcement",
        baseHull: 36,
        weight: 8,
        price: 3400,
        multipliers: {
            jumpRange: 0.9,
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
        modularSlots: 2,
        standardLoadout: {
            core: {
                warpDrive: "Drive S1",
                armour: "Armour S1",
                cargoBay: "Bay S1",
                thrusters: "Thrust S1",
                weapons: "Weap S1"
            },
            modules: []
        }
    }
};

const equipment = {
    warpDrive: {
        "Drive T1": { name: "Jumpmaster XS", size: "Tiny", type: "warpDrive", price: 100, weight: 1, baseValue: 50, description: "A budget stock warp drive" },
        "Drive T2": { name: "Jumpmaster Plus", size: "Tiny", type: "warpDrive", price: 150, weight: 1, baseValue: 70, description: "Popular with couriers and taxis" },
        "Drive T3": { name: "Starhopper T23", size: "Tiny", type: "warpDrive", price: 200, weight: 2, baseValue: 90, description: "Military grade scout drive" },
        "Drive S1": { name: "Gosystems A52", size: "Small", type: "warpDrive", price: 300, weight: 3, baseValue: 55, description: "A budget stock warp drive" }
    },
    armour: {
        "Armour T1": { name: "Stock Armour", size: "Tiny", type: "armour", price: 100, weight: 1, baseValue: 10, description: "The legal minimum level of protection." },
        "Armour T2": { name: "Reinforced Plate", size: "Tiny", type: "armour", price: 200, weight: 2, baseValue: 12, description: "Added reflective layers for increased protection." },
        "Armour T3": { name: "Military Spec", size: "Tiny", type: "armour", price: 300, weight: 3, baseValue: 14, description: "Military grade fighter armour" },
        "Armour S1": { name: "Stock Armour", size: "Small", type: "armour", price: 250, weight: 1, baseValue: 12, description: "The legal minimum level of protection." }
    },
    cargoBay: {
        "Bay T1": { name: "Weekender XS5", size: "Tiny", type: "cargoBay", price: 100, weight: 1, baseValue: 5, description: "Slightly bigger than the glove compartment" },
        "Bay T2": { name: "Bigpocket DLV10", size: "Tiny", type: "cargoBay", price: 200, weight: 2, baseValue: 10, description: "Standard personal haulage bay" },
        "Bay T3": { name: "BigBag 2000", size: "Tiny", type: "cargoBay", price: 300, weight: 3, baseValue: 15, description: "Light haulage module for small buisnesses" },
        "Bay S1": { name: "Tokeybay 01", size: "Small", type: "cargoBay", price: 300, weight: 2, baseValue: 12, description: "Standard storage space" }
    },
    thrusters: {
        "Thrust T1": { name: "380C Windbreakers", size: "Tiny", type: "thrusters", price: 100, weight: 1, baseValue: 30, description: "Stock fighter class thrusters" },
        "Thrust T2": { name: "Darooky 1220s", size: "Tiny", type: "thrusters", price: 200, weight: 1, baseValue: 40, description: "Aftermarket modded thrusters" },
        "Thrust T3": { name: "ShiftCore Accelerators", size: "Tiny", type: "thrusters", price: 300, weight: 2, baseValue: 50, description: "A common sight in the illegal racing scene" },
        "Thrust S1": { name: "Thrustcore Shifters", size: "Small", type: "thrusters", price: 400, weight: 2, baseValue: 40, description: "Stock thrusters" }
    },
    weapons: {
        "Weap T1": { name: "Commblaster", size: "Tiny", type: "weapons", price: 100, weight: 1, firepower: 10, accuracy: 5, description: "Illegally overclocked communication laser" },
        "Weap T2": { name: "Microcannon", size: "Tiny", type: "weapons", price: 200, weight: 2, firepower: 12, accuracy: 10, description: "A low power directed energy weapon" },
        "Weap S1": { name: "30mm Rattlegun", size: "Small", type: "weapons", price: 300, weight: 2, firepower: 14, accuracy: 10, description: "Standard railguns" }
    },
    modules: {
        "Cargo Exp T1": { name: "Cargo Exp T1", size: "Tiny", type: "module", price: 100, weight: 1, stat: "cargo", flatBonus: 5, description: "A little extra storage space" },
        "T1 FP": { name: "T1 FP", size: "Tiny", type: "module", price: 100, weight: 1, stat: "firepower", flatBonus: 2, description: "Tiny Overcharger" },
        "T2 FP": { name: "T2 FP", size: "Tiny", type: "module", price: 200, weight: 1, stat: "firepower", flatBonus: 4, description: "Overcharger" },
        "T1 ACC": { name: "T1 ACC", size: "Tiny", type: "module", price: 100, weight: 1, stat: "accuracy", flatBonus: 10, description: "Tiny Target Illuminator" }
    }
};
// PROCEDURAL GENERATION DATA
// ==========================================

const TOTAL_ALIEN_PORTRAITS = 24; // Total number of random_alien_XXX.png images

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

const bountyTargetLines = [
    "What do you want, spacer? I'm busy.",
    "You're making a mistake getting this close to me.",
    "I don't know you, and I don't want to. Back off.",
    "State your business or power down your weapons.",
    "Whatever they're paying you, it ain't worth your life.",
    "I'm not going back to the clink!",
    "You got three seconds to jump out of this system.",
    "Stop following me or I'll vent your atmosphere.",
    "I smell a bounty hunter. Turn back now."
];

const bountyPlayerLines = [
    "I'm here to collect the bounty on your head! [ATTACK]",
    "Your running days are over. [ATTACK]",
    "Nothing personal, just business. [ATTACK]",
    "I'm bringing you in. Dead or alive. [ATTACK]",
    "Time to cash in your bounty! [ATTACK]",
    "Surrender... actually, don't bother. [ATTACK]",
    "I'm here for the reward. Let's go. [ATTACK]"
];

const taxiPickupLines = [
    "I'm late, let's go!",
    "Greetings. Let us depart",
    "Sup?",
    "Let's go.",
    "Hi. You my ride? Great.",
    "You the pilot? Hurry up, time is credits.",
    "Finally. Get me out of this dump.",
    "Let's get moving, spacer.",
    "Punch it pilot.",
    "My ship broke down at the worst time.",
    "Took you long enough. Just get going!",
    "Dude the gig starts soon! Lets hussle!",
    "Don't look back. Just fly. Are they following? ...Wait, don't answer that.",
    "Is this ship scanned for tracking beacons? Nevermind, just go!",
    "Keep it under the speed limit leaving the dock, we don't want to draw attention.",
    "I hope your inertial dampeners are functional. My species has a very delicate digestive system.",
    "This upholstery is... adequate. Try not to rattle the hull.",
    "Exalted One, the destination is logged. Ensure the flight is smooth.",
    "The stars told me you would arrive. They didn't mention the smell of the cabin, though.",
    "My second stomach is feeling adventurous. Let's see what these thrusters can do!",
    "Warning: I may vibrate during transit. It is a sign of excitement, not a malfunction.",
    "Take me to the coordinates where the air tastes like copper.",
    "This bucket still holds air? Impressive. Just get me there in one piece.",
    "I've flown through supernova remnants more stable than this old crate. Move it, kid.",
    "Less talk, more thrust. My credits are burning a hole in my environmental suit.",
    "The silver needle seeks the fabric of the far reaches. Thread me through, pilot.",
    "The great exhale begins; carry my essence to the lungs of the next station.",
    "Time is a glass desert, and my sand is running low. Move like the storm.",
    "The void is a hungry mouth; let your metal wings be the song that lulls it to sleep.",
    "A leaf caught in the solar wind, I seek the branch where the shadows grow long.",
    "The river of stars flows toward the dawn. Carry my vessel upon its current.",
    "The clock of the cosmos ticks toward the eclipse. We must outrun the shadow.",
    "My path is a tangled knot. Be the blade that cuts through the distance.",
    "Coordinates are locked in. Let's move.",
    "Just follow the nav, please.",
    "Straight to the drop-off, no detours.",
    "I'm in a rush, step on it.",
    "I've got a connecting flight to catch.",
    "Just a standard fare, nothing fancy.",
    "Rough shift. Let's just get this over with.",
    "Destination is locked. Let's ride.",
    "Let's get this bucket moving.",
    "Mind if I crack a window? Kidding, kidding.",
    "You got any music? It's too quiet in here.",
    "Good cycle to you. Destination is set.",
    "Let's hit the skyway.",
    "You know a shortcut around the orbital traffic?",
    "Do you charge extra for heavy baggage?",
    "Burn the thrusters, I'm already late.",
    "I hope this thing is fast.",
    "Skip the pre-flight checks, just launch.",
    "Don't chat, just drive.",
    "I don't care about the route, just get me there.",
    "Time is money, pilot. Move.",
    "We're losing daylight, or.. you know what I mean",
    "Can we bypass the main traffic lanes?",
    "Hurry up before the docking bay seals.",
    "Hope your environmental seals are tight.",
    "You mind if I catch some sleep in the back?",
    "I need to be there yesterday, pronto.",
    "Keep to the safe routes, if you don't mind.",
    "Man, I need a drink. Let's hurry.",
    "Just get me out of here.",
    "Nice ship. Keeps the vacuum out, at least.",
    "Turn up the life support, it's freezing in here.",
    "Is that rattling noise normal?",
    "I get space-sick, so easy on the turns.",
    "You got a charging port for my datapad?",
    "Mind the G-force on takeoff.",
    "Smells like ozone in here.",
    "Is your armor rated for micrometeoroids? Good.",
    "Can you dim the cabin lights? Headache.",
    "I prefer a smooth ride, if possible.",
    "Don't log this trip in the public registry.",
    "Keep the comms dark until we land.",
    "If anyone asks, you never picked me up.",
    "Take the scenic route, make sure nobody is trailing us.",
    "Let's roll.",
    "Ready when you are.",
    "Destination uploaded.",
    "Get me there.",
    "To the coordinates, pilot.",
    "Engage thrusters.",
    "Take us out.",
    "Let's fly.",
    "Hit the gas.",
    "I've sent the drop-off data to your console.",
    "Just get me to the coordinates in one piece."
];

const taxiDropoffLines = [
    "Hey man, let's hurry. I got an important meeting to get to... oh, we're here? Thanks!",
    "Thanks for the ride, spacer! Kept the hull in one piece.",
    "Great, thank.s",
    "Cool. Here's your money.",
    "Sweet, thanks bro.",
    "Thanks dude.",
    "The Dude arrives!",
    "<Mumbled thanks>",
    "Nice flying.",
    "Finally! I thought I'd never get out of that bucket.",
    "Smooth flying dude.",
    "Not the worst flight I've had. Here are your credits.",
    "Praise the stars we made it. Transferring your funds now.",
    "Wooo! That was better than the Grav-Coaster on Prantus 4! Five stars!",
    "Exhilarating! I haven't felt that many G-forces since the Great Maharvian Dustup!",
    "You've got talent, pilot. If you ever need a wingman, look me up.",
    "Drop me here. Don't watch which airlock I enter. Here’s your money.",
    "We were never here. You never saw me. Delete the flight logs.",
    "The transaction is encrypted. Forget my face, and I'll forget yours.",
    "I have left a small gift of pheromones in the backseat as a tip. You are welcome.",
    "My scales are still mostly attached. A successful journey by any metric.",
    "The vibrations were... rhythmic. I shall recommend your vessel to the Hive.",
    "My internal compass confirms we are at the correct co-ordinates. Acceptable work.",
    "You missed the shortcut through the asteroid belt, but I suppose this will do.",
    "I've had smoother rides in a cargo crate, but at least I'm not dead. Credits sent.",
    "The anchor finds the silt. The storm has passed into a quiet harbor.",
    "The blossom of our crossing has withered, leaving only the seed of payment.",
    "The stars have aligned their gaze upon this spot. Our dance of orbits ends here.",
    "A drop of water finds the ocean. My path and yours now diverge.",
    "The weaver pulls the thread tight. We have arrived at the knot.",
    "The sun sets on this journey, but the echoes of your engines linger in the silence.",
    "The circle is complete. The coin of my journey is spent. Take your tribute.",
    "The song of the thrusters fades into the hum of the world. Peace be upon your hull.",
    "Perfect timing. Thanks, pilot.",
    "Credits transferred. Have a good one.",
    "Glad to be back on solid ground. Thanks.",
    "Awesome. Keep the change.",
    "Right on the money. Thanks for the lift.",
    "That'll do. Safe flying.",
    "Payment sent. Appreciate the speed.",
    "Alright, I'm out. Take care.",
    "Nice job navigating that traffic. See ya.",
    "And we're here. Thanks, spacer.",
    "Check your account, should be all cleared. Thanks.",
    "Smooth landing. Appreciate it.",
    "Made it just in time.",
    "Thanks for getting me here in one piece.",
    "Alright, thanks. Catch you on the flip side.",
    "Here are your credits. Stay safe out there.",
    "Perfect. Thanks for the quick trip.",
    "That was faster than expected. Much appreciated.",
    "Appreciate the lift, pilot.",
    "We're good. Thanks.",
    "Nice maneuvering back there. Take care.",
    "Credits are sent. Have a profitable cycle.",
    "Thanks, I can take it from here.",
    "Just in the nick of time. Thank you.",
    "Finally. Thanks for the ride.",
    "Alright, opening the hatch. Thanks.",
    "Transaction complete. Safe travels.",
    "Thanks. Good luck out there in the black.",
    "That's us. Thanks, pal.",
    "Excellent flight. Credit transfer is authorized.",
    "Glad that's over. Thanks for the lift.",
    "Perfect drop-off. See you around.",
    "Account should be updated now. Thanks.",
    "Appreciate you bypassing that traffic jam. Take care.",
    "Good job. Try to get that rattling sound fixed, though.",
    "Thanks. Back to the grind.",
    "Smooth transit. Here is your payment.",
    "Thanks for keeping the ride steady.",
    "Right on time. Thanks, pilot.",
    "Credits are in your account.",
    "Thanks. Glad I didn't have to walk.",
    "Alright, looks like we made it. Thanks.",
    "Good pace. Thanks for rushing.",
    "Payment confirmed on my end. Safe travels.",
    "Thanks for the lift. Don't work too hard.",
    "Perfect. I'll call this service again.",
    "Thanks, mate. Appreciate it.",
    "Much obliged, pilot. Safe flying.",
    "Here you go. Exactly what the meter said.",
    "Hatch is open, I'm out. Thanks.",
    "You're a lifesaver. Thanks again.",
    "Great flight. Standard tip included.",
    "Thanks. Good luck with your next fare.",
    "Appreciate the quiet ride. Take care.",
    "Transaction went through. See ya.",
    "Thanks. Glad the atmosphere held up.",
    "Nice and easy. Just how I like it. Thanks.",
    "Alright, transferring the funds now. Take care.",
    "Thanks for the hustle. I actually made it.",
    "Good ride, spacer. Keep the shiny side up.",
    "Thanks. Hope your next run goes smoothly.",
    "And that's my cue. Thanks for the lift.",
    "Credits sent. Watch out for the patrols on your way back.",
    "Perfectly done. Thanks, pilot."
];

// ==========================================
// QUESTS & TASKS
// ==========================================
const quests = {
    "meet_frank": {
        title: "Speak to Frank",
        description: "Find Frank at Sol Taxis in the Sol system and speak to him about work.",
        targetSystemId: 1, 
        targetPoiName: "Sol Taxis",
        xpReward: 10
    },
    "meet_bob": {
        title: "Speak to Uncle Bob",
        description: "Find Uncle Bob in the Herbies Star system and speak to him about your plans",
        targetSystemId: 0, 
        targetPoiName: "The Full Burn Bar",
        xpReward: 10
    },
    "meet_bitz": {
        title: "Speak to Bitz",
        description: "Speak to Bitz and ask him about a long range warp drive.",
        targetSystemId: 8, 
        targetPoiName: "Bitz and Bobs Outfitters",
        xpReward: 20
    }
};

// ==========================================
// INTERACTIONS & ENCOUNTERS
// ==========================================

const interactions = {
    "Obvious Pirate Ambush": {
        image: "random",
        dialogue: {
            "start": {
                text: "\"Stand and deliver, spacer!\"",
                options: [
                    { text: "Never! [FIGHT]", nextNode: "leave", startCombat: true },
                    { text: "Take my money!", nextNode: "leave", credits: -100 }
                ]
            }
        }
    },
    "Police Patrol": {
        image: "portrait005.png",
        dialogue: {
            "start": {
                text: "\"We have our eye on you citizen. You had better behave.\"",
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
                text: "\"Fly safe friend!\"",
                options: [
                    { text: "You too buddy. [LEAVE]", nextNode: "leave" }
                ]
            }
        }
    },
    "civilian001": {
        image: "random",
        dialogue: {
            "start": {
                text: "\"Fly safe friend!\"",
                options: [
                    { text: "You too buddy. [Leave]", nextNode: "leave" }
                ]
            }
        }
    },
    "Bartender Milo": {
        image: "portrait001.png",
        dialogue: {
            "start": {
                text: "\"What're you drinking, spacer?\"",
                options: [
                    { text: "Got any work?", nextNode: "work", hidesOnFlag: "knows_frank" },
                    { text: "About that job...", nextNode: "work2", requiresFlag: "knows_frank" },
                    { text: "Whatever is on tap.", nextNode: "drink", credits: -1 },
                    { text: "Nothing right now, thanks.", nextNode: "leave" }
                ]
            },
            "cash": {
                text: "He rolls his eyes and tosses a cred-chip onto the bar.<br><br><i>\"I guess you are just testing the game, so why not? Here you go.\"</i>",
                options: [
                    { text: "Thanks! [LEAVE]", nextNode: "leave", credits: 1000 }
                ]
            },
            "drink": {
                text: "<i>He pours you a glowing blue liquid. It tastes like battery acid and regret.</i>",
                options: [
                    { text: "Ugh. Thanks. [Leave]", nextNode: "leave" }
                ]
            },
            "work": {
                text: "\"Speak to Frank at Sol taxis, they are always looking for pilots.\"",
                options: [
                    { text: "Thanks. [LEAVE]", nextNode: "leave", setFlag: "knows_frank", startTask: "meet_frank" }
                ]
            },
            "work2": {
                text: "\"Like I said, speak to Frank at Sol taxis.\"",
                options: [
                    { text: "Thanks. [Leave]", nextNode: "leave" }
                ]
            }
        }
    },
    "Brother Moo": {
        image: "portrait004.png",
        dialogue: {
            "start": {
                text: "Greetings. I exists only to assist the Dev by allowing them to , well, cheat quite frankly. Are you the Dev?",
                options: [
                    { text: "I am indeed Brother Moos", nextNode: "teach_me_the_way" },
                    { text: "I am not Brother Moo [Leave]", nextNode: "leave" }
                ]
            },
            "teach_me_the_way": {
                text: "Excellent. Would you like money or experience points?",
                options: [
                    { text: "I would like some money please Brother Moo", nextNode: "give_money", credits: 1000000 },
                    { text: "Some XP would be delightful Brother Moo", nextNode: "give_xp" },
                    { text: "Neither, thank you. [LEAVE]", nextNode: "leave" }
                ]
            },
            "give_money": {
                text: "Here you go! <br><br><span class=\"text-green-600 font-bold\">They transfer 1,000,000 credits to your account.</span>\n",
                options: [
                    { text: "May the Code be with you, Brother Moo.", nextNode: "leave" }
                ]
            },
            "give_xp": {
                text: "Certainly. ",
                options: [
                    { text: "May the Code be with you, Brother Moo.", nextNode: "leave", xp: 100000 }
                ]
            }
        }
    },
    "Dispatcher Varlo": {
        image: "random_alien_002.png",
        dialogue: {
            "start": {
                text: "\"Greetings. May I be of assistance?\"",
                options: [
                    { text: "Got any fares?", nextNode: "work" },
                    { text: "No thanks. [LEAVE]", nextNode: "leave" }
                ]
            },
            "work": {
                text: "\"Of course.\"",
                generateTaxiJobs: true,
                taxiJobCount: 4,
                taxiMaxDistance: 75,
                options: [
                    { text: "Maybe another time. [LEAVE]", nextNode: "leave" }
                ]
            }
        }
    },
    "Uncle Bob": {
        image: "random_alien_006.png",
        dialogue: {
            "start": {
                text: "\"Hey kid, how's it going?\"",
                options: [
                    { text: "I did it Bob, I got my first ship.", nextNode: "got_ship", hidesOnFlag: "meet_bitz" },
                    { text: "Sorry Uncle Bob, I gotta go. [LEAVE]", nextNode: "leave" }
                ]
            },
            "got_ship": {
                text: "\"Wow you really did it. I won't ask how you got the money for it. What's your plans now?\"",
                options: [
                    { text: "I'll make a quiet living hauling cargo.", nextNode: "hauling" },
                    { text: "I think I'll sign up for some taxi work. I like meeting new people.", nextNode: "taxing" },
                    { text: "I'm going to take bounties and hunt down the scum and villainy of the galaxy!", nextNode: "bounties" },
                    { text: "Seek fortune and glory Bob. What else?", nextNode: "fortune_glory" }
                ]
            },
            "fortune_glory": {
                text: "\"Haha of course! \n\nWell, be careful out there. A lotta crazy and desperate people around these days, what with the economy and all.\"\n\nI don't have to tell you to stay away from Barron Locus. Someone aught to do something about those crazy killers. ",
                options: [
                    { text: "I'll be careful Bob, thanks.", nextNode: "bob_final" }
                ]
            },
            "bob_final": {
                text: "\"Oh hey, before you go. Without a long range jump drive you will be stuck in our little corner of the galaxy. Decent jump drives are hard to get around here though. \n\nSpeak to my old friend Bitz over in the Logus system when you are ready, tell him I sent you. He will sort you out with something.\"",
                options: [
                    { text: "You're the best Uncle Bob. Take care. [LEAVE]", nextNode: "leave", setFlag: "meet_bitz", startTask: "meet_bitz", completeTask: "meet_bob" }
                ]
            },
            "hauling": {
                text: "\"Space trucking ain't glamorous, but it's an honest job and someone has to do it. \n\nBut careful out there. A lotta crazy and desperate people around these days, what with the economy and all.\"\n\nI don't have to tell you to stay away from Barron Locus. Someone aught to do something about those crazy killers. ",
                options: [
                    { text: "I'll be careful Bob, I promise.", nextNode: "bob_final" }
                ]
            },
            "taxing": {
                text: "\"There's some good money to be made running a shuttle service, and you will certainly meet some interesting characters\n\nBut careful out there. A lotta crazy and desperate people around these days, what with the economy and all.\"\n\nI don't have to tell you to stay away from Barron Locus. Someone aught to do something about those crazy killers. ",
                options: [
                    { text: "I'll be careful Bob, I promise.", nextNode: "bob_final" }
                ]
            },
            "bounties": {
                text: "\"Well please make sure you fit your ship out for combat first. Bounty hunting is not as glamorous as the holo-vids make it out to be. It's a dangerous job and I'd hate for you to die before you settle your tab.\n\nSeriously kiddo, it's a dangerous galaxy out there. I don't have to tell you to stay away from Barron Locus. I don't care how badass you think you are, those zealots are dangerous!\"",
                options: [
                    { text: "Don't worry Bob, I'll be careful.", nextNode: "bob_final" }
                ]
            }
        }
    },
    "herb01": {
        image: "random",
        dialogue: {
            "start": {
                text: "\"Hand over your credits!\"",
                options: [
                    { text: "Never! [FIGHT]", nextNode: "leave", startCombat: true },
                    { text: "Take my money, just leave me alone!", nextNode: "leave", credits: -10 }
                ]
            }
        }
    },
    "Dispatcher Jools": {
        image: "random_alien_012.png",
        dialogue: {
            "start": {
                text: "\"Yeah, what?\"",
                options: [
                    { text: "Got any taxi fares?", nextNode: "work" },
                    { text: "Nothing. [Leave]", nextNode: "leave" }
                ]
            },
            "work": {
                text: "\"Here's what's on the board.\"",
                generateTaxiJobs: true,
                taxiJobCount: 4,
                taxiMaxDistance: 75,
                options: [
                    { text: "Maybe later. [Leave]", nextNode: "leave" }
                ]
            }
        }
    },
    "locus_raider": {
        image: "portrait006.png",
        dialogue: {
            "start": {
                text: "Infection. The stars will be scrubbed of your stain.",
                options: [
                    { text: "I guess we can't talk about this? [FIGHT]", nextNode: "leave", startCombat: true }
                ]
            }
        }
    },
    "Officer Vangteel": {
        image: "portrait005.png",
        dialogue: {
            "start": {
                text: "\"What do you want citizen?\"",
                options: [
                    { text: "Any outstanding bounties?", nextNode: "bounties" },
                    { text: "Nothing, just passing through. [LEAVE]", nextNode: "leave" }
                ]
            },
            "bounties": {
                text: "\"Always. Here is our current most wanted list.\"",
                generateBountyJobs: true,
                bountyJobCount: 3,
                bountyMaxDistance: 75,
                bountyShips: "Weescow, Midgeito, Keiship",
                bountyStats: { hull: 20, armour: 10, handling: 25, firepower: 15, accuracy: 10, piloting: 20, weapon: 20 },
                options: [
                    { text: "Maybe later. [LEAVE]", nextNode: "leave" }
                ]
            }
        }
    },
    "Bitz": {
        image: "random_alien_023.png",
        dialogue: {
            "start": {
                text: "Welcome to Bitz and Bobs Outfitters pilot! What can we you do for you today? Need bigger cargo hold? Maybe a weapon upgrade to see off those pesky pirates? At Bitz and Bob's we have everything you need!",
                options: [
                    { text: "Actually Uncle Bob sent me. Said you might be able to help me find a long range warp drive. Something strong enough to get me out of this sector?", nextNode: "bitz1", requiresFlag: "meet_bitz" },
                    { text: "Sounds great Bitz, I'll go check your catalogue! [Leave]", nextNode: "leave" }
                ]
            },
            "bitz1": {
                text: "Bob? hah! How is the old fella? Still running that dive bar of his? \n\nYeah I have some special drives in stock, but they are rare in these parts. It'll cost you 5000 credits.\n\nOr maybe you do a little job for me and I'll fit you one for free. How does that sound?",
                options: [
                    { text: "That's a lotta clams Bitz, this drive better work. [PAY]", nextNode: "leave", credits: -5000, clearFlag: "meet_bitz", completeTask: "meet_bitz", rewardItem: "Drive T3" },
                    { text: "What's the job?", nextNode: "leave" }
                ]
            }
        }
    },
    "Bob": {
        image: "random_alien_003.png",
        dialogue: {
            "start": {
                text: "Speak to Bitz. He deals with all the business stuff.",
                options: [
                    { text: "Okay will do.[LEAVE]", nextNode: "leave" }
                ]
            }
        }
    },
    "Mysterious Janitor": {
        image: "portrait002.png",
        dialogue: {
            "start": {
                text: "Oh hi. Didn't see you there. We don't get many visitors here.",
                options: [
                    { text: "What is this place?", nextNode: "myst1" }
                ]
            },
            "myst1": {
                text: "It's the end. You reached the edge of the map. You have completed the starting area.\n\nIf this was on Steam, an achievement would pop up right now. \n\nPat yourself on the back gamer. You did good.\n\nCome back when Hendar23 has added more stuff.",
                options: [
                    { text: "Okay. See you around I guess [LEAVE]", nextNode: "leave" }
                ]
            }
        }
    }
};

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
	defaultImage: "station006.png",
        description: "Sterile corridors hum with food packaging machinery.",
        produces: ["Packaged Food"],
        consumes: { "Plants": "High", "Machine Parts": "Low" }
    },
    "Livestock Farm": {
	defaultImage: "station009.png",
        description: "Large biological containment bays. Smells terrible.",
        produces: ["Meat"],
        consumes: { "Packaged Food": "Low", "Water": "High", "Plants": "High", "Machine Parts": "Low" }
    },
    "Meat Processing Plant": {
        defaultImage: "station007.png",
        description: "You don't want to know how the sausage is made.",
        produces: ["Packaged Food"],
        consumes: { "Meat": "High", "Machine Parts": "Low" }
    },
    "Copper Mine": {
	defaultImage: "mine003.png",
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
	defaultImage: "mine004.png",
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
	defaultImage: "station004.png",
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
    },
    "Outfitter": {
        defaultImage: "station008.png",
        description: "A sprawling industrial drydock where pilots can purchase, sell, and store ship components.",
        hasOutfitter: true
    },
    "Ship Vendor": {
        defaultImage: "station008.png",
        description: "A massive orbital showroom selling pristine new spacecraft.",
        hasShipyard: true
    }
};

// ==========================================
// GALAXY MAP
// ==========================================

const mapBackgrounds = [
];

const galaxy = [
    {
        id: 0, name: "Herbies Star", x: 535, y: 552,
        description: "The only habitable planet, Leonton is known for it's large predators, petty crime, and poverty.",
        npcSpawns: [
            { name: "Cop", shipType: "Weescow", shipImage: "ship_keiship.png", encounter: "Police Patrol", chance: 0.05, isHostile: true },
            { name: "Taxi", shipType: "Weescow", shipImage: "ship_weescow.png", encounter: "civilian001", chance: 0.1,
                stats: { hull: 20, armour: 10, handling: 20, firepower: 10, accuracy: 0, piloting: 20, weapon: 20 } },
            { name: "Trader", shipType: "Keiship", shipImage: "ship_keiship.png", encounter: "civilian001", chance: 0.1,
                stats: { hull: 20, armour: 10, handling: 20, firepower: 10, accuracy: 0, piloting: 20, weapon: 20 } },
            { name: "Trader", shipType: "Weescow", shipImage: "ship_weescow.png", encounter: "civilian001", chance: 0.1,
                stats: { hull: 20, armour: 10, handling: 20, firepower: 10, accuracy: 0, piloting: 20, weapon: 20 } },
            { name: "Leonton Traffic", shipType: "Keiship", shipImage: "ship_keiship.png", encounter: "civilian001", chance: 0.1,
                stats: { hull: 20, armour: 10, handling: 20, firepower: 10, accuracy: 0, piloting: 20, weapon: 20 } },
            { name: "Leonton Traffic", shipType: "Weescow", shipImage: "ship_weescow.png", encounter: "civilian001", chance: 0.1,
                stats: { hull: 20, armour: 10, handling: 20, firepower: 10, accuracy: 0, piloting: 20, weapon: 20 } },
            { name: "Trader", shipType: "Keiship", shipImage: "ship_keiship.png", encounter: "civilian001", chance: 0.1,
                stats: { hull: 20, armour: 10, handling: 20, firepower: 10, accuracy: 0, piloting: 20, weapon: 20 } },
            { name: "Desperate Pirate", shipType: "Weescow", shipImage: "ship_weescow.png", encounter: "herb01", chance: 0.1, isHostile: true,
                stats: { hull: 20, armour: 8, handling: 20, firepower: 10, accuracy: 5, piloting: 5, weapon: 5 } },
            { name: "Bounty hunter", shipType: "Midgeito", shipImage: "ship_midgeito.png", encounter: "civilian001", chance: 0.5,
                stats: { hull: 24, armour: 10, handling: 25, firepower: 12, accuracy: 8, piloting: 10, weapon: 10 } }
        ],
        pois: [
            { name: "Leonton Spaceport", type: "Trade Hub", image: "port003.png", description: "Smells like starship fuel, cheap narcotics, and desperation." },
            { name: "The Full Burn Bar", type: "Outpost", image: "bar001.png", encounters: ["Uncle Bob", "Brother Moo"], description: "Leontons go to bar for visiting spacers. Uncle bob has run it as long as anyone can remember. " },
            { name: "Herbies Taxis", type: "Outpost", image: "station001.png", encounters: ["Dispatcher Varlo"], description: "Herbies Taxis HQ is a cheaply refurbished outpost." },
            { name: "System Security HQ", type: "Outpost", image: "station005.png", encounters: ["Officer Vangteel"], description: "Police headquarters for the Herbie system. " },
            { name: "Barlows Starship Emporium", type: "Ship Vendor", description: "Rows of battered old spaceships line a large storage hold. A plastifab shed serves as Barlow Office.", shipInventory: ["Weescow", "Midgeito", "Keiship"] },
            { name: "Copper Extractor", type: "Copper Mine", description: "Leontons copper rich moon is the heart of the systems economy." }
        ]
    },
    {
        id: 5, name: "Britel", x: 555, y: 576,
        description: "A sleepy backwater.",
        npcSpawns: [
            { name: "Trader", shipType: "Keiship", shipImage: "ship_keiship.png", encounter: "civilian001", chance: 0.5,
                stats: { hull: 20, armour: 10, handling: 20, firepower: 10, accuracy: 0, piloting: 20, weapon: 20 } },
            { name: "Taxi", shipType: "Weescow", shipImage: "ship_weescow.png", encounter: "civilian001", chance: 0.3,
                stats: { hull: 20, armour: 10, handling: 20, firepower: 10, accuracy: 0, piloting: 20, weapon: 20 } },
            { name: "Desperate Pirate", shipType: "Weescow", shipImage: "ship_weescow.png", encounter: "herb01", chance: 0.1, isHostile: true,
                stats: { hull: 20, armour: 8, handling: 20, firepower: 10, accuracy: 5, piloting: 10, weapon: 10 } },
            { name: "Locust Raider", shipType: "Locus Raider", shipImage: "ship_raider001.png", encounter: "locus_raider", chance: 0.05, isHostile: true,
                stats: { hull: 40, armour: 15, handling: 30, firepower: 30, accuracy: 15, piloting: 20, weapon: 20 } }
        ],
        pois: [
            { name: "Salty's Hydroponics Inc", type: "Plant Farm", description: "" }
        ]
    },
    {
        id: 6, name: "Stollen", x: 572, y: 559,
        image: "star_system_002.png",
        description: "A lonely binary system.",
        npcSpawns: [
            { name: "Taxi", shipType: "Weescow", shipImage: "ship_weescow.png", encounter: "civilian001", chance: 0.1,
                stats: { hull: 20, armour: 10, handling: 20, firepower: 10, accuracy: 0, piloting: 20, weapon: 20 } },
            { name: "Trader", shipType: "Keiship", shipImage: "ship_keiship.png", encounter: "civilian001", chance: 0.1,
                stats: { hull: 20, armour: 10, handling: 20, firepower: 10, accuracy: 0, piloting: 20, weapon: 20 } },
            { name: "Trader", shipType: "Weescow", shipImage: "ship_weescow.png", encounter: "civilian001", chance: 0.1,
                stats: { hull: 20, armour: 10, handling: 20, firepower: 10, accuracy: 0, piloting: 20, weapon: 20 } },
            { name: "Local Traffic", shipType: "Keiship", shipImage: "ship_keiship.png", encounter: "civilian001", chance: 0.1,
                stats: { hull: 20, armour: 10, handling: 20, firepower: 10, accuracy: 0, piloting: 20, weapon: 20 } },
            { name: "Local Traffic", shipType: "Weescow", shipImage: "ship_weescow.png", encounter: "civilian001", chance: 0.1,
                stats: { hull: 20, armour: 10, handling: 20, firepower: 10, accuracy: 0, piloting: 20, weapon: 20 } },
            { name: "Trader", shipType: "Keiship", shipImage: "ship_keiship.png", encounter: "civilian001", chance: 0.1,
                stats: { hull: 20, armour: 10, handling: 20, firepower: 10, accuracy: 0, piloting: 20, weapon: 20 } },
            { name: "Desperate Pirate", shipType: "Weescow", shipImage: "ship_weescow.png", encounter: "herb01", chance: 0.1, isHostile: true,
                stats: { hull: 20, armour: 8, handling: 20, firepower: 10, accuracy: 5, piloting: 5, weapon: 5 } },
            { name: "Bounty hunter", shipType: "Midgeito", shipImage: "ship_midgeito.png", encounter: "civilian001", chance: 0.5,
                stats: { hull: 24, armour: 10, handling: 25, firepower: 12, accuracy: 8, piloting: 10, weapon: 10 } }
        ],
        pois: [
            { name: "Metprong Extractions Inc", type: "Iron Mine", description: "" },
            { name: "Platinum Acquisition Plant 023", type: "Platinum Mine", description: "" }
        ]
    },
    {
        id: 7, name: "Barron Locus", x: 564, y: 611,
        description: "Home system of the mysterious Locus cult. Everyone calls them brainwashed fanatics. They <i>hate</i> that.",
        npcSpawns: [
            { name: "Locus Raider", shipType: "Locus Raider", shipImage: "ship_raider001.png", encounter: "locus_raider", chance: 1, isHostile: true,
                stats: { hull: 40, armour: 15, handling: 30, firepower: 30, accuracy: 15, piloting: 20, weapon: 20 } }
        ],
        pois: [
            { name: "Scary Raider Base", type: "Outpost", image: "station001.png", description: "" }
        ]
    },
    {
        id: 8, name: "Logus", x: 607, y: 547,
        description: "The industrial heart of the sector.",
        npcSpawns: [
            { name: "Cop", shipType: "Weescow", shipImage: "ship_keiship.png", encounter: "Police Patrol", chance: 0.05, isHostile: true },
            { name: "Taxi", shipType: "Weescow", shipImage: "ship_weescow.png", encounter: "civilian001", chance: 0.1,
                stats: { hull: 20, armour: 10, handling: 20, firepower: 10, accuracy: 0, piloting: 20, weapon: 20 } },
            { name: "Trader", shipType: "Keiship", shipImage: "ship_keiship.png", encounter: "civilian001", chance: 0.1,
                stats: { hull: 20, armour: 10, handling: 20, firepower: 10, accuracy: 0, piloting: 20, weapon: 20 } },
            { name: "Trader", shipType: "Weescow", shipImage: "ship_weescow.png", encounter: "civilian001", chance: 0.1,
                stats: { hull: 20, armour: 10, handling: 20, firepower: 10, accuracy: 0, piloting: 20, weapon: 20 } },
            { name: "Local Traffic", shipType: "Keiship", shipImage: "ship_keiship.png", encounter: "civilian001", chance: 0.1,
                stats: { hull: 20, armour: 10, handling: 20, firepower: 10, accuracy: 0, piloting: 20, weapon: 20 } },
            { name: "Local Traffic", shipType: "Weescow", shipImage: "ship_weescow.png", encounter: "civilian001", chance: 0.1,
                stats: { hull: 20, armour: 10, handling: 20, firepower: 10, accuracy: 0, piloting: 20, weapon: 20 } },
            { name: "Trader", shipType: "Keiship", shipImage: "ship_keiship.png", encounter: "civilian001", chance: 0.1,
                stats: { hull: 20, armour: 10, handling: 20, firepower: 10, accuracy: 0, piloting: 20, weapon: 20 } },
            { name: "Desperate Pirate", shipType: "Weescow", shipImage: "ship_weescow.png", encounter: "herb01", chance: 0.1, isHostile: true,
                stats: { hull: 20, armour: 8, handling: 20, firepower: 10, accuracy: 5, piloting: 5, weapon: 5 } },
            { name: "Bounty hunter", shipType: "Midgeito", shipImage: "ship_midgeito.png", encounter: "civilian001", chance: 0.5,
                stats: { hull: 24, armour: 10, handling: 25, firepower: 12, accuracy: 8, piloting: 10, weapon: 10 } }
        ],
        pois: [
            { name: "Logus Cabs", type: "Outpost", image: "station001.png", encounters: ["Dispatcher Jools"], description: "Cheap, but not cheerful" },
            { name: "Stoop's Startship Repairs", type: "Repair Station", description: "", repairCost: 8 },
            { name: "Bitz and Bobs Outfitters", type: "Outfitter", encounters: ["Bitz", "Bob"], inventory: ["Armour T1", "Armour T2", "Bay T1", "Bay T2", "Bay T3", "Thrust T1", "Thrust T2", "Thrust T3", "Weap T1", "Weap T2", "Cargo Exp T1", "T1 FP", "T2 FP", "T1 ACC", "Weap S1", "Thrust S1", "Armour S1", "Armour T3", "Drive T2", "Drive T1"] },
            { name: "Smogus Industries", type: "Metal Ore Refinery", description: "" },
            { name: "Protein Shakers Union", type: "Plant Processing Facility", description: "" }
        ]
    },
    {
        id: 9, name: "Stoolar", x: 588, y: 594,
        npcSpawns: [
            { name: "Trader", shipType: "Keiship", shipImage: "ship_keiship.png", encounter: "civilian001", chance: 0.5,
                stats: { hull: 20, armour: 10, handling: 20, firepower: 10, accuracy: 0, piloting: 20, weapon: 20 } },
            { name: "Taxi", shipType: "Weescow", shipImage: "ship_weescow.png", encounter: "civilian001", chance: 0.3,
                stats: { hull: 20, armour: 10, handling: 20, firepower: 10, accuracy: 0, piloting: 20, weapon: 20 } },
            { name: "Desperate Pirate", shipType: "Weescow", shipImage: "ship_weescow.png", encounter: "herb01", chance: 0.1, isHostile: true,
                stats: { hull: 20, armour: 8, handling: 20, firepower: 10, accuracy: 5, piloting: 10, weapon: 10 } },
            { name: "Locust Raider", shipType: "Locus Raider", shipImage: "ship_raider001.png", encounter: "locus_raider", chance: 0.1, isHostile: true,
                stats: { hull: 40, armour: 15, handling: 30, firepower: 30, accuracy: 15, piloting: 20, weapon: 20 } }
        ],
        pois: [
            { name: "Farbabtech Mine 01", type: "Silicon Mine", description: "" },
            { name: "Farbabtech Mine 02", type: "Ice Mine", description: "" }
        ]
    },
    {
        id: 10, name: "Prince", x: 586, y: 528,
        npcSpawns: [
            { name: "Taxi", shipType: "Weescow", shipImage: "ship_weescow.png", encounter: "civilian001", chance: 0.1,
                stats: { hull: 20, armour: 10, handling: 20, firepower: 10, accuracy: 0, piloting: 20, weapon: 20 } },
            { name: "Trader", shipType: "Keiship", shipImage: "ship_keiship.png", encounter: "civilian001", chance: 0.1,
                stats: { hull: 20, armour: 10, handling: 20, firepower: 10, accuracy: 0, piloting: 20, weapon: 20 } },
            { name: "Trader", shipType: "Weescow", shipImage: "ship_weescow.png", encounter: "civilian001", chance: 0.1,
                stats: { hull: 20, armour: 10, handling: 20, firepower: 10, accuracy: 0, piloting: 20, weapon: 20 } },
            { name: "Local Traffic", shipType: "Keiship", shipImage: "ship_keiship.png", encounter: "civilian001", chance: 0.1,
                stats: { hull: 20, armour: 10, handling: 20, firepower: 10, accuracy: 0, piloting: 20, weapon: 20 } },
            { name: "Local Traffic", shipType: "Weescow", shipImage: "ship_weescow.png", encounter: "civilian001", chance: 0.1,
                stats: { hull: 20, armour: 10, handling: 20, firepower: 10, accuracy: 0, piloting: 20, weapon: 20 } },
            { name: "Trader", shipType: "Keiship", shipImage: "ship_keiship.png", encounter: "civilian001", chance: 0.1,
                stats: { hull: 20, armour: 10, handling: 20, firepower: 10, accuracy: 0, piloting: 20, weapon: 20 } },
            { name: "Desperate Pirate", shipType: "Weescow", shipImage: "ship_weescow.png", encounter: "herb01", chance: 0.1, isHostile: true,
                stats: { hull: 20, armour: 8, handling: 20, firepower: 10, accuracy: 5, piloting: 5, weapon: 5 } },
            { name: "Bounty hunter", shipType: "Midgeito", shipImage: "ship_midgeito.png", encounter: "civilian001", chance: 0.5,
                stats: { hull: 24, armour: 10, handling: 25, firepower: 12, accuracy: 8, piloting: 10, weapon: 10 } }
        ],
        pois: [
            { name: "Princeton Ranch", type: "Livestock Farm", image: "farm001.png", description: "Hairy rumptars graze the purple grasses as far as the eye can see. The stench is eyewatering." }
        ]
    },
    {
        id: 11, name: "Lonnar", x: 619, y: 575,
        description: "Trade hub and bridge to the wider galaxy",
        npcSpawns: [
            { name: "Cop", shipType: "Weescow", shipImage: "ship_keiship.png", encounter: "Police Patrol", chance: 0.05, isHostile: true },
            { name: "Taxi", shipType: "Weescow", shipImage: "ship_weescow.png", encounter: "civilian001", chance: 0.1,
                stats: { hull: 20, armour: 10, handling: 20, firepower: 10, accuracy: 0, piloting: 20, weapon: 20 } },
            { name: "Trader", shipType: "Keiship", shipImage: "ship_keiship.png", encounter: "civilian001", chance: 0.1,
                stats: { hull: 20, armour: 10, handling: 20, firepower: 10, accuracy: 0, piloting: 20, weapon: 20 } },
            { name: "Trader", shipType: "Weescow", shipImage: "ship_weescow.png", encounter: "civilian001", chance: 0.1,
                stats: { hull: 20, armour: 10, handling: 20, firepower: 10, accuracy: 0, piloting: 20, weapon: 20 } },
            { name: "Local Traffic", shipType: "Keiship", shipImage: "ship_keiship.png", encounter: "civilian001", chance: 0.1,
                stats: { hull: 20, armour: 10, handling: 20, firepower: 10, accuracy: 0, piloting: 20, weapon: 20 } },
            { name: "Local Traffic", shipType: "Weescow", shipImage: "ship_weescow.png", encounter: "civilian001", chance: 0.1,
                stats: { hull: 20, armour: 10, handling: 20, firepower: 10, accuracy: 0, piloting: 20, weapon: 20 } },
            { name: "Trader", shipType: "Keiship", shipImage: "ship_keiship.png", encounter: "civilian001", chance: 0.1,
                stats: { hull: 20, armour: 10, handling: 20, firepower: 10, accuracy: 0, piloting: 20, weapon: 20 } },
            { name: "Desperate Pirate", shipType: "Weescow", shipImage: "ship_weescow.png", encounter: "herb01", chance: 0.1, isHostile: true,
                stats: { hull: 20, armour: 8, handling: 20, firepower: 10, accuracy: 5, piloting: 5, weapon: 5 } },
            { name: "Bounty hunter", shipType: "Midgeito", shipImage: "ship_midgeito.png", encounter: "civilian001", chance: 0.5,
                stats: { hull: 24, armour: 10, handling: 25, firepower: 12, accuracy: 8, piloting: 10, weapon: 10 } }
        ],
        pois: [
            { name: "Lonnar Commercial Park", type: "Trade Hub", description: "" },
            { name: "RoachFab Inc.", type: "Machine Parts Factory", description: "" }
        ]
    },
    {
        id: 12, name: "Darklani", x: 515, y: 526,
        npcSpawns: [
            { name: "Taxi", shipType: "Weescow", shipImage: "ship_weescow.png", encounter: "civilian001", chance: 0.1,
                stats: { hull: 20, armour: 10, handling: 20, firepower: 10, accuracy: 0, piloting: 20, weapon: 20 } },
            { name: "Trader", shipType: "Keiship", shipImage: "ship_keiship.png", encounter: "civilian001", chance: 0.1,
                stats: { hull: 20, armour: 10, handling: 20, firepower: 10, accuracy: 0, piloting: 20, weapon: 20 } },
            { name: "Trader", shipType: "Weescow", shipImage: "ship_weescow.png", encounter: "civilian001", chance: 0.1,
                stats: { hull: 20, armour: 10, handling: 20, firepower: 10, accuracy: 0, piloting: 20, weapon: 20 } },
            { name: "Local Traffic", shipType: "Keiship", shipImage: "ship_keiship.png", encounter: "civilian001", chance: 0.1,
                stats: { hull: 20, armour: 10, handling: 20, firepower: 10, accuracy: 0, piloting: 20, weapon: 20 } },
            { name: "Local Traffic", shipType: "Weescow", shipImage: "ship_weescow.png", encounter: "civilian001", chance: 0.1,
                stats: { hull: 20, armour: 10, handling: 20, firepower: 10, accuracy: 0, piloting: 20, weapon: 20 } },
            { name: "Trader", shipType: "Keiship", shipImage: "ship_keiship.png", encounter: "civilian001", chance: 0.1,
                stats: { hull: 20, armour: 10, handling: 20, firepower: 10, accuracy: 0, piloting: 20, weapon: 20 } },
            { name: "Desperate Pirate", shipType: "Weescow", shipImage: "ship_weescow.png", encounter: "herb01", chance: 0.1, isHostile: true,
                stats: { hull: 20, armour: 8, handling: 20, firepower: 10, accuracy: 5, piloting: 5, weapon: 5 } },
            { name: "Bounty hunter", shipType: "Midgeito", shipImage: "ship_midgeito.png", encounter: "civilian001", chance: 0.5,
                stats: { hull: 24, armour: 10, handling: 25, firepower: 12, accuracy: 8, piloting: 10, weapon: 10 } }
        ],
        pois: [
            { name: "Rockchewer 052", type: "Ice Mine", description: "" }
        ]
    },
    {
        id: 13, name: "Depratz", x: 693, y: 581,
        pois: [
            { name: "Abandoned outpost", type: "Outpost", image: "station006.png", encounters: ["Mysterious Janitor"], description: "" }
        ]
    },
    {
        id: 14, name: "Rappar", x: 519, y: 582,
        npcSpawns: [
            { name: "Taxi", shipType: "Weescow", shipImage: "ship_weescow.png", encounter: "civilian001", chance: 0.1,
                stats: { hull: 20, armour: 10, handling: 20, firepower: 10, accuracy: 0, piloting: 20, weapon: 20 } },
            { name: "Trader", shipType: "Keiship", shipImage: "ship_keiship.png", encounter: "civilian001", chance: 0.1,
                stats: { hull: 20, armour: 10, handling: 20, firepower: 10, accuracy: 0, piloting: 20, weapon: 20 } },
            { name: "Trader", shipType: "Weescow", shipImage: "ship_weescow.png", encounter: "civilian001", chance: 0.1,
                stats: { hull: 20, armour: 10, handling: 20, firepower: 10, accuracy: 0, piloting: 20, weapon: 20 } },
            { name: "Local Traffic", shipType: "Keiship", shipImage: "ship_keiship.png", encounter: "civilian001", chance: 0.1,
                stats: { hull: 20, armour: 10, handling: 20, firepower: 10, accuracy: 0, piloting: 20, weapon: 20 } },
            { name: "Local Traffic", shipType: "Weescow", shipImage: "ship_weescow.png", encounter: "civilian001", chance: 0.1,
                stats: { hull: 20, armour: 10, handling: 20, firepower: 10, accuracy: 0, piloting: 20, weapon: 20 } },
            { name: "Trader", shipType: "Keiship", shipImage: "ship_keiship.png", encounter: "civilian001", chance: 0.1,
                stats: { hull: 20, armour: 10, handling: 20, firepower: 10, accuracy: 0, piloting: 20, weapon: 20 } },
            { name: "Desperate Pirate", shipType: "Weescow", shipImage: "ship_weescow.png", encounter: "herb01", chance: 0.1, isHostile: true,
                stats: { hull: 20, armour: 8, handling: 20, firepower: 10, accuracy: 5, piloting: 5, weapon: 5 } },
            { name: "Bounty hunter", shipType: "Midgeito", shipImage: "ship_midgeito.png", encounter: "civilian001", chance: 0.5,
                stats: { hull: 24, armour: 10, handling: 25, firepower: 12, accuracy: 8, piloting: 10, weapon: 10 } }
        ],
        pois: [
            { name: "Prospectors Rock", type: "Gold Mine", image: "mine002.png", description: "" }
        ]
    },
    {
        id: 15, name: "Stool", x: 553, y: 519,
        image: "star_system_002.png",
        description: "A lonely binary system, devoid of planets.",
        pois: [
            { name: "Abandoned outpost", type: "Outpost", image: "station006.png", description: "" }
        ]
    }
];












