<template>
  <div class="restaurant-info" v-if="restaurant">
    <div class="info-content">
      <div class="info-text">
        <h1 class="restaurant-name">{{ restaurant.business_name }}</h1>
        <p class="restaurant-location">
          {{ restaurant.blk_house }} {{ restaurant.street_name }}, 
          #{{ restaurant.unit_no || '01-01' }}
          <br /> 
          Singapore {{ restaurant.postcode }}
        </p>

          <p class="protein-metric" v-if="restaurant.proteinPerDollar > 0">
            <strong>Avg Protein Value:</strong> {{ restaurant.proteinPerDollar.toFixed(1) }}g / $
          </p>
      </div>
      
      <div v-if="restaurant.mainImage" class="info-image">
        <img :src="restaurant.mainImage" :alt="restaurant.business_name" class="restaurant-image" />
      </div>
    </div>
  </div>
  <div v-else class="restaurant-info-empty">
    <p>Select a restaurant to view details.</p>
  </div>
</template>

<script setup>
import { defineProps, toRefs } from 'vue';
const props = defineProps({
  restaurant: {
    type: Object,
    default: null
  }
});
const { restaurant } = toRefs(props);
</script>

<style scoped>
.restaurant-info {
  padding: 24px;
  border-bottom: 1px solid #e0e0e0;
}

.info-content {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.info-image {
  flex-shrink: 0;
}

.restaurant-image {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.back-btn {
  background: none;
  border: none;
  color: #999;
  font-size: 14px;
  cursor: pointer;
  margin-bottom: 16px;
  padding: 0;
  width: 100%;
  text-align: left;
}

.back-btn:hover {
  color: #333;
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

.protein-metric {
  font-size: 14px;
  color: #2b7a51; 
  background: #edf8f0;
  display: inline-block;
  padding: 4px 8px;
  border-radius: 6px;
  margin: 12px 0 0 0;
}
</style>