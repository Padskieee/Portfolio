import React, { useEffect, useRef } from "react";
import { FLUID_GRID, subscribeFluid } from "./fluidSim";

function uploadFluidTex(gl, tex) {
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    FLUID_GRID.width,
    FLUID_GRID.height,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    FLUID_GRID.data
  );
}

function makeFluidTex(gl) {
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  uploadFluidTex(gl, tex);
  return tex;
}

function compileProgram(gl, vertSrc, fragSrc) {
  const compile = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };
  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, vertSrc));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fragSrc));
  gl.linkProgram(prog);
  return prog;
}

/**
 * Thicker global refractive fluid sheen (without circular dots).
 * Produces a bold 3D liquid caustic/wake trail across dark & orange surfaces.
 */
export function FluidTrailOverlay() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (reduced || !fine) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: true });
    if (!gl) return;

    const vertSrc = `#version 300 es
      in vec2 aPos;
      out vec2 vUv;
      void main() {
        vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5);
        gl_Position = vec4(aPos, 0.0, 1.0);
      }
    `;

    const fragSrc = `#version 300 es
      precision highp float;
      in vec2 vUv;
      uniform sampler2D uFluid;
      out vec4 outColor;

      void main() {
        vec2 texel = vec2(1.0 / ${FLUID_GRID.width}.0, 1.0 / ${FLUID_GRID.height}.0);
        vec4 f = texture(uFluid, vUv);
        float dL = texture(uFluid, vUv - vec2(texel.x, 0.0)).b;
        float dR = texture(uFluid, vUv + vec2(texel.x, 0.0)).b;
        float dD = texture(uFluid, vUv - vec2(0.0, texel.y)).b;
        float dU = texture(uFluid, vUv + vec2(0.0, texel.y)).b;

        vec2 grad = vec2(dR - dL, dU - dD);
        float slope = dot(normalize(vec3(grad * 8.5, 1.0)), normalize(vec3(-0.55, -0.55, 0.75)));
        float rim = clamp(length(grad) * 4.2, 0.0, 1.0);

        // Deep liquid shadow trough + subtle crisp highlight ridge (like reference recording)
        float shadowDepth = clamp(f.b * 0.32 + rim * 0.30, 0.0, 0.56);
        float highlight = clamp(pow(max(slope, 0.0), 4.0) * rim * 0.24, 0.0, 0.16);
        vec3 col = mix(vec3(0.0, 0.0, 0.0), vec3(0.92, 0.92, 0.95), highlight / max(shadowDepth, 0.001));
        float alpha = clamp(shadowDepth + highlight, 0.0, 0.58);
        outColor = vec4(col * alpha, alpha);
      }
    `;

    const prog = compileProgram(gl, vertSrc, fragSrc);
    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );
    const fluidTex = makeFluidTex(gl);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const unsub = subscribeFluid(() => {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, quad);
      const aPos = gl.getAttribLocation(prog, "aPos");
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      gl.activeTexture(gl.TEXTURE0);
      uploadFluidTex(gl, fluidTex);
      gl.uniform1i(gl.getUniformLocation(prog, "uFluid"), 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    });

    return () => {
      unsub();
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 55,
      }}
    />
  );
}

/**
 * WebGL2 Hero Display Title ("Ifadah Aulia") matching portfolio's MonaSemi typography
 * with thick real-time fluid liquid distortion.
 */
