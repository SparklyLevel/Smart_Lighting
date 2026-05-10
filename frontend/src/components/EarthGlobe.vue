<template>
  <div ref="rootEl" class="earth-canvas-root"></div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue';
import Globe from 'globe.gl';
import earthNight8kTexture from '../assets/textures/earth-night-8k.jpg';

const props = defineProps({
  autoRotate: {
    type: Boolean,
    default: true
  },
  lightIntensity: {
    type: Number,
    default: 0.7
  }
});

const rootEl = ref(null);
let globeInstance = null;
let resizeObserver = null;

const GLOBE_IMAGE_URL = earthNight8kTexture;
const BUMP_IMAGE_URL = '//unpkg.com/three-globe/example/img/earth-topology.png';
const BACKGROUND_IMAGE_URL = '//unpkg.com/three-globe/example/img/night-sky.png';

function syncSize() {
  if (!rootEl.value || !globeInstance) return;
  const { width, height } = rootEl.value.getBoundingClientRect();
  globeInstance.width(Math.max(1, Math.floor(width)));
  globeInstance.height(Math.max(1, Math.floor(height)));
}

function destroyGlobe() {
  if (globeInstance?.pauseAnimation) {
    globeInstance.pauseAnimation();
  }
  const canvas = rootEl.value?.querySelector?.('canvas');
  if (canvas) canvas.remove();
  globeInstance = null;
}

onMounted(() => {
  if (!rootEl.value) return;

  globeInstance = Globe()(rootEl.value)
    .globeImageUrl(GLOBE_IMAGE_URL)
    .bumpImageUrl(BUMP_IMAGE_URL)
    .backgroundImageUrl(BACKGROUND_IMAGE_URL)
    .backgroundColor('rgba(0,0,0,0)')
    .showAtmosphere(false);

  const globeMaterial = globeInstance.globeMaterial();
  globeMaterial.color.set('#0b1120');
  globeMaterial.emissive.set('#ffffff');
  globeMaterial.emissiveMap = globeMaterial.map;
  globeMaterial.emissiveIntensity = props.lightIntensity;
  globeMaterial.shininess = 0.3;

  const controls = globeInstance.controls();
  controls.enablePan = false;
  controls.autoRotate = props.autoRotate;
  controls.autoRotateSpeed = 0.5;
  controls.minDistance = 140;
  controls.maxDistance = 380;

  const scene = globeInstance.scene();
  scene.traverse((node) => {
    if (!node?.isLight) return;
    if (node.type === 'AmbientLight') {
      node.intensity = 0.08;
      return;
    }
    node.intensity = Math.min(node.intensity ?? 0.2, 0.22);
  });

  syncSize();
  resizeObserver = new ResizeObserver(syncSize);
  resizeObserver.observe(rootEl.value);
});

watch(
  () => props.autoRotate,
  (enabled) => {
    if (!globeInstance) return;
    globeInstance.controls().autoRotate = enabled;
  }
);

watch(
  () => props.lightIntensity,
  (intensity) => {
    if (!globeInstance) return;
    globeInstance.globeMaterial().emissiveIntensity = intensity;
  }
);

onUnmounted(() => {
  if (resizeObserver && rootEl.value) {
    resizeObserver.unobserve(rootEl.value);
  }
  resizeObserver?.disconnect?.();
  resizeObserver = null;
  destroyGlobe();
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

.earth-canvas-root :deep(canvas) {
  width: 100%;
  height: 100%;
  display: block;
  outline: none;
}
</style>

