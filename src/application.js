import { createApplicationDemo } from './application-demo.js';
import { createStage } from './stage.js';

const host = document.querySelector('#application-viewer');
const status = document.querySelector('#application-status');
const play = document.querySelector('#application-play');
const steps = [...document.querySelectorAll('[data-application-step]')];
const labels = ['光滑基面示意', '滚涂拉毛示意', '毛糙表面示意'];
try {
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-label', '滚涂拉毛的三维用途示意');
  const { renderer, scene, camera, pedestal } = createStage(canvas);
  pedestal.visible = false;
  const demo = createApplicationDemo();
  scene.add(demo.group);
  host.prepend(canvas);
  let playing = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  let visible = false;
  let anchor = performance.now();
  let progress = 0;
  function render() {
    const step = demo.animate(progress);
    steps.forEach((button, i) => button.setAttribute('aria-pressed', String(step === i)));
    if (status.textContent !== labels[step]) status.textContent = labels[step];
    renderer.render(scene, camera);
    play.textContent = playing ? '暂停示意' : '播放示意';
    play.setAttribute('aria-pressed', String(playing));
  }
  new ResizeObserver(() => {
    renderer.setSize(host.clientWidth, host.clientHeight);
    camera.aspect = host.clientWidth / host.clientHeight;
    camera.position.set(3.1, 1.4, Math.max(6.8, 5.5 / camera.aspect));
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    render();
  }).observe(host);
  new IntersectionObserver(entries => visible = entries[0].isIntersecting).observe(host);
  steps.forEach((button, i) => button.addEventListener('click', () => {
    playing = false;
    progress = [0, 0.5, 1][i];
    render();
  }));
  play.addEventListener('click', () => {
    playing = !playing;
    anchor = performance.now() - progress * 9000;
    render();
  });
  renderer.setAnimationLoop(() => {
    if (playing && visible) {
      progress = ((performance.now() - anchor) % 11000) / 9000;
      progress = Math.min(progress, 1);
      render();
    }
  });
  window.applicationSample = { ready: true, getState: () => ({ playing, progress, meshes: demo.group.children.length }) };
} catch (error) {
  console.error(error);
  status.textContent = '三维示意暂不可用，请查看背标说明。';
  play.disabled = true;
  steps.forEach(button => button.disabled = true);
}
