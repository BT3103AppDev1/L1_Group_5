<script setup>
import { ref } from "vue";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { useRouter } from "vue-router";
import { auth } from "../firebase";
import {
  clearPreparedSessionLogin,
  markSessionActive,
  prepareSessionLogin,
} from "../services/authSession";
import logo from "../assets/munchmap.png";

const email = ref("");
const password = ref("");
const errorMessage = ref("");
const router = useRouter();

const getRegistrationErrorMessage = (error) => {
  switch (error.code) {
    case "auth/configuration-not-found":
    case "auth/operation-not-allowed":
      return "Firebase Authentication is not fully configured yet. Enable Authentication and the Email/Password sign-in method in the Firebase console.";
    case "auth/email-already-in-use":
      return "That email is already registered. Try logging in instead.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/weak-password":
      return "Your password is too weak. Please use at least 6 characters.";
    case "auth/popup-closed-by-user":
      return "Google sign-in was closed before it finished.";
    default:
      return error.message || "Registration failed. Please try again.";
  }
};

const register = async () => {
  errorMessage.value = "";
  prepareSessionLogin();

  try {
    await createUserWithEmailAndPassword(auth, email.value, password.value);
    markSessionActive();
    router.push("/dashboard");
  } catch (error) {
    clearPreparedSessionLogin();
    errorMessage.value = getRegistrationErrorMessage(error);
  }
};

const registerWithGoogle = async () => {
  errorMessage.value = "";
  prepareSessionLogin();

  try {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    markSessionActive();
    router.push("/dashboard");
  } catch (error) {
    clearPreparedSessionLogin();
    errorMessage.value = getRegistrationErrorMessage(error);
  }
};
</script>

<template>
  <div class="auth-container">
    <div class="brand-panel">
      <div class="brand-panel-glow"></div>

      <div class="brand-content">
        <img :src="logo" alt="MunchMap logo" class="brand-logo" />
      </div>

      <div class="dots" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>

    <div class="form-panel">
      <div class="form-box">
        <h2>Get Started Now</h2>
        <p class="subtitle">Create your account and start exploring your next meal.</p>

        <label class="field-label" for="register-email">Email address</label>
        <input
          id="register-email"
          v-model="email"
          class="field-input"
          type="email"
          placeholder="Enter your email"
        />

        <label class="field-label" for="register-password">Password</label>
        <input
          id="register-password"
          v-model="password"
          class="field-input"
          type="password"
          placeholder="Enter password"
        />

        <button @click="register" class="primary-btn">Sign Up</button>

        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

        <div class="divider"><span>or</span></div>

        <button class="social-btn" @click="registerWithGoogle">
          Continue with Google
        </button>

        <p class="switch">
          Have an account?
          <router-link to="/login">Log In</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(320px, 1fr) minmax(320px, 1fr);
  background: #ffffff;
}

.brand-panel {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 48px;
  background: linear-gradient(180deg, #dff3e4 0%, #edf8f0 100%);
}

.brand-panel-glow {
  position: absolute;
  inset: auto auto 12% 18%;
  width: 260px;
  height: 260px;
  border-radius: 999px;
  background: rgba(56, 200, 143, 0.15);
  filter: blur(22px);
}

.brand-content {
  position: relative;
  z-index: 1;
  width: 100%;
  display: flex;
  justify-content: center;
}

.brand-logo {
  width: clamp(360px, 40vw, 560px);
  filter: drop-shadow(0 18px 30px rgba(31, 159, 109, 0.12));
}

.dots {
  position: absolute;
  top: 90px;
  right: 100px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dots span {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: #66bb6a;
}

.form-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 28px;
}

.form-box {
  width: min(100%, 420px);
}

.form-box h2 {
  color: var(--brand-text);
  font-size: 46px;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 10px;
}

.subtitle {
  color: var(--brand-text-muted);
  margin-bottom: 28px;
  font-size: 17px;
}

.field-label {
  display: block;
  margin-bottom: 10px;
  color: var(--brand-text);
  font-size: 16px;
  font-weight: 600;
}

.field-input {
  width: 100%;
  display: block;
  margin-bottom: 18px;
  padding: 17px 18px;
  border: 1px solid var(--brand-border);
  border-radius: 16px;
  background: #ffffff;
  color: var(--brand-text);
  font-size: 16px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.field-input:focus {
  outline: none;
  border-color: var(--brand-green);
  box-shadow: 0 0 0 4px rgba(56, 200, 143, 0.14);
}

.primary-btn,
.social-btn {
  width: 100%;
  display: block;
  border: none;
  border-radius: 16px;
  padding: 17px 20px;
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.primary-btn {
  background: linear-gradient(135deg, var(--brand-green), var(--brand-green-dark));
  color: #ffffff;
  box-shadow: 0 14px 28px rgba(31, 159, 109, 0.18);
}

.primary-btn:hover,
.social-btn:hover {
  transform: translateY(-1px);
}

.social-btn {
  border: 1px solid var(--brand-border);
  background: #ffffff;
  color: var(--brand-text);
}

.divider {
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 22px 0;
  color: #98a2b3;
  font-size: 14px;
}

.divider::before,
.divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: #e8edf3;
}

.switch {
  margin-top: 20px;
  color: var(--brand-text);
  font-size: 15px;
}

.error-message {
  margin-top: 14px;
  color: #b42318;
  font-size: 14px;
}

@media (max-width: 960px) {
  .auth-container {
    grid-template-columns: 1fr;
  }

  .brand-panel {
    min-height: 300px;
    padding: 40px 24px;
  }

  .dots {
    top: 36px;
    right: 36px;
  }

  .form-box h2 {
    font-size: 38px;
  }
}

@media (max-width: 640px) {
  .brand-panel {
    min-height: 240px;
  }

  .brand-logo {
    width: min(100%, 360px);
  }

  .form-panel {
    padding: 36px 20px 44px;
  }

  .form-box h2 {
    font-size: 32px;
  }

  .subtitle {
    font-size: 15px;
  }
}
</style>
