import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
//@ts-ignore
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const PiVisualization: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [piValue, setPiValue] = useState<string>("");
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  const circleRef = useRef<THREE.Line | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/v1/pi")
      .then((response) => response.json())
      .then((data) => {
        setPiValue(data.pi);
        updateVisualization(data.pi);
      })
      .catch((error) =>
        console.error("Error fetching initial Pi value:", error)
      );

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current!,
      antialias: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000);

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    camera.position.z = 5;

    // Create points for Pi digits
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.PointsMaterial({
      color: 0x00ffff,
      size: 0.05,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });
    const points = new THREE.Points(geometry, material);
    scene.add(points);
    pointsRef.current = points;

    // Create circle outline
    const circleGeometry = new THREE.BufferGeometry();
    const circleMaterial = new THREE.LineBasicMaterial({ color: 0x4a5568 });
    const circle = new THREE.Line(circleGeometry, circleMaterial);
    scene.add(circle);
    circleRef.current = circle;

    // Add OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;
    controlsRef.current = controls;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      points.rotation.y += 0.001;
      circle.rotation.y += 0.001;
      renderer.render(scene, camera);
    };
    animate();

    // Handle canvas resize
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const needResize = canvas.width !== width || canvas.height !== height;
      if (needResize) {
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }
    };

    // Initial resize
    handleResize();

    // Set up resize observer
    const resizeObserver = new ResizeObserver(handleResize);
    if (canvasRef.current) {
      resizeObserver.observe(canvasRef.current);
    }

    // Clean up
    return () => {
      scene.remove(points);
      scene.remove(circle);
      geometry.dispose();
      material.dispose();
      circleGeometry.dispose();
      circleMaterial.dispose();
      renderer.dispose();
      controls.dispose();
      if (canvasRef.current) {
        resizeObserver.unobserve(canvasRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Connect to SSE API
    const eventSource = new EventSource(
      "http://localhost:8000/api/v1/pi/stream"
    );

    eventSource.onmessage = (event: MessageEvent) => {
      const newPiValue = event.data;
      setPiValue(newPiValue);
      updateVisualization(newPiValue);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const updateVisualization = (newPiValue: string) => {
    if (!pointsRef.current || !circleRef.current) return;

    const digits = newPiValue.replace(".", "").split("").map(Number);
    const positions = new Float32Array(digits.length * 3);
    const colors = new Float32Array(digits.length * 3);

    const circlePositions = new Float32Array((digits.length + 1) * 3);

    for (let i = 0; i < digits.length; i++) {
      const angle = (i / digits.length) * Math.PI * 2;
      const radius = 2 + digits[i] * 0.1;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const z = (i / digits.length) * 0.5; // Add some depth to the visualization

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      circlePositions[i * 3] = x;
      circlePositions[i * 3 + 1] = y;
      circlePositions[i * 3 + 2] = z;

      // Generate color based on digit value
      colors[i * 3] = 0.1 + (digits[i] / 10) * 0.5;
      colors[i * 3 + 1] = 0.5 - (digits[i] / 10) * 0.3;
      colors[i * 3 + 2] = 0.5 + (digits[i] / 10) * 0.5;
    }

    // Close the circle
    circlePositions[digits.length * 3] = circlePositions[0];
    circlePositions[digits.length * 3 + 1] = circlePositions[1];
    circlePositions[digits.length * 3 + 2] = circlePositions[2];

    // Update points geometry
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    pointsRef.current.geometry.dispose();
    pointsRef.current.geometry = geometry;
    if (pointsRef.current.material instanceof THREE.Material) {
      pointsRef.current.material.vertexColors = true;
    }

    // Update circle geometry
    const circleGeometry = new THREE.BufferGeometry();
    circleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(circlePositions, 3)
    );
    circleRef.current.geometry.dispose();
    circleRef.current.geometry = circleGeometry;
  };

  return (
    <div className="flex flex-col space-y-3">
      <h1 className="text-2xl font-bold text-center mb-4">GrowPi</h1>
      <canvas ref={canvasRef} className="w-full h-full rounded-md" />
      <button className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Grow PI
      </button>
      <div className="flex justify-center">
        <div className="bg-white p-4 md:p-6 rounded-xl border ">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
            Current PI
          </h2>
          <p className="font-mono text-gray-800 text-sm md:text-lg break-all">
            {piValue}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PiVisualization;
