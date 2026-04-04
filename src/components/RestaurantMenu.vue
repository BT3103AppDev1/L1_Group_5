<template>
  <div class="restaurant-menu">
    <h2 class="menu-title">Menu</h2>
    <div class="menu-items">
      <div v-for="item in (menuItems ? menuItems : [])" :key="item.id" class="menu-item">
        <img v-if="item.image" :src="item.image" :alt="item.name" class="item-image" />
        <div v-else class="item-image-placeholder">📷</div>
        <div class="item-info">
          <h3 class="item-name">{{ item.name }}</h3>
          <p class="item-price">${{ item.price }}</p>
          <div class="item-macros">
            <div class="macro">
              <span class="macro-label">Protein</span>
              <span class="macro-value">{{ item.protein }}g</span>
            </div>
            <div class="macro">
              <span class="macro-label">Carbs</span>
              <span class="macro-value">{{ item.carbs }}g</span>
            </div>
            <div class="macro">
              <span class="macro-label">Fat</span>
              <span class="macro-value">{{ item.fats }}g</span>
            </div>
            <div class="macro">
              <span class="macro-label">Cal</span>
              <span class="macro-value">{{ item.calories }}</span>
            </div>
          </div>
          <button class="log-meal-btn" @click="openLogMealModal(item)">Log Meal</button>
        </div>
      </div>
    </div>

    <!-- Log Meal Modal -->
    <div v-if="isModalOpen" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="closeModal">×</button>

        <div v-if="selectedItem" class="modal-meal-card">
          <!-- Meal Image -->
          <img 
            v-if="selectedItem.image" 
            :src="selectedItem.image" 
            :alt="selectedItem.name" 
            class="modal-meal-image" 
          />
          <div v-else class="modal-meal-image-placeholder">📷</div>

          <!-- Meal Info -->
          <div class="modal-meal-info">
            <h2 class="modal-meal-name">{{ selectedItem.name }}</h2>
            <p class="modal-meal-source">RESTAURANT MENU</p>
            
            <!-- Date and Meal Time Display -->
            <p class="modal-meal-time">{{ mealTimeLabel }} | {{ formatDate(logForm.date) }}</p>

            <!-- Macros Grid -->
            <div class="modal-macros-grid">
              <div class="modal-macro-item">
                <span class="modal-macro-label">CALORIES</span>
                <span class="modal-macro-value">{{ selectedItem.calories }}</span>
              </div>
              <div class="modal-macro-item">
                <span class="modal-macro-label">PROTEIN</span>
                <span class="modal-macro-value">{{ selectedItem.protein }}g</span>
              </div>
              <div class="modal-macro-item">
                <span class="modal-macro-label">CARBS</span>
                <span class="modal-macro-value">{{ selectedItem.carbs }}g</span>
              </div>
              <div class="modal-macro-item">
                <span class="modal-macro-label">FAT</span>
                <span class="modal-macro-value">{{ selectedItem.fats }}g</span>
              </div>
            </div>

            <!-- Date Picker -->
            <div class="modal-form-group">
              <label>Select Date</label>
              <input v-model="logForm.date" type="date" class="modal-form-input" />
            </div>

            <!-- Meal Time Selector -->
            <div class="modal-form-group">
              <label>Meal Time</label>
              <div class="modal-meal-time-grid">
                <button
                  v-for="time in mealTimes"
                  :key="time"
                  class="modal-time-btn"
                  :class="{ active: logForm.mealTime === time }"
                  @click="logForm.mealTime = time"
                >
                  {{ time }}
                </button>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="modal-actions">
              <button class="modal-btn-cancel" @click="closeModal">Cancel</button>
              <button class="modal-btn-confirm" @click="confirmLogMeal">Log Meal</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, toRefs, ref, onMounted } from 'vue';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const props = defineProps({
  menuItems: {
    type: Array,
    default: () => []
  }
});
const { menuItems } = toRefs(props);

const currentUser = ref(null);
const isModalOpen = ref(false);
const selectedItem = ref(null);
const mealTimes = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

const logForm = ref({
  date: new Date().toISOString().split('T')[0],
  mealTime: 'Lunch'
});

const mealTimeLabel = ref('Lunch');

function formatDate(dateString) {
  const date = new Date(dateString + 'T00:00:00');
  const options = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    currentUser.value = user;
  });
});

function openLogMealModal(item) {
  selectedItem.value = item;
  mealTimeLabel.value = logForm.value.mealTime;
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
  selectedItem.value = null;
  logForm.value = {
    date: new Date().toISOString().split('T')[0],
    mealTime: 'Lunch'
  };
}

