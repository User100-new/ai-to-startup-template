# Project log

Keep this up to date as you go — a few lines per work session is enough. It's much harder to reconstruct at the end.

**Team name:** Zacks A+ team
**Startup name:** Health Blueprint
**Live site link:** https://user100-new.github.io/ai-to-startup-template/

---

## Work sessions

Copy this block for each session.

### Log 1 — 2026-11-23 — time not recorded — driver: not recorded

- **Goal for this session:** Create a polished, interactive Ascend Catalyst fitness and nutrition prototype, then turn it into Health Blueprint, using only HTML, CSS, and vanilla JavaScript.
- **Website change requests:**
  1. “Create a modern, professional, and fully interactive fitness and nutrition website called Ascend Catalyst ... [include workout programs, meal planning, nutritional education, meal timing, food alternatives, cardio recommendations, and fitness progress tracking].”
  2. “The website should begin with a personalized fitness questionnaire ... generate a customized weekly workout schedule ... allow users to substitute exercises, change their schedule, and mark workouts as completed.”
  3. “Include a comprehensive nutrition planner ... calorie and macronutrient targets ... meal plans ... affordable options ... searchable food information and side-by-side comparison.”
  4. “Add a personalized dashboard ... weekly workout schedule, upcoming meals, nutrition targets, completed workouts, cardio activity, fitness progress, and a fictional premium subscription.”
  5. “Make this work on GitHub Pages using only HTML, CSS, and vanilla JavaScript, without external libraries or APIs.”
  6. “Update the graphical design and anatomy: make the pictures more realistic, remove the names of body systems, and make workout and food images match the real exercises or meals.”
  7. “Make the top-left name a capital A and use a muscle cell or mitochondrion logo.”
  8. “Take out the anatomy from the background and include all regular exercises with all equipment in the generated workout plan.”
- **What worked:** Copilot built the initial responsive prototype and added the questionnaire, workout generator, nutrition planner, anatomy explorer, cardio planner, dashboard, fictional premium preview, and local progress storage. It also added an equipment-aware exercise catalog and replaced placeholder graphics with themed anatomy, exercise, and food imagery.
- **What broke, and how we fixed it:** The preview was initially difficult to locate or open. Copilot gave the exact `index.html` location and `Show Preview` instructions. Some exercise and food visuals did not initially match the requested realism or subject matter, so the artwork was replaced in later revisions. An anatomy background was later removed completely because it no longer matched the requested design.
- **Committed?** yes — db8e337 `Version 1`; 7a85fcd `Protype #2`; f578444 `Prototype #3`; 03dc74e `Version #4`

---

### Log 2 — 2026-11-24 — time not recorded — driver: not recorded

- **Goal for this session:** Improve and publish the Health Blueprint website, expand the exercise and cardio choices, fix the live deployment, and correct the nutrition presentation.
- **Website change requests:**
  1. “Change the name to Health Blueprint and make the slogan ‘A healthier life, by design.’”
  2. “Make ‘Health Blueprint’ white and the rest a darker shade of blue.”
  3. “Add these movements” — a detailed 13-muscle-group list containing 135 requested strength exercises.
  4. “Make the potential workouts only the ones that I just sent, take out any pre-existing ones.”
  5. “Now add these options for cardio” — low-impact, moderate/high-intensity, and HIIT lists containing 37 requested activities.
  6. “My GitHub Pages deployment says it was successful, but the website is not displaying correctly. Investigate why, fix the deployment issue, publish it through GitHub Pages, and commit and push the changes.”
  7. “Make the cardio options look better, with the different types listed and options below them.”
  8. “For the food and nutrition part, make sure the images actually match each food or meal.”
  9. “Change ‘Your student-friendly meal plan’ to just ‘Meal plan.’”
