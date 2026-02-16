<template>
  <div class="location-card" :class="{ compact }">
    <div class="label">Локация</div>
    <div class="location-name">{{ location?.name || 'Не выбрано' }}</div>
    <div class="coords">{{ formatCoords }}</div>
    
    <div v-if="location" class="stats-row">
      <div class="stat-box" :style="{ borderColor: getBortleColor(location.bortle) }">
        <span class="stat-label">Бортль</span>
        <span class="stat-value" :style="{ color: getBortleColor(location.bortle) }">
          {{ location.bortle }}
        </span>
      </div>
      <div class="stat-box">
        <span class="stat-label">SQM</span>
        <span class="stat-value sqm">{{ location.sqm }}</span>
      </div>
    </div>

    <div v-if="location" class="source-badge" :class="location.sourceType">
      <span v-if="location.sourceType === 'city'">📍 Точные</span>
      <span v-else-if="location.sourceType === 'suburb'">📊 Интерполяция</span>
      <span v-else>🔭 Оценка</span>
      <small v-if="location.distance">{{ location.distance }} км</small>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  location: Object,
  center: Array,
  loading: Boolean,
  compact: Boolean
});

const formatCoords = computed(() => {
  const lat = props.center?.[0] || 0;
  const lon = props.center?.[1] || 0;
  return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
});

const getBortleColor = (lvl) => {
  const colors = ['#3b82f6', '#60a5fa', '#93c5fd', '#fbbf24', '#f59e0b', '#ea580c', '#dc2626', '#991b1b', '#450a0a'];
  return colors[(lvl || 5) - 1] || '#64748b';
};
</script>

<style scoped>
.location-card {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid #475569;
  border-radius: 10px;
  padding: 14px;
}

.location-card.compact {
  padding: 10px;
}

.label {
  font-size: 10px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
  font-weight: 600;
}

.location-name {
  font-size: 16px;
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 2px;
  line-height: 1.2;
  word-break: break-word;
}

.compact .location-name {
  font-size: 14px;
}

.coords {
  font-size: 11px;
  color: #64748b;
  font-family: monospace;
  margin-bottom: 10px;
}

.compact .coords {
  font-size: 10px;
  margin-bottom: 8px;
}

.stats-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.stat-box {
  flex: 1;
  background: rgba(15, 23, 42, 0.5);
  border-radius: 8px;
  padding: 8px;
  text-align: center;
  border: 2px solid transparent;
}

.compact .stat-box {
  padding: 6px;
}

.stat-label {
  display: block;
  font-size: 9px;
  color: #94a3b8;
  text-transform: uppercase;
  margin-bottom: 2px;
}

.stat-value {
  display: block;
  font-size: 20px;
  font-weight: 900;
  color: #fff;
}

.compact .stat-value {
  font-size: 16px;
}

.stat-value.sqm {
  background: linear-gradient(to bottom, #fff, #cbd5e1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.source-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 600;
  border: 1px solid transparent;
}

.source-badge.city {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.3);
}
.source-badge.suburb {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
  border-color: rgba(251, 191, 36, 0.3);
}
.source-badge.remote, .source-badge.rural {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  border-color: rgba(56, 189, 248, 0.3);
}
</style>