import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { loadProduct } from './product.js';
import { createStage } from './stage.js';
import { createFilmStage, refineFilmProduct } from './film-stage.js';

const host = document.querySelector('#viewer');
const loading = document.querySelector('#loading');
const fallback = document.querySelector('#fallback');
const buttons = [...document.querySelectorAll('.viewer-toolbar button')];
buttons.forEach(button => button.disabled = true);

async function init() {
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-label', `可旋转的${window.currentProduct?.name || '复合拉毛背胶'}三维模型`);
  canvas.tabIndex = 0;
  const { renderer, scene, camera } = window.currentProduct ? createFilmStage(canvas) : createStage(canvas);
  const product = await loadProduct(window.currentProduct?.model);
  if (window.currentProduct) refineFilmProduct(product, renderer, window.currentProduct.lidColor);
  scene.add(product);
  host.append(canvas);
  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 0.02, 0);
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.autoRotateSpeed = 1.4;
  controls.minPolarAngle = Math.PI * 0.25;
  controls.maxPolarAngle = Math.PI * 0.58;
  let homeDistance;
  let moving = false;
  let transition = null;

  function resize() {
    const width = host.clientWidth;
    const height = host.clientHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    homeDistance = Math.max(7.7, 5.1 / camera.aspect);
    controls.minDistance = homeDistance * 0.84;
    controls.maxDistance = homeDistance * 1.5;
    camera.updateProjectionMatrix();
  }
  function stopRotation() {
    controls.autoRotate = false;
    document.querySelector('#rotate').setAttribute('aria-pressed', 'false');
  }
  function markView(index) {
    document.querySelectorAll('[data-view]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.view) === index)));
  }
  function setView(index, animate = true) {
    stopRotation();
    moving = false;
    const angle = index * Math.PI / 2;
    const end = new THREE.Vector3(Math.sin(angle) * homeDistance, 2.0, Math.cos(angle) * homeDistance);
    transition = animate && !matchMedia('(prefers-reduced-motion: reduce)').matches ? { start: camera.position.clone(), end, time: performance.now() } : null;
    if (!transition) { camera.position.copy(end); controls.update(); }
    markView(index);
  }
  resize();
  setView(0, false);
  controls.saveState();
  const observer = new ResizeObserver(() => { resize(); if (!moving && !controls.autoRotate) setView(0, false); });
  observer.observe(host);
  document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => setView(Number(button.dataset.view))));
  document.querySelector('#reset').addEventListener('click', () => { controls.reset(); setView(0); });
  document.querySelector('#rotate').addEventListener('click', event => {
    transition = null;
    controls.autoRotate = !controls.autoRotate;
    event.currentTarget.setAttribute('aria-pressed', String(controls.autoRotate));
    if (controls.autoRotate) markView(-1);
  });
  controls.addEventListener('start', () => { transition = null; moving = true; stopRotation(); markView(-1); });
  canvas.addEventListener('keydown', event => {
    if (event.key === 'Home') { setView(0); event.preventDefault(); }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      const angle = Math.atan2(camera.position.x, camera.position.z) + (event.key === 'ArrowLeft' ? -1 : 1) * Math.PI / 12;
      const radius = Math.hypot(camera.position.x, camera.position.z);
      camera.position.x = Math.sin(angle) * radius;
      camera.position.z = Math.cos(angle) * radius;
      transition = null;
      stopRotation(); markView(-1); controls.update(); event.preventDefault();
    }
  });
  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    if (transition) {
      const progress = Math.min((performance.now() - transition.time) / 650, 1);
      // Spherical interpolation avoids travelling through the model for back views.
      const from = Math.atan2(transition.start.x, transition.start.z);
      let difference = Math.atan2(transition.end.x, transition.end.z) - from;
      difference = Math.atan2(Math.sin(difference), Math.cos(difference));
      const eased = progress * progress * (3 - 2 * progress);
      const angle = from + difference * eased;
      const distance = THREE.MathUtils.lerp(Math.hypot(transition.start.x, transition.start.z), homeDistance, eased);
      camera.position.set(Math.sin(angle) * distance, THREE.MathUtils.lerp(transition.start.y, 2, eased), Math.cos(angle) * distance);
      if (progress === 1) transition = null;
    }
    controls.update(clock.getDelta());
    renderer.render(scene, camera);
  });
  fallback.hidden = true;
  loading.hidden = true;
  buttons.forEach(button => button.disabled = false);
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault(); fallback.hidden = false; canvas.hidden = true;
    loading.textContent = '3D 展台暂不可用，可继续查看下方包装原图。'; loading.hidden = false;
    buttons.forEach(button => button.disabled = true);
  });
  // Local production and verification bridge; it adds no controls to the public page.
  window.sample = {
    ready: true,
    getState: () => ({ productId: window.currentProduct?.id || 'P14', modelSources: product.userData.sourceFiles, camera: camera.position.toArray(), autoRotate: controls.autoRotate, meshes: product.children.length, width: host.clientWidth, height: host.clientHeight }),
    exportGLB: async () => {
      const buffer = await new GLTFExporter().parseAsync(product, { binary: true, maxTextureSize: 3072 });
      const bytes = new Uint8Array(buffer);
      let binary = '';
      for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
      return btoa(binary);
    }
  };
}

init().catch(error => {
  console.error(error);
  loading.textContent = '3D 展台暂不可用，可继续查看下方包装原图。';
  fallback.hidden = false;
});
