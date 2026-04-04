<template>
  <div class="restaurant-info">
    <button class="back-btn">← Back to Map</button>
    
    <h1 class="restaurant-name">Clarke Quay Grill</h1>
    <p class="restaurant-location">Clarke Quay • Clarke Quay MRT</p>
    
    <p class="restaurant-description">
      Premium grilled meats and steaks with exquisite marinades. Perfect for serious protein intake.
    </p>
  </div>
</template>

<script>
export default {
  name: 'RestaurantInfo',
  data() {
    return {
      restaurant: {
        name: 'Clarke Quay Grill',
        location: 'Clarke Quay • Clarke Quay MRT',
        description: 'Premium grilled meats and steaks with exquisite marinades. Perfect for serious protein intake.',
        cuisine: 'Grilled Meat & Steaks'
      }
    }
  },
  methods: {
    goBack() {
      // Navigate back to map
    }
  }
}
</script>

<style scoped>
.restaurant-info {
  padding: 24px;
  border-bottom: 1px solid #e0e0e0;
}

.back-btn {
  background: none;
  border: none;
  color: #999;
  font-size: 14px;
  cursor: pointer;
  margin-bottom: 12px;
  padding: 0;
  
  &:hover {
    color: #333;
  }
}

.restaurant-name {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #1a1a1a;
}

.restaurant-location {
  font-size: 13px;
  color: #999;
  margin: 0 0 16px 0;
}

.restaurant-description {
  font-size: 14px;
  color: #666;
  line-height: 1.4;
  margin: 0;
}
</style>