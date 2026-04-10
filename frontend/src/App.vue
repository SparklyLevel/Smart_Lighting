<template>
  <div v-if="view === 'dashboard'" class="dashboard">
    <div class="sidebar-shell">
      <Transition name="sidebar-slide" mode="out-in" appear>
        <aside :key="compareMode" class="sidebar">
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
              <p class="hint-small">ПКМ по карте или поиск</p>
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

        <p class="hint">{{ compareMode ? 'ЛКМ — первая точка, ПКМ — вторая' : 'Кликните на карту' }}</p>
      </div>

      <div v-if="loading1 || loading2" class="loading-overlay">
        <div class="spinner"></div>
        <span>Загрузка...</span>
      </div>
        </aside>
      </Transition>
    </div>

    <main class="map-wrapper">
      <l-map 
        ref="map" 
        v-model:zoom="zoom" 
        v-model:center="mapCenter"
        :use-global-leaflet="false"
        @click="handleMapClick"
        @contextmenu="handleMapContextMenu"
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

      <div v-if="compareMode" class="map-click-hint" aria-label="Управление картой в режиме сравнения">
        <div class="map-click-hint__title">Точки на карте</div>
        <div class="map-click-hint__rows">
          <div class="map-click-hint__row">
            <span class="mouse-icon mouse-icon--left" title="Левая кнопка"></span>
            <span class="map-click-hint__label">Точка 1</span>
          </div>
          <div class="map-click-hint__row">
            <span class="mouse-icon mouse-icon--right" title="Правая кнопка"></span>
            <span class="map-click-hint__label">Точка 2</span>
          </div>
        </div>
      </div>

      <button
        v-if="!compareMode"
        class="earth-3d-btn"
        type="button"
        aria-label="Перейти к 3D модели Земли"
        @click="goToEarth"
      >
        <span class="earth-3d-btn__icon" aria-hidden="true"></span>
        <span class="earth-3d-btn__text">3D Земля</span>
      </button>
    </main>
  </div>

  <div
    v-else
    class="earth-page"
    :class="`earth-cursor--${earthMode}`"
    @contextmenu="onEarthContextMenu"
  >
    <div class="earth-page__topbar">
      <button class="earth-page__back" type="button" @click="goToDashboard">← Назад</button>
      <div class="earth-page__title">3D модель Земли</div>
      <div class="earth-page__spacer"></div>
    </div>
    <div class="earth-page__content" role="region" aria-label="3D модель Земли">
      <div class="earth-viewport">
        <EarthGlobe />
      </div>
    </div>

    <div class="earth-roulette" aria-label="Режим курсора R G B">
      <div
        class="earth-roulette__ring"
        :style="{ transform: `rotate(${earthRotationDeg}deg)` }"
      >
        <button
          type="button"
          class="earth-roulette__dot earth-roulette__dot--r"
          :class="{ active: earthMode === 'r' }"
          aria-label="R"
          @click="setEarthMode('r')"
        />
        <button
          type="button"
          class="earth-roulette__dot earth-roulette__dot--g"
          :class="{ active: earthMode === 'g' }"
          aria-label="G"
          @click="setEarthMode('g')"
        />
        <button
          type="button"
          class="earth-roulette__dot earth-roulette__dot--b"
          :class="{ active: earthMode === 'b' }"
          aria-label="B"
          @click="setEarthMode('b')"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { LMap, LTileLayer, LCircleMarker, LPolyline } from "@vue-leaflet/vue-leaflet";
import VueApexCharts from "vue3-apexcharts";
import "leaflet/dist/leaflet.css";
import { cityData, getLightPollutionData, generateHistoricalData } from './data/lightPollution.js';
import LocationCard from './components/LocationCard.vue';
import EarthGlobe from './components/EarthGlobe.vue';
import { usePDFExport } from './composables/usePDFExport.js';

const { generatePDF } = usePDFExport();

