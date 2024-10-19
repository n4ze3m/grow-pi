import { Points } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
// import { ParticleEffect } from "./ParticleEffect";

export function PointCloud({ piValue }: { piValue: string }) {
  const pointsRef = useRef<THREE.Points>(null);
  const circleRef = useRef<THREE.Line>(null);
  const [_, setShowParticles] = useState(false);

  useEffect(() => {
    updateVisualization(piValue);
    setShowParticles(true);
    setTimeout(() => setShowParticles(false), 2000);
  }, [piValue]);

  useFrame(() => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.001;
    }
    if (circleRef.current) {
      circleRef.current.rotation.y += 0.001;
    }
  });

  const updateVisualization = (newPiValue: string) => {
    const digits = newPiValue.replace(".", "").split("").map(Number);
    const maxPoints = 100_000;
    const step = Math.max(1, Math.floor(digits.length / maxPoints));
    const positions = new Float32Array(Math.min(digits.length, maxPoints) * 3);
    const colors = new Float32Array(Math.min(digits.length, maxPoints) * 3);
    const circlePositions = new Float32Array(
      (Math.min(digits.length, maxPoints) + 1) * 3
    );

    for (let i = 0, j = 0; i < digits.length && j < maxPoints; i += step, j++) {
      const angle = (i / digits.length) * Math.PI * 2;
      const radius = 2 + digits[i] * 0.1;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const z = (i / digits.length) * 0.5;

      positions[j * 3] = x;
      positions[j * 3 + 1] = y;
      positions[j * 3 + 2] = z;

      circlePositions[j * 3] = x;
      circlePositions[j * 3 + 1] = y;
      circlePositions[j * 3 + 2] = z;

      colors[j * 3] = 0.1 + (digits[i] / 10) * 0.5;
      colors[j * 3 + 1] = 0.5 - (digits[i] / 10) * 0.3;
      colors[j * 3 + 2] = 0.5 + (digits[i] / 10) * 0.5;
    }

    circlePositions[Math.min(digits.length, maxPoints) * 3] =
      circlePositions[0];
    circlePositions[Math.min(digits.length, maxPoints) * 3 + 1] =
      circlePositions[1];
    circlePositions[Math.min(digits.length, maxPoints) * 3 + 2] =
      circlePositions[2];

    if (pointsRef.current) {
      pointsRef.current.geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
      );
      pointsRef.current.geometry.setAttribute(
        "color",
        new THREE.BufferAttribute(colors, 3)
      );
    }

    if (circleRef.current) {
      circleRef.current.geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(circlePositions, 3)
      );
    }
  };

  return (
    <>
      <Points ref={pointsRef}>
        <pointsMaterial
          vertexColors
          size={0.05}
          transparent
          blending={THREE.AdditiveBlending}
        />
      </Points>
      {/* @ts-ignore */}
      <line ref={circleRef}>
        <bufferGeometry />
        <lineBasicMaterial color={0x4a5568} />
      </line>
      {/* {showParticles && <ParticleEffect position={[0, 0, 0]} />} */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
    </>
  );
}
