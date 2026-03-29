<template>
    <div class="test-container">
      <Sidebar />
      <div class="main-content">
        <header>
          <h1>Firebase Connection Test</h1>
          <p v-if="loading" class="status loading">🔄 Fetching from Firestore...</p>
          <p v-else class="status success">✅ Connected: {{ restaurants.length }} restaurants found</p>
        </header>
  
        <div class="data-grid">
          <table v-if="restaurants.length > 0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Business Name</th>
                <th>Location (Lat/Lng)</th>
                <th>Postcode</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="res in restaurants" :key="res.id">
                <td><code>{{ res.id }}</code></td>
                <td><strong>{{ res.business_name || 'N/A' }}</strong></td>
                <td>{{ res.latitude }}, {{ res.longitude }}</td>
                <td>{{ res.postcode }}</td>
              </tr>
            </tbody>
          </table>
          
          <div v-else-if="!loading" class="empty-state">
            <p>No data found in the 'restaurants' collection.</p>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { onMounted } from "vue";
  import Sidebar from "../components/Sidebar.vue";
  import { useRestaurants } from "../composables/useRestaurants";
  
  // Use the exact variable names from your useRestaurants.js
  const { restaurants, loading, fetchAll } = useRestaurants();
  
  onMounted(() => {
    fetchAll();
  });
  </script>
  
  <style scoped>
  .test-container { display: flex; height: 100vh; }
  .main-content { margin-left: 240px; flex: 1; padding: 40px; background: #f9fafb; overflow-y: auto; color: red}
  .status { padding: 10px; border-radius: 6px; font-weight: 600; margin-bottom: 20px; }
  .loading { background: #fff3cd; color: #856404; }
  .success { background: #d4edda; color: #155724; }
  table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
  th, td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #eee; color: black }
  th { background: #f1f3f5; font-size: 12px; text-transform: uppercase; color: #666; }
  code { background: #f0f0f0; padding: 2px 4px; border-radius: 4px; font-size: 12px; }
  </style>