// Friendly starter ideas for the Ascend Catalyst prototype.
const GOALS = [
  { id: "strength", icon: "↗", title: "Build muscle & strength", description: "Feel stronger, one rep at a time.", color: "blue" },
  { id: "body-composition", icon: "✳", title: "Reduce body fat", description: "Explore gradual, sustainable habits.", color: "gold" },
  { id: "maintenance", icon: "≈", title: "Maintain my weight", description: "Find routines that feel good long-term.", color: "mint" },
  { id: "health", icon: "♡", title: "Improve my overall health", description: "Take small steps toward feeling good.", color: "rose" }
];

const WORKOUT_FILTERS = ["Everything", "Strength", "Cardio", "Mobility", "At home"];

const WORKOUTS = [
  { id: "steady-strength", category: "Strength", level: "START GENTLE", duration: "20 min", name: "Everyday strength", description: "A welcoming full-body routine using just your body weight.", detail: "Squat to a chair · Wall push-ups · Glute bridges · Standing marches", color: "blue", icon: "↗" },
  { id: "fresh-air", category: "Cardio", level: "FIND YOUR PACE", duration: "20–30 min", name: "Fresh-air walk", description: "A comfortable-paced walk outdoors or around your home.", detail: "Take a relaxed pace, bring water, and turn around whenever you like.", color: "green", icon: "☼" },
  { id: "morning-reset", category: "Mobility", level: "SLOW IT DOWN", duration: "10 min", name: "A little morning stretch", description: "Gentle, optional movements to loosen up and greet the day.", detail: "Shoulder rolls · Easy side stretch · Ankle circles · Deep breaths", color: "lilac", icon: "≈" },
  { id: "home-circuit", category: "At home", level: "NO EQUIPMENT", duration: "15 min", name: "Living-room circuit", description: "Simple, adjustable moves for a space you already know.", detail: "Chair sit-to-stands · Marching · Counter push-ups · Rest between moves", color: "gold", icon: "⌂" },
  { id: "steady-steps", category: "Cardio", level: "LOW IMPACT", duration: "15 min", name: "Easy indoor steps", description: "Build movement into your day at a pace that feels comfortable.", detail: "Walk in place · Side steps · Gentle arm swings · Pause as needed", color: "blue", icon: "◌" },
  { id: "core-balance", category: "Strength", level: "STEADY & STRONG", duration: "15 min", name: "Core & balance", description: "A patient, supportive practice for stability and coordination.", detail: "Supported standing balance · Dead bugs · Heel raises · Easy breathing", color: "mint", icon: "✳" }
];

const MEALS = {
  day: [
    { type: "BREAKFAST", title: "Berry & oat bowl", description: "Warm oats with berries, yogurt or a plant-based alternative, and a sprinkle of seeds.", color: "berry", icon: "◉", swap: "Try banana or sliced apple instead of berries." },
    { type: "LUNCH", title: "Build-your-own grain bowl", description: "A grain you enjoy, colourful vegetables, and beans, eggs, tofu, or another favourite protein.", color: "greens", icon: "✳", swap: "Use greens, leftover rice, or any grain you already have." },
    { type: "DINNER", title: "Easy sheet-pan dinner", description: "Roasted vegetables with potatoes and your choice of chicken, chickpeas, or tofu.", color: "sunset", icon: "☼", swap: "Swap in frozen vegetables for a no-chop option." },
    { type: "SNACK", title: "A little something", description: "Fruit with nut butter, hummus and vegetables, or another snack you enjoy.", color: "peach", icon: "♡", swap: "Pick any fruit and a satisfying side you love." }
  ],
  busy: [
    { type: "BREAKFAST", title: "Make-ahead overnight oats", description: "Oats and milk or a plant-based alternative, prepped the night before; add fruit when ready.", color: "berry", icon: "◉", swap: "No time to prep? Yogurt and a piece of fruit work too." },
    { type: "LUNCH", title: "Five-minute wrap", description: "A whole-grain wrap with hummus, bagged greens, and canned beans or leftover protein.", color: "greens", icon: "✳", swap: "Use a pita or toast instead of a wrap." },
    { type: "DINNER", title: "Shortcut pasta", description: "Pasta, jarred sauce, spinach, and canned lentils come together in a pinch.", color: "sunset", icon: "☼", swap: "Use any pasta shape or sauce you already have." },
    { type: "SNACK", title: "On-the-go pick-me-up", description: "An easy-to-carry fruit, a handful of nuts, or a snack that works for you.", color: "peach", icon: "♡", swap: "Keep it simple with whatever is already in your bag." }
  ],
  plant: [
    { type: "BREAKFAST", title: "Peanut butter banana oats", description: "A cosy oat bowl topped with sliced banana and your favourite nut or seed butter.", color: "berry", icon: "◉", swap: "Top with sunflower seed butter for a nut-free idea." },
    { type: "LUNCH", title: "Colourful chickpea bowl", description: "Chickpeas, grains, crunchy vegetables, and a quick lemon-and-olive-oil dressing.", color: "greens", icon: "✳", swap: "White beans or lentils are just as lovely here." },
    { type: "DINNER", title: "Flexible tofu stir-fry", description: "Tofu and any vegetables you have, served with rice or noodles and a sauce you enjoy.", color: "sunset", icon: "☼", swap: "Try edamame, tempeh, or extra chickpeas." },
    { type: "SNACK", title: "Hummus & crunch", description: "Hummus with carrots, cucumber, crackers, or whatever's convenient.", color: "peach", icon: "♡", swap: "Pair fruit with soy yogurt for another simple option." }
  ]
};

const SWAPS = [
  { from: "Fresh berries", to: "Frozen berries", note: "Just as colourful, often more budget-friendly.", icon: "◉" },
  { from: "Chicken", to: "Beans or lentils", note: "A handy plant-forward swap from the pantry.", icon: "✳" },
  { from: "Fresh vegetables", to: "Frozen vegetables", note: "Convenient, versatile, and ready when you are.", icon: "❋" },
  { from: "A complicated recipe", to: "Whatever’s in the fridge", note: "Flexible meals can be simple meals.", icon: "♡" }
];
