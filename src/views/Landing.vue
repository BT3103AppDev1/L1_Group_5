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
    <div class="glow glow-left"></div>
    <div class="glow glow-right"></div>

    <div class="content">
      <img :src="logo" class="logo" alt="MunchMap logo" />

      <p class="tagline">
        <em>From quick bites to hidden gems, your next great meal is already on the map.</em>
      </p>

      <div class="buttons">
        <button class="login-btn" @click="goLogin">Login</button>
        <button class="signup-btn" @click="goRegister">Sign Up</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.landing {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  padding: 32px 20px;
  background:
    radial-gradient(circle at top left, rgba(56, 200, 143, 0.12), transparent 32%),
    radial-gradient(circle at bottom right, rgba(164, 197, 225, 0.16), transparent 30%),
    linear-gradient(180deg, #fcfcf7 0%, #f4f7f4 100%);
}

.content {
  position: relative;
  z-index: 1;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 22px;
}

.logo {
  width: clamp(500px, 52vw, 760px);
  max-width: 100%;
  filter: drop-shadow(0 20px 38px rgba(31, 159, 109, 0.16));
}

.tagline {
  max-width: 620px;
  margin: 0;
  color: #58616e;
  font-size: clamp(18px, 1.8vw, 24px);
  line-height: 1.6;
  letter-spacing: 0.01em;
}

.glow {
  position: absolute;
  border-radius: 999px;
  filter: blur(12px);
  pointer-events: none;
}

.glow-left {
  top: 14%;
  left: 18%;
  width: 180px;
  height: 180px;
  background: rgba(56, 200, 143, 0.12);
}

.glow-right {
  right: 14%;
  bottom: 18%;
  width: 240px;
  height: 240px;
  background: rgba(164, 197, 225, 0.12);
}

.buttons {
  display: flex;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
}

button {
  min-width: 190px;
  padding: 18px 34px;
  border-radius: 18px;
  border: none;
  font-weight: 700;
  font-size: 22px;
  letter-spacing: 0.01em;
  cursor: pointer;
  box-shadow: 0 14px 28px rgba(24, 39, 75, 0.14);
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.login-btn {
  background: linear-gradient(135deg, var(--brand-green), var(--brand-green-dark));
  color: white;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 32px rgba(31, 159, 109, 0.22);
}

.signup-btn {
  background: linear-gradient(135deg, var(--brand-grey), #81899a);
  color: white;
}

.signup-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 32px rgba(67, 77, 96, 0.2);
}

@media (max-width: 640px) {
  .landing {
    padding: 24px 16px;
  }

  .content {
    gap: 18px;
  }

  .logo {
    width: min(100%, 430px);
  }

  .tagline {
    font-size: 16px;
    line-height: 1.5;
  }

  .buttons {
    width: 100%;
    gap: 16px;
  }

  button {
    width: min(100%, 280px);
    min-width: 0;
    font-size: 18px;
    padding: 16px 24px;
  }
}
</style>
