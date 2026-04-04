import { computed } from "vue";
import { useRestaurants } from "./useRestaurants";

const normalizeStringArray = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const normalizeCuisineTypes = (restaurant) => {
  if (Array.isArray(restaurant.cuisineTypes)) {
    return normalizeStringArray(restaurant.cuisineTypes);
  }

  return normalizeStringArray(restaurant.cuisineType || restaurant.cuisine);
};

const normalizeDietaryPreferences = (restaurant) => {
  if (Array.isArray(restaurant.dietary)) {
    return normalizeStringArray(restaurant.dietary);
  }

  return normalizeStringArray(restaurant.dietaryPreferences);
};

const getAverageCalories = (menuItems) => {
  if (!Array.isArray(menuItems) || menuItems.length === 0) {
    return 0;
  }

  const totalCalories = menuItems.reduce(
    (sum, item) => sum + (Number(item?.calories) || 0),
    0,
  );

  return Math.round(totalCalories / menuItems.length);
};

const normalizeRestaurant = (restaurant) => ({
  id: restaurant.id,
  name:
    restaurant.business_name ||
    restaurant.name ||
    "Unknown Restaurant",
  lat: restaurant.latitude ?? restaurant.location?.lat ?? null,
  lng: restaurant.longitude ?? restaurant.location?.lng ?? null,
  cuisineTypes: normalizeCuisineTypes(restaurant),
  dietary: normalizeDietaryPreferences(restaurant),
  calories: getAverageCalories(restaurant.menuItems),
});

const buildUniqueOptions = (restaurants) => {
  const cuisines = [...new Set(restaurants.flatMap((r) => r.cuisineTypes))].sort();
  const dietary = [...new Set(restaurants.flatMap((r) => r.dietary))].sort();

  return { cuisines, dietary };
};

export function useRestaurantFilterOptions() {
  const { restaurants, loading, fetchAll } = useRestaurants();

  const normalizedRestaurants = computed(() =>
    restaurants.value.map(normalizeRestaurant),
  );

  const mappableRestaurants = computed(() =>
    normalizedRestaurants.value.filter(
      (restaurant) => restaurant.lat !== null && restaurant.lng !== null,
    ),
  );

  const options = computed(() => buildUniqueOptions(normalizedRestaurants.value));

  return {
    restaurants,
    loading,
    fetchAll,
    normalizedRestaurants,
    mappableRestaurants,
    options,
  };
}
