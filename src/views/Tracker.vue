<template>
  <div class="tracker-layout">
    <Sidebar />

    <main class="tracker-page">
      <div class="tracker-shell">
        <section class="tracker-hero">
          <div class="tracker-hero-copy">
            <p class="tracker-kicker">Macro Tracker</p>
            <h1 class="tracker-title">Nutrition Tracking Made Easy</h1>
            <p class="tracker-description">
              Review daily progress, and keep your meal log tidy.
            </p>

            <div class="tracker-hero-actions">
              <button class="log-meal-btn" @click="openCreateModal">
                <span class="plus-icon">+</span>
                <span>Log Meal</span>
              </button>
            </div>
          </div>

          <div class="tracker-toolbar-right">
            <button
              class="today-shortcut"
              :class="{ active: selectedDateKey === todayKey }"
              @click="goToToday"
            >
              Today
            </button>

            <label class="jump-date-field">
              <span>Jump to date</span>
              <input v-model="jumpDateInput" type="date" />
            </label>
          </div>
        </section>

        <section class="date-strip-card">
          <button class="nav-arrow" @click="moveSelectedDate(-1)" aria-label="Previous day">
            &#8249;
          </button>

          <div class="date-strip">
            <button
              v-for="day in visibleDates"
              :key="day.key"
              class="date-pill"
              :class="{ active: day.key === selectedDateKey }"
              @click="selectDate(day.date)"
            >
              <span class="weekday-label">{{ day.weekday }}</span>
              <span class="date-number">{{ day.dayNumber }}</span>
            </button>
          </div>

          <button class="nav-arrow" @click="moveSelectedDate(1)" aria-label="Next day">
            &#8250;
          </button>
        </section>

        <section class="selected-date-heading">
          <p class="selected-date-label">Selected date</p>
          <h2>{{ selectedDateHeading }}</h2>
          <p>{{ selectedDateSubheading }}</p>
        </section>

        <section class="dashboard-grid">
          <article class="summary-card">
            <div class="card-header">
              <p class="card-eyebrow">Daily overview</p>
              <h2>Calories</h2>
              <p class="card-support">
                Consumed: {{ nutritionTotals.calories }} / Goal: {{ calorieGoal }}
              </p>
            </div>

            <div class="ring-wrap">
              <div
                class="progress-ring"
                :class="{ exceeded: isAnyGoalExceeded }"
                :style="ringStyle"
              >
                <div class="ring-center">
                  <div class="ring-value">{{ calorieStatusNumber }}</div>
                  <div class="ring-label">{{ calorieStatusLabel }}</div>
                </div>
              </div>
            </div>

            <div class="macro-grid">
              <div
                v-for="macro in macroCards"
                :key="macro.label"
                class="macro-card"
                :class="{ exceeded: macro.exceeded }"
              >
                <div class="macro-top">
                  <span class="macro-dot" :style="{ background: macro.color }"></span>
                  <span class="macro-label">{{ macro.label }}</span>
                </div>
                <div class="macro-value">{{ macro.value }}g</div>
                <div class="macro-goal">of {{ macro.goal }}g</div>
              </div>
            </div>
          </article>

          <article class="meals-card">
            <div class="card-header">
              <p class="card-eyebrow">Food diary</p>
              <h2>Meals</h2>
              <p v-if="loadingMeals" class="card-support">
                Loading entries for {{ selectedDateSubheading }}...
              </p>
              <p v-else class="card-support">
                {{ selectedDateContext }} | {{ mealCountLabel }}
              </p>
            </div>

            <div class="meal-sections">
              <section
                v-for="section in mealSections"
                :key="section.label"
                class="meal-section"
              >
                <div class="meal-section-header">
                  <h3>{{ section.label }}</h3>
                  <span>{{ section.totalCalories }} cal</span>
                </div>

                <div v-if="section.items.length" class="meal-list">
                  <div
                    v-for="meal in section.items"
                    :key="meal.id"
                    class="meal-row"
                    :class="{ 'menu-open': openMealMenuId === meal.id }"
                    @click="openMealDetails(meal)"
                  >
                    <img
                      class="meal-photo"
                      :src="meal.image || fallbackMealImage"
                      :alt="meal.name"
                    />

                    <div class="meal-copy">
                      <div class="meal-name">{{ meal.name }}</div>
                      <div class="meal-source">{{ meal.source }}</div>
                      <div class="meal-meta">
                        <span>{{ meal.calories }} cal</span>
                        <span class="meta-separator">|</span>
                        <span class="protein-highlight">{{ meal.protein }}g protein</span>
                        <template v-if="meal.servings && meal.servings !== 1">
                          <span class="meta-separator">|</span>
                          <span class="servings-highlight">{{ formatServings(meal.servings) }}</span>
                        </template>
                      </div>
                    </div>

                    <div class="meal-actions" @click.stop>
                      <button
                        class="meal-settings"
                        aria-label="Meal options"
                        @click.stop="toggleMealMenu(meal.id)"
                      >
                        &#9881;
                      </button>

                      <div v-if="openMealMenuId === meal.id" class="meal-menu">
                        <button @click.stop="logMealAgain(meal)">Log again</button>
                        <button @click.stop="startEditMeal(meal)">Edit entry</button>
                        <button class="danger" @click.stop="deleteMeal(meal.id)">Delete entry</button>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-else class="empty-meal-state">
                  No meals logged
                </div>
              </section>
            </div>
          </article>
        </section>
      </div>
    </main>

    <div v-if="selectedMeal" class="meal-detail-overlay" @click="closeMealDetails">
      <aside class="meal-detail-panel" @click.stop>
        <button class="detail-close" @click="closeMealDetails">x</button>

        <img
          class="detail-photo"
          :src="selectedMeal.image || fallbackMealImage"
          :alt="selectedMeal.name"
        />

        <div class="detail-content">
          <h2>{{ selectedMeal.name }}</h2>
          <p class="detail-source">{{ selectedMeal.source }}</p>
          <p class="detail-time">
            {{ selectedMeal.mealTime }} | {{ formatDateForDisplay(selectedMeal.dateKey) }}
            <span v-if="selectedMeal.servings && selectedMeal.servings !== 1">
              | {{ formatServings(selectedMeal.servings) }}
            </span>
          </p>

          <div class="detail-macros">
            <div class="detail-macro">
              <span>Calories</span>
              <strong>{{ selectedMeal.calories }}</strong>
            </div>
            <div class="detail-macro">
              <span>Protein</span>
              <strong>{{ selectedMeal.protein }}g</strong>
            </div>
            <div class="detail-macro">
              <span>Carbs</span>
              <strong>{{ selectedMeal.carbs }}g</strong>
            </div>
            <div class="detail-macro">
              <span>Fat</span>
              <strong>{{ selectedMeal.fat }}g</strong>
            </div>
          </div>

          <div class="detail-actions">
            <button class="detail-action-btn" @click="logMealAgain(selectedMeal)">
              Log Again
            </button>
            <button
              class="detail-action-btn secondary"
              @click="handleEditFromDetail"
            >
              Edit Entry
            </button>
            <button
              class="detail-action-btn danger"
              @click="handleDeleteFromDetail"
            >
              Delete Entry
            </button>
          </div>

          <div class="ingredients-block">
            <h3>Ingredients</h3>
            <ul v-if="selectedMeal.ingredients.length">
              <li v-for="ingredient in selectedMeal.ingredients" :key="ingredient">
                {{ ingredient }}
              </li>
            </ul>
            <p v-else class="ingredients-empty">Ingredients not available for this entry.</p>
          </div>
        </div>
      </aside>
    </div>

    <div v-if="isMealModalOpen" class="modal-overlay" @click="closeMealModal">
      <div class="meal-modal" @click.stop>
        <div class="modal-header">
          <div>
            <h2>{{ editingMealId ? "Edit Meal Entry" : "Log Your Meal" }}</h2>
            <p>Add a meal from the shared food database or create a custom entry.</p>
          </div>
          <button class="modal-close" @click="closeMealModal">x</button>
        </div>

        <div class="modal-body">
          <label class="modal-field">
            <span>Date</span>
            <input v-model="mealForm.date" type="date" />
          </label>

          <div class="modal-field">
            <span>Meal Category</span>
            <div class="meal-category-grid">
              <button
                v-for="category in mealCategories"
                :key="category"
                class="category-chip"
                :class="{ active: mealForm.mealTime === category }"
                @click="mealForm.mealTime = category"
              >
                {{ category }}
              </button>
            </div>
          </div>

          <div class="entry-mode-toggle">
            <button
              class="entry-mode-button"
              :class="{ active: mealForm.mode === 'search' }"
              @click="setSearchMode"
            >
              Search Food Database
            </button>
            <button
              class="entry-mode-button"
              :class="{ active: mealForm.mode === 'custom' }"
              @click="setCustomMode"
            >
              + Custom Entry
            </button>
          </div>

          <div v-if="mealForm.mode === 'search'" class="search-panel">
            <label class="modal-field">
              <span>Search Food</span>
              <div class="search-input-box">
                <span class="search-icon">&#128269;</span>
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search by food, restaurant, or cuisine"
                  autocomplete="off"
                />
              </div>
            </label>

            <div class="search-filter-grid">
              <label class="modal-field compact-field">
                <span>Cuisine</span>
                <select v-model="searchFilters.cuisine">
                  <option value="">All cuisines</option>
                  <option
                    v-for="option in cuisineOptions"
                    :key="option"
                    :value="option"
                  >
                    {{ option }}
                  </option>
                </select>
              </label>

              <label class="modal-field compact-field">
                <span>Restaurant</span>
                <select v-model="searchFilters.restaurant">
                  <option value="">All restaurants</option>
                  <option
                    v-for="option in restaurantOptions"
                    :key="option"
                    :value="option"
                  >
                    {{ option }}
                  </option>
                </select>
              </label>

              <label class="modal-field compact-field">
                <span>Calories</span>
                <select v-model="searchFilters.calorieRange">
                  <option value="">All calories</option>
                  <option value="under500">Under 500 cal</option>
                  <option value="500to800">500 - 800 cal</option>
                  <option value="801to1200">801 - 1200 cal</option>
                  <option value="over1200">Above 1200 cal</option>
                </select>
              </label>
            </div>

            <p class="search-meta" v-if="hasActiveSearchOrFilters">
              {{ filteredFoods.length }} result{{ filteredFoods.length === 1 ? "" : "s" }} found
            </p>
            <p class="search-meta muted" v-else>
              Start typing to search the Firebase food database or use the filters.
            </p>

            <div class="search-results" v-if="hasActiveSearchOrFilters">
              <button
                v-for="food in filteredFoods"
                :key="food.key"
                class="search-result-card"
                :class="{ selected: selectedCatalogFoodKey === food.key }"
                @click="selectCatalogFood(food)"
              >
                <img
                  class="search-result-thumb"
                  :src="food.image || fallbackMealImage"
                  :alt="food.name"
                />

                <div class="search-result-left">
                  <div class="search-result-name">{{ food.name }}</div>
                  <div class="search-result-source">
                    {{ food.restaurantName }}
                    <span v-if="food.cuisineType"> | {{ food.cuisineType }}</span>
                  </div>
                </div>

                <div class="search-result-right">
                  <div class="search-result-calories">{{ food.calories }} cal</div>
                  <div class="search-result-protein">{{ food.protein }}g Protein</div>
                  <div class="search-result-macros">
                    {{ food.carbs }}g Carbs | {{ food.fat }}g Fat
                  </div>
                </div>
              </button>

              <div v-if="!filteredFoods.length" class="empty-search-state">
                No matching foods found.
              </div>
            </div>

            <div v-if="scaledSelectedFood" class="selected-food-preview">
              <img
                :src="scaledSelectedFood.image || fallbackMealImage"
                :alt="scaledSelectedFood.name"
                class="selected-food-image"
              />

              <div class="selected-food-copy">
                <div class="selected-food-title">{{ scaledSelectedFood.name }}</div>
                <div class="selected-food-subtitle">
                  {{ scaledSelectedFood.restaurantName }}
                </div>
                <div class="selected-food-totals">
                  {{ scaledSelectedFood.calories }} cal |
                  {{ scaledSelectedFood.protein }}g protein |
                  {{ scaledSelectedFood.carbs }}g carbs |
                  {{ scaledSelectedFood.fat }}g fat
                </div>
              </div>

              <div class="selected-food-servings">
                <span>Servings</span>
                <div class="serving-stepper">
                  <button
                    class="serving-stepper-btn"
                    type="button"
                    @click="adjustServings(-0.5)"
                  >
                    -
                  </button>

                  <input
                    v-model.number="mealForm.servings"
                    class="serving-stepper-input"
                    type="number"
                    min="0.5"
                    step="0.5"
                    @blur="normalizeServingsField"
                  />

                  <button
                    class="serving-stepper-btn"
                    type="button"
                    @click="adjustServings(0.5)"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="custom-panel">
            <label class="modal-field">
              <span>Food Name</span>
              <input v-model="mealForm.name" type="text" placeholder="e.g. Sambal Stingray" />
            </label>

            <label class="modal-field">
              <span>Food Source</span>
              <input
                v-model="mealForm.source"
                type="text"
                placeholder="e.g. Ban Leong Wah Hoe Seafood Restaurant"
              />
            </label>

            <div class="custom-macro-grid">
              <label class="modal-field">
                <span>Calories</span>
                <input v-model.number="mealForm.calories" type="number" min="0" />
              </label>

              <label class="modal-field">
                <span>Protein (g)</span>
                <input v-model.number="mealForm.protein" type="number" min="0" />
              </label>

              <label class="modal-field">
                <span>Carbs (g)</span>
                <input v-model.number="mealForm.carbs" type="number" min="0" />
              </label>

              <label class="modal-field">
                <span>Fat (g)</span>
                <input v-model.number="mealForm.fat" type="number" min="0" />
              </label>
            </div>

            <label class="modal-field">
              <span>Ingredients</span>
              <textarea
                v-model="mealForm.ingredientsText"
                rows="4"
                placeholder="Separate ingredients with commas"
              ></textarea>
            </label>

            <div class="upload-panel">
              <label class="upload-box">
                <input type="file" accept="image/*" @change="handlePhotoUpload" />
                <span>Attach a meal photo</span>
                <small>{{ mealForm.uploadLabel || "Optional" }}</small>
              </label>

              <div v-if="mealForm.previewImage" class="upload-preview-wrap">
                <img :src="mealForm.previewImage" alt="Meal preview" class="upload-preview" />
              </div>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button class="secondary-btn" @click="closeMealModal">Cancel</button>
          <button
            class="primary-btn"
            :disabled="!canSubmitMeal"
            @click="saveMeal"
          >
            {{ editingMealId ? "Save Changes" : "Confirm & Log" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from "vue";
import { onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import Sidebar from "../components/Sidebar.vue";
import { auth, db } from "../firebase";
import { useUserProfile } from "../composables/useUserProfile";

const { profile, loadProfile } = useUserProfile();
const fallbackNutritionGoals = {
  calories: 2500,
  carbs: 250,
  protein: 150,
  fat: 80,
};

const mealCategories = ["Breakfast", "Lunch", "Dinner", "Snacks"];

const currentUser = ref(null);
const mealEntries = ref([]);
const availableFoods = ref([]);
const loadingMeals = ref(false);
const loadingFoods = ref(false);

const selectedOffset = ref(0);
const openMealMenuId = ref(null);
const selectedMealId = ref(null);
const isMealModalOpen = ref(false);
const editingMealId = ref(null);

const selectedCatalogFoodKey = ref("");
const searchQuery = ref("");

const searchFilters = reactive({
  cuisine: "",
  restaurant: "",
  calorieRange: "",
});

const fallbackMealImage = svgMealImage("MEAL", "#38c88f", "#4f8ef7");

const mealForm = reactive({
  mode: "search",
  date: "",
  mealTime: "Lunch",
  name: "",
  source: "",
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  servings: 1,
  ingredientsText: "",
  previewImage: "",
  uploadLabel: "",
  restaurantDocId: "",
  restaurantBusinessId: "",
  menuItemId: "",
  cuisineType: "",
});

const today = new Date();
today.setHours(12, 0, 0, 0);
const todayKey = toLocalDateKey(today);

let unsubscribeAuth = null;
let unsubscribeMealLogs = null;

function cloneDate(date) {
  return new Date(date.getTime());
}

function shiftDate(date, days) {
  const next = cloneDate(date);
  next.setDate(next.getDate() + days);
  return next;
}

function toLocalDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatWeekday(date) {
  return date.toLocaleDateString("en-SG", { weekday: "long" });
}

function formatMonthDay(date) {
  return date.toLocaleDateString("en-SG", {
    day: "numeric",
    month: "long",
  });
}

function formatDateForDisplay(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-SG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatServings(value) {
  const servings = normalizeNumber(value) || 1;
  return servings === 1 ? "1 serving" : `${servings} servings`;
}

function svgMealImage(label, startColor, endColor) {
  const safeLabel = String(label || "MEAL").slice(0, 8);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="280" viewBox="0 0 400 280">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${startColor}" />
          <stop offset="100%" stop-color="${endColor}" />
        </linearGradient>
      </defs>
      <rect width="400" height="280" rx="32" fill="url(#g)" />
      <circle cx="92" cy="86" r="34" fill="rgba(255,255,255,0.18)" />
      <circle cx="300" cy="198" r="54" fill="rgba(255,255,255,0.14)" />
      <text x="200" y="150" text-anchor="middle" font-size="42" font-family="Arial, sans-serif" font-weight="800" fill="white">${safeLabel}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function normalizeNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeIngredients(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function roundMacro(value) {
  return Math.round(value * 10) / 10;
}

function roundServings(value) {
  return Math.round(value * 2) / 2;
}

function resolveGoalValue(value, fallbackValue) {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) && parsedValue > 0
    ? parsedValue
    : fallbackValue;
}

function matchesCalorieRange(calories, range) {
  if (!range) return true;
  if (range === "under500") return calories < 500;
  if (range === "500to800") return calories >= 500 && calories <= 800;
  if (range === "801to1200") return calories >= 801 && calories <= 1200;
  if (range === "over1200") return calories > 1200;
  return true;
}

function getSearchScore(food, query) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return 1;

  const queryTerms = normalizedQuery.split(/\s+/).filter(Boolean);

  const candidates = [food.name, food.restaurantName, food.cuisineType]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());

  let bestScore = 0;

  for (const candidate of candidates) {
    const words = candidate.split(/[\s/,&()'-]+/).filter(Boolean);

    if (candidate === normalizedQuery) {
      bestScore = Math.max(bestScore, 1200);
    }

    if (words.includes(normalizedQuery)) {
      bestScore = Math.max(bestScore, 1100);
    }

    if (candidate.startsWith(normalizedQuery)) {
      bestScore = Math.max(bestScore, 1000 - candidate.length);
    }

    const wordPrefixIndex = words.findIndex((word) => word.startsWith(normalizedQuery));
    if (wordPrefixIndex !== -1) {
      bestScore = Math.max(bestScore, 900 - wordPrefixIndex * 5);
    }

    if (normalizedQuery.length >= 3) {
      const includesIndex = candidate.indexOf(normalizedQuery);
      if (includesIndex !== -1) {
        bestScore = Math.max(bestScore, 760 - includesIndex);
      }
    }

    if (
      queryTerms.length > 1 &&
      queryTerms.every(
        (term) => candidate.includes(term) || words.some((word) => word.startsWith(term)),
      )
    ) {
      bestScore = Math.max(bestScore, 840);
    }
  }

  return bestScore;
}

function normalizeFoodItem(item, restaurantDocId, restaurantData, fallbackId) {
  const restaurantName =
    restaurantData.business_name ||
    restaurantData.name ||
    "Unknown Restaurant";

  const restaurantBusinessId = restaurantData.restaurant_id || "";

  const restaurantImage =
    restaurantData.mainImage ||
    restaurantData.image ||
    "";

  const name = item.name || item.title || item.foodName || "Unnamed Item";
  const image = item.image || item.imageUrl || item.photo || restaurantImage || "";
  const ingredients = normalizeIngredients(item.ingredients);

  return {
    key: `${restaurantDocId}||${fallbackId}`,
    id: fallbackId,
    restaurantDocId,
    restaurantBusinessId,
    menuItemId: fallbackId,
    restaurantName,
    cuisineType: restaurantData.cuisineType || "",
    name,
    image,
    price: normalizeNumber(item.price),
    calories: normalizeNumber(item.calories ?? item.kcal),
    protein: normalizeNumber(item.protein ?? item.proteins),
    carbs: normalizeNumber(item.carbs ?? item.carbohydrates),
    fat: normalizeNumber(item.fat ?? item.fats),
    ingredients,
  };
}

async function fetchAvailableFoods() {
  if (!currentUser.value) return;

  loadingFoods.value = true;

  try {
    const restaurantsSnapshot = await getDocs(collection(db, "newRestaurants"));
    const foods = [];

    for (const restaurantDoc of restaurantsSnapshot.docs) {
      const restaurantData = restaurantDoc.data();

      if (Array.isArray(restaurantData.menuItems) && restaurantData.menuItems.length > 0) {
        restaurantData.menuItems.forEach((item, index) => {
          foods.push(
            normalizeFoodItem(
              item,
              restaurantDoc.id,
              restaurantData,
              item.id || `inline-${index}`,
            ),
          );
        });
      } else {
        const menuSnapshot = await getDocs(
          collection(db, "newRestaurants", restaurantDoc.id, "menuItems"),
        );

        menuSnapshot.forEach((menuDoc) => {
          foods.push(
            normalizeFoodItem(
              menuDoc.data(),
              restaurantDoc.id,
              restaurantData,
              menuDoc.id,
            ),
          );
        });
      }
    }

    foods.sort((a, b) => a.name.localeCompare(b.name));
    availableFoods.value = foods;
  } catch (error) {
    console.error("Error fetching available foods:", error);
  } finally {
    loadingFoods.value = false;
  }
}

function fetchMealLogs() {
  if (!currentUser.value) {
    console.warn("fetchMealLogs called but currentUser is null");
    return () => {};
  }

  console.log("Setting up meal logs listener for user:", currentUser.value.uid);
  loadingMeals.value = true;

  try {
    // Set up real-time listener
    const unsubscribe = onSnapshot(
      collection(db, "users", currentUser.value.uid, "mealLogs"),
      (snapshot) => {
        console.log("Meal logs listener triggered, doc count:", snapshot.docs.length);
        
        const meals = snapshot.docs.map((entryDoc) => {
          const data = entryDoc.data();
          console.log("Meal document:", { id: entryDoc.id, data });

          return {
            id: entryDoc.id,
            userId: data.userId || currentUser.value.uid,
            dateKey: data.dateKey || toLocalDateKey(today),
            mealTime: data.mealTime || "Breakfast",
            name: data.name || "Unnamed Meal",
            source: data.source || "Saved Entry",
            calories: normalizeNumber(data.calories),
            protein: normalizeNumber(data.protein),
            carbs: normalizeNumber(data.carbs),
            fat: normalizeNumber(data.fat ?? data.fats),
            servings: normalizeNumber(data.servings) || 1,
            ingredients: normalizeIngredients(data.ingredients),
            image: data.image || "",
            restaurantDocId: data.restaurantDocId || "",
            restaurantBusinessId: data.restaurantBusinessId || "",
            menuItemId: data.menuItemId || "",
            cuisineType: data.cuisineType || "",
          };
        });

        meals.sort((a, b) => {
          if (a.dateKey === b.dateKey) return a.mealTime.localeCompare(b.mealTime);
          return b.dateKey.localeCompare(a.dateKey);
        });

        console.log("Updated mealEntries with", meals.length, "meals");
        mealEntries.value = meals;
        loadingMeals.value = false;
      },
      (error) => {
        console.error("Error setting up meal logs listener:", error);
        loadingMeals.value = false;
      }
    );

    console.log("Listener setup complete, returning unsubscribe function");
    return unsubscribe;
  } catch (error) {
    console.error("Error fetching meal logs:", error);
    loadingMeals.value = false;
    return () => {};
  }
}

const selectedDate = computed(() => shiftDate(today, selectedOffset.value));
const selectedDateKey = computed(() => toLocalDateKey(selectedDate.value));

const jumpDateInput = computed({
  get: () => selectedDateKey.value,
  set: (value) => {
    if (!value) return;
    const nextDate = new Date(`${value}T12:00:00`);
    if (Number.isNaN(nextDate.getTime())) return;
    selectDate(nextDate);
  },
});

const visibleDates = computed(() =>
  [-2, -1, 0, 1, 2].map((offset) => {
    const date = shiftDate(selectedDate.value, offset);
    return {
      key: toLocalDateKey(date),
      date,
      weekday: formatWeekday(date),
      dayNumber: date.getDate(),
    };
  }),
);

const selectedDateHeading = computed(() => formatWeekday(selectedDate.value));
const selectedDateSubheading = computed(() => formatMonthDay(selectedDate.value));
const selectedDateContext = computed(
  () => `${selectedDateHeading.value} | ${selectedDateSubheading.value}`,
);

const calorieGoal = computed(() =>
  resolveGoalValue(profile.value.dailyCalories, fallbackNutritionGoals.calories),
);

const macroGoals = computed(() => ({
  carbs: resolveGoalValue(
    profile.value.macroTargets?.carbsG,
    fallbackNutritionGoals.carbs,
  ),
  protein: resolveGoalValue(
    profile.value.macroTargets?.proteinG,
    fallbackNutritionGoals.protein,
  ),
  fat: resolveGoalValue(
    profile.value.macroTargets?.fatG,
    fallbackNutritionGoals.fat,
  ),
}));

const mealsForSelectedDate = computed(() =>
  mealEntries.value.filter((meal) => meal.dateKey === selectedDateKey.value),
);

const mealCountLabel = computed(
  () =>
    `${mealsForSelectedDate.value.length} item${mealsForSelectedDate.value.length === 1 ? "" : "s"} logged`,
);

const nutritionTotals = computed(() =>
  mealsForSelectedDate.value.reduce(
    (totals, meal) => {
      totals.calories += meal.calories;
      totals.protein += meal.protein;
      totals.carbs += meal.carbs;
      totals.fat += meal.fat;
      return totals;
    },
    {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    },
  ),
);

const isAnyGoalExceeded = computed(
  () =>
    nutritionTotals.value.calories > calorieGoal.value ||
    nutritionTotals.value.carbs > macroGoals.value.carbs ||
    nutritionTotals.value.protein > macroGoals.value.protein ||
    nutritionTotals.value.fat > macroGoals.value.fat,
);

const calorieStatusNumber = computed(() => {
  if (nutritionTotals.value.calories > calorieGoal.value) {
    return nutritionTotals.value.calories - calorieGoal.value;
  }
  return calorieGoal.value - nutritionTotals.value.calories;
});

const calorieStatusLabel = computed(() =>
  nutritionTotals.value.calories > calorieGoal.value ? "OVER LIMIT" : "REMAINING",
);

const ringProgress = computed(() =>
  Math.min(nutritionTotals.value.calories / calorieGoal.value, 1),
);

const ringStyle = computed(() => ({
  "--ring-progress": `${ringProgress.value * 360}deg`,
}));

const macroCards = computed(() => [
  {
    label: "Carbs",
    value: nutritionTotals.value.carbs,
    goal: macroGoals.value.carbs,
    color: "#22c7e8",
    exceeded: nutritionTotals.value.carbs > macroGoals.value.carbs,
  },
  {
    label: "Protein",
    value: nutritionTotals.value.protein,
    goal: macroGoals.value.protein,
    color: "#6aa7ff",
    exceeded: nutritionTotals.value.protein > macroGoals.value.protein,
  },
  {
    label: "Fat",
    value: nutritionTotals.value.fat,
    goal: macroGoals.value.fat,
    color: "#ff6b6b",
    exceeded: nutritionTotals.value.fat > macroGoals.value.fat,
  },
]);

const sectionOrder = ["Breakfast", "Lunch", "Dinner", "Snacks"];

const mealSections = computed(() =>
  sectionOrder.map((label) => {
    const items = mealsForSelectedDate.value.filter((meal) => meal.mealTime === label);
    return {
      label,
      items,
      totalCalories: items.reduce((sum, meal) => sum + meal.calories, 0),
    };
  }),
);

const selectedMeal = computed(
  () => mealEntries.value.find((meal) => meal.id === selectedMealId.value) || null,
);

const cuisineOptions = computed(() =>
  [...new Set(availableFoods.value.map((food) => food.cuisineType).filter(Boolean))].sort(),
);

const restaurantOptions = computed(() =>
  [...new Set(availableFoods.value.map((food) => food.restaurantName).filter(Boolean))].sort(),
);

const trimmedSearchQuery = computed(() => searchQuery.value.trim().toLowerCase());

const hasActiveSearchOrFilters = computed(
  () =>
    Boolean(trimmedSearchQuery.value) ||
    Boolean(searchFilters.cuisine) ||
    Boolean(searchFilters.restaurant) ||
    Boolean(searchFilters.calorieRange),
);

const filteredFoods = computed(() => {
  const baseFoods = availableFoods.value.filter((food) => {
    if (searchFilters.cuisine && food.cuisineType !== searchFilters.cuisine) return false;
    if (searchFilters.restaurant && food.restaurantName !== searchFilters.restaurant) return false;
    if (!matchesCalorieRange(food.calories, searchFilters.calorieRange)) return false;
    return true;
  });

  if (!trimmedSearchQuery.value) {
    return baseFoods.slice(0, 30);
  }

  return baseFoods
    .map((food) => ({
      food,
      score: getSearchScore(food, trimmedSearchQuery.value),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.food.name.localeCompare(b.food.name))
    .slice(0, 30)
    .map((entry) => entry.food);
});

const selectedCatalogFood = computed(
  () => availableFoods.value.find((food) => food.key === selectedCatalogFoodKey.value) || null,
);

const normalizedServings = computed(() => {
  const value = normalizeNumber(mealForm.servings);
  if (value < 0.5) return 1;
  return roundServings(value);
});

const scaledSelectedFood = computed(() => {
  if (!selectedCatalogFood.value) return null;

  const servings = normalizedServings.value;

  return {
    ...selectedCatalogFood.value,
    servings,
    calories: Math.round(selectedCatalogFood.value.calories * servings),
    protein: roundMacro(selectedCatalogFood.value.protein * servings),
    carbs: roundMacro(selectedCatalogFood.value.carbs * servings),
    fat: roundMacro(selectedCatalogFood.value.fat * servings),
  };
});

const canSubmitMeal = computed(() => {
  if (!currentUser.value) return false;

  if (mealForm.mode === "search") {
    return !!selectedCatalogFood.value;
  }

  return mealForm.name.trim().length > 0;
});

function moveSelectedDate(days) {
  selectedOffset.value += days;
  openMealMenuId.value = null;
  selectedMealId.value = null;
}

function selectDate(date) {
  const normalizedDate = cloneDate(date);
  normalizedDate.setHours(12, 0, 0, 0);
  const diffMs = normalizedDate.getTime() - today.getTime();
  selectedOffset.value = Math.round(diffMs / 86400000);
  openMealMenuId.value = null;
  selectedMealId.value = null;
}

function goToToday() {
  selectedOffset.value = 0;
  openMealMenuId.value = null;
  selectedMealId.value = null;
}

function openMealDetails(meal) {
  selectedMealId.value = meal.id;
  openMealMenuId.value = null;
}

function closeMealDetails() {
  selectedMealId.value = null;
}

function handleEditFromDetail() {
  if (!selectedMeal.value) return;
  const meal = selectedMeal.value;
  closeMealDetails();
  startEditMeal(meal);
}

async function handleDeleteFromDetail() {
  if (!selectedMeal.value) return;
  await deleteMeal(selectedMeal.value.id);
}

function toggleMealMenu(mealId) {
  openMealMenuId.value = openMealMenuId.value === mealId ? null : mealId;
}

function resetMealForm() {
  mealForm.mode = "search";
  mealForm.date = selectedDateKey.value;
  mealForm.mealTime = "Lunch";
  mealForm.name = "";
  mealForm.source = "";
  mealForm.calories = 0;
  mealForm.protein = 0;
  mealForm.carbs = 0;
  mealForm.fat = 0;
  mealForm.servings = 1;
  mealForm.ingredientsText = "";
  mealForm.previewImage = "";
  mealForm.uploadLabel = "";
  mealForm.restaurantDocId = "";
  mealForm.restaurantBusinessId = "";
  mealForm.menuItemId = "";
  mealForm.cuisineType = "";
  selectedCatalogFoodKey.value = "";
  searchQuery.value = "";
  searchFilters.cuisine = "";
  searchFilters.restaurant = "";
  searchFilters.calorieRange = "";
}

function setSearchMode() {
  mealForm.mode = "search";
}

function setCustomMode() {
  if (scaledSelectedFood.value) {
    mealForm.name = scaledSelectedFood.value.name;
    mealForm.source = scaledSelectedFood.value.restaurantName;
    mealForm.calories = scaledSelectedFood.value.calories;
    mealForm.protein = scaledSelectedFood.value.protein;
    mealForm.carbs = scaledSelectedFood.value.carbs;
    mealForm.fat = scaledSelectedFood.value.fat;
    mealForm.servings = scaledSelectedFood.value.servings;
    mealForm.ingredientsText = scaledSelectedFood.value.ingredients.join(", ");
    mealForm.previewImage = scaledSelectedFood.value.image || "";
    mealForm.uploadLabel = scaledSelectedFood.value.image ? "Image from Firebase food entry" : "";
    mealForm.restaurantDocId = scaledSelectedFood.value.restaurantDocId;
    mealForm.restaurantBusinessId = scaledSelectedFood.value.restaurantBusinessId;
    mealForm.menuItemId = scaledSelectedFood.value.menuItemId;
    mealForm.cuisineType = scaledSelectedFood.value.cuisineType || "";
  }

  mealForm.mode = "custom";
}

function openCreateModal() {
  editingMealId.value = null;
  resetMealForm();
  isMealModalOpen.value = true;
  openMealMenuId.value = null;
}

function startEditMeal(meal) {
  editingMealId.value = meal.id;
  mealForm.mode = "custom";
  mealForm.date = meal.dateKey;
  mealForm.mealTime = meal.mealTime;
  mealForm.name = meal.name;
  mealForm.source = meal.source;
  mealForm.calories = meal.calories;
  mealForm.protein = meal.protein;
  mealForm.carbs = meal.carbs;
  mealForm.fat = meal.fat;
  mealForm.servings = meal.servings || 1;
  mealForm.ingredientsText = meal.ingredients.join(", ");
  mealForm.previewImage = meal.image || "";
  mealForm.uploadLabel = meal.image ? "Current meal image" : "";
  mealForm.restaurantDocId = meal.restaurantDocId || "";
  mealForm.restaurantBusinessId = meal.restaurantBusinessId || "";
  mealForm.menuItemId = meal.menuItemId || "";
  mealForm.cuisineType = meal.cuisineType || "";
  selectedCatalogFoodKey.value =
    meal.restaurantDocId && meal.menuItemId
      ? `${meal.restaurantDocId}||${meal.menuItemId}`
      : "";
  searchQuery.value = meal.name || "";
  searchFilters.cuisine = meal.cuisineType || "";
  searchFilters.restaurant = meal.source || "";
  searchFilters.calorieRange = "";
  isMealModalOpen.value = true;
  openMealMenuId.value = null;
}

function closeMealModal() {
  isMealModalOpen.value = false;
  editingMealId.value = null;
}

function selectCatalogFood(food) {
  selectedCatalogFoodKey.value = food.key;
  mealForm.servings = 1;
}

function adjustServings(delta) {
  const nextValue = roundServings((normalizeNumber(mealForm.servings) || 1) + delta);
  mealForm.servings = Math.max(0.5, nextValue);
}

function normalizeServingsField() {
  mealForm.servings = Math.max(0.5, normalizedServings.value);
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function handlePhotoUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    mealForm.previewImage = await readFileAsDataURL(file);
    mealForm.uploadLabel = file.name;
  } catch (error) {
    console.error("Error reading image:", error);
    window.alert("Unable to read the selected image.");
  }
}

function findDuplicateMeal(payload, excludeMealId = "") {
  return mealEntries.value.find((meal) => {
    if (excludeMealId && meal.id === excludeMealId) return false;

    return (
      meal.dateKey === payload.dateKey &&
      meal.mealTime === payload.mealTime &&
      String(meal.name || "").trim().toLowerCase() === String(payload.name || "").trim().toLowerCase()
    );
  });
}

function confirmDuplicateIfNeeded(payload, excludeMealId = "") {
  const duplicate = findDuplicateMeal(payload, excludeMealId);
  if (!duplicate) return true;

  return window.confirm(
    `"${payload.name}" is already logged for ${payload.mealTime} on ${formatDateForDisplay(payload.dateKey)}. Save another entry anyway?`,
  );
}

async function saveMeal() {
  if (!currentUser.value) {
    window.alert("You must be logged in to save meals.");
    return;
  }

  let payload;

  if (mealForm.mode === "search") {
    if (!scaledSelectedFood.value) {
      window.alert("Please select a food from the search results.");
      return;
    }

    payload = {
      userId: currentUser.value.uid,
      dateKey: mealForm.date,
      mealTime: mealForm.mealTime,
      name: scaledSelectedFood.value.name,
      source: scaledSelectedFood.value.restaurantName,
      calories: scaledSelectedFood.value.calories,
      protein: scaledSelectedFood.value.protein,
      carbs: scaledSelectedFood.value.carbs,
      fat: scaledSelectedFood.value.fat,
      servings: scaledSelectedFood.value.servings,
      ingredients: scaledSelectedFood.value.ingredients,
      image: scaledSelectedFood.value.image || "",
      restaurantDocId: scaledSelectedFood.value.restaurantDocId || "",
      restaurantBusinessId: scaledSelectedFood.value.restaurantBusinessId || "",
      menuItemId: scaledSelectedFood.value.menuItemId || "",
      cuisineType: scaledSelectedFood.value.cuisineType || "",
      updatedAt: serverTimestamp(),
    };
  } else {
    if (!mealForm.name.trim()) {
      window.alert("Please enter a food name.");
      return;
    }

    const parsedIngredients = mealForm.ingredientsText
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    payload = {
      userId: currentUser.value.uid,
      dateKey: mealForm.date,
      mealTime: mealForm.mealTime,
      name: mealForm.name.trim(),
      source: mealForm.source.trim() || "Logged manually",
      calories: normalizeNumber(mealForm.calories),
      protein: normalizeNumber(mealForm.protein),
      carbs: normalizeNumber(mealForm.carbs),
      fat: normalizeNumber(mealForm.fat),
      servings: normalizedServings.value,
      ingredients: parsedIngredients,
      image: mealForm.previewImage || "",
      restaurantDocId: mealForm.restaurantDocId || "",
      restaurantBusinessId: mealForm.restaurantBusinessId || "",
      menuItemId: mealForm.menuItemId || "",
      cuisineType: mealForm.cuisineType || "",
      updatedAt: serverTimestamp(),
    };
  }

  const shouldContinue = confirmDuplicateIfNeeded(payload, editingMealId.value || "");
  if (!shouldContinue) return;

  try {
    if (editingMealId.value) {
      await updateDoc(
        doc(db, "users", currentUser.value.uid, "mealLogs", editingMealId.value),
        payload,
      );
    } else {
      await addDoc(
        collection(db, "users", currentUser.value.uid, "mealLogs"),
        {
          ...payload,
          createdAt: serverTimestamp(),
        },
      );
    }

    // Listener will automatically update mealEntries
    closeMealModal();
  } catch (error) {
    console.error("Error saving meal:", error);
    window.alert("Unable to save meal entry. Check your Firebase rules/structure.");
  }
}

async function logMealAgain(meal) {
  if (!currentUser.value || !meal) return;

  const payload = {
    userId: currentUser.value.uid,
    dateKey: selectedDateKey.value,
    mealTime: meal.mealTime,
    name: meal.name,
    source: meal.source,
    calories: normalizeNumber(meal.calories),
    protein: normalizeNumber(meal.protein),
    carbs: normalizeNumber(meal.carbs),
    fat: normalizeNumber(meal.fat),
    servings: normalizeNumber(meal.servings) || 1,
    ingredients: normalizeIngredients(meal.ingredients),
    image: meal.image || "",
    restaurantDocId: meal.restaurantDocId || "",
    restaurantBusinessId: meal.restaurantBusinessId || "",
    menuItemId: meal.menuItemId || "",
    cuisineType: meal.cuisineType || "",
    updatedAt: serverTimestamp(),
  };

  const shouldContinue = confirmDuplicateIfNeeded(payload);
  if (!shouldContinue) return;

  try {
    await addDoc(
      collection(db, "users", currentUser.value.uid, "mealLogs"),
      {
        ...payload,
        createdAt: serverTimestamp(),
      },
    );

    openMealMenuId.value = null;
    // Listener will automatically update mealEntries
  } catch (error) {
    console.error("Error logging meal again:", error);
    window.alert("Unable to log this meal again.");
  }
}

async function deleteMeal(mealId) {
  if (!currentUser.value) return;

  const confirmed = window.confirm("Delete this meal entry?");
  if (!confirmed) return;

  try {
    await deleteDoc(doc(db, "users", currentUser.value.uid, "mealLogs", mealId));

    if (selectedMealId.value === mealId) {
      selectedMealId.value = null;
    }

    openMealMenuId.value = null;
    // Listener will automatically update mealEntries
  } catch (error) {
    console.error("Error deleting meal:", error);
    window.alert("Unable to delete meal entry.");
  }
}

onMounted(() => {
  unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
    currentUser.value = user;

    if (!user) {
      mealEntries.value = [];
      availableFoods.value = [];
      if (unsubscribeMealLogs) unsubscribeMealLogs();
      return;
    }

    resetMealForm();
    await Promise.all([loadProfile(user.uid), fetchAvailableFoods()]);
    unsubscribeMealLogs = fetchMealLogs();
  });
});

onUnmounted(() => {
  if (unsubscribeAuth) unsubscribeAuth();
  if (unsubscribeMealLogs) unsubscribeMealLogs();
});
</script>

<style scoped>
.tracker-layout {
  display: flex;
  min-height: 100vh;
  background: #f6f8fb;
}

.tracker-page {
  margin-left: 240px;
  width: calc(100% - 240px);
  min-height: 100vh;
  padding: 36px 28px 56px;
}

.tracker-shell {
  max-width: 1100px;
  margin: 0 auto;
}

.tracker-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 24px;
  align-items: end;
}

.tracker-hero-copy {
  max-width: 680px;
}

.tracker-kicker {
  color: var(--brand-green-dark);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.tracker-title {
  margin-top: 10px;
  color: var(--brand-text);
  font-size: clamp(34px, 4vw, 42px);
  line-height: 1.1;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.tracker-description {
  margin-top: 12px;
  color: var(--brand-text-muted);
  font-size: 17px;
  line-height: 1.6;
}

.tracker-hero-actions {
  margin-top: 20px;
  display: flex;
}

.tracker-toolbar-right {
  display: flex;
  align-items: flex-end;
  gap: 14px;
  flex-wrap: wrap;
  justify-self: end;
}

.log-meal-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--brand-green), var(--brand-green-dark));
  color: #ffffff;
  padding: 14px 20px;
  font-size: 15px;
  font-weight: 700;
  box-shadow: 0 14px 28px rgba(31, 159, 109, 0.18);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.log-meal-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 16px 30px rgba(31, 159, 109, 0.2);
}

.plus-icon {
  font-size: 20px;
  line-height: 1;
}

.today-shortcut {
  border: 1px solid #dce3eb;
  background: #ffffff;
  color: var(--brand-text);
  border-radius: 14px;
  padding: 14px 20px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.today-shortcut:hover {
  transform: translateY(-1px);
  background: #ffffff;
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.05);
}

.today-shortcut.active {
  background: #eef8f2;
  border-color: rgba(56, 200, 143, 0.35);
  color: var(--brand-green-dark);
  box-shadow: 0 10px 22px rgba(56, 200, 143, 0.1);
}

.jump-date-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.jump-date-field span {
  color: var(--brand-text-muted);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.jump-date-field input {
  border: 1px solid var(--brand-border);
  border-radius: 16px;
  padding: 15px 18px;
  font: inherit;
  color: var(--brand-text);
  background: #ffffff;
  min-width: 184px;
}

.date-strip-card {
  margin-top: 16px;
  background: #ffffff;
  border: 1px solid #e7edf3;
  border-radius: 28px;
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.04);
  padding: 20px 22px;
  display: grid;
  grid-template-columns: 48px 1fr 48px;
  align-items: center;
  gap: 12px;
}

.nav-arrow {
  width: 42px;
  height: 42px;
  border: 1px solid transparent;
  border-radius: 999px;
  background: transparent;
  color: #566679;
  font-size: 30px;
  line-height: 1;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-arrow:hover {
  border-color: #d7e0e8;
  background: #f7faf8;
  color: #24384f;
}

.date-strip {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
}

.date-pill {
  border: 1px solid transparent;
  border-radius: 18px;
  background: transparent;
  color: #31475f;
  min-height: 84px;
  padding: 12px 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.date-pill:hover {
  background: #f7faf8;
  border-color: #e3e8ee;
}

.date-pill.active {
  background: linear-gradient(180deg, #ffffff 0%, #eef8f3 100%);
  border-color: rgba(56, 200, 143, 0.35);
  color: #183247;
  box-shadow: inset 0 0 0 1px rgba(56, 200, 143, 0.08);
}

.weekday-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 8px;
  color: inherit;
}

.date-number {
  display: block;
  font-size: 34px;
  font-weight: 800;
  line-height: 1;
  color: inherit;
}

.selected-date-heading {
  text-align: center;
  margin: 24px 0 24px;
}

.selected-date-label {
  color: var(--brand-text-muted);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.selected-date-heading h2 {
  margin-top: 8px;
  color: var(--brand-text);
  font-size: clamp(32px, 4vw, 42px);
  line-height: 1.1;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.selected-date-heading p:last-child {
  margin-top: 8px;
  color: var(--brand-text-muted);
  font-size: 17px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(320px, 0.9fr) minmax(420px, 1.1fr);
  gap: 22px;
  align-items: start;
}

.summary-card,
.meals-card {
  background: #ffffff;
  border: 1px solid #e7edf3;
  border-radius: 28px;
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.04);
}

.summary-card {
  padding: 28px;
}

.meals-card {
  padding: 28px;
  overflow: visible;
}

.card-header {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.card-eyebrow {
  color: var(--brand-text-muted);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.card-header h2 {
  color: var(--brand-text);
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.card-support {
  color: var(--brand-text-muted);
  font-size: 15px;
}

.ring-wrap {
  display: flex;
  justify-content: center;
  margin: 28px 0 24px;
}

.progress-ring {
  width: 250px;
  height: 250px;
  border-radius: 50%;
  background:
    radial-gradient(closest-side, #ffffff 77%, transparent 78% 100%),
    conic-gradient(var(--brand-green) var(--ring-progress), #e8eef2 0deg);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 0 0 1px rgba(230, 236, 241, 0.7);
  transition: background 0.25s ease;
}

.progress-ring.exceeded {
  background:
    radial-gradient(closest-side, #ffffff 77%, transparent 78% 100%),
    conic-gradient(#ef4444 var(--ring-progress), #fde8e8 0deg);
}

.ring-center {
  text-align: center;
}

.ring-value {
  color: #172535;
  font-size: 58px;
  line-height: 1;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.ring-label {
  margin-top: 8px;
  color: #7a8796;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.macro-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.macro-card {
  background: #f8fbfc;
  border: 1px solid #e5ebf0;
  border-radius: 18px;
  padding: 14px;
  text-align: left;
}

.macro-card.exceeded {
  background: #fff3f3;
  border-color: #fecaca;
}

.macro-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.macro-dot {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  flex-shrink: 0;
}

.macro-label {
  color: #687788;
  font-size: 13px;
  font-weight: 600;
}

.macro-value {
  color: #172535;
  font-size: 28px;
  line-height: 1;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.macro-goal {
  margin-top: 6px;
  color: #8a95a3;
  font-size: 13px;
}

.meal-sections {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 18px;
  overflow: visible;
}

.meal-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: visible;
}

.meal-section-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.meal-section-header h3 {
  color: #172535;
  font-size: 16px;
  font-weight: 700;
}

.meal-section-header span {
  color: #738191;
  font-size: 13px;
  font-weight: 600;
}

.meal-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: visible;
}

.meal-row {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  background: #fbfcfd;
  border: 1px solid #e6ebf0;
  border-radius: 18px;
  padding: 12px 14px;
  cursor: pointer;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
  z-index: 1;
}

.meal-row.menu-open {
  z-index: 30;
}

.meal-row:hover {
  transform: translateY(-1px);
  border-color: #d3dce4;
  box-shadow: 0 12px 22px rgba(18, 31, 45, 0.06);
}

.meal-photo {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  object-fit: cover;
  flex-shrink: 0;
}

.meal-copy {
  min-width: 0;
  flex: 1;
}

.meal-name {
  color: #18293d;
  font-size: 16px;
  font-weight: 700;
}

.meal-source {
  margin-top: 4px;
  color: #738191;
  font-size: 13px;
}

.meal-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  color: #5f6f82;
  font-size: 13px;
  font-weight: 600;
  flex-wrap: wrap;
}

.meta-separator {
  color: #a9b4bf;
}

.protein-highlight {
  color: var(--brand-green-dark);
}

.servings-highlight {
  color: #56728f;
}

.meal-actions {
  position: relative;
  flex-shrink: 0;
}

.meal-settings {
  width: 36px;
  height: 36px;
  border: 1px solid #e0e6ec;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.94);
  color: #566679;
  font-size: 17px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.meal-settings:hover {
  border-color: #d1dae3;
  background: #ffffff;
  color: #23354c;
}

.meal-menu {
  position: absolute;
  right: 0;
  top: 44px;
  min-width: 160px;
  background: #ffffff;
  border: 1px solid #e5eaf0;
  border-radius: 14px;
  box-shadow: 0 18px 28px rgba(18, 31, 45, 0.12);
  padding: 8px;
  z-index: 60;
}

.meal-menu button {
  width: 100%;
  border: none;
  background: transparent;
  text-align: left;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 14px;
  color: #23354c;
  cursor: pointer;
}

.meal-menu button:hover {
  background: #f5f8fb;
}

.meal-menu button.danger {
  color: #dc2626;
}

.empty-meal-state {
  background: #fafcfd;
  border: 1px dashed #dce4eb;
  border-radius: 18px;
  padding: 18px 14px;
  text-align: center;
  color: #8a95a3;
  font-size: 14px;
  font-weight: 500;
}

.modal-overlay,
.meal-detail-overlay {
  position: fixed;
  inset: 0;
  background: rgba(14, 24, 37, 0.46);
  backdrop-filter: blur(6px);
  z-index: 4000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.meal-modal {
  width: min(860px, 100%);
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  background: #ffffff;
  border: 1px solid rgba(223, 229, 235, 0.95);
  border-radius: 26px;
  box-shadow: 0 30px 80px rgba(14, 24, 37, 0.22);
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 24px 24px 18px;
  border-bottom: 1px solid #ebf0f4;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.modal-header h2 {
  color: #172535;
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.modal-header p {
  margin-top: 6px;
  color: #6b7989;
  font-size: 14px;
  line-height: 1.5;
}

.modal-close {
  border: 1px solid transparent;
  background: transparent;
  color: #607082;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  font-size: 22px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-close:hover {
  border-color: #e1e7ed;
  background: #f7faf8;
}

.modal-body {
  padding: 22px 24px 18px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.modal-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.modal-field span {
  color: #435467;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.modal-field input,
.modal-field textarea,
.modal-field select {
  width: 100%;
  border: 1px solid #d7e0e8;
  border-radius: 14px;
  padding: 13px 14px;
  font: inherit;
  color: #16263c;
  background: #ffffff;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.modal-field textarea {
  resize: vertical;
}

.modal-field input:focus,
.modal-field textarea:focus,
.modal-field select:focus,
.jump-date-field input:focus,
.serving-stepper-input:focus {
  outline: none;
  border-color: rgba(56, 200, 143, 0.55);
  box-shadow: 0 0 0 4px rgba(56, 200, 143, 0.1);
}

.compact-field select {
  padding-top: 12px;
  padding-bottom: 12px;
}

.meal-category-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.category-chip {
  border: 1px solid #e3e8ee;
  border-radius: 14px;
  padding: 13px 12px;
  background: #f8fafb;
  color: #506173;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.category-chip:hover {
  background: #ffffff;
}

.category-chip.active {
  background: #eef8f2;
  border-color: rgba(56, 200, 143, 0.4);
  color: var(--brand-green-dark);
}

.entry-mode-toggle {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.entry-mode-button {
  border: 1px solid #e3e8ee;
  border-radius: 14px;
  padding: 13px 16px;
  background: #f8fafb;
  color: #506173;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.entry-mode-button.active {
  background: #eef8f2;
  border-color: rgba(56, 200, 143, 0.4);
  color: var(--brand-green-dark);
}

.search-panel,
.custom-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-input-box {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid #d7e0e8;
  border-radius: 14px;
  padding: 0 14px;
  min-height: 50px;
  background: #ffffff;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.search-input-box:focus-within {
  border-color: rgba(56, 200, 143, 0.55);
  box-shadow: 0 0 0 4px rgba(56, 200, 143, 0.1);
}

.search-input-box input {
  border: none;
  outline: none;
  width: 100%;
  font: inherit;
  color: #18212f;
  background: transparent;
}

.search-icon {
  color: #7b8794;
  font-size: 18px;
}

.search-filter-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.search-meta {
  margin: 0;
  color: #445467;
  font-size: 13px;
  font-weight: 700;
}

.search-meta.muted {
  color: #7b8794;
  font-weight: 500;
}

.search-results {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 320px;
  overflow-y: auto;
}

.search-result-card {
  width: 100%;
  border: 1px solid #e4eaf0;
  border-radius: 18px;
  background: #ffffff;
  padding: 14px;
  display: grid;
  grid-template-columns: 64px 1fr auto;
  align-items: center;
  gap: 14px;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
}

.search-result-card:hover {
  transform: translateY(-1px);
  border-color: #d5dee6;
  box-shadow: 0 12px 24px rgba(18, 31, 45, 0.06);
}

.search-result-card.selected {
  border-color: rgba(56, 200, 143, 0.42);
  box-shadow: 0 0 0 4px rgba(56, 200, 143, 0.08);
  background: #fbfefd;
}

.search-result-thumb {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  object-fit: cover;
  flex-shrink: 0;
}

.search-result-left {
  min-width: 0;
  flex: 1;
}

.search-result-name {
  color: #172535;
  font-size: 15px;
  font-weight: 800;
}

.search-result-source {
  margin-top: 4px;
  color: #748191;
  font-size: 13px;
}

.search-result-right {
  text-align: right;
  flex-shrink: 0;
}

.search-result-calories {
  color: #172535;
  font-size: 15px;
  font-weight: 800;
}

.search-result-protein {
  margin-top: 4px;
  color: var(--brand-green-dark);
  font-size: 13px;
  font-weight: 700;
}

.search-result-macros {
  margin-top: 4px;
  color: #667789;
  font-size: 13px;
}

.empty-search-state {
  border: 1px dashed #dce4eb;
  border-radius: 18px;
  padding: 20px;
  text-align: center;
  color: #7b8794;
  background: #fafcfd;
}

.selected-food-preview {
  display: grid;
  grid-template-columns: 64px 1fr auto;
  align-items: center;
  gap: 14px;
  border: 1px solid #e4ebf0;
  border-radius: 18px;
  padding: 14px;
  background: #fbfcfd;
}

.selected-food-image {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  object-fit: cover;
  flex-shrink: 0;
}

.selected-food-title {
  color: #172535;
  font-size: 15px;
  font-weight: 800;
}

.selected-food-subtitle {
  margin-top: 4px;
  color: #758394;
  font-size: 13px;
}

.selected-food-totals {
  margin-top: 6px;
  color: #54667a;
  font-size: 13px;
}

.selected-food-servings {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
}

.selected-food-servings span {
  color: #6c7b8b;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.serving-stepper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.serving-stepper-btn {
  width: 34px;
  height: 34px;
  border: 1px solid #d7e0e8;
  border-radius: 10px;
  background: #ffffff;
  color: #29435c;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}

.serving-stepper-input {
  width: 76px;
  text-align: center;
  border: 1px solid #d7e0e8;
  border-radius: 10px;
  padding: 8px 10px;
  font: inherit;
  color: #16263c;
  background: #ffffff;
}

.custom-macro-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.upload-panel {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 16px;
  align-items: start;
}

.upload-box {
  display: flex;
  flex-direction: column;
  gap: 8px;
  border: 1px dashed #c8d4dd;
  border-radius: 18px;
  padding: 18px;
  background: #fafcfd;
  color: #20354b;
  cursor: pointer;
}

.upload-box input {
  display: none;
}

.upload-box small {
  color: #7b8794;
}

.upload-preview-wrap {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.upload-preview {
  width: 150px;
  height: 110px;
  object-fit: cover;
  border-radius: 16px;
  box-shadow: 0 12px 22px rgba(18, 31, 45, 0.08);
}

.modal-actions {
  padding: 20px 24px 24px;
  border-top: 1px solid #ebf0f4;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.primary-btn,
.secondary-btn {
  border: none;
  border-radius: 14px;
  padding: 13px 18px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  min-width: 152px;
}

.primary-btn {
  background: linear-gradient(135deg, var(--brand-green), var(--brand-green-dark));
  color: #ffffff;
  box-shadow: 0 14px 28px rgba(31, 159, 109, 0.18);
}

.primary-btn:disabled {
  background: #c7ced8;
  color: #667588;
  box-shadow: none;
  cursor: not-allowed;
}

.secondary-btn {
  background: #ffffff;
  color: var(--brand-text);
  border: 1px solid #dce3eb;
}

.meal-detail-panel {
  position: relative;
  width: min(420px, 100%);
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  background: #ffffff;
  border: 1px solid rgba(223, 229, 235, 0.95);
  border-radius: 24px;
  box-shadow: 0 28px 70px rgba(14, 24, 37, 0.22);
}

.detail-close {
  position: absolute;
  top: 16px;
  right: 16px;
  border: 1px solid rgba(225, 232, 238, 0.9);
  background: rgba(255, 255, 255, 0.94);
  color: #4a5c70;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  font-size: 22px;
  cursor: pointer;
  z-index: 2;
}

.detail-photo {
  width: 100%;
  height: 236px;
  object-fit: cover;
  display: block;
  border-radius: 24px 24px 0 0;
}

.detail-content {
  padding: 24px;
}

.detail-content h2 {
  color: #172535;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.detail-source {
  margin-top: 8px;
  color: #4f647d;
  font-size: 15px;
  font-weight: 600;
}

.detail-time {
  margin-top: 6px;
  color: #7a8797;
  font-size: 13px;
}

.detail-macros {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 22px;
}

.detail-macro {
  background: #f8fbfc;
  border: 1px solid #e5ebf0;
  border-radius: 16px;
  padding: 14px 16px;
}

.detail-macro span {
  display: block;
  color: #6a7788;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.detail-macro strong {
  display: block;
  margin-top: 6px;
  color: #172535;
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.detail-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 20px;
}

.detail-action-btn {
  border: none;
  border-radius: 14px;
  padding: 12px 14px;
  background: linear-gradient(135deg, var(--brand-green-dark), var(--brand-green));
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.detail-action-btn.secondary {
  background: #eef2f7;
  color: #24384f;
}

.detail-action-btn.danger {
  background: #ef4444;
  color: #ffffff;
}

.ingredients-block {
  margin-top: 24px;
}

.ingredients-block h3 {
  color: #172535;
  font-size: 16px;
  font-weight: 700;
}

.ingredients-block ul {
  margin-top: 12px;
  padding-left: 18px;
  color: #4c5c70;
}

.ingredients-block li + li {
  margin-top: 8px;
}

.ingredients-empty {
  margin-top: 10px;
  color: #7b8794;
}

@media (max-width: 1180px) {
  .tracker-hero {
    grid-template-columns: 1fr;
    align-items: start;
  }

  .tracker-toolbar-right {
    justify-self: start;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 960px) {
  .tracker-layout {
    display: block;
  }

  .tracker-page {
    margin-left: 0;
    width: 100%;
    padding: 24px 18px 32px;
  }

  .tracker-toolbar-right {
    width: 100%;
    justify-content: flex-start;
    align-items: flex-end;
  }

  .date-strip-card {
    grid-template-columns: 44px 1fr 44px;
    padding: 16px 14px;
  }

  .date-strip {
    gap: 8px;
  }

  .date-number {
    font-size: 30px;
  }

  .meal-category-grid,
  .entry-mode-toggle,
  .custom-macro-grid,
  .search-filter-grid {
    grid-template-columns: 1fr 1fr;
  }

  .selected-food-preview,
  .search-result-card {
    grid-template-columns: 64px 1fr;
  }

  .search-result-right,
  .selected-food-servings {
    grid-column: 2 / -1;
    text-align: left;
    align-items: flex-start;
  }

  .upload-panel {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .tracker-hero-actions {
    width: 100%;
  }

  .log-meal-btn {
    width: 100%;
    justify-content: center;
  }

  .tracker-toolbar-right {
    flex-direction: column;
    align-items: stretch;
  }

  .today-shortcut,
  .jump-date-field input {
    width: 100%;
  }

  .date-strip {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .date-strip .date-pill:nth-child(1),
  .date-strip .date-pill:nth-child(5) {
    display: none;
  }

  .summary-card,
  .meals-card {
    padding: 22px 18px;
  }

  .progress-ring {
    width: 220px;
    height: 220px;
  }

  .ring-value {
    font-size: 48px;
  }

  .macro-grid {
    grid-template-columns: 1fr;
  }

  .meal-row {
    align-items: flex-start;
  }

  .meal-photo {
    width: 56px;
    height: 56px;
  }

  .meal-name {
    font-size: 16px;
  }

  .modal-body,
  .modal-actions,
  .modal-header {
    padding-left: 16px;
    padding-right: 16px;
  }

  .meal-category-grid,
  .entry-mode-toggle,
  .custom-macro-grid,
  .search-filter-grid,
  .detail-actions {
    grid-template-columns: 1fr;
  }

  .search-result-card,
  .selected-food-preview {
    grid-template-columns: 1fr;
  }

  .search-result-thumb,
  .selected-food-image {
    width: 100%;
    height: 160px;
  }

  .search-result-right,
  .selected-food-servings {
    grid-column: auto;
  }
}
</style>
