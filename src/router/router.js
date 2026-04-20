import { createRouter, createWebHistory } from "vue-router";

import Landing from "../views/Landing.vue";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import Dashboard from "../views/Dashboard.vue";
import ForgotPassword from "../views/ForgotPassword.vue";
import Tracker from "../views/Tracker.vue";
import Profile from "../views/Profile.vue";
import About from "../views/About.vue";
// import DataTest from "../views/dataTest.vue";

import { auth } from "../firebase";
import { waitForAuthReady } from "../services/authSession";

const routes = [
  {
    path: "/",
    name: "Landing",
    component: Landing,
  },
  {
    path: "/forgot-password",
    name: "ForgotPassword",
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
  {
    path: "/tracker",
    name: "Tracker",
    component: Tracker,
  },
  {
    path: "/profile",
    name: "Profile",
    component: Profile,
  },
  {
    path: "/about",
    name: "About",
    component: About,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  await waitForAuthReady();

  const user = auth.currentUser;
  const requiresAuth = ["/dashboard", "/tracker", "/profile", "/about"];

  if (requiresAuth.includes(to.path) && !user) {
    next("/");
  } else if (
    user &&
    (to.path === "/" || to.path === "/login" || to.path === "/register")
  ) {
    next("/dashboard");
  } else {
    next();
  }
});

export default router;
