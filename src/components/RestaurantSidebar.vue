<template>
  <div class="restaurant-sidebar">
    <RestaurantInfo :restaurant="restaurant" />
    <RestaurantMenu :menuItems="menuItems" :restaurantName="restaurant?.business_name || 'Restaurant'" />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import RestaurantInfo from './RestaurantInfo.vue';
import RestaurantMenu from './RestaurantMenu.vue';
import { useRestaurantFilterOptions } from '@/composables/useRestaurantFilterOptions';

const props = defineProps({
  restaurantId: {
    type: String,
    required: true
  }
});

const restaurant = ref(null);
const menuItems = ref([]);
const { normalizedRestaurants } = useRestaurantFilterOptions();

async function fetchRestaurantAndMenu(id) {
  if (!id) {
    restaurant.value = null;
    menuItems.value = [];
    return;
  }
  try {
    const restDoc = await getDoc(doc(db, 'newRestaurants', id));
    if (restDoc.exists()) {
      restaurant.value = { id: restDoc.id, ...restDoc.data() };
      
      // NEW: Grab the pre-calculated value from your composable
      const preCalculatedData = normalizedRestaurants.value.find(r => r.id === id);
      if (preCalculatedData) {
        restaurant.value.proteinPerDollar = preCalculatedData.proteinPerDollar;
      }
      
      // ... keep your existing menuItems fetching logic exactly the same ...
      if (restaurant.value.menuItems && Array.isArray(restaurant.value.menuItems)) {
        menuItems.value = restaurant.value.menuItems;
      } else {
        const menuSnapshot = await getDocs(collection(db, 'newRestaurants', id, 'menuItems'));
        menuItems.value = menuSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
    } else {
      restaurant.value = null;
      menuItems.value = [];
    }
  } catch (error) {
    console.error('[Sidebar] Error fetching restaurant/menu:', error);
    restaurant.value = null;
    menuItems.value = [];
  }
}

watch(() => props.restaurantId, (newId) => {
  console.log('[Sidebar] Received restaurantId:', newId);
  fetchRestaurantAndMenu(newId).then(() => {
    console.log('[Sidebar] Restaurant .value:', restaurant.value);
    console.log('[Sidebar] Restaurant .value keys:', Object.keys(restaurant.value || {}));
    console.log('[Sidebar] MenuItems .value:', menuItems.value);
    console.log('[Sidebar] MenuItems .value length:', (menuItems.value || []).length);
    if (menuItems.value && menuItems.value.length > 0) {
      console.log('[Sidebar] First menu item:', menuItems.value[0]);
    }
  });
}, { immediate: true });
</script>

<style scoped>
.restaurant-sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;
  max-width: 380px;
}
</style>