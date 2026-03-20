<template>
  <div class="map-container">
    <div class="top-bar">
      <div class="search-wrapper">
        <div class="search-input-box">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#999"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="search-icon"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            v-model="searchQuery"
            @input="handleSearch"
            placeholder="Search restaurants, cuisines..."
          />
          <button v-if="searchQuery" class="clear-search" @click="clearSearch">
            ✕
          </button>
        </div>

        <div v-if="showSuggestions" class="suggestions-dropdown">
          <div v-if="suggestions.cuisines.length > 0" class="suggestion-group">
            <span class="group-label">Cuisines</span>
            <div
              v-for="c in suggestions.cuisines"
              :key="'c-' + c"
              class="suggestion-item"
              @click="selectCuisine(c)"
            >
              <span class="badge">Cuisine</span> {{ c }}
            </div>
          </div>

          <div
            v-if="suggestions.restaurants.length > 0"
            class="suggestion-group"
          >
            <span class="group-label">Restaurants</span>
            <div
              v-for="r in suggestions.restaurants"
              :key="'r-' + r.id"
              class="suggestion-item"
              @click="selectRestaurant(r)"
            >
              📍 {{ r.name }}
            </div>
          </div>

          <div
            v-if="
              suggestions.cuisines.length === 0 &&
              suggestions.restaurants.length === 0
            "
            class="no-results"
          >
            No matches found.
          </div>
        </div>
      </div>

      <button class="filter-btn" @click="isFilterOpen = true">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          style="margin-right: 8px"
        >
          <polygon
            points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"
          ></polygon>
        </svg>
        Filter
      </button>
    </div>

    <div
      v-if="activeFilters.searchMode === 'cuisine' && searchResults.length > 0"
      class="results-overlay"
    >
      <h3>
        {{ searchResults.length }} Results for "{{ activeFilters.cuisines[0] }}"
      </h3>
      <div class="results-list">
        <div
          v-for="res in searchResults"
          :key="'card-' + res.id"
          class="result-card"
          @click="goToRestaurant(res.id)"
          @mouseenter="highlightMarker(res.id)"
        >
          <h4>{{ res.name }}</h4>
          <p class="meta">
            {{ res.cuisineTypes.join(", ") }} • {{ res.calories }} kcal
          </p>
        </div>
      </div>
    </div>

    <div class="filter-pane" :class="{ 'pane-open': isFilterOpen }">
      <div class="pane-header">
        <div style="display: flex; align-items: center; gap: 8px">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#4db97f"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M3 6h18M6 12h12M10 18h4" />
          </svg>
          <h3>Filters</h3>
        </div>
        <button class="close-btn" @click="isFilterOpen = false">✕</button>
      </div>

      <div class="pane-content">
        <div class="filter-group">
          <label>Cuisine Type</label>
          <div class="pill-grid">
            <button
              v-for="cuisine in options.cuisines"
              :key="cuisine"
              class="pill-btn"
              :class="{ active: stagedFilters.cuisines.includes(cuisine) }"
              @click="toggleFilter('cuisines', cuisine)"
            >
              {{ cuisine }}
            </button>
          </div>
        </div>
        <div class="filter-group">
          <label>Dietary Preferences</label>
          <div class="pill-grid">
            <button
              v-for="diet in options.dietary"
              :key="diet"
              class="pill-btn"
              :class="{ active: stagedFilters.dietary.includes(diet) }"
              @click="toggleFilter('dietary', diet)"
            >
              {{ diet }}
            </button>
          </div>
        </div>
      </div>

      <div class="pane-footer">
        <button class="clear-btn" @click="clearAll">Clear All</button>
        <button class="apply-btn" @click="applyFilters">Apply</button>
      </div>
    </div>

    <div id="munch-map"></div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, computed } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// --- EMITS (For routing to Restaurant Info Page) ---
const emit = defineEmits(["view-details"]);

// --- STATE ---
const map = ref(null);
const markersLayer = ref(null);
const isFilterOpen = ref(false);

// Search State
const searchQuery = ref("");
const showSuggestions = ref(false);
const suggestions = ref({ cuisines: [], restaurants: [] });
const searchResults = ref([]); // Holds data for the left panel

// Filter State
const options = {
  cuisines: [
    "Japanese",
    "Italian",
    "Mexican",
    "Chinese",
    "Korean",
    "Thai",
    "Vietnamese",
    "Indian",
    "Mediterranean",
    "Hawaiian",
    "Grilled",
    "Salads & Bowls",
  ],
  dietary: ["Vegetarian", "Halal", "Vegan", "Gluten-Free"],
};

const defaultFilters = {
  searchMode: null, // 'restaurant' or 'cuisine'
  specificRestaurantId: null,
  cuisines: [],
  dietary: [],
};

