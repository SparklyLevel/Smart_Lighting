<template>
  <div class="dashboard">
    <aside class="sidebar">
      <div class="sidebar-content">
        <!-- РЕЖИМ -->
        <div class="mode-toggle">
          <button :class="{ active: !compareMode }" @click="compareMode = false">
            📍 Одиночный
          </button>
          <button :class="{ active: compareMode }" @click="enableCompareMode">
            ⚖️ Сравнение
          </button>
        </div>

        <!-- СКАЧАТЬ PDF -->
        <button class="download-btn" @click="downloadPDF" :disabled="!firstLocation">
          <span>📄</span>
          {{ compareMode && secondLocation ? 'Скачать сравнение' : 'Скачать отчет' }}
        </button>

        <!-- ПОИСК -->
        <div class="search-section">
          <div class="search-input-wrapper">
            <span class="search-icon">🔍</span>
            <input 
              v-model="searchQuery" 
              type="text" 
              :placeholder="getSearchPlaceholder"
              class="search-input"
              @focus="showResults = true"
              @keydown.esc="showResults = false"
            />
            <button v-if="searchQuery" @click="clearSearch" class="clear-btn">×</button>
          </div>
          
          <div v-if="showResults && searchQuery && filteredCities.length" class="search-results">
            <div 
              v-for="city in filteredCities" 
              :key="city.name"
              class="search-item"
              @click="selectCity(city)"
            >
              <span class="city-name">{{ city.name }}</span>
              <span class="city-bortle" :style="{ color: getBortleColor(city.bortle) }">
                B{{ city.bortle }}
              </span>
            </div>
          </div>
          
          <div v-if="showResults && searchQuery && !filteredCities.length" class="search-results empty">
            <span class="no-results">Не найдено</span>
          </div>
        </div>

        <!-- ОДИНОЧНЫЙ РЕЖИМ -->
        <template v-if="!compareMode">
          <div class="brand">
            <h2>SkyGlow <span class="badge">PRO</span></h2>
            <p>Мониторинг загрязнения светом</p>
          </div>

          <LocationCard :location="firstLocation" :center="center1" />

          <div class="card chart-card">
            <div class="label">Динамика за год</div>
            <apexchart type="area" height="160" :options="chartOptions1" :series="series1" />
          </div>

          <div class="bortle-legend">
            <div 
              v-for="i in 9" 
              :key="i" 
              class="bortle-step" 
              :class="{ active: i === firstLocation?.bortle }" 
              :style="{ background: getBortleColor(i) }"
            ></div>
          </div>
        </template>

        <!-- РЕЖИМ СРАВНЕНИЯ -->
        <template v-else>
          <div class="brand compact">
            <h2>Сравнение локаций</h2>
          </div>

          <!-- ПЕРВАЯ -->
          <div class="compare-section primary">
            <div class="section-header">
              <span class="badge-location">1</span>
              <button v-if="secondLocation" @click="swapLocations" class="swap-btn">⇅</button>
            </div>
            
            <LocationCard :location="firstLocation" :center="center1" compact />

            <div class="card chart-card compact-chart">
              <div class="chart-header">
                <span class="label">{{ firstLocation?.name }}</span>
                <div class="scroll-controls">
                  <button @click="scrollChart('left', 1)">←</button>
                  <button @click="scrollChart('right', 1)">→</button>
                </div>
              </div>
              <div class="chart-scroll-container" ref="scrollContainer1">
                <div class="chart-wrapper">
                  <apexchart type="area" height="120" width="400" :options="chartOptionsCompare1" :series="series1" />
                </div>
              </div>
            </div>
          </div>

          <div class="compare-divider"><span>VS</span></div>

          <!-- ВТОРАЯ -->
          <div class="compare-section secondary" :class="{ empty: !secondLocation }">
            <div class="section-header">
              <span class="badge-location">2</span>
              <button v-if="secondLocation" @click="clearSecondLocation" class="clear-btn-small">✕</button>
            </div>

            <template v-if="secondLocation">
              <LocationCard :location="secondLocation" :center="center2" compact />

              <div class="card chart-card compact-chart">
                <div class="chart-header">
                  <span class="label">{{ secondLocation?.name }}</span>
                  <div class="scroll-controls">
                    <button @click="scrollChart('left', 2)">←</button>
                    <button @click="scrollChart('right', 2)">→</button>
                  </div>
                </div>
                <div class="chart-scroll-container" ref="scrollContainer2">
                  <div class="chart-wrapper">
                    <apexchart type="area" height="120" width="400" :options="chartOptionsCompare2" :series="series2" />
                  </div>
                </div>
              </div>
            </template>

            <div v-else class="empty-state">
              <p>Выберите вторую локацию</p>
              <p class="hint-small">Поиск или клик на карту</p>
            </div>
          </div>

          <!-- СВОДКА -->
          <div v-if="secondLocation" class="card comparison-summary">
            <div class="label">Сравнение</div>
            <div class="comparison-row">
              <span>Разница SQM:</span>
              <span :class="sqmDiff > 0 ? 'better' : 'worse'">
                {{ sqmDiff > 0 ? '+' : '' }}{{ sqmDiff.toFixed(2) }}
              </span>
            </div>
            <div class="comparison-row">
              <span>Разница Бортль:</span>
              <span :class="bortleDiff < 0 ? 'better' : 'worse'">
                {{ bortleDiff > 0 ? '+' : '' }}{{ bortleDiff }}
              </span>
            </div>
            <div class="winner">🏆 {{ winnerText }}</div>
          </div>
        </template>

        <p class="hint">{{ compareMode ? 'Выберите две точки' : 'Кликните на карту' }}</p>
      </div>

      <div v-if="loading1 || loading2" class="loading-overlay">
        <div class="spinner"></div>
        <span>Загрузка...</span>
      </div>
    </aside>

    <main class="map-wrapper">
      <l-map 
        ref="map" 
        v-model:zoom="zoom" 
        v-model:center="mapCenter"
        :use-global-leaflet="false"
        @click="handleMapClick"
        :options="{ attributionControl: false }"
      >
        <l-tile-layer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution="&copy; OpenStreetMap &copy; CARTO"
          layer-type="base"
        />
        
        <l-circle-marker 
          :lat-lng="center1" 
          :radius="compareMode ? 6 : 8" 
          :fill-color="getBortleColor(firstLocation?.bortle || 5)"
          color="#fff"
          :weight="2"
          :opacity="1"
          :fill-opacity="0.9"
        />

        <l-circle-marker 
          v-if="compareMode && secondLocation"
          :lat-lng="center2" 
          :radius="6" 
          :fill-color="getBortleColor(secondLocation?.bortle || 5)"
          color="#fbbf24"
          :weight="2"
          :opacity="1"
          :fill-opacity="0.9"
        />

        <l-polyline 
          v-if="compareMode && secondLocation"
          :lat-lngs="[center1, center2]"
          color="#fbbf24"
          :weight="2"
          dash-array="5, 10"
          :opacity="0.6"
        />
      </l-map>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { LMap, LTileLayer, LCircleMarker, LPolyline } from "@vue-leaflet/vue-leaflet";
