<script setup>
import { useRoute, useRouter } from "vue-router";
import { Home, Activity, User } from "lucide-vue-next";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import logo from "../assets/munchmap.png";

const route = useRoute();
const router = useRouter();

// navigation
const go = (path) => {
  router.push(path);
};

// logout
const logout = async () => {
  await signOut(auth);
  router.push("/");
};
</script>

<template>
  <aside class="sidebar">
    <!-- TOP -->
    <div>
      <!-- LOGO -->
      <div class="logo-section">
        <img :src="logo" class="logo" />
        <p class="tagline">EAT. MOVE. THRIVE.</p>
      </div>

      <!-- NAV -->
      <nav class="nav">
        <button
          @click="go('/dashboard')"
          class="nav-item"
          :class="{ active: route.path === '/dashboard' }"
        >
          <Home class="icon" />
          <span>Home</span>
        </button>

        <button
          @click="go('/tracker')"
          class="nav-item"
          :class="{ active: route.path === '/tracker' }"
        >
          <Activity class="icon" />
          <span>My Tracker</span>
        </button>

        <!-- Divider -->
        <div class="divider"></div>

        <button
          @click="go('/profile')"
          class="nav-item"
          :class="{ active: route.path === '/profile' }"
        >
          <User class="icon" />
          <span>Profile</span>
        </button>

        <button
          @click="go('/test')"
          class="nav-item"
          :class="{ active: route.path === '/test' }"
        >
          <span class="icon">🔍</span>
          <span>Data Test</span>
        </button>
      </nav>
    </div>

    <!-- BOTTOM -->
    <div class="footer">
      <div class="links">
        <p>About</p>
        <p>Nutrition Resources</p>
        <p>Terms & Privacy</p>
      </div>

      <!-- LOGOUT -->
      <button class="logout-btn" @click="logout">Logout</button>

      <p class="copyright">© 2026 Munch Map SG</p>
    </div>
  </aside>
</template>

<style>
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 240px;

  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(6px);

  border-right: 1px solid #e5e7eb;

  display: flex;
  flex-direction: column;
  justify-content: space-between;

  padding: 24px 16px;
}

/* LOGO */
.logo-section {
  margin-bottom: 30px;
}

.logo {
  width: 180px;
  margin-bottom: 5px;
}

.tagline {
  font-size: 11px;
  color: #6b7280;
  letter-spacing: 1px;
}

/* NAV */
.nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;

  padding: 14px 16px;
  border-radius: 10px;

  font-size: 14px;
  font-weight: 500;

  color: #374151;
  background: transparent;

  border: none;
  cursor: pointer;
  transition: 0.2s;
}

/* ICON */
.icon {
  width: 20px;
  height: 20px;
  color: #9ca3af;
}

/* HOVER */
.nav-item:hover {
  background: #f9fafb;
}

/* ACTIVE */
.nav-item.active {
  background: rgba(77, 185, 127, 0.1);
  color: #4db97f;
  font-weight: 600;
}

.nav-item.active .icon {
  color: #4db97f;
}

/* DIVIDER */
.divider {
  margin: 10px 0;
  border-top: 1px solid #e5e7eb;
}

/* FOOTER */
.footer {
  font-size: 12px;
  color: #6b7280;
}

.links {
  margin-bottom: 10px;
}

.links p {
  margin: 2px 0;
  cursor: pointer;
  transition: 0.2s;
}

.links p:hover {
  color: #4db97f;
}

/* LOGOUT */
.logout-btn {
  width: 100%;
  padding: 10px;
  margin-top: 10px;

  border-radius: 10px;
  border: none;

  background: #fee2e2;
  color: #dc2626;

  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

.logout-btn:hover {
  background: #fecaca;
}

/* COPYRIGHT */
.copyright {
  margin-top: 10px;
  font-size: 11px;
}
</style>