const stagedFilters = ref(JSON.parse(JSON.stringify(defaultFilters)));
const activeFilters = ref(JSON.parse(JSON.stringify(defaultFilters)));

// Dummy Data
const dummyRestaurants = [
  {
    id: 1,
    name: "Clarke Quay Grill",
    lat: 1.2891,
    lng: 103.845,
    cuisineTypes: ["Grilled"],
    dietary: [],
    calories: 600,
    price: 35,
  },
  {
    id: 2,
    name: "Novena Salad Bar",
    lat: 1.3204,
    lng: 103.8438,
    cuisineTypes: ["Salads & Bowls"],
    dietary: ["Vegetarian", "Vegan", "Halal"],
    calories: 350,
    price: 15,
  },
  {
    id: 3,
    name: "Boon Keng Protein Bowl",
    lat: 1.3198,
    lng: 103.8616,
    cuisineTypes: ["Salads & Bowls"],
    dietary: ["Halal", "Gluten-Free"],
    calories: 550,
    price: 18,
  },
  {
    id: 4,
    name: "Sushi Tei Orchard",
    lat: 1.3039,
    lng: 103.832,
    cuisineTypes: ["Japanese"],
    dietary: [],
    calories: 700,
    price: 40,
  },
  {
    id: 5,
    name: "Guzman Y Gomez",
    lat: 1.2847,
    lng: 103.8521,
    cuisineTypes: ["Mexican"],
    dietary: ["Gluten-Free"],
    calories: 850,
    price: 22,
  },
];

// --- MAP INITIALIZATION ---
const SG_BOUNDS = L.latLngBounds(
  L.latLng(1.156, 103.582),
  L.latLng(1.483, 104.044),
);

onMounted(() => {
  map.value = L.map("munch-map", {
    center: [1.305, 103.845],
    zoom: 13,
    minZoom: 11,
    maxBounds: SG_BOUNDS,
    maxBoundsViscosity: 1.0,
    zoomControl: false,
  });

  L.control.zoom({ position: "bottomright" }).addTo(map.value);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
    maxZoom: 18,
  }).addTo(map.value);

  markersLayer.value = L.layerGroup().addTo(map.value);

  map.value.on("moveend", () => {
    updateMapMarkers();
  });

  updateMapMarkers();
});

onUnmounted(() => {
  if (map.value) map.value.remove();
});

// --- SEARCH LOGIC ---
const handleSearch = () => {
  const query = searchQuery.value.toLowerCase().trim();

  // AC 9.1.2: Require minimum characters
  if (query.length < 3) {
    showSuggestions.value = false;
    return;
  }

  // Find matching restaurants
  suggestions.value.restaurants = dummyRestaurants.filter((r) =>
    r.name.toLowerCase().includes(query),
  );

  // Find matching cuisines
  const allCuisines = [
    ...new Set(dummyRestaurants.flatMap((r) => r.cuisineTypes)),
  ];
  suggestions.value.cuisines = allCuisines.filter((c) =>
    c.toLowerCase().includes(query),
  );

  showSuggestions.value = true;
};

const selectRestaurant = (restaurant) => {
  searchQuery.value = restaurant.name;
  showSuggestions.value = false;

  // AC 9.2.2: Clear unrelated pins
  clearAll();
  activeFilters.value.searchMode = "restaurant";
  activeFilters.value.specificRestaurantId = restaurant.id;

  updateMapMarkers();

  // Zoom in on the specific restaurant
  map.value.setView([restaurant.lat, restaurant.lng], 16);
};

const selectCuisine = (cuisine) => {
  searchQuery.value = cuisine;
  showSuggestions.value = false;

  clearAll();
  activeFilters.value.searchMode = "cuisine";
  activeFilters.value.cuisines = [cuisine];
  stagedFilters.value.cuisines = [cuisine]; // Keep side panel in sync

  updateMapMarkers();

  // AC 9.2.3: Automatically calculate bounds to fit all matching pins
  if (searchResults.value.length > 0) {
    const bounds = L.latLngBounds(
      searchResults.value.map((r) => [r.lat, r.lng]),
    );
    map.value.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
  }
};

const clearSearch = () => {
  searchQuery.value = "";
  showSuggestions.value = false;
  clearAll();
  applyFilters(); // Reset map to default state
};

// --- FILTER & MARKER LOGIC ---
const toggleFilter = (category, value) => {
  const arr = stagedFilters.value[category];
  const index = arr.indexOf(value);
  if (index > -1) arr.splice(index, 1);
  else arr.push(value);
};

const clearAll = () => {
  stagedFilters.value = JSON.parse(JSON.stringify({ ...defaultFilters }));
};

