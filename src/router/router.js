import { createRouter, createWebHistory } from "vue-router";

import Landing from "../views/Landing.vue";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import Dashboard from "../views/Dashboard.vue";
import ForgotPassword from "../views/ForgotPassword.vue";
import Tracker from "../views/Tracker.vue";
import Profile from "../views/Profile.vue";
//import MapPage from "../views/MapPage.vue"; to be deprecated since map page is now integrated into dashboard

import { auth } from "../firebase";

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
 /* { to be deprecated since map page is now integrated into dashboard
    path: "/map",
    name: "Map",
    component: MapPage,
  },*/
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const user = auth.currentUser;
  const requiresAuth = ["/dashboard", "/tracker", "/profile"];

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
