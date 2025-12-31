import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Float, Environment } from '@react-three/drei';
import * as THREE from 'three';

interface AnimatedShapeProps {
  scrollProgress: number;
  colorPhase: number;
}

// Main focal torus knot with metallic gold finish
function AnimatedShape({ scrollProgress, colorPhase }: AnimatedShapeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const color = useMemo(() => {
    const colors = [
      new THREE.Color('#d4af37'), // Rich Gold
      new THREE.Color('#c9a962'), // Champagne Gold
      new THREE.Color('#b8860b'), // Dark Goldenrod
      new THREE.Color('#daa520'), // Goldenrod
      new THREE.Color('#d4af37'), // Back to gold
    ];

    const phase = Number.isFinite(colorPhase) ? Math.min(Math.max(colorPhase, 0), 1) : 0;
    const scaled = phase * (colors.length - 1);
    const index = Math.floor(scaled);
    const nextIndex = Math.min(index + 1, colors.length - 1);
    const t = scaled - index;

    return colors[index].clone().lerp(colors[nextIndex], t);
  }, [colorPhase]);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    const time = state.clock.getElapsedTime();
    const rotationSpeed = 0.12 - scrollProgress * 0.08;
    
    meshRef.current.rotation.x = time * rotationSpeed + scrollProgress * 0.5;
    meshRef.current.rotation.y = time * rotationSpeed * 0.7 + scrollProgress * 0.3;
    meshRef.current.rotation.z = Math.sin(time * 0.15) * 0.15;
    
    meshRef.current.position.y = Math.sin(time * 0.25) * 0.3;
    meshRef.current.position.x = Math.cos(time * 0.1) * 0.2;
    
    const baseScale = 2.2 - scrollProgress * 0.4;
    meshRef.current.scale.setScalar(baseScale);
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <torusKnotGeometry args={[1, 0.35, 256, 48, 2, 3]} />
      <MeshDistortMaterial
        color={color}
        attach="material"
        distort={0.25 - scrollProgress * 0.12}
        speed={1.8 - scrollProgress * 0.6}
        roughness={0.15}
        metalness={0.95}
        envMapIntensity={2}
      />
    </mesh>
  );
}

// Floating fashion accent rings
function FloatingRing({ position, size, speed }: { position: [number, number, number]; size: number; speed: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.x = time * speed;
    meshRef.current.rotation.y = time * speed * 0.5;
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.8}>
      <mesh ref={meshRef} position={position}>
        <torusGeometry args={[size, size * 0.08, 32, 64]} />
        <meshStandardMaterial
          color="#c9a962"
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={0.6}
        />
      </mesh>
    </Float>
  );
}

// Decorative floating diamonds
function FloatingDiamond({ position, size, delay }: { position: [number, number, number]; size: number; delay: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime() + delay;
    meshRef.current.rotation.y = time * 0.3;
    meshRef.current.rotation.z = Math.sin(time * 0.5) * 0.3;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={1}>
      <mesh ref={meshRef} position={position}>
        <octahedronGeometry args={[size]} />
        <meshStandardMaterial
          color="#d4af37"
          metalness={0.95}
          roughness={0.05}
          transparent
          opacity={0.5}
        />
      </mesh>
    </Float>
  );
}

// Particle field for depth
function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 100;
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.02;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#c9a962"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
}

interface AnimatedBackgroundProps {
  scrollProgress: number;
}

export function AnimatedBackground({ scrollProgress }: AnimatedBackgroundProps) {
  const safeScrollProgress = Number.isFinite(scrollProgress) ? Math.min(Math.max(scrollProgress, 0), 1) : 0;
  const colorPhase = (safeScrollProgress * 2) % 1;
  
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 7], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Enhanced lighting for metallic materials */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
        <directionalLight position={[-10, -5, -5]} intensity={0.8} color="#c9a962" />
        <pointLight position={[5, 5, 5]} intensity={1} color="#d4af37" />
        <pointLight position={[-5, -5, 5]} intensity={0.5} color="#ffffff" />
        <spotLight
          position={[0, 10, 0]}
          angle={0.3}
          penumbra={1}
          intensity={1.5}
          color="#c9a962"
        />
        
        {/* Environment for reflections */}
        <Environment preset="city" />
        
        {/* Main animated shape */}
        <AnimatedShape scrollProgress={safeScrollProgress} colorPhase={colorPhase} />
        
        {/* Floating accent elements */}
        <FloatingRing position={[-3.5, 2, -2]} size={0.6} speed={0.3} />
        <FloatingRing position={[3.5, -1.5, -3]} size={0.45} speed={0.25} />
        <FloatingRing position={[2, 2.5, -2.5]} size={0.35} speed={0.35} />
        
        {/* Floating diamonds */}
        <FloatingDiamond position={[-2.5, -2, -1]} size={0.2} delay={0} />
        <FloatingDiamond position={[3, 1.5, -1.5]} size={0.15} delay={1} />
        <FloatingDiamond position={[-1.5, 2.5, -2]} size={0.18} delay={2} />
        <FloatingDiamond position={[1.5, -2.5, -1.5]} size={0.12} delay={3} />
        
        {/* Particle field for depth */}
        <ParticleField />
        
        {/* Subtle fog for atmosphere */}
        <fog attach="fog" args={['#0a0a0a', 6, 18]} />
      </Canvas>
      
      {/* Gradient overlays for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-transparent to-background/70 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/20 via-transparent to-background/20 pointer-events-none" />
    </div>
  );
}
