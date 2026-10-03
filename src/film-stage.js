import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { createStage } from './stage.js';

export function roundedSlab(width, height, depth, radius = 0.04) {
  const x = -width / 2, y = -height / 2;
  const shape = new THREE.Shape();
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 3, steps: 1, curveSegments: 6 });
  geometry.translate(0, 0, -depth / 2);
  return geometry;
}

// Procedural material grain only; source packaging pixels remain unchanged.
export function grainTexture(seed = 11, contrast = 0.5) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 512;
  const context = canvas.getContext('2d');
  const pixels = context.createImageData(512, 512);
  function noise(x, y) {
    const ix = Math.floor(x), iy = Math.floor(y);
    const fx = x - ix, fy = y - iy;
    const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    const hash = (a, b) => {
      let value = Math.imul(a + seed, 374761393) ^ Math.imul(b, 668265263);
      value = Math.imul(value ^ (value >>> 13), 1274126177);
      return ((value ^ (value >>> 16)) >>> 0) / 4294967296;
    };
    return THREE.MathUtils.lerp(THREE.MathUtils.lerp(hash(ix, iy), hash(ix+1, iy), sx), THREE.MathUtils.lerp(hash(ix, iy+1), hash(ix+1, iy+1), sx), sy);
  }
  for (let i = 0; i < pixels.data.length; i += 4) {
    const x = (i / 4) % 512, y = Math.floor(i / 2048);
    const value = 170 + ((noise(x/4, y/4) - 0.5) * 90 + (noise(x/17, y/17) - 0.5) * 50) * contrast;
    pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = value;
    pixels.data[i + 3] = 255;
  }
  context.putImageData(pixels, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 8;
  return texture;
}

function lathe(points) {
  return new THREE.LatheGeometry(points.map(([radius, y]) => new THREE.Vector2(radius, y)), 128);
}

export function createFilmStage(canvas) {
  const stage = createStage(canvas);
  const { renderer, scene, pedestal } = stage;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.type = THREE.VSMShadowMap;
  const lights = scene.children.filter(node => node.isLight);
  lights[0].intensity = 0.45;
  lights[1].intensity = 1.85;
  lights[1].position.set(-3.2, 8, 4.8);
  lights[1].shadow.mapSize.set(1024, 1024);
  lights[1].shadow.radius = 4;
  lights[1].shadow.blurSamples = 8;
  lights[1].shadow.normalBias = 0.014;
  lights[1].shadow.bias = -0.00015;
  lights[1].shadow.camera.left = lights[1].shadow.camera.bottom = -3.7;
  lights[1].shadow.camera.right = lights[1].shadow.camera.top = 3.7;
  lights[2].intensity = 0.75;
  lights[3].intensity = 0.3;
  scene.children.find(node => node.isMesh && node.material.isShadowMaterial).material.opacity = 0.075;

  const environment = new RoomEnvironment();
  const reflection = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 3, 3) }));
  reflection.position.set(-3.4, 2.3, 4.4);
  reflection.lookAt(0, 0, 0);
  environment.add(reflection);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(environment, 0.035).texture;
  scene.environmentIntensity = 0.62;
  scene.environmentRotation.set(0, -0.28, 0);
  environment.dispose();
  pmrem.dispose();

  RectAreaLightUniformsLib.init();
  for (const [color, intensity, width, height, position] of [
    ['#fff5e7', 2.5, 3.5, 5, [-3.2, 3, 4]],
    ['#f0f7ff', 1.4, 2, 4, [3.5, 2.5, -2]],
  ]) {
    const softbox = new THREE.RectAreaLight(color, intensity, width, height);
    softbox.position.set(...position);
    softbox.lookAt(0, 0, 0);
    scene.add(softbox);
  }
  pedestal.geometry.dispose();
  pedestal.geometry = lathe([[0, -0.07], [1.46, -0.07], [1.51, -0.035], [1.51, 0.025], [1.47, 0.065], [0, 0.065]]);
  pedestal.material = new THREE.MeshPhysicalMaterial({ color: '#d9dcd0', roughness: 0.58, metalness: 0, clearcoat: 0.15, clearcoatRoughness: 0.45 });

  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = shadowCanvas.height = 256;
  const context = shadowCanvas.getContext('2d');
  const gradient = context.createRadialGradient(128, 128, 35, 128, 128, 125);
  gradient.addColorStop(0, '#24362b70');
  gradient.addColorStop(0.46, '#24362b33');
  gradient.addColorStop(1, '#24362b00');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 256, 256);
  const contactShadow = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 4.5), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(shadowCanvas), transparent: true, depthWrite: false }));
  contactShadow.rotation.x = -Math.PI / 2;
  contactShadow.position.y = -1.475;
  scene.add(contactShadow);
  return { ...stage, contactShadow };
}

export function refineFilmProduct(product, renderer, lidColor = '#075b35') {
  const plasticGrain = grainTexture(31, 0.2);
  plasticGrain.repeat.set(5, 3);
  const black = new THREE.MeshPhysicalMaterial({ color: '#101714', roughness: 0.3, metalness: 0, clearcoat: 0.3, clearcoatRoughness: 0.22, bumpMap: plasticGrain, bumpScale: 0.0015 });
  const green = new THREE.MeshPhysicalMaterial({ color: lidColor, roughness: 0.28, metalness: 0, clearcoat: 0.4, clearcoatRoughness: 0.2, bumpMap: plasticGrain, bumpScale: 0.001 });
  const metal = new THREE.MeshStandardMaterial({ color: '#d8dedb', roughness: 0.18, metalness: 1, envMapIntensity: 1.6 });
  product.traverse(mesh => {
    if (!mesh.isMesh) return;
    if (mesh.name === 'Packaging_label') {
      const map = mesh.material.map;
      map.anisotropy = renderer.capabilities.getMaxAnisotropy();
      mesh.material = new THREE.MeshPhysicalMaterial({ map, color: '#d0d0d0', roughness: 0.46, metalness: 0, clearcoat: 0.12, clearcoatRoughness: 0.36, envMapIntensity: 0.5 });
    } else if (mesh.name === 'Lowered_metal_handle') {
      mesh.material = metal;
    } else if (/Lid|lid/.test(mesh.name)) {
      mesh.material = green;
    } else {
      mesh.material = black;
    }
    if (mesh.name === 'Green_lid') {
      mesh.geometry = lathe([[0, -0.11], [1.073, -0.11], [1.099, -0.10], [1.106, -0.072], [1.093, 0.065], [1.074, 0.108], [1.05, 0.12], [0.97, 0.12], [0.945, 0.095], [0, 0.095]]);
    } else if (/Bucket_rim|Lid_lip/.test(mesh.name)) {
      mesh.geometry.computeBoundingBox();
      const bounds = mesh.geometry.boundingBox;
      const radius = bounds.max.x, half = (bounds.max.y - bounds.min.y) / 2;
      const edge = Math.min(0.012, half * 0.4);
      mesh.geometry = lathe([[0, -half], [radius-edge, -half], [radius, -half+edge], [radius, half-edge], [radius-edge, half], [0, half]]);
    }
  });
}