import VueApexCharts from "vue3-apexcharts";
import "leaflet/dist/leaflet.css";
import { cityData, getLightPollutionData, generateHistoricalData } from './data/lightPollution.js';
import LocationCard from './components/LocationCard.vue';
import { usePDFExport } from './composables/usePDFExport.js';

const { generatePDF } = usePDFExport();

// Состояние
const compareMode = ref(false);
const center1 = ref([55.7558, 37.6173]);
const center2 = ref([59.9311, 30.3609]);
const firstLocation = ref(null);
const secondLocation = ref(null);
const loading1 = ref(false);
const loading2 = ref(false);
const searchQuery = ref('');
const showResults = ref(false);
const selectingForSecond = ref(false);
const scrollContainer1 = ref(null);
const scrollContainer2 = ref(null);
const zoom = ref(6);

// Вычисляемые
const mapCenter = computed(() => {
  if (!compareMode.value || !secondLocation.value) return center1.value;
  return [(center1.value[0] + center2.value[0]) / 2, (center1.value[1] + center2.value[1]) / 2];
});

const getSearchPlaceholder = computed(() => {
  if (compareMode.value && selectingForSecond.value && !secondLocation.value) {
    return 'Вторая локация...';
  }
  return 'Поиск города...';
});

const citiesList = computed(() => {
  return Object.entries(cityData).map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => a.name.localeCompare(b.name, 'ru'));
});

const filteredCities = computed(() => {
  if (!searchQuery.value) return [];
  const query = searchQuery.value.toLowerCase();
  const selected = new Set([firstLocation.value?.name, secondLocation.value?.name].filter(Boolean));
  return citiesList.value
    .filter(city => city.name.toLowerCase().includes(query) && !selected.has(city.name))
    .slice(0, 8);
});

