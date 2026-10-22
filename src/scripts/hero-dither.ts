import { ditherPixel } from "./dither";

const MIN_PIXEL_SIZE = 4;
const MAX_COLUMNS = 480;
const FRAME_INTERVAL_MS = 1000 / 24;

export function mountHeroDither(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let width = 0;
  let height = 0;
  let image: ImageData;
  let pixels: Uint32Array;
  let visible = true;
  let rafId = 0;
  let lastFrame = 0;
  const start = performance.now();

  let pixelSize = MIN_PIXEL_SIZE;

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    pixelSize = Math.max(MIN_PIXEL_SIZE, Math.ceil(rect.width / MAX_COLUMNS));
    width = Math.max(1, Math.ceil(rect.width / pixelSize));
    height = Math.max(1, Math.ceil(rect.height / pixelSize));
    canvas.width = width;
    canvas.height = height;
    image = ctx.createImageData(width, height);
    pixels = new Uint32Array(image.data.buffer);
    draw(performance.now());
  };

  const draw = (now: number) => {
    if (!pixels) return;
    const t = reducedMotion.matches ? 8 : (now - start) / 1000;
    const aspect = width / height;
    const narrow = width * pixelSize < 720;
    const glowX = narrow ? 0.65 : 0.74;
    const glowY = 0.45;
    const glowStrength = narrow ? 0.6 : 1;

    for (let y = 0; y < height; y++) {
      const v = y / height;
      const fade = v > 0.62 ? Math.max(0, 1 - (v - 0.62) / 0.38) : 1;
      const py = v * 3;

      for (let x = 0; x < width; x++) {
        const u = x / width;
        const px = u * 3 * aspect * 0.55;

        const qx = px + 0.7 * Math.sin(py * 1.7 + t * 0.35);
        const qy = py + 0.7 * Math.cos(px * 1.3 - t * 0.28);
        let n =
          Math.sin(qx * 1.9 + t * 0.22) +
          Math.sin(qy * 2.3 - t * 0.18) +
          Math.sin((qx + qy) * 1.1 + t * 0.12);
        n = n / 6 + 0.5;
        n *= n;

        const dx = (u - glowX) * aspect * 0.6;
        const dy = v - glowY;
        const glow = Math.exp(-(dx * dx + dy * dy) / 0.2) * glowStrength;
        const value = n * 0.42 + glow * (0.3 + n * 0.5);

        pixels[y * width + x] = ditherPixel(value * fade, x, y);
      }
    }

    ctx.putImageData(image, 0, 0);
  };

  const loop = (now: number) => {
    rafId = requestAnimationFrame(loop);
    if (now - lastFrame < FRAME_INTERVAL_MS) return;
    lastFrame = now;
    draw(now);
  };

  const syncLoop = () => {
    cancelAnimationFrame(rafId);
    rafId = 0;
    if (visible && !document.hidden && !reducedMotion.matches) {
      rafId = requestAnimationFrame(loop);
    } else {
      draw(performance.now());
    }
  };

  new ResizeObserver(resize).observe(canvas);

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    syncLoop();
  }).observe(canvas);

  document.addEventListener("visibilitychange", syncLoop);
  reducedMotion.addEventListener("change", syncLoop);
}
