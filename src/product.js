import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const SOURCES = ['1.jpg', '1侧.jpg', '1背.jpg', '1接缝.jpg'];
const TAU = Math.PI * 2;

export async function loadProduct(path = '../outputs/composite-primer.glb') {
  const gltf = await new GLTFLoader().loadAsync(new URL(path, import.meta.url).href);
  return gltf.scene.children[0];
}

// Approximate cylindrical reprojection of the four supplied rendered views.
// Keep the source pixels: no invented label text or performance claims.
async function makeLabelTexture(sources) {
  const images = await Promise.all(sources.map(file => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`无法读取包装图：${file}`));
    image.src = new URL(`../效果图/${file}`, import.meta.url).href;
  })));
  const sourcePixels = images.map(image => {
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    context.drawImage(image, 0, 0);
    return { data: context.getImageData(0, 0, canvas.width, canvas.height).data, width: canvas.width, height: canvas.height };
  });
  const canvas = document.createElement('canvas');
  canvas.width = 3072;
  canvas.height = 1024;
  const context = canvas.getContext('2d');
  const output = context.createImageData(canvas.width, canvas.height);
  function sample(source, angle, row, channel) {
    const top = 0.352 + 0.014 * Math.cos(angle);
    const bottom = 0.880 + 0.025 * Math.cos(angle);
    const radius = 0.302 * (1 - row) + 0.278 * row;
    const x = Math.round((0.525 + radius * Math.sin(angle)) * source.width);
    const y = Math.round((top + (bottom - top) * row) * source.height);
    return source.data[(Math.max(0, Math.min(source.height - 1, y)) * source.width + Math.max(0, Math.min(source.width - 1, x))) * 4 + channel];
  }
  for (let x = 0; x < canvas.width; x++) {
    const theta = x / canvas.width * TAU;
    const nearest = Math.round(theta / (Math.PI / 2));
    const delta = theta - nearest * Math.PI / 2;
    const first = (nearest + 4) % 4;
    const second = (nearest + (delta > 0 ? 1 : -1) + 4) % 4;
    const otherDelta = delta - (delta > 0 ? Math.PI / 2 : -Math.PI / 2);
    const blend = THREE.MathUtils.smoothstep(Math.abs(delta), 0.68, Math.PI / 4) * 0.5;
    for (let y = 0; y < canvas.height; y++) {
      const offset = (y * canvas.width + x) * 4;
      for (let c = 0; c < 3; c++) output.data[offset + c] = Math.round(sample(sourcePixels[first], delta, y / (canvas.height - 1), c) * (1 - blend) + sample(sourcePixels[second], otherDelta, y / (canvas.height - 1), c) * blend);
      output.data[offset + 3] = 255;
    }
  }
  context.putImageData(output, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.anisotropy = 8;
  return texture;
}

export async function createProduct({ sources = SOURCES, lidColor = '#14683c', name = 'Jolywon_Composite_Bonding_Primer_Sample' } = {}) {
  const group = new THREE.Group();
  group.name = name;
  group.userData = { description: '外观示意：根据四面包装图近似还原，尺寸与包装版本待确认', sourceFiles: sources };
  const black = new THREE.MeshStandardMaterial({ color: '#151b17', roughness: 0.29, metalness: 0.12 });
  const green = new THREE.MeshStandardMaterial({ color: lidColor, roughness: 0.36, metalness: 0.08 });
  const wire = new THREE.MeshStandardMaterial({ color: '#c8cec2', roughness: 0.3, metalness: 0.7 });
  function add(geometry, material, name, y = 0) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    mesh.position.y = y;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
  }
  add(new THREE.CylinderGeometry(1.035, 0.934, 2.67, 96), black, 'Bucket_body', 0);
  const label = new THREE.MeshStandardMaterial({ map: await makeLabelTexture(sources), roughness: 0.55, metalness: 0.02 });
  add(new THREE.CylinderGeometry(1.018, 0.943, 1.95, 192, 1, true), label, 'Packaging_label', -0.27);
  for (const [y, radius, height] of [[-1.30, 0.95, 0.06], [0.87, 1.052, 0.095], [1.065, 1.045, 0.052], [1.23, 1.058, 0.05]]) {
    add(new THREE.CylinderGeometry(radius, radius, height, 96), black, 'Bucket_rim', y);
  }
  add(new THREE.CylinderGeometry(1.092, 1.103, 0.22, 96), green, 'Green_lid', 1.41);
  add(new THREE.CylinderGeometry(1.107, 1.107, 0.055, 96), green, 'Lid_lip', 1.32);
  for (const y of [1.43, 1.50]) add(new THREE.CylinderGeometry(1.094, 1.094, 0.015, 96), green, 'Lid_detail', y);
  const topRing = add(new THREE.TorusGeometry(0.96, 0.018, 8, 96), green, 'Lid_top_ring', 1.525);
  topRing.rotation.x = Math.PI / 2;
  // Lowered handle follows the source reference. The unseen bottom is schematic.
  const points = [];
  for (let i = 0; i <= 48; i++) {
    const angle = Math.PI * i / 48;
    points.push(new THREE.Vector3(-1.08 * Math.cos(angle), 0.85 - 1.45 * Math.sin(angle), 0.18 + 0.74 * Math.sin(angle)));
  }
  add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 64, 0.018, 8, false), wire, 'Lowered_metal_handle');
  for (const x of [-1.04, 1.04]) {
    const hinge = add(new THREE.SphereGeometry(0.055, 16, 12), black, 'Handle_hinge', 0.85);
    hinge.position.set(x, 0.85, 0.18);
  }
  return group;
}
