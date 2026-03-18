<script>
import RestaurantSidebar from './components/RestaurantSidebar.vue'

export default {
  name: 'App',
  components: {
    RestaurantSidebar
  }
}
</script>

<template>
  <div id="app">
    <RestaurantSidebar />
  </div>
</template>


<style scoped>
#app {
  height: 100vh;
  display: flex;
}
</style>