async function confirmLogMeal() {
  if (!currentUser.value || !selectedItem.value) {
    alert('User not authenticated');
    return;
  }

  try {
    // Create dateKey from the selected date (format: YYYY-MM-DD)
    const dateKey = logForm.value.date;
    
    // Add meal to Firestore
    await addDoc(collection(db, 'users', currentUser.value.uid, 'mealLogs'), {
      userId: currentUser.value.uid,
      name: selectedItem.value.name,
      source: 'Restaurant Menu',
      image: selectedItem.value.image || '',
      calories: selectedItem.value.calories,
      protein: selectedItem.value.protein,
      carbs: selectedItem.value.carbs,
      fat: selectedItem.value.fats,
      mealTime: logForm.value.mealTime,
      dateKey: dateKey,
      date: logForm.value.date,
      servings: 1,
      ingredients: [],
      restaurantDocId: '',
      restaurantBusinessId: '',
      menuItemId: '',
      cuisineType: '',
      createdAt: serverTimestamp()
    });

    alert(`${selectedItem.value.name} logged to ${logForm.value.mealTime}!`);
    closeModal();
  } catch (error) {
    console.error('Error logging meal:', error);
    alert('Failed to log meal. Please try again.');
  }
}
</script>

<style scoped>
.restaurant-menu {
  padding: 24px;
  background: #fff;
}

.menu-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #1a1a1a;
}

.menu-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.menu-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  background: #fafafa;
  transition: all 0.2s ease;
  align-items: center;

  &:hover {
    background: #f5f5f5;
    border-color: #e0e0e0;
  }
}

.item-image {
  width: 80px;
  height: 80px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
}

.item-image-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 6px;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.item-name {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #1a1a1a;
}

.item-price {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #1a1a1a;
}

.item-macros {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 8px;
  margin-bottom: 10px;
}

.macro {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 11px;
}

.macro-label {
  color: #999;
  font-weight: 500;
  margin-bottom: 2px;
}

.macro-value {
  color: #666;
  font-weight: 600;
}

.log-meal-btn {
  background: #22c55e;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.log-meal-btn:hover {
  background: #16a34a;
}

.log-meal-btn:active {
  background: #15803d;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  max-width: 480px;
  width: 90%;
  max-height: 85vh;
  overflow-y: auto;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: white;
  border: none;
  font-size: 28px;
  color: #666;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  z-index: 10;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: #f0f0f0;
  color: #333;
}

.modal-meal-card {
  display: flex;
  flex-direction: column;
}

.modal-meal-image {
  width: 100%;
  height: 300px;
  object-fit: cover;
  border-radius: 16px 16px 0 0;
}

.modal-meal-image-placeholder {
  width: 100%;
  height: 300px;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 80px;
  border-radius: 16px 16px 0 0;
}

.modal-meal-info {
  padding: 32px 24px 24px;
}

.modal-meal-name {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
}

.modal-meal-source {
  margin: 0 0 16px 0;
  font-size: 13px;
  font-weight: 700;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.modal-meal-time {
  margin: 0 0 24px 0;
  font-size: 14px;
  color: #666;
}

.modal-macros-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
}

.modal-macro-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 12px;
  background: white;
  border-radius: 6px;
}

.modal-macro-label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  color: #999;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.modal-macro-value {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
}

.modal-form-group {
  margin-bottom: 20px;
}

.modal-form-group label {
  display: block;
  margin-bottom: 10px;
  font-weight: 600;
  font-size: 13px;
  color: #1a1a1a;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.modal-form-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s ease;
}

.modal-form-input:focus {
  outline: none;
  border-color: #4db97f;
  box-shadow: 0 0 0 3px rgba(77, 185, 127, 0.1);
}

.modal-meal-time-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.modal-time-btn {
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  color: #666;
  transition: all 0.2s ease;
  text-transform: capitalize;
}

.modal-time-btn:hover {
  border-color: #4db97f;
  color: #4db97f;
}

.modal-time-btn.active {
  background: #edf8f0;
  border-color: #4db97f;
  color: #2b7a51;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.modal-btn-cancel,
.modal-btn-confirm {
  flex: 1;
  padding: 14px 20px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: capitalize;
}

.modal-btn-cancel {
  background: #f4f5f7;
  color: #666;
}

.modal-btn-cancel:hover {
  background: #e8eaed;
}

.modal-btn-confirm {
  background: #4db97f;
  color: white;
}

.modal-btn-confirm:hover {
  background: #3d9965;
}

.modal-btn-confirm:active {
  transform: scale(0.98);
}
</style>