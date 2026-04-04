import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/router";
import "./assets/main.css";
import { initializeAuthSession } from "./services/authSession";

const bootstrap = async () => {
  await initializeAuthSession(router);
  createApp(App).use(router).mount("#app");
};

bootstrap();