export function FluidHeroTitleCanvas({ leftText = "Ifadah", rightText = "Aulia" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: true });
    if (!gl) return;

    const vertSrc = `#version 300 es
      in vec2 aPos;
      out vec2 vUv;
      void main() {
        vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5);
        gl_Position = vec4(aPos, 0.0, 1.0);
      }
    `;

    const fragSrc = `#version 300 es
      precision highp float;
      in vec2 vUv;
      uniform sampler2D uText;
      uniform sampler2D uFluid;
      uniform vec4 uRect;
      out vec4 outColor;

      void main() {
        vec2 screenUv = vec2(
          uRect.x + vUv.x * uRect.z,
          uRect.y + vUv.y * uRect.w
        );
        vec4 f = texture(uFluid, clamp(screenUv, 0.0, 1.0));
        vec2 vel = (f.rg - 0.5) * 2.0;

        // Crisp liquid displacement on Landing Page "Ifadah Aulia" title (zero blur)
        vec2 dispUv = vUv - vel * vec2(0.036, 0.14);
        outColor = texture(uText, clamp(dispUv, 0.0, 1.0));
      }
    `;

    const prog = compileProgram(gl, vertSrc, fragSrc);
    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    const textTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, textTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const fluidTex = makeFluidTex(gl);

    const offscreen = document.createElement("canvas");
    const octx = offscreen.getContext("2d");

    const drawTextTexture = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width < 10 || rect.height < 10) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.floor(rect.width * dpr);
      const h = Math.floor(rect.height * dpr);

      canvas.width = w;
      canvas.height = h;
      offscreen.width = w;
      offscreen.height = h;

      octx.clearRect(0, 0, w, h);
      const parentStyle = window.getComputedStyle(canvas.parentElement);
      const fontSize = parseFloat(parentStyle.fontSize) * dpr;

      octx.fillStyle = "#ffffff";
      octx.textBaseline = "alphabetic";
      // Leave generous headroom above ascenders so nothing clips at y=0
      const baselineY = h * 0.84;

      octx.font = `700 ${fontSize}px "Barlow Condensed", "Arial Narrow", sans-serif`;
      octx.textAlign = "left";
      octx.fillText(leftText, 0, baselineY);

      octx.font = `700 ${fontSize}px "Barlow Condensed", "Arial Narrow", sans-serif`;
      octx.textAlign = "right";
      octx.fillText(rightText, w, baselineY);

      gl.bindTexture(gl.TEXTURE_2D, textTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, offscreen);
    };

    drawTextTexture();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(drawTextTexture);
    }

    const ro = new ResizeObserver(drawTextTexture);
    ro.observe(canvas);

    let wasVisible = true;
    const unsub = subscribeFluid(() => {
      const r = canvas.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) {
        if (wasVisible) {
          gl.viewport(0, 0, canvas.width, canvas.height);
          gl.clearColor(0, 0, 0, 0);
          gl.clear(gl.COLOR_BUFFER_BIT);
          wasVisible = false;
        }
        return;
      }
      wasVisible = true;

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, quad);
      const aPos = gl.getAttribLocation(prog, "aPos");
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, textTex);
      gl.uniform1i(gl.getUniformLocation(prog, "uText"), 0);

      gl.activeTexture(gl.TEXTURE1);
      uploadFluidTex(gl, fluidTex);
      gl.uniform1i(gl.getUniformLocation(prog, "uFluid"), 1);

      gl.uniform4f(
        gl.getUniformLocation(prog, "uRect"),
        r.left / Math.max(1, window.innerWidth),
        r.top / Math.max(1, window.innerHeight),
        r.width / Math.max(1, window.innerWidth),
        r.height / Math.max(1, window.innerHeight)
      );

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    });

    return () => {
      unsub();
      ro.disconnect();
    };
  }, [leftText, rightText]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}

/**
 * WebGL2 Liquid Portrait Canvas for Hero -> About zoom.
 * Preserves the portfolio's rich dark-and-warm tone while adding thick liquid ripples.
 */
