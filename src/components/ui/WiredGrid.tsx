"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { MotionValue, useMotionValueEvent } from "framer-motion";
import * as THREE from "three";

interface WiredGridProps {
  progress: MotionValue<number>;
}

// Performance guard constants
const FPS_SAMPLE_FRAMES = 60;
const FPS_THRESHOLD = 45;

// Grid constants
const GRID_SIZE = 30;
const GRID_DIVISIONS = 24;
const Z_SPEED = 0.018;        // base tunnel speed
const GLITCH_CHANCE = 0.004;  // per-frame probability of a glitch burst

export const WiredGrid = ({ progress }: WiredGridProps) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const frameCount = useRef(0);
  const lastTime = useRef<number | null>(null);
  const fpsSamples = useRef<number[]>([]);
  const [isLowPerformance, setIsLowPerformance] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const progressRef = useRef(0);

  useMotionValueEvent(progress, "change", (v) => {
    progressRef.current = v;
  });

  useEffect(() => {
    if (!mountRef.current) return;
    if (isLowPerformance) return;

    const mount = mountRef.current;

    // ── Scene ──────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      65,
      mount.clientWidth / mount.clientHeight,
      0.1,
      200
    );
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: false, // keep it cheap
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // ── Grid layers (stacked along Z) ─────────────────────────────────────
    const LAYER_COUNT = 8;
    const LAYER_SPACING = 14;
    const gridColor = new THREE.Color(0x10b981);

    const layers: THREE.LineSegments[] = [];

    for (let i = 0; i < LAYER_COUNT; i++) {
      const geo = new THREE.BufferGeometry();
      const positions: number[] = [];

      const half = GRID_SIZE / 2;
      const step = GRID_SIZE / GRID_DIVISIONS;

      for (let x = -half; x <= half + 0.001; x += step) {
        positions.push(x, -half, 0, x, half, 0);
      }
      for (let y = -half; y <= half + 0.001; y += step) {
        positions.push(-half, y, 0, half, y, 0);
      }

      geo.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3)
      );

      const mat = new THREE.LineBasicMaterial({
        color: gridColor,
        transparent: true,
        opacity: 0.07 + (i / LAYER_COUNT) * 0.06,
      });

      const mesh = new THREE.LineSegments(geo, mat);
      mesh.position.z = -i * LAYER_SPACING;
      scene.add(mesh);
      layers.push(mesh);
    }

    // ── Animation ──────────────────────────────────────────────────────────
    let rafId: number;
    let glitching = false;
    let glitchFrames = 0;

    const animate = (now: number) => {
      rafId = requestAnimationFrame(animate);

      // FPS sampling guard
      if (lastTime.current !== null) {
        const delta = now - lastTime.current;
        if (delta > 0) {
          const fps = 1000 / delta;
          if (frameCount.current < FPS_SAMPLE_FRAMES) {
            fpsSamples.current.push(fps);
            frameCount.current++;
            if (frameCount.current === FPS_SAMPLE_FRAMES) {
              const avg =
                fpsSamples.current.reduce((a, b) => a + b, 0) /
                fpsSamples.current.length;
              if (avg < FPS_THRESHOLD) {
                setIsLowPerformance(true);
                cancelAnimationFrame(rafId);
                renderer.dispose();
                return;
              }
            }
          }
        }
      }
      lastTime.current = now;

      // Scroll-reactive speed boost (subtle)
      const scrollBoost = 1 + progressRef.current * 2.5;

      // Move layers forward (tunnel effect)
      layers.forEach((layer, i) => {
        layer.position.z += Z_SPEED * scrollBoost;
        // Wrap around when layer passes camera
        if (layer.position.z > camera.position.z + 2) {
          layer.position.z -= LAYER_COUNT * LAYER_SPACING;
        }
        // Fade-in by depth for a natural perspective feel
        const dist = Math.abs(camera.position.z - layer.position.z);
        const mat = layer.material as THREE.LineBasicMaterial;
        mat.opacity = Math.max(0, 0.12 - dist * 0.004);
      });

      // Stochastic glitch
      if (!glitching && Math.random() < GLITCH_CHANCE) {
        glitching = true;
        glitchFrames = 4 + Math.floor(Math.random() * 6);
        const glitchLayer = layers[Math.floor(Math.random() * layers.length)];
        const mat = glitchLayer.material as THREE.LineBasicMaterial;
        mat.opacity = 0.35;
        mat.color.set(0xffffff);
        setTimeout(() => {
          mat.color.set(gridColor);
          glitching = false;
        }, glitchFrames * 16);
      }

      renderer.render(scene, camera);
    };

    rafId = requestAnimationFrame(animate);
    setIsReady(true);

    // ── Resize ────────────────────────────────────────────────────────────
    const onResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      layers.forEach((l) => {
        l.geometry.dispose();
        (l.material as THREE.Material).dispose();
      });
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [isLowPerformance]);

  if (isLowPerformance) return null;

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ opacity: isReady ? 1 : 0, transition: "opacity 1s ease" }}
    />
  );
};
