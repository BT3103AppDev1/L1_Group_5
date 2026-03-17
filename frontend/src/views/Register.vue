<script setup>
import { ref } from "vue";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "vue-router";
import { auth } from "../firebase";

const email = ref("");
const password = ref("");
const router = useRouter();

const register = async () => {
  try {
    await createUserWithEmailAndPassword(auth, email.value, password.value);
    router.push("/");
  } catch (e) {
    alert(e.message);
  }
};
</script>

<template>
  <div class="auth-container">
    <div class="left">
      <div class="logo">
        <div class="icon">📍</div>
        <h1><span>Munch</span> Map</h1>
        <p>EAT. MOVE. THRIVE.</p>
      </div>
    </div>

    <div class="right">
      <div class="form-box">
        <h2>Get Started Now</h2>

        <label>Email address</label>
        <input v-model="email" placeholder="Enter your email" />

        <label>Password</label>
        <input v-model="password" type="password" placeholder="Enter password" />

        <button @click="register" class="primary-btn">Sign Up</button>

        <div class="divider"><span>or</span></div>

        <div class="socials">
          <button class="social-btn">Google</button>
          <button class="social-btn">Apple</button>
        </div>

        <p class="switch">
          Have an account?
          <router-link to="/">Log In</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<style>
/* SAME STYLE COPY FROM LOGIN */
.auth-container {
  display: flex;
  height: 100vh;
  font-family: Arial, sans-serif;
}

.left {
  flex: 1;
  background: #dff3e4;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo {
  text-align: center;
}

.logo span {
  color: #2e7d32;
}

.right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-box {
  width: 360px;
}

input {
  width: 100%;
  padding: 12px;
  margin-bottom: 18px;
  border-radius: 10px;
  border: 1px solid #ddd;
}

.primary-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #2e7d32, #43a047);
  color: white;
  border-radius: 12px;
  border: none;
}
</style>