const view = ref('dashboard');
const earthModes = ['r', 'g', 'b'];
const earthStep = ref(0);
const earthModeIndex = computed(() => ((earthStep.value % earthModes.length) + earthModes.length) % earthModes.length);
const earthMode = computed(() => earthModes[earthModeIndex.value] || 'r');
const earthRotationDeg = computed(() => -earthStep.value * 120);

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

const reverseGeocodeName = async (lat, lng) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1&accept-language=ru`
    );
    if (!res.ok) return null;
    const geoData = await res.json();
    return geoData.address?.city || geoData.address?.town || null;
  } catch {
    return null;
  }
};

const applyFirstPoint = async (lat, lng) => {
  center1.value = [lat, lng];
  const data = getLightPollutionData(lat, lng);
  firstLocation.value = { ...data, name: 'Точка на карте', lat, lon: lng };
  series1.value = generateHistoricalData(data.sqm, data.bortle);
  loading1.value = true;
  try {
    const name = await reverseGeocodeName(lat, lng);
    if (name) firstLocation.value.name = name;
  } finally {
    loading1.value = false;
  }
};

const applySecondPoint = async (lat, lng) => {
  center2.value = [lat, lng];
  const data = getLightPollutionData(lat, lng);
  secondLocation.value = { ...data, name: 'Точка на карте', lat, lon: lng };
  series2.value = generateHistoricalData(data.sqm, data.bortle);
  loading2.value = true;
  try {
    const name = await reverseGeocodeName(lat, lng);
    if (name) secondLocation.value.name = name;
  } finally {
    loading2.value = false;
    selectingForSecond.value = false;
  }
};

const handleMapClick = async (e) => {
  const { lat, lng } = e.latlng;
  await applyFirstPoint(lat, lng);
};

const handleMapContextMenu = async (e) => {
  if (!compareMode.value) return;
  e.originalEvent?.preventDefault();
  const { lat, lng } = e.latlng;
  await applySecondPoint(lat, lng);
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

const syncViewFromHash = () => {
  const hash = (window.location.hash || '').toLowerCase();
  view.value = hash === '#earth' ? 'earth' : 'dashboard';
};

const goToEarth = () => {
  window.location.hash = 'earth';
  syncViewFromHash();
};

const goToDashboard = () => {
  window.location.hash = '';
  syncViewFromHash();
};

const setEarthMode = (mode) => {
  const idx = earthModes.indexOf(mode);
  if (idx === -1) return;
  const current = earthModeIndex.value;
  const deltaCcwSteps = (idx - current + earthModes.length) % earthModes.length; // 0..2
  earthStep.value += deltaCcwSteps;
};

const nextEarthMode = () => {
  earthStep.value += 1;
};

const onEarthContextMenu = (e) => {
  if (view.value !== 'earth') return;
  e.preventDefault();
  nextEarthMode();
};

// Закрытие поиска
const handleClickOutside = (e) => {
  if (!e.target.closest('.search-section')) showResults.value = false;
};

onMounted(() => {
  syncViewFromHash();
  window.addEventListener('hashchange', syncViewFromHash);
  document.addEventListener('click', handleClickOutside);
});
onUnmounted(() => {
  window.removeEventListener('hashchange', syncViewFromHash);
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');

* { box-sizing: border-box; }

body, html, #app { 
  margin: 0; 
  padding: 0; 
  height: 100%; 
  background:
    radial-gradient(ellipse 130% 90% at 0% 0%, rgba(59, 130, 246, 0.14) 0%, transparent 55%),
    radial-gradient(ellipse 100% 70% at 100% 20%, rgba(251, 191, 36, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse 80% 50% at 50% 100%, rgba(99, 102, 241, 0.06) 0%, transparent 45%),
    #020617;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
}

.dashboard { 
  display: flex; 
  height: 100vh; 
  width: 100vw;
}

.sidebar-shell {
  width: 400px;
  min-width: 400px;
  max-width: 400px;
  height: 100vh;
  flex-shrink: 0;
  position: relative;
  z-index: 1000;
  overflow: hidden;
  background: linear-gradient(168deg, #0a0f1c 0%, #121a2e 38%, #162038 72%, #1a2744 100%);
  box-shadow:
    16px 0 48px -16px rgba(0, 0, 0, 0.55),
    inset -1px 0 0 rgba(255, 255, 255, 0.05);
}

.sidebar-slide-enter-active,
.sidebar-slide-leave-active {
  transition:
    transform 0.24s cubic-bezier(0.33, 1, 0.68, 1),
    opacity 0.36s ease;
}

.sidebar-slide-enter-from,
.sidebar-slide-leave-to {
  transform: translateX(-100%);
  opacity: 0.92;
}

.sidebar-slide-enter-to,
.sidebar-slide-leave-from {
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .sidebar-slide-enter-active,
  .sidebar-slide-leave-active {
    transition-duration: 0.01ms !important;
  }
}

.sidebar {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background: inherit;
  border-right: none;
  box-shadow: none;
  display: flex;
  flex-direction: column;
  will-change: transform;
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
  background: linear-gradient(165deg, rgba(71, 85, 105, 0.35) 0%, rgba(30, 41, 59, 0.65) 100%);
  border: none;
  border-radius: 12px;
  color: #94a3b8;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s, color 0.2s;
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.22),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.mode-toggle button:hover:not(.active) {
  color: #cbd5e1;
}

.mode-toggle button.active {
  background: linear-gradient(135deg, #fde68a 0%, #fbbf24 45%, #f59e0b 100%);
  color: #0f172a;
  box-shadow:
    0 6px 24px -4px rgba(251, 191, 36, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.35);
}

.download-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #4ade80 0%, #22c55e 40%, #15803d 100%);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow:
    0 4px 20px -4px rgba(34, 197, 94, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.download-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow:
    0 12px 28px -6px rgba(34, 197, 94, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
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
  background: linear-gradient(175deg, rgba(71, 85, 105, 0.4) 0%, rgba(30, 41, 59, 0.75) 100%);
  border: none;
  border-radius: 12px;
  color: #f1f5f9;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}
.search-input:focus {
  box-shadow:
    0 0 0 2px rgba(251, 191, 36, 0.35),
    0 8px 28px rgba(0, 0, 0, 0.22),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}
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
  margin-top: 6px;
  background: linear-gradient(180deg, rgba(36, 48, 71, 0.98) 0%, rgba(22, 32, 50, 0.99) 100%);
  border: none;
  border-radius: 12px;
  max-height: 200px;
  overflow-y: auto;
  box-shadow:
    0 20px 50px -12px rgba(0, 0, 0, 0.55),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.search-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  cursor: pointer;
  border-bottom: none;
}
.search-item + .search-item {
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}
.search-item:hover {
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.12) 0%, rgba(51, 65, 85, 0.35) 100%);
}
.city-name { color: #f1f5f9; font-size: 14px; }
.city-bortle { font-size: 11px; font-weight: 600; background: rgba(0,0,0,0.3); padding: 3px 8px; border-radius: 12px; }

.brand h2 { margin: 0 0 4px 0; color: #fff; font-size: 20px; font-weight: 900; }
.brand.compact h2 { font-size: 16px; }
.brand p { margin: 0; color: #64748b; font-size: 12px; }

.badge { 
  background: linear-gradient(135deg, #fde68a 0%, #fbbf24 50%, #d97706 100%); 
  color: #0f172a; 
  font-size: 10px; 
  padding: 2px 6px; 
  border-radius: 6px; 
  vertical-align: middle;
  font-weight: 800;
  margin-left: 6px;
  box-shadow: 0 2px 8px -2px rgba(251, 191, 36, 0.5);
}

.compare-section { display: flex; flex-direction: column; gap: 10px; }
.compare-section.primary {
  border: none;
  border-radius: 16px;
  padding: 14px;
  background: linear-gradient(155deg, rgba(59, 130, 246, 0.22) 0%, rgba(37, 99, 235, 0.08) 45%, rgba(15, 23, 42, 0.35) 100%);
  box-shadow:
    0 8px 32px -8px rgba(59, 130, 246, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}
.compare-section.secondary {
  border: none;
  border-radius: 16px;
  padding: 14px;
  background: linear-gradient(155deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.08) 45%, rgba(15, 23, 42, 0.35) 100%);
  box-shadow:
    0 8px 32px -8px rgba(245, 158, 11, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}
.compare-section.secondary.empty {
  background: linear-gradient(160deg, rgba(51, 65, 85, 0.25) 0%, rgba(15, 23, 42, 0.45) 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.badge-location { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #fff; }
.compare-section.primary .badge-location { background: #3b82f6; }
.compare-section.secondary .badge-location { background: #f59e0b; }

.swap-btn, .clear-btn-small {
  background: linear-gradient(165deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%);
  border: none;
  color: #94a3b8;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}
.swap-btn:hover {
  background: linear-gradient(165deg, #3b82f6 0%, #2563eb 100%);
  color: #fff;
  box-shadow: 0 4px 14px -4px rgba(59, 130, 246, 0.55);
}
.clear-btn-small:hover {
  background: linear-gradient(165deg, #f87171 0%, #dc2626 100%);
  color: #fff;
  box-shadow: 0 4px 14px -4px rgba(239, 68, 68, 0.45);
}

.compare-divider { display: flex; align-items: center; justify-content: center; position: relative; }
.compare-divider::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent 0%, rgba(251, 191, 36, 0.25) 35%, rgba(59, 130, 246, 0.2) 65%, transparent 100%);
  border-radius: 2px;
}
.compare-divider span {
  padding: 6px 18px;
  color: #fde68a;
  font-size: 12px;
  font-weight: 700;
  border: none;
  border-radius: 999px;
  position: relative;
  z-index: 1;
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.35) 0%, rgba(245, 158, 11, 0.15) 50%, rgba(30, 41, 59, 0.85) 100%);
  box-shadow:
    0 6px 20px -6px rgba(251, 191, 36, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
}

.empty-state { text-align: center; padding: 24px; color: #64748b; }
.hint-small { font-size: 12px; color: #475569; }

.chart-card {
  background: linear-gradient(168deg, rgba(71, 85, 105, 0.38) 0%, rgba(30, 41, 59, 0.72) 100%);
  border-radius: 14px;
  padding: 12px;
  border: none;
  box-shadow:
    0 6px 24px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.07);
}
.chart-card.compact-chart { padding: 10px; }
.chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.chart-header .label { margin: 0; font-size: 11px; text-transform: none; }
.scroll-controls { display: flex; gap: 4px; }
.scroll-controls button {
  width: 24px;
  height: 24px;
  background: linear-gradient(165deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.05) 100%);
  border: none;
  border-radius: 6px;
  color: #94a3b8;
  cursor: pointer;
  font-size: 12px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}
.scroll-controls button:hover {
  background: linear-gradient(165deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.1) 100%);
  color: #fff;
}

.chart-scroll-container { overflow-x: auto; overflow-y: hidden; margin: 0 -10px; padding: 0 10px; scrollbar-width: thin; scrollbar-color: #334155 transparent; }
.chart-scroll-container::-webkit-scrollbar { height: 4px; }
.chart-scroll-container::-webkit-scrollbar-thumb { background: #334155; border-radius: 2px; }
.chart-wrapper { min-width: 400px; }

.comparison-summary {
  background: linear-gradient(150deg, rgba(251, 191, 36, 0.22) 0%, rgba(245, 158, 11, 0.1) 40%, rgba(30, 41, 59, 0.55) 100%);
  border: none;
  box-shadow:
    0 10px 36px -10px rgba(251, 191, 36, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}
.comparison-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: none;
  font-size: 13px;
}
.comparison-row + .comparison-row {
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}
.comparison-row span:first-child { color: #94a3b8; }
.comparison-row .better { color: #4ade80; font-weight: 600; }
.comparison-row .worse { color: #f87171; font-weight: 600; }
.winner {
  text-align: center;
  padding: 12px;
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.4) 0%, rgba(217, 119, 6, 0.2) 100%);
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  color: #fde68a;
  margin-top: 10px;
  box-shadow:
    0 6px 20px -6px rgba(251, 191, 36, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.card {
  background: linear-gradient(168deg, rgba(71, 85, 105, 0.42) 0%, rgba(30, 41, 59, 0.75) 100%);
  backdrop-filter: blur(14px);
  padding: 16px;
  border-radius: 14px;
  border: none;
  flex-shrink: 0;
  box-shadow:
    0 8px 28px rgba(0, 0, 0, 0.22),
    inset 0 1px 0 rgba(255, 255, 255, 0.07);
}
.label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; font-weight: 600; }

.bortle-legend {
  display: flex;
  gap: 3px;
  height: 9px;
  border-radius: 999px;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.25);
}
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

.spinner {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  background: conic-gradient(from 0deg, #fbbf24, #f59e0b, rgba(51, 65, 85, 0.25), rgba(51, 65, 85, 0.15));
  mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #fff calc(100% - 3px));
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #fff calc(100% - 3px));
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.map-wrapper {
  flex: 1;
  height: 100vh;
  position: relative;
  background: radial-gradient(ellipse 70% 50% at 30% 20%, rgba(59, 130, 246, 0.06) 0%, transparent 55%), #020617;
}

.map-click-hint {
  position: absolute;
  right: 14px;
  bottom: 14px;
  z-index: 1000;
  padding: 10px 12px 12px;
  border-radius: 14px;
  background: linear-gradient(165deg, rgba(36, 48, 71, 0.94) 0%, rgba(15, 23, 42, 0.97) 100%);
  box-shadow:
    0 10px 36px rgba(0, 0, 0, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  pointer-events: none;
  user-select: none;
  max-width: min(240px, calc(100% - 8px));
}

.map-click-hint__title {
  font-size: 10px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin-bottom: 8px;
  font-weight: 600;
}

.map-click-hint__rows {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.map-click-hint__row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.map-click-hint__label {
  font-size: 12px;
  color: #e2e8f0;
  font-weight: 500;
}

.mouse-icon {
  width: 34px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 14px 14px 16px 16px;
  border: 2px solid rgba(148, 163, 184, 0.45);
  background: rgba(15, 23, 42, 0.75);
  position: relative;
  overflow: hidden;
}

.mouse-icon::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 6px;
  bottom: 8px;
  width: 0;
  border-left: 1px solid rgba(148, 163, 184, 0.35);
  transform: translateX(-50%);
}

.mouse-icon--left::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 50%;
  height: 100%;
  background: linear-gradient(165deg, #93c5fd 0%, #3b82f6 55%, #1d4ed8 100%);
  border-radius: 11px 0 0 13px;
  opacity: 0.95;
}

.mouse-icon--right::after {
  content: '';
  position: absolute;
  right: 0;
  top: 0;
  width: 50%;
  height: 100%;
  background: linear-gradient(165deg, #fde68a 0%, #f59e0b 55%, #b45309 100%);
  border-radius: 0 11px 13px 0;
  opacity: 0.95;
}

.earth-3d-btn {
  position: absolute;
  right: 14px;
  bottom: 14px;
  z-index: 1000;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  color: #e2e8f0;
  background: linear-gradient(165deg, rgba(36, 48, 71, 0.92) 0%, rgba(15, 23, 42, 0.96) 100%);
  box-shadow:
    0 14px 40px rgba(0, 0, 0, 0.48),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  transition: transform 0.2s, box-shadow 0.2s, filter 0.2s;
}

.earth-3d-btn:hover {
  transform: translateY(-2px);
  filter: saturate(1.05);
  box-shadow:
    0 18px 50px rgba(0, 0, 0, 0.52),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.earth-3d-btn:active {
  transform: translateY(-1px);
}

.earth-3d-btn__text {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.01em;
  white-space: nowrap;
}

.earth-3d-btn__icon {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  flex-shrink: 0;
  background:
    radial-gradient(circle at 30% 30%, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.18) 14%, transparent 15%),
    radial-gradient(circle at 40% 55%, rgba(34, 197, 94, 0.75) 0%, rgba(34, 197, 94, 0.18) 40%, transparent 62%),
    radial-gradient(circle at 65% 48%, rgba(59, 130, 246, 0.9) 0%, rgba(59, 130, 246, 0.25) 55%, transparent 70%),
    radial-gradient(circle at 50% 50%, rgba(2, 6, 23, 0.15) 0%, rgba(2, 6, 23, 0.55) 70%, rgba(2, 6, 23, 0.8) 100%);
  box-shadow:
    0 8px 22px rgba(0, 0, 0, 0.35),
    inset 0 0 0 2px rgba(148, 163, 184, 0.18);
  position: relative;
  overflow: hidden;
}

.earth-3d-btn__icon::after {
  content: '';
  position: absolute;
  inset: -10px;
  background: radial-gradient(circle at 20% 20%, rgba(255,255,255,0.22) 0%, transparent 45%);
  transform: rotate(-15deg);
}

.earth-page {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(ellipse 120% 90% at 30% 0%, rgba(59, 130, 246, 0.16) 0%, transparent 55%),
    radial-gradient(ellipse 110% 80% at 80% 20%, rgba(251, 191, 36, 0.1) 0%, transparent 50%),
    #020617;
}

.earth-cursor--r {
  cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 18 18'%3E%3Ccircle cx='9' cy='9' r='6.5' fill='%23ef4444' stroke='white' stroke-opacity='0.35' stroke-width='2'/%3E%3C/svg%3E") 9 9, auto;
}
.earth-cursor--g {
  cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 18 18'%3E%3Ccircle cx='9' cy='9' r='6.5' fill='%2322c55e' stroke='white' stroke-opacity='0.35' stroke-width='2'/%3E%3C/svg%3E") 9 9, auto;
}
.earth-cursor--b {
  cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 18 18'%3E%3Ccircle cx='9' cy='9' r='6.5' fill='%233b82f6' stroke='white' stroke-opacity='0.35' stroke-width='2'/%3E%3C/svg%3E") 9 9, auto;
}

.earth-roulette {
  position: absolute;
  right: 14px;
  bottom: 14px;
  z-index: 1001;
  user-select: none;
  width: 76px;
  height: 76px;
  pointer-events: auto;
}

.earth-roulette__ring {
  width: 76px;
  height: 76px;
  position: relative;
  transform-origin: 50% 50%;
  transition: transform 520ms cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
}

.earth-roulette__dot {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 16px;
  height: 16px;
  margin: -8px 0 0 -8px;
  padding: 0;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  box-sizing: border-box;
  transition:
    box-shadow 220ms ease,
    filter 220ms ease,
    opacity 220ms ease,
    transform 220ms ease;
  opacity: 0.55;
  filter: saturate(0.75) brightness(0.82) contrast(0.92);
  box-shadow:
    0 6px 14px rgba(0, 0, 0, 0.28),
    inset 0 0 0 1px rgba(255, 255, 255, 0.12);
}

.earth-roulette__dot.active {
  opacity: 1;
  filter: saturate(1.15) brightness(1.08) contrast(1.35);
  box-shadow:
    0 0 0 2px rgba(255, 255, 255, 0.92),
    0 0 18px rgba(255, 255, 255, 0.35),
    0 10px 22px rgba(0, 0, 0, 0.4),
    inset 0 0 0 1px rgba(255, 255, 255, 0.35);
  z-index: 2;
}

.earth-roulette__dot--r {
  transform: rotate(-90deg) translateY(-30px);
  background: linear-gradient(165deg, #fecaca 0%, #ef4444 55%, #b91c1c 100%);
}

.earth-roulette__dot--g {
  transform: rotate(30deg) translateY(-30px);
  background: linear-gradient(165deg, #bbf7d0 0%, #22c55e 55%, #15803d 100%);
}

.earth-roulette__dot--b {
  transform: rotate(150deg) translateY(-30px);
  background: linear-gradient(165deg, #bfdbfe 0%, #3b82f6 55%, #1d4ed8 100%);
}

.earth-roulette__dot--r.active {
  transform: rotate(-90deg) translateY(-30px) scale(1.14);
}

.earth-roulette__dot--g.active {
  transform: rotate(30deg) translateY(-30px) scale(1.14);
}

.earth-roulette__dot--b.active {
  transform: rotate(150deg) translateY(-30px) scale(1.14);
}

@media (prefers-reduced-motion: reduce) {
  .earth-roulette__ring {
    transition-duration: 0.01ms !important;
  }
}

.earth-page__topbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.88) 0%, rgba(15, 23, 42, 0.55) 100%);
  backdrop-filter: blur(14px);
  box-shadow: inset 0 -1px 0 rgba(255, 255, 255, 0.06);
}

.earth-page__back {
  border: none;
  cursor: pointer;
  color: #e2e8f0;
  background: linear-gradient(165deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%);
  border-radius: 12px;
  padding: 10px 12px;
  font-weight: 600;
}

.earth-page__title {
  flex: 1;
  text-align: center;
  color: #f1f5f9;
  font-weight: 800;
  letter-spacing: 0.01em;
}

.earth-page__spacer {
  width: 88px;
}

.earth-page__content {
  flex: 1;
  display: grid;
  place-items: center;
  padding: 18px;
}

.earth-viewport {
  width: min(980px, 92vw);
  height: min(620px, calc(100vh - 92px));
  border-radius: 22px;
  padding: 14px;
  background: linear-gradient(168deg, rgba(71, 85, 105, 0.24) 0%, rgba(15, 23, 42, 0.55) 100%);
  box-shadow:
    0 24px 70px rgba(0, 0, 0, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.earth-viewport > * {
  width: 100%;
  height: 100%;
}

.earth-placeholder {
  width: min(720px, 92vw);
  border-radius: 20px;
  padding: 22px;
  background: linear-gradient(168deg, rgba(71, 85, 105, 0.32) 0%, rgba(15, 23, 42, 0.72) 100%);
  box-shadow:
    0 24px 70px rgba(0, 0, 0, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  display: grid;
  gap: 14px;
  place-items: center;
}

.earth-placeholder__globe {
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background:
    radial-gradient(circle at 30% 30%, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.18) 14%, transparent 16%),
    radial-gradient(circle at 38% 58%, rgba(34, 197, 94, 0.8) 0%, rgba(34, 197, 94, 0.2) 45%, transparent 64%),
    radial-gradient(circle at 68% 48%, rgba(59, 130, 246, 0.95) 0%, rgba(59, 130, 246, 0.28) 58%, transparent 72%),
    radial-gradient(circle at 50% 50%, rgba(2, 6, 23, 0.2) 0%, rgba(2, 6, 23, 0.65) 72%, rgba(2, 6, 23, 0.86) 100%);
  box-shadow:
    0 24px 70px rgba(0, 0, 0, 0.5),
    inset 0 0 0 3px rgba(148, 163, 184, 0.12);
}

.earth-placeholder__text {
  color: #cbd5e1;
  font-size: 14px;
  font-weight: 600;
}

.leaflet-container { height: 100% !important; width: 100% !important; background: #020617 !important; font-family: 'Inter', sans-serif; }

@media (max-width: 768px) {
  .dashboard { flex-direction: column; }
  .sidebar-shell {
    width: 100%;
    min-width: 100%;
    max-width: 100%;
    height: 60vh;
    min-height: 300px;
    order: 2;
    box-shadow: 0 -12px 40px -8px rgba(0, 0, 0, 0.45);
  }
  .map-wrapper { height: 40vh; order: 1; }
}
</style>