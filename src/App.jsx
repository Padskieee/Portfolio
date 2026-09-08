import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  Mail,
  Compass,
  PenTool,
  Layers,
  Waypoints,
  Gauge,
  Users,
  Menu,
  X,
} from "lucide-react";
const asset = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');

    .portfolio-root {
      --background: #0b0b0c;
      --foreground: #f3f3f2;
      --card: #17171a;
      --primary: #b9b9bd;
      --accent: #e4e4e6;
      --muted-foreground: #9a9a9f;
      --secondary: #201f22;
      --border: rgba(210, 210, 214, 0.14);
      background: var(--background);
      color: var(--foreground);
      font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
      scroll-behavior: smooth;
      position: relative;
      min-height: 100vh;
      overflow-x: hidden;
    }
    .portfolio-root .font-display {
      font-family: 'Space Grotesk', ui-sans-serif, sans-serif;
    }
    .reveal {
      opacity: 0;
      transform: translateY(24px) skewY(var(--scroll-skew, 0deg));
      transition: opacity 0.7s ease, transform 0.7s ease;
    }
    .reveal.in-view {
      opacity: 1;
      transform: translateY(0) skewY(var(--scroll-skew, 0deg));
    }
    .typing-caret {
      display: inline-block;
      width: 0.075em;
      min-width: 3px;
      height: 0.82em;
      margin-left: 0.1em;
      background: var(--primary);
      vertical-align: -0.04em;
      box-shadow: 0 0 14px rgba(228, 228, 230, 0.7);
      animation: typing-blink 0.72s steps(1) infinite;
    }
    @keyframes typing-blink { 50% { opacity: 0; } }
    .about-grid, .projects-grid, .skills-grid, .contact-card {
      transform: skewY(var(--scroll-skew, 0deg));
      transition: transform 420ms cubic-bezier(.23,1,.32,1);
    }
    [data-scroll-direction="up"] .about-grid,
    [data-scroll-direction="up"] .projects-grid,
    [data-scroll-direction="up"] .skills-grid,
    [data-scroll-direction="up"] .contact-card {
      filter: saturate(1.08);
    }
    .grad-text {
      background: linear-gradient(90deg, var(--primary), var(--accent), var(--primary));
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }
  `}</style>
);

/* ---------------------------------------------------------
   Hook: fade/slide up on scroll into view
--------------------------------------------------------- */
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold, rootMargin: "0px 0px -10% 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

/* ---------------------------------------------------------
   ScrambleText — decode/glitch text reveal (ported from
   the "SpecialText" component, without the motion/react
   dependency which isn't available in this environment).
   Random characters resolve left-to-right into the real text.

   MOBILE FIX: the wrapping span now forces `white-space: nowrap`
   so the line never re-wraps mid-animation (the old behaviour
   let the randomly-sized scramble characters flip the text
   between 1 and 2 lines every frame, which read as "berantakan").
   The width fluctuation this causes is absorbed by centering the
   text and shrinking the hero font with clamp() (see HeroSection),
   so the line always has room to breathe on small screens.
--------------------------------------------------------- */
function useOriginalScrollMotion() {
  useEffect(() => {
    let previous = window.scrollY;
    let skew = 0;
    let target = 0;
    let frame = 0;

    const render = () => {
      skew += (target - skew) * 0.12;
      document.documentElement.style.setProperty(
        "--scroll-skew",
        `${skew.toFixed(2)}deg`,
      );
      target *= 0.86;
      frame = requestAnimationFrame(render);
    };

    const onScroll = () => {
      const delta = window.scrollY - previous;
      previous = window.scrollY;
      document.documentElement.dataset.scrollDirection =
        delta >= 0 ? "down" : "up";
      target = Math.max(-1.1, Math.min(1.1, delta * -0.03));
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    frame = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);
}

function TypingText({
  children,
  texts,
  speed = 82,
  delay = 0,
  className = "",
  style,
}) {
  const labels = texts || [String(children)];
  const [index, setIndex] = useState(0);
  const [count, setCount] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const current = labels[index % labels.length];

  useEffect(() => {
    const isComplete = count >= current.length;
    const isEmpty = count === 0 && deleting;
    const wait =
      !deleting && isComplete
        ? 1900
        : isEmpty
          ? 420
          : deleting
            ? Math.max(32, Math.round(speed * 0.52))
            : speed;
    const initialDelay = count === 0 && !deleting ? delay : 0;

    const timer = window.setTimeout(() => {
      if (!deleting && isComplete) setDeleting(true);
      else if (deleting && isEmpty) {
        setDeleting(false);
        setIndex((previous) => (previous + 1) % labels.length);
      } else {
        setCount((previous) =>
          Math.max(0, previous + (deleting ? -1 : 1)),
        );
      }
    }, initialDelay + wait);

    return () => window.clearTimeout(timer);
  }, [count, current, deleting, delay, labels.length, speed]);

  return (
    <span
      className={className}
      role="status"
      aria-live="polite"
      style={{ display: "inline-block", whiteSpace: "nowrap", ...style }}
    >
      {current.slice(0, count)}
      <span className="typing-caret" aria-hidden="true" />
    </span>
  );
}

/* ---------------------------------------------------------
   GLSL Hills — animated noise-displaced terrain (Three.js)
--------------------------------------------------------- */
function GLSLHills({ className, cameraZ = 125, planeSize = 200, speed = 0.5 }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const effectivePlaneSize = window.innerWidth < 640 ? Math.round(planeSize * 0.6) : planeSize;

    let frameId = 0;

    class Plane {
      constructor() {
        this.uniforms = { time: { type: "f", value: 0 } };
        this.mesh = this.createMesh();
        this.time = speed;
      }
      createMesh() {
        return new THREE.Mesh(
          new THREE.PlaneGeometry(effectivePlaneSize, effectivePlaneSize, effectivePlaneSize, effectivePlaneSize),
          new THREE.RawShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: `
              #define GLSLIFY 1
              attribute vec3 position;
              uniform mat4 projectionMatrix;
              uniform mat4 modelViewMatrix;
              uniform float time;
              varying vec3 vPosition;

              mat4 rotateMatrixX(float radian) {
                return mat4(
                  1.0, 0.0, 0.0, 0.0,
                  0.0, cos(radian), -sin(radian), 0.0,
                  0.0, sin(radian), cos(radian), 0.0,
                  0.0, 0.0, 0.0, 1.0
                );
              }

              vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
              vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
              vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
              vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
              vec3 fade(vec3 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }

              float cnoise(vec3 P) {
                vec3 Pi0 = floor(P);
                vec3 Pi1 = Pi0 + vec3(1.0);
                Pi0 = mod289(Pi0);
                Pi1 = mod289(Pi1);
                vec3 Pf0 = fract(P);
                vec3 Pf1 = Pf0 - vec3(1.0);
                vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
                vec4 iy = vec4(Pi0.yy, Pi1.yy);
                vec4 iz0 = Pi0.zzzz;
                vec4 iz1 = Pi1.zzzz;

                vec4 ixy = permute(permute(ix) + iy);
                vec4 ixy0 = permute(ixy + iz0);
                vec4 ixy1 = permute(ixy + iz1);

                vec4 gx0 = ixy0 * (1.0 / 7.0);
                vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
                gx0 = fract(gx0);
                vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
                vec4 sz0 = step(gz0, vec4(0.0));
                gx0 -= sz0 * (step(0.0, gx0) - 0.5);
                gy0 -= sz0 * (step(0.0, gy0) - 0.5);

                vec4 gx1 = ixy1 * (1.0 / 7.0);
                vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
                gx1 = fract(gx1);
                vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
                vec4 sz1 = step(gz1, vec4(0.0));
                gx1 -= sz1 * (step(0.0, gx1) - 0.5);
                gy1 -= sz1 * (step(0.0, gy1) - 0.5);

                vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
                vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
                vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
                vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
                vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
                vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
                vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
                vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

                vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
                g000 *= norm0.x;
                g010 *= norm0.y;
                g100 *= norm0.z;
                g110 *= norm0.w;
                vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
                g001 *= norm1.x;
                g011 *= norm1.y;
                g101 *= norm1.z;
                g111 *= norm1.w;

                float n000 = dot(g000, Pf0);
                float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
                float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
                float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
                float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
                float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
                float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
                float n111 = dot(g111, Pf1);

                vec3 fade_xyz = fade(Pf0);
                vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
                vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
                float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
                return 2.2 * n_xyz;
              }

              void main(void) {
                vec3 updatePosition = (rotateMatrixX(radians(90.0)) * vec4(position, 1.0)).xyz;
                float sin1 = sin(radians(updatePosition.x / 128.0 * 90.0));
                vec3 noisePosition = updatePosition + vec3(0.0, 0.0, time * -30.0);
                float noise1 = cnoise(noisePosition * 0.08);
                float noise2 = cnoise(noisePosition * 0.06);
                float noise3 = cnoise(noisePosition * 0.4);
                vec3 lastPosition = updatePosition + vec3(0.0,
                  noise1 * sin1 * 8.0
                  + noise2 * sin1 * 8.0
                  + noise3 * (abs(sin1) * 2.0 + 0.5)
                  + pow(sin1, 2.0) * 40.0, 0.0);

                vPosition = lastPosition;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(lastPosition, 1.0);
              }
            `,
            fragmentShader: `
              precision highp float;
              #define GLSLIFY 1
              varying vec3 vPosition;

              void main(void) {
                float opacity = (128.0 - length(vPosition)) / 256.0 * 1.1;
                vec3 color = vec3(0.74, 0.74, 0.76);
                gl_FragColor = vec4(color, opacity);
              }
            `,
            transparent: true,
          })
        );
      }
      render(time) {
        this.uniforms.time.value += time * this.time;
      }
    }

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 1, 10000);
    const clock = new THREE.Clock();
    const plane = new Plane();

    const resize = () => {
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(w, h, false);
    };

    const renderLoop = () => {
      plane.render(clock.getDelta());
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(renderLoop);
    };

    renderer.setClearColor(0x000000, 0);
    camera.position.set(0, 16, cameraZ);
    camera.lookAt(new THREE.Vector3(0, 28, 0));
    scene.add(plane.mesh);

    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();
    renderLoop();

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      plane.mesh.geometry.dispose();
      plane.mesh.material.dispose();
      renderer.dispose();
    };
  }, [cameraZ, planeSize, speed]);

  return (
    <div ref={containerRef} className={className} style={{ position: "absolute", inset: 0 }}>
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}

/* ---------------------------------------------------------
   Kinetic grid — warps toward the pointer, idle ambient sway
--------------------------------------------------------- */
function KineticGrid() {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");

    let spacing = 56;
    const influence = 190;
    const strength = 30;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let points = [];
    let rafId = 0;
    let t = 0;

    const pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999 };

    function buildGrid() {
      width = wrap.clientWidth;
      height = wrap.clientHeight;
      spacing = width < 640 ? 72 : 56;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      cols = Math.ceil(width / spacing) + 2;
      rows = Math.ceil(height / spacing) + 2;
      points = [];
      for (let j = 0; j < rows; j++) {
        const row = [];
        for (let i = 0; i < cols; i++) {
          row.push({ bx: i * spacing, by: j * spacing, x: i * spacing, y: j * spacing, warp: 0 });
        }
        points.push(row);
      }
    }

    function onMove(e) {
      const rect = wrap.getBoundingClientRect();
      pointer.tx = e.clientX - rect.left;
      pointer.ty = e.clientY - rect.top;
    }
    function onTouchMove(e) {
      if (!e.touches || !e.touches.length) return;
      const rect = wrap.getBoundingClientRect();
      pointer.tx = e.touches[0].clientX - rect.left;
      pointer.ty = e.touches[0].clientY - rect.top;
    }
    function onLeave() {
      pointer.tx = -9999;
      pointer.ty = -9999;
    }

    function draw() {
      t += 0.006;
      pointer.x += (pointer.tx - pointer.x) * 0.12;
      pointer.y += (pointer.ty - pointer.y) * 0.12;

      ctx.clearRect(0, 0, width, height);

      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const p = points[j][i];
          const dx = p.bx - pointer.x;
          const dy = p.by - pointer.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          let warp = 0;
          if (dist < influence) {
            warp = 1 - dist / influence;
            warp = warp * warp;
          }
          const angle = Math.atan2(dy, dx);
          const push = warp * strength;
          const idleX = Math.sin(t + p.bx * 0.02 + p.by * 0.01) * 1.1;
          const idleY = Math.cos(t + p.by * 0.02) * 1.1;
          p.x = p.bx - Math.cos(angle) * push + idleX;
          p.y = p.by - Math.sin(angle) * push + idleY;
          p.warp = warp;
        }
      }

      ctx.lineWidth = 1;
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const p = points[j][i];
          const warp = Math.max(p.warp, i < cols - 1 ? points[j][i + 1].warp : 0);
          const lightness = 210 + Math.round(warp * 40);
          const alpha = 0.09 + warp * 0.5;
          ctx.strokeStyle = `rgba(${lightness},${lightness},${lightness + 2},${alpha})`;

          if (i < cols - 1) {
            const pr = points[j][i + 1];
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(pr.x, pr.y);
            ctx.stroke();
          }
          if (j < rows - 1) {
            const pd = points[j + 1][i];
            const warpV = Math.max(p.warp, pd.warp);
            const lightnessV = 210 + Math.round(warpV * 40);
            const alphaV = 0.09 + warpV * 0.5;
            ctx.strokeStyle = `rgba(${lightnessV},${lightnessV},${lightnessV + 2},${alphaV})`;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(pd.x, pd.y);
            ctx.stroke();
          }
        }
      }

      rafId = requestAnimationFrame(draw);
    }

    buildGrid();
    draw();

    wrap.style.pointerEvents = "none";
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onLeave);
    document.addEventListener("mouseleave", onLeave);

    const ro = new ResizeObserver(buildGrid);
    ro.observe(wrap);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onLeave);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        pointerEvents: "none",
        maskImage: "radial-gradient(ellipse 80% 60% at 50% 40%, black 40%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 40%, black 40%, transparent 100%)",
      }}
    >
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0 }} />
    </div>
  );
}

/* ---------------------------------------------------------
   Site nav
--------------------------------------------------------- */
function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 640) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const scrollToSection = (e, href) => {
    e.preventDefault();
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    if (el) {
      const offset = 96;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    } else if (id === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setOpen(false);
  };

  const links = [
    { href: "#about", label: "About" },
    { href: "#projects", label: "Projects" },
    { href: "#skills", label: "Skills" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <header style={{ position: "fixed", insetInline: 0, top: 0, zIndex: 50, display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 16px 0" }}>
      <nav
        style={{
          display: "flex",
          width: "100%",
          maxWidth: 720,
          alignItems: "center",
          justifyContent: "space-between",
          borderRadius: 999,
          padding: "10px 20px",
          transition: "all 0.3s ease",
          border: scrolled || open ? "1px solid var(--border)" : "1px solid transparent",
          background: scrolled || open ? "rgba(10,7,16,0.7)" : "transparent",
          backdropFilter: scrolled || open ? "blur(20px)" : "none",
        }}
      >
        <a href="#top" className="font-display" style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--foreground)", textDecoration: "none" }}>
          Ifadah<span style={{ color: "var(--primary)" }}>'s Portfolio</span></a>
        <ul style={{ display: "flex", alignItems: "center", gap: 4, listStyle: "none", margin: 0, padding: 0 }} className="nav-links">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                style={{ borderRadius: 999, padding: "6px 12px", fontSize: 14, color: "var(--muted-foreground)", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--foreground)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted-foreground)")}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <a
          href="#contact"
          className="nav-cta"
          style={{
            borderRadius: 999,
            background: "var(--primary)",
            padding: "6px 16px",
            fontSize: 14,
            fontWeight: 500,
            color: "#111112",
            textDecoration: "none",
            transition: "opacity 0.2s",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          Let's talk
        </a>
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="nav-toggle"
          style={{
            display: "none",
            width: 34,
            height: 34,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 999,
            border: "1px solid var(--border)",
            background: "transparent",
            color: "var(--foreground)",
            cursor: "pointer",
            padding: 0,
          }}
        >
          {open ? <X size={16} /> : <Menu size={16} />}
        </button>
      </nav>

      {open && (
        <div
          className="nav-mobile-panel"
          style={{
            marginTop: 8,
            width: "100%",
            maxWidth: 720,
            borderRadius: 20,
            border: "1px solid var(--border)",
            background: "rgba(10,7,16,0.92)",
            backdropFilter: "blur(20px)",
            padding: 12,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              style={{ padding: "12px 14px", borderRadius: 12, fontSize: 15, color: "var(--foreground)", textDecoration: "none" }}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={() => setOpen(false)}
            style={{
              marginTop: 4,
              textAlign: "center",
              borderRadius: 999,
              background: "var(--primary)",
              padding: "10px 16px",
              fontWeight: 500,
              color: "#111112",
              textDecoration: "none",
            }}
          >
            Let's talk
          </a>
        </div>
      )}

      <style>{`
        @media (max-width: 639px) {
          .nav-links { display: none !important; }
          .nav-cta { display: none !important; }
          .nav-toggle { display: inline-flex !important; }
        }
      `}</style>
    </header>
  );
}

/* ---------------------------------------------------------
   Hero
--------------------------------------------------------- */
function HeroSection() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const stage = (i) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(24px)",
    transition: `opacity 0.8s ease ${i * 0.15 + 0.1}s, transform 0.8s ease ${i * 0.15 + 0.1}s`,
  });

  return (
    <section
      id="top"
      className="hero-full-height"
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        padding: "0 24px",
        textAlign: "center",
      }}
    >
      <GLSLHills className="hero-hills" />
      <div
        aria-hidden="true"
        style={{
          pointerEvents: "none",
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, rgba(10,7,16,0.2), transparent, var(--background))",
        }}
      />

      <div
        style={{
          ...stage(0),
          marginBottom: 24,
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Sparkles size={16} color="var(--primary)" />
        <span style={{ fontSize: 14, fontWeight: 500, color: "rgba(245,243,249,0.8)" }}>
          Available for freelance & full-time
        </span>
      </div>

      <h1
        className="font-display hero-title"
        style={{
          lineHeight: 1.05,
          letterSpacing: "-0.03em",
          position: "relative",
          zIndex: 1,
          margin: 0,
          maxWidth: "100%",
        }}
      >
        <span style={{ display: "block", fontWeight: 700 }}>
          Designing experiences
        </span>
        <TypingText
          className="grad-text"
          style={{ display: "block", fontWeight: 700 }}
          texts={["that feel alive", "that feel useful", "that feel human"]}
          speed={82}
          delay={0}
        >
          that feel alive
        </TypingText>
      </h1>

      <p
        style={{
          ...stage(2),
          margin: "24px auto 0",
          maxWidth: 560,
          fontSize: 18,
          lineHeight: 1.7,
          color: "var(--muted-foreground)",
          position: "relative",
          zIndex: 1,
        }}
      >
        I'm Ifadah Aulia, passionate about web development, UI/UX, web design, and data processing.
      </p>

      <div
        style={{
          ...stage(3),
          marginTop: 40,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          position: "relative",
          zIndex: 1,
        }}
        className="hero-cta-row"
      >
        <a

        href={asset("images/CV-IFADAH.pdf")}
        download="CV-Ifadah-Aulia.pdf"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            borderRadius: 999,
            background: "var(--primary)",
            padding: "14px 28px",
            fontWeight: 500,
            color: "#111112",
            textDecoration: "none",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          Download CV
          <ArrowRight size={16} />
        </a>
        <a
          href="#contact"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            borderRadius: 999,
            border: "1px solid var(--border)",
            padding: "14px 28px",
            fontWeight: 500,
            color: "var(--foreground)",
            textDecoration: "none",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--secondary)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          Get in touch
        </a>
      </div>

      <style>{`
        .hero-full-height { min-height: 100vh; }
        @supports (height: 100dvh) {
          .hero-full-height { min-height: 100dvh; }
        }
        /*
          MOBILE FIX: font-size now scales continuously with the
          viewport (clamp) instead of jumping straight to a fixed
          44px. Combined with white-space: nowrap on ScrambleText,
          "that feel alive" always fits on a single line on phones,
          so the scramble animation no longer flickers between
          1-line and 2-line layouts.
        */
        .hero-title { font-size: clamp(1.9rem, 9.5vw, 2.75rem); }
        @media (min-width: 480px) { .hero-title { font-size: clamp(2.25rem, 8vw, 2.75rem); } }
        @media (min-width: 768px) { .hero-title { font-size: 72px; } }
        @media (min-width: 1024px) { .hero-title { font-size: 92px; } }
        @media (min-width: 640px) { .hero-cta-row { flex-direction: row; } }
      `}</style>
    </section>
  );
}

/* ---------------------------------------------------------
   About
--------------------------------------------------------- */
function AboutSection() {
  const [ref, inView] = useReveal();

  return (
    <section id="about" style={{ position: "relative", margin: "0 auto", maxWidth: 1000, padding: "112px 24px", scrollMarginTop: 96 }}>
      <div ref={ref} className={`reveal ${inView ? "in-view" : ""} about-grid`}>
        <div>
          <span className="font-display" style={{ fontFamily: "monospace", fontSize: 14, textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--primary)" }}>
            About
          </span>
          <h2 className="font-display" style={{ marginTop: 16, fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.25 }}>
            A fresh graduate who's always chasing the next thing to learn.
          </h2>
          <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 16, lineHeight: 1.7, color: "var(--muted-foreground)" }}>
            <p style={{ margin: 0 }}>
              I'm Ifadah Aulia, a fresh graduate from Brawijaya University (2023–2026). I don't have formal work experience yet, but I've spent that time building things on my own — from personal projects to this very portfolio.
            </p>
            <p style={{ margin: 0 }}>
              My interests sit across web development, UI/UX, web design, and working with data — I enjoy understanding not just how something looks, but how it works underneath and what the data behind it is telling me.
            </p>
            <p style={{ margin: 0 }}>
              What keeps me going is a genuine love for learning. Every project is a chance to pick up a new framework, sharpen my design instincts, or get better at handling data than I was before.
            </p>
          </div>
        </div>

        <div className="about-photo-wrap">
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "4 / 5",
              borderRadius: 20,
              overflow: "hidden",
              border: "1px solid var(--border)",
              background: "var(--secondary)",
            }}
          >
            <img
              src={asset("images/profile.jpg")}
              alt="Ifadah Aulia"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        </div>
      </div>

      <style>{`
        .about-grid { display: grid; gap: 48px; }
        @media (min-width: 768px) { .about-grid { grid-template-columns: 1.4fr 1fr; align-items: start; } }
      `}</style>
    </section>
  );
}

/* ---------------------------------------------------------
   Projects
--------------------------------------------------------- */

const techLogos = {
  React: "react",
  TypeScript: "typescript",
  JavaScript: "javascript",
  HTML: "html5",
  CSS: "css",
  "Tailwind CSS": "tailwindcss",
  Vite: "vite",
  Laravel: "laravel",
  PHP: "php",
  Blade: "laravel",
  MySQL: "mysql",
  Figma: "figma",
  "Chart.js": "chartdotjs",
};

function ProjectCard({ project, i }) {
  const [ref, inView] = useReveal(0.1);
  const hasLink = Boolean(project.url);

  return (
    <article
      ref={ref}
      className={`reveal ${inView ? "in-view" : ""} project-card`}
      style={{
        transitionDelay: `${(i % 2) * 0.1}s`,
        position: "relative",
        overflow: "hidden",
        borderRadius: 24,
        border: "1px solid var(--border)",
        background: "rgba(20,17,29,0.5)",
        backdropFilter: "blur(4px)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor =
          "rgba(210,210,214,0.4)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
      }}
    >
      {hasLink && (
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${project.title} in a new tab`}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
          }}
        />
      )}

      {/* PROJECT IMAGE */}
      <div
        style={{
          position: "relative",
          aspectRatio: "16 / 11",
          overflow: "hidden",
          background: project.gradient,
        }}
      >
        {project.image ? (
          <img
            src={project.image}
            alt={`${project.title} preview`}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              transition: "transform 0.5s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              className="font-display"
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "rgba(255,255,255,0.9)",
              }}
            >
              {project.title}
            </span>
          </div>
        )}

        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, var(--card), rgba(20,17,29,0.05), transparent)",
            pointerEvents: "none",
          }}
        />

        {hasLink && (
          <div
            style={{
              position: "absolute",
              right: 20,
              top: 20,
              zIndex: 1,
              width: 40,
              height: 40,
              borderRadius: 999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(0,0,0,0.35)",
              backdropFilter: "blur(8px)",
              color: "#fff",
            }}
          >
            <ArrowUpRight size={17} />
          </div>
        )}
      </div>

      {/* PROJECT INFO */}
      <div style={{ padding: 24 }}>
        {/* CATEGORY */}
        <p
          style={{
            margin: 0,
            fontFamily: "monospace",
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "var(--primary)",
          }}
        >
          {project.category}
        </p>

        {/* TITLE */}
        <h3
          className="font-display"
          style={{
            margin: "8px 0 0",
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: "-0.01em",
          }}
        >
          {project.title}
        </h3>

        {/* DESCRIPTION */}
        <p
          style={{
            marginTop: 12,
            fontSize: 14,
            lineHeight: 1.7,
            color: "var(--muted-foreground)",
          }}
        >
          {project.description}
        </p>

        {/* TECH STACK */}
        <div style={{ marginTop: 20 }}>
          <p
            style={{
              margin: "0 0 10px",
              fontFamily: "monospace",
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "var(--muted-foreground)",
            }}
          >
            Tech Stack
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            {project.tech?.map((tech) => (
              <img
                key={tech}
                src={`https://cdn.simpleicons.org/${techLogos[tech]}/c9c9ce`}
                alt={tech}
                title={tech}
                style={{
                  width: 20,
                  height: 20,
                  objectFit: "contain",
                  opacity: 0.8,
                  cursor: "default",
                  transition: "transform 0.2s ease, opacity 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.2)";
                  e.currentTarget.style.opacity = "1";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.opacity = "0.8";
                }}
              />
            ))}
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <p
            style={{
              margin: "0 0 8px",
              fontFamily: "monospace",
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "var(--muted-foreground)",
            }}
          >
            Highlights
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            {project.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  color: "var(--foreground)",
                  fontSize: 11,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

function ProjectsSection() {
  const projects = [
    {
      title: "HR-Insight",
      category: "Web Application · HR Analytics & Information System",
      description:
        "A web-based HR analytics and information system designed to manage employee, department, and position data while providing workforce insights through interactive dashboards, data visualization, and reporting features.",
      tech: ["Laravel", "PHP", "MySQL", "Chart.js", "Tailwind CSS"],
      tags: [
        "HR Analytics",
        "Data Visualization",
        "Database Management",
        "Dashboard",
      ],
      image: asset("/images/hr-insight.png"),
      gradient: "linear-gradient(135deg, #0d2941, #24578a)",
      url: "https://hrinsight.infinityfree.io/",
    },

    {
      title: "FinTrack",
      category: "Web Application · Financial Tracking & Analytics",
      description:
        "A financial tracking web application designed to help users monitor income, expenses, and financial activity through organized transaction management, financial summaries, and interactive data visualization.",
      tech: ["React", "JavaScript", "Vite", "Tailwind CSS"],
      tags: [
        "Financial Dashboard",
        "Data Visualization",
        "Transaction Management",
        "Analytics",
      ],
      image: asset("/images/fintrack.png"),
      gradient: "linear-gradient(135deg, #172c24, #3d6b58)",
      url: "https://fintrack-9a93qt4f.manus.space/",
    },

    {
      title: "Arus",
      category: "Web Dashboard · Smart City & Traffic Monitoring",
      description:
        "A traffic monitoring platform designed to visualize and monitor traffic conditions in Medan, helping users understand road activity and congestion through an interactive dashboard interface.",
      tech: ["React", "TypeScript", "Vite"],
      tags: [
        "Dashboard",
        "Traffic Monitoring",
        "Smart City",
      ],
      image: asset("/images/arus.png"),
      gradient: "linear-gradient(135deg, #162020, #345050)",
      url: "https://medan-traffi-akzztqby.manus.space/",
    },

    {
      title: "Ogek Wali",
      category: "Web Application · Public Service Information System",
      description:
        "A web-based public complaint system designed for Sibolga City, allowing citizens to submit and track reports while helping administrators manage complaints, follow-ups, and supporting information.",
      tech: ["Laravel", "PHP", "MySQL"],
      tags: [
        "Information System",
        "Public Service",
        "Database Management",
      ],
      image: asset("/images/ogek-wali.png"),
      gradient: "linear-gradient(135deg, #1c2635, #40516b)",
      url: "https://webpengaduan.site.je/",
    },

    {
      title: "Neon Eclipse",
      category: "Landing Page · Event & Entertainment",
      description:
        "A single-page concert landing site for the fictional festival Neon Eclipse, featuring an artist lineup, interactive audio visualizer, event schedule, and ticket waitlist.",
      tech: ["React", "TypeScript", "Vite"],
      tags: [
        "Interactive UI",
        "Audio Visualizer",
        "Design System",
      ],
      image: asset("/images/neon-eclipse.png"),
      gradient: "linear-gradient(135deg, #1e1e20, #58585e)",
      url: "https://neoneclipse.netlify.app/",
    },

    {
      title: "Island Hopper",
      category: "Web Platform · Travel & Tourism",
      description:
        "A travel platform designed to help users discover island destinations, explore itineraries, plan routes, and organize trips across Indonesia.",
      tech: ["React", "TypeScript", "Vite"],
      tags: [
        "Travel Planning",
        "Interactive UI",
        "Responsive Design",
      ],
      image: asset("/images/island-hopper.png"),
      gradient: "linear-gradient(135deg, #1a1f24, #4b6570)",
      url: "https://island-hopper-zeta.vercel.app/",
    },

    {
      title: "Topup.gg",
      category: "Web Platform · Gaming & E-Commerce",
      description:
        "A modern game top-up website designed to provide a fast and convenient experience for purchasing diamonds, UC, and other in-game currencies.",
      tech: ["React", "Vite", "Tailwind CSS"],
      tags: [
        "E-Commerce",
        "Gaming",
        "Responsive UI",
      ],
      image: asset("/images/topupgg.png"),
      gradient: "linear-gradient(135deg, #242426, #656569)",
      url: "https://topupgg-gamma.vercel.app/",
    },

    {
      title: "Nusantara Catering",
      category: "Business Website · Food & Catering",
      description:
        "A responsive catering website designed to showcase menus, services, and company information while helping users explore available catering options.",
      tech: ["HTML", "CSS", "JavaScript"],
      tags: [
        "Business Website",
        "Responsive Design",
        "UI Development",
      ],
      image: asset("/images/nusantara-catering.png"),
      gradient: "linear-gradient(135deg, #2a211d, #6b5648)",
      url: "https://padskieee.github.io/NusantaraCatering/",
    },

    {
      title: "Taskly",
      category: "UI/UX Design · Productivity Platform",
      description:
        "A productivity and task management platform concept designed to help users organize tasks, manage daily activities, and improve productivity through a clean and intuitive interface.",
      tech: ["Figma"],
      tags: [
        "UI/UX Design",
        "Productivity",
        "Task Management",
      ],
      image: asset("/images/taskly.jpg"),
      gradient: "linear-gradient(135deg, #252530, #4b4b62)",
      url: "https://www.figma.com/design/BkIki1rvK3D11NheGAZkVM/Taskly-Web?node-id=16-34&p=f&t=mPkHvKGzGTygFmwG-0",
    },

    {
      title: "X-ERCISE",
      category: "Mobile App Design · Fitness & Health",
      description:
        "A mobile fitness application concept designed to help users monitor workouts, track physical activities, and maintain a healthier lifestyle through an intuitive user experience.",
      tech: ["Figma"],
      tags: [
        "Mobile App",
        "Fitness",
        "UI/UX Design",
      ],
      image: asset("/images/x-ercise.jpg"),
      gradient: "linear-gradient(135deg, #1c2524, #42635e)",
      url: "https://www.figma.com/design/NzftHeMZVSBzJPad4R4TBN/X-ERCISE?node-id=0-1&p=f&t=jMdzddwje35UrNbi-0",
    },

  ];

  return (
    <section
      id="projects"
      style={{
        position: "relative",
        margin: "0 auto",
        maxWidth: 1152,
        padding: "112px 24px",
        scrollMarginTop: 96,
      }}
    >
      <div
        style={{
          marginBottom: 56,
          maxWidth: 560,
        }}
      >
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 14,
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            color: "var(--primary)",
          }}
        >
          Selected work
        </span>

        <h2
          className="font-display"
          style={{
            marginTop: 16,
            fontSize: 30,
            fontWeight: 700,
            letterSpacing: "-0.02em",
          }}
        >
          Projects I'm proud of
        </h2>

        <p
          style={{
            marginTop: 16,
            lineHeight: 1.7,
            color: "var(--muted-foreground)",
          }}
        >
          A collection of web projects exploring interactive
          experiences, modern interfaces, and practical digital
          solutions.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gap: 24,
        }}
        className="projects-grid"
      >
        {projects.map((project, i) => (
          <ProjectCard
            key={project.title}
            project={project}
            i={i}
          />
        ))}
      </div>

      <style>{`
        @media (min-width: 768px) {
          .projects-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </section>
  );
}

function SkillCard({ skill, i }) {
  const [ref, inView] = useReveal(0.1);
  const Icon = skill.icon;
  return (
    <div
      ref={ref}
      className={`reveal ${inView ? "in-view" : ""}`}
      style={{
        transitionDelay: `${(i % 3) * 0.08}s`,
        borderRadius: 16,
        border: "1px solid var(--border)",
        background: "rgba(20,17,29,0.5)",
        padding: 24,
        backdropFilter: "blur(4px)",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(210,210,214,0.4)")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
    >
      <span style={{ display: "inline-flex", height: 44, width: 44, alignItems: "center", justifyContent: "center", borderRadius: 12, border: "1px solid rgba(210,210,214,0.25)", background: "rgba(210,210,214,0.08)", color: "var(--primary)" }}>
        <Icon size={20} />
      </span>
      <h3 className="font-display" style={{ marginTop: 16, fontSize: 18, fontWeight: 600, letterSpacing: "-0.01em" }}>{skill.title}</h3>
      <p style={{ marginTop: 8, fontSize: 14, lineHeight: 1.7, color: "var(--muted-foreground)" }}>{skill.description}</p>
    </div>
  );
}

function LogoMarquee() {
  const tools = [
    { slug: "github", alt: "GitHub" },
    { slug: "react", alt: "React" },
    { slug: "nextdotjs", alt: "Next.js" },
    { slug: "nuxt", alt: "Nuxt.js" },
    { slug: "vuedotjs", alt: "Vue.js" },
    { slug: "typescript", alt: "TypeScript" },
    { slug: "vite", alt: "Vite" },
    { slug: "tailwindcss", alt: "Tailwind CSS" },
    { slug: "laravel", alt: "Laravel" },
    { slug: "html5", alt: "HTML5" },
    { slug: "css", alt: "CSS3" },
    { slug: "php", alt: "PHP" },
    { slug: "figma", alt: "Figma" },
    { slug: "mysql", alt: "MySQL" },
    { slug: "javascript", alt: "JavaScript" },
    { slug: "git", alt: "Git" },
  ];

  const track = [...tools, ...tools];

  return (
    <div
      className="logo-marquee-container"
      style={{
        position: "relative",
        overflow: "hidden",
        padding: "12px 0",
        maskImage:
          "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
      }}
    >
      <div
        className="logo-marquee-track"
        style={{
          display: "flex",
          width: "max-content",
          gap: 56,
          alignItems: "center",
        }}
      >
        {track.map((tool, i) => (
          <div
            key={`${tool.slug}-${i}`}
            title={tool.alt}
            style={{
              width: 38,
              height: 38,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <img
              src={`https://cdn.simpleicons.org/${tool.slug}/c9c9ce`}
              alt={tool.alt}
              loading="lazy"
              style={{
                width: 32,
                height: 32,
                objectFit: "contain",
                opacity: 0.75,
                transition:
                  "opacity 0.2s ease, transform 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "1";
                e.currentTarget.style.transform = "scale(1.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "0.75";
                e.currentTarget.style.transform = "scale(1)";
              }}
            />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes logoMarqueeScroll {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-50%);
          }
        }

        .logo-marquee-track {
          animation: logoMarqueeScroll 30s linear infinite;
        }

        .logo-marquee-container:hover .logo-marquee-track {
          animation-duration: 10s;
        }
      `}</style>
    </div>
  );
}

function SkillsSection() {
  const skills = [
    { icon: Compass, title: "UX Research", description: "Interviews, usability testing, and synthesis that ground decisions in real needs." },
    { icon: Waypoints, title: "Interaction Design", description: "Flows, states, and micro-interactions that make products feel responsive." },
    { icon: PenTool, title: "Visual Design", description: "Type, color, and layout systems with a strong eye for hierarchy and detail." },
    { icon: Layers, title: "Design Systems", description: "Scalable component libraries and tokens that keep teams consistent." },
    { icon: Gauge, title: "Prototyping", description: "High-fidelity, motion-rich prototypes in Figma, Framer, and code." },
    { icon: Users, title: "Collaboration", description: "Close partnership with engineering and product from kickoff to ship." },
  ];

  return (
    <section id="skills" style={{ position: "relative", margin: "0 auto", maxWidth: 1152, padding: "112px 24px", scrollMarginTop: 96 }}>
      <div style={{ marginBottom: 56, maxWidth: 560 }}>
        <span style={{ fontFamily: "monospace", fontSize: 14, textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--primary)" }}>
          Capabilities
        </span>
        <h2 className="font-display" style={{ marginTop: 16, fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em" }}>
          What I bring to a team
        </h2>
      </div>

      <div style={{ display: "grid", gap: 16 }} className="skills-grid">
        {skills.map((skill, i) => (
          <SkillCard key={skill.title} skill={skill} i={i} />
        ))}
      </div>

      <div style={{ marginTop: 48 }}>
        <p style={{ marginBottom: 20, fontSize: 14, color: "var(--muted-foreground)" }}>Toolbox</p>
        <LogoMarquee />
      </div>

      <style>{`
        @media (min-width: 640px) { .skills-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1024px) { .skills-grid { grid-template-columns: repeat(3, 1fr); } }
      `}</style>
    </section>
  );
}

function ContactSection() {
  const [ref, inView] = useReveal();

  const socials = [
    {
      name: "LinkedIn",
      url: "https://www.linkedin.com/in/ifadah-aulia-muhti-sinaga-15a366289/",
    },
    {
      name: "GitHub",
      url: "https://github.com/Padskieee",
    },
    {
      name: "Instagram",
      url: "https://www.instagram.com/ifadahaulia_/",
    },
  ];

  return (
    <section
      id="contact"
      style={{
        position: "relative",
        margin: "0 auto",
        maxWidth: 860,
        padding: "112px 24px",
        scrollMarginTop: 96,
      }}
    >
      <div
        ref={ref}
        className={`reveal ${inView ? "in-view" : ""}`}
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 24,
          border: "1px solid rgba(210,210,214,0.25)",
          background: "rgba(20,17,29,0.6)",
          padding: "48px 24px",
          textAlign: "center",
          backdropFilter: "blur(10px)",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            pointerEvents: "none",
            position: "absolute",
            insetInline: 0,
            top: -96,
            margin: "0 auto",
            height: 192,
            width: 192,
            borderRadius: "50%",
            background: "rgba(210,210,214,0.15)",
            filter: "blur(64px)",
          }}
        />

        <span
          style={{
            fontFamily: "monospace",
            fontSize: 14,
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            color: "var(--primary)",
          }}
        >
          Contact
        </span>

        <h2
          className="font-display contact-heading"
          style={{
            marginTop: 16,
            fontWeight: 700,
            letterSpacing: "-0.02em",
          }}
        >
          Have a project in mind?
        </h2>

        <p
          style={{
            margin: "16px auto 0",
            maxWidth: 400,
            lineHeight: 1.7,
            color: "var(--muted-foreground)",
          }}
        >
          I'm currently open to new opportunities and collaborations.
          Let's create something people love to use.
        </p>

        <a
          href="https://mail.google.com/mail/?view=cm&fs=1&to=ifadahauliasinaga@gmail.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            marginTop: 32,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            borderRadius: 999,
            background: "var(--primary)",
            padding: "14px 28px",
            fontWeight: 500,
            color: "#111112",
            textDecoration: "none",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          <Mail size={16} />
          ifadahauliasinaga@gmail.com
        </a>

        <ul
          style={{
            marginTop: 40,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px 24px",
            listStyle: "none",
            padding: 0,
          }}
        >
          {socials.map((social) => (
            <li key={social.name}>
              <a
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 14,
                  color: "var(--muted-foreground)",
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--primary)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color =
                    "var(--muted-foreground)")
                }
              >
                {social.name}
                <ArrowUpRight size={14} />
              </a>
            </li>
          ))}
        </ul>
      </div>

      <footer
        style={{
          marginTop: 64,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          borderTop: "1px solid var(--border)",
          paddingTop: 32,
          fontSize: 14,
          color: "var(--muted-foreground)",
        }}
        className="footer-row"
      >
        <span>© {new Date().getFullYear()} Ifadah Aulia</span>

        <span>Designed & built with care</span>
      </footer>

      <style>{`
        .contact-heading {
          font-size: 30px;
        }

        @media (min-width: 768px) {
          .contact-heading {
            font-size: 46px;
          }

          .footer-row {
            flex-direction: row;
          }
        }
      `}</style>
    </section>
  );
}

export default function Portfolio() {
  useOriginalScrollMotion();

  return (
    <div className="portfolio-root">
      <GlobalStyles />
      <main style={{ position: "relative", minHeight: "100vh" }}>
        <SiteNav />
        <HeroSection />
        <div style={{ position: "relative" }}>
          <KineticGrid />
          <AboutSection />
          <ProjectsSection />
          <SkillsSection />
          <ContactSection />
        </div>
      </main>
    </div>
  );
}
