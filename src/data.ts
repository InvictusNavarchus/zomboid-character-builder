export type Skill = 
  // Combat
  | 'Axe' | 'Long Blunt' | 'Short Blunt' | 'Long Blade' | 'Short Blade' | 'Spear' | 'Maintenance'
  // Crafting
  | 'Carpentry' | 'Cooking' | 'Agriculture' | 'First Aid' | 'Electrical' | 'Welding' | 'Mechanics' | 'Tailoring'
  // B42 Crafting / Survival
  | 'Blacksmithing' | 'Masonry' | 'Carving' | 'Pottery' | 'Glassmaking' | 'Knapping'
  // Firearms
  | 'Aiming' | 'Reloading'
  // Survival
  | 'Fishing' | 'Trapping' | 'Foraging' | 'Animal Care' | 'Butchering' | 'Tracking'
  // Physical
  | 'Fitness' | 'Strength'
  // Agility
  | 'Running' | 'Lightfooted' | 'Nimble' | 'Sneaking';

export type StatModifiers = Partial<Record<Skill, number>>;

export interface Trait {
  id: string;
  name: string;
  cost: number; // Positive means it GIVES points to spend (Negative traits), Negative means it COSTS points to spend (Positive traits)
  description: string;
  effects: string;
  modifiers?: StatModifiers;
  type: 'positive' | 'negative' | 'hobby' | 'occupation';
}

export interface Occupation {
  id: string;
  name: string;
  points: number;
  description: string;
  modifiers?: StatModifiers;
  freeTraits?: string[]; 
}

const mutuallyExclusiveGroups: string[][] = [
  ['deaf', 'hardOfHearing', 'keenHearing'],
  ['athletic', 'fit', 'outOfShape', 'unfit'],
  ['strong', 'stout', 'feeble', 'puny'],
  ['fastHealer', 'slowHealer'],
  ['fastLearner', 'slowLearner'],
  ['fastReader', 'slowReader', 'illiterate'],
  ['brave', 'cowardly'],
  ['lightEater', 'heartyAppetite'],
  ['lowThirst', 'highThirst'],
  ['dextrous', 'allThumbs'],
  ['graceful', 'clumsy'],
  ['inconspicuous', 'conspicuous'],
  ['fastMetabolism', 'slowMetabolism'],
  ['wakeful', 'sleepyhead', 'restlessSleeper'],
  ['organized', 'disorganized'],
  ['resilient', 'proneToIllness'],
  ['thickSkinned', 'thinSkinned'],
  ['ironGut', 'weakStomach'],
  ['speedDemon', 'sundayDriver'],
  ['desensitized', 'brave', 'cowardly', 'agoraphobic', 'claustrophobic', 'adrenalineJunkie'],
  ['obese', 'overweight', 'underweight', 'veryUnderweight', 'emaciated'],
  ['pacifist', 'brawler', 'baseballPlayer', 'hunter'], // Somewhat subjective, but PZ prevents combative hobbies if pacifist (sometimes). We'll leave it out if we're strictly PZ. Wait, PZ allows Pacifist + Hunter! So I'll remove it.
];

export const getExclusions = (traitId: string): string[] => {
  const exclusions = new Set<string>();
  mutuallyExclusiveGroups.forEach(group => {
    if (group.includes(traitId)) {
      group.forEach(id => {
        if (id !== traitId) exclusions.add(id);
      });
    }
  });
  return Array.from(exclusions);
};

