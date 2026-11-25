
/* =====================================================================
   09z: wire build 5 into the app: migrations, navigation, screens.
   ===================================================================== */
{ const _m4 = migrate4; migrate4 = function () { _m4(); migrate5(); migrate5b(); migrate5c(); }; }
{ const at = (nav, after, item) => { const i = nav.findIndex(n => n[0] === after); nav.splice(i < 0 ? nav.length - 1 : i + 1, 0, item); };
  at(COACH_NAV, 'clients', ['clienttable', 'Client table', 'table']);
  at(COACH_NAV, 'programmes', ['mealplans', 'Meal plans', 'cart']);
  at(COACH_NAV, 'library', ['exvideos', 'Demo videos', 'play']);
  at(COACH_NAV, 'community', ['challenges', 'Challenges', 'trophy']);
  at(COACH_NAV, 'challenges', ['habits', 'Habit library', 'tick']);
  COACH_NAV.splice(COACH_NAV.findIndex(n => n[0] === 'settings'), 0, ['ws', 'Workspace', 'page']);
  at(CLIENT_NAV, 'checkin', ['docs', 'Roadmap', 'page']);
  at(CLIENT_NAV, 'community', ['challenges', 'Challenges', 'trophy']); }
const CMORE_DESC = { schedule: 'Calls and appointments', programmes: 'Templates, workout library and client programmes', library: 'Exercise library', foodlib: 'Shared foods and scanned barcodes, with who added them', community: 'Group feed and leaderboard', billing: 'Payments and renewals', content: 'Video modules and PDF protocols', automations: 'Auto messages and saved replies', forms: 'Weekly check-in, onboarding and your own forms', concerns: 'Problems clients have raised', faq: 'Answers clients can look up', settings: 'Brand, plans, questions, backup',
  clienttable: 'Every client side by side, with auto tags', mealplans: 'Site-day and rest-day menus, recipes, diary settings', exvideos: 'Add a demo link to any exercise', challenges: 'Leaderboard and threshold challenges', habits: 'Ready-made habits to assign', ws: 'Pages, SOPs, leads, content planner, client roadmaps' };
function viewCMore5() { return shell('More', 'Coach HQ', `<div class="stack">${COACH_NAV.filter(n => !COACH_BOTTOM.includes(n[0])).map(([v, l, i]) => menuItem(v, i, l, CMORE_DESC[v] || '', v === 'schedule' && navDot('schedule') ? 'New' : '')).join('')}<button class="btn ghost" data-act="logout">${IC.out} Log out</button></div>`, { nav: 'cmore' }); }
const _menu = VIEWS.client.menu, _tools = VIEWS.client.tools;
Object.assign(VIEWS.coach, { cmore: viewCMore5, mealplans: viewMealPlans, mealplan: viewMealPlan, recipes: viewRecipes, recipe: viewRecipe, nutrition: viewNutrition, challenges: viewChallenges, challenge: viewChallenge, habits: viewHabits, clienttable: viewClientTable, exvideos: viewExVideos, ws: viewWs, wstrash: viewWsTrash, page: viewPage, timer: viewTimer });
Object.assign(VIEWS.client, { fuel: viewFuel5, nutrition: viewNutrition, recipes: viewRecipes, recipe: viewRecipe, myplan: viewMyPlan, grocery: viewGrocery, challenges: viewChallenges, challenge: viewChallenge, docs: viewDocs, page: viewPage, timer: viewTimer,
  menu: () => { const h = _menu(), c = me(), shared = S.pages.filter(p => alive(p) && !p.rowOf && (p.share === 'all' || (Array.isArray(p.share) && p.share.includes(c.id)))).length, live = S.challenges.filter(ch => today() <= ch.end && chPeople(ch).some(x => x.id === c.id)).length;
    const add = `${menuItem('docs', 'page', 'Your roadmap', shared ? `${shared} page${shared > 1 ? 's' : ''} from ${esc(S.settings.coachName)}` : 'Plans and guides from your coach', '', { _back: 'menu' })}${menuItem('challenges', 'trophy', 'Challenges', live ? `${live} running now` : 'Compete with the lads', live ? 'Live' : '', { _back: 'menu' })}${menuItem('nutrition', 'chart', 'Nutrition report', 'Averages, macro split and top foods', '', { _back: 'menu' })}${menuItem('recipes', 'book', 'Recipes', 'Batch cooks, logged by the portion', '', { _back: 'menu' })}${planOf(c) ? menuItem('grocery', 'cart', 'Shopping list', 'From your meal plan', '', { _back: 'menu' }) : ''}`;
    const i = h.indexOf('<div class="stack">'); return i < 0 ? h : h.slice(0, i + 19) + add + h.slice(i + 19); },
  tools: () => { const h = _tools(), i = h.indexOf('<div class="stack">'); return i < 0 ? h : h.slice(0, i + 19) + menuItem('timer', 'timer', 'Interval timer', 'Tabata, EMOM, circuits, with beeps', '', { _back: 'tools' }) + h.slice(i + 19); } });
