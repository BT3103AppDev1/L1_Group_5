<template>
  <div class="layout">
    <Sidebar />

    <div class="main-map">
      <MapComponent 
        v-model:isFilterOpen="isFilterOpen" 
        @view-details="openRestaurantSidebar" 
      />
    </div>

    <transition name="slide">
      <div v-if="selectedRestaurantId" class="restaurant-sidebar-container">
        <button class="close-sidebar" @click="selectedRestaurantId = null">
          ✕
        </button>

        <RestaurantSidebar :restaurantId="selectedRestaurantId" />
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import Sidebar from "../components/Sidebar.vue";
import MapComponent from "../components/Map.vue";
import RestaurantSidebar from "../components/RestaurantSidebar.vue";
import { onMounted } from "vue";
import { useRestaurants } from "../composables/useRestaurants";

const { fetchAll } = useRestaurants();
const selectedRestaurantId = ref(null);
const isFilterOpen = ref(false);

const openRestaurantSidebar = (id) => {
  console.log("Opening Sidebar for Restaurant ID:", id);
  isFilterOpen.value = false; // Close the filter pane
  selectedRestaurantId.value = id;
};

watch(isFilterOpen, (newVal) => {
  if (newVal) {
    selectedRestaurantId.value = null; //
  }
});

onMounted(() => {
  fetchAll(); // Calls Firestore once when the dashboard loads
});
</script>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.main-map {
  margin-left: 240px;
  flex: 1;
  position: relative;
}

/* Sidebar Container for the Right Side */
.restaurant-sidebar-container {
  position: absolute;
  top: 0;
  right: 0;
  height: 100vh;
  width: 380px; /* Matches max-width in your team's RestaurantSidebar.vue */
  background: white;
  z-index: 2000;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);
}

.close-sidebar {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(0, 0, 0, 0.05);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 16px;
  cursor: pointer;
  z-index: 2010;
  display: flex;
  align-items: center;
  justify-content: center;
}
.close-sidebar:hover {
  background: rgba(0, 0, 0, 0.1);
}

/* Vue Transition Animation */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
