import { createApp } from 'vue'
import App from './App.vue'
import VueApexCharts from "vue3-apexcharts";
import "leaflet/dist/leaflet.css";

const app = createApp(App);
app.use(VueApexCharts);
app.mount('#app');
