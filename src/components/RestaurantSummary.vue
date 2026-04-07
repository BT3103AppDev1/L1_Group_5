<!-- <template>
  <div class="summary-backdrop" @click.self="onClose">
    <div class="summary-card">
      <img v-if="restaurant.image" :src="restaurant.image" alt="Restaurant image" class="summary-image" />
      <div class="summary-content">
        <h3 class="summary-title">{{ restaurant.name }}</h3>
        <div class="summary-meta" v-if="restaurant.location">
          <span>{{ restaurant.location }}</span>
        </div>
        <button class="summary-btn" @click="onViewDetails">View Details</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RestaurantSummary',
  props: {
    restaurant: {
      type: Object,
      required: true
    }
  },
  methods: {
    onViewDetails(e) {
      e.stopPropagation();
      this.$emit('view-details', this.restaurant.id);
    },
    onClose() {
      this.$emit('close');
    }
  }
}
</script>

<style scoped>
.summary-backdrop {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.05);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.summary-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.12);
  min-width: 320px;
  max-width: 360px;
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.summary-image {
  width: 100%;
  height: 140px;
  object-fit: cover;
}
.summary-content {
  padding: 20px 20px 16px 20px;
}
.summary-title {
  margin: 0 0 8px 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111;
}
.summary-meta {
  color: #888;
  font-size: 0.95rem;
  margin-bottom: 10px;
}
.summary-btn {
  width: 100%;
  background: #34c759;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 0;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}
.summary-btn:hover {
  background: #28a745;
}
</style> -->
