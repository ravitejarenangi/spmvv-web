"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTheme } from "next-themes";
import * as THREE from "three";

function AnimatedMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { theme } = useTheme();

  // Create a gentle floating rotation
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.1;
      meshRef.current.rotation.y += delta * 0.15;
    }
  });

  const isDark = theme === "dark";
  const materialColor = isDark ? "#4f46e5" : "#a78bfa";
  const wireframeColor = isDark ? "#3b82f6" : "#60a5fa";

  return (
    <mesh ref={meshRef} scale={1.5}>
      <icosahedronGeometry args={[2, 1]} />
      <meshPhysicalMaterial
        color={materialColor}
        wireframe={true}
        transparent={true}
        opacity={0.3}
        roughness={0.1}
        metalness={0.8}
        clearcoat={1.0}
      />
    </mesh>
  );
}

function FloatingParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  
  useFrame((state, delta) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y -= delta * 0.05;
      particlesRef.current.rotation.x += delta * 0.02;
    }
  });

  const particleCount = 500;
  const positions = new Float32Array(particleCount * 3);
  for(let i = 0; i < particleCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 15;
  }

  const { theme } = useTheme();
  const particleColor = theme === "dark" ? "#818cf8" : "#8b5cf6";

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color={particleColor} transparent opacity={0.6} />
    </points>
  );
}

export function ThreeBackground() {
  return (
    <div className="absolute inset-0 z-[-1] overflow-hidden bg-gradient-to-br from-background via-background to-secondary/20">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <AnimatedMesh />
        <FloatingParticles />
      </Canvas>
    </div>
  );
}
