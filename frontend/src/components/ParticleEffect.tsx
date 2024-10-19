import { Points } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

export function ParticleEffect({ position }: { position: [number, number, number] }) {
    const particlesRef = useRef<THREE.Points>(null);
  
    const particles = useMemo(() => {
      const temp = [];
      for (let i = 0; i < 100; i++) {
        const x = (Math.random() - 0.5) * 0.5;
        const y = (Math.random() - 0.5) * 0.5;
        const z = (Math.random() - 0.5) * 0.5;
        temp.push(x, y, z);
      }
      return new Float32Array(temp);
    }, []);
  
    useFrame(() => {
      if (particlesRef.current) {
        particlesRef.current.rotation.y += 0.01;
        const positions = particlesRef.current.geometry.attributes.position
          .array as Float32Array;
        for (let i = 0; i < positions.length; i += 3) {
          positions[i] += (Math.random() - 0.5) * 0.01;
          positions[i + 1] += (Math.random() - 0.5) * 0.01;
          positions[i + 2] += (Math.random() - 0.5) * 0.01;
        }
        particlesRef.current.geometry.attributes.position.needsUpdate = true;
      }
    });
  
    return (
      <Points ref={particlesRef} positions={particles} position={position}>
        <pointsMaterial
          attach="material"
          color={0x00ffff}
          size={0.05}
          sizeAttenuation
          transparent
          alphaTest={0.5}
          opacity={1}
        >
          <canvasTexture
            attach="map"
            image={(() => {
              const canvas = document.createElement("canvas");
              canvas.width = 32;
              canvas.height = 32;
              const context = canvas.getContext("2d");
              if (context) {
                const gradient = context.createRadialGradient(
                  16,
                  16,
                  0,
                  16,
                  16,
                  16
                );
                gradient.addColorStop(0, "rgba(255,255,255,1)");
                gradient.addColorStop(1, "rgba(255,255,255,0)");
                context.fillStyle = gradient;
                context.fillRect(0, 0, 32, 32);
              }
              return canvas;
            })()}
          />
        </pointsMaterial>
      </Points>
    );
  }