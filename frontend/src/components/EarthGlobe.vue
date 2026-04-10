<template>
  <div ref="rootEl" class="earth-canvas-root">
    <div v-if="isLoading" class="earth-loading" aria-label="Загрузка 3D модели">
      <div class="earth-loading__row">
        <span class="earth-loading__label">Загрузка</span>
        <span class="earth-loading__value">{{ loadingPercent }}%</span>
      </div>
      <div class="earth-loading__bar" role="progressbar" :aria-valuenow="loadingPercent" aria-valuemin="0" aria-valuemax="100">
        <div class="earth-loading__fill" :style="{ width: `${loadingPercent}%` }" />
      </div>
      <div class="earth-loading__eta" v-if="etaText">{{ etaText }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const rootEl = ref(null);
const isLoading = ref(true);
const loadingPercent = ref(0);
const etaSeconds = ref(null);

let renderer;
let scene;
let camera;
let controls;
let rafId;
let resizeObserver;

const EARTH_RADIUS = 1;

const etaText = computed(() => {
  if (!isLoading.value) return '';
  if (etaSeconds.value == null) return '';
  if (!Number.isFinite(etaSeconds.value)) return '';
  const s = Math.max(0, Math.round(etaSeconds.value));
  if (s <= 1) return 'Осталось ~1 сек';
  if (s < 60) return `Осталось ~${s} сек`;
  const m = Math.floor(s / 60);
  const rest = s % 60;
  return `Осталось ~${m} мин ${rest} сек`;
});

function disposeScene() {
  if (rafId) cancelAnimationFrame(rafId);
  rafId = null;

  if (controls) controls.dispose();
  controls = null;

  if (scene) {
    scene.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
        else obj.material.dispose();
      }
      if (obj.texture) obj.texture.dispose?.();
    });
  }

  if (renderer) {
    renderer.dispose();
    renderer.forceContextLoss?.();
    renderer.domElement?.remove?.();
  }

  renderer = null;
  scene = null;
  camera = null;
}

onMounted(async () => {
  if (!rootEl.value) return;
  isLoading.value = true;
  loadingPercent.value = 0;
  etaSeconds.value = null;
  const startedAt = performance.now();

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 3.2);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  rootEl.value.appendChild(renderer.domElement);

  // Свет
  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const dir = new THREE.DirectionalLight(0xffffff, 1.35);
  dir.position.set(3, 2, 4);
  scene.add(dir);

  // Земля (текстуры грузим с threejs.org, чтобы не тащить ассеты в репо)
  const manager = new THREE.LoadingManager();
  manager.onProgress = (_url, itemsLoaded, itemsTotal) => {
    const pct = itemsTotal > 0 ? Math.round((itemsLoaded / itemsTotal) * 100) : 0;
    loadingPercent.value = Math.max(0, Math.min(100, pct));
    if (loadingPercent.value > 0 && loadingPercent.value < 100) {
      const elapsed = (performance.now() - startedAt) / 1000;
      etaSeconds.value = (elapsed * (100 - loadingPercent.value)) / loadingPercent.value;
    }
  };
  manager.onLoad = () => {
    loadingPercent.value = 100;
    etaSeconds.value = 0;
    isLoading.value = false;
  };
  const loader = new THREE.TextureLoader(manager);
  const [map, bump, spec] = await Promise.all([
    loader.loadAsync('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg'),
    loader.loadAsync('https://threejs.org/examples/textures/planets/earth_bump_2048.jpg'),
    loader.loadAsync('https://threejs.org/examples/textures/planets/earth_specular_2048.jpg')
  ]);
  map.colorSpace = THREE.SRGBColorSpace;

  const geometry = new THREE.SphereGeometry(EARTH_RADIUS, 96, 96);
  const material = new THREE.MeshPhongMaterial({
    map,
    bumpMap: bump,
    bumpScale: 0.045,
    specularMap: spec,
    specular: new THREE.Color(0x333333),
    shininess: 12
  });
  const earth = new THREE.Mesh(geometry, material);
  scene.add(earth);

  // Лёгкая атмосферная "дымка"
  const atmoMat = new THREE.MeshBasicMaterial({
    color: 0x60a5fa,
    transparent: true,
    opacity: 0.12,
    side: THREE.BackSide
  });
  const atmo = new THREE.Mesh(new THREE.SphereGeometry(EARTH_RADIUS * 1.03, 96, 96), atmoMat);
  scene.add(atmo);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.rotateSpeed = 0.55;
  controls.enablePan = false;
  controls.minDistance = 2.2;
  controls.maxDistance = 6.5;
  controls.enableZoom = true;

  const resize = () => {
    if (!rootEl.value) return;
    const { width, height } = rootEl.value.getBoundingClientRect();
    const w = Math.max(1, Math.floor(width));
    const h = Math.max(1, Math.floor(height));
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  };

  resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(rootEl.value);
  resize();

  const render = () => {
    controls.update();
    renderer.render(scene, camera);
    rafId = requestAnimationFrame(render);
  };
  render();
});

onUnmounted(() => {
  if (resizeObserver && rootEl.value) resizeObserver.unobserve(rootEl.value);
  resizeObserver?.disconnect?.();
  resizeObserver = null;
  disposeScene();
});
</script>

<style scoped>
.earth-canvas-root {
  width: 100%;
  height: 100%;
  min-height: 360px;
  border-radius: 22px;
  overflow: hidden;
  position: relative;
}

.earth-loading {
  position: absolute;
  left: 14px;
  right: 14px;
  bottom: 14px;
  z-index: 2;
  padding: 10px 12px;
  border-radius: 14px;
  background: linear-gradient(165deg, rgba(36, 48, 71, 0.92) 0%, rgba(15, 23, 42, 0.96) 100%);
  box-shadow:
    0 16px 46px rgba(0, 0, 0, 0.55),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  color: #e2e8f0;
  pointer-events: none;
}

.earth-loading__row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
}

.earth-loading__label {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.earth-loading__value {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 700;
}

.earth-loading__bar {
  height: 8px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(148, 163, 184, 0.16);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.earth-loading__fill {
  height: 100%;
  width: 0%;
  border-radius: 999px;
  background: linear-gradient(90deg, #3b82f6 0%, #22c55e 45%, #fbbf24 100%);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.25);
  transition: width 240ms ease;
}

.earth-loading__eta {
  margin-top: 8px;
  font-size: 11px;
  color: #94a3b8;
  font-weight: 600;
}

.earth-canvas-root :deep(canvas) {
  width: 100%;
  height: 100%;
  display: block;
  outline: none;
}
</style>

