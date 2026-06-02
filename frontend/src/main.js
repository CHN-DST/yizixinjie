import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './styles/main.css';

// Vant 组件样式（按需加载时自动引入）
import 'vant/lib/index.css';

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount('#app');