- **What worked:** Copilot changed the brand and slogan, replaced the workout catalog with the 135 specific requested exercises, added and grouped 37 cardio options, expanded goal-based nutrition planning, corrected nutrition assets, and published a working live URL.
- **What broke, and how we fixed it:** The live link initially showed GitHub Pages’ “Site not found” or 404 page. Copilot added `.nojekyll`, committed it to `main`, verified the live site returned HTTP 200, and confirmed that the CSS, scripts, and assets loaded. The white/blue slogan colors also needed a retry because the first attempt did not work. Later visual updates were committed so the live site matched the local preview.
- **Committed?** yes — 3e54b3d `version 5`; 2c0eaea `version 6`; ec2d46b `Fix GitHub Pages static publishing`; d1ee52c `version 7`; 4df0349 `Expand goal-based nutrition planner`; ca44bc3 `version 7`; 69acead `version 8`

---

### Log 3 — 2026-11-25 — time not recorded — driver: not recorded

- **Goal for this session:** Review the project log and reconstruct the earlier website work in the format required by the teacher.
- **What worked:** Copilot accessed [PROJECT_LOG.md](/workspaces/ai-to-startup-template/project-notes/PROJECT_LOG.md), reconstructed earlier requests from the session history and GitHub commit history, and used the live URL to verify publication.
- **What broke, and how we fixed it:** No website code change was made during this log-entry session. The project log template was incomplete, so it was filled with dated work-session summaries and a dated troubleshooting table.
- **Committed?** no — project log update not yet committed

---

### Log 4 — 2026-11-26 — time not recorded — driver: not recorded

- **Goal for this session:** Expand the workout and nutrition sections with detailed exercise guidance and complete recipes, then give meals more specific food photos while preserving the existing design and functionality.
- **Website change requests:**
  1. “Update the existing website by expanding the Workouts and Nutrition sections without changing the current design, colour scheme, navigation or existing functionality.”
  2. “Add exercise instructions, muscle targets, equipment, sets/repetitions, rest, common mistakes, alternatives, and tutorial links for every exercise.”
  3. “Add complete recipes, cooking directions, nutrition, timing, cost, substitutions, meal-prep advice, storage, and cooking tutorial links to every bulking, cutting, and maintenance meal.”
  4. “For every Nutrition meal and food, use an actual food photo; add a personalized meal planner that calculates BMR/TDEE and calorie and macro targets, scales recipes, supports substitutions and both unit systems, updates instantly, and saves preferences locally.”
  5. “Different meals show the same picture. Change each meal’s picture to its specific photo, and don’t change anything but the pictures.”
- **What worked:** Copilot added expandable guidance to the generated strength and cardio exercise options and enriched all 60 goal-based recipes (20 per phase) with measured ingredients, cooking steps, nutrition, estimated time and cost, dietary alternatives, and storage recommendations. It also added real, locally bundled food photos, an adult nutrition profile, estimated BMR/TDEE and goal-based targets, scaled breakfast/lunch/dinner/snack recipes, substitutions, metric/imperial conversion, and browser-local preference storage. The existing navigation and design were retained. JavaScript syntax, diff whitespace, all 60 recipes' ingredient references, local photo paths, four-meal plans for all three goals, metric/imperial target equivalence, and low-calorie safeguards passed smoke checks.
- **What broke, and how we fixed it:** Different meals reused the same food photo. Copilot added 10 locally bundled CC0/public-domain food photos and explicit image assignments for all 60 meals, using the closest available dish-specific image where an exact photo was unavailable. The photo mapping was checked to confirm every recipe has an assignment and every referenced local image exists. No layout or functionality change was made. Tutorial buttons open title-specific YouTube search results; individual video pages were not verified, so those links should be reviewed if direct, vetted video URLs are required.
- **Committed?** no — changes not yet committed

---

### Log 5 — 2026-11-26 — 22:05 UTC — driver: project-log update

- **Goal for this session:** Make each work session a clearly separate log and show its date and time.
- **What changed:** Added numbered log headings and separators. Earlier session times were not available, so they are marked “time not recorded” rather than estimated.
- **Committed?** no — project log update not yet committed

---

## Things that broke (running list)

