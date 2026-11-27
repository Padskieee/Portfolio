/**
 * Shared 2D Fluid Velocity & Wake Simulation (128x72 grid).
 * Drives all WebGL2 distortion canvases (Hero title, Portrait, Projects stage)
 * so mouse ripples feel unified, organic, and responsive across the page.
 */

const W = 128;
const H = 72;
const SIZE = W * H;

let vx = new Float32Array(SIZE);
let vy = new Float32Array(SIZE);
let vxNext = new Float32Array(SIZE);
let vyNext = new Float32Array(SIZE);
let dens = new Float32Array(SIZE);
let densNext = new Float32Array(SIZE);

const rgbaBuffer = new Uint8Array(SIZE * 4);
// Initialize neutral (128, 128, 0, 255)
for (let i = 0; i < SIZE; i++) {
  const p = i * 4;
  rgbaBuffer[p] = 128;
  rgbaBuffer[p + 1] = 128;
  rgbaBuffer[p + 2] = 0;
  rgbaBuffer[p + 3] = 255;
}

let initialized = false;
let refCount = 0;
let rafId = null;
let lastFrameTime = 0;
let listeners = new Set();

let prevMx = 0.5;
let prevMy = 0.5;
let hasPointer = false;

function splat(nx, ny, dx, dy) {
  const cx = nx * W;
  const cy = ny * H;
  const rad = 11.0;
  const rad2 = rad * rad;
  const ixMin = Math.max(1, Math.floor(cx - rad));
  const ixMax = Math.min(W - 2, Math.ceil(cx + rad));
  const iyMin = Math.max(1, Math.floor(cy - rad));
  const iyMax = Math.min(H - 2, Math.ceil(cy + rad));

  const fx = Math.max(-1.1, Math.min(1.1, dx * 28));
  const fy = Math.max(-1.1, Math.min(1.1, dy * 28));
  const speed = Math.min(1.0, Math.hypot(dx, dy) * 24);

  for (let y = iyMin; y <= iyMax; y++) {
    for (let x = ixMin; x <= ixMax; x++) {
      const d2 = (x - cx) * (x - cx) + (y - cy) * (y - cy);
      if (d2 < rad2) {
        const w = Math.exp(-d2 / (rad2 * 0.42));
        const i = y * W + x;
        vx[i] = Math.max(-1.2, Math.min(1.2, vx[i] + fx * w * 0.58));
        vy[i] = Math.max(-1.2, Math.min(1.2, vy[i] + fy * w * 0.58));
        dens[i] = Math.min(1.0, dens[i] + speed * w * 0.65);
      }
    }
  }
}

function onPointerMove(e) {
  const nx = e.clientX / Math.max(1, window.innerWidth);
  const ny = e.clientY / Math.max(1, window.innerHeight);
  if (!hasPointer) {
    prevMx = nx;
    prevMy = ny;
    hasPointer = true;
    return;
  }
  const dx = nx - prevMx;
  const dy = ny - prevMy;
  prevMx = nx;
  prevMy = ny;
  splat(nx, ny, dx, dy);
}

function stepSim(now) {
  rafId = requestAnimationFrame(stepSim);
  if (now - lastFrameTime < 14) return; // cap ~60-70fps
  lastFrameTime = now;

  // Advect + diffuse + decay
  for (let y = 1; y < H - 1; y++) {
    const row = y * W;
    for (let x = 1; x < W - 1; x++) {
      const i = row + x;

      // Semi-Lagrangian backtrace
      const bx = Math.max(1, Math.min(W - 2, x - vx[i] * 1.4));
      const by = Math.max(1, Math.min(H - 2, y - vy[i] * 1.4));
      const x0 = Math.floor(bx);
      const y0 = Math.floor(by);
      const tx = bx - x0;
      const ty = by - y0;

      const i00 = y0 * W + x0;
      const i10 = i00 + 1;
      const i01 = i00 + W;
      const i11 = i01 + 1;

      const avx =
        (vx[i00] * (1 - tx) + vx[i10] * tx) * (1 - ty) +
        (vx[i01] * (1 - tx) + vx[i11] * tx) * ty;
      const avy =
        (vy[i00] * (1 - tx) + vy[i10] * tx) * (1 - ty) +
        (vy[i01] * (1 - tx) + vy[i11] * tx) * ty;
      const ad =
        (dens[i00] * (1 - tx) + dens[i10] * tx) * (1 - ty) +
        (dens[i01] * (1 - tx) + dens[i11] * tx) * ty;

      // Smooth 4-neighbor diffusion for silky gliding motion
      const svx =
        avx * 0.50 + (vx[i - 1] + vx[i + 1] + vx[i - W] + vx[i + W]) * 0.125;
      const svy =
        avy * 0.50 + (vy[i - 1] + vy[i + 1] + vy[i - W] + vy[i + W]) * 0.125;
      const sd =
        ad * 0.56 +
        (dens[i - 1] + dens[i + 1] + dens[i - W] + dens[i + W]) * 0.11;

      vxNext[i] = svx * 0.962;
      vyNext[i] = svy * 0.962;
      densNext[i] = sd * 0.96;
    }
  }

  let tmp = vx;
  vx = vxNext;
  vxNext = tmp;
  tmp = vy;
  vy = vyNext;
  vyNext = tmp;
  tmp = dens;
  dens = densNext;
  densNext = tmp;

  for (let i = 0; i < SIZE; i++) {
    const p = i * 4;
    rgbaBuffer[p] = Math.max(0, Math.min(255, Math.round(128 + vx[i] * 110)));
    rgbaBuffer[p + 1] = Math.max(0, Math.min(255, Math.round(128 + vy[i] * 110)));
    rgbaBuffer[p + 2] = Math.max(0, Math.min(255, Math.round(dens[i] * 255)));
    rgbaBuffer[p + 3] = 255;
  }

  listeners.forEach((fn) => fn(now));
}

export function subscribeFluid(cb) {
  if (!initialized) {
    initialized = true;
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    rafId = requestAnimationFrame(stepSim);
  }
  refCount++;
  listeners.add(cb);

  return () => {
    listeners.delete(cb);
    refCount--;
    if (refCount <= 0) {
      refCount = 0;
      initialized = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
      window.removeEventListener("pointermove", onPointerMove);
    }
  };
}

export const FLUID_GRID = {
  width: W,
  height: H,
  data: rgbaBuffer,
};