export const occupations: Occupation[] = [
  { id: 'custom', name: 'Custom', points: 8, description: 'Use free trait points to make a custom build for your character.' },
  { id: 'blacksmith', name: 'Blacksmith', points: -6, description: 'Can build a stone furnace and work metal.', modifiers: { Blacksmithing: 4, Maintenance: 1, 'Short Blunt': 1 }, freeTraits: ['blacksmithKnowledge'] },
  { id: 'burgerFlipper', name: 'Burger Flipper', points: 2, description: '', modifiers: { Cooking: 2, Maintenance: 1, 'Short Blade': 1 }, freeTraits: ['keenCook'] },
  { id: 'burglar', name: 'Burglar', points: -6, description: '', modifiers: { Lightfooted: 2, Nimble: 2, Sneaking: 2 }, freeTraits: ['burglar'] },
  { id: 'carpenter', name: 'Carpenter', points: -2, description: '', modifiers: { Carpentry: 4, Carving: 1, Maintenance: 1, Masonry: 1, 'Short Blunt': 1 } },
  { id: 'chef', name: 'Chef', points: -2, description: '', modifiers: { Butchering: 2, Cooking: 4, Maintenance: 1, 'Short Blunt': 1 }, freeTraits: ['keenCook'] },
  { id: 'constructionWorker', name: 'Construction Worker', points: -2, description: '', modifiers: { Carpentry: 1, 'Long Blunt': 1, Maintenance: 1, Masonry: 2, 'Short Blunt': 2 } },
  { id: 'diyExpert', name: 'DIY Expert', points: -4, description: '', modifiers: { Carpentry: 1, Carving: 1, Maintenance: 2, Masonry: 1, 'Short Blunt': 1 } },
  { id: 'doctor', name: 'Doctor', points: -2, description: '', modifiers: { 'First Aid': 6, 'Short Blade': 1 } },
  { id: 'electrician', name: 'Electrician', points: -4, description: 'Can operate generators.', modifiers: { Electrical: 5 } },
  { id: 'engineer', name: 'Engineer', points: -4, description: 'Can make traps and explosives.\nCan operate generators.', modifiers: { Carpentry: 1, Electrical: 1, Masonry: 1 } },
  { id: 'farmer', name: 'Crop Farmer', points: 0, description: '', modifiers: { Agriculture: 4, 'Animal Care': 1 } },
  { id: 'fireOfficer', name: 'Fire Officer', points: 0, description: '', modifiers: { Axe: 1, Fitness: 1, Running: 1, Strength: 1 } },
  { id: 'angler_occ', name: 'Angler', points: -2, description: '', modifiers: { Butchering: 1, Fishing: 3, Foraging: 1 } },
  { id: 'fitnessInstructor', name: 'Fitness Instructor', points: -6, description: '', modifiers: { Fitness: 3, Running: 2, Strength: 1 }, freeTraits: ['nutritionist'] },
  { id: 'lumberjack', name: 'Lumberjack', points: 0, description: 'Slightly faster movement through forests and woodland.\nLess muscle strain from chopping trees.', modifiers: { Axe: 2, Maintenance: 1, Strength: 1 }, freeTraits: ['axpert'] },
  { id: 'mechanic', name: 'Mechanic', points: -4, description: 'Familiar with the maintenance and repair of all vehicle models on the roads of Kentucky.', modifiers: { Mechanics: 4, Welding: 1 }, freeTraits: ['vehicleKnowledge'] },
  { id: 'nurse', name: 'Nurse', points: -2, description: '', modifiers: { 'First Aid': 3, Fitness: 1, Lightfooted: 1 }, freeTraits: ['nightOwl'] },
  { id: 'parkRanger', name: 'Park Ranger', points: -4, description: 'Much faster movement through forests and woodland.', modifiers: { 'First Aid': 1, Foraging: 1, Knapping: 1, Tracking: 1, Trapping: 1 }, freeTraits: ['herbalist'] },
  { id: 'policeOfficer', name: 'Police Officer', points: -4, description: '', modifiers: { Aiming: 4, Nimble: 1, Reloading: 1 } },
  { id: 'rancher', name: 'Livestock Farmer', points: -2, description: '', modifiers: { Agriculture: 1, 'Animal Care': 4, Butchering: 3 } },
  { id: 'securityGuard', name: 'Security Guard', points: -2, description: '', modifiers: { Lightfooted: 1, Running: 2, 'Short Blunt': 1 }, freeTraits: ['nightOwl'] },
  { id: 'tailor', name: 'Tailor', points: 2, description: '', modifiers: { Tailoring: 4 } },
  { id: 'veteran', name: 'Veteran', points: -8, description: '', modifiers: { Aiming: 2, Reloading: 2 }, freeTraits: ['desensitized'] },
  { id: 'welder', name: 'Welder', points: -6, description: 'Can weld foraged metal to create items and barricades.', modifiers: { Welding: 4 } }
];

