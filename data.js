// Friendly starter ideas for the Ascend Catalyst prototype.
const GOALS = [
  { id: "strength", icon: "↗", title: "Build muscle & strength", description: "Feel stronger, one rep at a time.", color: "blue" },
  { id: "body-composition", icon: "✳", title: "Reduce body fat", description: "Explore gradual, sustainable habits.", color: "gold" },
  { id: "maintenance", icon: "≈", title: "Maintain my weight", description: "Find routines that feel good long-term.", color: "mint" },
  { id: "health", icon: "♡", title: "Improve my overall health", description: "Take small steps toward feeling good.", color: "rose" }
];

const WORKOUT_FILTERS = ["Everything", "Strength", "Cardio", "Mobility", "At home"];

const WORKOUTS = [
  { id: "steady-strength", category: "Strength", level: "START GENTLE", duration: "20 min", name: "Everyday strength", description: "A welcoming full-body routine with a squat-focused strength movement.", detail: "Squat to a chair · Wall push-ups · Glute bridges · Standing marches", color: "blue", icon: "↗", image: "assets/workouts/steady-strength.jpg", imageAlt: "A woman performing a weighted squat while a coach observes.", muscleFocus: "Quads · glutes · hips" },
  { id: "fresh-air", category: "Cardio", level: "FIND YOUR PACE", duration: "20–30 min", name: "Fresh-air walk", description: "A comfortable-paced walk outdoors or around your home.", detail: "Take a relaxed pace, bring water, and turn around whenever you like.", color: "green", icon: "☼", image: "assets/workouts/fresh-air.jpg", imageAlt: "Two hikers walking along an outdoor trail.", muscleFocus: "Calves · glutes" },
  { id: "morning-reset", category: "Mobility", level: "SLOW IT DOWN", duration: "10 min", name: "A little morning stretch", description: "Gentle, optional movements to loosen up and greet the day.", detail: "Shoulder rolls · Easy side stretch · Ankle circles · Deep breaths", color: "lilac", icon: "≈", image: "assets/workouts/morning-reset.jpg", imageAlt: "A person holding a gentle kneeling side stretch outdoors.", muscleFocus: "Hips · shoulders" },
  { id: "home-circuit", category: "At home", level: "NO EQUIPMENT", duration: "15 min", name: "Mat-based strength circuit", description: "Simple floor-based movements that can be adjusted to your comfort.", detail: "Bird-dogs · Modified push-ups · Glute bridges · Rest between moves", color: "gold", icon: "⌂", image: "assets/workouts/home-circuit.jpg", imageAlt: "People practicing floor-based bodyweight exercises on fitness mats.", muscleFocus: "Core · shoulders" },
  { id: "steady-steps", category: "Cardio", level: "EASY RUN", duration: "15 min", name: "Walk-jog intervals", description: "Short, gentle jogging intervals with walking breaks between them.", detail: "Alternate an easy jog with a walk · Keep a conversational pace · Pause as needed", color: "blue", icon: "◌", image: "assets/workouts/steady-steps.jpg", imageAlt: "A group of runners jogging outdoors on a paved path.", muscleFocus: "Legs · glutes" },
  { id: "core-balance", category: "Strength", level: "STEADY & STRONG", duration: "15 min", name: "Core & balance", description: "A patient, supportive practice for abdominal strength and stability.", detail: "Crunches · Dead bugs · Supported standing balance · Easy breathing", color: "mint", icon: "✳", image: "assets/workouts/core-balance.jpg", imageAlt: "A person performing a controlled floor crunch on an exercise mat.", muscleFocus: "Abdominals · core" }
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
