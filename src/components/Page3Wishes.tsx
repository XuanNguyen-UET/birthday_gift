import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer, Sparkles } from '@react-three/drei';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles as SparklesIcon } from 'lucide-react';
import { mockData, WishItem } from '../data/mockData';

interface StripTheme {
  bg: string;
  bgTo: string;
  border: string;
  starPrimary: string;
  starLight: string;
  starDark: string;
  starGlow: string;
}

const STRIP_THEMES: Record<WishItem['color'], StripTheme> = {
  pink: {
    bg: '#FDECF2',
    bgTo: '#F9DDE7',
    border: '#F4C4D5',
    starPrimary: '#F78EB1',
    starLight: '#FFD8E6',
    starDark: '#D8527E',
    starGlow: 'rgba(247, 142, 177, 0.6)',
  },
  lavender: {
    bg: '#F2ECFC',
    bgTo: '#E7DCF9',
    border: '#D6C3F4',
    starPrimary: '#B08CEB',
    starLight: '#E5D8FE',
    starDark: '#8259C8',
    starGlow: 'rgba(176, 140, 235, 0.6)',
  },
  mint: {
    bg: '#E6F8F1',
    bgTo: '#D7F1E7',
    border: '#B7E5D4',
    starPrimary: '#76D3B3',
    starLight: '#CAFAEA',
    starDark: '#41A683',
    starGlow: 'rgba(118, 211, 179, 0.6)',
  },
  yellow: {
    bg: '#FEF6DA',
    bgTo: '#FAECC2',
    border: '#F2DC92',
    starPrimary: '#F8CE57',
    starLight: '#FFF3BD',
    starDark: '#D9A01C',
    starGlow: 'rgba(248, 206, 87, 0.6)',
  },
  coral: {
    bg: '#FEEDEA',
    bgTo: '#FBE0D7',
    border: '#F6C4B6',
    starPrimary: '#F78E82',
    starLight: '#FFD7D1',
    starDark: '#D85B4E',
    starGlow: 'rgba(247, 142, 130, 0.6)',
  },
};

const TILT_ANGLES = [-1.25, 0.95, -0.75, 1.15, -0.85];

const JAR_STAR_COLORS = [
  '#F78EB1',
  '#F8CE57',
  '#76D3B3',
  '#B08CEB',
  '#F78E82',
  '#FFE27A',
];

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function createFloorShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(64, 64, 6, 64, 64, 60);
    grad.addColorStop(0, 'rgba(130, 78, 62, 0.34)');
    grad.addColorStop(0.5, 'rgba(148, 96, 76, 0.16)');
    grad.addColorStop(1, 'rgba(148, 96, 76, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function createJarLatheGeometry(): THREE.LatheGeometry {
  const curve = new THREE.SplineCurve([
    new THREE.Vector2(0.0, -0.94),
    new THREE.Vector2(0.56, -0.94),
    new THREE.Vector2(0.81, -0.87),
    new THREE.Vector2(0.9, -0.66),
    new THREE.Vector2(0.91, -0.18),
    new THREE.Vector2(0.88, 0.25),
    new THREE.Vector2(0.76, 0.44),
    new THREE.Vector2(0.55, 0.56),
    new THREE.Vector2(0.49, 0.65),
    new THREE.Vector2(0.49, 0.78),
    new THREE.Vector2(0.57, 0.82),
    new THREE.Vector2(0.57, 0.87),
    new THREE.Vector2(0.47, 0.88),
    new THREE.Vector2(0.44, 0.77),
  ]);
  const smoothPts = curve.getPoints(56);
  return new THREE.LatheGeometry(smoothPts, 64);
}

function createGlassHighlightGeometry(): THREE.LatheGeometry {
  const curve = new THREE.SplineCurve([
    new THREE.Vector2(0.87, -0.64),
    new THREE.Vector2(0.915, -0.2),
    new THREE.Vector2(0.89, 0.22),
    new THREE.Vector2(0.77, 0.42),
  ]);
  return new THREE.LatheGeometry(curve.getPoints(18), 16, -0.95, 0.28);
}

