import * as THREE from 'three';

// A schematic roller and surface: no jobsite, thickness, mix ratio or timing claims.
export function createApplicationDemo() {
  const group = new THREE.Group();
  group.name = 'Schematic_roller_application';
  const concrete = new THREE.MeshStandardMaterial({ color: '#c0c6b9', roughness: 0.95 });
  const frameMaterial = new THREE.MeshStandardMaterial({ color: '#828e7a', metalness: 0.35, roughness: 0.6 });
  const metal = new THREE.MeshStandardMaterial({ color: '#b6beb1', metalness: 0.75, roughness: 0.28 });
  const paint = new THREE.MeshStandardMaterial({ color: '#dfd6b5', roughness: 0.94 });
  const wall = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.6, 0.15), concrete);
  wall.receiveShadow = true;
  wall.castShadow = true;
  group.add(wall);
  for (const x of [-1.65, 1.65]) {
    const side = new THREE.Mesh(new THREE.BoxGeometry(0.07, 2.72, 0.18), frameMaterial);
    side.position.x = x;
    group.add(side);
  }
  // The raised dots are abstract surface texture, not measured roughness.
  const dotGeometry = new THREE.SphereGeometry(0.018, 5, 4);
  const patches = [];
  for (let column = 0; column < 3; column++) {
    const strip = new THREE.Group();
    strip.position.set(-0.76 + column * 0.76, 0, 0.09);
    const coating = new THREE.Mesh(new THREE.PlaneGeometry(0.71, 2.18), paint);
    strip.add(coating);
    const dots = new THREE.InstancedMesh(dotGeometry, paint, 210);
    const matrix = new THREE.Matrix4();
    for (let i = 0; i < 210; i++) {
      const row = Math.floor(i / 14);
      const jitter = Math.sin(i * 17.13) * 0.009;
      matrix.makeTranslation((i % 14 - 6.5) * 0.049 + jitter, (row - 7) * 0.142 + jitter, 0.012);
      dots.setMatrixAt(i, matrix);
    }
    strip.add(dots);
    group.add(strip);
    patches.push(strip);
  }
  const roller = new THREE.Group();
  const head = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.105, 0.69, 24), new THREE.MeshStandardMaterial({ color: '#efe8d4', roughness: 0.85 }));
  head.rotation.z = Math.PI / 2;
  head.position.z = 0.20;
  head.castShadow = true;
  roller.add(head);
  const frame = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.34, 0, 0.2), new THREE.Vector3(0.45, 0, 0.2),
    new THREE.Vector3(0.54, -0.23, 0.4), new THREE.Vector3(0.24, -0.58, 0.7)
  ]), 24, 0.024, 8, false), metal);
  roller.add(frame);
  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.075, 0.40, 16), new THREE.MeshStandardMaterial({ color: '#254c3a', roughness: 0.7 }));
  grip.position.set(0.20, -0.76, 0.75);
  grip.rotation.z = -0.12;
  roller.add(grip);
  group.add(roller);

  function animate(progress) {
    const p = THREE.MathUtils.clamp(progress, 0, 1);
    const lane = Math.min(2, Math.floor(p * 3));
    const local = p === 1 ? 1 : p * 3 - lane;
    for (let i = 0; i < patches.length; i++) {
      const amount = i < lane ? 1 : i === lane ? local : 0;
      patches[i].visible = amount > 0.001;
      patches[i].scale.y = Math.max(0.001, amount);
      patches[i].position.y = (1 - amount) * 1.09;
    }
    roller.position.set(-0.76 + lane * 0.76, 1.09 - local * 2.18, 0.08);
    head.rotation.x = local * Math.PI * 10;
    roller.visible = p > 0.02 && p < 0.98;
    return p < 0.05 ? 0 : p > 0.95 ? 2 : 1;
  }
  animate(0);
  return { group, animate };
}