const sqmDiff = computed(() => {
  if (!secondLocation.value) return 0;
  return parseFloat(secondLocation.value.sqm) - parseFloat(firstLocation.value.sqm);
});

const bortleDiff = computed(() => {
  if (!secondLocation.value) return 0;
  return secondLocation.value.bortle - firstLocation.value.bortle;
});

const winnerText = computed(() => {
  if (!secondLocation.value) return '';
  const diff = parseFloat(secondLocation.value.sqm) - parseFloat(firstLocation.value.sqm);
  if (Math.abs(diff) < 0.3) return 'Условия равны';
  return diff > 0 ? secondLocation.value.name : firstLocation.value.name;
});

// Графики
const baseChartOptions = {
  chart: { toolbar: { show: false }, background: 'transparent', fontFamily: 'Inter, sans-serif' },
  theme: { mode: 'dark' },
  stroke: { curve: 'smooth', width: 2 },
  grid: { show: true, borderColor: '#334155', strokeDashArray: 4, padding: { left: 0, right: 0 } },
  xaxis: { 
    categories: ['Я', 'Ф', 'М', 'А', 'М', 'И', 'И', 'А', 'С', 'О', 'Н', 'Д'],
    labels: { style: { colors: '#94a3b8', fontSize: '9px' } },
    axisBorder: { show: false },
    axisTicks: { show: false }
  },
  yaxis: { show: true, labels: { style: { colors: '#94a3b8', fontSize: '9px' } }, min: 16, max: 22 },
  fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 100] } },
  dataLabels: { enabled: false },
};

const chartOptions1 = computed(() => ({ ...baseChartOptions, colors: ['#fbbf24'] }));
const chartOptionsCompare1 = computed(() => ({ ...baseChartOptions, colors: ['#3b82f6'], yaxis: { ...baseChartOptions.yaxis, show: false } }));
const chartOptionsCompare2 = computed(() => ({ ...baseChartOptions, colors: ['#f59e0b'], yaxis: { ...baseChartOptions.yaxis, show: false } }));

const series1 = ref([]);
const series2 = ref([]);

// Инициализация
const initFirstLocation = () => {
  const data = getLightPollutionData(55.7558, 37.6173);
  firstLocation.value = { ...data, name: 'Москва', lat: 55.7558, lon: 37.6173 };
  series1.value = generateHistoricalData(data.sqm, data.bortle);
};
initFirstLocation();

// Методы
const enableCompareMode = () => {
  compareMode.value = true;
  selectingForSecond.value = !secondLocation.value;
  zoom.value = 5;
};

const selectCity = (city) => {
  if (compareMode.value && selectingForSecond.value && !secondLocation.value) {
    center2.value = [city.lat, city.lon];
    const data = getLightPollutionData(city.lat, city.lon);
    secondLocation.value = { ...data, name: city.name, lat: city.lat, lon: city.lon };
    series2.value = generateHistoricalData(city.sqm, city.bortle);
    selectingForSecond.value = false;
  } else {
    center1.value = [city.lat, city.lon];
    const data = getLightPollutionData(city.lat, city.lon);
    firstLocation.value = { ...data, name: city.name, lat: city.lat, lon: city.lon };
    series1.value = generateHistoricalData(city.sqm, city.bortle);
  }
  searchQuery.value = '';
  showResults.value = false;
};

const handleMapClick = async (e) => {
  const { lat, lng } = e.latlng;
  
  if (compareMode.value && selectingForSecond.value && !secondLocation.value) {
    center2.value = [lat, lng];
    const data = getLightPollutionData(lat, lng);
    secondLocation.value = { ...data, name: 'Точка на карте', lat, lon: lng };
    series2.value = generateHistoricalData(data.sqm, data.bortle);
    loading2.value = true;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1&accept-language=ru`);
      if (res.ok) {
        const geoData = await res.json();
        secondLocation.value.name = geoData.address?.city || geoData.address?.town || 'Точка на карте';
      }
    } finally {
      loading2.value = false;
      selectingForSecond.value = false;
    }
  } else {
    center1.value = [lat, lng];
    const data = getLightPollutionData(lat, lng);
    firstLocation.value = { ...data, name: 'Точка на карте', lat, lon: lng };
    series1.value = generateHistoricalData(data.sqm, data.bortle);
    loading1.value = true;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1&accept-language=ru`);
      if (res.ok) {
        const geoData = await res.json();
        firstLocation.value.name = geoData.address?.city || geoData.address?.town || 'Точка на карте';
      }
    } finally {
      loading1.value = false;
    }
  }
};