function createPuffyStarGeometry(): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  const points = 5;
  const outerR = 0.115;
  const innerR = 0.056;

  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const radius = i % 2 === 0 ? outerR : innerR;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();

  const geom = new THREE.ExtrudeGeometry(shape, {
    depth: 0.028,
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 1,
    bevelSize: 0.026,
    bevelThickness: 0.036,
  });
  geom.center();
  return geom;
}

function GlassStreakHighlight() {
  const streakGeo = useMemo(() => createGlassHighlightGeometry(), []);

  useEffect(() => {
    return () => {
      streakGeo.dispose();
    };
  }, [streakGeo]);

  return (
    <mesh geometry={streakGeo} scale={1.006} rotation={[0, -0.25, 0]}>
      <meshBasicMaterial
        color="#FFFFFF"
        transparent
        opacity={0.44}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

interface StarParticleSpec {
  id: number;
  basePos: [number, number, number];
  rot: [number, number, number];
  scale: number;
  color: string;
  speed: number;
  phase: number;
}

interface WishingJarSceneProps {
  targetYawRef: React.MutableRefObject<number>;
  targetPitchRef: React.MutableRefObject<number>;
  isDraggingRef: React.MutableRefObject<boolean>;
  shakeImpulseRef: React.MutableRefObject<{
    velZ: number;
    velX: number;
    swirlEnergy: number;
  }>;
}

function WishingJarScene({
  targetYawRef,
  targetPitchRef,
  isDraggingRef,
  shakeImpulseRef,
}: WishingJarSceneProps) {
  const jarGroupRef = useRef<THREE.Group>(null);
  const corkRef = useRef<THREE.Group>(null);
  const starRefs = useRef<(THREE.Mesh | null)[]>([]);
  const shakeAngleZ = useRef(0);
  const shakeAngleX = useRef(0);
  const shakeOffsetY = useRef(0);

  const jarGeo = useMemo(() => createJarLatheGeometry(), []);
  const starGeo = useMemo(() => createPuffyStarGeometry(), []);
  const shadowTex = useMemo(() => createFloorShadowTexture(), []);

  const starsData = useMemo<StarParticleSpec[]>(() => {
    const specs: StarParticleSpec[] = [];
    for (let i = 0; i < 28; i++) {
      // Cluster stars richly from jar floor up into lower-mid belly
      const layerT = i / 27;
      const y = -0.68 + layerT * 0.96 + (seededRandom(i * 11 + 1) - 0.5) * 0.08;
      const maxR = y > 0.18 ? 0.5 : 0.64;
      const radial = Math.sqrt(seededRandom(i * 13 + 3)) * maxR;
      const angle = seededRandom(i * 17 + 5) * Math.PI * 2;
      specs.push({
        id: i,
        basePos: [Math.cos(angle) * radial, y, Math.sin(angle) * radial],
        rot: [
          seededRandom(i * 19 + 7) * Math.PI,
          seededRandom(i * 23 + 9) * Math.PI,
          seededRandom(i * 29 + 11) * Math.PI,
        ],
        scale: 0.78 + seededRandom(i * 31 + 13) * 0.36,
        color: JAR_STAR_COLORS[i % JAR_STAR_COLORS.length],
        speed: 0.9 + seededRandom(i * 37 + 15) * 0.9,
        phase: seededRandom(i * 41 + 17) * Math.PI * 2,
      });
    }
    return specs;
  }, []);

  const corkSpecks = useMemo(() => {
    const pts: Array<{ pos: [number, number, number]; scale: number }> = [];
    for (let i = 0; i < 12; i++) {
      const a = seededRandom(i * 7 + 2) * Math.PI * 2;
      const y = 0.78 + seededRandom(i * 9 + 4) * 0.24;
      const r = 0.42;
      pts.push({
        pos: [Math.cos(a) * r, y, Math.sin(a) * r],
        scale: 0.018 + seededRandom(i * 5 + 1) * 0.014,
      });
    }
    return pts;
  }, []);

  useEffect(() => {
    return () => {
      jarGeo.dispose();
      starGeo.dispose();
      shadowTex.dispose();
    };
  }, [jarGeo, starGeo, shadowTex]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.getElapsedTime();

    // Spring-damped shake physics from drops or tap
    const imp = shakeImpulseRef.current;
    const springK = 145;
    const damping = 9.5;

    const accZ = -springK * shakeAngleZ.current - damping * imp.velZ;
    imp.velZ += accZ * dt;
    shakeAngleZ.current += imp.velZ * dt;

    const accX = -springK * shakeAngleX.current - damping * imp.velX;
    imp.velX += accX * dt;
    shakeAngleX.current += imp.velX * dt;

    shakeOffsetY.current = THREE.MathUtils.lerp(
      shakeOffsetY.current,
      Math.abs(imp.velZ) * 0.012,
      dt * 12
    );

    imp.swirlEnergy = Math.max(0, imp.swirlEnergy - dt * 1.35);

    if (!isDraggingRef.current) {
      // Softly relax drag tilt back toward natural slight idle sway
      targetYawRef.current = THREE.MathUtils.lerp(
        targetYawRef.current,
        Math.sin(t * 0.85) * 0.14,
        dt * 2.2
      );
      targetPitchRef.current = THREE.MathUtils.lerp(targetPitchRef.current, 0, dt * 3.5);
    }

    if (jarGroupRef.current) {
      jarGroupRef.current.rotation.y = THREE.MathUtils.lerp(
        jarGroupRef.current.rotation.y,
        targetYawRef.current,
        dt * 10
      );
      jarGroupRef.current.rotation.x = THREE.MathUtils.lerp(
        jarGroupRef.current.rotation.x,
        0.11 + targetPitchRef.current + shakeAngleX.current,
        dt * 12
      );
      jarGroupRef.current.rotation.z = shakeAngleZ.current;
      jarGroupRef.current.position.y =
        -0.02 + Math.sin(t * 1.4) * 0.02 + shakeOffsetY.current;
    }

    if (corkRef.current) {
      corkRef.current.position.y = Math.abs(shakeAngleZ.current) * 0.08;
      corkRef.current.rotation.z = -0.03 + shakeAngleZ.current * 0.35;
    }

    // Animate 28 puffy origami stars floating + swirling inside the jar
    const swirlBoost = imp.swirlEnergy;
    for (let i = 0; i < starsData.length; i++) {
      const mesh = starRefs.current[i];
      if (!mesh) continue;
      const spec = starsData[i];
      const bob = Math.sin(t * spec.speed + spec.phase) * (0.024 + swirlBoost * 0.09);
      const swirlAngle = swirlBoost * (0.8 + (i % 4) * 0.25) * Math.sin(t * 8 + spec.phase);
      const cosA = Math.cos(swirlAngle);
      const sinA = Math.sin(swirlAngle);
      const bx = spec.basePos[0];
      const bz = spec.basePos[2];

      mesh.position.set(
        bx * cosA - bz * sinA,
        spec.basePos[1] + bob + swirlBoost * 0.08 * seededRandom(i + 2),
        bx * sinA + bz * cosA
      );
      mesh.rotation.x = spec.rot[0] + t * 0.35 * spec.speed + swirlBoost * 1.6;
      mesh.rotation.y = spec.rot[1] + t * 0.45 * spec.speed + swirlBoost * 2.1;
      mesh.rotation.z = spec.rot[2] + Math.sin(t * 0.9 + spec.phase) * 0.16;
    }
  });

  return (
    <>
      {/* Offline Procedural Environment Reflections for Realistic Clear Glass */}
      <Environment resolution={128} frames={1}>
        <Lightformer
          form="rect"
          intensity={2.6}
          color="#FFFBF0"
          position={[3, 2.5, 3]}
          rotation={[0, -0.7, 0]}
          scale={[4, 5, 1]}
        />
        <Lightformer
          form="rect"
          intensity={2.0}
          color="#FFE3EC"
          position={[-3, 1.5, 2.5]}
          rotation={[0, 0.7, 0]}
          scale={[3.5, 4, 1]}
        />
        <Lightformer
          form="circle"
          intensity={3.0}
          color="#FFFFFF"
          position={[0, 4.5, 1.5]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={3.5}
        />
        <Lightformer
          form="rect"
          intensity={1.6}
          color="#FFF1CC"
          position={[0, -2.5, 2]}
          rotation={[-Math.PI / 3, 0, 0]}
          scale={[4, 2, 1]}
        />
      </Environment>

      <ambientLight intensity={0.62} color="#FFF6EA" />
      <directionalLight position={[2.8, 4.5, 4.2]} intensity={1.35} color="#FFFDF8" />
      <directionalLight position={[-3.2, 1.8, 2.5]} intensity={0.65} color="#FFE7F1" />

      {/* Ground Contact Shadow */}
      <mesh position={[0, -1.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.55, 2.05]} />
        <meshBasicMaterial map={shadowTex} transparent depthWrite={false} />
      </mesh>

      {/* Outer Magic Stardust Sparkles */}
      <Sparkles
        count={28}
        scale={[2.9, 2.35, 2.1]}
        size={2.6}
        speed={0.55}
        opacity={0.85}
        color="#FFD65C"
      />

      {/* Interactive Wishing Jar Assembly */}
      <group ref={jarGroupRef} position={[0, -0.02, 0]} scale={0.92}>
        {/* Warm Internal Candlelight Glow Illuminating the Stars */}
        <pointLight
          position={[0, -0.12, 0.22]}
          color="#FFD875"
          intensity={1.25}
          distance={3.2}
        />

        {/* 28 Puffy 3D Origami Lucky Stars */}
        <group>
          {starsData.map((star, idx) => (
            <mesh
              key={star.id}
              ref={(el) => {
                starRefs.current[idx] = el;
              }}
              geometry={starGeo}
              position={star.basePos}
              rotation={star.rot}
              scale={star.scale}
            >
              <meshStandardMaterial
                color={star.color}
                roughness={0.32}
                metalness={0.04}
                emissive={star.color}
                emissiveIntensity={0.08}
              />
            </mesh>
          ))}
        </group>

        {/* Thick Rounded Frosted Glass Base Puck */}
        <mesh position={[0, -0.86, 0]}>
          <cylinderGeometry args={[0.78, 0.68, 0.14, 36]} />
          <meshStandardMaterial
            color="#FFF2DF"
            roughness={0.2}
            metalness={0.05}
            transparent
            opacity={0.34}
            depthWrite={false}
          />
        </mesh>

        {/* Warm Translucent Inner Glass Contour Wall */}
        <mesh geometry={jarGeo} scale={0.992}>
          <meshPhysicalMaterial
            color="#F5D5AF"
            roughness={0.14}
            clearcoat={0.8}
            transparent
            opacity={0.15}
            side={THREE.BackSide}
            depthWrite={false}
          />
        </mesh>

        {/* Crystal-Clear Glossy Outer Glass Shell */}
        <mesh geometry={jarGeo}>
          <meshPhysicalMaterial
            color="#FFFDF8"
            roughness={0.05}
            metalness={0.04}
            clearcoat={1}
            clearcoatRoughness={0.04}
            ior={1.5}
            reflectivity={1}
            envMapIntensity={1.6}
            transparent
            opacity={0.24}
            depthWrite={false}
          />
        </mesh>

        {/* Specular Curved Glass Streak Highlight */}
        <GlassStreakHighlight />

        {/* Subtle Glossy Rim Highlight Ring */}
        <mesh position={[0, 0.85, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.525, 0.025, 16, 48]} />
          <meshPhysicalMaterial
            color="#FFFFFF"
            roughness={0.08}
            clearcoat={1}
            transparent
            opacity={0.36}
            depthWrite={false}
          />
        </mesh>

        {/* Textured 3D Cork Stopper */}
        <group ref={corkRef}>
          <mesh position={[0, 0.9, 0]}>
            <cylinderGeometry args={[0.45, 0.39, 0.36, 32]} />
            <meshStandardMaterial color="#CA9260" roughness={0.82} metalness={0.02} />
          </mesh>
          <mesh position={[0, 1.075, 0]}>
            <cylinderGeometry args={[0.42, 0.45, 0.035, 32]} />
            <meshStandardMaterial color="#D8A170" roughness={0.78} metalness={0.02} />
          </mesh>
          {corkSpecks.map((sp, sIdx) => (
            <mesh key={sIdx} position={sp.pos} scale={sp.scale}>
              <sphereGeometry args={[1, 8, 8]} />
              <meshStandardMaterial color="#9E653E" roughness={0.9} />
            </mesh>
          ))}
        </group>

        {/* Sculpted 3D Lavender Satin Ribbon Bow */}
        <group position={[0, 0.64, 0]}>
          {/* Neck Wrap */}
          <mesh rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 1.35]}>
            <torusGeometry args={[0.505, 0.038, 16, 48]} />
            <meshPhysicalMaterial
              color="#B798E8"
              roughness={0.32}
              metalness={0.05}
              sheen={0.85}
              sheenColor="#F3EBFF"
            />
          </mesh>

          {/* Center Knot */}
          <mesh position={[0, 0, 0.51]} scale={[1.1, 0.9, 0.85]}>
            <sphereGeometry args={[0.078, 20, 16]} />
            <meshPhysicalMaterial
              color="#CEB4F5"
              roughness={0.28}
              sheen={0.9}
              sheenColor="#FFFFFF"
            />
          </mesh>

          {/* Left Bow Loop */}
          <mesh
            position={[-0.2, 0.045, 0.52]}
            rotation={[0.22, 0.25, 0.32]}
            scale={[1.15, 0.72, 0.55]}
          >
            <torusGeometry args={[0.135, 0.048, 16, 32]} />
            <meshPhysicalMaterial
              color="#B798E8"
              roughness={0.3}
              sheen={0.9}
              sheenColor="#F4EEFF"
            />
          </mesh>

          {/* Right Bow Loop */}
          <mesh
            position={[0.2, 0.045, 0.52]}
            rotation={[0.22, -0.25, -0.32]}
            scale={[1.15, 0.72, 0.55]}
          >
            <torusGeometry args={[0.135, 0.048, 16, 32]} />
            <meshPhysicalMaterial
              color="#B798E8"
              roughness={0.3}
              sheen={0.9}
              sheenColor="#F4EEFF"
            />
          </mesh>

          {/* Left Ribbon Tail */}
          <mesh position={[-0.13, -0.18, 0.53]} rotation={[0.18, 0.15, 0.36]}>
            <boxGeometry args={[0.065, 0.34, 0.02]} />
            <meshPhysicalMaterial
              color="#A583DD"
              roughness={0.35}
              sheen={0.8}
              sheenColor="#EFE6FF"
            />
          </mesh>

          {/* Right Ribbon Tail */}
          <mesh position={[0.13, -0.18, 0.53]} rotation={[0.18, -0.15, -0.36]}>
            <boxGeometry args={[0.065, 0.34, 0.02]} />
            <meshPhysicalMaterial
              color="#A583DD"
              roughness={0.35}
              sheen={0.8}
              sheenColor="#EFE6FF"
            />
          </mesh>
        </group>
      </group>
    </>
  );
}

