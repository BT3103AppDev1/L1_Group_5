import { createRouter, createWebHistory } from "vue-router";

// Pages
import Landing from "./views/Landing.vue";
import Login from "./views/Login.vue";
import Register from "./views/Register.vue";
import Dashboard from "./views/Dashboard.vue";
import ForgotPassword from "./views/ForgotPassword.vue";

// Firebase
import { auth } from "./firebase";

const routes = [
  {
    path: "/",
    name: "Landing",
    component: Landing,
  },

  {
  path: "/forgot-password",
  component: ForgotPassword,
},

  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  {
    path: "/register",
    name: "Register",
    component: Register,
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: Dashboard,
  },
  // optional future pages
  {
    path: "/tracker",
    component: Dashboard,
  },
  {
    path: "/profile",
    component: Dashboard,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 🔥 AUTH GUARD
router.beforeEach((to, from, next) => {
  const user = auth.currentUser;

  const requiresAuth = ["/dashboard", "/tracker", "/profile"];

  // ❌ Not logged in → block protected pages
  if (requiresAuth.includes(to.path) && !user) {
    next("/");
  }
  // ✅ Logged in → block landing/login/register
  else if (
    user &&
    (to.path === "/" || to.path === "/login" || to.path === "/register")
  ) {
    next("/dashboard");
  } else {
    next();
  }
});

export default router;