import { ref } from "vue";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // Assuming your config is here

// This variable lives outside the function, making it a "Global" singleton
const restaurants = ref([]);
const loading = ref(false);

export function useRestaurants() {
  const fetchAll = async () => {
    // Prevent multiple calls if data is already there
    if (restaurants.value.length > 0) return;

    loading.value = true;
    try {
      const querySnapshot = await getDocs(collection(db, "newRestaurants"));
      restaurants.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    } finally {
      loading.value = false;
    }
  };

  return { restaurants, loading, fetchAll };
}