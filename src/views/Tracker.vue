<script setup>
import { computed, onMounted } from "vue";
import { onAuthStateChanged } from "firebase/auth";
import Sidebar from "../components/Sidebar.vue";
import { auth } from "../firebase";
import { useUserProfile } from "../composables/useUserProfile";

const { profileFirstName, loadProfile } = useUserProfile();

const trackerTitle = computed(() =>
  profileFirstName.value ? `${profileFirstName.value}'s Tracker` : "My Tracker",
);

const trackerSubtitle = computed(() =>
  profileFirstName.value
    ? `Track meals, calories, and goals.`
    : "Track your meals, calories, and nutrition progress here.",
);

const getCurrentUser = () =>
  new Promise((resolve) => {
    if (auth.currentUser) {
      resolve(auth.currentUser);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });

onMounted(async () => {
  const user = await getCurrentUser();
  if (user) {
    await loadProfile(user.uid);
  }
});
</script>

<template>
  <div class="layout">
    <Sidebar />

    <main class="main">
      <div class="content">
        <header class="tracker-header">
          <h1>{{ trackerTitle }}</h1>
          <p>{{ trackerSubtitle }}</p>
        </header>

        <section class="summary-card">
          <h2>Meal tracking is coming next</h2>
          <p>
            This page is now ready to reflect the profile name you save in
            Profile Settings. Meal history, calorie logging, and progress charts
            can plug into this layout next.
          </p>
        </section>

        <section class="placeholder-grid">
          <article class="placeholder-card">
            <h3>Today's Calories</h3>
            <p>Connect this to daily food logs in the next iteration.</p>
          </article>

          <article class="placeholder-card">
            <h3>Macro Progress</h3>
            <p>Use your saved calorie and macro targets as the baseline.</p>
          </article>
        </section>
      </div>
    </main>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
  background: #f6f8fb;
}

.main {
  flex: 1;
  margin-left: 240px;
}

.content {
  max-width: 980px;
  margin: 0 auto;
  padding: 36px 28px 56px;
}

.tracker-header h1 {
  color: var(--brand-text);
  font-size: 40px;
  font-weight: 800;
  line-height: 1.1;
}

.tracker-header p {
  margin-top: 10px;
  color: var(--brand-text-muted);
  font-size: 17px;
}

.summary-card,
.placeholder-card {
  background: #ffffff;
  border: 1px solid #e7edf3;
  border-radius: 28px;
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.04);
}

.summary-card {
  margin-top: 24px;
  padding: 28px;
}

.summary-card h2,
.placeholder-card h3 {
  color: var(--brand-text);
  font-weight: 800;
}

.summary-card p,
.placeholder-card p {
  margin-top: 10px;
  color: var(--brand-text-muted);
}

.placeholder-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  margin-top: 18px;
}

.placeholder-card {
  padding: 24px;
}

@media (max-width: 900px) {
  .main {
    margin-left: 0;
  }

  .content {
    padding: 24px 18px 40px;
  }

  .tracker-header h1 {
    font-size: 34px;
  }

  .placeholder-grid {
    grid-template-columns: 1fr;
  }
}
</style>
