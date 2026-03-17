<script setup>
import { useRouter } from "vue-router";
import logo from "../assets/munchmap.png";

const router = useRouter();

const goLogin = () => {
  router.push("/login");
};

const goRegister = () => {
  router.push("/register");
};
</script>

<template>
  <div class="landing">
    <div class="content">
      <img :src="logo" class="logo" />

      <div class="buttons">
        <button class="login-btn" @click="goLogin">Login</button>
        <button class="signup-btn" @click="goRegister">Sign Up</button>
      </div>
    </div>
  </div>
</template>

<style>
.landing {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f5f5;
  font-family: Arial, sans-serif;
}

.content {
  text-align: center;
}

.logo {
  width: 320px;
  margin-bottom: 40px;
}

/* BUTTONS */
.buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
}

button {
  padding: 12px 40px;
  border-radius: 14px;
  border: none;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: 0.2s;
}

/* LOGIN (green) */
.login-btn {
  background: #2e7d32;
  color: white;
}

.login-btn:hover {
  background: #256628;
}

/* SIGN UP (grey) */
.signup-btn {
  background: #6c757d;
  color: white;
}

.signup-btn:hover {
  background: #5a6268;
}
</style>