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
      v-if="activeFilters.cuisines.length > 0 || activeFilters.dietary.length > 0"
      class="results-overlay"
    >
      <button class="close-results-btn" @click="clearSearch" aria-label="Close results">✕</button>
      <h3 v-if="searchResults.length > 0">
        {{ searchResults.length }} 
        {{ activeFilters.cuisines.length === 1 ? `Results for "${activeFilters.cuisines[0]}"` : 'results found' }}
      </h3>

      <div v-if="searchResults.length > 0" class="results-list">
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
      <div v-else class="no-results-state">
        <p>{{ noResultsMessage }}</p>
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

        <!-- <div class="filter-group">
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
        </div> -->
        <div class="filter-group">
          <label>Protein Value ($P/\$ $)</label>
          <div class="pill-grid">
            <button 
              class="pill-btn" 
              :class="{ active: stagedFilters.proteinValue.includes('Elite') }"
              @click="toggleFilter('proteinValue', 'Elite')"
            >
              Elite (>10g/$)
            </button>
            <button 
              class="pill-btn" 
              :class="{ active: stagedFilters.proteinValue.includes('High') }"
              @click="toggleFilter('proteinValue', 'High')"
            >
              High (>5g/$)
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
import Fuse from "fuse.js";
import { useRestaurants } from "../composables/useRestaurants";

const { restaurants, loading, fetchAll } = useRestaurants(); // This is your "database variable"

// --- EMITS (For routing to Restaurant Info Page) ---
const emit = defineEmits(["view-details"]);

// --- STATE ---
const map = ref(null);
const markersLayer = ref(null);
const isFilterOpen = defineModel("isFilterOpen", { default: false });

// Search State
const searchQuery = ref("");
const showSuggestions = ref(false);
const suggestions = ref({ cuisines: [], restaurants: [] });
const searchResults = ref([]); // Holds data for the left panel

// Filter State
const options = computed(() => {
  // 1. Extract every single cuisine from every restaurant into one giant array
  const allCuisines = safeRestaurants.value.flatMap((r) => r.cuisineTypes);

  // 2. Put them in a Set (which automatically deletes duplicates), then sort alphabetically
  const uniqueCuisines = [...new Set(allCuisines)].sort();

  // 3. Do the exact same thing for dietary preferences
  const allDietary = safeRestaurants.value.flatMap((r) => r.dietary);
  const uniqueDietary = [...new Set(allDietary)].sort();

  return {
    cuisines: uniqueCuisines,
    dietary: uniqueDietary,
  };
});

const defaultFilters = {
  searchMode: null, // 'restaurant' or 'cuisine'
  specificRestaurantId: null,
  cuisines: [],
  dietary: [],
  proteinValue: [],
};

const noResultsMessage = computed(() => {
  const cuisineList = activeFilters.value.cuisines.map(c => `'${c}'`).join(', ');
  const dietaryList = activeFilters.value.dietary.map(d => `'${d}'`).join(', ');
  
  let msg = "No results found";
  
  if (cuisineList || dietaryList) {
    msg += " for ";
    if (cuisineList && dietaryList) {
      msg += `${cuisineList} and ${dietaryList} dietary preference`;
    } else if (cuisineList) {
      msg += cuisineList;
    } else {
      msg += `${dietaryList} dietary preference`;
    }
  }
  
  return msg + ".";
});

const stagedFilters = ref(JSON.parse(JSON.stringify(defaultFilters)));
const activeFilters = ref(JSON.parse(JSON.stringify(defaultFilters)));

// const safeRestaurants = computed(() => {
//   return restaurants.value
//     .map((r) => {
//       // Safely average calories from the menuItems array
//       let avgCalories = 0;
//       if (r.menuItems && r.menuItems.length > 0) {
//         const totalCals = r.menuItems.reduce(
//           (sum, item) => sum + (item.calories || 0),
//           0,
//         );
//         avgCalories = Math.round(totalCals / r.menuItems.length);
//       }

//       return {
//         id: r.id,
//         name: r.business_name || "Unknown Restaurant",
//         lat: r.latitude,
//         lng: r.longitude,
//         cuisineTypes: r.cuisineType ? [r.cuisineType] : [],

//         // --- UPDATED SAFEGUARD HERE ---
//         dietary: String(r.dietaryPreferences || "")
//           .split(",")
//           .map((d) => d.trim())
//           .filter(Boolean),
//         // ------------------------------

//         calories: avgCalories,
//       };
//     })
//     .filter((r) => r.lat !== undefined && r.lng !== undefined); // Prevents map crashes!
// });

// src/components/Map.vue

// --- DATA FORMATTER: Automatically maps Firebase fields to the format your map UI expects
const safeRestaurants = computed(() => {
  return restaurants.value
    .map((r) => {
      // Calculate Average Protein per Dollar ($P/$)
      let pPerDollar = 0;
      if (r.menuItems && r.menuItems.length > 0) {
        const ratios = r.menuItems.map(item => {
          const protein = Number(item.protein) || 0;
          const price = Number(item.price) || 1;
          return protein / price;
        });
        pPerDollar = ratios.reduce((a, b) => a + b, 0) / ratios.length;
      }

      // Assign Tier based on the ratio
      let tier = 'Standard';
      if (pPerDollar > 10) tier = 'Elite';
      else if (pPerDollar > 5) tier = 'High';

      return {
        id: r.id,
        name: r.business_name || "Unknown Restaurant",
        lat: r.latitude,
        lng: r.longitude,
        cuisineTypes: r.cuisineType ? [r.cuisineType] : [],
        dietary: String(r.dietaryPreferences || "").split(",").map(d => d.trim()).filter(Boolean),
        proteinPerDollar: pPerDollar, // Used for display in RestaurantInfo
        pTier: tier // Used for the filter logic above
      };
    })
    .filter((r) => r.lat !== undefined && r.lng !== undefined);
});

