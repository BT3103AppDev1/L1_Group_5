<template>
  <div class="restaurant-sidebar">
    <RestaurantInfo />
    <RestaurantMenu />
  </div>
</template>

<script>
import RestaurantInfo from './RestaurantInfo.vue'
import RestaurantMenu from './RestaurantMenu.vue'

export default {
  name: 'RestaurantSidebar',
  components: {
    RestaurantInfo,
    RestaurantMenu
  }
}
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
