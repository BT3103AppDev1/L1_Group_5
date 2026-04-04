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
              <span class="macro-value">{{ item.fat }}g</span>
            </div>
            <div class="macro">
              <span class="macro-label">Cal</span>
              <span class="macro-value">{{ item.calories }}</span>
            </div>
          </div>
          <button class="log-meal-btn" @click="logMeal(item.name)">Log Meal</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, toRefs } from 'vue';
const props = defineProps({
  menuItems: {
    type: Array,
    default: () => []
  }
});
const { menuItems } = toRefs(props);

function logMeal(itemName) {
  console.log(`Meal logged: ${itemName}`);
  // Functionality to be implemented later
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

  &:hover {
    background: #16a34a;
  }

  &:active {
    background: #15803d;
  }
}
</style>