// --- MAP INITIALIZATION ---
const SG_BOUNDS = L.latLngBounds(
  L.latLng(1.156, 103.582),
  L.latLng(1.483, 104.044),
);

onMounted(async () => {
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

  // 1. Fetch the safe 50-item list (Composable handles the quota protection)
  await fetchAll();

  // 2. Draw the live pins!
  updateMapMarkers();
});

onUnmounted(() => {
  if (map.value) map.value.remove();
});

// --- SEARCH LOGIC ---
const handleSearch = () => {
  const query = searchQuery.value.trim();

  // AC 9.1.2: Minimum 3 characters threshold
  if (query.length < 3) {
    showSuggestions.value = false;
    return;
  }

  // 1. Setup Fuse for Restaurants
  const restaurantOptions = {
    keys: ["name"],
    threshold: 0.4, // 0 is perfect match, 1 is no match. 0.4 is the sweet spot.
  };
  const restaurantFuse = new Fuse(safeRestaurants.value, restaurantOptions);

  // 2. Setup Fuse for Cuisines
  // We extract unique cuisines from your options or dummy data
  const cuisineFuse = new Fuse(options.value.cuisines, { threshold: 0.3 });

  // 3. Execute Fuzzy Search
  const restaurantResults = restaurantFuse.search(query);
  const cuisineResults = cuisineFuse.search(query);

  // 4. Map the results back to your suggestions format
  suggestions.value.restaurants = restaurantResults.map(
    (result) => result.item,
  );
  suggestions.value.cuisines = cuisineResults.map((result) => result.item);

  showSuggestions.value = true;
};
// const handleSearch = () => {
//   const query = searchQuery.value.toLowerCase().trim();

//   // AC 9.1.2: Require minimum characters
//   if (query.length < 3) {
//     showSuggestions.value = false;
//     return;
//   }

//   // Find matching restaurants
//   suggestions.value.restaurants = dummyRestaurants.filter((r) =>
//     r.name.toLowerCase().includes(query),
//   );

//   // Find matching cuisines
//   const allCuisines = [
//     ...new Set(dummyRestaurants.flatMap((r) => r.cuisineTypes)),
//   ];
//   suggestions.value.cuisines = allCuisines.filter((c) =>
//     c.toLowerCase().includes(query),
//   );

//   showSuggestions.value = true;
// };

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
  // Sync staged filters to active filters
  activeFilters.value = JSON.parse(JSON.stringify(stagedFilters.value));
  
  // Run the filtering logic to update searchResults
  updateMapMarkers();

  // Only close the pane if at least one restaurant is found
  if (searchResults.value.length > 0) {
    isFilterOpen.value = false;
  } else {
    // Optional: You could add a console log or a local state 
    // to show an error message specifically inside the pane.
    console.log("No results found, keeping filter pane open.");
  }
};

const updateMapMarkers = () => {
  if (!markersLayer.value || !map.value) return;

  const f = activeFilters.value; //
  const currentBounds = map.value.getBounds(); //

  // STAGE 1: Global Filter (For the left Results Overlay)
  // This ignores the map bounds so the user sees all matches in the database
  const globalFiltered = safeRestaurants.value.filter((r) => {
    // AC 9.2.2 Strict override for single restaurant search
    if (f.searchMode === "restaurant" && f.specificRestaurantId) {
      return r.id === f.specificRestaurantId;
    }

    // Filter by Cuisine
    if (
      f.cuisines.length > 0 &&
      !r.cuisineTypes.some((c) => f.cuisines.includes(c))
    ) {
      return false;
    }

    // Filter by Dietary
    if (
      f.dietary.length > 0 &&
      !f.dietary.every((d) => r.dietary.includes(d))
    ) {
      return false;
    }

    // Filter by Protein Tier
    if (f.proteinValue && f.proteinValue.length > 0) {
      // Check if the restaurant's tier is one of the ones the user selected
      if (!f.proteinValue.includes(r.pTier)) {
        return false;
      }
    }

    return true;
  });

  // Update the side panel with ALL matches
  searchResults.value = globalFiltered;

  // STAGE 2: Map Filter (For pins actually shown on screen)
  // We only show markers for items that pass the global filter AND are inside the map view
  const visibleMarkers = globalFiltered.filter((r) =>
    currentBounds.contains([r.lat, r.lng]),
  );

  // Clear existing layers and draw only visible markers
  markersLayer.value.clearLayers();

  visibleMarkers.forEach((restaurant) => {
    const marker = L.circleMarker([restaurant.lat, restaurant.lng], {
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
  // Automatically close the filters when a restaurant is picked
  isFilterOpen.value = false;

  // Clear the search suggestions so the map is visible
  showSuggestions.value = false;

  // Emit the event to show the summary or details
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
  color: #1a1a1a;
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

/* LEFT SIDE RESULTS OVERLAY*/
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
  padding: 10px 16px 16px;
  
}

.results-overlay h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #1a1a1a;
}
.close-results-btn { /*close button for the left results overlay*/
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  font-size: 18px;
  font-weight: bold;
  color: #999;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  transition: all 0.2s;
  z-index: 1010;
}

.close-results-btn:hover {
  background: #f0f0f0;
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

.no-results-state { /* Add to <style scoped> in Map.vue */
  padding: 20px 0;
  text-align: center;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.no-results-state p {
  margin: 0;
}
</style>