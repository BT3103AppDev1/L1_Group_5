<script setup>
import Sidebar from "../components/Sidebar.vue";
</script>

<template>
  <div class="layout">
    <Sidebar />

    <div class="main">
      <div class="content">
        <h1>Dashboard</h1>
        <p>This is your main content area.</p>

        <div class="card">
          <p>🍽 Meals, calories, map, etc will go here</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.layout {
  display: flex;
}

.main {
  margin-left: 240px;
  width: 100%;
  min-height: 100vh;
  background: #f9fafb;
  overflow-y: auto;
}

.content {
  padding: 30px;
}

.card {
  margin-top: 20px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  border: 1px solid #eee;
}
</style>