export const traits: Trait[] = [
  // --- Positives (costs are negative) ---
  { id: 'adrenalineJunkie', name: 'Adrenaline Junkie', cost: -4, description: 'Moves faster when highly panicked.', effects: 'Adds a flat bonus to base speed at Strong or Extreme Panic.', type: 'positive' },
  { id: 'angler', name: 'Angler', cost: -4, description: 'Knows the basics of fishing.', effects: 'Knows how to make and fix a fishing rod. Improves foraging.', modifiers: { Fishing: 1 }, type: 'positive' },
  { id: 'artisan', name: 'Artisan', cost: -2, description: 'Better at pottery and glass crafts.', effects: '', modifiers: { Glassmaking: 1, Pottery: 1 }, type: 'positive' },
  { id: 'athletic', name: 'Athletic', cost: -10, description: 'Can run faster and longer without tiring.', effects: '+20% running/sprinting speed. -20% endurance loss.', modifiers: { Fitness: 4 }, type: 'positive' },
  { id: 'baseballPlayer', name: 'Baseball Player', cost: -4, description: 'Has practice with a baseball bat.', effects: '', modifiers: { 'Long Blunt': 1 }, type: 'positive' },
  { id: 'brave', name: 'Brave', cost: -4, description: 'Less prone to becoming panicked.', effects: '30% panic except for night terrors and phobias.', type: 'positive' },
  { id: 'brawler', name: 'Brawler', cost: -6, description: 'Used to getting into trouble.', effects: '', modifiers: { Axe: 1, 'Long Blunt': 1 }, type: 'positive' },
  { id: 'catsEyes', name: 'Cat\'s Eyes', cost: -3, description: 'Better vision at night.', effects: '+20% better vision at night. Improves foraging.', type: 'positive' },
  { id: 'crafty', name: 'Crafty', cost: -3, description: 'Increased XP gains for Crafting skills.', effects: '130% XP for all crafting skills.', type: 'positive' },
  { id: 'dextrous', name: 'Dextrous', cost: -2, description: 'Transfers inventory items quickly.', effects: '50% inventory transferring time.', type: 'positive' },
  { id: 'eagleEyed', name: 'Eagle Eyed', cost: -4, description: 'Faster visibility fade, higher visibility arc.', effects: 'Wider field of view. Improves foraging.', type: 'positive' },
  { id: 'fastHealer', name: 'Fast Healer', cost: -6, description: 'Recovers faster from injury and illness.', effects: '', type: 'positive' },
  { id: 'fastLearner', name: 'Fast Learner', cost: -6, description: 'Increases XP gains.', effects: '130% XP for all skills except Strength and Fitness.', type: 'positive' },
  { id: 'fastReader', name: 'Fast Reader', cost: -2, description: 'Takes less time to read books.', effects: '130% reading speed.', type: 'positive' },
  { id: 'firstAider', name: 'First Aider', cost: -4, description: 'Has CPR and First Aid certificates.', effects: '', modifiers: { 'First Aid': 1 }, type: 'positive' },
  { id: 'fit', name: 'Fit', cost: -6, description: 'In good physical shape.', effects: '', modifiers: { Fitness: 2 }, type: 'positive' },
  { id: 'formerScout', name: 'Former Scout', cost: -6, description: 'Knows wild berries and treating injuries.', effects: 'Knows how to make & fix fishing rod. Improves foraging.', modifiers: { 'First Aid': 1, Fishing: 1, Foraging: 1 }, type: 'positive' },
  { id: 'gardener', name: 'Gardener', cost: -2, description: 'Has basic agriculture knowledge.', effects: 'Improves foraging.', modifiers: { Agriculture: 1 }, type: 'positive' },
  { id: 'graceful', name: 'Graceful', cost: -4, description: 'Makes less noise when moving.', effects: '60% footstep sound radius.', type: 'positive' },
  { id: 'gymnast', name: 'Gymnast', cost: -5, description: 'Agile and discreet.', effects: '', modifiers: { Lightfooted: 1, Nimble: 1 }, type: 'positive' },
  { id: 'handy', name: 'Handy', cost: -8, description: 'Faster and stronger constructions.', effects: '+100HP to all constructions. Increases building speed.', modifiers: { Carpentry: 1, Carving: 1, Maintenance: 1, Masonry: 1 }, type: 'positive' },
  { id: 'herbalist', name: 'Herbalist', cost: -4, description: 'Can find medicinal plants and craft medicines.', effects: 'Able to find herbal medicines and identify poisonous food.', modifiers: { Foraging: 1 }, type: 'positive' },
  { id: 'hiker', name: 'Hiker', cost: -6, description: 'Used to surviving in the jungle.', effects: 'Improves foraging.', modifiers: { Foraging: 1, Trapping: 1 }, type: 'positive' },
  { id: 'hunter', name: 'Hunter', cost: -8, description: 'Know the basics of hunting.', effects: 'Improves foraging.', modifiers: { Aiming: 1, 'Short Blade': 1, Sneaking: 1, Trapping: 1, Butchering: 1 }, type: 'positive' },
  { id: 'inconspicuous', name: 'Inconspicuous', cost: -4, description: 'Less likely to be spotted by zombies.', effects: '50% chance of zombies spotting you.', type: 'positive' },
  { id: 'inventive', name: 'Inventive', cost: -2, description: 'Lower skill level requirements to research recipes.', effects: '', type: 'positive' },
  { id: 'ironGut', name: 'Iron Gut', cost: -3, description: 'Less chance to have food illness.', effects: '50% chance of food illness.', type: 'positive' },
  { id: 'keenHearing', name: 'Keen Hearing', cost: -6, description: 'Larger perception radius.', effects: '200% perception radius.', type: 'positive' },
  { id: 'lightEater', name: 'Light Eater', cost: -2, description: 'Needs to eat less regularly.', effects: '75% hunger.', type: 'positive' },
  { id: 'lowThirst', name: 'Low Thirst', cost: -2, description: 'Needs to drink water less regularly.', effects: '50% thirst.', type: 'positive' },
  { id: 'mason', name: 'Mason', cost: -2, description: 'Better at building stone & brick constructions.', effects: '', modifiers: { Masonry: 2 }, type: 'positive' },
  { id: 'nightOwl', name: 'Night Owl', cost: -2, description: 'Requires little sleep. Stays extra alert when sleeping.', effects: 'Increases sleep efficiency.', type: 'positive' },
  { id: 'nutritionist', name: 'Nutritionist', cost: -4, description: 'Can see the nutritional values of any food.', effects: 'Improves foraging.', type: 'positive' },
  { id: 'organized', name: 'Organized', cost: -4, description: 'Increased container inventory capacity.', effects: '130% capacity for all containers.', type: 'positive' },
  { id: 'outdoorsy', name: 'Outdoorsy', cost: -2, description: 'Not affected by harsh weather conditions.', effects: '10% chance of catching a cold. Start campfires faster.', type: 'positive' },
  { id: 'resilient', name: 'Resilient', cost: -4, description: 'Less prone to disease. Slower zombification.', effects: '75% zombification progression rate.', type: 'positive' },
  { id: 'runner', name: 'Runner', cost: -4, description: 'Runner in the spare times.', effects: '', modifiers: { Running: 1 }, type: 'positive' },
  { id: 'sewer', name: 'Sewer', cost: -4, description: '+1 Tailoring', effects: '', modifiers: { Tailoring: 1 }, type: 'positive' },
  { id: 'speedDemon', name: 'Speed Demon', cost: -1, description: 'The fast driver.', effects: '200% Gear switching speed, 115% top speed.', type: 'positive' },
  { id: 'stout', name: 'Stout', cost: -6, description: 'Extra knockback and increased carry weight.', effects: '', modifiers: { Strength: 2 }, type: 'positive' },
  { id: 'strong', name: 'Strong', cost: -10, description: 'Extra knockback and increased carry weight.', effects: '+40% knockback power.', modifiers: { Strength: 4 }, type: 'positive' },
  { id: 'targetShooter', name: 'Target Shooter', cost: -5, description: '', effects: '', modifiers: { Aiming: 1 }, type: 'positive' },
  { id: 'thickSkinned', name: 'Thick Skinned', cost: -8, description: 'Less chance of scratches or bites breaking the skin.', effects: '', type: 'positive' },
  { id: 'tinkerer', name: 'Tinkerer', cost: -4, description: '', effects: '', modifiers: { Maintenance: 1 }, type: 'positive' },
  { id: 'wakeful', name: 'Wakeful', cost: -3, description: 'Needs less sleep.', effects: '-30% Fatigue increase rate, +10% Sleep efficiency.', type: 'positive' },
  { id: 'whittler', name: 'Whittler', cost: -2, description: 'Can carve wood and bone items.', effects: 'Can craft Bone Hooks, Needles. Improves foraging.', modifiers: { Carving: 2 }, type: 'positive' },
  { id: 'wildernessKnowledge', name: 'Bushcrafter', cost: -8, description: 'Can find herbs and craft simple stone/bone tools.', effects: 'Improves foraging.', modifiers: { Carving: 1, Foraging: 1, Knapping: 1, Maintenance: 1 }, type: 'positive' },
  
  // --- Negatives (costs are positive) ---
  { id: 'agoraphobic', name: 'Agoraphobic', cost: 4, description: 'Gets panicked when outdoors.', effects: 'Panic increases when outdoors. Foraging radius decreased.', type: 'negative' },
  { id: 'allThumbs', name: 'All Thumbs', cost: 2, description: 'Transfers inventory items slowly.', effects: '400% inventory transferring time.', type: 'negative' },
  { id: 'asthmatic', name: 'Asthmatic', cost: 5, description: 'Faster endurance loss.', effects: '140% sprinting endurance loss. 130% swing endurance loss.', type: 'negative' },
  { id: 'claustrophobic', name: 'Claustrophobic', cost: 4, description: 'Gets panicked when indoors.', effects: 'Panic increases when indoors.', type: 'negative' },
  { id: 'clumsy', name: 'Clumsy', cost: 2, description: 'Makes more noise when moving.', effects: '120% footsteps sound radius.', type: 'negative' },
  { id: 'conspicuous', name: 'Conspicuous', cost: 4, description: 'More likely to be spotted by zombies.', effects: '200% chance of getting spotted.', type: 'negative' },
  { id: 'cowardly', name: 'Cowardly', cost: 2, description: 'Especially prone to becoming panicked.', effects: '200% panic except night terrors and phobias.', type: 'negative' },
  { id: 'deaf', name: 'Deaf', cost: 12, description: 'Smaller perception radius and hearing range.', effects: 'Cannot hear sound.', type: 'negative' },
  { id: 'disorganized', name: 'Disorganized', cost: 6, description: 'Decreased container inventory capacity.', effects: '70% capacity for all containers.', type: 'negative' },
  { id: 'emaciated', name: 'Emaciated', cost: 10, description: 'Low strength, endurance, prone to injury.', effects: '', type: 'negative' },  // Usually dynamic, but giving a cost just in case
  { id: 'fastMetabolism', name: 'Fast Metabolism', cost: 2, description: 'Permanent tendency to lose weight. Starts with Low Weight.', effects: '', type: 'negative' },
  { id: 'fearOfBlood', name: 'Fear of Blood', cost: 5, description: 'Panic when performing first aid on self.', effects: 'Cannot perform first aid on others, stressed when bloody.', type: 'negative' },
  { id: 'feeble', name: 'Feeble', cost: 6, description: 'Less knockback. Decreased carrying weight.', effects: '', modifiers: { Strength: -2 }, type: 'negative' },
  { id: 'hardOfHearing', name: 'Hard of Hearing', cost: 4, description: 'Smaller perception radius. Smaller hearing range.', effects: 'Sound will be muffled.', type: 'negative' },
  { id: 'heartyAppetite', name: 'Hearty Appetite', cost: 4, description: 'Needs to eat more regularly.', effects: '150% hunger. +3% bonus to finding some foods.', type: 'negative' },
  { id: 'highThirst', name: 'High Thirst', cost: 6, description: 'Needs more water to survive.', effects: '100% more thirst.', type: 'negative' }, // using standard cost 6
  { id: 'illiterate', name: 'Illiterate', cost: 8, description: 'Cannot read books.', effects: 'Unable to get mood boost or XP multipliers from books.', type: 'negative' },
  { id: 'motionSensitive', name: 'Motion Sensitive', cost: 4, description: 'Gets motion sickness in a moving vehicle.', effects: '', type: 'negative' },
  { id: 'obese', name: 'Obese', cost: 10, description: 'Reduced running speed, very low endurance, prone to injury.', effects: 'Max fitness 7.', type: 'negative' },
  { id: 'outOfShape', name: 'Out of Shape', cost: 6, description: 'Low endurance, low regeneration.', effects: '', modifiers: { Fitness: -2 }, type: 'negative' },
  { id: 'overweight', name: 'Overweight', cost: 6, description: 'Reduced running speed, low endurance, prone to injury.', effects: 'Max fitness 9.', type: 'negative' },
  { id: 'pacifist', name: 'Pacifist', cost: 4, description: 'Less effective with weapons.', effects: '75% of skill XP for combat skills.', type: 'negative' },
  { id: 'proneToIllness', name: 'Prone to Illness', cost: 4, description: 'More prone to disease. Faster zombification.', effects: '125% zombification progression rate.', type: 'negative' },
  { id: 'puny', name: 'Puny', cost: 10, description: 'Less knockback. Decreased carrying weight.', effects: '-40% knockback power.', modifiers: { Strength: -5 }, type: 'negative' },
  { id: 'restlessSleeper', name: 'Restless Sleeper', cost: 6, description: 'Slow loss of tiredness while sleeping.', effects: 'Sleep for fewer hours each time.', type: 'negative' },
  { id: 'shortSighted', name: 'Short Sighted', cost: 2, description: 'Small view distance. Slower visibility fade.', effects: '-2 foraging radius.', type: 'negative' },
  { id: 'sleepyhead', name: 'Sleepyhead', cost: 4, description: 'Needs more sleep.', effects: '+30% Fatigue increase rate.', type: 'negative' },
  { id: 'slowHealer', name: 'Slow Healer', cost: 3, description: 'Recovers slowly from injuries and illness.', effects: 'More wound severity.', type: 'negative' },
  { id: 'slowLearner', name: 'Slow Learner', cost: 6, description: 'Decreased XP gains.', effects: '70% XP in all skills except STR and FIT.', type: 'negative' },
  { id: 'slowMetabolism', name: 'Slow Metabolism', cost: 2, description: 'Permanent tendency to gain weight. Starts High Weight.', effects: '', type: 'negative' },
  { id: 'slowReader', name: 'Slow Reader', cost: 2, description: 'Takes longer to read books.', effects: '70% reading speed.', type: 'negative' },
  { id: 'smoker', name: 'Smoker', cost: 2, description: 'Unhappiness rises when not smoked.', effects: 'Stress rises without cigarettes.', type: 'negative' },
  { id: 'sundayDriver', name: 'Sunday Driver', cost: 1, description: 'The very slow driver.', effects: 'Accelerates 40% slower. Max speed 30km/h.', type: 'negative' },
  { id: 'thinSkinned', name: 'Thin-skinned', cost: 8, description: 'Increased chance of injuries breaking the skin.', effects: '', type: 'negative' },
  { id: 'underweight', name: 'Underweight', cost: 6, description: 'Low strength, endurance, prone to injury.', effects: '', type: 'negative' },
  { id: 'veryUnderweight', name: 'Very Underweight', cost: 10, description: 'Very low strength/endurance, prone to injury.', effects: '', type: 'negative' },
  { id: 'unfit', name: 'Unfit', cost: 10, description: 'Very low endurance and regeneration.', effects: '', modifiers: { Fitness: -4 }, type: 'negative' },
  { id: 'weakStomach', name: 'Weak Stomach', cost: 3, description: 'Higher chance to have food illness.', effects: '200% food illness chance.', type: 'negative' },

 // --- Occupation exclusive & Free traits mapped here as well to find their details easily ---
  { id: 'blacksmithKnowledge', name: 'Blacksmith Knowledge', cost: 0, description: 'Can use an anvil to create metal items.', effects: '', modifiers: { Blacksmithing: 2, Maintenance: 1 }, type: 'occupation' },
  { id: 'keenCook', name: 'Keen Cook', cost: 0, description: 'Knows how to cook.', effects: 'Improves foraging.', modifiers: { Cooking: 2, Butchering: 1 }, type: 'occupation' },
  { id: 'burglar', name: 'Burglar', cost: 0, description: 'Can hotwire vehicles, lockbreak chance reduced.', effects: '', type: 'occupation' },
  { id: 'axpert', name: 'Ax-pert', cost: 0, description: 'Better at chopping trees. Faster axe swing.', effects: 'Swing axes 25% faster.', type: 'occupation' },
  { id: 'vehicleKnowledge', name: 'Vehicle Knowledge', cost: 0, description: 'Can repair all vehicle types.', effects: '', modifiers: { Mechanics: 3 }, type: 'occupation' },
  { id: 'desensitized', name: 'Desensitized', cost: 0, description: 'Does not reach states of panic.', effects: '', type: 'occupation' },
];

const defaultSkills: Record<Skill, number> = {
  Axe: 0, 'Long Blunt': 0, 'Short Blunt': 0, 'Long Blade': 0, 'Short Blade': 0, Spear: 0, Maintenance: 0,
  Carpentry: 0, Cooking: 0, Agriculture: 0, 'First Aid': 0, Electrical: 0, Welding: 0, Mechanics: 0, Tailoring: 0,
  Blacksmithing: 0, Masonry: 0, Carving: 0, Pottery: 0, Glassmaking: 0, Knapping: 0,
  Aiming: 0, Reloading: 0,
  Fishing: 0, Trapping: 0, Foraging: 0, 'Animal Care': 0, Butchering: 0, Tracking: 0,
  Fitness: 5, Strength: 5,
  Running: 0, Lightfooted: 0, Nimble: 0, Sneaking: 0,
};

export const createBaseSkills = () => ({ ...defaultSkills });

