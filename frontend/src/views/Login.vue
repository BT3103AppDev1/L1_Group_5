<script setup>
import { ref } from "vue";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { useRouter } from "vue-router";
import { auth } from "../firebase";
import logo from "../assets/munchmap.png";

const email = ref("");
const password = ref("");
const router = useRouter();

// EMAIL LOGIN
const login = async () => {
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value);
    router.push("/dashboard");
  } catch (e) {
    alert(e.message);
  }
};

// GOOGLE LOGIN
const loginWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    router.push("/dashboard");
  } catch (e) {
    alert(e.message);
  }
};
</script>

<template>
  <div class="auth-container">
    <!-- LEFT -->
    <div class="left">
      <div class="logo">
        <img :src="logo" alt="MunchMap Logo" />
      </div>

      <div class="dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>

    <!-- RIGHT -->
    <div class="right">
      <div class="form-box">
        <h2>Welcome back!</h2>
        <p class="subtitle">
          Enter your credentials to access your account
        </p>

        <label>Email address</label>
        <input v-model="email" placeholder="Enter your email" />

        <label>Password</label>
        <input
          v-model="password"
          type="password"
          placeholder="Enter password"
        />

        <div class="forgot">
          <router-link to="/forgot-password">Forgot password?</router-link>
        </div>

        <!-- EMAIL LOGIN -->
        <button @click="login" class="primary-btn">Login</button>

        <div class="divider"><span>or</span></div>

        <!-- GOOGLE LOGIN ONLY -->
        <div class="socials">
          <button class="social-btn google" @click="loginWithGoogle">
            Sign in with Google
          </button>
        </div>

        <p class="switch">
          Don’t have an account?
          <router-link to="/register">Sign Up</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<style>
.auth-container {
  display: flex;
  height: 100vh;
  font-family: Arial, sans-serif;
}

/* LEFT */
.left {
  flex: 1;
  background: #dff3e4;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.logo img {
  width: 320px;
  max-width: 70%;
}

/* DOTS */
.dots {
  position: absolute;
  right: 120px;
  top: 120px;
}

.dots span {
  display: block;
  width: 10px;
  height: 10px;
  background: #66bb6a;
  border-radius: 50%;
  margin: 10px;
}

/* RIGHT */
.right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

/* FORM */
.form-box {
  width: 380px;
}

.form-box h2 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 5px;
}

.subtitle {
  color: #777;
  margin-bottom: 25px;
  font-size: 14px;
}

/* INPUT */
input {
  width: 100%;
  padding: 14px;
  margin-bottom: 18px;
  border-radius: 12px;
  border: 1px solid #ddd;
  font-size: 14px;
}

input:focus {
  outline: none;
  border-color: #2e7d32;
  box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.1);
}

/* FORGOT */
.forgot {
  text-align: right;
  font-size: 12px;
  margin-bottom: 12px;
}

.forgot a {
  color: #2e7d32;
  text-decoration: none;
}

/* PRIMARY BUTTON */
.primary-btn {
  width: 100%;
  padding: 14px;
  background: #2e7d32;
  color: white;
  border: none;
  border-radius: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

.primary-btn:hover {
  background: #256628;
}

/* DIVIDER */
.divider {
  display: flex;
  align-items: center;
  margin: 20px 0;
  color: #aaa;
}

.divider::before,
.divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: #eee;
}

.divider span {
  margin: 0 10px;
}

/* SOCIAL */
.socials {
  display: flex;
}

.social-btn {
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #ddd;
  background: white;
  font-size: 13px;
  cursor: pointer;
  transition: 0.2s;
}

.social-btn:hover {
  background: #f5f5f5;
}

/* OPTIONAL: Google styling */
.social-btn.google {
  font-weight: 500;
}

/* SWITCH */
.switch {
  margin-top: 15px;
  font-size: 14px;
}
</style>