export function FluidPortraitCanvas({ src, className = "" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", { alpha: false, antialias: true });
    if (!gl) return;

    const vertSrc = `#version 300 es
      in vec2 aPos;
      out vec2 vUv;
      void main() {
        vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5);
        gl_Position = vec4(aPos, 0.0, 1.0);
      }
    `;

    const fragSrc = `#version 300 es
      precision highp float;
      in vec2 vUv;
      uniform sampler2D uTex;
      uniform sampler2D uFluid;
      uniform vec4 uRect;
      uniform float uTime;
      uniform float uImgAspect;
      uniform float uBoxAspect;
      out vec4 outColor;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      void main() {
        vec2 uv = vUv;
        if (uBoxAspect > uImgAspect) {
          float s = uImgAspect / uBoxAspect;
          uv.y = (uv.y - 0.18) * s + 0.18;
        } else {
          float s = uBoxAspect / uImgAspect;
          uv.x = (uv.x - 0.5) * s + 0.5;
        }

        vec2 screenUv = clamp(
          vec2(uRect.x + vUv.x * uRect.z, uRect.y + vUv.y * uRect.w),
          0.0,
          1.0
        );
        vec4 f = texture(uFluid, screenUv);
        vec2 vel = (f.rg - 0.5) * 2.0;

        vec2 dispUv = clamp(uv - vel * 0.032, 0.0, 1.0);
        vec4 texel = texture(uTex, dispUv);

        // Crisp HD portrait with subtle shadow depth on cursor movement (no heavy grain/blur)
        float shade = (vel.x + vel.y) * 0.12;
        float grain = (hash(vUv * 1024.0 + fract(uTime)) - 0.5) * 0.014;
        vec3 col = clamp(texel.rgb * 0.96 + shade + grain, 0.0, 1.0);

        outColor = vec4(col, 1.0);
      }
    `;

    const prog = compileProgram(gl, vertSrc, fragSrc);
    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([16, 16, 16, 255])
    );

    let imgAspect = 0.8;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgAspect = img.width / Math.max(1, img.height);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    };
    img.src = src;

    const fluidTex = makeFluidTex(gl);

    // Keep backing resolution HD (~1400-1800px) so zooming up to full-bleed stays razor-sharp!
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const aspect = Math.max(0.5, rect.height / Math.max(1, rect.width));
      const targetW = Math.min(2048, Math.max(1200, Math.floor(window.innerWidth * 1.15)));
      const targetH = Math.min(2048, Math.floor(targetW * aspect));
      canvas.width = targetW;
      canvas.height = targetH;
    };
    resize();
    window.addEventListener("resize", resize);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const unsub = subscribeFluid((now) => {
      const r = canvas.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, quad);
      const aPos = gl.getAttribLocation(prog, "aPos");
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.uniform1i(gl.getUniformLocation(prog, "uTex"), 0);

      gl.activeTexture(gl.TEXTURE1);
      uploadFluidTex(gl, fluidTex);
      gl.uniform1i(gl.getUniformLocation(prog, "uFluid"), 1);

      gl.uniform4f(
        gl.getUniformLocation(prog, "uRect"),
        r.left / Math.max(1, window.innerWidth),
        r.top / Math.max(1, window.innerHeight),
        r.width / Math.max(1, window.innerWidth),
        r.height / Math.max(1, window.innerHeight)
      );
      gl.uniform1f(gl.getUniformLocation(prog, "uTime"), now * 0.001);
      gl.uniform1f(gl.getUniformLocation(prog, "uImgAspect"), imgAspect);
      gl.uniform1f(
        gl.getUniformLocation(prog, "uBoxAspect"),
        canvas.width / Math.max(1, canvas.height)
      );
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    });

      return () => {
      unsub();
      ro.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, [src]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}

/**
 * WebGL2 Projects Preview Canvas (Dark portfolio theme).
 * - Renders ONLY the floating centered preview image with center-outward radial
 *   spread animation + subtle liquid ripple when hovering any project row.
 * - Uses canvas.getBoundingClientRect() (uCanvasRect) so coordinates stay 100%
 *   locked to the viewport at all scroll positions.
 */