const applyFilters = () => {
  activeFilters.value = JSON.parse(JSON.stringify(stagedFilters.value));
  activeFilters.value.searchMode = null; // Clear strict search mode if using side panel
  updateMapMarkers();
  isFilterOpen.value = false;
};

const updateMapMarkers = () => {
  if (!markersLayer.value || !map.value) return;
  markersLayer.value.clearLayers();

  const currentBounds = map.value.getBounds();
  const f = activeFilters.value;

  const filtered = dummyRestaurants.filter((r) => {
    // AC 9.2.2 Strict override for single restaurant search
    if (f.searchMode === "restaurant" && f.specificRestaurantId) {
      return r.id === f.specificRestaurantId;
    }

    if (!currentBounds.contains([r.lat, r.lng])) return false;
    if (
      f.cuisines.length > 0 &&
      !r.cuisineTypes.some((c) => f.cuisines.includes(c))
    )
      return false;
    if (f.dietary.length > 0 && !f.dietary.every((d) => r.dietary.includes(d)))
      return false;

    return true;
  });

  // Save the filtered list for the left overlay panel
  searchResults.value = filtered;

  filtered.forEach((restaurant) => {
    const marker = L.circleMarker([restaurant.lat, restaurant.lng], {
      color: "#4db97f",
      fillColor: "#4db97f",
      fillOpacity: 0.9,
      radius: 8,
      weight: 2,
      color: "#ffffff",
    }).addTo(markersLayer.value);

    marker.bindTooltip(`<strong>${restaurant.name}</strong>`);

    // USG25: Click marker to navigate
    marker.on("click", () => goToRestaurant(restaurant.id));
  });
};

// --- NAVIGATION ---
const goToRestaurant = (id) => {
  // Emits the event up to MapPage.vue / Dashboard.vue to handle routing
  emit("view-details", id);
};
</script>

<style scoped>
/* Same base styles as before */
.map-container {
  height: 100%;
  width: 100%;
  position: relative;
  overflow: hidden;
}
#munch-map {
  height: 100%;
  width: 100%;
  z-index: 1;
}

/* TOP BAR & SEARCH */
.top-bar {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  display: flex;
  gap: 12px;
  width: 80%;
  max-width: 800px;
}

.search-wrapper {
  flex: 1;
  position: relative;
}

.search-input-box {
  background: white;
  padding: 12px 16px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-input-box input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 15px;
  color: #333;
}

.clear-search {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 16px;
}

/* DROP DOWN */
.suggestions-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  width: 100%;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  max-height: 400px;
  overflow-y: auto;
  padding: 12px 0;
  z-index: 1002;
}

.group-label {
  display: block;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 700;
  color: #999;
  text-transform: uppercase;
}

.suggestion-item {
  padding: 12px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.suggestion-item:hover {
  background: #f9fafb;
  color: #4db97f;
}

.badge {
  background: #edf8f0;
  color: #2b7a51;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
}

.no-results {
  padding: 16px;
  text-align: center;
  color: #666;
  font-size: 14px;
}

/* LEFT SIDE RESULTS OVERLAY (AC 9.2.4) */
.results-overlay {
  position: absolute;
  top: 80px;
  left: 16px;
  width: 320px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  padding: 16px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}

.results-overlay h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #1a1a1a;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-card {
  padding: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.result-card:hover {
  border-color: #4db97f;
  background: #fafafa;
}

.result-card h4 {
  margin: 0 0 4px 0;
  font-size: 15px;
  color: #1a1a1a;
}
.result-card .meta {
  margin: 0;
  font-size: 13px;
  color: #666;
}

/* Filter button and sliding pane styling remain the same as previous step */
.filter-btn {
  background: white;
  border: none;
  padding: 0 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
}
.filter-pane {
  position: absolute;
  top: 0;
  right: 0;
  width: 400px;
  height: 100%;
  background: white;
  z-index: 1001;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.1);
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
}
.pane-open {
  transform: translateX(0);
}
.pane-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
}
.pane-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
}
.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #666;
  cursor: pointer;
}
.pane-content {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  overflow-y: auto;
  flex: 1;
}
.filter-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.filter-group label {
  font-weight: 700;
  font-size: 13px;
  color: #1a1a1a;
}
.pill-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.pill-btn {
  background: #f4f5f7;
  border: 1px solid transparent;
  padding: 10px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.2s;
}
.pill-btn.active {
  background: #edf8f0;
  border-color: #4db97f;
  color: #2b7a51;
}
.pane-footer {
  padding: 20px 24px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  gap: 12px;
  background: white;
}
.clear-btn,
.apply-btn {
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
}
.clear-btn {
  background: #f4f5f7;
  border: none;
  color: #4a5568;
}
.apply-btn {
  background: #4db97f;
  border: none;
  color: white;
}
</style>
