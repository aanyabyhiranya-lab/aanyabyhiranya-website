"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";

const COUNT = 80;

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 5;

    // ── Dark mode dot: solid forest green ───────────────────────
    const mkTex = (r: number, g: number, b: number) => {
      const tc = document.createElement("canvas");
      tc.width = tc.height = 32;
      const ctx = tc.getContext("2d")!;
      ctx.beginPath();
      ctx.arc(16, 16, 8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},1)`;
      ctx.fill();
      return new THREE.CanvasTexture(tc);
    };

    const darkTex  = mkTex(46, 77, 56);   // forest green
    const lightTex = mkTex(180, 95, 80);  // dark rose

    // ── Per-particle state ───────────────────────────────────────
    const px = new Float32Array(COUNT);
    const py = new Float32Array(COUNT);
    const pz = new Float32Array(COUNT);
    const vx = new Float32Array(COUNT);
    const vy = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      px[i] = (Math.random() - 0.5) * 12;
      py[i] = (Math.random() - 0.5) * 9;
      pz[i] = (Math.random() - 0.5) * 3;
      vx[i] = 0; vy[i] = 0;
    }

    const isDark = () => document.documentElement.classList.contains("dark");

    const sprites: THREE.Sprite[] = [];
    const mats: THREE.SpriteMaterial[] = [];

    for (let i = 0; i < COUNT; i++) {
      const sm = new THREE.SpriteMaterial({
        map: isDark() ? darkTex : lightTex,
        transparent: true,
        blending: THREE.NormalBlending,
        depthWrite: false,
        opacity: 0.22,
      });
      const sp = new THREE.Sprite(sm);
      const s = 0.06 + Math.random() * 0.07;
      sp.scale.set(s, s, 1);
      sp.position.set(px[i], py[i], pz[i]);
      scene.add(sp);
      sprites.push(sp);
      mats.push(sm);
    }

    // Mouse world coords
    let mwx = 0, mwy = 0, mx = 0, my = 0;
    const onMouse = (e: MouseEvent) => {
      mx = (e.clientX / window.innerWidth  - 0.5);
      my = (e.clientY / window.innerHeight - 0.5);
      mwx = mx * 12;
      mwy = -my * 9;
    };
    window.addEventListener("mousemove", onMouse);

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    // Theme switch — swap texture
    let lastDark = isDark();
    const observer = new MutationObserver(() => {
      const dark = isDark();
      if (dark === lastDark) return;
      lastDark = dark;
      mats.forEach(sm => { sm.map = dark ? darkTex : lightTex; sm.needsUpdate = true; });
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    let rafId: number;

    const animate = () => {
      rafId = requestAnimationFrame(animate);

      for (let i = 0; i < COUNT; i++) {
        const sp = sprites[i];
        const sm = mats[i];

        const dx = mwx - sp.position.x;
        const dy = mwy - sp.position.y;
        const dist = Math.sqrt(dx*dx + dy*dy) + 0.001;

        const attractRadius = 3.5;
        if (dist < attractRadius) {
          const proximity = 1 - (dist / attractRadius);
          const strength = 0.00022 * proximity * proximity;
          vx[i] += dx * strength;
          vy[i] += dy * strength;
        } else {
          // Return home
          vx[i] += (px[i] - sp.position.x) * 0.0008;
          vy[i] += (py[i] - sp.position.y) * 0.0008;
        }

        vx[i] *= 0.96;
        vy[i] *= 0.96;
        vx[i] += (Math.random() - 0.5) * 0.0006;
        vy[i] += (Math.random() - 0.5) * 0.0006;

        sp.position.x += vx[i];
        sp.position.y += vy[i];

        const normDist = Math.min(dist / attractRadius, 1);
        sm.opacity = 0.18 + (1 - normDist) * 0.28;

        if (sp.position.x >  7) sp.position.x = -7;
        if (sp.position.x < -7) sp.position.x =  7;
        if (sp.position.y >  5) sp.position.y = -5;
        if (sp.position.y < -5) sp.position.y =  5;
      }

      camera.position.x += (mx * 0.3 - camera.position.x) * 0.025;
      camera.position.y += (-my * 0.3 - camera.position.y) * 0.025;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", onResize);
      observer.disconnect();
      mats.forEach(m => m.dispose());
      darkTex.dispose(); lightTex.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.8 }} />
  );
}