export function FluidProjectsStageCanvas({
  listWrapRef,
  allImageSrcs,
  activeImageSrc,
}) {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    gl: null,
    emptyTex: null,
    texCache: new Map(),
    texA: null,
    texB: null,
    aspectA: 0.8,
    aspectB: 0.8,
    hasPrev: 0,
    progress: 0,
    vis: 0,
    targetVis: 0,
    seed: 1.0,
    lastTime: 0,
    currentSrc: "",
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const listWrap = listWrapRef.current;
    if (!canvas || !listWrap) return;

    const gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: true });
    if (!gl) return;

    const vertSrc = `#version 300 es
      in vec2 aPos;
      out vec2 vUv;
      void main() {
        vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5);
        gl_Position = vec4(aPos, 0.0, 1.0);
      }
    `;

    const fragSrc = `#version 300 es
      precision highp float;
      in vec2 vUv;
      uniform sampler2D uTexA;
      uniform sampler2D uTexB;
      uniform sampler2D uFluid;
      uniform vec2 uViewport;
      uniform vec4 uCanvasRect;
      uniform vec4 uListRect;
      uniform vec4 uPreviewRect;
      uniform float uAspectA;
      uniform float uAspectB;
      uniform float uProgress;
      uniform float uVis;
      uniform float uHasPrev;
      uniform float uSeed;
      uniform float uTime;
      uniform float uShowPreview;
      out vec4 outColor;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
          mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
          u.y
        );
      }

      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        for (int i = 0; i < 4; i++) {
          v += a * noise(p);
          p *= 2.02;
          a *= 0.5;
        }
        return v;
      }

      vec2 coverUv(vec2 uv, float imgA, float boxA) {
        if (boxA > imgA) {
          float s = imgA / boxA;
          return vec2(uv.x, (uv.y - 0.5) * s + 0.5);
        } else {
          float s = boxA / imgA;
          return vec2((uv.x - 0.5) * s + 0.5, uv.y);
        }
      }

      void main() {
        vec2 screenPx = uCanvasRect.xy + vUv * uCanvasRect.zw;
        vec2 screenUv = clamp(screenPx / max(uViewport, vec2(1.0)), 0.0, 1.0);

        vec4 f = texture(uFluid, screenUv);
        vec2 vel = (f.rg - 0.5) * 2.0;

        vec2 displacedImgPx = screenPx - vel * 20.0;
        vec2 pUv = (displacedImgPx - uPreviewRect.xy) / max(uPreviewRect.zw, vec2(1.0));

        if (uShowPreview > 0.5 && uVis > 0.005 && pUv.x >= 0.0 && pUv.x <= 1.0 && pUv.y >= 0.0 && pUv.y <= 1.0) {
          float boxA = uPreviewRect.z / max(uPreviewRect.w, 1.0);

          // Smooth gentle ease-out over ~1.5s
          float t = clamp(uProgress, 0.0, 1.0);
          float eased = 1.0 - pow(1.0 - t, 2.6);

          // Gentle liquid scale-settle from center
          vec2 settledUv = (pUv - 0.5) / mix(0.92, 1.0, eased) + 0.5;

          // Subtle organic liquid ripple during transition
          vec2 waveOffset = vec2(
            sin(pUv.y * 8.0 + uSeed) * (1.0 - eased) * 0.025,
            cos(pUv.x * 8.0 - uSeed) * (1.0 - eased) * 0.025
          );

          vec2 uvA = clamp(coverUv(pUv, uAspectA, boxA), 0.0, 1.0);
          vec2 uvB = clamp(coverUv(settledUv + waveOffset, uAspectB, boxA), 0.0, 1.0);

          vec4 colA = texture(uTexA, uvA);
          vec4 colB = texture(uTexB, uvB);

          // Soft cloudy organic ink-blot reveal expanding slowly from center (0.5, 0.5)
          vec2 centered = (pUv - 0.5) * vec2(boxA, 1.0);
          float d = length(centered);
          float n = (fbm(centered * 3.6 + vec2(uSeed, -uSeed * 0.7)) - 0.5) * 0.34;
          float maxR = length(vec2(boxA * 0.5, 0.5)) + 0.24;
          float r = mix(-0.22, maxR, eased);

          // Smooth feathered watercolor/liquid boundary (no harsh binary cutout)
          float mask = 1.0 - smoothstep(r - 0.18, r + 0.18, d + n);

          float grain = (hash(pUv * 420.0 + fract(uTime * 0.5)) - 0.5) * 0.024;

          if (uHasPrev > 0.5) {
            vec4 blended = mix(colA, colB, mask);
            blended.rgb = clamp(blended.rgb + grain, 0.0, 1.0);
            blended.a = uVis;
            outColor = blended;
            return;
          } else {
            float alpha = mask * uVis;
            vec3 col = clamp(colB.rgb + grain, 0.0, 1.0);
            outColor = vec4(col, alpha);
            return;
          }
        }

        outColor = vec4(0.0);
      }
    `;

    const prog = compileProgram(gl, vertSrc, fragSrc);
    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    const makeTex = (r = 16, g = 16, b = 16, a = 255) => {
      const t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        1,
        1,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        new Uint8Array([r, g, b, a])
      );
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return t;
    };

    const st = stateRef.current;
    st.gl = gl;
    st.emptyTex = makeTex(12, 12, 12, 0);
    st.texA = st.emptyTex;
    st.texB = st.emptyTex;
    const fluidTex = makeFluidTex(gl);

    (allImageSrcs || []).forEach((src) => {
      if (!src || st.texCache.has(src)) return;
      const entry = { tex: makeTex(16, 16, 16, 255), aspect: 0.8, ready: false };
      st.texCache.set(src, entry);
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        entry.aspect = img.width / Math.max(1, img.height);
        entry.ready = true;
        gl.bindTexture(gl.TEXTURE_2D, entry.tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        if (st.currentSrc === src) {
          st.aspectB = entry.aspect;
        }
      };
      img.src = src;
    });

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(2, Math.floor(window.innerWidth * dpr));
      canvas.height = Math.max(2, Math.floor(window.innerHeight * dpr));
    };
    resize();
    window.addEventListener("resize", resize);

    let wasVisible = true;
    const unsub = subscribeFluid((now) => {
      const dt = st.lastTime
        ? Math.min(0.05, Math.max(0.004, (now - st.lastTime) * 0.001))
        : 0.016;
      st.lastTime = now;

      const wrapRect = listWrap.getBoundingClientRect();
      if (st.vis <= 0.005 && st.targetVis <= 0.5) {
        if (wasVisible) {
          gl.viewport(0, 0, canvas.width, canvas.height);
          gl.clearColor(0, 0, 0, 0);
          gl.clear(gl.COLOR_BUFFER_BIT);
          wasVisible = false;
        }
        return;
      }
      wasVisible = true;

      // Slower, super-smooth ~1.55s center-outward cloud reveal
      if (st.targetVis > 0.5 && st.progress < 1) {
        st.progress = Math.min(1, st.progress + dt * 0.65);
      }
      st.vis += (st.targetVis - st.vis) * Math.min(1, dt * 5.5);
      if (st.targetVis < 0.5 && st.vis < 0.01) {
        st.vis = 0;
        st.hasPrev = 0;
        st.texA = st.emptyTex;
      }

      const cRect = canvas.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const showPreview = vw > 900 ? 1.0 : 0.0;
      const previewH = Math.max(280, Math.min(440, vh * 0.51));
      const previewW = previewH * 0.80;
      const previewLeft = (vw - previewW) * 0.5;
      const previewTop = (vh - previewH) * 0.5;

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, quad);
      const aPos = gl.getAttribLocation(prog, "aPos");
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, st.texA);
      gl.uniform1i(gl.getUniformLocation(prog, "uTexA"), 0);

      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, st.texB);
      gl.uniform1i(gl.getUniformLocation(prog, "uTexB"), 1);

      gl.activeTexture(gl.TEXTURE2);
      uploadFluidTex(gl, fluidTex);
      gl.uniform1i(gl.getUniformLocation(prog, "uFluid"), 2);

      gl.uniform2f(gl.getUniformLocation(prog, "uViewport"), vw, vh);
      gl.uniform4f(
        gl.getUniformLocation(prog, "uCanvasRect"),
        cRect.left,
        cRect.top,
        cRect.width,
        cRect.height
      );
      gl.uniform4f(
        gl.getUniformLocation(prog, "uListRect"),
        wrapRect.left,
        wrapRect.top,
        wrapRect.width,
        wrapRect.height
      );
      gl.uniform4f(
        gl.getUniformLocation(prog, "uPreviewRect"),
        previewLeft,
        previewTop,
        previewW,
        previewH
      );
      gl.uniform1f(gl.getUniformLocation(prog, "uAspectA"), st.aspectA);
      gl.uniform1f(gl.getUniformLocation(prog, "uAspectB"), st.aspectB);
      gl.uniform1f(gl.getUniformLocation(prog, "uProgress"), st.progress);
      gl.uniform1f(gl.getUniformLocation(prog, "uVis"), st.vis);
      gl.uniform1f(gl.getUniformLocation(prog, "uHasPrev"), st.hasPrev);
      gl.uniform1f(gl.getUniformLocation(prog, "uSeed"), st.seed);
      gl.uniform1f(gl.getUniformLocation(prog, "uTime"), now * 0.001);
      gl.uniform1f(gl.getUniformLocation(prog, "uShowPreview"), showPreview);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    });

    return () => {
      unsub();
      window.removeEventListener("resize", resize);
    };
  }, [listWrapRef]);

  useEffect(() => {
    const st = stateRef.current;
    if (!st.gl) return;

    if (!activeImageSrc) {
      st.currentSrc = "";
      st.targetVis = 0;
      return;
    }

    if (activeImageSrc === st.currentSrc && st.targetVis > 0.5) return;

    const wasShowing = st.vis > 0.12 && st.texB !== st.emptyTex;
    if (wasShowing) {
      st.texA = st.texB;
      st.aspectA = st.aspectB;
      st.hasPrev = 1;
    } else {
      st.texA = st.emptyTex;
      st.hasPrev = 0;
    }

    st.currentSrc = activeImageSrc;
    st.seed = Math.random() * 12.0;
    st.progress = 0;
    st.targetVis = 1;

    const cached = st.texCache.get(activeImageSrc);
    if (cached) {
      st.texB = cached.tex;
      st.aspectB = cached.aspect;
    }
  }, [activeImageSrc]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100svh",
        pointerEvents: "none",
        zIndex: 8,
        display: "block",
      }}
    />
  );
}
