import { useEffect, useRef } from 'react';

// A slow drifting particle field rendered with Three.js, used behind the hero.
// Three.js is imported only when this mounts, so it stays out of the first load's critical path.
// Mouse moves the field gently. Reduced motion draws one still frame. Rendering pauses when scrolled out of view.
// If WebGL is unavailable, the field is simply not shown.
export default function ParticleField({ count = 900 }: { count?: number }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const n = window.innerWidth < 640 ? Math.round(count / 2) : count; // fewer particles on phones

    import('three')
      .then((THREE) => {
        if (disposed) return;

        const renderer = (() => {
          try {
            return new THREE.WebGLRenderer({ alpha: true, antialias: false });
          } catch {
            return null;
          }
        })();
        if (!renderer) return;

        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        renderer.setClearColor(0x000000, 0);
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        renderer.domElement.style.display = 'block';
        mount.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
        camera.position.z = 6;

        // Points spread through a wide, flat volume so they read as a field, not a ball
        const positions = new Float32Array(n * 3);
        for (let i = 0; i < n; i++) {
          positions[i * 3] = (Math.random() - 0.5) * 12;
          positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
        }
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const material = new THREE.PointsMaterial({ size: 0.04, transparent: true, opacity: 0.75, sizeAttenuation: true });
        const points = new THREE.Points(geometry, material);
        scene.add(points);

        const resize = () => {
          const w = mount.clientWidth || 1;
          const h = mount.clientHeight || 1;
          renderer.setSize(w, h, false);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
        };
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(mount);

        // Mouse parallax, mouse only
        const aim = { x: 0, y: 0 };
        const eased = { x: 0, y: 0 };
        const onMove = (e: PointerEvent) => {
          if (e.pointerType !== 'mouse') return;
          aim.x = e.clientX / window.innerWidth - 0.5;
          aim.y = e.clientY / window.innerHeight - 0.5;
        };
        if (!reduce) window.addEventListener('pointermove', onMove);

        let dark: boolean | null = null;
        const paint = () => {
          const isDark = document.documentElement.classList.contains('dark');
          if (isDark !== dark) {
            dark = isDark;
            material.color.set(isDark ? 0xd4d4d4 : 0x525252);
          }
        };

        let raf = 0;
        let last = performance.now();
        let t = 0;
        let visible = true;

        const draw = (now: number) => {
          const dt = Math.min((now - last) / 1000, 0.05);
          last = now;
          t += dt;
          eased.x += (aim.x - eased.x) * 0.04;
          eased.y += (aim.y - eased.y) * 0.04;
          points.rotation.y = t * 0.035 + eased.x * 0.5;
          points.rotation.x = eased.y * 0.3;
          paint();
          renderer.render(scene, camera);
        };

        const loop = (now: number) => {
          raf = 0;
          draw(now);
          if (visible) raf = requestAnimationFrame(loop);
        };

        const io = new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting;
          if (visible && !raf && !reduce) raf = requestAnimationFrame(loop);
        });
        io.observe(mount);

        if (reduce) {
          draw(performance.now());
        } else {
          raf = requestAnimationFrame(loop);
        }

        cleanup = () => {
          cancelAnimationFrame(raf);
          io.disconnect();
          ro.disconnect();
          window.removeEventListener('pointermove', onMove);
          geometry.dispose();
          material.dispose();
          renderer.dispose();
          renderer.domElement.remove();
        };
      })
      .catch(() => {
        /* Three.js failed to load; the hero works without the field */
      });

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [count]);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_80%)]"
    />
  );
}
