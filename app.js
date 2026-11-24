// Health Blueprint uses fictional recommendations and stores only demo preferences locally.
(function () {
  "use strict";

  const STORE_KEY = "health-blueprint";
  const EQUIPMENT_OPTIONS = ["None", "Dumbbells", "Barbell", "Squat rack", "Kettlebell", "Resistance bands", "Bench", "Cable machine", "Weight machines", "Pull-up bar"];
  const emptyState = { goal: "", completed: [], profile: null, schedule: null, nutritionPhase: "maintain", nutritionMeals: null, premium: false };
  let state = emptyState;
  let storageAvailable = true;
  const notice = document.getElementById("storage-notice");

  function normalizeEquipment(items) {
    const selected = Array.isArray(items)
      ? Array.from(new Set(items.filter(function (item) { return EQUIPMENT_OPTIONS.includes(item); })))
      : [];
    const withEquipment = selected.filter(function (item) { return item !== "None"; });
    return withEquipment.length ? withEquipment : ["None"];
  }

  function readState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
      if (!saved || typeof saved !== "object") return emptyState;
      const preferences = saved.preferences && typeof saved.preferences === "object" ? saved.preferences : saved.profile || {};
      return {
        goal: typeof preferences.goal === "string" ? preferences.goal : "",
        completed: [],
        profile: typeof preferences.goal === "string" ? {
          goal: ["strength", "fat-loss", "endurance", "health"].includes(preferences.goal) ? preferences.goal : "health",
          experience: ["beginner", "intermediate", "advanced"].includes(preferences.experience) ? preferences.experience : "beginner",
          activity: ["sedentary", "light", "active", "very-active"].includes(preferences.activity) ? preferences.activity : "light",
          time: ["Morning", "Afternoon", "Evening", "Flexible"].includes(preferences.time) ? preferences.time : "Flexible",
          diet: ["Flexible", "Vegetarian", "Vegan", "Plant-forward"].includes(preferences.diet) ? preferences.diet : "Flexible",
          days: Array.isArray(preferences.days) ? preferences.days.filter(function (day) { return ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].includes(day); }) : [],
          equipment: normalizeEquipment(preferences.equipment)
        } : null,
        schedule: null,
        nutritionPhase: ["maintain", "cut", "bulk"].includes(preferences.nutritionPhase) ? preferences.nutritionPhase : "maintain",
        nutritionMeals: null,
        premium: preferences.premiumPreview === true || saved.premium === true
      };
    } catch (error) {
      storageAvailable = false;
      return emptyState;
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({
        version: 2,
        preferences: Object.assign({
          nutritionPhase: state.nutritionPhase,
          premiumPreview: state.premium
        }, state.profile ? {
          goal: state.profile.goal,
          experience: state.profile.experience,
          activity: state.profile.activity,
          time: state.profile.time,
          diet: state.profile.diet,
          days: state.profile.days,
          equipment: state.profile.equipment
        } : {})
      }));
    } catch (error) {
      storageAvailable = false;
      if (notice) {
        notice.hidden = false;
        notice.textContent = "Your browser couldn't save this change. It will be available until this page is refreshed.";
      }
    }
  }

  function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function showStorageNotice() {
    if (!storageAvailable && notice) {
      notice.hidden = false;
      notice.textContent = "Browser storage is unavailable. Your changes will last until this page is refreshed.";
    }
  }

  state = readState();
  saveState();

  let EXERCISES = [];

  function selectedValues(name) {
    return Array.from(document.querySelectorAll('input[name="' + name + '"]:checked')).map(function (input) { return input.value; });
  }

  function initializeEquipmentChoices() {
    const inputs = Array.from(document.querySelectorAll('input[name="equipment"]'));
    const none = inputs.find(function (input) { return input.value === "None"; });
    inputs.forEach(function (input) {
      input.addEventListener("change", function () {
        if (input.value === "None" && input.checked) {
          inputs.forEach(function (item) { if (item !== none) item.checked = false; });
        } else if (input.checked && none) {
          none.checked = false;
        }
        if (!inputs.some(function (item) { return item.checked; }) && none) none.checked = true;
      });
    });
  }
  initializeEquipmentChoices();

  function exerciseUsesAvailableEquipment(exercise, equipment) {
    return exercise.equipment.every(function (item) { return equipment.includes(item); });
  }

  function prescribeExercise(exercise, profile) {
    const sets = profile.experience === "beginner" ? 2 : profile.experience === "advanced" ? 4 : 3;
    const range = profile.goal === "strength" ? "6–10" : profile.goal === "endurance" ? "10–15" : "8–12";
    const reps = exercise.repType === "time"
      ? "20–40 sec"
      : range + (exercise.repType === "eachSide" ? " each side" : " reps");
    return {
      ...exercise,
      reps: sets + " × " + reps,
      equipment: exercise.equipment.slice()
    };
  }

  function buildSchedule(profile) {
    const selectedDays = profile.days.length ? profile.days : ["Monday", "Wednesday", "Friday"];
    const equipment = normalizeEquipment(profile.equipment);
    const levelRank = { beginner: 0, intermediate: 1, advanced: 2 };
    const availableLevel = levelRank[profile.experience] || 0;
    const patternCounts = {};
    return selectedDays.map(function (day, index) {
      const fullBody = selectedDays.length <= 3;
      const patterns = fullBody
        ? ["squat", "hinge", "push", "pull", "core"]
        : index % 2 === 0
          ? ["squat", "hinge", "legAccessory", "core"]
          : ["push", "pull", "upperAccessory", "core"];
      const exercises = patterns.map(function (pattern) {
        const candidates = EXERCISES.filter(function (exercise) {
          return exercise.pattern === pattern &&
            exerciseUsesAvailableEquipment(exercise, equipment) &&
            (!exercise.minExperience || availableLevel >= levelRank[exercise.minExperience]);
        });
        const equippedCandidates = candidates.filter(function (exercise) { return exercise.equipment.length > 0; });
        const choices = equippedCandidates.length ? equippedCandidates : candidates;
        if (!choices.length) return null;
        const choiceIndex = patternCounts[pattern] || 0;
        patternCounts[pattern] = choiceIndex + 1;
        return prescribeExercise(choices[choiceIndex % choices.length], profile);
      }).filter(Boolean);
      return {
        id: day.toLowerCase(),
        day: day,
        muscleGroups: fullBody ? "Full body · Core" : index % 2 === 0 ? "Lower body · Core" : "Upper body · Core",
        completed: false,
        exercises: exercises
      };
    });
  }

  function loadProfileForm() {
    if (!state.profile) return;
    const profile = state.profile;
    document.getElementById("profile-goal").value = profile.goal || "";
    document.getElementById("profile-experience").value = profile.experience || "";
    document.getElementById("profile-activity").value = profile.activity || "";
    document.getElementById("profile-time").value = profile.time || "Flexible";
    document.getElementById("profile-diet").value = profile.diet || "Flexible";
    document.querySelectorAll('input[name="days"]').forEach(function (input) { input.checked = profile.days.includes(input.value); });
    document.querySelectorAll('input[name="equipment"]').forEach(function (input) { input.checked = profile.equipment.includes(input.value); });
  }

  function renderSchedule() {
    const container = document.getElementById("weekly-plan");
    if (!container) return;
    container.replaceChildren();
    if (!state.schedule) {
      document.getElementById("plan-summary").textContent = "Complete the questionnaire above to create your first weekly plan.";
      container.append(node("p", "plan-empty", "No schedule yet."));
      return;
    }
    document.getElementById("plan-summary").textContent = state.profile
      ? state.profile.days.length + " workout days · " + state.profile.experience + " level · " + state.profile.time + " training · " + state.profile.diet
      : "Sample cardio schedule · customize it with your demo preferences.";
    state.schedule.forEach(function (day) {
      const card = node("article", "plan-day" + (day.completed ? " plan-completed" : ""));
      card.append(node("div", "plan-day-heading", ""), node("h3", "", day.day), node("span", "eyebrow", day.muscleGroups));
      const heading = card.querySelector(".plan-day-heading");
      const complete = node("button", "plan-complete", day.completed ? "Completed ✓" : "Mark complete");
      complete.type = "button";
      complete.addEventListener("click", function () {
        day.completed = !day.completed;
        saveState();
        renderSchedule();
        renderDashboard();
        renderProgress();
      });
      heading.append(complete);
      day.exercises.forEach(function (exercise, exerciseIndex) {
        const row = node("div", "exercise-row");
        row.append(node("strong", "", exercise.name), node("span", "exercise-groups", exercise.groups));
        const prescription = node("p", "exercise-prescription", exercise.reps + " · Rest " + exercise.rest);
        const exerciseEquipment = Array.isArray(exercise.equipment) ? exercise.equipment : [];
        const equipmentLabel = exercise.isCardio
          ? "Equipment: varies by activity"
          : "Equipment: " + (exerciseEquipment.length ? exerciseEquipment.join(" + ") : "Bodyweight / none");
        const equipment = node("span", "exercise-equipment", equipmentLabel);
        const instructions = node("p", "exercise-instructions", exercise.instructions);
        const availableEquipment = state.profile ? normalizeEquipment(state.profile.equipment) : ["None"];
        const levelRank = { beginner: 0, intermediate: 1, advanced: 2 };
        const availableLevel = levelRank[state.profile && state.profile.experience] || 0;
        const replacements = EXERCISES.filter(function (item) {
          return item.name !== exercise.name &&
            item.pattern === exercise.pattern &&
            exerciseUsesAvailableEquipment(item, availableEquipment) &&
            (!item.minExperience || availableLevel >= levelRank[item.minExperience]);
        });
        const substitute = node("button", "exercise-substitute", "Substitute");
        substitute.type = "button";
        substitute.disabled = replacements.length === 0;
        substitute.addEventListener("click", function () {
          const replacement = replacements[0];
          if (replacement) {
            day.exercises[exerciseIndex] = prescribeExercise(replacement, state.profile);
            saveState();
            renderSchedule();
          }
        });
        row.append(prescription, equipment, instructions);
        if (!exercise.isCardio) row.append(substitute);
        card.append(row);
      });
      container.append(card);
    });
  }

  const MUSCLE_WORKOUTS = {
    chest: { label: "Chest", exercises: ["Barbell bench press", "Dumbbell bench press", "Incline barbell press", "Incline dumbbell press", "Decline bench press", "Cable chest fly", "Dumbbell chest fly", "Pec deck fly", "Machine chest press", "Chest dips", "Push-ups", "Low-to-high cable fly", "High-to-low cable fly"] },
    back: { label: "Back", exercises: ["Pull-ups", "Chin-ups", "Lat pulldown", "Close-grip lat pulldown", "Single-arm lat pulldown", "Barbell row", "Dumbbell row", "T-bar row", "Seated cable row", "Chest-supported row", "Machine row", "Straight-arm pulldown", "Deadlift", "Rack pull", "Back extension", "Dumbbell pullover"] },
    shoulders: { label: "Shoulders", exercises: ["Barbell overhead press", "Dumbbell shoulder press", "Arnold press", "Machine shoulder press", "Dumbbell lateral raise", "Cable lateral raise", "Machine lateral raise", "Front raise", "Rear delt fly", "Reverse pec deck", "Face pull", "Upright row"] },
    biceps: { label: "Biceps", exercises: ["Barbell curl", "EZ-bar curl", "Dumbbell curl", "Hammer curl", "Preacher curl", "Concentration curl", "Incline dumbbell curl", "Cable curl", "Bayesian cable curl", "Spider curl", "Reverse curl"] },
    triceps: { label: "Triceps", exercises: ["Rope pushdown", "Straight-bar pushdown", "Skull crusher", "Overhead dumbbell extension", "Overhead cable extension", "Single-arm cable extension", "Close-grip bench press", "Triceps dips", "Dumbbell kickback", "Cross-body cable extension"] },
    forearms: { label: "Forearms and grip", exercises: ["Wrist curl", "Reverse wrist curl", "Reverse barbell curl", "Farmer's carry", "Dead hang", "Wrist roller", "Plate pinch", "Cable wrist curl"] },
    trapezius: { label: "Trapezius", exercises: ["Dumbbell shrug", "Barbell shrug", "Cable shrug", "Machine shrug", "Farmer's carry", "Prone Y-raise"] },
    quadriceps: { label: "Quadriceps", exercises: ["Barbell back squat", "Front squat", "Hack squat", "Pendulum squat", "Leg press", "Leg extension", "Bulgarian split squat", "Walking lunge", "Reverse lunge", "Goblet squat", "Step-up", "Sissy squat", "Smith machine squat", "Belt squat"] },
    hamstrings: { label: "Hamstrings", exercises: ["Romanian deadlift", "Stiff-leg deadlift", "Seated leg curl", "Lying leg curl", "Standing leg curl", "Nordic hamstring curl", "Glute-ham raise", "Good morning"] },
    glutes: { label: "Glutes", exercises: ["Barbell hip thrust", "Glute bridge", "Cable kickback", "Bulgarian split squat", "Romanian deadlift", "Sumo deadlift", "Hip abduction machine", "Cable hip abduction", "Reverse lunge", "Step-up"] },
    calves: { label: "Calves", exercises: ["Standing calf raise", "Seated calf raise", "Donkey calf raise", "Leg press calf raise", "Single-leg calf raise"] },
    "hip-adductors-abductors": { label: "Hip adductors and abductors", exercises: ["Hip adduction machine", "Hip abduction machine", "Cable hip adduction", "Cable hip abduction", "Lateral lunge", "Copenhagen plank", "Banded lateral walk"] },
    core: { label: "Abdominals and core", exercises: ["Cable crunch", "Hanging leg raise", "Hanging knee raise", "Decline sit-up", "Ab wheel rollout", "Machine abdominal crunch", "Reverse crunch", "Plank", "Side plank", "Russian twist", "Bicycle crunch", "Cable woodchopper", "Pallof press", "Dead bug", "Weighted crunch"] }
  };
  const MUSCLE_ZONE_GROUPS = {
    chest: "chest",
    shoulders: "shoulders",
    biceps: "biceps",
    triceps: "triceps",
    traps: "trapezius",
    lats: "back",
    lowerback: "back",
    glutes: "glutes",
    hamstrings: "hamstrings",
    calves: "calves",
    abs: "core",
    quads: "quadriceps"
  };
  const PATTERN_BY_GROUP = {
    chest: "push",
    back: "pull",
    shoulders: "push",
    biceps: "upperAccessory",
    triceps: "push",
    forearms: "pull",
    trapezius: "pull",
    quadriceps: "squat",
    hamstrings: "hinge",
    glutes: "hinge",
    calves: "legAccessory",
    "hip-adductors-abductors": "legAccessory",
    core: "core"
  };
  const EQUIPMENT_BY_EXERCISE = [
    [["Barbell", "Barbell"], ["Dumbbell", "Dumbbells"], ["EZ-bar", "Barbell"], ["Cable", "Cable machine"], ["Machine", "Weight machines"],
     ["Pull-ups", "Pull-up bar"], ["Chin-ups", "Pull-up bar"], ["Dead hang", "Pull-up bar"], ["Hanging", "Pull-up bar"],
     ["Bench", "Bench"], ["Dip", "Bench"], ["Shrug", "Dumbbells"], ["Pec deck", "Weight machines"], ["Leg press", "Weight machines"],
     ["Leg extension", "Weight machines"], ["Leg curl", "Weight machines"], ["Hack squat", "Weight machines"], ["Pendulum squat", "Weight machines"],
     ["Smith machine", "Weight machines"], ["Belt squat", "Weight machines"], ["Hip adduction", "Weight machines"], ["Hip abduction", "Weight machines"],
     ["Sissy squat", "None"], ["Push-ups", "None"], ["Plank", "None"], ["Side plank", "None"], ["Bicycle crunch", "None"],
     ["Reverse crunch", "None"], ["Ab wheel", "None"], ["Dead bug", "None"], ["Russian twist", "None"], ["Lateral lunge", "None"],
     ["Copenhagen plank", "None"], ["Banded lateral walk", "Resistance bands"], ["Farmer's carry", "Dumbbells"],
     ["Plate pinch", "None"], ["Wrist roller", "None"], ["Glute bridge", "None"], ["Good morning", "Barbell"],
     ["Nordic", "None"], ["Glute-ham", "Weight machines"], ["Standing calf", "None"], ["Seated calf", "Weight machines"],
     ["Donkey calf", "Weight machines"], ["Single-leg calf", "None"]]
  ][0];
  EXERCISES = Object.entries(MUSCLE_WORKOUTS).flatMap(function ([groupKey, group]) {
    return group.exercises.map(function (name) {
      const equipmentMatch = EQUIPMENT_BY_EXERCISE.find(function ([term]) { return name.toLowerCase().includes(term.toLowerCase()); });
      let equipment = equipmentMatch ? [equipmentMatch[1]] : [];
      if (equipment[0] === "None") equipment = [];
      return {
        name: name,
        pattern: PATTERN_BY_GROUP[groupKey],
        groups: group.label,
        equipment: equipment,
        rest: "60–90 sec",
        repType: /raise|curl|press|row|squat|lunge|step-up|bridge|thrust|kickback|crunch|twist|rollout|extension|fly|pushdown|plank|walk|carry|hang|pinch|curl|dip/i.test(name) ? "reps" : "reps",
        instructions: "Perform " + name + " with controlled form. Stop if you feel pain or cannot maintain good technique."
      };
    });
  });

  function renderMuscleMuscle(muscle) {
    const results = document.getElementById("muscle-results");
    if (!results) return;
    const groupKey = MUSCLE_ZONE_GROUPS[muscle] || muscle;
    const group = MUSCLE_WORKOUTS[groupKey];
    results.replaceChildren();
    if (!group) {
      results.append(node("p","eyebrow","SELECT A MUSCLE"), node("h3","","Choose a highlighted area"), node("p","","Browse the exercise options for that group."));
      return;
    }
    document.getElementById("muscle-group-select").value = groupKey;
    results.append(node("p","eyebrow","MUSCLE: " + group.label.toUpperCase()), node("h3","",group.label + " exercise options"));
    group.exercises.forEach(function (exercise) {
      const card = node("article","muscle-exercise");
      card.append(node("strong","",exercise));
      results.append(card);
    });
  }

  function initializeMuscleExplorer() {
    document.querySelectorAll(".anatomy-view").forEach(function (button) {
      button.addEventListener("click", function () {
        document.querySelectorAll(".anatomy-view").forEach(function (item) { item.classList.toggle("active", item === button); });
        document.getElementById("anatomy-front").hidden = button.dataset.anatomy !== "front";
        document.getElementById("anatomy-back").hidden = button.dataset.anatomy !== "back";
      });
    });
    document.querySelectorAll(".muscle-zone").forEach(function (zone) {
      const selectMuscle = function () {
        document.querySelectorAll(".muscle-zone").forEach(function (item) { item.classList.remove("selected"); });
        zone.classList.add("selected");
        renderMuscleMuscle(zone.dataset.muscle);
      };
      zone.addEventListener("click", selectMuscle);
      zone.addEventListener("keydown", function (event) { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); selectMuscle(); } });
    });
    document.getElementById("muscle-group-select").addEventListener("change", function (event) {
      document.querySelectorAll(".muscle-zone").forEach(function (item) { item.classList.remove("selected"); });
      renderMuscleMuscle(event.currentTarget.value);
    });
  }

  const CARDIO_OPTIONS = [
    {
      category: "Low-impact cardio",
      exercises: ["Outdoor walking", "Treadmill walking", "Incline treadmill walking", "Stationary cycling", "Recumbent cycling", "Elliptical training", "Swimming", "Water walking", "Rowing machine", "Outdoor cycling"]
    },
    {
      category: "Moderate to high-intensity cardio",
      exercises: ["Jogging", "Outdoor running", "Treadmill running", "StairMaster", "Stair climbing", "Hiking", "Jump rope", "Spin cycling", "Air bike", "SkiErg", "Boxing", "Kickboxing", "Dance cardio"]
    },
    {
      category: "High-intensity interval training (HIIT)",
      exercises: ["Sprint intervals", "Treadmill intervals", "Air bike intervals", "Rowing intervals", "Cycling intervals", "Burpees", "Mountain climbers", "Jump squats", "Battle ropes", "Sled pushes", "Sled pulls", "Kettlebell swings", "Shuttle runs", "High knees"]
    }
  ];

  function renderCardioOptions() {
    const container = document.getElementById("cardio-options");
    if (!container) return;
    container.replaceChildren();
    CARDIO_OPTIONS.forEach(function (group) {
      container.append(node("h3", "cardio-category", group.category));
      const card = node("article", "cardio-card cardio-list-card");
      const list = node("ul", "cardio-list");
      group.exercises.forEach(function (exercise) {
        list.append(node("li", "", exercise));
      });
      card.append(list);
      container.append(card);
    });
  }

  function renderWorkoutNutrition() {
    const time = document.getElementById("training-time");
    const preTitle = document.getElementById("pre-workout-meal");
    const preDetail = document.getElementById("pre-workout-detail");
    const postTitle = document.getElementById("post-workout-meal");
    const postDetail = document.getElementById("post-workout-detail");
    if (!time || !preTitle || !preDetail || !postDetail) return;
    const postTitleEl = document.getElementById("post-workout-meal");
    const trainingTime = state.profile ? state.profile.time : "Flexible";
    time.textContent = trainingTime + " training";
    preTitle.textContent = trainingTime === "Morning"
      ? "Banana, oats, or toast"
      : "Oats, fruit, rice, or a small sandwich";
    preDetail.textContent = trainingTime === "Morning"
      ? "Eat 30–90 minutes before training if it feels comfortable. Keep the portion light and emphasize easy carbohydrate."
      : "Have a carbohydrate-focused snack 1–3 hours before exercise. Add a modest protein portion if the gap before training is longer.";
    postTitleEl.textContent = "Rice or potatoes with lentils, beans, tofu, or chicken";
    postDetail.textContent = "Eat a balanced meal within a few hours afterward. Combine protein for muscle repair with carbohydrates to replenish fuel and include fruit or vegetables.";
  }

  function showView() {
    const requested = location.hash.slice(1) || "home";
    const views = Array.from(document.querySelectorAll("[data-view]"));
    const current = views.some(function (view) { return view.id === requested; }) ? requested : "home";
    views.forEach(function (view) { view.hidden = view.id !== current; });
    document.querySelectorAll(".main-nav a").forEach(function (link) {
      if (link.getAttribute("href") === "#" + current) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", showView);
  showView();

  function renderGoals() {
    const container = document.getElementById("goal-options");
    container.replaceChildren();
    GOALS.forEach(function (goal) {
      const button = node("button", "goal-card goal-" + goal.color);
      button.type = "button";
      button.setAttribute("aria-pressed", state.goal === goal.id ? "true" : "false");
      const icon = node("span", "goal-icon", goal.icon);
      icon.setAttribute("aria-hidden", "true");
      const check = node("span", "goal-check", state.goal === goal.id ? "✓" : "+");
      check.setAttribute("aria-hidden", "true");
      button.append(icon, node("strong", "", goal.title), node("span", "goal-description", goal.description), check);
      button.addEventListener("click", function () {
        state.goal = state.goal === goal.id ? "" : goal.id;
        saveState();
        renderGoals();
        document.getElementById("goal-status").textContent = state.goal
          ? "Your focus is " + goal.title.toLowerCase() + "."
          : "Your focus has been cleared.";
      });
      container.append(button);
    });
  }

  const FOODS = [
    { name: "Rolled oats", calories: 379, protein: 13.2, carbs: 67.7, fat: 6.5, fibre: 10.1, portion: "100 g dry", vitamins: "B1, B5", minerals: "Magnesium, iron", benefits: "Slow-release energy and soluble fibre for fuller meals.", alternatives: ["Whole-grain cereal", "Brown rice"] },
    { name: "Eggs", calories: 143, protein: 12.6, carbs: 0.7, fat: 9.5, fibre: 0, portion: "2 large eggs", vitamins: "A, D, B12", minerals: "Selenium, phosphorus", benefits: "Affordable complete protein and nutrients for muscle and cell health.", alternatives: ["Greek yogurt", "Tofu"] },
    { name: "Brown rice", calories: 123, protein: 2.7, carbs: 25.6, fat: 1, fibre: 1.6, portion: "1 cup cooked", vitamins: "B3, B6", minerals: "Magnesium, manganese", benefits: "Provides budget-friendly carbohydrate and steady fuel.", alternatives: ["Quinoa", "Whole-wheat pasta"] },
    { name: "Lentils", calories: 116, protein: 9, carbs: 20.1, fat: 0.4, fibre: 7.9, portion: "1 cup cooked", vitamins: "B1, folate", minerals: "Iron, potassium", benefits: "Fibre-rich plant protein that supports fullness and digestion.", alternatives: ["Chickpeas", "Black beans"] },
    { name: "Chicken breast", calories: 165, protein: 31, carbs: 0, fat: 3.6, fibre: 0, portion: "100 g cooked", vitamins: "B3, B6", minerals: "Selenium, phosphorus", benefits: "High-protein, low-fat choice for muscle recovery.", alternatives: ["Turkey", "Tofu"] },
    { name: "Greek yogurt", calories: 124, protein: 17, carbs: 6.6, fat: 3.2, fibre: 0, portion: "170 g", vitamins: "B12", minerals: "Calcium, phosphorus", benefits: "Convenient protein and calcium-rich snack or breakfast.", alternatives: ["Cottage cheese", "Skyr"] },
    { name: "Peanut butter", calories: 588, protein: 25, carbs: 20, fat: 50, fibre: 6, portion: "100 g", vitamins: "E, B3", minerals: "Magnesium, potassium", benefits: "Energy-dense source of unsaturated fat and plant protein.", alternatives: ["Sunflower seed butter", "Mixed nuts"] },
    { name: "Mixed vegetables", calories: 65, protein: 3, carbs: 13, fat: 0.5, fibre: 4.5, portion: "1.5 cups", vitamins: "A, C, K", minerals: "Potassium, folate", benefits: "Adds fibre, colour, and micronutrients to meals.", alternatives: ["Fresh vegetables", "Frozen stir-fry mix"] },
    { name: "Banana", calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, fibre: 2.6, portion: "1 medium", vitamins: "B6, C", minerals: "Potassium", benefits: "Portable carbohydrate for pre- or post-workout fuel.", alternatives: ["Apple", "Berries"] },
    { name: "Black beans", calories: 132, protein: 8.9, carbs: 23.7, fat: 0.5, fibre: 8.7, portion: "1 cup cooked", vitamins: "B1, folate", minerals: "Iron, magnesium", benefits: "Low-cost fibre and plant protein for filling meals.", alternatives: ["Lentils", "Chickpeas"] }
  ];

  const FOOD_PHOTOS = {
    breakfast: "assets/foods/oatmeal-bowl.jpg",
    lunch: "assets/foods/grain-and-vegetable-bowl.jpg",
    dinner: "assets/foods/chicken-and-vegetables.jpg",
    snack: "assets/foods/peanut-butter-banana-toast.jpg",
    oats: "assets/foods/oatmeal-bowl.jpg",
    egg: "assets/foods/eggs-on-toast.jpg",
    grain: "assets/foods/grain-and-vegetable-bowl.jpg",
    beans: "assets/foods/vegetable-and-bean-salad.jpg",
    lentils: "assets/foods/lentils.jpg",
    blackBeans: "assets/foods/black-beans.jpg",
    protein: "assets/foods/chicken-and-vegetables.jpg",
    dairy: "assets/foods/yogurt-and-berries.jpg",
    spread: "assets/foods/peanut-butter-banana-toast.jpg",
    greens: "assets/foods/fresh-vegetables.jpg",
    fruit: "assets/foods/bananas.jpg",
    plantLunch: "assets/foods/vegetable-and-bean-salad.jpg",
    plantDinner: "assets/foods/grain-and-vegetable-bowl.jpg",
    chickenLunch: "assets/foods/chicken-and-vegetables.jpg",
    chickenDinner: "assets/foods/chicken-and-vegetables.jpg"
  };

  function foodImage(kind, alt, className) {
    const image = node("img", className || "food-photo");
    image.src = FOOD_PHOTOS[kind] || FOOD_PHOTOS.grain;
    image.alt = alt;
    image.loading = "lazy";
    return image;
  }

  function foodArtType(foodName) {
    if (foodName === "Rolled oats") return "oats";
    if (foodName === "Eggs") return "egg";
    if (foodName === "Brown rice") return "grain";
    if (foodName === "Lentils") return "lentils";
    if (foodName === "Black beans") return "blackBeans";
    if (foodName === "Chicken breast") return "protein";
    if (foodName === "Greek yogurt") return "dairy";
    if (foodName === "Peanut butter") return "spread";
    if (foodName === "Mixed vegetables") return "greens";
    if (foodName === "Banana") return "fruit";
    return "grain";
  }

  function nutritionTargets() {
    const activityEstimate = { sedentary: 1800, light: 2000, active: 2200, "very-active": 2400 }[state.profile && state.profile.activity] || 2000;
    const phase = state.nutritionPhase;
    const calories = activityEstimate + (phase === "bulk" ? 150 : phase === "cut" ? -150 : 0);
    const protein = Math.round(calories * 0.2 / 4);
    const fat = Math.round(calories * 0.3 / 9);
    const carbs = Math.max(50, Math.round((calories - protein * 4 - fat * 9) / 4));
    return { calories: calories, protein: protein, carbs: carbs, fat: fat, label: "Illustrative " + phase + " estimate" };
  }

  function buildDailyMeals() {
    const targets = nutritionTargets();
    const plantBased = state.profile && ["Vegetarian", "Vegan", "Plant-forward"].includes(state.profile.diet);
    const proteinFood = plantBased ? "lentils" : "chicken";
    return [
      { type: "Breakfast", title: state.profile && state.profile.diet === "Vegan" ? "Oats, soy drink & banana" : "Oats, yogurt & banana", portion: state.profile && state.profile.diet === "Vegan" ? "1 bowl + 1 cup soy drink" : "1 bowl + 170 g yogurt", calories: Math.round(targets.calories * .25), protein: Math.round(targets.protein * .23), carbs: Math.round(targets.carbs * .25), fat: Math.round(targets.fat * .22), foodKey: "breakfast", alternatives: state.profile && state.profile.diet === "Vegan" ? ["Oats + soy yogurt", "Tofu scramble + toast"] : ["Oats + eggs", "Greek yogurt + oats"] },
      { type: "Lunch", title: proteinFood === "lentils" ? "Chickpea & vegetable bowl" : "Chicken & vegetable bowl", portion: "1 large bowl", calories: Math.round(targets.calories * .30), protein: Math.round(targets.protein * .32), carbs: Math.round(targets.carbs * .30), fat: Math.round(targets.fat * .27), foodKey: plantBased ? "plantLunch" : "chickenLunch", alternatives: plantBased ? ["Beans + rice", "Tofu + whole-wheat pasta"] : ["Beans + rice", "Whole-wheat pasta + chicken"] },
      { type: "Dinner", title: proteinFood === "lentils" ? "Grain & vegetable bowl" : "Chicken & vegetables", portion: "1 plate", calories: Math.round(targets.calories * .32), protein: Math.round(targets.protein * .32), carbs: Math.round(targets.carbs * .32), fat: Math.round(targets.fat * .32), foodKey: plantBased ? "plantDinner" : "chickenDinner", alternatives: ["Tofu stir-fry", "Lentil pasta + vegetables"] },
      { type: "Snack", title: "Banana & peanut butter", portion: "1 banana + 1 tbsp", calories: Math.round(targets.calories * .13), protein: Math.round(targets.protein * .13), carbs: Math.round(targets.carbs * .13), fat: Math.round(targets.fat * .19), foodKey: "snack", alternatives: plantBased ? ["Soy yogurt + fruit", "Hummus + toast"] : ["Greek yogurt + fruit", "Boiled eggs + fruit"] }
    ];
  }

  function mealPhotoKind(meal) {
    const title = meal.title.toLowerCase();
    if (title.includes("oat")) return "breakfast";
    if (title.includes("egg")) return "egg";
    if (title.includes("yogurt")) return "dairy";
    if (title.includes("peanut") || title.includes("banana")) return "snack";
    if (title.includes("lentil")) return "lentils";
    if (title.includes("bean") || title.includes("chickpea") || title.includes("hummus")) return "beans";
    if (title.includes("chicken")) return "protein";
    if (title.includes("tofu")) return "plantDinner";
    if (title.includes("grain") || title.includes("vegetable") || title.includes("rice")) return "lunch";
    return meal.foodKey;
  }

  function renderDashboard() {
    const week = document.getElementById("dashboard-week");
    if (!week) return;
    const schedule = state.schedule || [];
    week.replaceChildren();
    const upcoming = schedule.slice(0, 4);
    if (!upcoming.length) {
      week.append(node("p", "dashboard-empty", "Complete your questionnaire to add workouts to this week."));
    }
    upcoming.forEach(function (day) {
      const row = node("article", "dashboard-week-row" + (day.completed ? " completed" : ""));
      const cardio = day.exercises.filter(function (exercise) { return ["walk","running","cycling","swimming","hiking","dance"].some(function (name) { return exercise.name.toLowerCase().includes(name); }); }).length;
      row.append(
        node("span", "dashboard-week-day", day.day.slice(0, 3)),
        node("div", "", day.muscleGroups),
        node("span", "dashboard-week-status", day.completed ? "Done" : cardio ? "Strength + cardio" : "Planned")
      );
      week.append(row);
    });

    const targets = nutritionTargets();
    const targetContainer = document.getElementById("dashboard-targets");
    targetContainer.replaceChildren();
    [
      ["Calories", targets.calories + " kcal"],
      ["Protein", targets.protein + " g"],
      ["Carbs", targets.carbs + " g"],
      ["Fats", targets.fat + " g"]
    ].forEach(function (target) {
      const item = node("article", "dashboard-target");
      item.append(node("span", "", target[0]), node("strong", "", target[1]));
      targetContainer.append(item);
    });

    const meals = state.nutritionMeals || buildDailyMeals();
    state.nutritionMeals = meals;
    const mealContainer = document.getElementById("dashboard-meals");
    mealContainer.replaceChildren();
    meals.slice(0, 3).forEach(function (meal) {
      const item = node("article", "dashboard-meal");
      item.append(node("span", "eyebrow", meal.type), node("strong", "", meal.title), node("span", "dashboard-meal-calories", meal.calories + " kcal"));
      mealContainer.append(item);
    });

    const completed = schedule.filter(function (day) { return day.completed; }).length + state.completed.length;
    document.getElementById("dashboard-completed").textContent = String(completed);
    document.getElementById("dashboard-completed-note").textContent = completed === 1 ? "workout completed" : "workouts completed";
    const total = Math.max(schedule.length, 1);
    const percentage = Math.min(100, Math.round(completed / total * 100));
    document.getElementById("dashboard-ring-value").textContent = percentage + "%";
    document.getElementById("dashboard-progress-ring").style.setProperty("--progress", percentage + "%");

    document.getElementById("dashboard-cardio").textContent = "0";

    const chart = document.getElementById("dashboard-chart");
    chart.replaceChildren();
    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    labels.forEach(function (label, index) {
      const day = schedule[index];
      const active = day ? (day.completed ? 100 : day.exercises.length ? 55 : 12) : 12;
      const bar = node("div", "chart-column");
      const fill = node("div", "chart-bar");
      fill.style.height = active + "%";
      bar.append(fill, node("span", "", label));
      chart.append(bar);
    });
    document.getElementById("dashboard-streak").textContent = completed + (completed === 1 ? " day streak" : " day streak");
  }

  function renderNutrition() {
    const targetsEl = document.getElementById("nutrition-targets");
    const mealsEl = document.getElementById("daily-meals");
    if (!targetsEl || !mealsEl) return;
    const targets = nutritionTargets();
    targetsEl.replaceChildren();
    [
      ["ESTIMATED CALORIES", targets.calories + " kcal", "Illustrative only"],
      ["EST. PROTEIN", "~" + targets.protein + " g", "Sample value"],
      ["EST. CARBOHYDRATES", "~" + targets.carbs + " g", "Sample value"],
      ["EST. FATS", "~" + targets.fat + " g", "Sample value"]
    ].forEach(function (metric) {
      const card = node("article", "nutrition-target");
      card.append(node("span", "eyebrow", metric[0]), node("strong", "", metric[1]), node("span", "target-note", metric[2]));
      targetsEl.append(card);
    });

    const meals = state.nutritionMeals || buildDailyMeals();
    state.nutritionMeals = meals;
    mealsEl.replaceChildren();
    meals.forEach(function (meal, index) {
      const card = node("article", "daily-meal");
      const photo = foodImage(mealPhotoKind(meal), "Photograph of " + meal.title, "daily-meal-photo");
      card.append(photo, node("span", "eyebrow", meal.type), node("h3", "", meal.title), node("p", "meal-portion", meal.portion));
      card.append(node("p", "meal-macro", "~" + meal.calories + " kcal · ~" + meal.protein + "g protein · ~" + meal.carbs + "g carbs · ~" + meal.fat + "g fat"));
      const replace = node("button", "meal-replace", "Replace with a similar food");
      replace.type = "button";
      replace.addEventListener("click", function () {
        const alternatives = meals[index].alternatives;
        const currentAlternative = meals[index].selectedAlternative || 0;
        const alternative = alternatives[currentAlternative % alternatives.length];
        meals[index] = { ...meals[index], title: alternative, selectedAlternative: currentAlternative + 1 };
        state.nutritionMeals = meals;
        saveState();
        renderNutrition();
        renderDashboard();
      });
      card.append(replace);
      mealsEl.append(card);
    });
  }

  function renderFoodLibrary(query) {
    const results = document.getElementById("food-results");
    if (!results) return;
    results.replaceChildren();
    const term = (query || "").toLowerCase();
    FOODS.filter(function (food) { return !term || food.name.toLowerCase().includes(term); }).forEach(function (food) {
      const card = node("article", "food-card");
      card.append(
        foodImage(foodArtType(food.name), "Photograph of " + food.name, "food-card-image"),
        node("h3", "", food.name),
        node("p", "food-portion", food.portion),
        node("p", "food-macros", "Approx. " + food.calories + " kcal · " + food.protein + "g protein · " + food.carbs + "g carbs · " + food.fat + "g fat · " + food.fibre + "g fibre"),
        node("p", "food-nutrients", "Vitamins: " + food.vitamins + " · Minerals: " + food.minerals),
        node("p", "food-benefits", food.benefits),
        node("p", "food-alternatives", "Similar alternatives: " + food.alternatives.join(", "))
      );
      results.append(card);
    });
  }

  function renderFoodCompare() {
    const container = document.getElementById("food-compare");
    if (!container) return;
    container.replaceChildren();
    const first = FOODS.find(function (food) { return food.name === document.getElementById("food-compare-a").value; }) || FOODS[0];
    const second = FOODS.find(function (food) { return food.name === document.getElementById("food-compare-b").value; }) || FOODS[1];
    [first, second].forEach(function (food) {
      const card = node("article", "compare-card");
      card.append(foodImage(foodArtType(food.name), "Photograph of " + food.name, "compare-image"), node("h3", "", food.name), node("strong", "compare-calories", "Approx. " + food.calories + " kcal"), node("span", "", food.portion));
      ["protein", "carbs", "fat", "fibre"].forEach(function (key) {
        card.append(node("p", "compare-row", key + ": " + food[key] + " g"));
      });
      container.append(card);
    });
  }

  function initializeFoodLibrary() {
    const search = document.getElementById("food-search");
    const selectA = document.getElementById("food-compare-a");
    const selectB = document.getElementById("food-compare-b");
    if (!search || !selectA || !selectB) return;
    FOODS.forEach(function (food) {
      selectA.append(new Option(food.name, food.name));
      selectB.append(new Option(food.name, food.name));
    });
    selectA.value = "Rolled oats";
    selectB.value = "Eggs";
    search.addEventListener("input", function () { renderFoodLibrary(search.value); });
    selectA.addEventListener("change", renderFoodCompare);
    selectB.addEventListener("change", renderFoodCompare);
    renderFoodLibrary();
    renderFoodCompare();
  }

  function renderMeals() {
    const mealDay = document.getElementById("meal-day");
    if (state.profile && ["Vegetarian", "Vegan", "Plant-forward"].includes(state.profile.diet)) mealDay.value = "plant";
    const meals = MEALS[mealDay.value] || MEALS.day;
    const grid = document.getElementById("meal-grid");
    grid.replaceChildren();
    meals.forEach(function (meal) {
      const card = node("article", "meal-card");
      const art = node("div", "meal-visual meal-" + meal.color);
      const artType = meal.type === "BREAKFAST" ? "breakfast" : meal.type === "LUNCH" ? "lunch" : meal.type === "DINNER" ? "dinner" : "snack";
      const photo = foodImage(artType, "Photograph of " + meal.title, "meal-photo");
      art.append(photo, node("span", "eyebrow", meal.type));
      const content = node("div", "meal-content");
      content.append(node("h3", "", meal.title), node("p", "", meal.description));
      const alternatives = node("details", "alternative-details");
      alternatives.append(node("summary", "", "An easy alternative"), node("p", "", meal.swap));
      content.append(alternatives);
      card.append(art, content);
      grid.append(card);
    });
  }
  document.getElementById("meal-day").addEventListener("change", renderMeals);
  renderMeals();

  const swaps = document.getElementById("swap-grid");
  SWAPS.forEach(function (swap) {
    const item = node("article", "swap-card");
    const icon = node("span", "swap-icon", swap.icon);
    icon.setAttribute("aria-hidden", "true");
    const words = node("div", "swap-words");
    words.append(
      node("span", "swap-from", swap.from),
      node("span", "swap-arrow", "→"),
      node("strong", "", swap.to),
      node("p", "", swap.note)
    );
    item.append(icon, words);
    swaps.append(item);
  });

  function renderProgress() {
    const summary = document.getElementById("progress-summary");
    summary.replaceChildren();
    const completedDays = (state.schedule || []).filter(function (day) { return day.completed; });
    [
      { icon: "↗", label: "PLANNED DAYS", value: String((state.schedule || []).length), note: "in this demo plan" },
      { icon: "✓", label: "COMPLETED WORKOUTS", value: String(completedDays.length + state.completed.length), note: "this browser session" },
      { icon: "♡", label: "FITNESS FOCUS", value: state.profile ? state.profile.goal : "—", note: "demo preference" }
    ].forEach(function (metric) {
      const item = node("article", "summary-card");
      const icon = node("span", "summary-icon", metric.icon);
      icon.setAttribute("aria-hidden", "true");
      item.append(icon, node("span", "eyebrow", metric.label), node("strong", "summary-value", metric.value), node("span", "summary-note", metric.note));
      summary.append(item);
    });
    document.getElementById("log-count").textContent = completedDays.length + (completedDays.length === 1 ? " DAY COMPLETE" : " DAYS COMPLETE");
    const history = document.getElementById("progress-history");
    history.replaceChildren();
    if (!completedDays.length) {
      const empty = node("div", "history-empty");
      const icon = node("span", "empty-icon", "✳");
      icon.setAttribute("aria-hidden", "true");
      empty.append(
        icon,
        node("strong", "", "No completed workout days yet."),
        node("p", "", "Mark a day complete in your weekly plan. Progress is kept in memory only and resets when you refresh.")
      );
      history.append(empty);
      return;
    }
    completedDays.forEach(function (entry) {
      const row = node("article", "history-entry");
      const icon = node("span", "history-icon", "✳");
      icon.setAttribute("aria-hidden", "true");
      const content = node("div", "history-content");
      content.append(node("strong", "", entry.day + " · " + entry.muscleGroups));
      row.append(icon, content);
      history.append(row);
    });
  }

  document.getElementById("clear-progress").addEventListener("click", function () {
    state.completed = [];
    (state.schedule || []).forEach(function (day) { day.completed = false; });
    renderSchedule();
    renderDashboard();
    renderProgress();
  });

  const premiumToggle = document.getElementById("premium-toggle");
  const premiumDetails = document.getElementById("premium-details");
  premiumToggle.addEventListener("click", function () {
    state.premium = !state.premium;
    saveState();
    premiumDetails.hidden = !state.premium;
    premiumToggle.textContent = state.premium ? "Premium preview enabled ✓" : "Preview premium $8/month";
  });
  premiumDetails.hidden = !state.premium;
  premiumToggle.textContent = state.premium ? "Premium preview enabled ✓" : "Preview premium $8/month";

  document.getElementById("dashboard-edit").addEventListener("click", function () {
    location.hash = "#home";
  });

  document.getElementById("fitness-form").addEventListener("submit", function (event) {
    event.preventDefault();
    const days = selectedValues("days");
    if (!days.length) {
      document.getElementById("profile-days").classList.add("choice-row-error");
      return;
    }
    document.getElementById("profile-days").classList.remove("choice-row-error");
    const profile = {
      goal: document.getElementById("profile-goal").value,
      experience: document.getElementById("profile-experience").value,
      activity: document.getElementById("profile-activity").value,
      time: document.getElementById("profile-time").value,
      diet: document.getElementById("profile-diet").value,
      days: days,
      equipment: normalizeEquipment(selectedValues("equipment"))
    };
    state.profile = profile;
    state.schedule = buildSchedule(profile);
    state.completed = [];
    saveState();
    loadProfileForm();
    renderSchedule();
    state.nutritionMeals = null;
    renderNutrition();
    renderMeals();
    renderWorkoutNutrition();
    renderDashboard();
    location.hash = "#workouts";
  });

  document.getElementById("edit-plan").addEventListener("click", function () {
    location.hash = "#home";
    document.getElementById("fitness-plan-heading").scrollIntoView({ behavior: "smooth" });
  });

  const nutritionPhase = document.getElementById("nutrition-phase");
  nutritionPhase.value = state.nutritionPhase;
  nutritionPhase.addEventListener("change", function () {
    state.nutritionPhase = nutritionPhase.value;
    state.nutritionMeals = null;
    saveState();
    renderNutrition();
    renderDashboard();
  });

  if (state.profile) state.schedule = buildSchedule(state.profile);
  loadProfileForm();
  renderSchedule();
  initializeMuscleExplorer();
  renderCardioOptions();
  renderWorkoutNutrition();
  initializeFoodLibrary();
  renderNutrition();
  renderDashboard();
  renderGoals();
  renderProgress();
  showStorageNotice();
})();
