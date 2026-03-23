<script setup>
import { ref, onMounted } from "vue";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

import Sidebar from "../components/Sidebar.vue";
import RestaurantSidebar from "../components/RestaurantSidebar.vue";
import RestaurantSummary from "../components/RestaurantSummary.vue";
import MapComponent from "../components/Map.vue";

//const restaurantId = ref("B81066C002"); commented out to remove popup on load.
const restaurantData = ref(null);
const showPopup = ref(false);

async function fetchRestaurant(id) {
  try {
    const docRef = doc(db, "restaurants", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      restaurantData.value = {
        id,
        name: data.name,
        location: data.address,
        image: data.thumbnailUrl || "",
      };
      showPopup.value = true;
    } else {
      alert("Restaurant not found");
    }
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    alert("Failed to fetch restaurant data");
  }
}

function onViewDetails(id) {
  alert("Navigate to restaurant page with id: " + id);
}

function onClose() {
  showPopup.value = false;
}

onMounted(() => {
  //fetchRestaurant(restaurantId.value); //commented out to remove popup on load.
  console.log("Dashboard mounted: Ready for user interaction.");
});
</script>

<template>
  <div class="layout">
    <Sidebar />

    <div class="main">
      <div class="content">
        <header class="dashboard-header">
          <h1>Dashboard</h1>
          <p>Blah blah blah insert content here, would smash Amerse 10/10</p>
        </header>

        <div class="card">
          <p>🍽 Meals, calories, map, etc will go here</p>
        </div>

        <div class="map-section">
          <MapComponent @view-details="fetchRestaurant" />
        </div>

        <div class="restaurant-section">
          <h2>Restaurant Preview</h2>
          <RestaurantSidebar />
        </div>
      </div>
    </div>

    <RestaurantSummary
      v-if="showPopup && restaurantData"
      :restaurant="restaurantData"
      @view-details="onViewDetails"
      @close="onClose"
    />
  </div>
</template>

<style scoped>
.layout {
  display: flex;
}

.main {
  margin-left: 240px;
  width: 100%;
  min-height: 100vh;
  background: #f9fafb;
  overflow-y: auto;
}

.content { padding: 30px; }

.dashboard-header { margin-bottom: 24px; }

.map-section { /*this is the map container, to be replaced with MapPage.vue*/
  height: 600px; 
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
}

.card {
  margin-top: 20px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  border: 1px solid #eee;
}

.restaurant-section {
  margin-top: 24px;
}

.restaurant-section h2 {
  margin-bottom: 16px;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}
</style>