interface WishingJar3DProps {
  dropPulse: { id: number; color: string } | null;
  onUserJiggle?: () => void;
}

function WishingJar3D({ dropPulse, onUserJiggle }: WishingJar3DProps) {
  const targetYawRef = useRef(0);
  const targetPitchRef = useRef(0);
  const isDraggingRef = useRef(false);
  const lastPointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragDistanceRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  const shakeImpulseRef = useRef({
    velZ: 0,
    velX: 0,
    swirlEnergy: 0,
  });

  useEffect(() => {
    if (!dropPulse) return;
    const dir = dropPulse.id % 2 === 0 ? -1 : 1;
    shakeImpulseRef.current.velZ += dir * 2.9;
    shakeImpulseRef.current.velX += 1.25;
    shakeImpulseRef.current.swirlEnergy = 1.0;
  }, [dropPulse]);

  const triggerJiggle = () => {
    const dir = Math.random() > 0.5 ? 1 : -1;
    shakeImpulseRef.current.velZ += dir * 2.5;
    shakeImpulseRef.current.velX += 1.0;
    shakeImpulseRef.current.swirlEnergy = Math.min(1.2, shakeImpulseRef.current.swirlEnergy + 0.85);
    onUserJiggle?.();
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    isDraggingRef.current = true;
    setIsDragging(true);
    dragDistanceRef.current = 0;
    lastPointerRef.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastPointerRef.current.x;
    const dy = e.clientY - lastPointerRef.current.y;
    dragDistanceRef.current += Math.abs(dx) + Math.abs(dy);
    lastPointerRef.current = { x: e.clientX, y: e.clientY };
    targetYawRef.current = THREE.MathUtils.clamp(targetYawRef.current + dx * 0.014, -1.1, 1.1);
    targetPitchRef.current = THREE.MathUtils.clamp(targetPitchRef.current + dy * 0.008, -0.35, 0.35);
    shakeImpulseRef.current.swirlEnergy = Math.min(
      1.0,
      shakeImpulseRef.current.swirlEnergy + Math.abs(dx) * 0.015
    );
  };

  const handlePointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setIsDragging(false);
      if (dragDistanceRef.current < 8) {
        triggerJiggle();
      }
    }
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      role="img"
      aria-label="Interactive 3D glass wishing jar filled with glowing origami lucky stars. Drag to tilt or tap to shake."
      className={`relative h-[188px] w-full touch-none select-none ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    >
      {/* Warm Ambient Backlight Halo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FFE28A]/60 blur-2xl"
      />

      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0.22, 4.95], fov: 33 }}
        gl={{ antialias: true, alpha: true }}
        className="h-full w-full"
      >
        <WishingJarScene
          targetYawRef={targetYawRef}
          targetPitchRef={targetPitchRef}
          isDraggingRef={isDraggingRef}
          shakeImpulseRef={shakeImpulseRef}
        />
      </Canvas>

      {/* Shooting Star Burst Particle on Each Drop */}
      <AnimatePresence>
        {dropPulse && (
          <motion.div
            key={`burst-${dropPulse.id}`}
            initial={{ opacity: 0.95, y: 20, scale: 0.5, rotate: -15 }}
            animate={{ opacity: 0, y: 112, scale: 1.25, rotate: 95 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none absolute top-[54%] left-1/2 z-20 -translate-x-1/2"
            aria-hidden="true"
          >
            <svg viewBox="0 0 32 32" className="h-7 w-7 drop-shadow-[0_0_10px_rgba(255,215,90,0.9)]">
              <path
                d="M16 2 L19.8 11 L29 12.2 L22.2 18.4 L24 27.6 L16 23 L8 27.6 L9.8 18.4 L3 12.2 L12.2 11 Z"
                fill={dropPulse.color}
                stroke="#FFFFFF"
                strokeWidth="1.2"
              />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ThreeDStarBadge({ theme, index }: { theme: StripTheme; index: number }) {
  const gradId = `star-3d-${index}`;
  return (
    <motion.div
      animate={{
        rotate: [-5, 6, -5],
        scale: [1, 1.07, 1],
      }}
      transition={{
        duration: 2.8,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: index * 0.28,
      }}
      className="relative flex h-7 w-7 shrink-0 items-center justify-center"
      style={{ filter: `drop-shadow(0 3px 6px ${theme.starGlow})` }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 32 32" className="h-full w-full">
        <defs>
          <radialGradient id={gradId} cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor={theme.starLight} />
            <stop offset="55%" stopColor={theme.starPrimary} />
            <stop offset="100%" stopColor={theme.starDark} />
          </radialGradient>
        </defs>
        <path
          d="M16 3 L19.8 11 L28.5 12.2 L22.1 18.2 L23.7 27 L16 22.8 L8.3 27 L9.9 18.2 L3.5 12.2 L12.2 11 Z"
          fill={`url(#${gradId})`}
          stroke={theme.starDark}
          strokeWidth="0.7"
          strokeLinejoin="round"
        />
        <ellipse cx="13.5" cy="12" rx="2.6" ry="1.8" fill="white" fillOpacity="0.55" />
      </svg>
    </motion.div>
  );
}

