import './assets/main.css';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router/router.js';
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
import 'primeicons/primeicons.css';

const app = createApp(App);

app.use(router);
app.use(Toast, {
  position: "top-right",
  timeout: 3000,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  transition: "Vue-Toastification__fade",
});

app.mount('#app');
