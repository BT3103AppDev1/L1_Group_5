<template>
  <div class="restaurant-menu">
    <h2 class="menu-title">Menu</h2>
    
    <div class="menu-items">
      <div v-for="item in menuItems" :key="item.id" class="menu-item">
        <img :src="item.image" :alt="item.name" class="item-image" />
        
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

<script>
export default {
  name: 'RestaurantMenu',
  data() {
    return {
      menuItems: [
        {
          id: 1,
          name: 'Ribeye Steak',
          price: 32.90,
          calories: 520,
          protein: 52,
          carbs: 0,
          fat: 35,
          image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop'
        },
        {
          id: 2,
          name: 'Grilled Lamb Chops',
          price: 29.90,
          calories: 480,
          protein: 48,
          carbs: 2,
          fat: 32,
          image: 'https://images.unsplash.com/photo-1543657245-9c5cdf77bf1c?w=200&h=200&fit=crop'
        },
        {
          id: 3,
          name: 'Grilled Chicken Breast',
          price: 24.90,
          calories: 380,
          protein: 45,
          carbs: 2,
          fat: 18,
          image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=200&h=200&fit=crop'
        },
        {
          id: 4,
          name: 'Grilled Salmon',
          price: 28.90,
          calories: 450,
          protein: 40,
          carbs: 0,
          fat: 28,
          image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop'
        },
        {
          id: 5,
          name: 'Mixed Grill Platter',
          price: 36.90,
          calories: 720,
          protein: 65,
          carbs: 4,
          fat: 48,
          image: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=200&h=200&fit=crop'
        },
        {
          id: 6,
          name: 'Pork Ribs',
          price: 28.90,
          calories: 640,
          protein: 48,
          carbs: 8,
          fat: 42,
          image: 'https://images.unsplash.com/photo-1555939594-58d7cb561e1a?w=200&h=200&fit=crop'
        }
      ]
    }
  },
  methods: {
    logMeal(itemName) {
      console.log(`Meal logged: ${itemName}`)
      // Functionality to be implemented later
    }
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