export function Page3Wishes() {
  const { items, ctaLabel } = mockData.wishes;
  const [visibleCount, setVisibleCount] = useState(0);
  const [replayRun, setReplayRun] = useState(0);
  const [dropPulse, setDropPulse] = useState<{ id: number; color: string } | null>(null);

  useEffect(() => {
    setVisibleCount(0);
    setDropPulse(null);
    const timers: number[] = [];

    items.forEach((item, idx) => {
      const delay = 600 + idx * 380;
      const t = window.setTimeout(() => {
        setVisibleCount(idx + 1);
        setDropPulse({
          id: replayRun * 10 + idx + 1,
          color: STRIP_THEMES[item.color].starPrimary,
        });
      }, delay);
      timers.push(t);
    });

    return () => {
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [items, replayRun]);

  const handleReplay = () => {
    setVisibleCount(0);
    setDropPulse(null);
    setReplayRun((prev) => prev + 1);
  };

  return (
    <section
      aria-label="Wishes for your new year"
      className="relative flex h-full w-full flex-col items-center overflow-hidden bg-gradient-to-b from-[#FCE6B8] via-[#FDF2DC] to-[#FBE8E0] px-5 pt-11 pb-24"
    >
      {/* Centered Header matching ref_05 */}
      <header className="relative z-10 text-center">
        <p className="text-[10.5px] font-bold uppercase tracking-[0.15em] text-[#D92B52]">
          {mockData.pages[2]?.badge ?? 'MAKE A WISH'}
        </p>
        <h2 className="mt-0.5 font-serif text-[25px] font-black leading-tight text-[#2D192B]">
          {mockData.pages[2]?.heading ?? 'Wishes for your new year'}
        </h2>
      </header>

      {/* Interactive 3D Wishing Glass Jar */}
      <div className="relative z-10 mt-0.5 flex w-full items-center justify-center">
        <WishingJar3D dropPulse={dropPulse} />
      </div>

      {/* 5 Staggered Tactile Pastel Paper Wish Strips */}
      <div className="relative z-10 mt-0.5 flex w-full max-w-[328px] flex-1 flex-col justify-start gap-2.5 [perspective:900px]">
        <AnimatePresence>
          {items.slice(0, visibleCount).map((item, idx) => {
            const theme = STRIP_THEMES[item.color];
            const tilt = TILT_ANGLES[idx % TILT_ANGLES.length];

            return (
              <motion.div
                key={`${replayRun}-${item.id}`}
                initial={{ opacity: 0, y: -44, scale: 0.5, rotate: tilt * 2.2 }}
                animate={{ opacity: 1, y: 0, scale: 1, rotate: tilt }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.018, y: -1.5, rotate: tilt * 0.45 }}
                whileTap={{ scale: 0.982, y: 1 }}
                onPointerDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                transition={{
                  type: 'spring',
                  stiffness: 290,
                  damping: 21,
                }}
                style={{
                  backgroundImage: `linear-gradient(180deg, ${theme.bg} 0%, ${theme.bgTo} 100%), repeating-linear-gradient(90deg, transparent, transparent 48px, rgba(135, 95, 110, 0.06) 48px, rgba(135, 95, 110, 0.06) 49px)`,
                  borderColor: theme.border,
                }}
                className="relative flex cursor-pointer items-center gap-3 overflow-hidden rounded-xl border px-3.5 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.85),inset_0_-2px_0_rgba(120,70,90,0.08),0_10px_20px_-6px_rgba(45,25,43,0.13),0_3px_6px_rgba(45,25,43,0.06)]"
              >
                {/* Subtle Diagonal Paper Crease Sheens */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-4 -right-6 h-12 w-24 rotate-[18deg] bg-white/35 blur-[2px]"
                />
                <ThreeDStarBadge theme={theme} index={idx} />
                <p className="relative z-10 text-[13.5px] font-semibold leading-snug text-[#2D192B]">
                  {item.text}
                </p>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Replay Button */}
      <div className="relative z-20 mt-2 flex justify-center">
        <button
          type="button"
          onClick={handleReplay}
          onPointerDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#F0E3DC] bg-white/95 px-5 py-2.5 text-[13px] font-bold text-[#2D192B] shadow-[0_8px_20px_rgba(45,25,43,0.09)] transition-all hover:scale-[1.03] hover:shadow-[0_10px_24px_rgba(225,45,83,0.16)] active:scale-95"
        >
          <SparklesIcon className="h-4 w-4 text-[#E12D53]" />
          <span>{ctaLabel}</span>
        </button>
      </div>
    </section>
  );
}
