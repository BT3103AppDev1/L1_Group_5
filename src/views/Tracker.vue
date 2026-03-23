<template>
  <div class="layout">
    <Sidebar />
    <div class="main">
      <div class="content">
        <h1>My Tracker</h1>
        <p>Tracker page coming soon.</p>
        
        <div class="video-link-section">
          <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_blank" class="video-link">
            CLICK HERE
          </a>
        </div>
      </div>
      
      <div class="card">
        <p>🍽 Meals, calories, map, etc will go here</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import Sidebar from "../components/Sidebar.vue";
</script>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
}

.main {
  margin-left: 240px; /* Matches your Sidebar width */
  flex: 1;
  padding: 40px;
  background: #f9fafb;
}

.video-link-section {
  margin: 20px 0;
}

.video-link {
  display: inline-block;
  font-size: 80px;
  padding: 120px 240px;
  background-color: #4db97f; /* Matches your brand green */
  color: white;
  text-decoration: none;
  font-weight: 700;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.video-link:hover {
  background-color: #3da66e;
}

.card {
  background: white;
  color: black;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.content {
  color: black;
}
</style>