import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Floating ring component
function FloatingRing({ position, size, speed, color }: { 
  position: [number, number, number]; 
  size: number; 
  speed: number;
  color: string;
}) {
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
        <torusGeometry args={[size, size * 0.1, 32, 64]} />
        <meshStandardMaterial
          color={color}
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={0.7}
        />
      </mesh>
    </Float>
  );
}

// Morphing sphere
function MorphingSphere() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.x = time * 0.15;
    meshRef.current.rotation.y = time * 0.1;
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <icosahedronGeometry args={[1.5, 4]} />
      <MeshDistortMaterial
        color="#c9a962"
        attach="material"
        distort={0.4}
        speed={2}
        roughness={0.2}
        metalness={0.8}
      />
    </mesh>
  );
}

// Small floating diamonds
function FloatingDiamond({ position, size, delay }: { 
  position: [number, number, number]; 
  size: number; 
  delay: number; 
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime() + delay;
    meshRef.current.rotation.y = time * 0.4;
    meshRef.current.rotation.z = Math.sin(time * 0.5) * 0.3;
    meshRef.current.position.y = position[1] + Math.sin(time * 0.8) * 0.3;
  });

  return (
    <mesh ref={meshRef} position={position}>
      <octahedronGeometry args={[size]} />
      <meshStandardMaterial
        color="#d4af37"
        metalness={0.95}
        roughness={0.05}
        transparent
        opacity={0.6}
      />
    </mesh>
  );
}

// Particle field
function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 80;
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.03;
    pointsRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.02) * 0.1;
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
        size={0.04}
        color="#c9a962"
        transparent
        opacity={0.5}
        sizeAttenuation
      />
    </points>
  );
}

export function AuthBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 5]} intensity={1.2} color="#ffffff" />
        <directionalLight position={[-10, -5, -5]} intensity={0.6} color="#c9a962" />
        <pointLight position={[5, 5, 5]} intensity={0.8} color="#d4af37" />
        <pointLight position={[-5, -5, 5]} intensity={0.4} color="#ffffff" />
        
        {/* Main morphing sphere */}
        <MorphingSphere />
        
        {/* Floating rings */}
        <FloatingRing position={[-3, 1.5, -2]} size={0.5} speed={0.25} color="#c9a962" />
        <FloatingRing position={[3, -1, -3]} size={0.4} speed={0.3} color="#d4af37" />
        <FloatingRing position={[2, 2, -2]} size={0.3} speed={0.35} color="#b8860b" />
        
        {/* Floating diamonds */}
        <FloatingDiamond position={[-2, -1.5, -1]} size={0.18} delay={0} />
        <FloatingDiamond position={[2.5, 1, -1.5]} size={0.12} delay={1.5} />
        <FloatingDiamond position={[-1.5, 2, -2]} size={0.15} delay={3} />
        
        {/* Particle field */}
        <ParticleField />
        
        {/* Fog for depth */}
        <fog attach="fog" args={['#0a0a0a', 5, 15]} />
      </Canvas>
      
      {/* Gradient overlays for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background/60 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/30 via-transparent to-background/30 pointer-events-none" />
    </div>
  );
}
