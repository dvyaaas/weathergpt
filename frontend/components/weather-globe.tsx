"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GeoLocation } from "@/lib/types";
import { Compass, RotateCw } from "lucide-react";

interface WeatherGlobeProps {
  currentLocation: GeoLocation;
  onSelectCity?: (city: { name: string; lat: number; lon: number }) => void;
}

const INDIAN_PIN_LOCATIONS = [
  { name: "New Delhi", lat: 28.6139, lon: 77.2090 },
  { name: "Mumbai", lat: 19.0760, lon: 72.8777 },
  { name: "Chennai", lat: 13.0827, lon: 80.2707 },
  { name: "Kolkata", lat: 22.5726, lon: 88.3639 },
  { name: "Bengaluru", lat: 12.9716, lon: 77.5946 },
  { name: "Madurai", lat: 9.9252, lon: 78.1198 },
];

// Convert Lat/Lon to Sphere coordinates
function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

// Procedural Earth surface texture generation for high performance & offline autonomy
function createProceduralEarthTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Soft Ocean Gradient (pastel blue / sky blue)
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  oceanGrad.addColorStop(0, "#C7E5F6");
  oceanGrad.addColorStop(0.5, "#A5D8F3");
  oceanGrad.addColorStop(1, "#89C7EB");
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Soft ivory / sage green continents simulation
  ctx.fillStyle = "#E9EFE7";
  ctx.strokeStyle = "#D1DEC9";
  ctx.lineWidth = 2;

  // Approximate continent blobs (Eurasia/India/Africa/Americas)
  const drawBlob = (cx: number, cy: number, rx: number, ry: number) => {
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  };

  // Indian Subcontinent & Asia
  drawBlob(710, 190, 90, 60); // Central Asia / China
  drawBlob(720, 240, 45, 55); // India Peninsula
  drawBlob(780, 270, 50, 40); // SE Asia
  drawBlob(540, 250, 75, 110); // Africa
  drawBlob(540, 150, 80, 50); // Europe
  drawBlob(250, 160, 90, 70); // North America
  drawBlob(320, 310, 60, 100); // South America
  drawBlob(820, 340, 60, 50); // Australia

  // Soft atmospheric cloud strokes
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    ctx.beginPath();
    ctx.arc(x, y, 15 + Math.random() * 25, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

export const WeatherGlobe: React.FC<WeatherGlobeProps> = ({
  currentLocation,
  onSelectCity,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isRotating, setIsRotating] = useState(true);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 340;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 2.8;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Globe Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // 1. Earth Sphere
    const earthRadius = 0.95;
    const sphereGeometry = new THREE.SphereGeometry(earthRadius, 64, 64);
    const earthTexture = createProceduralEarthTexture();
    const earthMaterial = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.6,
      metalness: 0.1,
    });
    const earthMesh = new THREE.Mesh(sphereGeometry, earthMaterial);
    globeGroup.add(earthMesh);

    // 2. Cloud Atmosphere Outer Sphere
    const cloudGeometry = new THREE.SphereGeometry(earthRadius * 1.025, 48, 48);
    const cloudMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
    });
    const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
    globeGroup.add(cloudMesh);

    // 3. Atmosphere Glow Rim
    const atmosphereGeometry = new THREE.SphereGeometry(earthRadius * 1.05, 32, 32);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x7dd3fc,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    globeGroup.add(atmosphereMesh);

    // 4. Pin Markers for Indian Cities
    const markerGroup = new THREE.Group();
    globeGroup.add(markerGroup);

    INDIAN_PIN_LOCATIONS.forEach((city) => {
      const pos = latLonToVector3(city.lat, city.lon, earthRadius * 1.01);
      
      // Marker Dot
      const pinGeom = new THREE.SphereGeometry(0.022, 16, 16);
      const isCurrent =
        Math.abs(currentLocation.latitude - city.lat) < 0.5 &&
        Math.abs(currentLocation.longitude - city.lon) < 0.5;

      const pinMat = new THREE.MeshBasicMaterial({
        color: isCurrent ? 0xef4444 : 0x0284c7,
      });
      const pinMesh = new THREE.Mesh(pinGeom, pinMat);
      pinMesh.position.copy(pos);
      markerGroup.add(pinMesh);

      // Outer Pulse Ring for Current Selection
      if (isCurrent) {
        const ringGeom = new THREE.RingGeometry(0.028, 0.045, 24);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.7,
        });
        const ringMesh = new THREE.Mesh(ringGeom, ringMat);
        ringMesh.position.copy(pos.clone().multiplyScalar(1.002));
        ringMesh.lookAt(0, 0, 0);
        markerGroup.add(ringMesh);
      }
    });

    // Initial Rotation to focus towards India (lon ~78°E, lat ~20°N)
    globeGroup.rotation.y = -Math.PI * 0.45;
    globeGroup.rotation.x = 0.25;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff8e7, 1.8);
    dirLight.position.set(5, 3, 5);
    scene.add(dirLight);

    // Mouse / Touch Interaction
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      setIsRotating(false);
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      globeGroup.rotation.y += deltaX * 0.005;
      globeGroup.rotation.x += deltaY * 0.005;
      globeGroup.rotation.x = Math.max(-1.0, Math.min(1.0, globeGroup.rotation.x));

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
      setTimeout(() => setIsRotating(true), 3000);
    };

    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (isRotating && !isDragging) {
        globeGroup.rotation.y += 0.0018;
        cloudMesh.rotation.y += 0.0025;
      }
      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight || 340;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("resize", handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [currentLocation, isRotating]);

  return (
    <div className="relative w-full h-[340px] rounded-3xl glass-card overflow-hidden flex flex-col items-center justify-center p-4">
      {/* 3D Canvas Mount Point */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Badges */}
      <div className="absolute top-4 left-4 pointer-events-none flex items-center space-x-2 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/80 shadow-xs">
        <Compass className="w-3.5 h-3.5 text-sky-500 animate-spin" />
        <span className="text-[11px] font-semibold text-slate-700">
          3D Weather Earth • Indian Subcontinent
        </span>
      </div>

      {/* Quick City Selector Overlay */}
      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center space-x-1.5 overflow-x-auto py-1 scrollbar-none">
          {INDIAN_PIN_LOCATIONS.map((c) => {
            const isSelected =
              Math.abs(currentLocation.latitude - c.lat) < 0.5 &&
              Math.abs(currentLocation.longitude - c.lon) < 0.5;
            return (
              <button
                key={c.name}
                onClick={() => onSelectCity?.(c)}
                className={`text-[11px] font-medium px-2.5 py-1 rounded-xl transition-all whitespace-nowrap ${
                  isSelected
                    ? "bg-sky-500 text-white shadow-xs font-semibold"
                    : "bg-white/85 text-slate-600 hover:bg-white hover:text-slate-900 border border-slate-200/50"
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => setIsRotating((r) => !r)}
          className="p-1.5 rounded-xl bg-white/90 text-slate-600 hover:text-slate-900 border border-slate-200/60 shadow-xs ml-2"
          title={isRotating ? "Pause Globe Rotation" : "Auto-Rotate Globe"}
        >
          <RotateCw className={`w-3.5 h-3.5 ${isRotating ? "text-sky-500" : ""}`} />
        </button>
      </div>
    </div>
  );
};