const swapLocations = () => {
  const tempLoc = firstLocation.value;
  const tempCenter = center1.value;
  const tempSeries = series1.value;
  
  firstLocation.value = secondLocation.value;
  center1.value = center2.value;
  series1.value = series2.value;
  
  secondLocation.value = tempLoc;
  center2.value = tempCenter;
  series2.value = tempSeries;
};

const clearSecondLocation = () => {
  secondLocation.value = null;
  series2.value = [];
  selectingForSecond.value = true;
};

const clearSearch = () => {
  searchQuery.value = '';
  showResults.value = false;
};

const scrollChart = (direction, num) => {
  const container = num === 1 ? scrollContainer1.value : scrollContainer2.value;
  if (!container) return;
  container.scrollBy({ left: direction === 'left' ? -80 : 80, behavior: 'smooth' });
};

const downloadPDF = async () => {
  const locations = compareMode.value && secondLocation.value 
    ? [firstLocation.value, secondLocation.value]
    : [firstLocation.value];
  const mode = compareMode.value && secondLocation.value ? 'compare' : 'single';
  await generatePDF(locations, mode);
};

const getBortleColor = (lvl) => {
  const colors = ['#3b82f6', '#60a5fa', '#93c5fd', '#fbbf24', '#f59e0b', '#ea580c', '#dc2626', '#991b1b', '#450a0a'];
  return colors[(lvl || 5) - 1] || '#64748b';
};

// Закрытие поиска
const handleClickOutside = (e) => {
  if (!e.target.closest('.search-section')) showResults.value = false;
};

onMounted(() => document.addEventListener('click', handleClickOutside));
onUnmounted(() => document.removeEventListener('click', handleClickOutside));
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');

* { box-sizing: border-box; }

body, html, #app { 
  margin: 0; 
  padding: 0; 
  height: 100%; 
  background: #020617; 
  overflow: hidden;
  font-family: 'Inter', sans-serif;
}

.dashboard { 
  display: flex; 
  height: 100vh; 
  width: 100vw;
}

.sidebar {
  width: 400px; 
  min-width: 400px; 
  max-width: 400px;
  height: 100vh;
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
  border-right: 1px solid #334155;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1000;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sidebar-content::-webkit-scrollbar { width: 6px; }
.sidebar-content::-webkit-scrollbar-track { background: transparent; }
.sidebar-content::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }

.mode-toggle {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.mode-toggle button {
  flex: 1;
  padding: 10px;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid #334155;
  border-radius: 10px;
  color: #94a3b8;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-toggle button.active {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #000;
  border-color: #fbbf24;
}

.download-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  border: none;
  border-radius: 10px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.download-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px -5px rgba(34, 197, 94, 0.4);
}