| Date | What went wrong | What we tried | What finally fixed it |
|---|---|---|---|
| 2026-11-23 | The preview could not be found or opened. | Used VS Code and searched for `index.html`; tried the preview instructions. | Copilot identified the top-level [index.html](/workspaces/ai-to-startup-template/index.html) and `Show Preview`/`localhost:3000` methods. |
| 2026-11-23 | Anatomy, exercise, and food imagery did not meet the requested realism or subject matter. | Changed anatomy and theme colors, replaced some drawings with themed or locally bundled images, and removed an unwanted background anatomy layer. | The final revisions used more realistic anatomy/exercise visuals and food photos or matching food illustrations where available. |
| 2026-11-23 | The requested brand logo needed to change. | Changed “ascend” to “Ascend,” then considered muscle-cell and mitochondrion concepts. | A blue mitochondrion logo was used for the header and footer. |
| 2026-11-24 | The slogan text colors did not display correctly. | The first change set “Health Blueprint” white and the tagline dark blue. | Copilot made the colors explicit and refreshed the stylesheet; the second retry displayed correctly. |
| 2026-11-24 | GitHub Pages deployment showed a 404 or “Site not found” page despite a successful workflow. | Verified the repository and live URL, investigated static publishing, and checked for deployment configuration issues. | Added `.nojekyll`, committed and pushed to `main`, and verified HTTP 200 on the live site and its assets. |
| 2026-11-24 | The latest cardio, meal, and image updates were not yet visible on the live website. | Committed and pushed local changes to the `main` branch. | GitHub Pages redeployed; the live site now serves the completed Health Blueprint project. |

## What a real version would need

Everything we wanted but faked or left out — real logins, a real database, payments, security, moderation, an app, staff, etc. For each one, say **why** it's needed and roughly **how hard or expensive** you think it would be.

| Feature we faked or skipped | Why a real company would need it | How hard / expensive? |
|---|---|---|
| Real user accounts and login | To save individual plans across devices, support account recovery, and protect private health and fitness information. | Medium to high; requires authentication, secure databases, privacy practices, and ongoing account support. |
| Real database and cloud storage | To store users, subscriptions, plans, and progress reliably instead of in browser local storage. | Medium to high; requires database design, backups, security, and cloud hosting costs. |
| Real payment and subscription processing | To safely charge users and manage invoices, refunds, cancellations, and premium access. | Medium; requires a PCI-compliant payment provider, server-side billing logic, and legal/compliance work. |
| Real personalized medical or fitness advice | To provide recommendations that account safely for medical conditions, injuries, medications, and goals. | High; requires qualified professionals, validation, monitoring, and liability coverage. |
| Real nutritional and allergen data | To guarantee accurate nutrient totals and allergen safety for specific ingredients and brands. | Medium to high; requires curated databases, regular updates, and clear safety/legal controls. |
| AI meal and workout generation | To create more varied, personalised plans and adapt to real progress over time. | High; requires AI services, quality controls, privacy controls, and ongoing model and infrastructure costs. |
| Real moderation and customer support | To handle inappropriate content, account problems, complaints, and refunds. | Medium; requires staffing, policies, support tools, and moderation systems. |

## Reflection (fill in at the end)

1. What surprised you most about building software with AI?
I was most surprised by the amount that AI can build from a small prompt. I would ask it to set up the website and make it a certain way, and it built a more in-depth and larger website than the prompt seemed to call for. I also noticed that, if I had a problem, I could ask what was wrong or explain what I wanted, and the AI could fix it, sometimes even beyond what I had asked for. It often did more than expected, which worked in my favour.
2. Which parts were easy, and which were hard? Why do you think that is?
The easy parts were writing the initial prompts for what I wanted done. The harder parts were when the AI did not fully understand what I wanted, which sometimes took several attempts or required me to expand on the prompt and explain the request in simpler terms.
3. If a competitor had the same AI tool, how long would it take them to copy your site?
I do not think it would be difficult to replicate something like mine because of what AI can do. However, my existing gym and health knowledge helps me create better prompts than someone without that knowledge could. Therefore, I think they could replicate the site, but not completely, because the result would depend on a person's ability and knowledge to work with the AI.
