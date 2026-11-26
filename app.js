// Health Blueprint uses general recommendations and stores profile details locally.
(function () {
  "use strict";

  const STORE_KEY = "health-blueprint";
  const EQUIPMENT_OPTIONS = ["None", "Dumbbells", "Barbell", "Squat rack", "Kettlebell", "Resistance bands", "Bench", "Cable machine", "Weight machines", "Pull-up bar"];
  const GOAL_MEALS_BY_ID = new Map(GOAL_MEALS.map(function (meal) { return [meal.id, meal]; }));
  const emptyState = { goal: "", completed: [], profile: null, schedule: null, nutritionPhase: "maintain", nutritionProfile: null, nutritionPlan: [], nutritionMeals: null, mealFavorites: [], plannedMeals: [], premium: false };
  let state = emptyState;
  let storageAvailable = true;
  const notice = document.getElementById("storage-notice");

  function localDateKey() {
    const date = new Date();
    return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
  }

  function normalizeEquipment(items) {
    const selected = Array.isArray(items)
      ? Array.from(new Set(items.filter(function (item) { return EQUIPMENT_OPTIONS.includes(item); })))
      : [];
    const withEquipment = selected.filter(function (item) { return item !== "None"; });
    return withEquipment.length ? withEquipment : ["None"];
  }

  function profileNumber(value, min, max) {
    const number = Number(value);
    return Number.isFinite(number) && number >= min && number <= max ? number : "";
  }

  function nutritionProfileFrom(value) {
    if (!value || typeof value !== "object") return null;
    const units = value.units === "imperial" ? "imperial" : "metric";
    return {
      age: profileNumber(value.age, 18, 100),
      height: profileNumber(value.height, units === "imperial" ? 47 : 120, units === "imperial" ? 91 : 230),
      weight: profileNumber(value.weight, units === "imperial" ? 77 : 35, units === "imperial" ? 661.4 : 300),
      sex: ["female", "male"].includes(value.sex) ? value.sex : "",
      activity: ["sedentary", "light", "moderate", "very-active", "extra-active"].includes(value.activity) ? value.activity : "",
      units: units
    };
  }

  function readState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
      if (!saved || typeof saved !== "object") return emptyState;
      const preferences = saved.preferences && typeof saved.preferences === "object" ? saved.preferences : saved.profile || {};
      const mealFavorites = Array.isArray(preferences.mealFavorites)
        ? Array.from(new Set(preferences.mealFavorites.filter(function (id) { return GOAL_MEALS_BY_ID.has(id); })))
        : [];
      const plannedMeals = preferences.plannerDate === localDateKey() && Array.isArray(preferences.plannedMeals)
        ? preferences.plannedMeals.filter(function (item) {
          return item && GOAL_MEALS_BY_ID.has(item.id) && Number.isFinite(Number(item.servings)) && Number(item.servings) > 0;
        }).map(function (item) {
          return { id: item.id, servings: Math.min(10, Math.max(0.25, Number(item.servings))) };
        })
        : [];
      const nutritionPhase = ["maintain", "cut", "bulk"].includes(preferences.nutritionPhase) ? preferences.nutritionPhase : "maintain";
      const nutritionPlan = Array.isArray(preferences.nutritionPlan)
        ? preferences.nutritionPlan.filter(function (item) {
          const meal = item && GOAL_MEALS_BY_ID.get(item.id);
          return meal && meal.phase === nutritionPhase && meal.type === item.type;
        }).map(function (item) { return { id: item.id, type: item.type }; })
        : [];
      return {
        goal: typeof preferences.goal === "string" ? preferences.goal : "",
        completed: [],
        profile: typeof preferences.goal === "string" ? {
          age: profileNumber(preferences.age, 13, 100),
          height: profileNumber(preferences.height, 100, 230),
          weight: profileNumber(preferences.weight, 30, 300),
          goal: ["strength", "fat-loss", "endurance", "health"].includes(preferences.goal) ? preferences.goal : "health",
          experience: ["beginner", "intermediate", "advanced"].includes(preferences.experience) ? preferences.experience : "beginner",
          activity: ["sedentary", "light", "active", "very-active"].includes(preferences.activity) ? preferences.activity : "light",
          time: ["Morning", "Afternoon", "Evening", "Flexible"].includes(preferences.time) ? preferences.time : "Flexible",
          diet: ["Flexible", "Vegetarian", "Vegan", "Plant-forward"].includes(preferences.diet) ? preferences.diet : "Flexible",
          days: Array.isArray(preferences.days) ? preferences.days.filter(function (day) { return ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].includes(day); }) : [],
          equipment: normalizeEquipment(preferences.equipment)
        } : null,
        schedule: null,
        nutritionPhase: nutritionPhase,
        nutritionProfile: nutritionProfileFrom(preferences.nutritionProfile),
        nutritionPlan: nutritionPlan,
        nutritionMeals: null,
        mealFavorites: mealFavorites,
        plannedMeals: plannedMeals,
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
        version: 3,
        preferences: Object.assign({
          nutritionPhase: state.nutritionPhase,
          nutritionProfile: state.nutritionProfile,
          nutritionPlan: state.nutritionPlan,
          premiumPreview: state.premium,
          mealFavorites: state.mealFavorites,
          plannedMeals: state.plannedMeals,
          plannerDate: localDateKey()
        }, state.profile ? {
          age: state.profile.age,
          height: state.profile.height,
          weight: state.profile.weight,
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
    document.getElementById("profile-age").value = profile.age;
    document.getElementById("profile-height").value = profile.height;
    document.getElementById("profile-weight").value = profile.weight;
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
        const exerciseGroupKey = Object.keys(MUSCLE_WORKOUTS).find(function (key) {
          return MUSCLE_WORKOUTS[key].label === exercise.groups;
        }) || "core";
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
        appendExerciseLearning(row, exercise, exerciseGroupKey);
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

  const MUSCLE_SECONDARIES = {
    chest: "front deltoids, triceps, and serratus anterior",
    back: "biceps, rear deltoids, and forearms",
    shoulders: "triceps and upper chest",
    biceps: "brachialis and forearm flexors",
    triceps: "shoulders and chest (depending on the movement)",
    forearms: "finger flexors, wrist extensors, and upper back",
    trapezius: "forearms and rear deltoids",
    quadriceps: "glutes, hamstrings, and core",
    hamstrings: "glutes, calves, and spinal erectors",
    glutes: "hamstrings, quadriceps, and core",
    calves: "soleus, gastrocnemius, and foot stabilizers",
    "hip-adductors-abductors": "glutes, inner thighs, and core",
    core: "hip flexors, obliques, and spinal stabilizers"
  };

  function exerciseFormGuidance(exercise, groupKey) {
    const name = exercise.name.toLowerCase();
    const isTimed = /plank|hang|carry|walk|hold|pinch/i.test(name);
    const isUnilateral = /single-arm|single-leg|one-arm|one-leg|lunge|step-up|bulgarian|copenhagen|kickback|woodchopper|wrist curl/i.test(name);
    let movement;
    if (/squat|lunge|step-up|leg press|sissy/i.test(name)) {
      movement = {
        steps: ["Set your feet in a stable, comfortable stance and brace your trunk.", "Bend your hips and knees under control, keeping your knees tracking in line with your toes.", "Lower only as far as you can maintain balance and a neutral spine.", "Push through the whole foot to return to standing; repeat smoothly."],
        mistakes: "Letting the knees collapse inward, heels lift, or lower back round. Reduce the load or range, slow down, and keep knees tracking over the toes."
      };
    } else if (/deadlift|hinge|good morning|romanian|rack pull/i.test(name)) {
      movement = {
        steps: ["Stand with feet about hip-width apart and soften your knees.", "Brace your abdomen and push your hips back while keeping the weight close to your legs.", "Lower only until you feel a hamstring stretch without rounding your back.", "Drive your hips forward to stand tall; avoid leaning backward at the top."],
        mistakes: "Rounding the back, letting the weight drift away, or turning the hinge into a squat. Use a lighter load and keep the weight close."
      };
    } else if (/row|pulldown|pull-up|chin-up|pull over|pullover/i.test(name)) {
      movement = {
        steps: ["Set a stable stance or seated position and brace your trunk.", "Begin with shoulders relaxed away from your ears.", "Pull by driving your elbows toward your sides, without jerking or swinging.", "Pause briefly, then return the load slowly until your arms are comfortably extended."],
        mistakes: "Using momentum, shrugging, or overextending the lower back. Reduce the load and move through a controlled, comfortable range."
      };
    } else if (/press|push-up|dip|pushdown|extension|skull crusher/i.test(name)) {
      movement = {
        steps: ["Set your feet or body securely and brace your abdomen.", "Position wrists comfortably in line with the working joints.", "Press or extend smoothly while keeping shoulders controlled and avoiding a hard lockout.", "Lower under control to the starting position and repeat."],
        mistakes: "Flaring elbows excessively, arching the back, or bouncing at the bottom. Use a manageable load and keep the motion smooth."
      };
    } else if (/curl|raise|fly|face pull|shrug|wrist roller/i.test(name)) {
      movement = {
        steps: ["Stand or sit tall and stabilize your torso.", "Keep the working joint aligned and begin with a comfortable range of motion.", "Raise, curl, or draw the resistance smoothly without swinging.", "Pause briefly, then lower slowly to the starting position."],
        mistakes: "Swinging the torso, rushing the lowering phase, or using a range that causes discomfort. Reduce the load and keep the movement controlled."
      };
    } else if (/plank|dead bug|crunch|sit-up|leg raise|knee raise|rollout|woodchopper|pallof|twist|bicycle/i.test(name)) {
      movement = {
        steps: ["Set a comfortable position and gently brace your trunk.", "Keep your ribs stacked over your pelvis and breathe steadily.", "Move only through a range where you can control your torso and pelvis.", "Return slowly to the start; stop the set when you can no longer maintain control."],
        mistakes: "Holding your breath, pulling on your neck, or letting your lower back arch. Shorten the range and exhale through the effort."
      };
    } else {
      movement = {
        steps: ["Set up in a stable position with the required equipment secured.", "Brace gently and align the working joints comfortably.", "Move through a controlled, pain-free range without using momentum.", "Return slowly to the start and repeat with consistent technique."],
        mistakes: "Rushing repetitions, using momentum, or forcing a painful range. Reduce the load or range and stop if pain persists."
      };
    }

    const group = MUSCLE_WORKOUTS[groupKey];
    const primary = group ? group.label : exercise.groups;
    const alternatives = group
      ? group.exercises.filter(function (item) { return item !== exercise.name; }).slice(0, 3)
      : [];
    const compound = /squat|deadlift|press|row|pull-up|chin-up|lunge|hip thrust|dip/i.test(name);
    return {
      primary: primary,
      secondary: MUSCLE_SECONDARIES[groupKey] || "nearby stabilizing muscles",
      equipment: exercise.equipment && exercise.equipment.length ? exercise.equipment.join(", ") : "Bodyweight / none",
      dosage: isTimed ? "3 sets × 20–40 seconds" : "3 sets × " + (isUnilateral ? "8–12 reps per side" : compound ? "6–12 reps" : "10–15 reps"),
      rest: compound ? "90–120 seconds between sets" : "60–90 seconds between sets",
      steps: movement.steps,
      mistakes: movement.mistakes,
      alternatives: alternatives.length ? alternatives.join("; ") : "Choose another comfortable movement for the same muscle group.",
      video: "https://www.youtube.com/results?search_query=" + encodeURIComponent(exercise.name + " exercise proper form tutorial")
    };
  }

  function appendExerciseLearning(parent, exercise, groupKey) {
    const guidance = exerciseFormGuidance(exercise, groupKey);
    const link = node("a", "button button-outline exercise-tutorial", "Watch Exercise Tutorial");
    link.href = guidance.video;
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    const details = node("details", "exercise-learning");
    details.append(node("summary", "", "Form, muscles & training details"));
    [
      ["Primary muscles", guidance.primary],
      ["Secondary muscles", guidance.secondary],
      ["Equipment", guidance.equipment],
      ["Recommended sets & reps", guidance.dosage],
      ["Rest", guidance.rest]
    ].forEach(function (item) {
      const section = node("div", "exercise-detail-section");
      section.append(node("strong", "", item[0]), node("p", "", item[1]));
      details.append(section);
    });
    const steps = node("ol", "exercise-step-list");
    guidance.steps.forEach(function (step) { steps.append(node("li", "", step)); });
    const stepsSection = node("div", "exercise-detail-section");
    stepsSection.append(node("strong", "", "Step-by-step instructions"), steps);
    details.append(stepsSection);
    [
      ["Common mistakes & how to avoid them", guidance.mistakes],
      ["Same-muscle alternatives", guidance.alternatives]
    ].forEach(function (item) {
      const section = node("div", "exercise-detail-section");
      section.append(node("strong", "", item[0]), node("p", "", item[1]));
      details.append(section);
    });
    parent.append(link, details);
  }

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
      const definition = EXERCISES.find(function (item) { return item.name === exercise; });
      if (definition) appendExerciseLearning(card, definition, groupKey);
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
    CARDIO_OPTIONS.forEach(function (group, index) {
      const section = node("section", "cardio-category-group");
      section.setAttribute("aria-labelledby", "cardio-category-" + index);
      const heading = node("div", "cardio-category-heading");
      const title = node("h3", "cardio-category", group.category);
      title.id = "cardio-category-" + index;
      heading.append(title, node("span", "cardio-category-count", group.exercises.length + " options"));
      const list = node("ul", "cardio-list");
      group.exercises.forEach(function (exercise) {
        const item = node("li", "cardio-exercise");
        item.append(node("span", "", exercise));
        const tutorial = node("a", "exercise-tutorial-link", "Watch Exercise Tutorial");
        tutorial.href = "https://www.youtube.com/results?search_query=" + encodeURIComponent(exercise + " cardio exercise technique tutorial");
        tutorial.target = "_blank";
        tutorial.rel = "noopener noreferrer";
        item.append(tutorial);
        const details = node("details", "exercise-learning cardio-learning");
        details.append(node("summary", "", "Muscles, pacing & technique"));
        [
          ["Primary muscles", "Legs and cardiovascular system; emphasis varies by activity."],
          ["Secondary muscles", "Core and upper body contribute to posture and stabilization."],
          ["Equipment", /outdoor|hiking|walking|running|cycling|swimming|dance/i.test(exercise) ? "Comfortable activity-appropriate clothing; equipment varies." : "Activity-specific machine or equipment."],
          ["Recommended dose", group.category.includes("HIIT")
            ? "Begin with 4–8 intervals of 20–30 seconds of brisk effort followed by 60–90 seconds easy; build gradually and include a warm-up."
            : "Start with 20–40 minutes at a pace that lets you maintain control; adjust duration and intensity to your fitness."],
          ["Rest", "Take recovery as needed; alternate harder sessions with easy activity or rest."],
          ["Step-by-step technique", "Begin with 5 minutes easy to warm up. Set a sustainable pace and maintain relaxed, controlled movement. Ease down for the final 3–5 minutes, then rest or stretch gently."],
          ["Common mistakes & how to avoid them", "Starting too fast, skipping a gradual warm-up, or ignoring discomfort. Build duration and intensity gradually and stop for pain, dizziness, or unusual shortness of breath."],
          ["Alternatives", "Choose another low-impact or moderate activity from this list that feels comfortable."]
        ].forEach(function (detail) {
          const section = node("div", "exercise-detail-section");
          section.append(node("strong", "", detail[0]), node("p", "", detail[1]));
          details.append(section);
        });
        item.append(details);
        list.append(item);
      });
      section.append(heading, list);
      container.append(section);
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
    oats: "assets/foods/oatmeal-bowl.jpg",
    egg: "assets/foods/eggs-on-toast.jpg",
    grain: "assets/foods/grain-and-vegetable-bowl.jpg",
    brownRice: "assets/foods/grain-and-vegetable-bowl.jpg",
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
    chickenDinner: "assets/foods/chicken-and-vegetables.jpg",
    wrap: "assets/foods/vegetable-and-bean-salad.jpg",
    pasta: "assets/foods/grain-and-vegetable-bowl.jpg",
    tofu: "assets/foods/vegetable-and-bean-salad.jpg",
    hummus: "assets/foods/fresh-vegetables.jpg",
    peanutOats: "assets/foods/oatmeal-bowl.jpg",
    bananaPeanutButter: "assets/foods/peanut-butter-banana-toast.jpg"
  };
  const FOOD_PHOTO_ALTS = {
    oats: "Bowl of oatmeal topped with berries.",
    egg: "Fried egg on toast.",
    grain: "Bowl of grains and mixed vegetables.",
    brownRice: "Photograph of a grain and vegetable bowl.",
    beans: "Chickpea and vegetable salad bowl.",
    lentils: "Cooked lentils topped with caramelized onions.",
    blackBeans: "Close-up photograph of black beans.",
    protein: "Grilled chicken served with vegetables.",
    dairy: "Yogurt cups topped with berries.",
    spread: "Toast topped with peanut butter and banana.",
    greens: "Fresh mixed vegetables.",
    fruit: "A bunch of bananas.",
    plantLunch: "Chickpea and vegetable salad bowl.",
    plantDinner: "Grain and vegetable bowl.",
    chickenLunch: "Chicken and vegetables on a plate.",
    chickenDinner: "Chicken and vegetables on a plate.",
    wrap: "Photograph of a vegetable and bean salad.",
    pasta: "Photograph of a grain and vegetable bowl.",
    tofu: "Photograph of a vegetable and bean salad.",
    hummus: "Photograph of fresh vegetables served with a dip.",
    peanutOats: "Photograph of oatmeal topped with berries.",
    bananaPeanutButter: "Photograph of toast topped with peanut butter and banana."
  };

  function foodImage(kind, alt, className) {
    const image = node("img", className || "food-photo");
    image.src = FOOD_PHOTOS[kind] || FOOD_PHOTOS.grain;
    image.alt = alt;
    image.loading = "lazy";
    return image;
  }

  function foodArtType(foodName) {
    const name = foodName.toLowerCase();
    if (/oat/.test(name)) return "oats";
    if (/egg/.test(name)) return "egg";
    if (/rice|quinoa|pasta|grain|bread|wrap|tortilla/.test(name)) return "grain";
    if (/lentil/.test(name)) return "lentils";
    if (/black bean/.test(name)) return "blackBeans";
    if (/bean|chickpea|hummus/.test(name)) return "beans";
    if (/chicken|turkey|beef|salmon|tuna|shrimp|cod|fish/.test(name)) return "protein";
    if (/yogurt|milk|cheese|cottage/.test(name)) return "dairy";
    if (/peanut|almond|cashew|walnut|seed|nut/.test(name)) return "spread";
    if (/berry|strawberr|blueberr|raspberr/.test(name)) return "dairy";
    if (/banana|apple|orange/.test(name)) return "fruit";
    if (/spinach|lettuce|broccoli|pepper|tomato|cucumber|carrot|vegetable|greens|asparagus|zucchini|potato|cauliflower/.test(name)) return "greens";
    return "grain";
  }

  function displayFoodAmount(grams) {
    if (state.nutritionProfile && state.nutritionProfile.units === "imperial") {
      return formatAmount(grams / 28.3495) + " oz";
    }
    return formatAmount(grams) + " g";
  }

  const DAILY_MEAL_SHARES = [
    { type: "Breakfast", share: 0.25 },
    { type: "Lunch", share: 0.30 },
    { type: "Dinner", share: 0.30 },
    { type: "Snack", share: 0.15 }
  ];

  function nutritionProfileComplete(profile) {
    return Boolean(profile &&
      Number.isFinite(Number(profile.age)) && Number(profile.age) >= 18 &&
      Number.isFinite(Number(profile.height)) && Number(profile.height) > 0 &&
      Number.isFinite(Number(profile.weight)) && Number(profile.weight) > 0 &&
      ["female", "male"].includes(profile.sex) &&
      ["sedentary", "light", "moderate", "very-active", "extra-active"].includes(profile.activity));
  }

  function nutritionTargets() {
    const phase = state.nutritionPhase;
    const profile = state.nutritionProfile;
    if (nutritionProfileComplete(profile)) {
      const heightCm = profile.units === "imperial" ? Number(profile.height) * 2.54 : Number(profile.height);
      const weightKg = profile.units === "imperial" ? Number(profile.weight) / 2.20462 : Number(profile.weight);
      const bmr = 10 * weightKg + 6.25 * heightCm - 5 * Number(profile.age) + (profile.sex === "male" ? 5 : -161);
      const activityFactors = { sedentary: 1.2, light: 1.375, moderate: 1.55, "very-active": 1.725, "extra-active": 1.9 };
      const tdee = bmr * activityFactors[profile.activity];
      const calorieFloor = profile.sex === "female" ? 1200 : 1500;
      const safeMaintenance = Math.max(calorieFloor, tdee);
      const calories = Math.round(phase === "cut"
        ? Math.max(calorieFloor, safeMaintenance - Math.min(500, safeMaintenance * 0.15))
        : phase === "bulk"
          ? safeMaintenance + Math.min(300, safeMaintenance * 0.075)
          : safeMaintenance);
      const protein = Math.round(Math.min(weightKg * (phase === "maintain" ? 1.6 : 1.8), calories * 0.35 / 4));
      const fat = Math.round(Math.min(calories * 0.35 / 9, Math.max(weightKg * 0.6, calories * 0.25 / 9)));
      const carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4));
      return {
        calories: calories,
        protein: protein,
        carbs: carbs,
        fat: fat,
        fibre: Math.round(calories / 1000 * 14),
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        weightKg: weightKg,
        label: phase === "cut" ? "Moderate deficit estimate" : phase === "bulk" ? "Moderate surplus estimate" : "Estimated maintenance"
      };
    }

    const activityEstimate = { sedentary: 1800, light: 2000, active: 2200, "very-active": 2400 }[state.profile && state.profile.activity] || 2000;
    const calories = activityEstimate + (phase === "bulk" ? 150 : phase === "cut" ? -150 : 0);
    const protein = Math.round(calories * 0.2 / 4);
    const fat = Math.round(calories * 0.3 / 9);
    const carbs = Math.max(50, Math.round((calories - protein * 4 - fat * 9) / 4));
    return {
      calories: calories, protein: protein, carbs: carbs, fat: fat,
      fibre: Math.round(calories / 1000 * 14), label: "Illustrative " + phase + " estimate"
    };
  }

  function recipeServingsForCalories(meal, calories) {
    const perServing = calculateMealNutrition(meal, 1).calories;
    return perServing > 0 ? Math.min(3, Math.max(0.5, calories / perServing)) : 1;
  }

  function recipeTargetScore(meal, targets, share) {
    const servings = recipeServingsForCalories(meal, targets.calories * share);
    const nutrition = calculateMealNutrition(meal, servings);
    const expected = {
      calories: targets.calories * share,
      protein: targets.protein * share,
      carbs: targets.carbs * share,
      fat: targets.fat * share
    };
    return Math.abs(nutrition.calories - expected.calories) / Math.max(1, expected.calories) * 1.5 +
      Math.abs(nutrition.protein - expected.protein) / Math.max(10, expected.protein) +
      Math.abs(nutrition.carbs - expected.carbs) / Math.max(10, expected.carbs) * 0.7 +
      Math.abs(nutrition.fat - expected.fat) / Math.max(5, expected.fat) * 0.7;
  }

  function recipesForGoalAndType(phase, type) {
    return GOAL_MEALS.filter(function (meal) { return meal.phase === phase && meal.type === type; });
  }

  function buildPersonalizedMealPlan(targets) {
    const plan = DAILY_MEAL_SHARES.map(function (slot) {
      const choices = recipesForGoalAndType(state.nutritionPhase, slot.type);
      if (!choices.length) return null;
      const savedChoice = (state.nutritionPlan || []).find(function (entry) {
        return entry.type === slot.type && choices.some(function (meal) { return meal.id === entry.id; });
      });
      const meal = savedChoice
        ? choices.find(function (choice) { return choice.id === savedChoice.id; })
        : choices.slice().sort(function (first, second) {
          return recipeTargetScore(first, targets, slot.share) - recipeTargetScore(second, targets, slot.share);
        })[0];
      const servings = recipeServingsForCalories(meal, targets.calories * slot.share);
      const nutrition = calculateMealNutrition(meal, servings);
      return {
        id: meal.id,
        type: slot.type,
        title: meal.title,
        portion: formatAmount(servings) + " × " + meal.portion,
        servings: servings,
        recipe: meal,
        calories: Math.round(nutrition.calories),
        protein: Math.round(nutrition.protein),
        carbs: Math.round(nutrition.carbs),
        fat: Math.round(nutrition.fat),
        fibre: Math.round(nutrition.fibre),
        photo: mealPhotoKind(meal),
        photoAlt: foodPhotoAlt(mealPhotoKind(meal)),
        share: slot.share
      };
    }).filter(Boolean);
    state.nutritionPlan = plan.map(function (meal) { return { id: meal.id, type: meal.type }; });
    return plan;
  }

  function buildDailyMeals() {
    if (nutritionProfileComplete(state.nutritionProfile)) {
      return buildPersonalizedMealPlan(nutritionTargets());
    }
    const targets = nutritionTargets();
    const plantBased = state.profile && ["Vegetarian", "Vegan", "Plant-forward"].includes(state.profile.diet);
    const proteinFood = plantBased ? "lentils" : "chicken";
    return [
      { type: "Breakfast", title: "Berry & oat bowl", portion: state.profile && state.profile.diet === "Vegan" ? "1 bowl + 1 cup soy drink" : "1 bowl + 170 g yogurt", calories: Math.round(targets.calories * .25), protein: Math.round(targets.protein * .23), carbs: Math.round(targets.carbs * .25), fat: Math.round(targets.fat * .22), photo: "oats", alternatives: state.profile && state.profile.diet === "Vegan" ? ["Oats + soy yogurt", "Tofu scramble + toast"] : ["Oats + eggs", "Greek yogurt + oats"] },
      { type: "Lunch", title: proteinFood === "lentils" ? "Chickpea & vegetable bowl" : "Chicken & vegetable bowl", portion: "1 large bowl", calories: Math.round(targets.calories * .30), protein: Math.round(targets.protein * .32), carbs: Math.round(targets.carbs * .30), fat: Math.round(targets.fat * .27), photo: plantBased ? "plantLunch" : "chickenLunch", alternatives: plantBased ? ["Beans + rice", "Tofu + whole-wheat pasta"] : ["Beans + rice", "Whole-wheat pasta + chicken"] },
      { type: "Dinner", title: proteinFood === "lentils" ? "Grain & vegetable bowl" : "Chicken & vegetables", portion: "1 plate", calories: Math.round(targets.calories * .32), protein: Math.round(targets.protein * .32), carbs: Math.round(targets.carbs * .32), fat: Math.round(targets.fat * .32), photo: plantBased ? "plantDinner" : "chickenDinner", alternatives: ["Tofu stir-fry", "Lentil pasta + vegetables"] },
      { type: "Snack", title: "Banana & peanut butter", portion: "1 banana + 1 tbsp", calories: Math.round(targets.calories * .13), protein: Math.round(targets.protein * .13), carbs: Math.round(targets.carbs * .13), fat: Math.round(targets.fat * .19), photo: "bananaPeanutButter", alternatives: plantBased ? ["Soy yogurt + fruit", "Hummus + toast"] : ["Greek yogurt + fruit", "Boiled eggs + fruit"] }
    ];
  }

  function setNutritionMeasurementUnits(units) {
    const imperial = units === "imperial";
    document.getElementById("nutrition-height-unit").textContent = imperial ? "in" : "cm";
    document.getElementById("nutrition-weight-unit").textContent = imperial ? "lb" : "kg";
    const height = document.getElementById("nutrition-height");
    const weight = document.getElementById("nutrition-weight");
    height.min = imperial ? "47" : "120";
    height.max = imperial ? "91" : "230";
    height.step = imperial ? "0.1" : "0.1";
    weight.min = imperial ? "77" : "35";
    weight.max = imperial ? "661.4" : "300";
    weight.step = "0.1";
  }

  function loadNutritionForm() {
    const profile = state.nutritionProfile;
    document.getElementById("nutrition-units").value = profile ? profile.units : "metric";
    document.getElementById("nutrition-age").value = profile && profile.age !== "" ? profile.age : "";
    document.getElementById("nutrition-height").value = profile && profile.height !== "" ? profile.height : "";
    document.getElementById("nutrition-weight").value = profile && profile.weight !== "" ? profile.weight : "";
    document.getElementById("nutrition-sex").value = profile ? profile.sex : "";
    document.getElementById("nutrition-activity").value = profile ? profile.activity : "";
    setNutritionMeasurementUnits(profile ? profile.units : "metric");
  }

  function readNutritionForm() {
    return nutritionProfileFrom({
      age: document.getElementById("nutrition-age").value,
      height: document.getElementById("nutrition-height").value,
      weight: document.getElementById("nutrition-weight").value,
      sex: document.getElementById("nutrition-sex").value,
      activity: document.getElementById("nutrition-activity").value,
      units: document.getElementById("nutrition-units").value
    });
  }

  function updateNutritionProfile() {
    state.nutritionProfile = readNutritionForm();
    state.nutritionMeals = null;
    saveState();
    renderNutrition();
    renderDashboard();
  }

  function convertNutritionMeasurements(from, to) {
    if (from === to) return;
    const height = document.getElementById("nutrition-height");
    const weight = document.getElementById("nutrition-weight");
    const heightValue = Number(height.value);
    const weightValue = Number(weight.value);
    if (Number.isFinite(heightValue) && height.value) {
      const bounds = to === "imperial" ? [47, 91] : [120, 230];
      const converted = to === "imperial" ? heightValue / 2.54 : heightValue * 2.54;
      height.value = Math.min(bounds[1], Math.max(bounds[0], converted)).toFixed(1);
    }
    if (Number.isFinite(weightValue) && weight.value) {
      const bounds = to === "imperial" ? [77, 661.4] : [35, 300];
      const converted = to === "imperial" ? weightValue * 2.20462 : weightValue / 2.20462;
      weight.value = Math.min(bounds[1], Math.max(bounds[0], converted)).toFixed(1);
    }
  }

  function mealPhotoKind(meal) {
    if (meal.photo) return meal.photo;
    const title = meal.title.toLowerCase();
    if (title.includes("wrap")) return "wrap";
    if (title.includes("pasta")) return "pasta";
    if (title.includes("tofu")) return "tofu";
    if (title.includes("hummus")) return "hummus";
    if (title.includes("peanut") && title.includes("oat")) return "peanutOats";
    if (title.includes("peanut") && title.includes("banana")) return "bananaPeanutButter";
    if (title.includes("oat")) return "oats";
    if (title.includes("egg")) return "egg";
    if (title.includes("yogurt")) return "dairy";
    if (/berry|strawberr|blueberr|raspberr/.test(title)) return "dairy";
    if (title.includes("peanut")) return "spread";
    if (title.includes("banana")) return "fruit";
    if (title.includes("lentil")) return "lentils";
    if (title.includes("bean") || title.includes("chickpea") || title.includes("hummus")) return "beans";
    if (/chicken|turkey|beef|salmon|tuna|shrimp|cod|fish/.test(title)) return "protein";
    if (title.includes("rice")) return "brownRice";
    if (title.includes("grain") || title.includes("vegetable")) return "grain";
    return meal.photo || meal.foodKey || "grain";
  }

  function foodPhotoAlt(kind) {
    return FOOD_PHOTO_ALTS[kind] || "Food photograph.";
  }

  function calculateMealNutrition(meal, servings) {
    const total = { calories: 0, protein: 0, carbs: 0, fat: 0, fibre: 0 };
    meal.ingredients.forEach(function (item) {
      const ingredient = NUTRITION_INGREDIENTS[item[0]];
      const amount = item[1] * servings / 100;
      total.calories += ingredient.values[0] * amount;
      total.protein += ingredient.values[1] * amount;
      total.carbs += ingredient.values[2] * amount;
      total.fat += ingredient.values[3] * amount;
      total.fibre += ingredient.values[4] * amount;
    });
    return total;
  }

  function mealMicronutrients(meal, field) {
    const values = new Set();
    meal.ingredients.forEach(function (item) {
      (NUTRITION_INGREDIENTS[item[0]][field] || []).forEach(function (value) { values.add(value); });
    });
    return Array.from(values).slice(0, 7).join(", ") || "Not a significant source in the listed ingredients";
  }

  function mealAllergenInfo(meal) {
    const contains = new Set();
    const mayContain = new Set();
    meal.ingredients.forEach(function (item) {
      const ingredient = NUTRITION_INGREDIENTS[item[0]];
      (ingredient.allergens || []).forEach(function (allergen) { contains.add(allergen); });
      (ingredient.mayContain || []).forEach(function (allergen) { mayContain.add(allergen); });
    });
    return {
      contains: contains.size ? "Contains: " + Array.from(contains).join(", ") : "No major allergens are listed for these generic ingredients.",
      mayContain: mayContain.size ? " " + Array.from(mayContain).join("; ") : ""
    };
  }

  function mealMatchesDiet(meal, filter) {
    if (filter === "all") return true;
    const ingredients = meal.ingredients.map(function (item) { return NUTRITION_INGREDIENTS[item[0]]; });
    if (filter === "vegan") return ingredients.every(function (ingredient) { return !ingredient.animal; });
    if (filter === "vegetarian") return ingredients.every(function (ingredient) { return !["meat", "fish"].includes(ingredient.animal); });
    if (filter === "pescatarian") return ingredients.every(function (ingredient) { return ingredient.animal !== "meat"; });
    if (filter === "gluten-free") return ingredients.every(function (ingredient) {
      return ingredient.gluten !== true && !(ingredient.mayContain || []).some(function (warning) { return /wheat/i.test(warning); });
    });
    if (filter === "dairy-free") return ingredients.every(function (ingredient) { return ingredient.animal !== "dairy" && !(ingredient.allergens || []).includes("Milk"); });
    return true;
  }

  function recipeImage(meal) {
    const photoKind = mealPhotoKind(meal);
    return foodImage(photoKind, foodPhotoAlt(photoKind), "recipe-image");
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
    const bmrSummary = document.getElementById("nutrition-bmr-summary");
    const planTotals = document.getElementById("nutrition-plan-totals");
    const mealTotals = document.getElementById("daily-meal-totals");
    const personalized = nutritionProfileComplete(state.nutritionProfile);
    const targets = nutritionTargets();
    targetsEl.replaceChildren();
    if (!personalized) {
      bmrSummary.textContent = "Add your age, height, weight, sex, and activity level to calculate your personal estimates.";
      [
        ["PERSONAL CALORIE TARGET", "Complete profile", "No personal estimate yet"],
        ["PROTEIN", "—", "Personal target"],
        ["CARBOHYDRATES", "—", "Personal target"],
        ["FATS", "—", "Personal target"],
        ["FIBRE", "—", "General reference"]
      ].forEach(function (metric) {
        const card = node("article", "nutrition-target");
        card.append(node("span", "eyebrow", metric[0]), node("strong", "", metric[1]), node("span", "target-note", metric[2]));
        targetsEl.append(card);
      });
      mealsEl.replaceChildren(node("p", "planner-empty", "Complete the adult profile above to generate your personalized breakfast, lunch, dinner, and snack plan."));
      planTotals.hidden = true;
      state.nutritionMeals = null;
      return;
    }

    bmrSummary.textContent = "Estimated BMR: " + targets.bmr + " kcal/day · Estimated TDEE: " + targets.tdee + " kcal/day · " + targets.label + ": " + targets.calories + " kcal/day. Cutting uses a moderate deficit (up to 500 kcal); bulking uses a moderate surplus (up to 300 kcal). A minimum calorie safeguard is applied.";
    [
      ["DAILY CALORIE TARGET", targets.calories + " kcal", targets.label],
      ["PROTEIN TARGET", targets.protein + " g", "Personalized estimate"],
      ["CARBOHYDRATE TARGET", targets.carbs + " g", "Personalized estimate"],
      ["FAT TARGET", targets.fat + " g", "Personalized estimate"],
      ["FIBRE REFERENCE", targets.fibre + " g", "About 14 g per 1,000 kcal"]
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
      const photoKind = mealPhotoKind(meal);
      const photo = foodImage(photoKind, meal.photoAlt || foodPhotoAlt(photoKind), "daily-meal-photo");
      card.append(photo, node("span", "eyebrow", meal.type), node("h3", "", meal.title), node("p", "meal-portion", meal.portion));
      card.append(node("p", "meal-macro", meal.calories + " kcal · " + meal.protein + " g protein · " + meal.carbs + " g carbs · " + meal.fat + " g fat · " + meal.fibre + " g fibre"));
      if (meal.recipe && meal.servings) {
        const ingredients = node("details", "daily-meal-ingredients");
        ingredients.append(node("summary", "", "Scaled ingredients"));
        ingredients.append(recipeIngredientsList(meal.recipe, meal.servings));
        card.append(ingredients);
      }
      const replace = node("button", "meal-replace", "Substitute with a similar meal");
      replace.type = "button";
      replace.addEventListener("click", function () {
        const current = meals[index];
        const choices = recipesForGoalAndType(state.nutritionPhase, current.type)
          .filter(function (candidate) { return candidate.id !== current.id; })
          .sort(function (first, second) {
            return recipeTargetScore(first, targets, current.share) - recipeTargetScore(second, targets, current.share);
          });
        if (!choices.length) return;
        const replacement = choices[0];
        state.nutritionPlan = state.nutritionPlan.map(function (entry) {
          return entry.type === current.type ? { id: replacement.id, type: current.type } : entry;
        });
        state.nutritionMeals = null;
        saveState();
        renderNutrition();
        renderDashboard();
      });
      card.append(replace);
      mealsEl.append(card);
    });

    const plannedTotals = meals.reduce(function (total, meal) {
      ["calories", "protein", "carbs", "fat", "fibre"].forEach(function (key) { total[key] += meal[key]; });
      return total;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0, fibre: 0 });
    mealTotals.replaceChildren();
    [
      ["Calories", plannedTotals.calories, targets.calories, "kcal"],
      ["Protein", plannedTotals.protein, targets.protein, "g"],
      ["Carbohydrates", plannedTotals.carbs, targets.carbs, "g"],
      ["Fats", plannedTotals.fat, targets.fat, "g"],
      ["Fibre", plannedTotals.fibre, targets.fibre, "g"]
    ].forEach(function (metric) {
      const card = node("article", "nutrition-target");
      card.append(
        node("span", "eyebrow", metric[0]),
        node("strong", "", Math.round(metric[1]) + " " + metric[3]),
        node("span", "target-note", "Target: " + metric[2] + " " + metric[3])
      );
      mealTotals.append(card);
    });
    planTotals.hidden = false;
  }

  function renderFoodLibrary(query) {
    const results = document.getElementById("food-results");
    if (!results) return;
    results.replaceChildren();
    const term = (query || "").toLowerCase();
    FOODS.filter(function (food) { return !term || food.name.toLowerCase().includes(term); }).forEach(function (food) {
      const card = node("article", "food-card");
      card.append(
        foodImage(foodArtType(food.name), foodPhotoAlt(foodArtType(food.name)), "food-card-image"),
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
      card.append(foodImage(foodArtType(food.name), foodPhotoAlt(foodArtType(food.name)), "compare-image"), node("h3", "", food.name), node("strong", "compare-calories", "Approx. " + food.calories + " kcal"), node("span", "", food.portion));
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

  function formatAmount(value) {
    return String(Math.round(value * 10) / 10).replace(/\.0$/, "");
  }

  const ESTIMATED_COST_PER_GRAM = {
    greekYogurt: 0.012, blueberries: 0.018, chiaSeeds: 0.025, eggs: 0.016,
    eggWhites: 0.018, spinach: 0.012, mushrooms: 0.012, bellPepper: 0.01,
    oats: 0.006, proteinPowder: 0.035, strawberries: 0.015, cottageCheese: 0.012,
    raspberries: 0.02, wholeGrainWrap: 0.009, chickenBreast: 0.018,
    lettuce: 0.008, cucumber: 0.007, tomato: 0.009, tuna: 0.018,
    brownRice: 0.005, avocado: 0.016, turkey: 0.02, quinoa: 0.012,
    broccoli: 0.009, shrimp: 0.03, mixedGreens: 0.015, lemon: 0.008,
    salmon: 0.035, asparagus: 0.02, leanBeef: 0.03, sweetPotato: 0.007,
    greenBeans: 0.01, groundTurkey: 0.02, tomatoSauce: 0.006, zucchini: 0.009,
    cod: 0.025, cauliflower: 0.008, carrot: 0.006, apple: 0.006, hummus: 0.012,
    almondMilk: 0.004, peanutButter: 0.012, banana: 0.004, wholeGrainBread: 0.008,
    potato: 0.004, cheddar: 0.018, tortilla: 0.008, granola: 0.012, milk: 0.003,
    almonds: 0.02, cashews: 0.022, raisins: 0.01, darkChocolate: 0.025,
    pasta: 0.006, pesto: 0.025, coconutMilk: 0.008, parmesan: 0.025,
    chickpeas: 0.006, oliveOil: 0.012, cornTortilla: 0.006, salsa: 0.008,
    almondButter: 0.018, walnuts: 0.022, orange: 0.006, riceCake: 0.01,
    cinnamon: 0.025, blackPepper: 0.025, honey: 0.01, feta: 0.018, olives: 0.02
  };

  function recipeCookingProfile(meal) {
    const title = meal.title.toLowerCase();
    const text = (meal.title + " " + meal.preparation).toLowerCase();
    const noCook = /overnight|salad|wrap|smoothie|bowl|parfait|trail mix|rice cake|hummus|yogurt|apple and|nuts and|snack/i.test(title);
    const prepMinutes = /snack|smoothie|trail mix|rice cake/i.test(title) ? 5 : /breakfast|oatmeal|oats|egg/i.test(title) ? 8 : 12;
    let cookMinutes = 0;
    if (!noCook) {
      if (/roast|bake|stuffed|sweet potato/i.test(text)) cookMinutes = 25;
      else if (/pancake|omelette|omelet|scrambl|skillet|oatmeal|egg/i.test(text)) cookMinutes = 10;
      else if (/stir-fry|stir fry|curry|meatball|pasta|grill|sear|pan-cook/i.test(text)) cookMinutes = 18;
      else cookMinutes = 12;
    }
    const estimatedCost = meal.ingredients.reduce(function (total, ingredient) {
      return total + ingredient[1] * (ESTIMATED_COST_PER_GRAM[ingredient[0]] || 0.012);
    }, 0);
    return {
      prep: prepMinutes,
      cook: cookMinutes,
      cost: Math.max(0.5, estimatedCost),
      servings: "1 serving (" + meal.portion + ")"
    };
  }

  function recipeDirections(meal) {
    const directions = meal.preparation.split(/;\s+|\.\s+/).map(function (step) {
      return step.trim().replace(/[.!?]+$/, "");
    }).filter(Boolean);
    const steps = ["Measure the ingredients; rinse and chop any fresh produce."].concat(directions);
    if (directions.length < 2) steps.push("Taste, adjust seasoning if desired, and serve.");
    return steps;
  }

  function recipeDietaryAlternatives(meal) {
    const ingredients = meal.ingredients.map(function (item) { return NUTRITION_INGREDIENTS[item[0]]; });
    const animalFoods = ingredients.filter(function (ingredient) { return ingredient.animal && ingredient.animal !== "honey"; });
    const dairyFoods = ingredients.filter(function (ingredient) { return ingredient.animal === "dairy"; });
    const alternatives = [];
    if (animalFoods.length) {
      alternatives.push("Plant-based: replace " + animalFoods.map(function (item) { return item.name.toLowerCase(); }).join(", ") + " with firm tofu, tempeh, or beans; choose a plant-based protein powder or yogurt where relevant.");
    } else {
      alternatives.push("This ingredient list is plant-based; check packaged ingredients for milk, egg, or other allergens.");
    }
    if (dairyFoods.length) alternatives.push("Dairy-free: use unsweetened fortified soy yogurt or milk, or a suitable dairy-free cheese in place of dairy ingredients.");
    if (ingredients.some(function (item) { return item.gluten; })) alternatives.push("Gluten-free: choose certified gluten-free oats, bread, pasta, or wraps as appropriate; verify package labels.");
    return alternatives.join(" ");
  }

  function recipeIngredientsList(meal, servings) {
    const list = node("ul", "recipe-ingredients-list");
    meal.ingredients.forEach(function (item) {
      const ingredient = NUTRITION_INGREDIENTS[item[0]];
      list.append(node("li", "", displayFoodAmount(item[1] * servings) + " " + ingredient.name));
    });
    return list;
  }

  function updateRecipeCard(card, meal, servings) {
    const nutrition = calculateMealNutrition(meal, servings);
    const cooking = recipeCookingProfile(meal);
    card.querySelector("[data-recipe-servings]").textContent = formatAmount(servings) + " × " + meal.portion;
    const meta = card.querySelector("[data-recipe-meta]");
    if (meta) meta.textContent = formatAmount(servings) + " × " + meal.portion + " · Prep " + cooking.prep + " min · Cook " + cooking.cook + " min · Est. $" + cooking.cost.toFixed(2) + " / serving";
    card.querySelector("[data-recipe-ingredients]").replaceChildren(recipeIngredientsList(meal, servings));
    [
      ["calories", Math.round(nutrition.calories) + " kcal"],
      ["protein", formatAmount(nutrition.protein) + " g"],
      ["carbs", formatAmount(nutrition.carbs) + " g"],
      ["fat", formatAmount(nutrition.fat) + " g"],
      ["fibre", formatAmount(nutrition.fibre) + " g"]
    ].forEach(function (metric) {
      card.querySelector('[data-recipe-value="' + metric[0] + '"]').textContent = metric[1];
    });
  }

  function addRecipeToPlan(meal, servings) {
    const existing = state.plannedMeals.find(function (item) { return item.id === meal.id; });
    if (existing) existing.servings = Math.min(10, existing.servings + servings);
    else state.plannedMeals.push({ id: meal.id, servings: Math.min(10, servings) });
    saveState();
    renderDailyMealPlan();
  }

  function summarizeMealPlan(plannedMeals) {
    const totals = { calories: 0, protein: 0, carbs: 0, fat: 0, fibre: 0 };
    const groceries = new Map();
    plannedMeals.forEach(function (planned) {
      const meal = GOAL_MEALS_BY_ID.get(planned.id);
      if (!meal) return;
      const nutrition = calculateMealNutrition(meal, planned.servings);
      Object.keys(totals).forEach(function (key) { totals[key] += nutrition[key]; });
      meal.ingredients.forEach(function (item) {
        groceries.set(item[0], (groceries.get(item[0]) || 0) + item[1] * planned.servings);
      });
    });
    return {
      totals: totals,
      groceries: Array.from(groceries.entries()).sort(function (first, second) {
        return NUTRITION_INGREDIENTS[first[0]].name.localeCompare(NUTRITION_INGREDIENTS[second[0]].name);
      })
    };
  }

  function createRecipeCard(meal) {
    const card = node("article", "recipe-card");
    card.append(recipeImage(meal));

    const content = node("div", "recipe-card-content");
    const heading = node("div", "recipe-card-heading");
    heading.append(node("span", "eyebrow", meal.type), node("h3", "", meal.title));
    content.append(heading);
    const cooking = recipeCookingProfile(meal);
    const recipeMeta = node("p", "recipe-meta", cooking.servings + " · Prep " + cooking.prep + " min · Cook " + cooking.cook + " min · Est. $" + cooking.cost.toFixed(2) + " / serving");
    recipeMeta.dataset.recipeMeta = "true";
    content.append(recipeMeta);
    const tutorial = node("a", "button button-outline recipe-tutorial", "Watch Cooking Tutorial");
    tutorial.href = "https://www.youtube.com/results?search_query=" + encodeURIComponent(meal.title + " cooking tutorial recipe");
    tutorial.target = "_blank";
    tutorial.rel = "noopener noreferrer";
    content.append(tutorial);

    const nutrition = node("div", "recipe-nutrition");
    nutrition.setAttribute("aria-live", "polite");
    [
      ["calories", "Calories"],
      ["protein", "Protein"],
      ["carbs", "Carbs"],
      ["fat", "Fat"],
      ["fibre", "Fibre"]
    ].forEach(function (metric) {
      const item = node("div", "recipe-nutrition-item");
      item.append(node("span", "", metric[1]), node("strong", "", ""));
      item.querySelector("strong").dataset.recipeValue = metric[0];
      nutrition.append(item);
    });
    content.append(nutrition);

    const portion = node("label", "recipe-portion-control", "Adjust portion");
    const portionInput = node("input", "recipe-portion-input");
    portionInput.type = "range";
    portionInput.min = "0.5";
    portionInput.max = "2";
    portionInput.step = "0.25";
    portionInput.value = "1";
    portionInput.setAttribute("aria-label", "Adjust portion size for " + meal.title);
    const servingValue = node("output", "recipe-portion-value", "");
    servingValue.dataset.recipeServings = "true";
    portion.append(portionInput, servingValue);
    content.append(portion);

    const details = node("details", "recipe-details");
    details.append(node("summary", "", "Ingredients, cooking steps & meal-prep notes"));
    const ingredientSection = node("div", "recipe-detail-section");
    ingredientSection.append(node("h4", "", "Ingredients for this portion"));
    const ingredientList = node("div", "recipe-ingredients-container");
    ingredientList.dataset.recipeIngredients = "true";
    ingredientSection.append(ingredientList);
    details.append(ingredientSection);
    [
      ["Preparation notes", meal.preparation],
      ["Health benefits", meal.benefits],
      ["Vitamins", mealMicronutrients(meal, "vitamins")],
      ["Minerals", mealMicronutrients(meal, "minerals")]
    ].forEach(function (item) {
      const section = node("div", "recipe-detail-section");
      section.append(node("h4", "", item[0]), node("p", "", item[1]));
      details.append(section);
    });
    const directions = node("ol", "recipe-step-list");
    recipeDirections(meal).forEach(function (step) { directions.append(node("li", "", step)); });
    const directionsSection = node("div", "recipe-detail-section");
    directionsSection.append(node("h4", "", "Step-by-step cooking directions"), directions);
    details.append(directionsSection);
    const allergens = mealAllergenInfo(meal);
    const allergenSection = node("div", "recipe-detail-section recipe-allergen-note");
    allergenSection.append(node("h4", "", "Allergen information"), node("p", "", allergens.contains + (allergens.mayContain ? " May contain: " + allergens.mayContain.trim() + "." : "") + " Check product labels and cross-contact risks."));
    details.append(allergenSection);
    const alternatives = Array.from(new Set(meal.ingredients.flatMap(function (item) {
      return NUTRITION_INGREDIENTS[item[0]].swaps || [];
    }))).slice(0, 5);
    const alternativeSection = node("div", "recipe-detail-section");
    alternativeSection.append(
      node("h4", "", "Healthy ingredient substitutions"),
      node("p", "", alternatives.join("; ") + "."),
      node("h4", "", "Dietary alternatives"),
      node("p", "", recipeDietaryAlternatives(meal))
    );
    details.append(alternativeSection);
    const storageSection = node("div", "recipe-detail-section");
    const storageAdvice = /rice/i.test(meal.title + " " + meal.ingredients.map(function (item) { return NUTRITION_INGREDIENTS[item[0]].name; }).join(" "))
      ? "Meal prep: cook grains and proteins ahead, keep components separate, and refrigerate cooked rice promptly; use within 1 day. Store other leftovers in a covered container at 4°C/40°F or colder and use within 3–4 days. Reheat leftovers to 74°C/165°F."
      : "Meal prep: wash and chop produce ahead and portion ingredients separately. Refrigerate perishable food within 2 hours in a covered container at 4°C/40°F or colder; use cooked leftovers within 3–4 days. Reheat leftovers to 74°C/165°F.";
    storageSection.append(
      node("h4", "", "Meal prep & storage"),
      node("p", "", storageAdvice + " Estimated cost is a rough US grocery estimate and varies by location, brand, and season.")
    );
    details.append(storageSection);
    content.append(details);

    const actions = node("div", "recipe-actions");
    const add = node("button", "button button-primary recipe-add", "Add to today's plan");
    add.type = "button";
    add.addEventListener("click", function () { addRecipeToPlan(meal, Number(portionInput.value)); });
    const favorite = node("button", "recipe-favorite", state.mealFavorites.includes(meal.id) ? "Saved" : "Save");
    favorite.type = "button";
    favorite.setAttribute("aria-pressed", String(state.mealFavorites.includes(meal.id)));
    favorite.addEventListener("click", function () {
      if (state.mealFavorites.includes(meal.id)) state.mealFavorites = state.mealFavorites.filter(function (id) { return id !== meal.id; });
      else state.mealFavorites.push(meal.id);
      saveState();
      renderMeals();
    });
    actions.append(add, favorite);
    content.append(actions);

    portionInput.addEventListener("input", function () { updateRecipeCard(card, meal, Number(portionInput.value)); });
    card.append(content);
    updateRecipeCard(card, meal, 1);
    return card;
  }

  function renderGoalMealPlan(phase, grid) {
    const plan = MEAL_PLAN_CATEGORIES[phase];
    const banner = node("article", "meal-plan-banner");
    const copy = node("div", "meal-plan-copy");
    copy.append(
      node("p", "eyebrow", "GOAL-BASED MEAL IDEAS"),
      node("h3", "", plan.title),
      node("p", "", plan.description)
    );
    banner.append(copy, foodImage(plan.photo, plan.photoAlt, "meal-plan-image"));
    grid.append(banner);

    const searchTerm = document.getElementById("recipe-search").value.trim().toLowerCase();
    const diet = document.getElementById("recipe-diet").value;
    const favoritesOnly = document.getElementById("favorites-only").checked;
    const meals = GOAL_MEALS.filter(function (meal) {
      if (meal.phase !== phase || !mealMatchesDiet(meal, diet)) return false;
      if (favoritesOnly && !state.mealFavorites.includes(meal.id)) return false;
      const searchable = meal.title + " " + meal.preparation + " " + meal.ingredients.map(function (item) {
        return NUTRITION_INGREDIENTS[item[0]].name;
      }).join(" ");
      return !searchTerm || searchable.toLowerCase().includes(searchTerm);
    });
    const resultCount = document.getElementById("recipe-result-count");
    resultCount.textContent = meals.length + (meals.length === 1 ? " meal shown" : " meals shown");
    if (!meals.length) {
      grid.append(node("p", "recipe-empty", "No meals match those search and dietary filters. Try changing a filter or search term."));
      return;
    }
    [
      ["Breakfast", "Breakfast"],
      ["Lunch", "Lunch"],
      ["Dinner", "Dinner"],
      ["Snack", "Snacks"]
    ].forEach(function (category) {
      const options = meals.filter(function (meal) { return meal.type === category[0]; });
      if (!options.length) return;
      const group = node("section", "recipe-category-group");
      const heading = node("div", "recipe-category-heading");
      heading.append(node("h3", "", category[1]), node("span", "", options.length + (options.length === 1 ? " meal" : " meals")));
      const cards = node("div", "recipe-category-grid");
      options.forEach(function (meal) { cards.append(createRecipeCard(meal)); });
      group.append(heading, cards);
      grid.append(group);
    });
  }

  function renderDailyMealPlan() {
    const list = document.getElementById("planned-meals");
    const totalsEl = document.getElementById("meal-plan-totals");
    const groceryList = document.getElementById("grocery-list");
    if (!list || !totalsEl || !groceryList) return;
    list.replaceChildren();
    totalsEl.replaceChildren();
    groceryList.replaceChildren();
    const summary = summarizeMealPlan(state.plannedMeals);

    if (!state.plannedMeals.length) list.append(node("p", "planner-empty", "Your plan is empty. Add meals above to build today's menu."));
    state.plannedMeals.forEach(function (planned) {
      const meal = GOAL_MEALS_BY_ID.get(planned.id);
      if (!meal) return;
      const nutrition = calculateMealNutrition(meal, planned.servings);

      const row = node("article", "planned-meal-row");
      const description = node("div", "planned-meal-description");
      description.append(node("span", "eyebrow", meal.phase + " · " + meal.type), node("strong", "", meal.title));
      const input = node("input", "planned-meal-servings");
      input.type = "number";
      input.min = "0.25";
      input.max = "10";
      input.step = "0.25";
      input.value = formatAmount(planned.servings);
      input.setAttribute("aria-label", "Portions of " + meal.title + " in today's plan");
      input.addEventListener("change", function () {
        const servings = Number(input.value);
        if (!Number.isFinite(servings) || servings <= 0) {
          input.value = formatAmount(planned.servings);
          return;
        }
        planned.servings = Math.min(10, Math.max(0.25, servings));
        input.value = formatAmount(planned.servings);
        saveState();
        renderDailyMealPlan();
      });
      const remove = node("button", "quiet-button planned-meal-remove", "Remove");
      remove.type = "button";
      remove.setAttribute("aria-label", "Remove " + meal.title + " from today's plan");
      remove.addEventListener("click", function () {
        state.plannedMeals = state.plannedMeals.filter(function (item) { return item.id !== planned.id; });
        saveState();
        renderDailyMealPlan();
      });
      const rowTotals = node("p", "planned-meal-macros", Math.round(nutrition.calories) + " kcal · " + formatAmount(nutrition.protein) + " g protein");
      row.append(description, input, rowTotals, remove);
      list.append(row);
    });

    [
      ["Calories", Math.round(summary.totals.calories) + " kcal"],
      ["Protein", formatAmount(summary.totals.protein) + " g"],
      ["Carbohydrates", formatAmount(summary.totals.carbs) + " g"],
      ["Fat", formatAmount(summary.totals.fat) + " g"],
      ["Fibre", formatAmount(summary.totals.fibre) + " g"]
    ].forEach(function (metric) {
      const card = node("article", "nutrition-target");
      card.append(node("span", "eyebrow", metric[0]), node("strong", "", metric[1]));
      totalsEl.append(card);
    });

    summary.groceries.forEach(function (entry) {
      groceryList.append(node("li", "", displayFoodAmount(entry[1]) + " " + NUTRITION_INGREDIENTS[entry[0]].name));
    });
    if (!summary.groceries.length) groceryList.append(node("li", "grocery-empty", "Your grocery list will appear when you add a meal."));
  }

  function renderMeals() {
    const mealDay = document.getElementById("meal-day");
    if (mealDay.value === "day" && state.profile && ["Vegetarian", "Vegan", "Plant-forward"].includes(state.profile.diet)) mealDay.value = "plant";
    const grid = document.getElementById("meal-grid");
    const recipeControls = document.getElementById("recipe-controls");
    const planner = document.getElementById("meal-planner");
    grid.replaceChildren();
    if (MEAL_PLAN_CATEGORIES[mealDay.value]) {
      grid.classList.add("recipe-meal-grid");
      recipeControls.hidden = false;
      planner.hidden = false;
      renderGoalMealPlan(mealDay.value, grid);
      renderDailyMealPlan();
      return;
    }
    const meals = MEALS[mealDay.value] || MEALS.day;
    grid.classList.remove("recipe-meal-grid");
    recipeControls.hidden = true;
    planner.hidden = true;
    meals.forEach(function (meal) {
      const card = node("article", "meal-card");
      const art = node("div", "meal-visual meal-" + meal.color);
      const photoKind = mealPhotoKind(meal);
      const photo = foodImage(photoKind, meal.photoAlt || foodPhotoAlt(photoKind), "meal-photo");
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
  document.getElementById("meal-day").addEventListener("change", function () {
    const phase = document.getElementById("meal-day").value;
    if (MEAL_PLAN_CATEGORIES[phase]) {
      state.nutritionPhase = phase;
      state.nutritionPlan = [];
      state.nutritionMeals = null;
      document.getElementById("nutrition-phase").value = phase;
      saveState();
      renderNutrition();
      renderDashboard();
    }
    renderMeals();
  });
  document.getElementById("recipe-search").addEventListener("input", renderMeals);
  document.getElementById("recipe-diet").addEventListener("change", renderMeals);
  document.getElementById("favorites-only").addEventListener("change", renderMeals);
  document.getElementById("clear-meal-plan").addEventListener("click", function () {
    state.plannedMeals = [];
    saveState();
    renderDailyMealPlan();
  });
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
      age: Number(document.getElementById("profile-age").value),
      height: Number(document.getElementById("profile-height").value),
      weight: Number(document.getElementById("profile-weight").value),
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
  document.getElementById("meal-day").value = state.nutritionPhase;
  loadNutritionForm();
  const nutritionProfileForm = document.getElementById("nutrition-profile-form");
  nutritionProfileForm.addEventListener("submit", function (event) { event.preventDefault(); });
  nutritionProfileForm.addEventListener("input", function (event) {
    if (["nutrition-age", "nutrition-height", "nutrition-weight"].includes(event.target.id)) updateNutritionProfile();
  });
  nutritionProfileForm.addEventListener("change", function (event) {
    if (event.target.id !== "nutrition-units") updateNutritionProfile();
  });
  const nutritionUnits = document.getElementById("nutrition-units");
  let displayedNutritionUnits = nutritionUnits.value;
  nutritionUnits.addEventListener("change", function () {
    const nextUnits = nutritionUnits.value;
    convertNutritionMeasurements(displayedNutritionUnits, nextUnits);
    displayedNutritionUnits = nextUnits;
    setNutritionMeasurementUnits(nextUnits);
    updateNutritionProfile();
  });
  nutritionPhase.addEventListener("change", function () {
    state.nutritionPhase = nutritionPhase.value;
    state.nutritionPlan = [];
    state.nutritionMeals = null;
    document.getElementById("meal-day").value = state.nutritionPhase;
    saveState();
    renderNutrition();
    renderDashboard();
    renderMeals();
  });
  renderMeals();

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