.download-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.search-section { position: relative; z-index: 100; flex-shrink: 0; }
.search-input-wrapper { position: relative; display: flex; align-items: center; }
.search-icon { position: absolute; left: 12px; font-size: 14px; opacity: 0.6; pointer-events: none; }
.search-input {
  width: 100%;
  padding: 12px 36px;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid #334155;
  border-radius: 10px;
  color: #f1f5f9;
  font-size: 14px;
  font-family: inherit;
  outline: none;
}
.search-input:focus { border-color: #fbbf24; }
.clear-btn {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 20px;
  cursor: pointer;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  max-height: 200px;
  overflow-y: auto;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
}

.search-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  cursor: pointer;
  border-bottom: 1px solid #334155;
}
.search-item:hover { background: #334155; }
.city-name { color: #f1f5f9; font-size: 14px; }
.city-bortle { font-size: 11px; font-weight: 600; background: rgba(0,0,0,0.3); padding: 3px 8px; border-radius: 12px; }

.brand h2 { margin: 0 0 4px 0; color: #fff; font-size: 20px; font-weight: 900; }
.brand.compact h2 { font-size: 16px; }
.brand p { margin: 0; color: #64748b; font-size: 12px; }

.badge { 
  background: linear-gradient(135deg, #fbbf24, #f59e0b); 
  color: #000; 
  font-size: 10px; 
  padding: 2px 6px; 
  border-radius: 4px; 
  vertical-align: middle;
  font-weight: 800;
  margin-left: 6px;
}

.compare-section { display: flex; flex-direction: column; gap: 10px; }
.compare-section.primary { border: 1px solid #3b82f6; border-radius: 12px; padding: 12px; background: rgba(59, 130, 246, 0.05); }
.compare-section.secondary { border: 1px solid #f59e0b; border-radius: 12px; padding: 12px; background: rgba(245, 158, 11, 0.05); }
.compare-section.secondary.empty { border-style: dashed; background: transparent; }

.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.badge-location { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #fff; }
.compare-section.primary .badge-location { background: #3b82f6; }
.compare-section.secondary .badge-location { background: #f59e0b; }

.swap-btn, .clear-btn-small {
  background: rgba(255,255,255,0.1);
  border: none;
  color: #94a3b8;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}
.swap-btn:hover { background: #3b82f6; color: #fff; }
.clear-btn-small:hover { background: #ef4444; color: #fff; }

.compare-divider { display: flex; align-items: center; justify-content: center; position: relative; }
.compare-divider::before { content: ''; position: absolute; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, #334155, transparent); }
.compare-divider span { background: #0f172a; padding: 4px 16px; color: #fbbf24; font-size: 12px; font-weight: 700; border: 1px solid #334155; border-radius: 20px; position: relative; z-index: 1; }

.empty-state { text-align: center; padding: 24px; color: #64748b; }
.hint-small { font-size: 12px; color: #475569; }

.chart-card { background: rgba(30, 41, 59, 0.6); border-radius: 10px; padding: 12px; border: 1px solid #334155; }
.chart-card.compact-chart { padding: 10px; }
.chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.chart-header .label { margin: 0; font-size: 11px; text-transform: none; }
.scroll-controls { display: flex; gap: 4px; }
.scroll-controls button { width: 24px; height: 24px; background: rgba(255,255,255,0.1); border: none; border-radius: 4px; color: #94a3b8; cursor: pointer; font-size: 12px; }
.scroll-controls button:hover { background: rgba(255,255,255,0.2); color: #fff; }

.chart-scroll-container { overflow-x: auto; overflow-y: hidden; margin: 0 -10px; padding: 0 10px; scrollbar-width: thin; scrollbar-color: #334155 transparent; }
.chart-scroll-container::-webkit-scrollbar { height: 4px; }
.chart-scroll-container::-webkit-scrollbar-thumb { background: #334155; border-radius: 2px; }
.chart-wrapper { min-width: 400px; }

.comparison-summary { background: linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.1)); border-color: #fbbf24; }
.comparison-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 13px; }
.comparison-row span:first-child { color: #94a3b8; }
.comparison-row .better { color: #22c55e; font-weight: 600; }
.comparison-row .worse { color: #ef4444; font-weight: 600; }
.winner { text-align: center; padding: 10px; background: rgba(251, 191, 36, 0.2); border-radius: 8px; font-size: 13px; font-weight: 600; color: #fbbf24; margin-top: 8px; }

.card { background: rgba(30, 41, 59, 0.6); backdrop-filter: blur(12px); padding: 16px; border-radius: 12px; border: 1px solid #334155; flex-shrink: 0; }
.label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; font-weight: 600; }

.bortle-legend { display: flex; gap: 2px; height: 8px; border-radius: 4px; overflow: hidden; flex-shrink: 0; }
.bortle-step { flex: 1; opacity: 0.3; transition: all 0.2s ease; }
.bortle-step.active { opacity: 1; transform: scaleY(1.3); }

.hint { font-size: 11px; color: #475569; text-align: center; margin: 0; font-style: italic; flex-shrink: 0; padding-bottom: 8px; }

.loading-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(4px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  z-index: 100;
  color: #fbbf24;
  font-weight: 600;
  font-size: 14px;
}

.spinner { width: 24px; height: 24px; border: 2px solid #334155; border-top-color: #fbbf24; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.map-wrapper { flex: 1; height: 100vh; position: relative; background: #020617; }
.leaflet-container { height: 100% !important; width: 100% !important; background: #020617 !important; font-family: 'Inter', sans-serif; }

@media (max-width: 768px) {
  .dashboard { flex-direction: column; }
  .sidebar { width: 100%; min-width: 100%; max-width: 100%; height: 60vh; min-height: 300px; border-right: none; border-top: 1px solid #334155; order: 2; }
  .map-wrapper { height: 40vh; order: 1; }
}
</style>