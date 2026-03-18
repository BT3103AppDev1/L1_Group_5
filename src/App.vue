<script setup>
import { ref, onMounted } from 'vue';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import RestaurantSummary from './components/RestaurantSummary.vue';

const restaurantId = ref('B81066C002'); // Example: first LIC_NO from your dataset
const restaurantData = ref(null);
const showPopup = ref(false);

async function fetchRestaurant(id) {
  const docRef = doc(db, 'restaurants', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    restaurantData.value = {
      // Map Firestore fields to popup fields
      name: data.name,
      location: data.address, // Use address for location
      image: data.thumbnailUrl || '', // If you have an image field
      // ...add more mappings as needed
    };
    showPopup.value = true;
  } else {
    alert('Restaurant not found');
  }ho
}

function onViewDetails(id) {
  alert('Navigate to restaurant page with id: ' + id);
}

function onClose() {
  showPopup.value = false;
}

onMounted(() => {
  fetchRestaurant(restaurantId.value);
});
</script>

<template>
  <RestaurantSummary
    v-if="showPopup && restaurantData"
    :restaurant="restaurantData"
    @view-details="onViewDetails"
    @close="onClose"
  />
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}


@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
