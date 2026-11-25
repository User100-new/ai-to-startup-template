# Project log

Keep this up to date as you go — a few lines per work session is enough. It's much harder to reconstruct at the end.

**Team name:** Zacks A+ team
**Startup name:** Health Blueprint
**Live site link:** https://user100-new.github.io/ai-to-startup-template/

---

## Work sessions

Copy this block for each session.

### Session — 2026-11-23 — driver: not recorded

- **Goal for this session:** Create a polished, interactive Ascend Catalyst fitness and nutrition prototype, then turn it into Health Blueprint, using only HTML, CSS, and vanilla JavaScript.
- **Key prompts we gave Copilot** (paste the important ones):
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

### Session — 2026-11-24 — driver: not recorded

- **Goal for this session:** Improve and publish the Health Blueprint website, expand the exercise and cardio choices, fix the live deployment, and correct the nutrition presentation.
- **Key prompts we gave Copilot** (paste the important ones):
  1. “Can I preview it?”
  2. “Change the name to Health Blueprint and make the slogan ‘A healthier life, by design.’”
  3. “Make ‘Health Blueprint’ white and the rest a darker shade of blue.” The first retry did not work, so the wording was repeated and the colors were made explicit.
  4. “Add these movements” — a detailed 13-muscle-group list containing 135 requested strength exercises.
  5. “Make the potential workouts only the ones that I just sent, take out any pre-existing ones.”
  6. “Now add these options for cardio” — low-impact, moderate/high-intensity, and HIIT lists containing 37 requested activities.
  7. “My GitHub Pages deployment says it was successful, but the website is not displaying correctly. Investigate why, fix the deployment issue, publish it through GitHub Pages, and commit and push the changes.”
  8. “Make the cardio options look better, with the different types listed and options below them.”
  9. “For the food and nutrition part, make sure the images actually match each food or meal.”
  10. “Change ‘Your student-friendly meal plan’ to just ‘Meal plan.’”
- **What worked:** Copilot changed the brand and slogan, replaced the workout catalog with the 135 specific requested exercises, added and grouped 37 cardio options, expanded goal-based nutrition planning, corrected nutrition assets, and published a working live URL.
- **What broke, and how we fixed it:** The live link initially showed GitHub Pages’ “Site not found” or 404 page. Copilot added `.nojekyll`, committed it to `main`, verified the live site returned HTTP 200, and confirmed that the CSS, scripts, and assets loaded. The white/blue slogan colors also needed a retry because the first attempt did not work. Later visual updates were committed so the live site matched the local preview.
- **Committed?** yes — 3e54b3d `version 5`; 2c0eaea `version 6`; ec2d46b `Fix GitHub Pages static publishing`; d1ee52c `version 7`; 4df0349 `Expand goal-based nutrition planner`; ca44bc3 `version 7`; 69acead `version 8`

### Session — 2026-11-25 — driver: not recorded

- **Goal for this session:** Review the project log and reconstruct the earlier website work in the format required by the teacher.
- **Key prompts we gave Copilot** (paste the important ones):
  1. “Can you access my project log?”
  2. “Go back and input anything I asked you to do in relation to the website, including dates, what I asked for, and changes or fixes in the correct spots.”
- **What worked:** Copilot accessed [PROJECT_LOG.md](/workspaces/ai-to-startup-template/project-notes/PROJECT_LOG.md), reconstructed earlier requests from the session history and GitHub commit history, and used the live URL to verify publication.
- **What broke, and how we fixed it:** No website code change was made during this log-entry session. The project log template was incomplete, so it was filled with dated work-session summaries and a dated troubleshooting table.
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
i was most supprised at the amount that the ai can build with a smaller prompt, i would ask it to set up the website and make it a certain way and it builds a more in depth and bigger website than the prompt would seem to make. i also noticed that if i had a problem, i cold ask it whats wrong or it can notuce what im asking it and fix it more than i even asked as well. It would do more than asked which was in my favour. 
2. Which parts were easy, and which were hard? Why do you think that is?
the easy parts where to write the initial prompts that i wanted done., but the harder parts are when the ai would somtimes not fully understand what you wanted done and it would take a couple tries to get it right, or you would have to expand on the promnpt to talk to the ai like its a todler.
3. If a competitor had the same AI tool, how long would it take them to copy your site?
I dont think it would be that difficult to replicate something like mine, due to the nature of ai and what it can do. But, i think that due to some of my pre existing Gym and health knowledge, i could create prompts that someone without the pre existing knowledge could. so i think yes they could replicate it, but not 100% due to the actual persons ability and knowledge to go through the ai.
