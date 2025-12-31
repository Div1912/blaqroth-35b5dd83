import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface AnimatedShapeProps {
  scrollProgress: number;
  colorPhase: number;
}

function AnimatedShape({ scrollProgress, colorPhase }: AnimatedShapeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Color interpolation based on scroll position
  const color = useMemo(() => {
    const colors = [
      new THREE.Color('#c9a962'), // Gold
      new THREE.Color('#8b7355'), // Bronze
      new THREE.Color('#2a2a2a'), // Charcoal
      new THREE.Color('#4a4a4a'), // Slate
      new THREE.Color('#c9a962'), // Back to gold
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
    
    // Base rotation speed that decreases with scroll
    const rotationSpeed = 0.15 - scrollProgress * 0.1;
    
    meshRef.current.rotation.x = time * rotationSpeed + scrollProgress * 0.5;
    meshRef.current.rotation.y = time * rotationSpeed * 0.8 + scrollProgress * 0.3;
    meshRef.current.rotation.z = Math.sin(time * 0.1) * 0.1;
    
    // Subtle floating motion
    meshRef.current.position.y = Math.sin(time * 0.3) * 0.2;
    
    // Scale based on scroll - starts larger, gets slightly smaller
    const baseScale = 2.5 - scrollProgress * 0.5;
    meshRef.current.scale.setScalar(baseScale);
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <torusKnotGeometry args={[1, 0.3, 200, 32, 2, 3]} />
      <MeshDistortMaterial
        color={color}
        attach="material"
        distort={0.2 - scrollProgress * 0.1}
        speed={1.5 - scrollProgress * 0.8}
        roughness={0.3}
        metalness={0.8}
        envMapIntensity={1}
      />
    </mesh>
  );
}

interface AnimatedBackgroundProps {
  scrollProgress: number;
}

export function AnimatedBackground({ scrollProgress }: AnimatedBackgroundProps) {
  const safeScrollProgress = Number.isFinite(scrollProgress) ? Math.min(Math.max(scrollProgress, 0), 1) : 0;
  // Color phase cycles through the palette based on scroll
  const colorPhase = (safeScrollProgress * 2) % 1;
  
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.3} color="#c9a962" />
        <pointLight position={[0, 0, 10]} intensity={0.5} color="#ffffff" />
        
        <AnimatedShape scrollProgress={scrollProgress} colorPhase={colorPhase} />
        
        {/* Subtle fog for depth */}
        <fog attach="fog" args={['#0a0a0a', 5, 15]} />
      </Canvas>
      
      {/* Gradient overlays for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background/80 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/30 via-transparent to-background/30 pointer-events-none" />
    </div>
  );
}
