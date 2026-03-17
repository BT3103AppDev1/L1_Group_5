<script setup>
import { ref } from "vue";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import logo from "../assets/munchmap.png";

const email = ref("");
const message = ref("");
const error = ref("");

const resetPassword = async () => {
  message.value = "";
  error.value = "";

  try {
    await sendPasswordResetEmail(auth, email.value);
    message.value = "Password reset email sent! Check your inbox.";
  } catch (e) {
    error.value = e.message;
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
        <h2>Forgot Password</h2>
        <p class="subtitle">
          Enter your email and we’ll send you a reset link
        </p>

        <label>Email address</label>
        <input v-model="email" placeholder="Enter your email" />

        <button @click="resetPassword" class="primary-btn">
          Send Reset Link
        </button>

        <!-- SUCCESS -->
        <p v-if="message" class="success">{{ message }}</p>

        <!-- ERROR -->
        <p v-if="error" class="error">{{ error }}</p>

        <p class="switch">
          Remember your password?
          <router-link to="/login">Back to Login</router-link>
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
}

/* BUTTON */
.primary-btn {
  width: 100%;
  padding: 14px;
  background: #2e7d32;
  color: white;
  border: none;
  border-radius: 14px;
  font-weight: 600;
  cursor: pointer;
}

.primary-btn:hover {
  background: #256628;
}

/* MESSAGES */
.success {
  color: #2e7d32;
  margin-top: 15px;
  font-size: 14px;
}

.error {
  color: red;
  margin-top: 15px;
  font-size: 14px;
}

/* SWITCH */
.switch {
  margin-top: 15px;
  font-size: 14px;
}
</style>