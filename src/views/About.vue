<script setup>
import Sidebar from "../components/Sidebar.vue";
import smileyFace from "../assets/smiley-face.svg";
</script>

<template>
  <div class="about-layout">
    <Sidebar />

    <main class="about-page">
      <div class="about-card">
        <h1>About</h1>
        <p class="subtitle">Easter egg unlocked!</p>
        <img :src="smileyFace" alt="Smiley face" class="smiley-image" />
        <br />
        <p> This web app is created by Max, Jun Yang, Keith, Wen Hao, Amerse, and Darren from January to April 2026.</p>
      </div>
    </main>
  </div>
</template>

<style scoped>
.about-layout {
  display: flex;
  min-height: 100vh;
  background: #f6f8fb;
}

.about-page {
  margin-left: 240px;
  width: calc(100% - 240px);
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
}

.about-card {
  background: #ffffff;
  border: 1px solid #e7edf3;
  border-radius: 24px;
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.06);
  padding: 28px;
  text-align: center;
}

.about-card h1 {
  margin: 0;
  color: #172535;
  font-size: 32px;
  font-weight: 800;
}

.subtitle {
  margin: 8px 0 18px;
  color: #6b7280;
  font-size: 15px;
}

.smiley-image {
  width: 220px;
  height: 220px;
  display: block;
  margin: 0 auto;
}
</style>
