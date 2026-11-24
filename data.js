// Friendly starter ideas for the Health Blueprint prototype.
const GOALS = [
  { id: "strength", icon: "↗", title: "Build muscle & strength", description: "Feel stronger, one rep at a time.", color: "blue" },
  { id: "body-composition", icon: "✳", title: "Reduce body fat", description: "Explore gradual, sustainable habits.", color: "gold" },
  { id: "maintenance", icon: "≈", title: "Maintain my weight", description: "Find routines that feel good long-term.", color: "mint" },
  { id: "health", icon: "♡", title: "Improve my overall health", description: "Take small steps toward feeling good.", color: "rose" }
];

const WORKOUT_FILTERS = ["Everything", "Strength"];

const WORKOUTS = [];

const MEALS = {
  day: [
    { type: "BREAKFAST", title: "Berry & oat bowl", description: "Warm oats with berries, yogurt or a plant-based alternative, and a sprinkle of seeds.", color: "berry", icon: "◉", photo: "oats", photoAlt: "A bowl of oatmeal topped with berries.", swap: "Try banana or sliced apple instead of berries." },
    { type: "LUNCH", title: "Build-your-own grain bowl", description: "A grain you enjoy, colourful vegetables, and beans, eggs, tofu, or another favourite protein.", color: "greens", icon: "✳", photo: "grain", photoAlt: "A grain bowl with mixed vegetables.", swap: "Use greens, leftover rice, or any grain you already have." },
    { type: "DINNER", title: "Easy sheet-pan dinner", description: "Roasted vegetables with potatoes and your choice of chicken, chickpeas, or tofu.", color: "sunset", icon: "☼", photo: "chickenDinner", photoAlt: "Chicken and vegetables, shown as one sheet-pan dinner idea.", swap: "Swap in frozen vegetables for a no-chop option." },
    { type: "SNACK", title: "A little something", description: "Fruit with nut butter, hummus and vegetables, or another snack you enjoy.", color: "peach", icon: "♡", photo: "spread", photoAlt: "Toast with peanut butter and banana as one snack idea.", swap: "Pick any fruit and a satisfying side you love." }
  ],
  busy: [
    { type: "BREAKFAST", title: "Make-ahead overnight oats", description: "Oats and milk or a plant-based alternative, prepped the night before; add fruit when ready.", color: "berry", icon: "◉", photo: "oats", photoAlt: "A bowl of oatmeal topped with berries.", swap: "No time to prep? Yogurt and a piece of fruit work too." },
    { type: "LUNCH", title: "Five-minute wrap", description: "A whole-grain wrap with hummus, bagged greens, and canned beans or leftover protein.", color: "greens", icon: "✳", photo: "wrap", photoAlt: "A whole-grain wrap filled with vegetables and beans.", swap: "Use a pita or toast instead of a wrap." },
    { type: "DINNER", title: "Shortcut pasta", description: "Pasta, jarred sauce, spinach, and canned lentils come together in a pinch.", color: "sunset", icon: "☼", photo: "pasta", photoAlt: "Pasta with tomato sauce and greens.", swap: "Use any pasta shape or sauce you already have." },
    { type: "SNACK", title: "On-the-go pick-me-up", description: "An easy-to-carry fruit, a handful of nuts, or a snack that works for you.", color: "peach", icon: "♡", photo: "fruit", photoAlt: "A bunch of bananas, one portable fruit snack idea.", swap: "Keep it simple with whatever is already in your bag." }
  ],
  plant: [
    { type: "BREAKFAST", title: "Peanut butter banana oats", description: "A cosy oat bowl topped with sliced banana and your favourite nut or seed butter.", color: "berry", icon: "◉", photo: "peanutOats", photoAlt: "A bowl of oatmeal topped with banana and peanut butter.", swap: "Top with sunflower seed butter for a nut-free idea." },
    { type: "LUNCH", title: "Colourful chickpea bowl", description: "Chickpeas, grains, crunchy vegetables, and a quick lemon-and-olive-oil dressing.", color: "greens", icon: "✳", photo: "plantLunch", photoAlt: "A chickpea and vegetable salad bowl.", swap: "White beans or lentils are just as lovely here." },
    { type: "DINNER", title: "Flexible tofu stir-fry", description: "Tofu and any vegetables you have, served with rice or noodles and a sauce you enjoy.", color: "sunset", icon: "☼", photo: "tofu", photoAlt: "Tofu stir-fried with colourful vegetables.", swap: "Try edamame, tempeh, or extra chickpeas." },
    { type: "SNACK", title: "Hummus & crunch", description: "Hummus with carrots, cucumber, crackers, or whatever's convenient.", color: "peach", icon: "♡", photo: "hummus", photoAlt: "Hummus served with vegetable sticks.", swap: "Pair fruit with soy yogurt for another simple option." }
  ]
};

const MEAL_PLAN_CATEGORIES = {
  cut: {
    title: "Cutting — Fat Loss",
    description: "Focus on high-protein, high-fibre, nutrient-dense meals that promote fullness while supporting a calorie deficit.",
    photo: "chickenDinner",
    photoAlt: "Chicken served with vegetables."
  },
  bulk: {
    title: "Bulking — Muscle Growth",
    description: "Focus on protein-rich, calorie-dense meals containing complex carbohydrates and healthy fats to support muscle growth and a moderate calorie surplus.",
    photo: "peanutOats",
    photoAlt: "Oatmeal topped with banana and peanut butter."
  },
  maintain: {
    title: "Maintaining — General Health and Fitness",
    description: "Focus on balanced meals containing sufficient protein, carbohydrates, healthy fats, fibre, vitamins and minerals while maintaining energy balance.",
    photo: "grain",
    photoAlt: "A bowl of grains and mixed vegetables."
  }
};

const SWAPS = [
  { from: "Fresh berries", to: "Frozen berries", note: "Just as colourful, often more budget-friendly.", icon: "◉" },
  { from: "Chicken", to: "Beans or lentils", note: "A handy plant-forward swap from the pantry.", icon: "✳" },
  { from: "Fresh vegetables", to: "Frozen vegetables", note: "Convenient, versatile, and ready when you are.", icon: "❋" },
  { from: "A complicated recipe", to: "Whatever’s in the fridge", note: "Flexible meals can be simple meals.", icon: "♡" }
];
